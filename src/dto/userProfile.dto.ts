export interface UserProfileDTO {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}