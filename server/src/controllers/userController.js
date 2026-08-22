import bcrypt from 'bcryptjs';
import prisma from '../prisma/client.js';

export const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar_url: true,
        bio: true,
        created_at: true,
        _count: {
          select: {
            trips: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.json({ user });
  } catch (err) {
    console.error('getMe error:', err);
    return res.status(500).json({ error: 'Failed to retrieve user profile.' });
  }
};

export const updateMe = async (req, res) => {
  try {
    const { name, bio, avatar_url, current_password, new_password } = req.body;
    const updateData = {};

    if (name !== undefined) {
      if (!name.trim()) return res.status(400).json({ error: 'Name cannot be empty.' });
      updateData.name = name.trim();
    }

    if (bio !== undefined) {
      updateData.bio = bio;
    }

    if (avatar_url !== undefined) {
      updateData.avatar_url = avatar_url;
    }

    if (new_password) {
      if (new_password.length < 8) {
        return res.status(400).json({ error: 'New password must be at least 8 characters.' });
      }
      if (!current_password) {
        return res.status(400).json({ error: 'Current password is required to change password.' });
      }

      const currentUser = await prisma.user.findUnique({
        where: { id: req.user.id }
      });

      const isMatch = await bcrypt.compare(current_password, currentUser.password_hash);
      if (!isMatch) {
        return res.status(400).json({ error: 'Current password is incorrect.' });
      }

      updateData.password_hash = await bcrypt.hash(new_password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar_url: true,
        bio: true,
        created_at: true
      }
    });

    return res.json({
      message: 'Profile updated successfully!',
      user: updatedUser
    });
  } catch (err) {
    console.error('updateMe error:', err);
    return res.status(500).json({ error: 'Failed to update user profile.' });
  }
};

export const deleteMe = async (req, res) => {
  try {
    await prisma.user.delete({
      where: { id: req.user.id }
    });

    return res.json({ message: 'User account and all associated trips deleted successfully.' });
  } catch (err) {
    console.error('deleteMe error:', err);
    return res.status(500).json({ error: 'Failed to delete account.' });
  }
};
