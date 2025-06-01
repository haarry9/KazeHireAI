# KazeHire AI MVP Development Todo List

This is a comprehensive todo list for building the KazeHire AI MVP using Next.js and Supabase. Check off tasks as they are completed.

**Legend:**

- `[ ]` = Pending task
- `[x]` = Completed task
- **Must** = Core MVP features (highest priority)
- **Should** = Important, but not critical

---

## Phase 1: Environment & Tooling Setup

### Must (Core Requirements)

- [x]  Initialize a full-stack Next.js project with Tailwind CSS
- [x]  Set up project structure for frontend and backend (API routes under `pages/api`)
- [x]  Install frontend dependencies: `shadcn/ui`, `lucide-react`, `react-query`, `react-hook-form`, `framer-motion`
- [x]  Install Supabase client: `@supabase/supabase-js`
- [x]  Install Google AI SDK: `@google/genai`
- [x]  Set up a shared GitHub repository and basic README with contribution guidelines

### Should (Associated)

- [x]  Set up code linting and formatter (e.g., ESLint, Prettier)

---

## Phase 2: Supabase Integration

### Must (Core Requirements)

- [x]  Create Supabase project with schema: `users`, `jobs`, `candidates`, `interviews`
- [x]  Set up Supabase Storage buckets for resumes and transcripts
- [x]  Configure Supabase Auth for email/password sign-up and sign-in
- [x]  Integrate Supabase with Next.js using `@supabase/supabase-js`
- [x]  Test Supabase Auth from the backend (API routes created and tested)

### Should (Associated)

- [x]  Implement basic access control in API routes (since RLS is disabled for MVP)

---

## Phase 3: Authentication & Routing

### Must (Core Requirements)

- [x]  Implement frontend sign-up and sign-in forms using React Hook Form and Supabase Auth
- [x]  Add role selection (HR or Interviewer) during sign-up, storing name and role in Supabase `users` table or user metadata
- [x]  Implement route protection using Supabase Auth session checks (e.g., `supabase.auth.getSession()`)
- [x]  Add logout functionality using Supabase Auth

### Should (Associated)

- [x]  Create a modern SaaS-style landing page for KazeHire (hero section, CTA, visuals)
- [x]  Add role-based sidebar navigation

---

## Phase 4: Job Management (HR)

### Must (Core Requirements)

- [x]  Implement API routes: `GET /api/jobs`, `POST /api/jobs`, `PATCH /api/jobs/[id]`
- [x]  Implement frontend components: job list table with status filters, job creation form (title, description, status)
- [x]  Store job data in Supabase and link to HR user

### Should (Associated)

- [x]  Add job editing functionality

---

## Phase 5: Candidate Management (HR)

### Must (Core Requirements)

- [x]  Implement API routes: `POST /api/candidates`, `GET /api/candidates`, `GET /api/candidates/[id]`
- [x]  Implement frontend components: candidate upload form with resume (PDF), job selection, metadata; candidate list view; candidate profile page with resume preview
- [x]  Handle file uploads to Supabase Storage and store URLs in the database

### Should (Associated)

- [x]  Render LinkedIn and cover letter fields on the candidate profile

---

## Phase 6: Resume Matching AI (HR)

### Must (Core Requirements)

- [ ]  Implement API routes: `POST /api/resume_match/existing_pool`, `POST /api/resume_match/manual_upload`
- [ ]  Integrate `@google/genai` to process job descriptions and resumes, returning top 5 candidates
- [ ]  Implement frontend components: Resume Matcher page (existing pool or manual upload), display results in cards with fit score, strengths, concerns, reasoning

### Should (Associated)

- [ ]  Add "Schedule Interview" button directly from match results

---

## Phase 7: Interview Scheduling & Management (HR)

### Must (Core Requirements)

- [ ]  Implement API routes: `POST /api/interviews/schedule`, `GET /api/interviews/[id]`
- [ ]  Implement frontend components: interview scheduling form (date/time, interviewer dropdown), interview list views for upcoming and past interviews

### Should (Associated)

- [ ]  Display interviewer feedback and AI summary for past interviews

---

## Phase 8: Chat Summarization AI (HR)

### Must (Core Requirements)

- [ ]  Implement API route: `POST /api/candidates/[id]/summarize_chat`
- [ ]  Use `@google/genai` to extract availability, salary, interest, and summary from chat transcripts
- [ ]  Implement frontend components: upload transcript (text or PDF), display parsed output

### Should (Associated)

- [ ]  Save extracted fields in the Supabase `candidates` table

---

## Phase 9: Interview Feedback & Summary (Interviewer)

### Must (Core Requirements)

- [ ]  Implement API routes: `POST /api/interviews/[id]/feedback`, `GET /api/interviews/assigned`
- [ ]  Implement frontend components: Interviewer dashboard (assigned interviews), feedback form with status dropdown and text box
- [ ]  Trigger `@google/genai` to generate summary and fit score from feedback
- [ ]  Store summary and raw feedback in the database

### Should (Associated)

- [ ]  Prevent re-generation of the summary once approved

---

## Phase 10: Bias Detection AI (HR)

### Must (Core Requirements)

- [ ]  Implement API route: `POST /api/interviews/[id]/bias_check`
- [ ]  Use `@google/genai` to detect biased terms in feedback and return structured results
- [ ]  Implement frontend components: "Run Bias Check" button with toast feedback, display results

### Should (Associated)

- [ ]  Show results in a table or modal

---

## Phase 11: Final Polish & Deployment

### Must (Core Requirements)

- [ ]  Deploy the full-stack Next.js application to Vercel or Netlify
- [ ]  Set up environment variables for Supabase and Gemini API in the deployment platform
- [ ]  Test full user journeys for both HR and Interviewer roles

### Should (Associated)

- [ ]  Add 404, loading, and error pages
- [ ]  Add minimal favicon, title tags, and basic SEO

---

## Progress Tracking

**Current Phase:** Phase 6 - Resume Matching AI (HR)  
**Overall Progress:** 27/53 tasks completed (50.9%)

### Phase Completion Status:

- [x]  Phase 1: Environment & Tooling Setup (7/7 tasks) ✅ **COMPLETED**
- [x]  Phase 2: Supabase Integration (6/6 tasks) ✅ **COMPLETED**
- [x]  Phase 3: Authentication & Routing (6/6 tasks) ✅ **COMPLETED**
- [x]  Phase 4: Job Management (HR) (4/4 tasks) ✅ **COMPLETED**
- [x]  Phase 5: Candidate Management (HR) (4/4 tasks) ✅ **COMPLETED**
- [ ]  Phase 6: Resume Matching AI (HR) (0/4 tasks)
- [ ]  Phase 7: Interview Scheduling & Management (HR) (0/3 tasks)
- [ ]  Phase 8: Chat Summarization AI (HR) (0/4 tasks)
- [ ]  Phase 9: Interview Feedback & Summary (Interviewer) (0/5 tasks)
- [ ]  Phase 10: Bias Detection AI (HR) (0/4 tasks)
- [ ]  Phase 11: Final Polish & Deployment (0/5 tasks)

---

**Note:** Update this file as tasks are completed. Mark tasks with `[x]` when done and update the progress tracking section.