import NavLogin from "../components/common/auth/NavLogin";
import LoginBody from "../components/common/auth/Login";

function Login() {
  return (
  <div className='overflow-hidden min-h-screen'>
    <NavLogin />
    <LoginBody />
    </div>
  )
}

export default Login