export default function FloatingSidebarButton({ open, onToggle }) {
  return (
    <button
      aria-label={open ? "Cerrar menú" : "Abrir menú"}
      aria-expanded={open}
      onClick={onToggle}
      className="
        fixed z-60 md:hidden
        right-4 bottom-6
        h-12 w-12 rounded-full
        bg-indigo-600 text-white shadow-xl
        flex items-center justify-center
        active:scale-95 transition
      "
      style={{
        // por si hay notch (iOS, Android modernos)
        paddingBottom: "max(env(safe-area-inset-bottom), 0px)"
      }}
    >
      {/* Cambia icono según estado */}
      {open ? (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor">
          <path strokeWidth="2" strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor">
          <path strokeWidth="2" strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      )}
    </button>
  );
}
