import prisma from '../prisma/client.js';

export const addActivityToStop = async (req, res) => {
  try {
    const { id: trip_stop_id } = req.params;
    const {
      activity_id,
      custom_title,
      custom_cost,
      scheduled_date,
      scheduled_time,
      notes,
      status
    } = req.body;

    const stop = await prisma.tripStop.findUnique({
      where: { id: trip_stop_id },
      include: { trip: true }
    });

    if (!stop) {
      return res.status(404).json({ error: 'Trip stop not found.' });
    }

    if (stop.trip.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to add activities to this stop.' });
    }

    let defaultCost = 0;
    let titleToUse = custom_title;

    if (activity_id) {
      const baseActivity = await prisma.activity.findUnique({
        where: { id: activity_id }
      });
      if (baseActivity) {
        defaultCost = baseActivity.estimated_cost;
        if (!titleToUse) titleToUse = baseActivity.title;
      }
    }

    const finalCost = custom_cost !== undefined ? parseFloat(custom_cost) : defaultCost;

    const tripActivity = await prisma.tripActivity.create({
      data: {
        trip_stop_id,
        activity_id: activity_id || null,
        custom_title: titleToUse,
        custom_cost: isNaN(finalCost) ? 0 : finalCost,
        scheduled_date: scheduled_date || stop.arrival_date || null,
        scheduled_time: scheduled_time || null,
        notes: notes ? notes.trim() : null,
        status: status || 'planned'
      },
      include: {
        activity: true
      }
    });

    return res.status(201).json({
      message: 'Activity added to stop!',
      tripActivity
    });
  } catch (err) {
    console.error('addActivityToStop error:', err);
    return res.status(500).json({ error: 'Failed to add activity to stop.' });
  }
};

export const updateTripActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      custom_title,
      custom_cost,
      scheduled_date,
      scheduled_time,
      notes,
      status
    } = req.body;

    const tripActivity = await prisma.tripActivity.findUnique({
      where: { id },
      include: {
        trip_stop: {
          include: { trip: true }
        }
      }
    });

    if (!tripActivity) {
      return res.status(404).json({ error: 'Scheduled activity not found.' });
    }

    if (tripActivity.trip_stop.trip.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to update this activity.' });
    }

    const updateData = {};
    if (custom_title !== undefined) updateData.custom_title = custom_title ? custom_title.trim() : null;
    if (custom_cost !== undefined) updateData.custom_cost = parseFloat(custom_cost) || 0;
    if (scheduled_date !== undefined) updateData.scheduled_date = scheduled_date;
    if (scheduled_time !== undefined) updateData.scheduled_time = scheduled_time;
    if (notes !== undefined) updateData.notes = notes ? notes.trim() : null;
    if (status !== undefined) updateData.status = status;

    const updated = await prisma.tripActivity.update({
      where: { id },
      data: updateData,
      include: {
        activity: true
      }
    });

    return res.json({
      message: 'Scheduled activity updated!',
      tripActivity: updated
    });
  } catch (err) {
    console.error('updateTripActivity error:', err);
    return res.status(500).json({ error: 'Failed to update scheduled activity.' });
  }
};

export const deleteTripActivity = async (req, res) => {
  try {
    const { id } = req.params;

    const tripActivity = await prisma.tripActivity.findUnique({
      where: { id },
      include: {
        trip_stop: {
          include: { trip: true }
        }
      }
    });

    if (!tripActivity) {
      return res.status(404).json({ error: 'Scheduled activity not found.' });
    }

    if (tripActivity.trip_stop.trip.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to delete this activity.' });
    }

    await prisma.tripActivity.delete({
      where: { id }
    });

    return res.json({ message: 'Activity removed from stop.' });
  } catch (err) {
    console.error('deleteTripActivity error:', err);
    return res.status(500).json({ error: 'Failed to delete activity.' });
  }
};
