import React from "react";
import Sidebar from "./Sidebar";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen bg-gray-100/40 dark:bg-neutral-900/40">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6">{children}</main>
    </div>
  );
};

export default MainLayout;