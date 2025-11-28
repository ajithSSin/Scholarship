// Viem + React frontend for Scholarship contract (Vite + React + Tailwind)
// ---------------------------------------------------------------
// Setup (run in your project):
// npm init vite@latest my-dapp -- --template react
// cd my-dapp
// npm install
// npm install viem @wagmi/core @walletconnect/web3-provider
// npm install -D tailwindcss postcss autoprefixer && npx tailwindcss init -p
// Add Tailwind to your CSS per Tailwind docs.
//
// Usage:
//  - Replace CONTRACT_ADDRESS and scholarshipAbi with your compiled ABI and deployed address.
//  - This component uses the browser's injected wallet (window.ethereum / MetaMask).
//  - Admin must fund the contract (use the Deposit UI) before calling selectTopApplicants.
//
// Notes & caveats:
//  - This example uses viem's public and wallet clients via the `custom(window.ethereum)` transport
//    which works with most injected wallets (MetaMask). Some providers might not support all RPC
//    methods (see provider docs).
//  - For production, configure a robust public RPC provider (alchemy/infura/your node) for reads.

import React, { useEffect, useState } from 'react';
import {
  createPublicClient,
  createWalletClient,
  custom,
  parseEther,
  formatEther,
} from 'viem';
// If you have typed chains available you can import them from 'viem/chains'
// import { mainnet } from 'viem/chains'

// Minimal ABI (only the functions/events we use). Replace/add fields from your real ABI.
const scholarshipAbi = [
  {
    "inputs": [{ "internalType": "uint256", "name": "_scholarshipId", "type": "uint256" }],
    "name": "getApplications",
    "outputs": [{ "components": [
      { "internalType": "address", "name": "applicant", "type": "address" },
      { "internalType": "string", "name": "studentName", "type": "string" },
      { "internalType": "string", "name": "regNumber", "type": "string" },
      { "internalType": "string", "name": "college", "type": "string" },
      { "internalType": "string", "name": "course", "type": "string" },
      { "internalType": "uint8", "name": "attendancePercent", "type": "uint8" },
      { "internalType": "uint8", "name": "academicMark", "type": "uint8" },
      { "internalType": "uint8", "name": "score", "type": "uint8" },
      { "internalType": "bool", "name": "received", "type": "bool" }
    ], "internalType": "struct Application[]", "name": "", "type": "tuple[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_scholarshipId", "type": "uint256" }],
    "name": "selectTopApplicants",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "scholarshipCounter",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];

const CONTRACT_ADDRESS = '0xREPLACE_WITH_YOUR_CONTRACT_ADDRESS';

export default function ScholarshipDapp() {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [publicClient, setPublicClient] = useState(null);
  const [walletClient, setWalletClient] = useState(null);
  const [balance, setBalance] = useState('0');
  const [scholarshipId, setScholarshipId] = useState('1');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [depositValue, setDepositValue] = useState('0.01');

  // Connect to injected wallet (MetaMask)
  async function connectWallet() {
    if (!window.ethereum) {
      alert('No injected wallet found. Install MetaMask.');
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const acct = accounts[0];
      setAccount(acct);

      const chain = await window.ethereum.request({ method: 'eth_chainId' });
      const cid = parseInt(chain, 16);
      setChainId(cid);

      // create viem clients using the injected provider via custom transport
      const transport = custom(window.ethereum);
      const pClient = createPublicClient({ transport, /* chain: optional chain object */ });
      const wClient = createWalletClient({ transport, account: acct /*, chain: optional */ });

      setPublicClient(pClient);
      setWalletClient(wClient);

      await fetchContractBalance(pClient);

      // listen to account/chain changes
      window.ethereum.on('accountsChanged', (accs) => {
        setAccount(accs[0] || null);
      });
      window.ethereum.on('chainChanged', (hexChainId) => {
        setChainId(parseInt(hexChainId, 16));
      });

    } catch (err) {
      console.error('Wallet connect error', err);
      alert('Connection failed: ' + (err.message || err));
    }
  }

  async function fetchContractBalance(pClient = publicClient) {
    try {
      if (!pClient) return;
      const bal = await pClient.getBalance({ address: CONTRACT_ADDRESS });
      setBalance(formatEther(bal));
    } catch (err) {
      console.error(err);
    }
  }

  async function depositToContract() {
    if (!walletClient) return alert('Connect wallet first');
    try {
      setLoading(true);
      const value = parseEther(depositValue);
      const txHash = await walletClient.sendTransaction({
        to: CONTRACT_ADDRESS,
        value,
      });
      // wait for confirmation using publicClient (if available)
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash: txHash });
      }
      await fetchContractBalance();
      alert('Deposit successful: ' + txHash);
    } catch (err) {
      console.error(err);
      alert('Deposit failed: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  }

  async function fetchApplications() {
    if (!publicClient) return alert('Connect wallet first');
    try {
      setLoading(true);
      // publicClient.readContract
      const apps = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: scholarshipAbi,
        functionName: 'getApplications',
        args: [BigInt(Number(scholarshipId))],
      });

      // apps is an array of tuples matching the Application struct. Map to object form.
      const normalized = apps.map((a) => ({
        applicant: a[0],
        studentName: a[1],
        regNumber: a[2],
        college: a[3],
        course: a[4],
        attendancePercent: Number(a[5]),
        academicMark: Number(a[6]),
        score: Number(a[7]),
        received: Boolean(a[8]),
      }));

      // client-side sort: highest score first
      normalized.sort((x, y) => y.score - x.score);
      setApplications(normalized);

    } catch (err) {
      console.error(err);
      alert('Failed to fetch applications: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  }

  async function callSelectTopApplicants() {
    if (!walletClient) return alert('Connect wallet first');
    try {
      setLoading(true);
      const txHash = await walletClient.writeContract({
        account: account,
        address: CONTRACT_ADDRESS,
        abi: scholarshipAbi,
        functionName: 'selectTopApplicants',
        args: [BigInt(Number(scholarshipId))],
      });
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash: txHash });
      }
      alert('selectTopApplicants executed: ' + txHash);
      // refresh list
      await fetchApplications();
      await fetchContractBalance();
    } catch (err) {
      console.error(err);
      alert('Call failed: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (publicClient) fetchContractBalance(publicClient);
  }, [publicClient]);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Scholarship Manager (viem)</h1>

      <div className="mb-4">
        {account ? (
          <div>
            <div className="mb-2">Connected: <strong>{account}</strong></div>
            <div>ChainId: {chainId}</div>
          </div>
        ) : (
          <button onClick={connectWallet} className="px-4 py-2 rounded bg-blue-600 text-white">Connect Wallet</button>
        )}
      </div>

      <div className="mb-6 p-4 border rounded">
        <div className="mb-2">Contract balance: <strong>{balance} ETH</strong></div>

        <div className="flex items-center gap-2">
          <input className="p-2 border rounded" value={depositValue} onChange={(e)=>setDepositValue(e.target.value)} />
          <button onClick={depositToContract} disabled={loading} className="px-3 py-2 rounded bg-green-600 text-white">Deposit to contract</button>
        </div>
        <div className="text-sm text-gray-600 mt-2">This sends native ETH to the contract address using the connected wallet.</div>
      </div>

      <div className="mb-4 p-4 border rounded">
        <label className="block mb-2">Scholarship ID</label>
        <input value={scholarshipId} onChange={(e)=>setScholarshipId(e.target.value)} className="p-2 border rounded w-24" />
        <div className="mt-3 flex gap-2">
          <button onClick={fetchApplications} className="px-3 py-2 rounded bg-indigo-600 text-white">Fetch Applications</button>
          <button onClick={callSelectTopApplicants} className="px-3 py-2 rounded bg-red-600 text-white">selectTopApplicants (admin)</button>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold">Applications (sorted by score)</h2>
        {loading ? <div>Loading...</div> : (
          <table className="w-full table-auto mt-2 border-collapse">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">#</th>
                <th>Name</th>
                <th>Score</th>
                <th>Received</th>
                <th>Applicant</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((a, idx) => (
                <tr key={idx} className="border-b">
                  <td className="py-2">{idx+1}</td>
                  <td>{a.studentName} ({a.college})</td>
                  <td>{a.score}</td>
                  <td>{a.received ? 'Yes' : 'No'}</td>
                  <td className="text-sm">{a.applicant}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
