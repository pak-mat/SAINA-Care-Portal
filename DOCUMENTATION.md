# Saina Care Portal - Comprehensive Technical Documentation

## 1. Project Overview
**Saina Care Portal** is a modern, responsive web application designed as a comprehensive wellness and counseling platform tailored for boarding school students and their guidance counselors. It bridges the gap between students needing mental health support and school counselors managing large caseloads, offering tools for triage, appointment booking, daily check-ins, and direct communication.

---

## 2. Tech Stack & Architecture
- **Frontend Framework**: React 18 built with Vite.
- **Styling**: Tailwind CSS & Vanilla CSS (`index.css`), utilizing a Glassmorphism UI design language.
- **Routing**: React Router DOM for role-based access control (`/login`, `/student/dashboard`, `/counselor/dashboard`).
- **State & Data Management**: React Query (`@tanstack/react-query`) for asynchronous state, caching, and server state synchronization using custom hooks (`queries.ts`, `mutations.ts`).
- **Backend & Database**: Supabase (PostgreSQL, Authentication, Storage buckets for uploads, Realtime subscriptions for chat).
- **Animations**: Framer Motion (used strategically for smooth fading transitions, strictly avoiding unprofessional layout morphs or bouncy hovers).
- **Icons**: Lucide React.

---

## 3. Core Roles & Authentication
The platform uses Supabase Auth and supports two primary user roles, strictly isolating access:
- **Student**: Accesses personal wellness tracking, appointment requests, resource library, and chat.
- **Counselor (Admin)**: Accesses triage workspaces, student directories, case files, reporting, and schedule management.

---

## 4. Student Portal Features
- **Daily Wellness Check-in**: An intelligent, non-intrusive modal prompt allowing students to log their daily mood score and private notes upon logging in.
- **Dashboard Hub (`StudentDashboardHub.tsx`)**: A centralized command center displaying a personalized greeting, quick action buttons, a daily tip, and a summary of pending requests.
- **Appointment Booking (`AppointmentForm.tsx`)**: Students can select a counseling reason category, write detailed notes, and pick up to 3 preferred time slots using the interactive `CalendarPicker` and `TimeSlotPicker`.
- **Transfer/Permission Requests (`PermissionForm.tsx`)**: Form for submitting school transfer or boarding permission requests, complete with necessary document file uploads.
- **Request History (`RequestHistoryHub.tsx`)**: A timeline view showing the real-time status (Pending, In-Progress, Approved, Rejected) of all submitted requests.
- **Self-Care Vault (`ResourceVault.tsx`)**: A curated library of articles and wellness strategies (Stress Management, Time Management, etc.) presented in a distraction-free, instantaneous modal overlay.
- **Real-Time Chat (`StudentChatTab.tsx`)**: Direct messaging system connecting students to their assigned counselors. Supports text, image, and document attachments.
- **Profile Customization (`SettingsTab.tsx`)**: Students can upload avatars to Supabase Storage, update their biography, and select a customized profile banner (e.g., Indigo Dusk, Emerald Forest).
- **Intake Onboarding (`IntakeOnboardingModal.tsx`)**: A one-time setup flow for new students to provide essential background data to their counselors.

---

## 5. Counselor Portal Features
- **Kanban Triage Workspace (`KanbanWorkspace.tsx`)**: A visual board for counselors to manage, claim, and organize incoming student requests across statuses (New, In-Progress, Resolved).
- **Student Management Directory (`CounselorStudentManagementTab.tsx`)**: A searchable, filterable directory of the entire student body.
- **Student Profile Drawer**: A slide-out panel detailing a student's history, intake information (family background, medical history, goals), recent check-ins, and counselor-assigned risk levels (Low, Medium, High, Crisis).
- **Case Detail Sidebar (`CaseDetailSidebar.tsx`)**: A deep dive into specific appointment or transfer requests, allowing counselors to leave private, internal notes that the student cannot see.
- **PDF Report Generation (`AppointmentPDFReport.tsx`)**: Automatically compile and download professional PDF summaries for completed appointments for school record-keeping.
- **Availability Management (`CounselorAvailabilityTab.tsx`)**: Tools for counselors to define their weekly recurring schedule and block out specific unavailable dates to prevent booking conflicts.
- **Archive & Search (`CounselorArchiveSearchTab.tsx`)**: A robust search interface to comb through historical, resolved cases and past student interactions.
- **Centralized Chat (`CounselorChatTab.tsx`)**: A unified inbox for counselors to manage multiple simultaneous conversations with their assigned students.

---

## 6. Shared Community Features
- **My Profiles Directory (`MyProfilesTab.tsx`)**: A social directory where users can view active network members, filter by roles (Counselor, Advocate), and give "Kudos" to peers. Includes dynamic status indicators (Online, Busy, Away).
- **Feedback System (`FeedbackTab.tsx`)**: An embedded form for users to report bugs, suggest platform improvements, or request new features.
- **Theme Engine**: System-wide Dark Mode and Light Mode support via `ThemeContext`.

---

## 7. Database Models (Supabase Schema Overview)
- `users`: Core profile data including `role`, `status`, `accountStatus`, and a robust `preferences` JSONB column (stores `uiSound`, `bannerStyle`, `avatarUrl`, etc.).
- `appointments`: Tracks `choice1`, `choice2`, `reasonCategory`, `scheduledAt`, and `counselorNotes`.
- `transfers`: Tracks school permission requests along with `transferFormsFile` URL references.
- `wellness_checkins`: Timestamps, `mood_score`, and `checkin_notes` submitted by students.
- `chat_messages`: Real-time messaging table linking `studentId`, `counselorId`, and file payload metadata.
- `student_intake`: Stores sensitive onboarding info like `familyBackground` and `counselingGoals`.
- `notifications`: Powers the in-app notification bell system (`read` boolean, `message`).

---

## 8. UX/UI Philosophy
- **Professional & Clean**: The UI leverages polished interfaces using soft shadows, crisp borders, and semantic color coding (Emerald for health/success, Red for alerts).
- **Responsive Snappiness**: Deliberate removal of "bouncy" or overly-animated morphing transitions in favor of instant, snappy UI rendering to ensure the application feels like a professional productivity tool rather than a toy.
- **Responsive Design**: Fully mobile-optimized with sticky bottom navigation on small screens, gracefully expanding into full sidebars on desktops.
