import React from "react";
import NavbarBase from "../layout/Navbar/NavbarBase.jsx";
import Logo from "../../assets/MQerK_logo.png";

// Iconos para el dropdown
const StarIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>;
const RocketIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.585 15.585a6.215 6.215 0 01-8.828 0 1.25 1.25 0 00-1.768 1.768 8.715 8.715 0 0012.364 0 1.25 1.25 0 00-1.768-1.768z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.585 8.415a6.215 6.215 0 010 8.828 1.25 1.25 0 001.768 1.768 8.715 8.715 0 000-12.364 1.25 1.25 0 00-1.768 1.768z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.415 8.415a6.215 6.215 0 018.828 0 1.25 1.25 0 001.768-1.768 8.715 8.715 0 00-12.364 0 1.25 1.25 0 001.768 1.768z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.415 15.585a6.215 6.215 0 010-8.828 1.25 1.25 0 00-1.768-1.768 8.715 8.715 0 000 12.364 1.25 1.25 0 001.768-1.768z" /></svg>;
const GlobeIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>;
const MapIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>;
const MusicIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>;

const MqerkNavbar = () => {
  const menuItems = [
    {
      type: "link",
      label: "Inicio",
      to: "/#inicio",
    },
    {
      type: "link",
      label: "Acerca de",
      to: "/acerca_de",
    },
    {
      type: "link",
      label: "Cursos",
      to: "/#cursos",
    },
    {
      type: "dropdown",
      label: "Eventos",
      children: [
        {
          label: "Talleres",
          to: "/talleres",
          icon: <StarIcon />,
        },
        {
          label: "Bootcamps",
          to: "/bootcamps",
          icon: <RocketIcon />,
        },
        {
          label: "Exporientas",
          to: "/exporientas",
          icon: <MapIcon />,
        },
        {
          label: "Online",
          to: "/online",
          icon: <GlobeIcon />,
        },
        {
          label: "Podcast",
          to: "https://open.spotify.com/",
          isExternal: true,
          icon: <MusicIcon />,
        },
      ],
    },
    {
      type: "link",
      label: "Blog",
      to: "/blog",
    },
  ];

  return (
    <NavbarBase
      variant="landing"
      logo={Logo}
      menuItems={menuItems}
      className="border-b border-white/10"
    />
  );
};

export default MqerkNavbar;