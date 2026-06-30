import React, { useState } from 'react';
import { TIME_SLOTS } from '../utils/dummyData';
import { Lock, MoveRight } from 'lucide-react';
import BookingModal from './BookingModal';

export default function ScheduleMatrix({ scheduleSlots, selectedClassId, branchId, students, labels, classes, weekDates, onTransaction, onRemoveStudent }) {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [sourceStudent, setSourceStudent] = useState(null);
  const [sourceSlotId, setSourceSlotId] = useState(null);

  const getSlot = (dateString, time) => {
    const id = `${branchId}-${dateString}-${time}-${selectedClassId}`;
    return scheduleSlots[id] || {
      id,
      branchId,
      classId: selectedClassId,
      dateString,
      day: weekDates.find(d => d.dateString === dateString)?.dayName || '',
      time,
      studentIds: []
    };
  };

  const selectedClassInfo = classes.find(c => c.id === selectedClassId);
  const maxQuota = selectedClassInfo ? selectedClassInfo.maxQuota : 4;

  const getLabelInfo = (labelId) => {
    return labels.find(l => l.id === labelId);
  };

  const getBackgroundColor = (labelId) => {
    const label = getLabelInfo(labelId);
    return label ? label.colorHex : '#ffffff'; // White for CG or missing label
  };

  const getTextColor = (hexColor) => {
    if (!hexColor || hexColor === '#ffffff') return 'text-slate-800';
    const darkColors = ['#1B5E20', '#0D47A1', '#B71C1C', '#4A148C'];
    return darkColors.includes(hexColor) ? 'text-white' : 'text-slate-800';
  };

  const startSwap = (student, slotId, e) => {
    e.stopPropagation();
    setSourceStudent(student);
    setSourceSlotId(slotId);
  };

  const cancelSwap = () => {
    setSourceStudent(null);
    setSourceSlotId(null);
  };

  const handleSlotClick = (slot) => {
    if (!slot) return;
    
    if (sourceStudent) {
      if (slot.id === sourceSlotId) {
        cancelSwap();
        return;
      }

      if (slot.studentIds.length >= maxQuota) {
        alert("Slot tujuan penuh!");
        return;
      }
      
      // Conflict check (Only if both have labels, CG has no conflict)
      if (slot.studentIds.length > 0 && sourceStudent.labelId) {
        const firstStudent = students.find(s => s.id === slot.studentIds[0]);
        if (firstStudent && firstStudent.labelId) {
          const firstLabel = getLabelInfo(firstStudent.labelId);
          const sourceLabel = getLabelInfo(sourceStudent.labelId);
          if (firstLabel && sourceLabel && firstLabel.mainLevel !== sourceLabel.mainLevel) {
            if (!window.confirm(`Warning: Konflik Level! Siswa ${sourceStudent.nickname} (${sourceLabel.mainLevel}) beda level dengan siswa di slot tujuan (${firstLabel.mainLevel}). Lanjutkan?`)) {
              return;
            }
          }
        }
      }

      // Important: pass dateString instead of raw slotId if target slot was dynamic
      const success = onTransaction(sourceStudent.id, slot.dateString, slot.time, sourceSlotId);
      if (success) cancelSwap();
    } else {
      setSelectedSlot(slot);
    }
  };

  return (
    <div className="relative">
      {sourceStudent && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between sticky top-0 z-10 shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-full">
              <MoveRight className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-bold text-blue-900 text-sm">Mode Pindah Kelas Aktif</p>
              <p className="text-blue-700 text-xs">Pilih slot tujuan untuk memindahkan <strong>{sourceStudent.nickname}</strong>.</p>
            </div>
          </div>
          <button onClick={cancelSwap} className="px-3 py-1.5 bg-white text-blue-600 rounded-md font-semibold text-sm hover:bg-blue-50 transition-colors shadow-sm">
            Batal
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-left font-bold text-slate-500 w-32 shrink-0">Waktu</th>
                {weekDates.map(dateObj => (
                  <th key={dateObj.dateString} className="p-4 text-left min-w-[200px] border-l border-slate-200">
                    <div className="font-bold text-slate-800">{dateObj.dayName}</div>
                    <div className="text-xs font-normal text-slate-500 mt-0.5">{dateObj.label.split(', ')[1]}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIME_SLOTS.map(time => (
                <tr key={time} className="border-b border-slate-100 last:border-0 group hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 text-sm font-semibold text-slate-600 whitespace-nowrap bg-slate-50/50">{time}</td>
                  {weekDates.map(dateObj => {
                    const slot = getSlot(dateObj.dateString, time);

                    const isFull = slot.studentIds.length >= maxQuota;
                    
                    let swapHighlightClass = "";
                    if (sourceStudent) {
                      if (slot.id === sourceSlotId) {
                        swapHighlightClass = "ring-2 ring-blue-500 opacity-50";
                      } else if (isFull) {
                        swapHighlightClass = "bg-slate-100 cursor-not-allowed opacity-60";
                      } else {
                         // Simplify warning logic for UI highlight
                         let hasWarning = false;
                         if (slot.studentIds.length > 0 && sourceStudent.labelId) {
                           const fs = students.find(s => s.id === slot.studentIds[0]);
                           if (fs && fs.labelId) {
                             const fl = getLabelInfo(fs.labelId);
                             const sl = getLabelInfo(sourceStudent.labelId);
                             if (fl && sl && fl.mainLevel !== sl.mainLevel) hasWarning = true;
                           }
                         }
                         swapHighlightClass = hasWarning ? "bg-amber-50 ring-2 ring-amber-400 hover:bg-amber-100 cursor-pointer" : "bg-green-50 ring-2 ring-green-400 hover:bg-green-100 cursor-pointer shadow-inner";
                      }
                    }

                    return (
                      <td key={dateObj.dateString} className="p-2 border-l border-slate-100 relative align-top">
                        <div onClick={() => handleSlotClick(slot)} className={`h-full min-h-[120px] rounded-lg p-2 transition-all group/slot flex flex-col ${sourceStudent ? swapHighlightClass : 'hover:ring-2 hover:ring-blue-400 cursor-pointer bg-white border border-slate-200 hover:shadow-md'} ${isFull && !sourceStudent ? 'bg-slate-50/80 border-dashed' : ''}`}>
                          <div className="flex justify-between items-center mb-2">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isFull ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                              {slot.studentIds.length}/{maxQuota}
                            </span>
                            {isFull && <Lock className="w-3 h-3 text-slate-400" />}
                          </div>

                          <div className="flex-1 space-y-1">
                            {slot.studentIds.map(sid => {
                              const s = students.find(stu => stu.id === sid);
                              if (!s) return null;
                              
                              const bgColor = getBackgroundColor(s.labelId);
                              const textColor = getTextColor(bgColor);
                              
                              return (
                                <div key={s.id} className="group/student relative rounded px-2 py-1 flex items-center justify-between text-xs font-bold shadow-sm" style={{ backgroundColor: bgColor }}>
                                  <span className={`truncate max-w-[120px] ${textColor}`}>
                                    {s.status === 'CG' ? `(CG) ${s.nickname}` : s.nickname}
                                  </span>
                                  {!sourceStudent && (
                                    <button onClick={(e) => startSwap(s, slot.id, e)} className={`opacity-0 group-hover/student:opacity-100 p-1 hover:bg-black/10 rounded transition-opacity ${textColor}`} title="Pindah Kelas">
                                      <MoveRight className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                            
                            {!isFull && !sourceStudent && (
                              <div className="h-6 rounded border border-dashed border-slate-300 flex items-center justify-center opacity-0 group-hover/slot:opacity-100 transition-opacity">
                                <span className="text-slate-400 text-xs font-bold">+</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <BookingModal 
        isOpen={!!selectedSlot}
        onClose={() => setSelectedSlot(null)}
        slot={selectedSlot}
        students={students}
        labels={labels}
        maxQuota={maxQuota}
        onConfirm={(studentId) => {
          onTransaction(studentId, selectedSlot.dateString, selectedSlot.time, null);
        }}
        onRemoveStudent={onRemoveStudent}
      />
    </div>
  );
}
