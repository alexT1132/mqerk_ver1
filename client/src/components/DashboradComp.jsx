import React, { useState } from "react";



function CardsInfo({Informacion}){
    return(
    <div className="flex w-full h-fit justify-center text-center mb-2">
    <span className="bg-white text-purple-700 font-bold uppercase border border-gray-300 rounded-lg px-6 py-2 shadow-[4px_6px_5px_rgba(0,0,0,0.5)]">
      {Informacion}
    </span>
    </div>
    )
}

function InfoContainer({Icono, TipoDeDato, Dato}){
    return(
        <>
            <li className="flex w-fit items-center">
                <span className="w-6 h-fit">
                {Icono}
                </span>
                <div className="flex gap-1">
                <p className="w-fit text-[#5115bc] font-bold">{TipoDeDato}:</p>
                <p className="">{Dato}</p>
                </div>
            </li>
        </>
    )
}


export function DatosPersonales({Correo, Direccion, Municipio, Numero, Nacimiento, Nacionalidad, Genero, EstadoCivil, RFC}){
    

    const i1=<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#cb1a84"><path d="M168-192q-29.7 0-50.85-21.16Q96-234.32 96-264.04v-432.24Q96-726 117.15-747T168-768h624q29.7 0 50.85 21.16Q864-725.68 864-695.96v432.24Q864-234 842.85-213T792-192H168Zm312-240L168-611v347h624v-347L480-432Zm0-85 312-179H168l312 179Zm-312-94v-85 432-347Z"/></svg>;
    const i2=<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#cb1a84"><path d="M480.21-480Q510-480 531-501.21t21-51Q552-582 530.79-603t-51-21Q450-624 429-602.79t-21 51Q408-522 429.21-501t51 21ZM480-191q119-107 179.5-197T720-549q0-105-68.5-174T480-792q-103 0-171.5 69T240-549q0 71 60.5 161T480-191Zm0 95Q323.03-227.11 245.51-339.55 168-452 168-549q0-134 89-224.5T479.5-864q133.5 0 223 90.5T792-549q0 97-77 209T480-96Zm0-456Z"/></svg>;
    const i3=<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#cb1a84"><path d="M344-471ZM96-144v-456l288-216 205 153q-19 6-36 16t-32 23L384-726 168-564v348h192v72H96Zm336 0v-78q0-20 9.15-36.57Q450.31-275.15 466-285q42-26 88-38.5t94-12.5q52 0 98 12.5t84 38.5q16 11 25 27.59 9 16.58 9 35.41v78H432Zm72-72h288v-6q-31-20-67.5-31T648-264q-38 0-75 10.5T504-223v7Zm144-144q-50 0-85-35t-35-85q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35Zm0-72q20.4 0 34.2-13.8Q696-459.6 696-480q0-20.4-13.8-34.2Q668.4-528 648-528q-20.4 0-34.2 13.8Q600-500.4 600-480q0 20.4 13.8 34.2Q627.6-432 648-432Zm0 216Z"/></svg>;
    const i4=<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#cb1a84"><path d="M763-145q-121-9-229.5-59.5T339-341q-86-86-135.5-194T144-764q-2-21 12.29-36.5Q170.57-816 192-816h136q17 0 29.5 10.5T374-779l24 106q2 13-1.5 25T385-628l-97 98q20 38 46 73t57.97 65.98Q422-361 456-335.5q34 25.5 72 45.5l99-96q8-8 20-11.5t25-1.5l107 23q17 5 27 17.5t10 29.5v136q0 21.43-16 35.71Q784-143 763-145ZM255-600l70-70-17.16-74H218q5 38 14 73.5t23 70.5Zm344 344q35.1 14.24 71.55 22.62Q707-225 744-220v-90l-75-16-70 70ZM255-600Zm344 344Z"/></svg>;
    const i5=<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#cb1a84"><path d="M216-96q-29.7 0-50.85-21.5Q144-139 144-168v-528q0-29 21.15-50.5T216-768h72v-96h72v96h240v-96h72v96h72q29.7 0 50.85 21.5Q816-725 816-696v528q0 29-21.15 50.5T744-96H216Zm0-72h528v-360H216v360Zm0-432h528v-96H216v96Zm0 0v-96 96Zm264.21 216q-15.21 0-25.71-10.29t-10.5-25.5q0-15.21 10.29-25.71t25.5-10.5q15.21 0 25.71 10.29t10.5 25.5q0 15.21-10.29 25.71t-25.5 10.5Zm-156 0q-15.21 0-25.71-10.29t-10.5-25.5q0-15.21 10.29-25.71t25.5-10.5q15.21 0 25.71 10.29t10.5 25.5q0 15.21-10.29 25.71t-25.5 10.5Zm312 0q-15.21 0-25.71-10.29t-10.5-25.5q0-15.21 10.29-25.71t25.5-10.5q15.21 0 25.71 10.29t10.5 25.5q0 15.21-10.29 25.71t-25.5 10.5Zm-156 144q-15.21 0-25.71-10.29t-10.5-25.5q0-15.21 10.29-25.71t25.5-10.5q15.21 0 25.71 10.29t10.5 25.5q0 15.21-10.29 25.71t-25.5 10.5Zm-156 0q-15.21 0-25.71-10.29t-10.5-25.5q0-15.21 10.29-25.71t25.5-10.5q15.21 0 25.71 10.29t10.5 25.5q0 15.21-10.29 25.71t-25.5 10.5Zm312 0q-15.21 0-25.71-10.29t-10.5-25.5q0-15.21 10.29-25.71t25.5-10.5q15.21 0 25.71 10.29t10.5 25.5q0 15.21-10.29 25.71t-25.5 10.5Z"/></svg>;
    
    // const genero = parametro para icono
    // Genero='f';

    const gen=Genero?.toLowerCase()
    const masculino = gen === 'masculino' || gen === 'm' || gen === 'hombre';
    const femenino = gen === 'femenino' || gen === 'f' || gen === 'mujer';

    
    
    const i6=<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#cb1a84"><path d="M480-96q-79 0-149-30t-122.5-82.5Q156-261 126-331T96-480q0-80 30-149.5t82.5-122Q261-804 331-834t149-30q80 0 149.5 30t122 82.5Q804-699 834-629.5T864-480q0 79-30 149t-82.5 122.5Q699-156 629.5-126T480-96Zm0-75q17-17 34-63.5T540-336H420q9 55 26 101.5t34 63.5Zm-91-10q-14-30-24.5-69T347-336H204q29 57 77 97.5T389-181Zm182 0q60-17 108-57.5t77-97.5H613q-7 47-17.5 86T571-181ZM177-408h161q-2-19-2.5-37.5T335-482q0-18 .5-35.5T338-552H177q-5 19-7 36.5t-2 35.5q0 18 2 35.5t7 36.5Zm234 0h138q2-20 2.5-37.5t.5-34.5q0-17-.5-35t-2.5-37H411q-2 19-2.5 37t-.5 35q0 17 .5 35t2.5 37Zm211 0h161q5-19 7-36.5t2-35.5q0-18-2-36t-7-36H622q2 19 2.5 37.5t.5 36.5q0 18-.5 35.5T622-408Zm-9-216h143q-29-57-77-97.5T571-779q14 30 24.5 69t17.5 86Zm-193 0h120q-9-55-26-101.5T480-789q-17 17-34 63.5T420-624Zm-216 0h143q7-47 17.5-86t24.5-69q-60 17-108 57.5T204-624Z"/></svg>;
    const i8=<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#cb1a84"><path d="M96-96v-288l144-48v-144l204-122v-58h-84v-72h84v-84h72v84h84v72h-84v58l204 122v144l144 48v288H528v-144q0-20.4-13.8-34.2Q500.4-288 480-288q-20.4 0-34.2 13.8Q432-260.4 432-240v144H96Zm72-72h192v-72q0-50.16 35-85.08T480-360q50 0 85 34.92T600-240v72h192v-164l-144-48v-155L480-636 312-535v155l-144 48v164Zm312-252q23 0 41.5-18.5T540-480q0-23-18.5-41.5T480-540q-23 0-41.5 18.5T420-480q0 23 18.5 41.5T480-420Zm0 0Z"/></svg>;
    const i9=<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#cb1a84"><path d="M528-432h216v-72H528v72Zm0-120h216v-72H528v72ZM192-336h288v-45q0-29-44-52t-100.5-23q-56.5 0-100 22.5T192-381v45Zm144.21-144Q366-480 387-501.21t21-51Q408-582 386.79-603t-51-21Q306-624 285-602.79t-21 51Q264-522 285.21-501t51 21ZM168-192q-29.7 0-50.85-21.16Q96-234.32 96-264.04v-432.24Q96-726 117.15-747T168-768h624q29.7 0 50.85 21.16Q864-725.68 864-695.96v432.24Q864-234 842.85-213T792-192H168Zm0-72h624v-432H168v432Zm0 0v-432 432Z"/></svg>;

    return(
        <div className="w-fit content-center">
        <CardsInfo Informacion='Datos personales'/>
        <ul className="grid grid-flow-col grid-rows-5 max-sm:flex max-sm:flex-col gap-x-10">
            <InfoContainer Icono={i1} TipoDeDato='Correo Electrónico' Dato={Correo}/>
            <InfoContainer Icono={i2} TipoDeDato='Dirección' Dato={Direccion}/>
            <InfoContainer Icono={i3} TipoDeDato='Municipio' Dato={Municipio}/>
            <InfoContainer Icono={i4} TipoDeDato='Número de teléfono' Dato={Numero}/>
            <InfoContainer Icono={i5} TipoDeDato='Fecha de nacimiento' Dato={Nacimiento}/>
            <InfoContainer Icono={i6} TipoDeDato='Nacionalidad' Dato={Nacionalidad}/>
            <InfoContainer Icono={masculino ? (
                <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#cb1a84"><path d="M768-768v216h-72v-93L564-513q17.54 26.15 26.77 55.58Q600-428 600-396.41q0 85.48-59.28 144.95Q481.44-192 396.22-192T251.5-251.28Q192-310.56 192-395.78t59.35-144.72Q310.69-600 396-600q32 0 61.5 8.5T513-564l132-132h-93v-72h216ZM395.78-528q-54.78 0-93.28 38.72t-38.5 93.5q0 54.78 38.72 93.28t93.5 38.5q54.78 0 93.28-38.72t38.5-93.5q0-54.78-38.72-93.28t-93.5-38.5Z"/></svg>
                    ) : femenino ? (
                        <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#cb1a84"><path d="M444-144v-72h-72v-72h72v-76q-73-14-120.5-70.07Q276-490.15 276-564q0-85.16 59.5-144.58Q395-768 480-768t144.5 59.42Q684-649.16 684-564q0 73.85-47.5 129.93Q589-378 516-364v75.8h72v72.2h-72v72h-72Zm36.22-288q54.78 0 93.28-38.72t38.5-93.5q0-54.78-38.72-93.28t-93.5-38.5q-54.78 0-93.28 38.72t-38.5 93.5q0 54.78 38.72 93.28t93.5 38.5Z"/></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#cb1a84"><path d="M288-444v-72h384v72H288Z"/></svg>
                        )} TipoDeDato='Género' Dato={Genero}/>
            <InfoContainer Icono={i8} TipoDeDato='Estado Civil' Dato={EstadoCivil}/>
            <InfoContainer className='uppercase' Icono={i9} TipoDeDato='RFC' Dato={RFC}/>
        </ul>

        </div>
    )
}



export function DatosAcademicos({NivelEstudios, Titulo, Institucion, Graduacion, Idiomas, Disponibilidad, Horario, Certificaciones}){

    const i1=<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#cb1a84"><path d="M480-144 216-276v-240L48-600l432-216 432 216v312h-72v-276l-96 48v240L480-144Zm0-321 271-135-271-135-271 135 271 135Zm0 240 192-96v-159l-192 96-192-96v159l192 96Zm0-240Zm0 81Zm0 0Z"/></svg>;
    const i2=<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#cb1a84"><path d="M263.72-96Q234-96 213-117.15T192-168v-624q0-29.7 21.16-50.85Q234.32-864 264.04-864h432.24Q726-864 747-842.85T768-792v624q0 29.7-21.16 50.85Q725.68-96 695.96-96H263.72Zm.28-72h432v-624h-72v312l-96-48-96 48v-312H264v624Zm0 0v-624 624Zm168-312 96-48 96 48-96-48-96 48Z"/></svg>;
    const i3=<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#cb1a84"><path d="M192-264v-312h72v312h-72Zm252 0v-312h72v312h-72ZM96-144v-72h768v72H96Zm600-120v-312h72v312h-72ZM96-624v-96l384-192 384 192v96H96Zm113-72h542-542Zm0 0h542L480-831 209-696Z"/></svg>;
    const i4=<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#cb1a84"><path d="M576.23-240Q536-240 508-267.77q-28-27.78-28-68Q480-376 507.77-404q27.78-28 68-28Q616-432 644-404.23q28 27.78 28 68Q672-296 644.23-268q-27.78 28-68 28ZM216-96q-29.7 0-50.85-21.5Q144-139 144-168v-528q0-29 21.15-50.5T216-768h72v-96h72v96h240v-96h72v96h72q29.7 0 50.85 21.5Q816-725 816-696v528q0 29-21.15 50.5T744-96H216Zm0-72h528v-360H216v360Zm0-432h528v-96H216v96Zm0 0v-96 96Z"/></svg>;
    const i5=<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#cb1a84"><path d="M480-96q-79 0-149-30t-122.5-82.5Q156-261 126-331T96-480q0-80 30-149.5t82.5-122Q261-804 331-834t149-30q80 0 149.5 30t122 82.5Q804-699 834-629.5T864-480q0 79-30 149t-82.5 122.5Q699-156 629.5-126T480-96Zm0-75q17-17 34-63.5T540-336H420q9 55 26 101.5t34 63.5Zm-91-10q-14-30-24.5-69T347-336H204q29 57 77 97.5T389-181Zm182 0q60-17 108-57.5t77-97.5H613q-7 47-17.5 86T571-181ZM177-408h161q-2-19-2.5-37.5T335-482q0-18 .5-35.5T338-552H177q-5 19-7 36.5t-2 35.5q0 18 2 35.5t7 36.5Zm234 0h138q2-20 2.5-37.5t.5-34.5q0-17-.5-35t-2.5-37H411q-2 19-2.5 37t-.5 35q0 17 .5 35t2.5 37Zm211 0h161q5-19 7-36.5t2-35.5q0-18-2-36t-7-36H622q2 19 2.5 37.5t.5 36.5q0 18-.5 35.5T622-408Zm-9-216h143q-29-57-77-97.5T571-779q14 30 24.5 69t17.5 86Zm-193 0h120q-9-55-26-101.5T480-789q-17 17-34 63.5T420-624Zm-216 0h143q7-47 17.5-86t24.5-69q-60 17-108 57.5T204-624Z"/></svg>;
    const i6=<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#cb1a84"><path d="m395-285 339-339-50-51-289 288-119-118-50 50 169 170Zm1 102L124-455l152-152 119 118 289-288 153 153-441 441Z"/></svg>;
    const i7=<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#cb1a84"><path d="m614-310 51-51-149-149v-210h-72v240l170 170ZM480-96q-79.38 0-149.19-30T208.5-208.5Q156-261 126-330.96t-30-149.5Q96-560 126-630q30-70 82.5-122t122.46-82q69.96-30 149.5-30t149.55 30.24q70 30.24 121.79 82.08 51.78 51.84 81.99 121.92Q864-559.68 864-480q0 79.38-30 149.19T752-208.5Q700-156 629.87-126T480-96Zm0-384Zm.48 312q129.47 0 220.5-91.5Q792-351 792-480.48q0-129.47-91.02-220.5Q609.95-792 480.48-792 351-792 259.5-700.98 168-609.95 168-480.48 168-351 259.5-259.5T480.48-168Z"/></svg>;
    const i8=<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#cb1a84"><path d="M480-432q-50 0-85-35t-35-85q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35ZM263-48v-280q-43-37-69-99t-26-125q0-130 91-221t221-91q130 0 221 91t91 221q0 64-24 125.5t-72 99.43V-48L480-96 263-48Zm217-264q100 0 170-70t70-170q0-100-70-170t-170-70q-100 0-170 70t-70 170q0 100 70 170t170 70ZM335-138l145-32 144 32v-138q-33 18-69.5 27t-74.5 9q-38 0-75-8.5T335-276v138Zm145-70Z"/></svg>;

    return(
        <div className="w-fit content-center">
        <CardsInfo Informacion='Datos academicos'/>
        <ul className="grid grid-flow-col grid-rows-8">
            <InfoContainer Icono={i1} TipoDeDato='Nivel máximo de estudios' Dato={NivelEstudios}/>
            <InfoContainer Icono={i2} TipoDeDato='Título académico' Dato={Titulo}/>
            <InfoContainer Icono={i3} TipoDeDato='Institución educativa' Dato={Institucion}/>
            <InfoContainer Icono={i4} TipoDeDato='Año de graduación' Dato={Graduacion}/>
            <InfoContainer Icono={i5} TipoDeDato='Idioma(s)' Dato={Idiomas}/>
            <InfoContainer Icono={i6} TipoDeDato='Disponibilidad' Dato={Disponibilidad}/>
            <InfoContainer Icono={i7} TipoDeDato='Horario' Dato={Horario}/>
            <InfoContainer Icono={i8} TipoDeDato='Certificaciones' Dato={Certificaciones}/>
        </ul>
        </div>
    )
}


export function DatosProfesionales({Experiencia, ExperienciaAsesorias, Funcion, Plataformas, Institucion, Area, Puesto}){

    const i1=<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#cb1a84"><path d="M168-216v-432 432-9 9Zm0 72q-29.7 0-50.85-21.15Q96-186.3 96-216v-432q0-29.7 21.15-50.85Q138.3-720 168-720h168v-72.21Q336-822 357.18-843q21.17-21 50.91-21h144.17Q582-864 603-842.85q21 21.15 21 50.85v72h168q29.7 0 50.85 21.15Q864-677.7 864-648v227q-16-16-34-29.5T792-475v-173H168v432h241q3 18 6 36.5t11 35.5H168Zm240-576h144v-72H408v72ZM671.77-48Q592-48 536-104.23q-56-56.22-56-136Q480-320 536.23-376q56.22-56 136-56Q752-432 808-375.77q56 56.22 56 136Q864-160 807.77-104q-56.22 56-136 56ZM696-250v-86h-48v106l79 79 34-34-65-65Z"/></svg>;
    const i2=<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#cb1a84"><path d="M840-144v-600H120v360H48v-360q0-29.7 21.15-50.85Q90.3-816 120-816h720q29.7 0 50.85 21.15Q912-773.7 912-744v528q0 29-21.15 50.5T840-144ZM336-384q-60 0-102-42t-42-102q0-60 42-102t102-42q60 0 102 42t42 102q0 60-42 102t-102 42Zm.21-72Q366-456 387-477.21t21-51Q408-558 386.79-579t-51-21Q306-600 285-578.79t-21 51Q264-498 285.21-477t51 21ZM48-96v-92q0-26 12.5-47T95-270q54-33 115.69-49.5T336-336q64 0 124.5 16.5T577-270q22 13 34.5 34.61T624-188v92H48Zm72-72h432v-24q0-5.18-3.03-9.41-3.02-4.24-7.97-6.59-48-27-99.5-41.5T336-264q-54 0-106 14.5T131-208q-5 3-8 7.03-3 4.04-3 8.97v24Zm216-360Zm0 360Z"/></svg>;
    const i3=<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#cb1a84"><path d="M216-144q-29.7 0-50.85-21.15Q144-186.3 144-216v-528q0-29.7 21.15-50.85Q186.3-816 216-816h171q8-32 34.03-52t59-20Q513-888 539-868t34 52h171q29.7 0 50.85 21.15Q816-773.7 816-744v528q0 29.7-21.15 50.85Q773.7-144 744-144H216Zm264-624q10.4 0 17.2-6.8 6.8-6.8 6.8-17.2 0-10.4-6.8-17.2-6.8-6.8-17.2-6.8-10.4 0-17.2 6.8-6.8 6.8-6.8 17.2 0 10.4 6.8 17.2 6.8 6.8 17.2 6.8ZM216-269q56-46 124-68.5T480-360q72 0 140 22t124 69v-475H216v475Zm264.24-139Q540-408 582-450.24q42-42.24 42-102T581.76-654q-42.24-42-102-42T378-653.76q-42 42.24-42 102T378.24-450q42.24 42 102 42ZM265-216h430q-46-35-101-53.5T480-288q-59 0-113.5 18.5T265-216Zm215-264q-30 0-51-21t-21-51q0-30 21-51t51-21q30 0 51 21t21 51q0 30-21 51t-51 21Zm0-72Z"/></svg>;
    const i4=<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#cb1a84"><path d="M96-192v-96h96v-408q0-29.7 21.15-50.85Q234.3-768 264-768h552v72H264v408h216v96H96Zm516.28 0q-15.28 0-25.78-10.34-10.5-10.34-10.5-25.63v-359.74q0-15.29 10.34-25.79t25.62-10.5h215.76q15.28 0 25.78 10.34 10.5 10.34 10.5 25.63v359.74q0 15.29-10.34 25.79T828.04-192H612.28ZM648-288h144v-264H648v264Zm0 0h144-144Z"/></svg>;
    const i5=<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#cb1a84"><path d="M96-144v-672h384v144h384v528H96Zm72-72h72v-72h-72v72Zm0-152h72v-72h-72v72Zm0-152h72v-72h-72v72Zm0-152h72v-72h-72v72Zm168 456h72v-72h-72v72Zm0-152h72v-72h-72v72Zm0-152h72v-72h-72v72Zm0-152h72v-72h-72v72Zm144 456h312v-384H480v80h72v72h-72v80h72v72h-72v80Zm168-232v-72h72v72h-72Zm0 152v-72h72v72h-72Z"/></svg>;
    const i6=<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#cb1a84"><path d="m352-293 128-76 129 76-34-144 111-95-147-13-59-137-59 137-147 13 112 95-34 144ZM243-144l63-266L96-589l276-24 108-251 108 252 276 23-210 179 63 266-237-141-237 141Zm237-333Z"/></svg>;
    const i7=<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#cb1a84"><path d="M168-144q-29.7 0-50.85-21.15Q96-186.3 96-216v-432q0-29.7 21.15-50.85Q138.3-720 168-720h168v-72.21Q336-822 357.18-843q21.17-21 50.91-21h144.17Q582-864 603-842.85q21 21.15 21 50.85v72h168q29.7 0 50.85 21.15Q864-677.7 864-648v432q0 29.7-21.15 50.85Q821.7-144 792-144H168Zm0-72h624v-432H168v432Zm240-504h144v-72H408v72ZM168-216v-432 432Z"/></svg>;

    return(
        <div className="w-fit content-center">
        <CardsInfo Informacion='Datos profesionales'/>
        <ul className="w-fit grid grid-flow-col grid-rows-7">
            <InfoContainer Icono={i1} TipoDeDato='Experiencia laboral' Dato={Experiencia}/>
            <InfoContainer Icono={i2} TipoDeDato='Experiencia previa en asesorias' Dato={ExperienciaAsesorias}/>
            <InfoContainer Icono={i3} TipoDeDato='Función' Dato={Funcion}/>
            <InfoContainer Icono={i4} TipoDeDato='Plataforma(s) EDTECH' Dato={Plataformas}/>
            <InfoContainer Icono={i5} TipoDeDato='Institución actual' Dato={Institucion}/>
            <InfoContainer Icono={i6} TipoDeDato='Áreas de especialización' Dato={Area}/>
            <InfoContainer Icono={i7} TipoDeDato='Puesto actual' Dato={Puesto}/>
        </ul>
        </div>
    )
}



export function CardDescripcion({cantidad, titulo}) {
    return (
        <aside className="bg-white box-border w-full flex items-center gap-x-4 px-3 py-1 rounded-lg shadow-md">
          <span className="text-pink-500 text-xl font-bold">{cantidad}</span>
          <span className="text-black text-lg font-bold tracking-wide uppercase">{titulo}</span>
        </aside>
    );
  }


export function TarjetaPerfil({src, TituloAsesor, Nombre, Ingreso, cantidadCursos, cantidadEstudiantes, cantidadCertificados, cantidadGeneraciones}){
    return(
        <aside className="flex flex-col box-border bg-linear-to-r from-[#3d18c3] to-[#4816bf] text-white rounded-2xl w-fit h-fit px-2 py-10">
            <a className="w-full h-[200px] flex justify-center mb-2">
                <img className="rounded-xl" src={src} alt="Imagen de perfil del asesor" />
            </a>
            <h1 className="w-full text-center font-extrabold">{TituloAsesor}{Nombre}Ing. Darian Reyes Romero</h1>
            <span className="w-full text-center font-light">Asesor desde {Ingreso}</span>

            <div className="grid grid-flow-col grid-rows-2 gap-4 mt-5">
                <CardDescripcion titulo='Cursos' cantidad={cantidadCursos}/>
                <CardDescripcion titulo='Estudiantes' cantidad={cantidadEstudiantes}/>
                <CardDescripcion titulo='Certificados' cantidad={cantidadCertificados}/>
                <CardDescripcion titulo='Generaciones' cantidad={cantidadGeneraciones}/>
            </div>


            
        
        </aside>
    )
};

export function BtnFuncion({funcion}){
    return(
    <button className="bg-purple-700 h-fit hover:bg-purple-800 text-white font-bold cursor-pointer py-2 px-4 rounded-lg transition-colors duration-300">
      {funcion}
    </button>
    )
};

function BtnSubirDocumento({NombreDocumento}){
    return(
    <button className="bg-purple-700 hover:bg-purple-800 text-white cursor-pointer font-bold rounded-full flex basis-60 h-[50px] box-border text-center items-center gap-3 transition-colors duration-300 w-fit">
        <div className="bg-white rounded-full p-2  flex flex-wrap w-fit h-fit">
            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#cb1a84"><path d="M444-336v-342L339-573l-51-51 192-192 192 192-51 51-105-105v342h-72ZM263.72-192Q234-192 213-213.15T192-264v-72h72v72h432v-72h72v72q0 29.7-21.16 50.85Q725.68-192 695.96-192H263.72Z"/></svg>
        </div>
        <span className="break-normal whitespace-break-spaces text-center">{NombreDocumento}</span> 
    </button>
    )
};

function BtnDescargarDocumento({NombreDocumento}){
    return(
    <button className="bg-purple-700 hover:bg-purple-800 text-white cursor-pointer font-bold rounded-full flex h-[50px] box-border text-center items-center gap-3 transition-colors duration-300 w-[250px]">
        <div className="bg-white rounded-full p-2 flex w-fit h-fit">
            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#cb1a84"><path d="M480-336 288-528l51-51 105 105v-342h72v342l105-105 51 51-192 192ZM263.72-192Q234-192 213-213.15T192-264v-72h72v72h432v-72h72v72q0 29.7-21.16 50.85Q725.68-192 695.96-192H263.72Z"/></svg>
        </div>
        <span className="break-normal whitespace-break-spaces mr-4 text-center">{NombreDocumento}</span> 
    </button>
    )
};

export function Documentacion(){
    return(
        <>
        <CardsInfo Informacion='Documentación' />


        <div className="mb-4 flex flex-wrap gap-7 justify-center">
        <BtnSubirDocumento NombreDocumento='INE (Ambos Lados)'/>
        <BtnSubirDocumento NombreDocumento='Comprobante de domicilio'/>
        <BtnSubirDocumento NombreDocumento='CIF SAT'/>
        <BtnSubirDocumento NombreDocumento='Título académico'/>
        <BtnSubirDocumento NombreDocumento='Cédula profesional'/>
        <BtnSubirDocumento NombreDocumento='Certificaciones'/>
        <BtnSubirDocumento NombreDocumento='CV actualizado'/>
        <BtnSubirDocumento NombreDocumento='Fotografía profesional'/>
        <BtnSubirDocumento NombreDocumento='Carta de recomendación'/>
        </div>
        </>
    )
}

export function Lineamientos(){
    return(
        <>
            <CardsInfo Informacion='Lineamientos'/>

            <div className="mb-4 flex flex-wrap gap-7 justify-center">
            <BtnDescargarDocumento NombreDocumento='Reglamento Interno'/>
            <BtnDescargarDocumento NombreDocumento='Políticas de privacidad'/>
            <BtnDescargarDocumento NombreDocumento='Normativa'/>
            <BtnDescargarDocumento NombreDocumento='Terminos y condiciones'/>
            <BtnDescargarDocumento NombreDocumento='Modelo educativo'/>
            </div>
        </>
    )
}

export function Contrato(){
    return(
        <>
            <CardsInfo Informacion='Contrato(s) laboral(es)'/>
            <div className="mb-4 flex flex-wrap gap-7 justify-center">
            <BtnDescargarDocumento NombreDocumento='Contrato de prestación de servicios'/>
            </div>
        </>
    )
}


// Pagina para testear componentes



export default function Componente({Seccion}){
  const Menu=[
    {
    seccion:`Actividades`
    },
    {
    seccion:`Quizt`
    },
    {
    seccion:`Simuladores`
    }
  ]


    

    return(
    <div className="bg-[#1f1f1f] w-full h-full flex flex-col justify-center items-center border-2 border-amber-400">
      
      
      
      <div>
      <button className={`flex justify-center items-center gap-1`}>
        {`${Menu}`}
        <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#5115bc"><path d="M480-344 240-584l47.33-47.33L480-438.67l192.67-192.66L720-584 480-344Z"/></svg>
      </button>
      </div>



    </div>
    )
}

export function TablaColaboradores({}){

    const asesores = [
    {
        "id": 1,
        "nombre": "Laura Méndez",
        "rfc": "MENL850623ABC",
        "profesion": "Contadora",
        "ingresos": 48000
    },
    {
        "id": 2,
        "nombre": "Carlos Rivera",
        "rfc": "RIVC920415XYZ",
        "profesion": "Ingeniero Civil",
        "ingresos": 62000
    },
    {
        "id": 3,
        "nombre": "Diana López",
        "rfc": "LOPD900311LMN",
        "profesion": "Diseñadora Gráfica",
        "ingresos": 39000
    },

  ];

    return(
        <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">ID</th>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Nombre</th>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">RFC</th>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Profesión</th>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Ingresos</th>
            <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {asesores.map((asesor) => (
            <tr key={asesor.id} className="bg-white hover:bg-gray-50 transition">
              <td className="px-4 py-2 text-sm text-gray-800">{asesor.id}</td>
              <td className="px-4 py-2 text-sm text-gray-800">{asesor.nombre}</td>
              <td className="px-4 py-2 text-sm text-gray-800">{asesor.rfc}</td>
              <td className="px-4 py-2 text-sm text-gray-800">{asesor.profesion}</td>
              <td className="px-4 py-2 text-sm text-gray-800">{asesor.ingresos}</td>
              <td className="px-4 py-2 text-sm text-center">
                <div className="flex justify-center gap-2">
                  <button className="cursor-pointer px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff"><path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z"/></svg></button>
                  <button className="cursor-pointer px-3 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg></button>
                  <button className="cursor-pointer px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    );
}

export function TablaAsesores({}){

    const asesores = [
    {
      id: 1,
      nombre: "Ana García",
      cursos: "Ventas, Liderazgo",
      correo: "ana.garcia@example.com",
      idiomas: "Español, Inglés",
      ingresos: "$3,000",
    },
    {
      id: 2,
      nombre: "Luis Pérez",
      cursos: "Atención al Cliente",
      correo: "luis.perez@example.com",
      idiomas: "Español",
      ingresos: "$2,500",
    },
    {
      id: 3,
      nombre: "Marta López",
      cursos: "Marketing Digital",
      correo: "marta.lopez@example.com",
      idiomas: "Español, Francés",
      ingresos: "$3,200",
    },
  ];

    return(
        <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">ID</th>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Nombre</th>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Cursos</th>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Correo</th>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Idiomas</th>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Ingresos</th>
            <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {asesores.map((asesor) => (
            <tr key={asesor.id} className="bg-white hover:bg-gray-50 transition">
              <td className="px-4 py-2 text-sm text-gray-800">{asesor.id}</td>
              <td className="px-4 py-2 text-sm text-gray-800">{asesor.nombre}</td>
              <td className="px-4 py-2 text-sm text-gray-800">{asesor.cursos}</td>
              <td className="px-4 py-2 text-sm text-gray-800">{asesor.correo}</td>
              <td className="px-4 py-2 text-sm text-gray-800">{asesor.idiomas}</td>
              <td className="px-4 py-2 text-sm text-gray-800">{asesor.ingresos}</td>
              <td className="px-4 py-2 text-sm text-center">
                <div className="flex justify-center gap-2">
                  <button className="cursor-pointer px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff"><path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z"/></svg></button>
                  <button className="cursor-pointer px-3 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg></button>
                  <button className="cursor-pointer px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    );
}




import { useRef } from "react";
export function Buscador(){

    const inputRef = useRef(null);

    const handleFocus = () => {
    inputRef.current?.focus();
    };




    return (
        <div className="w-fit flex items-center">
            <button onClick={handleFocus} className={``}>
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"/></svg>
            </button>
            <input ref={inputRef} className="w-full bg-transparent text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow" placeholder="Buscar..."/>
        </div>
    );
}


export function OrdenarBtn(){
    const [desplegar, setDesplegar] = useState(false);
    const [ordenActual, setOrdenActual] = useState(null);

    const opciones = ["ID", "Nombre", "Cursos", "Correo"];

    const LiAnchorClass ='block px-4 py-2 cursor-pointer hover:bg-gray-100 transition text-gray-700 text-sm';

    const manejarSeleccion = (opcion) => {
    setOrdenActual(opcion);
    setDesplegar(false);
    };

    return(
    <div className="relative w-fit h-fit flex flex-col items-center">
      <button
        onClick={() => setDesplegar(!desplegar)}
        className="inline-flex cursor-pointer items-center p-2 gap-x-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-b-sm shadow-sm hover:bg-gray-300 focus:outline-none transition"
      >
        Ordenar por: <span className="font-semibold text-blue-600">{ordenActual}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="#5985E1"
        >
          <path d="M120-240v-80h240v80H120Zm0-200v-80h480v80H120Zm0-200v-80h720v80H120Z" />
        </svg>
      </button>

      {/* Menú desplegable */}
      <div
        className={`absolute top-full mt-2 z-10 w-48 origin-top rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 transition-all duration-200 ease-out transform ${
          desplegar ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <ul className="w-full flex flex-col text-start">
          {opciones.map((opcion) => (
            <li key={opcion}>
              <a
                className={LiAnchorClass}
                onClick={() => manejarSeleccion(opcion)}
              >
                {opcion}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
    )
}



// Panel principal del administrador

export function BtnPanelAdmin({Informacion, cantidad}){
 

    const MostrarCantidad = cantidad != null && cantidad !== '';

    const colorClass = cantidad < 0 ? `text-red-500` : `text-green-500`;

    return(
    <button className="flex flex-col cursor-pointer h-22 p-4 bg-white w-50 items-center justify-center text-purple-700 border border-gray-300 rounded-lg shadow-[4px_6px_5px_rgba(0,0,0,0.5)]">
    <span className="uppercase w-full text-xl">
      {Informacion}
    
    </span>
    {MostrarCantidad && (
    <span className={`w-full text-end text-2xl ${colorClass} font-bold`}>{new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
          }).format(cantidad)}</span>
    )}
    
    
    </button>
    )
}


export function DashboardAdmin(){
    
    <div className="flex flex-col gap-y-10">
        <div className="flex justify-center p-10 gap-x-5">
            <BtnPanelAdmin Informacion={'Reporte mensual'}/>
            <BtnPanelAdmin Informacion={'Reporte anual'}/>
        </div>

        <div className="flex flex-wrap w-full justify-center gap-5">
            <BtnPanelAdmin Informacion={'Ingresos'} cantidad={Math.random()}/>
            <BtnPanelAdmin Informacion={'Egresos'} cantidad={Math.random()}/>
            <BtnPanelAdmin Informacion={'Usuarios'} cantidad={Math.random()}/>
            <BtnPanelAdmin Informacion={'Asesores'} cantidad={Math.random()}/>
            <BtnPanelAdmin Informacion={'Cursos activos'} cantidad={Math.random()}/>
            <BtnPanelAdmin Informacion={'Actividad diaria'} cantidad={Math.random()}/>
            <BtnPanelAdmin Informacion={'Nuevos usuarios'} cantidad={Math.random()}/>
            <BtnPanelAdmin Informacion={'Ingreso anual'} cantidad={Math.random()}/>
            <BtnPanelAdmin Informacion={'Tasa de retención'} cantidad={Math.random()}/>
            <BtnPanelAdmin Informacion={'Tasa de abandono'} cantidad={Math.random()}/>
            <BtnPanelAdmin Informacion={'Bajas'} cantidad={Math.random()}/>
            <BtnPanelAdmin Informacion={'Número de asesores'} cantidad={Math.random()}/>
            <BtnPanelAdmin Informacion={'Certificados emitidos'} cantidad={Math.random()}/>
            <BtnPanelAdmin Informacion={'crecimiento mensual'} cantidad={Math.random()}/>
            <BtnPanelAdmin Informacion={'crecimiento anual'} cantidad={Math.random()}/>
        </div>

        <div className="flex w-full">
            <Container SeccionDashboard={'Analíticas'} Contenido={<AnaliticasAdmin/>}/>
        </div>
        </div>


}










// Pagina para el dashboard del asesor


import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { LineChart } from '@mui/x-charts/LineChart';

export function AnaliticasAdmin(){
    return(
        <div className="flex flex-wrap justify-center gap-8">
            <div className="flex flex-col justify-center">
            <h3 className="text-center">Ingresos/Egresos mensuales</h3>
            <BarChart
            xAxis={[{ data: ['group A', 'group B', 'group C'] }]}
            series={[{ data: [4, 3, 5] }, { data: [1, 6, 3] }, { data: [2, 5, 6] }]}
            height={300}
            />
            </div>

            <div className="flex flex-col justify-center">
            <h3 className="text-center">Cursos vendidos a usuarios</h3>
            <LineChart
            xAxis={[{ data: [1, 2, 3, 5, 8, 10] }]}
            series={[
                {
                data: [2, 5.5, 2, 8.5, 1.5, 5],
                },
            ]}
            height={300}
            />
            </div>

            <div className="flex flex-col justify-center">
            <h3 className="text-center">Meta de ventas mensuales</h3>
            <PieChart
            series={[
                {
                data: [
                    { id: 0, value: 10, label: 'series A' },
                    { id: 1, value: 15, label: 'series B' },
                    { id: 2, value: 20, label: 'series C' },
                ],
                },
            ]}
            width={200}
            height={200}
            />
            </div>

            <div className="flex flex-col justify-center">
            <h3 className="text-center">Usuarios</h3>
            <BarChart
            yAxis={[{ data: ['group A', 'group B', 'group C'] }]}
            series={[{ data: [4, 3, 5] }, { data: [1, 6, 3] }, { data: [2, 5, 6] }]}
            height={300}
            layout="horizontal"
            />
            </div>

            <div className="flex flex-col justify-center">
            <h3 className="text-center">Meta de venta anual</h3>
            <PieChart
            series={[
                {
                data: [
                    { id: 0, value: 10, label: 'series A' },
                    { id: 1, value: 15, label: 'series B' },
                    { id: 2, value: 20, label: 'series C' },
                ],
                },
            ]}
            width={200}
            height={200}
            />
            </div>
        
        </div>
    )
}


export function Analiticas({TituloTabla1, TituloTabla2}){
    return(
        <div className="flex">
        <div className="w-full flex flex-col">
        <h3 className="text-center font-semibold text-[#5915bb] uppercase">{TituloTabla1}</h3>
        <BarChart
        xAxis={[
        {
        id: 'barCategories',
        data: ['Clase A', 'Clase B', 'Clase C'],
        },
        ]}
        series={[
        {
        data: [2, 5, 3],
        },
        ]}
        height={300}
        />
        </div>

        <div className="w-full">
        <h3 className="text-center pb-5 font-semibold text-[#5915bb] uppercase">{TituloTabla2}</h3>
        <PieChart
        series={[
            {
            data: [
                { id: 0, value: 10, color:'#483dc7',  label: 'Grupo A' },
                { id: 1, value: 15, label: 'Grupo B' },
                { id: 2, value: 20, label: 'Grupo C' },
            ],
            },
        ]}
        width={200}
        height={200}
        />
        </div>



        </div>
    )
}



export function Container({SeccionDashboard, ModalCursos, Contenido}){
    return(
    <aside className="flex flex-col w-full">
    <div className="pb-4 flex items-center gap-x-1">
    <h2 className="text-2xl text-[#f4138a] font-bold">
        {SeccionDashboard}
    </h2>
    {ModalCursos}

    </div>

    {Contenido}
    </aside>
    );
}


export function ModalCursos(){
    const [modal, setModal]=useState(false);

    const [helpertext, setHelpertext]=useState(false);

    const ShowHelperText = () => {
        setHelpertext(true);
      };
    
      const NoHelperText = () => {
        setHelpertext(false);
      };

    return(

        <div>
        <button className="flex cursor-pointer rounded-full hover:bg-blue-100 active:bg-blue-200 transition-all duration-50 active:shadow-inner" onMouseEnter={ShowHelperText} onMouseLeave={NoHelperText}>
        
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#7a7a7a"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/></svg>
        

        
        
        </button>

        <div className="absolute py-0.5">
        {helpertext &&(
            <p className='relative w-fit h-fit cursor-default bg-white px-2 rounded-xl shadow-md text-xl transition-shadow'>Crea una clase</p>
        )}

        </div>
        </div>
    )
}

export function BtnCursoActivo({src, NombreCurso}){


    return(

        
        <button className="p-3 gap-x-6 cursor-pointer flex border-2 w-fit border-[#483dc7] rounded-2xl">
            <img className="aspect-square w-15 text-white" src={src} alt="Logo del curso"/>
            <h2 className="text-[#f4138a] font-black w-35 text-start">{NombreCurso}</h2>
        </button>
    );
}

