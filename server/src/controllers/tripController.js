import prisma from '../prisma/client.js';

// Helper to generate a clean, URL-safe slug
const generateSlug = (title) => {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${base || 'trip'}-${randomSuffix}`;
};

export const getMyTrips = async (req, res) => {
  try {
    const { status, search } = req.query;
    const where = { user_id: req.user.id };

    if (search && search.trim()) {
      where.OR = [
        { title: { contains: search.trim() } },
        { description: { contains: search.trim() } },
        { stops: { some: { city: { name: { contains: search.trim() } } } } }
      ];
    }

    const trips = await prisma.trip.findMany({
      where,
      include: {
        stops: {
          orderBy: { stop_order: 'asc' },
          include: {
            city: true,
            _count: {
              select: { trip_activities: true }
            }
          }
        },
        _count: {
          select: {
            stops: true,
            budget_entries: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    // Optional status filtering (Upcoming vs Past)
    const today = new Date().toISOString().split('T')[0];
    let filteredTrips = trips;
    if (status === 'upcoming') {
      filteredTrips = trips.filter(t => !t.end_date || t.end_date >= today);
    } else if (status === 'past') {
      filteredTrips = trips.filter(t => t.end_date && t.end_date < today);
    }

    return res.json({ trips: filteredTrips });
  } catch (err) {
    console.error('getMyTrips error:', err);
    return res.status(500).json({ error: 'Failed to retrieve trips.' });
  }
};

export const createTrip = async (req, res) => {
  try {
    const {
      title,
      description,
      start_date,
      end_date,
      cover_image_url,
      target_budget,
      is_public,
      initial_cities
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Trip title is required.' });
    }

    const slug = generateSlug(title);
    const targetBudgetFloat = target_budget ? parseFloat(target_budget) : 0;

    const defaultCoverImages = [
      'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80'
    ];
    const finalCover = cover_image_url || defaultCoverImages[Math.floor(Math.random() * defaultCoverImages.length)];

    const trip = await prisma.trip.create({
      data: {
        user_id: req.user.id,
        title: title.trim(),
        description: description ? description.trim() : null,
        start_date: start_date || null,
        end_date: end_date || null,
        cover_image_url: finalCover,
        target_budget: targetBudgetFloat,
        is_public: !!is_public,
        public_slug: slug
      }
    });

    // If user selected initial cities in creation wizard
    if (Array.isArray(initial_cities) && initial_cities.length > 0) {
      for (let i = 0; i < initial_cities.length; i++) {
        const cityId = initial_cities[i];
        await prisma.tripStop.create({
          data: {
            trip_id: trip.id,
            city_id: cityId,
            stop_order: i + 1
          }
        });
      }
    }

    const createdTrip = await prisma.trip.findUnique({
      where: { id: trip.id },
      include: {
        stops: {
          orderBy: { stop_order: 'asc' },
          include: { city: true }
        }
      }
    });

    return res.status(201).json({
      message: 'Trip created successfully!',
      trip: createdTrip
    });
  } catch (err) {
    console.error('createTrip error:', err);
    return res.status(500).json({ error: 'Failed to create trip.' });
  }
};

export const getTripById = async (req, res) => {
  try {
    const { id } = req.params;

    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar_url: true
          }
        },
        stops: {
          orderBy: { stop_order: 'asc' },
          include: {
            city: {
              include: {
                activities: true
              }
            },
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
          orderBy: { date: 'asc' }
        }
      }
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    // Access check: User must own the trip, or user must be admin, or trip must be public
    const isOwner = req.user && req.user.id === trip.user_id;
    const isAdmin = req.user && req.user.role === 'admin';

    if (!isOwner && !isAdmin && !trip.is_public) {
      return res.status(403).json({ error: 'You do not have permission to view this private trip.' });
    }

    return res.json({ trip, isOwner, isAdmin });
  } catch (err) {
    console.error('getTripById error:', err);
    return res.status(500).json({ error: 'Failed to retrieve trip.' });
  }
};

export const updateTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      start_date,
      end_date,
      cover_image_url,
      target_budget,
      is_public
    } = req.body;

    const existingTrip = await prisma.trip.findUnique({
      where: { id }
    });

    if (!existingTrip) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    if (existingTrip.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You are not authorized to update this trip.' });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description ? description.trim() : null;
    if (start_date !== undefined) updateData.start_date = start_date;
    if (end_date !== undefined) updateData.end_date = end_date;
    if (cover_image_url !== undefined) updateData.cover_image_url = cover_image_url;
    if (target_budget !== undefined) updateData.target_budget = parseFloat(target_budget) || 0;
    if (is_public !== undefined) updateData.is_public = !!is_public;

    const updated = await prisma.trip.update({
      where: { id },
      data: updateData,
      include: {
        stops: {
          orderBy: { stop_order: 'asc' },
          include: { city: true }
        }
      }
    });

    return res.json({
      message: 'Trip updated successfully!',
      trip: updated
    });
  } catch (err) {
    console.error('updateTrip error:', err);
    return res.status(500).json({ error: 'Failed to update trip.' });
  }
};

export const deleteTrip = async (req, res) => {
  try {
    const { id } = req.params;

    const trip = await prisma.trip.findUnique({
      where: { id }
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    if (trip.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You are not authorized to delete this trip.' });
    }

    // Application level explicit cascade
    const stops = await prisma.tripStop.findMany({ where: { trip_id: id } });
    const stopIds = stops.map(s => s.id);

    if (stopIds.length > 0) {
      await prisma.tripActivity.deleteMany({
        where: { trip_stop_id: { in: stopIds } }
      });
      await prisma.tripStop.deleteMany({
        where: { trip_id: id }
      });
    }

    await prisma.budgetEntry.deleteMany({
      where: { trip_id: id }
    });

    await prisma.trip.delete({
      where: { id }
    });

    return res.json({ message: 'Trip and all its stops/activities successfully deleted.' });
  } catch (err) {
    console.error('deleteTrip error:', err);
    return res.status(500).json({ error: 'Failed to delete trip.' });
  }
};

export const toggleShare = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_public } = req.body;

    const trip = await prisma.trip.findUnique({
      where: { id }
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    if (trip.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You are not authorized to manage sharing for this trip.' });
    }

    const updated = await prisma.trip.update({
      where: { id },
      data: {
        is_public: is_public !== undefined ? !!is_public : !trip.is_public
      }
    });

    return res.json({
      message: updated.is_public ? 'Trip is now public and shareable!' : 'Trip is now private.',
      is_public: updated.is_public,
      public_slug: updated.public_slug
    });
  } catch (err) {
    console.error('toggleShare error:', err);
    return res.status(500).json({ error: 'Failed to toggle trip share status.' });
  }
};

export const copyTrip = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the source trip
    const sourceTrip = await prisma.trip.findUnique({
      where: { id },
      include: {
        stops: {
          orderBy: { stop_order: 'asc' },
          include: {
            trip_activities: true
          }
        },
        budget_entries: true
      }
    });

    if (!sourceTrip) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    // Must be public or owned by user
    if (!sourceTrip.is_public && sourceTrip.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'This trip is private and cannot be copied.' });
    }

    const newSlug = generateSlug(`${sourceTrip.title}-copy`);

    // Create cloned trip
    const newTrip = await prisma.trip.create({
      data: {
        user_id: req.user.id,
        title: `${sourceTrip.title} (Copy)`,
        description: sourceTrip.description,
        start_date: sourceTrip.start_date,
        end_date: sourceTrip.end_date,
        cover_image_url: sourceTrip.cover_image_url,
        is_public: false,
        public_slug: newSlug,
        target_budget: sourceTrip.target_budget
      }
    });

    // Clone stops and their scheduled activities
    for (const stop of sourceTrip.stops) {
      const newStop = await prisma.tripStop.create({
        data: {
          trip_id: newTrip.id,
          city_id: stop.city_id,
          stop_order: stop.stop_order,
          arrival_date: stop.arrival_date,
          departure_date: stop.departure_date,
          notes: stop.notes,
          budget_allocated: stop.budget_allocated
        }
      });

      for (const act of stop.trip_activities) {
        await prisma.tripActivity.create({
          data: {
            trip_stop_id: newStop.id,
            activity_id: act.activity_id,
            custom_title: act.custom_title,
            custom_cost: act.custom_cost,
            scheduled_date: act.scheduled_date,
            scheduled_time: act.scheduled_time,
            notes: act.notes,
            status: act.status
          }
        });
      }
    }

    // Clone custom budget entries
    for (const entry of sourceTrip.budget_entries) {
      await prisma.budgetEntry.create({
        data: {
          trip_id: newTrip.id,
          category: entry.category,
          description: entry.description,
          amount: entry.amount,
          date: entry.date,
          expense_type: entry.expense_type
        }
      });
    }

    const fullClonedTrip = await prisma.trip.findUnique({
      where: { id: newTrip.id },
      include: {
        stops: {
          orderBy: { stop_order: 'asc' },
          include: {
            city: true,
            trip_activities: {
              include: { activity: true }
            }
          }
        }
      }
    });

    return res.status(201).json({
      message: 'Trip successfully copied to your account!',
      trip: fullClonedTrip
    });
  } catch (err) {
    console.error('copyTrip error:', err);
    return res.status(500).json({ error: 'Failed to copy trip.' });
  }
};
