import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const RegisterSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["CITIZEN", "SOLVER", "INDUSTRY", "ADMIN"]),
  organization: z.string().optional(),
  designation: z.string().optional(),
  phone: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  skills: z.array(z.string()).optional(),
  bio: z.string().optional(),
});

export const ChallengeSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Please provide a description (at least 10 characters)"),
  category: z.string().min(1, "Please select a category"),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  urgencyScore: z.number().min(1).max(100).optional(),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  address: z.string().min(1, "Address is required"),
  district: z.string().min(1, "District is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().optional().nullable(),
  mediaUrls: z.array(z.string()).optional(),
  audioUrl: z.string().optional().nullable(),
  voiceTranscript: z.string().optional().nullable(),
  language: z.string().default("en"),
  aiTags: z.array(z.string()).optional(),
});

export const SolutionSchema = z.object({
  challengeId: z.string().min(1, "Challenge ID is required"),
  teamName: z.string().optional(),
  title: z.string().min(6, "Solution title must be at least 6 characters"),
  abstract: z.string().min(20, "Please provide an executive abstract"),
  methodology: z.string().min(30, "Please explain your technical methodology"),
  techStack: z.array(z.string()).optional(),
  budgetEstimate: z.number().positive().optional(),
  timelineMonths: z.number().int().positive().optional(),
  prototypeUrl: z.string().url().optional().or(z.literal("")),
  mediaUrls: z.array(z.string()).optional(),
  milestones: z
    .array(
      z.object({
        order: z.number(),
        title: z.string().min(3),
        description: z.string().min(5),
        targetDate: z.string().optional(),
      })
    )
    .optional(),
});

export const DuplicateMergeSchema = z.object({
  masterChallengeId: z.string().min(1),
  duplicateChallengeId: z.string().min(1),
  reason: z.string().min(5, "Merge rationale is required"),
});

export const ReviewSchema = z.object({
  solutionId: z.string().min(1),
  rating: z.number().min(1).max(5),
  feasibilityScore: z.number().min(1).max(5),
  impactScore: z.number().min(1).max(5),
  costEffectiveness: z.number().min(1).max(5),
  scalabilityScore: z.number().min(1).max(5),
  feedback: z.string().min(10, "Review feedback must be at least 10 characters"),
});

export const VerificationSchema = z.object({
  challengeId: z.string().min(1),
  status: z.enum(["VERIFIED", "REJECTED", "ASSIGNED"]),
  officialNotes: z.string().min(5, "Official remarks required"),
  assignedUniversityId: z.string().optional(),
  assignedDepartment: z.string().optional(),
  verifiedSeverity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
});
