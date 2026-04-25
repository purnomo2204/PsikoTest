import React from 'react';
import { BookOpen, Users, ClipboardCheck, BarChart3, FileText, MessageSquarePlus } from 'lucide-react';

export const Guide = () => {
  return (
    <div className="p-8 max-w-4xl mx-auto bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-black text-slate-900 mb-2">Panduan Pengguna Platform Asesmen BK</h1>
      <p className="text-slate-600 mb-8 font-medium">Selamat datang, Guru BK. Berikut panduan ringkas untuk mengoptimalkan penggunaan aplikasi ini.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FeatureCard 
          icon={<Users className="w-8 h-8 text-emerald-600" />}
          title="Kelola Data Siswa & Kelas"
          description="Pantau profil siswa, kelola kelas, dan pastikan data siswa terupdate untuk asesmen yang akurat."
        />
        <FeatureCard 
          icon={<ClipboardCheck className="w-8 h-8 text-indigo-600" />}
          title="Pantau & Jalankan Asesmen"
          description="Siswa dapat menjalankan berbagai tes psikologi secara mandiri atau dibantu guru melalui akun mereka."
        />
        <FeatureCard 
          icon={<BarChart3 className="w-8 h-8 text-rose-600" />}
          title="Analisis Hasil & Laporan"
          description="Lihat hasil tes individu maupun klasikal dalam bentuk visual (grafik) dan laporan yang siap dicetak (PDF/Excel)."
        />
        <FeatureCard 
          icon={<MessageSquarePlus className="w-8 h-8 text-amber-600" />}
          title="Catatan Konseling"
          description="Simpan dan kelola log bimbingan konseling per siswa secara sistematis dan aman."
        />
      </div>

      <div className="mt-10 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-black text-slate-900 mb-4">Langkah Cepat Penggunaan</h2>
        <ul className="space-y-3 text-slate-700 font-medium list-decimal list-inside">
          <li><strong>Login:</strong> Masuk ke aplikasi menggunakan akun Guru BK yang terdaftar.</li>
          <li><strong>Kelola Data:</strong> Pastikan seluruh siswa telah terdaftar dalam kelas yang sesuai.</li>
          <li><strong>Pantau Asesmen:</strong> Cek halaman 'Hasil Tes' untuk melihat progres siswa.</li>
          <li><strong>Analisis:</strong> Klik tombol 'Unduh Laporan' untuk mendapatkan hasil analisis mendalam.</li>
          <li><strong>Catatan:</strong> Tambahkan catatan pada 'Catatan Konseling' setelah melakukan tindak lanjut dengan siswa.</li>
        </ul>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-200 transition-all">
    <div className="mb-4">{icon}</div>
    <h3 className="text-lg font-black text-slate-900 mb-2">{title}</h3>
    <p className="text-sm text-slate-600 font-medium">{description}</p>
  </div>
);
