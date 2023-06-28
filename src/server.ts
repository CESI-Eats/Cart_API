import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { initLapinou } from './lapinou';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI as string, { useNewUrlParser: true, useUnifiedTopology: true } as any)
  .then(() => console.log('Successfully connected to MongoDB.'))
  .catch((error) => console.log('Failed to connect to MongoDB.', error));

initLapinou();

// Start server
const PORT = process.env.PORT || 3000;