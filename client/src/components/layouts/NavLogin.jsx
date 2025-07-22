import React from 'react';
import { Logos } from "../../pages/public/IndexComp.jsx";

export default function NavLogin() {
    return (
        <nav className="flex items-center justify-between p-4 bg-white shadow-md">
            <Logos />
            <div className="text-lg font-semibold text-gray-700">
                Iniciar Sesión
            </div>
        </nav>
    );
}
