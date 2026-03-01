const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    teamName: { type: String, required: true },
    owner: { type: String, required: true },
    purse: { type: Number, required: true },
    username: { type: String, required: true, unique: true }, 
    password: { type: String, required: true }, 
    role: { type: String, default: 'team' },
    
    // ✅ FIX: Players ka poora data save karein (taaki Squads page par dikhe)
    players: [{ 
        name: String,
        role: String,
        basePrice: Number,
        currentBid: Number, // Ye zaroori hai (Sold Price)
        status: String,
        imageUrl: String 
    }],

    // 🔥 NAYA FEATURE: Har Admin ki teams ko alag rakhne ke liye
    adminId: { type: String, required: true } 
});

module.exports = mongoose.model('Team', teamSchema);