import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {app} from "./firebase";
import { loginWithGoogle } from './auth';

function App() {
  console.log("firebase app:", app);
  return (
    <div style={{padding:"30px"}}>
      <h1>Student Hub 🤯</h1>
      <button onClick={loginWithGoogle}>
        Test Google login
      </button>
    </div>
  )

  
}

export default App;
