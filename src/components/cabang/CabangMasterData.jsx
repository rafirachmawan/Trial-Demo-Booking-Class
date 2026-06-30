import React, { useState, useContext } from 'react';
import { AppContext } from '../../App';
import { Tag, BookOpen, Trash2, Plus } from 'lucide-react';

export default function CabangMasterData({ branchId }) {
  const { labels, setLabels, classes, addClass } = useContext(AppContext);
  
  const branchLabels = labels.filter(l => l.branchId === branchId);
  const branchClasses = classes.filter(c => c.branchId === branchId);

  // States for new label
  const [newMainLevel, setNewMainLevel] = useState('');
  const [newSubLevel, setNewSubLevel] = useState('');
  const [newColor, setNewColor] = useState('#2196F3');

  // States for new class
  const [newClassName, setNewClassName] = useState('');
  const [newMaxQuota, setNewMaxQuota] = useState(4);

  const handleAddLabel = (e) => {
    e.preventDefault();
    if (!newMainLevel || !newSubLevel) return;
    setLabels([...labels, {
      id: 'l' + Date.now(),
      branchId,
      mainLevel: newMainLevel,
      subLevel: newSubLevel,
      colorHex: newColor
    }]);
    setNewMainLevel('');
    setNewSubLevel('');
  };

  const handleDeleteLabel = (id) => {
    setLabels(labels.filter(l => l.id !== id));
  };

  const handleAddClass = (e) => {
    e.preventDefault();
    if (!newClassName) return;
    addClass({
      branchId,
      name: newClassName,
      maxQuota: parseInt(newMaxQuota)
    });
    setNewClassName('');
  };

  const handleDeleteClass = (id) => {
    // Note: Should also delete slots, simplified for demo
    // setClasses(classes.filter(c => c.id !== id));
    alert("Hapus kelas belum diimplementasi penuh karena ada relasi dengan slot jadwal.");
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Master Data Cabang</h1>
        <p className="text-slate-500">Kelola Label Level (Montessori A, dll) dan Kelas untuk cabang ini.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Kelas Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center">
            <BookOpen className="w-5 h-5 text-blue-600 mr-2" />
            <h2 className="font-bold text-slate-800">Manajemen Kelas</h2>
          </div>
          <div className="p-4">
            <form onSubmit={handleAddClass} className="flex space-x-2 mb-4">
              <input 
                type="text" required placeholder="Nama Kelas" value={newClassName} onChange={e => setNewClassName(e.target.value)}
                className="flex-1 p-2 border rounded-lg text-sm bg-slate-50 outline-none focus:border-blue-400"
              />
              <input 
                type="number" required placeholder="Kuota" value={newMaxQuota} onChange={e => setNewMaxQuota(e.target.value)} min={1} max={20}
                className="w-20 p-2 border rounded-lg text-sm bg-slate-50 outline-none focus:border-blue-400"
              />
              <button type="submit" className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Plus className="w-5 h-5" />
              </button>
            </form>

            <div className="space-y-2">
              {branchClasses.map(c => (
                <div key={c.id} className="flex justify-between items-center p-3 border rounded-lg bg-slate-50/50">
                  <div>
                    <span className="font-bold text-slate-700 text-sm">{c.name}</span>
                    <span className="ml-2 text-xs text-slate-500 bg-slate-200 px-2 py-0.5 rounded">Kuota: {c.maxQuota}</span>
                  </div>
                  <button onClick={() => handleDeleteClass(c.id)} className="text-red-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {branchClasses.length === 0 && <p className="text-slate-400 text-sm text-center py-4">Belum ada kelas.</p>}
            </div>
          </div>
        </div>

        {/* Labels Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center">
            <Tag className="w-5 h-5 text-amber-500 mr-2" />
            <h2 className="font-bold text-slate-800">Manajemen Label Level</h2>
          </div>
          <div className="p-4">
            <form onSubmit={handleAddLabel} className="space-y-3 mb-4 p-3 bg-amber-50/50 rounded-lg border border-amber-100">
              <div className="flex space-x-2">
                <input 
                  type="text" required placeholder="Main Level (ex: Montessori A)" value={newMainLevel} onChange={e => setNewMainLevel(e.target.value)}
                  className="flex-1 p-2 border rounded-lg text-sm bg-white outline-none focus:border-amber-400"
                />
                <input 
                  type="text" required placeholder="Sub (ex: Hijau)" value={newSubLevel} onChange={e => setNewSubLevel(e.target.value)}
                  className="w-1/3 p-2 border rounded-lg text-sm bg-white outline-none focus:border-amber-400"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input 
                  type="color" value={newColor} onChange={e => setNewColor(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer"
                />
                <button type="submit" className="flex-1 py-2 bg-amber-500 text-white font-bold rounded-lg hover:bg-amber-600 text-sm">
                  Tambah Label Baru
                </button>
              </div>
            </form>

            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
              {branchLabels.map(l => (
                <div key={l.id} className="flex justify-between items-center p-2.5 border rounded-lg" style={{ borderColor: l.colorHex, backgroundColor: `${l.colorHex}20` }}>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full mr-3 shadow-sm border border-black/10" style={{ backgroundColor: l.colorHex }}></div>
                    <div>
                      <div className="font-bold text-slate-800 text-sm">{l.mainLevel}</div>
                      <div className="text-xs text-slate-600 font-medium">{l.subLevel}</div>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteLabel(l.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-white rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
