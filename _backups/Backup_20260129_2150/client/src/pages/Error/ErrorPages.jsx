import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export const Error500 = () => {
    return (
        <div className="relative overflow-hidden h-screen flex flex-col items-center justify-center bg-gradient-to-br from-rose-900 via-purple-900 to-indigo-900">
            <div className="absolute inset-0">
                <div className="absolute -top-16 -left-16 w-96 h-96 bg-rose-500/20 blur-3xl rounded-full" />
                <div className="absolute -bottom-16 -right-16 w-96 h-96 bg-indigo-500/20 blur-3xl rounded-full" />
            </div>
            <div className="relative z-10 text-center px-6">
                <h1 className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-purple-400 to-indigo-400 drop-shadow">500</h1>
                <p className="mt-4 text-white/90 text-2xl">Error interno del servidor</p>
                <p className="mt-2 text-white/70">Estamos trabajando para solucionarlo. Intenta nuevamente más tarde.</p>
                <Link to="/" className="mt-8 inline-flex items-center px-6 py-3 rounded-xl bg-white/10 text-white border border-white/20 backdrop-blur hover:bg-white/15">
                    Volver al inicio
                </Link>
            </div>
        </div>
    );
};

export const Error404 = () => {
    // Más sobrio: mismo estilo que Error500
    return (
        <div className="relative overflow-hidden h-screen flex flex-col items-center justify-center bg-gradient-to-br from-rose-900 via-purple-900 to-indigo-900">
            <div className="absolute inset-0">
                <div className="absolute -top-16 -left-16 w-96 h-96 bg-rose-500/20 blur-3xl rounded-full" />
                <div className="absolute -bottom-16 -right-16 w-96 h-96 bg-indigo-500/20 blur-3xl rounded-full" />
            </div>

            <div className="relative z-10 text-center px-6">
                <h1 className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-purple-400 to-indigo-400 drop-shadow">404</h1>
                <p className="mt-4 text-white/90 text-2xl">Página no encontrada</p>
                <p className="mt-2 text-white/70">La página que buscas no existe o ha sido movida. Verifica la URL o regresa al inicio.</p>
                <Link to="/" className="mt-8 inline-flex items-center px-6 py-3 rounded-xl bg-white/10 text-white border border-white/20 backdrop-blur hover:bg-white/15">
                    Volver al inicio
                </Link>
            </div>
        </div>
    );
};