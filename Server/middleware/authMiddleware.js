// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // Frontend se header mein token aayega
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
        return res.status(401).json({ error: "Access Denied. No token provided." });
    }

    try {
        // "Bearer xyzToken..." se sirf token nikalna
        const token = authHeader.split(" ")[1]; 
        
        // Token ko verify karna secret key se
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        
        // Verified user ka data (id, role) request mein daal dena
        req.user = verified; 
        next(); // Sab theek hai, ab route ko aage badhne do
    } catch (err) {
        res.status(400).json({ error: "Invalid Token" });
    }
};

module.exports = verifyToken;