import React from "react";

export function DashboardHeader({ displayFolio }) {
  return (
    <div className="flex flex-col items-center md:flex-row md:items-start md:justify-between mb-6 pb-4 border-b-2 border-gradient-to-r from-blue-200 to-purple-200">
      <h2 className="text-3xl xs:text-4xl sm:text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 md:mb-0">
        DASHBOARD
      </h2>
      <div className="bg-white rounded-full px-3 xs:px-4 sm:px-6 py-1.5 xs:py-2 sm:py-3 shadow-lg border border-gray-200">
        <span className="text-xs xs:text-sm sm:text-base font-bold text-gray-700">
          Folio: <span className="text-blue-600">{displayFolio}</span>
        </span>
      </div>
    </div>
  );
}

