export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  role: string;
  id: string;
  patientId?: string | null;
  doctorId?: string | null;
  profileId?: string | null;
}