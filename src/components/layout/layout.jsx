import React from "react";
import Header from "./header";
import { Outlet } from "react-router-dom";

function Layout() {
  return (
    <div
      className="w-screen h-screen overflow-y-auto bg-center bg-no-repeat bg-cover bg-dot-bg bg-baseWhite dark:bg-black"
      id="layout"
    >
      <Header />
      <Outlet />
    </div>
  );
}

export default Layout;
