import React from "react";
import { 
        BrowserRouter,
        Routes,
        Route, 
        createBrowserRouter, 
        Navigate, 
        RouterProvider 
      } from 'react-router-dom'

import HomePage from "./pages/HomePage";

import AdminDashboardNew from "./pages/AdminDashboardNew";

// import AddNewScholarship from "./pages/AddNewScholarship";

import ApplyFormpage from "./pages/ApplyFormpage";

const routes=createBrowserRouter(
    [
      {
        path:'/', element:<Navigate to='/home' replace/>
      },
      {
        path:'/home', element:<HomePage/>
      },
      {
        path:'/admin', element:<AdminDashboardNew/>
      },      
      // {
      //   path:"/add",element:<AddNewScholarship/>
      // },
      {
        path:'/apply', element:<ApplyFormpage/>
      }
    ]
  )

function App() {
  return (<RouterProvider router={routes}/>)  
}
export default App;