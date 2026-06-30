import React, { useState, useContext } from 'react';
import { AppContext } from '../../App';
import { FileText, Copy, CheckCircle } from 'lucide-react';

export default function CabangCgForm({ branchId, onSuccess }) {
  const { students, setStudents } = useContext(AppContext);
  const [waText, setWaText] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    dob: '',
    age: '',
    phone: '',
    address: '',
    school: ''
  });

  const handleParseWA = () => {
    // Simple parser assuming typical format
    const lines = waText.split('\n');
    const newForm = { ...formData };
    
    lines.forEach(line => {
      const lowerLine = line.toLowerCase();
      if (lowerLine.includes('nama lengkap anak') || lowerLine.includes('nama lengkap')) {
        newForm.name = line.split(':')[1]?.trim() || '';
      } else if (lowerLine.includes('nama panggilan')) {
        newForm.nickname = line.split(':')[1]?.trim() || '';
      } else if (lowerLine.includes('tanggal lahir anak') || lowerLine.includes('tanggal lahir')) {
        newForm.dob = line.split(':')[1]?.trim() || '';
      } else if (lowerLine.includes('usia')) {
        newForm.age = line.split(':')[1]?.trim() || '';
      } else if (lowerLine.includes('no hp')) {
        newForm.phone = line.split(':')[1]?.trim() || '';
      } else if (lowerLine.includes('alamat')) {
        newForm.address = line.split(':')[1]?.trim() || '';
      } else if (lowerLine.includes('sekolah')) {
        newForm.school = line.split(':')[1]?.trim() || '';
      }
    });
    
    setFormData(newForm);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) {
      alert("Nama lengkap anak wajib diisi!");
      return;
    }

    const newStudent = {
      id: 's' + Date.now(),
      branchId: branchId,
      name: formData.name,
      nickname: formData.nickname,
      status: 'CG', // Status is Coba Gratis
      labelId: null, // No label yet
      dob: formData.dob,
      age: formData.age,
      phone: formData.phone,
      address: formData.address,
      school: formData.school
    };

    setStudents([...students, newStudent]);
    alert("Berhasil mendaftarkan anak sebagai Coba Gratis (CG)!");
    onSuccess();
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Pendaftaran Coba Gratis (CG)</h1>
        <p className="text-slate-500">Daftarkan anak untuk jadwal trial sebelum mendapatkan level permanen.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Paste Area */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center space-x-2 mb-4 text-green-600 font-bold">
            <Copy className="w-5 h-5" />
            <h2>Copy-Paste dari WhatsApp</h2>
          </div>
          <p className="text-sm text-slate-500 mb-3">
            Tempelkan format pesan pendaftaran dari orang tua di sini, lalu klik Parse untuk mengisi form otomatis.
          </p>
          <textarea
            value={waText}
            onChange={(e) => setWaText(e.target.value)}
            className="w-full h-64 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-green-500 outline-none resize-none"
            placeholder={`Data Anak
Nama Lengkap anak : Shanaya Zida Najma
Nama panggilan : Naya
Tanggal lahir anak : 07 agustus 2023
Usia : 3tahun kurang 2 bulan
No hp : 085648778798
Alamat : podorejo sumbergempol
Sekolah : `}
          />
          <button 
            type="button"
            onClick={handleParseWA}
            className="mt-4 w-full py-2.5 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-900 transition-colors"
          >
            Auto-Isi Form
          </button>
        </div>

        {/* Form Area */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center space-x-2 mb-6 text-blue-600 font-bold">
            <FileText className="w-5 h-5" />
            <h2>Detail Form CG</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Lengkap</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Panggilan</label>
                <input type="text" value={formData.nickname} onChange={e => setFormData({...formData, nickname: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">No HP</label>
                <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tanggal Lahir</label>
                <input type="text" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Bisa format teks" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Usia</label>
                <input type="text" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Alamat Lengkap</label>
              <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Asal Sekolah</label>
              <input type="text" value={formData.school} onChange={e => setFormData({...formData, school: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100">
              <button type="submit" className="w-full flex justify-center items-center py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-colors shadow-sm">
                <CheckCircle className="w-5 h-5 mr-2" />
                Simpan Sebagai Siswa CG
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
