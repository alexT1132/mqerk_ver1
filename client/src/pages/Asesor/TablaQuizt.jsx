import { useState } from "react";
import Topbar from "../../components/Asesores/Topbar";
import SidebarIconOnly from "../../components/Asesores/Sidebar";
import MobileSidebar from "../../components/Asesores/MobileSidebar";
import Quiz from "../../components/Asesores/Quiz";

export default function QuiztPage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <Topbar onOpenMobileMenu={() => setMobileOpen(true)} />
      <MobileSidebar
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        active="quizt"
        onLogout={() => console.log("logout")}
      />
      <div className="mx-auto">
        <div className="flex">
          <SidebarIconOnly active="quizt" onLogout={() => console.log("logout")} />
          <main className="flex-1 p-3 sm:p-6">
            <Quiz />
          </main>
        </div>
      </div>
    </div>
  );
}
