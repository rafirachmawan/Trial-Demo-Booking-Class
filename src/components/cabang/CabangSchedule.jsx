import React, { useState, useContext } from 'react';
import { AppContext } from '../../App';
import ScheduleMatrix from '../ScheduleMatrix';
import { getStartOfWeek, getWeekDates, addWeeks } from '../../utils/dateUtils';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

export default function CabangSchedule({ branchId }) {
  const { classes, scheduleSlots, setScheduleSlots, students, labels } = useContext(AppContext);
  
  const branchClasses = classes.filter(c => c.branchId === branchId);
  const [selectedClassId, setSelectedClassId] = useState(branchClasses.length > 0 ? branchClasses[0].id : null);
  
  // Date State
  const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfWeek(new Date()));
  const weekDates = getWeekDates(currentWeekStart);

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
        const dateObj = weekDates.find(d => d.dateString === targetDate);
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

  const handlePrevWeek = () => setCurrentWeekStart(prev => addWeeks(prev, -1));
  const handleNextWeek = () => setCurrentWeekStart(prev => addWeeks(prev, 1));
  const handleThisWeek = () => setCurrentWeekStart(getStartOfWeek(new Date()));

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center shrink-0 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Matriks Jadwal</h1>
          <p className="text-slate-500 text-sm">Visualisasi jadwal kelas dan kuota siswa</p>
        </div>
        
        <div className="flex flex-col items-end space-y-3">
          {/* Week Navigation */}
          <div className="flex items-center space-x-2 bg-white rounded-lg border border-slate-200 p-1 shadow-sm">
            <button onClick={handlePrevWeek} className="p-1.5 rounded hover:bg-slate-100 text-slate-600 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={handleThisWeek} className="px-3 py-1.5 text-sm font-bold text-slate-700 hover:bg-slate-100 rounded transition-colors flex items-center">
              <CalendarIcon className="w-4 h-4 mr-2" />
              Minggu Ini
            </button>
            <button onClick={handleNextWeek} className="p-1.5 rounded hover:bg-slate-100 text-slate-600 transition-colors">
              <ChevronRight className="w-5 h-5" />
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
            weekDates={weekDates}
            onTransaction={handleTransaction}
            onRemoveStudent={handleRemoveStudent}
          />
        )}
      </div>
    </div>
  );
}
