// server.js
const http = require('http');
const path = require('path');
const express = require('express');
const socketio = require('socket.io');
const { User, verify } = require('./Database.js'); // Assume verify is JWT.verify
const { console } = require('inspector');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set up views and static files
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---------- Routes ----------

// Login Page
app.get('/', (req, res) => {
  res.status(200).render('Login');
});


// History Page
app.post('/History', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) return res.status(400).send('Token not provided');

  try {
    const decoded = verify(token);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).send('Unauthorized');

    res.status(200).render('History', {
      Name: user.name,
      Email: user.email,
      Rank: user.Rank,
      Shift: user.Shift,
      History: [
        { location: "MIS", Date: "22 March", Description: "Heavy Sheavy" },
        // Add more sample data if needed
      ]
    });
  } catch (err) {
    console.error('Error in /History POST:', err);
    res.status(500).send('Internal Server Error');
  }
});



// About Page
app.get('/About', (req, res) => {
  res.status(200).render('About');
})

// Public Home Page (HTML only)
app.get('/Home', (req, res) => {
  
  res.status(200).render('Home');
});


app.get('/Police', (req, res) => {
  res.status(200).render('Emergent');
});


app.get('/User', (req, res) => {
  res.status(200).render('Client');
});


// Protected User Data API
app.get('/api/user', async (req, res) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verify(token);
    const user = await User.findById(decoded.id);
    if (!user) return res.sendStatus(401);

    res.status(200).json({
      name: user.name,
      email: user.email,
      rank: user.Rank,
      shift: user.Shift
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login API
app.post('/Login', async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
      password: req.body.Password
    });

    if (!user)
      return res.status(401).json({ message: 'Invalid email or password' });

    const token = user.CreateToken(); // Create JWT
    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ---------- Socket.IO ----------
const connectedUsers = new Map();
const activeRequests = new Map();

io.on('connection', (socket) => {
  console.log('✅ Client connected:', socket.id);
  connectedUsers.set(socket.id, socket);

  socket.on('helpRequested', (data) => {
    activeRequests.set(socket.id, { accepted: false });

    io.emit('dispatchAlert', {
      requesterId: socket.id,
      userLocation: data.location
    });
  });

  socket.on('officerAccepted', (data) => {
    const { requesterId, officerLocation } = data;
    const request = activeRequests.get(requesterId);

    if (!request || request.accepted) return;

    activeRequests.set(requesterId, { accepted: true });

    const userSocket = connectedUsers.get(requesterId);
    if (userSocket) {
      userSocket.emit('requestAccepted', { officerLocation });
    }

    socket.broadcast.emit('requestClosed', { requesterId });
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
    connectedUsers.delete(socket.id);
  });
});

// ---------- Start Server ----------
server.listen(8000, '127.0.0.1', () => {
  console.log('🚀 Server running at http://127.0.0.1:8000');
});
