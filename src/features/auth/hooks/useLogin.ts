"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ResponseCode as rc } from "@/enum/response-code.enum";
import type { LoginFormValues } from "@/features/auth/types/login";
import { loginService } from "@/features/auth/services/auth.service";
import { setAuthSession } from "@/features/auth/utils/auth-storage";

// View-model hook for login (business logic + side effects).
export const useLogin = () => {
  const router = useRouter();
  const [form, setForm] = useState<LoginFormValues>({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await loginService(form);
      if (res.code !== rc.SUCCESS) {
        toast.error("Đăng nhập thất bại! Vui lòng thử lại.");
        return;
      }

      // setAuthSession persists the session AND emits `token-refreshed` + `user-logged-in`, so the
      // shared sockets reconnect as the new user and the notification bell refetches for them.
      setAuthSession({
        email: form.email,
        accessToken: res.data.accessToken,
        refreshToken: res.data.refreshToken,
        role: res.data.role,
        id: res.data.id,
        patientId: res.data.patientId || "",
        doctorId: res.data.doctorId || "",
        profileId: res.data.profileId || "",
      });

      toast.success("Đăng nhập thành công!");

      if (res.data.role === "DOCTOR") {
        router.push("/doctor/patients");
        return;
      }
      if (res.data.role === "ADMIN") {
        router.push("/admin/patients");
        return;
      }
      if (res.data.role === "RECEPTIONIST") {
        router.push("/receptionist/visits");
        return;
      }
      router.push("/");
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Lỗi khi gọi login";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    loading,
    handleChange,
    handleSubmit,
  };
};

