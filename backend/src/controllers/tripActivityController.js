import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const addActivityToStop = async (req, res) => {
  try {
    const stopId = Number(req.params.id);
    const { activity_id, scheduled_date, scheduled_time, cost_override } = req.body;

    if (!activity_id) {
      return res.status(400).json({ error: 'activity_id is required' });
    }

    const stop = await prisma.stop.findUnique({
      where: { id: stopId },
      include: { trip: true }
    });

    if (!stop || stop.trip.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Stop not found or unauthorized' });
    }

    const tripActivity = await prisma.tripActivity.create({
      data: {
        stop_id: stopId,
        activity_id: Number(activity_id),
        scheduled_date: scheduled_date ? new Date(scheduled_date) : stop.arrival_date,
        scheduled_time: scheduled_time || '10:00',
        cost_override: cost_override !== undefined ? Number(cost_override) : null
      },
      include: {
        activity: true
      }
    });

    return res.status(201).json(tripActivity);
  } catch (err) {
    console.error('Add trip activity error:', err);
    return res.status(500).json({ error: 'Failed to add activity to stop' });
  }
};

export const updateTripActivity = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { scheduled_date, scheduled_time, cost_override, stop_id } = req.body;

    const existing = await prisma.tripActivity.findUnique({
      where: { id },
      include: { stop: { include: { trip: true } } }
    });

    if (!existing || existing.stop.trip.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Trip activity not found or unauthorized' });
    }

    const updateData = {};
    if (scheduled_date !== undefined) updateData.scheduled_date = scheduled_date ? new Date(scheduled_date) : null;
    if (scheduled_time !== undefined) updateData.scheduled_time = scheduled_time;
    if (cost_override !== undefined) updateData.cost_override = cost_override === null ? null : Number(cost_override);
    if (stop_id !== undefined) updateData.stop_id = Number(stop_id);

    const updated = await prisma.tripActivity.update({
      where: { id },
      data: updateData,
      include: { activity: true }
    });

    return res.json(updated);
  } catch (err) {
    console.error('Update trip activity error:', err);
    return res.status(500).json({ error: 'Failed to update trip activity' });
  }
};

export const deleteTripActivity = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.tripActivity.findUnique({
      where: { id },
      include: { stop: { include: { trip: true } } }
    });

    if (!existing || existing.stop.trip.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Trip activity not found or unauthorized' });
    }

    await prisma.tripActivity.delete({ where: { id } });
    return res.json({ message: 'Activity removed from stop' });
  } catch (err) {
    console.error('Delete trip activity error:', err);
    return res.status(500).json({ error: 'Failed to delete trip activity' });
  }
};