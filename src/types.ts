export type Role = 'student' | 'counselor';
export type RequestStatus = 'pending' | 'in-progress' | 'approved' | 'rejected';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  studentId?: string; // specific to student
  status?: 'Available' | 'Busy' | 'Away';
  signature?: string;
  bio?: string;
  bannerStyle?: string;
  avatarColor?: string;
  interests?: string[];
  socialHandles?: { linkedIn?: string; twitter?: string; instagram?: string; website?: string };
  preferences?: { uiSound?: boolean; notificationsEnabled?: boolean; availableDays?: number[]; availableSlots?: string[]; availabilitySchedule?: Record<number, string[]> };
}

export interface BaseRequest {
  id: string;
  studentId: string;
  studentName: string;
  status: RequestStatus;
  submissionDate: string;
  assignedTo?: string | null;
  claimedAt?: any;
  resolvedBy?: string;
  resolvedByName?: string;
  resolvedAt?: any;
  counselorNotes?: string;
  privateCounselorNotes?: string; // Counselor only
}

export interface AppointmentRequest extends BaseRequest {
  type: 'appointment';
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
  timestamp: string;
}
