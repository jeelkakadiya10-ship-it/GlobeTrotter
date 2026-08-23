import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getTripBudget = async (req, res) => {
  try {
    const tripId = Number(req.params.id);

    const trip = await prisma.trip.findFirst({
      where: { id: tripId, user_id: req.user.id },
      include: {
        stops: {
          include: {
            city: true,
            trip_activities: {
              include: { activity: true }
            }
          }
        },
        budget_entries: true
      }
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    // Aggregate category costs
    const breakdown = {
      transport: 0,
      stay: 0,
      activities: 0,
      meals: 0,
      other: 0
    };

    const lineItems = [];

    // Add activity costs into activities or respective category
    for (const stop of trip.stops) {
      for (const ta of stop.trip_activities) {
        const cost = ta.cost_override !== null && ta.cost_override !== undefined
          ? Number(ta.cost_override)
          : (ta.activity.estimated_cost ? Number(ta.activity.estimated_cost) : 0);

        breakdown.activities += cost;
        lineItems.push({
          id: `act-${ta.id}`,
          type: 'activity',
          name: `${ta.activity.name} (${stop.city.name})`,
          category: 'activities',
          amount: cost,
          date: ta.scheduled_date,
          rawId: ta.id
        });
      }
    }

    // Add manual budget entries
    for (const entry of trip.budget_entries) {
      const amt = Number(entry.amount);
      const cat = entry.category.toLowerCase();
      if (breakdown[cat] !== undefined) {
        breakdown[cat] += amt;
      } else {
        breakdown.other += amt;
      }

      lineItems.push({
        id: `entry-${entry.id}`,
        type: 'manual',
        name: entry.note || `${entry.category.toUpperCase()} Expense`,
        category: entry.category,
        amount: amt,
        rawId: entry.id
      });
    }

    const totalCost = Object.values(breakdown).reduce((acc, curr) => acc + curr, 0);

    // Calculate days
    const start = new Date(trip.start_date);
    const end = new Date(trip.end_date);
    const diffTime = Math.abs(end - start);
    const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
    const avgCostPerDay = Number((totalCost / days).toFixed(2));

    const targetBudget = trip.target_budget ? Number(trip.target_budget) : null;
    const isOverBudget = targetBudget !== null && totalCost > targetBudget;

    return res.json({
      totalCost,
      breakdown,
      days,
      avgCostPerDay,
      targetBudget,
      isOverBudget,
      lineItems
    });
  } catch (err) {
    console.error('Get trip budget error:', err);
    return res.status(500).json({ error: 'Failed to calculate budget' });
  }
};

export const addBudgetEntry = async (req, res) => {
  try {
    const tripId = Number(req.params.id);
    const { category, amount, note } = req.body;

    if (!category || amount === undefined || isNaN(Number(amount))) {
      return res.status(400).json({ error: 'Category and valid numeric amount are required' });
    }

    const trip = await prisma.trip.findFirst({
      where: { id: tripId, user_id: req.user.id }
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const entry = await prisma.budgetEntry.create({
      data: {
        trip_id: tripId,
        category: category.toLowerCase(),
        amount: Number(amount),
        note: note ? note.trim() : null
      }
    });

    return res.status(201).json(entry);
  } catch (err) {
    console.error('Add budget entry error:', err);
    return res.status(500).json({ error: 'Failed to add budget entry' });
  }
};

export const deleteBudgetEntry = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const entry = await prisma.budgetEntry.findUnique({
      where: { id },
      include: { trip: true }
    });

    if (!entry || entry.trip.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Budget entry not found or unauthorized' });
    }

    await prisma.budgetEntry.delete({ where: { id } });
    return res.json({ message: 'Budget entry removed' });
  } catch (err) {
    console.error('Delete budget entry error:', err);
    return res.status(500).json({ error: 'Failed to delete budget entry' });
  }
};