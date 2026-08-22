import prisma from '../prisma/client.js';

export const getPublicTripBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const trip = await prisma.trip.findUnique({
      where: { public_slug: slug },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar_url: true,
            bio: true
          }
        },
        stops: {
          orderBy: { stop_order: 'asc' },
          include: {
            city: true,
            trip_activities: {
              include: { activity: true },
              orderBy: [
                { scheduled_date: 'asc' },
                { scheduled_time: 'asc' }
              ]
            }
          }
        },
        budget_entries: {
          select: {
            id: true,
            category: true,
            description: true,
            amount: true,
            date: true
          }
        }
      }
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or link has expired.' });
    }

    if (!trip.is_public) {
      return res.status(403).json({ error: 'This trip is private and cannot be viewed publicly.' });
    }

    // Calculate total cost for public summary
    let totalCost = trip.budget_entries.reduce((sum, b) => sum + b.amount, 0);
    for (const stop of trip.stops) {
      for (const act of stop.trip_activities) {
        totalCost += (act.custom_cost || (act.activity ? act.activity.estimated_cost : 0));
      }
    }

    return res.json({
      trip,
      total_cost: totalCost,
      total_cities: trip.stops.length,
      total_activities: trip.stops.reduce((sum, s) => sum + s.trip_activities.length, 0)
    });
  } catch (err) {
    console.error('getPublicTripBySlug error:', err);
    return res.status(500).json({ error: 'Failed to load public trip.' });
  }
};
