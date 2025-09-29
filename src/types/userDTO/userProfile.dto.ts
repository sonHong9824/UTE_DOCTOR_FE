import { AccountStatusEnum } from "@/enum/account-status.enum";
import { GenderEnum } from "@/enum/gender.enum";
import { MedicalRecordDto } from "./medical-record.dto";

export interface UserProfileDTO {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  avatarUrl?: string;
  address?: string;
  gender?: GenderEnum;
  status: AccountStatusEnum;
  createdAt: Date;
  updatedAt: Date;
  medicalRecord: MedicalRecordDto
}