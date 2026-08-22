import prisma from '../prisma/client.js';

export const getAdminStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalTrips,
      publicTrips,
      totalStops,
      totalTripActivities,
      totalCities,
      totalCatalogActivities
    ] = await Promise.all([
      prisma.user.count(),
      prisma.trip.count(),
      prisma.trip.count({ where: { is_public: true } }),
      prisma.tripStop.count(),
      prisma.tripActivity.count(),
      prisma.city.count(),
      prisma.activity.count()
    ]);

    // Popular cities based on how many trip stops use them
    const popularCitiesRaw = await prisma.tripStop.groupBy({
      by: ['city_id'],
      _count: {
        city_id: true
      },
      orderBy: {
        _count: {
          city_id: 'desc'
        }
      },
      take: 5
    });

    const popularCities = await Promise.all(
      popularCitiesRaw.map(async (item) => {
        const city = await prisma.city.findUnique({
          where: { id: item.city_id },
          select: { name: true, country: true, image_url: true }
        });
        return {
          city_id: item.city_id,
          name: city?.name || 'Unknown',
          country: city?.country || '',
          image_url: city?.image_url || '',
          count: item._count.city_id
        };
      })
    );

    // Recent 5 trips
    const recentTrips = await prisma.trip.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      include: {
        user: {
          select: { name: true, email: true }
        },
        _count: {
          select: { stops: true }
        }
      }
    });

    return res.json({
      stats: {
        total_users: totalUsers,
        total_trips: totalTrips,
        public_trips: publicTrips,
        total_stops: totalStops,
        total_scheduled_activities: totalTripActivities,
        total_cities: totalCities,
        total_catalog_activities: totalCatalogActivities
      },
      popular_cities: popularCities,
      recent_trips: recentTrips
    });
  } catch (err) {
    console.error('getAdminStats error:', err);
    return res.status(500).json({ error: 'Failed to retrieve administrator statistics.' });
  }
};

export const getAdminUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar_url: true,
        bio: true,
        is_disabled: true,
        created_at: true,
        _count: {
          select: { trips: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    return res.json({ users });
  } catch (err) {
    console.error('getAdminUsers error:', err);
    return res.status(500).json({ error: 'Failed to retrieve user list.' });
  }
};

export const toggleDisableUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      return res.status(400).json({ error: 'Administrators cannot disable their own account.' });
    }

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        is_disabled: !user.is_disabled
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        is_disabled: true
      }
    });

    return res.json({
      message: updated.is_disabled ? 'User account has been disabled.' : 'User account has been enabled.',
      user: updated
    });
  } catch (err) {
    console.error('toggleDisableUser error:', err);
    return res.status(500).json({ error: 'Failed to modify user status.' });
  }
};
