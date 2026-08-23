import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalTrips = await prisma.trip.count();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeUsersCount = await prisma.user.count({
      where: {
        OR: [
          { created_at: { gte: thirtyDaysAgo } },
          { trips: { some: { created_at: { gte: thirtyDaysAgo } } } }
        ]
      }
    });

    // Trips created over time (by month/date)
    const trips = await prisma.trip.findMany({
      select: { created_at: true },
      orderBy: { created_at: 'asc' }
    });

    const tripsOverTimeMap = {};
    for (const t of trips) {
      const key = new Date(t.created_at).toISOString().slice(0, 7); // YYYY-MM
      tripsOverTimeMap[key] = (tripsOverTimeMap[key] || 0) + 1;
    }

    const tripsOverTime = Object.keys(tripsOverTimeMap).map(period => ({
      period,
      trips: tripsOverTimeMap[period]
    }));

    // Top 10 cities
    const cityStops = await prisma.stop.groupBy({
      by: ['city_id'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10
    });

    const topCities = await Promise.all(
      cityStops.map(async item => {
        const city = await prisma.city.findUnique({ where: { id: item.city_id } });
        return {
          id: city.id,
          name: city.name,
          country: city.country,
          count: item._count.id
        };
      })
    );

    // Top 10 activities
    const actCounts = await prisma.tripActivity.groupBy({
      by: ['activity_id'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10
    });

    const topActivities = await Promise.all(
      actCounts.map(async item => {
        const act = await prisma.activity.findUnique({
          where: { id: item.activity_id },
          include: { city: true }
        });
        return {
          id: act.id,
          name: act.name,
          city: act.city.name,
          category: act.category,
          count: item._count.id
        };
      })
    );

    return res.json({
      totalUsers,
      totalTrips,
      activeUsers: activeUsersCount,
      tripsOverTime,
      topCities,
      topActivities
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    return res.status(500).json({ error: 'Failed to load admin stats' });
  }
};

export const getAdminUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        is_disabled: true,
        created_at: true,
        _count: {
          select: { trips: true }
        }
      }
    });

    return res.json(users);
  } catch (err) {
    console.error('Get admin users error:', err);
    return res.status(500).json({ error: 'Failed to fetch user list' });
  }
};

export const toggleDisableUser = async (req, res) => {
  try {
    const userId = Number(req.params.id);

    if (userId === req.user.id) {
      return res.status(400).json({ error: 'You cannot disable your own admin account' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { is_disabled: !user.is_disabled },
      select: { id: true, name: true, email: true, is_disabled: true }
    });

    return res.json({
      message: `User account ${updated.is_disabled ? 'disabled' : 'enabled'} successfully`,
      user: updated
    });
  } catch (err) {
    console.error('Toggle disable user error:', err);
    return res.status(500).json({ error: 'Failed to toggle user status' });
  }
};