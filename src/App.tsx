import React, { useState, useEffect } from 'react';
import { auth, db, signInWithGoogle, logout, signInAsGuest } from './firebase';
import { onAuthStateChanged, updateEmail } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, onSnapshot, query, where, addDoc, serverTimestamp, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { UserProfile, TestType, TestResult, ClassInfo, Question, StudentData, TeacherSettings } from './types';
import { TESTS, analyzeResult, getShortResult } from './data/tests';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const handleDownloadPDF = (result: TestResult, teacherSettings: TeacherSettings | null) => {
    const doc = new jsPDF();
    const testTitle = TESTS[result.testType].title;
    const isUmum = result.studentClass.toLowerCase() === 'umum';
    
    let currentY = 15;

    if (!isUmum) {
      // Kop Surat (Official Indonesian Header)
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(teacherSettings?.pemdaName?.toUpperCase() || "PEMERINTAH PROVINSI / KOTA", 105, currentY, { align: 'center' });
      currentY += 7;
      doc.text(teacherSettings?.dinasName?.toUpperCase() || "DINAS PENDIDIKAN", 105, currentY, { align: 'center' });
      currentY += 8;
      doc.setFontSize(14);
      doc.text(teacherSettings?.schoolName?.toUpperCase() || "NAMA SEKOLAH ANDA DISINI", 105, currentY, { align: 'center' });
      currentY += 6;
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(teacherSettings?.schoolAddress || "Alamat Lengkap Sekolah, No. Telp, Website, Email", 105, currentY, { align: 'center' });
      currentY += 4;
      doc.line(20, currentY, 190, currentY);
      currentY += 1;
      doc.line(20, currentY, 190, currentY);
      currentY += 14;
    } else {
      currentY = 25;
    }

    // Header
    doc.setFontSize(16);
    doc.setTextColor(79, 70, 229); // Indigo 600
    doc.setFont("helvetica", "bold");
    doc.text("LAPORAN HASIL TES PSIKOLOGI", 105, currentY, { align: 'center' });
    currentY += 10;
    
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59); // Slate 800
    doc.text(testTitle.toUpperCase(), 105, currentY, { align: 'center' });
    currentY += 15;
    
    // Student Info
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // Slate 500
    doc.setFont("helvetica", "normal");
    doc.text(`Nama Siswa: ${result.studentName}`, 20, currentY);
    currentY += 7;
    doc.text(`NISN: ${result.studentNisn || '-'}`, 20, currentY);
    currentY += 7;
    doc.text(`Kelas: ${result.studentClass || 'Peserta Umum'}`, 20, currentY);
    currentY += 7;
    doc.text(`Tanggal Tes: ${new Date(result.timestamp?.seconds * 1000).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, 20, currentY);
    currentY += 11;
    
    // Scores Visualization
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.setFont("helvetica", "bold");
    doc.text("Visualisasi Hasil:", 20, currentY);
    currentY += 10;

    const chartData = Object.entries(result.scores).map(([name, value]) => ({ 
      name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '), 
      value 
    }));

    const maxScore = Math.max(...chartData.map(d => d.value), 1);
    const chartWidth = 120;
    const barHeight = 6;
    const gap = 4;

    chartData.forEach((d, i) => {
      const barWidth = (d.value / maxScore) * chartWidth;
      
      // Label
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      doc.text(d.name, 20, currentY + 4);
      
      // Bar
      doc.setFillColor(79, 70, 229); // Indigo 600
      doc.rect(70, currentY, barWidth, barHeight, 'F');
      
      // Value
      doc.text(d.value.toString(), 70 + barWidth + 2, currentY + 4);
      
      currentY += barHeight + gap;
    });
    currentY += 5;
    
    // Analysis
    const finalY = currentY + 5;
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.setFont("helvetica", "bold");
    doc.text("Analisis & Rekomendasi:", 20, finalY);
    
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.setFont("helvetica", "normal");
    
    const cleanSummary = result.analysis.replace(/<\/?[^>]+(>|$)/g, "");
    let fullAnalysisText = "";
    if (result.testType === 'anxiety') {
      fullAnalysisText = result.analysis.replace(/\*\*/g, '');
    } else {
      fullAnalysisText = `${cleanSummary} Penjelasan lebih lanjut tentang hasil tes bisa dibaca pada lampiran surat keterangan ini.`;
    }
    const splitAnalysis = doc.splitTextToSize(fullAnalysisText, 170);
    doc.text(splitAnalysis, 20, finalY + 10);

    // Signatures
    const sigY = finalY + 10 + (splitAnalysis.length * 5) + 20;
    const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    
    doc.setFontSize(10);
    doc.text(`Dicetak pada: ${today}`, 20, sigY - 10);
    
    if (!isUmum) {
      doc.text("Mengetahui,", 160, sigY, { align: 'center' });
      doc.text("Guru Bimbingan Konseling,", 160, sigY + 5, { align: 'center' });
      
      doc.setFont("helvetica", "bold");
      doc.text(teacherSettings?.name || "(....................................)", 160, sigY + 30, { align: 'center' });
      doc.setFont("helvetica", "normal");
      doc.text(`NIP. ${teacherSettings?.nip || "...................................."}`, 160, sigY + 35, { align: 'center' });
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`Dicetak melalui PsikoTest - ${new Date().toLocaleString('id-ID')}`, 105, 285, { align: 'center' });
    }
    
    doc.save(`Hasil_${result.testType}_${result.studentName.replace(/\s+/g, '_')}.pdf`);
  };

export const handleDownloadDetailedReport = (student: any, allResults: TestResult[], teacherSettings: TeacherSettings | null) => {
  const doc = new jsPDF();
  const isUmum = student.className?.toLowerCase() === 'umum' || student.role === 'guest';
  
  const studentResults = allResults.filter(r => r.studentId === student.uid || (r.studentName === student.name && r.studentClass === student.className));
  
  const targetTests: TestType[] = [
    'learning_style',
    'multiple_intelligences',
    'personality',
    'aptitude_interest',
    'school_major',
    'anxiety'
  ];

  let currentY = 15;

  if (!isUmum) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(teacherSettings?.pemdaName?.toUpperCase() || "PEMERINTAH PROVINSI / KOTA", 105, currentY, { align: 'center' });
    currentY += 7;
    doc.text(teacherSettings?.dinasName?.toUpperCase() || "DINAS PENDIDIKAN", 105, currentY, { align: 'center' });
    currentY += 8;
    doc.setFontSize(14);
    doc.text(teacherSettings?.schoolName?.toUpperCase() || "NAMA SEKOLAH ANDA DISINI", 105, currentY, { align: 'center' });
    currentY += 6;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(teacherSettings?.schoolAddress || "Alamat Lengkap Sekolah, No. Telp, Website, Email", 105, currentY, { align: 'center' });
    currentY += 4;
    doc.line(20, currentY, 190, currentY);
    currentY += 1;
    doc.line(20, currentY, 190, currentY);
    currentY += 14;
  } else {
    currentY = 25;
  }

  doc.setFontSize(16);
  doc.setTextColor(79, 70, 229);
  doc.setFont("helvetica", "bold");
  doc.text("LAPORAN HASIL TES PSIKOLOGI INDIVIDUAL", 105, currentY, { align: 'center' });
  currentY += 15;
  
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.setFont("helvetica", "normal");
  doc.text(`Nama Siswa: ${student.name}`, 20, currentY);
  currentY += 7;
  doc.text(`NISN: ${student.nisn || '-'}`, 20, currentY);
  currentY += 7;
  doc.text(`Kelas: ${student.className || 'Peserta Umum'}`, 20, currentY);
  currentY += 7;
  doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, 20, currentY);
  currentY += 15;

  const printMarkdown = (text: string) => {
    const lines = text.split('\n');
    for (let line of lines) {
      if (currentY > 270) {
        doc.addPage();
        currentY = 20;
      }
      
      if (line.startsWith('### ')) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(15, 23, 42);
        const textToPrint = line.replace('### ', '');
        const splitText = doc.splitTextToSize(textToPrint, 170);
        doc.text(splitText, 20, currentY);
        currentY += (splitText.length * 6) + 2;
      } else if (line.startsWith('**') && line.endsWith('**')) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(30, 41, 59);
        const textToPrint = line.replace(/\*\*/g, '');
        const splitText = doc.splitTextToSize(textToPrint, 170);
        doc.text(splitText, 20, currentY);
        currentY += (splitText.length * 5) + 1;
      } else if (line.startsWith('- ')) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(71, 85, 105);
        const textToPrint = line.replace('- ', '• ');
        const cleanText = textToPrint.replace(/\*\*/g, '');
        const splitText = doc.splitTextToSize(cleanText, 165);
        doc.text(splitText, 25, currentY);
        currentY += (splitText.length * 5) + 1;
      } else if (line.trim() !== '') {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(71, 85, 105);
        const cleanText = line.replace(/\*\*/g, '');
        const splitText = doc.splitTextToSize(cleanText, 170);
        doc.text(splitText, 20, currentY);
        currentY += (splitText.length * 5) + 1;
      } else {
        currentY += 3;
      }
    }
  };

  targetTests.forEach(testType => {
    const testsOfType = studentResults.filter(t => t.testType === testType).sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
    const latestTest = testsOfType.length > 0 ? testsOfType[0] : null;

    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(5, 150, 105);
    doc.text(TESTS[testType].title.toUpperCase(), 20, currentY);
    currentY += 8;

    if (latestTest) {
      const shortResult = getShortResult(testType, latestTest.scores);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      doc.text(`Hasil Utama: ${shortResult}`, 20, currentY);
      currentY += 8;

      const cleanAnalysis = latestTest.analysis.replace(/<\/?[^>]+(>|$)/g, "").replace(/Penjelasan lebih lanjut tentang hasil tes bisa dibaca pada lampiran surat keterangan ini\./g, '');
      printMarkdown(cleanAnalysis);
      currentY += 10;
    } else {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.setTextColor(148, 163, 184);
      doc.text("Siswa belum mengikuti tes ini.", 20, currentY);
      currentY += 15;
    }
  });

  if (currentY > 220) {
    doc.addPage();
    currentY = 20;
  }

  const sigY = currentY + 20;
  const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.setFont("helvetica", "normal");
  doc.text(`Dicetak pada: ${today}`, 20, sigY - 10);
  
  if (!isUmum) {
    doc.text("Mengetahui,", 160, sigY, { align: 'center' });
    doc.text("Guru Bimbingan Konseling,", 160, sigY + 5, { align: 'center' });
    
    doc.setFont("helvetica", "bold");
    doc.text(teacherSettings?.name || "(....................................)", 160, sigY + 30, { align: 'center' });
    doc.setFont("helvetica", "normal");
    doc.text(`NIP. ${teacherSettings?.nip || "...................................."}`, 160, sigY + 35, { align: 'center' });
  }

  const pageCount = doc.getNumberOfPages();
  for(let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Dicetak melalui PsikoTest - Halaman ${i} dari ${pageCount}`, 105, 285, { align: 'center' });
  }

  doc.save(`Laporan_Detail_${student.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
};

import { 
  LayoutDashboard, 
  ClipboardCheck, 
  LogOut, 
  User as UserIcon, 
  ChevronRight, 
  BarChart3, 
  BookOpen, 
  Brain, 
  Compass, 
  Heart, 
  GraduationCap,
  ArrowLeft,
  CheckCircle2,
  Download,
  Upload,
  Users,
  Search,
  Filter,
  Calendar,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Info,
  AlertCircle,
  Share2,
  FileText,
  Sparkles,
  History,
  Trophy,
  TrendingUp,
  PieChart as PieChartIcon,
  Loader2,
  Monitor,
  UserCircle,
  Eye,
  EyeOff,
  Palette,
  Eraser,
  Undo2,
  Printer
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend
} from 'recharts';
import ReactMarkdown from 'react-markdown';
import { GoogleGenAI, Type } from "@google/genai";

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  // console.error('Firestore Error: ', JSON.stringify(errInfo)); // Removed to reduce console noise
  throw new Error(JSON.stringify(errInfo));
}

const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error' | 'info', onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className={cn(
        "fixed bottom-6 right-6 px-4 py-2 rounded-xl shadow-lg z-[100] flex items-center gap-2 text-sm font-medium",
        type === 'success' ? "bg-emerald-600 text-white" : 
        type === 'error' ? "bg-red-600 text-white" : "bg-emerald-600 text-white"
      )}
    >
      {type === 'success' && <CheckCircle2 className="w-4 h-4" />}
      {type === 'error' && <X className="w-4 h-4" />}
      {message}
    </motion.div>
  );
};

const ConfirmModal = ({ title, message, onConfirm, onCancel }: { title: string, message: string, onConfirm: () => void, onCancel: () => void }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-slate-200"
      >
        <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-sm text-slate-500 mb-6">{message}</p>
        <div className="flex gap-3">
          <button 
            onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50"
          >
            Batal
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white font-bold text-sm hover:bg-red-700"
          >
            Hapus
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// --- Components ---

const Navbar = ({ user, onLogout, onBack, setView, view }: { 
  user: UserProfile | null, 
  onLogout: () => void, 
  onBack?: () => void, 
  setView: (v: any) => void, 
  view: 'dashboard' | 'admin' | 'guide' | 'create-test' 
}) => {
  const isAdminView = view === 'admin' || view === 'create-test';

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="w-full px-6 sm:px-10 lg:px-12">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={onBack}>
            <div className="bg-emerald-600 p-2.5 rounded-xl shadow-lg shadow-emerald-200">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 tracking-tighter leading-none">
                PsikoTest
              </span>
              <img src="https://lh3.googleusercontent.com/d/1UNix_IGpjmt2q0apsIQy-6s3Zr9SnLJ9" alt="Dutatama Logo" className="h-5 w-auto mt-1 opacity-90" referrerPolicy="no-referrer" />
            </div>
          </div>
          
          {user && (
            <div className="flex items-center gap-5">
              {(user.role === 'admin' || user.role === 'teacher' || user.email.toLowerCase() === "purnomowiwit@gmail.com") && (
                <button 
                  onClick={() => setView(isAdminView ? 'dashboard' : 'admin')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl font-black text-sm hover:bg-emerald-100 transition-all shadow-sm border border-emerald-100 cursor-pointer"
                >
                  {isAdminView ? <BookOpen className="w-4 h-4" /> : <LayoutDashboard className="w-4 h-4" />}
                  {isAdminView ? 'MENU SISWA' : 'MENU ADMIN'}
                </button>
              )}
              <div className="hidden sm:flex flex-col items-end">
                <div className="flex items-center gap-2">
                  {user.role === 'admin' && <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-black uppercase rounded-md tracking-tighter">Administrator</span>}
                  {user.role === 'teacher' && <span className="px-2 py-0.5 bg-amber-100 text-amber-600 text-[10px] font-black uppercase rounded-md tracking-tighter">Guru BK</span>}
                  <span className="text-sm font-black text-slate-900">{user.name}</span>
                </div>
                <span className="text-xs text-slate-500 font-medium">{user.email}</span>
              </div>
              <button 
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100 cursor-pointer font-bold text-xs"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">KELUAR APLIKASI</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

const TestCard = ({ test, type, onSelect, recommendation, results }: { test: any, type: TestType, onSelect: (type: TestType) => void, recommendation?: string, results: TestResult[] }) => {
  const icons: Record<TestType, any> = {
    learning_style: BookOpen,
    multiple_intelligences: Brain,
    personality: UserIcon,
    aptitude_interest: Compass,
    school_major: GraduationCap,
    anxiety: Heart,
    iq_wais: Sparkles,
    wartegg: Palette
  };
  const Icon = icons[type];

  const colors = [
    'bg-emerald-500/20', 'bg-blue-500/20', 'bg-amber-500/20', 'bg-rose-500/20', 
    'bg-violet-500/20', 'bg-cyan-500/20', 'bg-orange-500/20', 'bg-fuchsia-500/20'
  ];
  const color = colors[Object.keys(TESTS).indexOf(type) % colors.length];

  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className={`group relative bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-emerald-200 transition-all cursor-pointer overflow-hidden flex flex-col h-full`}
    >
      <div className={`absolute top-0 right-0 p-3 opacity-20 transition-opacity ${color.replace('/20', '')}`} onClick={() => onSelect(type)}>
        <Icon className="w-16 h-16 text-slate-900" />
      </div>
      <div className="relative z-10 flex-1" onClick={() => onSelect(type)}>
        <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center mb-3 transition-colors`}>
          <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-').replace('/20', '')}`} />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1">{test.title}</h3>
        <p className="text-xs text-slate-500 leading-relaxed mb-3">{test.description}</p>
        
        {recommendation && (
          <div className="mb-3 p-2 bg-emerald-50 rounded-lg border border-emerald-100 flex items-start gap-1.5">
            <Info className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
            <p className="text-[10px] text-emerald-700 font-medium leading-tight">
              Rekomendasi: {recommendation}
            </p>
          </div>
        )}
      </div>

      <div className="relative z-10 mt-auto pt-4 border-t border-slate-100">
        {results.length > 0 ? (
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Riwayat Tes ({results.length})</p>
            <div className="flex flex-wrap gap-1">
              {results.slice(-3).map((r, i) => (
                <span key={i} className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-bold">
                  {new Date(r.timestamp?.seconds * 1000).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                </span>
              ))}
            </div>
            <button 
              onClick={() => onSelect(type)}
              className="w-full mt-2 py-2 bg-emerald-600 text-white rounded-lg font-bold text-xs hover:bg-emerald-700 transition-all"
            >
              Ulangi Tes
            </button>
          </div>
        ) : (
          <div className="flex items-center text-emerald-600 font-semibold text-xs" onClick={() => onSelect(type)}>
            Mulai Tes <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        )}
      </div>
    </motion.div>
  );
};

const WarteggCanvas = ({ index, onSave, initialData }: { index: number, onSave: (data: string) => void, initialData?: string }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const drawStimulus = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.setLineDash([]);
    ctx.fillStyle = '#000';

    switch (index) {
      case 0: // Point in center
        ctx.beginPath(); ctx.arc(150, 150, 3, 0, Math.PI * 2); ctx.fill();
        break;
      case 1: // Curved line
        ctx.beginPath(); ctx.moveTo(60, 60); ctx.quadraticCurveTo(90, 30, 120, 60); ctx.stroke();
        break;
      case 2: // Three vertical lines
        ctx.beginPath();
        ctx.moveTo(210, 240); ctx.lineTo(210, 210);
        ctx.moveTo(225, 240); ctx.lineTo(225, 195);
        ctx.moveTo(240, 240); ctx.lineTo(240, 180);
        ctx.stroke();
        break;
      case 3: // Small black square
        ctx.fillRect(240, 60, 15, 15);
        break;
      case 4: // Two slanting lines
        ctx.beginPath();
        ctx.moveTo(60, 210); ctx.lineTo(90, 240);
        ctx.moveTo(60, 240); ctx.lineTo(90, 210);
        ctx.stroke();
        break;
      case 5: // Horizontal and vertical lines
        ctx.beginPath();
        ctx.moveTo(150, 60); ctx.lineTo(150, 120);
        ctx.moveTo(180, 90); ctx.lineTo(240, 90);
        ctx.stroke();
        break;
      case 6: // Dotted curve
        ctx.setLineDash([3, 6]); ctx.beginPath(); ctx.arc(240, 210, 30, Math.PI, Math.PI * 1.5); ctx.stroke(); ctx.setLineDash([]);
        break;
      case 7: // Large curve
        ctx.beginPath(); ctx.arc(150, 240, 60, Math.PI, 0); ctx.stroke();
        break;
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 300;
    canvas.height = 300;

    if (initialData) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = initialData;
    } else {
      drawStimulus(ctx);
    }
  }, [index, initialData]);

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const data = canvas.toDataURL();
      setHistory(prev => [...prev, data]);
      onSave(data);
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = (('touches' in e) ? e.touches[0].clientX : (e as React.MouseEvent).clientX) - rect.left;
    const y = (('touches' in e) ? e.touches[0].clientY : (e as React.MouseEvent).clientY) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    
    // Save state before drawing
    const data = canvas.toDataURL();
    if (history.length === 0 || history[history.length - 1] !== data) {
      setHistory(prev => [...prev, data]);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = (('touches' in e) ? e.touches[0].clientX : (e as React.MouseEvent).clientX) - rect.left;
    const y = (('touches' in e) ? e.touches[0].clientY : (e as React.MouseEvent).clientY) - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveToHistory();
    }
  };

  const undo = () => {
    if (history.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newHistory = [...history];
    const lastState = newHistory.pop();
    setHistory(newHistory);

    if (lastState) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        onSave(canvas.toDataURL());
      };
      img.src = lastState;
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Save current to history before clearing
    setHistory(prev => [...prev, canvas.toDataURL()]);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawStimulus(ctx);
    onSave('');
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative bg-white p-2 rounded-2xl shadow-xl border-4 border-slate-100 group">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="bg-white cursor-crosshair touch-none rounded-lg"
          style={{ width: '100%', maxWidth: '400px', aspectRatio: '1/1' }}
        />
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button 
            onClick={undo} 
            disabled={history.length === 0}
            className="p-3 bg-white/90 rounded-xl shadow-lg text-slate-600 hover:text-emerald-600 disabled:opacity-50 transition-all border border-slate-100"
            title="Urungkan (Undo)"
          >
            <Undo2 className="w-5 h-5" />
          </button>
          <button 
            onClick={clear} 
            className="p-3 bg-white/90 rounded-xl shadow-lg text-slate-600 hover:text-red-500 transition-all border border-slate-100"
            title="Bersihkan (Clear)"
          >
            <Eraser className="w-5 h-5" />
          </button>
        </div>
        <div className="absolute bottom-4 left-4 bg-slate-900/80 text-white text-xs px-3 py-1.5 rounded-full font-black tracking-widest uppercase">
          Kotak {index + 1}
        </div>
      </div>
    </div>
  );
};

const WarteggTest = ({ onComplete }: { onComplete: (scores: Record<string, number>) => void }) => {
  const [drawings, setDrawings] = useState<Record<number, string>>({});
  const [titles, setTitles] = useState<Record<number, string>>({});
  const [step, setStep] = useState<'drawing' | 'titles'>('drawing');
  const [currentBox, setCurrentBox] = useState(0);

  const handleSaveDrawing = (index: number, data: string) => {
    setDrawings(prev => ({ ...prev, [index]: data }));
  };

  const isAllDrawn = Object.keys(drawings).filter(k => drawings[parseInt(k)] !== '').length === 8;

  if (step === 'titles') {
    return (
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="bg-emerald-500 p-6 rounded-3xl text-white shadow-lg shadow-emerald-100">
          <h4 className="font-black text-xl mb-1">Langkah Terakhir</h4>
          <p className="text-emerald-50 text-sm opacity-90 font-medium">Berikan judul yang menarik untuk setiap mahakarya yang telah Anda buat.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(8)].map((_, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={i} 
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex gap-6 items-center"
            >
              <div className="w-24 h-24 shrink-0 bg-slate-50 rounded-2xl border-2 border-slate-100 overflow-hidden flex items-center justify-center">
                {drawings[i] ? (
                  <img src={drawings[i]} className="w-full h-full object-contain" />
                ) : (
                  <Palette className="w-8 h-8 text-slate-200" />
                )}
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Gambar {i + 1}</label>
                <input
                  type="text"
                  value={titles[i] || ''}
                  onChange={(e) => setTitles(prev => ({ ...prev, [i]: e.target.value }))}
                  placeholder="Beri judul gambar..."
                  className="w-full px-4 py-3 text-sm border-2 border-slate-100 rounded-xl focus:border-emerald-500 outline-none transition-all font-bold text-slate-700"
                />
              </div>
            </motion.div>
          ))}
        </div>
        <button
          onClick={() => onComplete({})}
          disabled={Object.keys(titles).length < 8 || Object.values(titles).some(t => !t.trim())}
          className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-3xl font-black shadow-xl shadow-emerald-100 transition-all text-lg tracking-tight"
        >
          SELESAIKAN DAN KIRIM HASIL
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
            <Palette className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Tes Wartegg</h3>
            <p className="text-slate-500 text-sm font-medium">Selesaikan stimulus di bawah ini menjadi gambar yang bermakna.</p>
          </div>
        </div>
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <p className="text-sm text-slate-600 leading-relaxed font-medium italic">
            "Gunakan imajinasi Anda sebebas mungkin. Tidak ada benar atau salah dalam menggambar. Mulailah dari kotak mana pun yang Anda sukai."
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 items-start">
        {/* Main Drawing Area */}
        <div className="flex-1 w-full space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentBox}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="w-full"
            >
              <WarteggCanvas 
                index={currentBox} 
                onSave={(data) => handleSaveDrawing(currentBox, data)} 
                initialData={drawings[currentBox]}
              />
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <button
              onClick={() => setCurrentBox(prev => Math.max(0, prev - 1))}
              disabled={currentBox === 0}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 rounded-xl font-black transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" /> SEBELUMNYA
            </button>
            <div className="flex gap-2">
              {[...Array(8)].map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "w-2.5 h-2.5 rounded-full transition-all duration-300",
                    currentBox === i ? "bg-emerald-500 w-8" : drawings[i] ? "bg-emerald-200" : "bg-slate-200"
                  )}
                />
              ))}
            </div>
            <button
              onClick={() => setCurrentBox(prev => Math.min(7, prev + 1))}
              disabled={currentBox === 7}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-30 text-white rounded-xl font-black transition-all flex items-center gap-2"
            >
              SELANJUTNYA <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sidebar Overview */}
        <div className="w-full lg:w-72 space-y-4">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Daftar Kotak</h4>
          <div className="grid grid-cols-4 lg:grid-cols-2 gap-3">
            {[...Array(8)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentBox(i)}
                className={cn(
                  "relative aspect-square rounded-2xl border-2 transition-all overflow-hidden group",
                  currentBox === i 
                    ? "border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-100" 
                    : drawings[i] 
                      ? "border-emerald-200 bg-white" 
                      : "border-slate-100 bg-white hover:border-slate-300"
                )}
              >
                {drawings[i] ? (
                  <img src={drawings[i]} className="w-full h-full object-contain p-1" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 font-black text-xl">
                    {i + 1}
                  </div>
                )}
                {drawings[i] && (
                  <div className="absolute top-1 right-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
          
          <div className="pt-6">
            <button
              onClick={() => setStep('titles')}
              disabled={!isAllDrawn}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-2xl font-black shadow-xl shadow-emerald-100 transition-all flex items-center justify-center gap-2"
            >
              LANJUT KE PENAMAAN <ChevronRight className="w-5 h-5" />
            </button>
            {!isAllDrawn && (
              <p className="text-[10px] text-slate-400 text-center mt-3 font-bold italic uppercase tracking-tighter">
                Selesaikan semua kotak untuk melanjutkan
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const TestForm = ({ type, customTest, onComplete, onCancel, isAnalyzingTest }: { type: TestType, customTest?: any, onComplete: (scores: Record<string, number>) => void, onCancel: () => void, isAnalyzingTest?: boolean }) => {
  const test = customTest || TESTS[type];
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [scores, setScores] = useState<Record<string, number>>({});
  const [history, setHistory] = useState<{questionId: string, value: string, score: number}[]>([]);

  const handleAnswer = (questionId: string, value: string, score: number = 1) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    setScores(prev => ({ ...prev, [value]: (prev[value] || 0) + score }));
    setHistory(prev => [...prev, { questionId, value, score }]);
    
    if (currentIdx < test.questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      // Finalize
      const finalScores = { ...scores, [value]: (scores[value] || 0) + score };
      onComplete(finalScores);
    }
  };

  const handleBack = () => {
    if (currentIdx > 0) {
      const lastAnswer = history[history.length - 1];
      setScores(prev => ({ ...prev, [lastAnswer.value]: prev[lastAnswer.value] - lastAnswer.score }));
      setHistory(prev => prev.slice(0, -1));
      setCurrentIdx(currentIdx - 1);
    }
  };

  const progress = ((currentIdx + 1) / test.questions.length) * 100;

  if (isAnalyzingTest) {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden flex flex-col items-center justify-center p-12 min-h-[400px]">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="mb-6">
          <Brain className="w-16 h-16 text-emerald-500" />
        </motion.div>
        <h3 className="text-xl font-black text-slate-900 mb-2 text-center">Menganalisis Hasil Tes...</h3>
        <p className="text-slate-500 text-center max-w-sm">
          AI sedang memproses jawaban Anda untuk memberikan rekomendasi yang dipersonalisasi. Mohon tunggu sebentar.
        </p>
      </div>
    );
  }

  const colors = [
    'bg-emerald-500/20', 'bg-blue-500/20', 'bg-amber-500/20', 'bg-rose-500/20', 
    'bg-violet-500/20', 'bg-cyan-500/20', 'bg-orange-500/20', 'bg-fuchsia-500/20'
  ];
  const color = colors[Object.keys(TESTS).indexOf(type) % colors.length];

  return (
    <div className="max-w-xl mx-auto py-6 px-4">
      <button onClick={onCancel} className="flex items-center text-emerald-600 border border-emerald-500 hover:bg-emerald-50 px-4 py-2 rounded-xl mb-6 text-sm font-bold transition-colors w-fit">
        <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
      </button>

      {/* Progress Indicator */}
      <div className={`mb-6 p-4 rounded-2xl shadow-sm flex items-center gap-4 ${color}`}>
        <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-black/10"
              strokeWidth="3"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className={`${color.replace('bg-', 'text-').replace('/20', '')} transition-all duration-500 ease-out`}
              strokeDasharray={`${(currentIdx / test.questions.length) * 100}, 100`}
              strokeWidth="3"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <span className={`absolute text-xs font-black ${color.replace('bg-', 'text-').replace('/20', '')}`}>{Math.round((currentIdx / test.questions.length) * 100)}%</span>
        </div>
        <div className="flex-1">
          <h4 className={`text-sm font-bold ${color.replace('bg-', 'text-').replace('/20', '')} mb-1`}>Progres Pengerjaan</h4>
          <p className={`text-xs ${color.replace('bg-', 'text-').replace('/20', '')}/90 font-medium`}>Telah menyelesaikan <span className="font-bold">{currentIdx}</span> dari <span className="font-bold">{test.questions.length}</span> pertanyaan.</p>
        </div>
      </div>

      <div className={`rounded-2xl shadow-lg border border-slate-100 overflow-hidden ${color}`}>
        <div className="p-6 sm:p-8">
          {type === 'wartegg' ? (
            <WarteggTest onComplete={onComplete} />
          ) : (
            <>
              <span className={`text-[10px] font-bold ${color.replace('bg-', 'text-').replace('/20', '')} uppercase tracking-widest mb-3 block`}>
                Pertanyaan {currentIdx + 1}
              </span>
              <h2 className={`text-xl font-bold ${color.replace('bg-', 'text-').replace('/20', '')} mb-6 leading-tight`}>
                {test.questions[currentIdx].text}
              </h2>

              <div className="space-y-3">
                {test.questions[currentIdx].options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(test.questions[currentIdx].id, opt.value, opt.score)}
                    className={`w-full text-left p-4 rounded-xl border-2 border-white bg-white/10 hover:bg-white/30 transition-all group flex items-center justify-between ${color.replace('bg-', 'text-').replace('/20', '')}`}
                  >
                    <span className="text-sm text-slate-900 font-bold group-hover:text-slate-950">{opt.text}</span>
                    <div className="w-5 h-5 rounded-full border-2 border-white/50 group-hover:border-white flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))}
              </div>

              {currentIdx > 0 && (
                <div className="mt-6 flex justify-start">
                  <button 
                    onClick={handleBack}
                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> KEMBALI
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const ResultView = ({ result, onBack, showToast, teacherSettings }: { result: TestResult, onBack: () => void, showToast: (m: string, t?: 'success' | 'error' | 'info') => void, teacherSettings: TeacherSettings | null }) => {
  const [aiExplanation, setAiExplanation] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const chartData = Object.entries(result.scores).map(([name, value]) => ({ 
    name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '), 
    value 
  }));

  const sortedData = [...chartData].sort((a, b) => b.value - a.value);
  const group1 = ['learning_style', 'school_major', 'anxiety'];
  const group2 = ['multiple_intelligences', 'personality', 'aptitude_interest'];

  let summaryText = "";
  if (sortedData.length > 0) {
    if (group1.includes(result.testType)) {
      summaryText = `Dari hasil tes di atas anda cenderung memiliki tipe <strong>${sortedData[0].name}</strong>.`;
    } else {
      const top3 = sortedData.slice(0, 3).map(d => d.name).join(', ');
      summaryText = `Dari hasil tes di atas anda cenderung memiliki tipe <strong>${top3}</strong>.`;
    }
  }
  
  const COLORS = ['#059669', '#10b981', '#0d9488', '#14b8a6', '#16a34a', '#22c55e', '#65a30d', '#84cc16'];

  const renderChart = () => {
    switch (result.testType) {
      case 'learning_style':
        return (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );
      
      case 'multiple_intelligences':
        return (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" />
                <PolarRadiusAxis />
                <Radar
                  name="Skor"
                  dataKey="value"
                  stroke="#4f46e5"
                  fill="#4f46e5"
                  fillOpacity={0.6}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        );

      case 'anxiety':
        const totalScore = result.scores['anxiety'] || 0;
        const maxPossible = 90; // 30 questions * 3 max score
        const percentage = (totalScore / maxPossible) * 100;
        const gaugeData = [
          { name: 'Kecemasan', value: totalScore, fill: totalScore > 45 ? '#ef4444' : totalScore > 15 ? '#f59e0b' : '#10b981' },
          { name: 'Sisa', value: maxPossible - totalScore, fill: '#f1f5f9' }
        ];

        return (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={gaugeData}
                    cx="50%"
                    cy="50%"
                    startAngle={180}
                    endAngle={0}
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={0}
                    dataKey="value"
                  >
                    {gaugeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center -mt-20">
              <span className="text-4xl font-black text-slate-900">{totalScore}</span>
              <span className="text-slate-400 font-bold ml-1">/ {maxPossible}</span>
              <p className={cn(
                "text-sm font-bold mt-2 px-4 py-1 rounded-full inline-block",
                totalScore > 45 ? "bg-red-100 text-red-600" : totalScore > 15 ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"
              )}>
                {totalScore > 45 ? "Tinggi" : totalScore > 15 ? "Sedang" : "Rendah"}
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="value" fill="#4f46e5" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
    }
  };

  const handleShare = async () => {
    const testTitle = TESTS[result.testType].title;
    const summary = `Hasil ${testTitle} - ${result.studentName} (${result.studentClass || 'Umum'})\n\n${result.analysis.substring(0, 200)}...\n\nLihat selengkapnya di PsikoTest.`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Hasil ${testTitle}`,
          text: summary,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(summary);
        showToast('Ringkasan hasil telah disalin ke papan klip!', 'success');
      } catch (err) {
        console.error('Error copying to clipboard:', err);
      }
    }
  };

  const handleAIExplanation = async () => {
    setIsGeneratingAI(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Berdasarkan hasil tes psikologi berikut:
Jenis Tes: ${TESTS[result.testType]?.title || result.testType}
Skor: ${JSON.stringify(result.scores)}
Analisis Awal: ${result.analysis}

Berikan penjelasan yang lebih mendalam, personal, dan memotivasi untuk siswa ini. Jelaskan apa arti skor tersebut dalam kehidupan sehari-hari atau belajar, dan berikan saran praktis yang bisa langsung diterapkan. Gunakan bahasa Indonesia yang ramah, mudah dipahami, dan format Markdown yang rapi.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setAiExplanation(response.text || '');
      showToast('Analisa AI berhasil dibuat!', 'success');
    } catch (error) {
      console.error("AI Explanation Error:", error);
      showToast("Gagal mendapatkan analisa AI. Silakan coba lagi.", 'error');
    } finally {
      setIsGeneratingAI(false);
    }
  };



  const handleDownloadAIExplanation = () => {
    if (!aiExplanation) return;
    
    const doc = new jsPDF();
    const testTitle = TESTS[result.testType].title;
    const isUmum = result.studentClass.toLowerCase() === 'umum';
    
    let currentY = 15;

    if (!isUmum) {
      // Kop Surat (Official Indonesian Header)
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(teacherSettings?.pemdaName?.toUpperCase() || "PEMERINTAH PROVINSI / KOTA", 105, currentY, { align: 'center' });
      currentY += 7;
      doc.text(teacherSettings?.dinasName?.toUpperCase() || "DINAS PENDIDIKAN", 105, currentY, { align: 'center' });
      currentY += 8;
      doc.setFontSize(14);
      doc.text(teacherSettings?.schoolName?.toUpperCase() || "NAMA SEKOLAH ANDA DISINI", 105, currentY, { align: 'center' });
      currentY += 6;
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(teacherSettings?.schoolAddress || "Alamat Lengkap Sekolah, No. Telp, Website, Email", 105, currentY, { align: 'center' });
      currentY += 4;
      doc.line(20, currentY, 190, currentY);
      currentY += 1;
      doc.line(20, currentY, 190, currentY);
      currentY += 14;
    } else {
      currentY = 25;
    }

    // Header
    doc.setFontSize(16);
    doc.setTextColor(79, 70, 229); // Indigo 600
    doc.setFont("helvetica", "bold");
    doc.text("LAMPIRAN ANALISA MENDALAM (AI)", 105, currentY, { align: 'center' });
    currentY += 10;
    
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59); // Slate 800
    doc.text(testTitle.toUpperCase(), 105, currentY, { align: 'center' });
    currentY += 15;
    
    // Student Info
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // Slate 500
    doc.setFont("helvetica", "normal");
    doc.text(`Nama Siswa: ${result.studentName}`, 20, currentY);
    currentY += 7;
    doc.text(`Kelas: ${result.studentClass || 'Peserta Umum'}`, 20, currentY);
    currentY += 7;
    doc.text(`Tanggal Tes: ${new Date(result.timestamp?.seconds * 1000).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, 20, currentY);
    currentY += 16;
    
    // AI Explanation
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.setFont("helvetica", "bold");
    doc.text("Analisa & Rekomendasi AI:", 20, currentY);
    currentY += 10;
    
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.setFont("helvetica", "normal");
    
    // Clean up markdown for PDF text
    let cleanText = aiExplanation
      .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
      .replace(/\*(.*?)\*/g, '$1') // Italic
      .replace(/#(.*?)\n/g, '$1\n') // Headers
      .replace(/-/g, '•'); // Lists

    const splitExplanation = doc.splitTextToSize(cleanText, 170);
    
    // Handle pagination if text is too long
    for (let i = 0; i < splitExplanation.length; i++) {
      if (currentY > 270) {
        doc.addPage();
        currentY = 20;
      }
      doc.text(splitExplanation[i], 20, currentY);
      currentY += 5;
    }
    
    // Signatures
    let sigY = currentY + 20;
    if (sigY > 250) {
      doc.addPage();
      sigY = 40;
    }
    
    const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    
    doc.setFontSize(10);
    doc.text(`Dicetak pada: ${today}`, 20, sigY - 10);
    
    if (!isUmum) {
      doc.text("Mengetahui,", 160, sigY, { align: 'center' });
      doc.text("Guru Bimbingan Konseling,", 160, sigY + 5, { align: 'center' });
      
      doc.setFont("helvetica", "bold");
      doc.text(teacherSettings?.name || "(....................................)", 160, sigY + 30, { align: 'center' });
      doc.setFont("helvetica", "normal");
      doc.text(`NIP. ${teacherSettings?.nip || "...................................."}`, 160, sigY + 35, { align: 'center' });
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`Dicetak melalui PsikoTest - ${new Date().toLocaleString('id-ID')}`, 105, 285, { align: 'center' });
    }
    
    doc.save(`Analisa_AI_${result.testType}_${result.studentName.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-emerald-600 p-8 text-center text-white">
          <div className="inline-flex p-3 bg-white/20 rounded-full mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-1">Tes Selesai!</h2>
          <p className="text-xs text-emerald-100">Berikut adalah hasil analisis psikologi Anda.</p>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          <section className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Nama Siswa</p>
              <h4 className="text-sm font-black text-slate-900">{result.studentName}</h4>
            </div>
            <div>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">NISN / Asal Sekolah</p>
              <h4 className="text-sm font-black text-slate-900">{result.studentNisn || '-'}</h4>
            </div>
            <div>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Kelas / Jenjang</p>
              <h4 className="text-sm font-black text-slate-900">{result.studentClass || 'Umum'}</h4>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" /> Visualisasi Hasil
            </h3>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              {renderChart()}
            </div>
          </section>

          <section className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <h3 className="text-lg font-bold text-slate-900">Analisis Hasil</h3>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleDownloadPDF(result, teacherSettings)}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-200 transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  UNDUH LAPORAN
                </button>
                <button 
                  onClick={handleAIExplanation}
                  disabled={isGeneratingAI}
                  className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-200 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isGeneratingAI ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                      <Brain className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <Brain className="w-4 h-4" />
                  )}
                  ANALISA AI
                </button>
              </div>
            </div>
            <div className="mb-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-sm text-emerald-800">
              <p dangerouslySetInnerHTML={{ __html: summaryText }} />
            </div>
            <div className="prose prose-sm prose-emerald max-w-none text-slate-600">
              <ReactMarkdown>{result.analysis}</ReactMarkdown>
            </div>

            <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100">
              <p className="text-xs text-amber-800 leading-relaxed">
                <span className="font-bold">Catatan :</span> Untuk penjelasan lebih mendalam tentang hasil tes Anda, silakan tekan tombol "ANALISA AI" di sebelah kanan tombol "UNDUH LAPORAN".
              </p>
            </div>
            
            <AnimatePresence>
              {aiExplanation && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-5 bg-white rounded-xl border border-emerald-100 shadow-sm">
                    <h4 className="font-bold text-emerald-600 mb-3 flex items-center gap-2">
                      <Brain className="w-4 h-4" /> Analisa Mendalam (AI)
                    </h4>
                    <div className="prose prose-sm prose-emerald max-w-none text-slate-700">
                      <ReactMarkdown>{aiExplanation}</ReactMarkdown>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          <div className="flex flex-row flex-wrap sm:flex-nowrap gap-2 pt-4">
            <button 
              onClick={onBack}
              className="flex-1 bg-emerald-600 text-white py-2.5 px-2 rounded-lg font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 text-xs sm:text-sm whitespace-nowrap uppercase"
            >
              Kembali Ke Menu
            </button>
            <button 
              onClick={handleShare}
              className="flex-1 bg-white text-emerald-600 border border-emerald-100 py-2.5 px-2 rounded-lg font-bold hover:bg-emerald-50 transition-colors flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap"
            >
              <Share2 className="w-4 h-4" /> Bagikan
            </button>
            <button 
              onClick={() => handleDownloadPDF(result, teacherSettings)}
              className="flex-1 bg-emerald-600 text-white py-2.5 px-2 rounded-lg font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1 sm:gap-2 shadow-lg shadow-emerald-100 text-xs sm:text-sm whitespace-nowrap"
            >
              <Download className="w-4 h-4" /> DOWNLOAD LAPORAN
            </button>
            {aiExplanation && (
              <button 
                onClick={handleDownloadAIExplanation}
                className="flex-1 bg-teal-600 text-white py-2.5 px-2 rounded-lg font-bold hover:bg-teal-700 transition-colors flex items-center justify-center gap-1 sm:gap-2 shadow-lg shadow-teal-100 text-xs sm:text-sm whitespace-nowrap"
              >
                <Download className="w-4 h-4" /> Analisa AI
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const TestCreator = ({ onBack, showToast }: { onBack: () => void, showToast: (m: string, t?: 'success' | 'error' | 'info') => void }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [testCategory, setTestCategory] = useState('');
  const [questions, setQuestions] = useState<Question[]>([
    { id: 'q1', text: '', options: [{ text: '', value: '', score: 1 }] }
  ]);
  const [aiCount, setAiCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAIAnalyze = async () => {
    if (!title || !description) {
      showToast('Mohon isi Judul dan Deskripsi tes terlebih dahulu.', 'info');
      return;
    }

    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Berdasarkan judul tes "${title}" dan deskripsi "${description}", berikan ringkasan rekomendasi atau panduan interpretasi hasil untuk tes psikologi ini. 
        Berikan saran apa yang harus dilakukan siswa jika mendapatkan skor tinggi atau rendah.
        Gunakan format Markdown yang rapi.`,
      });

      setAiRecommendation(response.text || '');
    } catch (error) {
      console.error("AI Analysis Error:", error);
      showToast("Gagal menganalisis dengan AI. Silakan coba lagi.", 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAIGenerate = async () => {
    if (!title || !description) {
      showToast('Mohon isi Judul dan Deskripsi tes terlebih dahulu agar AI memiliki konteks.', 'info');
      return;
    }

    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Buatkan ${aiCount} pertanyaan psikologi untuk tes dengan judul "${title}" dan deskripsi "${description}". 
        Setiap pertanyaan harus memiliki minimal 2 opsi jawaban dengan skor yang relevan.
        Berikan jawaban dalam format JSON.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING, description: "Teks pertanyaan" },
                options: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      text: { type: Type.STRING, description: "Teks opsi jawaban" },
                      value: { type: Type.STRING, description: "Nilai kategori (slug)" },
                      score: { type: Type.NUMBER, description: "Skor untuk opsi ini" }
                    },
                    required: ["text", "value", "score"]
                  }
                }
              },
              required: ["text", "options"]
            }
          }
        }
      });

      const generatedQuestions = JSON.parse(response.text || '[]');
      const formattedQuestions = generatedQuestions.map((q: any, idx: number) => ({
        ...q,
        id: `ai_q${questions.length + idx + 1}`
      }));

      // Remove the initial empty question if it's the only one and empty
      const currentQuestions = (questions.length === 1 && !questions[0].text) ? [] : questions;
      setQuestions([...currentQuestions, ...formattedQuestions]);
      showToast(`${aiCount} pertanyaan berhasil dibuat oleh AI!`, 'success');
    } catch (error) {
      console.error("AI Generation Error:", error);
      showToast("Gagal membuat pertanyaan dengan AI. Silakan coba lagi.", 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, { 
      id: `q${questions.length + 1}`, 
      text: '', 
      options: [{ text: '', value: '', score: 1 }] 
    }]);
  };

  const addOption = (qIdx: number) => {
    const newQuestions = [...questions];
    newQuestions[qIdx].options.push({ text: '', value: '', score: 1 });
    setQuestions(newQuestions);
  };

  const handleSave = async () => {
    if (!title || !description || questions.some(q => !q.text)) {
      showToast('Mohon lengkapi semua data tes.', 'info');
      return;
    }

    try {
      await addDoc(collection(db, 'custom_tests'), {
        title,
        description,
        testType: testCategory || 'custom',
        questions,
        aiRecommendation,
        createdAt: serverTimestamp(),
        isActive: true
      });
      
      await addDoc(collection(db, 'notifications'), {
        userId: 'all',
        title: 'Tes Baru Tersedia!',
        message: `Tes baru "${title}" telah tersedia. Silakan cek dan kerjakan tes tersebut.`,
        type: 'info',
        read: false,
        timestamp: serverTimestamp()
      });

      showToast('Tes psikologi baru berhasil dibuat!', 'success');
      onBack();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'custom_tests');
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 space-y-6">
      <button onClick={onBack} className="flex items-center text-emerald-600 border border-emerald-500 hover:bg-emerald-50 px-4 py-2 rounded-xl mb-6 text-sm font-bold transition-colors w-fit">
        <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
      </button>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
        <div className="bg-emerald-600 p-6 text-white">
          <h2 className="text-xl font-bold">Buat Tes Psikologi Baru</h2>
          <p className="text-xs text-emerald-100">Rancang instrumen asesmen Anda sendiri.</p>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Judul Tes</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Tes Minat Karir Digital"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-600 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Jenis / Kategori Tes</label>
              <input 
                type="text" 
                value={testCategory}
                onChange={(e) => setTestCategory(e.target.value)}
                placeholder="Contoh: Kepribadian, Minat Bakat, dll"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-600 outline-none text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Deskripsi</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Jelaskan tujuan tes ini..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-600 outline-none h-20 text-sm"
              />
            </div>
          </div>

          <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-600">
                <Brain className="w-5 h-5" />
                <h4 className="font-bold">Bantuan AI</h4>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleAIAnalyze}
                  disabled={isAnalyzing}
                  className="px-3 py-1.5 bg-white text-emerald-600 rounded-lg text-xs font-bold border border-emerald-200 hover:bg-emerald-50 transition-all flex items-center gap-1 disabled:opacity-50"
                >
                  {isAnalyzing ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}><Brain className="w-3 h-3" /></motion.div> : <Info className="w-3 h-3" />}
                  Analisis Rekomendasi
                </button>
              </div>
            </div>
            
            <p className="text-sm text-emerald-700">Gunakan AI untuk menganalisis tes dan membuat draf pertanyaan secara otomatis.</p>
            
            {aiRecommendation && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-white rounded-xl border border-emerald-100 text-sm text-slate-600 prose prose-sm prose-emerald max-w-none"
              >
                <h5 className="font-bold text-emerald-600 mb-2 flex items-center gap-1">
                  <Info className="w-3 h-3" /> Ringkasan Rekomendasi AI:
                </h5>
                <ReactMarkdown>{aiRecommendation}</ReactMarkdown>
              </motion.div>
            )}

            <div className="space-y-4 pt-2 border-t border-emerald-100">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-emerald-600 uppercase">Jumlah Pertanyaan</label>
                  <span className="text-sm font-bold text-emerald-600 bg-white px-2 py-0.5 rounded-lg border border-emerald-100">{aiCount}</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="20"
                  value={aiCount}
                  onChange={(e) => setAiCount(parseInt(e.target.value))}
                  className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-[10px] text-emerald-400 font-bold uppercase">
                  <span>1 Soal</span>
                  <span>20 Soal</span>
                </div>
              </div>
              <button 
                onClick={handleAIGenerate}
                disabled={isGenerating}
                className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-emerald-100"
              >
                {isGenerating ? (
                  <>
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    >
                      <Brain className="w-4 h-4" />
                    </motion.div>
                    Sedang Membuat...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4" />
                    Buat {aiCount} Pertanyaan dengan AI
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-emerald-600" /> Daftar Pertanyaan
              </h3>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    const data = [
                      ["Pertanyaan", "Opsi 1", "Opsi 2", "Skor"],
                      ["Contoh: Apakah Anda suka bekerja dengan angka?", "Ya", "Tidak", "1"]
                    ];
                    const ws = XLSX.utils.aoa_to_sheet(data);
                    const wb = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(wb, ws, "Template");
                    XLSX.writeFile(wb, "Template_Pertanyaan_PsikoTest.xlsx");
                  }}
                  className="px-3 py-1.5 bg-white text-emerald-600 rounded-lg text-[10px] font-black border border-emerald-200 hover:bg-emerald-50 transition-all flex items-center gap-1 shadow-sm"
                >
                  <Download className="w-3 h-3" /> TEMPLATE
                </button>
                <div className="relative">
                  <input 
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (evt) => {
                        const bstr = evt.target?.result;
                        const wb = XLSX.read(bstr, { type: 'binary' });
                        const wsname = wb.SheetNames[0];
                        const ws = wb.Sheets[wsname];
                        const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
                        const newQuestions: Question[] = data.slice(1).map((row, idx) => ({
                          id: `q-${Date.now()}-${idx}`,
                          text: row[0] || '',
                          options: [
                            { text: row[1] || 'Ya', value: 'opsi_1', score: parseInt(row[3]) || 1 },
                            { text: row[2] || 'Tidak', value: 'opsi_2', score: 0 }
                          ]
                        })).filter(q => q.text);
                        if (newQuestions.length > 0) {
                          setQuestions([...questions, ...newQuestions]);
                          showToast(`${newQuestions.length} pertanyaan berhasil diimpor!`, 'success');
                        } else {
                          showToast('Format file tidak sesuai atau tidak ada data.', 'error');
                        }
                      };
                      reader.readAsBinaryString(file);
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <button className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-black hover:bg-emerald-700 transition-all flex items-center gap-1 shadow-sm">
                    <Upload className="w-3 h-3" /> UPLOAD TEMPLATE
                  </button>
                </div>
              </div>
            </div>
            
            {questions.map((q, qIdx) => (
              <div key={qIdx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase">Pertanyaan {qIdx + 1}</span>
                </div>
                <input 
                  type="text"
                  value={q.text}
                  onChange={(e) => {
                    const newQs = [...questions];
                    newQs[qIdx].text = e.target.value;
                    setQuestions(newQs);
                  }}
                  placeholder="Masukkan teks pertanyaan..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-600 outline-none text-sm"
                />

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Opsi & Skor</label>
                  {q.options.map((opt, oIdx) => (
                    <div key={oIdx} className="flex gap-2">
                      <input 
                        type="text"
                        value={opt.text}
                        onChange={(e) => {
                          const newQs = [...questions];
                          newQs[qIdx].options[oIdx].text = e.target.value;
                          newQs[qIdx].options[oIdx].value = e.target.value.toLowerCase().replace(/\s+/g, '_');
                          setQuestions(newQs);
                        }}
                        placeholder="Teks Opsi"
                        className="flex-1 px-3 py-1.5 rounded-md border border-slate-200 outline-none text-xs"
                      />
                      <input 
                        type="number"
                        value={opt.score}
                        onChange={(e) => {
                          const newQs = [...questions];
                          newQs[qIdx].options[oIdx].score = parseInt(e.target.value);
                          setQuestions(newQs);
                        }}
                        placeholder="Skor"
                        className="w-16 px-2 py-1.5 rounded-md border border-slate-200 outline-none text-xs"
                      />
                    </div>
                  ))}
                  <button 
                    onClick={() => addOption(qIdx)}
                    className="text-emerald-600 text-[10px] font-bold flex items-center gap-1 hover:underline"
                  >
                    <Plus className="w-3 h-3" /> Opsi
                  </button>
                </div>
              </div>
            ))}

            <button 
              onClick={addQuestion}
              className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 font-bold hover:border-emerald-600 hover:text-emerald-600 transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" /> Tambah Pertanyaan
            </button>
          </div>

          <div className="pt-6 border-t border-slate-100">
            <button 
              onClick={handleSave}
              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 text-sm"
            >
              <Save className="w-4 h-4" /> Simpan Tes Psikologi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const GuestRecap = ({ results, teacherSettings, classes, onEdit, onDelete }: { 
  results: TestResult[], 
  teacherSettings: TeacherSettings | null, 
  classes: ClassInfo[],
  onEdit?: (name: string, results: TestResult[]) => void,
  onDelete?: (name: string, results: TestResult[]) => void
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const registeredClassNames = classes.map(c => c.name);

  // Filter only guest results (non-registered classes)
  const guestResults = results.filter(r => !registeredClassNames.includes(r.studentClass));
  
  // Group results by guest name
  const uniqueGuestNames = Array.from(new Set(guestResults.map(r => r.studentName)));
  
  const guestSummary = uniqueGuestNames.map(name => {
    const tests = guestResults.filter(r => r.studentName === name);
    return {
      name,
      tests
    };
  }).filter(g => filterType === 'all' || g.tests.some(t => t.testType === filterType));

  const handleDownloadPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4');
    const title = "REKAPITULASI HASIL TES PSIKOLOGI PESERTA UMUM";
    
    // Kop Surat
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(teacherSettings?.pemdaName?.toUpperCase() || "PEMERINTAH PROVINSI / KOTA", 148.5, 15, { align: 'center' });
    doc.text(teacherSettings?.dinasName?.toUpperCase() || "DINAS PENDIDIKAN", 148.5, 22, { align: 'center' });
    doc.setFontSize(16);
    doc.text(teacherSettings?.schoolName?.toUpperCase() || "NAMA SEKOLAH ANDA DISINI", 148.5, 30, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(teacherSettings?.schoolAddress || "Alamat Lengkap Sekolah, No. Telp, Website, Email", 148.5, 36, { align: 'center' });
    doc.line(20, 40, 277, 40);
    doc.line(20, 41, 277, 41);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(title, 148.5, 50, { align: 'center' });

    const tableData = guestSummary.map((g, idx) => {
      const filteredTests = filterType === 'all' ? g.tests : g.tests.filter(t => t.testType === filterType);
      const testSummary = filteredTests.map(t => `${TESTS[t.testType]?.title || t.testType}: ${getShortResult(t.testType, t.scores)}`).join('\n');
      return [
        idx + 1,
        g.name,
        g.tests[0]?.studentClass || 'UMUM',
        g.tests[0]?.studentNisn || '-',
        testSummary || 'Belum mengikuti tes'
      ];
    });

    autoTable(doc, {
      startY: 60,
      head: [['No', 'Nama Peserta Umum', 'Jenjang', 'Asal Sekolah', 'Hasil Tes']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' }, // Emerald color
      styles: { fontSize: 8, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 40 },
        2: { cellWidth: 20 },
        3: { cellWidth: 40 },
        4: { cellWidth: 'auto' }
      }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 20;
    const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Dicetak pada: ${today}`, 20, finalY - 10);
    doc.text("Mengetahui,", 240, finalY, { align: 'center' });
    doc.text("Guru Bimbingan Konseling,", 240, finalY + 5, { align: 'center' });
    doc.setFont("helvetica", "bold");
    doc.text(teacherSettings?.name || "(....................................)", 240, finalY + 30, { align: 'center' });
    doc.setFont("helvetica", "normal");
    doc.text(`NIP. ${teacherSettings?.nip || "...................................."}`, 240, finalY + 35, { align: 'center' });

    doc.save(`rekap_hasil_tamu_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900">Rekap Peserta Umum</h3>
            <div className="bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 flex items-center gap-3">
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">Total Peserta Umum</span>
              <span className="text-xl font-black text-emerald-700">{uniqueGuestNames.length}</span>
            </div>
          </div>
          <p className="text-sm text-slate-500 font-medium">Ringkasan hasil tes psikologi peserta umum.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
            <Filter className="w-4 h-4 text-slate-400" />
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700 pr-6 py-0 outline-none"
            >
              <option value="all">SEMUA JENIS TES</option>
              {Object.keys(TESTS).map(type => (
                <option key={type} value={type}>{TESTS[type as TestType].title}</option>
              ))}
            </select>
          </div>
          <button 
            onClick={handleDownloadPDF}
            className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-black text-sm hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-100"
          >
            <Download className="w-4 h-4" /> DOWNLOAD PDF
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto" style={{ transform: 'rotateX(180deg)' }}>
          <div style={{ transform: 'rotateX(180deg)' }}>
            <table className="w-full text-left border-collapse border border-slate-200">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-r border-slate-200">No</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-r border-slate-200">Nama Peserta Umum</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-r border-slate-200">Jenjang</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-r border-slate-200">Nama Sekolah/ Alamat</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-r border-slate-200">Status Tes</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-r border-slate-200">Hasil Terakhir</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {guestSummary.map((g, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors border-b border-slate-200">
                  <td className="px-6 py-4 text-xs font-bold text-slate-400 border-r border-slate-200">{idx + 1}</td>
                  <td className="px-6 py-4 border-r border-slate-200">
                    <span className="text-sm font-black text-slate-900">{g.name}</span>
                  </td>
                  <td className="px-6 py-4 border-r border-slate-200">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase">{g.tests[0]?.studentClass || 'UMUM'}</span>
                  </td>
                  <td className="px-6 py-4 border-r border-slate-200">
                    <span className="text-xs font-medium text-slate-600">{g.tests[0]?.studentNisn || '-'}</span>
                  </td>
                  <td className="px-6 py-4 border-r border-slate-200">
                    <div className="flex flex-col gap-1">
                      {g.tests.length > 0 ? (
                        g.tests.map((t, i) => (
                          <span key={i} className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[9px] font-black border border-emerald-100 uppercase w-fit">
                            {TESTS[t.testType]?.title || t.testType}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Belum ada tes</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {g.tests.length > 0 ? (
                        g.tests.map((t, i) => (
                          <div key={i} className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 w-fit">
                            {getShortResult(t.testType, t.scores)}
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-slate-300">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => onEdit?.(g.name, g.tests)}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Edit Data Peserta Umum"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onDelete?.(g.name, g.tests)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus Semua Hasil Tes Peserta Umum"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {guestSummary.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400 font-bold italic">
                    Belum ada data rekapitulasi peserta umum.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const TestRecap = ({ results, classes, students, teacherSettings, onEdit, onDelete }: { 
  results: TestResult[], 
  classes: ClassInfo[], 
  students: StudentData[], 
  teacherSettings: TeacherSettings | null,
  onEdit?: (student: StudentData) => void,
  onDelete?: (student: StudentData) => void
}) => {
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  // Group results by student
  const allStudents = [...students];

  const studentResults = allStudents.filter(s => selectedClass === 'all' || s.className === selectedClass).map(student => {
    const studentTests = results.filter(r => (r.studentId === student.id || (r.studentName === student.name && r.studentClass === student.className)) && (filterType === 'all' || r.testType === filterType));
    return {
      ...student,
      tests: studentTests
    };
  }).filter(s => filterType === 'all' || s.tests.length > 0).sort((a, b) => {
    const classCompare = a.className.localeCompare(b.className, undefined, { numeric: true });
    if (classCompare !== 0) return classCompare;
    return (parseInt(a.number) || 0) - (parseInt(b.number) || 0);
  });

  const handleDownloadPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4');
    const title = "REKAPITULASI HASIL TES PSIKOLOGI SISWA";
    const subTitle = selectedClass === 'all' ? "SEMUA KELAS" : `KELAS: ${selectedClass}`;
    
    // Kop Surat (Official Indonesian Header)
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(teacherSettings?.pemdaName?.toUpperCase() || "PEMERINTAH PROVINSI / KOTA", 148.5, 15, { align: 'center' });
    doc.text(teacherSettings?.dinasName?.toUpperCase() || "DINAS PENDIDIKAN", 148.5, 22, { align: 'center' });
    doc.setFontSize(16);
    doc.text(teacherSettings?.schoolName?.toUpperCase() || "NAMA SEKOLAH ANDA DISINI", 148.5, 30, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(teacherSettings?.schoolAddress || "Alamat Lengkap Sekolah, No. Telp, Website, Email", 148.5, 36, { align: 'center' });
    doc.line(20, 40, 277, 40);
    doc.line(20, 41, 277, 41);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(title, 148.5, 50, { align: 'center' });
    doc.text(subTitle, 148.5, 57, { align: 'center' });

    const tableData = studentResults.map((s, idx) => {
      const filteredTests = filterType === 'all' ? s.tests : s.tests.filter(t => t.testType === filterType);
      const testSummary = filteredTests.map(t => `${TESTS[t.testType]?.title || t.testType}: ${getShortResult(t.testType, t.scores)}`).join('\n');
      return [
        idx + 1,
        s.number,
        s.nisn || '-',
        s.name,
        s.className,
        testSummary || 'Belum mengikuti tes'
      ];
    });

    autoTable(doc, {
      startY: 65,
      head: [['No', 'No. Induk', 'NISN', 'Nama Siswa', 'Kelas', 'Hasil Tes']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 20 },
        2: { cellWidth: 25 },
        3: { cellWidth: 45 },
        4: { cellWidth: 20 },
        5: { cellWidth: 'auto' }
      }
    });

    // Signatures
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Dicetak pada: ${today}`, 20, finalY - 10);
    
    doc.text("Mengetahui,", 240, finalY, { align: 'center' });
    doc.text("Guru Bimbingan Konseling,", 240, finalY + 5, { align: 'center' });
    
    doc.setFont("helvetica", "bold");
    doc.text(teacherSettings?.name || "(....................................)", 240, finalY + 30, { align: 'center' });
    doc.setFont("helvetica", "normal");
    doc.text(`NIP. ${teacherSettings?.nip || "...................................."}`, 240, finalY + 35, { align: 'center' });

    doc.save(`rekap_hasil_tes_${selectedClass}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Rekap Hasil Tes</h3>
          <p className="text-sm text-slate-500">Ringkasan hasil tes psikologi seluruh siswa.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 min-w-[100px]">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <div className="flex flex-col">
              <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none">JUMLAH SISWA</span>
              <span className="text-xs font-bold text-emerald-600 leading-none mt-0.5">{studentResults.length}</span>
            </div>
          </div>
          <div className="relative flex-1 sm:flex-none">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-600 outline-none w-full appearance-none"
            >
              <option value="all">SEMUA JENIS TES</option>
              {Object.keys(TESTS).map(type => (
                <option key={type} value={type}>{TESTS[type as TestType].title}</option>
              ))}
            </select>
          </div>
          <div className="relative flex-1 sm:flex-none">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <select 
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-600 outline-none w-full appearance-none"
            >
              <option value="all">SEMUA KELAS</option>
              <option value="Umum">UMUM</option>
              {classes.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
            <button 
              onClick={handleDownloadPDF}
              className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-black text-sm hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-100"
            >
              <Download className="w-4 h-4" /> DOWNLOAD PDF
            </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto" style={{ transform: 'rotateX(180deg)' }}>
          <div style={{ transform: 'rotateX(180deg)' }}>
            <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-widest font-bold">
              <tr>
                <th className="px-6 py-4">No</th>
                <th className="px-6 py-4">No. Induk</th>
                <th className="px-6 py-4">NISN</th>
                <th className="px-6 py-4">Nama Siswa</th>
                <th className="px-6 py-4">Kelas</th>
                <th className="px-6 py-4">Status Tes</th>
                <th className="px-6 py-4">Hasil Terakhir</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {studentResults.map((s, idx) => (
                <tr key={s.id || idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-xs text-slate-500">{idx + 1}</td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-400">{s.number}</td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-400">{s.nisn || '-'}</td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-slate-900">{s.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase">{s.className}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {s.tests.length > 0 ? (
                        s.tests.map((t, i) => (
                          <span key={i} className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[9px] font-bold border border-emerald-100 w-fit">
                            {TESTS[t.testType]?.title || t.testType}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Belum ada tes</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {s.tests.length > 0 ? (
                        s.tests.map((t, i) => (
                          <div key={i} className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 w-fit">
                            {getShortResult(t.testType, t.scores)}
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-slate-300">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => onEdit?.(s)}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Edit Data Siswa"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onDelete?.(s)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus Semua Hasil Tes Siswa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const ManajemenTamu = ({ users, classes }: { users: any[], classes: ClassInfo[] }) => {
  const [search, setSearch] = useState('');
  const registeredClassNames = classes.map(c => c.name);
  
  const guestUsers = users.filter(u => u.role === 'student' && !registeredClassNames.includes(u.className));
  
  const filteredGuests = guestUsers.filter(g => 
    (g.name && g.name.toLowerCase().includes(search.toLowerCase())) ||
    (g.className && g.className.toLowerCase().includes(search.toLowerCase())) ||
    (g.nisn && g.nisn.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Data Peserta Umum</h3>
          <p className="text-sm text-slate-500">Daftar peserta yang mendaftar melalui jalur UMUM.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input 
              type="text"
              placeholder="Cari nama, jenjang, asal..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-600 outline-none w-full appearance-none"
            />
          </div>
          <div className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 min-w-[100px]">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <div className="flex flex-col">
              <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none">TOTAL PESERTA UMUM</span>
              <span className="text-xs font-bold text-emerald-600 leading-none mt-0.5">{filteredGuests.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto" style={{ transform: 'rotateX(180deg)' }}>
          <div style={{ transform: 'rotateX(180deg)' }}>
            <table className="w-full text-left min-w-[600px]">
            <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-widest font-bold">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">No</th>
                <th className="px-6 py-4 whitespace-nowrap">Nama Peserta</th>
                <th className="px-6 py-4 whitespace-nowrap">Jenjang</th>
                <th className="px-6 py-4 whitespace-nowrap">Nama Sekolah/ Alamat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredGuests.length > 0 ? (
                filteredGuests.map((g, idx) => (
                  <tr key={g.id || idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">{idx + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-slate-900">{g.name || '-'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase">{g.className || 'UMUM'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {g.nisn || '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400 text-sm">
                    Tidak ada data peserta umum ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const MonitorSiswa = ({ results, students, classes, setTestResult, setEditingStudent, setConfirmDelete }: { 
  results: TestResult[], 
  students: StudentData[], 
  classes: ClassInfo[],
  setTestResult: (r: TestResult | null) => void,
  setEditingStudent: (s: StudentData | null) => void,
  setConfirmDelete: (data: any) => void
}) => {
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredStudents = students.filter(s => {
    const matchesClass = selectedClass === 'all' || s.className === selectedClass;
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                         (s.nisn && s.nisn.toLowerCase().includes(search.toLowerCase()));
    
    const studentResults = results.filter(r => r.studentId === s.id || (r.studentName === s.name && r.studentClass === s.className));
    const hasTakenTest = studentResults.length > 0;
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'belum_tes' && !hasTakenTest);

    return matchesClass && matchesSearch && matchesStatus;
  }).sort((a, b) => {
    const classCompare = a.className.localeCompare(b.className, undefined, { numeric: true });
    if (classCompare !== 0) return classCompare;
    return (parseInt(a.number) || 0) - (parseInt(b.number) || 0);
  });

  const testTypes = Object.keys(TESTS) as TestType[];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Monitor Pengerjaan Tes</h3>
          <p className="text-sm text-slate-500">Pantau status penyelesaian tes psikologi siswa secara real-time.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input 
              type="text"
              placeholder="Cari siswa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-600 outline-none w-full appearance-none"
            />
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-600 outline-none flex-1 sm:flex-none"
            >
              <option value="all">SEMUA STATUS</option>
              <option value="belum_tes">BELUM IKUT TES</option>
            </select>
            <div className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 min-w-[100px]">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <div className="flex flex-col">
                <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none">JUMLAH SISWA</span>
                <span className="text-xs font-bold text-emerald-600 leading-none mt-0.5">{filteredStudents.length}</span>
              </div>
            </div>
            <div className="relative flex-1 sm:flex-none">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <select 
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-600 outline-none w-full appearance-none"
              >
                <option value="all">SEMUA KELAS</option>
                {classes.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto" style={{ transform: 'rotateX(180deg)' }}>
          <div style={{ transform: 'rotateX(180deg)' }}>
            <table className="w-full text-left min-w-[800px]">
            <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-widest font-bold">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">No</th>
                <th className="px-6 py-4 whitespace-nowrap">NISN</th>
                <th className="px-6 py-4 whitespace-nowrap">Nama Siswa</th>
                <th className="px-6 py-4 whitespace-nowrap">Kelas</th>
                <th className="px-6 py-4 text-center whitespace-nowrap">Tes Psikologi</th>
                <th className="px-6 py-4 text-center whitespace-nowrap">Jumlah</th>
                <th className="px-6 py-4 text-right whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((s, idx) => {
                const studentResults = results.filter(r => r.studentId === s.id || (r.studentName === s.name && r.studentClass === s.className));
                const completedTests = new Set(studentResults.map(r => r.testType));
                
                return (
                  <tr key={s.id || idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">{idx + 1}</td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-400 whitespace-nowrap">{s.nisn || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-slate-900">{s.name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase">{s.className}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex justify-center gap-1.5">
                        {testTypes.map(type => {
                          const isDone = completedTests.has(type);
                          return (
                            <div 
                              key={type}
                              className={cn(
                                "w-3 h-3 rounded-full border transition-all",
                                isDone ? "bg-emerald-500 border-emerald-600 shadow-sm shadow-emerald-200" : "bg-slate-100 border-slate-200"
                              )}
                              title={`${TESTS[type].title}: ${isDone ? 'Selesai' : 'Belum'}`}
                            />
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <span className={cn(
                        "text-xs font-bold px-2 py-1 rounded-lg border transition-all",
                        completedTests.size > 0 
                          ? "text-amber-700 bg-amber-50 border-[#FFC30B] shadow-sm shadow-amber-100" 
                          : "text-slate-700 bg-slate-100 border-transparent"
                      )}>
                        {completedTests.size}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {studentResults.length > 0 ? (
                          <button 
                            onClick={() => setTestResult(studentResults[0])}
                            className="text-emerald-600 hover:text-emerald-800 p-2 rounded-lg hover:bg-emerald-50 transition-colors flex items-center gap-1.5 border border-transparent hover:border-emerald-100"
                            title="Lihat Laporan Terakhir"
                          >
                            <FileText className="w-4 h-4" />
                            <span className="font-bold text-[10px]">LAPORAN</span>
                          </button>
                        ) : (
                          <div className="p-2 text-slate-300 cursor-not-allowed">
                            <FileText className="w-4 h-4 opacity-50" />
                          </div>
                        )}
                        <button 
                          onClick={() => setEditingStudent(s)}
                          className="text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 p-2 rounded-lg transition-colors"
                          title="Edit Siswa"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setConfirmDelete({
                            id: s.id!,
                            type: 'student',
                            title: 'Hapus Siswa',
                            message: `Hapus data siswa ${s.name}?`
                          })} 
                          className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          title="Hapus Siswa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400 font-bold italic">
                    Tidak ada data siswa ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const HasilTesSummary = ({ results, classes, students, teacherSettings, onEdit, onDelete }: { 
  results: TestResult[], 
  classes: ClassInfo[], 
  students: StudentData[], 
  teacherSettings: TeacherSettings | null,
  onEdit?: (student: StudentData) => void,
  onDelete?: (student: StudentData) => void
}) => {
  const [selectedClass, setSelectedClass] = useState<string>('all');

  const testTypes = Object.keys(TESTS) as TestType[];

  // Group results by student
  const allStudents = [...students];

  const studentResults = allStudents.filter(s => selectedClass === 'all' || s.className === selectedClass).map(student => {
    const studentTests = results.filter(r => (r.studentId === student.id || (r.studentName === student.name && r.studentClass === student.className)));
    
    // Get latest result for each test type
    const latestTests: Record<string, string> = {};
    testTypes.forEach(type => {
      const testsOfType = studentTests.filter(t => t.testType === type).sort((a, b) => {
        const timeA = a.timestamp?.seconds || 0;
        const timeB = b.timestamp?.seconds || 0;
        return timeB - timeA;
      });
      if (testsOfType.length > 0) {
        latestTests[type] = getShortResult(type, testsOfType[0].scores);
      } else {
        latestTests[type] = '-';
      }
    });

    return {
      ...student,
      latestTests
    };
  }).sort((a, b) => {
    const classCompare = a.className.localeCompare(b.className, undefined, { numeric: true });
    if (classCompare !== 0) return classCompare;
    return (parseInt(a.number) || 0) - (parseInt(b.number) || 0);
  });

  const handleDownloadPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4');
    const title = "RANGKUMAN HASIL AKHIR TES PSIKOLOGI";
    const subTitle = selectedClass === 'all' ? "SEMUA KELAS" : `KELAS: ${selectedClass}`;
    
    // Kop Surat
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(teacherSettings?.pemdaName?.toUpperCase() || "PEMERINTAH PROVINSI / KOTA", 148.5, 15, { align: 'center' });
    doc.text(teacherSettings?.dinasName?.toUpperCase() || "DINAS PENDIDIKAN", 148.5, 22, { align: 'center' });
    doc.setFontSize(16);
    doc.text(teacherSettings?.schoolName?.toUpperCase() || "NAMA SEKOLAH ANDA DISINI", 148.5, 30, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(teacherSettings?.schoolAddress || "Alamat Lengkap Sekolah, No. Telp, Website, Email", 148.5, 36, { align: 'center' });
    doc.line(20, 40, 277, 40);
    doc.line(20, 41, 277, 41);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(title, 148.5, 50, { align: 'center' });
    doc.text(subTitle, 148.5, 57, { align: 'center' });

    const tableData = studentResults.map((s, idx) => {
      return [
        idx + 1,
        s.nisn || '-',
        s.name,
        s.className,
        s.latestTests['learning_style'] || '-',
        s.latestTests['personality'] || '-',
        s.latestTests['multiple_intelligences'] || '-',
        s.latestTests['aptitude_interest'] || '-',
        s.latestTests['school_major'] || '-',
        s.latestTests['anxiety'] || '-',
        s.latestTests['iq_wais'] || '-',
        s.latestTests['wartegg'] || '-'
      ];
    });

    autoTable(doc, {
      startY: 65,
      head: [
        [
          { content: 'NO', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
          { content: 'NISN', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
          { content: 'NAMA SISWA', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
          { content: 'KELAS', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
          { content: 'JENIS TES', colSpan: 8, styles: { halign: 'center' } }
        ],
        [
          { content: 'GAYA BELAJAR', styles: { halign: 'center' } },
          { content: 'TIPE KEPRIBADIAN', styles: { halign: 'center' } },
          { content: 'KECERDASAN MAJEMUK', styles: { halign: 'center' } },
          { content: 'BAKAT MINAT', styles: { halign: 'center' } },
          { content: 'PENJURUSAN', styles: { halign: 'center' } },
          { content: 'KECEMASAN', styles: { halign: 'center' } },
          { content: 'IQ WAIS', styles: { halign: 'center' } },
          { content: 'WARTEGG', styles: { halign: 'center' } }
        ]
      ],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold', lineWidth: 0.1, lineColor: 200 },
      styles: { fontSize: 5, cellPadding: 1, lineWidth: 0.1, lineColor: 200 },
      columnStyles: {
        0: { cellWidth: 6, halign: 'center' },
        1: { cellWidth: 15, halign: 'center' },
        2: { cellWidth: 30 },
        3: { cellWidth: 10, halign: 'center' },
        4: { cellWidth: 20, halign: 'center' },
        5: { cellWidth: 25, halign: 'center' },
        6: { cellWidth: 25, halign: 'center' },
        7: { cellWidth: 25, halign: 'center' },
        8: { cellWidth: 20, halign: 'center' },
        9: { cellWidth: 20, halign: 'center' },
        10: { cellWidth: 20, halign: 'center' },
        11: { cellWidth: 20, halign: 'center' }
      }
    });

    // Signatures
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Dicetak pada: ${today}`, 20, finalY - 10);
    
    doc.text("Mengetahui,", 240, finalY, { align: 'center' });
    doc.text("Guru Bimbingan Konseling,", 240, finalY + 5, { align: 'center' });
    
    doc.setFont("helvetica", "bold");
    doc.text(teacherSettings?.name || "(....................................)", 240, finalY + 30, { align: 'center' });
    doc.setFont("helvetica", "normal");
    doc.text(`NIP. ${teacherSettings?.nip || "...................................."}`, 240, finalY + 35, { align: 'center' });

    doc.save(`hasil_akhir_tes_${selectedClass}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Calculate summary counts
  const testCounts = testTypes.reduce((acc, type) => {
    acc[type] = studentResults.filter(s => s.latestTests[type] !== '-').length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Hasil Tes Psikologi</h3>
          <p className="text-sm text-slate-500">Rangkuman hasil akhir seluruh tes psikologi siswa.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 min-w-[100px]">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <div className="flex flex-col">
              <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none">JUMLAH SISWA</span>
              <span className="text-xs font-bold text-emerald-600 leading-none mt-0.5">{studentResults.length}</span>
            </div>
          </div>
          <div className="relative flex-1 sm:flex-none">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <select 
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-600 outline-none w-full appearance-none"
            >
              <option value="all">SEMUA KELAS</option>
              {classes.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          <button 
            onClick={() => {
              const doc = new jsPDF('l', 'mm', 'a4');
              const title = "RANGKUMAN HASIL AKHIR TES PSIKOLOGI";
              const subTitle = selectedClass === 'all' ? "SEMUA KELAS" : `KELAS: ${selectedClass}`;
              
              // Kop Surat
              doc.setFontSize(14);
              doc.setFont("helvetica", "bold");
              doc.text(teacherSettings?.pemdaName?.toUpperCase() || "PEMERINTAH PROVINSI / KOTA", 148.5, 15, { align: 'center' });
              doc.text(teacherSettings?.dinasName?.toUpperCase() || "DINAS PENDIDIKAN", 148.5, 22, { align: 'center' });
              doc.setFontSize(16);
              doc.text(teacherSettings?.schoolName?.toUpperCase() || "NAMA SEKOLAH ANDA DISINI", 148.5, 30, { align: 'center' });
              doc.setFontSize(10);
              doc.setFont("helvetica", "normal");
              doc.text(teacherSettings?.schoolAddress || "Alamat Lengkap Sekolah, No. Telp, Website, Email", 148.5, 36, { align: 'center' });
              doc.line(20, 40, 277, 40);
              doc.line(20, 41, 277, 41);

              doc.setFontSize(12);
              doc.setFont("helvetica", "bold");
              doc.text(title, 148.5, 50, { align: 'center' });
              doc.text(subTitle, 148.5, 57, { align: 'center' });

              const tableData = studentResults.map((s, idx) => {
                return [
                  idx + 1,
                  s.nisn || '-',
                  s.name,
                  s.className,
                  s.latestTests['learning_style'] || '-',
                  s.latestTests['personality'] || '-',
                  s.latestTests['multiple_intelligences'] || '-',
                  s.latestTests['aptitude_interest'] || '-',
                  s.latestTests['school_major'] || '-',
                  s.latestTests['anxiety'] || '-',
                  s.latestTests['iq_wais'] || '-',
                  s.latestTests['wartegg'] || '-'
                ];
              });

              autoTable(doc, {
                startY: 65,
                head: [
                  [
                    { content: 'NO', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
                    { content: 'NISN', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
                    { content: 'NAMA SISWA', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
                    { content: 'KELAS', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
                    { content: 'JENIS TES', colSpan: 8, styles: { halign: 'center' } }
                  ],
                  [
                    { content: 'GAYA BELAJAR', styles: { halign: 'center' } },
                    { content: 'TIPE KEPRIBADIAN', styles: { halign: 'center' } },
                    { content: 'KECERDASAN MAJEMUK', styles: { halign: 'center' } },
                    { content: 'BAKAT MINAT', styles: { halign: 'center' } },
                    { content: 'PENJURUSAN', styles: { halign: 'center' } },
                    { content: 'KECEMASAN', styles: { halign: 'center' } },
                    { content: 'IQ WAIS', styles: { halign: 'center' } },
                    { content: 'WARTEGG', styles: { halign: 'center' } }
                  ]
                ],
                body: tableData,
                theme: 'grid',
                headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold', lineWidth: 0.1, lineColor: 200 },
                styles: { fontSize: 5, cellPadding: 1, lineWidth: 0.1, lineColor: 200 },
                columnStyles: {
                  0: { cellWidth: 6, halign: 'center' },
                  1: { cellWidth: 15, halign: 'center' },
                  2: { cellWidth: 30 },
                  3: { cellWidth: 10, halign: 'center' },
                  4: { cellWidth: 20, halign: 'center' },
                  5: { cellWidth: 25, halign: 'center' },
                  6: { cellWidth: 25, halign: 'center' },
                  7: { cellWidth: 25, halign: 'center' },
                  8: { cellWidth: 20, halign: 'center' },
                  9: { cellWidth: 20, halign: 'center' },
                  10: { cellWidth: 20, halign: 'center' },
                  11: { cellWidth: 20, halign: 'center' }
                }
              });

              // Signatures
              const finalY = (doc as any).lastAutoTable.finalY + 20;
              const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
              
              doc.setFontSize(10);
              doc.setFont("helvetica", "normal");
              doc.text(`Dicetak pada: ${today}`, 20, finalY - 10);
              
              doc.text("Mengetahui,", 240, finalY, { align: 'center' });
              doc.text("Guru Bimbingan Konseling,", 240, finalY + 5, { align: 'center' });
              
              doc.setFont("helvetica", "bold");
              doc.text(teacherSettings?.name || "(....................................)", 240, finalY + 30, { align: 'center' });
              doc.setFont("helvetica", "normal");
              doc.text(`NIP. ${teacherSettings?.nip || "...................................."}`, 240, finalY + 35, { align: 'center' });

              window.open(doc.output('bloburl'), '_blank');
            }}
            className="px-6 py-2.5 bg-white text-emerald-600 border border-emerald-200 rounded-xl font-black text-sm hover:bg-emerald-50 transition-all flex items-center gap-2 shadow-sm"
          >
            <Eye className="w-4 h-4" /> PREVIEW
          </button>
          <button 
            onClick={handleDownloadPDF}
            className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-black text-sm hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-100"
          >
            <Download className="w-4 h-4" /> DOWNLOAD PDF
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {testTypes.map(type => (
          <div key={type} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 line-clamp-1" title={TESTS[type].title}>{TESTS[type].title}</span>
            <span className="text-2xl font-black text-emerald-600">{testCounts[type]}</span>
            <span className="text-[10px] text-slate-400 font-medium mt-1">Siswa Selesai</span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto" style={{ transform: 'rotateX(180deg)' }}>
          <div style={{ transform: 'rotateX(180deg)' }}>
            <table className="w-full text-left min-w-[1200px] border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-widest font-bold border-b border-slate-200">
              <tr>
                <th rowSpan={2} className="px-4 py-3 border-r border-slate-200 text-center align-middle">No</th>
                <th rowSpan={2} className="px-4 py-3 border-r border-slate-200 text-center align-middle">NISN</th>
                <th rowSpan={2} className="px-4 py-3 border-r border-slate-200 text-center align-middle">Nama Siswa</th>
                <th rowSpan={2} className="px-4 py-3 border-r border-slate-200 text-center align-middle">Kelas</th>
                <th colSpan={8} className="px-4 py-2 border-b border-slate-200 text-center">Jenis Tes</th>
                <th rowSpan={2} className="px-4 py-3 text-center align-middle">Aksi</th>
              </tr>
              <tr>
                <th className="px-4 py-2 border-r border-slate-200 text-center">Gaya Belajar</th>
                <th className="px-4 py-2 border-r border-slate-200 text-center">Tipe Kepribadian</th>
                <th className="px-4 py-2 border-r border-slate-200 text-center">Kecerdasan Majemuk</th>
                <th className="px-4 py-2 border-r border-slate-200 text-center">Bakat Minat</th>
                <th className="px-4 py-2 border-r border-slate-200 text-center">Penjurusan</th>
                <th className="px-4 py-2 border-r border-slate-200 text-center">Kecemasan</th>
                <th className="px-4 py-2 border-r border-slate-200 text-center">IQ WAIS</th>
                <th className="px-4 py-2 border-r border-slate-200 text-center">Wartegg</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {studentResults.map((s, idx) => (
                <tr key={s.id || idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 text-xs text-slate-500 text-center border-r border-slate-100">{idx + 1}</td>
                  <td className="px-4 py-3 text-xs font-mono text-slate-400 text-center border-r border-slate-100">{s.nisn || '-'}</td>
                  <td className="px-4 py-3 border-r border-slate-100">
                    <span className="text-sm font-bold text-slate-900">{s.name}</span>
                  </td>
                  <td className="px-4 py-3 text-center border-r border-slate-100">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase">{s.className}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600 text-center border-r border-slate-100 font-medium">{s.latestTests['learning_style']}</td>
                  <td className="px-4 py-3 text-xs text-slate-600 text-center border-r border-slate-100 font-medium">{s.latestTests['personality']}</td>
                  <td className="px-4 py-3 text-xs text-slate-600 text-center border-r border-slate-100 font-medium">{s.latestTests['multiple_intelligences']}</td>
                  <td className="px-4 py-3 text-xs text-slate-600 text-center border-r border-slate-100 font-medium">{s.latestTests['aptitude_interest']}</td>
                  <td className="px-4 py-3 text-xs text-slate-600 text-center border-r border-slate-100 font-medium">{s.latestTests['school_major']}</td>
                  <td className="px-4 py-3 text-xs text-slate-600 text-center border-r border-slate-100 font-medium">{s.latestTests['anxiety']}</td>
                  <td className="px-4 py-3 text-xs text-slate-600 text-center border-r border-slate-100 font-medium">{s.latestTests['iq_wais']}</td>
                  <td className="px-4 py-3 text-xs text-slate-600 text-center border-r border-slate-100 font-medium">{s.latestTests['wartegg']}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleDownloadDetailedReport(s, results, teacherSettings)}
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Cetak Laporan Detail Individual"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onEdit?.(s)}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Edit Data Siswa"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onDelete?.(s)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus Semua Hasil Tes Siswa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {studentResults.length === 0 && (
                <tr>
                  <td colSpan={12} className="p-12 text-center text-slate-400 font-bold italic">
                    Tidak ada data siswa ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const HasilTesTamu = ({ results, classes, users, teacherSettings, onDelete }: { 
  results: TestResult[], 
  classes: ClassInfo[], 
  users: any[], 
  teacherSettings: TeacherSettings | null,
  onDelete?: (user: any) => void
}) => {
  const registeredClassNames = classes.map(c => c.name);
  const guestUsers = users.filter(u => u.role === 'student' && !registeredClassNames.includes(u.className));
  const testTypes = Object.keys(TESTS) as TestType[];

  const guestResults = guestUsers.map(guest => {
    const guestTests = results.filter(r => r.studentId === guest.uid || (r.studentName === guest.name && r.studentClass === guest.className));
    
    const latestTests: Record<string, string> = {};
    testTypes.forEach(type => {
      const testsOfType = guestTests.filter(t => t.testType === type).sort((a, b) => {
        const timeA = a.timestamp?.seconds || 0;
        const timeB = b.timestamp?.seconds || 0;
        return timeB - timeA;
      });
      if (testsOfType.length > 0) {
        latestTests[type] = getShortResult(type, testsOfType[0].scores);
      } else {
        latestTests[type] = '-';
      }
    });

    return {
      ...guest,
      latestTests
    };
  }).sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  const handleDownloadPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4');
    const title = "RANGKUMAN HASIL AKHIR TES PSIKOLOGI PESERTA UMUM";
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(teacherSettings?.pemdaName?.toUpperCase() || "PEMERINTAH PROVINSI / KOTA", 148.5, 15, { align: 'center' });
    doc.text(teacherSettings?.dinasName?.toUpperCase() || "DINAS PENDIDIKAN", 148.5, 22, { align: 'center' });
    doc.setFontSize(16);
    doc.text(teacherSettings?.schoolName?.toUpperCase() || "NAMA SEKOLAH ANDA DISINI", 148.5, 30, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(teacherSettings?.schoolAddress || "Alamat Lengkap Sekolah, No. Telp, Website, Email", 148.5, 36, { align: 'center' });
    doc.line(20, 40, 277, 40);
    doc.line(20, 41, 277, 41);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(title, 148.5, 50, { align: 'center' });

    const tableData = guestResults.map((g, idx) => {
      return [
        idx + 1,
        g.name || '-',
        g.className || 'UMUM',
        g.nisn || '-',
        g.latestTests['learning_style'] || '-',
        g.latestTests['personality'] || '-',
        g.latestTests['multiple_intelligences'] || '-',
        g.latestTests['aptitude_interest'] || '-',
        g.latestTests['school_major'] || '-',
        g.latestTests['anxiety'] || '-',
        g.latestTests['iq_wais'] || '-',
        g.latestTests['wartegg'] || '-'
      ];
    });

    autoTable(doc, {
      startY: 65,
      head: [
        [
          { content: 'NO', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
          { content: 'NAMA PESERTA', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
          { content: 'JENJANG', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
          { content: 'NAMA SEKOLAH/ ALAMAT', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
          { content: 'JENIS TES', colSpan: 8, styles: { halign: 'center' } }
        ],
        [
          { content: 'GAYA BELAJAR', styles: { halign: 'center' } },
          { content: 'TIPE KEPRIBADIAN', styles: { halign: 'center' } },
          { content: 'KECERDASAN MAJEMUK', styles: { halign: 'center' } },
          { content: 'BAKAT MINAT', styles: { halign: 'center' } },
          { content: 'PENJURUSAN', styles: { halign: 'center' } },
          { content: 'KECEMASAN', styles: { halign: 'center' } },
          { content: 'IQ WAIS', styles: { halign: 'center' } },
          { content: 'WARTEGG', styles: { halign: 'center' } }
        ]
      ],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold', lineWidth: 0.1, lineColor: 200 },
      styles: { fontSize: 5, cellPadding: 1, lineWidth: 0.1, lineColor: 200 },
      columnStyles: {
        0: { cellWidth: 6, halign: 'center' },
        1: { cellWidth: 30 },
        2: { cellWidth: 15, halign: 'center' },
        3: { cellWidth: 25 },
        4: { cellWidth: 20, halign: 'center' },
        5: { cellWidth: 25, halign: 'center' },
        6: { cellWidth: 25, halign: 'center' },
        7: { cellWidth: 25, halign: 'center' },
        8: { cellWidth: 20, halign: 'center' },
        9: { cellWidth: 20, halign: 'center' },
        10: { cellWidth: 20, halign: 'center' },
        11: { cellWidth: 20, halign: 'center' }
      }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 20;
    const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Dicetak pada: ${today}`, 20, finalY - 10);
    doc.text("Mengetahui,", 240, finalY, { align: 'center' });
    doc.text("Guru Bimbingan Konseling,", 240, finalY + 5, { align: 'center' });
    doc.setFont("helvetica", "bold");
    doc.text(teacherSettings?.name || "(....................................)", 240, finalY + 30, { align: 'center' });
    doc.setFont("helvetica", "normal");
    doc.text(`NIP. ${teacherSettings?.nip || "...................................."}`, 240, finalY + 35, { align: 'center' });

    doc.save(`hasil_akhir_tes_umum_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Hasil Tes Peserta Umum</h3>
          <p className="text-sm text-slate-500">Rangkuman hasil akhir seluruh tes psikologi peserta umum.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 min-w-[100px]">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <div className="flex flex-col">
              <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none">JUMLAH PESERTA</span>
              <span className="text-xs font-bold text-emerald-600 leading-none mt-0.5">{guestResults.length}</span>
            </div>
          </div>
          <button 
            onClick={handleDownloadPDF}
            className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-black text-sm hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-100"
          >
            <Download className="w-4 h-4" /> DOWNLOAD PDF
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto" style={{ transform: 'rotateX(180deg)' }}>
          <div style={{ transform: 'rotateX(180deg)' }}>
            <table className="w-full text-left min-w-[1200px] border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-widest font-bold border-b border-slate-200">
              <tr>
                <th rowSpan={2} className="px-4 py-3 border-r border-slate-200 text-center align-middle">No</th>
                <th rowSpan={2} className="px-4 py-3 border-r border-slate-200 text-center align-middle">Nama Peserta</th>
                <th rowSpan={2} className="px-4 py-3 border-r border-slate-200 text-center align-middle">Jenjang</th>
                <th rowSpan={2} className="px-4 py-3 border-r border-slate-200 text-center align-middle">Nama Sekolah/ Alamat</th>
                <th colSpan={8} className="px-4 py-2 border-b border-slate-200 text-center">Jenis Tes</th>
                <th rowSpan={2} className="px-4 py-3 text-center align-middle">Aksi</th>
              </tr>
              <tr>
                <th className="px-4 py-2 border-r border-slate-200 text-center">Gaya Belajar</th>
                <th className="px-4 py-2 border-r border-slate-200 text-center">Tipe Kepribadian</th>
                <th className="px-4 py-2 border-r border-slate-200 text-center">Kecerdasan Majemuk</th>
                <th className="px-4 py-2 border-r border-slate-200 text-center">Bakat Minat</th>
                <th className="px-4 py-2 border-r border-slate-200 text-center">Penjurusan</th>
                <th className="px-4 py-2 border-r border-slate-200 text-center">Kecemasan</th>
                <th className="px-4 py-2 border-r border-slate-200 text-center">IQ WAIS</th>
                <th className="px-4 py-2 border-r border-slate-200 text-center">Wartegg</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {guestResults.map((g, idx) => (
                <tr key={g.uid || idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 text-xs text-slate-500 text-center border-r border-slate-100">{idx + 1}</td>
                  <td className="px-4 py-3 border-r border-slate-100">
                    <span className="text-sm font-bold text-slate-900">{g.name || '-'}</span>
                  </td>
                  <td className="px-4 py-3 text-center border-r border-slate-100">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase">{g.className || 'UMUM'}</span>
                  </td>
                  <td className="px-4 py-3 border-r border-slate-100 text-sm text-slate-600">
                    {g.nisn || '-'}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600 text-center border-r border-slate-100 font-medium">{g.latestTests['learning_style']}</td>
                  <td className="px-4 py-3 text-xs text-slate-600 text-center border-r border-slate-100 font-medium">{g.latestTests['personality']}</td>
                  <td className="px-4 py-3 text-xs text-slate-600 text-center border-r border-slate-100 font-medium">{g.latestTests['multiple_intelligences']}</td>
                  <td className="px-4 py-3 text-xs text-slate-600 text-center border-r border-slate-100 font-medium">{g.latestTests['aptitude_interest']}</td>
                  <td className="px-4 py-3 text-xs text-slate-600 text-center border-r border-slate-100 font-medium">{g.latestTests['school_major']}</td>
                  <td className="px-4 py-3 text-xs text-slate-600 text-center border-r border-slate-100 font-medium">{g.latestTests['anxiety']}</td>
                  <td className="px-4 py-3 text-xs text-slate-600 text-center border-r border-slate-100 font-medium">{g.latestTests['iq_wais']}</td>
                  <td className="px-4 py-3 text-xs text-slate-600 text-center border-r border-slate-100 font-medium">{g.latestTests['wartegg']}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleDownloadDetailedReport(g, results, teacherSettings)}
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Cetak Laporan Detail Individual"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onDelete?.(g)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus Semua Hasil Tes Peserta"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {guestResults.length === 0 && (
                <tr>
                  <td colSpan={13} className="p-12 text-center text-slate-400 font-bold italic">
                    Tidak ada data peserta umum ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = ({ results, classes, students, teacherSettings, user, setView, showToast, setTestResult, allUsers }: { results: TestResult[], classes: ClassInfo[], students: StudentData[], teacherSettings: TeacherSettings | null, user: UserProfile, setView: (v: any) => void, showToast: (m: string, t?: 'success' | 'error' | 'info') => void, setTestResult: (r: TestResult | null) => void, allUsers: any[] }) => {
  const [selectedClass, setSelectedClass] = useState<string>(() => localStorage.getItem('adminSelectedClass') || 'all');
  const [filterName, setFilterName] = useState('');
  const [filterType, setFilterType] = useState<string>(() => localStorage.getItem('adminFilterType') || 'all');
  const [filterDate, setFilterDate] = useState('');
  const [tableClassFilter, setTableClassFilter] = useState<string>(() => localStorage.getItem('adminTableClassFilter') || 'all');
  const [tableTypeFilter, setTableTypeFilter] = useState<string>(() => localStorage.getItem('adminTableTypeFilter') || 'all');
  const [historySearch, setHistorySearch] = useState('');
  const [historyDate, setHistoryDate] = useState('');
  const [tamuSearch, setTamuSearch] = useState('');
  const [tamuTypeFilter, setTamuTypeFilter] = useState<string>(() => localStorage.getItem('adminTamuTypeFilter') || 'all');
  const [tamuDate, setTamuDate] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'students' | 'teacher' | 'report' | 'recap' | 'tamu' | 'recap-tamu' | 'monitor' | 'hasil-tes' | 'manajemen-tamu' | 'hasil-tes-tamu'>(() => (localStorage.getItem('adminActiveTab') as any) || 'dashboard');
  const [editingStudent, setEditingStudent] = useState<StudentData | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string, type: 'student' | 'result' | 'all_students' | 'results_by_student' | 'results_by_guest', title: string, message: string, extraData?: any } | null>(null);
  const [classAnalysis, setClassAnalysis] = useState('');
  const [isGeneratingClassAnalysis, setIsGeneratingClassAnalysis] = useState(false);

  useEffect(() => {
    localStorage.setItem('adminSelectedClass', selectedClass);
    localStorage.setItem('adminFilterType', filterType);
    localStorage.setItem('adminTableClassFilter', tableClassFilter);
    localStorage.setItem('adminTableTypeFilter', tableTypeFilter);
    localStorage.setItem('adminTamuTypeFilter', tamuTypeFilter);
    localStorage.setItem('adminActiveTab', activeTab);
  }, [selectedClass, filterType, tableClassFilter, tableTypeFilter, tamuTypeFilter, activeTab]);

  // Reset class analysis when filter changes
  useEffect(() => {
    setClassAnalysis('');
  }, [selectedClass, filterType]);

  // Teacher Settings State
  const [teacherName, setTeacherName] = useState(teacherSettings?.name || '');
  const [teacherNip, setTeacherNip] = useState(teacherSettings?.nip || '');
  const [schoolName, setSchoolName] = useState(teacherSettings?.schoolName || '');
  const [schoolAddress, setSchoolAddress] = useState(teacherSettings?.schoolAddress || '');
  const [pemdaName, setPemdaName] = useState(teacherSettings?.pemdaName || '');
  const [dinasName, setDinasName] = useState(teacherSettings?.dinasName || '');

  // Change Account State
  const [showChangeAccountForm, setShowChangeAccountForm] = useState(false);
  const [changeAccountPassword, setChangeAccountPassword] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [isChangingAccount, setIsChangingAccount] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Student Input State
  const [newStudentNumber, setNewStudentNumber] = useState('');
  const [newStudentNisn, setNewStudentNisn] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentClass, setNewStudentClass] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [studentClassFilter, setStudentClassFilter] = useState<string>('all');
  const [studentStatusFilter, setStudentStatusFilter] = useState<string>('all');
  const [uploadSummary, setUploadSummary] = useState<{ total: number, success: number } | null>(null);
  const [recentlyAddedIds, setRecentlyAddedIds] = useState<string[]>([]);

  const filteredStudents = students
    .filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.className.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.number.toLowerCase().includes(studentSearch.toLowerCase());
      const matchesClass = studentClassFilter === 'all' || s.className === studentClassFilter;
      
      const studentResults = results.filter(r => r.studentId === s.id || (r.studentName === s.name && r.studentClass === s.className));
      const hasTakenTest = studentResults.length > 0;
      const matchesStatus = studentStatusFilter === 'all' || (studentStatusFilter === 'belum_tes' && !hasTakenTest);

      return matchesSearch && matchesClass && matchesStatus;
    })
    .sort((a, b) => {
      // Sort by class first (e.g., 7A, 7B, 8A...)
      const classCompare = a.className.localeCompare(b.className, undefined, { numeric: true, sensitivity: 'base' });
      if (classCompare !== 0) return classCompare;
      
      // Then by number (e.g., 1, 2, 3...)
      const numA = parseInt(a.number) || 0;
      const numB = parseInt(b.number) || 0;
      if (numA !== numB) return numA - numB;
      
      // Fallback to string comparison if numbers are same or invalid
      return a.number.localeCompare(b.number, undefined, { numeric: true });
    });

  const handleExportStudents = () => {
    const data = students.map(s => ({
      "No": s.number,
      "NISN": s.nisn || '',
      "Nama Siswa": s.name,
      "Kelas": s.className
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Siswa");
    XLSX.writeFile(workbook, `data_siswa_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleDeleteAllStudents = async () => {
    try {
      const batch = students.map(s => deleteDoc(doc(db, 'students', s.id!)));
      await Promise.all(batch);
      setConfirmDelete(null);
      showToast('Semua data siswa berhasil dihapus.', 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'students');
    }
  };

  const handleDeleteResult = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'test_results', id));
      setConfirmDelete(null);
      showToast('Hasil tes berhasil dihapus.', 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `test_results/${id}`);
    }
  };

  const handleDeleteAllResultsForStudent = async (studentId: string, studentName: string, studentClass: string) => {
    const studentResults = results.filter(r => r.studentId === studentId || (r.studentName === studentName && r.studentClass === studentClass));
    try {
      const batch = studentResults.map(r => deleteDoc(doc(db, 'test_results', r.id!)));
      await Promise.all(batch);
      setConfirmDelete(null);
      showToast(`Semua hasil tes ${studentName} berhasil dihapus.`, 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'test_results');
    }
  };

  const handleDeleteAllResultsForGuest = async (name: string) => {
    const registeredClassNames = classes.map(c => c.name);
    const guestResults = results.filter(r => !registeredClassNames.includes(r.studentClass) && r.studentName === name);
    try {
      const batch = guestResults.map(r => deleteDoc(doc(db, 'test_results', r.id!)));
      await Promise.all(batch);
      setConfirmDelete(null);
      showToast(`Semua hasil tes tamu ${name} berhasil dihapus.`, 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'test_results');
    }
  };

  const registeredClassNames = classes.map(c => c.name);

  const filteredResults = results.filter(r => {
    const matchesClass = selectedClass === 'all' 
      ? registeredClassNames.includes(r.studentClass) 
      : r.studentClass === selectedClass;
    const matchesName = r.studentName.toLowerCase().includes(filterName.toLowerCase());
    const matchesType = filterType === 'all' || r.testType === filterType;
    const matchesDate = !filterDate || new Date(r.timestamp?.seconds * 1000).toLocaleDateString() === new Date(filterDate).toLocaleDateString();
    return matchesClass && matchesName && matchesType && matchesDate;
  });

  const tableFilteredResults = results
    .filter(r => {
      // Only registered students
      if (!registeredClassNames.includes(r.studentClass)) return false;
      
      const matchesClass = tableClassFilter === 'all' || r.studentClass === tableClassFilter;
      const matchesName = r.studentName.toLowerCase().includes(historySearch.toLowerCase());
      const matchesType = tableTypeFilter === 'all' || r.testType === tableTypeFilter;
      const matchesDate = !historyDate || new Date(r.timestamp?.seconds * 1000).toLocaleDateString() === new Date(historyDate).toLocaleDateString();
      
      return matchesClass && matchesName && matchesType && matchesDate;
    })
    .sort((a, b) => {
      // Sort by class first (e.g., 7A, 7B, 8A, 8B or VIIA, VIIB...)
      const classCompare = a.studentClass.localeCompare(b.studentClass, undefined, { numeric: true, sensitivity: 'base' });
      if (classCompare !== 0) return classCompare;
      
      // Then by student name alphabetically
      return a.studentName.localeCompare(b.studentName, undefined, { sensitivity: 'base' });
    });

  const handleSaveTeacherSettings = async () => {
    try {
      await setDoc(doc(db, 'teacher_settings', user.uid), {
        name: teacherName,
        nip: teacherNip,
        schoolName,
        schoolAddress,
        pemdaName,
        dinasName
      });
      showToast('Data Guru BK berhasil disimpan!', 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'teacher_settings');
    }
  };

  const handleAddStudent = async () => {
    if (!newStudentName || !newStudentClass) {
      showToast("Nama dan Kelas wajib diisi.", "error");
      return;
    }

    if (newStudentNisn) {
      if (!/^\d+$/.test(newStudentNisn)) {
        showToast("NISN hanya boleh berisi angka.", "error");
        return;
      }
      
      const isDuplicate = students.some(s => s.nisn === newStudentNisn);
      if (isDuplicate) {
        showToast("NISN sudah terdaftar.", "error");
        return;
      }
    }

    try {
      await addDoc(collection(db, 'students'), {
        number: newStudentNumber,
        nisn: newStudentNisn,
        name: newStudentName,
        className: newStudentClass,
        addedBy: user.uid
      });
      setNewStudentNumber('');
      setNewStudentNisn('');
      setNewStudentName('');
      setNewStudentClass('');
      showToast("Siswa berhasil ditambahkan.", "success");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'students');
    }
  };

  const handleDownloadTemplate = () => {
    const data = [
      { "No": 1, "NISN": "0012345678", "Nama Siswa": "Budi Santoso", "Kelas": "IX-A" },
      { "No": 2, "NISN": "0087654321", "Nama Siswa": "Siti Aminah", "Kelas": "IX-A" }
    ];
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template Siswa");
    XLSX.writeFile(workbook, "template_siswa.xlsx");
  };

  const handleUploadStudents = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const data = new Uint8Array(event.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];
      
      let successCount = 0;
      const newIds: string[] = [];
      for (const row of jsonData) {
        const number = row["No"] || row["Nomor"] || "";
        const nisn = row["NISN"] ? String(row["NISN"]) : "";
        const name = row["Nama Siswa"] || row["Nama"];
        const className = row["Kelas"];
        
        if (name && className) {
          // Skip if NISN is provided and already exists in the database
          if (nisn && students.some(s => s.nisn === nisn)) {
            continue;
          }

          try {
            const docRef = await addDoc(collection(db, 'students'), {
              number: String(number),
              nisn: nisn,
              name: String(name),
              className: String(className),
              addedBy: user.uid
            });
            newIds.push(docRef.id);
            successCount++;
          } catch (error) {
            console.error("Error uploading student:", error);
          }
        }
      }
      setRecentlyAddedIds(newIds);
      setUploadSummary({ total: jsonData.length, success: successCount });
      setActiveTab('students');
      setTimeout(() => {
        setUploadSummary(null);
        setRecentlyAddedIds([]);
      }, 10000);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDeleteStudent = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'students', id));
      setConfirmDelete(null);
      showToast('Data siswa berhasil dihapus.', 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'students');
    }
  };

  // Aggregated data for class report
  const getClassAggregatedData = () => {
    if (filterType === 'all') return [];
    
    const aggregated: Record<string, number> = {};
    filteredResults.forEach(r => {
      if (r.testType === filterType) {
        Object.entries(r.scores).forEach(([key, val]) => {
          aggregated[key] = (aggregated[key] || 0) + val;
        });
      }
    });

    return Object.entries(aggregated).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
      value: Math.round(value / (filteredResults.filter(r => r.testType === filterType).length || 1))
    }));
  };

  const classChartData = getClassAggregatedData();
  const COLORS = ['#059669', '#10b981', '#0d9488', '#14b8a6', '#16a34a', '#22c55e', '#65a30d', '#84cc16'];

  const getComparisonData = () => {
    if (filterType === 'all') return [];
    
    const classAverages: { name: string, value: number }[] = [];
    const classesWithData = Array.from(new Set(results.filter(r => r.testType === filterType).map(r => r.studentClass))).filter(Boolean).sort();
    
    classesWithData.forEach(className => {
      const classResults = results.filter(r => r.studentClass === className && r.testType === filterType);
      if (classResults.length > 0) {
        let totalScore = 0;
        classResults.forEach(r => {
          const studentAvg = Object.values(r.scores).reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0) / (Object.keys(r.scores).length || 1);
          totalScore += studentAvg;
        });
        classAverages.push({
          name: className,
          value: parseFloat((totalScore / classResults.length).toFixed(1))
        });
      }
    });
    
    return classAverages;
  };

  const classComparisonData = getComparisonData();

  const handleGenerateClassAnalysis = async () => {
    if (filterType === 'all') {
      showToast('Pilih jenis tes terlebih dahulu untuk membuat analisis kelas.', 'info');
      return;
    }
    
    setIsGeneratingClassAnalysis(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      let prompt = `Berdasarkan data agregat hasil tes psikologi untuk kelas berikut:
Kelas: ${selectedClass === 'all' ? 'Semua Kelas' : selectedClass}
Jenis Tes: ${TESTS[filterType as TestType]?.title || filterType}
Distribusi Rata-rata Skor: ${JSON.stringify(classChartData)}
${selectedClass === 'all' ? `Perbandingan Rata-rata Skor Antar Kelas: ${JSON.stringify(classComparisonData)}` : ''}

Berikan analisis mendalam mengenai karakteristik kelas ini berdasarkan hasil tes tersebut. ${selectedClass === 'all' ? 'Fokuskan pada tren kinerja antar kelas dan bandingkan performanya.' : ''} Apa kekuatan utama kelas ini? Apa area yang perlu mendapat perhatian lebih dari guru? Berikan rekomendasi strategi pembelajaran atau pendekatan bimbingan yang cocok untuk mayoritas siswa di kelas ini. Gunakan bahasa Indonesia yang profesional, mudah dipahami, dan format Markdown yang rapi.`;

      if (filterType === 'iq_wais') {
         prompt = `Berdasarkan data agregat hasil tes IQ WAIS untuk kelas berikut:
Kelas: ${selectedClass === 'all' ? 'Semua Kelas' : selectedClass}
Jenis Tes: ${TESTS[filterType as TestType]?.title || filterType}
Rata-rata Skor Subtes (Verbal, Perseptual, Memori Kerja): ${JSON.stringify(classChartData)}

Berikan analisis mendalam mengenai profil kognitif kelas ini berdasarkan rata-rata skor subtes tersebut. 
- Kekuatan kognitif utama kelas ini (misalnya: apakah lebih kuat di verbal, perseptual, atau memori kerja?)
- Area kognitif yang perlu mendapat perhatian lebih.
- Rekomendasi strategi pembelajaran yang disesuaikan dengan profil kognitif kelas ini (misalnya: jika kuat di verbal, gunakan metode diskusi; jika kuat di perseptual, gunakan media visual).
Gunakan bahasa Indonesia yang profesional, mudah dipahami, dan format Markdown yang rapi.`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setClassAnalysis(response.text || '');
      showToast('Analisis kelas berhasil dibuat!', 'success');
    } catch (error) {
      console.error("Class Analysis Error:", error);
      showToast("Gagal mendapatkan analisis kelas. Silakan coba lagi.", 'error');
    } finally {
      setIsGeneratingClassAnalysis(false);
    }
  };

  const handleUpdateStudent = async () => {
    if (!editingStudent || !editingStudent.name.trim() || !editingStudent.className.trim()) return;
    try {
      await updateDoc(doc(db, 'students', editingStudent.id!), {
        number: editingStudent.number,
        nisn: editingStudent.nisn,
        name: editingStudent.name,
        className: editingStudent.className
      });
      setEditingStudent(null);
      showToast('Data siswa berhasil diperbarui.', 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'students');
    }
  };

  // Aggregated data for charts
  const testTypeCounts = filteredResults.reduce((acc, curr) => {
    acc[curr.testType] = (acc[curr.testType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(testTypeCounts).map(([name, value]) => ({ 
    name: TESTS[name as TestType]?.title || name, 
    value 
  }));

  // Calculate summary stats (Registered Students Only)
  const registeredResults = results.filter(r => registeredClassNames.includes(r.studentClass));
  const totalTests = registeredResults.length;
  const uniqueStudents = new Set(registeredResults.map(r => r.studentId)).size;
  
  // Find most frequent test type
  const mostFrequentTest = Object.entries(testTypeCounts).sort((a, b) => b[1] - a[1])[0];
  const mostFrequentTestType = mostFrequentTest ? mostFrequentTest[0] : null;
  
  // Calculate average score for most frequent test
  const frequentTestResults = registeredResults.filter(r => r.testType === mostFrequentTestType);
  const avgScore = frequentTestResults.length > 0
    ? (frequentTestResults.reduce((acc, curr) => {
        const totalScore = Object.values(curr.scores).reduce((a, b) => a + b, 0);
        return acc + totalScore;
      }, 0) / frequentTestResults.length).toFixed(1)
    : '0';

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar 17% */}
      <div className="w-[17%] min-w-[260px] bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 text-white flex flex-col shadow-2xl z-10">
        <div className="p-6 border-b border-emerald-700/50 bg-gradient-to-br from-emerald-500/20 to-transparent">
          <h2 className="text-2xl font-black tracking-tight truncate text-emerald-50">PsikoTest</h2>
          <div className="mt-3 flex justify-start">
            <img src="https://lh3.googleusercontent.com/d/1UNix_IGpjmt2q0apsIQy-6s3Zr9SnLJ9" alt="Dutatama Logo" className="w-32 h-auto opacity-90 hover:opacity-100 transition-opacity cursor-pointer" referrerPolicy="no-referrer" />
          </div>
          <p className="text-[10px] text-emerald-200/60 truncate mt-3 font-medium opacity-80">{user.email}</p>
        </div>
        <div className="flex-1 overflow-y-auto py-6 space-y-1.5 px-4">
          <button onClick={() => setActiveTab('dashboard')} className={cn("w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-black transition-all tracking-wide cursor-pointer", activeTab === 'dashboard' ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950/40 border border-emerald-500/30" : "text-emerald-100/70 hover:bg-emerald-800/50 hover:text-white")}>
            <LayoutDashboard className="w-4 h-4" /> DASHBOARD
          </button>
          <button onClick={() => setActiveTab('students')} className={cn("w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-black transition-all tracking-wide cursor-pointer", activeTab === 'students' ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950/40 border border-emerald-500/30" : "text-emerald-100/70 hover:bg-emerald-800/50 hover:text-white")}>
            <GraduationCap className="w-4 h-4" /> MANAJEMEN SISWA
          </button>
          <button onClick={() => setActiveTab('monitor')} className={cn("w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-black transition-all tracking-wide cursor-pointer", activeTab === 'monitor' ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950/40 border border-emerald-500/30" : "text-emerald-100/70 hover:bg-emerald-800/50 hover:text-white")}>
            <Monitor className="w-4 h-4" /> MONITOR SISWA
          </button>
          <button onClick={() => setActiveTab('history')} className={cn("w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-black transition-all tracking-wide cursor-pointer", activeTab === 'history' ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950/40 border border-emerald-500/30" : "text-emerald-100/70 hover:bg-emerald-800/50 hover:text-white")}>
            <History className="w-4 h-4" /> RIWAYAT TES SISWA
          </button>
          <button onClick={() => setActiveTab('recap')} className={cn("w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-black transition-all tracking-wide cursor-pointer", activeTab === 'recap' ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950/40 border border-emerald-500/30" : "text-emerald-100/70 hover:bg-emerald-800/50 hover:text-white")}>
            <FileText className="w-4 h-4" /> REKAP HASIL TES SISWA
          </button>
          <button onClick={() => setActiveTab('hasil-tes')} className={cn("w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-black transition-all tracking-wide cursor-pointer", activeTab === 'hasil-tes' ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950/40 border border-emerald-500/30" : "text-emerald-100/70 hover:bg-emerald-800/50 hover:text-white")}>
            <ClipboardCheck className="w-4 h-4" /> HASIL TES SISWA
          </button>
          <button onClick={() => setActiveTab('report')} className={cn("w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-black transition-all tracking-wide cursor-pointer", activeTab === 'report' ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950/40 border border-emerald-500/30" : "text-emerald-100/70 hover:bg-emerald-800/50 hover:text-white")}>
            <BarChart3 className="w-4 h-4" /> LAPORAN KELAS
          </button>
          <button onClick={() => setActiveTab('manajemen-tamu')} className={cn("w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-black transition-all tracking-wide cursor-pointer", activeTab === 'manajemen-tamu' ? "bg-amber-900/60 text-[#FFC30B] shadow-lg shadow-amber-950/40 border border-[#FFC30B]/30" : "text-[#FFC30B] hover:bg-amber-900/40")}>
            <Users className="w-4 h-4" /> MANAJEMEN PESERTA UMUM
          </button>
          <button onClick={() => setActiveTab('tamu')} className={cn("w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-black transition-all tracking-wide cursor-pointer", activeTab === 'tamu' ? "bg-amber-900/60 text-[#FFC30B] shadow-lg shadow-amber-950/40 border border-[#FFC30B]/30" : "text-[#FFC30B] hover:bg-amber-900/40")}>
            <Compass className="w-4 h-4" /> RIWAYAT PESERTA UMUM
          </button>
          <button onClick={() => setActiveTab('recap-tamu')} className={cn("w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-black transition-all tracking-wide cursor-pointer", activeTab === 'recap-tamu' ? "bg-amber-900/60 text-[#FFC30B] shadow-lg shadow-amber-950/40 border border-[#FFC30B]/30" : "text-[#FFC30B] hover:bg-amber-900/40")}>
            <ClipboardCheck className="w-4 h-4" /> REKAP PESERTA UMUM
          </button>
          <button onClick={() => setActiveTab('hasil-tes-tamu')} className={cn("w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-black transition-all tracking-wide cursor-pointer", activeTab === 'hasil-tes-tamu' ? "bg-amber-900/60 text-[#FFC30B] shadow-lg shadow-amber-950/40 border border-[#FFC30B]/30" : "text-[#FFC30B] hover:bg-amber-900/40")}>
            <ClipboardCheck className="w-4 h-4" /> HASIL TEST PESERTA UMUM
          </button>
          <button onClick={() => setActiveTab('teacher')} className={cn("w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-black transition-all tracking-wide cursor-pointer", activeTab === 'teacher' ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950/40 border border-emerald-500/30" : "text-emerald-100/70 hover:bg-emerald-800/50 hover:text-white")}>
            <UserIcon className="w-4 h-4" /> DATA GURU BK
          </button>
        </div>
        <div className="p-6 border-t border-emerald-700/50 space-y-3">
          <button onClick={() => setView('create-test')} className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-emerald-500 hover:bg-emerald-400 rounded-xl text-xs font-black transition-all text-white shadow-xl shadow-emerald-950/30 cursor-pointer">
            <Plus className="w-4 h-4" /> BUAT TES KUSTOM
          </button>
        </div>
      </div>

      {/* Main Content 83% */}
      <div className="w-[83%] flex-1 overflow-y-auto p-8 bg-slate-50/50">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header Title based on activeTab */}
          <div className="bg-emerald-500 p-6 rounded-2xl border border-emerald-600 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                {activeTab === 'dashboard' && 'Dashboard Utama'}
                {activeTab === 'history' && 'Riwayat Tes Siswa'}
                {activeTab === 'students' && 'Manajemen Siswa'}
                {activeTab === 'teacher' && 'Data Guru BK'}
                {activeTab === 'report' && 'Laporan Siswa'}
                {activeTab === 'recap' && 'Rekap Hasil Tes Siswa'}
                {activeTab === 'recap-tamu' && 'Rekap Peserta Umum'}
                {activeTab === 'hasil-tes-tamu' && 'Hasil Test Peserta Umum'}
                {activeTab === 'manajemen-tamu' && 'Manajemen Peserta Umum'}
                {activeTab === 'tamu' && 'Riwayat Peserta Umum'}
                {activeTab === 'monitor' && 'Monitor Siswa'}
                {activeTab === 'hasil-tes' && 'Hasil Tes Psikologi'}
              </h2>
              <p className="text-sm text-emerald-50 mt-1 font-medium">
                {activeTab === 'dashboard' && 'Ringkasan statistik dan distribusi tes.'}
                {activeTab === 'history' && 'Daftar lengkap hasil tes siswa beserta filter pencarian.'}
                {activeTab === 'students' && 'Kelola data siswa, tambah, edit, atau hapus.'}
                {activeTab === 'teacher' && 'Pengaturan profil Guru BK untuk laporan.'}
                {activeTab === 'report' && 'Analisis hasil tes per kelas dengan bantuan AI.'}
                {activeTab === 'recap' && 'Rekapitulasi seluruh hasil tes siswa dalam bentuk tabel.'}
                {activeTab === 'recap-tamu' && 'Tabel rekapitulasi hasil tes peserta umum.'}
                {activeTab === 'hasil-tes-tamu' && 'Rangkuman hasil akhir seluruh tes psikologi peserta umum.'}
                {activeTab === 'manajemen-tamu' && 'Kelola data peserta umum yang tidak terdaftar di Manajemen Siswa.'}
                {activeTab === 'tamu' && 'Kelola riwayat hasil tes untuk peserta umum.'}
                {activeTab === 'monitor' && 'Pantau status pengerjaan tes siswa.'}
                {activeTab === 'hasil-tes' && 'Rangkuman hasil akhir seluruh tes psikologi siswa.'}
              </p>
            </div>
          </div>

          {activeTab === 'dashboard' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
                  <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0">
                    <ClipboardCheck className="w-7 h-7 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Tes</p>
                    <h4 className="text-3xl font-black text-slate-900">{totalTests}</h4>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
                  <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center shrink-0">
                    <Users className="w-7 h-7 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Siswa Unik</p>
                    <h4 className="text-3xl font-black text-slate-900">{uniqueStudents}</h4>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
                  <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0">
                    <BarChart3 className="w-7 h-7 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Rata-rata Skor*</p>
                    <h4 className="text-3xl font-black text-slate-900">{avgScore}</h4>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">*Populer: {mostFrequentTestType?.replace('_', ' ') || '-'}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-base font-bold text-slate-900 mb-6">Distribusi Tes (Terfilter)</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={pieData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" fontSize={11} tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                        <YAxis fontSize={11} tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                        <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={60}>
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                  <h3 className="text-base font-bold text-slate-900 mb-6">Statistik Cepat</h3>
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg text-emerald-600 shadow-sm border border-slate-200">
                          <Users className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-slate-700 text-sm">Total Kelas</span>
                      </div>
                      <span className="text-lg font-black text-emerald-600">{classes.length}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg text-teal-600 shadow-sm border border-slate-200">
                          <GraduationCap className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-slate-700 text-sm">Siswa Terdaftar</span>
                      </div>
                      <span className="text-lg font-black text-teal-600">{students.length}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg text-emerald-600 shadow-sm border border-slate-200">
                          <ClipboardCheck className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-slate-700 text-sm">Hasil Terfilter</span>
                      </div>
                      <span className="text-lg font-black text-emerald-600">{filteredResults.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <div className="flex flex-wrap gap-4 items-center justify-between">
                  <div className="flex flex-wrap gap-3">
                    <div className="flex-1 min-w-[200px] relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Cari nama siswa..." 
                        value={historySearch}
                        onChange={(e) => setHistorySearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-600 outline-none text-sm font-medium"
                      />
                    </div>
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                      <Filter className="w-4 h-4 text-slate-400" />
                      <select 
                        value={tableTypeFilter}
                        onChange={(e) => setTableTypeFilter(e.target.value)}
                        className="bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700 pr-6 py-1 outline-none"
                      >
                        <option value="all">Semua Tes</option>
                        {Object.keys(TESTS).map(type => (
                          <option key={type} value={type}>{TESTS[type as TestType].title}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <input 
                        type="date" 
                        value={historyDate}
                        onChange={(e) => setHistoryDate(e.target.value)}
                        className="bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700 py-1 outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                      <Users className="w-4 h-4 text-slate-400" />
                      <select
                        value={tableClassFilter}
                        onChange={(e) => setTableClassFilter(e.target.value)}
                        className="bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700 pr-6 py-1 outline-none"
                      >
                        <option value="all">Semua Kelas</option>
                        {classes.map(c => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-500 bg-slate-200/50 px-3 py-1.5 rounded-lg">{tableFilteredResults.length} hasil ditemukan</span>
                </div>
              </div>
              <div className="overflow-x-auto" style={{ transform: 'rotateX(180deg)' }}>
                <div style={{ transform: 'rotateX(180deg)' }}>
                  <table className="w-full text-left">
                  <thead className="bg-white border-b border-slate-100 text-slate-500 text-[10px] uppercase tracking-widest font-black">
                    <tr>
                      <th className="px-6 py-4">Siswa</th>
                      <th className="px-6 py-4">Kelas</th>
                      <th className="px-6 py-4">ALAMAT EMAIL</th>
                      <th className="px-6 py-4">Jenis Tes</th>
                      <th className="px-6 py-4">Tanggal</th>
                      <th className="px-6 py-4">Waktu</th>
                      <th className="px-6 py-4">Hasil Tes</th>
                      <th className="px-6 py-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {tableFilteredResults.map((r, i) => (
                      <tr key={r.id || i} className="hover:bg-slate-50/80 transition-colors text-sm">
                        <td className="px-6 py-4 font-bold text-slate-900">
                          <button 
                            onClick={() => setTestResult(r)}
                            className="hover:text-emerald-600 hover:underline text-left"
                          >
                            {r.studentName}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-medium">{r.studentClass || '-'}</td>
                        <td className="px-6 py-4 text-slate-500 font-medium">{r.studentEmail || allUsers.find(u => u.uid === r.studentId)?.email || '-'}</td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-black border border-emerald-100/50 tracking-wide">
                            {TESTS[r.testType]?.title || r.testType}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-medium">
                          {r.timestamp ? new Date(r.timestamp.seconds * 1000).toLocaleDateString('id-ID') : '-'}
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-medium">
                          {r.timestamp ? new Date(r.timestamp.seconds * 1000).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg inline-block border border-emerald-100">
                            {getShortResult(r.testType, r.scores)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => {
                                const student = students.find(s => s.id === r.studentId || (s.name === r.studentName && s.className === r.studentClass));
                                if (student) {
                                  setEditingStudent(student);
                                  setActiveTab('students');
                                } else {
                                  showToast('Data siswa tidak ditemukan.', 'error');
                                }
                              }}
                              className="text-emerald-600 hover:text-emerald-800 p-2 rounded-lg hover:bg-emerald-50 transition-colors flex items-center gap-1.5 border border-transparent hover:border-emerald-100"
                              title="Edit Data Siswa"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => setTestResult(r)}
                              className="text-emerald-600 hover:text-emerald-800 p-2 rounded-lg hover:bg-emerald-50 transition-colors flex items-center gap-1.5 border border-transparent hover:border-emerald-100"
                              title="Lihat Hasil Tes"
                            >
                              <FileText className="w-4 h-4" />
                              <span className="font-bold text-[10px]">LIHAT</span>
                            </button>
                            <button 
                              onClick={() => r.id && setConfirmDelete({
                                id: r.id,
                                type: 'result',
                                title: 'Hapus Hasil Tes',
                                message: `Hapus hasil tes ${r.studentName}?`
                              })}
                              className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1.5 border border-transparent hover:border-red-100"
                              title="Hapus Hasil Tes"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {tableFilteredResults.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center text-slate-400 text-sm font-medium">Tidak ada hasil yang cocok dengan filter.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'students' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-black tracking-wide border border-emerald-100">
                    {students.length} SISWA TERDAFTAR
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={handleExportStudents}
                    className="px-4 py-2 bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-bold text-xs hover:bg-slate-100 flex items-center gap-2 transition-colors"
                    title="Export Data ke Excel"
                  >
                    <Share2 className="w-4 h-4" /> EXPORT
                  </button>
                  <button 
                    onClick={handleDownloadTemplate}
                    className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-bold text-xs hover:bg-emerald-100 flex items-center gap-2 transition-colors"
                  >
                    <Download className="w-4 h-4" /> TEMPLATE
                  </button>
                  <label className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-bold text-xs hover:bg-emerald-100 flex items-center gap-2 cursor-pointer transition-colors">
                    <Upload className="w-4 h-4" /> UPLOAD
                    <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleUploadStudents} />
                  </label>
                  <button 
                    onClick={() => setConfirmDelete({
                      id: 'all',
                      type: 'all_students',
                      title: 'Hapus Semua Siswa',
                      message: 'Apakah Anda yakin ingin menghapus SEMUA data siswa? Tindakan ini tidak dapat dibatalkan.'
                    })}
                    className="px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-xl font-bold text-xs hover:bg-red-100 flex items-center gap-2 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> HAPUS SEMUA
                  </button>
                </div>
              </div>

              {uploadSummary && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center gap-3 text-emerald-800 text-sm shadow-sm"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="font-bold">Berhasil mengupload {uploadSummary.success} dari {uploadSummary.total} baris data.</span>
                </motion.div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="Cari nama, kelas, atau nomor..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-600 outline-none text-sm font-medium"
                  />
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                  <div className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl flex items-center gap-2 min-w-[110px] shadow-sm">
                    <Users className="w-4 h-4 text-slate-400" />
                    <div className="flex flex-col">
                      <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none">JUMLAH SISWA</span>
                      <span className="text-sm font-bold text-emerald-600 leading-none mt-0.5">{filteredStudents.length}</span>
                    </div>
                  </div>
                  <select 
                    value={studentStatusFilter}
                    onChange={(e) => setStudentStatusFilter(e.target.value)}
                    className="w-full sm:w-48 px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-600 outline-none text-sm font-bold text-slate-700 bg-white"
                  >
                    <option value="all">SEMUA STATUS</option>
                    <option value="belum_tes">BELUM IKUT TES</option>
                  </select>
                  <select 
                    value={studentClassFilter}
                    onChange={(e) => setStudentClassFilter(e.target.value)}
                    className="w-full sm:w-48 px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-600 outline-none text-sm font-bold text-slate-700 bg-white"
                  >
                    <option value="all">SEMUA KELAS</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-emerald-50/30 p-5 rounded-2xl border border-emerald-100">
                <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-emerald-600" /> Tambah Siswa Baru
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                  <input 
                    type="text" 
                    placeholder="No/NIS" 
                    value={newStudentNumber}
                    onChange={(e) => setNewStudentNumber(e.target.value)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm font-medium focus:ring-2 focus:ring-emerald-600"
                  />
                  <input 
                    type="text" 
                    placeholder="NISN" 
                    value={newStudentNisn}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || /^\d+$/.test(val)) {
                        setNewStudentNisn(val);
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm font-medium focus:ring-2 focus:ring-emerald-600"
                  />
                  <input 
                    type="text" 
                    placeholder="Nama Lengkap Siswa" 
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm font-medium focus:ring-2 focus:ring-emerald-600"
                  />
                  <input 
                    type="text" 
                    placeholder="KELAS" 
                    value={newStudentClass}
                    onChange={(e) => setNewStudentClass(e.target.value)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-600 bg-white"
                  />
                  <button 
                    onClick={handleAddStudent}
                    className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-emerald-700 flex items-center justify-center gap-2 text-sm shadow-sm transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Tambah Siswa
                  </button>
                </div>
              </div>

              <div className="max-h-[500px] overflow-y-auto border border-slate-200 rounded-2xl shadow-sm">
                <div className="overflow-x-auto" style={{ transform: 'rotateX(180deg)' }}>
                  <div style={{ transform: 'rotateX(180deg)' }}>
                    <table className="w-full text-left">
                  <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200">
                    <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      <th className="px-6 py-4">No</th>
                      <th className="px-6 py-4">NISN</th>
                      <th className="px-6 py-4">Nama Siswa</th>
                      <th className="px-6 py-4">Kelas</th>
                      <th className="px-6 py-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((s, idx) => (
                        <tr 
                          key={s.id || idx} 
                          className={cn(
                            "text-sm transition-colors",
                            recentlyAddedIds.includes(s.id!) ? "bg-emerald-50/50" : "hover:bg-slate-50/80"
                          )}
                        >
                          {editingStudent?.id === s.id ? (
                            <>
                              <td className="px-6 py-3">
                                <input 
                                  type="text" 
                                  value={editingStudent.number}
                                  onChange={(e) => setEditingStudent({ ...editingStudent, number: e.target.value })}
                                  className="w-full px-3 py-1.5 rounded-lg border border-emerald-300 outline-none text-xs font-mono"
                                />
                              </td>
                              <td className="px-6 py-3">
                                <input 
                                  type="text" 
                                  value={editingStudent.nisn}
                                  onChange={(e) => setEditingStudent({ ...editingStudent, nisn: e.target.value })}
                                  className="w-full px-3 py-1.5 rounded-lg border border-emerald-300 outline-none text-xs font-mono"
                                />
                              </td>
                              <td className="px-6 py-3">
                                <input 
                                  type="text" 
                                  value={editingStudent.name}
                                  onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                                  className="w-full px-3 py-1.5 rounded-lg border border-emerald-300 outline-none text-sm font-bold"
                                />
                              </td>
                              <td className="px-6 py-3">
                                <select 
                                  value={editingStudent.className}
                                  onChange={(e) => setEditingStudent({ ...editingStudent, className: e.target.value })}
                                  className="w-full px-3 py-1.5 rounded-lg border border-emerald-300 outline-none text-sm font-bold"
                                >
                                  {classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                </select>
                              </td>
                              <td className="px-6 py-3 text-right">
                                <div className="flex justify-end gap-2">
                                  <button onClick={handleUpdateStudent} className="text-emerald-600 hover:bg-emerald-50 p-2 rounded-lg transition-colors" title="Simpan">
                                    <Save className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => setEditingStudent(null)} className="text-slate-400 hover:bg-slate-100 p-2 rounded-lg transition-colors" title="Batal">
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-6 py-4 font-mono text-xs text-slate-500">{s.number}</td>
                              <td className="px-6 py-4 font-mono text-xs text-slate-500">{s.nisn}</td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900">{s.name}</span>
                                  {recentlyAddedIds.includes(s.id!) && (
                                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase rounded-md tracking-wider">Baru</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-slate-600 font-medium">{s.className}</td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                  <button 
                                    onClick={() => setEditingStudent(s)}
                                    className="text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 p-2 rounded-lg transition-colors"
                                    title="Edit Siswa"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => setConfirmDelete({
                                      id: s.id!,
                                      type: 'student',
                                      title: 'Hapus Siswa',
                                      message: `Hapus data siswa ${s.name}?`
                                    })} 
                                    className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                    title="Hapus Siswa"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-sm font-medium">
                          {studentSearch ? 'Tidak ada kecocokan.' : 'Belum ada data siswa.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                </div>
              </div>
            </div>
            </motion.div>
          )}

          {activeTab === 'teacher' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-3xl space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">Nama Guru BK</label>
                  <input 
                    type="text" 
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-600 outline-none text-sm font-medium bg-slate-50 focus:bg-white transition-colors"
                    placeholder="Nama Lengkap & Gelar"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">NIP</label>
                  <input 
                    type="text" 
                    value={teacherNip}
                    onChange={(e) => setTeacherNip(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-600 outline-none text-sm font-medium bg-slate-50 focus:bg-white transition-colors"
                    placeholder="Nomor Induk Pegawai"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">Nama Sekolah</label>
                  <input 
                    type="text" 
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-600 outline-none text-sm font-medium bg-slate-50 focus:bg-white transition-colors"
                    placeholder="Contoh: SMP Negeri 1 Jakarta"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">Alamat Sekolah</label>
                  <input 
                    type="text" 
                    value={schoolAddress}
                    onChange={(e) => setSchoolAddress(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-600 outline-none text-sm font-medium bg-slate-50 focus:bg-white transition-colors"
                    placeholder="Alamat lengkap sekolah"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">Nama Pemda (Opsional)</label>
                  <input 
                    type="text" 
                    value={pemdaName}
                    onChange={(e) => setPemdaName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-600 outline-none text-sm font-medium bg-slate-50 focus:bg-white transition-colors"
                    placeholder="Contoh: PEMERINTAH PROVINSI DKI JAKARTA"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">Nama Dinas (Opsional)</label>
                  <input 
                    type="text" 
                    value={dinasName}
                    onChange={(e) => setDinasName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-600 outline-none text-sm font-medium bg-slate-50 focus:bg-white transition-colors"
                    placeholder="Contoh: DINAS PENDIDIKAN"
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <button 
                  onClick={handleSaveTeacherSettings}
                  className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 flex items-center gap-2 text-sm shadow-md shadow-emerald-200 transition-all"
                >
                  <Save className="w-4 h-4" /> Simpan Pengaturan
                </button>
              </div>

              <div className="pt-8 mt-8 border-t border-slate-200">
                <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-emerald-600" /> GANTI AKUN
                </h3>
                <p className="text-sm text-slate-500 mb-6 font-medium">Ganti email akun admin Anda. Masukkan password untuk melanjutkan.</p>
                
                {!showChangeAccountForm ? (
                  <div className="flex items-center gap-4 max-w-md">
                    <div className="relative flex-1">
                      <input 
                        type={showPassword ? "text" : "password"}
                        value={changeAccountPassword}
                        onChange={(e) => setChangeAccountPassword(e.target.value)}
                        placeholder="Masukkan Password"
                        className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-600 outline-none text-sm font-medium bg-slate-50 focus:bg-white transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <button 
                      onClick={() => {
                        if (changeAccountPassword === '@dutatama220469') {
                          setShowChangeAccountForm(true);
                          setChangeAccountPassword('');
                          setShowPassword(false);
                        } else {
                          showToast('Password salah!', 'error');
                        }
                      }}
                      className="bg-slate-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-900 transition-all text-sm"
                    >
                      Verifikasi
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 max-w-md bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <div className="space-y-2">
                      <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">Akun Lama</label>
                      <input 
                        type="text" 
                        value={user.email}
                        disabled
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 text-sm font-medium cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">Akun Baru</label>
                      <input 
                        type="email" 
                        value={newAdminEmail}
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                        placeholder="Email admin baru"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-600 outline-none text-sm font-medium bg-white transition-colors"
                      />
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                      <button 
                        onClick={async () => {
                          if (!newAdminEmail) return;
                          if (!auth.currentUser) return;
                          
                          setIsChangingAccount(true);
                          try {
                            await updateEmail(auth.currentUser, newAdminEmail);
                            await updateDoc(doc(db, 'users', user.uid), { email: newAdminEmail });
                            showToast('Berhasil mengganti akun admin!', 'success');
                            setShowChangeAccountForm(false);
                            setNewAdminEmail('');
                          } catch (error: any) {
                            console.error(error);
                            if (error.code === 'auth/requires-recent-login') {
                              showToast('Gagal: Silakan logout dan login kembali sebelum mengganti akun.', 'error');
                            } else {
                              showToast('Gagal mengganti akun. Pastikan format email benar.', 'error');
                            }
                          } finally {
                            setIsChangingAccount(false);
                          }
                        }}
                        disabled={isChangingAccount || !newAdminEmail}
                        className="flex-1 bg-emerald-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all text-sm disabled:opacity-50 flex justify-center items-center gap-2"
                      >
                        {isChangingAccount ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          'GANTI'
                        )}
                      </button>
                      <button 
                        onClick={() => {
                          setShowChangeAccountForm(false);
                          setNewAdminEmail('');
                        }}
                        disabled={isChangingAccount}
                        className="flex-1 bg-white text-slate-700 border border-slate-200 px-4 py-3 rounded-xl font-bold hover:bg-slate-50 transition-all text-sm disabled:opacity-50"
                      >
                        BATAL
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-200 w-full">
                  <h3 className="text-sm font-black text-slate-900 mb-2 flex items-center gap-2 uppercase tracking-wider">
                    <Info className="w-4 h-4 text-emerald-600" /> Pengembang Aplikasi
                  </h3>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                    Aplikasi ini di desain & dikembangkan oleh: <span className="font-bold text-slate-700">W. Purnomo-SMPN 2 Magelang</span>
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'report' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Laporan Agregat: {selectedClass === 'all' ? 'Semua Kelas' : selectedClass}</h3>
                  <p className="text-sm text-slate-500 mt-1 font-medium">{filteredResults.filter(r => filterType === 'all' || r.testType === filterType).length} Data Tersedia</p>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 px-2">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <select 
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700 pr-6 py-1 outline-none"
                    >
                      <option value="all">Pilih Jenis Tes...</option>
                      {Object.keys(TESTS).map(type => (
                        <option key={type} value={type}>{TESTS[type as TestType].title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-px h-6 bg-slate-200"></div>
                  <div className="flex items-center gap-2 px-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    <select 
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700 pr-6 py-1 outline-none"
                    >
                      <option value="all">Semua Kelas</option>
                      {classes.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {filterType === 'all' ? (
                <div className="py-16 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
                    <BarChart3 className="w-10 h-10 text-emerald-400" />
                  </div>
                  <h4 className="text-xl font-black text-slate-800 mb-2">Pilih Jenis Tes</h4>
                  <p className="text-slate-500 text-sm font-medium max-w-xs mx-auto">Silakan pilih jenis tes pada filter di atas untuk melihat visualisasi data agregat kelas.</p>
                </div>
              ) : filteredResults.filter(r => r.testType === filterType).length === 0 ? (
                <div className="py-16 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
                    <Info className="w-10 h-10 text-slate-300" />
                  </div>
                  <h4 className="text-xl font-black text-slate-700 mb-2">Data Belum Tersedia</h4>
                  <p className="text-slate-500 text-sm font-medium max-w-xs mx-auto">Belum ada siswa dari kelas ini yang menyelesaikan tes {TESTS[filterType as TestType]?.title || filterType}.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Quick Stats Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                        <Users className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Partisipan</p>
                        <h5 className="text-xl font-black text-slate-900">{filteredResults.filter(r => r.testType === filterType).length} Siswa</h5>
                      </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                        <Trophy className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dominan</p>
                        <h5 className="text-xl font-black text-slate-900 truncate max-w-[150px]">
                          {classChartData.length > 0 ? [...classChartData].sort((a, b) => b.value - a.value)[0].name : '-'}
                        </h5>
                      </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                      <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center shrink-0">
                        <TrendingUp className="w-6 h-6 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rata-rata Skor</p>
                        <h5 className="text-xl font-black text-slate-900">
                          {classChartData.length > 0 ? (classChartData.reduce((acc, curr) => acc + curr.value, 0) / classChartData.length).toFixed(1) : '0'}
                        </h5>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-8">
                        <h4 className="font-black text-slate-800 text-lg tracking-tight">Distribusi Rata-rata Skor</h4>
                        <div className="p-2 bg-slate-50 rounded-lg">
                          <BarChart3 className="w-4 h-4 text-slate-400" />
                        </div>
                      </div>
                      <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={classChartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                              dataKey="name" 
                              fontSize={10} 
                              tick={{fill: '#94a3b8', fontWeight: 600}} 
                              axisLine={false} 
                              tickLine={false}
                              dy={10}
                            />
                            <YAxis 
                              fontSize={10} 
                              tick={{fill: '#94a3b8', fontWeight: 600}} 
                              axisLine={false} 
                              tickLine={false} 
                            />
                            <Tooltip 
                              cursor={{fill: '#f8fafc'}} 
                              contentStyle={{ 
                                borderRadius: '16px', 
                                border: 'none', 
                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                padding: '12px'
                              }} 
                            />
                            <Bar dataKey="value" fill="#4f46e5" radius={[8, 8, 0, 0]} maxBarSize={50}>
                              {classChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-8">
                        <h4 className="font-black text-slate-800 text-lg tracking-tight">Proporsi Dominan</h4>
                        <div className="p-2 bg-slate-50 rounded-lg">
                          <PieChartIcon className="w-4 h-4 text-slate-400" />
                        </div>
                      </div>
                      <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={classChartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={70}
                              outerRadius={100}
                              paddingAngle={8}
                              dataKey="value"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              fontSize={10}
                              stroke="none"
                            >
                              {classChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ 
                                borderRadius: '16px', 
                                border: 'none', 
                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                padding: '12px'
                              }} 
                            />
                            <Legend 
                              verticalAlign="bottom" 
                              height={36} 
                              iconType="circle"
                              wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '20px' }} 
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Class Comparison Chart */}
                  {classComparisonData.length > 1 && (
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h4 className="font-black text-slate-800 text-lg tracking-tight">Perbandingan Performa Kelas</h4>
                          <p className="text-xs text-slate-500 font-medium mt-1">Rata-rata skor keseluruhan untuk tes {TESTS[filterType as TestType]?.title}</p>
                        </div>
                        <div className="p-2 bg-emerald-50 rounded-lg">
                          <BarChart3 className="w-4 h-4 text-emerald-600" />
                        </div>
                      </div>
                      <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={classComparisonData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                              dataKey="name" 
                              fontSize={10} 
                              tick={{fill: '#64748b', fontWeight: 700}} 
                              axisLine={false} 
                              tickLine={false}
                              dy={10}
                            />
                            <YAxis 
                              fontSize={10} 
                              tick={{fill: '#94a3b8', fontWeight: 600}} 
                              axisLine={false} 
                              tickLine={false} 
                            />
                            <Tooltip 
                              cursor={{fill: '#f8fafc'}} 
                              contentStyle={{ 
                                borderRadius: '16px', 
                                border: 'none', 
                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                padding: '12px'
                              }} 
                            />
                            <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} maxBarSize={60}>
                              {classComparisonData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.value === Math.max(...classComparisonData.map(d => d.value)) ? '#059669' : '#10b981'} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      
                      <div className="mt-8 pt-6 border-t border-slate-100 flex justify-center">
                        <button
                          onClick={handleGenerateClassAnalysis}
                          disabled={isGeneratingClassAnalysis}
                          className="px-6 py-3 bg-emerald-600 text-white rounded-xl text-sm font-black hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-lg shadow-emerald-100"
                        >
                          {isGeneratingClassAnalysis ? (
                            <>
                              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                                <Brain className="w-4 h-4" />
                              </motion.div>
                              Menganalisis Tren...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4" />
                              ANALISIS AI: TREN KINERJA KELAS
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-8 text-white">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                            <Sparkles className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <h4 className="text-xl font-black">Analisis Kelas Cerdas</h4>
                            <p className="text-emerald-100 text-sm font-medium">Wawasan mendalam berbasis AI untuk strategi bimbingan.</p>
                          </div>
                        </div>
                        {!classAnalysis && (
                          <button
                            onClick={handleGenerateClassAnalysis}
                            disabled={isGeneratingClassAnalysis}
                            className="w-full sm:w-auto px-8 py-4 bg-white text-emerald-600 rounded-2xl text-sm font-black hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-900/20"
                          >
                            {isGeneratingClassAnalysis ? (
                              <>
                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                                  <Brain className="w-5 h-5" />
                                </motion.div>
                                Menganalisis Data...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-5 h-5" />
                                BUAT ANALISIS KELAS
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {classAnalysis && (
                      <div className="p-8 bg-slate-50/50">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm"
                        >
                          <div className="prose prose-emerald max-w-none font-medium text-slate-700 leading-relaxed">
                            <ReactMarkdown>{classAnalysis}</ReactMarkdown>
                          </div>
                          <div className="mt-8 pt-8 border-t border-slate-100 flex justify-between items-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Analisis dihasilkan secara otomatis oleh Gemini AI</p>
                            <button 
                              onClick={() => setClassAnalysis('')}
                              className="text-xs font-bold text-emerald-600 hover:underline"
                            >
                              Reset Analisis
                            </button>
                          </div>
                        </motion.div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'recap' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <TestRecap 
                results={results} 
                classes={classes} 
                students={students} 
                teacherSettings={teacherSettings} 
                onEdit={(s) => {
                  setEditingStudent(s);
                  setActiveTab('students');
                }}
                onDelete={(s) => setConfirmDelete({
                  id: s.id || '',
                  type: 'results_by_student',
                  title: 'Hapus Semua Hasil Tes',
                  message: `Apakah Anda yakin ingin menghapus SEMUA hasil tes untuk ${s.name}?`,
                  extraData: { name: s.name, className: s.className }
                })}
              />
            </motion.div>
          )}

          {activeTab === 'recap-tamu' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <GuestRecap 
                results={results} 
                teacherSettings={teacherSettings} 
                classes={classes} 
                onEdit={(name) => {
                  showToast(`Fitur edit data tamu (${name}) akan segera hadir.`, 'info');
                }}
                onDelete={(name) => setConfirmDelete({
                  id: name,
                  type: 'results_by_guest',
                  title: 'Hapus Semua Hasil Tes Peserta Umum',
                  message: `Apakah Anda yakin ingin menghapus SEMUA hasil tes untuk tamu ${name}?`
                })}
              />
            </motion.div>
          )}

          {activeTab === 'manajemen-tamu' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <ManajemenTamu users={allUsers} classes={classes} />
            </motion.div>
          )}

          {activeTab === 'tamu' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Rekapitulasi Tamu */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
                  <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0">
                    <Users className="w-7 h-7 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Peserta Umum</p>
                    <h4 className="text-3xl font-black text-slate-900">
                      {Array.from(new Set(results.filter(r => !registeredClassNames.includes(r.studentClass)).map(r => r.studentName))).length}
                    </h4>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
                  <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0">
                    <ClipboardCheck className="w-7 h-7 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Tes Peserta Umum</p>
                    <h4 className="text-3xl font-black text-slate-900">
                      {results.filter(r => !registeredClassNames.includes(r.studentClass)).length}
                    </h4>
                  </div>
                </div>
              </div>

              {/* Riwayat Tamu */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex flex-wrap gap-3">
                      <div className="flex-1 min-w-[200px] relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="text" 
                          placeholder="Cari nama peserta umum..." 
                          value={tamuSearch}
                          onChange={(e) => setTamuSearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-600 outline-none text-sm font-medium"
                        />
                      </div>
                      <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                        <Filter className="w-4 h-4 text-slate-400" />
                        <select 
                          value={tamuTypeFilter}
                          onChange={(e) => setTamuTypeFilter(e.target.value)}
                          className="bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700 pr-6 py-1 outline-none"
                        >
                          <option value="all">Semua Tes</option>
                          {Object.keys(TESTS).map(type => (
                            <option key={type} value={type}>{TESTS[type as TestType].title}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <input 
                          type="date" 
                          value={tamuDate}
                          onChange={(e) => setTamuDate(e.target.value)}
                          className="bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700 py-1 outline-none"
                        />
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-500 bg-slate-200/50 px-3 py-1.5 rounded-lg">
                      {results.filter(r => {
                        if (registeredClassNames.includes(r.studentClass)) return false;
                        const matchesName = r.studentName.toLowerCase().includes(tamuSearch.toLowerCase());
                        const matchesType = tamuTypeFilter === 'all' || r.testType === tamuTypeFilter;
                        const matchesDate = !tamuDate || (r.timestamp?.seconds && new Date(r.timestamp.seconds * 1000).toLocaleDateString() === new Date(tamuDate).toLocaleDateString());
                        return matchesName && matchesType && matchesDate;
                      }).length} hasil ditemukan
                    </span>
                  </div>
                </div>
                <div className="overflow-x-auto" style={{ transform: 'rotateX(180deg)' }}>
                  <div style={{ transform: 'rotateX(180deg)' }}>
                    <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-wider">Tanggal</th>
                        <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-wider">Waktu</th>
                        <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-wider">Nama Peserta Umum</th>
                        <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-wider">ALAMAT EMAIL</th>
                        <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-wider">Jenjang / Asal</th>
                        <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-wider">Jenis Tes</th>
                        <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-wider">Hasil/Skor</th>
                        <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-wider text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {results
                        .filter(r => !registeredClassNames.includes(r.studentClass))
                        .filter(r => {
                          const matchesName = r.studentName.toLowerCase().includes(tamuSearch.toLowerCase());
                          const matchesType = tamuTypeFilter === 'all' || r.testType === tamuTypeFilter;
                          const matchesDate = !tamuDate || (r.timestamp?.seconds && new Date(r.timestamp.seconds * 1000).toLocaleDateString() === new Date(tamuDate).toLocaleDateString());
                          return matchesName && matchesType && matchesDate;
                        })
                        .sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0))
                        .map((result) => (
                        <tr key={result.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-4 text-sm font-medium text-slate-600">
                            {result.timestamp?.toDate ? result.timestamp.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                          </td>
                          <td className="p-4 text-sm font-medium text-slate-600">
                            {result.timestamp?.toDate ? result.timestamp.toDate().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-slate-900">{result.studentName}</div>
                          </td>
                          <td className="p-4 text-sm font-medium text-slate-600">
                            {result.studentEmail || allUsers.find(u => u.uid === result.studentId)?.email || '-'}
                          </td>
                          <td className="p-4">
                            <div className="text-xs font-bold text-slate-700">{result.studentClass || 'UMUM'}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">{result.studentNisn || '-'}</div>
                          </td>
                          <td className="p-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                              {TESTS[result.testType]?.title || result.testType}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="text-sm text-slate-600 line-clamp-2 max-w-xs" title={result.analysis}>
                              {result.analysis.replace(/Penjelasan lebih lanjut tentang hasil tes bisa dibaca pada lampiran surat keterangan ini\./g, '').trim()}
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => setTestResult(result)}
                                className="text-emerald-600 hover:text-emerald-800 p-2 rounded-lg hover:bg-emerald-50 transition-colors flex items-center gap-1.5 border border-transparent hover:border-emerald-100"
                                title="Lihat Hasil Tes"
                              >
                                <FileText className="w-4 h-4" />
                                <span className="font-bold text-[10px]">LIHAT</span>
                              </button>
                              <button 
                                onClick={() => handleDownloadPDF(result, teacherSettings)}
                                className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-1.5 border border-transparent hover:border-blue-100"
                                title="Unduh Laporan"
                              >
                                <Download className="w-4 h-4" />
                                <span className="font-bold text-[10px]">PDF</span>
                              </button>
                              <button 
                                onClick={() => result.id && setConfirmDelete({ id: result.id, type: 'result', title: 'Hapus Hasil Tes?', message: 'Data yang dihapus tidak dapat dikembalikan.' })}
                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                title="Hapus Hasil"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {results.filter(r => !registeredClassNames.includes(r.studentClass)).length === 0 && (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-slate-500 font-medium">
                            Belum ada data riwayat tes untuk tamu.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'monitor' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <MonitorSiswa 
                results={results} 
                students={students} 
                classes={classes} 
                setTestResult={setTestResult} 
                setEditingStudent={setEditingStudent} 
                setConfirmDelete={setConfirmDelete} 
              />
            </motion.div>
          )}

          {activeTab === 'hasil-tes' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <HasilTesSummary 
                results={results} 
                students={students} 
                classes={classes} 
                teacherSettings={teacherSettings}
                onEdit={(s) => {
                  setEditingStudent(s);
                  setActiveTab('students');
                }}
                onDelete={(s) => setConfirmDelete({
                  id: s.id || '',
                  type: 'results_by_student',
                  title: 'Hapus Semua Hasil Tes',
                  message: `Apakah Anda yakin ingin menghapus SEMUA hasil tes untuk ${s.name}?`,
                  extraData: { name: s.name, className: s.className }
                })}
              />
            </motion.div>
          )}

          {activeTab === 'hasil-tes-tamu' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <HasilTesTamu 
                results={results} 
                classes={classes} 
                users={allUsers} 
                teacherSettings={teacherSettings}
                onDelete={(g) => setConfirmDelete({
                  id: g.uid || '',
                  type: 'results_by_guest',
                  title: 'Hapus Semua Hasil Tes Peserta',
                  message: `Apakah Anda yakin ingin menghapus SEMUA hasil tes untuk ${g.name}?`,
                  extraData: { name: g.name, className: g.className }
                })}
              />
            </motion.div>
          )}

        </div>
      </div>
      
      {confirmDelete && (
        <ConfirmModal 
          title={confirmDelete.title}
          message={confirmDelete.message}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => {
            if (confirmDelete.type === 'student') handleDeleteStudent(confirmDelete.id);
            else if (confirmDelete.type === 'result') handleDeleteResult(confirmDelete.id);
            else if (confirmDelete.type === 'all_students') handleDeleteAllStudents();
            else if (confirmDelete.type === 'results_by_student') handleDeleteAllResultsForStudent(confirmDelete.id, confirmDelete.extraData.name, confirmDelete.extraData.className);
            else if (confirmDelete.type === 'results_by_guest') handleDeleteAllResultsForGuest(confirmDelete.id);
          }}
        />
      )}
    </div>
  );
};

const TeacherGuide = ({ onBack }: { onBack: () => void }) => (
  <div className="max-w-4xl mx-auto py-8 px-4 space-y-12">
    <button onClick={onBack} className="flex items-center text-slate-500 mb-8 hover:text-slate-900">
      <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Dashboard
    </button>

    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
      <div className="bg-emerald-600 p-12 text-white">
        <h2 className="text-3xl font-bold mb-4">Panduan Penggunaan Dashboard Guru</h2>
        <p className="text-emerald-100">Pelajari cara mengelola kelas, memantau progres siswa, dan menginterpretasi hasil tes.</p>
      </div>

      <div className="p-8 sm:p-12 space-y-10">
        <section>
          <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-emerald-600" /> 1. Menggunakan Dashboard Admin
          </h3>
          <div className="prose prose-emerald text-slate-600">
            <p>Dashboard Admin memberikan gambaran umum tentang aktivitas tes di sekolah Anda. Anda dapat:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Melihat <strong>Statistik Cepat</strong>: Jumlah total siswa yang terdaftar dan jumlah tes yang telah diselesaikan.</li>
              <li>Memantau <strong>Distribusi Tes</strong>: Grafik batang yang menunjukkan jenis tes mana yang paling sering diambil oleh siswa.</li>
              <li>Melihat <strong>Riwayat Tes Terbaru</strong>: Daftar kronologis siswa yang baru saja menyelesaikan tes.</li>
            </ul>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-600" /> 2. Menginterpretasi Hasil Siswa
          </h3>
          <div className="prose prose-emerald text-slate-600">
            <p>Setiap tes memiliki cara interpretasi yang berbeda:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Gaya Belajar</strong>: Fokus pada skor tertinggi (Visual, Auditori, atau Kinestetik) untuk menyesuaikan metode mengajar di kelas.</li>
              <li><strong>Kecerdasan Majemuk</strong>: Membantu mengidentifikasi kekuatan unik siswa (misal: Logika-Matematika vs Linguistik).</li>
              <li><strong>Tes Kecemasan</strong>: Perhatikan skor tinggi. Siswa dengan skor kecemasan tinggi memerlukan perhatian lebih atau rujukan ke konselor.</li>
            </ul>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" /> 3. Manajemen Kelas & Laporan
          </h3>
          <div className="prose prose-emerald text-slate-600">
            <p>Untuk pelaporan yang efektif:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Gunakan <strong>Filter Kelas</strong> di bagian atas dashboard untuk melihat data spesifik per kelas.</li>
              <li>Klik <strong>"Lihat Detail"</strong> pada tabel riwayat untuk melihat laporan individu lengkap siswa.</li>
              <li>Gunakan fitur <strong>Cetak Laporan</strong> pada halaman detail hasil untuk mendapatkan dokumen fisik atau PDF yang bisa dibagikan kepada orang tua.</li>
            </ul>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-emerald-600" /> 4. Cara Login bagi siswa (usia dibawah 18 tahun)
          </h3>
          <div className="prose prose-emerald text-slate-600">
            <ul className="list-disc pl-5 space-y-2">
              <li>Login sebagai tamu (jangan login menggunakan akun belajar.id atau akun pribadi jika usia belum 18 tahun)</li>
              <li>Masukkan link : <span className="font-bold text-emerald-600">https://bit.ly/Psikotest_v_1</span></li>
              <li>Muncul Notifikasi Pengalihan: Halaman sebelumnya berusaha untuk mengarahkan Anda ke <span className="text-xs bg-slate-100 px-1">https://ais-pre-442whtbiqchwwuwgg6aaue-10864217327.asia-southeast1.run.app</span></li>
              <li>Pilih / klik alamat : <span className="font-bold text-emerald-600">https://ais-pre-442whtbiqchwwuwgg6aaue-10864217327.asia-southeast1.run.app</span></li>
              <li>Muncul Menu Login</li>
              <li>Pilih tombol : <strong>Masuk tanpa akun Google</strong></li>
            </ul>
            <p className="mt-4 text-sm italic bg-slate-50 p-3 rounded-lg border border-slate-200">
              <strong>Catatan :</strong> Untuk akun dengan usia di atas 18 tahun bisa menggunakan tombol yang lain.
            </p>
          </div>
        </section>

        <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
          <h4 className="font-bold text-emerald-900 mb-2">Tips Progres Siswa:</h4>
          <p className="text-sm text-emerald-700">
            Lakukan evaluasi berkala (misal: setiap semester) untuk melihat perubahan minat atau tingkat kecemasan siswa seiring dengan perkembangan akademik mereka.
          </p>
        </div>
      </div>
    </div>
  </div>
);

// --- Main App ---

const IdentityForm = ({ classes, students, onSave, onLogout, initialStep = 'initial' }: { classes: ClassInfo[], students: StudentData[], onSave: (data: { name: string, className: string, nisn?: string }) => void, onLogout: () => void, initialStep?: 'initial' | 'registered' | 'studentCard' | 'guest' }) => {
  const [step, setStep] = useState<'initial' | 'registered' | 'studentCard' | 'guest'>(initialStep);
  const [nisnInput, setNisnInput] = useState('');
  const [showNisn, setShowNisn] = useState(false);
  const [foundStudent, setFoundStudent] = useState<StudentData | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [guestName, setGuestName] = useState('');
  const [guestJenjang, setGuestJenjang] = useState('');
  const [guestAsal, setGuestAsal] = useState('');

  const handleCheckNisn = () => {
    const student = students.find(s => s.nisn === nisnInput);
    if (student) {
      setFoundStudent(student);
      setStep('studentCard');
      setErrorMsg('');
    } else {
      setErrorMsg('Anda tidak terdaftar, apabila ingin mengikuti tes ini silahkan pilih tombol "UMUM"');
    }
  };

  const handleGuestSubmit = async () => {
    if (guestName && guestJenjang) {
      setIsLoading(true);
      setErrorMsg('');
      try {
        await onSave({ name: guestName, className: guestJenjang, nisn: guestAsal });
      } catch (error: any) {
        let msg = "Terjadi kesalahan saat menyimpan data.";
        try {
          const parsed = JSON.parse(error.message);
          if (parsed.error) msg = `Error: ${parsed.error}`;
        } catch {
          msg = error.message || msg;
        }
        setErrorMsg(msg);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleStudentSubmit = async () => {
    if (foundStudent) {
      setIsLoading(true);
      setErrorMsg('');
      try {
        await onSave({ name: foundStudent.name, className: foundStudent.className, nisn: foundStudent.nisn });
      } catch (error: any) {
        let msg = "Terjadi kesalahan saat menyimpan data.";
        try {
          const parsed = JSON.parse(error.message);
          if (parsed.error) msg = `Error: ${parsed.error}`;
        } catch {
          msg = error.message || msg;
        }
        setErrorMsg(msg);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100"
      >
        <div className="bg-emerald-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
          <UserIcon className="w-8 h-8 text-white" />
        </div>

        {step === 'initial' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-slate-900">Menu Login</h2>
            <p className="text-slate-500 text-sm">Silakan pilih kategori peserta tes:</p>
            
            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={() => setStep('registered')}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-3"
              >
                <GraduationCap className="w-5 h-5" /> SISWA TERDAFTAR
              </button>
              <button 
                onClick={() => setStep('guest')}
                className="w-full bg-white text-emerald-600 border-2 border-emerald-600 py-4 rounded-2xl font-bold hover:bg-emerald-50 transition-all flex items-center justify-center gap-3"
              >
                <Users className="w-5 h-5" /> UMUM
              </button>
              <button 
                onClick={onLogout}
                className="w-full text-red-600 text-xs font-bold hover:bg-red-50 transition-all py-2 rounded-xl flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" /> KELUAR APLIKASI
              </button>
            </div>

            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
              <p className="text-[11px] text-amber-800 leading-relaxed">
                <span className="font-bold">Petunjuk :</span> Siswa yang terdaftar sebagai siswa bimbingan, silahkan pilih tombol <span className="font-bold">SISWA TERDAFTAR</span> (Login dengan menggunakan NISN). Apabila belum terdaftar silahkan hubungi guru BK, bagi peserta tes yang lain silahkan pilih tombol <span className="font-bold">UMUM</span>.
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <p className="text-[11px] text-blue-800 leading-relaxed">
                <span className="font-bold">Info:</span> Gunakan tombol "MASUK TANPA AKUN GOOGLE" jika gagal masuk melalui tombol ketiga di atas.
              </p>
              <p className="text-[11px] text-blue-800 leading-relaxed mt-2">
                <span className="font-bold">Refresh:</span> Refresh aplikasi apabila layar blank atau gagal login, tombol berupa tanda panah melingkar berada di kiri atas layar.
              </p>
            </div>
          </div>
        )}

        {step === 'registered' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-slate-900">Login Siswa</h2>
            <p className="text-slate-500 text-sm">Masukkan NISN Anda sebagai password.</p>
            
            <div className="relative">
              <label className="block text-sm font-bold text-slate-700 mb-2">NISN</label>
              <div className="relative">
                <input 
                  type={showNisn ? "text" : "password"}
                  value={nisnInput}
                  onChange={(e) => setNisnInput(e.target.value)}
                  placeholder="Masukkan NISN"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-emerald-600 focus:outline-none transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowNisn(!showNisn)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-emerald-600 transition-colors"
                >
                  {showNisn ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                <p className="text-xs text-red-600 font-medium leading-relaxed">{errorMsg}</p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button 
                onClick={handleCheckNisn}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
              >
                OK
              </button>
              <button 
                onClick={() => {
                  setStep('initial');
                  setErrorMsg('');
                  setNisnInput('');
                }}
                className="w-full bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> KEMBALI
              </button>
            </div>
          </div>
        )}

        {step === 'studentCard' && foundStudent && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-slate-900">Kartu Identitas</h2>
            
            <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 space-y-4">
              <div>
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Nama Siswa</p>
                <p className="text-lg font-black text-slate-900">{foundStudent.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Kelas</p>
                  <p className="text-base font-bold text-slate-800">{foundStudent.className}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">NISN</p>
                  <div className="flex items-center gap-2">
                    <p className="text-base font-bold text-slate-800">
                      {showNisn ? foundStudent.nisn : '●●●●●●●●●●'}
                    </p>
                    <button
                      onClick={() => setShowNisn(!showNisn)}
                      className="text-slate-400 hover:text-emerald-600 transition-colors"
                    >
                      {showNisn ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-xs text-red-600 font-medium leading-relaxed">{errorMsg}</p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button 
                onClick={handleStudentSubmit}
                disabled={isLoading}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    >
                      <Loader2 className="w-5 h-5" />
                    </motion.div>
                    MEMULAI...
                  </div>
                ) : "MULAI TES"}
              </button>
              <button 
                onClick={onLogout}
                className="w-full text-red-600 text-xs font-bold hover:bg-red-50 transition-all py-3 rounded-xl flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" /> KELUAR APLIKASI
              </button>
            </div>
          </div>
        )}

        {step === 'guest' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-slate-900">Menu Daftar</h2>
            <p className="text-slate-500 text-sm">Silakan lengkapi data diri Anda.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Nama Lengkap</label>
                <input 
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Masukkan nama lengkap"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-emerald-600 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Jenjang</label>
                <select 
                  value={guestJenjang}
                  onChange={(e) => setGuestJenjang(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-emerald-600 focus:outline-none transition-all"
                >
                  <option value="">-- Pilih Jenjang --</option>
                  {['SMP', 'MTs', 'SMA', 'SMK', 'UMUM', 'Lainnya'].map(j => <option key={j} value={j}>{j}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Asal Sekolah / Alamat</label>
                <input 
                  type="text"
                  value={guestAsal}
                  onChange={(e) => setGuestAsal(e.target.value)}
                  placeholder="Masukkan asal sekolah atau alamat"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-emerald-600 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                  <p className="text-xs text-red-600 font-medium leading-relaxed">{errorMsg}</p>
                </div>
              )}
              <button 
                onClick={handleGuestSubmit}
                disabled={!guestName || !guestJenjang || isLoading}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    >
                      <Loader2 className="w-5 h-5" />
                    </motion.div>
                    MEMULAI...
                  </div>
                ) : "MULAI TES"}
              </button>
              <button 
                onClick={() => setStep('initial')}
                disabled={isLoading}
                className="w-full bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> KEMBALI
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTest, setActiveTest] = useState<TestType | null>(null);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [allResults, setAllResults] = useState<TestResult[]>([]);
  const [userResults, setUserResults] = useState<TestResult[]>([]);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);

  // Derive classes dari data siswa secara otomatis (hanya yang terdaftar di Manajemen Siswa)
  const classes = React.useMemo(() => {
    const studentClasses = students.map(s => s.className);
    const uniqueNames = Array.from(new Set(studentClasses))
      .filter(Boolean)
      .sort();
    return uniqueNames.map(name => ({ id: name, name, teacherId: '' }));
  }, [students]);
  const [teacherSettings, setTeacherSettings] = useState<TeacherSettings | null>(null);
  const [customTests, setCustomTests] = useState<any[]>([]);
  const [activeCustomTest, setActiveCustomTest] = useState<any | null>(null);
  const [isAnalyzingTest, setIsAnalyzingTest] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [view, setView] = useState<'dashboard' | 'admin' | 'guide' | 'create-test'>('dashboard');
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
  };

  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [showEmergencyMenu, setShowEmergencyMenu] = useState(false);
  const [initialIdentityStep, setInitialIdentityStep] = useState<'initial' | 'registered' | 'studentCard' | 'guest'>('initial');
  const [profileData, setProfileData] = useState({ name: '', className: '' });
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const isAdminEmail = firebaseUser.email?.toLowerCase() === "purnomowiwit@gmail.com";
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data() as UserProfile;
            if (isAdminEmail && userData.role !== 'admin') {
              await updateDoc(doc(db, 'users', firebaseUser.uid), { role: 'admin' });
              setUser({ ...userData, role: 'admin' });
              setView('admin');
            } else {
              setUser(userData);
              // If student hasn't set their class/name properly
              if (userData.role === 'student' && (!userData.className || userData.name === 'Siswa')) {
                setShowProfileSetup(true);
              }
              if (userData.role === 'admin' || userData.role === 'teacher' || isAdminEmail) {
                setView('admin');
              }
            }
          } else {
            const newUser: UserProfile = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || 'Siswa',
              email: firebaseUser.email || '',
              role: isAdminEmail ? 'admin' : 'student',
              createdAt: serverTimestamp()
            };
            await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
            setUser(newUser);
            if (isAdminEmail) {
              setView('admin');
            } else {
              setShowProfileSetup(true);
            }
          }
        } else {
          setUser(null);
          setView('dashboard');
          setShowProfileSetup(false);
        }
      } catch (error) {
        if (error instanceof Error && error.message.includes('permission')) {
          handleFirestoreError(error, OperationType.GET, 'users');
        }
      } finally {
        setLoading(false);
        setIsLoggingIn(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateProfile = async (data?: { name: string, className: string, nisn?: string }) => {
    const finalData = data || { name: profileData.name, className: profileData.className, nisn: '' };
    if (!user || !finalData.name || !finalData.className) return;
    
    try {
      const isLocal = user.uid.startsWith('local_');
      const payload: any = {
        name: finalData.name,
        className: finalData.className,
        nisn: finalData.nisn || ''
      };

      if (isLocal) {
        payload.uid = user.uid;
        payload.role = user.role;
        payload.email = user.email || '';
        payload.createdAt = serverTimestamp();
      }

      await setDoc(doc(db, 'users', user.uid), payload, { merge: true });
      setUser({ ...user, ...payload, createdAt: isLocal ? new Date() : user.createdAt });
      setShowProfileSetup(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'users');
    }
  };

  useEffect(() => {
    if (user) {
      // Fetch user's own results for recommendations
      const q = query(
        collection(db, 'test_results'), 
        where('studentId', '==', user.uid),
        orderBy('timestamp', 'desc')
      );
      const unsubUserResults = onSnapshot(q, (snapshot) => {
        setUserResults(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TestResult)));
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'test_results');
      });

      const unsubStudents = onSnapshot(collection(db, 'students'), (snapshot) => {
        setStudents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudentData)));
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'students');
      });

      if (user.role === 'teacher' || user.role === 'admin') {
        const qAll = query(collection(db, 'test_results'), orderBy('timestamp', 'desc'));
        const unsubResults = onSnapshot(qAll, (snapshot) => {
          setAllResults(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TestResult)));
        }, (error) => {
          handleFirestoreError(error, OperationType.LIST, 'test_results');
        });

        const unsubTeacherSettings = onSnapshot(doc(db, 'teacher_settings', user.uid), (doc) => {
          if (doc.exists()) {
            setTeacherSettings(doc.data() as TeacherSettings);
          }
        });

        const unsubCustomTests = onSnapshot(collection(db, 'custom_tests'), (snapshot) => {
          setCustomTests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
          setAllUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }, (error) => {
          handleFirestoreError(error, OperationType.LIST, 'users');
        });

        return () => {
          unsubUserResults();
          unsubResults();
          unsubStudents();
          unsubTeacherSettings();
          unsubCustomTests();
          unsubUsers();
        };
      }

      const unsubCustomTests = onSnapshot(collection(db, 'custom_tests'), (snapshot) => {
        setCustomTests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });

      return () => {
        unsubUserResults();
        unsubStudents();
        unsubCustomTests();
      };
    }
  }, [user]);

  const getRecommendation = (type: TestType) => {
    const latest = userResults.find(r => r.testType === type);
    if (!latest) return undefined;
    
    // Simple recommendation logic based on analysis
    if (type === 'anxiety') {
      if (latest.analysis.includes('Tinggi')) return "Fokus pada teknik relaksasi dan meditasi.";
      if (latest.analysis.includes('Sedang')) return "Jaga pola tidur dan kurangi kafein.";
      return "Pertahankan keseimbangan emosional Anda.";
    }
    if (type === 'learning_style') {
      if (latest.analysis.includes('Visual')) return "Gunakan mind map dan video pembelajaran.";
      if (latest.analysis.includes('Auditori')) return "Dengarkan rekaman atau diskusi kelompok.";
      return "Lakukan simulasi atau praktik langsung.";
    }
    if (type === 'iq_wais') {
      if (latest.analysis.includes('Sangat Superior')) return "Tantang diri Anda dengan materi yang lebih kompleks.";
      if (latest.analysis.includes('Superior')) return "Kembangkan kemampuan analisis dan pemecahan masalah.";
      return "Terus asah kemampuan kognitif Anda secara rutin.";
    }
    if (type === 'wartegg') {
      return "Konsultasikan hasil gambar Anda dengan psikolog.";
    }
    return "Terus kembangkan potensi Anda di bidang ini.";
  };

  const handleCompleteTest = async (scores: Record<string, number>) => {
    if (!user || (!activeTest && !activeCustomTest)) return;

    setIsAnalyzingTest(true);
    const testType = activeTest || activeCustomTest.testType;
    let analysis = '';

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Sebagai seorang psikolog dan konselor pendidikan, tolong analisis hasil tes ${testType} dari siswa bernama ${user.name} (Kelas: ${user.className || 'Umum'}).
      
Skor yang diperoleh:
${Object.entries(scores).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

Berikan analisis kepribadian/minat bakat yang mendalam dan rekomendasi yang dipersonalisasi untuk pengembangan diri dan karir/pendidikan selanjutnya.
Gunakan format Markdown yang rapi (gunakan heading, bullet points, bold text).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
      });
      
      analysis = response.text || activeCustomTest?.aiRecommendation || analyzeResult(testType, scores);
    } catch (error) {
      console.error("Error generating AI analysis:", error);
      // Fallback to static analysis
      analysis = activeCustomTest?.aiRecommendation || analyzeResult(testType, scores);
    }
    
    const result: TestResult = {
      studentId: user.uid,
      studentName: user.name,
      studentEmail: user.email || '',
      studentClass: user.className || 'Umum',
      studentNisn: user.nisn || '',
      testType: testType,
      scores,
      analysis,
      timestamp: serverTimestamp()
    };

    try {
      const docRef = await addDoc(collection(db, 'test_results'), result);
      
      // Notify teacher if anxiety is high
      if (testType === 'anxiety' && scores['anxiety_score'] > 15) {
        await addDoc(collection(db, 'notifications'), {
          userId: 'admin', // Assuming admin is the teacher
          title: 'Perhatian: Hasil Tes Kecemasan Tinggi',
          message: `Siswa ${result.studentName} (${result.studentClass}) mendapatkan skor kecemasan tinggi. Mohon segera ditindaklanjuti.`,
          type: 'warning',
          read: false,
          timestamp: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'notifications'), {
          userId: 'admin',
          title: 'Tes Baru Selesai',
          message: `Siswa ${result.studentName} (${result.studentClass}) telah menyelesaikan tes ${testType}.`,
          type: 'success',
          read: false,
          timestamp: serverTimestamp()
        });
      }

      setTestResult({ ...result, id: docRef.id });
      setActiveTest(null);
      setActiveCustomTest(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'test_results');
    } finally {
      setIsAnalyzingTest(false);
    }
  };

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      // console.error("Login Error:", error);
      if (error.code === 'auth/popup-blocked') {
        showToast("Popup diblokir oleh browser. Silakan izinkan popup untuk masuk.", 'error');
      } else {
        showToast("Gagal masuk dengan Google. Silakan coba lagi.", 'error');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout Error:", error);
      showToast("Gagal keluar. Silakan coba lagi.", 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  if (showProfileSetup) {
    return (
      <IdentityForm 
        classes={classes} 
        students={students} 
        onSave={(data) => handleUpdateProfile(data)} 
        onLogout={handleLogout}
        initialStep={initialIdentityStep}
      />
    );
  }

  if (!user) {
    if (showEmergencyMenu) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 text-center"
          >
            <div className="bg-emerald-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-100">
              <UserIcon className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="text-3xl font-black text-slate-900 mb-2">Menu Login</h2>
            <p className="text-slate-500 text-sm mb-8">Silakan pilih kategori peserta tes:</p>

            <div className="space-y-4">
              <button 
                onClick={() => {
                  const dummyUid = `local_${Date.now()}`;
                  const dummyUser: UserProfile = {
                    uid: dummyUid,
                    name: 'Siswa',
                    email: '',
                    role: 'student',
                    createdAt: new Date()
                  };
                  setUser(dummyUser);
                  setInitialIdentityStep('registered');
                  setShowProfileSetup(true);
                  showToast("Masuk sebagai Siswa Terdaftar", "info");
                }}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-100"
              >
                <GraduationCap className="w-5 h-5" /> SISWA TERDAFTAR
              </button>

              <button 
                onClick={() => {
                  const dummyUid = `local_${Date.now()}`;
                  const dummyUser: UserProfile = {
                    uid: dummyUid,
                    name: 'Peserta Umum',
                    email: '',
                    role: 'student',
                    createdAt: new Date()
                  };
                  setUser(dummyUser);
                  setInitialIdentityStep('guest');
                  setShowProfileSetup(true);
                  showToast("Masuk sebagai Peserta Umum", "info");
                }}
                className="w-full bg-white text-emerald-600 border-2 border-emerald-600 py-4 rounded-2xl font-bold hover:bg-emerald-50 transition-all flex items-center justify-center gap-3 shadow-md"
              >
                <Users className="w-5 h-5" /> UMUM
              </button>

              <button 
                onClick={() => setShowEmergencyMenu(false)}
                className="w-full text-slate-400 text-xs font-bold hover:text-slate-600 transition-colors py-2"
              >
                BATAL
              </button>
            </div>

            <div className="mt-8 p-5 bg-amber-50 rounded-2xl border border-amber-100 text-left">
              <p className="text-[11px] text-amber-900 leading-relaxed">
                <span className="font-black text-amber-700">Petunjuk :</span> Siswa yang terdaftar sebagai siswa bimbingan, silahkan pilih tombol <b>SISWA TERDAFTAR</b> (Login dengan menggunakan NISN). Apabila belum terdaftar silahkan hubungi guru BK, bagi peserta tes yang lain silahkan pilih tombol <b>UMUM</b>.
              </p>
            </div>

            <button 
              onClick={() => setShowEmergencyMenu(false)}
              className="mt-6 text-slate-400 text-xs font-bold hover:text-slate-600 transition-colors flex items-center justify-center gap-2 mx-auto"
            >
              <ArrowLeft className="w-4 h-4" /> KEMBALI KE LOGIN UTAMA
            </button>
          </motion.div>
          <AnimatePresence>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
          </AnimatePresence>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white p-12 rounded-[2.5rem] shadow-2xl border border-slate-100 text-center"
        >
          <div className="bg-emerald-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-200">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">PsikoTest</h1>
          <img src="https://lh3.googleusercontent.com/d/1UNix_IGpjmt2q0apsIQy-6s3Zr9SnLJ9" alt="Dutatama Logo" className="h-6 w-auto mx-auto mb-4 opacity-90" referrerPolicy="no-referrer" />
          <p className="text-slate-500 mb-8 leading-relaxed">
            Platform asesmen psikologi profesional untuk membantu siswa SMP & SMA menemukan potensi terbaik mereka.
          </p>

          <button 
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mb-4 cursor-pointer"
          >
            {isLoggingIn ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            ) : (
              <>
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                LOGIN DENGAN GOOGLE
              </>
            )}
          </button>

          <div className="grid grid-cols-1 gap-3">
            <button 
              onClick={() => setShowEmergencyMenu(true)}
              className="w-full text-emerald-600 text-xs font-black hover:bg-emerald-50 transition-all py-3 border-2 border-emerald-600 rounded-xl mt-2 flex items-center justify-center gap-2 shadow-sm"
            >
              <AlertCircle className="w-4 h-4" /> MASUK TANPA AKUN GOOGLE
            </button>
            <button 
              onClick={() => setShowEmergencyMenu(false)}
              className="w-full text-slate-500 text-xs font-black hover:bg-slate-100 transition-all py-3 border-2 border-slate-200 rounded-xl mt-2 flex items-center justify-center gap-2 shadow-sm"
            >
              <X className="w-4 h-4" /> BATAL
            </button>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-2xl border border-blue-100 text-left">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-blue-900 mb-1">Penting untuk Siswa!</p>
                <p className="text-[10px] text-blue-800 leading-relaxed">
                  Gunakan tombol <b>"MASUK TANPA AKUN GOOGLE"</b> apabila gagal masuk lewat tombol <b>"LOGIN DENGAN GOOGLE"</b>.
                </p>
                <p className="text-[10px] text-blue-800 leading-relaxed mt-2">
                  Refresh aplikasi apabila layar blank atau gagal login, tombol berupa tanda panah melingkar berada di kiri atas layar.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
        <AnimatePresence>
          {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        setView={setView}
        view={view}
        onBack={() => {
          setActiveTest(null);
          setTestResult(null);
          setView('dashboard');
        }} 
      />

      <main className="pb-20">
        <AnimatePresence mode="wait">
          {activeTest || activeCustomTest ? (
            <motion.div
              key="test-form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <TestForm 
                type={activeTest || activeCustomTest.testType} 
                customTest={activeCustomTest}
                onComplete={handleCompleteTest} 
                isAnalyzingTest={isAnalyzingTest}
                onCancel={() => {
                  setActiveTest(null);
                  setActiveCustomTest(null);
                }} 
              />
            </motion.div>
          ) : testResult ? (
            <motion.div
              key="test-result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
            >
              <ResultView 
                result={testResult} 
                onBack={() => {
                  setTestResult(null);
                  setActiveTest(null);
                  setActiveCustomTest(null);
                  if (user?.role === 'student') {
                    setView('dashboard');
                  }
                }} 
                showToast={showToast} 
                teacherSettings={teacherSettings} 
              />
            </motion.div>
          ) : view === 'admin' ? (
            <motion.div
              key="admin-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <AdminDashboard results={allResults} classes={classes} students={students} teacherSettings={teacherSettings} user={user} setView={setView} showToast={showToast} setTestResult={setTestResult} allUsers={allUsers} />
            </motion.div>
          ) : view === 'create-test' ? (
            <motion.div
              key="create-test-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <TestCreator onBack={() => setView('admin')} showToast={showToast} />
            </motion.div>
          ) : view === 'guide' ? (
            <motion.div
              key="guide-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <TeacherGuide onBack={() => setView('dashboard')} />
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
                <div>
                  <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Halo, {user.name.split(' ')[0]}! 👋</h2>
                  <p className="text-slate-500 text-lg">
                    {user.role === 'student' ? `Siswa Kelas ${user.className || '-'}` : 'Pilih tes yang ingin kamu lakukan hari ini.'}
                  </p>
                </div>
                {(user.role === 'teacher' || user.role === 'admin' || user.email.toLowerCase() === "purnomowiwit@gmail.com") && (
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setShowExitConfirm(true)}
                      className="bg-white text-red-600 border-2 border-red-100 px-6 py-3 rounded-2xl font-bold hover:bg-red-50 transition-all flex items-center gap-2"
                    >
                      <LogOut className="w-5 h-5" /> KELUAR APLIKASI
                    </button>
                    <button 
                      onClick={() => setView('guide')}
                      className="bg-white text-slate-600 border-2 border-slate-200 px-6 py-3 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center gap-2"
                    >
                      <BookOpen className="w-5 h-5" /> Panduan Guru
                    </button>
                    <button 
                      onClick={() => setView('admin')}
                      className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-200"
                    >
                      <LayoutDashboard className="w-5 h-5" /> Admin Dasbor
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {(Object.keys(TESTS) as TestType[]).map(type => (
                  <TestCard 
                    key={type} 
                    type={type} 
                    test={TESTS[type]} 
                    onSelect={setActiveTest} 
                    recommendation={getRecommendation(type)}
                    results={userResults.filter(r => r.testType === type)}
                  />
                ))}
                {customTests.filter(t => t.isActive).map(test => (
                  <TestCard 
                    key={test.id} 
                    type={test.testType} 
                    test={test} 
                    onSelect={() => setActiveCustomTest(test)} 
                    recommendation={undefined}
                    results={userResults.filter(r => r.testType === test.testType)}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {showExitConfirm && (
          <ConfirmModal 
            title="Keluar Aplikasi"
            message="Anda yakin keluar dari aplikasi ini?"
            onCancel={() => setShowExitConfirm(false)}
            onConfirm={() => {
              setShowExitConfirm(false);
              handleLogout();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
