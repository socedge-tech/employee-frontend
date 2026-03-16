import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar.tsx";
import { TopNav } from "./TopNav.tsx";

export function MainLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden items-start m-0 p-0">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden m-0 p-0">
        <TopNav />
        <main className="flex-1 overflow-auto bg-gray-50 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
