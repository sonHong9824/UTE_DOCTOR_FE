"use client";

import { updateUserProfile, updateUserProfileWithFile } from "@/features/user-profile/services/user-profile.api";
import { getWalletBalance } from "@/features/user-profile/services/wallet.api";
import { AccountProfileDTO } from "@/types/accountDTO/accountProfile.dto";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// View-model hook: handles profile updates and coin balance.
export const useUserInfoCard = (onUserUpdated?: (updatedUser: AccountProfileDTO) => void) => {
  const router = useRouter();
  const [coinBalance, setCoinBalance] = useState<number | null>(null);
  const [loadingCoin, setLoadingCoin] = useState(true);

  useEffect(() => {
    const fetchCoinBalance = async () => {
      try {
        const response = await getWalletBalance();
        if (response?.data?.balance !== undefined) {
          setCoinBalance(response.data.balance);
        }
      } catch {
        toast.error("Can not fetch coin balance");
      } finally {
        setLoadingCoin(false);
      }
    };

    fetchCoinBalance();
  }, []);

  const handleSaveUserInfo = async (updatedData: Partial<AccountProfileDTO>, avatarFile?: File) => {
    try {
      const response = avatarFile
        ? await updateUserProfileWithFile(updatedData, avatarFile)
        : await updateUserProfile(updatedData);

      if (response?.data) {
        onUserUpdated?.(response.data);
        try {
          router.refresh();
        } catch {
          window.location.reload();
        }
      }
    } catch (error) {
      toast.error("Can not update user information");
      throw error;
    }
  };

  return {
    coinBalance,
    loadingCoin,
    handleSaveUserInfo,
  };
};
