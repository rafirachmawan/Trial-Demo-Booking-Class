import React, { useState, useContext } from 'react';
import { AppContext } from '../../App';
import { Search, Calendar, Clock, BookOpen, Plus, X, CheckCircle, Trash2, PowerOff } from 'lucide-react';

export default function CabangStudentManage({ branchId }) {
  const { students, labels, classes, scheduleSlots, setScheduleSlots, TIME_SLOTS } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  const [selClassId, setSelClassId] = useState('');
  // Array of { date: 'YYYY-MM-DD', time: '08:00 - 09:00' }
  const [selectedDates, setSelectedDates] = useState([]);
  const [tempDate, setTempDate] = useState('');

  const branchStudents = students.filter(s => s.branchId === branchId);
  const branchClasses = classes.filter(c => c.branchId === branchId);
  const branchLabels = labels.filter(l => l.branchId === branchId);

  const filteredStudents = branchStudents.filter(s => s.status !== 'INACTIVE' && (
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.nickname.toLowerCase().includes(searchTerm.toLowerCase())
  ));

  const selectedStudent = branchStudents.find(s => s.id === selectedStudentId);
  const getLabelInfo = (labelId) => branchLabels.find(l => l.id === labelId);

  const getTextColor = (hexColor) => {
    if (!hexColor || hexColor === '#ffffff') return 'text-slate-800';
    return ['#1B5E20', '#0D47A1', '#B71C1C', '#4A148C'].includes(hexColor) ? 'text-white' : 'text-slate-800';
  };
  const { setStudents } = useContext(AppContext);

  const handleDeactivateStudent = (id) => {
    if(window.confirm('Yakin ingin menonaktifkan siswa ini? Siswa ini tidak akan muncul lagi di daftar.')) {
      setStudents(prev => prev.map(s => s.id === id ? { ...s, status: 'INACTIVE' } : s));
      if (selectedStudentId === id) setSelectedStudentId(null);
    }
  };

  const getStudentSchedule = (studentId) => {
    const entries = [];
    Object.values(scheduleSlots).forEach(slot => {
      if (slot.branchId === branchId && slot.studentIds.includes(studentId)) {
        const cls = branchClasses.find(c => c.id === slot.classId);
        entries.push({ ...slot, className: cls ? cls.name : 'Unknown' });
      }
    });
    entries.sort((a, b) => a.dateString.localeCompare(b.dateString));
    return entries;
  };

  const getDayName = (dateString) => {
    const d = new Date(dateString);
    return ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"][d.getDay()];
  };

  const addDate = () => {
    if (!tempDate) return;
    if (selectedDates.find(d => d.date === tempDate)) {
      alert("Tanggal ini sudah ditambahkan.");
      return;
    }
    setSelectedDates(prev => [...prev, { date: tempDate, time: TIME_SLOTS[0] }].sort((a, b) => a.date.localeCompare(b.date)));
    setTempDate('');
  };

  const removeDate = (dateStr) => {
    setSelectedDates(prev => prev.filter(d => d.date !== dateStr));
  };

  const updateTimeForDate = (dateStr, time) => {
    setSelectedDates(prev => prev.map(d => d.date === dateStr ? { ...d, time } : d));
  };
  const handleSchedule = () => {
    if (!selectedStudentId || !selClassId || selectedDates.length === 0) return;
    
    const selectedClass = branchClasses.find(c => c.id === selClassId);
    const maxQuota = selectedClass ? selectedClass.maxQuota : 4;
    const student = branchStudents.find(s => s.id === selectedStudentId);

    if (student && student.labelId) {
      const studentLabel = getLabelInfo(student.labelId);
      for (const dateObj of selectedDates) {
        const slotId = `${branchId}-${dateObj.date}-${dateObj.time}-${selClassId}`;
        const existing = scheduleSlots[slotId];
        if (existing && existing.studentIds.length > 0) {
          const fs = branchStudents.find(s => s.id === existing.studentIds[0]);
          if (fs && fs.labelId) {
            const fl = getLabelInfo(fs.labelId);
            if (fl && studentLabel && fl.mainLevel !== studentLabel.mainLevel) {
              if (!window.confirm(`\u26a0\ufe0f Konflik Level! ${studentLabel.mainLevel} vs ${fl.mainLevel}. Lanjutkan?`)) return;
              break;
            }
          }
        }
      }
    }

    setScheduleSlots(prev => {
      const newSlots = { ...prev };
      let skipped = 0;
      for (const dateObj of selectedDates) {
        const slotId = `${branchId}-${dateObj.date}-${dateObj.time}-${selClassId}`;
        if (!newSlots[slotId]) {
          newSlots[slotId] = { 
            id: slotId, 
            branchId, 
            classId: selClassId, 
            dateString: dateObj.date, 
            day: getDayName(dateObj.date), 
            time: dateObj.time, 
            studentIds: [] 
          };
        }
        const slot = newSlots[slotId];
        if (slot.studentIds.includes(selectedStudentId) || slot.studentIds.length >= maxQuota) { skipped++; continue; }
        newSlots[slotId] = { ...slot, studentIds: [...slot.studentIds, selectedStudentId] };
      }
      const booked = selectedDates.length - skipped;
      setTimeout(() => alert(skipped > 0 ? `${booked} jadwal dibuat, ${skipped} dilewati (sudah ada/penuh).` : `${booked} jadwal berhasil dibuat!`), 100);
      return newSlots;
    });
    
    setSelectedDates([]); 
    setSelClassId('');
  };

  const handleRemoveSchedule = (slotId, studentId) => {
    setScheduleSlots(prev => {
      const newSlots = { ...prev };
      if (newSlots[slotId]) {
        newSlots[slotId] = { ...newSlots[slotId], studentIds: newSlots[slotId].studentIds.filter(id => id !== studentId) };
      }
      return newSlots;
    });
  };

  const formatDate = (ds) => {
    if (!ds) return '';
    const [y, m, d] = ds.split('-');
    const months = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Ags","Sep","Okt","Nov","Des"];
    return `${parseInt(d,10)} ${months[parseInt(m,10)-1]} ${y}`;
  };

  const studentSchedule = selectedStudent ? getStudentSchedule(selectedStudent.id) : [];
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Kelola Siswa</h1>
        <p className="text-slate-500">Pilih siswa lalu jadwalkan ke tanggal & jam tertentu secara spesifik.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          <div className="p-4 border-b border-slate-100 bg-slate-50 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Cari siswa..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredStudents.length === 0 && <div className="text-center py-8 text-slate-400 text-sm">Tidak ada siswa</div>}
            {filteredStudents.map(student => {
              const label = getLabelInfo(student.labelId);
              const bgColor = label ? label.colorHex : (student.status === 'CG' ? '#f1f5f9' : '#ffffff');
              const textColor = label ? getTextColor(bgColor) : 'text-slate-800';
              const isSelected = selectedStudentId === student.id;
              const scheduleCount = getStudentSchedule(student.id).length;
              return (
                <button key={student.id} onClick={() => setSelectedStudentId(student.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all border ${isSelected ? 'ring-2 ring-blue-500 border-blue-300 shadow-md' : 'border-slate-200 hover:border-blue-200 hover:shadow-sm'}`}
                  style={label ? { backgroundColor: bgColor } : {}}>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className={`font-bold text-sm ${textColor}`}>{student.status === 'CG' ? '(CG) ' : ''}{student.nickname}</span>
                      <p className={`text-xs opacity-70 ${textColor}`}>{label ? `${label.mainLevel} - ${label.subLevel}` : (student.status === 'CG' ? 'Coba Gratis' : 'Tanpa Level')}</p>
                    </div>
                    {scheduleCount > 0 && <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">{scheduleCount}</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        <div className="lg:col-span-2 space-y-6">
          {!selectedStudent ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="font-bold text-slate-500 text-lg">Pilih Siswa</h3>
              <p className="text-slate-400 text-sm mt-1">Klik nama siswa di sebelah kiri untuk mulai menjadwalkan.</p>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">{selectedStudent.name}</h2>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {selectedStudent.status === 'CG' ? 'Siswa Coba Gratis' : (() => { const l = getLabelInfo(selectedStudent.labelId); return l ? `${l.mainLevel} - ${l.subLevel}` : 'Tanpa Level'; })()}
                      {selectedStudent.phone ? ` \u2022 ${selectedStudent.phone}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => handleDeactivateStudent(selectedStudent.id)}
                      className="flex items-center text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-200 transition-colors"
                    >
                      <PowerOff className="w-3.5 h-3.5 mr-1.5" /> Nonaktifkan
                    </button>
                    {(() => { const l = getLabelInfo(selectedStudent.labelId); return l ? <div className="w-8 h-8 rounded-full shadow-sm border border-black/10" style={{ backgroundColor: l.colorHex }} /> : null; })()}
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-blue-50 flex items-center">
                  <Plus className="w-5 h-5 text-blue-600 mr-2" />
                  <h3 className="font-bold text-blue-800">Tambah Jadwal Baru</h3>
                </div>
                <div className="p-5 space-y-6">
                  {branchClasses.length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-4">Belum ada kelas. Buat dulu di Master Data.</p>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2"><BookOpen className="w-4 h-4 inline mr-1.5 text-slate-400" />1. Pilih Kelas</label>
                        <div className="flex flex-wrap gap-2">
                          {branchClasses.map(cls => (
                            <button key={cls.id} onClick={() => setSelClassId(cls.id)}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${selClassId === cls.id ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                              {cls.name} <span className="ml-1.5 text-xs opacity-70">(Kuota {cls.maxQuota})</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2"><Calendar className="w-4 h-4 inline mr-1.5 text-slate-400" />2. Pilih Tanggal</label>
                        <div className="flex items-center space-x-2">
                          <input type="date" value={tempDate} onChange={(e) => setTempDate(e.target.value)} 
                                 className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                          <button onClick={addDate} className="px-4 py-2 bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 rounded-lg font-bold text-sm transition-colors">
                            Tambah Tanggal
                          </button>
                        </div>
                      </div>

                      {selectedDates.length > 0 && (
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-3"><Clock className="w-4 h-4 inline mr-1.5 text-slate-400" />3. Atur Jam (Per Tanggal)</label>
                          <div className="space-y-3">
                            {selectedDates.map(dateObj => (
                              <div key={dateObj.date} className="flex flex-col sm:flex-row sm:items-center bg-slate-50 p-3 rounded-lg border border-slate-200 gap-3 relative group">
                                <span className="font-bold text-slate-700 w-32 shrink-0 flex flex-col">
                                  <span className="text-xs text-slate-500 uppercase">{getDayName(dateObj.date)}</span>
                                  <span>{formatDate(dateObj.date)}</span>
                                </span>
                                <div className="flex-1 flex flex-wrap gap-2">
                                  {TIME_SLOTS.map(time => (
                                    <button key={time} onClick={() => updateTimeForDate(dateObj.date, time)}
                                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors border ${dateObj.time === time ? 'bg-purple-600 text-white border-purple-600 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'}`}>
                                      {time}
                                    </button>
                                  ))}
                                </div>
                                <button onClick={() => removeDate(dateObj.date)} className="absolute -top-2 -right-2 bg-red-100 text-red-500 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white shadow-sm border border-red-200">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {selClassId && selectedDates.length > 0 && (
                        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 mt-6">
                          <p className="text-sm text-slate-600 mb-3">
                            <strong>{selectedStudent.nickname}</strong> akan dijadwalkan di kelas <strong>{branchClasses.find(c => c.id === selClassId)?.name}</strong> pada:
                          </p>
                          <ul className="list-disc list-inside text-sm text-slate-700 mb-4 font-medium space-y-1">
                            {selectedDates.map(d => (
                              <li key={d.date}>{formatDate(d.date)} ({getDayName(d.date)}) - <span className="text-purple-600 font-bold">{d.time}</span></li>
                            ))}
                          </ul>
                          <button onClick={handleSchedule} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center shadow-sm">
                            <CheckCircle className="w-4 h-4 mr-2" />Simpan Jadwal
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-slate-500 mr-2" />
                    <h3 className="font-bold text-slate-700">Jadwal {selectedStudent.nickname}</h3>
                  </div>
                  <span className="text-xs text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full font-bold">{studentSchedule.length} jadwal</span>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {studentSchedule.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm">Belum ada jadwal untuk siswa ini.</div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 text-slate-600 sticky top-0">
                        <tr>
                          <th className="text-left px-4 py-2 font-semibold">Tanggal</th>
                          <th className="text-left px-4 py-2 font-semibold">Hari</th>
                          <th className="text-left px-4 py-2 font-semibold">Jam</th>
                          <th className="text-left px-4 py-2 font-semibold">Kelas</th>
                          <th className="text-center px-4 py-2 font-semibold">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentSchedule.map(entry => (
                          <tr key={entry.id} className="border-t border-slate-100 hover:bg-slate-50">
                            <td className="px-4 py-2.5 font-medium text-slate-700">{formatDate(entry.dateString)}</td>
                            <td className="px-4 py-2.5 text-slate-600">{entry.day}</td>
                            <td className="px-4 py-2.5 text-slate-600">{entry.time}</td>
                            <td className="px-4 py-2.5"><span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">{entry.className}</span></td>
                            <td className="px-4 py-2.5 text-center">
                              <button onClick={() => handleRemoveSchedule(entry.id, selectedStudent.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Hapus jadwal ini">
                                <X className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
