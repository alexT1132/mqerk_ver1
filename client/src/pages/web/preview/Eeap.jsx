import Navbar from "../../../components/mqerk/Navbar";
import Uno from "../../../assets/mqerk/preview/curso1/3.webp";
import Dos from "../../../assets/mqerk/preview/curso1/4.webp";
import Tres from "../../../assets/mqerk/preview/curso1/15.webp";
import Cuatro from "../../../assets/mqerk/preview/curso1/14.webp";
import Cinco from "../../../assets/mqerk/preview/curso1/13.webp";
import Seis from "../../../assets/mqerk/preview/curso1/12.webp";

function Eeau() {
  return (
    <>
        <Navbar />
        {/* MOVIL */}
        <div className="block md:hidden">
            Movile
        </div>
        {/* DESKTOP */}
        <div className="hidden md:block">
            <div className="w-full">
                <div className="preview_fondo h-180">
                    <div className="absolute top-[43%] left-[39%] transform -translate-x-1/2 -translate-y-1/2">
                        <div className="flex justify-start items-center gap-2">
                            <img src={Uno} className="w-8" />
                            <p className="text-white text-[20px]">Despierta todo tu potencial.</p>
                        </div>
                        <div className="font-bold text-[43px] text-white">
                            <p>Entrenamiento para el Examen de</p>
                            <p>Admisión a la Preparatoria</p>
                        </div>
                        <div className="bg-white w-35 text-center mt-5 text-[#3a14a9] font-bold text-xl py-1 rounded-[10px] cursor-pointer">Empieza ya</div>
                    </div>
                    <div className="absolute top-[90%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                        <h1 className="text-[#3a14a9] font-bold text-5xl">Información del curso</h1>
                    </div>
                    <div class="absolute w-185 top-[108%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-wrap justify-center gap-4">
                        {/* <!-- Tarjeta 1 --> */}
                        <div class="w-33 border border-[#3a14a9] text-[#3a14a9] rounded-lg bg-white shadow-md flex items-center justify-center">
                            <div className="flex justify-center items-center gap-2 py-1">
                                <img src={Dos} className="w-6" />
                                <p>Presencial</p>
                            </div>
                        </div>

                        {/* <!-- Tarjeta 2 --> */}
                        <div class="w-33 border border-[#3a14a9] text-[#3a14a9] rounded-lg bg-white shadow-md flex items-center justify-center">
                            <div className="flex justify-center items-center gap-2 py-1">
                                <img src={Tres} className="w-6" />
                                <p>+ 130 clases</p>
                            </div>
                        </div>

                        {/* <!-- Tarjeta 3 --> */}
                        <div class="w-33 border border-[#3a14a9] text-[#3a14a9] rounded-lg bg-white shadow-md flex items-center justify-center">
                            <div className="flex justify-center items-center gap-2 py-1">
                                <img src={Cuatro} className="w-6" />
                                <p>2 h al día</p>
                            </div>
                        </div>

                        {/* <!-- Tarjeta 4 --> */}
                        <div class="w-33 border border-[#3a14a9] text-[#3a14a9] rounded-lg bg-white shadow-md flex items-center justify-center">
                            <div className="flex justify-center items-center gap-2 py-1">
                                <img src={Cinco} className="w-6" />
                                <p>5 meses</p>
                            </div>
                        </div>

                        {/* <!-- Tarjeta 5 --> */}
                        <div class="w-33 border border-[#3a14a9] text-[#3a14a9] rounded-lg bg-white shadow-md flex items-center justify-center">
                            <div className="flex justify-center items-center gap-2 py-1">
                                <img src={Seis} className="w-6" />
                                <p>Rendimiento</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <div>video</div>
                    <div>tarjeta</div>
                </div>
            </div>
        </div>    
    </>
    )
}

export default Eeau