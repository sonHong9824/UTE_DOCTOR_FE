"use client";

import { ResponseCode } from "@/enum/response-code.enum";
import { changePassword } from "@/features/user-profile/services/user-profile.api";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";

// View-model hook: change password flow.
export const useChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await changePassword({ currentPassword, newPassword });
      if (res?.code === ResponseCode.SUCCESS) {
        toast.success("Change password successful");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(res?.message || "Failed to change password");
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Error when changing password";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return {
    currentPassword,
    newPassword,
    confirmPassword,
    loading,
    setCurrentPassword,
    setNewPassword,
    setConfirmPassword,
    handleSubmit,
  };
};

