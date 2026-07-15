export type Role = 'student' | 'counselor';
export type RequestStatus = 'pending' | 'in-progress' | 'approved' | 'rejected';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  studentId?: string;
  status?: 'Available' | 'Busy' | 'Away' | 'Archived';
  signature?: string;
  bio?: string;
  bannerStyle?: string;
  avatarColor?: string;
  avatarUrl?: string;
  interests?: string[];
  socialHandles?: { linkedIn?: string; twitter?: string; instagram?: string; website?: string };
  preferences?: { uiSound?: boolean; notificationsEnabled?: boolean; availableDays?: number[]; availableSlots?: string[]; availabilitySchedule?: Record<number, string[]> };
  form?: string;
  gender?: string;
  age?: string;
  riskLevel?: 'Low' | 'Medium' | 'High' | 'Crisis' | 'Critical';
  accountStatus?: 'Active' | 'Suspended' | 'Graduated' | 'Archived';
  guardianName?: string;
  emergencyContact?: string;
  assignedCounselor?: string;
}

export interface BaseRequest {
  id: string;
  studentId: string;
  studentName: string;
  status: RequestStatus;
  submissionDate: string;
  assignedTo?: string | null;
  claimedAt?: string;
  resolvedBy?: string;
  resolvedByName?: string;
  resolvedAt?: string;
  counselorNotes?: string;
  privateCounselorNotes?: string; // Counselor only
}

export interface AppointmentRequest extends BaseRequest {
  type: 'appointment';
  counselorName?: string;
  choice1: string;
  choice2?: string;
  choice3?: string;
  reasonCategory: string;
  details: string;
  scheduledAt?: string;
  notified?: boolean;
}

export interface PermissionRequest extends BaseRequest {
  type: 'permission';
  targetSchool: string;
  reason: string;
  transferFormsFile?: string | null;
  academicRecordsFile?: string | null;
  idDocumentsFile?: string | null;
}

export type PortalRequest = AppointmentRequest | PermissionRequest;

export interface Notification {
  id: string;
  userId: string;
  message: string;
  date: string;
  read: boolean;
}

export interface ChatMessage {
  id: string;
  studentId: string;
  counselorId: string;
  senderId: string;
  text: string;
  imageBase64?: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  timestamp: string;
}

export interface StudentIntake {
  id: string;
  studentId: string;
  familyBackground?: string;
  medicalHistory?: string;
  previousCounseling?: boolean;
  counselingGoals?: string;
  createdAt: string;
}
