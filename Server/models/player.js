const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { type: String, enum: ['Batsman', 'Bowler', 'All-Rounder', 'Wicketkeeper'], required: true },
    basePrice: { type: Number, required: true },
    
    // ✅ CSV se Photo URL lene ke liye (Ya default blank)
    imageUrl: { type: String, default: '' },
    
    // Status update ke liye
    status: { type: String, default: 'Available' }, // 'Sold', 'Unsold'
    
    // Bidding info
    currentBid: { type: Number, default: 0 },
    
    // Ye fields Server.js se match honi chahiye
    soldPrice: { type: Number, default: 0 },  // Final price jispe bika
    team: { type: String, default: null },    // Winning Team ka naam

    // Har Admin ke tournament ko alag rakhne ke liye
    adminId: { type: String, required: true },

    // ✅ CSV upload se phone number lene ke liye
    phone: { type: String, default: '' } 
});

module.exports = mongoose.model('Player', PlayerSchema);