const express = require('express');
const router = express.Router();
const Team = require('../models/team');
const verifyToken = require('../middleware/authMiddleware'); // ✅ Security guard import kiya

// 1. Register Team (Sirf Admin hi add kar sakta hai)
router.post('/register', verifyToken, async (req, res) => {
    try {
        // Double check: Sirf Admin ko allow karo
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Access Denied: Sirf Admin nayi teams add kar sakta hai!" });
        }

        const { teamName, owner, purse, username, password } = req.body;
        
        const newTeam = new Team({ 
            teamName, 
            owner, 
            purse,
            username,
            password,
            role: 'team',
            players: [], 
            adminId: req.user.id // ✅ Token se Admin ki ID nikal kar database mein save kar di
        });
        
        await newTeam.save();
        res.status(201).json(newTeam);
    } catch (err) {
        res.status(500).json({ message: "Error registering team", error: err.message });
    }
});

// 2. Fetch All Teams (Leaderboard ke liye)
router.get('/all', verifyToken, async (req, res) => {
    try {
        let tournamentAdminId = req.user.id;

        // ✅ SMART LOGIC: Agar Team login hai, toh pehle uska adminId nikalo
        if (req.user.role === 'team') {
            const teamData = await Team.findById(req.user.id);
            if (!teamData) {
                return res.status(404).json({ error: "Team not found" });
            }
            tournamentAdminId = teamData.adminId;
        }

        // Sirf usi tournament/admin ki teams dhoondho
        const teams = await Team.find({ adminId: tournamentAdminId });
        res.status(200).json(teams);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Squads Fetch 
router.get('/squads', verifyToken, async (req, res) => {
    try {
        let tournamentAdminId = req.user.id;

        if (req.user.role === 'team') {
            const teamData = await Team.findById(req.user.id);
            if (!teamData) {
                return res.status(404).json({ error: "Team not found" });
            }
            tournamentAdminId = teamData.adminId;
        }

        const squads = await Team.find({ adminId: tournamentAdminId }); 
        res.status(200).json(squads);
    } catch (err) {
        res.status(500).json({ message: "Squad fetch failed", error: err.message });
    }
});

// 4. Undo Purchase (Sirf Admin kar sakta hai)
router.put('/undo-purchase/:teamId', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Access Denied: Sirf Admin undo purchase kar sakta hai!" });
        }

        const { teamId } = req.params;
        const { playerId, amount } = req.body;

        await Team.findByIdAndUpdate(teamId, {
            $inc: { purse: amount },
            $pull: { players: { _id: playerId } } 
        });

        res.status(200).json({ message: "Purchase undone successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;