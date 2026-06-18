// File: src/services/localEngine.ts
import { User, PortalRequest, Notification, ChatMessage, AppointmentRequest, PermissionRequest } from '../types';
import DOMPurify from 'dompurify';

const MASTER_DB_KEY = 'saina_master_db';
const SESSION_KEY = 'saina_session';

export interface LocalDB {
  users: User[];
  requests: PortalRequest[];
  messages: ChatMessage[];
  notifications: Notification[];
}

let isSyncing = false;

// We hit the backend API for sync
export async function forceSupabaseSync() {
  if (isSyncing) return;
  const session = getSession();
  if (!session) {
    // Skip backend synchronized state if there is no authenticated session established
    return;
  }
  isSyncing = true;
  try {
    let headers: Record<string, string> = { 'Content-Type': 'application/json' };

    const response = await fetch('/api/sync', {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({ role: session?.role, userId: session?.id })
    });
    
    if (response.status === 401 || response.status === 403) {
      clearSession();
      window.location.reload();
      return;
    }

    if (!response.ok) throw new Error('Sync failed via API');
    const { users, requests, messages, notifications } = await response.json();

    const db = getDB();
    let hasChanges = false;
    
    // Create a snapshot to compare after
    const vBefore = JSON.stringify(db);
    
    if (users) {
      const mappedUsers = users.map((u: any) => ({
        ...u,
        studentId: u.studentid || u.studentId
      }));
      const localUsers = new Map(db.users.map(u => [u.id, u]));
      mappedUsers.forEach((u: any) => {
        const existing = localUsers.get(u.id);
        if (existing && existing.password) {
          u.password = existing.password;
        }
        localUsers.set(u.id, u);
      });
      db.users = Array.from(localUsers.values());
    }
    
    if (requests) {
      const mappedRequests = requests.map((r: any) => ({
        ...r,
        studentId: r.studentid || r.studentId,
        studentName: r.studentname || r.studentName,
        assignedTo: r.assignedto || r.assignedTo,
        resolvedBy: r.resolvedby || r.resolvedBy,
        resolvedByName: r.resolvedbyname || r.resolvedByName,
        counselorNotes: r.counselornotes || r.counselorNotes,
        privateCounselorNotes: r.privatecounselornotes || r.privateCounselorNotes,
        targetSchool: r.targetschool || r.targetSchool,
        reasonCategory: r.reasoncategory || r.reasonCategory,
        transferFormsFile: r.transferformsfile || r.transferFormsFile,
        academicRecordsFile: r.academicrecordsfile || r.academicRecordsFile,
        idDocumentsFile: r.iddocumentsfile || r.idDocumentsFile,
        submissionDate: r.submissiondate || r.submissionDate,
        claimedAt: r.claimedat || r.claimedAt,
        resolvedAt: r.resolvedat || r.resolvedAt,
        scheduledAt: r.scheduledat || r.scheduledAt,
        choice1: r.choice1
      }));
      const localReqs = new Map(db.requests.map(r => [r.id, r]));
      mappedRequests.forEach((r: any) => localReqs.set(r.id, r));
      db.requests = Array.from(localReqs.values());
    }
    
    if (messages) {
      const mappedMessages = messages.map((m: any) => ({
        ...m,
        studentId: m.studentid || m.studentId,
        counselorId: m.counselorid || m.counselorId,
        senderId: m.senderid || m.senderId,
        imageBase64: m.imagebase64 || m.imageBase64
      }));
      const localMsgs = new Map(db.messages.map(m => [m.id, m]));
      mappedMessages.forEach((m: any) => localMsgs.set(m.id, m));
      db.messages = Array.from(localMsgs.values());
    }
    
    if (notifications) {
      const mappedNotifs = notifications.map((n: any) => ({
        ...n,
        userId: n.userid || n.userId
      }));
      const localNotifs = new Map(db.notifications.map(n => [n.id, n]));
      mappedNotifs.forEach((n: any) => localNotifs.set(n.id, n));
      db.notifications = Array.from(localNotifs.values());
    }
    
    const vAfter = JSON.stringify(db);
    if (vBefore !== vAfter) {
      hasChanges = true;
    }

    if (hasChanges) {
      localStorage.setItem(MASTER_DB_KEY, JSON.stringify(db));
      window.dispatchEvent(new Event('db_updated'));
    }
  } catch (error) {
    console.error("Backend API sync failed", error);
  } finally {
    isSyncing = false;
  }
}

// Start polling every 5 seconds for live chat and notifications
forceSupabaseSync();
let syncInterval: any;
function startPolling() {
  if (syncInterval) clearInterval(syncInterval);
  syncInterval = setInterval(() => {
    if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
      forceSupabaseSync();
    }
  }, 5000);
}
startPolling();

export function initDB() {
  if (!localStorage.getItem(MASTER_DB_KEY)) {
    const defaultDB: LocalDB = {
      users: [
        { id: '123e4567-e89b-12d3-a456-426614174000', name: 'Adam Shah', email: 'adam@demo.com', role: 'student', studentId: 'ST-001' },
         { id: '123e4567-e89b-12d3-a456-426614174001', name: 'Cik Nor', email: 'nor@demo.com', role: 'counselor' }
      ],
      requests: [],
      messages: [],
      notifications: []
    };
    localStorage.setItem(MASTER_DB_KEY, JSON.stringify(defaultDB));
  }
}

// Keep memory DB in sync across tabs
window.addEventListener('storage', (e) => {
  if (e.key === MASTER_DB_KEY) {
    window.dispatchEvent(new Event('db_updated'));
  }
});

export function getDB(): LocalDB {
  initDB();
  return JSON.parse(localStorage.getItem(MASTER_DB_KEY) || '{}');
}

function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function saveDB(db: LocalDB) {
  localStorage.setItem(MASTER_DB_KEY, JSON.stringify(db));
  window.dispatchEvent(new Event('db_updated'));
}

async function safeSupabaseInsert(table: string, payload: any) {
  try {
    let headers: Record<string, string> = { 'Content-Type': 'application/json' };

    const res = await fetch('/api/db/insert', {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({ table, payload })
    });
    if (res.status === 401 || res.status === 403) {
      clearSession();
      window.location.reload();
      return;
    }
    const { error } = await res.json();
    if (error) console.error(`API Insert Error [${table}]:`, error);
    forceSupabaseSync(); // immediate sync back
  } catch (err) {
    console.error('API write exception', err);
  }
}

async function safeSupabaseUpdate(table: string, id: string, updates: any) {
  try {
    let headers: Record<string, string> = { 'Content-Type': 'application/json' };

    const res = await fetch('/api/db/update', {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({ table, id, updates })
    });
    if (res.status === 401 || res.status === 403) {
      clearSession();
      window.location.reload();
      return;
    }
    forceSupabaseSync(); 
  } catch (err) {
    console.error('API update exception', err);
  }
}

// ------ AUTHENTICATION ------

export async function loginUser(email: string, password?: string): Promise<User | null> {
  const cleanEmail = email.trim().toLowerCase();
  
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, password })
    });
    
    if (res.ok) {
      const { user } = await res.json();
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      
      const db = getDB();
      const idx = db.users.findIndex((u) => u.id === user.id);
      if (idx === -1) {
         db.users.push(user);
         saveDB(db);
      }
      return user;
    }
  } catch (err) {
     console.error('API login check failed', err);
  }
  
  // Fallback to local without password check (for demo environments if api is offline)
  const db = getDB();
  const user = db.users.find((u) => u.email.trim().toLowerCase() === cleanEmail);
  if (user) {
    if (user.password && user.password !== 'dummy' && user.password !== 'backend-hashed' && password) {
      // Since security is backend only, we cannot verify local hashes anymore.
      // If we are offline and backend is inaccessible, we just trust the demo login
      // or reject if password is provided but can't be checked.
      if (!['adam@demo.com', 'nor@demo.com'].includes(cleanEmail)) {
        throw new Error('Authentication server is offline. Cannot verify credentials.');
      }
    }
    const safeUser = { ...user };
    delete safeUser.password;
    localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
    return safeUser;
  }
  return null;
}

export async function registerUser(name: string, email: string, studentId: string | undefined, password?: string, role: 'student' | 'counselor' = 'student'): Promise<User> {
  const cleanEmail = DOMPurify.sanitize(email.trim().toLowerCase());
  const sanitizedName = DOMPurify.sanitize(name);
  const sanitizedStudentId = studentId ? DOMPurify.sanitize(studentId) : undefined;
  
  const db = getDB();
  if (db.users.find(u => u.email.trim().toLowerCase() === cleanEmail)) {
    throw new Error('Email is already registered. Please login.');
  }
  
  const generatedId = generateUUID();

  const res = await fetch('/api/auth/register', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: generatedId,
      name: sanitizedName,
      email: cleanEmail,
      studentId: sanitizedStudentId,
      password: password, // Send plain text for backend to hash
      role
    })
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Server registration failed. Please try again.');
  }

  const { user } = await res.json();
  
  // The backend already handles inserting to the remote database
  // We keep a dummy password locally, as real verification happens in backend now
  const localUser = { ...user, password: 'backend-hashed' };
  db.users.push(localUser);
  saveDB(db);
  
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  
  return user;
}

export function getSession(): User | null {
  const session = localStorage.getItem(SESSION_KEY);
  return session ? JSON.parse(session) : null;
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(console.error);
}

export async function bypassDemoStudent(): Promise<User> {
  const user = await loginUser('adam@demo.com');
  if (user) return user;
  throw new Error('Demo student not found');
}

export async function bypassDemoCounselor(): Promise<User> {
  const user = await loginUser('nor@demo.com');
  if (user) return user;
  throw new Error('Demo counselor not found');
}

// ------ DATA ACCESS ------

export function markAppointmentNotified(requestId: string) {
  const db = getDB();
  const idx = db.requests.findIndex(r => r.id === requestId);
  if (idx !== -1 && db.requests[idx].type === 'appointment') {
    (db.requests[idx] as AppointmentRequest).notified = true;
    saveDB(db);
    safeSupabaseUpdate('requests', requestId, { notified: true });
  }
}

export function getAllRequests(): PortalRequest[] {
  return getDB().requests;
}

export function createAppointment(reqData: Partial<AppointmentRequest>) {
  const db = getDB();
  const sanitizedDetails = DOMPurify.sanitize(reqData.details || '');
  const newReq: AppointmentRequest = {
    ...reqData,
    details: sanitizedDetails,
    type: 'appointment',
    id: generateUUID(),
    status: 'pending',
    submissionDate: new Date().toISOString(),
    assignedTo: null
  } as AppointmentRequest;
  db.requests.push(newReq);
  saveDB(db);
  safeSupabaseInsert('requests', newReq);
}

export function createSchoolTransfer(reqData: Partial<PermissionRequest>) {
  const db = getDB();
  const sanitizedReason = DOMPurify.sanitize(reqData.reason || '');
  const newReq: PermissionRequest = {
    ...reqData,
    reason: sanitizedReason,
    type: 'permission',
    id: generateUUID(),
    status: 'pending',
    submissionDate: new Date().toISOString(),
    assignedTo: null
  } as PermissionRequest;
  db.requests.push(newReq);
  saveDB(db);
  safeSupabaseInsert('requests', newReq);
}

export function claimCase(requestId: string, counselorId: string, counselorName: string) {
  const db = getDB();
  const idx = db.requests.findIndex(r => r.id === requestId);
  if (idx !== -1) {
    db.requests[idx].assignedTo = counselorId;
    db.requests[idx].status = 'in-progress';
    db.requests[idx].claimedAt = new Date().toISOString();
    
    // Notify student
    const notif = {
      id: generateUUID(),
      userId: db.requests[idx].studentId,
      message: `Your request has been claimed by ${counselorName}.`,
      date: new Date().toISOString(),
      read: false
    };
    db.notifications.push(notif as any);
    
    saveDB(db);
    
    safeSupabaseUpdate('requests', requestId, {
      assignedTo: counselorId,
      status: 'in-progress',
      claimedAt: db.requests[idx].claimedAt
    });
    safeSupabaseInsert('notifications', notif);
  }
}

export function resolveCase(requestId: string, status: 'approved' | 'rejected', notes: string, privateNotes: string, counselorId: string, counselorName: string, scheduledAt?: string) {
  const db = getDB();
  const idx = db.requests.findIndex(r => r.id === requestId);
  const sanitizedNotes = DOMPurify.sanitize(notes || '');
  const sanitizedPrivateNotes = DOMPurify.sanitize(privateNotes || '');
  if (idx !== -1) {
    db.requests[idx].status = status;
    db.requests[idx].counselorNotes = sanitizedNotes;
    db.requests[idx].privateCounselorNotes = sanitizedPrivateNotes;
    db.requests[idx].resolvedBy = counselorId;
    db.requests[idx].resolvedByName = counselorName;
    db.requests[idx].resolvedAt = new Date().toISOString();
    
    if (scheduledAt) {
      if (db.requests[idx].type === 'appointment') {
        (db.requests[idx] as AppointmentRequest).scheduledAt = scheduledAt;
      }
    }

    const notif = {
      id: generateUUID(),
      userId: db.requests[idx].studentId,
      message: `Your request has been ${status} by ${counselorName}.`,
      date: new Date().toISOString(),
      read: false
    };
    db.notifications.push(notif as any);

    saveDB(db);
    
    let updates: any = {
      status, counselorNotes: sanitizedNotes, privateCounselorNotes: sanitizedPrivateNotes,
      resolvedBy: counselorId, resolvedByName: counselorName, resolvedAt: db.requests[idx].resolvedAt
    };
    if (scheduledAt) updates.scheduledAt = scheduledAt;
    
    safeSupabaseUpdate('requests', requestId, updates);
    safeSupabaseInsert('notifications', notif);
  }
}

export function saveCaseNotes(requestId: string, notes: string, privateNotes: string, scheduledAt?: string) {
  const db = getDB();
  const idx = db.requests.findIndex(r => r.id === requestId);
  const sanitizedNotes = DOMPurify.sanitize(notes || '');
  const sanitizedPrivateNotes = DOMPurify.sanitize(privateNotes || '');
  
  if (idx !== -1) {
    db.requests[idx].counselorNotes = sanitizedNotes;
    db.requests[idx].privateCounselorNotes = sanitizedPrivateNotes;
    
    let updates: any = {
      counselorNotes: sanitizedNotes, 
      privateCounselorNotes: sanitizedPrivateNotes
    };
    
    if (scheduledAt && db.requests[idx].type === 'appointment') {
      (db.requests[idx] as AppointmentRequest).scheduledAt = scheduledAt;
      updates.scheduledAt = scheduledAt;
    }
    
    saveDB(db);
    safeSupabaseUpdate('requests', requestId, updates);
  }
}

export function sendChatMessage(studentId: string, counselorId: string, senderId: string, text: string, imageBase64?: string) {
  const db = getDB();
  const sanitizedText = DOMPurify.sanitize(text || '');
  const msg = {
    id: generateUUID(),
    studentId,
    counselorId,
    senderId,
    text: sanitizedText,
    imageBase64,
    timestamp: new Date().toISOString()
  };
  db.messages.push(msg as any);
  saveDB(db);
  window.dispatchEvent(new Event('db_updated'));
  safeSupabaseInsert('messages', msg);
}

export function fetchMessagesByStudent(studentId: string): ChatMessage[] {
  return getDB().messages.filter(m => m.studentId === studentId);
}

export function fetchMessagesByCounselor(counselorId: string): ChatMessage[] {
  return getDB().messages.filter(m => m.counselorId === counselorId);
}

export function fetchNotifications(userId: string): Notification[] {
  return getDB().notifications.filter(n => n.userId === userId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function markNotificationsAsRead(userId: string) {
  const db = getDB();
  let changed = false;
  db.notifications.forEach(n => {
    if (n.userId === userId && !n.read) {
      n.read = true;
      changed = true;
      safeSupabaseUpdate('notifications', n.id, { read: true });
    }
  });
  if (changed) saveDB(db);
}

export function getAllUsers(): User[] {
  return getDB().users.map(u => {
    const safeUser = { ...u };
    delete safeUser.password;
    return safeUser;
  });
}

export function updateUserProfile(userId: string, updates: Partial<User>): User | null {
  const db = getDB();
  const idx = db.users.findIndex(u => u.id === userId);
  if (idx !== -1) {
    const sanitizedUpdates: Partial<User> = { ...updates };
    if (sanitizedUpdates.name) sanitizedUpdates.name = DOMPurify.sanitize(sanitizedUpdates.name);
    if (sanitizedUpdates.email) sanitizedUpdates.email = DOMPurify.sanitize(sanitizedUpdates.email);
    if (sanitizedUpdates.studentId) sanitizedUpdates.studentId = DOMPurify.sanitize(sanitizedUpdates.studentId);
    
    db.users[idx] = { ...db.users[idx], ...sanitizedUpdates };
    saveDB(db);
    
    const sbUpdates = { ...sanitizedUpdates };
    delete sbUpdates.password;
    if (Object.keys(sbUpdates).length > 0) {
      safeSupabaseUpdate('users', userId, sbUpdates);
    }
    
    const safeUser = { ...db.users[idx] };
    delete safeUser.password;
    
    const session = getSession();
    if (session && session.id === userId) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
    }
    
    return safeUser;
  }
  return null;
}

export function resetDB() {
  localStorage.removeItem(MASTER_DB_KEY);
  initDB();
  window.dispatchEvent(new Event('db_updated'));
}

export function exportDB() {
  const db = getDB();
  const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sainacare_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
