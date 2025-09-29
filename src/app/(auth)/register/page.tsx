"use client";

import { useState } from "react";
import RegisterForm from "@/app/(auth)/register/register-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export default function Register() {
  const [openOtpModal, setOpenOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");

  // callback khi đăng ký thành công
  const handleRegisterSuccess = (userEmail?: string) => {
    if (userEmail) setEmail(userEmail);
    setOpenOtpModal(true);
  };

  const handleVerifyOtp = () => {
    console.log("OTP nhập:", otp);
    // TODO: gọi API verify OTP
    setOpenOtpModal(false);
    console.log("Register data:", email);
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
