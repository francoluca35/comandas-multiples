"use client";
import React from "react";
import Sidebar from "../home/components/Sidebar";
import MesasManagement from "./components/MesasManagement";

function MesasPage() {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col bg-gray-50">
        <MesasManagement />
      </div>
    </div>
  );
}

export default MesasPage;
