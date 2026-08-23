import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export const getTrips = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const trips = await prisma.trip.findMany({
      where: { user_id: userId },
      orderBy: { start_date: 'asc' },
      include: {
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

    const tripsWithCurrency = trips.map(t => ({
      ...t,
      display_currency: t.display_currency || 'USD',
      base_currency: 'USD'
    }));

    res.json(tripsWithCurrency);
  } catch (error) {
    console.error('getTrips error:', error);
    res.status(500).json({ error: 'Failed to fetch trips' });
  }
};

export const createTrip = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const { name, start_date, end_date, description, cover_photo_url, target_budget, display_currency } = req.body;

    if (!name || !start_date || !end_date) {
      return res.status(400).json({ error: 'Trip name, start date, and end date are required' });
    }

    if (new Date(end_date) < new Date(start_date)) {
      return res.status(400).json({ error: 'End date cannot be earlier than start date' });
    }

    const trip = await prisma.trip.create({
      data: {
        user: { connect: { id: userId } },
        name,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        description: description || null,
        cover_photo_url: cover_photo_url || null,
        target_budget: target_budget ? Number(target_budget) : null,
        display_currency: display_currency || 'USD',
        public_slug: crypto.randomBytes(8).toString('hex')
      },
      include: {
        stops: true
      }
    });

    res.status(201).json({
      ...trip,
      display_currency: trip.display_currency || 'USD',
      base_currency: 'USD'
    });
  } catch (error) {
    console.error('createTrip error:', error);
    res.status(500).json({ error: 'Failed to create trip' });
  }
};

export const getTripById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user.userId;

    const trip = await prisma.trip.findFirst({
      where: {
        id: Number(id),
        user_id: userId
      },
      include: {
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

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or unauthorized' });
    }

    res.json({
      ...trip,
      display_currency: trip.display_currency || 'USD',
      base_currency: 'USD'
    });
  } catch (error) {
    console.error('getTripById error:', error);
    res.status(500).json({ error: 'Failed to fetch trip details' });
  }
};

export const updateTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user.userId;
    const { name, start_date, end_date, description, cover_photo_url, target_budget, display_currency } = req.body;

    const trip = await prisma.trip.findFirst({
      where: { id: Number(id), user_id: userId }
    });

    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    const dataToUpdate = {};
    if (name) dataToUpdate.name = name;
    if (start_date) dataToUpdate.start_date = new Date(start_date);
    if (end_date) dataToUpdate.end_date = new Date(end_date);
    if (description !== undefined) dataToUpdate.description = description;
    if (cover_photo_url !== undefined) dataToUpdate.cover_photo_url = cover_photo_url;
    if (target_budget !== undefined) dataToUpdate.target_budget = target_budget === null ? null : Number(target_budget);
    if (display_currency !== undefined) dataToUpdate.display_currency = display_currency;

    const updated = await prisma.trip.update({
      where: { id: Number(id) },
      data: dataToUpdate,
      include: {
        stops: {
          include: {
            city: true,
            trip_activities: {
              include: {
                activity: true
              }
            }
          }
        }
      }
    });

    res.json({
      ...updated,
      display_currency: updated.display_currency || 'USD',
      base_currency: 'USD'
    });
  } catch (error) {
    console.error('updateTrip error:', error);
    res.status(500).json({ error: 'Failed to update trip' });
  }
};

export const deleteTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user.userId;

    const trip = await prisma.trip.findFirst({
      where: { id: Number(id), user_id: userId }
    });

    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    await prisma.trip.delete({
      where: { id: Number(id) }
    });

    res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    console.error('deleteTrip error:', error);
    res.status(500).json({ error: 'Failed to delete trip' });
  }
};

export const toggleShare = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user.userId;

    const trip = await prisma.trip.findFirst({
      where: { id: Number(id), user_id: userId }
    });

    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    let slug = trip.public_slug;
    if (!slug) {
      slug = crypto.randomBytes(8).toString('hex');
    }

    const updated = await prisma.trip.update({
      where: { id: Number(id) },
      data: {
        is_public: !trip.is_public,
        public_slug: slug
      }
    });

    res.json({
      is_public: updated.is_public,
      public_slug: updated.public_slug
    });
  } catch (error) {
    console.error('toggleShare error:', error);
    res.status(500).json({ error: 'Failed to update share setting' });
  }
};

export const copyTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user.userId;

    const original = await prisma.trip.findUnique({
      where: { id: Number(id) },
      include: {
        stops: {
          include: {
            trip_activities: true
          }
        },
        budget_entries: true
      }
    });

    if (!original) return res.status(404).json({ error: 'Trip not found' });

    const newTrip = await prisma.trip.create({
      data: {
        user: { connect: { id: userId } },
        name: `Copy of ${original.name}`,
        description: original.description,
        cover_photo_url: original.cover_photo_url,
        start_date: original.start_date,
        end_date: original.end_date,
        target_budget: original.target_budget,
        display_currency: original.display_currency || 'USD',
        is_public: false,
        public_slug: crypto.randomBytes(8).toString('hex')
      }
    });

    for (const stop of original.stops) {
      const newStop = await prisma.stop.create({
        data: {
          trip: { connect: { id: newTrip.id } },
          city: { connect: { id: stop.city_id } },
          arrival_date: stop.arrival_date,
          departure_date: stop.departure_date,
          order_index: stop.order_index
        }
      });

      for (const act of stop.trip_activities) {
        await prisma.tripActivity.create({
          data: {
            stop: { connect: { id: newStop.id } },
            activity: { connect: { id: act.activity_id } },
            scheduled_date: act.scheduled_date,
            scheduled_time: act.scheduled_time,
            cost_override: act.cost_override
          }
        });
      }
    }

    for (const entry of original.budget_entries) {
      await prisma.budgetEntry.create({
        data: {
          trip: { connect: { id: newTrip.id } },
          category: entry.category,
          amount: entry.amount,
          note: entry.note
        }
      });
    }

    res.status(201).json(newTrip);
  } catch (error) {
    console.error('copyTrip error:', error);
    res.status(500).json({ error: 'Failed to copy trip' });
  }
};