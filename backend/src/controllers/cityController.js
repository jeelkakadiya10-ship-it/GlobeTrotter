import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getCities = async (req, res) => {
  try {
    const { search, region } = req.query;
    const where = {};

    if (search && search.trim()) {
      where.OR = [
        { name: { contains: search.trim(), mode: 'insensitive' } },
        { country: { contains: search.trim(), mode: 'insensitive' } }
      ];
    }

    if (region && region.trim() && region !== 'All') {
      where.region = { equals: region.trim(), mode: 'insensitive' };
    }

    const cities = await prisma.city.findMany({
      where,
      orderBy: { popularity_score: 'desc' },
      include: {
        _count: { select: { activities: true } }
      }
    });

    return res.json(cities);
  } catch (err) {
    console.error('Get cities error:', err);
    return res.status(500).json({ error: 'Failed to fetch cities' });
  }
};

export const getCityActivities = async (req, res) => {
  try {
    const cityId = Number(req.params.id);
    const { category, maxCost, maxDuration } = req.query;

    const where = { city_id: cityId };

    if (category && category.trim() && category !== 'all') {
      where.category = { equals: category.trim(), mode: 'insensitive' };
    }

    if (maxCost && !isNaN(Number(maxCost))) {
      where.estimated_cost = { lte: Number(maxCost) };
    }

    if (maxDuration && !isNaN(Number(maxDuration))) {
      where.estimated_duration_mins = { lte: Number(maxDuration) };
    }

    const activities = await prisma.activity.findMany({
      where,
      orderBy: { id: 'asc' }
    });

    return res.json(activities);
  } catch (err) {
    console.error('Get city activities error:', err);
    return res.status(500).json({ error: 'Failed to fetch activities' });
  }
};