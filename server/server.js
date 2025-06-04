const express = require('express');
const dotenv = require('dotenv');

const homeRoutes = require('../src/routes/homeRoutes');
const shoesRoutes = require('../src/routes/shoesRoutes');
const topsRoutes = require('../src/routes/topsRoutes');
const bottomsRoutes = require('../src/routes/bottomsRoutes');
const hatsRoutes = require('../src/routes/hatsRoutes');
const outerwearRoutes = require('../src/routes/outerwearRoutes');

dotenv.config();
const app = express();

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', './src/views');

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Routes
app.use('/', homeRoutes);
app.use('/api/shoes', shoesRoutes);
app.use('/api/tops', topsRoutes);
app.use('/api/bottoms', bottomsRoutes);
app.use('/api/hats', hatsRoutes);
app.use('/api/outerwear', outerwearRoutes);
// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));