import React from 'react'
import ButtonBack from './ButtonBack'
// import { useWallet } from '../context/walletContext.jsx';

const Header = () => {

  // const { loggedInAddress, connectWallet, isAdmin, isApplicant } = useWallet();

  return (
    <>
    <div className="bg-stone-300
                    rounded-lg shadow-lg 
                    p-6 m-6 border">
        <h1 className="text-3xl font-bold text-blue-900 ">
            Scholarship Distribution DApp
        </h1>
        <p className="text-gray-600 mt-2">
            Decentralized Scholarship Management on Ethereum
        </p>       
    </div>
    {/* <header className="p-5 bg-white">
      {!loggedInAddress && (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}

      {loggedInAddress && (
        <p>
          Connected: {loggedInAddress.slice(0, 6)}...
          {loggedInAddress.slice(-4)}
        </p>
      )}

      {isAdmin && <p>You are Admin</p>}
      {isApplicant && <p>You are Applicant</p>}
    </header> */}
    </>
        
  )
}

export default Header