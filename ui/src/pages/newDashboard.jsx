import { useState , useEffect} from "react";
import { 
    createWalletClient, 
    createPublicClient,
    custom ,
    http,
    parseEther,
    // Import everything needed directly from the main viem package
    
} 
from "viem";
import {hardhat}from "viem/chains"
import { writeContract } from "viem/actions"; // Keeping this specific import for clarity, but ideally all are from 'viem'

// --- Mock Contract ABI and Address ---
// NOTE: Since external JSON files (./Scholarship.json) cannot be resolved, 
// we must define a mock object here containing the contract address and a minimal ABI.
// !!! REPLACE '0xYourContractAddressHere' with the actual deployed address !!!
const scholarship = {
    
     // Placeholder address
    ContractAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    abi: [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "scholarshipId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "student",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "score",
          "type": "uint8"
        }
      ],
      "name": "Applied",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "scholarshipId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "student",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "Disbursed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "title",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "ScholarshipCreated",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_title",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "_amount",
          "type": "uint256"
        },
        {
          "internalType": "uint8",
          "name": "_minScore",
          "type": "uint8"
        },
        {
          "internalType": "uint8",
          "name": "_totalSeats",
          "type": "uint8"
        },
        {
          "internalType": "uint8",
          "name": "_requiredAttendance",
          "type": "uint8"
        },
        {
          "internalType": "uint8",
          "name": "_requiredAcademic",
          "type": "uint8"
        }
      ],
      "name": "addScholarship",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "admin",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_scholarshipId",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "_studentName",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_regNumber",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_college",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_course",
          "type": "string"
        },
        {
          "internalType": "uint8",
          "name": "_attendancePercent",
          "type": "uint8"
        },
        {
          "internalType": "uint8",
          "name": "_academicMark",
          "type": "uint8"
        }
      ],
      "name": "applyForScholarship",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        }
      ],
      "name": "getApplicationCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_scholarshipId",
          "type": "uint256"
        }
      ],
      "name": "getApplications",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "applicant",
              "type": "address"
            },
            {
              "internalType": "string",
              "name": "studentName",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "regNumber",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "college",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "course",
              "type": "string"
            },
            {
              "internalType": "uint8",
              "name": "attendancePercent",
              "type": "uint8"
            },
            {
              "internalType": "uint8",
              "name": "academicMark",
              "type": "uint8"
            },
            {
              "internalType": "uint8",
              "name": "score",
              "type": "uint8"
            },
            {
              "internalType": "bool",
              "name": "received",
              "type": "bool"
            }
          ],
          "internalType": "struct scholarship.Application[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_scholarshipId",
          "type": "uint256"
        }
      ],
      "name": "getSelectedApplicants",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "applicant",
              "type": "address"
            },
            {
              "internalType": "string",
              "name": "studentName",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "regNumber",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "college",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "course",
              "type": "string"
            },
            {
              "internalType": "uint8",
              "name": "attendancePercent",
              "type": "uint8"
            },
            {
              "internalType": "uint8",
              "name": "academicMark",
              "type": "uint8"
            },
            {
              "internalType": "uint8",
              "name": "score",
              "type": "uint8"
            },
            {
              "internalType": "bool",
              "name": "received",
              "type": "bool"
            }
          ],
          "internalType": "struct scholarship.Application[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "hasApplied",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "scholarshipApplications",
      "outputs": [
        {
          "internalType": "address",
          "name": "applicant",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "studentName",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "regNumber",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "college",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "course",
          "type": "string"
        },
        {
          "internalType": "uint8",
          "name": "attendancePercent",
          "type": "uint8"
        },
        {
          "internalType": "uint8",
          "name": "academicMark",
          "type": "uint8"
        },
        {
          "internalType": "uint8",
          "name": "score",
          "type": "uint8"
        },
        {
          "internalType": "bool",
          "name": "received",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "scholarshipCounter",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "scholarships",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "title",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "uint8",
          "name": "minScore",
          "type": "uint8"
        },
        {
          "internalType": "uint8",
          "name": "totalSeats",
          "type": "uint8"
        },
        {
          "internalType": "uint8",
          "name": "requiredAttendance",
          "type": "uint8"
        },
        {
          "internalType": "uint8",
          "name": "requiredAcademic",
          "type": "uint8"
        },
        {
          "internalType": "bool",
          "name": "isActive",
          "type": "bool"
        },
        {
          "internalType": "bool",
          "name": "isProcessed",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_scholarshipId",
          "type": "uint256"
        }
      ],
      "name": "selectTopApplicants",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "stateMutability": "payable",
      "type": "receive"
    }
  ]
};

// Placeholder components - assume they exist in the project structure
const Header = () => (
  <header className="bg-gray-800 text-white p-4 shadow-lg">
    <h1 className="text-2xl font-extrabold text-center tracking-wider">Scholarship Admin Dashboard</h1>
  </header>
);
const ButtonBack = () => (
  <button className="bg-gray-500 text-white p-2 rounded-lg mx-3 hover:bg-gray-600 transition duration-150">
    &larr; Back
  </button>
);


const AdminDashboard = () => {
  const [addr, setAddr] = useState(null);
  const [availableScholarships, setAvailableScholarships] = useState([]);
  const [allApplicants,setAllApplicants]=useState([]);
  const [processId, setProcessId] = useState(""); // State for ID to process

  // --- VIEM CLIENT SETUP ---
  // Using hardhat chain transport for local development/testing
  const publicClient = createPublicClient({
    chain: hardhat,
    transport: http(), 
  });

  const client = createWalletClient({
    chain: hardhat,
    transport: custom(window.ethereum),
  });

  // Connect Metamask
  async function connectWallet() {
    try {
      const [address] = await client.requestAddresses();    
      setAddr(address);
      console.log("Connected Address:", address);
      // Removed alert, using console.log for silent success
    } catch (error) {
      console.error("Connection failed:", error);
      alert("Failed to connect MetaMask. Is it installed?");
    }
  }
  
  // --- ADD SCHOLARSHIP FORM LOGIC ---
  const [form, setForm] = useState({
    title: '',
    amount: '',
    minScore: '',
    totalSeats: '',
    requiredAttendance: '',
    requiredAcademic: ''
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function addScholarship() {
    if (!addr) {
      alert("Please connect wallet first.");
      return;
    }
    
    try {
      // Assuming input is in Ether for user convenience, converting to Wei.
      const amountWei = parseEther(form.amount || '0'); 
      const minScore = Number(form.minScore || 0);
      const seats = Number(form.totalSeats || 0);
      const attendance = Number(form.requiredAttendance || 0);
      const academic = Number(form.requiredAcademic || 0);

      const txhash = await writeContract(client, {
        address: scholarship.ContractAddress,
        abi: scholarship.abi,
        functionName: "addScholarship",
        args: [
          form.title,
          amountWei,
          minScore,
          seats,
          attendance,
          academic
        ],
        account: addr,
      });

      console.log("Scholarship Added Tx:", txhash);
      alert("Scholarship Added Successfully! Tx: " + txhash);
      // Refresh list
      await loadScholarships().then(setAvailableScholarships);
      setForm({ title: '', amount: '', minScore: '', totalSeats: '', requiredAttendance: '', requiredAcademic: '' });
    } catch (error) {
      console.error("Error adding scholarship:", error);
      alert("Failed to add scholarship. Check console for details.");
    }
  }  

  // --- DATA FETCHING: COUNTER & SCHOLARSHIPS ---
  const fetchCounter = async () => {        
    try {
      const data = await publicClient.readContract({
        address: scholarship.ContractAddress,
        abi: scholarship.abi,
        functionName: "scholarshipCounter"
      });
      // Data is BigInt, converting to Number
      return Number(data);
    } catch (error) {
      console.error("Error fetching scholarshipCounter:", error);
      return 0;
    }
  };   
    
  const loadScholarships = async () => {
    try {
      const count = await fetchCounter();
      const list = [];
            
      for (let i = 1; i <= count; i++) {               
        const res = await publicClient.readContract({
          address: scholarship.ContractAddress,
          abi: scholarship.abi,
          functionName: "scholarships",
          args: [i],
        });
        
        // res is a tuple/array based on the scholarship struct fields
        list.push({
          id:Number(res[0]),
          name:res[1],
          amt:res[2], 
          score:Number(res[3]),
          seat:Number(res[4]),
          attndReq:Number(res[5]),
          markReq:Number(res[6]),
          isActive:res[7],
          isProcessed:res[8]
        })
      }    
      return list;         
    } catch (err) {
      console.error("Error loading scholarships:", err);
      return [];
    }
  };
    
  // --- DATA FETCHING: APPLICANTS (FIXED LOGIC) ---
  const loadAllScholarshipApplicants = async () => {
    try {    
      const allApplicants = [];
      const totalSchID = Number(await fetchCounter());

      for (let schID = 1; schID <= totalSchID; schID++) {

        // Use the getApplications view function to retrieve the entire array
        const apps = await publicClient.readContract({
          address: scholarship.ContractAddress,
          abi: scholarship.abi,
          functionName: "getApplications", 
          args: [schID]
        });
        
        // Loop through the returned array (of tuples) and structure the data
        for (let i = 0; i < apps.length; i++) {
          const app = apps[i];
          
          // Manually map the tuple returned by the view function to the struct fields
          allApplicants.push({
            scholarshipId: schID,
            applicant: app[0],           
            studentName: app[1],         
            regNumber: app[2],           
            college: app[3],             
            course: app[4],              
            attendancePercent: Number(app[5]), 
            academicMark: Number(app[6]),      
            score: Number(app[7]),             
            received: app[8]                   
          });
        }
      }
      return allApplicants;

    } catch (err) {
      console.error("Error loading all scholarship applicants:", err);
      return [];
    }
  };

  // --- SELECTION & DISBURSEMENT LOGIC ---
  async function processScholarship() {
    if (!addr) {
      alert("Please connect your MetaMask wallet first.");
      return;
    }
    
    const idToProcess = Number(processId);

    if (!idToProcess || idToProcess <= 0) {
      alert("Please enter a valid Scholarship ID to process.");
      return;
    }

    try {
      // Admin calls the sorting and disbursement function
      const txhash = await writeContract(client, {
                          address: scholarship.ContractAddress,
                          abi: scholarship.abi,
                          functionName: "selectTopApplicants",
                          args: [idToProcess],
                          account: addr,
                      });

      console.log("Scholarship Processing Initiated:", txhash);
      alert(`Scholarship ID ${idToProcess} processing started. Check transaction: ${txhash}. IMPORTANT: The contract must be funded with Ether for the transfers to succeed!`);
      
      // Refresh all data after processing
      setTimeout(async () => {
        await loadScholarships().then(setAvailableScholarships);
        await loadAllScholarshipApplicants().then(setAllApplicants);
      }, 5000); // Wait a few seconds for the transaction to confirm
      
    } catch (error) {
      console.error("Error processing scholarship:", error);
      alert(`Failed to process scholarship: ${error.message}`);
    }
  }


  // --- INITIAL DATA LOAD EFFECT ---
  useEffect(() => {    
    const fetchData= async ()=>{
      // Load Scholarships
      const schDetails= await loadScholarships();
      setAvailableScholarships(schDetails); 

      // Load Applicants (uses fetchCounter internally)
      const applicants= await loadAllScholarshipApplicants();   
      setAllApplicants(applicants);
    }   
    fetchData();
  }, []); // Run only once on mount

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header/>
      <div className="max-w-6xl mx-auto p-4">

        {/* Wallet Connection & Admin View */}
        <div className="flex justify-between items-center mb-6">
          <ButtonBack/>
          <div className="text-sm font-medium text-gray-700">
            {addr ? `Admin: ${addr.substring(0, 6)}...${addr.slice(-4)}` : "Wallet Not Connected"}
          </div>
          <button
            onClick={connectWallet}
            className="bg-blue-600 text-white p-2 rounded-xl shadow-md 
            hover:bg-blue-700 transition duration-150"
          >
            {addr ? 'Connected' : 'Connect MetaMask'}
          </button>
        </div>    
    
        {/* Adding Scholarship details */}
        <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-lg mb-8">
          <h2 className="font-bold text-2xl text-gray-800 mb-4 border-b pb-2">Add New Scholarship</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="title" placeholder="Title (e.g., Tech Excellence Grant)" className="border p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500" onChange={handleChange} value={form.title}/>
            <input name="amount" placeholder="Amount (in ETH)" className="border p-3 rounded-lg" type="number" onChange={handleChange} value={form.amount} min="0.001" step="0.001"/>

            <input name="minScore" placeholder="Minimum Combined Score (Max 200)" className="border p-3 rounded-lg" type="number" min="100" max="200" onChange={handleChange} value={form.minScore}/>
            <input name="totalSeats" placeholder="Total Available Seats" className="border p-3 rounded-lg" type="number" min="1" onChange={handleChange} value={form.totalSeats}/>

            <input name="requiredAttendance" placeholder="Min Required Attendance % (0-100)" className="border p-3 rounded-lg" type="number" min="0" max="100" onChange={handleChange} value={form.requiredAttendance}/>
            <input name="requiredAcademic" placeholder="Min Required Academic % (0-100)" className="border p-3 rounded-lg" type="number" min="0" max="100" onChange={handleChange} value={form.requiredAcademic}/>
          </div>
          <button
            onClick={addScholarship}
            className="mt-6 w-full bg-green-600 text-white font-semibold px-4 py-3 rounded-xl shadow-md hover:bg-green-700 transition duration-150 transform hover:scale-[1.01]"
          >
            Add Scholarship to Contract
          </button>
        </div>     
     
        {/* Viewing Scholarship details*/}
        <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-lg mb-8">
          <h2 className="font-bold text-2xl text-gray-800 mb-4 border-b pb-2">Available Scholarships ({availableScholarships.length})</h2>

          {
            availableScholarships.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount (Wei)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min Score</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seats</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Req. Attnd</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Req. Marks</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Processed</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {
                      availableScholarships.map((sch) => (
                        <tr key={sch.id} className="hover:bg-gray-50 transition duration-100">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sch.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sch.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sch.amt.toString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sch.score}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sch.seat}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sch.attndReq}%</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sch.markReq}%</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center">{sch.isProcessed ? '✅' : '❌'}</td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            ):(<p className="text-gray-500">No Scholarships added yet.</p>)
          }      
        </div>

        {/* Selection, Sorting, and Paying */}
        <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-lg mb-8">
            <h3 className="font-bold text-2xl text-gray-800 mb-4 border-b pb-2">Process and Disburse Scholarship Funds</h3>
            <p className="text-sm text-red-600 mb-4 font-semibold">
                WARNING: The contract must be funded with Ether before processing! 
                This action sorts applicants and transfers Ether on-chain.
            </p>
            <div className="flex items-center space-x-4">
                <input
                    type="number"
                    placeholder="Enter Scholarship ID to Process"
                    value={processId}
                    onChange={(e) => setProcessId(e.target.value)}
                    className="border p-3 rounded-lg w-full max-w-sm focus:ring-purple-500 focus:border-purple-500"
                    min="1"
                />
                <button
                    onClick={processScholarship}
                    disabled={!processId || !addr}
                    className="bg-purple-600 text-white font-semibold p-3 rounded-xl shadow-md hover:bg-purple-700 transition duration-150 disabled:opacity-50"
                >
                    Process ID {processId || '...'} & Disburse
                </button>
            </div>
        </div>


        {/* Applicant List */}        
        <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-lg">
          <h3 className="font-bold text-2xl text-gray-800 mb-4 border-b pb-2">
            All Scholarship Applicants ({allApplicants.length})</h3>

          {allApplicants.length === 0 && <p className="text-gray-500">
                                    No applicants applied yet or failed to load data.</p>}
          {
            allApplicants.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sch. ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reg. Number</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Attn. %</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Marks %</th>   
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Calculated Score</th>           
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Received Fund</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                  {
                    allApplicants.map((app, index) => (

                      <tr key={index} className="hover:bg-gray-50 transition duration-100">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{app.scholarshipId}</td>                      
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.studentName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.regNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.course}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">{app.attendancePercent}%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">{app.academicMark}%</td>                      
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold">{app.score} / 200</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">{app.received ? '✅ Yes' : '❌ No'}</td>
                      </tr>
                    ))
                  }
                  </tbody>
                </table>
              </div>
            )
          }       
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;