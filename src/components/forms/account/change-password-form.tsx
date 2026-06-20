"use client";

import { Button } from "@/components/ui/button";
import PasswordInput from "@/features/user-profile/components/PasswordInput";
import { useChangePassword } from "@/features/user-profile/hooks/useChangePassword";
import { cn } from "@/lib/utils";
import { KeyRound, Lock, LoaderCircle, ShieldCheck } from "lucide-react";
import { useMemo } from "react";

const STRENGTH_LEVELS = [
  { label: "Yếu", barClass: "bg-rose-500", textClass: "text-rose-600 dark:text-rose-400" },
  { label: "Trung bình", barClass: "bg-amber-500", textClass: "text-amber-600 dark:text-amber-400" },
  { label: "Khá", barClass: "bg-sky-500", textClass: "text-sky-600 dark:text-sky-400" },
  { label: "Mạnh", barClass: "bg-emerald-500", textClass: "text-emerald-600 dark:text-emerald-400" },
] as const;

// Local-only heuristic so the strength meter never affects the submitted value.
const scorePassword = (pw: string): number => {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
};

export default function ChangePasswordForm() {
  // UI-only component: all logic + payload stay in the view-model hook.
  const {
    currentPassword,
    newPassword,
    confirmPassword,
    loading,
    setCurrentPassword,
    setNewPassword,
    setConfirmPassword,
    handleSubmit,
  } = useChangePassword();

  // Purely visual guidance; the hook remains the single source of validation.
  const strength = useMemo(() => scorePassword(newPassword), [newPassword]);
  const strengthLevel = strength > 0 ? STRENGTH_LEVELS[strength - 1] : null;
  const tooShort = newPassword.length > 0 && newPassword.length < 6;
  const mismatch = confirmPassword.length > 0 && confirmPassword !== newPassword;

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/60">
        {/* Header */}
        <div className="flex items-start gap-4 border-b border-slate-100 bg-gradient-to-br from-sky-50 to-white p-6 dark:border-slate-800 dark:from-slate-900 dark:to-slate-900/40">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-sm">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
              Đổi mật khẩu
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Hãy dùng mật khẩu mạnh gồm chữ hoa, chữ thường, số và ký tự đặc biệt. Không dùng lại
              mật khẩu đã sử dụng ở nơi khác.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <PasswordInput
            id="currentPassword"
            label="Mật khẩu hiện tại"
            icon={Lock}
            value={currentPassword}
            onChange={setCurrentPassword}
            autoComplete="current-password"
            placeholder="Nhập mật khẩu hiện tại"
          />

          <div className="space-y-2">
            <PasswordInput
              id="newPassword"
              label="Mật khẩu mới"
              icon={KeyRound}
              value={newPassword}
              onChange={setNewPassword}
              autoComplete="new-password"
              placeholder="Nhập mật khẩu mới"
              error={tooShort ? "Mật khẩu mới phải có ít nhất 6 ký tự." : undefined}
              helperText="Tối thiểu 6 ký tự, nên kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt."
            />

            {newPassword.length > 0 && strengthLevel ? (
              <div className="flex items-center gap-3">
                <div className="flex h-1.5 flex-1 gap-1.5">
                  {STRENGTH_LEVELS.map((_, index) => (
                    <span
                      key={index}
                      className={cn(
                        "h-full flex-1 rounded-full transition-colors duration-300",
                        index < strength ? strengthLevel.barClass : "bg-slate-200 dark:bg-slate-700"
                      )}
                    />
                  ))}
                </div>
                <span className={cn("w-20 text-right text-xs font-medium", strengthLevel.textClass)}>
                  {strengthLevel.label}
                </span>
              </div>
            ) : null}
          </div>

          <PasswordInput
            id="confirmPassword"
            label="Xác nhận mật khẩu"
            icon={ShieldCheck}
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
            placeholder="Nhập lại mật khẩu mới"
            error={mismatch ? "Mật khẩu xác nhận chưa khớp." : undefined}
          />

          <div className="flex justify-end pt-1">
            <Button
              type="submit"
              disabled={loading}
              className="gap-2 rounded-xl bg-blue-600 px-6 font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg active:translate-y-0 disabled:translate-y-0 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  Đổi mật khẩu
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
