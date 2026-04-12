// Auth service (HTTP-only; no business logic).
import { login } from "@/features/auth/services/auth.api";
import type { LoginFormValues } from "@/features/auth/types/login";

export const loginService = (payload: LoginFormValues) => {
  return login(payload);
};

