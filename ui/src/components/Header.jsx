import React from 'react'
// import Metamask from './Metamask'
import ButtonBack from './ButtonBack'


const Header = () => {
  return (
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
  )
}

export default Header