import { createContext, useContext, useState } from "react";
import { CreateRequest, getEstudiantesRequest, getFolioRequest } from "../api/estudiantes.js";

const EstudiantesContext = createContext();

export const useEstudiantes = () => {
    const context = useContext(EstudiantesContext);

    if (!context) {
        throw new Error("useEstudiantes must be used within a EstudiantesProvider");
    }

    return context;
}

export function EstudiantesProvider({ children }) {

    const [estudiantes, setEstudiantes] = useState([]);
    const [datas, setDatas] = useState([]);
    const [folioObtenido, getFolioObetenido] = useState([]);

    const getFolio = async () => {
        try {
            const res = await getFolioRequest();
            getFolioObetenido(res.data.folio);
        } catch (error) {
            getFolioObetenido(error.status);
        }
    }

    const getEstudiantes = async () => {
        try {
            const res = await getEstudiantesRequest();
            setEstudiantes(res.data.data);
            getFolio();
        } catch (error) {
            console.log(error);
        }
    }

    const crearEstudiante = async (estudiante) => {
        try {
            const res = await CreateRequest(estudiante);
            localStorage.setItem('datosRegistro', JSON.stringify(res.data));
        } catch (error) {
            console.log(error);
        }
    }

    const eliminarNegocio = async (id) => {
        try {
            const res = await EliminarNegocio(id);
            if (res.status === 204) setEstudiantes(estudiantes.filter((negocio) => negocio._id !== id))
        } catch (error) {
            console.log(error);
        }
    }

    const getNegocio = async (id) => {
        try {
            const res = await ObtenerNegocioPorId(id);
            setNegocioSeleccionado(res.data);
            return res.data;
        } catch (error) {
            console.log(error);
        }
    }

    const actualizarNegocio = async (id, datosActualizados) => {
        try {
            const res = await ActualizarNegocio(id, datosActualizados);
            console.log("Negocio actualizado:", res.data);

            // Opcional: actualiza el estado si lo estás manejando en contexto
            setEstudiantes((prev) =>
            prev.map((negocio) =>
                negocio.id === id ? { ...negocio, ...datosActualizados } : negocio
            )
            );

            return res.data;
        } catch (error) {
            console.error("Error al actualizar el negocio", error);
            throw error;
        }
        };

    return (
        <EstudiantesContext.Provider value={{
            estudiantes,
            datas,
            folioObtenido,
            getEstudiantes,
            crearEstudiante,
            getFolio,
        }}>
            {children}
        </EstudiantesContext.Provider>
    );
}