"use client";

import { register } from "@/apis/auth/auth.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ResponseCode } from "@/enum/response-code.enum";
import { SocketEventsEnum } from "@/enum/socket-events.enum";
import { authSocket, socketClient } from "@/services/socket/socket-client";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { z } from "zod";
const registerSchema = z
  .object({
    // fullName: z.string().min(2, "Họ và tên phải có ít nhất 2 ký tự"),
    email: z.string().email("Email không hợp lệ"),
    // phone: z
    //   .string()
    //   .regex(/^[0-9]{9,11}$/, "Số điện thoại phải có 9-11 chữ số"),
    // dob: z.string().nonempty("Vui lòng chọn ngày sinh"),
    // gender: z.enum(["male", "female", "other"]),
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
  const router = useRouter();
  const [form, setForm] = useState({
    // fullName: "",
    email: "",
    // phone: "",
    // dob: "",
    // gender: "male",
    password: "",
    //confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // // Init WebSocket
  // useEffect(() => {
  //   if (!form.email) return;
    
    

  //   // return () => {
  //   //   authSocket.disconnect();
  //   // };
  // }, [form.email]);



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


    // 👉 Bước 2: join room
    authSocket.emitSafe(SocketEventsEnum.REGISTER_JOIN_ROOM, { userEmail: form.email });
    console.log("Init socket for register user email: ", form.email);

    // 👉 Bước 3: đăng ký listener 1 lần
    authSocket.once(SocketEventsEnum.REGISTER_STATUS, (data: any) => {
      console.log("Raw Data: ", JSON.stringify(data));

      if (data.code === ResponseCode.SUCCESS) {
        alert(`Đăng ký thành công: ${data.message}`);
        if (onSuccess) onSuccess(data.code, form.email);
      } else {
        alert(`Đăng ký thất bại: ${data.message}`);
      }
    });

    // 👉 Bước 4: gửi request đăng ký
    try {
      const res = await register(payload);

      if (res.code === ResponseCode.ERROR || res.code === ResponseCode.SERVER_ERROR) {
        alert("Error when connecting to server!");
        console.error("Register failed:", res.message || "Đăng ký thất bại");
      }
    } catch (err: any) {
      console.error("Register error:", err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto">
      {/* Full name */}
      {/* <div>
        <Label htmlFor="fullName">Họ và tên</Label>
        <Input
          id="fullName"
          name="fullName"
          placeholder="Nguyễn Văn A"
          value={form.fullName}
          onChange={handleChange}
          required
        />
        {errors.fullName && (
          <p className="text-sm text-red-600">{errors.fullName}</p>
        )}
      </div> */}

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
        {errors.email && (
          <p className="text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      {/* Phone */}
      {/* <div>
        <Label htmlFor="phone">Số điện thoại</Label>
        <Input
          id="phone"
          name="phoneNumber"
          placeholder="0901234567"
          value={form.phoneNumber}
          onChange={handleChange}
          required
        />
        {errors.phone && (
          <p className="text-sm text-red-600">{errors.phone}</p>
        )}
      </div> */}

      {/* Ngày sinh */}
      {/* <div>
        <Label htmlFor="dob">Ngày sinh</Label>
        <Input
          id="dob"
          name="dob"
          type="date"
          value={form.dob}
          onChange={handleChange}
          required
        />
        {errors.dob && <p className="text-sm text-red-600">{errors.dob}</p>}
      </div> */}

      {/* Giới tính */}
      {/* <div>
        <Label>Giới tính</Label>
        <div className="flex gap-6 mt-2">
          {Object.values(GenderEnum).map((g) => (
            <label key={g} className="flex items-center gap-2">
              <input
                type="radio"
                name="gender"
                value={g}
                checked={form.gender === g}
                onChange={handleChange}
              />
              <span>
                {g === GenderEnum.MALE
                  ? "Nam"
                  : g === GenderEnum.FEMALE
                  ? "Nữ"
                  : "Khác"}
              </span>
            </label>
          ))}
        </div>
        {errors.gender && (
          <p className="text-sm text-red-600">{errors.gender}</p>
        )}
      </div> */}

      {/* Password */}
      <div>
        <Label htmlFor="password">Mật khẩu</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="********"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-3 flex items-center text-gray-500"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-red-600">{errors.password}</p>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <Label htmlFor="confirmPassword">Nhập lại mật khẩu</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="********"
            //value={form.confirmPassword}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-3 flex items-center text-gray-500"
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-sm text-red-600">{errors.confirmPassword}</p>
        )}
      </div>


      {/* Medical recors
      <MedicalRecordForm></MedicalRecordForm> */}

      {/* Submit button */}
      <Button type="submit" className="w-full">
        Đăng ký
      </Button>

      {/* Link sang Login */}
      <p className="text-center text-sm text-gray-600">
        Đã có tài khoản?{" "}
        <Link href="/login" className="text-blue-600 hover:underline">
          Đăng nhập
        </Link>
      </p>
    </form>
  );
}
