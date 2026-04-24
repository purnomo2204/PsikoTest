import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, 
  PieChart, Pie, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar as RechartsRadar, Legend 
} from 'recharts';
import { Filter, Users, User, Brain, TrendingUp, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { cn } from '../lib/utils';
// Note: We'll assume these types are passed as props since we need to import them from types.ts or App.tsx typically.
// To avoid circular dependency or import issues, we define minimal types here or export from types.ts.

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

export const InteractiveReport = ({ results, classes, students, TESTS }: any) => {
  const [viewMode, setViewMode] = useState<'class' | 'individual'>('class');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedTest, setSelectedTest] = useState<string>(Object.keys(TESTS)[0] || 'learning_style');

  const testOptions = Object.keys(TESTS).map(key => ({
    id: key,
    title: TESTS[key].title
  }));

  // Filtering Logic
  const filteredResults = useMemo(() => {
    let filtered = results.filter((r: any) => r.testType === selectedTest);
    
    if (viewMode === 'class') {
      if (selectedClass !== 'all') {
        filtered = filtered.filter((r: any) => r.studentClass === selectedClass);
      }
    } else {
      if (selectedStudent) {
        filtered = filtered.filter((r: any) => r.studentId === selectedStudent || r.studentName === selectedStudent);
      } else {
        filtered = []; // Need a student selected
      }
    }
    return filtered;
  }, [results, selectedTest, viewMode, selectedClass, selectedStudent]);

  // Aggregate Data for Class View (Averages & Distribution)
  const classData = useMemo(() => {
    if (viewMode !== 'class' || filteredResults.length === 0) return null;

    // 1. Average Scores (Bar Chart / Radar)
    const scoreSums: Record<string, number> = {};
    const scoreCounts: Record<string, number> = {};
    // 2. Dominant Type Distribution (Pie Chart)
    const distribution: Record<string, number> = {};

    filteredResults.forEach((r: any) => {
      // Scores
      if (r.scores) {
        Object.entries(r.scores).forEach(([key, value]) => {
          if (typeof value === 'number') {
            scoreSums[key] = (scoreSums[key] || 0) + value;
            scoreCounts[key] = (scoreCounts[key] || 0) + 1;
          }
        });
      }

      // Dominant Type (simple logic: max score key)
      if (r.scores) {
        const sortedScores = Object.entries(r.scores)
          .filter(([_, v]) => typeof v === 'number')
          .sort((a: any, b: any) => b[1] - a[1]);
        if (sortedScores.length > 0) {
          const dominantKey = sortedScores[0][0];
          distribution[dominantKey] = (distribution[dominantKey] || 0) + 1;
        }
      }
    });

    const averageScores = Object.keys(scoreSums).map(key => ({
      name: key.replace(/_/g, ' ').toUpperCase(),
      score: Number((scoreSums[key] / scoreCounts[key]).toFixed(1))
    }));

    const distributionData = Object.keys(distribution).map(key => ({
      name: key.replace(/_/g, ' ').toUpperCase(),
      value: distribution[key]
    }));

    return { averageScores, distributionData };
  }, [filteredResults, viewMode]);

  // Data for Individual View
  const individualData = useMemo(() => {
    if (viewMode !== 'individual' || filteredResults.length === 0) return null;
    const latestResult = filteredResults.sort((a: any, b: any) => b.timestamp?.seconds - a.timestamp?.seconds)[0];
    
    if (!latestResult || !latestResult.scores) return null;

    const scores = Object.keys(latestResult.scores)
      .filter(key => typeof latestResult.scores[key] === 'number')
      .map(key => ({
        name: key.replace(/_/g, ' ').toUpperCase(),
        score: latestResult.scores[key]
      }));

    return { 
      scores,
      analysis: latestResult.analysis,
      studentName: latestResult.studentName,
      date: latestResult.timestamp ? new Date(latestResult.timestamp.seconds * 1000).toLocaleDateString('id-ID') : '-'
    };
  }, [filteredResults, viewMode]);

  const studentsInSelectedClass = useMemo(() => {
    if (selectedClass === 'all') return students;
    return students.filter((s: any) => s.className === selectedClass);
  }, [students, selectedClass]);

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Laporan Interaktif</h2>
            <p className="text-slate-500 text-sm font-medium mt-1">Visualisasi data agregat dan invididu hasil tes psikologi.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-100">
            {/* View Mode Toggle */}
            <div className="flex bg-white rounded-lg border border-slate-200 p-1 shadow-sm">
              <button
                onClick={() => setViewMode('class')}
                className={cn(
                  "px-4 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-2",
                  viewMode === 'class' ? "bg-indigo-600 text-white shadow" : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <Users className="w-4 h-4" /> Kelas
              </button>
              <button
                onClick={() => setViewMode('individual')}
                className={cn(
                  "px-4 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-2",
                  viewMode === 'individual' ? "bg-indigo-600 text-white shadow" : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <User className="w-4 h-4" /> Individu
              </button>
            </div>

            <div className="w-px h-8 bg-slate-200 hidden lg:block"></div>

            {/* Test Selection */}
            <select
              value={selectedTest}
              onChange={(e) => setSelectedTest(e.target.value)}
              className="px-3 py-2 bg-white rounded-lg text-sm font-bold border border-slate-200 text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            >
              {testOptions.map((t: any) => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>

            {/* Sub-filters depending on mode */}
            {viewMode === 'class' ? (
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-3 py-2 bg-white rounded-lg text-sm font-bold border border-slate-200 text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              >
                <option value="all">Semua Kelas</option>
                {classes.map((c: any) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            ) : (
              <div className="flex gap-2">
                <select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    setSelectedStudent('');
                  }}
                  className="px-3 py-2 bg-white rounded-lg text-sm font-bold border border-slate-200 text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                >
                  <option value="all">Semua Kelas</option>
                  {classes.map((c: any) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="px-3 py-2 bg-white rounded-lg text-sm font-bold border border-slate-200 text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm max-w-[200px]"
                >
                  <option value="">-- Pilih Siswa --</option>
                  {studentsInSelectedClass.map((s: any) => (
                    <option key={s.id || s.name} value={s.id || s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <motion.div 
        key={`${viewMode}-${selectedTest}-${selectedClass}-${selectedStudent}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {viewMode === 'class' ? (
          // CLASS VIEW
          !classData || filteredResults.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-700">Data Kosong</h3>
              <p className="text-slate-500 mt-2">Tidak ada data hasil tes di kelas ini untuk jenis tes yang dipilih.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Average Bar Chart */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                    <BarChart3 className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800">Rata-rata Kelas</h3>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Skor Per Dimensi</p>
                  </div>
                </div>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={classData.averageScores} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} />
                      <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }} />
                      <Bar dataKey="score" fill="#4f46e5" radius={[6, 6, 0, 0]} maxBarSize={40}>
                        {classData.averageScores.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Distribution Pie Chart */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center shrink-0">
                    <PieChartIcon className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800">Distribusi Mayoritas</h3>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Tipe Dominan Terbanyak</p>
                  </div>
                </div>
                <div className="h-72 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={classData.distributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {classData.distributionData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )
        ) : (
          // INDIVIDUAL VIEW
          !selectedStudent ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-700">Pilih Siswa</h3>
              <p className="text-slate-500 mt-2">Pilih nama siswa pada filter di atas untuk melihat laporan interaktifnya.</p>
            </div>
          ) : !individualData ? (
             <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-700">Data Kosong</h3>
              <p className="text-slate-500 mt-2">Siswa ini belum mengambil tes yang dipilih.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Radar Chart (Individual Profile) */}
              <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                 <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-black text-slate-800">Profil Radar</h3>
                    <p className="text-xs text-slate-500 font-medium">Pemetaan skor per dimensi</p>
                  </div>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={individualData.scores}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} fontSize={8} />
                      <RechartsRadar name={individualData.studentName} dataKey="score" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.6} />
                      <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '11px' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bar Chart (Individual Scores) */}
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-black text-slate-800">Detail Skor</h3>
                    <p className="text-xs text-slate-500 font-medium">Berdasarkan tes tanggal {individualData.date}</p>
                  </div>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={individualData.scores} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#334155', fontWeight: 700 }} width={120} />
                      <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="score" radius={[0, 6, 6, 0]} maxBarSize={30} label={{ position: 'right', fill: '#64748b', fontSize: 10, fontWeight: 'bold' }}>
                        {individualData.scores.map((entry: any, index: number) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Result Interpretation Card */}
                <div className="mt-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="flex items-start gap-3">
                    <Brain className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-800">Interpretasi Singkat</h4>
                      <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                        {individualData.analysis}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        )}
      </motion.div>
    </div>
  );
};
