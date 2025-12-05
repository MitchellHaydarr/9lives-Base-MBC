🐾 9Lives — A Gamified Emotional Support Companion

Built on Base · Circle API Integrated · MBC 2025 Submission

9Lives is a gamified emotional-wellness companion where your on-chain cat evolves as you show up for yourself — checking in daily, maintaining streaks, and keeping your digital companion alive.
Designed for the Base track of MBC 2025, the project blends:
	•	🟦 Base L2 smart contracts (Ethereum L2) for cat state & progression
	•	🔵 Circle Sandbox API for USDC balance fetching (bounty requirement)
	•	🐈 Pixel-art animations + gamified mechanics
	•	🔑 MetaMask / Base wallet connection
	•	🎮 Mock mode for smooth demo experience

⸻

🚀 Tracks + Bounty Integrations

🟦 Base Track Integration

9Lives is deployed on Base Sepolia and uses a smart contract (NineLives.sol) to handle:
	•	Cat creation
	•	Check-ins
	•	Streak updates
	•	Evolution state logic
	•	Life system
	•	USDC-based life restoration (ERC-20 payments)

Smart contract address:

0x9Fc40156f69Da680AED43F9A6FE149a2A5B20Bc8

The frontend connects through Ethers.js + MetaMask and interacts directly with the Base network.

⸻

🔵 Circle API Bounty Integration

We implemented the Circle Sandbox Business API in a backend microservice.
This integration fetches a real-time USDC balance from Circle’s sandbox environment and displays it in the app under Settings → Circle Integration.

✔ What we integrated for the Circle bounty:
	•	Circle API Key stored in .env
	•	A Node backend service (circleServer.mjs) that calls:

GET https://api-sandbox.circle.com/v1/businessAccount/balances


	•	The frontend calls our backend:

GET http://localhost:8787/api/circle/balances


	•	USDC balance is rendered in the UI inside a dedicated Circle Integration card

✔ Demonstrates:
	•	Authentication with Circle API keys
	•	Use of Circle Business API
	•	Real sandbox balance retrieval
	•	Clear UI showing Circle-powered data

This satisfies the Circle bounty requirement.

⸻

🛠️ Tech Stack

Smart Contract
	•	Solidity (Hardhat)
	•	Base Sepolia deployment
	•	ERC-20 USDC integration

Frontend
	•	React (Vite)
	•	Ethers.js v6
	•	MetaMask / Base wallet connection
	•	Pixel art animation system

Backend (Circle Integration)
	•	Node.js
	•	Express
	•	Axios
	•	Circle Sandbox Business API

⸻

📦 Project Structure

/src
  /components
  /hooks
  /contracts
  SettingsPage.tsx
circleServer.mjs
.env
/contracts


⸻

▶️ How to Run the Project

1️⃣ Install dependencies

npm install


⸻

2️⃣ Start the Circle Backend

npm run circle:server

Runs on:

http://localhost:8787

Test endpoint:

http://localhost:8787/api/circle/balances


⸻

3️⃣ Start the Frontend

npm run dev

Runs on:

http://localhost:5175

⸻

4️⃣ Connect Wallet

Use MetaMask → Base Sepolia Testnet.

⸻

5️⃣ Use the App
	•	Create your cat
	•	Check in daily
	•	Lose/restore lives
	•	View Circle USDC balance in Settings
	•	Demo mode available for hackathon presentations
