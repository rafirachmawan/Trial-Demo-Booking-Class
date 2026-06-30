import React, { useState } from 'react';
import { TIME_SLOTS } from '../utils/dummyData';
import { Lock, MoveRight } from 'lucide-react';
import BookingModal from './BookingModal';

export default function ScheduleMatrix({ scheduleSlots, selectedClassId, branchId, students, labels, classes, calendarGrid, onTransaction, onRemoveStudent }) {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [sourceStudent, setSourceStudent] = useState(null);
  const [sourceSlotId, setSourceSlotId] = useState(null);
  const [expandedSlots, setExpandedSlots] = useState({});

  const toggleExpand = (slotId, e) => {
    e.stopPropagation();
    setExpandedSlots(prev => ({
      ...prev,
      [slotId]: !prev[slotId]
    }));
  };

  const getSlot = (dateString, time) => {
    const id = `${branchId}-${dateString}-${time}-${selectedClassId}`;
    return scheduleSlots[id] || {
      id,
      branchId,
      classId: selectedClassId,
      dateString,
      day: calendarGrid.flat().find(d => d && d.dateString === dateString)?.dayName || '',
      time,
      studentIds: []
    };
  };

  const selectedClassInfo = classes.find(c => c.id === selectedClassId);
  const maxQuota = selectedClassInfo ? selectedClassInfo.maxQuota : 4;

  const getLabelInfo = (labelId) => {
    return labels.find(l => l.id === labelId);
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

      const success = onTransaction(sourceStudent.id, slot.dateString, slot.time, sourceSlotId);
      if (success) cancelSwap();
    } else {
      setSelectedSlot(slot);
    }
  };

  const DAYS_HEADER = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

  // Helpe colors
  const getBackgroundColor = (labelId) => {
    const label = getLabelInfo(labelId);
    return label ? label.colorHex : '#ffffff';
  };
  const getTextColor = (hexColor) => {
    if (!hexColor || hexColor === '#ffffff') return 'text-slate-800';
    const darkColors = ['#1B5E20', '#0D47A1', '#B71C1C', '#4A148C'];
    return darkColors.includes(hexColor) ? 'text-white' : 'text-slate-800';
  };

  const formatDateFull = (dateStr) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    return `${parseInt(d, 10)} ${months[parseInt(m, 10) - 1]} ${y}`;
  };

  return (
    <div className="relative">
      {sourceStudent && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between sticky top-0 z-20 shadow-sm animate-in fade-in slide-in-from-top-2">
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
        <div className="w-full">
          <table className="w-full border-collapse table-fixed">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {DAYS_HEADER.map((day, idx) => (
                  <th key={day} className={`p-3 text-center font-bold text-slate-600 w-[14.28%] border-l border-slate-200 first:border-0 ${idx >= 5 ? 'bg-slate-100' : ''}`}>
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {calendarGrid.map((week, weekIdx) => (
                <tr key={weekIdx} className="border-b border-slate-200 last:border-0">
                  {week.map((dateObj, dayIdx) => {
                    const isWeekend = dayIdx >= 5;
                    
                    if (!dateObj) {
                      return <td key={`empty-${dayIdx}`} className={`bg-slate-50/50 border-l border-slate-200 first:border-0 p-2 min-h-[120px] ${isWeekend ? 'bg-slate-100/50' : ''}`}></td>;
                    }

                    return (
                      <td key={dateObj.dateString} className={`border-l border-slate-200 first:border-0 p-2 align-top h-32 ${isWeekend ? 'bg-slate-50' : 'bg-white'}`}>
                        <div className="flex flex-col h-full">
                          <div className={`text-right font-bold text-[11px] mb-2 ${isWeekend ? 'text-slate-400' : 'text-slate-700'}`}>
                            {formatDateFull(dateObj.dateString)}
                          </div>
                          
                          <div className="flex-1 space-y-1 overflow-y-auto">
                            {TIME_SLOTS.map(time => {
                              const slot = getSlot(dateObj.dateString, time);
                              const isFull = slot.studentIds.length >= maxQuota;
                              const isEmpty = slot.studentIds.length === 0;
                              const isExpanded = !!expandedSlots[slot.id];
                              
                              let swapHighlightClass = "";
                              if (sourceStudent) {
                                if (slot.id === sourceSlotId) {
                                  swapHighlightClass = "ring-2 ring-blue-500 opacity-50";
                                } else if (isFull) {
                                  swapHighlightClass = "bg-slate-100 text-slate-400 cursor-not-allowed opacity-60";
                                } else {
                                   let hasWarning = false;
                                   if (slot.studentIds.length > 0 && sourceStudent.labelId) {
                                     const fs = students.find(s => s.id === slot.studentIds[0]);
                                     if (fs && fs.labelId) {
                                       const fl = getLabelInfo(fs.labelId);
                                       const sl = getLabelInfo(sourceStudent.labelId);
                                       if (fl && sl && fl.mainLevel !== sl.mainLevel) hasWarning = true;
                                     }
                                   }
                                   swapHighlightClass = hasWarning ? "bg-amber-100 text-amber-800 ring-2 ring-amber-400 hover:bg-amber-200" : "bg-green-100 text-green-800 ring-2 ring-green-400 hover:bg-green-200";
                                }
                              } else {
                                if (isEmpty) swapHighlightClass = "bg-slate-50 text-slate-500 hover:bg-blue-50 hover:text-blue-600 border border-slate-200";
                                else if (isFull) swapHighlightClass = "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100";
                                else swapHighlightClass = "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100";
                              }

                              return (
                                <div key={time} className="mb-1 last:mb-0">
                                  <button
                                    onClick={(e) => toggleExpand(slot.id, e)}
                                    className={`w-full text-left text-[10px] font-semibold px-1.5 py-1 rounded flex justify-between items-center transition-colors ${swapHighlightClass}`}
                                  >
                                    <span>{time.split(' - ')[0]}</span>
                                    <span className="flex items-center space-x-1">
                                      <span>{slot.studentIds.length}/{maxQuota}</span>
                                      {isFull && <Lock className="w-2.5 h-2.5" />}
                                    </span>
                                  </button>

                                  {isExpanded && (
                                    <div className="mt-1 pl-1 pr-1 pb-1 space-y-1">
                                      {slot.studentIds.length > 0 ? (
                                        slot.studentIds.map(sid => {
                                          const s = students.find(stu => stu.id === sid);
                                          if (!s) return null;
                                          const bgColor = getBackgroundColor(s.labelId);
                                          const textColor = getTextColor(bgColor);
                                          return (
                                            <div key={s.id} className="rounded px-1.5 py-0.5 text-[9px] font-bold shadow-sm flex items-center" style={{ backgroundColor: bgColor }}>
                                              <span className={`truncate ${textColor}`}>
                                                {s.status === 'CG' ? `(CG) ${s.nickname}` : s.nickname}
                                              </span>
                                            </div>
                                          );
                                        })
                                      ) : (
                                        <div className="text-[9px] text-slate-400 italic px-1">Kosong</div>
                                      )}
                                      
                                      <button
                                        onClick={() => handleSlotClick(slot)}
                                        className="w-full text-[9px] py-1 mt-1 border border-dashed border-blue-300 text-blue-600 rounded hover:bg-blue-50 flex items-center justify-center font-bold transition-colors"
                                      >
                                        Kelola
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
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
