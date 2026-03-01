const express = require('express');
const router = express.Router();
const Player = require('../models/Player'); // Path check kar lena

// 1. Get All Players
router.get('/all', async (req, res) => {
    try {
        const players = await Player.find();
        res.status(200).json(players);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Add New Player (Manual Add from Frontend)
router.post('/add', async (req, res) => {
    try {
        // ✅ NAYA: phone aur adminId nikal liya frontend ke request se
        const { name, role, basePrice, image, phone, adminId } = req.body;

        // Validation: adminId ab zaroori hai schema ke hisaab se
        if (!name || !basePrice || !adminId) {
            return res.status(400).json({ message: "Name, Base Price aur Admin ID zaroori hain!" });
        }

        const newPlayer = new Player({
            name,
            role,
            basePrice: Number(basePrice),
            imageUrl: image || '', 
            phone: phone || '',  // ✅ NAYA
            adminId: adminId,    // ✅ NAYA
            status: 'Available'
        });

        await newPlayer.save();
        res.status(201).json(newPlayer);
    } catch (err) {
        console.error("❌ Atlas Save Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// 3. Bulk Add Players (CSV Upload)
router.post('/bulk-add', async (req, res) => {
    try {
        const players = req.body; // ✅ FIX: Frontend ab seedha array bhej raha hai jisme adminId pehle se hai
        
        if (!Array.isArray(players) || players.length === 0) {
            return res.status(400).json({ success: false, message: "Invalid data format" });
        }

        // Database mein ek saath saare insert karein
        const savedPlayers = await Player.insertMany(players);
        res.status(201).json({ success: true, count: savedPlayers.length });
    } catch (err) {
        console.error("Bulk Upload Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;