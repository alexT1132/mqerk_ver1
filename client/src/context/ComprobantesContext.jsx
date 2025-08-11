import { createContext, useContext, useEffect, useState } from 'react'
import { CreateRequest, getComprobantesRequest, getVerificacionComprobanteRequest, rejectVerificacionComprobanteRequest } from "../api/comprobantes.js";

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
            return res.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    const getComprobantes = async (grupo, curso) => {
        try {
            const res = await getComprobantesRequest(grupo, curso);
            // Normalizar siempre a array
            const data = Array.isArray(res.data)
                ? res.data
                : (res.data ? [res.data] : []);
            setComprobantes(data);
        } catch (error) {
            console.log(error);
        }
    }

    const getVerificacionComprobante = async (folio, dataComplete) => {
        try {
            const res = await getVerificacionComprobanteRequest(folio, dataComplete);
            return res.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    const rejectVerificacionComprobante = async (folio, data) => {
        try {
            const res = await rejectVerificacionComprobanteRequest(folio, data);
            return res.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    return (
        <ComprobanteContext.Provider value={{
            comprobantes,
            crearComprobante,
            getComprobantes,
            getVerificacionComprobante,
            rejectVerificacionComprobante
        }}>
            {children}
        </ComprobanteContext.Provider>
    )

}