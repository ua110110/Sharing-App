const express = require('express')

const app = express()
const path = require('path')

const cors = require('cors');
// Cors 
const corsOptions = {
  origin: process.env.ALLOWED_CLIENTS.split(',')
  // ['http://localhost:3000', 'http://localhost:5000', 'http://localhost:3300']
}

const PORT = process.env.PORT || 3000;

const connectDB = require('./config/db');
connectDB();

app.use(cors(corsOptions))
app.use(express.static('public'));
app.use(express.json())
// Template engine
app.set('views' , path.join(__dirname, '/views'));
app.set('view engine', 'ejs');


// Routes
app.use('/api/files', require('./routes/files'));
app.use('/files', require('./routes/show'));
app.use('/files/download' , require('./routes/download'))

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})