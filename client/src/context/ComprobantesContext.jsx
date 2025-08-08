import { createContext, useContext, useEffect, useState } from 'react'
import { CreateRequest, getComprobantesRequest, getVerificacionComprobanteRequest } from "../api/comprobantes.js";

export const ComprobanteContext = createContext();

export const useComprobante = () => {
    const context = useContext(ComprobanteContext)
    if (!context) {
        throw new Error("useComprobante must be used within a ComprobanteProvider");
    }
    return context;
}

export const ComprobanteProvider = ({children}) => {

    const [comprobantes, setComprobantes] = useState([]);

    const crearComprobante = async (comprobante) => {
        try {
            const res = await CreateRequest(comprobante);
            console.log(res.data)
        } catch (error) {
            console.log(error);
        }
    }

    const getComprobantes = async (grupo, curso) => {
        try {
            const res = await getComprobantesRequest(grupo, curso);
            if (Array.isArray(res.data)) {
                if (res.data.length === 1) {
                    setComprobantes(res.data[0]);
                } else {
                    setComprobantes(res.data);
                }
            } else {
                    setComprobantes(res.data); // si ya es objeto
                }
            } catch (error) {
                    console.log(error);
                }
    }

    const getVerificacionComprobante = async (folio, dataComplete) => {
        try {
            const res = await getVerificacionComprobanteRequest(folio, dataComplete);
            console.log(res.data);
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <ComprobanteContext.Provider value={{
            comprobantes,
            crearComprobante,
            getComprobantes,
            getVerificacionComprobante
        }}>
            {children}
        </ComprobanteContext.Provider>
    )

}