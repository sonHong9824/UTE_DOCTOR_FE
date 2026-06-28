export interface AdminStaffProfilePayload {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  gender?: string;
  dob?: string;
  avatarUrl?: string;
}

export interface AdminCreateDoctorPayload {
  profile: AdminStaffProfilePayload;
  doctorName: string;
  specialty?: string;
  bio?: string;
  degree?: string[];
  academic?: string;
  achievements?: string;
  yearsOfExperience?: number;
  avatar?: File;
}

export interface AdminCreateReceptionistPayload {
  profile: AdminStaffProfilePayload;
  hospitalName?: string;
  avatar?: File;
}

export interface AdminProvisionedAccountDto {
  id: string;
  email: string;
  role: "DOCTOR" | "RECEPTIONIST";
  status: "ACTIVE";
}

export interface AdminProvisionedProfileDto {
  id: string;
  fullName: string;
  phone?: string;
}

export interface AdminCreateDoctorResultDto {
  account: AdminProvisionedAccountDto;
  profile: AdminProvisionedProfileDto;
  doctor: {
    id: string;
    specialtyId?: string;
  };
  emailSent: boolean;
}

export interface AdminCreateReceptionistResultDto {
  account: AdminProvisionedAccountDto;
  profile: AdminProvisionedProfileDto;
  receptionist: {
    id: string;
  };
  emailSent: boolean;
}

export interface AdminReceptionistListQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface AdminReceptionistListItemDto {
  receptionistId: string;
  accountId: string | null;
  profileId: string | null;
  email: string;
  fullName: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: number | null;
  address?: string;
  avatarUrl?: string;
  hospitalName?: string;
  accountStatus?: "ACTIVE" | "INACTIVE" | "BLOCKED" | string;
  createdAt?: number;
  updatedAt?: number;
}

export interface AdminReceptionistListResponseDto {
  receptionists: AdminReceptionistListItemDto[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
