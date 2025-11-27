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

  //Create public Client for reading only
  const publicClient = createPublicClient({
                                          chain: hardhat,
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
                            [name]: value }));
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
//loading Scholarship  
const [counter, setCounter] = useState(0);
const [availableScholarships, setAvailableScholarships] = useState([]);

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

            setAvailableScholarships(list);  
            return list;         
            
        } catch (err) {
            console.error("Error loading scholarships:", err);
            setErrors(["Failed to load scholarships"]);
        }
    };
    
    useEffect(() => {        
      // console.log("useEffect");              
        loadScholarships();
        // console.log("Updated scholarships:", availableScholarships);
    }, []);
//*******************************//
// loading Applicants
  const [applicants,setApplicants]=useState([]);  

  const loadApplicant = async () => {

    try {
      const count =await fetchCounter()
      console.log("load applicant() Count:",count); //working
      
      const list=[];
      // 
      
      for (let i = 1; i <= count; i++) {
        const res = await publicClient.readContract({
                                      address:scholarship.ContractAddress,
                                      abi:scholarship.abi,
                                      functionName:"scholarshipApplications",//???
                                      args:[i] 
                                    });
        list.push({
                        // id:Number(res[0]),
                        name:res[1],
                        reg:res[2],
                        // score:res[3],
                        course:res[4],
                        attndReq:res[5],
                        markReq:res[6],
                        score:res[7],
                        isReceived:res[8]
                    })
                    console.log("list in loop ", list);
      }
      setApplicants(list);
      console.log("applicants list",list)
      return list;

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {

    loadApplicant();

  }, []);

//************************************ */
  // View scholarship  

  const [schId, setSchId] = useState("");
  const [schDetails, setSchDetails] = useState("");
  // const [applicants, setApplicants] = useState([]); 
  
  // const [ID,setID]=useState();

  // function getId(){
  //   const id=document.getElementById('cid').value;
  //   setID(id);
  // }


  async function viewScholarship() {
    
    const id = parseInt(schId);
    console.log(id);    

    if (isNaN(id)) return alert("Enter valid scholarship ID");

    const details = await readContract(client, {
                                address: scholarship.ContractAddress,
                                abi: scholarship.abi,
                                functionName: "scholarships",
                                args: [id],
                              });

    setSchDetails(`ID: ${details[0].id}
                  Title: ${details[1].title}
                  Amount: ${details[2].amount}
                  Availability: ${details[3].availabilty}
                  Description: ${details[4].description}
                  Active: ${details[5].isActive}
                  Processed: ${details[6].isProcessed}`);

    loadApplicants(id);
  }

  //For Loading applicats --
  
  async function loadApplicants(id) {

    const count = await readContract(client, {
                                      address: scholarship.ContractAddress,
                                      abi: scholarship.abi,
                                      functionName: "scholarships",
                                      args: [id],
                                    });

    let arr = [];

    for (let i = 0; i < count; i++) {
      const app = await readContract(client, {
        address: scholarship.ContractAddress,
        abi: scholarship.abi,
        functionName: "scholarshipApplications",
        args: [id, i],
      });

      arr.push(app);
    }

    setApplicants(arr);
  }

  // Process scholarship sorting , selecting and paying
  
  async function processScholarship() {
    const id = parseInt(schId);

    const tx = await writeContract(client, {
                                          address: scholarship.ContractAddress,
                                          abi: scholarship.abi,
                                          functionName: "processScholarship",
                                          args: [id],
                                          value: 0n,
                                          account: addr,
                                        });

    console.log("Processed:", tx);
    alert("Scholarship processed! Funds disbursed.");
  }

  return (
    <>
    <Header/>
    <div className="flex justify-between">
        <ButtonBack/>
        {/* metatmask connection */}
        <button
          onClick={connectWallet}
          className="bg-blue-500 text-white p-2 rounded mx-3"
        >
          Connect MetaMask
        </button>
    </div>    
    
      {/* Adding scholarship details */}
      <div className="p-5 border rounded-lg m-5">
        <h2 className="font-bold text-xl mb-3">Add Scholarship</h2>

        <input name="title" 
              placeholder="Title" 
              className="border p-2 m-2 rounded-xl"
          onChange={handleChange}
        /> 
        <br/>
        <input name="amount" 
        placeholder="Amount" 
        className="border p-2 m-2 rounded-xl"
          type="number" 
          onChange={handleChange}
        />
        <br/>

        <input name="minScore" 
        placeholder="Minimum Score" 
        className="border p-2 m-2 w-67 rounded-xl"
          type="number" 
          min="150"
          max="200"
          onChange={handleChange}
        />
        <br/>

        <input name="totalSeats" 
              placeholder="Available seats" 
              className="border p-2 m-2 w-67 rounded-xl"
                type="number" 
                onChange={handleChange}
        />
        <br/>
        <input
          type="number"
          name="requiredAttendance"
          placeholder="Required Attendance %"
          // value={formData.requiredAttendance}
          onChange={handleChange}
          min="0"
          max="100"
          required
          className="border p-2 m-2 w-67 rounded-xl"
        />
        <br/>

        <input
          type="number"
          name="requiredAcademic"
          placeholder="Required Academic %"
          // value={formData.requiredAcademic}
          onChange={handleChange}
          min="0"
          max="100"
          required
          className="border p-2 m-2 w-67 rounded-xl"
        />
        <br/>

        {/* <input name="description" 
                placeholder="Description"
          className="border p-2 m-2 w-67 w-55 rounded-xl"
          onChange={handleChange}
        /><br/> */}

        <button
          onClick={addScholarship}
          className="bg-green-600 text-white px-4 py-2 rounded-xl"
        >
          Add Scholarship
        </button>
      </div>
      
      {/*loading*/}
      {/* <div>
        {items.map((item) => (
  <div key={item.id} className="card">
    <h3>{item.title}</h3>
    <p>Amount: {item.amount}</p>
    <p>Min Score: {item.minScore}</p>
    <p>Total Seats: {item.totalSeats}</p>
    <p>Required Attendance: {item.requiredAttendance}%</p>
    <p>Required Academic Mark: {item.requiredAcademic}%</p>
    <p>Status: {item.isActive ? "Active" : "Inactive"}</p>
  </div>
))}

      </div> */}


      {/* viewing Scholarship details*/}
      <div className="p-5 border rounded-lg m-5">
        <h2 className="font-bold text-xl">View Scholarship</h2>

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

        {/* <input
          className="border p-2 m-2"
          placeholder="Scholarship ID"
          onChange={(e) => setSchId(e.target.value)}
        />

        <button
          onClick={viewScholarship}
          className="bg-blue-400 text-white p-2 rounded"
        >
          View
        </button>        

        <pre className="bg-gray-100 p-3 mt-3">{schDetails}</pre> */}
        
      </div>

      {/* applicant list */}        

      <div className="p-5 border rounded-lg m-5">
        <h3 className="font-bold text-lg">View Applicants</h3>

        {/* {applicants.length === 0 && <p>No applicants yet.</p>} */}
        {
          applicants.length.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border rounded-lg overflow-hidden">
                <thead className="bg-gray-200">
                  <tr>
                      <th className="px-4 py-2">Name</th>
                      <th className="px-4 py-2">Student Id</th>
                      <th className="px-4 py-2">Qualification</th>
                      <th className="px-4 py-2">Attendance %</th>
                      <th className="px-4 py-2">Marks Scored %</th>      
                      <th className="px-4 py-2">Maximun Score</th>           
                      <th className="px-4 py-2">Is Processed</th>
                  </tr>
                </thead>
                <tbody>
                {
                  applicants.map((app, index) => (

                    <tr key={index} className="text-center border-t">
                    
                      <td className="px-4 py-2">{app.name}</td>                      
                      <td className="px-4 py-2">{app.reg}</td>
                      <td className="px-4 py-2">{app.course}</td>
                      <td className="px-4 py-2">{Number(app.attndReq)}</td>
                      <td className="px-4 py-2">{Number(app.markReq)}</td>                      
                      <td className="px-4 py-2">{Number(app.score)}</td>

                      <td className="px-4 py-2">{app.isReceived ? '✅' : '❌'}</td>
                      
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        ):(<p>No Applicants applied yet.</p>)
      }

        {/* {
          applicants.map((app, i) => (
            <div key={i} className="border p-2 m-2">

              <p><b>Address:</b> {a.applicant}</p>
              <p><b>Name:</b> {app.name}</p>
              <p><b>Reg No:</b> {app.regNo}</p>
              <p><b>Mark:</b> {app.course.toString()}</p>
              <p><b>Document:</b> {a.docId}</p>
              <p><b>Received:</b> {a.received ? "Yes" : "No"}</p>
            </div>
        ))
        } */}
      </div>

      {/* selecting, sorting and paying */}
      <div className="m-5">
        <button
          onClick={processScholarship}
          className="bg-purple-600 text-white p-2 rounded"
        >
          Process Scholarship
        </button>
      </div>
    </>
  );
};

export default AdminDashboard;