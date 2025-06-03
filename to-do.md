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

## Phase 6: Resume Matching AI (HR) - SIMPLIFIED MVP

### Must (Core Requirements)

- [x]  Implement API routes: `POST /api/resume_match/existing_pool`, `POST /api/resume_match/manual_upload`
- [x]  Integrate `@google/genai` to process job descriptions and resumes, returning top candidates (all if ≤5, top 5 if >5)
- [x]  Implement frontend components: Resume Matcher page (existing pool or manual upload), display results in cards with fit score (1-10), strengths, concerns, reasoning
- [x]  **SIMPLIFIED FOR MVP**: Process ALL resumes in system against job description (no DB candidate mapping)

### Should (Associated)

- [x]  **REMOVED FOR MVP**: Schedule Interview functionality (simplified to focus on core AI matching)

**MVP Notes for Phase 6:**
- ✅ Fixed authentication validation error (`validateUser` function)
- ✅ Simplified to process all resumes against job description without complex DB mapping
- ✅ Consistent 1-10 scoring system for both existing pool and manual upload
- ✅ Handles variable resume count (return all if ≤5, top 5 if >5)
- ✅ Removed schedule interview functionality to focus on core AI matching
- ✅ Uses vision-based PDF processing (PDF→Image→Gemini AI)

---

## Phase 7: Interview Scheduling & Management (HR) - MODIFIED FOR MVP

### Must (Core Requirements)

- [x]  Implement API route: `GET /api/interviews` - Fetch all interviews for HR
- [x]  Implement modern Interview Management page with real data from database
- [x]  Display upcoming interviews (scheduled status) and completed interviews in separate tables
- [x]  Show candidate name, job title, interviewer, date/time, status, and fit score
- [ ]  **DEFERRED**: Interview scheduling form (manual data entry used for MVP)

### Should (Associated)

- [x]  Display interviewer feedback and AI summary for completed interviews
- [x]  Stats cards showing counts of upcoming, completed, and total interviews
- [x]  Modern, sleek design with proper badges and hover effects

**MVP Notes for Phase 7:**
- ✅ **MVP MODIFICATION**: Skipped interview scheduling implementation since we have pre-populated data
- ✅ Created comprehensive Interview Management page that fetches real data from Supabase
- ✅ Modern table design with proper status badges and fit score indicators
- ✅ Integrated with bias check functionality for completed interviews
- ✅ Used existing interview data (3 completed, 2 scheduled) for demonstration

---

## Phase 8: Chat Summarization AI (HR)

### Must (Core Requirements)

- [x]  Implement API route: `POST /api/candidates/[id]/summarize_chat`
- [x]  Use `@google/genai` to extract availability, salary, interest, and summary from chat transcripts
- [x]  Implement frontend components: text area for pasting transcript, display parsed output

### Should (Associated)

- [x]  Save extracted fields in the Supabase `candidates` table

**Phase 8 Notes:**
- ✅ Complete API route implementation with Google Gemini AI integration
- ✅ Modern UI component with gradient design and AI sparkle icon
- ✅ Text area for pasting chat transcripts (no file upload needed)
- ✅ Real-time AI processing with loading states and error handling
- ✅ Database updates with extracted availability, salary, interest level, and summary
- ✅ Modern 3-column responsive layout replacing the old 4-box grid
- ✅ Highlighted AI features with prominent positioning
- ✅ Toast notifications for user feedback

---

## Phase 9: Interview Feedback & Summary (Interviewer) - SKIPPED FOR MVP

### Must (Core Requirements)

- [ ]  **SKIPPED FOR MVP**: Implement API routes: `POST /api/interviews/[id]/feedback`, `GET /api/interviews/assigned`
- [ ]  **SKIPPED FOR MVP**: Implement frontend components: Interviewer dashboard (assigned interviews), feedback form with status dropdown and text box
- [ ]  **SKIPPED FOR MVP**: Trigger `@google/genai` to generate summary and fit score from feedback
- [ ]  **SKIPPED FOR MVP**: Store summary and raw feedback in the database

### Should (Associated)

- [ ]  **SKIPPED FOR MVP**: Prevent re-generation of the summary once approved

**MVP Notes for Phase 9:**
- ❌ **SKIPPED FOR MVP**: Since we already have interview data with feedback and AI summaries in the database, we decided to skip implementing the interviewer feedback workflow for the MVP
- ❌ **SKIPPED FOR MVP**: The interview table already contains 3 completed interviews with raw feedback, AI summaries, and fit scores
- ❌ **SKIPPED FOR MVP**: This functionality can be implemented in a future version when we need live interviewer input

---

## Phase 10: Bias Detection AI (HR)

### Must (Core Requirements)

- [x]  Implement API route: `POST /api/interviews/[id]/bias_check`
- [x]  Use `@google/genai` to detect biased terms in feedback and return structured results
- [x]  Implement frontend components: "Run Bias Check" button with toast feedback, display results

### Should (Associated)

- [x]  Show results in toast notifications (simplified for MVP)

**Phase 10 Notes:**
- ✅ Complete bias detection API using Google Gemini AI
- ✅ Comprehensive bias analysis covering gender, age, race, appearance, accent, and cultural factors
- ✅ Integrated into Interview Management page with bias check buttons for completed interviews
- ✅ Toast notifications for user feedback (simplified from modal display)
- ✅ Proper error handling and authentication checks

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

**Current Phase:** Phase 11 - Final Polish & Deployment  
**Overall Progress:** 42/53 tasks completed (79.2%)

### Phase Completion Status:

- [x]  Phase 1: Environment & Tooling Setup (7/7 tasks) ✅ **COMPLETED**
- [x]  Phase 2: Supabase Integration (6/6 tasks) ✅ **COMPLETED**
- [x]  Phase 3: Authentication & Routing (6/6 tasks) ✅ **COMPLETED**
- [x]  Phase 4: Job Management (HR) (4/4 tasks) ✅ **COMPLETED**
- [x]  Phase 5: Candidate Management (HR) (4/4 tasks) ✅ **COMPLETED**
- [x]  Phase 6: Resume Matching AI (HR) (4/4 tasks) ✅ **COMPLETED - SIMPLIFIED MVP**
- [x]  Phase 7: Interview Scheduling & Management (HR) (3/4 tasks) ✅ **COMPLETED - MVP MODIFIED**
- [x]  Phase 8: Chat Summarization AI (HR) (4/4 tasks) ✅ **COMPLETED**
- [ ]  Phase 9: Interview Feedback & Summary (Interviewer) (0/5 tasks) ❌ **SKIPPED FOR MVP**
- [x]  Phase 10: Bias Detection AI (HR) (4/4 tasks) ✅ **COMPLETED**
- [ ]  Phase 11: Final Polish & Deployment (0/5 tasks)

---

**Note:** Update this file as tasks are completed. Mark tasks with `[x]` when done and update the progress tracking section.

**MVP Modifications Summary:**
1. **Phase 7**: Modified to focus on displaying existing interview data instead of implementing scheduling
2. **Phase 9**: Completely skipped as we have pre-populated interview data with feedback
3. **Phase 10**: Completed with simplified toast-based feedback instead of modal displays
4. **Overall**: Core AI features and HR workflow completed, interviewer workflow deferred to future version