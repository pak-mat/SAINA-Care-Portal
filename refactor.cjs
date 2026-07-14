const fs = require('fs');
const path = require('path');

const filePath = path.join('c:\\\\Users\\\\admin\\\\Desktop\\\\syakir\\\\saina-care-portal', 'src', 'features', 'counselor', 'CounselorStudentManagementTab.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

const regex = /(\/\/ Side Panel Drawer\r?\nfunction StudentProfileDrawer.*?)(export default function CounselorStudentManagementTab)/s;
const match = content.match(regex);

if (match) {
    const drawerCode = match[1];
    const drawerImports = `import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { createPortal } from 'react-dom';
import { 
  X,
  FileText, AlertTriangle, Calendar, MessageSquare, ShieldAlert,
  Edit3, Mail, Archive, FileKey, Activity, Clock
} from 'lucide-react';
import { useCaseNotes, useSubmitCaseNote, useStudentTimeline } from '../../hooks/queries';
import { useAuth } from '../../context/AuthContext';
import { getRelativeTime } from '../../utils/time';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../../types';

`;

    const componentDir = path.join('c:\\\\Users\\\\admin\\\\Desktop\\\\syakir\\\\saina-care-portal', 'src', 'features', 'counselor', 'components');
    if (!fs.existsSync(componentDir)) {
        fs.mkdirSync(componentDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(componentDir, 'StudentProfileDrawer.tsx'), drawerImports + drawerCode);
    
    let newContent = content.replace(drawerCode, '');
    const importStmt = "import StudentProfileDrawer from './components/StudentProfileDrawer';\n";
    newContent = newContent.replace("import Dropdown from '../../components/ui/Dropdown';\r\n", "import Dropdown from '../../components/ui/Dropdown';\n" + importStmt);
    newContent = newContent.replace("import Dropdown from '../../components/ui/Dropdown';\n", "import Dropdown from '../../components/ui/Dropdown';\n" + importStmt);
    
    fs.writeFileSync(filePath, newContent);
    console.log('Extraction successful!');
} else {
    console.log('Could not match.');
}
