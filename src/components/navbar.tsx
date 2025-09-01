import React from "react";
import { Menu } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import Link from "next/link";


const Navbar = () => {
  return (
    <div className="w-full h-20 lg:h-28 border-b border-border backdrop-blur-md">
      <div className="max-w-screen-2xl h-full mx-auto px-4 flex items-center justify-between">
        <h1 className="text-2xl uppercase font-bold text-foreground">
          DoctorCare
        </h1>
        
        <ul className="hidden lg:flex items-center gap-8 uppercase text-sm font-semibold text-foreground">
          <li className="navbarLi">GIỚI THIỆU</li>
          <li className="navbarLi">CHUYÊN KHOA</li>
          <li className="navbarLi">CHUYÊN GIA - BÁC SĨ</li>
          <li className="navbarLi">TIN TỨC</li>
          <li className="navbarLi">LIÊN HỆ</li>
        </ul>
        
        <div className="hidden lg:flex gap-6 items-center">
          <ModeToggle />
          <Link
            href="/register"
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition"
          >
            Đăng ký
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-semibold rounded-lg border border-primary text-primary hover:bg-primary/10 transition"
          >
            Đăng nhập
          </Link>
          <button className="px-6 py-3 text-sm font-semibold rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90 transition">
            Đăng ký khám
          </button>
        </div>
        
        <div className="lg:hidden text-foreground">
          <Menu className="w-7 h-7 cursor-pointer" />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
