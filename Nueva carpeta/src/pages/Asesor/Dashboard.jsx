import Navbar from "../../components/NavBar";
import React from "react";

export function DashboardAsesor(){
    return(

        <>
        <Navbar/>
        </>
    )
}

function CardsInfo({Informacion}){
    return(
    <div className="flex w-full justify-center">
    <span className="bg-white text-purple-700 font-bold uppercase border border-gray-300 rounded-lg px-6 py-2 shadow-[4px_6px_8px_rgba(0,0,0,0.5)]">
      {Informacion}
    </span>
    </div>
    )
}

function InfoContainer({Icono, TipoDeDato, Dato}){
    return(
        <>
            <li className="flex">
                {Icono}
                <p>{TipoDeDato}:</p>
                <p>{Dato}</p>
            </li>
        </>
    )
}

export function DatosPersonales(){
    const IconoEmail=<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#e3e3e3"><path d="M168-192q-29.7 0-50.85-21.16Q96-234.32 96-264.04v-432.24Q96-726 117.15-747T168-768h624q29.7 0 50.85 21.16Q864-725.68 864-695.96v432.24Q864-234 842.85-213T792-192H168Zm312-240L168-611v347h624v-347L480-432Zm0-85 312-179H168l312 179Zm-312-94v-85 432-347Z"/></svg>
    const DatoEmail='ejemplo@hotmail.com'

    return(
        <div className="w-fit content-center">
        <CardsInfo Informacion='Datos personales'/>
        <ul className="grid grid-flow-col grid-rows-5 w-[50vw]">
            <InfoContainer Icono={IconoEmail} TipoDeDato='Correo Electrónico' Dato={DatoEmail}/>
            <InfoContainer Icono={IconoEmail} TipoDeDato='Dirección' Dato=''/>
            <InfoContainer Icono={IconoEmail} TipoDeDato='Municipio' Dato=''/>
            <InfoContainer Icono={IconoEmail} TipoDeDato='Número de teléfono' Dato=''/>
            <InfoContainer Icono={IconoEmail} TipoDeDato='Fecha de nacimiento' Dato=''/>
            <InfoContainer Icono={IconoEmail} TipoDeDato='Nacionalidad' Dato=''/>
            <InfoContainer Icono={IconoEmail} TipoDeDato='Género' Dato=''/>
            <InfoContainer Icono={IconoEmail} TipoDeDato='Estado Civil' Dato=''/>
            <InfoContainer Icono={IconoEmail} TipoDeDato='RFC' Dato=''/>
        </ul>

        </div>
    )
}

function DatosAcademicos(){
    return(
        <>
        <CardsInfo Informacion='Datos academicos'/>
        </>
    )
}
function DatosProfesionales(){
    return(
        <>
        <CardsInfo Informacion='Datos profesionales'/>
        </>
    )
}