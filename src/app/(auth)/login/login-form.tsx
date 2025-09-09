"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
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
    const baseApiUrl = process.env.BASE_API || "http://localhost:3001/api";
    const response = await fetch(`${baseApiUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    console.log("Login response:", response);
    if (!response.ok) {
      alert("Đăng nhập thất bại! Vui lòng thử lại.");
      console.log("Login failed:", response);
      return;
    }
    else { 
      alert("Đăng nhập thành công!"); 
      const data = await response.json();
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("email", form.email);
      localStorage.setItem("accessToken", data.data.accessToken);
      localStorage.setItem("refreshToken", data.data.refreshToken);
      console.log("Login successful:", data);
      router.push("/user/my-profile");
    }

  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email */}
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="example@email.com"
          value={form.email}
          onChange={handleChange}
          required
        />
      </div>

      {/* Password */}
      <div>
        <Label htmlFor="password">Mật khẩu</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="********"
          value={form.password}
          onChange={handleChange}
          required
        />
      </div>

      {/* Remember me + Forgot password */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="remember"
            checked={form.remember}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300"
          />
          <span className="text-sm">Ghi nhớ đăng nhập</span>
        </label>
        <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
          Quên mật khẩu?
        </Link>
      </div>

      {/* Nút submit */}
      <Button type="submit" className="w-full">
        Đăng nhập
      </Button>

      {/* Link sang Register */}
      <p className="text-center text-sm text-gray-600">
        Chưa có tài khoản?{" "}
        <Link href="/register" className="text-blue-600 hover:underline">
          Đăng ký ngay
        </Link>
      </p>
    </form>
  );
}
