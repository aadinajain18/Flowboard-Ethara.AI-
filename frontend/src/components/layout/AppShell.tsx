import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function AppShell() {
  return (
    <div className="flex min-h-screen bg-surface-base relative overflow-hidden">
      {/* Universal blended background like the login page */}
      <div className="absolute inset-0 gradient-mesh pointer-events-none" />
      <div className="absolute inset-0 dot-pattern opacity-40 pointer-events-none" />
      
      <Sidebar />
      {/* Main content — offset by sidebar width, responsive */}
      <div className="relative z-10 flex flex-1 flex-col ml-[72px] lg:ml-[260px] transition-[margin] duration-300">
        <TopBar />
        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
