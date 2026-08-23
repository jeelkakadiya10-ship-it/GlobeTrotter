import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getPublicTrip = async (req, res) => {
  try {
    const { slug } = req.params;

    const trip = await prisma.trip.findFirst({
      where: {
        public_slug: slug,
        is_public: true
      },
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
              include: { activity: true },
              orderBy: [
                { scheduled_date: 'asc' },
                { scheduled_time: 'asc' }
              ]
            }
          }
        },
        budget_entries: true
      }
    });

    if (!trip) {
      return res.status(404).json({
        error: 'This trip is private or does not exist.'
      });
    }

    return res.json(trip);
  } catch (err) {
    console.error('Get public trip error:', err);
    return res.status(500).json({ error: 'Failed to load public trip' });
  }
};