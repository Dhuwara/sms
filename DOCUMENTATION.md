# AJM International Institution — School Management System
## Complete User Guide & Documentation

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [User Roles](#2-user-roles)
3. [Getting Started — First-Time Setup (Admin)](#3-getting-started--first-time-setup-admin)
4. [Admin Module — Full Guide](#4-admin-module--full-guide)
5. [Staff Module — Full Guide](#5-staff-module--full-guide)
6. [Student Module — Full Guide](#6-student-module--full-guide)
7. [Parent Module — Full Guide](#7-parent-module--full-guide)
8. [Super Admin Module](#8-super-admin-module)
9. [Recommended Setup Order (Checklist)](#9-recommended-setup-order-checklist)

---

## 1. System Overview

AJM School Management System (SMS) is a cloud-based platform for managing all school operations — from admissions to exams, fees, attendance, communication, and payroll — through a single unified platform.

- **Frontend:** React (Vite) — hosted on Vercel
- **Backend:** Node.js / Express — hosted on AWS EC2
- **Database:** MongoDB Atlas
- **Authentication:** JWT with httpOnly cookies (access token 15 min, refresh token 7 days)

---

## 2. User Roles

| Role | Access Level | Login |
|---|---|---|
| **Super Admin** | Full platform control across all schools | `/superadmin/login` |
| **Admin** | Full control over their school | `/login` |
| **Staff / Teacher** | Class management, marks, attendance | `/login` |
| **Student** | View own data, homework, timetable | `/login` |
| **Parent** | View child's data, fees, communication | `/login` |

---

## 3. Getting Started — First-Time Setup (Admin)

When you register a school, an Admin account is created automatically. Follow this exact order to set up the system correctly. **Skipping steps will cause issues** (e.g., you cannot add students without a class).

### Step 1 — Register the School
1. Go to the landing page and click **Register School**
2. Fill in school name, type, address, admin name, email, phone, and password
3. Click **Register** — you will be redirected to login

### Step 2 — Log In as Admin
1. Go to `/login`
2. Enter the admin email and password you used during registration

### Step 3 — Add Teachers First
> Teachers must exist before you can create classes (a class requires a class teacher).

1. Go to **Teachers** in the sidebar
2. Click **Add Teacher**
3. Fill in: Name, Email, Phone, Subjects Taught, Qualification, Experience
4. The system auto-generates an Employee ID
5. A login account is automatically created for the teacher (they can log in with their email)

### Step 4 — Create Classes
> A class requires a class teacher to be assigned.

1. Go to **Classes** in the sidebar
2. Click **Add Class**
3. Fill in: Class Name (e.g., Grade 10), Section (e.g., A), Grade Level, Class Teacher
4. Add subjects to the class — each subject can be assigned a subject teacher

### Step 5 — Add Students
> Students must be assigned to a class at the time of creation.

1. Go to **Students** in the sidebar
2. Click **Add Student**
3. Fill in: Name, Date of Birth, Gender, Address, Parent Contact, Class, Roll Number, Status
4. The system auto-generates a Roll Number
5. A parent login account is automatically created using the parent contact details

### Step 6 — Configure Class Mapping (Optional)
> Class Mapping links classes to academic standards for timetable and grade purposes.

1. Go to **Classes → Class Mapping** tab
2. Map each class to its standard (e.g., Grade 10 A → Standard 10)

### Step 7 — Set Up Timetable
1. Go to **Classes → Timetable** tab (or via Staff → Timetable)
2. Select a class and configure period slots per day
3. Assign subjects and teachers to each period

### Step 8 — Configure Fee Structure
1. Go to **Fees** in the sidebar
2. Go to the **Fee Structure** tab
3. Create fee types (e.g., Tuition Fee, Transport Fee, Exam Fee)
4. Assign amounts per class/standard
5. Once structure is saved, fee records are auto-generated for all students in that class

### Step 9 — Set Up Exams
1. Go to **Exams** in the sidebar
2. Go to **Exam Settings** tab — create exam types (e.g., Unit Test, Term Exam, Final Exam)
3. Configure grading scale under **Grades** tab
4. After exams, enter marks under the **Marks** tab

---

## 4. Admin Module — Full Guide

### Dashboard
- Overview cards: Total Students, Teachers, Classes, Fee collection
- Today's student and teacher attendance summary
- Recent activity feed
- Pending leave requests — approve or reject with reason directly from dashboard
- Quick actions: Add Student, Add Teacher, Post Announcement

---

### Students
- **Add Student:** Name, DOB, Gender, Address, Parent Contact, Class, Roll Number, Status
- **Edit Student:** Update any field including class transfer
- **Delete Student:** Removes student and login account
- **Search/Filter:** By name, roll number, class, status
- **Student limit:** Enforced by Super Admin plan (shows warning if limit reached)

---

### Teachers
- **Add Teacher:** Name, Email, Phone, Subjects, Qualification, Experience, Employee ID
- **Edit Teacher:** Update profile, subjects, class assignment
- **Delete Teacher:** Removes teacher and login account
- **Staff limit:** Enforced by Super Admin plan

---

### Classes
**Tabs:**
- **Classes:** Create and manage classes. Each class has a name, section, grade level, and class teacher.
- **Subjects:** Add subjects to a class with subject teacher assignment
- **Class Config:** Configure period duration, number of periods per day
- **Class Mapping:** Map classes to academic standards
- **Timetable:** Assign subjects to periods for each day of the week

---

### Attendance
- Mark daily student attendance: Present / Absent / Late
- View attendance by class and date
- Generate attendance reports
- Monthly attendance summary per student

---

### Exams
**Tabs:**
- **Exam Settings:** Create exam schedules with name, subject, class, date, start time, duration (end time auto-calculated)
- **Marks:** Enter marks per student per subject per exam
- **Grades:** Configure grade scale (A+, A, B+, B, C, D, E, F) with percentage ranges
- **Reports:** View student report cards with grade summary

---

### Fees
**Tabs:**
- **Fee Records:** View all fee records per student — paid, pending, overdue
- **Fee Structure:** Create fee types and assign amounts per class
- **Payments:** Record fee payments, view payment history
- **Reports:** Fee collection summary, defaulter list

---

### Library
**Tabs:**
- **Books:** Add, edit, delete books (Title, Author, ISBN, Category, Total Copies, Available Copies)
- **Issue Records:** Issue books to students, set due date
  - Edit issue: Change due date (fine/status auto-recalculated)
  - Delete issue: Restores available copy count
  - Mark Return: Marks book as returned

---

### Communication
**Tabs:**
- **Email:** Send emails to individual, class, standard, or all parents/staff
- **WhatsApp:** Coming Soon
- **PTM (Parent-Teacher Meeting):** Schedule PTMs with date, time, venue, target audience; view and delete scheduled PTMs
- **Announcements:** Post announcements with title, message, priority (low/normal/high/urgent)
- **Circulars:** Post circulars to all parents, all staff, or everyone

---

### Substitutions
- Assign substitute teacher when a teacher is absent
- Select absent teacher, substitute teacher, class, subject, date, period
- View all substitutions in a table

---

### Scholarships & Awards
- Create scholarships/awards with name, amount, criteria, academic year
- Assign scholarships to students
- View all awards and recipients

---

### Payroll
- Create payroll records for staff
- Fields: Staff member, month/year, basic salary, allowances, deductions, net salary
- View payroll history per staff member

---

### Calendar Events
- Create school events (Sports Day, Holiday, Exam, Meeting, etc.)
- Set date, time, description, event type
- Visible to all portal users

---

### Enquiries
- View all demo requests submitted from the landing page
- Columns: Name, Email, Phone, Date, Message
- Click **Mark Contacted** to toggle contacted status (green = contacted, grey = pending)
- Click any message to open full details with **Reply via Email** button

---

### Settings
- Update admin profile (name, email, phone)
- Change password
- School information

---

## 5. Staff Module — Full Guide

Staff log in at `/login` with the email set by the admin.

### Profile
- View and update name, email, phone number
- Changes sync back to the admin Teachers page automatically

### Attendance (Staff Self-Service)
- **Check In:** Records arrival time; auto-marks as Present (before 9:15 AM) or Late
- **Check Out:** Records departure; calculates working hours vs 8-hour schedule
- **Attendance History:** Last 7 days with check-in/out times
- **Leave Balance:** Shows remaining Casual (15/year) and Sick (5/year) leave days
- **Apply for Leave:** Select type (Casual/Sick), date range, reason, select approvers from staff list
- **Leave Status:** View all applications with Pending / Approved / Rejected badges

### Timetable
- View personal teaching timetable by day
- See assigned classes, subjects, and periods

### Class (My Classes)
- View students in assigned class(es)
- Mark class attendance
- View class-wise reports

### Academic
- Manage homework: Create, assign to class/subject, set due date
- Manage online classes: Schedule live sessions with meeting link
- Manage study materials: Upload notes/resources per subject

### Marks
- Enter student marks for assigned subjects
- Select exam, class, subject — enter marks per student

### Library
- View available books
- View own issued books and due dates

### Payroll
- View own salary slips and payment history

### Documents
- Upload and manage personal documents (certificates, ID, etc.)

### Settings
- Update profile (name, email, phone)
- Change password with current password verification

---

## 6. Student Module — Full Guide

Students log in at `/login` using credentials created when admin adds them.

### Profile
- View personal information: Name, Roll Number, Class, DOB, Address, Parent Contact

### Attendance
- View own monthly attendance
- See present/absent/late days
- Percentage summary

### Timetable
- View class timetable — subjects, teachers, period timings per day

### Online Classes
- View scheduled online classes
- Access meeting links for live sessions

### Homework
- View assigned homework by subject
- See due dates and submission status

### Exams
- View upcoming exam schedule
- View marks and grades after results are published

### Library
- View available books in school library
- View own issued books and return due dates

### Activities
- View scholarships and awards received
- View school events and calendar

---

## 7. Parent Module — Full Guide

A parent account is automatically created when a student is added. The parent phone number is used as the login contact. Parents log in at `/login`.

### Profile
- View and update contact information
- Changes sync to child's student record automatically

### Student Overview
- View child's basic profile: class, roll number, attendance summary

### Attendance
- View child's daily attendance records
- Monthly summary with percentage

### Academic Progress
- View exam marks and grades
- View report card
- Track performance across subjects

### Fees
- View fee records: paid, pending, overdue
- View payment history and receipts

### Communication
- View announcements from school
- View circulars
- View PTM (Parent-Teacher Meeting) schedules

### Scholarships & Awards
- View awards and scholarships received by child

### Settings
- Update profile (name, email, phone)
- Change password

---

## 8. Super Admin Module

Access at `/superadmin/login`. The Super Admin manages all schools registered on the platform.

### Dashboard (Stats)
- Total schools, total students, total staff across all schools

### Schools Management
- View all registered schools
- Edit school details
- **Pause** a school — blocks login for all users of that school
- **Resume** a paused school
- **Suspend** a school — permanently disables the account
- **Delete** a school

### Subscription Management
Per school, configure:
- **Plan Name** (e.g., Basic, Standard, Premium)
- **Max Students** — admin cannot add beyond this limit
- **Max Staff** — admin cannot add beyond this limit
- **Subscription Status** (active / paused / suspended)
- **Expiry Date**

> When a student or staff limit is reached, the admin sees a clear error message when trying to add more. They must contact the Super Admin to upgrade their plan.

---

## 9. Recommended Setup Order (Checklist)

Use this checklist when setting up a new school from scratch:

```
PHASE 1 — School Setup
  [ ] Register school at /signup
  [ ] Log in as admin
  [ ] Go to Settings — verify school name, email, phone

PHASE 2 — Staff Setup
  [ ] Add all teachers (Teachers → Add Teacher)
  [ ] Note each teacher's auto-generated Employee ID

PHASE 3 — Academic Structure
  [ ] Create classes (Classes → Add Class) — assign class teacher to each
  [ ] Add subjects to each class with subject teacher
  [ ] Configure Class Config (periods per day, duration)
  [ ] Set up Class Mapping (link classes to standards)
  [ ] Build Timetable (assign subjects to period slots)

PHASE 4 — Students
  [ ] Add all students (Students → Add Student)
  [ ] Verify parent contact is correct (parent login is created from this)
  [ ] Share login credentials with parents

PHASE 5 — Fees
  [ ] Create Fee Types (Fees → Fee Structure)
  [ ] Assign fee amounts per class
  [ ] Verify fee records are auto-generated for all students

PHASE 6 — Exams
  [ ] Configure grade scale (Exams → Grades)
  [ ] Create exam schedule (Exams → Exam Settings)

PHASE 7 — Go Live
  [ ] Post first Announcement (Communication → Announcements)
  [ ] Verify staff can log in
  [ ] Verify at least one parent can log in
  [ ] Verify student can log in
```

---

## Common Questions

**Q: A teacher was added but cannot log in.**
A: Go to Teachers, verify their email is correct. Their login uses the email entered during creation. Use Forgot Password if needed.

**Q: Student limit reached — cannot add more students.**
A: Contact the Super Admin to increase the max student count for your school plan.

**Q: Parent says they cannot see their child's data.**
A: Go to Students, find the student, verify the Parent Contact phone number matches what the parent is using to log in.

**Q: Fee records are not showing for a student.**
A: Fee records are generated when a Fee Structure is saved. Go to Fees → Fee Structure, ensure the student's class has a fee structure assigned, then save it again.

**Q: How do I transfer a student to another class?**
A: Go to Students → Edit the student → Change the Class field → Save.

**Q: Staff attendance check-in is not available.**
A: Staff can only check in once per day. If they already checked in, the button is disabled for the rest of the day.

---

*AJM International Institution — School Management System*
*Support: ajminstitution@gmail.com | Phone: +91 9884620202*
