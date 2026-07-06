<div align="center">

# 🏏 AuctionPro

### Real-Time IPL-Style Cricket Auction Platform

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Vercel-000?style=for-the-badge&logo=vercel&logoColor=white)](https://cricket-auction-live-phi.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/AYUSH2004RAT/Cricket-Auction)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](./LICENSE)

**Conduct live cricket auctions with real-time bidding, automatic budget tracking, and role-based access — just like the IPL Mega Auction.**

[Live Demo](https://cricket-auction-live-phi.vercel.app) · [Report Bug](https://github.com/AYUSH2004RAT/Cricket-Auction/issues) · [Request Feature](https://github.com/AYUSH2004RAT/Cricket-Auction/issues)

---

![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express_5-000000?style=flat-square&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=flat-square&logo=socketdotio&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)
![Vite](https://img.shields.io/badge/Vite_7-646CFF?style=flat-square&logo=vite&logoColor=white)

</div>

---

## 📋 Table of Contents

- [About the Project](#-about-the-project)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Folder Structure](#-folder-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Screenshots](#-screenshots)
- [API Endpoints](#-api-endpoints)
- [Socket.IO Events](#-socketio-events)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

---

## 🎯 About the Project

**AuctionPro** is a full-stack, real-time cricket auction platform inspired by the IPL Mega Auction. It allows admins to create leagues, register players (via CSV upload or manual entry), onboard teams with custom budgets, and conduct **live auctions** — all with real-time bid synchronization across every connected client.

Built with a **multi-tenant architecture**, each admin's tournament data (players, teams, budgets) is fully isolated, making it perfect for hosting multiple independent cricket leagues simultaneously.

### 🤔 Why AuctionPro?

- **No more spreadsheets** — automate the entire auction workflow
- **Real-time experience** — every bid is broadcast instantly to all participants
- **Production-grade auth** — JWT-based RBAC ensures secure, role-specific access
- **Scalable by design** — multi-tenant data isolation supports unlimited concurrent leagues

---

## ✨ Features

| Category | Feature |
|---|---|
| 🔴 **Real-Time Bidding** | Live bid updates via Socket.IO — every connected client sees bids instantly |
| 🛡️ **Role-Based Access** | 3 distinct roles: **Admin**, **Auctioneer**, **Team Owner** with JWT RBAC |
| 🏢 **Multi-Tenant** | Each admin's data (players, teams, budgets) is fully isolated via `adminId` |
| 📊 **Admin Dashboard** | Create leagues, add players (manual + CSV upload), register teams, set budgets |
| 🎙️ **Live Auction Room** | Countdown timer, current bid display, real-time team budget tracking |
| 📺 **Live Broadcast View** | Spectator-friendly view for audience members to watch the auction live |
| ✅ **Player Tracking** | Automatic Sold/Unsold status updates with winning team & sold price |
| 💰 **Budget Management** | Automatic purse deduction on player sale — prevents over-budget bids |
| 🏆 **Leaderboard** | Real-time team rankings by spending & squad composition |
| 👥 **Squad Viewer** | View each team's purchased players with roles, base price & sold price |
| 📤 **CSV Upload** | Bulk player import via CSV with name, role, base price, phone & photo URL |
| 🖼️ **Cloudinary Integration** | Player image hosting via Cloudinary for rich player cards |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI library with modern hooks & concurrent features |
| **Tailwind CSS 4** | Utility-first CSS framework for rapid styling |
| **Vite 7** | Lightning-fast dev server & build tool |
| **React Router 7** | Client-side routing & navigation |
| **Framer Motion** | Smooth animations & transitions |
| **Socket.IO Client** | Real-time WebSocket communication |
| **Axios** | HTTP client for REST API calls |
| **Lucide React** | Beautiful icon library |
| **PapaParse** | CSV parsing for bulk player uploads |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js** | JavaScript runtime for the server |
| **Express 5** | Web framework for REST API |
| **MongoDB + Mongoose 9** | NoSQL database with ODM |
| **Socket.IO** | Real-time bidirectional event-based communication |
| **JWT (jsonwebtoken)** | Token-based authentication & authorization |
| **bcryptjs** | Password hashing |
| **Cloudinary + Multer** | Image upload & cloud storage |
| **dotenv** | Environment variable management |

### Deployment
| Service | Purpose |
|---|---|
| **Vercel** | Frontend hosting with automatic deployments |
| **Render / Railway** | Backend hosting with WebSocket support |
| **MongoDB Atlas** | Cloud-hosted database |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT (React + Vite)                       │
│   ┌──────────┐  ┌────────────┐  ┌──────────┐  ┌──────────────────┐ │
│   │  Login/  │  │   Admin    │  │ Auction  │  │  Live Broadcast  │ │
│   │ Register │  │ Dashboard  │  │   Room   │  │  / Leaderboard   │ │
│   └────┬─────┘  └─────┬──────┘  └────┬─────┘  └───────┬──────────┘ │
│        │              │              │                 │            │
│        ▼              ▼              ▼                 ▼            │
│   ┌──────────────────────────────────────────────────────────────┐  │
│   │              Axios (REST)  +  Socket.IO (WebSocket)         │  │
│   └──────────────────────────┬───────────────────────────────────┘  │
└──────────────────────────────┼──────────────────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   NGINX / Reverse   │
                    │       Proxy         │
                    └──────────┬──────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│                     SERVER (Node.js + Express)                      │
│                                                                     │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐ │
│   │  REST API    │  │  Socket.IO   │  │  Auth Middleware (JWT)   │ │
│   │  /api/auth   │  │  Real-time   │  │  Role: admin | team      │ │
│   │  /api/players│  │  Bidding     │  │                          │ │
│   │  /api/teams  │  │  Engine      │  │                          │ │
│   └──────┬───────┘  └──────┬───────┘  └──────────────────────────┘ │
│          │                 │                                        │
│          ▼                 ▼                                        │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                 MongoDB Atlas (Multi-Tenant)                │   │
│   │          Data isolated by adminId per document              │   │
│   │   ┌─────────┐  ┌─────────┐  ┌────────┐  ┌───────┐         │   │
│   │   │  Users  │  │ Players │  │ Teams  │  │ Admins│         │   │
│   │   └─────────┘  └─────────┘  └────────┘  └───────┘         │   │
│   └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

- **Multi-Tenant Isolation** — Every `Player` and `Team` document stores an `adminId` field. All queries are scoped by `adminId`, ensuring zero data leakage between leagues.
- **In-Memory Auction State** — Active auction rooms (`auctionRooms`) are held in server memory for ultra-low-latency bid processing. Persistence happens only on sale/unsold events.
- **Dual Communication** — REST APIs handle CRUD operations; Socket.IO handles real-time auction events (bids, results, room sync).

---

## 📁 Folder Structure

```
AuctionPro/
├── Client/                          # Frontend (React + Vite)
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── api/
│   │   │   └── axiosConfig.js       # Axios instance with base URL & interceptors
│   │   ├── assets/                  # Images, icons, static resources
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Global navigation bar
│   │   │   └── AuctionResultOverlay.jsx  # Sold/Unsold result animation overlay
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # React Context for auth state management
│   │   ├── pages/
│   │   │   ├── Login.jsx            # Login page (Admin & Team)
│   │   │   ├── Register.jsx         # Admin registration page
│   │   │   ├── AdminDashboard.jsx   # Admin panel — manage players, teams, auction
│   │   │   ├── AuctionRoom.jsx      # Live auction room with bidding UI
│   │   │   ├── LiveBroadcast.jsx    # Spectator view for live auction
│   │   │   ├── TeamRegistration.jsx # Team onboarding with credentials & budget
│   │   │   ├── Leaderboard.jsx      # Team rankings & spending overview
│   │   │   └── Squads.jsx           # View each team's purchased squad
│   │   ├── App.jsx                  # Root component with route definitions
│   │   ├── main.jsx                 # Entry point
│   │   └── index.css                # Global styles + Tailwind directives
│   ├── index.html                   # HTML template
│   ├── tailwind.config.js           # Tailwind CSS configuration
│   ├── vite.config.js               # Vite build configuration
│   ├── vercel.json                  # Vercel deployment config (SPA rewrites)
│   └── package.json
│
├── Server/                          # Backend (Node.js + Express)
│   ├── middleware/
│   │   └── authMiddleware.js        # JWT verification & role extraction
│   ├── models/
│   │   ├── admin.js                 # Admin schema (username, password, role)
│   │   ├── user.js                  # User schema (name, email, role, budget)
│   │   ├── player.js                # Player schema (name, role, basePrice, adminId, status)
│   │   └── team.js                  # Team schema (teamName, purse, players[], adminId)
│   ├── routes/
│   │   ├── auth.js                  # Auth routes — register, login, token refresh
│   │   ├── player.js                # Player CRUD — add, list, CSV upload, update status
│   │   └── team.js                  # Team CRUD — create, list, update purse
│   ├── server.js                    # Express app + Socket.IO auction engine
│   ├── .env                         # Environment variables (not committed)
│   └── package.json
│
├── .gitignore
└── README.md                        # ← You are here
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js** ≥ 18.x — [Download](https://nodejs.org/)
- **npm** ≥ 9.x (comes with Node.js)
- **MongoDB Atlas** account — [Sign up](https://www.mongodb.com/atlas) (or local MongoDB)
- **Git** — [Download](https://git-scm.com/)

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/AYUSH2004RAT/Cricket-Auction.git
cd Cricket-Auction
```

**2. Setup the Backend**

```bash
cd Server
npm install
```

Create a `.env` file in the `Server/` directory (see [Environment Variables](#-environment-variables)):

```bash
cp .env.example .env
# Edit .env with your credentials
```

Start the server:

```bash
node server.js
```

> The server will start on `http://localhost:5000`

**3. Setup the Frontend**

```bash
cd ../Client
npm install
```

Update the API base URL in `src/api/axiosConfig.js` to point to your local backend:

```js
const API = axios.create({
  baseURL: 'http://localhost:5000/api'
});
```

Start the dev server:

```bash
npm run dev
```

> The client will start on `http://localhost:5173`

**4. Open in Browser**

Navigate to `http://localhost:5173` — Register as an admin, create teams, add players, and start your first auction! 🎉

---

## 🔐 Environment Variables

Create a `.env` file inside the `Server/` directory with the following variables:

| Variable | Description | Example |
|---|---|---|
| `PORT` | Port number for the Express server | `5000` |
| `MONGO_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/auctionpro` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `your_super_secret_key_here` |

### `.env.example`

```env
# Server Configuration
PORT=5000

# MongoDB Atlas Connection
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=your_jwt_secret_key_here
```

> ⚠️ **Never commit your `.env` file.** Make sure it's listed in `.gitignore`.

---

## 📸 Screenshots

> _Screenshots coming soon! The app features a dark-themed, modern UI with glassmorphism effects and smooth animations._

<div align="center">

| Page | Preview |
|---|---|
| 🔐 Login | ![Login Page](#) |
| 📊 Admin Dashboard | ![Admin Dashboard](#) |
| 🎙️ Auction Room | ![Auction Room](#) |
| 📺 Live Broadcast | ![Live Broadcast](#) |
| 🏆 Leaderboard | ![Leaderboard](#) |
| 👥 Squads | ![Squads](#) |

</div>

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new admin | ❌ |
| `POST` | `/api/auth/login` | Login (Admin or Team) | ❌ |

### Players

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/players/:adminId` | Get all players for a league | ✅ |
| `POST` | `/api/players` | Add a player | ✅ Admin |
| `POST` | `/api/players/csv` | Bulk upload players via CSV | ✅ Admin |
| `PUT` | `/api/players/:id` | Update player status | ✅ Admin |

### Teams

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/teams/:adminId` | Get all teams for a league | ✅ |
| `POST` | `/api/teams` | Create a new team | ✅ Admin |
| `PUT` | `/api/teams/:id` | Update team details | ✅ Admin |
| `DELETE` | `/api/teams/:id` | Delete a team | ✅ Admin |

---

## ⚡ Socket.IO Events

### Client → Server

| Event | Payload | Description |
|---|---|---|
| `joinRoom` | `roomName: string` | Join an auction room |
| `startAuction` | `{ room, player, bid }` | Start auction for a player |
| `placeBid` | `{ room, player, newBid, bidderName }` | Place a bid |
| `playerSold` | `{ room, player, team, amount }` | Mark player as sold |
| `playerUnsold` | `{ room, player }` | Mark player as unsold |

### Server → Client

| Event | Payload | Description |
|---|---|---|
| `newPlayerLive` | `{ player, bid, bidderName }` | New player up for auction |
| `updateBid` | `{ player, newBid, bidderName }` | Bid update broadcast |
| `auctionResult` | `{ status, player, winningTeam?, amount? }` | Sold/Unsold result |
| `error` | `{ message }` | Error notification (e.g., insufficient funds) |

---

## 🤝 Contributing

Contributions make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. **Fork** the repository
2. **Create** your feature branch
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit** your changes
   ```bash
   git commit -m "feat: add amazing feature"
   ```
4. **Push** to the branch
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open** a Pull Request

### 💡 Contribution Ideas

- [ ] Add Auctioneer role with dedicated UI
- [ ] Implement RTL (Right-to-Left) bidding countdown timer
- [ ] Add player statistics & analytics dashboard
- [ ] Implement auction history & replay
- [ ] Add notification sounds for bids
- [ ] Mobile-responsive auction room redesign
- [ ] Add unit & integration tests

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for more information.

```
MIT License

Copyright (c) 2026 Ayush

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 📬 Contact

**Ayush** — [@AYUSH2004RAT](https://github.com/AYUSH2004RAT)

Project Link: [https://github.com/AYUSH2004RAT/Cricket-Auction](https://github.com/AYUSH2004RAT/Cricket-Auction)

---

<div align="center">

**⭐ If you found this project useful, please consider giving it a star!**

Made with ❤️ and 🏏

</div>
