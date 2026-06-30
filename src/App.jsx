import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SuperadminDashboard from './components/superadmin/SuperadminDashboard';
import CabangDashboard from './components/cabang/CabangDashboard';
import { 
  INITIAL_BRANCHES, INITIAL_USERS, INITIAL_LABELS, 
  INITIAL_CLASSES, INITIAL_STUDENTS, INITIAL_SLOTS, TIME_SLOTS 
} from './utils/dummyData';

export const AppContext = React.createContext();

// Helper for local storage
const loadState = (key, initial) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : initial;
  } catch (e) {
    return initial;
  }
};

function App() {
  // Global States with Local Storage Persistence
  const [branches, setBranches] = useState(() => loadState('sb_v2_branches', INITIAL_BRANCHES));
  const [users, setUsers] = useState(() => loadState('sb_v2_users', INITIAL_USERS));
  const [labels, setLabels] = useState(() => loadState('sb_v2_labels', INITIAL_LABELS));
  const [classes, setClasses] = useState(() => loadState('sb_v2_classes', INITIAL_CLASSES));
  const [students, setStudents] = useState(() => loadState('sb_v2_students', INITIAL_STUDENTS));
  const [scheduleSlots, setScheduleSlots] = useState(() => loadState('sb_v2_slots', INITIAL_SLOTS));

  // Save to Local Storage on Change
  useEffect(() => localStorage.setItem('sb_v2_branches', JSON.stringify(branches)), [branches]);
  useEffect(() => localStorage.setItem('sb_v2_users', JSON.stringify(users)), [users]);
  useEffect(() => localStorage.setItem('sb_v2_labels', JSON.stringify(labels)), [labels]);
  useEffect(() => localStorage.setItem('sb_v2_classes', JSON.stringify(classes)), [classes]);
  useEffect(() => localStorage.setItem('sb_v2_students', JSON.stringify(students)), [students]);
  useEffect(() => localStorage.setItem('sb_v2_slots', JSON.stringify(scheduleSlots)), [scheduleSlots]);

  // Auth State
  const [currentUser, setCurrentUser] = useState(() => loadState('sb_v2_user', users[0]));
  useEffect(() => localStorage.setItem('sb_v2_user', JSON.stringify(currentUser)), [currentUser]);

  const addClass = (newClass) => {
    const c = { ...newClass, id: 'c' + Date.now() };
    setClasses(prev => [...prev, c]);
    // NOTE: We no longer pre-generate slots here. Slots are created on-the-fly.
  };

  const value = {
    branches, setBranches,
    users, setUsers,
    labels, setLabels,
    classes, setClasses, addClass,
    students, setStudents,
    scheduleSlots, setScheduleSlots,
    currentUser, setCurrentUser,
    TIME_SLOTS
  };

  return (
    <AppContext.Provider value={value}>
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {currentUser.role === 'superadmin' ? (
            <SuperadminDashboard />
          ) : (
            <CabangDashboard />
          )}
        </div>
      </div>
    </AppContext.Provider>
  );
}

export default App;
