import prisma from '../prisma/client.js';

export const addStop = async (req, res) => {
  try {
    const { id: trip_id } = req.params;
    const { city_id, arrival_date, departure_date, notes, budget_allocated } = req.body;

    if (!city_id) {
      return res.status(400).json({ error: 'City ID is required.' });
    }

    const trip = await prisma.trip.findUnique({
      where: { id: trip_id },
      include: { stops: true }
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    if (trip.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to add stops to this trip.' });
    }

    // Determine next stop order
    const nextOrder = trip.stops.length + 1;

    const stop = await prisma.tripStop.create({
      data: {
        trip_id,
        city_id,
        stop_order: nextOrder,
        arrival_date: arrival_date || null,
        departure_date: departure_date || null,
        notes: notes ? notes.trim() : null,
        budget_allocated: parseFloat(budget_allocated) || 0
      },
      include: {
        city: {
          include: {
            activities: true
          }
        },
        trip_activities: {
          include: { activity: true }
        }
      }
    });

    return res.status(201).json({
      message: 'Stop added successfully!',
      stop
    });
  } catch (err) {
    console.error('addStop error:', err);
    return res.status(500).json({ error: 'Failed to add stop to trip.' });
  }
};

export const updateStop = async (req, res) => {
  try {
    const { id } = req.params;
    const { arrival_date, departure_date, notes, budget_allocated } = req.body;

    const stop = await prisma.tripStop.findUnique({
      where: { id },
      include: { trip: true }
    });

    if (!stop) {
      return res.status(404).json({ error: 'Stop not found.' });
    }

    if (stop.trip.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to update this stop.' });
    }

    const updateData = {};
    if (arrival_date !== undefined) updateData.arrival_date = arrival_date;
    if (departure_date !== undefined) updateData.departure_date = departure_date;
    if (notes !== undefined) updateData.notes = notes ? notes.trim() : null;
    if (budget_allocated !== undefined) updateData.budget_allocated = parseFloat(budget_allocated) || 0;

    const updated = await prisma.tripStop.update({
      where: { id },
      data: updateData,
      include: {
        city: true,
        trip_activities: {
          include: { activity: true }
        }
      }
    });

    return res.json({
      message: 'Stop updated successfully!',
      stop: updated
    });
  } catch (err) {
    console.error('updateStop error:', err);
    return res.status(500).json({ error: 'Failed to update stop.' });
  }
};

export const deleteStop = async (req, res) => {
  try {
    const { id } = req.params;

    const stop = await prisma.tripStop.findUnique({
      where: { id },
      include: { trip: true }
    });

    if (!stop) {
      return res.status(404).json({ error: 'Stop not found.' });
    }

    if (stop.trip.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to delete this stop.' });
    }

    // Delete cascading activities
    await prisma.tripActivity.deleteMany({
      where: { trip_stop_id: id }
    });

    // Delete the stop
    await prisma.tripStop.delete({
      where: { id }
    });

    // Reorder remaining stops
    const remainingStops = await prisma.tripStop.findMany({
      where: { trip_id: stop.trip_id },
      orderBy: { stop_order: 'asc' }
    });

    for (let i = 0; i < remainingStops.length; i++) {
      await prisma.tripStop.update({
        where: { id: remainingStops[i].id },
        data: { stop_order: i + 1 }
      });
    }

    return res.json({ message: 'Stop removed from itinerary.' });
  } catch (err) {
    console.error('deleteStop error:', err);
    return res.status(500).json({ error: 'Failed to delete stop.' });
  }
};

export const reorderStops = async (req, res) => {
  try {
    const { id: trip_id } = req.params;
    const { orderedStopIds } = req.body;

    if (!Array.isArray(orderedStopIds) || orderedStopIds.length === 0) {
      return res.status(400).json({ error: 'orderedStopIds array is required.' });
    }

    const trip = await prisma.trip.findUnique({
      where: { id: trip_id }
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    if (trip.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to reorder stops.' });
    }

    // Batch update order
    for (let i = 0; i < orderedStopIds.length; i++) {
      await prisma.tripStop.update({
        where: { id: orderedStopIds[i] },
        data: { stop_order: i + 1 }
      });
    }

    const updatedStops = await prisma.tripStop.findMany({
      where: { trip_id },
      orderBy: { stop_order: 'asc' },
      include: {
        city: true,
        trip_activities: {
          include: { activity: true }
        }
      }
    });

    return res.json({
      message: 'Stops reordered successfully!',
      stops: updatedStops
    });
  } catch (err) {
    console.error('reorderStops error:', err);
    return res.status(500).json({ error: 'Failed to reorder stops.' });
  }
};
