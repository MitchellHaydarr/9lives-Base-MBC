# 9Lives Backend - Smart Contract Documentation

## Overview

The 9Lives backend consists of a Solidity smart contract deployed on Base Sepolia that manages virtual cats with lives, streaks, and evolution stages. The contract integrates with USDC for life restoration payments.

## Features

- **Cat Management**: Each wallet can create and manage one virtual cat
- **Daily Check-ins**: Maintain streaks and evolve your cat
- **Life System**: Cats have 0-9 lives
- **USDC Integration**: Restore lives by paying 1 USDC
- **Evolution Stages**: Cats evolve through 4 stages based on streak

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:
- `PRIVATE_KEY`: Your wallet's private key (without 0x prefix)
- `TREASURY_ADDRESS`: Address to receive USDC payments
- `BASE_SEPOLIA_RPC_URL`: RPC endpoint (default provided)
- `USDC_ADDRESS`: USDC token address on Base Sepolia (default provided)

### 3. Compile Contracts

```bash
npm run compile
```

### 4. Deploy to Base Sepolia

```bash
npm run deploy
```

Or for local testing:

```bash
npm run node        # Start local Hardhat node
npm run deploy:local # Deploy to local network
```

## Smart Contract Architecture

### Contract: NineLives.sol

#### Data Structure

```solidity
struct Cat {
    uint8 lives;        // Current lives (0-9)
    uint16 streak;      // Daily check-in streak
    uint8 stage;        // Evolution stage (0-3)
    uint64 lastCheckIn; // Last check-in timestamp
    bool exists;        // Whether cat has been created
}
```

#### Main Functions

- **createCat()**: Initialize a new cat with 9 lives
- **checkIn()**: Daily check-in to maintain streak
- **getCat(address)**: View cat data for any address
- **restoreLife()**: Pay 1 USDC to restore one life
- **loseLife(address)**: Decrease lives (MVP version - user controlled)
- **hasCat(address)**: Check if address has created a cat
- **timeUntilNextCheckIn(address)**: Get seconds until next check-in allowed

#### Evolution Logic

Cats evolve based on streak milestones:
- Stage 0: Streak 0-2 (Kitten)
- Stage 1: Streak 3-6 (Young Cat)
- Stage 2: Streak 7-11 (Adult Cat)
- Stage 3: Streak 12+ (Elder Cat)

## Frontend Integration

### Quick Start

```typescript
import { ethers } from 'ethers';
import NineLivesABI from './contracts/NineLives.abi.json';
import addresses from './contracts/addresses.json';

// Connect to contract
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const contract = new ethers.Contract(
  addresses.NineLives,
  NineLivesABI,
  signer
);

// Create a cat
await contract.createCat();

// Daily check-in
await contract.checkIn();

// Restore life (requires USDC approval first)
const usdcContract = new ethers.Contract(addresses.USDC, usdcABI, signer);
await usdcContract.approve(addresses.NineLives, ethers.parseUnits('1', 6));
await contract.restoreLife();
```

See `src/examples/contractIntegration.ts` for complete integration examples.

## Testing

### Local Development

1. Start local Hardhat node:
```bash
npm run node
```

2. Deploy contracts locally:
```bash
npm run deploy:local
```

3. Run tests:
```bash
npm test
```

### Base Sepolia Testing

1. Get test ETH from [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)

2. Get test USDC:
   - Bridge from Ethereum Sepolia using [Base Bridge](https://bridge.base.org/)
   - Or use a testnet USDC faucet if available

3. Deploy and interact:
```bash
npm run deploy
```

## Contract Addresses (Base Sepolia)

After deployment, addresses are saved to:
- `deployments/NineLives_baseSepolia.json` - Full deployment info
- `src/contracts/addresses.json` - For frontend use
- `src/contracts/NineLives.abi.json` - Contract ABI

### USDC on Base Sepolia
Official USDC address: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`

## Events

The contract emits these events for frontend monitoring:

- `CatCreated(address indexed owner)`
- `CheckedIn(address indexed owner, uint16 streak, uint8 stage)`
- `LifeLost(address indexed owner, uint8 lives)`
- `LifeRestored(address indexed owner, uint8 lives)`

## Security Considerations

- Private keys should NEVER be committed to version control
- Use hardware wallets for mainnet deployments
- The current `loseLife` function is user-controlled for MVP - implement proper game logic for production
- Consider implementing a timelock or admin controls for treasury management
- Add reentrancy guards if extending functionality

## Gas Optimization

The contract is optimized for gas efficiency:
- Uses uint8/uint16/uint64 for storage packing
- Immutable variables for USDC and treasury addresses
- Efficient struct packing in Cat structure

## Future Improvements

- [ ] Automated life loss based on inactivity
- [ ] NFT representation of cats
- [ ] Breeding mechanics
- [ ] More complex evolution system
- [ ] Achievement system
- [ ] Multi-chain deployment

## Support

For issues or questions about the smart contract backend:
1. Check the example integration code in `src/examples/`
2. Review the deployment logs in `deployments/`
3. Verify contract on BaseScan for easier debugging

## License

MIT
