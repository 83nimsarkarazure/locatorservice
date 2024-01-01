import mongoose from 'mongoose';

const mongoURI = 'mongodb://127.0.0.1:27017/social-connect';

mongoose
    .connect(mongoURI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Error connecting to MongoDB:', err));
