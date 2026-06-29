import dotenv from 'dotenv';
import http from 'http';
import app from './app.js';
import connectDB from './config/db.js';
import { initIO } from './socket.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

initIO(server);

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
});
