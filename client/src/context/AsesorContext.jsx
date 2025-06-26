import { createContext, useContext, useState } from "react";

const AsesorContext = createContext();

export const useAsesor = () => {
    const context = useContext(AsesorContext);

    if (!context) {
        throw new Error("useAsesor must be used within a AsesorProvider");
    }

    return context;
}

export function AsesorProvider({ children }) {

    const [datos1, setDatos1] = useState([]);
    const [bigFive, setBigFive] = useState([]);  // 22
    const [dass21, setDass21] = useState([]);  // 21
    const [zavic, setZavic] = useState([]);  // 30
    const [barOn, setBarOn] = useState([]);  // 25
    const [wais, setWais] = useState([]);  // 25
    const [pruebaAcademica, setPruebaAcademica] = useState([]);

    const preSignup = async (data) => {
        setDatos1(data);
    }

    return (
        <AsesorContext.Provider value={{
            datos1,
            preSignup,
        }}>
            {children}
        </AsesorContext.Provider>
    )

}