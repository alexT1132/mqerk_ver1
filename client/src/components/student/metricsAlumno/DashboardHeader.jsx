import React from "react";
import { LayoutDashboard } from "lucide-react";

export function DashboardHeader({ displayFolio }) {
  return (
    <div className="flex flex-col items-center md:flex-row md:items-start md:justify-between mb-6 pb-4 border-b-2 border-gradient-to-r from-blue-200 to-purple-200">
      <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 md:mb-0">
        <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg ring-2 ring-blue-200/60 shrink-0">
          <LayoutDashboard className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
        <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent tracking-tight">
          DASHBOARD
        </h2>
      </div>
      <div className="bg-white rounded-full px-3 xs:px-4 sm:px-6 py-1.5 xs:py-2 sm:py-3 shadow-lg border border-gray-200">
        <span className="text-xs xs:text-sm sm:text-base font-bold text-gray-700">
          Folio: <span className="text-blue-600">{displayFolio}</span>
        </span>
      </div>
    </div>
  );
}

