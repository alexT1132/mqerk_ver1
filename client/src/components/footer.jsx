import { Link } from "react-router-dom";
import { FaFacebook } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { FaYoutube } from "react-icons/fa";
import { AiFillTikTok } from "react-icons/ai";
import Logo from "../assets/mqerk/mqerk.png";


function footer() {
  return (
   <div>
    {/* Movil */}
    <div className="block md:hidden">
      <div className='flex flex-row p-3 gap-5'>
                            <div className='w-[30%]'>
                              <p className='font-bold text-md mt-10' style={{color: '#483dc7'}}>Redes sociales</p>
                              <p className='text-[10px] ml-1' style={{color: '#483dc7'}}>@MQerKAcademy</p>
                              <div className='flex flex-row gap-2 '>
                                <Link target="_blank" rel="noopener noreferrer" to='https://www.facebook.com/MQerKAcademy'>
                                  <FaFacebook className='w-5 h-5' style={{color: '#483dc7'}}/>
                                </Link>
                                <Link target="_blank" rel="noopener noreferrer" to='https://www.instagram.com/mqerkacademy/profilecard/?igsh=aDJ1bWpvd21seWVp'>
                                  <FaInstagram className='w-5 h-5' style={{color: '#483dc7'}}/>                          
                                </Link>
                                <Link target="_blank" rel="noopener noreferrer" to='https://youtube.com/@mqerkacademy?si=qf26NkQV14VQm04Z'>
                                  <FaYoutube className='w-5 h-5' style={{color: '#483dc7'}}/>
                                </Link>
                                <Link target="_blank" rel="noopener noreferrer" to='https://www.tiktok.com/@mqerkacademy_oficial?_t=ZS-8yuStzsYL1I&_r=1'>
                                  <AiFillTikTok className='w-5 h-5' style={{color: '#483dc7'}}/>
                                </Link>
                              </div>
                            </div>
                            <div className='mt-15  gap-4 w-30' style={{color: '#483dc7'}}>
                              <Link to='/terminos_y_condiciones' className='text-[10px] text-center'>Términos y condiciones</Link>
                              <hr />
                              <Link to='/politicas_de_privacidad' className='text-[10px] text-center'>Políticas de privacidad</Link>
                            </div>
                            <div className='w-[30%]'>
                              <div className='flex justify-center items-center mt-13'>
                                <img src={Logo} className='w-10 h-7' />
                              </div>
                              <p className='text-[10px] mt-3' style={{color: '#483dc7'}}>Copyright © MQerKAcademy 2025</p>
                            </div>
                          </div>
    </div>
    {/* Desktop */}
    <div className="hidden md:block">
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
                          <Link target="_blank" rel="noopener noreferrer" to='https://www.tiktok.com/@mqerkacademy_oficial?_t=ZS-8yuStzsYL1I&_r=1'>
                            <AiFillTikTok className='text-3xl mt-4 ml-4' style={{color: '#483dc7'}}/>
                          </Link>
                        </div>
                      </div>
                      <div className='flex justify-center items-center w-full gap-10 mt-10'>
                        <Link to='/terminos_y_condiciones' className='text-[#483dc7]'>Términos y condiciones</Link>
                        <p className='text-[#483dc7]'>|</p>
                        <Link to='/politicas_de_privacidad' className='text-[#483dc7]'>Políticas de privacidad</Link>
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
  )
}

export default footer