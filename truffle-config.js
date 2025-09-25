const HDWalletProvider = require('@truffle/hdwallet-provider');

// Replace with your MetaMask wallet mnemonic (keep it secure!)
const mnemonic = 'd0d4dc5d0e29ae3bf7a2ece3bde7a65ba6cdea51d9ba0f9c9586b007dd1ba971';

// Replace with your Sepolia RPC URL (e.g., from Infura or Alchemy)
const sepoliaRpcUrl = 'https://eth-sepolia.g.alchemy.com/v2/-kiQeSJuO5_rfrSwShe6e';

module.exports = {
  networks: {
    sepolia: {
      provider: () => new HDWalletProvider(mnemonic, sepoliaRpcUrl),
      network_id: 11155111, // Sepolia network id
      gas: 6000000,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
    }
  },
  compilers: {
    solc: {
      version: "0.8.20"
    }
  }
};
