import React, { useState } from 'react';
import { TIME_SLOTS } from '../utils/dummyData';
import { Lock, MoveRight, Plus } from 'lucide-react';
import BookingModal from './BookingModal';

export default function ScheduleMatrix({ scheduleSlots, selectedClassId, branchId, students, labels, classes, calendarGrid, onTransaction, onRemoveStudent }) {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [sourceStudent, setSourceStudent] = useState(null);
  const [sourceSlotId, setSourceSlotId] = useState(null);

  const weekDays = calendarGrid[0] || [];

  const getSlot = (dateString, time) => {
    const id = `${branchId}-${dateString}-${time}-${selectedClassId}`;
    return scheduleSlots[id] || {
      id, branchId, classId: selectedClassId, dateString,
      day: weekDays.find(d => d && d.dateString === dateString)?.dayName || '',
      time, studentIds: []
    };
  };

  const selectedClassInfo = classes.find(c => c.id === selectedClassId);
  const maxQuota = selectedClassInfo ? selectedClassInfo.maxQuota : 4;
  const getLabelInfo = (labelId) => labels.find(l => l.id === labelId);

  const startSwap = (student, slotId, e) => {
    e.stopPropagation();
    setSourceStudent(student);
    setSourceSlotId(slotId);
  };

  const cancelSwap = () => { setSourceStudent(null); setSourceSlotId(null); };

  const handleSlotClick = (slot) => {
    if (!slot) return;
    if (sourceStudent) {
      if (slot.id === sourceSlotId) { cancelSwap(); return; }
      if (slot.studentIds.length >= maxQuota) { alert("Slot tujuan penuh!"); return; }
      if (slot.studentIds.length > 0 && sourceStudent.labelId) {
        const firstStudent = students.find(s => s.id === slot.studentIds[0]);
        if (firstStudent && firstStudent.labelId) {
          const firstLabel = getLabelInfo(firstStudent.labelId);
          const sourceLabel = getLabelInfo(sourceStudent.labelId);
          if (firstLabel && sourceLabel && firstLabel.mainLevel !== sourceLabel.mainLevel) {
            if (!window.confirm(`Warning: Konflik Level! ${sourceStudent.nickname} (${sourceLabel.mainLevel}) vs (${firstLabel.mainLevel}). Lanjutkan?`)) return;
          }
        }
      }
      const success = onTransaction(sourceStudent.id, slot.dateString, slot.time, sourceSlotId);
      if (success) cancelSwap();
    } else {
      setSelectedSlot(slot);
    }
  };

  const getBackgroundColor = (labelId) => {
    const label = getLabelInfo(labelId);
    return label ? label.colorHex : '#ffffff';
  };

  const getTextColor = (hexColor) => {
    if (!hexColor || hexColor === '#ffffff') return 'text-slate-800';
    return ['#1B5E20', '#0D47A1', '#B71C1C', '#4A148C'].includes(hexColor) ? 'text-white' : 'text-slate-800';
  };

  return (
    <div className="relative">
      {sourceStudent && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-full"><MoveRight className="w-4 h-4 text-white" /></div>
            <div>
              <p className="font-bold text-blue-900 text-sm">Mode Pindah Kelas Aktif</p>
              <p className="text-blue-700 text-xs">Pilih slot tujuan untuk <strong>{sourceStudent.nickname}</strong>.</p>
            </div>
          </div>
          <button onClick={cancelSwap} className="px-3 py-1.5 bg-white text-blue-600 rounded-md font-semibold text-sm hover:bg-blue-50 transition-colors shadow-sm">Batal</button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-3 text-left w-28 border-r border-slate-200">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">Jam</div>
                </th>
                {weekDays.map((dateObj, i) => (
                  <th key={i} className={`p-3 text-center border-l border-slate-200 ${dateObj.isWeekend ? 'bg-slate-100/70' : ''}`}>
                    <div className="text-sm font-bold text-slate-700">{dateObj.dayName}</div>
                    <div className="text-xs text-slate-500 font-medium">{dateObj.label.split(',')[1]}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIME_SLOTS.map(time => (
                <tr key={time} className="border-b border-slate-100 last:border-0">
                  <td className="p-3 border-r border-slate-200 bg-slate-50/50 align-top">
                    <div className="text-xs font-bold text-slate-600 whitespace-nowrap">{time}</div>
                  </td>
                  {weekDays.map((dateObj) => {
                    const slot = getSlot(dateObj.dateString, time);
                    const isFull = slot.studentIds.length >= maxQuota;
                    const isEmpty = slot.studentIds.length === 0;

                    let cellBg = dateObj.isWeekend ? 'bg-slate-50/50' : 'bg-white';
                    if (sourceStudent) {
                      if (isFull) cellBg = 'bg-slate-100 opacity-50';
                      else {
                        let hasWarning = false;
                        if (slot.studentIds.length > 0 && sourceStudent.labelId) {
                          const fs = students.find(s => s.id === slot.studentIds[0]);
                          if (fs && fs.labelId) {
                            const fl = getLabelInfo(fs.labelId);
                            const sl = getLabelInfo(sourceStudent.labelId);
                            if (fl && sl && fl.mainLevel !== sl.mainLevel) hasWarning = true;
                          }
                        }
                        cellBg = hasWarning ? 'bg-amber-50 ring-1 ring-inset ring-amber-300' : 'bg-green-50 ring-1 ring-inset ring-green-300';
                      }
                    }

                    return (
                      <td key={dateObj.dateString} className={`border-l border-slate-200 p-1.5 align-top ${cellBg} transition-colors`}>
                        <div className="min-h-[60px] space-y-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                              isFull ? 'bg-red-100 text-red-600' : isEmpty ? 'bg-slate-100 text-slate-400' : 'bg-blue-100 text-blue-600'
                            }`}>
                              {slot.studentIds.length}/{maxQuota}
                              {isFull && <Lock className="w-2.5 h-2.5 inline ml-0.5" />}
                            </span>
                            {(!isFull || sourceStudent) && (
                              <button
                                onClick={() => handleSlotClick(slot)}
                                className="text-[10px] text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded p-0.5 transition-colors"
                                title="Kelola slot"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          {slot.studentIds.map(sid => {
                            const s = students.find(stu => stu.id === sid);
                            if (!s) return null;
                            const bgColor = getBackgroundColor(s.labelId);
                            const textColor = getTextColor(bgColor);
                            return (
                              <div
                                key={s.id}
                                onClick={(e) => startSwap(s, slot.id, e)}
                                className="rounded-md px-2 py-1 text-[11px] font-bold shadow-sm flex justify-between items-center cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all group"
                                style={{ backgroundColor: bgColor }}
                                title={`Klik untuk pindahkan ${s.nickname}`}
                              >
                                <span className={`truncate ${textColor}`}>
                                  {s.status === 'CG' ? `(CG) ${s.nickname}` : s.nickname}
                                </span>
                                <MoveRight className={`w-3 h-3 ${textColor} opacity-0 group-hover:opacity-60 transition-opacity`} />
                              </div>
                            );
                          })}

                          {isEmpty && !sourceStudent && (
                            <div
                              onClick={() => handleSlotClick(slot)}
                              className="text-[10px] text-slate-300 italic text-center py-2 cursor-pointer hover:text-blue-400 transition-colors"
                            >
                              Kosong
                            </div>
                          )}
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
        onConfirm={(studentId) => { onTransaction(studentId, selectedSlot.dateString, selectedSlot.time, null); }}
        onRemoveStudent={onRemoveStudent}
      />
    </div>
  );
}
