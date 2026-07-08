const fs = require('fs');
const serverPath = './server.ts';
let code = fs.readFileSync(serverPath, 'utf8');

// Replace the previous server-side pagination for students
code = code.replace(
  /\/\/ Since grade and riskLevel might be inside preferences JSON.*?const from/s,
  `
      if (grade) {
        query = query.eq('grade', grade);
      }
      if (risk) {
        query = query.ilike('risklevel', \`%\${risk}%\`);
      }
      
      const from`
);

fs.writeFileSync(serverPath, code);
console.log('Successfully updated server.ts filters');
