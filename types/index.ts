export type UserRole = "jobSeeker" | "jobProvider" | "admin";

export interface User {
  _id: string;
  fullName: string;
  email: string;
  role: UserRole;
  phone: string;
  address: string;
  city: string;
  profileImage?: string;
  bio?: string;
}

export interface Booking {
  _id: string;
  providerId: string;
  serviceTitle: string;
  description: string;
  bookingDate: string;
  address: string;
  city: string;
  phone: string;
  price: number;
  notes?: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  customer?: User;
  provider?: User;
}

export type Provider = {
  _id: string;
  fullName: string;
  email: string;
  role: "jobProvider";
  phone: string;
  address: string;
  city: string;
  profileImage: string;
  bio: string;
  skills: string[];
  experienceLevel: "beginner" | "intermediate" | "expert";
  experienceYears: number;
  availability: string;
  companyName: string;
  companyDescription: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
};