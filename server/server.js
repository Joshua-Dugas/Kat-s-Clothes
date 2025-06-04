const express = require('express');
const dotenv = require('dotenv');
const cors = require ('cors');

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
app.use(cors({
    origin: 'XXXX', // Allows local network IP
}));
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
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT} and XXXX:${PORT}`);
});
