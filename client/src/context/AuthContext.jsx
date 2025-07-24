import { createContext, useContext, useEffect, useState } from 'react'
import { registerRequest, loginRequest, verifyTokenRequest } from "../api/usuarios.js";
import Cookies from "js-cookie";

export const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

export const AuthProvider = ({children}) => {

    const [user, setUser] = useState([]);
    const [alumno, setAlumno] = useState([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(true);

    const signup = async (user) => {
        try {
            const res = await registerRequest(user);
            console.log(res.data);
        } catch (error) {
            console.log(error);
        }
    }

    const signin = async (user) => {
        try {
            const res = await loginRequest(user);
            console.log(res.data.usuario);
            setUser(res.data.usuario);
            setAlumno(res.data.estudiante);
            setIsAuthenticated(true);
        } catch (error) {
            const errMsg = error.response?.data?.message;
            setErrors(Array.isArray(errMsg) ? errMsg : [errMsg || "Error desconocido"]);
        }
    }

    const envioComprobante = async (comprobante) => {
        
    }

    // const logout = () => {
    //     logoutRequest();
    //     Cookies.remove('token');
    //     setIsAuthenticated(false);
    //     setUser(null);
    // }

    // const getUsuarios = async () => {
    //     try {
    //         const res = await ObtenerUsuarios();
    //         setUsers(res.data.data);
    //     } catch (error) {
    //         console.log(error);
    //     }
    // }

    useEffect(() => {
        if (errors.length > 0) {
            const timer = setTimeout(() => {
                setErrors([])
            }, 3000)
            return () => clearTimeout(timer)
        }
    }, [errors]);

    useEffect(() => {
        async function checkLogin () {
            const cookies = Cookies.get();

            if (!cookies.token) {
                setIsAuthenticated(false)
                setLoading(false)
                return setUser(null)
            }

            try {
                const res = await verifyTokenRequest(cookies.token);
                if (!res.data) {
                    setIsAuthenticated(false)
                    setLoading(false);
                    return
                }

                setIsAuthenticated(true)
                setUser(res.data.usuario)
                setAlumno(res.data.estudiante);
                setLoading(false)
            } catch (error) {
                setIsAuthenticated(false)
                setUser(null)
                setLoading(false)
            }
        }

        checkLogin();
    }, []);

    return (
        <AuthContext.Provider value={{
            signup,
            signin,
            errors,
            user,
            alumno,
            isAuthenticated,
            loading
        }}>
            {children}
        </AuthContext.Provider>
    )

}