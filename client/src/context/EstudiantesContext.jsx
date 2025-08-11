import { createContext, useContext, useState } from "react";
import { CreateRequest, getEstudiantesRequest, getFolioRequest, getGruposConCantidadRequest } from "../api/estudiantes.js";

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
    const [grupos, setGrupos] = useState([]);
    const [folioObtenido, getFolioObetenido] = useState([]);

    const getFolio = async (curso, anio) => {
        try {
            const res = await getFolioRequest(curso, anio);
            getFolioObetenido(res.data.folio);
        } catch (error) {
            getFolioObetenido(null);
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
            return res.data;
        } catch (error) {
            // Re-lanzar para que la vista pueda manejar el fallo
            throw error;
        }
    }

    const getGrupo = async (curso) => {
        try {
            const res = await getGruposConCantidadRequest(curso);
            if (Array.isArray(res.data)) {
                if (res.data.length === 1) {
                setGrupos(res.data[0]);  // solo el objeto
                } else {
                setGrupos(res.data); // si hay varios, se mantiene el array
                }
            } else {
                setGrupos(res.data); // si ya es objeto
            }
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
            grupos,
            folioObtenido,
            getEstudiantes,
            crearEstudiante,
            getFolio,
            getGrupo,
        }}>
            {children}
        </EstudiantesContext.Provider>
    );
}