import React from "react";

const dataFields = [
  {
    key: "email",
    label: "Correo electrónico",
    value: (d) => d.email,
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-2 13H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2z" />
    ),
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    key: "telefono",
    label: "Mi número de teléfono",
    value: (d) => d.telefono || "—",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    ),
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
  },
  {
    key: "comunidad",
    label: "Municipio o comunidad",
    value: (d) => d.comunidad || "—",
    icon: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0L6.343 16.657a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </>
    ),
    iconBg: "bg-teal-50",
    iconColor: "text-teal-600",
  },
  {
    key: "telTutor",
    label: "Teléfono de mi tutor",
    value: (d) => d.telTutor || "—",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    ),
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
  },
  {
    key: "nombreTutor",
    label: "Nombre de mi tutor",
    value: (d) => d.nombreTutor || "—",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM12 15v2m-2 2h4M7 21h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" />
    ),
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
  },
];

export function PersonalDataCollapsible({
  currentUserData,
  showPersonalData,
  onToggle,
  fallbackProfilePic,
}) {
  return (
    <div className="mb-6">
      {/* Header colapsable */}
      <button
        onClick={onToggle}
        className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 flex items-center justify-between hover:bg-gray-50/80 hover:border-gray-200 transition-colors duration-200 group"
      >
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="relative flex-shrink-0">
            <img
              src={currentUserData.profilePic}
              alt={currentUserData.name}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-indigo-100 group-hover:border-indigo-200 transition-colors"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = fallbackProfilePic;
              }}
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <div className="text-left min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 truncate">
              {currentUserData.name}
            </h3>
            <p className="text-xs text-gray-500 flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${showPersonalData ? "bg-indigo-500" : "bg-gray-400"}`} />
              <span className="truncate">
                {showPersonalData ? "Ocultar datos personales" : "Ver datos personales completos"}
              </span>
            </p>
          </div>
        </div>
        <div className="p-2 rounded-lg bg-gray-50 group-hover:bg-indigo-50 shrink-0 ml-2 transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 text-gray-500 group-hover:text-indigo-600 transition-all duration-200 ${showPersonalData ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Panel expandible */}
      <div
        className={`transition-all duration-300 ease-out overflow-hidden ${showPersonalData ? "max-h-[2000px] opacity-100 mt-4" : "max-h-0 opacity-0 mt-0"}`}
      >
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Título limpio */}
          <div className="px-4 sm:px-6 md:px-8 pt-5 sm:pt-6 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 13a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">Datos personales</h3>
            </div>
          </div>

          {/* Grid responsivo: móvil 1 col, tablet 2 cols, desktop 3 cols */}
          <div className="p-4 sm:p-6 md:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
              {dataFields.map((field) => (
                <div
                  key={field.key}
                  className="flex items-start gap-3 p-3 sm:p-4 rounded-xl bg-gray-50/80 hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-colors"
                >
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg ${field.iconBg} flex items-center justify-center shrink-0`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 sm:h-5 sm:w-5 ${field.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      {field.icon}
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-500 font-medium mb-0.5">{field.label}</p>
                    <p className="text-sm sm:text-base font-semibold text-gray-800 break-words leading-snug">
                      {field.value(currentUserData)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
