import prisma from '../prisma/client.js';

export const getTripBudget = async (req, res) => {
  try {
    const { id: trip_id } = req.params;

    const trip = await prisma.trip.findUnique({
      where: { id: trip_id },
      include: {
        stops: {
          include: {
            city: true,
            trip_activities: {
              include: { activity: true }
            }
          }
        },
        budget_entries: {
          orderBy: { date: 'asc' }
        }
      }
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    if (trip.user_id !== req.user.id && req.user.role !== 'admin' && !trip.is_public) {
      return res.status(403).json({ error: 'Unauthorized to view this trip budget.' });
    }

    // Categories bucket
    const categoryTotals = {
      'Flights & Transport': 0,
      'Accommodation': 0,
      'Activities': 0,
      'Food & Dining': 0,
      'Other': 0
    };

    // 1. Add up custom budget entries
    let totalCustomEntries = 0;
    for (const entry of trip.budget_entries) {
      const cat = entry.category || 'Other';
      if (categoryTotals[cat] === undefined) {
        categoryTotals[cat] = 0;
      }
      categoryTotals[cat] += entry.amount;
      totalCustomEntries += entry.amount;
    }

    // 2. Add up scheduled activities expenses
    const activityExpenses = [];
    let totalActivitiesCost = 0;
    for (const stop of trip.stops) {
      for (const ta of stop.trip_activities) {
        const cost = ta.custom_cost || (ta.activity ? ta.activity.estimated_cost : 0);
        const title = ta.custom_title || (ta.activity ? ta.activity.title : 'Activity');
        const cat = ta.activity ? (
          ta.activity.category === 'Food & Dining' ? 'Food & Dining' : 'Activities'
        ) : 'Activities';

        if (categoryTotals[cat] === undefined) {
          categoryTotals[cat] = 0;
        }
        categoryTotals[cat] += cost;
        totalActivitiesCost += cost;

        activityExpenses.push({
          id: ta.id,
          title,
          category: cat,
          city: stop.city.name,
          cost,
          date: ta.scheduled_date || stop.arrival_date,
          status: ta.status
        });
      }
    }

    const totalSpent = totalCustomEntries + totalActivitiesCost;
    const targetBudget = trip.target_budget || 0;
    const remainingBudget = targetBudget - totalSpent;

    return res.json({
      target_budget: targetBudget,
      total_spent: totalSpent,
      remaining_budget: remainingBudget,
      is_over_budget: targetBudget > 0 && totalSpent > targetBudget,
      category_breakdown: categoryTotals,
      budget_entries: trip.budget_entries,
      activity_expenses: activityExpenses
    });
  } catch (err) {
    console.error('getTripBudget error:', err);
    return res.status(500).json({ error: 'Failed to calculate trip budget.' });
  }
};

export const addBudgetEntry = async (req, res) => {
  try {
    const { id: trip_id } = req.params;
    const { category, description, amount, date, expense_type } = req.body;

    if (!description || !description.trim()) {
      return res.status(400).json({ error: 'Expense description is required.' });
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ error: 'Please enter a valid positive amount.' });
    }

    const trip = await prisma.trip.findUnique({
      where: { id: trip_id }
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    if (trip.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to add budget entries to this trip.' });
    }

    const entry = await prisma.budgetEntry.create({
      data: {
        trip_id,
        category: category || 'Other',
        description: description.trim(),
        amount: numericAmount,
        date: date || new Date().toISOString().split('T')[0],
        expense_type: expense_type || 'actual'
      }
    });

    return res.status(201).json({
      message: 'Budget entry added successfully!',
      entry
    });
  } catch (err) {
    console.error('addBudgetEntry error:', err);
    return res.status(500).json({ error: 'Failed to add budget entry.' });
  }
};

export const deleteBudgetEntry = async (req, res) => {
  try {
    const { id } = req.params;

    const entry = await prisma.budgetEntry.findUnique({
      where: { id },
      include: { trip: true }
    });

    if (!entry) {
      return res.status(404).json({ error: 'Budget entry not found.' });
    }

    if (entry.trip.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to delete this budget entry.' });
    }

    await prisma.budgetEntry.delete({
      where: { id }
    });

    return res.json({ message: 'Budget entry deleted successfully.' });
  } catch (err) {
    console.error('deleteBudgetEntry error:', err);
    return res.status(500).json({ error: 'Failed to delete budget entry.' });
  }
};
