import React, { useState,useEffect } from 'react'
import Header from '../components/Header';
import ButtonBack from '../components/ButtonBack';

import scholarship from "../assets/Scholarship.json";

import {
        createPublicClient, 
        createWalletClient , 
        custom, 
        http
    } 
    from "viem";
import { hardhat, hoodi } from 'viem/chains';
import { writeContract } from 'viem/actions';

const ApplyFormpage = () => {
    const [addr, setAddr] = useState(null);
    
    //Create public Client for reading only
    const publicClient = createPublicClient({
                                        // chain: hardhat,
                                        chain:hoodi,
                                        transport: http(),   // http://127.0.0.1:8545 by default
                                        // transport:custom(window.ethereum)
                                    });
    
    // Create wallet Client writing +metamask connection
    const walletClient=createWalletClient({
                                    // chain:hardhat,
                                    chain:hoodi,
                                    transport:custom(window.ethereum)
                                });   
    // Connect Metamask
    async function connectWallet() {
        
        const [address] = await walletClient.requestAddresses();
        setAddr(address);
        console.log(address);
        alert("Metamask connected")
    }    

    const [formData, setFormData] = useState({
                                        scholarshipId: '',
                                        studentName: '',
                                        regNumber: '',
                                        college: '',
                                        course: '',
                                        attendancePercent: '',
                                        academicMark: '',
                                    });
    const [status, setStatus] = useState('');

    const [availableScholarships, setAvailableScholarships] = useState([]);
    const [counter, setCounter] = useState(0);
    const [errors, setErrors] = useState([]);  
        
    const fetchCounter = async () => {        
        try {
            const data = await publicClient.readContract({
                                address: scholarship.ContractAddress,
                                abi: scholarship.abi,
                                functionName: "scholarshipCounter"
                            });
            
                            // return Number(data);
            const count = Number(data);

            // console.log("Scholashipcounter",data);
            
            // console.log("count",count);          
            
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
                    })
                }                  
            }    
            console.log("scholarship id and title in for loop",list);       

            setAvailableScholarships(list);           
            
        } catch (err) {
            console.error("Error loading scholarships:", err);
            setErrors(["Failed to load scholarships"]);
        }
    };
    
    useEffect(() => {                
        loadScholarships();
        // console.log("Updated scholarships:", availableScholarships);
    }, []);

    // Add form-data

    function handleChange(e) {
          const { name, value } = e.target;
          setFormData({
                      ...formData,
                      [name]:value,
                      // [name]: files ? files[0] : value,                   
                  });
    }    
    // function validate() {

    //     const errs = [];

    //     if (!formData.name) errs.push("Name is required");
    //     if (!formData.studentId) errs.push("Student ID is required");
    //     if (!formData.marks || formData.marks < 0) errs.push("Valid marks required");
    //     //   if (!formData.income || formData.markID < 0) errs.push("Valid mark list ID required");
    //       // if (!formData.documents) errs.push("Documents upload is required");
  
    //       setErrors(errs);
    //       return errs.length === 0;
    // }

    async function handleSubmit(e) {
        
        e.preventDefault();       
        // if (!validate()) return;
        setStatus('Processing');
        try {
            if(!window.ethereum){
                alert("Metamask not Connected/Detected")
            }
            
            const txhash= await writeContract(walletClient,{
                                            address:scholarship.ContractAddress,
                                            abi:scholarship.abi,
                                            functionName:"applyForScholarship",
                                            args:[
                                                parseInt(formData.scholarshipId),
                                                formData.studentName,
                                                formData.regNumber,
                                                formData.college,
                                                formData.course,
                                                parseInt(formData.attendancePercent),
                                                parseInt(formData.academicMark)
                                            ],
                                            account:addr
                                        })
            console.log("Submitting Application:", formData);
            console.log("txhash",txhash);            

            alert("Application submitted successfully!");

        } catch (error) {
            console.error(error);
            setStatus("Error",error.message);                    
        }        
    } 

    return (
        <>
            <div className='bg-gray-200'>
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

                <div className="mx-auto max-w-2xl mt-6 p-6 
                      shadow-2xl rounded-2xl
                      bg-blue-200">
                    
                    <h1 className="text-3xl font-bold mb-6 
                          text-purple-700">
                        Scholarship Application
                    </h1>  
                    <form 
                            onSubmit={handleSubmit} 
                            className="border grid gap-4
                                        rounded-2xl shadow
                                        bg-white p-6">
                        <div>
                            <label className=" font-semibold">Scholarship</label>
                            <select 
                                    name="scholarshipId"
                                    value={formData.scholarshipId}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-2 border rounded-xl">
                                <option value="">
                                    Select a Scholarship
                                </option>
                                {
                                    availableScholarships.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.name} (ID: {s.id})
                                            </option>
                                        ))
                                }
                            </select>
                        </div>
                        <div>
                            <label className=" font-semibold">Name</label>
                            <input
                                    type="text"
                                    name="studentName"
                                    value={formData.studentName}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-xl"
                                    placeholder="Student Name"/>
                        </div>
              <div>
                  <label className="font-semibold">Student ID</label>
                  <input
                          type="text"
                          name="regNumber"
                          value={formData.regNumber}
                          onChange={handleChange}
                          className="w-full p-2 border rounded-xl"
                          placeholder="Student ID"/>
              </div>
              
              <div>
                  <label className="font-semibold">College Name</label>
                  <input
                          type="text"
                          name="college"
                          value={formData.college}
                          onChange={handleChange}
                          className="w-full p-2 border rounded-xl"
                          placeholder="College name"/>
              </div>
              <div>
                  <label className="font-semibold">Qualification</label>
                  <input
                          type="text"
                          name="course"
                          value={formData.course}
                          onChange={handleChange}
                          className="w-full p-2 border rounded-xl"
                          placeholder="Highest Degree"/>
              </div>
              <div>
                  <label className="font-semibold">Attendance</label>
                  <input
                          type="number"
                          name="attendancePercent"
                          value={formData.markID}
                          onChange={handleChange}
                          className="w-full p-2 border rounded-xl"
                          placeholder="Attendance % (max 100)"/>
              </div>
              <div>
                  <label className="font-semibold">Mark scored</label>
                  <input
                          type="number"
                          name="academicMark"
                          value={formData.markID}
                          onChange={handleChange}
                          className="w-full p-2 border rounded-xl"
                          placeholder="Academic Mark % (max 100)"/>
              </div>
  
              {/* <div>
                  <label className="font-semibold">Family Income (₹)</label>
                  <input
                          type="number"
                          name="income"
                          value={formData.income}
                          onChange={handleChange}
                          className="w-full p-2 border rounded-xl"
                          placeholder="Enter your annual income"/>
              </div> */}
  
              <div>
  
              </div>
  
              {/* <div>
                  <label className="font-semibold">Upload Documents (PDF/Image)</label>
                  <input
                          type="file"
                          name="documents"
                          onChange={handleChange}
                          className="w-full"
                          accept=".pdf,.png,.jpg,.jpeg"/>
              </div> */}
              
              <button
                      type="submit"
                      className="w-full p-3 
                                  bg-purple-600 text-white font-bold 
                                  rounded-xl 
                                  hover:bg-purple-700">
                  Submit Application
                  
              </button>
  
              {/* {
              errors.length > 0 && (
                  <div className="mb-4 p-3 bg-red-200 rounded-xl">
                      {
                          errors.map((err, i) => (
                              <p key={i} className="text-red-800 font-medium"> {err}</p>
                          ))
                      }
                  </div>
                )
                } */}
          </form>
      </div>
    </div>
    
    </>
  );
  
}

export default ApplyFormpage;