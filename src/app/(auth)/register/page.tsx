"use client";

import RegisterForm from "@/app/(auth)/register/register-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useRouter } from "next/navigation";
import { useState } from "react";
export default function Register() {
  const [openOtpModal, setOpenOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");

  const router = useRouter();
  // callback khi đăng ký thành công
  const handleRegisterSuccess = (userEmail?: string) => {
    console.log("User email for OTP:", userEmail);
    if (userEmail) setEmail(userEmail);
    setOpenOtpModal(true);
  };

  const handleVerifyOtp = async () => {
    console.log("OTP nhập:", otp);
    const baseApi = process.env.BASE_API || "http://localhost:3001";
    const res = await fetch(`${baseApi}/api/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    console.log("Verify OTP response:", res);
    if (!res.ok) {
      alert("Xác thực OTP thất bại! Vui lòng thử lại.");
      return;
    }
    else {
      alert("Xác thực OTP thành công! Vui lòng đăng nhập.");

      router.push("/login");
    }
      setOpenOtpModal(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="flex w-full max-w-5xl shadow-lg rounded-2xl overflow-hidden border">
        {/* Cột bên trái: Form đăng ký */}
        <div className="flex w-full md:w-3/5 items-center justify-center bg-white p-8">
          <Card className="w-full border-none shadow-none">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">
                Đăng ký tài khoản
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RegisterForm onSuccess={handleRegisterSuccess} />
            </CardContent>
          </Card>
        </div>

        {/* Cột bên phải: Mô tả */}
        <div className="hidden md:flex w-2/5 bg-primary text-primary-foreground items-center justify-center p-10 flex-col">
          <h1 className="text-3xl font-bold mb-4">Chào mừng bạn!</h1>
          <p className="text-base text-white/90 leading-relaxed max-w-md text-center">
            Tạo tài khoản để trải nghiệm đầy đủ tính năng hiện đại, dễ sử dụng
            và an toàn tuyệt đối. <br />
            Hãy cùng bắt đầu hành trình của bạn với chúng tôi 🚀
          </p>
        </div>
      </div>

      {/* Modal nhập OTP */}
      <Dialog open={openOtpModal} onOpenChange={setOpenOtpModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận OTP</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Mã OTP đã được gửi đến email:{" "}
              <span className="font-medium text-foreground">{email}</span>
            </p>

            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => setOtp(value)}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenOtpModal(false)}>
              Hủy
            </Button>
            <Button onClick={handleVerifyOtp} disabled={otp.length < 6}>
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
