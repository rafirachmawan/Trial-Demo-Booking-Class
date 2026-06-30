import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle, Lock, Key } from 'lucide-react';

export default function BookingModal({ 
  isOpen, 
  onClose, 
  slot, 
  students, 
  labels,
  maxQuota,
  onConfirm,
  onRemoveStudent
}) {
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [showOverride, setShowOverride] = useState(false); // Override currently accessible by admin cabang in SaaS v2

  if (!isOpen || !slot) return null;

  const isFull = slot.studentIds.length >= maxQuota;
  
  // Available students in this branch that are NOT in this slot
  const availableStudents = students.filter(s => !slot.studentIds.includes(s.id));
  const selectedStudent = students.find(s => s.id === selectedStudentId);

  const getLabelInfo = (labelId) => {
    return labels.find(l => l.id === labelId);
  };

  // Check level conflict (Only if both have labels - CG has no conflict)
  let hasConflict = false;
  let conflictMessage = "";
  if (selectedStudent && selectedStudent.labelId && slot.studentIds.length > 0) {
    const existingStudent = students.find(s => s.id === slot.studentIds[0]);
    if (existingStudent && existingStudent.labelId) {
      const existingLabel = getLabelInfo(existingStudent.labelId);
      const selectedLabel = getLabelInfo(selectedStudent.labelId);
      
      if (existingLabel && selectedLabel && selectedLabel.mainLevel !== existingLabel.mainLevel) {
        hasConflict = true;
        conflictMessage = `Siswa ini Level ${selectedLabel.mainLevel}, sedangkan slot ini sudah berisi anak Level ${existingLabel.mainLevel}.`;
      }
    }
  }

  const handleConfirm = () => {
    if (!selectedStudentId) return;
    onConfirm(selectedStudentId, slot.id);
    setSelectedStudentId('');
    setShowOverride(false);
    onClose();
  };

  const getBackgroundColor = (labelId) => {
    const label = getLabelInfo(labelId);
    return label ? label.colorHex : '#ffffff';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const [y, m, d] = dateString.split('-');
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
    return `${parseInt(d, 10)} ${months[parseInt(m, 10) - 1]} ${y}`;
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="font-bold text-lg text-slate-800">Booking Slot Jadwal</h3>
            <p className="text-sm text-slate-500">{slot.day}{slot.dateString ? `, ${formatDate(slot.dateString)}` : ''} • {slot.time}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Visualisasi Kuota */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-slate-700">Kapasitas Kelas</span>
              <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                {slot.studentIds.length} / {maxQuota} Terisi
              </span>
            </div>
            <div className="flex space-x-2">
              {Array.from({ length: maxQuota }).map((_, i) => {
                const sid = slot.studentIds[i];
                const s = sid ? students.find(stu => stu.id === sid) : null;
                return (
                    <div 
                      key={i} 
                      className={`flex-1 h-12 rounded-lg border-2 flex items-center justify-center font-bold text-xs relative group px-1 ${
                        s ? 'border-transparent text-slate-800 shadow-sm' : 'border-dashed border-slate-300 bg-slate-50 text-slate-400'
                      }`}
                      style={s ? { backgroundColor: getBackgroundColor(s.labelId) } : {}}
                      title={s ? s.name : 'Kosong'}
                    >
                      <span className="truncate max-w-full">
                        {s ? (s.status === 'CG' ? `(CG) ${s.nickname}` : s.nickname) : '+'}
                      </span>
                    {s && (
                      <button 
                        onClick={() => onRemoveStudent(s.id, slot.id)}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                        title="Keluarkan dari kelas"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Pemilihan */}
          {!isFull || showOverride ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Pilih Siswa</label>
                <select 
                  className="w-full p-3 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                >
                  <option value="">-- Pilih Siswa --</option>
                  {availableStudents.map(s => {
                    const label = getLabelInfo(s.labelId);
                    return (
                      <option key={s.id} value={s.id}>
                        {s.status === 'CG' ? `[CG] ${s.name}` : `${s.name} (${label ? label.mainLevel : 'Tanpa Level'})`}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Warning Area */}
              {hasConflict && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex space-x-3 items-start">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-amber-800 text-sm">Warning: Konflik Level Utama!</h4>
                    <p className="text-amber-700 text-xs mt-1">{conflictMessage}</p>
                    <p className="text-amber-800 text-xs font-semibold mt-2">Apakah Anda ingin mengabaikan dan melanjutkan?</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-100 rounded-lg p-6 flex flex-col items-center justify-center text-center border border-slate-200">
              <div className="bg-slate-200 p-3 rounded-full mb-3">
                <Lock className="w-6 h-6 text-slate-500" />
              </div>
              <h4 className="font-bold text-slate-700 mb-1">Kuota Penuh</h4>
              <p className="text-sm text-slate-500 mb-4">Slot ini sudah tidak dapat menerima siswa baru.</p>
              
              {!showOverride && (
                <button 
                  onClick={() => setShowOverride(true)}
                  className="flex items-center space-x-2 text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg font-semibold text-sm transition-colors border border-red-200"
                >
                  <Key className="w-4 h-4" />
                  <span>Override Kuota Penuh</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
          >
            Batal
          </button>
          {(!isFull || showOverride) && (
            <button 
              onClick={handleConfirm}
              disabled={!selectedStudentId}
              className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-bold transition-all shadow-sm ${
                !selectedStudentId 
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                  : hasConflict 
                    ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
              }`}
            >
              {hasConflict ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
              <span>{hasConflict ? 'Abaikan & Lanjutkan' : 'Booking Sekarang'}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
