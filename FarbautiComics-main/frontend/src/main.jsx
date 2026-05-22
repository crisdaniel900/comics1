import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import 'react-toastify/dist/ReactToastify.css'
import './index.css'
import ShopContextProvider from './Context/ShopContext.jsx'
import {ToastContainer} from 'react-toastify'



ReactDOM.createRoot(document.getElementById('root')).render(
    <ShopContextProvider>
     <App />
     <ToastContainer position='top-center'/>
    </ShopContextProvider>
)
