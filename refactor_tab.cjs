const fs = require('fs');

const tabPath = './src/features/counselor/CounselorStudentManagementTab.tsx';
let code = fs.readFileSync(tabPath, 'utf8');

// 1. Remove mock data functions
code = code.replace(/const getMockDataForUser[\s\S]*?};\n\n/, '');
code = code.replace(/const additionalMockStudents = \[[\s\S]*?\];\n\n/, '');

// 2. Change state variables in CounselorStudentManagementTab
const stateRegex = /const \[students, setStudents\] = useState\(\[\]\);\n\s*(\/\/ Filters)/;
code = code.replace(stateRegex, `const [students, setStudents] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  $1`);

// 3. Rewrite loadData
const loadDataRegex = /const loadData = \(\) => \{[\s\S]*?setStudents\(enriched\);\n  \};\n/;
const newLoadData = `const loadData = async () => {
    setLoading(true);
    try {
      const url = new URL('/api/students', window.location.origin);
      url.searchParams.append('page', currentPage.toString());
      url.searchParams.append('limit', itemsPerPage.toString());
      if (searchQuery) url.searchParams.append('search', searchQuery);
      if (filterGrade) url.searchParams.append('grade', filterGrade);
      if (filterRisk) url.searchParams.append('risk', filterRisk);
      
      const res = await fetch(url.toString(), { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch paginated students');
      const json = await res.json();
      
      const allReqs = getAllRequests();
      
      const enriched = json.data.map(u => {
        const studentReqs = allReqs.filter(r => r.studentId === u.id);
        const activeReqs = studentReqs.filter(r => r.status === 'pending' || r.status === 'in-progress');
        const realActiveCases = activeReqs.length;
        
        const resolvedReqs = studentReqs.filter(r => r.status === 'approved' || r.status === 'rejected').sort((a,b) => new Date(b.resolvedAt).getTime() - new Date(a.resolvedAt).getTime());
        let finalLastSession = 'No resolved cases';
        if (resolvedReqs.length > 0 && resolvedReqs[0].resolvedAt) {
           const diffTime = Math.abs(new Date().getTime() - new Date(resolvedReqs[0].resolvedAt).getTime());
           const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
           finalLastSession = diffDays === 0 ? 'Today' : \`\${diffDays} days ago\`;
        }

        return {
          ...u,
          grade: u.grade || 'N/A',
          gender: u.gender || 'N/A',
          age: u.age || 'N/A',
          riskLevel: u.risklevel || u.riskLevel || 'Low',
          activeCases: realActiveCases.toString(),
          lastSession: finalLastSession
        };
      });
      
      setStudents(enriched);
      setTotalCount(json.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
`;
code = code.replace(loadDataRegex, newLoadData);

// 4. Update effects to watch filter changes (debounce search)
const effectsRegex = /useEffect\(\(\) => \{\n    loadData\(\);\n  \}, \[\]\);\n\n  useDatabaseEvent\('db_updated', loadData\);/;
const newEffects = `useEffect(() => {
    const delay = setTimeout(() => {
      loadData();
    }, 300);
    return () => clearTimeout(delay);
  }, [currentPage, searchQuery, filterGrade, filterRisk]);

  useDatabaseEvent('db_updated', loadData);`;
code = code.replace(effectsRegex, newEffects);

// 5. Replace unique options and remove client-side filter logic
const computeRegex = /\/\/ Apply filters[\s\S]*?const currentStudents = filteredStudents\.slice\(\(currentPage - 1\) \* itemsPerPage, currentPage \* itemsPerPage\);/;
const newCompute = `
  // Use server total for pagination
  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));
  const currentStudents = students;
`;
code = code.replace(computeRegex, newCompute);

// 6. Fix variables that relied on filteredStudents
code = code.replace(/filteredStudents/g, 'students');

// 7. Fix handleDeleteStudent mock removal
const delMockRegex = /const mockIndex = additionalMockStudents\.findIndex[\s\S]*?}\n/;
code = code.replace(delMockRegex, '');

// 8. Fix handleSaveStudent mock condition
const saveMockRegex = /if \(editingStudent\.id\.startsWith\('mock-'\)\) \{[\s\S]*?\} else \{/g;
const saveMockEndRegex = /        \}\n      \}/g;
// Actually, it's easier to rewrite handleSaveStudent entirely
const oldHandleSave = /const handleSaveStudent = async \(data\) => \{[\s\S]*?loadData\(\);\n  \};/;
const newHandleSave = `const handleSaveStudent = async (data) => {
    if (editingStudent) {
      await updateUserProfile(editingStudent.id, {
        name: data.name,
        email: data.email,
        studentId: data.studentId,
        riskLevel: data.riskLevel
      });
    } else {
      const user = await registerUser(data.name, data.email, data.studentId, data.password, 'student');
      if (data.riskLevel) {
         await updateUserProfile(user.id, { riskLevel: data.riskLevel });
      }
    }
    loadData();
  };`;
code = code.replace(oldHandleSave, newHandleSave);


fs.writeFileSync(tabPath, code);
console.log('Successfully refactored CounselorStudentManagementTab.tsx');
