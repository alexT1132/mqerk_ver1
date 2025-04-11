import React from 'react'
import NavIndex from "../components/NavIndex.jsx";
import FondoPage from "../components/IndexBody.jsx";

function App() {
  return (
    <div className='overflow-hidden h-screen'>
        <NavIndex />
        <FondoPage />
    </div>
  )
}

export default App