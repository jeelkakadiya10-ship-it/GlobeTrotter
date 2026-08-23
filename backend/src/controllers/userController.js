import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        profile_photo_url: true,
        language_pref: true,
        role: true,
        created_at: true,
        saved_destinations: {
          include: {
            city: true
          }
        }
      }
    });
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

export const updateMe = async (req, res) => {
  try {
    const { name, profile_photo_url, language_pref, email, password } = req.body;
    const updateData = {};

    if (name !== undefined) updateData.name = name.trim();
    if (profile_photo_url !== undefined) updateData.profile_photo_url = profile_photo_url;
    if (language_pref !== undefined) updateData.language_pref = language_pref;
    if (email !== undefined) {
      const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
      if (existing && existing.id !== req.user.id) {
        return res.status(400).json({ error: 'Email already in use' });
      }
      updateData.email = email.toLowerCase().trim();
    }
    if (password) {
      if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters' });
      }
      updateData.password_hash = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        profile_photo_url: true,
        language_pref: true,
        role: true
      }
    });

    return res.json(updated);
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const deleteMe = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: 'Password confirmation required to delete account' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Incorrect password confirmation' });
    }

    // Cascade delete user
    await prisma.user.delete({ where: { id: req.user.id } });
    return res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error('Delete account error:', err);
    return res.status(500).json({ error: 'Failed to delete account' });
  }
};

export const toggleSaveCity = async (req, res) => {
  try {
    const { cityId } = req.body;
    if (!cityId) return res.status(400).json({ error: 'cityId is required' });

    const existing = await prisma.savedDestination.findFirst({
      where: { user_id: req.user.id, city_id: Number(cityId) }
    });

    if (existing) {
      await prisma.savedDestination.delete({ where: { id: existing.id } });
      return res.json({ saved: false, message: 'City removed from saved destinations' });
    } else {
      await prisma.savedDestination.create({
        data: { user_id: req.user.id, city_id: Number(cityId) }
      });
      return res.json({ saved: true, message: 'City saved to destinations' });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Failed to toggle saved destination' });
  }
};