import React, { useState } from 'react'

import Header from '../components/Header';
import { Link } from 'react-router-dom';

import { createWalletClient, custom } from 'viem';
import { hardhat } from 'viem/chains';

import {readContract,writeContract} from "viem/actions"



const AddNewScholarship = () => {
        

        const [formData, setFormData] = useState({
                                                name: '',
                                                amount: '',
                                                minScore: '',
                                                totalSeats: '',
                                                requiredAttendance: '',
                                                requiredAcademic: ''
                                                                                                                                     
  });

  const [txStatus, setTxStatus] = useState('');

  function handleChange(e){
                  const{name,value}=e.target;
                  setFormData({
                                ...formData,
                                [name]:value
                  })
        }


  
        const [addr, setAddr]=useState(null);
        
        const [txStatus, setTxStatus] = useState('');

        const [errors, setErrors] = useState([]);
        const [loading, setLoading] = useState(false);

        const client=createWalletClient({
                                        chain:hardhat,
                                        // chain:hoodi,
                                        transport:custom(window.ethereum)
                                })
        // async function connectMetamask(){


        // }
  
        
          function validate(){
                  const errs=[];
                  if(!formData.title) errs.push("Title is required");
                  if(!formData.amount) errs.push("Amt is required");
                  if(!formData.description) errs.push("Description is required");
  
                  setErrors(errs);
                  return errs.length===0;
          }

          function handleSubmit(e){
                  e.preventDefault();
                  if(!validate()) return;
                  setLoading(true);
  
                  console.log("Adding details",formData);
  
                //   setTimeout(() => {
                //           alert("Scholarship added Successfully");
                //           setLoading(false);
                //           }, 800);
                  alert("Scholarship added Successfuly")                
          }  
  
    return (
      <>
      <div>
        <Header/>
        <div>
                <Link 
                        to="/admin" 
                        className='bg-purple-400 font-serif font-bold text-white
                                    rounded text-xl hover:bg-green-400
                                    focus:outline-none focus:shadow-outline m-5 p-1'>
                        Back 
                </Link>
        </div>  
        <section className="mx-auto max-w-2xl p-6 mt-6
                          shadow-2xl rounded-2xl
                          bg-blue-200">
          <h2 className="text-3xl font-bold mb-6 
                          text-purple-700">
              Add New Scholarship
          </h2>
  
          <form 
                  onSubmit={handleSubmit} 
                  className="border grid gap-4
                              rounded-2xl shadow
                              bg-white p-6 ">
              
              <input 
                      type="text" 
                      name="title" 
                      placeholder="Scholarship Title" 
                      onChange={handleChange} 
                      className="p-3 border rounded-xl w-full" />
              <input 
                      type="number" 
                      name="amount" 
                      placeholder="Amount (in ETH)" 
                      onChange={handleChange} 
                      className="p-3 border rounded-xl w-full" />
              
              <textarea 
                      name="description" 
                      placeholder="Scholarship Description" 
                      onChange={handleChange} 
                      className="p-3 border rounded-xl w-full min-h-[120px]" />
  
              <button 
                      disabled={loading} 
                      className="mt-4 px-6 py-3 rounded-xl 
                                  bg-purple-600 text-white font-semibold shadow 
                                  hover:bg-purple-700">
                                      Submit New Scholarship
  
                  {/* {loading ? 'Creating...' : 'Create Scholarship'} */}
              </button>
  
              {/* {message && <p className="mt-2 text-sm">{message}</p>} */}
              {
                  errors.length>0 &&(
                                <div className="mb-4 p-3 bg-red-200 rounded-xl"> 
                                {
                                        errors.map((err,i)=>(
                                                <p key={i} 
                                                        className="text-red-800 font-medium">
                                                                {err}
                                                </p>
                                        ))
                                }
                                </div>
                        )
              }
          </form>
        </section>
      </div>
      </>
    )
  // return (
  //   <div >        
  //       <AddScholarship/>
  //   </div>
  // )
}

export default AddNewScholarship