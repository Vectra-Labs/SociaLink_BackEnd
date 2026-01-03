import { z } from "zod";

export const registerSchema = z.object({
    email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  first_name: z.string().min(2, "First name is required"),
  last_name: z.string().min(2, "Last name is required"),
  phone: z.string().min(8, "Phone number is required"),
});

export const registerEstablishmentSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),

  name: z.string().trim().min(2, "Establishment name is required"),
  contact_first_name: z.string().trim().min(2, "Contact first name is required"),
  contact_last_name: z.string().trim().min(2, "Contact last name is required"),
  phone: z.string().trim().min(8, "Phone number is required"),

  ice_number: z.string().trim().min(5, "ICE number is required"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const updateWorkerProfileSchema = z.object({
  first_name: z.string().trim().min(2).optional(),
  last_name: z.string().trim().min(2).optional(),
  phone: z.string().trim().min(8).optional(),
  address: z.string().trim().min(5).optional(),
  city_id: z.number().int().positive().optional(),
  bio: z.string().trim().max(500).optional(),
  profile_pic_url: z.string().url().optional(),
});

