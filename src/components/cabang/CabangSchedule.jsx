import React, { useState, useContext } from 'react';
import { AppContext } from '../../App';
import ScheduleMatrix from '../ScheduleMatrix';
import { getCalendarGrid } from '../../utils/dateUtils';
import { Calendar as CalendarIcon } from 'lucide-react';

const MONTHS_OPTIONS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const YEAR_OPTIONS = [2024, 2025, 2026, 2027];

export default function CabangSchedule({ branchId }) {
  const { classes, scheduleSlots, setScheduleSlots, students, labels } = useContext(AppContext);
  
  const branchClasses = classes.filter(c => c.branchId === branchId);
  const [selectedClassId, setSelectedClassId] = useState(branchClasses.length > 0 ? branchClasses[0].id : null);
  
  // Date State (Month and Year)
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  
  const calendarGrid = getCalendarGrid(currentYear, currentMonth);

  // We need to pass populated students and labels to Matrix
  const branchStudents = students.filter(s => s.branchId === branchId);
  
  const handleTransaction = (studentId, targetDate, targetTime, oldSlotId = null) => {
    let success = false;
    const targetSlotId = `${branchId}-${targetDate}-${targetTime}-${selectedClassId}`;
    
    setScheduleSlots(prev => {
      const newSlots = { ...prev };
      
      if (oldSlotId && newSlots[oldSlotId]) {
        newSlots[oldSlotId] = {
          ...newSlots[oldSlotId],
          studentIds: newSlots[oldSlotId].studentIds.filter(id => id !== studentId)
        };
      }
      
      if (!newSlots[targetSlotId]) {
        // Create slot dynamically
        const dateObj = calendarGrid.flat().find(d => d && d.dateString === targetDate);
        newSlots[targetSlotId] = {
          id: targetSlotId,
          branchId,
          classId: selectedClassId,
          dateString: targetDate,
          day: dateObj ? dateObj.dayName : '',
          time: targetTime,
          studentIds: []
        };
      }
      
      if (!newSlots[targetSlotId].studentIds.includes(studentId)) {
        newSlots[targetSlotId] = {
          ...newSlots[targetSlotId],
          studentIds: [...newSlots[targetSlotId].studentIds, studentId]
        };
        success = true;
      }
      
      return newSlots;
    });
    return success;
  };

  const handleRemoveStudent = (studentId, slotId) => {
    setScheduleSlots(prev => {
      const newSlots = { ...prev };
      if (newSlots[slotId]) {
        newSlots[slotId] = {
          ...newSlots[slotId],
          studentIds: newSlots[slotId].studentIds.filter(id => id !== studentId)
        };
      }
      return newSlots;
    });
  };

  if (branchClasses.length === 0) {
    return <div className="p-8 text-center text-slate-500">Belum ada kelas di cabang ini. Silakan buat di Master Data.</div>;
  }

  const handleThisMonth = () => {
    const d = new Date();
    setCurrentMonth(d.getMonth());
    setCurrentYear(d.getFullYear());
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center shrink-0 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Matriks Jadwal Bulanan</h1>
          <p className="text-slate-500 text-sm">Visualisasi jadwal kelas dan kuota siswa bulan ini</p>
        </div>
        
        <div className="flex flex-col items-end space-y-3">
          {/* Month/Year Navigation */}
          <div className="flex items-center space-x-2 bg-white rounded-lg border border-slate-200 p-1.5 shadow-sm">
            <select 
              value={currentMonth} 
              onChange={e => setCurrentMonth(parseInt(e.target.value))}
              className="p-1.5 bg-transparent font-bold text-slate-700 outline-none cursor-pointer"
            >
              {MONTHS_OPTIONS.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
            <select 
              value={currentYear} 
              onChange={e => setCurrentYear(parseInt(e.target.value))}
              className="p-1.5 bg-transparent font-bold text-slate-700 outline-none cursor-pointer border-l border-slate-200"
            >
              {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <button onClick={handleThisMonth} className="px-3 py-1.5 ml-1 text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded transition-colors flex items-center border border-slate-200">
              <CalendarIcon className="w-4 h-4 mr-1.5" />
              Bulan Ini
            </button>
          </div>

          {/* Class Tabs */}
          <div className="flex space-x-2">
            {branchClasses.map(cls => (
              <button
                key={cls.id}
                onClick={() => setSelectedClassId(cls.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                  selectedClassId === cls.id 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cls.name}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        {selectedClassId && (
          <ScheduleMatrix 
            scheduleSlots={scheduleSlots} 
            selectedClassId={selectedClassId}
            branchId={branchId}
            students={branchStudents}
            labels={labels.filter(l => l.branchId === branchId)}
            classes={branchClasses}
            calendarGrid={calendarGrid}
            onTransaction={handleTransaction}
            onRemoveStudent={handleRemoveStudent}
          />
        )}
      </div>
    </div>
  );
}
