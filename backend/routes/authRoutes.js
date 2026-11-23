const express = require('express');
const router = express.Router();

// Pre-seeded verified accounts for demonstration and real auth
const users = [
  {
    id: 'user-admin',
    name: 'Krishna Patel',
    email: 'admin@smartbasket.com',
    password: 'admin123',
    role: 'admin',
    phone: '+91 98000 11223'
  },
  {
    id: 'user-customer',
    name: 'Rahul Sharma',
    email: 'user@smartbasket.com',
    password: 'user123',
    role: 'customer',
    phone: '+91 98765 43210',
    address: '402 Green Meadows, Sector 14, Gurugram'
  }
];

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user || user.password !== password) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  res.json({
    success: true,
    message: `Welcome back, ${user.name}!`,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      address: user.address || ''
    }
  });
});

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { name, email, password, role = 'customer', phone, address } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
  }

  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ success: false, message: 'Email already registered' });
  }

  const newUser = {
    id: `user-${Date.now()}`,
    name,
    email,
    password,
    role: role === 'admin' ? 'admin' : 'customer',
    phone: phone || '',
    address: address || ''
  };

  users.push(newUser);

  res.status(201).json({
    success: true,
    message: 'Account created successfully!',
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone,
      address: newUser.address
    }
  });
});

// GET /api/auth/demo-accounts
router.get('/demo-accounts', (req, res) => {
  res.json({
    success: true,
    accounts: [
      { role: 'admin', email: 'admin@smartbasket.com', name: 'Krishna Patel (Store Admin)', description: 'Full access to inventory, pricing, analytics & restock automation' },
      { role: 'customer', email: 'user@smartbasket.com', name: 'Rahul Sharma', description: 'Customer shopping, budget planner, recipes & order checkout' }
    ]
  });
});

module.exports = router;
