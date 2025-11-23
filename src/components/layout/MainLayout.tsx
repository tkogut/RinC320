import React from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-bg-light">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 pl-[230px] pt-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;