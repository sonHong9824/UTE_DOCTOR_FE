import type {
  AdminCreateReceptionistResultDto,
  AdminReceptionistListItemDto,
} from "@/types/admin-staff.dto";

export interface ReceptionistFormState {
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth: string;
  address: string;
  hospitalName: string;
}

export type ReceptionistFormErrors = Partial<
  Record<keyof ReceptionistFormState, string>
>;

export type CreatedReceptionist = AdminCreateReceptionistResultDto;
export type ReceptionistListItem = AdminReceptionistListItemDto;
