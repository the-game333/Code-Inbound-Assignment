const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { createConnection } = require('typeorm');
const User = require('./user');
const app = express();
app.use(bodyParser.json());

// Secret key for JWT authentication
const secretKey = 'your-secret-key';

// Middleware for authentication
const authenticate = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Failed to authenticate token' });
    }
    req.user = decoded;
    next();
  });
};
// Import the User entity


// Create a new user
app.post('/users', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = new User();
    user.name = name;
    user.email = email;
    user.password = password;
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Get all users
app.get('/users', authenticate, async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get a specific user
app.get('/users/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findOne(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update a user
app.put('/users/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findOne(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const { name, email, password } = req.body;
    user.name = name;
    user.email = email;
    user.password = password;
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete a user
app.delete('/users/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findOne(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    await user.remove();
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

app.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email, password });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
  
      const token = jwt.sign({ id: user.id, email: user.email }, secretKey);
      res.json({ token });
    } catch (error) {
      res.status(500).json({ error: 'Failed to authenticate user' });
    }
  });
  
// Database connection
createConnection({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'your-username',
  password: 'your-password',
  database: 'your-database',
  synchronize: true,
  entities: [/* Array of your entity classes */],
})
  .then(() => {
    console.log('Connected to the database');
  })
  .catch((error) => {
    console.log('Database connection error:', error);
  });

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
