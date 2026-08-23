import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export const getTrips = async (req, res) => {
  try {
    const trips = await prisma.trip.findMany({
      where: { user_id: req.user.id },
      orderBy: { start_date: 'asc' },
      include: {
        stops: {
          include: {
            city: true,
            trip_activities: {
              include: { activity: true }
            }
          },
          orderBy: { order_index: 'asc' }
        },
        budget_entries: true,
        _count: {
          select: { stops: true }
        }
      }
    });

    return res.json(trips);
  } catch (err) {
    console.error('Get trips error:', err);
    return res.status(500).json({ error: 'Failed to fetch trips' });
  }
};

export const createTrip = async (req, res) => {
  try {
    const { name, start_date, end_date, description, cover_photo_url, target_budget } = req.body;

    if (!name || !start_date || !end_date) {
      return res.status(400).json({ error: 'Trip name, start date, and end date are required' });
    }

    const start = new Date(start_date);
    const end = new Date(end_date);

    if (end < start) {
      return res.status(400).json({ error: 'End date cannot be before start date' });
    }

    const trip = await prisma.trip.create({
      data: {
        user_id: req.user.id,
        name: name.trim(),
        description: description ? description.trim() : null,
        cover_photo_url: cover_photo_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800',
        start_date: start,
        end_date: end,
        target_budget: target_budget ? Number(target_budget) : null
      }
    });

    return res.status(201).json(trip);
  } catch (err) {
    console.error('Create trip error:', err);
    return res.status(500).json({ error: 'Failed to create trip' });
  }
};

export const getTripById = async (req, res) => {
  try {
    const tripId = Number(req.params.id);
    const trip = await prisma.trip.findFirst({
      where: {
        id: tripId,
        user_id: req.user.id
      },
      include: {
        stops: {
          orderBy: { order_index: 'asc' },
          include: {
            city: true,
            trip_activities: {
              include: {
                activity: true
              },
              orderBy: [
                { scheduled_date: 'asc' },
                { scheduled_time: 'asc' }
              ]
            }
          }
        },
        budget_entries: {
          orderBy: { id: 'desc' }
        }
      }
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or unauthorized' });
    }

    return res.json(trip);
  } catch (err) {
    console.error('Get trip by ID error:', err);
    return res.status(500).json({ error: 'Failed to retrieve trip' });
  }
};

export const updateTrip = async (req, res) => {
  try {
    const tripId = Number(req.params.id);
    const { name, start_date, end_date, description, cover_photo_url, target_budget, is_public } = req.body;

    const existingTrip = await prisma.trip.findFirst({
      where: { id: tripId, user_id: req.user.id }
    });

    if (!existingTrip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description;
    if (cover_photo_url !== undefined) updateData.cover_photo_url = cover_photo_url;
    if (target_budget !== undefined) updateData.target_budget = target_budget === null ? null : Number(target_budget);
    if (is_public !== undefined) updateData.is_public = Boolean(is_public);

    if (start_date) updateData.start_date = new Date(start_date);
    if (end_date) updateData.end_date = new Date(end_date);

    if (updateData.start_date && updateData.end_date && updateData.end_date < updateData.start_date) {
      return res.status(400).json({ error: 'End date cannot be before start date' });
    }

    const updated = await prisma.trip.update({
      where: { id: tripId },
      data: updateData,
      include: {
        stops: {
          orderBy: { order_index: 'asc' },
          include: {
            city: true,
            trip_activities: { include: { activity: true } }
          }
        },
        budget_entries: true
      }
    });

    return res.json(updated);
  } catch (err) {
    console.error('Update trip error:', err);
    return res.status(500).json({ error: 'Failed to update trip' });
  }
};

export const deleteTrip = async (req, res) => {
  try {
    const tripId = Number(req.params.id);
    const existing = await prisma.trip.findFirst({
      where: { id: tripId, user_id: req.user.id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    // Cascade delete handled by DB schema ON DELETE CASCADE
    await prisma.trip.delete({ where: { id: tripId } });
    return res.json({ message: 'Trip deleted successfully' });
  } catch (err) {
    console.error('Delete trip error:', err);
    return res.status(500).json({ error: 'Failed to delete trip' });
  }
};

export const toggleShare = async (req, res) => {
  try {
    const tripId = Number(req.params.id);
    const trip = await prisma.trip.findFirst({
      where: { id: tripId, user_id: req.user.id }
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    let public_slug = trip.public_slug;
    const newStatus = !trip.is_public;

    if (newStatus && !public_slug) {
      public_slug = `${trip.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${crypto.randomBytes(4).toString('hex')}`;
    }

    const updated = await prisma.trip.update({
      where: { id: tripId },
      data: {
        is_public: newStatus,
        public_slug: newStatus ? public_slug : trip.public_slug
      }
    });

    return res.json({
      is_public: updated.is_public,
      public_slug: updated.public_slug
    });
  } catch (err) {
    console.error('Share toggle error:', err);
    return res.status(500).json({ error: 'Failed to update trip share settings' });
  }
};

export const copyTrip = async (req, res) => {
  try {
    const tripId = Number(req.params.id);
    const sourceTrip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        stops: {
          orderBy: { order_index: 'asc' },
          include: {
            trip_activities: true
          }
        },
        budget_entries: true
      }
    });

    if (!sourceTrip) {
      return res.status(404).json({ error: 'Source trip not found' });
    }

    if (!sourceTrip.is_public && sourceTrip.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Cannot copy private trip' });
    }

    // Clone trip into current user's account
    const clonedTrip = await prisma.trip.create({
      data: {
        user_id: req.user.id,
        name: `${sourceTrip.name} (Copy)`,
        description: sourceTrip.description,
        cover_photo_url: sourceTrip.cover_photo_url,
        start_date: sourceTrip.start_date,
        end_date: sourceTrip.end_date,
        target_budget: sourceTrip.target_budget,
        is_public: false,
        public_slug: null
      }
    });

    // Clone stops and activities
    for (const stop of sourceTrip.stops) {
      const clonedStop = await prisma.stop.create({
        data: {
          trip_id: clonedTrip.id,
          city_id: stop.city_id,
          arrival_date: stop.arrival_date,
          departure_date: stop.departure_date,
          order_index: stop.order_index
        }
      });

      for (const act of stop.trip_activities) {
        await prisma.tripActivity.create({
          data: {
            stop_id: clonedStop.id,
            activity_id: act.activity_id,
            scheduled_date: act.scheduled_date,
            scheduled_time: act.scheduled_time,
            cost_override: act.cost_override
          }
        });
      }
    }

    // Clone budget entries
    for (const entry of sourceTrip.budget_entries) {
      await prisma.budgetEntry.create({
        data: {
          trip_id: clonedTrip.id,
          category: entry.category,
          amount: entry.amount,
          note: entry.note
        }
      });
    }

    return res.status(201).json(clonedTrip);
  } catch (err) {
    console.error('Copy trip error:', err);
    return res.status(500).json({ error: 'Failed to copy trip' });
  }
};