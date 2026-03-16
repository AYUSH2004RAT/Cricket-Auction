const express = require('express');
const router = express.Router();
const Team = require('../models/team');
const Admin = require('../models/admin'); 
const jwt = require('jsonwebtoken');

router.post('/login', async (req, res) => {
    const { identifier, password, isAdmin } = req.body;

    // Basic Validation
    if (!identifier || !password) {
        return res.status(400).json({ success: false, message: "Username and Password are required" });
    }

    try {
        let user;
        let adminUsername = identifier; // ✅ NAYA: Room ka naam save karne ke liye (default admin ka khud ka username)

        if (isAdmin) {
            // Atlas ke 'admins' collection mein check karega
            user = await Admin.findOne({ username: identifier });
        } else {
            // Atlas ke 'teams' collection mein 'username' field check karega
            user = await Team.findOne({ username: identifier });
            
            // ✅ NAYA LOGIC: Agar team login kar rahi hai, toh uske Admin ka username nikalo (Room set karne ke liye)
            if (user && user.adminId) {
                const adminData = await Admin.findById(user.adminId);
                if (adminData) {
                    adminUsername = adminData.username;
                }
            }
        }

        // Credentials Check
        if (!user || user.password !== password) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        // Token Generation
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );

        // ✅ FINAL FIX: Yahan 'adminUsername' bhej rahe hain taaki Frontend sahi Socket Room join kar sake
        res.status(200).json({
            success: true,
            token: token,
            user: {
                id: user._id,
                username: user.username,     // e.g., "Sujal"
                teamName: user.teamName,     // e.g., "Sujal X1"
                role: user.role,             // "admin" ya "team"
                purse: user.purse || 0,      // Purse balance for teams
                adminUsername: adminUsername // 🔥 NAYA: Ye Room Code banega Frontend ke liye
            }
        });

    } catch (err) {
        console.error("Backend Auth Error:", err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;