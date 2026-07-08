# 🌿 SAINA Care Portal

SAINA Care Portal is a modern, comprehensive, and mobile-optimized web application built to bridge the gap between students and mental health professionals. Designed with a stunning UI and robust backend architecture, it provides a seamless ecosystem for students to request counseling, chat securely with professionals, and access mental health resources, while equipping counselors with powerful triage and case-management tools.

---

## ✨ Key Features

### 🎓 For Students
* **Personalized Dashboard:** A clean, widget-driven hub to view upcoming appointments, recent activity, and wellness trends.
* **Appointment & Transfer Requests:** Easily request counseling sessions or school transfers with multi-step, animated forms.
* **Real-Time Secure Chat:** Communicate directly and securely with assigned counselors via a real-time messaging interface with image upload support.
* **Wellness Check-ins:** Daily mood tracking and wellness self-reporting.
* **Resource Vault:** Access a curated library of mental health resources and reading materials.
* **Directory & Social:** View counselor profiles and manage privacy settings for the student directory.

### 💼 For Counselors
* **Triage Workspace (Kanban):** A comprehensive drag-and-drop or list-view interface to manage active student cases, appointments, and transfer requests.
* **Advanced Case Management:** Detailed sidebars to review student history, approve/reject requests, and log both visible and private counselor notes.
* **Student Timeline:** An aggregated view of a student's entire history (appointments, check-ins, transfers, and notes) in one chronological timeline.
* **Availability Matrix:** Intuitive calendar interface to set and update working hours, manage time off, and sync availability.
* **PDF Reports:** Generate and download professional PDF reports for individual appointments.
* **Community Directory:** Manage visibility and connect with other counselors and students.

### ⚡ Technical Highlights
* **Mobile & Tablet Optimized:** Deep optimizations including safe-area padding for iOS notches, touch-action manipulations to remove tap delays, and disabled overscroll bouncing.
* **Real-time Synchronization:** Built on React Query and Supabase Realtime for instant UI updates across clients.
* **Glassmorphic UI:** Premium aesthetics featuring dynamic gradient orbs, frosted glass components, and silky smooth Framer Motion micro-animations.

---

## 🚀 Tech Stack

* **Frontend Framework:** React 18 (Vite) + TypeScript
* **State Management:** TanStack React Query + React Context
* **Styling:** Tailwind CSS + Vanilla CSS (Custom tokens and utilities)
* **Animations:** Framer Motion
* **Icons:** Lucide React
* **Backend & Database:** Supabase (PostgreSQL, GoTrue Auth, Realtime, Storage)
* **PDF Generation:** jsPDF + html2canvas

---

## 🛠️ Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.
You will also need a Supabase project set up.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/pak-mat/SAINA-Care-Portal.git
   cd SAINA-Care-Portal
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Database Setup:**
   - Open your Supabase project's SQL Editor.
   - Copy the contents of `supabase-production.sql` and `supabase-social-schema.sql` and run them to generate the necessary tables, indexes, and Row Level Security (RLS) policies.

4. **Environment Setup:**
   Create a `.env` file in the root directory and add your keys:
   ```env
   VITE_SUPABASE_URL=your_supabase_url_here
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. Open your browser and navigate to `http://localhost:5173` to see the app in action!

### Seeding Demo Users (Optional)
If you need to populate the database with demo accounts for testing (e.g., student and counselor accounts), you can use the provided script:
```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_key node seed_users.cjs
```

---

## 🔒 Security & Privacy
This application utilizes strict **Row Level Security (RLS)** in Supabase.
- Students can only read and write their own data, requests, and messages.
- Case notes and private counselor notes are strictly isolated and invisible to student accounts.
- The platform uses secure authentication via Supabase Auth.
