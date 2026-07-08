const fs = require('fs');
const serverPath = './server.ts';
let code = fs.readFileSync(serverPath, 'utf8');

// 1. Add Endpoints
const endpointsCode = `
  // Pagination & Filtering Endpoints
  app.get("/api/students", authenticateToken, async (req: any, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = (req.query.search as string) || '';
      const grade = req.query.grade as string;
      const risk = req.query.risk as string;

      if (req.user.role !== 'counselor') {
        return res.status(403).json({ error: 'Forbidden' });
      }

      let query = supabase.from('users').select('*', { count: 'exact' }).eq('role', 'student');

      if (search) {
        query = query.or(\`name.ilike.%\${search}%,studentid.ilike.%\${search}%\`);
      }
      
      if (grade) {
        query = query.eq('grade', grade);
      }
      if (risk) {
        query = query.ilike('risklevel', \`%\${risk}%\`);
      }
      
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      const { data, error, count } = await query.range(from, to).order('created_at', { ascending: false });

      if (error) throw error;
      
      const users = data.map((u: any) => {
        delete u.password;
        return u;
      });

      res.json({
        data: users,
        total: count || 0,
        page,
        totalPages: count ? Math.ceil(count / limit) : 0
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch students' });
    }
  });

  app.get("/api/requests", authenticateToken, async (req: any, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string;
      const studentId = req.query.studentId as string;

      let query = supabase.from('requests').select('*', { count: 'exact' });

      if (req.user.role === 'student') {
        query = query.eq('studentid', req.user.id);
      } else if (studentId) {
        query = query.eq('studentid', studentId);
      }

      if (status) {
        query = query.eq('status', status);
      }

      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      const { data, error, count } = await query.range(from, to).order('created_at', { ascending: false });

      if (error) throw error;

      res.json({
        data,
        total: count || 0,
        page,
        totalPages: count ? Math.ceil(count / limit) : 0
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch requests' });
    }
  });
`;

code = code.replace('  app.post("/api/db/insert"', endpointsCode + '\n  app.post("/api/db/insert"');

// 2. Update schemaCache
code = code.replace(
  "users: ['id', 'name', 'email', 'role', 'studentid', 'password', 'created_at', 'status', 'signature', 'preferences']",
  "users: ['id', 'name', 'email', 'role', 'studentid', 'password', 'created_at', 'status', 'signature', 'preferences', 'grade', 'gender', 'age', 'risklevel']"
);

fs.writeFileSync(serverPath, code);
console.log('Successfully refactored server.ts endpoints and schemaCache');
