import { useState , useEffect} from "react";
import { 
          createWalletClient, 
          createPublicClient,
          custom ,
          http
        } 
        from "viem";

import { hardhat, hoodi } from "viem/chains";
import { readContract, writeContract } from "viem/actions";

import scholarship from "../assets/Scholarship.json"
import ButtonBack from "../components/ButtonBack";
import Header from "../components/Header";

const AdminDashboard = () => {
  const [addr, setAddr] = useState(null);
  
  const [counter, setCounter] = useState(0);
  const [availableScholarships, setAvailableScholarships] = useState([]);
  const [allApplicants,setAllApplicants]=useState([]);

  //Create public Client for reading only
  const publicClient = createPublicClient({
                                          chain: hardhat,
                                          // chain:hoodi,
                                          transport: http(),   // http://127.0.0.1:8545 by default
                                          // transport:custom(window.ethereum)
                                      });

  // Create wallet client
  const client = createWalletClient({
                      chain: hardhat,
                      // chain:hoodi,
                      transport: custom(window.ethereum),
                    });

  // Connect Metamask
  async function connectWallet() {

    const [address] = await client.requestAddresses();    
    setAddr(address);
    console.log(address);
    alert("Metamask connected");    
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
    
    const amount = Number(form.amount);
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
    alert("Scholarship Added Successfully!");
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
            setErrors(["Failed to fetch"])
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
                
                if(res[7]==true){
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
                    })
                }                 
            }    
          console.log("scholarship details",list);   

          // setAvailableScholarships(list);   

          return list;         
            
        } catch (err) {
            console.error("Error loading scholarships:", err);
            setErrors(["Failed to load scholarships"]);
        }
    };
    
    
//*******************************//
//for loading All Scholarship Applicants   

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
                                      args:[schID] //scholarship_id,
                                    });
        console.log("applicant details",apps);       /// displaying>>>
        console.log("apps.length",apps.length);    
        // loop through the returned array and structure the data
        for(let i=0;i<apps.length;i++){
          const app = apps[i];
          allApplicants.push({
                              scholarshipId:schID,
                              applicantIndex:app[0],
                              studentName:app[1],
                              regNumber:app[2],
                              college: app[3],
                              course: app[4],
                              attendancePercent: Number(app[5]), // index 5
                              academicMark: Number(app[6]),      // index 6
                              score: Number(app[7]),             // index 7
                              received: app[8]
                            });
        }
      }
      console.log(allApplicants,'all applicants');      
      return allApplicants;
    } catch (err) {
      console.error(err);
    }
  }; 
//************************************ */
// Selection and Disbursement
  async function processScholarship(){
    if(!addr){
      alert("Connect to Metamask Wallet");
      return;
    }
    const idToProcess=Number(processId);
    if(!idToProcess||idToProcess<=0){
      alert("Enter a valid Scholarship Id to process");
      return;
    }
    try {
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
      alert(`Processing starts for the Id:${idToProcess} and the transaction is:${txhash}`)

      //refresh all data after processing
      setTimeout(async()=>{
        await loadScholarships().then(setAvailableScholarships);
        await loadAllScholarshipApplicants().then(setAllApplicants);
      },5000) // to wait for transaction to confirm
      
    } catch (error) {
      console.error("error processing Scholarship",error);
      alert("failed to process Scholarship")            
    }
  }
  /// initial data load efffect 
  useEffect(() => {    
      const fetchData= async ()=>{
        // for loading Scholarships
        const schDetails= await loadScholarships();
        setAvailableScholarships(schDetails);  
        
        //for loading all Applicants for Scholarships      
        const applicants= await loadAllScholarshipApplicants();   
        setAllApplicants(applicants);
      }   
      fetchData();     
    }, []);

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

      {/* selecting, sorting and paying */}
      <div className="m-5">
        <button
          // onClick={processScholarship}
          className="bg-purple-600 text-white p-2 rounded"
        >
          Process Scholarship
        </button>
      </div>
    </>
  );
};

export default AdminDashboard;