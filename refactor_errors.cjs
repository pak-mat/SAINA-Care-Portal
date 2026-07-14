const fs = require('fs');
let content = fs.readFileSync('src/hooks/queries.ts', 'utf8');

// Insert import if not present
if (!content.includes('../utils/errors')) {
  content = content.replace(
    "import { PAGINATION, CACHE_TIMES } from '../utils/constants';", 
    "import { PAGINATION, CACHE_TIMES } from '../utils/constants';\nimport { handleSupabaseError } from '../utils/errors';"
  );
}

// Replace error throwing
content = content.replace(/if \(error\) throw error;/g, "if (error) handleSupabaseError(error, 'Failed to fetch data');");

fs.writeFileSync('src/hooks/queries.ts', content);
console.log('queries.ts updated with centralized error handling');
