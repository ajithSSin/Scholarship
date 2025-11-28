import { useState , useEffect} from "react";
import { 
          createWalletClient, 
          createPublicClient,
          custom ,
          http,
          formatEther,
          parseEther
        } 
        from "viem";

import { hardhat, hoodi } from "viem/chains";
import { getBalance, readContract, sendTransaction, waitForTransactionReceipt, writeContract } from "viem/actions";

import scholarship from "../assets/Scholarship.json"
import ButtonBack from "../components/ButtonBack";
import Header from "../components/Header";
import ScholarshipDapp from "./Selection";

const AdminDashboard = () => {
  const [addr, setAddr] = useState(null);
  
  const [counter, setCounter] = useState(0);
  const [availableScholarships, setAvailableScholarships] = useState([]);
  const [allApplicants,setAllApplicants]=useState([]);

  // --- NEW STATE ADDITIONS ---
  const [balance, setBalance] = useState('0.00');
  const [depositValue, setDepositValue] = useState('0.1');
  const [scholarshipIdToView, setScholarshipIdToView] = useState('1'); // ID for the bottom view
  const [fetchedApplications, setFetchedApplications] = useState([]); // List for the bottom table
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  // ---------------------------

  //Create public Client for reading only
  const publicClient = createPublicClient({
                                          // chain: hardhat,
                                          chain:hoodi,
                                          transport: http(),   // http://127.0.0.1:8545 by default
                                          // transport:custom(window.ethereum)
                                      });

  // Create wallet client
  const client = createWalletClient({
                      // chain: hardhat,
                      chain:hoodi,
                      transport: custom(window.ethereum),
                    });

  // Connect Metamask
  async function connectWallet() {

    setLoading(true);
    try {
      const [address] = await client.requestAddresses();    
      setAddr(address);
      setAlertMessage("Metamask connected successfully!");
      // Fetch initial balance after connection
      await fetchContractBalance();

    } catch (error) {
      setAlertMessage("Failed to connect wallet.");
      console.error("Wallet connection error:", error);      
    }finally {
        setLoading(false);
    }       
  }  
  //form for adding scholarship
  const [form, setForm] = useState({
                                    title: '',
                                    amount: '',                                    
                                    minScore: '',   
                                    totalSeats: '',                                 
                                    requiredAttendance: '',
                                    requiredAcademic: ''
                                  });

  // Form handler
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, 
                            [name]: value }
                      ));
  }
   // Add scholarship
  async function addScholarship() {

    if(!addr) {
        setAlertMessage("Please connect your wallet first.");
        return;
    }
    setLoading(true);
    try {

      const amount = BigInt(Number(form.amount)); // Use BigInt for uint256
      const minScore = Number(form.minScore);
      const seats = Number(form.totalSeats);
      const attendance = Number(form.requiredAttendance);
      const academic = Number(form.requiredAcademic);

      const txhash = await writeContract(client, {
                            address: scholarship.ContractAddress,
                            abi: scholarship.abi,
                            functionName: "addScholarship",
                            args: [
                                    form.title,
                                    amount,
                                    minScore,
                                    seats,
                                    attendance,
                                    academic
                                ],
                            account: addr,
                        });

        console.log("Scholarship Added:", txhash);
        setAlertMessage("Scholarship Added Successfully! TX: " + txhash);
        
        // Wait for confirmation and refresh list
        await waitForTransactionReceipt(publicClient, { hash: txhash });
        await loadScholarships().then(setAvailableScholarships);
    } catch (error) {
      console.error("Error adding scholarship:", error);
        setAlertMessage("Failed to add scholarship: " + error.message);
    } finally {
        setLoading(false);      
    }   
  }  

/************************************************* */
{/*//loading Scholarship */}
//for fetching the scholarshp count   

  const fetchCounter = async () => {        
        try {
            const data = await publicClient.readContract({
                                address: scholarship.ContractAddress,
                                abi: scholarship.abi,
                                functionName: "scholarshipCounter"
                            });
            
                            // return Number(data);
            const count = Number(data);      
            setCounter(count);
            return count;

        } catch (error) {
            console.error("Error fetching scholarshipCounter:", error);
            setErrors(["Failed to fetch"])  // to removed setErrors state
        }
    };   
    const loadScholarships = async () => {
        try {
            const count = await fetchCounter();  // reuse counter function      
            // console.log("Load Scholarship count",count);                            

            const list = [];
            // console.log("list in loadScholarship",list);    

            console.log("Using contract address:", scholarship.ContractAddress);        
            
            // Loop through all existing scholarships
            for (let i = 1; i <= count; i++) {               
                
                const res = await publicClient.readContract({
                                address: scholarship.ContractAddress,
                                abi: scholarship.abi,
                                functionName: "scholarships",
                                args: [i],
                            });
                  // res is the Scholarship struct 
                // if(res[7]==true){
                    list.push({
                        id:Number(res[0]),
                        name:res[1],
                        amt:res[2],
                        score:res[3],
                        seat:res[4],
                        attndReq:res[5],
                        markReq:res[6],
                        isActive:res[7],
                        isProcessed:res[8]
                    });
                // }                 
            }    
          console.log("scholarship details",list);   

          // setAvailableScholarships(list);   

          return list;         
            
        } catch (err) {
            console.error("Error loading scholarships:", err);
            setErrors(["Failed to load scholarships"]);
        }
    };    
    
//***************************************//
//for loading All Scholarship Applicants   
//***************************************//

  const loadAllScholarshipApplicants = async () => {

    try {    
      
      const allApplicants = [];             
      //for total number of scholarships
      const totalSchID =Number(await fetchCounter());   
      // console.log("load applicant Count:",Number(totalSchID));    
      //Loop each scholarship     
      for (let schID = 1; schID <= Number(totalSchID); schID++) {
        // console.log(`Fetching applications for scholarship ID: ${schID}`);
        //for getting applicant details applied to this scholarship
        const apps = await publicClient.readContract({
                                      address:scholarship.ContractAddress,
                                      abi:scholarship.abi,
                                      functionName:"getApplications",//???getApplication
                                      args:[BigInt(schID)] //scholarship_id in BigInt,
                                    });
        console.log("applicant details",apps);       /// displaying>>>
        console.log("apps.length",apps.length);    
        // loop through the returned array and structure the data
        for(let i=0;i<apps.length;i++){
          const app = apps[i];

          // console.log(typeof(app));      
          // console.log("app",app);   
          // Map array tuple to object (using original struct indices for clarity)      

          allApplicants.push({
                              scholarshipId:schID,
                              applicantIndex:i+1,
                              address:app.applicant,
                              studentName:app.studentName,
                              regNumber:app.regNumber,
                              college: app.college,
                              course: app.course,
                              attendancePercent: Number(app.attendancePercent), // index 5
                              academicMark: Number(app.academicMark),      // index 6
                              score: Number(app.score),             // index 7
                              received: app.received

                            });
        }
      }
      console.log('all applicants',allApplicants);      
      return allApplicants;
    } catch (err) {
      console.error(err);
      return[];
    }
  }; 
//************************************ */
// Processing  Scholarship (Selection and Disbursement)
//check function for scholarship 1-active or not;
                                //2-alreadry processed or not
                            //3-sorting the application
                            //4-selecting top students
                            //5-Disbursing to the selected students
                            //PROCESS SCHOLARSHIP (SORT, SELECT, DISBURSE)
//***************************** */
 // Fetch the native ETH balance of the contract
  async function fetchContractBalance() {
    try {
      const bal=await getBalance(publicClient,
                                {
                                  address:scholarship.ContractAddress
                                }
                              );
      setBalance(formatEther(bal));

    } catch (error) {
      console.error("Error fetching contract balance:", err);
      setBalance('Error');
   }  
  }

    // to deposit ETH to the contract
  async function depositToContract() {
    if(!addr){
      setAlertMessage('Connect wallet first.');
      return;
    }
    setLoading(true);
    try{
      const value=parseEther(depositValue);
      setAlertMessage(`Sending ${depositValue} ETH`);
      
      const txHash = await sendTransaction(client,
                                            {
                                              to:scholarship.ContractAddress,
                                              value,
                                              account:addr
                                            }
                                          );
      await waitForTransactionReceipt(publicClient,
                                      {
                                        hash:txHash
                                      }
                                    );
      setAlertMessage("Deposit Successfully");
      fetchContractBalance();// refresh balance
    }catch (error){
      console.error("Deposit failed",error);
      setAlertMessage(`Deposit failed:`+(error.shortMessage ||error.Message));     
    }finally{
      setLoading(false);
    }    
  }

  // Fetching and sorting applications for a single ID (for the bottom table)
//*************************************************************************** */
  async function fetchApplicationsById() {
    if(!scholarshipIdToView){
      return setAlertMessage("Enter scholarship Id");
    }
    setLoading(true);
    setFetchedApplications([]);
    try {

      setAlertMessage(`Fetching applications for ID ${scholarshipIdToView}`);  
      const schId = BigInt(Number(scholarshipIdToView));    

      const apps = await readContract(publicClient, 
                                      {
                                        address: scholarship.ContractAddress,
                                        abi: scholarship.abi,
                                        functionName: 'getApplications',
                                        args: [schId],
                                      });
       const normalized = apps.map((a) => (
                                            {
                                              applicant: a[0],
                                              studentName: a[1],
                                              college: a[3],
                                              score: Number(a[7]),
                                              received: a[8],
                                            }
                                          ));    
      // sorting score by descending
      normalized.sort((x,y)=>y.score-x.score);
      setFetchedApplications(normalized);
      setAlertMessage(`Found ${normalized.length} applications for ID 
                              ${scholarshipIdToView}.`);                      
    } catch (error) {
      console.error("Failed to fetch applications:", err);
      setAlertMessage('Failed to fetch applications. Check ID or network.');
    } finally {
      setLoading(false);
    }    
  }

  //Selection and Disbursement
  //selectTopApplicants` function on the contract.
  //************************** */
   
  async function processScholarship(){
    if(!addr){
      setAlertMessage("Connect to Metamask Wallet");
      return;
    }
    const idToProcess=Number(scholarshipIdToView);
    
    if(!idToProcess||idToProcess<=0){
      setAlertMessage("Enter a valid Scholarship Id to process");
      return;
    }
     //before disbursing check contract has fund
    if (balance === '0.00' || balance === 'Error') {
      setAlertMessage("Contract balance is null, deposit!!.");
      return;
    }
    setLoading(true);
    setAlertMessage(`Processing for scholarshipID:${idToProcess}`);

    try {
      const schID=BigInt(idToProcess);
      // admin call the sorting and disbursement function
      const txhash=await writeContract(client,{
                                                address:scholarship.ContractAddress,
                                                abi:scholarship.abi,
                                                functionName:"selectTopApplicants",
                                                args:[idToProcess],
                                                account:addr,
                                              });
      

       //Check transaction:txhash and the contract must be funded with Ether 
       // for the transfers to succeed!`      
      console.log("Scholarship processing initiated",txhash);
      setAlertMessage(`Processing starts for the Id:${idToProcess} 
                          and the transaction is:${txhash}`)
      
      await waitForTransactionReceipt(publicClient,{
                                                    hash:txhash
                                                  });
      setAlertMessage(`SUCCESS! Scholarship ID ${idToProcess} 
                        processed and funds disbursed.`);

      //refresh all data after processing
      await fetchContractBalance();
      await fetchApplicationsById(); 

      //refresh the main dashboard lists asynchronously
      loadScholarships().then(setAvailableScholarships);
      loadAllScholarshipApplicants().then(setAllApplicants);

      // setTimeout(async()=>{
      //   await loadScholarships().then(setAvailableScholarships);
      //   await loadAllScholarshipApplicants().then(setAllApplicants);
      // },5000) // to wait for transaction to confirm
      
    } catch (error) {
      console.error("error processing Scholarship",error);
      setAlertMessage("failed to process Scholarship",error.message)            
    }finally{
      setLoading(false);
    }
  }
  /// initial data load efffect (useEffect)
  useEffect(() => {    
      const fetchData= async ()=>{
        
        //for fetching contract balance on mounting
        await fetchContractBalance();
        // for loading Scholarships
        const schDetails= await loadScholarships();
        setAvailableScholarships(schDetails);  
        
        //for loading all Applicants for Scholarships      
        const applicants= await loadAllScholarshipApplicants();   
        setAllApplicants(applicants);
      }   
      fetchData();     
    }, [addr]); 
    // dependenct array: address to refetch data once  connected
///*********************************************************** */

  return (
    <>
    <Header/>
    <header className="bg-gray-800 text-white m-6 p-4 rounded-xl shadow-lg">
      <h1 className="text-2xl font-extrabold text-center tracking-wider">
        Scholarship Admin Dashboard
      </h1>
    </header>

    {/* Wallet Connection & Admin View */}

    <div className="flex justify-between items-center mb-6 mx-2">
        <ButtonBack/>
        <div className="text-sm font-medium text-gray-700">
            {
              addr ? `Admin: ${addr.substring(0, 6)}...${addr.slice(-4)}`             
                   : "Wallet Not Connected"
            }
          </div>
        {/* metatmask connection */}

        <button
          onClick={connectWallet}
          // className="bg-blue-500 text-white p-2 rounded mx-3"
          className="bg-blue-600 text-white p-2 mx-5 rounded-xl shadow-md 
                    hover:bg-blue-700 transition duration-150"
        >
          {addr ? 'Connected' : 'Connect MetaMask'}
        </button>
    </div>    
    
      {/* Adding scholarship details */}
      <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-lg mb-8 mx-8">
        <h2 className="font-bold text-2xl text-gray-800 mb-4 border-b pb-2">
          Add New Scholarship</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">      
        <input name="title" 
              placeholder="Title" 
              className="border p-3 rounded-lg focus:ring-blue-900 focus:border-blue-900"
          onChange={handleChange}
        /> 
        {/* <br/> */}
        <input name="amount" 
        placeholder="Amount" 
        className="border p-3 rounded-lg"
          type="number" 
          onChange={handleChange}
        />
        {/* <br/> */}
        <input name="totalSeats" 
              placeholder="Available seats" 
              className="border p-3 rounded-lg"
                type="number" 
                onChange={handleChange}
        />

        <input name="minScore" 
        placeholder="Minimum Score" 
        className="border p-3 rounded-lg"
          type="number" 
          min="150"
          max="200"
          onChange={handleChange}
        />
        {/* <br/> */}

        
        {/* <br/> */}
        <input
          type="number"
          name="requiredAttendance"
          placeholder="Required Attendance %"
          // value={formData.requiredAttendance}
          onChange={handleChange}
          min="0"
          max="100"
          required
          className="border p-3 rounded-lg"
          // className="border p-2 m-2 w-67 rounded-xl"
        />
        {/* <br/> */}
        <input
          type="number"
          name="requiredAcademic"
          placeholder="Required Academic %"
          // value={formData.requiredAcademic}
          onChange={handleChange}
          min="0"
          max="100"
          required
          className="border p-3 rounded-lg"
          // className="border p-2 m-2 w-67 rounded-xl"
        />
        {/* <br/>        */}
        </div>
        <button
          onClick={addScholarship}
          // className="bg-green-600 text-white px-4 py-2 rounded-xl"
          className="mt-6 w-full bg-green-600 text-white
                    font-semibold px-4 py-3 rounded-xl shadow-md 
                    hover:bg-green-700 transition duration-150 transform hover:scale-[1.01]"
        >
          Add Scholarship to Contract
        </button>        
      </div>   
     
      {/* viewing Scholarship details*/}
      <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-lg mb-8 mx-8">
        <h2 className="font-bold text-xl">Available Scholarship</h2>

        {
          availableScholarships.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border rounded-lg overflow-hidden">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-4 py-2">Id</th>
                    <th className="px-4 py-2">Title</th>
                    <th className="px-4 py-2">Scholarship Amount</th>
                    <th className="px-4 py-2">Scores Required</th>
                    <th className="px-4 py-2">Availability</th>
                    <th className="px-4 py-2">Attendence Required %</th>
                    <th className="px-4 py-2">Marks Required%</th>
                    <th className="px-4 py-2">Is Active</th>
                    <th className="px-4 py-2">Is Processed</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    availableScholarships.map((sch, index) => (
                      <tr key={index} className="text-center border-t">
                        <td className="px-4 py-2">{Number(sch.id)}</td>
                        <td className="px-4 py-2">{sch.name}</td>
                        <td className="px-4 py-2">{Number(sch.amt)}</td>
                        <td className="px-4 py-2">{Number(sch.score)}</td>
                        <td className="px-4 py-2">{Number(sch.seat)}</td>
                        <td className="px-4 py-2">{Number(sch.attndReq)}</td>
                        <td className="px-4 py-2">{Number(sch.markReq)}</td>

                        <td className="px-4 py-2">{sch.isActive ? '✅' : '❌'}</td>

                        <td className="px-4 py-2">{sch.isProcessed ? '✅' : '❌'}</td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          ):(<p>No Scholarships added yet.</p>)
        }      
        
      </div>

      {/* All Applicants applied for all Scholarships listed  */}        

      <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-lg mb-8 mx-8">
        <h3 className="font-bold text-lg">All Scholarship Applicants</h3>

        {/* {allApplicants.length === 0 && <p>No applicants applied yet.</p>} */}
        {
          allApplicants.length > 0 ?(

            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border rounded-lg overflow-hidden">
                <thead className="bg-gray-200">
                  <tr>
                      <th className="px-4 py-2">Scholarship ID</th>
                      <th className="px-4 py-2">Name</th>
                      <th className="px-4 py-2">Student ID</th>
                      <th className="px-4 py-2">Qualification</th>
                      <th className="px-4 py-2">Attendance %</th>
                      <th className="px-4 py-2">Marks Scored %</th>   
                         
                      <th className="px-4 py-2">Maximun Score</th>           
                      <th className="px-4 py-2">Is Processed</th>
                  </tr>
                </thead>
                <tbody>
                {
                  allApplicants.map((app, index) => (

                    <tr key={index} className="text-center border-t">
                    
                      <td className="px-4 py-2">{Number(app.scholarshipId)}</td>                      
                      <td className="px-4 py-2">{app.studentName}</td>
                      <td className="px-4 py-2">{app.regNumber}</td>
                      <td className="px-4 py-2">{app.course}</td>
                      <td className="px-4 py-2">{Number(app.attendancePercent)}</td>
                      <td className="px-4 py-2">{Number(app.academicMark)}</td>                      
                      <td className="px-4 py-2">{Number(app.score)}</td>

                      <td className="px-4 py-2">{app.received ? '✅' : '❌'}</td>
                      
                    </tr>
                  ))
                }
                </tbody>
              </table>
            </div>
          ):(<p>No Applicants applied yet.</p>)
        }       
      </div>

      {/* Depositing, fetching Id , Selecting, Sorting and Processing */}
      {/* <div className="m-5">
        <button
          // onClick={processScholarship}
          className="bg-purple-600 text-white p-2 rounded"
        >
          Process Scholarship
        </button>
      </div> */}
      <div className="bg-white p-6 border border-gray-200 
                      rounded-xl shadow-lg mb-8 mx-8">
        <h2 className="font-bold text-2xl text-gray-800 mb-4 border-b pb-2">
          Processing Scholarship & Disbursing
        </h2>  
        {/**Deposit Section */}
        <div>
          <div className="mb-6 p-4 border rounded">
            <div className="mb-2">Contract balance: 
                                  {/* <strong>{balance} ETH</strong> */}
            </div>
            <div className="flex items-center gap-2">
              <input className="p-2 border rounded" 
                      // value={depositValue} 
                      // onChange={(e)=>setDepositValue(e.target.value)} 
              />
              <button 
                // onClick={depositToContract} 
                // disabled={loading} 
                className="px-3 py-2 rounded bg-green-600 text-white"
              >
                Deposit to contract
              </button>
            </div>
            <div className="text-sm text-gray-600 mt-2">
              {/* This sends native ETH to the contract address using the connected wallet. */}
              Sending eth to the contract usng wallet
            </div>
          </div>
        </div>
        <div>
          <div className="mb-4 p-4 border rounded">
            <label className="block mb-2">Scholarship ID</label>
            <input 
                  // value={scholarshipId} 
                  // onChange={(e)=>setScholarshipId(e.target.value)} 
                  className="p-2 border rounded w-24" 
            />
            <div className="mt-3 flex gap-2">
              <button 
                    // onClick={fetchApplications} 
                    className="px-3 py-2 rounded bg-indigo-600 text-white"
              >
                Fetch Applications
              </button>
              <button 
                    // onClick={callSelectTopApplicants} 
                    className="px-3 py-2 rounded bg-red-600 text-white"
              >
                      selectTopApplicants (admin)
              </button>
            </div>
          </div>
        </div>
      </div>
      {/** Application sorted by score */}

      <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-lg mb-8 mx-8">
        <h2 className="text-xl font-semibold">Applications (sorted by score)</h2>

        {/* {loading ? <div>Loading...</div> : ( */}

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
              {/* {
              applications.map((a, idx) => (
                <tr key={idx} className="border-b">
                  <td className="py-2">{idx+1}</td>
                  <td>{a.studentName} ({a.college})</td>
                  <td>{a.score}</td>
                  <td>{a.received ? 'Yes' : 'No'}</td>
                  <td className="text-sm">{a.applicant}</td>
                </tr>
              ))
              } */}
            </tbody>
          </table>
        {/* )} */}
      </div>      
    </>
  );
};

export default AdminDashboard;