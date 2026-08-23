import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const addStop = async (req, res) => {
  try {
    const tripId = Number(req.params.id);
    const { city_id, arrival_date, departure_date } = req.body;

    if (!city_id) {
      return res.status(400).json({ error: 'city_id is required' });
    }

    const trip = await prisma.trip.findFirst({
      where: { id: tripId, user_id: req.user.id }
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    // Get max order_index
    const maxOrder = await prisma.stop.findFirst({
      where: { trip_id: tripId },
      orderBy: { order_index: 'desc' }
    });
    const nextOrder = (maxOrder ? maxOrder.order_index : 0) + 1;

    // Use default dates matching trip if not specified
    const arr = arrival_date ? new Date(arrival_date) : trip.start_date;
    const dep = departure_date ? new Date(departure_date) : trip.end_date;

    const stop = await prisma.stop.create({
      data: {
        trip_id: tripId,
        city_id: Number(city_id),
        arrival_date: arr,
        departure_date: dep,
        order_index: nextOrder
      },
      include: {
        city: true,
        trip_activities: { include: { activity: true } }
      }
    });

    return res.status(201).json(stop);
  } catch (err) {
    console.error('Add stop error:', err);
    return res.status(500).json({ error: 'Failed to add stop' });
  }
};

export const updateStop = async (req, res) => {
  try {
    const stopId = Number(req.params.id);
    const { arrival_date, departure_date, order_index } = req.body;

    const stop = await prisma.stop.findUnique({
      where: { id: stopId },
      include: { trip: true }
    });

    if (!stop || stop.trip.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Stop not found or unauthorized' });
    }

    const updateData = {};
    if (arrival_date) updateData.arrival_date = new Date(arrival_date);
    if (departure_date) updateData.departure_date = new Date(departure_date);
    if (order_index !== undefined) updateData.order_index = Number(order_index);

    const updated = await prisma.stop.update({
      where: { id: stopId },
      data: updateData,
      include: {
        city: true,
        trip_activities: { include: { activity: true } }
      }
    });

    return res.json(updated);
  } catch (err) {
    console.error('Update stop error:', err);
    return res.status(500).json({ error: 'Failed to update stop' });
  }
};

export const deleteStop = async (req, res) => {
  try {
    const stopId = Number(req.params.id);
    const stop = await prisma.stop.findUnique({
      where: { id: stopId },
      include: { trip: true }
    });

    if (!stop || stop.trip.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Stop not found or unauthorized' });
    }

    await prisma.stop.delete({ where: { id: stopId } });
    return res.json({ message: 'Stop removed successfully' });
  } catch (err) {
    console.error('Delete stop error:', err);
    return res.status(500).json({ error: 'Failed to delete stop' });
  }
};

export const reorderStops = async (req, res) => {
  try {
    const tripId = Number(req.params.id);
    const { orderedStopIds } = req.body;

    if (!Array.isArray(orderedStopIds)) {
      return res.status(400).json({ error: 'orderedStopIds array is required' });
    }

    const trip = await prisma.trip.findFirst({
      where: { id: tripId, user_id: req.user.id }
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or unauthorized' });
    }

    // Update order_index for each stop
    await prisma.$transaction(
      orderedStopIds.map((stopId, idx) =>
        prisma.stop.update({
          where: { id: Number(stopId) },
          data: { order_index: idx + 1 }
        })
      )
    );

    const updatedStops = await prisma.stop.findMany({
      where: { trip_id: tripId },
      orderBy: { order_index: 'asc' },
      include: {
        city: true,
        trip_activities: { include: { activity: true } }
      }
    });

    return res.json(updatedStops);
  } catch (err) {
    console.error('Reorder stops error:', err);
    return res.status(500).json({ error: 'Failed to reorder stops' });
  }
};