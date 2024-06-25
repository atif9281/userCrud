// controllers/userController.js
const prisma = require('../services/prismaService');

// Controller functions
async function getAllUsers(req, res) {
  try {
    const users = await prisma.user.findMany();
    if (users.length === 0) {
      res.json({ message: 'No users found yet' });
    } else {
      res.json(users);
    }
  } catch (error) {
    res.status(500).json({ error: `Failed to retrieve users: ${error.message}` });
  }
}

async function getUserById(req, res) {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({ where: { id: Number(id) } });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    if (error instanceof prisma.Prisma.PrismaClientValidationError) {
      res.status(400).json({ error: 'Invalid user ID format' });
    } else {
      res.status(500).json({ error: `Failed to retrieve user: ${error.message}` });
    }
  }
}

async function createUser(req, res) {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  try {
    const user = await prisma.user.create({ data: { name, email } });
    res.status(201).json(user);
  } catch (error) {
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'A user with this email already exists. Email should be unique.' });
    } else {
      res.status(500).json({ error: `Failed to create user: ${error.message}` });
    }
  }
}

async function updateUser(req, res) {
  const { id } = req.params;
  const { name, email } = req.body;

  if (!name && !email) {
    return res.status(400).json({ error: 'At least one field (name or email) is required to update' });
  }

  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { id: Number(id) } });

    if (!existingUser) {
      return res.status(404).json({ error: 'No user found with this ID' });
    }

    const updatedData = {};
    if (name) updatedData.name = name;
    if (email) updatedData.email = email;

    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: updatedData,
    });

    res.json(user);
  } catch (error) {
    if (error instanceof prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        res.status(409).json({ error: 'A user with this email already exists. Email should be unique.' });
      } else {
        res.status(500).json({ error: `Failed to update user: ${error.message}` });
      }
    } else {
      res.status(500).json({ error: `Failed to update user: ${error.message}` });
    }
  }
}

async function deleteUser(req, res) {
  const { id } = req.params;
  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { id: Number(id) } });

    if (!existingUser) {
      return res.status(404).json({ error: 'No user found with this ID' });
    }

    await prisma.user.delete({ where: { id: Number(id) } });
    res.status(204).end();
  } catch (error) {
    if (error instanceof prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.status(500).json({ error: `Failed to delete user: ${error.message}` });
    }
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};