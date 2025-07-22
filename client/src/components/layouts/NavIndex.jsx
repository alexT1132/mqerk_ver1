import React from 'react';
import { Logos } from "../../pages/public/IndexComp.jsx";
import { Login } from "../../pages/public/IndexComp.jsx";

export default function NavIndex() {
    return (
        <nav className="flex items-center justify-between p-4 bg-white shadow-md">
            <Logos />
            <div className="flex items-center space-x-4">
                <Login />
            </div>
        </nav>
    );
}
