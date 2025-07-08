// src/components/SideBarComp.jsx
import React, { useState, useRef, useEffect } from "react";
// Importamos los componentes de barra lateral específicos que ahora se exportan de SideBar.jsx
import { SideBarsm, SideBarDesktop } from "./SideBar.jsx";

/**
 * Componente BtnSideBar que gestiona el botón de hamburguesa y el estado de la barra lateral móvil.
 * Renderiza la barra lateral de escritorio y la barra lateral móvil condicionalmente.
 */
export function BtnSideBar() {
    // Estado para controlar si el menú móvil está abierto o cerrado.
    // Este estado ahora se gestiona aquí, en el componente que tiene el botón de hamburguesa.
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    // Ref para el botón de hamburguesa (no estrictamente necesario para el clic fuera si SideBarsm tiene overlay)
    const buttonRef = useRef(null); 

    // Función para alternar el estado del menú móvil.
    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    // Función para cerrar el menú móvil (se pasará a SideBarsm y sus ElementoSideBarMobile).
    const closeMenu = () => {
      setIsMenuOpen(false);
    };

    // Efecto para cerrar el menú móvil si se hace clic fuera del botón (opcional, el overlay ya lo hace).
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Si el clic no fue en el botón de hamburguesa y el menú está abierto
            if (buttonRef.current && !buttonRef.current.contains(event.target) && isMenuOpen) {
                // Si el evento no proviene de un elemento dentro del sidebar móvil, cerrar el menú
                // (esto lo maneja principalmente el overlay de SideBarsm, pero es una capa de seguridad)
                // Para este setup, la lógica del overlay en SideBarsm es suficiente para cerrar.
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isMenuOpen]); // Dependencia en isMenuOpen para re-ejecutar si el menú cambia de estado

    return (
        <>
            {/* Botón de Menú Hamburguesa para Móviles (posición fija inferior derecha) */}
            <button
                onClick={toggleMenu}
                className='sm:hidden fixed bottom-4 right-4 z-50 flex items-center justify-center w-12 h-12 text-white bg-indigo-600 hover:bg-indigo-700 rounded-full shadow-lg transition-colors'
                aria-label="Toggle menú de navegación"
                ref={buttonRef} // Asignamos la referencia al botón
            >
                <svg
                    className="w-7 h-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    {/* Cambia el ícono de hamburguesa a "X" cuando el menú está abierto */}
                    {isMenuOpen ? (
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    ) : (
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 6h16M4 12h16M4 18h16"
                        />
                    )}
                </svg>
            </button>

            {/* Barra Lateral de Escritorio (visible solo en pantallas no-móviles) */}
            {/* Se renderiza siempre para escritorio */}
            <SideBarDesktop />

            {/* Menú Móvil (se muestra solo en móviles cuando isMenuOpen es true) */}
            {/* Se le pasa el estado isMenuOpen y la función closeMenu */}
            <SideBarsm isMenuOpen={isMenuOpen} closeMenu={closeMenu} />
        </>
    );
}
