const fs = require('fs');
const path = require('path');

const filePath = path.join('c:\\\\Users\\\\admin\\\\Desktop\\\\syakir\\\\saina-care-portal', 'src', 'features', 'student', 'SettingsTab.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Extract ProfileSettings (lines 243-380)
const profileRegex = /\{\/\* Section 1: Profile customization details \*\/\}(.*?)\{\/\* Section 2/s;
const profileMatch = content.match(profileRegex);

// Extract AppearanceSettings (lines 465-551)
const appearanceRegex = /\{\/\* Section 3: Hardware preferences & system tweaks \*\/\}(.*?)\{\/\* Bottom Form Actions bar \*\/\}/s;
const appearanceMatch = content.match(appearanceRegex);

if (!profileMatch || !appearanceMatch) {
    console.log("Could not match one of the sections.");
    process.exit(1);
}

const profileCode = profileMatch[1];
const appearanceCode = appearanceMatch[1];

// Generate ProfileSettings component
const profileComponent = `import React from 'react';
import { User, CreditCard, Sparkles, CheckCircle, Tag, Plus, Trash2 } from 'lucide-react';

export default function ProfileSettings({ 
  name, setName, studentId, setStudentId, bio, setBio, 
  bannerStyle, setBannerStyle, avatarColor, setAvatarColor, 
  interests, newInterest, setNewInterest, handleAddInterest, handleRemoveInterest,
  bannerPresets, avatarPresets
}: any) {
  return (
    <div className="space-y-6">
      {/* Section 1: Profile customization details */}
      ${profileCode}
    </div>
  );
}
`;

// Generate AppearanceSettings component
const appearanceComponent = `import React from 'react';
import { Settings2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function AppearanceSettings({
  darkMode, toggleDarkMode, uiSound, setUiSound, notificationsEnabled, setNotificationsEnabled
}: any) {
  return (
    <div className="space-y-6">
      {/* Section 3: Hardware preferences & system tweaks */}
      ${appearanceCode}
    </div>
  );
}
`;

const componentsDir = path.join('c:\\\\Users\\\\admin\\\\Desktop\\\\syakir\\\\saina-care-portal', 'src', 'features', 'student', 'components');
if (!fs.existsSync(componentsDir)) {
    fs.mkdirSync(componentsDir, { recursive: true });
}

fs.writeFileSync(path.join(componentsDir, 'ProfileSettings.tsx'), profileComponent);
fs.writeFileSync(path.join(componentsDir, 'AppearanceSettings.tsx'), appearanceComponent);

// Now refactor SettingsTab.tsx
let newContent = content.replace(profileCode, `
<ProfileSettings 
  name={name} setName={setName} 
  studentId={studentId} setStudentId={setStudentId} 
  bio={bio} setBio={setBio} 
  bannerStyle={bannerStyle} setBannerStyle={setBannerStyle} 
  avatarColor={avatarColor} setAvatarColor={setAvatarColor} 
  interests={interests} newInterest={newInterest} setNewInterest={setNewInterest} 
  handleAddInterest={handleAddInterest} handleRemoveInterest={handleRemoveInterest}
  bannerPresets={bannerPresets} avatarPresets={avatarPresets}
/>
      `);

newContent = newContent.replace(appearanceCode, `
<AppearanceSettings 
  darkMode={darkMode} toggleDarkMode={toggleDarkMode}
  uiSound={uiSound} setUiSound={setUiSound}
  notificationsEnabled={notificationsEnabled} setNotificationsEnabled={setNotificationsEnabled}
/>
      `);

newContent = newContent.replace("import React, { useState } from 'react';", "import React, { useState } from 'react';\nimport ProfileSettings from './components/ProfileSettings';\nimport AppearanceSettings from './components/AppearanceSettings';");

fs.writeFileSync(filePath, newContent);
console.log("Extraction successful!");
