"use client";

import { login } from "@/apis/auth/auth.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ResponseCode as rc } from "@/enum/response-code.enum";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    // remember: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login data:", form);
    
    try {
      const res = await login(form);
      console.log("Login response:", res);
      if (res.code != rc.SUCCESS) {
        alert("Đăng nhập thất bại! Vui lòng thử lại.");
        console.log("Login failed:", res);
        return;
      } else {
        alert("Đăng nhập thành công!");
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("email", form.email);
        localStorage.setItem("accessToken", res.data.accessToken);
        localStorage.setItem("refreshToken", res.data.refreshToken);
        localStorage.setItem("role", res.data.role);
        localStorage.setItem("id", res.data.id);
        localStorage.setItem("patientId", res.data.patientId || "");
        localStorage.setItem("doctorId", res.data.doctorId || "");
        localStorage.setItem("profileId", res.data.profileId || "");

        console.log("Login successful:", res);

        if (res.data.role === "DOCTOR") {
          alert("xin chao bac si");
          router.push("/doctor/patients");
        } 
        else if (res.data.role === "ADMIN") {
          router.push("/admin/patients");
        } 
        else {
          router.push("/");
        }
      }
    } catch (err: any) {
      console.error("Login error:", err);
      const msg = err?.response?.data?.message || err?.message || "Lỗi khi gọi login";
      alert(msg);
      return;
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="vidu@email.com"
          value={form.email}
          onChange={handleChange}
          required
          className="mt-1.5 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <Label htmlFor="password" className="text-sm font-medium text-gray-700">
          Mật khẩu
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          value={form.password}
          onChange={handleChange}
          required
          className="mt-1.5 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      {/* <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="remember"
            checked={form.remember}
            onChange={handleChange}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-600">Ghi nhớ</span>
        </label>
        <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          Quên mật khẩu?
        </Link>
      </div> */}

      <Button 
        type="submit"
        onClick={handleSubmit}
        className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold shadow-lg shadow-blue-500/30"
      >
        Đăng nhập
      </Button>

      {/* <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200"></div>
        <span className="text-xs text-gray-400 font-medium">HOẶC</span>
        <div className="flex-1 h-px bg-gray-200"></div>
      </div> */}

      <div className="grid grid-cols-1 gap-3">
        {/* <Button type="button" variant="outline" className="h-12 border-gray-200 hover:bg-gray-50">
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google
        </Button> */}
        {/* <Button type="button" variant="outline" className="h-12 border-gray-200 hover:bg-gray-50">
          <svg className="w-5 h-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          Facebook
        </Button> */}
      </div>

      <p className="text-center text-sm text-gray-600 mt-6">
        Chưa có tài khoản?{" "}
        <Link href="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
          Đăng ký
        </Link>
      </p>
    </div>
  );
}