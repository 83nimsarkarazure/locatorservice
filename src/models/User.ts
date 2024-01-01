// models/User.ts
import mongoose, { Schema } from 'mongoose';

const LocationSchema = new Schema({
    timestamp: String,
    coordinates: [Number],
});

const UserSchema = new Schema({
    name: String,
    relation: String,
    familyName: String,
    mobileNumber: String,
    locationHistory: [LocationSchema]
});

const User = mongoose.model('User', UserSchema);

export default User;
