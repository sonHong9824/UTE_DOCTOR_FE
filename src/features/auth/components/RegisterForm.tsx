"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ResponseCode } from "@/enum/response-code.enum";
import { register } from "@/features/auth/services/auth.api";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { z } from "zod";

const registerSchema = z
  .object({
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu ít nhất 6 ký tự"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu nhập lại không khớp",
    path: ["confirmPassword"],
  });

interface RegisterFormProps {
  onSuccess?: (responseCode: ResponseCode, userEmail: string) => void;
}

export default function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = registerSchema.safeParse(form);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) newErrors[err.path[0].toString()] = err.message;
      });
      setErrors(newErrors);
      return;
    }

    const { confirmPassword, ...payload } = result.data;
    console.log("Register data:", payload);

    try {
      const res = await register({ ...payload, role: "PATIENT" });

      if (res.code === ResponseCode.SUCCESS) {
        alert(`Đăng ký thành công: ${res.message}`);
        if (onSuccess) onSuccess(res.code, form.email);
      } else {
        alert(`Đăng ký thất bại: ${res.message}`);
      }
    } catch (err: any) {
      alert("Error when connecting to server!");
      console.error("Register error:", err.message);
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
        {errors.email && (
          <p className="text-sm text-red-600 mt-1">{errors.email}</p>
        )}
      </div>

      <div>
        <Label htmlFor="password" className="text-sm font-medium text-gray-700">
          Mật khẩu
        </Label>
        <div className="relative mt-1.5">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            required
            className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-red-600 mt-1">{errors.password}</p>
        )}
      </div>

      <div>
        <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
          Xác nhận mật khẩu
        </Label>
        <div className="relative mt-1.5">
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="••••••••"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>
        )}
      </div>

      <Button 
        type="submit"
        onClick={handleSubmit}
        className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold shadow-lg shadow-blue-500/30"
      >
        Đăng ký
      </Button>

      <p className="text-center text-sm text-gray-600 mt-6">
        Đã có tài khoản?{" "}
        <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
