import React, { useState } from 'react';
import { LEVEL_COLORS } from '../utils/dummyData';
import { Search, Edit2, X, Check } from 'lucide-react';

export default function StudentList({ students, role, onUpdateLevel }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  
  // Temporary state for editing
  const [editMainLevel, setEditMainLevel] = useState('');
  const [editSubLevel, setEditSubLevel] = useState('');

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startEdit = (student) => {
    setEditingId(student.id);
    setEditMainLevel(student.mainLevel);
    setEditSubLevel(student.subLevel);
  };

  const saveEdit = (id) => {
    onUpdateLevel(id, editMainLevel, editSubLevel);
    setEditingId(null);
  };

  const getBackgroundColor = (mainLevel, subLevel) => {
    try {
      return LEVEL_COLORS[mainLevel][subLevel] || '#ffffff';
    } catch (e) {
      return '#ffffff';
    }
  };

  // Function to determine if text should be dark or light based on bg color brightness
  const getTextColor = (hexColor) => {
    if (!hexColor || hexColor === '#ffffff') return 'text-slate-800';
    // A simple heuristic for our specific pastel/bright colors: most need dark text except very dark ones
    const darkColors = ['#1B5E20', '#0D47A1', '#B71C1C', '#4A148C'];
    return darkColors.includes(hexColor) ? 'text-white' : 'text-slate-800';
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Daftar Siswa</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari siswa..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-100 border-transparent rounded-lg text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
          />
        </div>
        {role === 'admin' && (
          <button className="mt-3 w-full py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors border border-blue-200 dashed">
            + Tambah Siswa Baru
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredStudents.map(student => {
          const isEditing = editingId === student.id;
          const bgColor = getBackgroundColor(student.mainLevel, student.subLevel);
          const textColor = getTextColor(bgColor);
          
          return (
            <div 
              key={student.id} 
              className={`p-3 rounded-xl border border-black/5 shadow-sm transition-all relative group`}
              style={{ backgroundColor: bgColor }}
            >
              {!isEditing ? (
                <>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className={`font-bold ${textColor}`}>{student.name}</div>
                      <div className={`text-xs opacity-80 ${textColor} mt-0.5 font-medium`}>
                        {student.mainLevel} - {student.subLevel}
                      </div>
                    </div>
                    {/* Both Admin and Miss can change level */}
                    <button 
                      onClick={() => startEdit(student)}
                      className={`p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/10 ${textColor}`}
                      title="Ubah Level"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="bg-white/90 p-2 rounded-lg space-y-2 shadow-inner">
                  <div className="font-bold text-slate-800 text-sm">{student.name}</div>
                  
                  <select 
                    value={editMainLevel}
                    onChange={(e) => {
                      setEditMainLevel(e.target.value);
                      setEditSubLevel(Object.keys(LEVEL_COLORS[e.target.value])[0]);
                    }}
                    className="w-full p-1.5 text-xs border rounded bg-white"
                  >
                    {Object.keys(LEVEL_COLORS).map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>

                  <select 
                    value={editSubLevel}
                    onChange={(e) => setEditSubLevel(e.target.value)}
                    className="w-full p-1.5 text-xs border rounded bg-white"
                  >
                    {Object.keys(LEVEL_COLORS[editMainLevel]).map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>

                  <div className="flex space-x-1 pt-1">
                    <button 
                      onClick={() => saveEdit(student.id)}
                      className="flex-1 py-1.5 bg-green-500 text-white rounded text-xs font-bold hover:bg-green-600 flex justify-center items-center"
                    >
                      <Check className="w-3.5 h-3.5 mr-1" /> Simpan
                    </button>
                    <button 
                      onClick={() => setEditingId(null)}
                      className="flex-1 py-1.5 bg-slate-200 text-slate-700 rounded text-xs font-bold hover:bg-slate-300 flex justify-center items-center"
                    >
                      <X className="w-3.5 h-3.5 mr-1" /> Batal
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filteredStudents.length === 0 && (
          <div className="text-center py-8 text-slate-400 text-sm">
            Tidak ada siswa ditemukan.
          </div>
        )}
      </div>
    </div>
  );
}
