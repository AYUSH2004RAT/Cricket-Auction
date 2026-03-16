require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const Team = require('./models/team'); 
const Player = require('./models/player');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: "*" },
    maxHttpBufferSize: 1e8 
});

app.use(cors());
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Atlas Connected!"))
    .catch(err => console.log("❌ DB Connection Error:", err));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/players', require('./routes/player'));
app.use('/api/teams', require('./routes/team')); 

const auctionRooms = {}; 

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // 🚪 1. JOIN ROOM LOGIC
    socket.on('joinRoom', (roomName) => {
        if (!roomName) return;
        // ✅ MASTER FIX: Room name ko hamesha lowercase kar do
        const safeRoom = roomName.toLowerCase(); 
        
        socket.join(safeRoom);
        console.log(`📺 User joined room: ${safeRoom}`);

        if (auctionRooms[safeRoom]) {
            socket.emit('newPlayerLive', auctionRooms[safeRoom]);
        }
    });

    // 🚀 2. START AUCTION
    socket.on('startAuction', (data) => {
        if (!data.room) return;
        // ✅ MASTER FIX
        const safeRoom = data.room.toLowerCase(); 

        console.log(`✅ Auction started for: ${data.player.name} in Room: [${safeRoom}]`);
        
        auctionRooms[safeRoom] = {
            player: data.player,
            bid: data.bid || data.player.basePrice,
            bidderName: "Waiting for Bid..."
        };
        
        io.to(safeRoom).emit('newPlayerLive', auctionRooms[safeRoom]);
    });

    // ⚡ 3. BID PLACE LOGIC
    socket.on('placeBid', async (data) => {
        if (!data.room) return;
        const safeRoom = data.room.toLowerCase(); // ✅ MASTER FIX
        
        const currentState = auctionRooms[safeRoom];
        if (!currentState) return;

        if (data.newBid <= currentState.bid) return;

        try {
            const bidderTeam = await Team.findOne({ 
                teamName: { $regex: new RegExp(`^${data.bidderName}$`, 'i') } 
            });

            if (!bidderTeam) return;

            if (bidderTeam.purse < data.newBid) {
                socket.emit('error', { message: "Insufficient Funds!" });
                return;
            }

            currentState.bid = data.newBid;
            currentState.bidderName = data.bidderName;
            
            io.to(safeRoom).emit('updateBid', {
                player: data.player,
                newBid: data.newBid,
                bidderName: data.bidderName
            });

        } catch (err) {
            console.error("Bid Placement Error:", err);
        }
    });

    // 🔨 4. PLAYER SOLD LOGIC
    socket.on('playerSold', async (data) => {
        if (!data.room) return;
        const safeRoom = data.room.toLowerCase(); // ✅ MASTER FIX

        const currentState = auctionRooms[safeRoom];
        const winnerName = data.team || currentState?.bidderName;
        const finalAmount = data.amount || currentState?.bid;

        delete auctionRooms[safeRoom]; 

        if (!winnerName || winnerName === "Waiting for Bid...") return;

        try {
            const winningTeam = await Team.findOne({ 
                teamName: { $regex: new RegExp(`^${winnerName}$`, 'i') } 
            });

            if (!winningTeam) return;
            if (winningTeam.purse < finalAmount) return;

            winningTeam.purse -= finalAmount;
            winningTeam.players.push({
                name: data.player.name,
                role: data.player.role,
                basePrice: data.player.basePrice,
                currentBid: finalAmount,
                status: 'Sold',
                imageUrl: data.player.imageUrl || "" 
            });

            await winningTeam.save();
            
            await Player.findByIdAndUpdate(data.player._id, { 
                status: 'Sold', 
                team: winningTeam.teamName, 
                soldPrice: finalAmount 
            });

            io.to(safeRoom).emit('auctionResult', { 
                status: 'SOLD', 
                player: data.player, 
                winningTeam: winningTeam.teamName, 
                amount: finalAmount 
            });

        } catch (err) {
            console.error("❌ DB ERROR during sale:", err);
        }
    });

    // ❌ 5. PLAYER UNSOLD
    socket.on('playerUnsold', async (data) => {
        if (!data.room) return;
        const safeRoom = data.room.toLowerCase(); // ✅ MASTER FIX

        try {
            await Player.findByIdAndUpdate(data.player._id, { status: 'Unsold' });
            delete auctionRooms[safeRoom]; 
            io.to(safeRoom).emit('auctionResult', { status: 'UNSOLD', player: data.player });
        } catch (err) {
            console.error("❌ DB ERROR (Unsold):", err);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));