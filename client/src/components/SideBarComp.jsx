import React from "react";
import { SideBarsm, SideBarDesktop } from "./SideBar.jsx";

export function BtnSideBar({Sidebar, setSidebar, abrirSidebar}){

    

    return(
    <div ref={abrirSidebar}>
    <button className='cursor-pointer h-fit w-fit' onClick={()=>setSidebar(!Sidebar)}>
      <svg className='max-sm:h-[5vh]' xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="48px" fill="#e3e3e3"><path d="M120-240v-60h720v60H120Zm0-210v-60h720v60H120Zm0-210v-60h720v60H120Z"/></svg>
    </button>
    
    {/* <SideBarDesktop/>
    {Sidebar &&
    <SideBarsm Sidebar={Sidebar} setSidebar={setSidebar}/>
    
    
    } */}
    </div>




    );
}