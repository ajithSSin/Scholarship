import React from 'react'
import { Link } from 'react-router-dom'


const ButtonBack = () => {
  return (
    <div>
        <Link 
                to="/home" 
                className='bg-purple-400 font-serif font-bold text-white
                                    rounded text-xl hover:bg-green-400
                                    focus:outline-none focus:shadow-outline m-5 p-1'>
                        Back Home
        </Link>
    </div>
  )
}

export default ButtonBack