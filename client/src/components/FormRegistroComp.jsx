import React, {useState, useRef} from "react";

export const TestComp=()=>{
    return(
        <div className={`bg-[#1f1f1f] w-full h-full flex flex-col justify-center items-center`}>
        
        </div>
    );
};

export const BtnForm=({type, TextoBtn, onClick})=>{
    return(
        <button onClick={onClick} type={type} className={`bg-[#0064fb] hover:bg-blue-700 rounded-[10px] select-none p-3 cursor-pointer`}>
            <p className={`text-white`}>
            {TextoBtn}
            </p>
        </button>
    );
};

export const BtnSubirArchivo = ({ helperText }) => {
    const usarInput = useRef(null);
    const [archivo, setArchivo] = useState(null);

    const inputPointer = () => {
        usarInput.current.click();
    };

    const handleArchivoChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const allowedExtensions = ['pdf', 'doc', 'docx', 'jpg', 'png'];
            const fileExtension = file.name.split('.').pop().toLowerCase();

            if (!allowedExtensions.includes(fileExtension)) {
                alert('Tipo de archivo no permitido. Solo se permiten: pdf, doc, docx, jpg, png');
                e.target.value = ""; // Limpia el input
                setArchivo(null);
                return;
            }

            setArchivo(file);
            // Si quieres guardar en localStorage:
            // const reader = new FileReader();
            // reader.onload = () => {
            //     localStorage.setItem("archivoSubido", reader.result);
            // };
            // reader.readAsDataURL(file);
        }
    };

    return (
        <div className={`flex flex-col items-center`}>
            <button
                onClick={inputPointer}
                type={`button`}
                className={`flex justify-center items-center gap-2 bg-[#1976d2] shadow-md rounded-md px-3 py-1.5 cursor-pointer`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#e3e3e3"><path d="M440-200h80v-167l64 64 56-57-160-160-160 160 57 56 63-63v167ZM240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h320l240 240v480q0 33-23.5 56.5T720-80H240Zm280-520v-200H240v640h480v-440H520ZM240-800v200-200 640-640Z"/></svg>
                <p className={`text-white uppercase font-bold`}>
                    Archivo
                </p>
                <input
                    accept=".pdf,.doc,.docx,.jpg,.png"
                    type='file'
                    className='hidden'
                    ref={usarInput}
                    onChange={handleArchivoChange}
                />
            </button>
            <p className={`text-xs select-none flex px-3 py-1 relative text-center text-gray-600 font-[helvetica]`}>
                {archivo ? `Archivo seleccionado: ${archivo.name}` : helperText}
            </p>
        </div>
    );
};

export const LabelSubirArchivo=({Label, helperText})=>{
    return(
        <label className='flex flex-col text-center w-full h-30 sm:w-100 items-center justify-center border-2 border-[#5215bb] rounded-2xl gap-2 p-2'>
            <p>{Label}</p>
            <BtnSubirArchivo helperText={helperText}/>
        </label>
    )
}