import { AccountProfileDTO } from "../accountDTO/accountProfile.dto";
import { MedicalRecordDto } from "./medical-record.dto";

export interface PatientProfileDto {
    accountProfileDto: AccountProfileDTO
    medicalRecord: MedicalRecordDto | null
}