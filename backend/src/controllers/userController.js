import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const getMe = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        profile_photo_url: true,
        language_pref: true,
        preferred_currency: true,
        role: true,
        created_at: true,
        saved_destinations: {
          include: {
            city: true
          }
        }
      }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error('getMe error:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

export const updateMe = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const { name, email, profile_photo_url, language_pref, preferred_currency, password } = req.body;

    const dataToUpdate = {};
    if (name) dataToUpdate.name = name;
    if (email) dataToUpdate.email = email;
    if (profile_photo_url !== undefined) dataToUpdate.profile_photo_url = profile_photo_url;
    if (language_pref !== undefined) dataToUpdate.language_pref = language_pref;
    if (preferred_currency !== undefined) dataToUpdate.preferred_currency = preferred_currency;
    if (password) {
      dataToUpdate.password_hash = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        profile_photo_url: true,
        language_pref: true,
        preferred_currency: true,
        role: true
      }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('updateMe error:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
};

export const deleteMe = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: 'Password is required to confirm account deletion' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    await prisma.user.delete({
      where: { id: userId }
    });

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('deleteMe error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
};

export const toggleSaveCity = async (req, res) => {
  try {
    const { cityId } = req.body;
    const userId = req.user.id || req.user.userId;

    const existing = await prisma.savedDestination.findFirst({
      where: {
        user_id: userId,
        city_id: Number(cityId)
      }
    });

    if (existing) {
      await prisma.savedDestination.delete({
        where: { id: existing.id }
      });
      return res.json({ saved: false });
    } else {
      await prisma.savedDestination.create({
        data: {
          user_id: userId,
          city_id: Number(cityId)
        }
      });
      return res.json({ saved: true });
    }
  } catch (error) {
    console.error('toggleSaveCity error:', error);
    res.status(500).json({ error: 'Failed to toggle save city' });
  }
};