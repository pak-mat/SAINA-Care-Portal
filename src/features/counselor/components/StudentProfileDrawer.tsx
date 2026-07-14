import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { createPortal } from 'react-dom';
import { 
  X,
  FileText, AlertTriangle, Calendar, MessageSquare, ShieldAlert,
  Edit3, Mail, Archive, FileKey, Activity, Clock, Check
} from 'lucide-react';
import { useCaseNotes, useSubmitCaseNote, useStudentTimeline, useStudentIntake } from '../../../hooks/queries';
import { useAuth } from '../../../context/AuthContext';
import { getRelativeTime } from '../../../utils/time';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../../../types';

// Side Panel Drawer
export default function StudentProfileDrawer({ isOpen, onClose, student, onSave }: { isOpen: boolean, onClose: () => void, student: User | null, onSave: (data: Partial<User>) => void }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [riskLevelMode, setRiskLevelMode] = useState('Low');
  const [form, setForm] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [accountStatus, setAccountStatus] = useState('Active');
  const [guardianName, setGuardianName] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Notes state
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteType, setNoteType] = useState('general');

  // Queries
  const { data: caseNotes } = useCaseNotes(student?.id);
  const { data: timeline } = useStudentTimeline(student?.id);
  const { data: intakeData } = useStudentIntake(student?.id || '');
  const submitNote = useSubmitCaseNote();

  useEffect(() => {
    if (student) {
      setName(student.name || '');
      setEmail(student.email || '');
      setStudentId(student.studentId || '');
      setRiskLevelMode(student.riskLevel || 'Low');
      setForm(student.form || '');
      setGender(student.gender || '');
      setAge(student.age || '');
      setAccountStatus(student.accountStatus || 'Active');
      setGuardianName(student.guardianName || '');
      setEmergencyContact(student.emergencyContact || '');
      setIsEditing(false);
    }
  }, [student]);

  if (!isOpen) return null;

  const handleSaveNote = () => {
    if (!noteContent.trim() || !student || !user) return;
    submitNote.mutate(
      { studentId: student.id, counselorId: user.id, title: noteTitle, content: noteContent, noteType },
      {
        onSuccess: () => {
          setNoteTitle('');
          setNoteContent('');
        }
      }
    );
  };

  const drawerContent = (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]" />
      <motion.div 
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-zinc-900 shadow-2xl z-[101] flex flex-col overflow-hidden border-l border-slate-200 dark:border-zinc-800"
      >
        <div className="bg-gradient-to-r from-emerald-900 to-slate-900 dark:from-emerald-950 dark:to-black p-6 pb-8 relative shrink-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 opacity-20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/4 pointer-events-none"></div>
          <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
            <X size={20} />
          </button>
          
          <div className="flex items-start gap-4 mt-2">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0 text-white font-bold text-2xl shadow-xl">
              {name.split(' ').map((n: string) => n[0]).slice(0,2).join('').toUpperCase() || 'S'}
            </div>
            <div className="flex-1 mt-1">
              <h2 className="text-xl font-bold text-white leading-tight">{name || 'Unknown Student'}</h2>
              <p className="text-emerald-100/70 text-sm mt-1 flex items-center gap-2">
                <FileKey size={14} /> ID: {studentId || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex px-4 pt-2 gap-4 border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 shrink-0">
          <button onClick={() => setActiveTab('overview')} className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'overview' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}>Overview</button>
          <button onClick={() => setActiveTab('notes')} className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'notes' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}>Case Notes</button>
          <button onClick={() => setActiveTab('activity')} className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'activity' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}>Timeline</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-zinc-900">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">Profile Details</h3>
                <button onClick={() => setIsEditing(!isEditing)} className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors">
                  <Edit3 size={14} /> {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                </button>
              </div>

              <div className="space-y-6">
                {/* Core Demographics */}
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200 mb-3 border-b border-slate-200 dark:border-zinc-800 pb-2">Core Demographics</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
                      <input type="text" value={name} onChange={e => setName(e.target.value)} disabled={!isEditing} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm font-medium text-slate-900 dark:text-white disabled:opacity-70 outline-none focus:ring-2 focus:ring-emerald-500/20" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
                      <input type="email" value={email} disabled className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm font-medium text-slate-900 dark:text-white opacity-70 outline-none" title="Email cannot be changed directly" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Student ID</label>
                      <input type="text" value={studentId} onChange={e => setStudentId(e.target.value)} disabled={!isEditing} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm font-medium text-slate-900 dark:text-white disabled:opacity-70 outline-none focus:ring-2 focus:ring-emerald-500/20" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Form / Grade</label>
                      <input type="text" value={form} onChange={e => setForm(e.target.value)} disabled={!isEditing} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm font-medium text-slate-900 dark:text-white disabled:opacity-70 outline-none focus:ring-2 focus:ring-emerald-500/20" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Gender</label>
                      <select value={gender} onChange={e => setGender(e.target.value)} disabled={!isEditing} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm font-medium text-slate-900 dark:text-white disabled:opacity-70 outline-none focus:ring-2 focus:ring-emerald-500/20">
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Age</label>
                      <input type="number" value={age} onChange={e => setAge(e.target.value)} disabled={!isEditing} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm font-medium text-slate-900 dark:text-white disabled:opacity-70 outline-none focus:ring-2 focus:ring-emerald-500/20" />
                    </div>
                  </div>
                </div>

                {/* Account & Risk Management */}
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200 mb-3 border-b border-slate-200 dark:border-zinc-800 pb-2">Account & Risk Management</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Account Status</label>
                      <select value={accountStatus} onChange={e => setAccountStatus(e.target.value)} disabled={!isEditing} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm font-medium text-slate-900 dark:text-white disabled:opacity-70 outline-none focus:ring-2 focus:ring-emerald-500/20">
                        <option value="Active">Active</option>
                        <option value="Suspended">Suspended</option>
                        <option value="Graduated">Graduated</option>
                        <option value="Archived">Archived</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Risk Level Override</label>
                      <select value={riskLevelMode} onChange={e => setRiskLevelMode(e.target.value)} disabled={!isEditing} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm font-medium text-slate-900 dark:text-white disabled:opacity-70 outline-none focus:ring-2 focus:ring-emerald-500/20">
                        <option value="Low">Low Risk</option>
                        <option value="Medium">Medium Risk</option>
                        <option value="High">High Risk</option>
                        <option value="Critical">Critical Risk</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Guardian / Parent Info */}
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200 mb-3 border-b border-slate-200 dark:border-zinc-800 pb-2">Guardian / Parent Info</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Guardian Name</label>
                      <input type="text" value={guardianName} onChange={e => setGuardianName(e.target.value)} disabled={!isEditing} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm font-medium text-slate-900 dark:text-white disabled:opacity-70 outline-none focus:ring-2 focus:ring-emerald-500/20" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Emergency Contact</label>
                      <input type="text" value={emergencyContact} onChange={e => setEmergencyContact(e.target.value)} disabled={!isEditing} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm font-medium text-slate-900 dark:text-white disabled:opacity-70 outline-none focus:ring-2 focus:ring-emerald-500/20" />
                    </div>
                  </div>
                </div>

                {/* Intake Form Data */}
                {intakeData && (
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200 mb-3 border-b border-slate-200 dark:border-zinc-800 pb-2 flex items-center gap-2">
                      <FileText size={16} className="text-emerald-500" />
                      Intake Form Responses
                    </h4>
                    <div className="space-y-4 bg-slate-50 dark:bg-zinc-950 p-4 rounded-xl border border-slate-200 dark:border-zinc-800">
                      <div>
                        <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Living Situation</span>
                        <p className="text-sm text-slate-900 dark:text-zinc-200 font-medium">{intakeData.family_background || 'Not specified'}</p>
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Health & Medical</span>
                        <p className="text-sm text-slate-900 dark:text-zinc-200 font-medium">{intakeData.medical_history || 'Not specified'}</p>
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Previous Counseling</span>
                        <p className="text-sm text-slate-900 dark:text-zinc-200 font-medium">{intakeData.previous_counseling ? 'Yes' : 'No'}</p>
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Counseling Goals</span>
                        <p className="text-sm text-slate-900 dark:text-zinc-200 font-medium">{intakeData.counseling_goals || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {isEditing && (
                <div className="pt-4 mt-6 border-t border-slate-100 dark:border-zinc-800">
                  <button onClick={() => { 
                    onSave({ 
                      name, 
                      studentId, 
                      riskLevel: riskLevelMode,
                      form,
                      gender,
                      age,
                      accountStatus,
                      guardianName,
                      emergencyContact
                    }); 
                    setIsEditing(false); 
                  }} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2">
                    <Check size={18} /> Save Changes
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-6">
              <div className="bg-slate-50 dark:bg-zinc-950 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3">
                <input 
                  type="text" 
                  placeholder="Note Title (Optional)" 
                  value={noteTitle}
                  onChange={e => setNoteTitle(e.target.value)}
                  className="w-full bg-transparent border-b border-slate-200 dark:border-zinc-800 pb-2 text-sm font-bold outline-none text-slate-900 dark:text-white"
                />
                <textarea 
                  placeholder="Write a secure case note..." 
                  value={noteContent}
                  onChange={e => setNoteContent(e.target.value)}
                  rows={4}
                  className="w-full bg-transparent text-sm resize-none outline-none text-slate-700 dark:text-zinc-300"
                />
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-zinc-800">
                  <select 
                    value={noteType} 
                    onChange={e => setNoteType(e.target.value)}
                    className="text-xs font-bold text-slate-500 bg-transparent outline-none cursor-pointer"
                  >
                    <option value="general">General Note</option>
                    <option value="behavioral">Behavioral</option>
                    <option value="academic">Academic</option>
                    <option value="clinical">Clinical</option>
                  </select>
                  <button 
                    onClick={handleSaveNote}
                    disabled={submitNote.isPending || !noteContent.trim()}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {submitNote.isPending ? 'Saving...' : 'Save Note'}
                  </button>
                </div>
              </div>
              
              <div className="space-y-4 mt-8">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider">Note History</h3>
                {!caseNotes || caseNotes.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">No case notes found.</p>
                ) : (
                  caseNotes.map((note: any) => (
                    <div key={note.id} className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm relative group">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          {note.title && <h4 className="font-bold text-slate-800 dark:text-zinc-100 text-sm">{note.title}</h4>}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-500 uppercase tracking-wider">{note.note_type}</span>
                            <span className="text-[11px] text-slate-400 flex items-center gap-1"><Clock size={12}/> {getRelativeTime(note.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-zinc-400 whitespace-pre-wrap leading-relaxed">{note.content}</p>
                      <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800 font-medium">Logged by {note.users?.name || 'Counselor'}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-zinc-800 before:to-transparent">
              {!timeline || timeline.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center px-4 relative z-10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-xl">
                  <Activity size={32} className="text-slate-300 dark:text-zinc-700 mb-3" />
                  <p className="text-sm font-bold text-slate-700 dark:text-zinc-300">No Recent Activity</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">Timeline events will appear here once the student starts interacting with the platform.</p>
                </div>
              ) : (
                timeline.map((event: any, i: number) => (
                  <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-zinc-900 bg-slate-100 dark:bg-zinc-800 text-slate-500 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm relative z-10">
                      {event.type === 'appointment' && <Calendar size={16} className="text-blue-500" />}
                      {event.type === 'transfer' && <Archive size={16} className="text-amber-500" />}
                      {event.type === 'checkin' && <MessageSquare size={16} className="text-emerald-500" />}
                      {event.type === 'case_note' && <FileText size={16} className="text-purple-500" />}
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {event.type.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400">{getRelativeTime(event.date.toISOString())}</span>
                      </div>
                      
                      {event.type === 'appointment' && (
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-zinc-200">Appointment Requested</p>
                          <p className="text-xs text-slate-500 mt-1">Status: <span className="capitalize">{event.data.status}</span></p>
                        </div>
                      )}
                      
                      {event.type === 'transfer' && (
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-zinc-200">Transfer Request Submitted</p>
                          <p className="text-xs text-slate-500 mt-1">To: {event.data.target_school}</p>
                        </div>
                      )}
                      
                      {event.type === 'checkin' && (
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-zinc-200">Wellness Check-in</p>
                          <p className="text-xs text-slate-500 mt-1">Mood Score: {event.data.mood_score}/5</p>
                        </div>
                      )}
                      
                      {event.type === 'case_note' && (
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-zinc-200">Case Note Added</p>
                          <p className="text-xs text-slate-500 mt-1">By: {event.data.users?.name}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </motion.div>
    </>
  );

  return createPortal(drawerContent, document.body);
}
