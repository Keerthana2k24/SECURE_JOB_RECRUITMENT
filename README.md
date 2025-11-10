# Secure Job Recruitment through Blockchain Document Verification 

This project implements a **decentralized, tamper-proof solution** for verifying candidate documents during recruitment using **Ethereum smart contracts**, **MetaMask wallet integration**, **Node.js backend**, and a **MySQL database**.  
It allows upload and verification of document hashes securely and maintains a transaction ledger for audit and accountability.

---

## Features
- Secure document hash upload and verification on the Ethereum blockchain  
- MetaMask wallet authentication for users  
- Backend API logging using Node.js and Express  
- MySQL database transaction ledger  
- Simple, responsive frontend interface  

## Technologies Used
- **Frontend:** JavaScript, Web3.js, CryptoJS, MetaMask, HTML, CSS  
- **Backend:** Node.js, Express.js, MySQL, mysql2/promise  
- **Blockchain:** Solidity, Truffle Suite, Ethereum (Sepolia Testnet / Alchemy)  
- **Storage:** MySQL (transaction log)

## Prerequisites
- [Node.js & npm](https://nodejs.org/)  
- [MySQL Community Server](https://dev.mysql.com/downloads/mysql/)  
- [MetaMask Browser Extension](https://metamask.io/)  
- [Visual Studio Code](https://code.visualstudio.com/)  
- [Truffle Suite](https://trufflesuite.com/)  
- [Alchemy](https://www.alchemy.com/) or Sepolia Testnet Access  


## Setup and Execution Guide

### Clone the Repository
```
git clone <your-github-repo-url>
cd <project-directory>
 ```
### Install Backend Dependencies
```
cd backend
npm install
```
### Configure MySQL Database
```
Start your MySQL server.
Create the database and table:

CREATE DATABASE job_verification;
USE job_verification;
CREATE TABLE transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type VARCHAR(20),
  user_address VARCHAR(100),
  document_hash VARCHAR(256),
  transaction_hash VARCHAR(256),
  verified BOOLEAN,
  error_msg TEXT,
  block_number INT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
Update backend/server.js with your MySQL credentials.
```
### Compile and Deploy Smart Contract
```
cd contracts
truffle compile
truffle migrate --network sepolia
Update your frontend with the contract address and ABI.
```

### Start Backend Server
```
cd backend
node server.js
Backend will run at http://localhost:5000
```

### Setup Frontend
- Open the project folder in VS Code.
- Use the Live Server extension or any static server to host index.html in the frontend folder.

### Connect MetaMask
- Add Sepolia Testnet to MetaMask.
- Fund your wallet with test ETH if needed.

### Run and Test the Application
- Open the hosted frontend in your browser.
- Connect your MetaMask wallet when prompted.
- Upload or verify a document.
- Check ledger updates and blockchain transaction status.
- Backend will store transaction logs; view them in MySQL for history/audit.

### Usage
- Connect Wallet: Start the app and connect MetaMask to authenticate.

- Upload Document: Select a file; its hash is computed and sent to the blockchain.

- Verify Document: Select a file to check if its hash exists on the blockchain.

- View Ledger: The backend displays all uploads/verifications for audit.

## Folder Structure
```
JOB-RECRUITMENT-SYSTEM FINAL/
│
├── .dist/
├── .vscode/
├── backend/
│   ├── node_modules/
│   ├── package-lock.json
│   ├── package.json
│   ├── server.js
│   ├── build/
│   │   └── contracts/
│   │       └── DocumentVerification.json
│   └── contracts/
│       └── DocumentVerification.sol
├── frontend/
│   ├── app.js
│   ├── index.html
│   └── style.css
├── migrations/
│   └── 1_deploy_contracts.js
│
├── node_modules/
├── .env
├── package-lock.json
├── package.json
└── truffle-config.js
```
## Documentation
The detailed project report, including architecture, workflow, and SQL integration,
is available at (./Documentation/Secure_Job_Recruitment_Report.pdf).
### References
- [Ethereum Documentation](https://ethereum.org/en/developers/docs/)  
- [MetaMask Documentation](https://docs.metamask.io/)  
- [Truffle Suite Documentation](https://trufflesuite.com/docs/)  
- [MySQL Documentation](https://dev.mysql.com/doc/)  
- [Alchemy Platform](https://www.alchemy.com/)  
