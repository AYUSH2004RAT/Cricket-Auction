const express = require('express');
const router = express.Router();
const Team = require('../models/team');
const Admin = require('../models/admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ success: false, message: "Username and Password are required" });
    }
    try {
        const existingAdmin = await Admin.findOne({ username });
        if (existingAdmin) {
            return res.status(400).json({ success: false, message: "Admin username already exists" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newAdmin = new Admin({
            username,
            password: hashedPassword,
            role: 'admin'
        });
        await newAdmin.save();
        res.status(201).json({ success: true, message: "Admin registered successfully" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.post('/login', async (req, res) => {
    const { identifier, password, isAdmin } = req.body;
    if (!identifier || !password) {
        return res.status(400).json({ success: false, message: "Username and Password are required" });
    }
    try {
        let user;
        let adminUsername = identifier;
        if (isAdmin) {
            user = await Admin.findOne({ username: identifier });
        } else {
            user = await Team.findOne({ username: identifier });
            if (user && user.adminId) {
                const adminData = await Admin.findById(user.adminId);
                if (adminData) {
                    adminUsername = adminData.username;
                }
            }
        }
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }
        let isMatch = false;
        if (isAdmin) {
            try {
                isMatch = await bcrypt.compare(password, user.password);
            } catch (compareError) {
                isMatch = false;
            }
            if (!isMatch && user.password === password) {
                isMatch = true;
            }
        } else {
            isMatch = (user.password === password);
        }
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );
        res.status(200).json({
            success: true,
            token: token,
            user: {
                id: user._id,
                username: user.username,
                teamName: user.teamName,
                role: user.role,
                purse: user.purse || 0,
                adminUsername: adminUsername
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;