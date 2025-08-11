import React from "react";
import Login from "./login/page";
import { ElectronAuthGuard } from "../../components/ElectronAuthGuard";

function HomeComandas() {
  return (
    <ElectronAuthGuard requiredAuth={false}>
      <div>
        <Login />
      </div>
    </ElectronAuthGuard>
  );
}

export default HomeComandas;
