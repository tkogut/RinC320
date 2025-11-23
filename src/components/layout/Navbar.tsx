import React from "react";
import { Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-30 flex h-[60px] items-center justify-between border-b bg-primary-blue px-4 text-white">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20 hover:text-white">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
        <h1 className="text-lg font-bold">ScaleIT</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-cyan text-sm font-bold text-white">
          DU
        </div>
      </div>
    </header>
  );
};

export default Navbar;