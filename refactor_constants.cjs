const fs = require('fs');
let content = fs.readFileSync('src/hooks/queries.ts', 'utf8');

// Insert import if not present
if (!content.includes('../utils/constants')) {
  content = content.replace(
    "import { supabase } from '../lib/supabase';", 
    "import { supabase } from '../lib/supabase';\nimport { PAGINATION, CACHE_TIMES } from '../utils/constants';"
  );
}

// Replace magic numbers in useStudents
content = content.replace('export function useStudents(page = 1, limit = 20,', 'export function useStudents(page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT,');

// Replace magic numbers in useAppointments
content = content.replace('export function useAppointments(page = 1, limit = 20,', 'export function useAppointments(page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT,');

// Replace magic numbers in useTransfers
content = content.replace('export function useTransfers(page = 1, limit = 20,', 'export function useTransfers(page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT,');

// Replace magic numbers in useCheckins
content = content.replace('export function useCheckins(page = 1, limit = 20,', 'export function useCheckins(page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT,');

// Replace stale times
content = content.replace('staleTime: 30000', 'staleTime: CACHE_TIMES.STUDENTS_STALE_TIME');
content = content.replace('staleTime: 10000', 'staleTime: CACHE_TIMES.APPOINTMENTS_STALE_TIME');
content = content.replace('staleTime: 10000', 'staleTime: CACHE_TIMES.TRANSFERS_STALE_TIME');
// The second 30000 is for checkins but it might have been replaced already if it was identical, let's do global replace
content = content.replace(/staleTime: 30000/g, 'staleTime: CACHE_TIMES.CHECKINS_STALE_TIME');

fs.writeFileSync('src/hooks/queries.ts', content);
console.log('queries.ts updated with constants');
