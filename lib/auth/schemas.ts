/**
 * Authentication Schema and Types
 * 
 * Zod schemas for authentication forms including signup, login,
 * and password reset.
 */

import { z } from "zod";

/**
 * Signup form schema with validation rules
 */
export const signupSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  country: z.string()
    .min(1, 'Country is required'),
  intendedMajor: z.string()
    .min(1, 'Intended major is required'),
  testType: z.enum(["TOEFL", "IELTS", "None"]),
  testScore: z.string().transform((val) => {
    if (!val || val === '') return null;
    const num = parseFloat(val);
    return isNaN(num) ? null : num;
  }).refine((val) => {
    if (val === null) return true;
    return val >= 0 && val <= 120; // Allow full TOEFL range, IELTS is 0-9 subset
  }, { message: "Test score must be between 0 and 120" }),
});

/**
 * Login form schema
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required"),
});

/**
 * Password reset request schema
 */
export const passwordResetSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

/**
 * Type inference from schemas
 */
export type SignupFormData = z.infer<typeof signupSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type PasswordResetFormData = z.infer<typeof passwordResetSchema>;

/**
 * List of countries for the country selector
 */
export const countries = [
  "United States",
  "China",
  "India",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Japan",
  "South Korea",
  "Brazil",
  "Mexico",
  "Russia",
  "Turkey",
  "Indonesia",
  "Saudi Arabia",
  "Nigeria",
  "Egypt",
  "South Africa",
  "Vietnam",
  "Thailand",
  "Malaysia",
  "Philippines",
  "Pakistan",
  "Bangladesh",
  "Iran",
  "Iraq",
  "Ukraine",
  "Poland",
  "Spain",
  "Italy",
  "Netherlands",
  "Belgium",
  "Switzerland",
  "Sweden",
  "Norway",
  "Denmark",
  "Finland",
  "Austria",
  "Greece",
  "Portugal",
  "Czech Republic",
  "Romania",
  "Hungary",
  "Israel",
  "United Arab Emirates",
  "Singapore",
  "New Zealand",
  "Argentina",
  "Chile",
  "Colombia",
  "Peru",
  "Venezuela",
  "Other",
].sort();

/**
 * Common majors for the major selector
 */
export const commonMajors = [
  "Computer Science",
  "Business Administration",
  "Engineering (General)",
  "Mechanical Engineering",
  "Electrical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Biology",
  "Chemistry",
  "Physics",
  "Mathematics",
  "Psychology",
  "Economics",
  "Finance",
  "Accounting",
  "Marketing",
  "Medicine",
  "Nursing",
  "Pharmacy",
  "Political Science",
  "International Relations",
  "Communications",
  "Journalism",
  "English Literature",
  "History",
  "Philosophy",
  "Sociology",
  "Anthropology",
  "Environmental Science",
  "Architecture",
  "Fine Arts",
  "Music",
  "Theater",
  "Film Studies",
  "Data Science",
  "Information Technology",
  "Cybersecurity",
  "Artificial Intelligence",
  "Biomedical Engineering",
  "Aerospace Engineering",
  "Undecided",
  "Other",
].sort();
