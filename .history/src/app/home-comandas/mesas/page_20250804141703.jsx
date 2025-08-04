"use client";
import React from "react";
import Sidebar from "../home/components/Sidebar";
import MesasManagement from "./components/MesasManagement";

function MesasPage() {
  return (
    <div className="flex h-screen bg-slate-900">
      <Sidebar />
      <div className="flex-1 flex flex-col bg-slate-800">
        <MesasManagement />
      </div>
    </div>
  );
}

export default MesasPage;
