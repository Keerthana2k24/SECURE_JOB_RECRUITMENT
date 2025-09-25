// app.js (client-side)
let web3;
let contract;
let userAccount;
let contractArtifact;

const backendURL = 'http://localhost:5000';

async function loadContractArtifact() {
  try {
    const response = await fetch('/build/contracts/DocumentVerification.json');
    if (!response.ok) throw new Error('Failed to load contract artifact');
    contractArtifact = await response.json();
  } catch (err) {
    console.error('Error loading contract artifact:', err);
    alert('Failed to load smart contract information. Check console.');
  }
}

window.onload = async () => {
  await loadContractArtifact();

  document.getElementById("connectWalletBtn").onclick = connectWallet;
  document.getElementById("uploadBtn").onclick = uploadDocument;
  document.getElementById("verifyBtn").onclick = verifyDocument;

  refreshLedger();
  setInterval(refreshLedger, 10000); // Refresh ledger every 10s
};

async function connectWallet() {
  if (!window.ethereum) {
    alert("MetaMask not detected!");
    return;
  }
  try {
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    userAccount = accounts[0];
    web3 = new Web3(window.ethereum);

    const balanceWei = await web3.eth.getBalance(userAccount);
    const balanceEth = web3.utils.fromWei(balanceWei, "ether");
    document.getElementById("walletInfo").innerText = `Connected: ${userAccount} | Balance: ${balanceEth} ETH`;

    const networkId = await web3.eth.net.getId();
    const deployedNetwork = contractArtifact.networks[networkId];
    if (!deployedNetwork) {
      alert('Smart contract not deployed on the detected network.');
      return;
    }
    contract = new web3.eth.Contract(contractArtifact.abi, deployedNetwork.address);

    document.getElementById("uploadBtn").disabled = false;
    document.getElementById("verifyBtn").disabled = false;
  } catch (error) {
    alert("Failed to connect wallet: " + (error.message || error));
  }
}

// Convert arrayBuffer -> CryptoJS WordArray
function arrayBufferToWordArray(ab) {
  const u8 = new Uint8Array(ab);
  const words = [];
  for (let i = 0; i < u8.length; i += 4) {
    words.push(
      ((u8[i] << 24) | ((u8[i + 1] || 0) << 16) | ((u8[i + 2] || 0) << 8) | ((u8[i + 3] || 0))) >>> 0
    );
  }
  return CryptoJS.lib.WordArray.create(words, u8.length);
}

function getFileHash(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function () {
      try {
        const wordArray = arrayBufferToWordArray(reader.result);
        const hash = CryptoJS.SHA256(wordArray).toString(CryptoJS.enc.Hex);
        resolve(hash);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

async function logTransaction(log) {
  try {
    const payload = {
      type: log.type || null,
      user_address: log.from || log.user_address || null,
      document_hash: log.documentHash || log.document_hash || null,
      transaction_hash: log.transactionHash || log.transaction_hash || null,
      block_number: log.blockNumber || log.block_number || null,
      verified: typeof log.verified !== "undefined" ? (log.verified ? 1 : 0) : null,
      error_msg: log.error || log.error_msg || null,
      timestamp: log.timestamp || new Date().toISOString(),
    };

    console.log("👉 Sending to backend:", payload);

    const resp = await fetch(`${backendURL}/logTransaction`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error("❌ Backend error:", resp.status, errText);
    } else {
      const j = await resp.json();
      console.log("✅ Backend response:", j);
    }
  } catch (err) {
    console.error("❌ Logging failed:", err);
  }
}

async function uploadDocument() {
  if (!contract) {
    alert("Please connect MetaMask wallet first.");
    return;
  }
  const fileInput = document.getElementById("uploadFile");
  if (!fileInput.files.length) {
    alert("Please choose a file to upload");
    return;
  }

  const file = fileInput.files[0];
  try {
    const hash = await getFileHash(file);
    const hashHex = "0x" + hash;

    const receipt = await contract.methods
      .uploadDocument(hashHex)
      .send({ from: userAccount, gas: 300000 });

    document.getElementById("uploadStatus").innerText =
      "✅ Document hash uploaded successfully!";

    // 🔥 log upload with verified=1
    await logTransaction({
       type: "upload",
      from: userAccount,
      documentHash: hashHex,
      transactionHash: receipt.transactionHash,
      verified: 1,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Upload error:", error);
    document.getElementById("uploadStatus").innerText =
      "Upload failed or hash exists: " + (error.message || error);

    await logTransaction({
      type: "upload_failed",
      from: userAccount,
      error: error.message || String(error),
      verified: 0,
      timestamp: new Date().toISOString(),
    });
  }
}


async function verifyDocument() {
  if (!contract) {
    alert("Please connect MetaMask wallet first.");
    return;
  }
  const fileInput = document.getElementById("verifyFile");
  if (!fileInput.files.length) {
    alert("Please choose a file to verify");
    return;
  }

  const file = fileInput.files[0];
  try {
    const hash = await getFileHash(file);
    const hashHex = "0x" + hash;
    const exists = await contract.methods.verifyDocument(hashHex).call();

    document.getElementById("verifyStatus").innerText = exists ? "Verified ✅" : "Not Verified ❌";

    await logTransaction({
      type: 'verify',
      from: userAccount,
      documentHash: hashHex,
      verified: exists ? 1 : 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Verify error:", error);
    document.getElementById("verifyStatus").innerText =
      "Verification failed: " + (error.message || error);

    await logTransaction({
      type: 'verify_failed',
      from: userAccount,
      error: error.message || String(error),
      verified: 0,
      timestamp: new Date().toISOString(),
    });
  }
}

async function refreshLedger() {
  try {
    const response = await fetch(`${backendURL}/logs`);
    if (!response.ok) {
      console.error('Failed to fetch logs:', response.status);
      return;
    }
    const logs = await response.json();
    const tbody = document.getElementById('ledgerBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!Array.isArray(logs) || logs.length === 0) {
      tbody.innerHTML =
        `<tr><td colspan="5" style="text-align:center;">No transactions logged yet.</td></tr>`;
      return;
    }

    logs.forEach(log => {
      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid #d3126b';

      let verifiedDisplay = '-';
      if (log.type === 'verify') {
        verifiedDisplay = log.verified ? 'Yes' : 'No';
      } else if (log.type === 'upload') {
        verifiedDisplay = 'Uploaded';
      } else if (log.type === 'upload_failed') {
        verifiedDisplay = 'Upload Failed';
      } else if (log.type === 'verify_failed') {
        verifiedDisplay = 'Verify Failed';
      }

      const txHashDisplay = log.transaction_hash
        ? log.transaction_hash.slice(0, 10) + '...'
        : '-';
      const fromShort = log.user_address
        ? log.user_address.slice(0, 6) + '...' + log.user_address.slice(-4)
        : '-';
      const timestampStr = log.timestamp
        ? new Date(log.timestamp).toLocaleString()
        : '-';

      tr.innerHTML = `
        <td style="padding:8px;">${log.type}</td>
        <td style="padding:8px;">${fromShort}</td>
        <td style="padding:8px;">${txHashDisplay}</td>
        <td style="padding:8px;">${verifiedDisplay}</td>
        <td style="padding:8px;">${timestampStr}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Failed to load ledger:", err);
  }
}
