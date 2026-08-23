import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getTripBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const trip = await prisma.trip.findFirst({
      where: { id: Number(id), user_id: userId },
      include: {
        stops: {
          include: {
            trip_activities: {
              include: { activity: true }
            }
          }
        },
        budget_entries: true
      }
    });

    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    let activitiesCost = 0;
    const lineItems = [];

    trip.stops.forEach((stop) => {
      stop.trip_activities.forEach((ta) => {
        const cost = ta.cost_override !== null && ta.cost_override !== undefined
          ? Number(ta.cost_override)
          : (ta.activity?.estimated_cost ? Number(ta.activity.estimated_cost) : 0);

        activitiesCost += cost;

        lineItems.push({
          id: `ta-${ta.id}`,
          type: 'activity',
          name: ta.activity.name,
          category: ta.activity.category || 'activities',
          amount: cost,
          date: ta.scheduled_date,
          rawId: ta.id
        });
      });
    });

    const breakdown = {
      transport: 0,
      stay: 0,
      activities: activitiesCost,
      meals: 0,
      other: 0
    };

    trip.budget_entries.forEach((entry) => {
      const cat = (entry.category || 'other').toLowerCase();
      const amount = Number(entry.amount);
      if (breakdown[cat] !== undefined) {
        breakdown[cat] += amount;
      } else {
        breakdown.other += amount;
      }

      lineItems.push({
        id: `be-${entry.id}`,
        type: 'manual',
        name: entry.note || `${entry.category} expense`,
        category: entry.category,
        amount: amount,
        date: null,
        rawId: entry.id
      });
    });

    const totalCost = Object.values(breakdown).reduce((a, b) => a + b, 0);

    const start = new Date(trip.start_date);
    const end = new Date(trip.end_date);
    const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1);
    const avgCostPerDay = Number((totalCost / days).toFixed(2));

    const targetBudget = trip.target_budget !== null ? Number(trip.target_budget) : null;
    const isOverBudget = targetBudget !== null && totalCost > targetBudget;

    res.json({
      currency: trip.display_currency || 'USD',
      base_currency: 'USD',
      totalCost,
      avgCostPerDay,
      days,
      targetBudget,
      isOverBudget,
      breakdown,
      lineItems
    });
  } catch (error) {
    console.error('getTripBudget error:', error);
    res.status(500).json({ error: 'Failed to calculate trip budget' });
  }
};

export const addBudgetEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, amount, note } = req.body;
    const userId = req.user.userId;

    if (!category || amount === undefined || isNaN(Number(amount))) {
      return res.status(400).json({ error: 'Category and valid numeric amount are required' });
    }

    const trip = await prisma.trip.findFirst({
      where: { id: Number(id), user_id: userId }
    });

    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    const entry = await prisma.budgetEntry.create({
      data: {
        trip_id: Number(id),
        category,
        amount: Number(amount),
        note: note || null
      }
    });

    res.status(201).json(entry);
  } catch (error) {
    console.error('addBudgetEntry error:', error);
    res.status(500).json({ error: 'Failed to add budget entry' });
  }
};

export const deleteBudgetEntry = async (req, res) => {
  try {
    const { entryId } = req.params;

    const entry = await prisma.budgetEntry.findUnique({
      where: { id: Number(entryId) },
      include: { trip: true }
    });

    if (!entry || entry.trip.user_id !== req.user.userId) {
      return res.status(404).json({ error: 'Budget entry not found or unauthorized' });
    }

    await prisma.budgetEntry.delete({
      where: { id: Number(entryId) }
    });

    res.json({ message: 'Budget entry deleted' });
  } catch (error) {
    console.error('deleteBudgetEntry error:', error);
    res.status(500).json({ error: 'Failed to delete budget entry' });
  }
};