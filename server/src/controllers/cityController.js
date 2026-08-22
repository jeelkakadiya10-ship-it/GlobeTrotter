import prisma from '../prisma/client.js';

export const getCities = async (req, res) => {
  try {
    const { search, region } = req.query;

    const where = {};
    if (search && search.trim()) {
      where.OR = [
        { name: { contains: search.trim() } },
        { country: { contains: search.trim() } },
        { description: { contains: search.trim() } }
      ];
    }

    if (region && region.trim() && region !== 'All') {
      where.region = region.trim();
    }

    const cities = await prisma.city.findMany({
      where,
      include: {
        _count: {
          select: { activities: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    return res.json({ cities });
  } catch (err) {
    console.error('getCities error:', err);
    return res.status(500).json({ error: 'Failed to retrieve cities.' });
  }
};

export const getCityById = async (req, res) => {
  try {
    const { id } = req.params;
    const city = await prisma.city.findUnique({
      where: { id },
      include: {
        activities: true
      }
    });

    if (!city) {
      return res.status(404).json({ error: 'City not found.' });
    }

    return res.json({ city });
  } catch (err) {
    console.error('getCityById error:', err);
    return res.status(500).json({ error: 'Failed to retrieve city.' });
  }
};

export const getCityActivities = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, maxCost, maxDuration, search } = req.query;

    const city = await prisma.city.findUnique({
      where: { id }
    });

    if (!city) {
      return res.status(404).json({ error: 'City not found.' });
    }

    const where = { city_id: id };

    if (category && category !== 'All') {
      where.category = category;
    }

    if (maxCost) {
      const costNum = parseFloat(maxCost);
      if (!isNaN(costNum)) {
        where.estimated_cost = { lte: costNum };
      }
    }

    if (maxDuration) {
      const durNum = parseInt(maxDuration, 10);
      if (!isNaN(durNum)) {
        where.estimated_duration_min = { lte: durNum };
      }
    }

    if (search && search.trim()) {
      where.OR = [
        { title: { contains: search.trim() } },
        { description: { contains: search.trim() } },
        { location_name: { contains: search.trim() } }
      ];
    }

    const activities = await prisma.activity.findMany({
      where,
      orderBy: [{ rating: 'desc' }, { estimated_cost: 'asc' }]
    });

    return res.json({
      city,
      activities
    });
  } catch (err) {
    console.error('getCityActivities error:', err);
    return res.status(500).json({ error: 'Failed to retrieve activities for city.' });
  }
};
