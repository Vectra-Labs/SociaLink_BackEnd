import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  first_name: z.string().min(2, "First name is required"),
  last_name: z.string().min(2, "Last name is required"),
  phone: z.string().min(8, "Phone number is required"),
  city_id: z.coerce.number().int().positive("City is required"),
});

export const registerEstablishmentSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),

  name: z.string().trim().min(2, "Establishment name is required"),
  contact_first_name: z.string().trim().min(2, "Contact first name is required"),
  contact_last_name: z.string().trim().min(2, "Contact last name is required"),
  phone: z.string().trim().min(8, "Phone number is required"),

  ice_number: z.string().trim().min(5, "ICE number is required"),
  city_id: z.coerce.number().int().positive("City is required"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const updateWorkerProfileSchema = z.object({
  first_name: z.string().trim().min(2).optional().nullable(),
  last_name: z.string().trim().min(2).optional().nullable(),
  phone: z.string().trim().min(8).optional().nullable(),
  address: z.string().trim().min(5).optional().nullable(),
  city_id: z.coerce.number().int().positive().optional().nullable(),
  bio: z.string().trim().max(500).optional().nullable(),
  profile_pic_url: z.string().url().optional().nullable().or(z.literal("")),
  experience_years: z.coerce.number().int().min(0).max(50).optional().nullable(),
});

export const addWorkerSpecialitiesSchema = z.object({
  speciality_ids: z
    .array(
      z.number().int().positive("Speciality ID must be a positive integer")
    )
    .min(1, "At least one speciality must be selected"),
});


export const createMissionSchema = z.object({
  title: z.string().trim().min(3, "Title is required"),

  description: z.string().trim().min(10, "Description is required"),

  budget: z.coerce.number().positive("Budget must be positive"),

  city_id: z.coerce.number().int().positive("City is required"),

  start_date: z.coerce.date(),

  end_date: z.coerce.date(),
  speciality_ids: z.array(z.number().int()).min(1),
});
