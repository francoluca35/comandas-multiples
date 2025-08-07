"use client";
import React from "react";
import Sidebar, {
  useSidebar,
  SidebarProvider,
} from "../home/components/Sidebar";
import MesasManagement from "./components/MesasManagement";

function MesasContent() {
  const { isExpanded } = useSidebar();

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden">
      <Sidebar />
      <div
        className={`flex-1 flex flex-col bg-slate-800 transition-all duration-300 ${
          isExpanded ? "ml-0" : "ml-0"
        }`}
      >
        <MesasManagement />
      </div>
    </div>
  );
}

function MesasPage() {
  return (
    <SidebarProvider>
      <MesasContent />
    </SidebarProvider>
  );
}

export default MesasPage;
