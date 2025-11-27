import React from 'react' 
import {useState} from 'react'
import Header from '../components/Header'
import About from '../components/About'

import {createWalletClient,custom} from "viem";

import { hardhat } from 'viem/chains';
import { Link } from 'react-router-dom';

const HomePage = () => {

  // const admin_Address="0x90325cf491afe4f61d363780464afd7a13914db1";

  const[addr, setAddr]=useState(null);  

  // client creation (wallet client creation) for communication with blockchain
  // for getting an address we are requesting
  
  const client= createWalletClient(
                  {
                    chain:hardhat,
                    transport:custom(window.ethereum)
                  }
                );

  async function connectMetamask () { 
    if(!window.ethereum){
      alert("Metamask not installed");
      return;
    }
    try {
      const[reqAddr]= await client.requestAddresses();
           
      setAddr(reqAddr);      
      console.log("Metamask Connected");
      console.log(reqAddr); 

      
    } catch (error) {
        console.error("Failed to connect Metamask",error);        
    }
  }

  return (
    
    <div >
        <Header/>

        {/* <Metamask/> */}

        {/* <div className='flex justify-end m-6'>
          <button 
                  onClick={connectMetamask}
                  className="bg-purple-500 rounded-full
                                    w-70 
                                    font-bold text-white                             
                                    hover:bg-green-400                              
                                    p-4"
                  type="submit" >
            Connect to MetaMask                              
          </button>
        </div> */}

        <About/>    {/**About the Scholaship Dapp */} 
           
        <div className=" flex justify-center gap-6 m-5">
            {/* <button 
                    className="px-6 py-2 rounded-xl bg-emerald-600 
                        text-white font-semibold shadow 
                                    hover:bg-indigo-700">
                View Scholarship                    
            </button> */}
            <Link
                  to="/apply">
              <button 
                      className="px-6 py-2 rounded-xl bg-indigo-600 
                          text-white font-semibold shadow 
                                      hover:bg-indigo-700">
                  Applicant
              </button>
            </Link>
            
            <Link to='/admin'>
              <button 
                    className="px-6 py-2 rounded-xl bg-emerald-600 
                                text-white font-semibold 
                                shadow hover:bg-emerald-700">
                Admin
              </button>              
            </Link>          
          </div> 
    </div>
  )
}

export default HomePage