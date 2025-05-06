import React from 'react';
import NavLogin from "../components/NavLogin.jsx";
import LoginBody from "../components/Login.jsx";

function Login() {
  return (
    <div className='overflow-hidden h-screen'>
        <NavLogin />
        <LoginBody />
    </div>
  )
}

export default Login;