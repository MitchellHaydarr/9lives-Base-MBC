Here is the full polished README.md in one single copy-paste box, exactly how you should submit it for the hackathon:

⸻


# 🐱 9Lives  
A wellness-based digital companion where your cat grows as you stay consistent.

9Lives gamifies daily check-ins. If you show up each day, your cat evolves through four life stages.  
If you miss days, your cat loses lives — and you can revive them using **1 USDC**.

---

## ✨ Features

### 🐾 Cat Companion System
- Create a unique cat linked to your wallet  
- Your cat evolves as your streak grows:
  - **Kitten → Young Cat → Adult Cat → Elder Cat**
- Cats have 9 lives  
- Miss too many days? Lives decrease  
- Restore lives using **1 USDC** on Base Sepolia

### 📅 Streak Tracking
- Check in once every 24 hours  
- Streak increases your cat’s evolution stage  
- Streak resets if you miss a day  

### 🔗 On-Chain Logic
- Smart contract deployed on **Base Sepolia Testnet**  
- Handles:
  - Cat creation  
  - Streak updates  
  - Evolution stage calculation  
  - Life loss  
  - Life restoration payments  
- Transparent & verifiable on BaseScan

---

## 🛠 Tech Stack

**Frontend:** React + Vite + TypeScript  
**UI:** Custom styling (dark + red theme)  
**Wallet Integration:** MetaMask  
**Backend:** Solidity (Hardhat)  
**Network:** Base Sepolia  
**Contract Address:**  

0x9Fc40156f69Da680AED43F9A6FE149a2A5B20Bc8

---

## 🚀 Getting Started

### 1. Install dependencies
```bash
npm install

2. Run the development server

npm run dev

Open your browser:
👉 http://localhost:5173/

⸻

🔌 Wallet Setup (MetaMask)
	1.	Open MetaMask
	2.	Add Network → Base Sepolia Testnet
	3.	Switch to that network
	4.	Connect wallet inside the app
	5.	(Optional) Use a faucet to get Base Sepolia ETH

⸻

📦 Project Structure

src/
  components/
    CatIdleAnimation.tsx
    HeartsDisplay.tsx
    Controls.tsx
    FriendsPage.tsx
    TreasurePage.tsx
    SettingsPage.tsx
  contracts/
    nineLives.ts         # ABI + contract address
  hooks/
    useCat.ts
  Examples/
    contractIntegration.ts
  App.tsx
  main.tsx

contracts/
  NineLives.sol          # Smart contract source

scripts/
  deployNineLives.cjs    # Hardhat deploy script


⸻

🧪 How 9Lives Works Internally

Cat Data Stored On-Chain
	•	lives (0–9)
	•	streak
	•	stage (0–3)
	•	lastCheckIn timestamp
	•	exists flag

Evolution Rules

Streak	Stage
0–2	Kitten
3–6	Young Cat
7–11	Adult Cat
12+	Elder Cat

Life Restoration
	•	Sends 1 USDC from user → treasury
	•	Smart contract updates lives

⸻

🎥 Suggested Demo Flow
	1.	Introduce the app (“your wellness companion cat”)
	2.	Connect wallet
	3.	Create cat
	4.	Demonstrate check-in + streak increment
	5.	Show evolution change
	6.	Lose life (debug button)
	7.	Restore life (USDC flow)
	8.	Show Basescan page with the deployed contract

This creates a clean, polished, easy-to-understand demo.

⸻

🤝 Team

Built for MBC Hackathon 2025.
Created by Mitchell Haydar.

⸻

📜 License

MIT

---

If you want, I can also generate:

✅ A shorter README (judges love concise)  
✅ A more aesthetic README with dividers + ASCII logo  
✅ A README with embedded GIFs or screenshots  
Just say the word.