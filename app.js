const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sequelize = require('./db');
const { Op } = require('sequelize');
const User = require('./models/User');
const Contact = require('./models/Contact');
require('dotenv').config();


const app = express();
const PORT = 3000;
const SECRET_KEY = process.env.SECRET_KEY;


app.use(express.json());

app.post('/register', async (req, res) => {
  try {
    const { name, phoneNumber, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, phoneNumber, email, password: hashedPassword });
    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;
    const user = await User.findOne({ where: { phoneNumber } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ error: 'Invalid details' });
      return;
    }

    const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});


app.post('/mark-as-spam/:phoneNumber', async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    
   
    const token = req.headers.authorization;
    
    if (!token) {
      res.status(401).json({ error: 'Unauthorized: Token missing' });
      return;
    }

    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      const contact = await Contact.findOne({ where: { phoneNumber } });

      if (!contact) {
        res.status(404).json({ error: 'Contact not found' });
        return;
      }
      await contact.update({ spam: true });
      res.status(200).json({ message: 'Contact marked as spam Succssfully' });
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/search/name/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const results = await Contact.findAll({
      where: {
        name: { [Op.like]: `%${name}%` },
        spam: false,
      },
    });
    res.status(200).json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Server error: ${error.message}` });
  }
});

app.get('/search/phone/:phoneNumber', async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    const results = await Contact.findAll({
      where: {
        phoneNumber,
        spam: false,
      },
    });
    res.status(200).json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});
