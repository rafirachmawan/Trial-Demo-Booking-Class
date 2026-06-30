import React, { useState, useContext } from 'react';
import { AppContext } from '../../App';
import { Search, Edit2, X, Check, CheckCircle } from 'lucide-react';

export default function CabangStudents({ branchId }) {
  const { students, setStudents, labels } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');
  
  const branchStudents = students.filter(s => s.branchId === branchId);
  const branchLabels = labels.filter(l => l.branchId === branchId);

  const filteredStudents = branchStudents.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [editingId, setEditingId] = useState(null);
  const [editLabelId, setEditLabelId] = useState('');

  const handleUpdateLabel = (id, newLabelId) => {
    setStudents(prev => prev.map(s => 
      s.id === id ? { ...s, labelId: newLabelId, status: 'REGISTERED' } : s
    ));
    setEditingId(null);
  };

  const startEdit = (student) => {
    setEditingId(student.id);
    setEditLabelId(student.labelId || (branchLabels.length > 0 ? branchLabels[0].id : ''));
  };

  const getLabelInfo = (labelId) => {
    return branchLabels.find(l => l.id === labelId);
  };

  const getTextColor = (hexColor) => {
    if (!hexColor || hexColor === '#ffffff') return 'text-slate-800';
    const darkColors = ['#1B5E20', '#0D47A1', '#B71C1C', '#4A148C'];
    return darkColors.includes(hexColor) ? 'text-white' : 'text-slate-800';
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Daftar Siswa Cabang</h1>
          <p className="text-slate-500">Lihat semua anak CG (Coba Gratis) dan Siswa Terdaftar.</p>
        </div>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" placeholder="Cari siswa..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Siswa CG */}
        <div className="space-y-4">
          <h2 className="font-bold text-slate-700 flex items-center border-b border-slate-200 pb-2">
            <span className="bg-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full text-xs mr-2">CG</span>
            Siswa Coba Gratis (Belum berlevel)
          </h2>
          
          <div className="space-y-3">
            {filteredStudents.filter(s => s.status === 'CG').map(student => (
              <div key={student.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-800">{student.name} ({student.nickname})</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {student.age || '-'} • {student.phone || '-'}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[200px]">{student.address || '-'}</p>
                  </div>
                  
                  {editingId !== student.id ? (
                    <button 
                      onClick={() => startEdit(student)}
                      className="px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-xs font-bold transition-colors flex items-center border border-green-200"
                    >
                      <CheckCircle className="w-3.5 h-3.5 mr-1" /> Jadi Terdaftar
                    </button>
                  ) : (
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <p className="text-xs font-semibold mb-2">Pilih Label Level:</p>
                      <select 
                        value={editLabelId} onChange={e => setEditLabelId(e.target.value)}
                        className="w-full p-1.5 text-xs border rounded bg-white mb-2"
                      >
                        <option value="">Pilih Label</option>
                        {branchLabels.map(l => (
                          <option key={l.id} value={l.id}>{l.mainLevel} - {l.subLevel}</option>
                        ))}
                      </select>
                      <div className="flex space-x-1">
                        <button onClick={() => handleUpdateLabel(student.id, editLabelId)} className="flex-1 py-1.5 bg-blue-600 text-white rounded text-xs font-bold">Simpan</button>
                        <button onClick={() => setEditingId(null)} className="flex-1 py-1.5 bg-slate-200 text-slate-700 rounded text-xs font-bold">Batal</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {filteredStudents.filter(s => s.status === 'CG').length === 0 && (
              <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">
                Tidak ada siswa CG
              </div>
            )}
          </div>
        </div>

        {/* Siswa Terdaftar */}
        <div className="space-y-4">
          <h2 className="font-bold text-slate-700 flex items-center border-b border-slate-200 pb-2">
            <span className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-xs mr-2 border border-blue-200">OFFICIAL</span>
            Siswa Terdaftar (Berlevel)
          </h2>

          <div className="space-y-3">
            {filteredStudents.filter(s => s.status === 'REGISTERED').map(student => {
              const label = getLabelInfo(student.labelId);
              const bgColor = label ? label.colorHex : '#ffffff';
              const textColor = getTextColor(bgColor);
              const isEditing = editingId === student.id;

              return (
                <div key={student.id} className="p-4 rounded-xl shadow-sm border border-black/5" style={{ backgroundColor: bgColor }}>
                  {!isEditing ? (
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className={`font-bold ${textColor}`}>{student.name}</h3>
                        <p className={`text-xs opacity-80 ${textColor} mt-0.5 font-medium`}>
                          {label ? `${label.mainLevel} - ${label.subLevel}` : 'Tanpa Level'}
                        </p>
                      </div>
                      <button 
                        onClick={() => startEdit(student)}
                        className={`p-1.5 hover:bg-black/10 rounded-md transition-colors ${textColor}`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="bg-white/90 p-3 rounded-lg shadow-inner">
                      <h3 className="font-bold text-slate-800 text-sm mb-2">Ubah Level {student.nickname}</h3>
                      <select 
                        value={editLabelId} onChange={e => setEditLabelId(e.target.value)}
                        className="w-full p-2 text-sm border rounded bg-white mb-2 outline-none focus:border-blue-400"
                      >
                        {branchLabels.map(l => (
                          <option key={l.id} value={l.id}>{l.mainLevel} - {l.subLevel}</option>
                        ))}
                      </select>
                      <div className="flex space-x-2">
                        <button onClick={() => handleUpdateLabel(student.id, editLabelId)} className="flex-1 py-2 bg-green-500 text-white rounded-lg text-xs font-bold hover:bg-green-600">Simpan</button>
                        <button onClick={() => setEditingId(null)} className="flex-1 py-2 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-300">Batal</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
             {filteredStudents.filter(s => s.status === 'REGISTERED').length === 0 && (
              <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">
                Tidak ada siswa terdaftar
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
