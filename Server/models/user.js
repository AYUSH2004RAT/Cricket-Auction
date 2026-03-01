const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'team'], default: 'team' },
    budget: { type: Number, default: 100000000 } // 10 Cr Base Budget
});

module.exports = mongoose.model('User', UserSchema);