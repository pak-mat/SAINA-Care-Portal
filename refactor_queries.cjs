const fs = require('fs');

let content = fs.readFileSync('src/hooks/queries.ts', 'utf8');

// Insert DTO helpers after imports
const dtoHelpers = `
import { User, AppointmentRequest, PermissionRequest } from '../types';

export const mapUserDTO = (dbUser: any): User => ({
  id: dbUser.id,
  name: dbUser.name,
  email: dbUser.email,
  role: dbUser.role,
  studentId: dbUser.studentid,
  status: dbUser.status,
  bio: dbUser.bio,
  bannerStyle: dbUser.banner_style || dbUser.bannerStyle,
  avatarColor: dbUser.avatar_color || dbUser.avatarColor,
  interests: dbUser.interests,
  socialHandles: dbUser.social_handles || dbUser.socialHandles,
  preferences: dbUser.preferences,
  form: dbUser.form,
  gender: dbUser.gender,
  age: dbUser.age,
  riskLevel: dbUser.risklevel,
  accountStatus: dbUser.account_status || dbUser.status,
  guardianName: dbUser.guardian_name,
  emergencyContact: dbUser.emergency_contact,
  assignedCounselor: dbUser.assigned_counselor
});

export const mapAppointmentDTO = (dbAppt: any): AppointmentRequest => ({
  id: dbAppt.id,
  studentId: dbAppt.studentid,
  studentName: dbAppt.studentname || dbAppt.users?.name || 'Unknown',
  status: dbAppt.status,
  submissionDate: dbAppt.created_at,
  assignedTo: dbAppt.assignedto,
  claimedAt: dbAppt.claimedat,
  resolvedBy: dbAppt.resolvedby,
  resolvedAt: dbAppt.resolvedat,
  counselorNotes: dbAppt.counselornotes,
  privateCounselorNotes: dbAppt.privatecounselornotes,
  type: 'appointment',
  choice1: dbAppt.choice1,
  choice2: dbAppt.choice2,
  choice3: dbAppt.choice3,
  reasonCategory: dbAppt.reasoncategory,
  details: dbAppt.details,
  scheduledAt: dbAppt.scheduledat,
  notified: dbAppt.notified,
});

export const mapTransferDTO = (dbTrans: any): PermissionRequest => ({
  id: dbTrans.id,
  studentId: dbTrans.studentid,
  studentName: dbTrans.studentname || dbTrans.users?.name || 'Unknown',
  status: dbTrans.status,
  submissionDate: dbTrans.created_at,
  assignedTo: dbTrans.assignedto,
  claimedAt: dbTrans.claimedat,
  resolvedBy: dbTrans.resolvedby,
  resolvedAt: dbTrans.resolvedat,
  counselorNotes: dbTrans.counselornotes,
  privateCounselorNotes: dbTrans.privatecounselornotes,
  type: 'permission',
  targetSchool: dbTrans.targetschool,
  reason: dbTrans.reason,
  transferFormsFile: dbTrans.transferformsfile,
  academicRecordsFile: dbTrans.academicrecordsfile,
  idDocumentsFile: dbTrans.iddocumentsfile,
});
`;

if (!content.includes('mapUserDTO')) {
    content = content.replace("import { supabase } from '../lib/supabase';", "import { supabase } from '../lib/supabase';\n" + dtoHelpers);
}

// Modify useStudents
content = content.replace('data: data || [],', 'data: (data || []).map(mapUserDTO),');

// Modify useAppointments
content = content.replace('data: data || [],', 'data: (data || []).map(mapAppointmentDTO),');

// Modify useTransfers
content = content.replace('data: data || [],', 'data: (data || []).map(mapTransferDTO),');

fs.writeFileSync('src/hooks/queries.ts', content);
console.log('DTOs added to queries.ts');
