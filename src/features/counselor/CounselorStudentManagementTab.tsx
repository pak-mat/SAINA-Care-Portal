import React, { useState, useEffect, useMemo, useRef } from 'react';
import toast from 'react-hot-toast';
import { createPortal } from 'react-dom';
import { 
  GraduationCap, 
  Search, 
  Users, 
  ChevronDown, 
  SlidersHorizontal, 
  Check,
  Trash2,
  X,
  FileText, AlertTriangle, Calendar, MessageSquare, ShieldAlert,

  MoreVertical, Edit3, Mail, RefreshCw, Archive, FileKey, Activity, Clock
} from 'lucide-react';
import { useStudents, useCaseNotes, useSubmitCaseNote, useStudentTimeline } from '../../hooks/queries';
import { useAuth } from '../../context/AuthContext';
import { getRelativeTime } from '../../utils/time';
import { useUpdateUser } from '../../hooks/mutations';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../../types';
import Dropdown from '../../components/ui/Dropdown';
import StudentProfileDrawer from './components/StudentProfileDrawer';
import StudentTable from './components/StudentTable';
import { PAGINATION } from '../../utils/constants';



export default function CounselorStudentManagementTab({ onStartChat }: { onStartChat?: (id: string) => void }) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterForm, setFilterForm] = useState('');
  const [filterRisk, setFilterRisk] = useState('');
  const [filterActive, setFilterActive] = useState('active');
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = PAGINATION.STUDENT_MANAGEMENT_LIMIT;
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const updateUser = useUpdateUser();
  const [editingStudent, setEditingStudent] = useState<User | null>(null);

  const { data: studentsData, isLoading: loading } = useStudents(currentPage, itemsPerPage, searchQuery, filterForm, filterRisk, filterActive);
  const students = studentsData?.data || [];
  const totalCount = studentsData?.total || 0;

  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));

  useEffect(() => { setCurrentPage(1); }, [searchQuery, filterForm, filterRisk, filterActive]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedIds(new Set(students.map((s: User) => s.id)));
    else setSelectedIds(new Set());
  };

  const handleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleViewStudent = (student: User, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingStudent(student);
    setDrawerOpen(true);
  };

  const handleUpdateStudent = async (data: Partial<User>) => {
    if (!editingStudent) return;
    updateUser.mutate({ id: editingStudent.id, data }, {
      onSuccess: () => {
        setDrawerOpen(false);
      }
    });
  };

  const handleArchive = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Archive this student? They will lose access but records will be kept.")) {
      updateUser.mutate({ id, data: { status: 'Archived' } });
    }
  };

  const handleBulkArchive = async () => {
    if (window.confirm(`Archive ${selectedIds.size} students?`)) {
      const promises = Array.from(selectedIds as Set<string>).map(id => updateUser.mutateAsync({ id, data: { status: 'Archived' } }));
      await Promise.all(promises);
      setSelectedIds(new Set());
    }
  };

  return (
    <>
      <AnimatePresence>
        {drawerOpen && (
          <StudentProfileDrawer 
            isOpen={drawerOpen} 
            onClose={() => setDrawerOpen(false)} 
            student={editingStudent} 
            onSave={handleUpdateStudent} 
          />
        )}
      </AnimatePresence>

      <div className="h-full w-full overflow-y-auto p-4 sm:p-6 lg:p-8 bg-transparent font-sans">
        <div className="max-w-[1400px] mx-auto bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl border border-white/20 dark:border-zinc-800/50 rounded-3xl shadow-xl overflow-hidden">
          
          <div className="bg-gradient-to-r from-emerald-900 to-slate-900 dark:from-emerald-950 dark:to-black px-8 py-8 flex items-center justify-between text-white relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 opacity-20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/4 pointer-events-none"></div>
            <div className="flex items-center gap-5 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 backdrop-blur-sm flex items-center justify-center border border-emerald-400/30 shadow-lg">
                <GraduationCap size={28} className="text-emerald-100" />
              </div>
              <div>
                <h1 className="font-extrabold text-3xl tracking-tight">Student Command Center</h1>
                <p className="text-emerald-100/70 text-xs font-bold uppercase tracking-widest mt-1">Saina Care Core • {totalCount} Records</p>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
              <div className="flex flex-wrap gap-3 flex-1">
                <div className="relative max-w-sm w-full xl:w-72 group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search by name..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all shadow-sm"
                  />
                </div>
                <Dropdown icon="🎓" label="Form" options={['1', '2', '3', '4', '5']} value={filterForm} onChange={setFilterForm} />
                <Dropdown icon={ShieldAlert} label="Risk" options={['Low', 'Medium', 'High', 'Critical']} value={filterRisk} onChange={setFilterRisk} />
                <Dropdown icon={Activity} label="Status" options={['active', 'archived']} value={filterActive} onChange={setFilterActive} />
              </div>

              <AnimatePresence>
                {selectedIds.size > 0 && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/30 px-4 py-2 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
                    <span className="text-sm font-bold text-emerald-800 dark:text-emerald-400">{selectedIds.size} Selected</span>
                    <div className="h-4 w-px bg-emerald-200 dark:bg-emerald-800"></div>
                    <button onClick={handleBulkArchive} className="text-sm font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 flex items-center gap-1.5 transition-colors">
                      <Archive size={14} /> Bulk Archive
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <StudentTable 
              loading={loading}
              students={students}
              selectedIds={selectedIds}
              handleSelectAll={handleSelectAll}
              handleSelectRow={handleSelectRow}
              handleViewStudent={handleViewStudent}
              handleArchive={handleArchive}
              onStartChat={onStartChat}
              totalPages={totalPages}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          </div>
        </div>
      </div>
    </>
  );
}
