const express = require('express');
const app = express();
const connectDB = require('./config/db');

// Connect Database
connectDB();

// Init Middleware for Body Parser
app.use(express.json({ extended: false }));

app.get('/', (req, res) => {
	res.send('API Online!');
});

// Mounted Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));

// Create the Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
	console.log(`App listening on port ${PORT} !`);
});
