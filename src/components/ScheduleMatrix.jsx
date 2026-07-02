import React from 'react';
import { TIME_SLOTS } from '../utils/dummyData';
import { Lock } from 'lucide-react';

export default function ScheduleMatrix({ scheduleSlots, selectedClassId, branchId, students, labels, classes, calendarGrid }) {
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
                    const activeStudentIds = slot.studentIds.filter(sid => { 
                      const s = students.find(stu => stu.id === sid); 
                      return s && s.status !== 'INACTIVE'; 
                    });
                    const isFull = activeStudentIds.length >= maxQuota;
                    const isEmpty = activeStudentIds.length === 0;

                    let cellBg = dateObj.isWeekend ? 'bg-slate-50/50' : 'bg-white';

                    return (
                      <td key={dateObj.dateString} className={`border-l border-slate-200 p-1.5 align-top ${cellBg} transition-colors`}>
                        <div className="min-h-[60px] space-y-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                              isFull ? 'bg-red-100 text-red-600' : isEmpty ? 'bg-slate-100 text-slate-400' : 'bg-blue-100 text-blue-600'
                            }`}>
                              {activeStudentIds.length}/{maxQuota}
                              {isFull && <Lock className="w-2.5 h-2.5 inline ml-0.5" />}
                            </span>
                          </div>

                          {slot.studentIds.filter(sid => { const s = students.find(stu => stu.id === sid); return s && s.status !== 'INACTIVE'; }).map(sid => {
                            const s = students.find(stu => stu.id === sid);
                            if (!s) return null;
                            const bgColor = getBackgroundColor(s.labelId);
                            const textColor = getTextColor(bgColor);
                            return (
                              <div
                                key={s.id}
                                className="rounded-md px-2 py-1 text-[11px] font-bold shadow-sm flex justify-between items-center"
                                style={{ backgroundColor: bgColor }}
                              >
                                <span className={`truncate ${textColor}`}>
                                  {s.status === 'CG' ? `(CG) ${s.nickname}` : s.nickname}
                                </span>
                              </div>
                            );
                          })}

                          {isEmpty && (
                            <div className="text-[10px] text-slate-300 italic text-center py-2">
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
    </div>
  );
}

