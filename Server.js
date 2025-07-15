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

    Bhai Api kasy de skta aap ko. Samja kro 
