import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getPublicTrip = async (req, res) => {
  try {
    const { slug } = req.params;

    const trip = await prisma.trip.findUnique({
      where: { public_slug: slug },
      include: {
        user: {
          select: {
            name: true,
            profile_photo_url: true
          }
        },
        stops: {
          orderBy: { order_index: 'asc' },
          include: {
            city: true,
            trip_activities: {
              include: {
                activity: true
              }
            }
          }
        },
        budget_entries: true
      }
    });

    if (!trip || !trip.is_public) {
      return res.status(404).json({ error: 'Itinerary not found or is set to private' });
    }

    res.json({
      ...trip,
      display_currency: trip.display_currency || 'USD',
      base_currency: 'USD'
    });
  } catch (error) {
    console.error('getPublicTrip error:', error);
    res.status(500).json({ error: 'Failed to load public trip' });
  }
};