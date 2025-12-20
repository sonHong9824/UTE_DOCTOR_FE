"use client";

import RegisterForm from "@/app/(auth)/register/register-form";
import { Button } from "@/components/ui/button";
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
import { ResponseCode } from "@/enum/response-code.enum";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Register() {
  const [openOtpModal, setOpenOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");

  const router = useRouter();
  
  const handleRegisterSuccess = (responseCode: ResponseCode, userEmail: string) => {
    if (responseCode === ResponseCode.SUCCESS) {
      if (userEmail) setEmail(userEmail);
      setOpenOtpModal(true);
    }
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
    } else {
      alert("Xác thực OTP thành công! Vui lòng đăng nhập.");
      router.push("/login");
    }
    setOpenOtpModal(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-teal-200/15 rounded-full blur-3xl"></div>
      </div>

      {/* Medical icons floating */}
      <div className="absolute top-10 left-20 text-blue-300/30 animate-pulse">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      </div>
      <div className="absolute bottom-20 left-32 text-cyan-300/30 animate-pulse" style={{animationDelay: '1s'}}>
        <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
        </svg>
      </div>
      <div className="absolute top-32 right-24 text-teal-300/30 animate-pulse" style={{animationDelay: '0.5s'}}>
        <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      </div>

      <div className="flex w-full max-w-6xl mx-4 relative z-10">
        <div className="flex w-full shadow-2xl rounded-3xl overflow-hidden bg-white/95 backdrop-blur-sm border border-white/20">
          
          {/* Left side - Visual Banner */}
          <div className="hidden md:flex md:w-3/5 bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-500 text-white p-12 lg:p-16 flex-col justify-center items-center relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full -ml-48 -mb-48"></div>
            
            <div className="relative z-10 text-center max-w-lg">
              {/* Heading */}
              <h2 className="text-5xl font-bold mb-6 leading-tight">
                Bắt đầu<br />hành trình
              </h2>
              
              {/* Subtitle */}
              <p className="text-xl text-blue-100 mb-10 leading-relaxed">
                Tạo tài khoản để trải nghiệm<br />dịch vụ y tế thông minh
              </p>

              {/* Feature pills */}
              <div className="flex flex-wrap justify-center gap-3">
                <div className="px-5 py-2.5 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium">
                  Miễn phí
                </div>
                <div className="px-5 py-2.5 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium">
                  Đơn giản
                </div>
                <div className="px-5 py-2.5 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium">
                  An toàn
                </div>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-1 gap-6 mt-12 pt-8 border-t border-white/20 text-left">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold mb-1">Đặt lịch nhanh chóng</div>
                    <div className="text-sm text-blue-100">Chọn bác sĩ và thời gian phù hợp</div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold mb-1">Quản lý hồ sơ</div>
                    <div className="text-sm text-blue-100">Lưu trữ lịch sử khám bệnh</div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold mb-1">Nhắc nhở tự động</div>
                    <div className="text-sm text-blue-100">Không bỏ lỡ lịch hẹn quan trọng</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Register Form */}
          <div className="w-full md:w-2/5 p-8 lg:p-12 bg-white">
            <div className="max-w-md mx-auto">
              {/* Logo & Header */}
              <div className="text-center mb-10">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">Doctor +</h1>
                <p className="text-gray-500">Tạo tài khoản mới</p>
              </div>

              <RegisterForm onSuccess={handleRegisterSuccess} />
            </div>
          </div>
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