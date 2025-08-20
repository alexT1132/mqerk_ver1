import { createContext, useContext, useState, useEffect } from "react";

const AsesorContext = createContext();

export const useAsesor = () => {
    const context = useContext(AsesorContext);

    if (!context) {
        throw new Error("useAsesor must be used within a AsesorProvider");
    }

    return context;
}

export function AsesorProvider({ children }) {

    const [datos1, setDatos1] = useState(null);
    const [preregistroId, setPreregistroId] = useState(()=>{
        const stored = localStorage.getItem('asesor_preregistro_id');
        return stored ? Number(stored) : null;
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    // Eliminados estados de tests

    const preSignup = async (data) => {
        try {
            setLoading(true);
            setError(null);
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:1002'}/api/asesores/preregistro`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(data)
            });
            if(!res.ok){
                const body = await res.json().catch(()=>({}));
                throw new Error(body.message || 'Error al preregistrar');
            }
            const body = await res.json();
            setDatos1(body.preregistro);
            setPreregistroId(body.preregistro.id);
            localStorage.setItem('asesor_preregistro_id', String(body.preregistro.id));
        } catch (e) {
            setError(e.message);
            throw e;
        } finally {
            setLoading(false);
        }
    };

    // Función saveTestResults eliminada (flujo sin tests)

    const loadPreRegistro = async () => {
        if(!preregistroId || datos1) return;
        setLoading(true); setError(null);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:1002'}/api/asesores/preregistro/${preregistroId}`, { credentials:'include' });
            if(res.status === 404){
                // ID inválida: limpiar estado para forzar preregistro de nuevo
                localStorage.removeItem('asesor_preregistro_id');
                setPreregistroId(null);
                setError('El preregistro ya no existe, vuelve a registrarte');
                return;
            }
            if(!res.ok){
                const bodyErr = await res.json().catch(()=>({}));
                throw new Error(bodyErr.message || 'Error cargando preregistro');
            }
            const body = await res.json();
            setDatos1(body.preregistro);
        } catch(err){
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(()=>{
        if(preregistroId && !datos1){
            loadPreRegistro();
        }
    },[preregistroId]);

    return (
        <AsesorContext.Provider value={{
            datos1, preregistroId, loading, error,
            preSignup,
            loadPreRegistro,
        }}>
            {children}
        </AsesorContext.Provider>
    )

}