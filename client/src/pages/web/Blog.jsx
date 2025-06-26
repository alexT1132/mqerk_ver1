import { useState } from 'react'
import Navbar from "../../components/mqerk/Navbar";
import Logo from "../../assets/mqerk/mqerk.png";
import Uno from "../../assets/mqerk/blog/1.jpg";
import Dos from "../../assets/mqerk/blog/2.jpg";
import Tres from "../../assets/mqerk/blog/3.jpg";
import Cuatro from "../../assets/mqerk/blog/4.jpg";
import Cinco from "../../assets/mqerk/blog/5.jpg";
import Seis from "../../assets/mqerk/blog/13.jpg";
import Siete from "../../assets/mqerk/blog/6.jpg";
import Ocho from "../../assets/mqerk/blog/7.jpg";
import Nueve from "../../assets/mqerk/blog/8.jpg";
import Diez from "../../assets/mqerk/blog/10.jpg";
import Once from "../../assets/mqerk/blog/17.jpg";
import Doce from "../../assets/mqerk/blog/16.jpg";
import Trece from "../../assets/mqerk/blog/18.jpg";
import catorce from "../../assets/mqerk/blog/20.png";
import Quince from "../../assets/mqerk/blog/19.jpg";
import Dieciseis from "../../assets/mqerk/blog/14.png";
import Diecisiete from "../../assets/mqerk/blog/11.jpg";
import Dieciocho from "../../assets/mqerk/blog/13.jpg";
import Diecinueve from "../../assets/mqerk/blog/9.jpg";
import Veinte from "../../assets/mqerk/blog/12.jpg";
import { FaTag } from "react-icons/fa";
import { IoMdEye } from "react-icons/io";
import { FaFacebook } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { FaYoutube } from "react-icons/fa";
import { AiFillTikTok } from "react-icons/ai";
import { Link } from "react-router-dom";

  const categorias = ["Todos", "Admisión", "Educación", "STEM", "Salud", "Ambiental"];

  const tarjetas = [
    {
      id: "STEM",
      titulo: "¿Por qué fallas en problemas de física? Descubre el truco para entenderlos mejor",
      fecha: "02/06/2025",
      visitas: "1k",
      categoria: "STEM",
      imagen: Uno,
    },
    {
      id: "STEM",
      titulo: "Matemáticas que sí sirven: Cómo usar álgebra para resolver problemas reales",
      fecha: "02/06/2025",
      visitas: "1k",
      categoria: "STEM",
      imagen: Dos,
    },
    {
      id: "Educación",
      titulo: "Estudia con ciencia: Técnicas de memorización que funcionan según la neurociencia",
      fecha: "02/06/2025",
      visitas: "1k",
      categoria: "Educación",
      imagen: Tres,
    },
    {
      id: "STEM",
      titulo: "¡Entiende la tabla periódica sin morir en el intento!",
      fecha: "02/06/2025",
      visitas: "1k",
      categoria: "STEM",
      imagen: Cuatro,
    },
    {
      id: "STEM",
      titulo: "¿Por qué es tan importante aprender a programar desde joven?",
      fecha: "02/06/2025",
      visitas: "1k",
      categoria: "STEM",
      imagen: Cinco,
    },
    {
      id: "Educación",
      titulo: "Experimentos sencillos para entender los estados de la materia (sin laboratorio).",
      fecha: "02/06/2025",
      visitas: "1k",
      categoria: "Educación",
      imagen: Seis,
    },
    {
      id: "Salud",
      titulo: "Biología para la vida: ¿Cómo funciona tu sistema inmunológico realmente?",
      fecha: "02/06/2025",
      visitas: "1k",
      categoria: "Salud",
      imagen: Siete,
    },
    {
      id: "STEM",
      titulo: "Electricidad sin enredos: Entiende voltaje, corriente y resistencia con ejemplos reales.",
      fecha: "02/06/2025",
      visitas: "1k",
      categoria: "STEM",
      imagen: Ocho,
    },
    {
      id: "Educación",
      titulo: "Ciencias que se ven y se sienten: Como hacer un diario de observación científica.",
      fecha: "02/06/2025",
      visitas: "1k",
      categoria: "Educación",
      imagen: Nueve,
    },
    {
      id: "STEM",
      titulo: "¿Cual es el método científico y cómo lo aplicas tú sin darte cuenta?",
      fecha: "02/06/2025",
      visitas: "1k",
      categoria: "STEM",
      imagen: Diez,
    },
    {
      id: "Ambiental",
      titulo: "¿Por qué el calentamiento global es más que una moda? Ciencia detrás del cambio climático.",
      fecha: "02/06/2025",
      visitas: "1k",
      categoria: "Ambiental",
      imagen: Once,
    },
    {
      id: "STEM",
      titulo: "Como resolver problemas matemáticos paso a paso…sin frustarse.",
      fecha: "02/06/2025",
      visitas: "1k",
      categoria: "STEM",
      imagen: Doce,
    },
    {
      id: "STEM",
      titulo: "Tecnología en la escuela: Las mejores herramientas gratuitas para aprender mejor.",
      fecha: "02/06/2025",
      visitas: "1k",
      categoria: "STEM",
      imagen: Trece,
    },
    {
      id: "Educación",
      titulo: "Química en tu casa: Experimentos fáciles con materiales comunes.",
      fecha: "02/06/2025",
      visitas: "1k",
      categoria: "Educación",
      imagen: catorce,
    },
    {
      id: "Salud",
      titulo: "Tu cerebro y el estrés en exámenes: ¿Cómo calmarte científicamente?",
      fecha: "02/06/2025",
      visitas: "1k",
      categoria: "Salud",
      imagen: Quince,
    },
    {
      id: "STEM",
      titulo: "Los números no muerden: ¿Qué son las funciones y cómo entenderlas visualmente?",
      fecha: "02/06/2025",
      visitas: "1k",
      categoria: "STEM",
      imagen: Dieciseis,
    },
    {
      id: "STEM",
      titulo: "¿Como piensan los grandes científico? El arte de hacer preguntas inteligentes.",
      fecha: "02/06/2025",
      visitas: "1k",
      categoria: "STEM",
      imagen: Diecisiete,
    },
    {
      id: "Educación",
      titulo: "Proyectos escolares con impacto: Ideas científicas que puedes llevar a ferias o exposiciones.",
      fecha: "02/06/2025",
      visitas: "1k",
      categoria: "Educación",
      imagen: Dieciocho,
    },
    {
      id: "STEM",
      titulo: "Robot, drones y sensores: ¿Qué puedes aprender hoy para ser ingeniero mañana?",
      fecha: "02/06/2025",
      visitas: "1k",
      categoria: "STEM",
      imagen: Diecinueve,
    },
    {
      id: "Educación",
      titulo: "Como aplicar la ciencia en tu vida diaria: Desde cocinar hasta andar en bici.",
      fecha: "02/06/2025",
      visitas: "1k",
      categoria: "Educación",
      imagen: Veinte,
    },
  ];


function Blog() {

  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todos");

  const tarjetasFiltradas = categoriaSeleccionada === "Todos"
    ? tarjetas
    : tarjetas.filter(t => t.id === categoriaSeleccionada);


  return (
    <div className="min-h-screen flex flex-col" >
        <Navbar />
        {/* movil */}
        <div className="block md:hidden">
          <div className="h-30 w-full mt-4 px-10 flex flex-col">
                <div className='text-4xl text-center px-10 font-bold py-7 text-[#004aad]'>Categorías</div>
                <hr className=' text-[#3c24ba] border-2' />
                <div className='justify-center gap-3 mt-8 grid grid-cols-3'>
                  {categorias.map((cat) => (
                    <button
                      key={cat}
                      className={`w-25 py-2 rounded-full border ${
                        categoriaSeleccionada === cat
                          ? "bg-blue-600 text-white"
                          : "text-blue-700 border-blue-600"
                      }`}
                      onClick={() => setCategoriaSeleccionada(cat)}
                      >
                        {cat}
                      </button>
                    ))}
                </div>
                <div className="grid grid-cols-1 gap-6 mt-6">
                          {tarjetasFiltradas.map((tarjeta, index) => (
                    <div
                      key={index}
                      id={tarjeta.id}
                      className="rounded-xl shadow-md p-4 bg-[#483dc7] text-white"
                    >
                      <img
                        src={tarjeta.imagen}
                        className="rounded-lg mb-4"
                      />
                      <h3 className="font-bold text-2xl text-justify">{tarjeta.titulo}</h3>
                      <div className="text-xs mt-2">
                        <p className='text-[#ced6ff] text-lg'>{tarjeta.fecha}</p>
                        <div className="flex justify-between items-center mt-1 text-[#ced6ff] text-[14px]">
                          <span className="flex items-center gap-1">
                            <FaTag className='text-[#e8aff6]' />
                            {tarjeta.categoria}
                          </span>
                          <span className="flex items-center gap-1">
                            <IoMdEye className='text-white' />
                            {tarjeta.visitas}
                          </span>
                          <span className='hover:text-white cursor-pointer'>Lee más aquí →</span>
                        </div>
                      </div>
                    </div>
                  ))}
                          <div className='flex flex-row gap-4'>
                                                <div className='w-[30%]'>
                                                  <p className='font-bold text-md mt-10' style={{color: '#483dc7'}}>Redes sociales</p>
                                                  <p className='text-[10px] ml-1' style={{color: '#483dc7'}}>@MQerKAcademy</p>
                                                  <div className='flex flex-row gap-2 '>
                                                    <FaFacebook className='w-15 h-15 ' style={{color: '#483dc7'}}/>
                                                    <FaInstagram className='w-15 h-15 ' style={{color: '#483dc7'}}/>
                                                    <FaYoutube className='w-15 h-15 ' style={{color: '#483dc7'}}/>
                                                    <AiFillTikTok className='w-15 h-15 ' style={{color: '#483dc7'}}/>
                                                  </div>
                                                </div>
                                                <div className='mt-15  gap-4 w-30' style={{color: '#483dc7'}}>
                                                  <p className='text-[10px] text-center'>Términos y condiciones</p>
                                                  <hr />
                                                  <p className='text-[10px] text-center'>Políticas de privacidad</p>
                                                </div>
                                                <div className='w-[30%]'>
                                                  <div className='flex justify-center items-center mt-13'>
                                                    <img src={Logo} className='w-10 h-7' />
                                                  </div>
                                                  <p className='text-[10px] mt-3' style={{color: '#483dc7'}}>Copyright © MQerKAcademy 2025</p>
                                                </div>
                                              </div>
                </div>
            </div>
        </div>
        {/* Desktop */}
        <div className="hidden md:block">
            <div className="h-30 w-full mt-4 px-10 flex flex-col">
                <div className='text-4xl px-10 font-bold py-7 text-[#004aad]'>Categorías</div>
                <hr className='ml-10 mr-10 text-[#3c24ba] border-2' />
                <div className='flex justify-center gap-10 sm:gap-5 mt-8'>
                  {categorias.map((cat) => (
                    <button
                      key={cat}
                      className={`w-35 py-2 rounded-full border ${
                        categoriaSeleccionada === cat
                          ? "bg-blue-600 text-white"
                          : "text-blue-700 border-blue-600"
                      }`}
                      onClick={() => setCategoriaSeleccionada(cat)}
                      >
                        {cat}
                      </button>
                    ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6 mt-6">
                  {tarjetasFiltradas.map((tarjeta, index) => (
                    <div
                      key={index}
                      id={tarjeta.id}
                      className="rounded-xl shadow-md p-4 bg-[#483dc7] text-white"
                    >
                      <img
                        src={tarjeta.imagen}
                        className="rounded-lg mb-4"
                      />
                      <h3 className="font-bold text-2xl text-justify">{tarjeta.titulo}</h3>
                      <div className="text-xs mt-2">
                        <p className='text-[#ced6ff] text-lg'>{tarjeta.fecha}</p>
                        <div className="flex justify-between items-center mt-1 text-[#ced6ff] text-[14px]">
                          <span className="flex items-center gap-1">
                            <FaTag className='text-[#e8aff6]' />
                            {tarjeta.categoria}
                          </span>
                          <span className="flex items-center gap-1">
                            <IoMdEye className='text-white' />
                            {tarjeta.visitas}
                          </span>
                          <span className='hover:text-white cursor-pointer'>Lee más aquí →</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
            <div className='flex flex-row p-6'>
                                  <div className='ml-10 w-[35%]'>
                                    <p className='font-bold text-3xl mt-10' style={{color: '#483dc7'}}>Redes sociales</p>
                                    <p className='text-xl' style={{color: '#483dc7'}}>@MQerKAcademy</p>
                                    <div className='flex flex-row gap-3 mt-2'>
                                      <Link target="_blank" rel="noopener noreferrer" to='https://www.facebook.com/MQerKAcademy'>
                                        <FaFacebook className='text-3xl mt-4' style={{color: '#483dc7'}}/>
                                      </Link>
                                      <Link target="_blank" rel="noopener noreferrer" to='https://www.instagram.com/mqerkacademy/profilecard/?igsh=aDJ1bWpvd21seWVp'>
                                        <FaInstagram className='text-3xl mt-4 ml-4' style={{color: '#483dc7'}}/>                          
                                      </Link>
                                      <Link target="_blank" rel="noopener noreferrer" to='https://youtube.com/@mqerkacademy?si=qf26NkQV14VQm04Z'>
                                        <FaYoutube className='text-3xl mt-4 ml-4' style={{color: '#483dc7'}}/>
                                      </Link>
                                      <Link target="_blank" rel="noopener noreferrer" to='https://www.tiktok.com/@mqerkacademy?_t=ZM-8vakwNtkmaV&_r=1'>
                                        <AiFillTikTok className='text-3xl mt-4 ml-4' style={{color: '#483dc7'}}/>
                                      </Link>
                                    </div>
                                  </div>
                                  <div className='flex justify-center items-center w-full gap-10 mt-10'>
                                    <p className='text-[#483dc7]'>Términos y condiciones</p>
                                    <p className='text-[#483dc7]'>|</p>
                                    <p className='text-[#483dc7]'>Políticas de privacidad</p>
                                  </div>
                                  <div className='w-[42%]'>
                                    <div className='flex justify-start items-center mt-13'>
                                      <img src={Logo} className='w-20 h-15' />
                                    </div>
                                    <p className='text-[13px] mt-3 text-[#483dc7]'>Copyright © MQerKAcademy 2025 - Todos los derechos reservados</p>
                                  </div>
                      </div>
            </div>
        </div>
    </div>
  )
}

export default Blog