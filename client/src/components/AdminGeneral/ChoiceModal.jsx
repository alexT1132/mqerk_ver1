import { useEffect } from "react";

export default function ChoiceModal({
  open,
  onClose,
  brand = "",
  subtitle = "",
  icon = [],
  color = "",
  gradier = "",
  options = [],
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    document.body.classList.add("overflow-hidden");
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.classList.remove("overflow-hidden");
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl md:max-w-lg">
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-3 top-3 rounded-full p-2 text-gray-500 hover:bg-gray-100"
        >
          ✕
        </button>

        <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-2xl text-blue-700">
          <img src={icon} alt={brand} />
        </div>

        <h3 className={`mt-4 text-center text-2xl font-extrabold tracking-tight ${color}`}>
          {brand}
        </h3>
        <p className="mt-1 text-center text-gray-600">{subtitle}</p>

        {options.map((opt, i) => (
          <button
            key={i}
            onClick={opt.onClick}
            className={`mt-3 flex w-full items-center justify-between rounded-xl ${gradier} px-4 py-4 text-left text-white shadow hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15">
                {/* ícono genérico (globo/monitor) puedes cambiarlo por opt.icon si quieres */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeWidth={1.8} d="M12 3a9 9 0 100 18 9 9 0 000-18zm0 0c2.5 2.5 2.5 15.5 0 18m0-18C9.5 5.5 9.5 18.5 12 21M3 12h18"/>
                </svg>
              </div>
              <div>
                <p className="text-base font-semibold">{opt.label}</p>
                {opt.sublabel && <p className="text-sm opacity-90">{opt.sublabel}</p>}
              </div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-90" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeWidth={2} d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        ))}

        <button
          onClick={onClose}
          className="mx-auto mt-5 block text-sm font-medium text-gray-600 hover:text-gray-800"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
