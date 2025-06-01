// Constants for API routes and status enums
export const API_ROUTES = {
  JOBS: "/api/jobs",
  CANDIDATES: "/api/candidates",
  INTERVIEWS: "/api/interviews",
  RESUME_MATCH: "/api/resume_match",
  AI: "/api/ai",
} as const;

export const JOB_STATUS = {
  ACTIVE: "Active",
  PAUSED: "Paused",
  CLOSED: "Closed",
} as const;

export const INTERVIEW_STATUS = {
  SCHEDULED: "Scheduled",
  COMPLETED: "Completed",
} as const;

export const USER_ROLES = {
  HR: "HR",
  INTERVIEWER: "INTERVIEWER",
} as const;

export const COLORS = {
  PRIMARY: "#1A73E8",
  SECONDARY: "#00BFA5",
  BACKGROUND: "#F9FAFB",
  SURFACE: "#FFFFFF",
  BORDER: "#E5E7EB",
  TEXT_PRIMARY: "#1F2937",
  TEXT_MUTED: "#6B7280",
  ERROR: "#EF4444",
} as const;