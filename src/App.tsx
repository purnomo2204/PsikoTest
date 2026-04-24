import React, { useState, useEffect, useCallback } from "react";
import {
  auth,
  db,
  signInWithGoogle,
  logout,
  signInAsGuest,
  loginWithEmailAndPassword,
  registerWithEmailAndPassword,
  resetPassword,
} from "./firebase";
import { onAuthStateChanged, updateEmail } from "firebase/auth";
import type { User } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  onSnapshot,
  query,
  where,
  addDoc,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  orderBy,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import {
  UserProfile,
  TestType,
  TestResult,
  ClassInfo,
  Question,
  StudentData,
  TeacherSettings,
  AppNotification,
  CounselingLog,
} from "./types";
import { TESTS, analyzeResult, getShortResult } from "./data/tests";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { GoogleGenAI, Type } from "@google/genai";

const handleDownloadPDF = (result: TestResult, teacherSettings: any) => {
  const doc = new jsPDF();
  const testTitle = TESTS[result.testType].title;
  const isUmum = result.studentClass.toLowerCase() === "umum";

  let currentY = 15;

  if (!isUmum) {
    // Kop Surat (Official Indonesian Header)
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(
      teacherSettings?.pemdaName?.toUpperCase() || "PEMERINTAH PROVINSI / KOTA",
      105,
      currentY,
      { align: "center" },
    );
    currentY += 7;
    doc.text(
      teacherSettings?.dinasName?.toUpperCase() || "DINAS PENDIDIKAN",
      105,
      currentY,
      { align: "center" },
    );
    currentY += 8;
    doc.setFontSize(14);
    const headerSchoolName =
      result.studentSchoolName ||
      teacherSettings?.schoolName ||
      "NAMA SEKOLAH ANDA DISINI";
    doc.text(headerSchoolName.toUpperCase(), 105, currentY, {
      align: "center",
    });
    currentY += 6;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(
      teacherSettings?.schoolAddress ||
        "Alamat Lengkap Sekolah, No. Telp, Website, Email",
      105,
      currentY,
      { align: "center" },
    );
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
  doc.text("LAPORAN HASIL TES PSIKOLOGI", 105, currentY, { align: "center" });
  currentY += 10;

  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59); // Slate 800
  doc.text(testTitle.toUpperCase(), 105, currentY, { align: "center" });
  currentY += 15;

  // Student Info
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.setFont("helvetica", "normal");
  doc.text(`Nama Siswa: ${result.studentName}`, 20, currentY);
  currentY += 7;
  doc.text(`PASSWORD: ${result.studentPassword || "-"}`, 20, currentY);
  currentY += 7;
  doc.text(`Kelas: ${result.studentClass || "Peserta Umum"}`, 20, currentY);
  currentY += 7;
  doc.text(
    `Tanggal Tes: ${new Date(result.timestamp?.seconds * 1000).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`,
    20,
    currentY,
  );
  currentY += 11;

  // Scores Visualization
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.setFont("helvetica", "bold");
  doc.text("Visualisasi Hasil:", 20, currentY);
  currentY += 10;

  if (result.testType === "subject_interest") {
    const selected = Object.entries(result.scores).filter(([_, v]) => v > 0);
    selected.forEach(([id, _]) => {
      const map: Record<string, string> = {
        agama: "Pendidikan Agama",
        ppkn: "PPKn",
        b_indo: "Bahasa Indonesia",
        mtk: "Matematika",
        ipa: "IPA",
        ips: "IPS",
        b_ing: "Bahasa Inggris",
        seni: "Seni Budaya",
        pjok: "PJOK",
        prakarya: "Prakarya",
        informatika: "Informatika",
        b_daerah: "Bahasa Daerah",
        bk: "BK",
      };
      const subjectName = map[id] || id;
      const reason = result.extraData?.reasons?.[id] || "-";

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 41, 59);
      doc.text(`• ${subjectName}`, 20, currentY);
      currentY += 5;

      doc.setFontSize(9);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(100, 116, 139);
      const splitReason = doc.splitTextToSize(`Alasan: ${reason}`, 160);
      doc.text(splitReason, 25, currentY);
      currentY += splitReason.length * 4 + 2;

      if (currentY > 270) {
        doc.addPage();
        currentY = 20;
      }
    });
    currentY += 5;
  } else if (result.testType === "wartegg") {
    const drawings = result.extraData?.drawings || {};
    const titles = result.extraData?.titles || {};

    let xPos = 20;
    let yPos = currentY;
    const imgSize = 38;
    const margin = 5;

    [...Array(8)].forEach((_, i) => {
      if (i > 0 && i % 4 === 0) {
        xPos = 20;
        yPos += imgSize + 15;
      }

      if (drawings[i]) {
        try {
          doc.addImage(drawings[i], "PNG", xPos, yPos, imgSize, imgSize);
        } catch (e) {
          doc.rect(xPos, yPos, imgSize, imgSize);
          doc.setFontSize(6);
          doc.text("Gagal memuat gambar", xPos + 2, yPos + imgSize / 2);
        }
      } else {
        doc.rect(xPos, yPos, imgSize, imgSize);
      }

      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      doc.text(`Kotak ${i + 1}`, xPos, yPos + imgSize + 4);
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      const splitTitle = doc.splitTextToSize(
        titles[i] || "Tanpa Judul",
        imgSize,
      );
      doc.text(splitTitle, xPos, yPos + imgSize + 8);

      xPos += imgSize + margin;
    });
    currentY = yPos + imgSize + 20;
  } else {
    const chartData = Object.entries(result.scores).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1).replace("_", " "),
      value,
    }));

    const maxScore = Math.max(...chartData.map((d) => d.value), 1);
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
      doc.rect(70, currentY, barWidth, barHeight, "F");

      // Value
      doc.text(d.value.toString(), 70 + barWidth + 2, currentY + 4);

      currentY += barHeight + gap;
    });
    currentY += 5;
  }

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
  if (result.testType === "anxiety") {
    fullAnalysisText = result.analysis.replace(/\*\*/g, "");
  } else {
    fullAnalysisText = `${cleanSummary} Penjelasan lebih lanjut tentang hasil tes bisa dibaca pada lampiran surat keterangan ini.`;
  }
  const splitAnalysis = doc.splitTextToSize(fullAnalysisText, 170);
  doc.text(splitAnalysis, 20, finalY + 10);

  // Signatures
  const sigY = finalY + 10 + splitAnalysis.length * 5 + 20;
  const today = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  doc.setFontSize(10);
  doc.text(`Dicetak pada: ${today}`, 20, sigY - 10);

  if (!isUmum) {
    doc.text("Mengetahui,", 160, sigY, { align: "center" });
    doc.text("Guru Bimbingan Konseling,", 160, sigY + 5, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.text(
      teacherSettings?.name || "(....................................)",
      160,
      sigY + 30,
      { align: "center" },
    );
    doc.setFont("helvetica", "normal");
    doc.text(
      `NIP. ${teacherSettings?.nip || "...................................."}`,
      160,
      sigY + 35,
      { align: "center" },
    );
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Dicetak melalui PsikoTest - ${new Date().toLocaleString("id-ID")}`,
      105,
      285,
      { align: "center" },
    );
  }

  doc.save(
    `Hasil_${result.testType}_${result.studentName.replace(/\s+/g, "_")}.pdf`,
  );
};

export const handleDownloadDetailedReport = (
  student: any,
  allResults: TestResult[],
  teacherSettings: TeacherSettings | null,
) => {
  const doc = new jsPDF();
  const isUmum =
    student.className?.toLowerCase() === "umum" || student.role === "guest";

  const studentResults = allResults.filter(
    (r) =>
      r.studentId === student.uid ||
      (r.studentName === student.name && r.studentClass === student.className),
  );

  const targetTests: TestType[] = [
    "learning_style",
    "personality",
    "multiple_intelligences",
    "aptitude_interest",
    "school_major",
    "anxiety",
    "cfit",
    "wartegg",
    "subject_interest",
    "school_career",
  ];

  let currentY = 15;

  if (!isUmum) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(
      teacherSettings?.pemdaName?.toUpperCase() || "PEMERINTAH PROVINSI / KOTA",
      105,
      currentY,
      { align: "center" },
    );
    currentY += 7;
    doc.text(
      teacherSettings?.dinasName?.toUpperCase() || "DINAS PENDIDIKAN",
      105,
      currentY,
      { align: "center" },
    );
    currentY += 8;
    doc.setFontSize(14);
    const headerSchoolName =
      student.schoolName ||
      teacherSettings?.schoolName ||
      "NAMA SEKOLAH ANDA DISINI";
    doc.text(headerSchoolName.toUpperCase(), 105, currentY, {
      align: "center",
    });
    currentY += 6;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(
      teacherSettings?.schoolAddress ||
        "Alamat Lengkap Sekolah, No. Telp, Website, Email",
      105,
      currentY,
      { align: "center" },
    );
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
  doc.text("LAPORAN HASIL TES PSIKOLOGI INDIVIDUAL", 105, currentY, {
    align: "center",
  });
  currentY += 15;

  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.setFont("helvetica", "normal");
  doc.text(
    `${isUmum ? "Nama Peserta" : "Nama Siswa"}: ${student.name}`,
    20,
    currentY,
  );
  currentY += 7;
  doc.text(
    `${isUmum ? "Nama Sekolah/ Alamat" : "PASSWORD"}: ${isUmum ? student.schoolName || student.password || "-" : student.password || "-"}`,
    20,
    currentY,
  );
  currentY += 7;
  doc.text(
    `${isUmum ? "Kelas/ Umur" : "Kelas"}: ${student.className || (isUmum ? "-" : "Peserta Umum")}`,
    20,
    currentY,
  );
  currentY += 7;
  if (isUmum && student.jenjang) {
    doc.text(`Jenjang: ${student.jenjang}`, 20, currentY);
    currentY += 7;
  }
  doc.text(
    `Tanggal Cetak: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`,
    20,
    currentY,
  );
  currentY += 12;

  // Summary Table
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text("RINGKASAN HASIL TES", 20, currentY);
  currentY += 6;

  const summaryData = targetTests.map((type, index) => {
    const testsOfType = studentResults
      .filter((t) => t.testType === type)
      .sort(
        (a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0),
      );
    const latest = testsOfType.length > 0 ? testsOfType[0] : null;
    return [
      index + 1,
      TESTS[type].title,
      latest ? getShortResult(type, latest.scores) : "Belum diikuti",
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [["No", "Jenis Tes", "Hasil Utama"]],
    body: summaryData,
    theme: "grid",
    headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 80 },
      2: { cellWidth: 80 },
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 15;
  doc.addPage();
  currentY = 20;

  const printMarkdown = (text: string) => {
    const lines = text.split("\n");
    for (let line of lines) {
      if (currentY > 270) {
        doc.addPage();
        currentY = 20;
      }

      if (line.startsWith("### ")) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(15, 23, 42);
        const textToPrint = line.replace("### ", "");
        const splitText = doc.splitTextToSize(textToPrint, 170);
        doc.text(splitText, 20, currentY);
        currentY += splitText.length * 6 + 2;
      } else if (line.startsWith("**") && line.endsWith("**")) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(30, 41, 59);
        const textToPrint = line.replace(/\*\*/g, "");
        const splitText = doc.splitTextToSize(textToPrint, 170);
        doc.text(splitText, 20, currentY);
        currentY += splitText.length * 5 + 1;
      } else if (line.startsWith("- ")) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(71, 85, 105);
        const textToPrint = line.replace("- ", "• ");
        const cleanText = textToPrint.replace(/\*\*/g, "");
        const splitText = doc.splitTextToSize(cleanText, 165);
        doc.text(splitText, 25, currentY);
        currentY += splitText.length * 5 + 1;
      } else if (line.trim() !== "") {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(71, 85, 105);
        const cleanText = line.replace(/\*\*/g, "");
        const splitText = doc.splitTextToSize(cleanText, 170);
        doc.text(splitText, 20, currentY);
        currentY += splitText.length * 5 + 1;
      } else {
        currentY += 3;
      }
    }
  };

  targetTests.forEach((testType) => {
    const testsOfType = studentResults
      .filter((t) => t.testType === testType)
      .sort(
        (a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0),
      );
    const latestTest = testsOfType.length > 0 ? testsOfType[0] : null;

    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(5, 150, 105);
    const safeTitle = TESTS[testType]?.title || testType;
    doc.text(safeTitle.toUpperCase(), 20, currentY);
    currentY += 8;

    if (latestTest) {
      const shortResult = getShortResult(testType, latestTest.scores);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      doc.text(`Hasil Utama: ${shortResult}`, 20, currentY);
      currentY += 8;

      // No specific table for this test type

      const cleanAnalysis = latestTest.analysis
        .replace(/<\/?[^>]+(>|$)/g, "")
        .replace(
          /Penjelasan lebih lanjut tentang hasil tes bisa dibaca pada lampiran surat keterangan ini\./g,
          "",
        );
      printMarkdown(cleanAnalysis);
      currentY += 10;

      if (testType === "wartegg" && latestTest.extraData?.drawings) {
        const drawings = latestTest.extraData.drawings;
        const titles = latestTest.extraData.titles || {};

        let xPos = 20;
        let yPos = currentY;
        const imgSize = 38;
        const margin = 5;

        [...Array(8)].forEach((_, i) => {
          if (i > 0 && i % 4 === 0) {
            xPos = 20;
            yPos += imgSize + 15;
            if (yPos > 240) {
              doc.addPage();
              yPos = 20;
            }
          }

          if (drawings[i]) {
            try {
              doc.addImage(drawings[i], "PNG", xPos, yPos, imgSize, imgSize);
            } catch (e) {
              doc.rect(xPos, yPos, imgSize, imgSize);
            }
          } else {
            doc.rect(xPos, yPos, imgSize, imgSize);
          }

          doc.setFontSize(8);
          doc.setTextColor(30, 41, 59);
          doc.text(`Kotak ${i + 1}`, xPos, yPos + imgSize + 4);
          doc.setFontSize(7);
          doc.setTextColor(100, 116, 139);
          const splitTitle = doc.splitTextToSize(
            titles[i] || "Tanpa Judul",
            imgSize,
          );
          doc.text(splitTitle, xPos, yPos + imgSize + 8);

          xPos += imgSize + margin;
        });
        currentY = yPos + imgSize + 20;
      }

      if (testType === "subject_interest" && latestTest.extraData?.reasons) {
        const selected = Object.entries(latestTest.scores).filter(
          ([_, v]) => v > 0,
        );
        selected.forEach(([id, _]) => {
          const map: Record<string, string> = {
            agama: "Pendidikan Agama",
            ppkn: "PPKn",
            b_indo: "Bahasa Indonesia",
            mtk: "Matematika",
            ipa: "IPA",
            ips: "IPS",
            b_ing: "Bahasa Inggris",
            seni: "Seni Budaya",
            pjok: "PJOK",
            prakarya: "Prakarya",
            informatika: "Informatika",
            b_daerah: "Bahasa Daerah",
            bk: "BK",
          };
          const subjectName = map[id] || id;
          const reason = latestTest.extraData.reasons[id] || "-";

          if (currentY > 270) {
            doc.addPage();
            currentY = 20;
          }

          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(30, 41, 59);
          doc.text(`• ${subjectName}`, 25, currentY);
          currentY += 5;

          doc.setFontSize(9);
          doc.setFont("helvetica", "italic");
          doc.setTextColor(100, 116, 139);
          const splitReason = doc.splitTextToSize(`Alasan: ${reason}`, 155);
          doc.text(splitReason, 30, currentY);
          currentY += splitReason.length * 4 + 4;
        });
        currentY += 5;
      }
    } else {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.setTextColor(148, 163, 184);
      doc.text("Siswa belum mengikuti tes ini.", 20, currentY);
      currentY += 15;
    }
  });

  // Add Page Borders and Footers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.rect(10, 10, 190, 277);

    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Dicetak melalui PsikoTest - Halaman ${i} dari ${pageCount}`,
      105,
      285,
      { align: "center" },
    );
    doc.setFontSize(7);
    doc.text(
      "DOKUMEN RAHASIA - HANYA UNTUK KEPENTINGAN PENDIDIKAN DAN KONSELING",
      105,
      290,
      { align: "center" },
    );
  }

  doc.save(
    `Laporan_Detail_${student.name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`,
  );
};

import {
  LayoutDashboard,
  ClipboardCheck,
  LogOut,
  User as UserIcon,
  UserCog,
  ChevronRight,
  ArrowUpDown,
  BookOpen,
  Brain,
  Compass,
  Heart,
  GraduationCap,
  ShieldCheck,
  Home,
  Hash,
  ArrowLeft,
  ArrowRight,
  Bell,
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
  Check,
  AlertCircle,
  Share2,
  FileText,
  Sparkles,
  Star,
  History,
  Trophy,
  TrendingUp,
  PieChart as PieChartIcon,
  Loader2,
  Monitor,
  UserCircle,
  Eye,
  EyeOff,
  Lock,
  MessageSquare,
  Palette,
  Eraser,
  Undo2,
  Printer,
  Send,
  Edit2,
  Building2,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Layout,
  GripVertical,
  Settings2,
  AlertTriangle,
  Menu,
  Zap,
  Radar as RadarIcon,
  BarChart3,
  Contact,
  Briefcase,
  RefreshCcw,
  Database,
  School,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "./lib/utils";
import DutaAssistant from "./components/DutaAssistant";
import { InteractiveReport } from "./components/InteractiveReport";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Radar as RechartsRadar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
} from "recharts";
const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn("animate-pulse bg-slate-200 rounded-lg", className)} />
);

const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="space-y-4 p-4">
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="flex gap-4 items-center">
        <Skeleton className="h-10 w-full" />
      </div>
    ))}
  </div>
);

const GlobalLoader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-6 overflow-hidden relative">
    {/* Animated background blobs */}
    <div className="absolute top-1/4 -left-20 w-80 h-80 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
    <div className="absolute top-1/3 -right-20 w-80 h-80 bg-teal-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />

    <div className="relative z-10">
      <div className="relative">
        <div className="w-28 h-28 border-4 border-emerald-50 rounded-full" />
        <div className="absolute top-0 left-0 w-28 h-28 border-4 border-emerald-600 rounded-full border-t-transparent animate-spin" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              opacity: [1, 0.7, 1],
            }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: "easeInOut",
            }}
          >
            <div className="bg-emerald-600 p-4 rounded-2xl shadow-xl shadow-emerald-200">
              <Brain className="w-10 h-10 text-white" />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
    <div className="text-center space-y-3 z-10">
      <div className="space-y-1">
        <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
          PsikoTest
        </h2>
        <div className="h-1 w-12 bg-emerald-600 mx-auto rounded-full" />
      </div>
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-200 shadow-sm animate-pulse">
          <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
          <span className="text-xs font-black text-slate-800 uppercase tracking-widest">
            Menyiapkan Dashboard
          </span>
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">
          Dutatama Software Aplikasi
        </p>
      </div>
    </div>
  </div>
);

const PulseLoader = ({ text = "Sedang memproses..." }: { text?: string }) => (
  <div className="flex flex-col items-center justify-center p-12 space-y-6">
    <div className="relative">
      <div className="w-16 h-16 bg-emerald-50 rounded-2xl animate-pulse" />
      <div className="absolute top-0 left-0 w-16 h-16 flex items-center justify-center">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
        >
          <Brain className="w-8 h-8 text-emerald-600" />
        </motion.div>
      </div>
    </div>
    <div className="text-center">
      <p className="text-sm font-black text-slate-800 uppercase tracking-widest animate-pulse mb-1">
        {text}
      </p>
      <div className="flex gap-1 justify-center">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 bg-emerald-600 rounded-full"
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
          />
        ))}
      </div>
    </div>
  </div>
);

const SummaryBoxLoading = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
    {[...Array(4)].map((_, i) => (
      <div
        key={i}
        className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3"
      >
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-5 w-3/4" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

import ReactMarkdown from "react-markdown";

enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
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
  };
}

function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData.map((provider) => ({
          providerId: provider.providerId,
          displayName: provider.displayName,
          email: provider.email,
          photoUrl: provider.photoURL,
        })) || [],
    },
    operationType,
    path,
  };
  // console.error('Firestore Error: ', JSON.stringify(errInfo)); // Removed to reduce console noise
  throw new Error(JSON.stringify(errInfo));
}

const Toast = ({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error" | "info";
  onClose: () => void;
}) => {
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
        type === "success"
          ? "bg-emerald-600 text-white"
          : type === "error"
            ? "bg-red-600 text-white"
            : "bg-emerald-600 text-white",
      )}
    >
      {type === "success" && <CheckCircle2 className="w-4 h-4" />}
      {type === "error" && <X className="w-4 h-4" />}
      {message}
    </motion.div>
  );
};

const ConfirmModal = ({
  title,
  message,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
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

const StudentGuideModal = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl border border-slate-200 relative overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-emerald-600" />

        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 p-2 rounded-xl">
              <BookOpen className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-xl font-black text-slate-900">
              Panduan Akses Siswa
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="bg-emerald-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-black shrink-0 shadow-lg shadow-emerald-100">
              1
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm mb-1">
                Gunakan Jalur Tanpa Akun Google
              </p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Karena adanya pembatasan usia (di bawah 18 tahun) pada akun
                Google, silakan klik tombol{" "}
                <span className="text-emerald-600 font-black">
                  "MASUK TANPA AKUN GOOGLE"
                </span>{" "}
                di halaman utama.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="bg-emerald-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-black shrink-0 shadow-lg shadow-emerald-100">
              2
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm mb-1">
                Pilih Kategori Peserta
              </p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Klik <span className="font-bold">"SISWA TERDAFTAR"</span> jika
                namamu sudah didaftarkan oleh Guru BK, atau pilih{" "}
                <span className="font-bold">"UMUM"</span> jika kamu peserta dari
                luar sekolah.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="bg-emerald-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-black shrink-0 shadow-lg shadow-emerald-100">
              3
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm mb-1">
                Lengkapi Data Identitas
              </p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Masukkan nomor Password_mu dengan benar, agar hasil tes tidak
                tertukar dengan siswa lain.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="bg-emerald-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-black shrink-0 shadow-lg shadow-emerald-100">
              4
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm mb-1">Mulai Tes</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Setelah masuk ke Dashboard, kamu bisa langsung memilih jenis tes
                yang ingin dikerjakan.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[10px] text-amber-800 leading-relaxed">
            <span className="font-black">Tips:</span> Jika layar blank atau
            gagal masuk, silakan <b>Refresh</b> halaman dengan menekan tombol
            panah melingkar di pojok kiri atas browser Anda.
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-8 bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg"
        >
          SAYA MENGERTI
        </button>
      </motion.div>
    </div>
  );
};

// --- Components ---

const Navbar = ({
  user,
  onLogout,
  onBack,
  setView,
  view,
  notifications,
  showNotifications,
  setShowNotifications,
  markAsRead,
}: {
  user: UserProfile | null;
  onLogout: () => void;
  onBack?: () => void;
  setView: (v: any) => void;
  view: "dashboard" | "admin" | "guide" | "create-test" | "history";
  notifications: AppNotification[];
  showNotifications: boolean;
  setShowNotifications: (v: boolean) => void;
  markAsRead: (id: string) => void;
}) => {
  const isAdminView = view === "admin" || view === "create-test";
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="w-full px-6 sm:px-10 lg:px-12">
        <div className="flex justify-between h-20 items-center">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={onBack}
          >
            <div className="bg-emerald-600 p-2.5 rounded-xl shadow-lg shadow-emerald-200">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 tracking-tighter leading-none">
                PsikoTest
              </span>
            </div>
          </div>

          {user && (
            <div className="flex items-center gap-5">
              <img
                src="https://lh3.googleusercontent.com/d/1UNix_IGpjmt2q0apsIQy-6s3Zr9SnLJ9"
                alt="Dutatama Logo"
                className="h-7 w-auto opacity-90 hidden sm:block"
                referrerPolicy="no-referrer"
              />

              {/* Notifications Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-all relative border border-slate-200"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-[100]"
                    >
                      <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <h4 className="text-sm font-black text-slate-900">
                          Notifikasi
                        </h4>
                        <div className="flex items-center gap-2">
                          {unreadCount > 0 && (
                            <button
                              onClick={() =>
                                notifications
                                  .filter((n) => !n.read)
                                  .forEach((n) => n.id && markAsRead(n.id))
                              }
                              className="text-[10px] font-bold text-slate-500 hover:text-emerald-600 transition-colors"
                            >
                              Tandai semua dibaca
                            </button>
                          )}
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            {unreadCount} Baru
                          </span>
                        </div>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => n.id && markAsRead(n.id)}
                              className={cn(
                                "p-4 border-b border-slate-50 hover:bg-slate-50 transition-all cursor-pointer flex gap-3",
                                !n.read &&
                                  (n.type === "warning"
                                    ? "bg-red-50"
                                    : "bg-emerald-50/30"),
                                n.type === "warning" &&
                                  "border-l-4 border-red-500",
                              )}
                            >
                              <div
                                className={cn(
                                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                  n.type === "warning"
                                    ? "bg-red-100 text-red-600"
                                    : n.type === "info"
                                      ? "bg-blue-100 text-blue-600"
                                      : "bg-emerald-100 text-emerald-600",
                                )}
                              >
                                {n.type === "warning" ? (
                                  <AlertTriangle className="w-5 h-5" />
                                ) : n.type === "info" ? (
                                  <Info className="w-5 h-5" />
                                ) : (
                                  <CheckCircle2 className="w-5 h-5" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start mb-0.5">
                                  <h5
                                    className={cn(
                                      "text-xs font-bold",
                                      n.type === "warning"
                                        ? "text-red-900"
                                        : "text-slate-900",
                                    )}
                                  >
                                    {n.title}
                                  </h5>
                                  {!n.read && (
                                    <div
                                      className={cn(
                                        "w-2 h-2 rounded-full",
                                        n.type === "warning"
                                          ? "bg-red-600"
                                          : "bg-emerald-600",
                                      )}
                                    />
                                  )}
                                </div>
                                <p
                                  className={cn(
                                    "text-[11px] leading-relaxed",
                                    n.type === "warning"
                                      ? "text-red-700"
                                      : "text-slate-500",
                                  )}
                                >
                                  {n.message}
                                </p>
                                <span className="text-[9px] text-slate-400 mt-2 block">
                                  {n.timestamp
                                    ? new Date(
                                        n.timestamp.seconds * 1000,
                                      ).toLocaleString("id-ID")
                                    : "Baru saja"}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center">
                            <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                            <p className="text-xs text-slate-400 font-medium">
                              Tidak ada notifikasi
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {(user.role === "admin" ||
                (user.role === "teacher" &&
                  !(
                    user.expiryDate &&
                    new Date(user.expiryDate.seconds * 1000) < new Date()
                  )) ||
                user.email.toLowerCase() === "dutatama@gmail.com") && (
                <button
                  onClick={() => setView(isAdminView ? "dashboard" : "admin")}
                  className="flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-emerald-50 text-emerald-700 rounded-xl font-black text-[10px] sm:text-sm hover:bg-emerald-100 transition-all shadow-sm border border-emerald-100 cursor-pointer"
                >
                  {isAdminView ? (
                    <BookOpen className="w-3.5 h-3.5 sm:w-4 h-4" />
                  ) : (
                    <LayoutDashboard className="w-3.5 h-3.5 sm:w-4 h-4" />
                  )}
                  <span className="hidden xs:inline">
                    {isAdminView ? "MENU SISWA" : "MENU ADMIN"}
                  </span>
                  <span className="xs:hidden">
                    {isAdminView ? "SISWA" : "ADMIN"}
                  </span>
                </button>
              )}
              {user.role === "guest" && (
                <button
                  onClick={() =>
                    setView(view === "history" ? "dashboard" : "history")
                  }
                  className="flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-blue-50 text-blue-700 rounded-xl font-black text-[10px] sm:text-sm hover:bg-blue-100 transition-all shadow-sm border border-blue-100 cursor-pointer"
                >
                  <History className="w-3.5 h-3.5 sm:w-4 h-4" />
                  <span className="hidden xs:inline">
                    {view === "history" ? "BERANDA" : "RIWAYAT SAYA"}
                  </span>
                  <span className="xs:hidden">
                    {view === "history" ? "BERANDA" : "RIWAYAT"}
                  </span>
                </button>
              )}
              <div className="hidden sm:flex flex-col items-end">
                <div className="flex items-center gap-2">
                  {user.role === "admin" && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-black uppercase rounded-md tracking-tighter">
                      Administrator
                    </span>
                  )}
                  {user.role === "teacher" && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-600 text-[10px] font-black uppercase rounded-md tracking-tighter">
                      Guru BK
                    </span>
                  )}
                  <span className="text-sm font-black text-slate-900">
                    {user.name}
                  </span>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  {user.email}
                </span>
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

const TestCard = ({
  test,
  type,
  onSelect,
  onPreview,
  recommendation,
  results,
}: {
  test: any;
  type: TestType;
  onSelect: (type: TestType) => void;
  onPreview: (type: TestType) => void;
  recommendation?: string;
  results: TestResult[];
}) => {
  const icons: Record<TestType, any> = {
    learning_style: BookOpen,
    multiple_intelligences: Brain,
    personality: UserIcon,
    aptitude_interest: Compass,
    school_major: GraduationCap,
    anxiety: Heart,
    wartegg: Palette,
    subject_interest: Star,
    cfit: Zap,
    school_career: Briefcase,
  };
  const Icon = icons[type];

  const colors = [
    "bg-emerald-500/20",
    "bg-blue-500/20",
    "bg-amber-500/20",
    "bg-rose-500/20",
    "bg-violet-500/20",
    "bg-cyan-500/20",
    "bg-orange-500/20",
    "bg-fuchsia-500/20",
  ];
  const color = colors[Object.keys(TESTS).indexOf(type) % colors.length];

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`group relative bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-emerald-200 transition-all cursor-pointer overflow-hidden flex flex-col h-full`}
    >
      <div
        className={`absolute top-0 right-0 p-3 opacity-20 transition-opacity ${color.replace("/20", "")}`}
        onClick={() => onSelect(type)}
      >
        <Icon className="w-16 h-16 text-slate-900" />
      </div>
      <div className="relative z-10 flex-1" onClick={() => onSelect(type)}>
        <div
          className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center mb-3 transition-colors`}
        >
          <Icon
            className={`w-5 h-5 ${color.replace("bg-", "text-").replace("/20", "")}`}
          />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1">
          {test.title}
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed mb-3">
          {test.description}
        </p>

        {recommendation && (
          <div className="mb-3 p-2 bg-emerald-50 rounded-lg border border-emerald-100 flex items-start gap-1.5">
            <Info className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
            <p className="text-[10px] text-emerald-700 font-medium leading-tight">
              Rekomendasi: {recommendation}
            </p>
          </div>
        )}

        {results.length > 0 && (
          <div className="mt-2 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/50 group-hover:border-emerald-200 group-hover:bg-emerald-50 transition-all">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">
                  Hasil Terakhir
                </span>
              </div>
              <span className="text-[9px] font-bold text-emerald-600/60 uppercase">
                {results.sort(
                  (a, b) =>
                    (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0),
                )[0].timestamp?.seconds
                  ? new Date(
                      results.sort(
                        (a, b) =>
                          (b.timestamp?.seconds || 0) -
                          (a.timestamp?.seconds || 0),
                      )[0].timestamp.seconds * 1000,
                    ).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                    })
                  : ""}
              </span>
            </div>
            <p className="text-[11px] font-black text-slate-800 leading-tight">
              {getShortResult(
                type,
                results.sort(
                  (a, b) =>
                    (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0),
                )[0].scores,
              )}
            </p>
          </div>
        )}
      </div>

      <div className="relative z-10 mt-auto pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between gap-2">
          {results.length > 0 ? (
            <button
              onClick={() => onSelect(type)}
              className="flex-1 py-2 bg-emerald-600 text-white rounded-lg font-bold text-xs hover:bg-emerald-700 transition-all"
            >
              Ulangi Tes
            </button>
          ) : (
            <button
              onClick={() => onSelect(type)}
              className="flex-1 py-2 bg-emerald-600 text-white rounded-lg font-bold text-xs hover:bg-emerald-700 transition-all flex items-center justify-center gap-1"
            >
              Mulai Tes <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPreview(type);
            }}
            className="px-3 py-2 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg font-bold text-xs hover:bg-indigo-100 hover:border-indigo-200 transition-all flex items-center justify-center gap-1.5 shadow-sm"
            title="Penjelasan Tes"
          >
            <Eye className="w-4 h-4" /> <span>Penjelasan Tes</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const TestPreviewModal = ({
  type,
  onClose,
  onStart,
}: {
  type: TestType;
  onClose: () => void;
  onStart: (type: TestType) => void;
}) => {
  const test = TESTS[type];
  if (!test) return null;

  const exampleQuestions = test.questions.slice(0, 3);
  const responseType =
    type === "personality" || type === "anxiety"
      ? "Skala Likert (Sangat Tidak Setuju - Sangat Setuju)"
      : "Pilihan Ganda";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Eye className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 leading-none">
                Penjelasan: {test.title}
              </h3>
              <p className="text-slate-500 text-[10px] mt-1 font-bold uppercase tracking-wider">
                Metode: {responseType}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-8">
          <section>
            <h4 className="text-xs font-black text-slate-900 mb-3 flex items-center gap-2 uppercase tracking-widest text-emerald-600">
              TUJUAN TES
            </h4>
            <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 font-medium">
              {test.educationalObjective || test.description}
            </p>
          </section>

          {(test.questionTypeDesc || test.resultInterpretation) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {test.questionTypeDesc && (
                <section className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                  <h4 className="text-[11px] font-black text-indigo-900 mb-2 flex items-center gap-1.5 uppercase tracking-widest">
                    <Info className="w-3.5 h-3.5 text-indigo-600" />
                    Jenis Pertanyaan
                  </h4>
                  <p className="text-indigo-800/80 text-[13px] leading-relaxed font-medium">
                    {test.questionTypeDesc}
                  </p>
                </section>
              )}
              {test.resultInterpretation && (
                <section className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
                  <h4 className="text-[11px] font-black text-amber-900 mb-2 flex items-center gap-1.5 uppercase tracking-widest">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    Interpretasi Hasil
                  </h4>
                  <p className="text-amber-800/80 text-[13px] leading-relaxed font-medium">
                    {test.resultInterpretation}
                  </p>
                </section>
              )}
            </div>
          )}

          <section>
            <h4 className="text-xs font-black text-slate-900 mb-4 flex items-center gap-2 uppercase tracking-widest text-emerald-600">
              CONTOH PERTANYAAN
            </h4>
            <div className="space-y-3">
              {(exampleQuestions || []).map((q: any, i: number) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl border border-slate-100 bg-white shadow-sm"
                >
                  <p className="text-sm font-bold text-slate-800 mb-3">
                    {i + 1}. {q?.text || "Pertanyaan tidak tersedia"}
                  </p>
                  <div className="space-y-2">
                    {type === "personality" || type === "anxiety" ? (
                      <div className="flex justify-between items-center px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                          Sangat Tidak Setuju
                        </span>
                        <div className="flex gap-2.5">
                          {[1, 2, 3, 4].map((n) => (
                            <div
                              key={n}
                              className="w-7 h-7 rounded-full border-2 border-slate-200 bg-white"
                            />
                          ))}
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                          Sangat Setuju
                        </span>
                      </div>
                    ) : (
                      (q?.options || [])
                        .slice(0, 2)
                        .map((opt: any, idx: number) => (
                          <div
                            key={idx}
                            className="px-4 py-3 border border-slate-100 rounded-xl text-xs text-slate-600 font-bold flex items-center gap-3 bg-slate-50/50"
                          >
                            <div className="w-5 h-5 rounded-full border-2 border-slate-300 bg-white" />
                            {opt?.text || "Opsi tidak tersedia"}
                          </div>
                        ))
                    )}
                  </div>
                </div>
              ))}
              <div className="text-center py-2">
                <p className="text-[10px] text-slate-400 font-bold italic uppercase tracking-widest">
                  ...dan {test.questions.length - 3} pertanyaan lainnya
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="p-6 bg-slate-50 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex gap-2">
            <div className="flex-1 p-3 rounded-2xl bg-white border border-slate-200 text-center">
              <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                ONLINE
              </h5>
              <p className="text-[10px] font-black text-emerald-600 uppercase">
                Tersedia
              </p>
            </div>
            <div className="flex-1 p-3 rounded-2xl bg-white border border-slate-200 text-center">
              <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                OFFLINE
              </h5>
              <p className="text-[10px] font-black text-slate-400 uppercase">
                Tulis Tangan
              </p>
            </div>
          </div>
          <button
            onClick={() => onStart(type)}
            className="flex-1 sm:flex-[1.5] py-4 px-6 bg-emerald-600 text-white rounded-2xl font-black text-sm hover:bg-emerald-700 shadow-xl shadow-emerald-200 flex items-center justify-center gap-2 group transition-all"
          >
            MULAI TES SEKARANG{" "}
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const WarteggCanvas = ({
  index,
  onSave,
  initialData,
}: {
  index: number;
  onSave: (data: string) => void;
  initialData?: string;
}) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const drawStimulus = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.setLineDash([]);
    ctx.fillStyle = "#000";

    switch (index) {
      case 0: // Point in center
        ctx.beginPath();
        ctx.arc(150, 150, 3, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 1: // Curved line
        ctx.beginPath();
        ctx.moveTo(60, 60);
        ctx.quadraticCurveTo(90, 30, 120, 60);
        ctx.stroke();
        break;
      case 2: // Three vertical lines
        ctx.beginPath();
        ctx.moveTo(210, 240);
        ctx.lineTo(210, 210);
        ctx.moveTo(225, 240);
        ctx.lineTo(225, 195);
        ctx.moveTo(240, 240);
        ctx.lineTo(240, 180);
        ctx.stroke();
        break;
      case 3: // Small black square
        ctx.fillRect(240, 60, 15, 15);
        break;
      case 4: // Two slanting lines
        ctx.beginPath();
        ctx.moveTo(60, 210);
        ctx.lineTo(90, 240);
        ctx.moveTo(60, 240);
        ctx.lineTo(90, 210);
        ctx.stroke();
        break;
      case 5: // Horizontal and vertical lines
        ctx.beginPath();
        ctx.moveTo(150, 60);
        ctx.lineTo(150, 120);
        ctx.moveTo(180, 90);
        ctx.lineTo(240, 90);
        ctx.stroke();
        break;
      case 6: // Dotted curve
        ctx.setLineDash([3, 6]);
        ctx.beginPath();
        ctx.arc(240, 210, 30, Math.PI, Math.PI * 1.5);
        ctx.stroke();
        ctx.setLineDash([]);
        break;
      case 7: // Large curve
        ctx.beginPath();
        ctx.arc(150, 240, 60, Math.PI, 0);
        ctx.stroke();
        break;
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
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
      setHistory((prev) => [...prev, data]);
      onSave(data);
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x =
      ("touches" in e
        ? e.touches[0].clientX
        : (e as React.MouseEvent).clientX) - rect.left;
    const y =
      ("touches" in e
        ? e.touches[0].clientY
        : (e as React.MouseEvent).clientY) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);

    // Save state before drawing
    const data = canvas.toDataURL();
    if (history.length === 0 || history[history.length - 1] !== data) {
      setHistory((prev) => [...prev, data]);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x =
      ("touches" in e
        ? e.touches[0].clientX
        : (e as React.MouseEvent).clientX) - rect.left;
    const y =
      ("touches" in e
        ? e.touches[0].clientY
        : (e as React.MouseEvent).clientY) - rect.top;

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
    const ctx = canvas.getContext("2d");
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
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Save current to history before clearing
    setHistory((prev) => [...prev, canvas.toDataURL()]);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawStimulus(ctx);
    onSave("");
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
          style={{ width: "100%", maxWidth: "400px", aspectRatio: "1/1" }}
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

// --- Test Progress Helpers ---
const STORAGE_PREFIX = "psikotest_progress_";
const getProgressKey = (uid: string, testType: string) =>
  `${STORAGE_PREFIX}${uid}_${testType}`;

const ResumeTestModal = ({
  testType,
  onResume,
  onStartFresh,
  onCancel,
}: {
  testType: TestType;
  onResume: () => void;
  onStartFresh: () => void;
  onCancel: () => void;
}) => {
  const testInfo = TESTS[testType];
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl border border-slate-200 text-center"
      >
        <div className="bg-emerald-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <History className="w-8 h-8 text-emerald-600" />
        </div>
        <h3 className="text-xl font-black text-slate-900 mb-2">
          Lanjutkan Tes?
        </h3>
        <p className="text-slate-500 text-sm mb-8 leading-relaxed">
          Kami menemukan progres pengerjaan tes{" "}
          <b>{testInfo?.title || "ini"}</b> yang belum selesai. Apakah Anda
          ingin melanjutkannya?
        </p>

        <div className="space-y-3">
          <button
            onClick={onResume}
            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black hover:bg-emerald-700 transition-all shadow-lg flex items-center justify-center gap-2 group"
          >
            LANJUTKAN TES{" "}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={onStartFresh}
            className="w-full bg-white text-emerald-600 border-2 border-emerald-600 py-3 rounded-2xl font-black hover:bg-emerald-50 transition-all"
          >
            MULAI DARI AWAL
          </button>
          <button
            onClick={onCancel}
            className="w-full text-slate-400 text-xs font-bold hover:text-slate-600 transition-colors py-2"
          >
            BATAL
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const SubjectInterestTest = ({
  onComplete,
  userId,
  onCancel,
}: {
  onComplete: (scores: Record<string, number>, extraData?: any) => void;
  userId: string;
  onCancel: () => void;
}) => {
  const subjects = [
    { id: "agama", name: "Pendidikan Agama dan Budi Pekerti" },
    { id: "ppkn", name: "Pendidikan Pancasila dan Kewarganegaraan" },
    { id: "b_indo", name: "Bahasa Indonesia" },
    { id: "mtk", name: "Matematika" },
    { id: "ipa", name: "Ilmu Pengetahuan Alam (IPA)" },
    { id: "ips", name: "Ilmu Pengetahuan Sosial (IPS)" },
    { id: "b_ing", name: "Bahasa Inggris" },
    { id: "seni", name: "Seni Budaya" },
    { id: "pjok", name: "Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)" },
    { id: "prakarya", name: "Prakarya" },
    { id: "informatika", name: "Informatika" },
    { id: "b_daerah", name: "Bahasa Daerah" },
    { id: "bk", name: "Bimbingan Konseling (BK)" },
  ];

  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [pendingProgress, setPendingProgress] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem(
      getProgressKey(userId, "subject_interest"),
    );
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.selectedSubjects?.length > 0) {
          setPendingProgress(parsed);
          setShowResumeModal(true);
        }
      } catch (e) {
        console.error("Error parsing saved progress:", e);
      }
    }
  }, [userId]);

  useEffect(() => {
    if (selectedSubjects.length > 0) {
      localStorage.setItem(
        getProgressKey(userId, "subject_interest"),
        JSON.stringify({
          selectedSubjects,
          reasons,
          timestamp: Date.now(),
        }),
      );
    }
  }, [selectedSubjects, reasons, userId]);

  const handleResume = () => {
    if (pendingProgress) {
      setSelectedSubjects(pendingProgress.selectedSubjects || []);
      setReasons(pendingProgress.reasons || {});
    }
    setShowResumeModal(false);
  };

  const handleStartFresh = () => {
    localStorage.removeItem(getProgressKey(userId, "subject_interest"));
    setSelectedSubjects([]);
    setReasons({});
    setShowResumeModal(false);
  };

  const toggleSubject = (id: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const handleReasonChange = (id: string, text: string) => {
    setReasons((prev) => ({ ...prev, [id]: text }));
  };

  const handleSubmit = () => {
    if (selectedSubjects.length === 0) {
      alert("Silakan pilih minimal satu mata pelajaran.");
      return;
    }

    const scores: Record<string, number> = {};
    const sanitizedReasons: Record<string, string> = {};
    selectedSubjects.forEach((s) => {
      scores[s] = 1;
      sanitizedReasons[s] = reasons[s] || "";
    });

    onComplete(scores, { reasons: sanitizedReasons });
    localStorage.removeItem(getProgressKey(userId, "subject_interest"));
  };

  return (
    <div className="space-y-8">
      {showResumeModal && (
        <ResumeTestModal
          testType="subject_interest"
          onResume={handleResume}
          onStartFresh={handleStartFresh}
          onCancel={onCancel}
        />
      )}
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-black text-slate-900">
          Minat Terhadap Mata Pelajaran
        </h3>
        <p className="text-slate-500 text-sm">
          Pelajaran apa yang Anda sukai? Pilih mata pelajaran dan sebutkan
          alasannya.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Subjects */}
        <div className="space-y-4">
          <h4 className="text-xs font-black text-emerald-600 uppercase tracking-widest border-b border-emerald-100 pb-2">
            Mata Pelajaran
          </h4>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {subjects.map((subject) => (
              <label
                key={subject.id}
                className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedSubjects.includes(subject.id)
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200"
                }`}
              >
                <input
                  type="checkbox"
                  className="hidden"
                  checked={selectedSubjects.includes(subject.id)}
                  onChange={() => toggleSubject(subject.id)}
                />
                <div
                  className={`w-5 h-5 rounded-md border-2 mr-3 flex items-center justify-center transition-all ${
                    selectedSubjects.includes(subject.id)
                      ? "bg-emerald-500 border-emerald-500"
                      : "bg-white border-slate-300"
                  }`}
                >
                  {selectedSubjects.includes(subject.id) && (
                    <Check className="w-3.5 h-3.5 text-white" />
                  )}
                </div>
                <span className="text-sm font-bold">{subject.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Right Column: Reasons */}
        <div className="space-y-4">
          <h4 className="text-xs font-black text-emerald-600 uppercase tracking-widest border-b border-emerald-100 pb-2">
            Alasan
          </h4>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {selectedSubjects.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
                <Info className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-xs font-medium text-center">
                  Pilih mata pelajaran di sebelah kiri untuk memberikan alasan.
                </p>
              </div>
            ) : (
              selectedSubjects.map((id) => {
                const subject = subjects.find((s) => s.id === id);
                return (
                  <div
                    key={id}
                    className="space-y-2 animate-in fade-in slide-in-from-right-4 duration-300"
                  >
                    <label className="text-[10px] font-black text-slate-500 uppercase">
                      {subject?.name}
                    </label>
                    <textarea
                      value={reasons[id] || ""}
                      onChange={(e) => handleReasonChange(id, e.target.value)}
                      placeholder={`Mengapa Anda menyukai ${subject?.name}?`}
                      className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm min-h-[80px] bg-white shadow-sm"
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-slate-100">
        <button
          onClick={handleSubmit}
          className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
        >
          SELESAI & SIMPAN HASIL <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

const WarteggTest = ({
  onComplete,
  userId,
  onCancel,
}: {
  onComplete: (scores: Record<string, number>, extraData?: any) => void;
  userId: string;
  onCancel: () => void;
}) => {
  const [drawings, setDrawings] = useState<Record<number, string>>({});
  const [titles, setTitles] = useState<Record<number, string>>({});
  const [step, setStep] = useState<"drawing" | "titles">("drawing");
  const [currentBox, setCurrentBox] = useState(0);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [pendingProgress, setPendingProgress] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem(getProgressKey(userId, "wartegg"));
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Object.keys(parsed.drawings || {}).length > 0) {
          setPendingProgress(parsed);
          setShowResumeModal(true);
        }
      } catch (e) {
        console.error("Error parsing saved progress:", e);
      }
    }
  }, [userId]);

  useEffect(() => {
    if (Object.keys(drawings).length > 0 || Object.keys(titles).length > 0) {
      localStorage.setItem(
        getProgressKey(userId, "wartegg"),
        JSON.stringify({
          drawings,
          titles,
          step,
          currentBox,
          timestamp: Date.now(),
        }),
      );
    }
  }, [drawings, titles, step, currentBox, userId]);

  const handleResume = () => {
    if (pendingProgress) {
      setDrawings(pendingProgress.drawings || {});
      setTitles(pendingProgress.titles || {});
      setStep(pendingProgress.step || "drawing");
      setCurrentBox(pendingProgress.currentBox || 0);
    }
    setShowResumeModal(false);
  };

  const handleStartFresh = () => {
    localStorage.removeItem(getProgressKey(userId, "wartegg"));
    setDrawings({});
    setTitles({});
    setStep("drawing");
    setCurrentBox(0);
    setShowResumeModal(false);
  };

  const handleSaveDrawing = (index: number, data: string) => {
    setDrawings((prev) => ({ ...prev, [index]: data }));
  };

  const isAllDrawn =
    Object.keys(drawings).filter((k) => drawings[parseInt(k)] !== "").length ===
    8;

  if (step === "titles") {
    return (
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="bg-emerald-500 p-6 rounded-3xl text-white shadow-lg shadow-emerald-100">
          <h4 className="font-black text-xl mb-1">Langkah Terakhir</h4>
          <p className="text-emerald-50 text-sm opacity-90 font-medium">
            Berikan judul yang menarik untuk setiap mahakarya yang telah Anda
            buat.
          </p>
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
                  <img
                    src={drawings[i]}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Palette className="w-8 h-8 text-slate-200" />
                )}
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                  Gambar {i + 1}
                </label>
                <input
                  type="text"
                  value={titles[i] || ""}
                  onChange={(e) =>
                    setTitles((prev) => ({ ...prev, [i]: e.target.value }))
                  }
                  placeholder="Beri judul gambar..."
                  className="w-full px-4 py-3 text-sm border-2 border-slate-100 rounded-xl focus:border-emerald-500 outline-none transition-all font-bold text-slate-700"
                />
              </div>
            </motion.div>
          ))}
        </div>
        <button
          onClick={() => {
            onComplete({}, { drawings, titles });
            localStorage.removeItem(getProgressKey(userId, "wartegg"));
          }}
          disabled={
            Object.keys(titles).length < 8 ||
            Object.values(titles).some((t) => !t.trim())
          }
          className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-3xl font-black shadow-xl shadow-emerald-100 transition-all text-lg tracking-tight"
        >
          SELESAIKAN DAN KIRIM HASIL
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      {showResumeModal && (
        <ResumeTestModal
          testType="wartegg"
          onResume={handleResume}
          onStartFresh={handleStartFresh}
          onCancel={onCancel}
        />
      )}
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
            <Palette className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              Tes Wartegg
            </h3>
            <p className="text-slate-500 text-sm font-medium">
              Selesaikan stimulus di bawah ini menjadi gambar yang bermakna.
            </p>
          </div>
        </div>
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <p className="text-sm text-slate-600 leading-relaxed font-medium italic">
            "Gunakan imajinasi Anda sebebas mungkin. Tidak ada benar atau salah
            dalam menggambar. Mulailah dari kotak mana pun yang Anda sukai."
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
              onClick={() => setCurrentBox((prev) => Math.max(0, prev - 1))}
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
                    currentBox === i
                      ? "bg-emerald-500 w-8"
                      : drawings[i]
                        ? "bg-emerald-200"
                        : "bg-slate-200",
                  )}
                />
              ))}
            </div>
            <button
              onClick={() => setCurrentBox((prev) => Math.min(7, prev + 1))}
              disabled={currentBox === 7}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-30 text-white rounded-xl font-black transition-all flex items-center gap-2"
            >
              SELANJUTNYA <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sidebar Overview */}
        <div className="w-full lg:w-72 space-y-4">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">
            Daftar Kotak
          </h4>
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
                      : "border-slate-100 bg-white hover:border-slate-300",
                )}
              >
                {drawings[i] ? (
                  <img
                    src={drawings[i]}
                    className="w-full h-full object-contain p-1"
                  />
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
              onClick={() => setStep("titles")}
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

const TestForm = ({
  type,
  userId,
  customTest,
  onComplete,
  onCancel,
  isAnalyzingTest,
}: {
  type: TestType;
  userId: string;
  customTest?: any;
  onComplete: (scores: Record<string, number>, extraData?: any) => void;
  onCancel: () => void;
  isAnalyzingTest?: boolean;
}) => {
  const test = customTest || TESTS[type];
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [scores, setScores] = useState<Record<string, number>>({});
  const [history, setHistory] = useState<
    { questionId: string; value: string; score: number }[]
  >([]);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [pendingProgress, setPendingProgress] = useState<any>(null);

  useEffect(() => {
    // Check for standard test progress
    if (type !== "wartegg" && type !== "subject_interest") {
      const saved = localStorage.getItem(getProgressKey(userId, type));
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (
            parsed.currentIdx > 0 ||
            Object.keys(parsed.answers || {}).length > 0
          ) {
            setPendingProgress(parsed);
            setShowResumeModal(true);
          }
        } catch (e) {
          console.error("Error parsing saved progress:", e);
        }
      }
    }
  }, [userId, type]);

  useEffect(() => {
    if (type !== "wartegg" && type !== "subject_interest") {
      if (currentIdx > 0 || Object.keys(answers).length > 0) {
        localStorage.setItem(
          getProgressKey(userId, type),
          JSON.stringify({
            currentIdx,
            answers,
            scores,
            history,
            timestamp: Date.now(),
          }),
        );
      }
    }
  }, [currentIdx, answers, scores, history, userId, type]);

  const handleResume = () => {
    if (pendingProgress) {
      setCurrentIdx(pendingProgress.currentIdx || 0);
      setAnswers(pendingProgress.answers || {});
      setScores(pendingProgress.scores || {});
      setHistory(pendingProgress.history || []);
    }
    setShowResumeModal(false);
  };

  const handleStartFresh = () => {
    localStorage.removeItem(getProgressKey(userId, type));
    setCurrentIdx(0);
    setAnswers({});
    setScores({});
    setHistory([]);
    setShowResumeModal(false);
  };

  const handleAnswer = (
    questionId: string,
    value: string,
    score: number = 1,
  ) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    const newScores = { ...scores, [value]: (scores[value] || 0) + score };
    setScores(newScores);
    setHistory((prev) => [...prev, { questionId, value, score }]);

    if (currentIdx < test.questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      onComplete(newScores);
      localStorage.removeItem(getProgressKey(userId, type));
    }
  };

  const handleBack = () => {
    if (currentIdx > 0) {
      const lastAnswer = history[history.length - 1];
      setScores((prev) => ({
        ...prev,
        [lastAnswer.value]: prev[lastAnswer.value] - lastAnswer.score,
      }));
      setHistory((prev) => prev.slice(0, -1));
      setCurrentIdx(currentIdx - 1);
    }
  };

  const progress = ((currentIdx + 1) / test.questions.length) * 100;

  if (isAnalyzingTest) {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden flex flex-col items-center justify-center p-12 min-h-[400px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="mb-6"
        >
          <Brain className="w-16 h-16 text-emerald-500" />
        </motion.div>
        <h3 className="text-xl font-black text-slate-900 mb-2 text-center">
          Menganalisis Hasil Tes...
        </h3>
        <p className="text-slate-500 text-center max-w-sm">
          AI sedang memproses jawaban Anda untuk memberikan rekomendasi yang
          dipersonalisasi. Mohon tunggu sebentar.
        </p>
      </div>
    );
  }

  const colors = [
    "bg-emerald-500/20",
    "bg-blue-500/20",
    "bg-amber-500/20",
    "bg-rose-500/20",
    "bg-violet-500/20",
    "bg-cyan-500/20",
    "bg-orange-500/20",
    "bg-fuchsia-500/20",
  ];
  const color = colors[Object.keys(TESTS).indexOf(type) % colors.length];

  return (
    <div className="max-w-xl mx-auto py-6 px-4">
      <button
        onClick={onCancel}
        className="flex items-center text-emerald-600 border border-emerald-500 hover:bg-emerald-50 px-4 py-2 rounded-xl mb-6 text-sm font-bold transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
      </button>

      {showResumeModal && (
        <ResumeTestModal
          testType={type}
          onResume={handleResume}
          onStartFresh={handleStartFresh}
          onCancel={onCancel}
        />
      )}

      {/* Progress Indicator */}
      <div
        className={`mb-6 p-4 rounded-2xl shadow-sm flex items-center gap-4 ${color}`}
      >
        <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
          <svg
            className="w-full h-full transform -rotate-90"
            viewBox="0 0 36 36"
          >
            <path
              className="text-black/10"
              strokeWidth="3"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className={`${color.replace("bg-", "text-").replace("/20", "")} transition-all duration-500 ease-out`}
              strokeDasharray={`${(currentIdx / test.questions.length) * 100}, 100`}
              strokeWidth="3"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <span
            className={`absolute text-xs font-black ${color.replace("bg-", "text-").replace("/20", "")}`}
          >
            {Math.round((currentIdx / test.questions.length) * 100)}%
          </span>
        </div>
        <div className="flex-1">
          <h4
            className={`text-sm font-bold ${color.replace("bg-", "text-").replace("/20", "")} mb-1`}
          >
            Progres Pengerjaan
          </h4>
          <p
            className={`text-xs ${color.replace("bg-", "text-").replace("/20", "")}/90 font-medium`}
          >
            Telah menyelesaikan <span className="font-bold">{currentIdx}</span>{" "}
            dari <span className="font-bold">{test.questions.length}</span>{" "}
            pertanyaan.
          </p>
        </div>
      </div>

      <div
        className={`rounded-2xl shadow-lg border border-slate-100 overflow-hidden ${color}`}
      >
        <div className="p-6 sm:p-8">
          {type === "wartegg" ? (
            <WarteggTest
              onComplete={onComplete}
              userId={userId}
              onCancel={onCancel}
            />
          ) : type === "subject_interest" ? (
            <SubjectInterestTest
              onComplete={onComplete}
              userId={userId}
              onCancel={onCancel}
            />
          ) : (
            <>
              <span
                className={`text-[10px] font-bold ${color.replace("bg-", "text-").replace("/20", "")} uppercase tracking-widest mb-3 block`}
              >
                Pertanyaan {currentIdx + 1}
              </span>
              <h2
                className={`text-xl font-bold ${color.replace("bg-", "text-").replace("/20", "")} mb-6 leading-tight`}
              >
                {test?.questions?.[currentIdx]?.text ||
                  "Pertanyaan tidak ditemukan"}
              </h2>

              <div className="space-y-3">
                {(test?.questions?.[currentIdx]?.options || []).map(
                  (opt: any, i: number) => (
                    <button
                      key={i}
                      onClick={() =>
                        handleAnswer(
                          test.questions[currentIdx].id,
                          opt.value,
                          opt.score,
                        )
                      }
                      className={`w-full text-left p-4 rounded-xl border-2 border-white bg-white/10 hover:bg-white/30 transition-all group flex items-center justify-between ${color.replace("bg-", "text-").replace("/20", "")}`}
                    >
                      <span className="text-sm text-slate-900 font-bold group-hover:text-slate-950">
                        {opt?.text || "Opsi Kosong"}
                      </span>
                      <div className="w-5 h-5 rounded-full border-2 border-white/50 group-hover:border-white flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>
                  ),
                )}
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

const ResultView = ({
  result,
  onBack,
  showToast,
  teacherSettings,
  results,
}: {
  result: TestResult;
  onBack: () => void;
  showToast: (m: string, t?: "success" | "error" | "info") => void;
  teacherSettings: TeacherSettings | null;
  results: TestResult[];
}) => {
  const [aiExplanation, setAiExplanation] = useState(
    result.aiExplanation || "",
  );
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [vType, setVType] = useState<"bar" | "pie" | "radar">(() => {
    if (result.visualizationType) return result.visualizationType;
    if (result.testType === "multiple_intelligences") return "radar";
    return "bar";
  });

  const chartData = Object.entries(result.scores).map(([name, value]) => {
    const indonesianMap: Record<string, string> = {
      // Personality
      extrovert: "Ekstrovert",
      introvert: "Introvert",
      sensing: "Pengindera (Sensing)",
      intuition: "Intuisi (Intuition)",
      thinking: "Thinking (Berpikir)",
      feeling: "Feeling (Perasaan)",
      judging: "Judging (Menilai)",
      perceiving: "Perceiving (Spontan)",
      // Multiple Intelligences
      linguistic: "Linguistik",
      logical: "Logika/Matematika",
      spatial: "Spasial",
      visual: "Visual/Spasial",
      musical: "Musikal",
      kinesthetic: "Kinestetik",
      interpersonal: "Interpersonal",
      intrapersonal: "Intrapersonal",
      naturalist: "Naturalis",
      // RIASEC
      realistic: "Realistik",
      investigative: "Investigatif",
      artistic: "Artistik",
      enterprising: "Enterprising",
      conventional: "Konvensional",
      social:
        result.testType === "school_career" ? "Kepedulian Sosial" : "Sosial",
      // School Major
      ipa: "MIPA (IPA)",
      ips: "IPS",
      bahasa: "Bahasa",
      smk: "SMK",
      // Learning Style
      visual_ls: "Visual",
      auditory: "Auditori",
      kinesthetic_ls: "Kinestetik",
      // School Career
      salarry: "Kebutuhan Finansial",
      creative: "Kreativitas & Inovasi",
      balance: "Keseimbangan Hidup",
      analytical: "Kemampuan Analitis",
      communication: "Kemampuan Komunikasi",
      technical: "Keahlian Teknis",
      leadership: "Jiwa Kepemimpinan",
      formal: "Lingkungan Formal",
      flexible: "Lingkungan Fleksibel",
      outdoor: "Lingkungan Lapangan",
      lab: "Laboratorium & Riset",
      expert: "Spesialis/Pakar",
      entrepreneur: "Kemandirian Bisnis",
      impactful: "Kontribusi Sosial",
      high_position: "Jabatan & Otoritas",
    };
    return {
      name:
        indonesianMap[name] ||
        name.charAt(0).toUpperCase() + name.slice(1).replace("_", " "),
      value,
    };
  });

  const sortedData = [...chartData].sort((a, b) => b.value - a.value);
  const group1 = ["learning_style", "school_major", "anxiety"];
  const group2 = ["multiple_intelligences", "personality", "aptitude_interest"];

  let summaryText = "";
  if (sortedData.length > 0) {
    if (group1.includes(result.testType)) {
      summaryText = `Dari hasil tes di atas anda cenderung memiliki tipe <strong>${sortedData[0].name}</strong>.`;
    } else if (result.testType === "wartegg") {
      summaryText = `Tes Wartegg Anda telah berhasil dianalisis secara visual. Silakan klik tombol <strong>ANALISA AI</strong> untuk mendapatkan interpretasi psikologis yang mendalam dari gambar Anda.`;
    } else if (result.testType === "cfit") {
      const rawScore = result.scores["cfit"] || 0;
      const iq = Math.round((rawScore / 40) * 70 + 70);
      summaryText = `Hasil Tes CFIT Anda menunjukkan estimasi IQ sebesar <strong>${iq}</strong>.`;
    } else {
      const top3 = sortedData
        .slice(0, 3)
        .map((d) => d.name)
        .join(", ");
      summaryText = `Dari hasil tes di atas anda cenderung memiliki tipe <strong>${top3}</strong>.`;
    }
  }

  const COLORS = [
    "#059669",
    "#10b981",
    "#0d9488",
    "#14b8a6",
    "#16a34a",
    "#22c55e",
    "#65a30d",
    "#84cc16",
  ];

  const renderChart = () => {
    // Force specific charts for certain tests where others don't make sense
    if (result.testType === "anxiety" || result.testType === "cfit") {
      const isAnxiety = result.testType === "anxiety";
      const isCfit = result.testType === "cfit";
      const rawScore = isAnxiety
        ? result.scores["anxiety"] || 0
        : isCfit
          ? result.scores["cfit"] || 0
          : Object.values(result.scores).reduce((a, b) => a + b, 0);
      const iqValue = isAnxiety
        ? rawScore
        : isCfit
          ? Math.round((rawScore / 40) * 70 + 70)
          : Math.round((rawScore / 100) * 60 + 80);
      const maxVal = isAnxiety ? 90 : 140;
      const gLabel = isAnxiety
        ? "Skor Kecemasan"
        : isCfit
          ? "Estimasi IQ CFIT"
          : "Estimasi IQ";
      const gData = [
        {
          name: "Value",
          value: iqValue,
          fill: isAnxiety
            ? iqValue > 45
              ? "#ef4444"
              : iqValue > 15
                ? "#f59e0b"
                : "#10b981"
            : iqValue >= 120
              ? "#10b981"
              : iqValue >= 90
                ? "#3b82f6"
                : "#f59e0b",
        },
        {
          name: "Remaining",
          value: Math.max(0, maxVal - iqValue),
          fill: "#f1f5f9",
        },
      ];

      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center space-y-4"
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gData}
                  cx="50%"
                  cy="50%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={0}
                  dataKey="value"
                  animationBegin={200}
                  animationDuration={1500}
                  animationEasing="ease-out"
                >
                  {gData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-2 shadow-lg border border-slate-100 rounded-lg text-xs font-bold">
                          {payload[0].name === "Value"
                            ? `${gLabel}: ${payload[0].value}`
                            : "Sisa Skala"}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center -mt-20">
            <motion.span
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="text-5xl font-black text-slate-900 drop-shadow-sm"
            >
              {iqValue}
            </motion.span>
            {isAnxiety && (
              <span className="text-slate-400 font-bold ml-1 text-lg">
                / {maxVal}
              </span>
            )}
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mt-2 leading-none">
              {gLabel}
            </p>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className={cn(
                "text-sm font-black mt-4 px-6 py-2 rounded-2xl inline-block shadow-sm",
                isAnxiety
                  ? iqValue > 45
                    ? "bg-red-50 text-red-600 border border-red-100"
                    : iqValue > 15
                      ? "bg-amber-50 text-amber-600 border border-amber-100"
                      : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                  : iqValue >= 130
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                    : iqValue >= 120
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                      : iqValue >= 110
                        ? "bg-blue-50 text-blue-600 border border-blue-100"
                        : iqValue >= 90
                          ? "bg-blue-50 text-blue-600 border border-blue-100"
                          : "bg-amber-50 text-amber-600 border border-amber-100",
              )}
            >
              {isAnxiety
                ? iqValue > 45
                  ? "Tinggi"
                  : iqValue > 15
                    ? "Sedang"
                    : "Rendah"
                : iqValue >= 130
                  ? "Sangat Superior"
                  : iqValue >= 120
                    ? "Superior"
                    : iqValue >= 110
                      ? "Rata-rata Atas"
                      : iqValue >= 90
                        ? "Rata-rata"
                        : "Bawah Rata-rata"}
            </motion.p>
          </div>
        </motion.div>
      );
    }

    if (result.testType === "wartegg") {
      const drawings = result.extraData?.drawings || {};
      const titles = result.extraData?.titles || {};
      return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{
                y: -5,
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
              }}
              className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center transition-all"
            >
              <div className="w-full aspect-square bg-slate-50 rounded-xl border border-slate-100 overflow-hidden mb-3 relative group">
                {drawings[i] ? (
                  <img
                    src={drawings[i]}
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                    alt={`Wartegg ${i + 1}`}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <Palette className="w-6 h-6" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm" />
                </div>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                Kotak {i + 1}
              </p>
              <p className="text-[11px] font-black text-slate-800 text-center line-clamp-1 h-4">
                {titles[i] || "Tanpa Judul"}
              </p>
            </motion.div>
          ))}
        </div>
      );
    }

    if (result.testType === "subject_interest") {
      return (
        <div className="space-y-4">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
            Mata Pelajaran yang Disukai:
          </h4>
          <div className="grid grid-cols-1 gap-3">
            {Object.entries(result.scores)
              .filter(([_, v]) => v > 0)
              .map(([id, _], index) => {
                const map: Record<string, string> = {
                  agama: "Pendidikan Agama",
                  ppkn: "PPKn",
                  b_indo: "Bahasa Indonesia",
                  mtk: "Matematika",
                  ipa: "IPA",
                  ips: "IPS",
                  b_ing: "Bahasa Inggris",
                  seni: "Seni Budaya",
                  pjok: "PJOK",
                  prakarya: "Prakarya",
                  informatika: "Informatika",
                  b_daerah: "Bahasa Daerah",
                  bk: "BK",
                };
                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-200 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs ring-4 ring-emerald-50">
                        {index + 1}
                      </div>
                      <span className="font-black text-slate-800 text-sm uppercase tracking-tight">
                        {map[id] || id}
                      </span>
                    </div>
                    {result.extraData?.reasons?.[id] && (
                      <p className="text-xs text-slate-500 italic leading-relaxed pl-11 group-hover:text-slate-700 transition-colors">
                        "{result.extraData.reasons[id]}"
                      </p>
                    )}
                  </motion.div>
                );
              })}
          </div>
        </div>
      );
    }

    // Default visualization types
    switch (vType) {
      case "pie":
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-80 w-full overflow-hidden"
          >
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
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  animationDuration={1500}
                  animationEasing="ease-out"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        );

      case "radar":
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-80 w-full overflow-hidden"
          >
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis
                  dataKey="name"
                  fontSize={10}
                  tick={{ fill: "#64748b", fontWeight: "bold" }}
                />
                <PolarRadiusAxis
                  fontSize={10}
                  angle={30}
                  tick={{ fill: "#94a3b8" }}
                />
                <RechartsRadar
                  name="Skor"
                  dataKey="value"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.4}
                  animationDuration={1500}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>
        );

      default: // 'bar'
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-80 w-full overflow-hidden"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ left: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={true}
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={100}
                  fontSize={9}
                  tick={{ fill: "#64748b", fontWeight: "bold" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Bar
                  dataKey="value"
                  fill="#10b981"
                  radius={[0, 10, 10, 0]}
                  label={{
                    position: "right",
                    fontSize: 10,
                    fontWeight: "bold",
                    fill: "#1e293b",
                  }}
                  animationDuration={1500}
                  animationEasing="ease-out"
                />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        );
    }
  };

  const handleShare = async () => {
    const testTitle = TESTS[result.testType].title;
    const summary = `Hasil ${testTitle} - ${result.studentName} (${result.studentClass || "Umum"})\n\n${result.analysis.substring(0, 200)}...\n\nLihat selengkapnya di PsikoTest.`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Hasil ${testTitle}`,
          text: summary,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(summary);
        showToast("Ringkasan hasil telah disalin ke papan klip!", "success");
      } catch (err) {
        console.error("Error copying to clipboard:", err);
      }
    }
  };

  const handleAIExplanation = async () => {
    setIsGeneratingAI(true);
    try {
      console.log("Initiating AI Explanation...");
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is missing or undefined.");
      }

      const ai = new GoogleGenAI({ apiKey });
      let contents: any;

      if (result.testType === "wartegg" && result.extraData?.drawings) {
        console.log("Wartegg test detected. Preparing multi-modal request...");
        const textPart = {
          text: `Sebagai seorang psikolog proyektif, tolong berikan analisa hasil tes Wartegg untuk siswa bernama ${result.studentName}.
        
Terdapat 8 kotak stimulus yang telah diselesaikan oleh siswa dengan judul sebagai berikut:
${Object.entries(result.extraData.titles || {})
  .sort(([a], [b]) => parseInt(a) - parseInt(b))
  .map(([k, v]) => `- Kotak ${parseInt(k) + 1}: ${v}`)
  .join("\n")}

Silakan analisis kepribadian siswa secara holistik berdasarkan cara mereka mengolah stimulus pada masing-masing kotak (1-8) menjadi gambar dan judul di atas. Terdapat 8 gambar terlampir yang urutannya sesuai dengan Kotak 1 sampai Kotak 8.

Berikan analisis mendalam dan rekomendasi yang dipersonalisasi dengan fokus pada:
1. **Kekuatan Utama**: Identifikasi kelebihan kepribadian dan potensi siswa.
2. **Area Pengembangan**: Identifikasi aspek emosional atau perilaku yang perlu perhatian.
3. **Saran Karir & Pembelajaran**: Berikan panduan spesifik untuk lingkungan belajar atau jalur karir yang sesuai dengan profil ini.

Gunakan bahasa Indonesia yang ramah, profesional, memotivasi, dan format Markdown yang rapi.`,
        };

        const imageParts = Object.keys(result.extraData.drawings)
          .sort((a, b) => parseInt(a) - parseInt(b))
          .map((key) => {
            const drawingData = result.extraData.drawings[key];
            if (!drawingData) return null;
            const base64Data = drawingData.includes(",")
              ? drawingData.split(",")[1]
              : drawingData;
            return { inlineData: { data: base64Data, mimeType: "image/png" } };
          })
          .filter((part) => part !== null);

        contents = { parts: [textPart, ...imageParts] };
      } else {
        contents = `Sebagai seorang psikolog dan konselor pendidikan, tolong berikan analisa hasil tes ${TESTS[result.testType]?.title || result.testType} untuk siswa bernama ${result.studentName}.

Hasil Skor: ${JSON.stringify(result.scores)}
Analisa Awal: ${result.analysis}

Berikan analisis mendalam dan rekomendasi yang dipersonalisasi. Fokuskan pada:
1. **Kekuatan Utama**: Identifikasi kelebihan siswa berdasarkan hasil tes.
2. **Area Pengembangan**: Identifikasi aspek yang bisa ditingkatkan atau perlu perhatian khusus.
3. **Saran Karir & Pembelajaran**: Berikan panduan spesifik untuk pilihan karir atau metode belajar yang paling sesuai.

Gunakan bahasa Indonesia yang ramah, profesional, memotivasi, dan format Markdown yang rapi.`;
      }

      console.log("Sending request to Gemini models...");
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: contents,
      });

      console.log("Received response from Gemini models.");
      const generatedText = response?.text || "";
      setAiExplanation(generatedText);

      // Persist the AI explanation to Firestore if it's new
      if (result.id && generatedText) {
        try {
          await updateDoc(doc(db, "test_results", result.id), {
            aiExplanation: generatedText,
          });
          console.log("AI Explanation saved to Firestore.");
        } catch (saveError) {
          console.error("Error saving AI Explanation to Firestore:", saveError);
        }
      }

      showToast("Analisa AI berhasil dibuat!", "success");
    } catch (error) {
      console.error("AI Explanation Error:", error);
      showToast(
        error instanceof Error
          ? error.message
          : "Gagal mendapatkan analisa AI. Silakan coba lagi.",
        "error",
      );
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleDownloadAIExplanation = () => {
    if (!aiExplanation) return;

    const doc = new jsPDF();
    const testTitle = TESTS[result.testType]?.title || "Tes Psikologi";
    const isUmum = (result.studentClass || "").toLowerCase() === "umum";

    let currentY = 15;

    if (!isUmum) {
      // Kop Surat (Official Indonesian Header)
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(
        teacherSettings?.pemdaName?.toUpperCase() ||
          "PEMERINTAH PROVINSI / KOTA",
        105,
        currentY,
        { align: "center" },
      );
      currentY += 7;
      doc.text(
        teacherSettings?.dinasName?.toUpperCase() || "DINAS PENDIDIKAN",
        105,
        currentY,
        { align: "center" },
      );
      currentY += 8;
      doc.setFontSize(14);
      const headerSchoolName =
        result.studentSchoolName ||
        teacherSettings?.schoolName ||
        "NAMA SEKOLAH ANDA DISINI";
      doc.text(headerSchoolName.toUpperCase(), 105, currentY, {
        align: "center",
      });
      currentY += 6;
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(
        teacherSettings?.schoolAddress ||
          "Alamat Lengkap Sekolah, No. Telp, Website, Email",
        105,
        currentY,
        { align: "center" },
      );
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
    doc.text("LAMPIRAN ANALISA MENDALAM (AI)", 105, currentY, {
      align: "center",
    });
    currentY += 10;

    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59); // Slate 800
    doc.text(testTitle.toUpperCase(), 105, currentY, { align: "center" });
    currentY += 15;

    // Student Info
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // Slate 500
    doc.setFont("helvetica", "normal");
    doc.text(`Nama Siswa: ${result.studentName}`, 20, currentY);
    currentY += 7;
    doc.text(`Kelas: ${result.studentClass || "Peserta Umum"}`, 20, currentY);
    currentY += 7;
    doc.text(
      `Tanggal Tes: ${new Date(result.timestamp?.seconds * 1000).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`,
      20,
      currentY,
    );
    currentY += 16;

    if (result.testType === "wartegg" && result.extraData?.drawings) {
      const drawings = result.extraData.drawings;
      const titles = result.extraData.titles || {};

      let xPos = 20;
      let yPos = currentY;
      const imgSize = 38;
      const margin = 5;

      [...Array(8)].forEach((_, i) => {
        if (i > 0 && i % 4 === 0) {
          xPos = 20;
          yPos += imgSize + 15;
          if (yPos > 240) {
            doc.addPage();
            yPos = 20;
          }
        }

        if (drawings[i]) {
          try {
            doc.addImage(drawings[i], "PNG", xPos, yPos, imgSize, imgSize);
          } catch (e) {
            doc.rect(xPos, yPos, imgSize, imgSize);
          }
        } else {
          doc.rect(xPos, yPos, imgSize, imgSize);
        }

        doc.setFontSize(8);
        doc.setTextColor(30, 41, 59);
        doc.text(`Kotak ${i + 1}`, xPos, yPos + imgSize + 4);
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        const splitTitle = doc.splitTextToSize(
          titles[i] || "Tanpa Judul",
          imgSize,
        );
        doc.text(splitTitle, xPos, yPos + imgSize + 8);

        xPos += imgSize + margin;
      });
      currentY = yPos + imgSize + 20;
    }

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
      .replace(/\*\*(.*?)\*\*/g, "$1") // Bold
      .replace(/\*(.*?)\*/g, "$1") // Italic
      .replace(/#(.*?)\n/g, "$1\n") // Headers
      .replace(/-/g, "•"); // Lists

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

    const today = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    doc.setFontSize(10);
    doc.text(`Dicetak pada: ${today}`, 20, sigY - 10);

    if (!isUmum) {
      doc.text("Mengetahui,", 160, sigY, { align: "center" });
      doc.text("Guru Bimbingan Konseling,", 160, sigY + 5, { align: "center" });

      doc.setFont("helvetica", "bold");
      doc.text(
        teacherSettings?.name || "(....................................)",
        160,
        sigY + 30,
        { align: "center" },
      );
      doc.setFont("helvetica", "normal");
      doc.text(
        `NIP. ${teacherSettings?.nip || "...................................."}`,
        160,
        sigY + 35,
        { align: "center" },
      );
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Dicetak melalui PsikoTest - ${new Date().toLocaleString("id-ID")}`,
        105,
        285,
        { align: "center" },
      );
    }

    doc.save(
      `Analisa_AI_${result.testType}_${result.studentName.replace(/\s+/g, "_")}.pdf`,
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-3xl mx-auto py-6 px-4"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-emerald-600 p-8 text-center text-white relative overflow-hidden"
        >
          {/* Decorative background blobs */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-12 -mb-12 blur-2xl" />

          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 10, delay: 0.2 }}
              className="inline-flex p-4 bg-white/20 rounded-2xl mb-4 backdrop-blur-md"
            >
              <CheckCircle2 className="w-10 h-10" />
            </motion.div>
            <h2 className="text-3xl font-black mb-1 uppercase tracking-tight">
              Tes Selesai!
            </h2>
            <p className="text-sm text-emerald-100 font-medium opacity-80">
              Berikut adalah hasil analisis psikologi personal Anda.
            </p>
          </div>
        </motion.div>

        <div className="p-6 sm:p-10 space-y-10">
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 bg-slate-50 rounded-3xl border border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-6 shadow-sm"
          >
            <div>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-2 leading-none">
                Nama Siswa
              </p>
              <h4 className="text-base font-black text-slate-900 truncate">
                {result.studentName}
              </h4>
            </div>
            <div className="relative pl-6 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-slate-200">
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-2 leading-none">
                Identitas / Sekolah
              </p>
              <h4 className="text-base font-black text-slate-900 truncate">
                {result.studentPassword || "-"}
              </h4>
            </div>
            <div className="relative pl-6 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-slate-200">
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-2 leading-none">
                Kelas / Jenjang
              </p>
              <h4 className="text-base font-black text-slate-900 truncate">
                {result.studentClass || "Umum"}
              </h4>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-emerald-600" />
                </div>
                Visualisasi Hasil
              </h3>
              {!["anxiety", "wartegg", "subject_interest", "cfit"].includes(
                result.testType,
              ) && (
                <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner">
                  <button
                    onClick={() => setVType("bar")}
                    className={cn(
                      "p-2.5 rounded-lg transition-all flex items-center gap-2",
                      vType === "bar"
                        ? "bg-white text-emerald-600 shadow-md ring-1 ring-slate-200/50"
                        : "text-slate-400 hover:text-slate-600",
                    )}
                    title="Diagram Batang"
                  >
                    <BarChart3 className="w-4 h-4" />
                    {vType === "bar" && (
                      <span className="text-[10px] font-black uppercase tracking-widest px-1">
                        Bar
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setVType("pie")}
                    className={cn(
                      "p-2.5 rounded-lg transition-all flex items-center gap-2",
                      vType === "pie"
                        ? "bg-white text-emerald-600 shadow-md ring-1 ring-slate-200/50"
                        : "text-slate-400 hover:text-slate-600",
                    )}
                    title="Diagram Pai"
                  >
                    <PieChartIcon className="w-4 h-4" />
                    {vType === "pie" && (
                      <span className="text-[10px] font-black uppercase tracking-widest px-1">
                        Pie
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setVType("radar")}
                    className={cn(
                      "p-2.5 rounded-lg transition-all flex items-center gap-2",
                      vType === "radar"
                        ? "bg-white text-emerald-600 shadow-md ring-1 ring-slate-200/50"
                        : "text-slate-400 hover:text-slate-600",
                    )}
                    title="Diagram Radar"
                  >
                    <RadarIcon className="w-4 h-4" />
                    {vType === "radar" && (
                      <span className="text-[10px] font-black uppercase tracking-widest px-1">
                        Radar
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>
            <div className="bg-slate-50 p-6 sm:p-10 rounded-[2.5rem] border border-slate-200 shadow-inner relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles className="w-12 h-12 text-emerald-600" />
              </div>
              {renderChart()}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white p-8 rounded-3xl border border-slate-200 shadow-lg relative"
          >
            <div className="absolute top-0 left-10 -translate-y-1/2 flex gap-2">
              <div className="px-4 py-1.5 bg-emerald-600 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-200/50">
                Analisis Hasil
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 my-4">
              <div
                dangerouslySetInnerHTML={{ __html: summaryText }}
                className="text-sm text-slate-600 leading-relaxed max-w-lg"
              />
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleDownloadPDF(result, teacherSettings)}
                  className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2 shadow-xl shadow-slate-200 active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  UNDUH LAPORAN
                </button>
              </div>
            </div>

            <div className="prose prose-sm prose-emerald max-w-none text-slate-600 mt-6 pt-6 border-t border-slate-100">
              {isGeneratingAI ? (
                <PulseLoader text="Gemini AI sedang menganalisis..." />
              ) : (
                <ReactMarkdown>{result.analysis}</ReactMarkdown>
              )}
            </div>
          </motion.section>

          <AnimatePresence mode="wait">
            {aiExplanation ? (
              <motion.section
                key="explanation"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-indigo-50/50 p-8 rounded-[2.5rem] border border-indigo-100 space-y-6"
              >
                <div className="flex items-center justify-between border-b border-indigo-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-indigo-900 leading-none">
                        Interpretasi AI
                      </h3>
                      <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-1">
                        Advanced Psychology Analysis
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleDownloadDetailedReport(
                        result,
                        results,
                        teacherSettings,
                      )
                    }
                    className="p-3 bg-white text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-95"
                    title="Unduh Laporan AI"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
                <div className="prose prose-sm prose-indigo max-w-none prose-p:leading-relaxed prose-headings:font-black prose-headings:tracking-tight prose-strong:text-indigo-900">
                  <ReactMarkdown>{aiExplanation}</ReactMarkdown>
                </div>
              </motion.section>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center p-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 space-y-6"
              >
                <div className="w-20 h-20 bg-emerald-100 rounded-3xl mx-auto flex items-center justify-center animate-bounce">
                  <Brain className="w-10 h-10 text-emerald-600" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-xl font-black text-slate-800">
                    Butuh Analisis Mendalam?
                  </h4>
                  <p className="text-slate-500 text-sm max-w-xs mx-auto">
                    Gunakan kecerdasan buatan untuk merangkum dan memberikan
                    saran personal berdasarkan hasil tes Anda.
                  </p>
                </div>
                <button
                  onClick={handleAIExplanation}
                  disabled={isGeneratingAI}
                  className={cn(
                    "px-8 py-4 bg-emerald-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-emerald-200/50 hover:bg-emerald-700 active:scale-95 flex items-center gap-3 mx-auto",
                    isGeneratingAI &&
                      "opacity-75 cursor-not-allowed bg-emerald-500",
                  )}
                >
                  {isGeneratingAI ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      MEMPROSES ANALISA...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      PROSES ANALISA AI
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-8 flex justify-center gap-4"
      >
        <button
          onClick={onBack}
          className="px-8 py-3 bg-white text-slate-600 border border-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2"
        >
          <Home className="w-4 h-4" />
          KEMBALI KE BERANDA
        </button>
        <button
          onClick={handleShare}
          className="px-8 py-3 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-100"
        >
          <Share2 className="w-4 h-4" />
          BAGIKAN HASIL
        </button>
      </motion.div>
    </motion.div>
  );
};

const TestCreator = ({
  onBack,
  showToast,
  user,
}: {
  onBack: () => void;
  showToast: (m: string, t?: "success" | "error" | "info") => void;
  user: UserProfile;
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [testCategory, setTestCategory] = useState("");
  const [visualizationType, setVisualizationType] = useState<
    "bar" | "pie" | "radar"
  >("bar");
  const [questions, setQuestions] = useState<Question[]>([
    { id: "q1", text: "", options: [{ text: "", value: "", score: 1 }] },
  ]);
  const [aiCount, setAiCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAIAnalyze = async () => {
    if (!title || !description) {
      showToast("Mohon isi Judul dan Deskripsi tes terlebih dahulu.", "info");
      return;
    }

    setIsAnalyzing(true);
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("GEMINI_API_KEY is missing");
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Berdasarkan judul tes "${title}" dan deskripsi "${description}", berikan ringkasan rekomendasi atau panduan interpretasi hasil untuk tes psikologi ini. 
        Berikan saran apa yang harus dilakukan siswa jika mendapatkan skor tinggi atau rendah.
        Gunakan format Markdown yang rapi.`,
      });

      setAiRecommendation(response?.text || "");
    } catch (error) {
      console.error("AI Analysis Error:", error);
      showToast("Gagal menganalisis dengan AI. Silakan coba lagi.", "error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAIGenerate = async () => {
    if (!title || !description) {
      showToast(
        "Mohon isi Judul dan Deskripsi tes terlebih dahulu agar AI memiliki konteks.",
        "info",
      );
      return;
    }

    setIsGenerating(true);
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("GEMINI_API_KEY is missing");
      const ai = new GoogleGenAI({ apiKey });
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
                      text: {
                        type: Type.STRING,
                        description: "Teks opsi jawaban",
                      },
                      value: {
                        type: Type.STRING,
                        description: "Nilai kategori (slug)",
                      },
                      score: {
                        type: Type.NUMBER,
                        description: "Skor untuk opsi ini",
                      },
                    },
                    required: ["text", "value", "score"],
                  },
                },
              },
              required: ["text", "options"],
            },
          },
        },
      });

      const rawText = response?.text || "[]";
      const generatedQuestions = JSON.parse(
        rawText.includes("```json")
          ? rawText.split("```json")[1].split("```")[0]
          : rawText,
      );
      const formattedQuestions = Array.isArray(generatedQuestions)
        ? generatedQuestions.map((q: any, idx: number) => ({
            ...q,
            id: `ai_q${questions.length + idx + 1}`,
          }))
        : [];

      // Remove the initial empty question if it's the only one and empty
      const currentQuestions =
        questions.length === 1 && !questions[0].text ? [] : questions;
      setQuestions([...currentQuestions, ...formattedQuestions]);
      showToast(`${aiCount} pertanyaan berhasil dibuat oleh AI!`, "success");
    } catch (error) {
      console.error("AI Generation Error:", error);
      showToast(
        "Gagal membuat pertanyaan dengan AI. Silakan coba lagi.",
        "error",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: `q${questions.length + 1}`,
        text: "",
        options: [{ text: "", value: "", score: 1 }],
      },
    ]);
  };

  const addOption = (qIdx: number) => {
    const newQuestions = [...questions];
    newQuestions[qIdx].options.push({ text: "", value: "", score: 1 });
    setQuestions(newQuestions);
  };

  const handleSave = async () => {
    if (!title || !description || questions.some((q) => !q?.text)) {
      showToast("Mohon lengkapi semua data tes.", "info");
      return;
    }

    try {
      await addDoc(collection(db, "custom_tests"), {
        title,
        description,
        testType: testCategory || "custom",
        visualizationType,
        questions,
        aiRecommendation,
        createdAt: serverTimestamp(),
        isActive: true,
        teacherId: user.uid,
      });

      await addDoc(collection(db, "notifications"), {
        userId: "all",
        teacherId: user.uid,
        title: "Tes Baru Tersedia!",
        message: `Tes baru "${title}" telah tersedia. Silakan cek dan kerjakan tes tersebut.`,
        type: "info",
        read: false,
        timestamp: serverTimestamp(),
      });

      showToast("Tes psikologi baru berhasil dibuat!", "success");
      onBack();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "custom_tests");
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 space-y-6">
      <button
        onClick={onBack}
        className="flex items-center text-emerald-600 border border-emerald-500 hover:bg-emerald-50 px-4 py-2 rounded-xl mb-6 text-sm font-bold transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
      </button>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
        <div className="bg-emerald-600 p-6 text-white">
          <h2 className="text-xl font-bold">Buat Tes Psikologi Baru</h2>
          <p className="text-xs text-emerald-100">
            Rancang instrumen asesmen Anda sendiri.
          </p>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Judul Tes
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Tes Minat Karir Digital"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-600 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Jenis / Kategori Tes
              </label>
              <input
                type="text"
                value={testCategory}
                onChange={(e) => setTestCategory(e.target.value)}
                placeholder="Contoh: Kepribadian, Minat Bakat, dll"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-600 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Jenis Visualisasi Hasil
              </label>
              <select
                value={visualizationType}
                onChange={(e) =>
                  setVisualizationType(
                    e.target.value as "bar" | "pie" | "radar",
                  )
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-600 outline-none text-sm"
              >
                <option value="bar">Diagram Batang</option>
                <option value="pie">Diagram Pie</option>
                <option value="radar">Diagram Radar</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Deskripsi
              </label>
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
                  {isAnalyzing ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        repeat: Infinity,
                        duration: 1,
                        ease: "linear",
                      }}
                    >
                      <Brain className="w-3 h-3" />
                    </motion.div>
                  ) : (
                    <Info className="w-3 h-3" />
                  )}
                  Analisis Rekomendasi
                </button>
              </div>
            </div>

            <p className="text-sm text-emerald-700">
              Gunakan AI untuk menganalisis tes dan membuat draf pertanyaan
              secara otomatis.
            </p>

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
                  <label className="block text-xs font-bold text-emerald-600 uppercase">
                    Jumlah Pertanyaan
                  </label>
                  <span className="text-sm font-bold text-emerald-600 bg-white px-2 py-0.5 rounded-lg border border-emerald-100">
                    {aiCount}
                  </span>
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
                      transition={{
                        repeat: Infinity,
                        duration: 1,
                        ease: "linear",
                      }}
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
                <ClipboardCheck className="w-5 h-5 text-emerald-600" /> Daftar
                Pertanyaan
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const data = [
                      ["Pertanyaan", "Opsi 1", "Opsi 2", "Skor"],
                      [
                        "Contoh: Apakah Anda suka bekerja dengan angka?",
                        "Ya",
                        "Tidak",
                        "1",
                      ],
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
                        const wb = XLSX.read(bstr, { type: "binary" });
                        const wsname = wb.SheetNames[0];
                        const ws = wb.Sheets[wsname];
                        const data = XLSX.utils.sheet_to_json(ws, {
                          header: 1,
                        }) as any[][];
                        const newQuestions: Question[] = data
                          .slice(1)
                          .map((row, idx) => ({
                            id: `q-${Date.now()}-${idx}`,
                            text: row[0] || "",
                            options: [
                              {
                                text: row[1] || "Ya",
                                value: "opsi_1",
                                score: parseInt(row[3]) || 1,
                              },
                              {
                                text: row[2] || "Tidak",
                                value: "opsi_2",
                                score: 0,
                              },
                            ],
                          }))
                          .filter((q) => q?.text);
                        if (newQuestions.length > 0) {
                          setQuestions([...questions, ...newQuestions]);
                          showToast(
                            `${newQuestions.length} pertanyaan berhasil diimpor!`,
                            "success",
                          );
                        } else {
                          showToast(
                            "Format file tidak sesuai atau tidak ada data.",
                            "error",
                          );
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
              <div
                key={qIdx}
                className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3"
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase">
                    Pertanyaan {qIdx + 1}
                  </span>
                </div>
                <input
                  type="text"
                  value={q?.text || ""}
                  onChange={(e) => {
                    const newQs = [...questions];
                    if (newQs[qIdx]) {
                      newQs[qIdx].text = e.target.value;
                      setQuestions(newQs);
                    }
                  }}
                  placeholder="Masukkan teks pertanyaan..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-600 outline-none text-sm"
                />

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">
                    Opsi & Skor
                  </label>
                  {q.options.map((opt, oIdx) => (
                    <div key={oIdx} className="flex gap-2">
                      <input
                        type="text"
                        value={opt?.text || ""}
                        onChange={(e) => {
                          const newQs = [...questions];
                          if (newQs[qIdx]?.options?.[oIdx]) {
                            newQs[qIdx].options[oIdx].text = e.target.value;
                            newQs[qIdx].options[oIdx].value = e.target.value
                              .toLowerCase()
                              .replace(/\s+/g, "_");
                            setQuestions(newQs);
                          }
                        }}
                        placeholder="Teks Opsi"
                        className="flex-1 px-3 py-1.5 rounded-md border border-slate-200 outline-none text-xs"
                      />
                      <input
                        type="number"
                        value={opt.score}
                        onChange={(e) => {
                          const newQs = [...questions];
                          newQs[qIdx].options[oIdx].score = parseInt(
                            e.target.value,
                          );
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

const GuestRecap = ({
  results,
  teacherSettings,
  classes,
  onEdit,
  onDelete,
}: {
  results: TestResult[];
  teacherSettings: TeacherSettings | null;
  classes: ClassInfo[];
  onEdit?: (name: string, results: TestResult[]) => void;
  onDelete?: (name: string, results: TestResult[]) => void;
}) => {
  const [filterType, setFilterType] = useState<string>("all");
  const registeredClassNames = classes.map((c) => c.name);

  // Filter only guest results (non-registered classes)
  const guestResults = results.filter(
    (r) => !registeredClassNames.includes(r.studentClass),
  );

  // Group results by guest name
  const uniqueGuestNames = Array.from(
    new Set(guestResults.map((r) => r.studentName)),
  );

  const guestSummary = uniqueGuestNames
    .map((name) => {
      const tests = guestResults.filter((r) => r.studentName === name);
      return {
        name,
        tests,
      };
    })
    .filter(
      (g) =>
        filterType === "all" || g.tests.some((t) => t.testType === filterType),
    );

  const handleDownloadPDF = () => {
    const doc = new jsPDF("l", "mm", "a4");
    const title = "REKAPITULASI HASIL TES PSIKOLOGI PESERTA UMUM";

    // Kop Surat
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(
      teacherSettings?.pemdaName?.toUpperCase() || "PEMERINTAH PROVINSI / KOTA",
      148.5,
      15,
      { align: "center" },
    );
    doc.text(
      teacherSettings?.dinasName?.toUpperCase() || "DINAS PENDIDIKAN",
      148.5,
      22,
      { align: "center" },
    );
    doc.setFontSize(16);
    const headerSchoolName =
      guestSummary[0]?.tests[0]?.studentSchoolName ||
      teacherSettings?.schoolName ||
      "NAMA SEKOLAH ANDA DISINI";
    doc.text(headerSchoolName.toUpperCase(), 148.5, 30, { align: "center" });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      teacherSettings?.schoolAddress ||
        "Alamat Lengkap Sekolah, No. Telp, Website, Email",
      148.5,
      36,
      { align: "center" },
    );
    doc.line(20, 40, 277, 40);
    doc.line(20, 41, 277, 41);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(title, 148.5, 50, { align: "center" });

    const tableData = guestSummary.map((g, idx) => {
      const filteredTests =
        filterType === "all"
          ? g.tests
          : g.tests.filter((t) => t.testType === filterType);
      const testSummary = filteredTests
        .map(
          (t) =>
            `${TESTS[t.testType]?.title || t.testType}: ${getShortResult(t.testType, t.scores)}`,
        )
        .join("\n");
      return [
        idx + 1,
        g.name,
        g.tests[0]?.studentClass || "UMUM",
        g.tests[0]?.studentSchoolName || "-",
        testSummary || "Belum mengikuti tes",
      ];
    });

    autoTable(doc, {
      startY: 60,
      head: [
        ["No", "Nama Peserta Umum", "Jenjang", "Asal Sekolah", "Hasil Tes"],
      ],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [16, 185, 129],
        textColor: 255,
        fontStyle: "bold",
      }, // Emerald color
      styles: { fontSize: 8, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 40 },
        2: { cellWidth: 20 },
        3: { cellWidth: 40 },
        4: { cellWidth: "auto" },
      },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 20;
    const today = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Dicetak pada: ${today}`, 20, finalY - 10);
    doc.text("Mengetahui,", 240, finalY, { align: "center" });
    doc.text("Guru Bimbingan Konseling,", 240, finalY + 5, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.text(
      teacherSettings?.name || "(....................................)",
      240,
      finalY + 30,
      { align: "center" },
    );
    doc.setFont("helvetica", "normal");
    doc.text(
      `NIP. ${teacherSettings?.nip || "...................................."}`,
      240,
      finalY + 35,
      { align: "center" },
    );

    doc.save(`rekap_hasil_tamu_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900">
              Rekap Peserta Umum
            </h3>
            <div className="bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 flex items-center gap-3">
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">
                Total Peserta Umum
              </span>
              <span className="text-xl font-black text-emerald-700">
                {uniqueGuestNames.length}
              </span>
            </div>
          </div>
          <p className="text-sm text-slate-500 font-medium">
            Ringkasan hasil tes psikologi peserta umum.
          </p>
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
              {Object.keys(TESTS).map((type) => (
                <option key={type} value={type}>
                  {TESTS[type as TestType].title}
                </option>
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

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
        <div
          className="overflow-x-auto min-w-[1000px]"
          style={{ transform: "rotateX(180deg)" }}
        >
          <div style={{ transform: "rotateX(180deg)" }}>
            <table className="w-full text-left border-collapse border border-slate-200">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-r border-slate-200">
                    No
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-r border-slate-200">
                    Nama Peserta Umum
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-r border-slate-200">
                    Jenjang
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-r border-slate-200">
                    Nama Sekolah/ Alamat
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-r border-slate-200">
                    Status Tes
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-r border-slate-200">
                    Hasil Terakhir
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {guestSummary.map((g, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-slate-50/50 transition-colors border-b border-slate-200"
                  >
                    <td className="px-6 py-4 text-xs font-bold text-slate-400 border-r border-slate-200">
                      {idx + 1}
                    </td>
                    <td className="px-6 py-4 border-r border-slate-200">
                      <span className="text-sm font-black text-slate-900">
                        {g.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 border-r border-slate-200">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase">
                        {g.tests[0]?.studentClass || "UMUM"}
                      </span>
                    </td>
                    <td className="px-6 py-4 border-r border-slate-200">
                      <span className="text-xs font-medium text-slate-600">
                        {g.tests[0]?.studentSchoolName || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 border-r border-slate-200">
                      <div className="flex flex-col gap-1">
                        {g.tests.length > 0 ? (
                          g.tests.map((t, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[9px] font-black border border-indigo-100 uppercase w-fit"
                            >
                              {TESTS[t.testType]?.title || t.testType}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">
                            Belum ada tes
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {g.tests.length > 0 ? (
                          g.tests.map((t, i) => (
                            <div
                              key={i}
                              className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100 w-fit"
                            >
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
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
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
                    <td
                      colSpan={6}
                      className="p-12 text-center text-slate-400 font-bold italic"
                    >
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

const TestRecap = ({
  results,
  classes,
  students,
  teacherSettings,
  onEdit,
  onDelete,
}: {
  results: TestResult[];
  classes: ClassInfo[];
  students: StudentData[];
  teacherSettings: TeacherSettings | null;
  onEdit?: (student: StudentData) => void;
  onDelete?: (student: StudentData) => void;
}) => {
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedClass, filterType]);

  // Group results by student
  const allStudents = [...students];

  const studentResults = allStudents
    .filter((s) => selectedClass === "all" || s.className === selectedClass)
    .map((student) => {
      const studentTests = results.filter((r) => {
        const isTypeMatch = filterType === "all" || r.testType === filterType;
        if (!isTypeMatch) return false;

        // Match by ID primarily
        if (r.studentId === student.id) return true;

        // Exact name match + class match
        if (
          r.studentName === student.name &&
          r.studentClass === student.className
        )
          return true;

        // If we have an exact name match but different class, it's likely the same student moved to a different class
        // Only do this if there's no ID at all in the result to avoid misidentifying across classes
        if (!r.studentId && r.studentName === student.name) return true;

        return false;
      });
      return {
        ...student,
        tests: studentTests,
      };
    })
    .filter((s) => filterType === "all" || s.tests.length > 0)
    .sort((a, b) => {
      const schoolCompare = (a.schoolName || "").localeCompare(
        b.schoolName || "",
        undefined,
        { sensitivity: "base" },
      );
      if (schoolCompare !== 0) return schoolCompare;
      const classCompare = (a.className || "").localeCompare(
        b.className || "",
        undefined,
        { numeric: true, sensitivity: "base" },
      );
      if (classCompare !== 0) return classCompare;
      return (a.name || "").localeCompare(b.name || "", undefined, {
        sensitivity: "base",
      });
    });

  const handleDownloadPDF = () => {
    const doc = new jsPDF("l", "mm", "a4");
    const title = "REKAPITULASI HASIL TES PSIKOLOGI SISWA";
    const subTitle =
      selectedClass === "all" ? "SEMUA KELAS" : `KELAS: ${selectedClass}`;

    // Kop Surat (Official Indonesian Header)
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(
      teacherSettings?.pemdaName?.toUpperCase() || "PEMERINTAH PROVINSI / KOTA",
      148.5,
      15,
      { align: "center" },
    );
    doc.text(
      teacherSettings?.dinasName?.toUpperCase() || "DINAS PENDIDIKAN",
      148.5,
      22,
      { align: "center" },
    );
    doc.setFontSize(16);
    const headerSchoolName =
      studentResults[0]?.tests[0]?.studentSchoolName ||
      teacherSettings?.schoolName ||
      "NAMA SEKOLAH ANDA DISINI";
    doc.text(headerSchoolName.toUpperCase(), 148.5, 30, { align: "center" });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      teacherSettings?.schoolAddress ||
        "Alamat Lengkap Sekolah, No. Telp, Website, Email",
      148.5,
      36,
      { align: "center" },
    );
    doc.line(20, 40, 277, 40);
    doc.line(20, 41, 277, 41);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(title, 148.5, 50, { align: "center" });
    doc.text(subTitle, 148.5, 57, { align: "center" });

    const tableData = studentResults.map((s, idx) => {
      const filteredTests =
        filterType === "all"
          ? s.tests
          : s.tests.filter((t) => t.testType === filterType);
      const testSummary = filteredTests
        .map(
          (t) =>
            `${TESTS[t.testType]?.title || t.testType}: ${getShortResult(t.testType, t.scores)}`,
        )
        .join("\n");
      return [
        idx + 1,
        s.password || "-",
        s.name,
        s.className,
        testSummary || "Belum mengikuti tes",
      ];
    });

    autoTable(doc, {
      startY: 65,
      head: [["No", "Password", "Nama Siswa", "Kelas", "Hasil Tes"]],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [16, 185, 129],
        textColor: 255,
        fontStyle: "bold",
      },
      styles: { fontSize: 8, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 25 },
        2: { cellWidth: 45 },
        3: { cellWidth: 20 },
        4: { cellWidth: "auto" },
      },
    });

    // Signatures
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    const today = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Dicetak pada: ${today}`, 20, finalY - 10);

    doc.text("Mengetahui,", 240, finalY, { align: "center" });
    doc.text("Guru Bimbingan Konseling,", 240, finalY + 5, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.text(
      teacherSettings?.name || "(....................................)",
      240,
      finalY + 30,
      { align: "center" },
    );
    doc.setFont("helvetica", "normal");
    doc.text(
      `NIP. ${teacherSettings?.nip || "...................................."}`,
      240,
      finalY + 35,
      { align: "center" },
    );

    doc.save(
      `rekap_hasil_tes_${selectedClass}_${new Date().toISOString().split("T")[0]}.pdf`,
    );
  };

  const handleExportExcel = () => {
    const data = studentResults.map((s, idx) => {
      const filteredTests =
        filterType === "all"
          ? s.tests
          : s.tests.filter((t) => t.testType === filterType);
      const row: any = {
        No: idx + 1,
        Password: s.password || "-",
        "Nama Siswa": s.name,
        Kelas: s.className,
      };

      // Add test results as columns
      Object.keys(TESTS).forEach((type) => {
        const test = filteredTests.find((t) => t.testType === type);
        row[TESTS[type as TestType].title] = test
          ? getShortResult(type as TestType, test.scores)
          : "-";
      });

      return row;
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rekap Hasil Tes");
    XLSX.writeFile(
      wb,
      `rekap_hasil_tes_${selectedClass}_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Rekap Hasil Tes</h3>
          <p className="text-sm text-slate-500">
            Ringkasan hasil tes psikologi seluruh siswa.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 min-w-[100px]">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <div className="flex flex-col">
              <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none">
                JUMLAH SISWA
              </span>
              <span className="text-xs font-bold text-emerald-600 leading-none mt-0.5">
                {studentResults.length}
              </span>
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
              {Object.keys(TESTS).map((type) => (
                <option key={type} value={type}>
                  {TESTS[type as TestType].title}
                </option>
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
              {classes.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-black text-[10px] hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-100"
            >
              <Download className="w-4 h-4" /> PDF
            </button>
            <button
              onClick={handleExportExcel}
              className="px-4 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-black text-[10px] hover:bg-emerald-100 transition-all flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" /> EXCEL
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
        <div
          className="overflow-x-auto min-w-[800px]"
          style={{ transform: "rotateX(180deg)" }}
        >
          <div style={{ transform: "rotateX(180deg)" }}>
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                <tr>
                  <th className="px-6 py-4">No</th>
                  <th className="px-6 py-4">No. Induk</th>
                  <th className="px-6 py-4">Password</th>
                  <th className="px-6 py-4">Nama Siswa</th>
                  <th className="px-6 py-4">Nama Sekolah</th>
                  <th className="px-6 py-4">Kelas</th>
                  <th className="px-6 py-4">Status Tes</th>
                  <th className="px-6 py-4">Hasil Terakhir</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentResults
                  .slice(
                    (currentPage - 1) * itemsPerPage,
                    currentPage * itemsPerPage,
                  )
                  .map((s, idx) => (
                    <tr
                      key={s.id || idx}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {(currentPage - 1) * itemsPerPage + idx + 1}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-400">
                        {s.number}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-400">
                        {s.password || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-slate-900">
                          {s.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-bold text-slate-600">
                          {s.schoolName || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase">
                          {s.className}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {s.tests.length > 0 ? (
                            s.tests.map((t, i) => (
                              <span
                                key={i}
                                className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[9px] font-bold border border-emerald-100 w-fit"
                              >
                                {TESTS[t.testType]?.title || t.testType}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">
                              Belum ada tes
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {s.tests.length > 0 ? (
                            s.tests.map((t, i) => (
                              <div
                                key={i}
                                className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 w-fit"
                              >
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
            <PaginationControls
              currentPage={currentPage}
              totalPages={Math.ceil(studentResults.length / itemsPerPage)}
              onPageChange={setCurrentPage}
              totalItems={studentResults.length}
              itemsPerPage={itemsPerPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const ManajemenTamu = ({
  users,
  classes,
  setEditingStudent,
  setConfirmDelete,
  selectedGuestIds,
  setSelectedGuestIds,
}: {
  users: any[];
  classes: ClassInfo[];
  setEditingStudent: (s: any) => void;
  setConfirmDelete: (data: any) => void;
  selectedGuestIds: string[];
  setSelectedGuestIds: (ids: string[]) => void;
}) => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const registeredClassNames = classes.map((c) => c.name);

  const guestUsers = users.filter(
    (u) => u.role === "student" && !registeredClassNames.includes(u.className),
  );

  const filteredGuests = guestUsers.filter(
    (g) =>
      (g.name && g.name.toLowerCase().includes(search.toLowerCase())) ||
      (g.className &&
        g.className.toLowerCase().includes(search.toLowerCase())) ||
      (g.password && g.password.toLowerCase().includes(search.toLowerCase())),
  );

  const toggleSelectAll = () => {
    if (selectedGuestIds.length === filteredGuests.length) {
      setSelectedGuestIds([]);
    } else {
      setSelectedGuestIds(filteredGuests.map((g) => g.uid || ""));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedGuestIds.includes(id)) {
      setSelectedGuestIds(selectedGuestIds.filter((i) => i !== id));
    } else {
      setSelectedGuestIds([...selectedGuestIds, id]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="text-xl font-bold text-slate-900">
            Data Peserta Umum
          </h3>
          <p className="text-sm text-slate-500">
            Daftar peserta yang mendaftar melalui jalur UMUM.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {selectedGuestIds.length > 0 && (
            <button
              onClick={() =>
                setConfirmDelete({
                  id: "selected_guests",
                  type: "results_by_selected_guests",
                  title: "Hapus Peserta Terpilih?",
                  message: `Apakah Anda yakin ingin menghapus ${selectedGuestIds.length} peserta umum terpilih beserta seluruh riwayat tes dan bimbingannya secara permanen?`,
                })
              }
              className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-all font-bold text-xs shadow-lg shadow-rose-200 animate-in fade-in zoom-in duration-200"
            >
              <Trash2 className="w-3.5 h-3.5" />
              HAPUS TERPILIH ({selectedGuestIds.length})
            </button>
          )}
          <div className="relative w-full sm:w-auto max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama, jenjang, asal..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-600 outline-none w-full appearance-none"
            />
          </div>
          <div className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <div className="flex flex-col">
              <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none">
                TOTAL PESERTA UMUM
              </span>
              <span className="text-xs font-bold text-indigo-600 leading-none mt-0.5">
                {filteredGuests.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
        <div
          className="overflow-x-auto min-w-[1000px]"
          style={{ transform: "rotateX(180deg)" }}
        >
          <div style={{ transform: "rotateX(180deg)" }}>
            <table className="w-full text-left min-w-[1000px]">
              <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                <tr>
                  <th className="px-6 py-4 whitespace-nowrap text-center">
                    <input
                      type="checkbox"
                      checked={
                        filteredGuests.length > 0 &&
                        selectedGuestIds.length === filteredGuests.length
                      }
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                    />
                  </th>
                  <th className="px-6 py-4 whitespace-nowrap">No</th>
                  <th className="px-6 py-4 whitespace-nowrap">Nama Peserta</th>
                  <th className="px-6 py-4 whitespace-nowrap text-center">
                    Jenjang
                  </th>
                  <th className="px-6 py-4 whitespace-nowrap">
                    Nama Sekolah/ Alamat
                  </th>
                  <th className="px-6 py-4 whitespace-nowrap text-center">
                    Kelas/ Umur
                  </th>
                  <th className="px-6 py-4 whitespace-nowrap text-right">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredGuests.length > 0 ? (
                  filteredGuests
                    .slice(
                      (currentPage - 1) * itemsPerPage,
                      currentPage * itemsPerPage,
                    )
                    .map((g, idx) => (
                      <tr
                        key={g.uid || idx}
                        className={`hover:bg-slate-50/50 transition-colors ${selectedGuestIds.includes(g.uid) ? "bg-indigo-50/30" : ""}`}
                      >
                        <td className="px-6 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={selectedGuestIds.includes(g.uid)}
                            onChange={() => toggleSelect(g.uid)}
                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                          />
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap text-center font-bold">
                          {(currentPage - 1) * itemsPerPage + idx + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-black text-slate-900">
                            {g.name || "-"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-[10px] font-black uppercase tracking-wider border border-indigo-100">
                            {g.jenjang || "UMUM"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600 font-bold">
                          {g.schoolName || g.password || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-xs font-black text-slate-700">
                            {g.className || "-"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() =>
                                setEditingStudent({
                                  id: g.uid,
                                  name: g.name,
                                  password: g.password || "",
                                  className: g.className || "UMUM",
                                  number: "0",
                                })
                              }
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Edit Peserta"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                setConfirmDelete({
                                  type: "results_by_guest",
                                  id: g.uid,
                                  title: "Hapus Peserta & Riwayat?",
                                  message: `Apakah Anda yakin ingin menghapus data peserta ${g.name} beserta seluruh riwayat tes dan bimbingannya secara permanen?`,
                                  extraData: { name: g.name },
                                })
                              }
                              className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Hapus Peserta"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-8 text-center text-slate-400 text-sm"
                    >
                      Tidak ada data peserta umum ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <PaginationControls
              currentPage={currentPage}
              totalPages={Math.ceil(filteredGuests.length / itemsPerPage)}
              onPageChange={setCurrentPage}
              totalItems={filteredGuests.length}
              itemsPerPage={itemsPerPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const MonitorSiswa = ({
  results,
  students,
  classes,
  teacherSettings,
  setTestResult,
  setEditingStudent,
  setConfirmDelete,
}: {
  results: TestResult[];
  students: StudentData[];
  classes: ClassInfo[];
  teacherSettings: TeacherSettings | null;
  setTestResult: (r: TestResult | null) => void;
  setEditingStudent: (s: StudentData | null) => void;
  setConfirmDelete: (data: any) => void;
}) => {
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedSchool, setSelectedSchool] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedClass, selectedSchool, search, statusFilter]);

  // Pre-group results by student for O(1) lookup
  const resultsByStudent = React.useMemo(() => {
    const map: Record<string, TestResult[]> = {};
    results.forEach((r) => {
      // Logic from filters: r.studentId === s.id || (r.studentName === s.name && r.studentClass === s.className)
      // We can create multiple keys in our lookup map to handle different matches
      if (r.studentId) {
        if (!map[r.studentId]) map[r.studentId] = [];
        map[r.studentId].push(r);
      }

      const nameClassKey = `${r.studentName}_${r.studentClass}`;
      if (!map[nameClassKey]) map[nameClassKey] = [];
      map[nameClassKey].push(r);

      // Fallback: Name only if no ID (for students who moved classes)
      if (!r.studentId) {
        if (!map[`name_${r.studentName}`]) map[`name_${r.studentName}`] = [];
        map[`name_${r.studentName}`].push(r);
      }
    });
    return map;
  }, [results]);

  const filteredStudents = React.useMemo(() => {
    return students
      .filter((s) => {
        const matchesClass =
          selectedClass === "all" || s.className === selectedClass;
        const matchesSchool =
          selectedSchool === "all" ||
          (s.schoolName &&
            s.schoolName.toLowerCase() === selectedSchool.toLowerCase());
        const matchesSearch =
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          (s.password &&
            s.password.toLowerCase().includes(search.toLowerCase()));

        // Fast lookup instead of results.filter inside map
        const studentResults =
          resultsByStudent[s.id!] ||
          resultsByStudent[`${s.name}_${s.className}`] ||
          resultsByStudent[`name_${s.name}`] ||
          [];
        const hasTakenTest = studentResults.length > 0;
        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "belum_tes" && !hasTakenTest);

        return matchesClass && matchesSchool && matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const classCompare = (a.className || "").localeCompare(
          b.className || "",
          undefined,
          { numeric: true },
        );
        if (classCompare !== 0) return classCompare;
        return (parseInt(a.number) || 0) - (parseInt(b.number) || 0);
      });
  }, [
    students,
    resultsByStudent,
    selectedClass,
    selectedSchool,
    search,
    statusFilter,
  ]);

  const testTypes = Object.keys(TESTS) as TestType[];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="text-xl font-bold text-slate-900">
            Monitor Pengerjaan Tes
          </h3>
          <p className="text-sm text-slate-500">
            Pantau status penyelesaian tes psikologi siswa secara real-time.
          </p>
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
                <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none">
                  JUMLAH SISWA
                </span>
                <span className="text-xs font-bold text-emerald-600 leading-none mt-0.5">
                  {filteredStudents.length}
                </span>
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
                {classes.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative flex-1 sm:flex-none">
              <select
                value={selectedSchool}
                onChange={(e) => setSelectedSchool(e.target.value)}
                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-600 outline-none w-full appearance-none"
              >
                <option value="all">Semua Sekolah</option>
                {[...new Set(students.map((s) => s.schoolName).filter(Boolean))]
                  .sort()
                  .map((school) => (
                    <option key={school} value={school}>
                      {school}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
        <div
          className="overflow-x-auto min-w-[1000px]"
          style={{ transform: "rotateX(180deg)" }}
        >
          <div style={{ transform: "rotateX(180deg)" }}>
            <table className="w-full text-left min-w-[1000px]">
              <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                <tr>
                  <th className="px-6 py-4 whitespace-nowrap">No</th>
                  <th className="px-6 py-4 whitespace-nowrap">PASSWORD</th>
                  <th className="px-6 py-4 whitespace-nowrap">Nama Siswa</th>
                  <th className="px-6 py-4 whitespace-nowrap">Kelas</th>
                  <th className="px-6 py-4 whitespace-nowrap">Nama Sekolah</th>
                  <th className="px-6 py-4 text-center whitespace-nowrap">
                    Tes Psikologi
                  </th>
                  <th className="px-6 py-4 text-center whitespace-nowrap">
                    Jumlah
                  </th>
                  <th className="px-6 py-4 text-right whitespace-nowrap">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents
                  .slice(
                    (currentPage - 1) * itemsPerPage,
                    currentPage * itemsPerPage,
                  )
                  .map((s, idx) => {
                    const studentResults = results.filter(
                      (r) =>
                        r.studentId === s.id ||
                        (r.studentName === s.name &&
                          r.studentClass === s.className),
                    );
                    const completedTests = new Set(
                      studentResults.map((r) => r.testType),
                    );
                    const displayPassword =
                      s.password ||
                      studentResults.find((r) => r.studentPassword)
                        ?.studentPassword ||
                      "-";

                    return (
                      <tr
                        key={s.id || idx}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                          {(currentPage - 1) * itemsPerPage + idx + 1}
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-slate-400 whitespace-nowrap">
                          {displayPassword}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-bold text-slate-900">
                            {s.name}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase">
                            {s.className}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-slate-600">
                            {s.schoolName || "Belum diatur"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex justify-center gap-1.5">
                            {testTypes.map((type) => {
                              const isDone = completedTests.has(type);
                              return (
                                <div
                                  key={type}
                                  className={cn(
                                    "w-3 h-3 rounded-full border transition-all",
                                    isDone
                                      ? "bg-emerald-500 border-emerald-600 shadow-sm shadow-emerald-200"
                                      : "bg-slate-100 border-slate-200",
                                  )}
                                  title={`${TESTS[type].title}: ${isDone ? "Selesai" : "Belum"}`}
                                />
                              );
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <span
                            className={cn(
                              "text-xs font-bold px-2 py-1 rounded-lg border transition-all",
                              completedTests.size > 0
                                ? "text-indigo-700 bg-indigo-50 border-indigo-200 shadow-sm shadow-indigo-100"
                                : "text-slate-700 bg-slate-100 border-transparent",
                            )}
                          >
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
                                <span className="font-bold text-[10px]">
                                  LAPORAN
                                </span>
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
                              onClick={() =>
                                setConfirmDelete({
                                  id: s.id!,
                                  type: "student",
                                  title: "Hapus Siswa",
                                  message: `Hapus data siswa ${s.name}?`,
                                })
                              }
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
                    <td
                      colSpan={6}
                      className="p-12 text-center text-slate-400 font-bold italic"
                    >
                      Tidak ada data siswa ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <PaginationControls
              currentPage={currentPage}
              totalPages={Math.ceil(filteredStudents.length / itemsPerPage)}
              onPageChange={setCurrentPage}
              totalItems={filteredStudents.length}
              itemsPerPage={itemsPerPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const LaporanIndividuSiswa = ({
  results,
  classes,
  students,
  teacherSettings,
  onEdit,
  onDelete,
}: {
  results: TestResult[];
  classes: ClassInfo[];
  students: StudentData[];
  teacherSettings: TeacherSettings | null;
  onEdit?: (student: StudentData) => void;
  onDelete?: (student: StudentData) => void;
}) => {
  const [search, setSearch] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("all");
  const [selectedClass, setSelectedClass] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedClass, selectedSchool]);

  const studentResults = students
    .map((student) => {
      const hasTests = results.some(
        (r) =>
          r.studentId === student.id ||
          (r.studentName === student.name &&
            r.studentClass === student.className),
      );
      return { ...student, hasTests };
    })
    .filter((s) => s.hasTests) // Only show students who have taken tests
    .filter((s) => selectedSchool === "all" || s.schoolName === selectedSchool)
    .filter((s) => selectedClass === "all" || s.className === selectedClass)
    .filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight">
            Laporan Individu Siswa
          </h3>
          <p className="text-sm text-slate-500 font-medium">
            Cetak laporan hasil tes psikologi untuk masing-masing siswa.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama siswa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-600 outline-none text-sm font-medium"
            />
          </div>
          <select
            value={selectedSchool}
            onChange={(e) => {
              setSelectedSchool(e.target.value);
              setSelectedClass("all"); // Reset class when school changes
            }}
            className="px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-600 outline-none text-sm font-bold text-slate-700 bg-white"
          >
            <option value="all">Semua Sekolah</option>
            {Array.from(
              new Set(students.map((s) => s.schoolName).filter(Boolean)),
            )
              .sort()
              .map((school) => (
                <option key={school} value={school}>
                  {school}
                </option>
              ))}
          </select>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-600 outline-none text-sm font-bold text-slate-700 bg-white"
          >
            <option value="all">Semua Kelas</option>
            {classes
              .filter((c) => {
                if (selectedSchool === "all") return true;
                return students.some(
                  (s) =>
                    s.schoolName === selectedSchool && s.className === c.name,
                );
              })
              .map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
        <div className="overflow-x-auto min-w-[800px]">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-widest font-black border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-center">NO</th>
                <th className="px-6 py-4">NAMA SISWA</th>
                <th className="px-6 py-4">NAMA SEKOLAH</th>
                <th className="px-6 py-4 text-center">KELAS</th>
                <th className="px-6 py-4 text-center text-indigo-600">
                  JENIS TES
                </th>
                <th className="px-6 py-4 text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {studentResults
                .slice(
                  (currentPage - 1) * itemsPerPage,
                  currentPage * itemsPerPage,
                )
                .map((s, idx) => (
                  <tr
                    key={s.id || idx}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-slate-500 text-center font-bold">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-black text-slate-900">
                        {s.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600 font-bold">
                      {s.schoolName || "-"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-wider">
                        {s.className}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            handleDownloadDetailedReport(
                              s,
                              results,
                              teacherSettings,
                            )
                          }
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-100"
                          title="Cetak Laporan"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-black uppercase">
                            Cetak
                          </span>
                        </button>
                        <button
                          onClick={() => onEdit?.(s)}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Edit Data"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete?.(s)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              {studentResults.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="p-12 text-center text-slate-400 font-bold italic"
                  >
                    Tidak ada data siswa ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <PaginationControls
            currentPage={currentPage}
            totalPages={Math.ceil(studentResults.length / itemsPerPage)}
            onPageChange={setCurrentPage}
            totalItems={studentResults.length}
            itemsPerPage={itemsPerPage}
          />
        </div>
      </div>
    </div>
  );
};

const LaporanIndividuUmum = ({
  results,
  classes,
  users,
  teacherSettings,
  onDelete,
  selectedGuestIds,
  setSelectedGuestIds,
  setConfirmDelete,
}: {
  results: TestResult[];
  classes: ClassInfo[];
  users: any[];
  teacherSettings: TeacherSettings | null;
  onDelete?: (user: any) => void;
  selectedGuestIds: string[];
  setSelectedGuestIds: (ids: string[]) => void;
  setConfirmDelete: (data: any) => void;
}) => {
  const [search, setSearch] = useState("");
  const [selectedSchool, setSelectedSchool] = useState<string>("all");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedSchool, selectedClass]);

  const registeredClassNames = classes.map((c) => (c.name || "").trim());

  const allGuestUsers = users
    .filter(
      (u) =>
        u.role === "student" &&
        ((u.className || "").toLowerCase().trim() === "umum" ||
          !registeredClassNames.includes((u.className || "").trim())),
    )
    .map((guest) => {
      const hasTests = results.some(
        (r) =>
          r.studentId === guest.uid ||
          (r.studentName === guest.name && r.studentClass === guest.className),
      );
      return { ...guest, hasTests };
    })
    .filter((g) => g.hasTests);

  const uniqueSchools = [
    ...new Set(allGuestUsers.map((g) => g.schoolName).filter(Boolean)),
  ].sort();
  const uniqueClasses = [
    ...new Set(allGuestUsers.map((g) => g.className).filter(Boolean)),
  ].sort();

  const filteredUsers = allGuestUsers
    .filter((g) => selectedSchool === "all" || g.schoolName === selectedSchool)
    .filter((g) => selectedClass === "all" || g.className === selectedClass)
    .filter((g) => g.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (a.name || "").localeCompare(b.name || ""));

  const toggleSelectAll = () => {
    if (selectedGuestIds.length === filteredUsers.length) {
      setSelectedGuestIds([]);
    } else {
      setSelectedGuestIds(filteredUsers.map((g) => g.uid || ""));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedGuestIds.includes(id)) {
      setSelectedGuestIds(selectedGuestIds.filter((i) => i !== id));
    } else {
      setSelectedGuestIds([...selectedGuestIds, id]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() =>
              setConfirmDelete({
                id: "all_guests_report",
                type: "all_guests_comprehensive",
                title: "Hapus SEMUA Laporan Individu Umum?",
                message:
                  "Apakah Anda yakin ingin menghapus SEMUA data laporan individu peserta umum beserta riwayat tesnya? Tindakan ini tidak dapat dibatalkan.",
              })
            }
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-all font-black text-xs shadow-lg shadow-rose-100 uppercase tracking-wider h-11"
          >
            <Trash2 className="w-4 h-4" />
            Hapus Semua Data
          </button>
          <div>
            <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight">
              Laporan Individu Umum
            </h3>
            <p className="text-sm text-slate-500 font-medium tracking-tight">
              Cetak laporan hasil tes psikologi untuk masing-masing peserta
              umum.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {selectedGuestIds.length > 0 && (
            <button
              onClick={() =>
                setConfirmDelete({
                  id: "selected_guests_reports",
                  type: "results_by_selected_guests",
                  title: "Hapus Peserta Terpilih?",
                  message: `Apakah Anda yakin ingin menghapus ${selectedGuestIds.length} peserta umum terpilih beserta seluruh riwayat tes dan bimbingannya secara permanen?`,
                })
              }
              className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-all font-bold text-xs shadow-lg shadow-rose-200 animate-in fade-in zoom-in duration-200"
            >
              <Trash2 className="w-3.5 h-3.5" />
              HAPUS TERPILIH ({selectedGuestIds.length})
            </button>
          )}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-600 outline-none text-sm font-medium bg-slate-50"
            />
          </div>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-600 outline-none text-sm font-bold text-slate-700 bg-slate-50 appearance-none min-w-[200px]"
            >
              <option value="all">Semua Sekolah/Alamat</option>
              {uniqueSchools.map((school) => (
                <option key={school} value={school}>
                  {school}
                </option>
              ))}
            </select>
          </div>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-600 outline-none text-sm font-bold text-slate-700 bg-slate-50 appearance-none min-w-[180px]"
            >
              <option value="all">Semua Kelas/Umur</option>
              {uniqueClasses.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
        <div className="overflow-x-auto min-w-[1000px]">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-widest font-black border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-center">
                  <input
                    type="checkbox"
                    checked={
                      filteredUsers.length > 0 &&
                      selectedGuestIds.length === filteredUsers.length
                    }
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600 cursor-pointer"
                  />
                </th>
                <th className="px-6 py-4 text-center">No</th>
                <th className="px-6 py-4">Nama Peserta</th>
                <th className="px-6 py-4 text-center">Jenjang</th>
                <th className="px-6 py-4">Nama Sekolah/ Alamat</th>
                <th className="px-6 py-4 text-center">Kelas/ Umur</th>
                <th className="px-6 py-4 text-center">Jenis Tes</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers
                .slice(
                  (currentPage - 1) * itemsPerPage,
                  currentPage * itemsPerPage,
                )
                .map((g, idx) => (
                  <tr
                    key={g.uid || idx}
                    className={`hover:bg-slate-50/50 transition-colors ${selectedGuestIds.includes(g.uid) ? "bg-emerald-50/30" : ""}`}
                  >
                    <td className="px-6 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedGuestIds.includes(g.uid)}
                        onChange={() => toggleSelect(g.uid)}
                        className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 text-center font-bold">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-black text-slate-900">
                        {g.name || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-black uppercase tracking-wider border border-emerald-100">
                        {g.jenjang || "UMUM"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600 font-bold whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">
                      {g.schoolName || "-"}
                    </td>
                    <td className="px-6 py-4 text-center text-xs font-bold text-slate-800">
                      {g.className || "-"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-wrap gap-1 justify-center max-w-[200px]">
                        {results
                          .filter(
                            (r) =>
                              r.studentId === g.uid ||
                              (r.studentName === g.name &&
                                r.studentClass === g.className),
                          )
                          .map((r, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[8px] font-bold border border-indigo-100"
                            >
                              {TESTS[r.testType]?.title.replace("Tes ", "") ||
                                r.testType}
                            </span>
                          ))}
                        {results.filter(
                          (r) =>
                            r.studentId === g.uid ||
                            (r.studentName === g.name &&
                              r.studentClass === g.className),
                        ).length === 0 && (
                          <span className="text-slate-400 italic text-[10px]">
                            -
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            handleDownloadDetailedReport(
                              g,
                              results,
                              teacherSettings,
                            )
                          }
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-100"
                          title="Cetak Laporan"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-black uppercase">
                            Cetak
                          </span>
                        </button>
                        <button
                          onClick={() => onDelete?.(g)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="p-12 text-center text-slate-400 font-bold italic"
                  >
                    Tidak ada data peserta umum ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <PaginationControls
            currentPage={currentPage}
            totalPages={Math.ceil(filteredUsers.length / itemsPerPage)}
            onPageChange={setCurrentPage}
            totalItems={filteredUsers.length}
            itemsPerPage={itemsPerPage}
          />
        </div>
      </div>
    </div>
  );
};

const HasilTesSummary = ({
  results,
  classes,
  students,
  teacherSettings,
  onEdit,
  onDelete,
}: {
  results: TestResult[];
  classes: ClassInfo[];
  students: StudentData[];
  teacherSettings: TeacherSettings | null;
  onEdit?: (student: StudentData) => void;
  onDelete?: (student: StudentData) => void;
}) => {
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedSchool, setSelectedSchool] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{
    key: "schoolName" | "name" | "className";
    direction: "asc" | "desc";
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedClass, selectedSchool]);

  const testTypes = Object.keys(TESTS) as TestType[];

  // Pre-group results for fast lookup
  const resultsByStudent = React.useMemo(() => {
    const map: Record<string, TestResult[]> = {};
    results.forEach((r) => {
      if (r.studentId) {
        if (!map[r.studentId]) map[r.studentId] = [];
        map[r.studentId].push(r);
      }
      const nameClassKey = `${r.studentName}_${r.studentClass}`;
      if (!map[nameClassKey]) map[nameClassKey] = [];
      map[nameClassKey].push(r);

      // Fallback: Name only if no ID
      if (!r.studentId) {
        if (!map[`name_${r.studentName}`]) map[`name_${r.studentName}`] = [];
        map[`name_${r.studentName}`].push(r);
      }
    });
    return map;
  }, [results]);

  const studentResults = React.useMemo(() => {
    return students
      .filter((s) => {
        const matchesClass =
          selectedClass === "all" || s.className === selectedClass;
        const matchesSchool =
          selectedSchool === "all" ||
          (s.schoolName &&
            s.schoolName.toLowerCase() === selectedSchool.toLowerCase());
        return matchesClass && matchesSchool;
      })
      .map((student) => {
        const studentTests =
          resultsByStudent[student.id!] ||
          resultsByStudent[`${student.name}_${student.className}`] ||
          resultsByStudent[`name_${student.name}`] ||
          [];

        // Get latest result for each test type
        const latestTests: Record<string, string> = {};
        testTypes.forEach((type) => {
          const testsOfType = studentTests
            .filter((t) => t.testType === type)
            .sort((a, b) => {
              const timeA = a.timestamp?.seconds || 0;
              const timeB = b.timestamp?.seconds || 0;
              return timeB - timeA;
            });
          if (testsOfType.length > 0) {
            latestTests[type] = getShortResult(type, testsOfType[0].scores);
          } else {
            latestTests[type] = "-";
          }
        });

        return {
          ...student,
          password:
            student.password ||
            studentTests.find((t) => t.studentPassword)?.studentPassword ||
            "",
          latestTests,
        };
      })
      .sort((a, b) => {
        if (sortConfig && sortConfig.key === "schoolName") {
          const schoolA = a.schoolName || "";
          const schoolB = b.schoolName || "";
          if (sortConfig.direction === "asc")
            return schoolA.localeCompare(schoolB);
          return schoolB.localeCompare(schoolA);
        }

        const classCompare = (a.className || "").localeCompare(
          b.className || "",
          undefined,
          { numeric: true },
        );
        if (classCompare !== 0) return classCompare;
        return (parseInt(a.number) || 0) - (parseInt(b.number) || 0);
      });
  }, [
    students,
    resultsByStudent,
    selectedClass,
    selectedSchool,
    testTypes,
    sortConfig,
  ]);

  const handleDownloadPDF = () => {
    const doc = new jsPDF("l", "mm", "a4");
    const title = "RANGKUMAN HASIL AKHIR TES PSIKOLOGI";
    const subTitle =
      selectedClass === "all" ? "SEMUA KELAS" : `KELAS: ${selectedClass}`;

    // Kop Surat
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(
      teacherSettings?.pemdaName?.toUpperCase() || "PEMERINTAH PROVINSI / KOTA",
      148.5,
      15,
      { align: "center" },
    );
    doc.text(
      teacherSettings?.dinasName?.toUpperCase() || "DINAS PENDIDIKAN",
      148.5,
      22,
      { align: "center" },
    );
    doc.setFontSize(16);
    const headerSchoolName =
      studentResults[0]?.schoolName ||
      teacherSettings?.schoolName ||
      "NAMA SEKOLAH ANDA DISINI";
    doc.text(headerSchoolName.toUpperCase(), 148.5, 30, { align: "center" });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      teacherSettings?.schoolAddress ||
        "Alamat Lengkap Sekolah, No. Telp, Website, Email",
      148.5,
      36,
      { align: "center" },
    );
    doc.line(20, 40, 277, 40);
    doc.line(20, 41, 277, 41);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(title, 148.5, 50, { align: "center" });
    doc.text(subTitle, 148.5, 57, { align: "center" });

    const tableData = studentResults.map((s, idx) => {
      return [
        idx + 1,
        s.password || "-",
        s.name,
        s.className,
        s.schoolName || "-",
        s.latestTests["learning_style"] || "-",
        s.latestTests["personality"] || "-",
        s.latestTests["multiple_intelligences"] || "-",
        s.latestTests["aptitude_interest"] || "-",
        s.latestTests["school_major"] || "-",
        s.latestTests["anxiety"] || "-",
        s.latestTests["cfit"] || "-",
        s.latestTests["wartegg"] || "-",
        s.latestTests["subject_interest"] || "-",
        s.latestTests["school_career"] || "-",
      ];
    });

    autoTable(doc, {
      startY: 65,
      head: [
        [
          {
            content: "NO",
            rowSpan: 2,
            styles: { halign: "center", valign: "middle" },
          },
          {
            content: "PASSWORD",
            rowSpan: 2,
            styles: { halign: "center", valign: "middle" },
          },
          {
            content: "NAMA SISWA",
            rowSpan: 2,
            styles: { halign: "center", valign: "middle" },
          },
          {
            content: "KELAS",
            rowSpan: 2,
            styles: { halign: "center", valign: "middle" },
          },
          {
            content: "NAMA SEKOLAH",
            rowSpan: 2,
            styles: { halign: "center", valign: "middle" },
          },
          { content: "JENIS TES", colSpan: 10, styles: { halign: "center" } },
        ],
        [
          { content: "GAYA BELAJAR", styles: { halign: "center" } },
          { content: "TIPE KEPRIBADIAN", styles: { halign: "center" } },
          { content: "KECERDASAN MAJEMUK", styles: { halign: "center" } },
          { content: "BAKAT MINAT", styles: { halign: "center" } },
          { content: "PENJURUSAN", styles: { halign: "center" } },
          { content: "KECEMASAN", styles: { halign: "center" } },
          { content: "CFIT", styles: { halign: "center" } },
          { content: "WARTEGG", styles: { halign: "center" } },
          { content: "MINAT MAPEL", styles: { halign: "center" } },
          { content: "PERENCANAAN KARIER", styles: { halign: "center" } },
        ],
      ],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [16, 185, 129],
        textColor: 255,
        fontStyle: "bold",
        lineWidth: 0.1,
        lineColor: 200,
      },
      styles: { fontSize: 5, cellPadding: 1, lineWidth: 0.1, lineColor: 200 },
      columnStyles: {
        0: { cellWidth: 5, halign: "center" },
        1: { cellWidth: 15, halign: "center" },
        2: { cellWidth: 30 },
        3: { cellWidth: 15, halign: "center" },
        4: { cellWidth: 20, halign: "center" },
        5: { cellWidth: 16, halign: "center" },
        6: { cellWidth: 18, halign: "center" },
        7: { cellWidth: 18, halign: "center" },
        8: { cellWidth: 18, halign: "center" },
        9: { cellWidth: 18, halign: "center" },
        10: { cellWidth: 16, halign: "center" },
        11: { cellWidth: 16, halign: "center" },
        12: { cellWidth: 16, halign: "center" },
        13: { cellWidth: 16, halign: "center" },
        14: { cellWidth: 16, halign: "center" },
      },
    });

    // Signatures
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    const today = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Dicetak pada: ${today}`, 20, finalY - 10);

    doc.text("Mengetahui,", 240, finalY, { align: "center" });
    doc.text("Guru Bimbingan Konseling,", 240, finalY + 5, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.text(
      teacherSettings?.name || "(....................................)",
      240,
      finalY + 30,
      { align: "center" },
    );
    doc.setFont("helvetica", "normal");
    doc.text(
      `NIP. ${teacherSettings?.nip || "...................................."}`,
      240,
      finalY + 35,
      { align: "center" },
    );

    doc.save(
      `hasil_akhir_tes_${selectedClass}_${new Date().toISOString().split("T")[0]}.pdf`,
    );
  };

  // Calculate summary counts
  const testCounts = testTypes.reduce(
    (acc, type) => {
      acc[type] = studentResults.filter(
        (s) => s.latestTests[type] !== "-",
      ).length;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="text-xl font-bold text-slate-900">
            Hasil Tes Psikologi
          </h3>
          <p className="text-sm text-slate-500">
            Rangkuman hasil akhir seluruh tes psikologi siswa.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 min-w-[100px]">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <div className="flex flex-col">
              <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none">
                JUMLAH SISWA
              </span>
              <span className="text-xs font-bold text-emerald-600 leading-none mt-0.5">
                {studentResults.length}
              </span>
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
              {classes.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="relative flex-1 sm:flex-none">
            <select
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
              className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-600 outline-none w-full appearance-none"
            >
              <option value="all">Semua Sekolah</option>
              {[...new Set(students.map((s) => s.schoolName).filter(Boolean))]
                .sort()
                .map((school) => (
                  <option key={school} value={school}>
                    {school}
                  </option>
                ))}
            </select>
          </div>
          <button
            onClick={() => {
              const doc = new jsPDF("l", "mm", "a4");
              const title = "RANGKUMAN HASIL AKHIR TES PSIKOLOGI";
              const subTitle =
                selectedClass === "all"
                  ? "SEMUA KELAS"
                  : `KELAS: ${selectedClass}`;

              // Kop Surat
              doc.setFontSize(14);
              doc.setFont("helvetica", "bold");
              doc.text(
                teacherSettings?.pemdaName?.toUpperCase() ||
                  "PEMERINTAH PROVINSI / KOTA",
                148.5,
                15,
                { align: "center" },
              );
              doc.text(
                teacherSettings?.dinasName?.toUpperCase() || "DINAS PENDIDIKAN",
                148.5,
                22,
                { align: "center" },
              );
              doc.setFontSize(16);
              doc.text(
                teacherSettings?.schoolName?.toUpperCase() ||
                  "NAMA SEKOLAH ANDA DISINI",
                148.5,
                30,
                { align: "center" },
              );
              doc.setFontSize(10);
              doc.setFont("helvetica", "normal");
              doc.text(
                teacherSettings?.schoolAddress ||
                  "Alamat Lengkap Sekolah, No. Telp, Website, Email",
                148.5,
                36,
                { align: "center" },
              );
              doc.line(20, 40, 277, 40);
              doc.line(20, 41, 277, 41);

              doc.setFontSize(12);
              doc.setFont("helvetica", "bold");
              doc.text(title, 148.5, 50, { align: "center" });
              doc.text(subTitle, 148.5, 57, { align: "center" });

              const tableData = studentResults.map((s, idx) => {
                return [
                  idx + 1,
                  s.password || "-",
                  s.name,
                  s.className,
                  s.schoolName || "-",
                  s.latestTests["learning_style"] || "-",
                  s.latestTests["personality"] || "-",
                  s.latestTests["multiple_intelligences"] || "-",
                  s.latestTests["aptitude_interest"] || "-",
                  s.latestTests["school_major"] || "-",
                  s.latestTests["anxiety"] || "-",
                  s.latestTests["cfit"] || "-",
                  s.latestTests["wartegg"] || "-",
                  s.latestTests["subject_interest"] || "-",
                  s.latestTests["school_career"] || "-",
                ];
              });

              autoTable(doc, {
                startY: 65,
                head: [
                  [
                    {
                      content: "NO",
                      rowSpan: 2,
                      styles: { halign: "center", valign: "middle" },
                    },
                    {
                      content: "PASSWORD",
                      rowSpan: 2,
                      styles: { halign: "center", valign: "middle" },
                    },
                    {
                      content: "NAMA SISWA",
                      rowSpan: 2,
                      styles: { halign: "center", valign: "middle" },
                    },
                    {
                      content: "KELAS",
                      rowSpan: 2,
                      styles: { halign: "center", valign: "middle" },
                    },
                    {
                      content: "NAMA SEKOLAH",
                      rowSpan: 2,
                      styles: { halign: "center", valign: "middle" },
                    },
                    {
                      content: "JENIS TES",
                      colSpan: 10,
                      styles: { halign: "center" },
                    },
                  ],
                  [
                    { content: "GAYA BELAJAR", styles: { halign: "center" } },
                    {
                      content: "TIPE KEPRIBADIAN",
                      styles: { halign: "center" },
                    },
                    {
                      content: "KECERDASAN MAJEMUK",
                      styles: { halign: "center" },
                    },
                    { content: "BAKAT MINAT", styles: { halign: "center" } },
                    { content: "PENJURUSAN", styles: { halign: "center" } },
                    { content: "KECEMASAN", styles: { halign: "center" } },
                    { content: "CFIT", styles: { halign: "center" } },
                    { content: "WARTEGG", styles: { halign: "center" } },
                    { content: "MINAT MAPEL", styles: { halign: "center" } },
                    {
                      content: "PERENCANAAN KARIER",
                      styles: { halign: "center" },
                    },
                  ],
                ],
                body: tableData,
                theme: "grid",
                headStyles: {
                  fillColor: [16, 185, 129],
                  textColor: 255,
                  fontStyle: "bold",
                  lineWidth: 0.1,
                  lineColor: 200,
                },
                styles: {
                  fontSize: 5,
                  cellPadding: 1,
                  lineWidth: 0.1,
                  lineColor: 200,
                },
                columnStyles: {
                  0: { cellWidth: 5, halign: "center" },
                  1: { cellWidth: 15, halign: "center" },
                  2: { cellWidth: 30 },
                  3: { cellWidth: 15, halign: "center" },
                  4: { cellWidth: 20, halign: "center" },
                  5: { cellWidth: 16, halign: "center" },
                  6: { cellWidth: 18, halign: "center" },
                  7: { cellWidth: 18, halign: "center" },
                  8: { cellWidth: 18, halign: "center" },
                  9: { cellWidth: 18, halign: "center" },
                  10: { cellWidth: 16, halign: "center" },
                  11: { cellWidth: 16, halign: "center" },
                  12: { cellWidth: 16, halign: "center" },
                  13: { cellWidth: 16, halign: "center" },
                  14: { cellWidth: 16, halign: "center" },
                },
              });

              // Signatures
              const finalY = (doc as any).lastAutoTable.finalY + 20;
              const today = new Date().toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              });

              doc.setFontSize(10);
              doc.setFont("helvetica", "normal");
              doc.text(`Dicetak pada: ${today}`, 20, finalY - 10);

              doc.text("Mengetahui,", 240, finalY, { align: "center" });
              doc.text("Guru Bimbingan Konseling,", 240, finalY + 5, {
                align: "center",
              });

              doc.setFont("helvetica", "bold");
              doc.text(
                teacherSettings?.name ||
                  "(....................................)",
                240,
                finalY + 30,
                { align: "center" },
              );
              doc.setFont("helvetica", "normal");
              doc.text(
                `NIP. ${teacherSettings?.nip || "...................................."}`,
                240,
                finalY + 35,
                { align: "center" },
              );

              window.open(doc.output("bloburl"), "_blank");
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
        {testTypes.map((type) => (
          <div
            key={type}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow"
          >
            <span
              className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 line-clamp-1"
              title={TESTS[type].title}
            >
              {TESTS[type].title}
            </span>
            <span className="text-2xl font-black text-emerald-600">
              {testCounts[type]}
            </span>
            <span className="text-[10px] text-slate-400 font-medium mt-1">
              Siswa Selesai
            </span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div
          className="overflow-x-auto"
          style={{ transform: "rotateX(180deg)" }}
        >
          <div style={{ transform: "rotateX(180deg)" }}>
            <table className="w-full text-left min-w-[1200px] border-collapse bg-white">
              <thead className="bg-slate-50 text-slate-500 text-[9px] uppercase tracking-tighter font-bold border-b border-slate-200">
                <tr>
                  <th
                    rowSpan={2}
                    className="px-4 py-3 border-r border-slate-200 text-center align-middle"
                  >
                    No
                  </th>
                  <th
                    rowSpan={2}
                    className="px-4 py-3 border-r border-slate-200 text-center align-middle"
                  >
                    Password
                  </th>
                  <th
                    rowSpan={2}
                    className="px-4 py-3 border-r border-slate-200 text-center align-middle"
                  >
                    Nama Siswa
                  </th>
                  <th
                    rowSpan={2}
                    className="px-4 py-3 border-r border-slate-200 text-center align-middle"
                  >
                    Kelas
                  </th>
                  <th
                    rowSpan={2}
                    className="px-4 py-3 border-r border-slate-200 text-center align-middle cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => {
                      setSortConfig((prev) => ({
                        key: "schoolName",
                        direction:
                          prev?.key === "schoolName" && prev.direction === "asc"
                            ? "desc"
                            : "asc",
                      }));
                    }}
                  >
                    <div className="flex items-center justify-center gap-1">
                      Nama Sekolah
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    colSpan={10}
                    className="px-4 py-2 border-b border-slate-200 text-center"
                  >
                    Jenis Tes
                  </th>
                  <th
                    rowSpan={2}
                    className="px-4 py-3 text-center align-middle"
                  >
                    Aksi
                  </th>
                </tr>
                <tr>
                  <th className="px-4 py-2 border-r border-slate-200 text-center">
                    Gaya Belajar
                  </th>
                  <th className="px-4 py-2 border-r border-slate-200 text-center">
                    Tipe Kepribadian
                  </th>
                  <th className="px-4 py-2 border-r border-slate-200 text-center">
                    Kecerdasan Majemuk
                  </th>
                  <th className="px-4 py-2 border-r border-slate-200 text-center">
                    Bakat Minat
                  </th>
                  <th className="px-4 py-2 border-r border-slate-200 text-center">
                    Penjurusan
                  </th>
                  <th className="px-4 py-2 border-r border-slate-200 text-center">
                    Kecemasan
                  </th>
                  <th className="px-4 py-2 border-r border-slate-200 text-center">
                    CFIT
                  </th>
                  <th className="px-4 py-2 border-r border-slate-200 text-center">
                    Wartegg
                  </th>
                  <th className="px-4 py-2 border-r border-slate-200 text-center">
                    Minat Mapel
                  </th>
                  <th className="px-4 py-2 border-r border-slate-200 text-center">
                    Per. Karier
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentResults
                  .slice(
                    (currentPage - 1) * itemsPerPage,
                    currentPage * itemsPerPage,
                  )
                  .map((s, idx) => (
                    <tr
                      key={s.id || idx}
                      className="hover:bg-emerald-50/30 transition-colors"
                    >
                      <td className="px-2 py-1.5 text-[10px] text-slate-500 text-center border-r border-slate-100 italic">
                        {(currentPage - 1) * itemsPerPage + idx + 1}
                      </td>
                      <td className="px-2 py-1.5 text-[10px] font-mono text-slate-400 text-center border-r border-slate-100">
                        {s.password || "-"}
                      </td>
                      <td className="px-3 py-1.5 border-r border-slate-100">
                        <span className="text-xs font-bold text-slate-900 leading-tight block">
                          {s.name}
                        </span>
                      </td>
                      <td className="px-2 py-1.5 text-center border-r border-slate-100">
                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-black uppercase tracking-tighter">
                          {s.className}
                        </span>
                      </td>
                      <td className="px-2 py-1.5 text-[10px] text-slate-600 text-center border-r border-slate-100 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px]">
                        {s.schoolName || "-"}
                      </td>
                      <td className="px-1.5 py-1.5 text-[9px] text-slate-600 text-center border-r border-slate-100 font-bold whitespace-nowrap">
                        {s.latestTests["learning_style"]}
                      </td>
                      <td className="px-1.5 py-1.5 text-[9px] text-slate-600 text-center border-r border-slate-100 font-bold whitespace-nowrap">
                        {s.latestTests["personality"]}
                      </td>
                      <td className="px-1.5 py-1.5 text-[9px] text-slate-600 text-center border-r border-slate-100 font-bold whitespace-nowrap">
                        {s.latestTests["multiple_intelligences"]}
                      </td>
                      <td className="px-1.5 py-1.5 text-[9px] text-slate-600 text-center border-r border-slate-100 font-bold whitespace-nowrap">
                        {s.latestTests["aptitude_interest"]}
                      </td>
                      <td className="px-1.5 py-1.5 text-[9px] text-slate-600 text-center border-r border-slate-100 font-bold whitespace-nowrap">
                        {s.latestTests["school_major"]}
                      </td>
                      <td className="px-1.5 py-1.5 text-[9px] text-slate-600 text-center border-r border-slate-100 font-bold whitespace-nowrap">
                        {s.latestTests["anxiety"]}
                      </td>
                      <td className="px-1.5 py-1.5 text-[9px] text-slate-600 text-center border-r border-slate-100 font-bold whitespace-nowrap">
                        {s.latestTests["cfit"]}
                      </td>
                      <td className="px-1.5 py-1.5 text-[9px] text-slate-600 text-center border-r border-slate-100 font-bold whitespace-nowrap">
                        {s.latestTests["wartegg"]}
                      </td>
                      <td className="px-1.5 py-1.5 text-[9px] text-slate-600 text-center border-r border-slate-100 font-bold whitespace-nowrap">
                        {s.latestTests["subject_interest"]}
                      </td>
                      <td className="px-1.5 py-1.5 text-[9px] text-slate-600 text-center border-r border-slate-100 font-bold whitespace-nowrap">
                        {s.latestTests["school_career"]}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() =>
                              handleDownloadDetailedReport(
                                s,
                                results,
                                teacherSettings,
                              )
                            }
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
                    <td
                      colSpan={12}
                      className="p-12 text-center text-slate-400 font-bold italic"
                    >
                      Tidak ada data siswa ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <PaginationControls
              currentPage={currentPage}
              totalPages={Math.ceil(studentResults.length / itemsPerPage)}
              onPageChange={setCurrentPage}
              totalItems={studentResults.length}
              itemsPerPage={itemsPerPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const HasilTesTamu = ({
  results,
  classes,
  users,
  teacherSettings,
  onDelete,
  setConfirmDelete,
  selectedGuestIds,
  setSelectedGuestIds,
}: {
  results: TestResult[];
  classes: ClassInfo[];
  users: any[];
  teacherSettings: TeacherSettings | null;
  onDelete?: (user: any) => void;
  setConfirmDelete: (data: any) => void;
  selectedGuestIds: string[];
  setSelectedGuestIds: (ids: string[]) => void;
}) => {
  const [search, setSearch] = useState("");
  const [filterSchool, setFilterSchool] = useState("all");
  const [filterJenjang, setFilterJenjang] = useState("all");
  const [filterClass, setFilterClass] = useState("all");
  const [sortConfig, setSortConfig] = useState<{
    key: "schoolName" | "name";
    direction: "asc" | "desc";
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterSchool, filterJenjang, filterClass]);

  const registeredClassNames = classes.map((c) => (c.name || "").trim());
  const guestUsers = users.filter(
    (u) =>
      u.role === "student" &&
      ((u.className || "").toLowerCase().trim() === "umum" ||
        !registeredClassNames.includes((u.className || "").trim())),
  );
  const testTypes = Object.keys(TESTS) as TestType[];

  const guestResults = guestUsers
    .map((guest) => {
      // Normalisasi untuk pencocokan yang lebih baik
      const guestNameLower = (guest.name || "").trim().toLowerCase();
      const guestClassLower = (guest.className || "").trim().toLowerCase();

      const guestTests = results.filter(
        (r) =>
          r.studentId === guest.uid ||
          ((r.studentName || "").trim().toLowerCase() === guestNameLower &&
            (r.studentClass || "").trim().toLowerCase() === guestClassLower),
      );
      const guestSchoolName =
        guestTests.find((r) => r.studentSchoolName)?.studentSchoolName ||
        guest.schoolName ||
        "-";

      const latestTests: Record<string, string> = {};
      testTypes.forEach((type) => {
        const testsOfType = guestTests
          .filter((t) => t.testType === type)
          .sort((a, b) => {
            const timeA = a.timestamp?.seconds || 0;
            const timeB = b.timestamp?.seconds || 0;
            return timeB - timeA;
          });
        if (testsOfType.length > 0) {
          latestTests[type] = getShortResult(type, testsOfType[0].scores);
        } else {
          latestTests[type] = "-";
        }
      });

      return {
        ...guest,
        schoolName: guestSchoolName,
        latestTests,
      };
    })
    .filter((g) => {
      const matchesSearch = g.name.toLowerCase().includes(search.toLowerCase());
      const matchesSchool =
        filterSchool === "all" || g.schoolName === filterSchool;
      const matchesJenjang =
        filterJenjang === "all" || g.jenjang === filterJenjang;
      const matchesClass = filterClass === "all" || g.className === filterClass;
      return matchesSearch && matchesSchool && matchesJenjang && matchesClass;
    })
    .sort((a, b) => {
      if (sortConfig && sortConfig.key === "schoolName") {
        const schoolA = a.schoolName || "";
        const schoolB = b.schoolName || "";
        if (sortConfig.direction === "asc")
          return schoolA.localeCompare(schoolB);
        return schoolB.localeCompare(schoolA);
      }
      return (a.name || "").localeCompare(b.name || "");
    });

  const uniqueSchools = [
    ...new Set(guestUsers.map((g) => g.schoolName).filter(Boolean)),
  ].sort();
  const uniqueJenjangs = [
    ...new Set(guestUsers.map((g) => g.jenjang).filter(Boolean)),
  ].sort();
  const uniqueClasses = [
    ...new Set(guestUsers.map((g) => g.className).filter(Boolean)),
  ].sort();

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedGuestIds(guestResults.map((g) => g.uid));
    } else {
      setSelectedGuestIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedGuestIds.includes(id)) {
      setSelectedGuestIds(selectedGuestIds.filter((i) => i !== id));
    } else {
      setSelectedGuestIds([...selectedGuestIds, id]);
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF("l", "mm", "a4");
    const title = "RANGKUMAN HASIL AKHIR TES PSIKOLOGI PESERTA UMUM";

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(
      teacherSettings?.pemdaName?.toUpperCase() || "PEMERINTAH PROVINSI / KOTA",
      148.5,
      15,
      { align: "center" },
    );
    doc.text(
      teacherSettings?.dinasName?.toUpperCase() || "DINAS PENDIDIKAN",
      148.5,
      22,
      { align: "center" },
    );
    doc.setFontSize(16);
    const headerSchoolName =
      guestResults[0]?.schoolName ||
      teacherSettings?.schoolName ||
      "NAMA SEKOLAH ANDA DISINI";
    doc.text(headerSchoolName.toUpperCase(), 148.5, 30, { align: "center" });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      teacherSettings?.schoolAddress ||
        "Alamat Lengkap Sekolah, No. Telp, Website, Email",
      148.5,
      36,
      { align: "center" },
    );
    doc.line(20, 40, 277, 40);
    doc.line(20, 41, 277, 41);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(title, 148.5, 50, { align: "center" });

    const tableData = guestResults.map((g, idx) => {
      // Re-ordered columns to match table: No, Nama, Jenjang, Sekolah, Kelas, Tests...
      return [
        idx + 1,
        g.name || "-",
        g.jenjang || "UMUM",
        g.schoolName || "-",
        g.className || "-",
        g.latestTests["learning_style"] || "-",
        g.latestTests["personality"] || "-",
        g.latestTests["multiple_intelligences"] || "-",
        g.latestTests["aptitude_interest"] || "-",
        g.latestTests["school_major"] || "-",
        g.latestTests["anxiety"] || "-",
        g.latestTests["cfit"] || "-",
        g.latestTests["wartegg"] || "-",
        g.latestTests["subject_interest"] || "-",
        g.latestTests["school_career"] || "-",
      ];
    });

    autoTable(doc, {
      startY: 65,
      head: [
        [
          {
            content: "NO",
            rowSpan: 2,
            styles: { halign: "center", valign: "middle" },
          },
          {
            content: "NAMA PESERTA",
            rowSpan: 2,
            styles: { halign: "center", valign: "middle" },
          },
          {
            content: "JENJANG",
            rowSpan: 2,
            styles: { halign: "center", valign: "middle" },
          },
          {
            content: "NAMA SEKOLAH/ ALAMAT",
            rowSpan: 2,
            styles: { halign: "center", valign: "middle" },
          },
          {
            content: "KELAS/ UMUR",
            rowSpan: 2,
            styles: { halign: "center", valign: "middle" },
          },
          { content: "JENIS TES", colSpan: 10, styles: { halign: "center" } },
        ],
        [
          { content: "GAYA BELAJAR", styles: { halign: "center" } },
          { content: "TIPE KEPRIBADIAN", styles: { halign: "center" } },
          { content: "KECERDASAN MAJEMUK", styles: { halign: "center" } },
          { content: "BAKAT MINAT", styles: { halign: "center" } },
          { content: "PENJURUSAN", styles: { halign: "center" } },
          { content: "KECEMASAN", styles: { halign: "center" } },
          { content: "CFIT", styles: { halign: "center" } },
          { content: "WARTEGG", styles: { halign: "center" } },
          { content: "MINAT MAPEL", styles: { halign: "center" } },
          { content: "PERENCANAAN KARIER", styles: { halign: "center" } },
        ],
      ],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [16, 185, 129],
        textColor: 255,
        fontStyle: "bold",
        lineWidth: 0.1,
        lineColor: 200,
      },
      styles: { fontSize: 5, cellPadding: 1, lineWidth: 0.1, lineColor: 200 },
      columnStyles: {
        0: { cellWidth: 5, halign: "center" },
        1: { cellWidth: 30 },
        2: { cellWidth: 12, halign: "center" },
        3: { cellWidth: 30 },
        4: { cellWidth: 15, halign: "center" },
        5: { cellWidth: 16, halign: "center" },
        6: { cellWidth: 18, halign: "center" },
        7: { cellWidth: 18, halign: "center" },
        8: { cellWidth: 18, halign: "center" },
        9: { cellWidth: 18, halign: "center" },
        10: { cellWidth: 16, halign: "center" },
        11: { cellWidth: 16, halign: "center" },
        12: { cellWidth: 16, halign: "center" },
        13: { cellWidth: 16, halign: "center" },
        14: { cellWidth: 16, halign: "center" },
      },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 20;
    const today = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Dicetak pada: ${today}`, 20, finalY - 10);
    doc.text("Mengetahui,", 240, finalY, { align: "center" });
    doc.text("Guru Bimbingan Konseling,", 240, finalY + 5, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.text(
      teacherSettings?.name || "(....................................)",
      240,
      finalY + 30,
      { align: "center" },
    );
    doc.setFont("helvetica", "normal");
    doc.text(
      `NIP. ${teacherSettings?.nip || "...................................."}`,
      240,
      finalY + 35,
      { align: "center" },
    );

    doc.save(
      `hasil_akhir_tes_umum_${new Date().toISOString().split("T")[0]}.pdf`,
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight">
            Hasil Tes Umum
          </h3>
          <p className="text-sm text-slate-500 font-medium">
            Rangkuman hasil akhir seluruh tes psikologi peserta umum.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 min-w-[100px]">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <div className="flex flex-col">
              <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none">
                JUMLAH PESERTA
              </span>
              <span className="text-xs font-bold text-indigo-600 leading-none mt-0.5">
                {guestResults.length}
              </span>
            </div>
          </div>
          <button
            onClick={() =>
              setConfirmDelete({
                id: "all",
                type: "all_guests_comprehensive",
                title: "Hapus Semua Peserta Umum",
                message:
                  "Apakah Anda yakin ingin menghapus SEMUA data peserta umum? Tindakan ini akan menghapus semua hasil tes dan riwayat terkait secara permanen. Tindakan ini tidak dapat dibatalkan.",
              })
            }
            className="px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl font-black text-xs hover:bg-red-100 transition-all flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" /> HAPUS SEMUA
          </button>
          {selectedGuestIds.length > 0 && (
            <button
              onClick={() =>
                setConfirmDelete({
                  id: "selected",
                  type: "results_by_selected_guests",
                  title: "Hapus Peserta Terpilih",
                  message: `Apakah Anda yakin ingin menghapus ${selectedGuestIds.length} peserta yang dipilih? Tindakan ini akan menghapus semua hasil tes dan riwayat terkait mereka secara permanen.`,
                })
              }
              className="px-4 py-2.5 bg-red-600 text-white rounded-xl font-black text-xs hover:bg-red-700 transition-all flex items-center gap-2 shadow-lg shadow-red-200"
            >
              <Trash2 className="w-4 h-4" /> HAPUS TERPILIH (
              {selectedGuestIds.length})
            </button>
          )}
          <button
            onClick={handleDownloadPDF}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-black text-sm hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"
          >
            <Download className="w-4 h-4" /> DOWNLOAD PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama peserta..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none text-sm font-medium bg-slate-50"
            />
          </div>
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filterJenjang}
              onChange={(e) => setFilterJenjang(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-xs font-bold text-slate-700 outline-none pr-8"
            >
              <option value="all">Semua Jenjang</option>
              {uniqueJenjangs.map((j) => (
                <option key={j} value={j}>
                  {j}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
            <Building2 className="w-4 h-4 text-slate-400" />
            <select
              value={filterSchool}
              onChange={(e) => setFilterSchool(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-xs font-bold text-slate-700 outline-none pr-8"
            >
              <option value="all">Semua Sekolah/Alamat</option>
              {uniqueSchools.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
            <Users className="w-4 h-4 text-slate-400" />
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-xs font-bold text-slate-700 outline-none pr-8"
            >
              <option value="all">Semua Kelas/Umur</option>
              {uniqueClasses.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div
          className="overflow-x-auto"
          style={{ transform: "rotateX(180deg)" }}
        >
          <div style={{ transform: "rotateX(180deg)" }}>
            <table className="w-full text-left min-w-[1400px] border-collapse bg-white">
              <thead className="bg-slate-50 text-slate-500 text-[9px] uppercase tracking-tighter font-black border-b border-slate-200">
                <tr>
                  <th
                    rowSpan={2}
                    className="px-4 py-3 border-r border-slate-200 text-center align-middle whitespace-nowrap"
                  >
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={
                        guestResults.length > 0 &&
                        selectedGuestIds.length === guestResults.length
                      }
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </th>
                  <th
                    rowSpan={2}
                    className="px-4 py-3 border-r border-slate-200 text-center align-middle uppercase font-black text-[10px]"
                  >
                    NO
                  </th>
                  <th
                    rowSpan={2}
                    className="px-4 py-3 border-r border-slate-200 text-center align-middle uppercase font-black text-[10px]"
                  >
                    NAMA SISWA
                  </th>
                  <th
                    rowSpan={2}
                    className="px-4 py-3 border-r border-slate-200 text-center align-middle uppercase font-black text-[10px]"
                  >
                    KELAS
                  </th>
                  <th
                    rowSpan={2}
                    className="px-4 py-3 border-r border-slate-200 text-center align-middle cursor-pointer hover:bg-slate-100 transition-colors uppercase font-black text-[10px]"
                    onClick={() => {
                      setSortConfig((prev) => ({
                        key: "schoolName",
                        direction:
                          prev?.key === "schoolName" && prev.direction === "asc"
                            ? "desc"
                            : "asc",
                      }));
                    }}
                  >
                    <div className="flex items-center justify-center gap-1">
                      NAMA SEKOLAH/ ALAMAT
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    rowSpan={2}
                    className="px-4 py-3 border-r border-slate-200 text-center align-middle uppercase font-black text-[10px]"
                  >
                    KELAS/ UMUR
                  </th>
                  <th
                    colSpan={10}
                    className="px-4 py-2 border-b border-slate-200 text-center uppercase font-black text-[10px]"
                  >
                    JENIS TES
                  </th>
                  <th
                    rowSpan={2}
                    className="px-4 py-3 text-center align-middle"
                  >
                    Aksi
                  </th>
                </tr>
                <tr>
                  <th className="px-4 py-2 border-r border-slate-200 text-center">
                    Gaya Belajar
                  </th>
                  <th className="px-4 py-2 border-r border-slate-200 text-center">
                    Tipe Kepribadian
                  </th>
                  <th className="px-4 py-2 border-r border-slate-200 text-center">
                    Kecerdasan Majemuk
                  </th>
                  <th className="px-4 py-2 border-r border-slate-200 text-center">
                    Bakat Minat
                  </th>
                  <th className="px-4 py-2 border-r border-slate-200 text-center">
                    Penjurusan
                  </th>
                  <th className="px-4 py-2 border-r border-slate-200 text-center">
                    Kecemasan
                  </th>
                  <th className="px-4 py-2 border-r border-slate-200 text-center">
                    CFIT
                  </th>
                  <th className="px-4 py-2 border-r border-slate-200 text-center">
                    Wartegg
                  </th>
                  <th className="px-4 py-2 border-r border-slate-200 text-center">
                    Minat Mapel
                  </th>
                  <th className="px-4 py-2 border-r border-slate-200 text-center">
                    Per. Karier
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {guestResults
                  .slice(
                    (currentPage - 1) * itemsPerPage,
                    currentPage * itemsPerPage,
                  )
                  .map((g, idx) => (
                    <tr
                      key={g.uid || idx}
                      className={cn(
                        "hover:bg-indigo-50/30 transition-colors",
                        selectedGuestIds.includes(g.uid) && "bg-indigo-50/50",
                      )}
                    >
                      <td className="px-2 py-1.5 text-center border-r border-slate-100 italic">
                        <input
                          type="checkbox"
                          checked={selectedGuestIds.includes(g.uid)}
                          onChange={() => handleSelectOne(g.uid)}
                          className="w-3 h-3 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-2 py-1.5 text-[10px] text-slate-500 text-center border-r border-slate-100 font-bold tracking-tighter italic">
                        {(currentPage - 1) * itemsPerPage + idx + 1}
                      </td>
                      <td className="px-3 py-1.5 border-r border-slate-100">
                        <span className="text-xs font-bold text-slate-900 leading-tight block">
                          {g.name || "-"}
                        </span>
                      </td>
                      <td className="px-2 py-1.5 text-center border-r border-slate-100">
                        <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[9px] font-black uppercase tracking-tighter border border-indigo-100">
                          {g.jenjang || "UMUM"}
                        </span>
                      </td>
                      <td className="px-2 py-1.5 border-r border-slate-100 text-[10px] text-slate-600 font-bold whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                        {g.schoolName || "-"}
                      </td>
                      <td className="px-2 py-1.5 text-center border-r border-slate-100">
                        <span className="text-[9px] font-black text-slate-700 px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200 uppercase tracking-tighter">
                          {g.className || "-"}
                        </span>
                      </td>
                      <td className="px-1.5 py-1.5 text-center border-r border-slate-100">
                        {g.latestTests["learning_style"] !== "-" ? (
                          <div className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 whitespace-nowrap">
                            {g.latestTests["learning_style"]}
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-1.5 py-1.5 text-center border-r border-slate-100">
                        {g.latestTests["personality"] !== "-" ? (
                          <div className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 whitespace-nowrap">
                            {g.latestTests["personality"]}
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-1.5 py-1.5 text-center border-r border-slate-100">
                        {g.latestTests["multiple_intelligences"] !== "-" ? (
                          <div className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 whitespace-nowrap">
                            {g.latestTests["multiple_intelligences"]}
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-1.5 py-1.5 text-center border-r border-slate-100">
                        {g.latestTests["aptitude_interest"] !== "-" ? (
                          <div className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 whitespace-nowrap">
                            {g.latestTests["aptitude_interest"]}
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-1.5 py-1.5 text-center border-r border-slate-100">
                        {g.latestTests["school_major"] !== "-" ? (
                          <div className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 whitespace-nowrap">
                            {g.latestTests["school_major"]}
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-1.5 py-1.5 text-center border-r border-slate-100">
                        {g.latestTests["anxiety"] !== "-" ? (
                          <div className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 whitespace-nowrap">
                            {g.latestTests["anxiety"]}
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-1.5 py-1.5 text-center border-r border-slate-100">
                        {g.latestTests["cfit"] !== "-" ? (
                          <div className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 whitespace-nowrap">
                            {g.latestTests["cfit"]}
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-1.5 py-1.5 text-center border-r border-slate-100">
                        {g.latestTests["wartegg"] !== "-" ? (
                          <div className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 whitespace-nowrap">
                            {g.latestTests["wartegg"]}
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-1.5 py-1.5 text-center border-r border-slate-100">
                        {g.latestTests["subject_interest"] !== "-" ? (
                          <div className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 whitespace-nowrap">
                            {g.latestTests["subject_interest"]}
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-1.5 py-1.5 text-center border-r border-slate-100">
                        {g.latestTests["school_career"] !== "-" ? (
                          <div className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 whitespace-nowrap">
                            {g.latestTests["school_career"]}
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() =>
                              handleDownloadDetailedReport(
                                g,
                                results,
                                teacherSettings,
                              )
                            }
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-indigo-100"
                            title="Cetak Laporan Detail Individual"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDelete?.(g)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-100"
                            title="Hapus Data Peserta & Riwayat"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                {guestResults.length === 0 && (
                  <tr>
                    <td
                      colSpan={16}
                      className="p-12 text-center text-slate-400 font-bold italic"
                    >
                      Tidak ada data peserta umum ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <PaginationControls
              currentPage={currentPage}
              totalPages={Math.ceil(guestResults.length / itemsPerPage)}
              onPageChange={setCurrentPage}
              totalItems={guestResults.length}
              itemsPerPage={itemsPerPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const CounselingDashboard = ({
  students,
  counselingLogs,
  onOpenProfile,
}: {
  students: StudentData[];
  counselingLogs: CounselingLog[];
  onOpenProfile: (s: StudentData) => void;
}) => {
  const [search, setSearch] = useState("");
  const [schoolFilter, setSchoolFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [studentNameFilter, setStudentNameFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [classFilter, studentNameFilter, schoolFilter]);

  const uniqueSchools = React.useMemo(() => {
    return Array.from(
      new Set(students.map((s) => s.schoolName).filter(Boolean)),
    ).sort();
  }, [students]);

  const uniqueClasses = React.useMemo(() => {
    const relevantStudents =
      schoolFilter === "all"
        ? students
        : students.filter((s) => s.schoolName === schoolFilter);
    return Array.from(new Set(relevantStudents.map((s) => s.className))).sort();
  }, [students, schoolFilter]);

  // Pre-group logs for O(1) lookup
  const logsByStudent = React.useMemo(() => {
    const map: Record<string, CounselingLog[]> = {};
    counselingLogs.forEach((log) => {
      if (!map[log.studentId]) map[log.studentId] = [];
      map[log.studentId].push(log);
    });
    return map;
  }, [counselingLogs]);

  const filteredStudents = React.useMemo(() => {
    return students
      .filter(
        (s) =>
          (schoolFilter === "all" || s.schoolName === schoolFilter) &&
          (classFilter === "all" || s.className === classFilter) &&
          s.name.toLowerCase().includes(studentNameFilter.toLowerCase()),
      )
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }, [students, schoolFilter, classFilter, studentNameFilter]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900">
            Catatan Konseling
          </h3>
          <p className="text-sm text-slate-500">
            Pantau dan kelola catatan bimbingan konseling siswa secara terpadu.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          <select
            value={schoolFilter}
            onChange={(e) => {
              setSchoolFilter(e.target.value);
              setClassFilter("all");
            }}
            className="px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-600 outline-none text-sm font-bold text-slate-700 bg-white"
          >
            <option value="all">Semua Sekolah</option>
            {uniqueSchools.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-600 outline-none text-sm font-bold text-slate-700 bg-white"
          >
            <option value="all">Semua Kelas</option>
            {uniqueClasses.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Cari Nama Siswa..."
            value={studentNameFilter}
            onChange={(e) => setStudentNameFilter(e.target.value)}
            className="px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-600 outline-none text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 w-12">No</th>
              <th className="px-6 py-4">Nama Siswa</th>
              <th className="px-6 py-4">Nama Sekolah</th>
              <th className="px-6 py-4">Kelas</th>
              <th className="px-6 py-4">Jumlah Catatan</th>
              <th className="px-6 py-4">Catatan Terakhir</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStudents
              .slice(
                (currentPage - 1) * itemsPerPage,
                currentPage * itemsPerPage,
              )
              .map((student, idx) => {
                const studentLogs = logsByStudent[student.id!] || [];
                const lastLog = [...studentLogs].sort(
                  (a, b) =>
                    (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0),
                )[0];

                return (
                  <tr
                    key={student.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-6 py-4 text-xs font-bold text-slate-400">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {student.name}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600 font-medium">
                      {student.schoolName || "-"}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      {student.className}
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-emerald-600">
                      {studentLogs.length} Catatan
                    </td>
                    <td className="px-6 py-4">
                      {lastLog ? (
                        <div className="flex flex-col">
                          <span className="text-xs text-slate-700 font-medium italic line-clamp-1">
                            "{lastLog.topic}"
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(
                              lastLog.timestamp?.seconds * 1000,
                            ).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">
                          Belum ada catatan.
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => onOpenProfile(student)}
                        className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:text-emerald-700"
                      >
                        LIHAT DETAIL/TAMBAH
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
        <PaginationControls
          currentPage={currentPage}
          totalPages={Math.ceil(filteredStudents.length / itemsPerPage)}
          onPageChange={setCurrentPage}
          totalItems={filteredStudents.length}
          itemsPerPage={itemsPerPage}
        />
      </div>
    </div>
  );
};

const PaginationControls = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-slate-100 bg-slate-50/50 gap-4">
      <div className="text-xs font-bold text-slate-500">
        Menampilkan{" "}
        <span className="text-slate-900">
          {startItem}-{endItem}
        </span>{" "}
        dari <span className="text-slate-900">{totalItems}</span> data
      </div>
      <div className="flex items-center gap-2">
        <button
          disabled={currentPage === 1}
          onClick={(e) => {
            e.preventDefault();
            onPageChange(currentPage - 1);
          }}
          className="flex items-center gap-1 h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> SEBELUMNYA
        </button>
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
          {Array.from({ length: Math.min(10, totalPages) }, (_, i) => {
            let pageNum = i + 1;
            if (totalPages > 10 && currentPage > 5) {
              pageNum = currentPage - 4 + i;
              if (pageNum + 5 > totalPages) pageNum = totalPages - 9 + i;
            }
            return (
              <button
                key={pageNum}
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(pageNum);
                }}
                className={cn(
                  "w-7 h-7 flex items-center justify-center rounded text-xs font-black transition-all",
                  currentPage === pageNum
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
                    : "text-slate-600 hover:bg-slate-50",
                )}
              >
                {pageNum}
              </button>
            );
          })}
        </div>
        <button
          disabled={currentPage === totalPages}
          onClick={(e) => {
            e.preventDefault();
            onPageChange(currentPage + 1);
          }}
          className="flex items-center gap-1 h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
        >
          SELANJUTNYA <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const TAB_CONFIG: Record<
  string,
  { label: string; icon: any; colorClass?: string; activeColorClass?: string }
> = {
  dashboard: { label: "DASHBOARD", icon: LayoutDashboard },
  students: { label: "Daftar Siswa", icon: GraduationCap },
  monitor: { label: "Progres Tes", icon: Monitor },
  history: { label: "Riwayat Tes", icon: History },
  "hasil-tes": { label: "Hasil Tes", icon: ClipboardCheck },
  "report-individu-siswa": {
    label: "Laporan Individu",
    icon: Printer,
    colorClass:
      "text-cyan-300 hover:bg-emerald-800/50 border border-emerald-700/50",
  },
  report: { label: "Laporan Kelas", icon: BarChart3 },
  counseling: { label: "Catatan Konseling", icon: MessageSquare },
  "manajemen-tamu": {
    label: "Manajemen Umum",
    icon: Users,
    colorClass: "text-indigo-100/70 hover:bg-indigo-800/50",
    activeColorClass: "bg-indigo-600 text-white shadow-lg",
  },
  tamu: {
    label: "Riwayat Tes Umum",
    icon: History,
    colorClass: "text-indigo-100/70 hover:bg-indigo-800/50",
    activeColorClass: "bg-indigo-600 text-white shadow-lg",
  },
  "hasil-tes-tamu": {
    label: "Hasil Tes Umum",
    icon: ClipboardCheck,
    colorClass: "text-indigo-100/70 hover:bg-indigo-800/50",
    activeColorClass: "bg-indigo-600 text-white shadow-lg",
  },
  "report-individu-umum": {
    label: "Laporan Individu Umum",
    icon: Printer,
    colorClass:
      "text-indigo-300 hover:bg-indigo-800/50 border border-indigo-700/50",
    activeColorClass: "bg-indigo-600 text-white shadow-lg",
  },
  teacher: { label: "Pengaturan Guru", icon: UserCog },
  "backup-restore": { label: "BACKUP & RESTORE", icon: Database },
  customization: { label: "KUSTOMISASI", icon: Settings2 },
  "admin-users": {
    label: "ADMINISTRASI PENGGUNA",
    icon: ShieldCheck,
    activeColorClass: "bg-red-700 text-white shadow-lg",
    colorClass: "text-red-100/70 hover:bg-red-800/50",
  },
};

const AVAILABLE_WIDGETS = [
  { id: "summary_cards", name: "Kartu Ringkasan (Total Tes, Siswa, Skor)" },
  { id: "test_distribution", name: "Grafik Distribusi Tes" },
  { id: "quick_stats", name: "Statistik Cepat (Kelas, Siswa, Hasil)" },
];

const AVAILABLE_TABS = [
  { id: "dashboard", name: "Dashboard Utama", group: "Utama" },
  { id: "students", name: "Daftar Siswa", group: "Manajemen Siswa" },
  { id: "monitor", name: "Progres Tes Siswa", group: "Manajemen Siswa" },
  { id: "history", name: "Riwayat Tes", group: "Manajemen Siswa" },
  { id: "hasil-tes", name: "Hasil Tes Psikologi", group: "Manajemen Siswa" },
  {
    id: "report-individu-siswa",
    name: "Laporan Individu",
    group: "Manajemen Siswa",
  },
  {
    id: "interactive-report",
    name: "Laporan Interaktif",
    group: "Manajemen Siswa",
  },
  { id: "report", name: "Laporan Kelas", group: "Manajemen Siswa" },
  { id: "counseling", name: "Catatan Konseling", group: "Manajemen Siswa" },
  { id: "manajemen-tamu", name: "Manajemen Umum", group: "Manajemen Umum" },
  { id: "tamu", name: "Riwayat Tes Umum", group: "Manajemen Umum" },
  { id: "hasil-tes-tamu", name: "Hasil Tes Umum", group: "Manajemen Umum" },
  {
    id: "report-individu-umum",
    name: "Laporan Individu Umum",
    group: "Manajemen Umum",
  },
  { id: "teacher", name: "Pengaturan Guru", group: "Administrasi" },
  {
    id: "backup-restore",
    name: "Backup & Restore Data",
    group: "Administrasi",
  },
  { id: "customization", name: "Kustomisasi Dashboard", group: "Administrasi" },
];

const AdminDashboard = ({
  results: rawResults,
  classes,
  students,
  teacherSettings,
  user,
  setView,
  showToast,
  setTestResult,
  allUsers,
  notifications,
  counselingLogs,
  customTests,
}: {
  results: TestResult[];
  classes: ClassInfo[];
  students: StudentData[];
  teacherSettings: TeacherSettings | null;
  user: UserProfile;
  setView: (v: any) => void;
  showToast: (m: string, t?: "success" | "error" | "info") => void;
  setTestResult: (r: TestResult | null) => void;
  allUsers: any[];
  notifications: AppNotification[];
  counselingLogs: CounselingLog[];
  customTests: any[];
}) => {
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = useCallback(() => {
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (e: MouseEvent) => {
      if (isResizing) {
        setSidebarWidth(Math.max(200, Math.min(600, e.clientX)));
      }
    },
    [isResizing],
  );

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", stopResizing);
    } else {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    }
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isResizing, resize, stopResizing]);
  // Deduplicate results efficiently using a Map
  const results = React.useMemo(() => {
    const map = new Map();
    rawResults.forEach((r) => {
      // Use ID as part of key if available to prevent deduplicating different tests arriving simultaneously with null timestamps
      const key =
        r.id ||
        `${r.studentName}_${r.studentClass}_${r.testType}_${r.timestamp?.seconds || 0}`;
      if (!map.has(key)) {
        map.set(key, r);
      }
    });
    return Array.from(map.values());
  }, [rawResults]);

  const studentsCountByClass = React.useMemo(() => {
    const counts: Record<string, number> = {};
    students.forEach((s) => {
      const cName = s.className || "Tanpa Kelas";
      counts[cName] = (counts[cName] || 0) + 1;
    });
    return counts;
  }, [students]);

  const [selectedClass, setSelectedClass] = useState<string>(
    () => localStorage.getItem("adminSelectedClass") || "all",
  );
  const [filterName, setFilterName] = useState("");
  const [filterType, setFilterType] = useState<string>(
    () => localStorage.getItem("adminFilterType") || "all",
  );
  const [filterDate, setFilterDate] = useState("");
  const [reportStartDate, setReportStartDate] = useState("");
  const [reportEndDate, setReportEndDate] = useState("");
  const [selectedSchool, setSelectedSchool] = useState<string>(
    () => localStorage.getItem("adminSelectedSchool") || "all",
  );
  const [tableClassFilter, setTableClassFilter] = useState<string>(
    () => localStorage.getItem("adminTableClassFilter") || "all",
  );
  const [tableSchoolFilter, setTableSchoolFilter] = useState<string>(
    () => localStorage.getItem("adminTableSchoolFilter") || "all",
  );
  const [tableTypeFilter, setTableTypeFilter] = useState<string>(
    () => localStorage.getItem("adminTableTypeFilter") || "all",
  );
  const [historySearch, setHistorySearch] = useState("");
  const [historyDate, setHistoryDate] = useState("");
  const [historySortField, setHistorySortField] = useState<
    "name" | "class" | "school" | "type" | "date"
  >("date");
  const [historySortOrder, setHistorySortOrder] = useState<"asc" | "desc">(
    "desc",
  );
  const [selectedHistoryIds, setSelectedHistoryIds] = useState<string[]>([]);
  const [isSelectingHistory, setIsSelectingHistory] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [selectedGuestIds, setSelectedGuestIds] = useState<string[]>([]);
  const [selectedResultIds, setSelectedResultIds] = useState<string[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [tamuSearch, setTamuSearch] = useState("");

  const [sortStudentField, setSortStudentField] = useState<
    "name" | "className" | "schoolName"
  >(() => (localStorage.getItem("adminSortStudentField") as any) || "name");
  const [sortStudentOrder, setSortStudentOrder] = useState<"asc" | "desc">(
    () => (localStorage.getItem("adminSortStudentOrder") as any) || "asc",
  );

  useEffect(() => {
    localStorage.setItem("adminSortStudentField", sortStudentField);
    localStorage.setItem("adminSortStudentOrder", sortStudentOrder);
  }, [sortStudentField, sortStudentOrder]);
  const [tamuTypeFilter, setTamuTypeFilter] = useState<string>(
    () => localStorage.getItem("adminTamuTypeFilter") || "all",
  );
  const [tamuDate, setTamuDate] = useState("");
  const [tamuSortField, setTamuSortField] = useState<
    "name" | "school" | "type" | "date"
  >("date");
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const handleBackupData = async () => {
    setIsBackingUp(true);
    try {
      const collectionsToBackup = [
        "students",
        "test_results",
        "counseling_logs",
        "teacher_settings",
        "classes",
        "users",
        "custom_tests",
        "notifications",
      ];
      const backupData: Record<string, any[]> = {};

      for (const collName of collectionsToBackup) {
        const querySnapshot = await getDocs(collection(db, collName));
        backupData[collName] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      }

      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Sistem_Psikotes_Backup_${new Date().toISOString().split("T")[0]}_${new Date().getHours()}${new Date().getMinutes()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast(
        "Backup data berhasil diunduh. Simpan file ini di HDD atau Flashdisk Anda.",
        "success",
      );
    } catch (error) {
      console.error("Backup error:", error);
      showToast("Gagal melakukan backup data.", "error");
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestoreData = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (
      !window.confirm(
        "PERINGATAN: Proses restore akan menimpa/menambah data yang ada dengan data dari file backup. Lanjutkan?",
      )
    ) {
      event.target.value = "";
      return;
    }

    setIsRestoring(true);
    try {
      const text = await file.text();
      const backupData = JSON.parse(text);

      let totalImported = 0;
      for (const collName in backupData) {
        const items = backupData[collName];
        if (Array.isArray(items)) {
          for (const item of items) {
            const { id, ...data } = item;
            if (id) {
              await setDoc(doc(db, collName, id), data);
              totalImported++;
            }
          }
        }
      }

      showToast(
        `Restore berhasil! ${totalImported} data telah dipulihkan.`,
        "success",
      );
    } catch (error) {
      console.error("Restore error:", error);
      showToast("Gagal memulihkan data. Pastikan format file benar.", "error");
    } finally {
      setIsRestoring(false);
      event.target.value = "";
    }
  };
  const [tamuSortOrder, setTamuSortOrder] = useState<"asc" | "desc">("desc");
  const [activeTab, setActiveTab] = useState<
    | "dashboard"
    | "history"
    | "students"
    | "teacher"
    | "backup-restore"
    | "report"
    | "interactive-report"
    | "recap"
    | "tamu"
    | "recap-tamu"
    | "monitor"
    | "hasil-tes"
    | "manajemen-tamu"
    | "hasil-tes-tamu"
    | "counseling"
    | "admin-users"
    | "report-individu-siswa"
    | "report-individu-umum"
    | "customization"
  >(() => {
    // If we have a saved tab that is no longer available, default to dashboard
    const saved = localStorage.getItem("adminActiveTab");
    if (saved === "backup-restore") return "backup-restore";
    return (saved as any) || "dashboard";
  });

  const [enabledWidgets, setEnabledWidgets] = useState<string[]>(() => {
    const saved = localStorage.getItem("adminEnabledWidgets");
    if (saved) return JSON.parse(saved);
    return (
      teacherSettings?.dashboardWidgets || AVAILABLE_WIDGETS.map((w) => w.id)
    );
  });
  const [sidebarOrder, setSidebarOrder] = useState<string[]>(() => {
    const saved = localStorage.getItem("adminSidebarOrder");
    if (saved) return JSON.parse(saved);
    return teacherSettings?.sidebarTabs || AVAILABLE_TABS.map((t) => t.id);
  });

  useEffect(() => {
    if (teacherSettings?.dashboardWidgets) {
      setEnabledWidgets(teacherSettings.dashboardWidgets);
      localStorage.setItem(
        "adminEnabledWidgets",
        JSON.stringify(teacherSettings.dashboardWidgets),
      );
    }
    if (teacherSettings?.sidebarTabs) {
      setSidebarOrder(teacherSettings.sidebarTabs);
      localStorage.setItem(
        "adminSidebarOrder",
        JSON.stringify(teacherSettings.sidebarTabs),
      );
    }
  }, [teacherSettings]);

  useEffect(() => {
    localStorage.setItem("adminEnabledWidgets", JSON.stringify(enabledWidgets));
  }, [enabledWidgets]);

  useEffect(() => {
    localStorage.setItem("adminSidebarOrder", JSON.stringify(sidebarOrder));
  }, [sidebarOrder]);

  // Sync sidebarOrder with AVAILABLE_TABS to ensure new tabs (like backup-restore) are included for existing sessions
  useEffect(() => {
    const missingTabIds = AVAILABLE_TABS.map((t) => t.id).filter(
      (id) => !sidebarOrder.includes(id),
    );

    if (missingTabIds.length > 0) {
      setSidebarOrder((prev) => {
        const newOrder = [...prev];
        // Insert new tabs in their correct relative positions from AVAILABLE_TABS if possible
        // or just append them
        missingTabIds.forEach((id) => {
          if (!newOrder.includes(id)) {
            newOrder.push(id);
          }
        });
        return newOrder;
      });
    }
  }, []);

  const handleSaveCustomization = async () => {
    try {
      await setDoc(
        doc(db, "teacher_settings", user.uid),
        {
          ...teacherSettings,
          dashboardWidgets: enabledWidgets,
          sidebarTabs: sidebarOrder,
        },
        { merge: true },
      );
      showToast("Kustomisasi berhasil disimpan!", "success");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, "teacher_settings");
    }
  };

  const moveTab = (index: number, direction: "up" | "down") => {
    const newOrder = [...sidebarOrder];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    [newOrder[index], newOrder[targetIndex]] = [
      newOrder[targetIndex],
      newOrder[index],
    ];
    setSidebarOrder(newOrder);
  };

  useEffect(() => {
    localStorage.setItem("adminActiveTab", activeTab);
    setCurrentPage(1); // Reset page on tab change
  }, [activeTab]);

  const registeredClassNames = React.useMemo(
    () => classes.map((c) => c.name),
    [classes],
  );
  const isStudentResult = useCallback(
    (r: TestResult) => {
      // If it's a registered class, it's definitely a student result
      if (registeredClassNames.includes(r.studentClass)) return true;

      // Check against registered student list
      const isRegisteredStudent = students.some(
        (s) =>
          s.id === r.studentId ||
          (s.name === r.studentName && s.className === r.studentClass) ||
          s.name === r.studentName,
      );
      if (isRegisteredStudent) return true;

      // IMPORTANT: Also include results from Teachers (Guru BK) and Admins in the main history
      // so their testing/input data is recorded and visible to the administrator.
      const userRole = allUsers.find(
        (u) => u.uid === r.studentId || u.id === r.studentId,
      )?.role;
      if (userRole === "teacher" || userRole === "admin") return true;

      return false;
    },
    [registeredClassNames, students, allUsers],
  );

  const filteredRiwayatTamuResults = React.useMemo(() => {
    return results
      .filter((r) => !isStudentResult(r))
      .filter((r) => {
        const matchesName = r.studentName
          .toLowerCase()
          .includes(tamuSearch.toLowerCase());
        const matchesType =
          tamuTypeFilter === "all" || r.testType === tamuTypeFilter;
        const matchesDate =
          !tamuDate ||
          (r.timestamp?.seconds &&
            new Date(r.timestamp.seconds * 1000).toLocaleDateString() ===
              new Date(tamuDate).toLocaleDateString());
        return matchesName && matchesType && matchesDate;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (tamuSortField === "school") {
          const schoolA = a.studentSchoolName || "";
          const schoolB = b.studentSchoolName || "";
          cmp = schoolA.localeCompare(schoolB, undefined, {
            sensitivity: "base",
          });
        } else if (tamuSortField === "name") {
          cmp = (a.studentName || "").localeCompare(
            b.studentName || "",
            undefined,
            { sensitivity: "base" },
          );
        } else if (tamuSortField === "type") {
          cmp = (TESTS[a.testType]?.title || "").localeCompare(
            TESTS[b.testType]?.title || "",
            undefined,
            { sensitivity: "base" },
          );
        } else {
          // Default to date
          // Use current time as fallback for pending results so they appear at top during DESC sort
          const timeA = a.timestamp?.seconds || Date.now() / 1000;
          const timeB = b.timestamp?.seconds || Date.now() / 1000;
          cmp = timeA - timeB;
        }

        if (cmp !== 0) {
          return tamuSortOrder === "asc" ? cmp : -cmp;
        }

        // Secondary sort: default to date desc if primary equal
        const secondaryA = a.timestamp?.seconds || Date.now() / 1000;
        const secondaryB = b.timestamp?.seconds || Date.now() / 1000;
        return secondaryB - secondaryA;
      });
  }, [
    results,
    registeredClassNames,
    tamuSearch,
    tamuTypeFilter,
    tamuDate,
    tamuSortField,
    tamuSortOrder,
  ]);

  const toggleSelectRiwayatAll = () => {
    if (selectedResultIds.length === filteredRiwayatTamuResults.length) {
      setSelectedResultIds([]);
    } else {
      setSelectedResultIds(filteredRiwayatTamuResults.map((r) => r.id!));
    }
  };

  const toggleSelectRiwayat = (id: string) => {
    if (selectedResultIds.includes(id)) {
      setSelectedResultIds(selectedResultIds.filter((i) => i !== id));
    } else {
      setSelectedResultIds([...selectedResultIds, id]);
    }
  };

  const [editingStudent, setEditingStudent] = useState<StudentData | null>(
    null,
  );
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{
    id: string;
    type:
      | "student"
      | "guest"
      | "result"
      | "all_students"
      | "all_selected_students"
      | "results_by_student"
      | "results_by_guest"
      | "results_by_selected_guests"
      | "all_selected_results"
      | "all_guests_comprehensive"
      | "user"
      | "all_selected_history_results"
      | "counseling_log";
    title: string;
    message: string;
    extraData?: any;
  } | null>(null);
  const [classAnalysis, setClassAnalysis] = useState("");
  const [isGeneratingClassAnalysis, setIsGeneratingClassAnalysis] =
    useState(false);
  // pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [tableClassFilter, tableTypeFilter, historySearch, historyDate]);

  // Teacher Settings State
  const [teacherName, setTeacherName] = useState(teacherSettings?.name || "");
  const [teacherNip, setTeacherNip] = useState(teacherSettings?.nip || "");
  const [schoolName, setSchoolName] = useState(
    teacherSettings?.schoolName || "",
  );
  const [schoolAddress, setSchoolAddress] = useState(
    teacherSettings?.schoolAddress || "",
  );
  const [pemdaName, setPemdaName] = useState(teacherSettings?.pemdaName || "");
  const [dinasName, setDinasName] = useState(teacherSettings?.dinasName || "");

  // Update local state when teacherSettings prop changes (important for initial load)
  useEffect(() => {
    if (teacherSettings && activeTab === "teacher") {
      setTeacherName((prev) => prev || teacherSettings.name || "");
      setTeacherNip((prev) => prev || teacherSettings.nip || "");
      setSchoolName((prev) => prev || teacherSettings.schoolName || "");
      setSchoolAddress((prev) => prev || teacherSettings.schoolAddress || "");
      setPemdaName((prev) => prev || teacherSettings.pemdaName || "");
      setDinasName((prev) => prev || teacherSettings.dinasName || "");
    }
  }, [teacherSettings, activeTab]);

  // Change Account State
  const [showChangeAccountForm, setShowChangeAccountForm] = useState(false);
  const [changeAccountPassword, setChangeAccountPassword] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [isChangingAccount, setIsChangingAccount] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Student Profile & Counseling State
  const [viewingStudentProfile, setViewingStudentProfile] =
    useState<StudentData | null>(null);
  const [isAddingLog, setIsAddingLog] = useState(false);
  const [showCounselingHistory, setShowCounselingHistory] = useState(false);
  const [newLogTopic, setNewLogTopic] = useState("");
  const [newLogNotes, setNewLogNotes] = useState("");
  const [newLogStatus, setNewLogStatus] = useState<
    "planned" | "ongoing" | "completed"
  >("planned");
  const [newLogIsPrivate, setNewLogIsPrivate] = useState(false);
  const [newLogDate, setNewLogDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const handleSaveCounselingLog = async () => {
    if (!viewingStudentProfile || !newLogTopic || !newLogNotes) return;

    try {
      await addDoc(collection(db, "counseling_logs"), {
        studentId: viewingStudentProfile.id,
        teacherId: user.uid,
        date: newLogDate,
        topic: newLogTopic,
        notes: newLogNotes,
        interventionStatus: newLogStatus,
        isPrivate: newLogIsPrivate,
        timestamp: serverTimestamp(),
      });
      setNewLogTopic("");
      setNewLogNotes("");
      setIsAddingLog(false);
      showToast("Catatan konseling berhasil disimpan!", "success");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "counseling_logs");
    }
  };

  const handleDeleteCounselingLog = async (id: string) => {
    try {
      await deleteDoc(doc(db, "counseling_logs", id));
      showToast("Catatan konseling berhasil dihapus.", "success");
      setConfirmDelete(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, "counseling_logs");
    }
  };

  // Student Input State
  const [newStudentNumber, setNewStudentNumber] = useState("");
  const [newStudentPassword, setNewStudentPassword] = useState("");
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentClass, setNewStudentClass] = useState("");
  const [newStudentSchool, setNewStudentSchool] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [studentClassFilter, setStudentClassFilter] = useState<string>(
    () => localStorage.getItem("adminStudentClassFilter") || "all",
  );
  const [studentStatusFilter, setStudentStatusFilter] = useState<string>(
    () => localStorage.getItem("adminStudentStatusFilter") || "all",
  );
  const [studentSchoolFilter, setStudentSchoolFilter] = useState<string>(
    () => localStorage.getItem("adminStudentSchoolFilter") || "all",
  );
  const [uploadSummary, setUploadSummary] = useState<{
    total: number;
    success: number;
  } | null>(null);
  const [recentlyAddedIds, setRecentlyAddedIds] = useState<string[]>([]);

  useEffect(() => {
    localStorage.setItem("adminSelectedClass", selectedClass);
    localStorage.setItem("adminFilterType", filterType);
    localStorage.setItem("adminSelectedSchool", selectedSchool);
    localStorage.setItem("adminTableClassFilter", tableClassFilter);
    localStorage.setItem("adminTableSchoolFilter", tableSchoolFilter);
    localStorage.setItem("adminTableTypeFilter", tableTypeFilter);
    localStorage.setItem("adminTamuTypeFilter", tamuTypeFilter);
    localStorage.setItem("adminActiveTab", activeTab);
    localStorage.setItem("adminStudentStatusFilter", studentStatusFilter);
    localStorage.setItem("adminStudentClassFilter", studentClassFilter);
    localStorage.setItem("adminStudentSchoolFilter", studentSchoolFilter);
  }, [
    selectedClass,
    filterType,
    tableClassFilter,
    tableTypeFilter,
    tamuTypeFilter,
    activeTab,
    studentStatusFilter,
    studentClassFilter,
    studentSchoolFilter,
  ]);

  const filteredStudents = students
    .filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.className.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.number.toLowerCase().includes(studentSearch.toLowerCase());
      const matchesClass =
        studentClassFilter === "all" || s.className === studentClassFilter;
      const matchesSchool =
        studentSchoolFilter === "all" || s.schoolName === studentSchoolFilter;

      const studentResults = results.filter(
        (r) =>
          r.studentId === s.id ||
          (r.studentName === s.name && r.studentClass === s.className),
      );
      const hasTakenTest = studentResults.length > 0;
      const matchesStatus =
        studentStatusFilter === "all" ||
        (studentStatusFilter === "belum_tes" && !hasTakenTest);

      return matchesSearch && matchesClass && matchesStatus && matchesSchool;
    })
    .sort((a, b) => {
      let cmp = 0;
      const valA = a[sortStudentField] || "";
      const valB = b[sortStudentField] || "";

      if (sortStudentField === "className") {
        cmp = valA.localeCompare(valB, undefined, {
          numeric: true,
          sensitivity: "base",
        });
      } else {
        cmp = valA.localeCompare(valB, undefined, { sensitivity: "base" });
      }

      return sortStudentOrder === "asc" ? cmp : -cmp;
    });

  const handleExportStudents = () => {
    const data = students.map((s) => ({
      No: s.number,
      PASSWORD: s.password || "",
      "Nama Siswa": s.name,
      Kelas: s.className,
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Siswa");
    XLSX.writeFile(
      workbook,
      `data_siswa_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
  };

  const handleDeleteAllStudents = async () => {
    try {
      const batch = students.map((s) => deleteDoc(doc(db, "students", s.id!)));
      await Promise.all(batch);

      // Also delete all associated results and logs for these students
      const allResultDocs = results.map((r) =>
        deleteDoc(doc(db, "test_results", r.id!)),
      );
      const allLogDocs = counselingLogs.map((l) =>
        deleteDoc(doc(db, "counseling_logs", l.id!)),
      );
      await Promise.all([...allResultDocs, ...allLogDocs]);

      setConfirmDelete(null);
      showToast(
        "Semua data siswa dan data terkait berhasil dihapus.",
        "success",
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, "students");
    }
  };

  const handleDeleteSelectedStudents = async () => {
    if (selectedStudentIds.length === 0) return;
    try {
      const studentDocs = selectedStudentIds.map((id) =>
        deleteDoc(doc(db, "students", id)),
      );

      // Filter results and logs for these students
      const relatedResults = results.filter((r) =>
        selectedStudentIds.includes(r.studentId),
      );
      const relatedLogs = counselingLogs.filter((l) =>
        selectedStudentIds.includes(l.studentId),
      );

      const resultDocs = relatedResults.map((r) =>
        deleteDoc(doc(db, "test_results", r.id!)),
      );
      const logDocs = relatedLogs.map((l) =>
        deleteDoc(doc(db, "counseling_logs", l.id!)),
      );

      await Promise.all([...studentDocs, ...resultDocs, ...logDocs]);

      setSelectedStudentIds([]);
      setConfirmDelete(null);
      showToast(
        `${selectedStudentIds.length} Siswa dan semua data terkait berhasil dihapus.`,
        "success",
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, "multiple_students");
    }
  };

  const handleDeleteStudent = async (id: string) => {
    try {
      await deleteDoc(doc(db, "students", id));

      // Delete associated scores and logs
      const studentResults = results.filter((r) => r.studentId === id);
      const studentLogs = counselingLogs.filter((l) => l.studentId === id);

      const resultDocs = studentResults.map((r) =>
        deleteDoc(doc(db, "test_results", r.id!)),
      );
      const logDocs = studentLogs.map((l) =>
        deleteDoc(doc(db, "counseling_logs", l.id!)),
      );

      await Promise.all([...resultDocs, ...logDocs]);

      setConfirmDelete(null);
      showToast("Siswa dan data terkait berhasil dihapus.", "success");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `students/${id}`);
    }
  };

  const handleDeleteResult = async (id: string) => {
    try {
      await deleteDoc(doc(db, "test_results", id));
      setConfirmDelete(null);
      showToast("Hasil tes berhasil dihapus.", "success");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `test_results/${id}`);
    }
  };

  const handleDeleteSelectedResults = async () => {
    if (selectedResultIds.length === 0) return;
    try {
      const batch = selectedResultIds.map((id) =>
        deleteDoc(doc(db, "test_results", id)),
      );
      await Promise.all(batch);
      setSelectedResultIds([]);
      setConfirmDelete(null);
      showToast(
        `${selectedResultIds.length} Hasil tes berhasil dihapus.`,
        "success",
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, "multiple_results");
    }
  };

  const handleDeleteAllResultsForStudent = async (
    studentId: string,
    studentName: string,
    studentClass: string,
  ) => {
    const studentResults = results.filter(
      (r) =>
        r.studentId === studentId ||
        (r.studentName === studentName && r.studentClass === studentClass),
    );
    try {
      const batch = studentResults.map((r) =>
        deleteDoc(doc(db, "test_results", r.id!)),
      );
      await Promise.all(batch);
      setConfirmDelete(null);
      showToast(`Semua hasil tes ${studentName} berhasil dihapus.`, "success");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, "test_results");
    }
  };

  const handleDeleteGuest = async (id: string) => {
    try {
      await deleteDoc(doc(db, "users", id));
      setConfirmDelete(null);
      showToast("Data peserta umum berhasil dihapus.", "success");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${id}`);
    }
  };

  const handleDeleteAllResultsForGuest = async (id: string, name: string) => {
    try {
      const relatedResults = results.filter(
        (r) =>
          r.studentId === id ||
          (r.studentName === name && r.studentClass.toLowerCase() === "umum"),
      );
      const relatedLogs = counselingLogs.filter((l) => l.studentId === id);

      const resultDocs = relatedResults.map((r) =>
        deleteDoc(doc(db, "test_results", r.id!)),
      );
      const logDocs = relatedLogs.map((l) =>
        deleteDoc(doc(db, "counseling_logs", l.id!)),
      );
      const userDoc = deleteDoc(doc(db, "users", id));

      await Promise.all([...resultDocs, ...logDocs, userDoc]);
      setConfirmDelete(null);
      showToast(
        `Data peserta ${name} dan semua riwayat berhasil dihapus.`,
        "success",
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `guest/${id}`);
    }
  };

  const handleDeleteSelectedGuests = async () => {
    if (selectedGuestIds.length === 0) return;
    try {
      const userDocs = selectedGuestIds.map((id) =>
        deleteDoc(doc(db, "users", id)),
      );

      const relatedResults = results.filter((r) =>
        selectedGuestIds.includes(r.studentId),
      );
      const relatedLogs = counselingLogs.filter((l) =>
        selectedGuestIds.includes(l.studentId),
      );

      const resultDocs = relatedResults.map((r) =>
        deleteDoc(doc(db, "test_results", r.id!)),
      );
      const logDocs = relatedLogs.map((l) =>
        deleteDoc(doc(db, "counseling_logs", l.id!)),
      );

      await Promise.all([...userDocs, ...resultDocs, ...logDocs]);

      setSelectedGuestIds([]);
      setConfirmDelete(null);
      showToast(
        `${selectedGuestIds.length} Peserta umum dan semua data terkait berhasil dihapus.`,
        "success",
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, "multiple_guests");
    }
  };

  const handleDeleteAllGuestsResults = async () => {
    const guestUsers = allUsers.filter(
      (u) =>
        u.role === "student" && !registeredClassNames.includes(u.className),
    );
    const guestUserIds = guestUsers.map((u) => u.uid);

    try {
      const userDocs = guestUserIds.map((id) =>
        deleteDoc(doc(db, "users", id)),
      );

      const relatedResults = results.filter(
        (r) =>
          guestUserIds.includes(r.studentId) ||
          r.studentClass.toLowerCase() === "umum",
      );
      const relatedLogs = counselingLogs.filter((l) =>
        guestUserIds.includes(l.studentId),
      );

      const resultDocs = relatedResults.map((r) =>
        deleteDoc(doc(db, "test_results", r.id!)),
      );
      const logDocs = relatedLogs.map((l) =>
        deleteDoc(doc(db, "counseling_logs", l.id!)),
      );

      await Promise.all([...userDocs, ...resultDocs, ...logDocs]);

      setConfirmDelete(null);
      showToast(
        "Semua data peserta umum dan riwayat terkait berhasil dihapus.",
        "success",
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, "all_guests");
    }
  };

  const filteredResults = results.filter((r) => {
    const matchesClass =
      selectedClass === "all"
        ? isStudentResult(r)
        : r.studentClass === selectedClass;
    const studentSchoolName =
      r.studentSchoolName ||
      students.find(
        (s) =>
          s.id === r.studentId ||
          (s.name === r.studentName && s.className === r.studentClass),
      )?.schoolName ||
      "";
    const matchesSchool =
      selectedSchool === "all" || studentSchoolName === selectedSchool;
    const matchesName = r.studentName
      .toLowerCase()
      .includes(filterName.toLowerCase());
    const matchesType = filterType === "all" || r.testType === filterType;
    const matchesDate =
      (!reportStartDate ||
        new Date(r.timestamp?.seconds * 1000) >= new Date(reportStartDate)) &&
      (!reportEndDate ||
        new Date(r.timestamp?.seconds * 1000) <= new Date(reportEndDate));
    return (
      matchesClass && matchesSchool && matchesName && matchesType && matchesDate
    );
  });

  const classAverages = React.useMemo(() => {
    if (filterType === "all") return null;

    const relevantResults = filteredResults.filter(
      (r) => r.testType === filterType,
    );

    const classGroups: Record<
      string,
      {
        totalScores: Record<string, number>;
        count: number;
        schoolName?: string;
      }
    > = {};

    relevantResults.forEach((r) => {
      if (!classGroups[r.studentClass]) {
        // Try to get school name from result first, then student data
        const schoolName =
          r.studentSchoolName ||
          students.find(
            (s) =>
              s.id === r.studentId ||
              (s.name === r.studentName && s.className === r.studentClass),
          )?.schoolName ||
          "";
        classGroups[r.studentClass] = { totalScores: {}, count: 0, schoolName };
      }

      Object.entries(r.scores).forEach(([scoreName, scoreValue]) => {
        classGroups[r.studentClass].totalScores[scoreName] =
          (classGroups[r.studentClass].totalScores[scoreName] || 0) +
          (scoreValue as number);
      });
      classGroups[r.studentClass].count++;
    });

    return Object.entries(classGroups).map(([className, data]) => ({
      className,
      schoolName: data.schoolName,
      averages: Object.fromEntries(
        Object.entries(data.totalScores).map(([scoreName, total]) => [
          scoreName,
          total / data.count,
        ]),
      ),
    }));
  }, [filteredResults, filterType, students]);

  const classChartData = React.useMemo(() => {
    if (filterType === "all") return [];

    const relevantResults = filteredResults.filter(
      (r) => r.testType === filterType,
    );

    const totalScores: Record<string, number> = {};
    relevantResults.forEach((r) => {
      Object.entries(r.scores).forEach(([name, val]) => {
        totalScores[name] = (totalScores[name] || 0) + (val as number);
      });
    });

    const count = relevantResults.length || 1;
    return Object.entries(totalScores).map(([name, val]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1).replace("_", " "),
      value: (val as number) / count,
    }));
  }, [filteredResults, filterType]);

  const tableFilteredResults = React.useMemo(() => {
    return results
      .filter((r) => {
        // Only registered students
        if (!isStudentResult(r)) return false;

        const matchesClass =
          tableClassFilter === "all" || r.studentClass === tableClassFilter;
        const studentSchoolName =
          r.studentSchoolName ||
          students.find(
            (s) =>
              s.id === r.studentId ||
              (s.name === r.studentName && s.className === r.studentClass),
          )?.schoolName ||
          "";
        const matchesSchool =
          tableSchoolFilter === "all" ||
          studentSchoolName === tableSchoolFilter;

        const matchesName = r.studentName
          .toLowerCase()
          .includes(historySearch.toLowerCase());
        const matchesType =
          tableTypeFilter === "all" || r.testType === tableTypeFilter;
        const matchesDate =
          !historyDate ||
          new Date(r.timestamp?.seconds * 1000).toLocaleDateString() ===
            new Date(historyDate).toLocaleDateString();

        return (
          matchesClass &&
          matchesSchool &&
          matchesName &&
          matchesType &&
          matchesDate
        );
      })
      .sort((a, b) => {
        let cmp = 0;
        if (historySortField === "school") {
          const schoolA =
            a.studentSchoolName ||
            students.find(
              (s) =>
                s.id === a.studentId ||
                (s.name === a.studentName && s.className === a.studentClass),
            )?.schoolName ||
            "";
          const schoolB =
            b.studentSchoolName ||
            students.find(
              (s) =>
                s.id === b.studentId ||
                (s.name === b.studentName && s.className === b.studentClass),
            )?.schoolName ||
            "";
          cmp = schoolA.localeCompare(schoolB, undefined, {
            sensitivity: "base",
          });
        } else if (historySortField === "name") {
          cmp = (a.studentName || "").localeCompare(
            b.studentName || "",
            undefined,
            { sensitivity: "base" },
          );
        } else if (historySortField === "class") {
          cmp = (a.studentClass || "").localeCompare(
            b.studentClass || "",
            undefined,
            { numeric: true, sensitivity: "base" },
          );
        } else if (historySortField === "type") {
          cmp = (TESTS[a.testType]?.title || "").localeCompare(
            TESTS[b.testType]?.title || "",
            undefined,
            { sensitivity: "base" },
          );
        } else {
          // Default to date
          // Use current time as fallback for pending results so they appear at top during DESC sort
          const timeA = a.timestamp?.seconds || Date.now() / 1000;
          const timeB = b.timestamp?.seconds || Date.now() / 1000;
          cmp = timeA - timeB;
        }

        if (cmp !== 0) {
          return historySortOrder === "asc" ? cmp : -cmp;
        }

        // Secondary sort: default to date desc if primary equal
        const secondaryA = a.timestamp?.seconds || Date.now() / 1000;
        const secondaryB = b.timestamp?.seconds || Date.now() / 1000;
        return secondaryB - secondaryA;
      });
  }, [
    results,
    registeredClassNames,
    tableClassFilter,
    tableSchoolFilter,
    historySearch,
    tableTypeFilter,
    historyDate,
    historySortField,
    historySortOrder,
    students,
  ]);

  const totalPages = Math.ceil(tableFilteredResults.length / itemsPerPage);
  const paginatedResults = tableFilteredResults.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const toggleSelectHistory = (id: string) => {
    setSelectedHistoryIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const toggleHistorySort = (
    field: "name" | "class" | "school" | "type" | "date",
  ) => {
    if (historySortField === field) {
      setHistorySortOrder(historySortOrder === "asc" ? "desc" : "asc");
    } else {
      setHistorySortField(field);
      setHistorySortOrder("asc");
    }
  };

  const toggleTamuSort = (field: "name" | "school" | "type" | "date") => {
    if (tamuSortField === field) {
      setTamuSortOrder(tamuSortOrder === "asc" ? "desc" : "asc");
    } else {
      setTamuSortField(field);
      setTamuSortOrder("asc");
    }
  };

  const toggleSelectAllHistory = () => {
    if (selectedHistoryIds.length === paginatedResults.length) {
      setSelectedHistoryIds([]);
    } else {
      setSelectedHistoryIds(paginatedResults.map((r) => r.id!));
    }
  };

  const handleDeleteSelectedHistory = () => {
    if (selectedHistoryIds.length === 0) return;
    setConfirmDelete({
      id: "selected_history",
      type: "all_selected_history_results",
      title: "Hapus Hasil Tes Terpilih",
      message: `Apakah Anda yakin ingin menghapus ${selectedHistoryIds.length} hasil tes yang dipilih? Tindakan ini tidak dapat dibatalkan.`,
    });
  };

  const handleDeleteSelectedHistoryResults = async () => {
    if (selectedHistoryIds.length === 0) return;
    try {
      const batch = selectedHistoryIds.map((id) =>
        deleteDoc(doc(db, "test_results", id)),
      );
      await Promise.all(batch);
      setSelectedHistoryIds([]);
      setConfirmDelete(null);
      setIsSelectingHistory(false);
      showToast(
        `${selectedHistoryIds.length} Hasil tes berhasil dihapus.`,
        "success",
      );
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.DELETE,
        "multiple_history_results",
      );
    }
  };

  const handleSaveTeacherSettings = async () => {
    if (!user?.uid) {
      showToast("Gagal menyimpan: User ID tidak ditemukan.", "error");
      return;
    }
    try {
      await setDoc(doc(db, "teacher_settings", user.uid), {
        name: teacherName,
        nip: teacherNip,
        schoolName,
        schoolAddress,
        pemdaName,
        dinasName,
      });
      showToast("Data Guru BK berhasil disimpan!", "success");
      console.log("Teacher settings saved successfully for user:", user.uid);
    } catch (error) {
      console.error("Error saving teacher settings:", error);
      handleFirestoreError(error, OperationType.WRITE, "teacher_settings");
      showToast("Gagal menyimpan data. Silakan coba lagi.", "error");
    }
  };

  const handleGeneratePassword = () => {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewStudentPassword(result);
  };

  const handleAddStudent = async () => {
    if (!newStudentName || !newStudentClass) {
      showToast("Nama dan Kelas wajib diisi.", "error");
      return;
    }

    if (newStudentPassword) {
      if (!/^[0-9A-Z]+$/.test(newStudentPassword)) {
        showToast(
          "Password hanya boleh berisi angka dan huruf besar.",
          "error",
        );
        return;
      }

      const isDuplicate = students.some(
        (s) => s.password === newStudentPassword,
      );
      if (isDuplicate) {
        showToast("Password sudah terdaftar.", "error");
        return;
      }
    }

    try {
      await addDoc(collection(db, "students"), {
        number: newStudentNumber,
        password: newStudentPassword,
        name: newStudentName,
        className: newStudentClass,
        schoolName: newStudentSchool,
        addedBy: user.uid,
      });
      setNewStudentNumber("");
      setNewStudentPassword("");
      setNewStudentName("");
      setNewStudentClass("");
      setNewStudentSchool("");
      showToast("Siswa berhasil ditambahkan.", "success");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "students");
    }
  };

  const handleDownloadClassReport = () => {
    const reportResults = filteredResults.filter(
      (r) => filterType === "all" || r.testType === filterType,
    );
    if (reportResults.length === 0) {
      showToast("Tidak ada data untuk dicetak.", "info");
      return;
    }

    const doc = new jsPDF();
    const testTitle =
      filterType === "all"
        ? "Semua Tes"
        : TESTS[filterType as TestType]?.title || filterType;
    const className = selectedClass === "all" ? "Semua Kelas" : selectedClass;

    let currentY = 15;

    // Kop Surat
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(
      teacherSettings?.pemdaName?.toUpperCase() || "PEMERINTAH PROVINSI / KOTA",
      105,
      currentY,
      { align: "center" },
    );
    currentY += 7;
    doc.text(
      teacherSettings?.dinasName?.toUpperCase() || "DINAS PENDIDIKAN",
      105,
      currentY,
      { align: "center" },
    );
    currentY += 8;
    doc.setFontSize(14);
    const headerSchoolName =
      reportResults.find((r) => r.studentSchoolName)?.studentSchoolName ||
      teacherSettings?.schoolName ||
      "NAMA SEKOLAH ANDA DISINI";
    doc.text(headerSchoolName.toUpperCase(), 105, currentY, {
      align: "center",
    });
    currentY += 6;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(
      teacherSettings?.schoolAddress ||
        "Alamat Lengkap Sekolah, No. Telp, Website, Email",
      105,
      currentY,
      { align: "center" },
    );
    currentY += 4;
    doc.line(20, currentY, 190, currentY);
    currentY += 1;
    doc.line(20, currentY, 190, currentY);
    currentY += 14;

    // Header
    doc.setFontSize(16);
    doc.setTextColor(79, 70, 229);
    doc.setFont("helvetica", "bold");
    doc.text("LAPORAN AGREGAT HASIL TES PSIKOLOGI", 105, currentY, {
      align: "center",
    });
    currentY += 10;

    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text(
      `${testTitle.toUpperCase()} - ${className.toUpperCase()}`,
      105,
      currentY,
      { align: "center" },
    );
    currentY += 15;

    // Info
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    doc.text(`Jumlah Partisipan: ${reportResults.length} Siswa`, 20, currentY);
    currentY += 7;
    doc.text(
      `Periode: ${reportStartDate || "Awal"} s/d ${reportEndDate || "Sekarang"}`,
      20,
      currentY,
    );
    currentY += 12;

    // Table
    const tableData = reportResults.map((r, i) => [
      i + 1,
      r.studentName,
      r.studentClass,
      new Date(r.timestamp?.seconds * 1000).toLocaleDateString("id-ID"),
      getShortResult(r.testType, r.scores),
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [["No", "Nama Siswa", "Kelas", "Tanggal", "Hasil Utama"]],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: 255,
        fontStyle: "bold",
      },
      styles: { fontSize: 9, cellPadding: 3 },
    });

    // Signatures
    const sigY = (doc as any).lastAutoTable.finalY + 20;
    const today = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text("Mengetahui,", 160, sigY, { align: "center" });
    doc.text("Guru Bimbingan Konseling,", 160, sigY + 5, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.text(
      teacherSettings?.name || "(....................................)",
      160,
      sigY + 30,
      { align: "center" },
    );
    doc.setFont("helvetica", "normal");
    doc.text(
      `NIP. ${teacherSettings?.nip || "...................................."}`,
      160,
      sigY + 35,
      { align: "center" },
    );

    doc.save(`Laporan_Kelas_${className}_${testTitle}.pdf`);
  };

  const handlePrintLoginCards = (studentsToPrint: StudentData[]) => {
    if (studentsToPrint.length === 0) {
      showToast(
        "Pilih siswa terlebih dahulu atau filter daftar siswa.",
        "info",
      );
      return;
    }

    const doc = new jsPDF({ format: "legal", orientation: "landscape" });
    const cols = 4;
    const rows = 4;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    const gap = 5;

    const cardWidth = (pageWidth - 2 * margin - (cols - 1) * gap) / cols;
    const cardHeight = (pageHeight - 2 * margin - (rows - 1) * gap) / rows;

    let x = margin;
    let y = margin;
    let cardsOnPage = 0;

    studentsToPrint.forEach((student) => {
      // 16 cards per Legal page (4 columns x 4 rows)
      if (cardsOnPage > 0 && cardsOnPage % 16 === 0) {
        doc.addPage();
        x = margin;
        y = margin;
        cardsOnPage = 0;
      }

      // Draw Card Border
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.1);
      doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, "S");

      // Card Header
      doc.setFillColor(79, 70, 229); // Indigo 600
      doc.roundedRect(x, y, cardWidth, 12, 3, 3, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text("KARTU LOGIN SISWA", x + cardWidth / 2, y + 7.5, {
        align: "center",
      });

      // Card Content
      doc.setTextColor(30, 41, 59); // Slate 800
      doc.setFontSize(8);

      const contentX = x + 5;
      let contentY = y + 20;

      doc.setFont("helvetica", "bold");
      doc.text("NAMA", contentX, contentY);
      doc.setFont("helvetica", "normal");
      doc.text(`: ${student.name.toUpperCase()}`, contentX + 25, contentY);
      contentY += 6;

      doc.setFont("helvetica", "bold");
      doc.text("KELAS", contentX, contentY);
      doc.setFont("helvetica", "normal");
      doc.text(`: ${student.className}`, contentX + 25, contentY);
      contentY += 6;

      doc.setFont("helvetica", "bold");
      doc.text("SEKOLAH", contentX, contentY);
      doc.setFont("helvetica", "normal");
      const sName = student.schoolName || teacherSettings?.schoolName || "-";
      doc.text(`: ${sName}`, contentX + 25, contentY);
      contentY += 6;

      doc.setFont("helvetica", "bold");
      doc.text("PASSWORD", contentX, contentY);
      doc.setFont("helvetica", "bold");
      doc.text(`: ${student.password || "-"}`, contentX + 25, contentY);
      contentY += 8;

      // Footer / Instruction
      doc.setFontSize(6);
      doc.setTextColor(148, 163, 184); // Slate 400
      doc.text(
        "Gunakan data di atas untuk mengisi identitas pada aplikasi tes.",
        x + cardWidth / 2,
        y + cardHeight - 5,
        { align: "center" },
      );
      doc.setFontSize(5);
      doc.text(
        "Dutatama Software Aplikasi",
        x + cardWidth / 2,
        y + cardHeight - 2,
        { align: "center" },
      );

      // Update position for next card
      cardsOnPage++;
      if (cardsOnPage % 4 === 0) {
        x = margin;
        y += cardHeight + gap;
      } else {
        x += cardWidth + gap;
      }
    });

    doc.save(`Kartu_Login_Siswa_${new Date().getTime()}.pdf`);
    showToast(
      `${studentsToPrint.length} Kartu login berhasil dibuat.`,
      "success",
    );
  };

  const handleDownloadTemplate = () => {
    // Definisi kolom template
    const headers = [
      {
        No: "1",
        PASSWORD: "0012345678",
        "Nama Siswa": "Budi Santoso",
        Kelas: "IX-A",
        "Nama Sekolah": "SMPN 1",
        Keterangan: "Contoh Data (Bisa Dihapus)",
      },
      {
        No: "2",
        PASSWORD: "0087654321",
        "Nama Siswa": "Siti Aminah",
        Kelas: "IX-B",
        "Nama Sekolah": "SMPN 1",
        Keterangan: "Contoh Data (Bisa Dihapus)",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(headers);

    // Atur lebar kolom agar rapi
    worksheet["!cols"] = [
      { wch: 5 }, // No
      { wch: 15 }, // PASSWORD
      { wch: 30 }, // Nama Siswa
      { wch: 10 }, // Kelas
      { wch: 25 }, // Nama Sekolah
      { wch: 30 }, // Keterangan
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Format Impor Siswa");

    // Download file
    XLSX.writeFile(workbook, "template_impor_siswa.xlsx");
    showToast(
      "Template berhasil diunduh. Silakan isi data sesuai format.",
      "success",
    );
  };

  const [importErrors, setImportErrors] = useState<string[]>([]);
  const handleUploadStudents = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset state
    setImportErrors([]);
    setUploadSummary(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

        if (jsonData.length === 0) {
          showToast("File Excel kosong atau tidak terbaca.", "error");
          return;
        }

        let successCount = 0;
        const newIds: string[] = [];
        const errors: string[] = [];

        for (let i = 0; i < jsonData.length; i++) {
          const row = jsonData[i];
          const rowNum = i + 2; // +1 for 0-index, +1 for header row

          // Helper to find value by normalized key
          const findValue = (searchKeys: string[]) => {
            const lowerSearchKeys = searchKeys.map((k) => k.toLowerCase());
            const actualKey = Object.keys(row).find((k) =>
              lowerSearchKeys.includes(k.trim().toLowerCase()),
            );
            return actualKey ? row[actualKey] : null;
          };

          const number = findValue(["No", "Nomor"]) || "";
          const password = findValue(["PASSWORD"])
            ? String(findValue(["PASSWORD"])).trim()
            : "";
          const name = findValue(["Nama Siswa", "Nama", "Student Name"]);
          const className = findValue(["Kelas", "Class"]);
          const schoolName =
            findValue([
              "Nama Sekolah",
              "Sekolah",
              "Asal Sekolah",
              "School Name",
            ]) ||
            teacherSettings?.schoolName ||
            "";

          // Validation
          if (!name || !String(name).trim()) {
            errors.push(`Baris ${rowNum}: Nama Siswa kosong.`);
            continue;
          }
          if (!className || !String(className).trim()) {
            errors.push(`Baris ${rowNum}: Kelas kosong.`);
            continue;
          }

          if (password) {
            if (!/^\d+$/.test(password)) {
              errors.push(
                `Baris ${rowNum}: PASSWORD (${password}) harus berupa angka.`,
              );
              continue;
            }
            if (students.some((s) => s.password === password)) {
              errors.push(
                `Baris ${rowNum}: PASSWORD (${password}) sudah terdaftar di sistem.`,
              );
              continue;
            }
          }

          try {
            const docRef = await addDoc(collection(db, "students"), {
              number: String(number),
              password: password,
              name: String(name).trim(),
              className: String(className).trim().toUpperCase(),
              schoolName: String(schoolName).trim(),
              addedBy: user.uid,
              createdAt: serverTimestamp(),
            });
            newIds.push(docRef.id);
            successCount++;
          } catch (error) {
            console.error("Error uploading student row:", error);
            errors.push(`Baris ${rowNum}: Gagal menyimpan ke database.`);
          }
        }

        setRecentlyAddedIds(newIds);
        setUploadSummary({ total: jsonData.length, success: successCount });
        setImportErrors(errors);
        setActiveTab("students");

        if (successCount > 0) {
          showToast(`Berhasil mengimpor ${successCount} siswa.`, "success");
        }
        if (errors.length > 0) {
          showToast(
            `Terdapat ${errors.length} baris yang gagal diimpor.`,
            "error",
          );
        }

        // Auto hide summary after 15 seconds if many errors, else 8s
        setTimeout(
          () => {
            setUploadSummary(null);
            setRecentlyAddedIds([]);
            setImportErrors([]);
          },
          errors.length > 0 ? 15000 : 8000,
        );
      } catch (err) {
        console.error("Error reading excel:", err);
        showToast("Gagal membaca file Excel. Pastikan format benar.", "error");
      }
    };
    reader.readAsArrayBuffer(file);
    // Reset input value to allow re-upload same file
    e.target.value = "";
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await deleteDoc(doc(db, "users", id));
      setConfirmDelete(null);
      showToast("Data pengguna berhasil dihapus.", "success");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, "users");
    }
  };

  // Aggregated data for class report
  const COLORS = [
    "#059669",
    "#10b981",
    "#0d9488",
    "#14b8a6",
    "#16a34a",
    "#22c55e",
    "#65a30d",
    "#84cc16",
  ];

  const getComparisonData = () => {
    if (filterType === "all") return [];

    const classAverages: { name: string; value: number }[] = [];
    const classesWithData = Array.from(
      new Set(
        results
          .filter((r) => r.testType === filterType)
          .map((r) => r.studentClass),
      ),
    )
      .filter(Boolean)
      .sort();

    classesWithData.forEach((className) => {
      const classResults = results.filter(
        (r) => r.studentClass === className && r.testType === filterType,
      );
      if (classResults.length > 0) {
        let totalScore = 0;
        classResults.forEach((r) => {
          const studentAvg =
            (Object.values(r.scores).reduce(
              (a, b) => (a as number) + (typeof b === "number" ? b : 0),
              0,
            ) as number) / (Object.keys(r.scores).length || 1);
          totalScore += studentAvg;
        });
        classAverages.push({
          name: className,
          value: parseFloat((totalScore / classResults.length).toFixed(1)),
        });
      }
    });

    return classAverages;
  };

  const classComparisonData = getComparisonData();

  const handleGenerateClassAnalysis = async () => {
    if (filterType === "all") {
      showToast(
        "Pilih jenis tes terlebih dahulu untuk membuat analisis kelas.",
        "info",
      );
      return;
    }

    setIsGeneratingClassAnalysis(true);
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("GEMINI_API_KEY is missing");
      const ai = new GoogleGenAI({ apiKey });
      let prompt = `Berdasarkan data agregat hasil tes psikologi untuk kelas berikut:
Kelas: ${selectedClass === "all" ? "Semua Kelas" : selectedClass}
Jenis Tes: ${TESTS[filterType as TestType]?.title || filterType}
Periode: ${reportStartDate ? reportStartDate : "Awal"} sampai ${reportEndDate ? reportEndDate : "Sekarang"}
Distribusi Rata-rata Skor: ${JSON.stringify(classChartData)}
${selectedClass === "all" ? `Perbandingan Rata-rata Skor Antar Kelas: ${JSON.stringify(classComparisonData)}` : ""}

Berikan analisis mendalam mengenai karakteristik kelas ini berdasarkan hasil tes tersebut. ${selectedClass === "all" ? "Fokuskan pada tren kinerja antar kelas dan bandingkan performanya." : ""} Apa kekuatan utama kelas ini? Apa area yang perlu mendapat perhatian lebih dari guru? Berikan rekomendasi strategi pembelajaran atau pendekatan bimbingan yang cocok untuk mayoritas siswa di kelas ini. Gunakan bahasa Indonesia yang profesional, mudah dipahami, dan format Markdown yang rapi. Sertakan ringkasan temuan utama dan saran yang dapat ditindaklanjuti.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setClassAnalysis(response?.text || "");
      showToast("Analisis kelas berhasil dibuat!", "success");
    } catch (error) {
      console.error("Class Analysis Error:", error);
      showToast(
        "Gagal mendapatkan analisis kelas. Silakan coba lagi.",
        "error",
      );
    } finally {
      setIsGeneratingClassAnalysis(false);
    }
  };

  const handleUpdateStudent = async () => {
    if (
      !editingStudent ||
      !editingStudent.name.trim() ||
      !editingStudent.className.trim()
    )
      return;

    if (editingStudent.password) {
      if (!/^[0-9A-Z]+$/.test(editingStudent.password)) {
        showToast(
          "Password hanya boleh berisi angka dan huruf besar.",
          "error",
        );
        return;
      }
    }

    try {
      await updateDoc(doc(db, "students", editingStudent.id!), {
        number: editingStudent.number,
        password: editingStudent.password,
        name: editingStudent.name,
        className: editingStudent.className,
        schoolName: editingStudent.schoolName,
      });
      setEditingStudent(null);
      showToast("Data siswa berhasil diperbarui.", "success");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, "students");
    }
  };

  // Aggregated data for charts
  const testTypeCounts = filteredResults.reduce(
    (acc, curr) => {
      acc[curr.testType] = (acc[curr.testType] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const pieData = Object.entries(testTypeCounts).map(([name, value]) => ({
    name: TESTS[name as TestType]?.title || name,
    value,
  }));

  // Calculate summary stats (Registered Students Only)
  const registeredResults = results.filter((r) => isStudentResult(r));
  const totalTests = registeredResults.length;
  const uniqueStudents = new Set(registeredResults.map((r) => r.studentId))
    .size;

  // Find most frequent test type
  const mostFrequentTest = Object.entries(testTypeCounts).sort(
    (a, b) => (b[1] as number) - (a[1] as number),
  )[0];
  const mostFrequentTestType = mostFrequentTest ? mostFrequentTest[0] : null;

  // Calculate average score for most frequent test
  const frequentTestResults = registeredResults.filter(
    (r) => r.testType === mostFrequentTestType,
  );
  const avgScore =
    frequentTestResults.length > 0
      ? (
          frequentTestResults.reduce((acc, curr) => {
            const totalScore = Object.values(curr.scores).reduce(
              (a, b) => (a as number) + (b as number),
              0,
            );
            return acc + (totalScore as number);
          }, 0) / frequentTestResults.length
        ).toFixed(1)
      : "0";

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative">
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed bottom-6 right-6 z-[100] lg:hidden w-14 h-14 bg-emerald-600 text-white rounded-full shadow-2xl flex items-center justify-center active:scale-95 transition-all"
      >
        {isSidebarOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[80] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div
        style={{ width: `${sidebarWidth}px`, flexShrink: 0 }}
        className={cn(
          "fixed inset-y-0 left-0 bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 text-white flex flex-col shadow-2xl z-[90] transition-transform duration-300 lg:relative lg:translate-x-0 lg:z-10",
          isSidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="p-6 border-b border-emerald-700/50 bg-gradient-to-br from-emerald-500/20 to-transparent">
          <h2 className="text-2xl font-black tracking-tight text-emerald-50">
            PsikoTest
          </h2>
          <div className="mt-3 flex justify-start">
            <img
              src="https://lh3.googleusercontent.com/d/1UNix_IGpjmt2q0apsIQy-6s3Zr9SnLJ9"
              alt="Dutatama Logo"
              className="w-32 h-auto opacity-90 hover:opacity-100 transition-opacity cursor-pointer"
              referrerPolicy="no-referrer"
            />
          </div>
          <p className="text-[10px] text-emerald-200/60 mt-3 font-medium opacity-80">
            {user.email}
          </p>
        </div>
        <div className="flex-1 overflow-y-auto py-6 space-y-6 px-4">
          {["Utama", "Manajemen Siswa", "Manajemen Umum", "Administrasi"].map(
            (groupName) => {
              const tabsInGroup = sidebarOrder.filter(
                (id) =>
                  AVAILABLE_TABS.find((t) => t.id === id)?.group === groupName,
              );
              if (tabsInGroup.length === 0) return null;

              const groupColor =
                groupName === "Manajemen Umum"
                  ? "text-indigo-300/50"
                  : "text-emerald-300/50";

              return (
                <div key={groupName}>
                  <p
                    className={cn(
                      "text-[10px] font-black uppercase tracking-widest px-4 mb-2",
                      groupColor,
                    )}
                  >
                    {groupName}
                  </p>
                  <div className="space-y-1">
                    {tabsInGroup.map((id) => {
                      const config = TAB_CONFIG[id];
                      if (!config) return null;
                      const Icon = config.icon;
                      const isActive = activeTab === id;

                      return (
                        <button
                          key={id}
                          onClick={() => {
                            setActiveTab(id as any);
                            setIsSidebarOpen(false);
                          }}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-[11px] font-bold transition-all",
                            isActive
                              ? config.activeColorClass ||
                                  "bg-emerald-600 text-white shadow-lg"
                              : id === "dashboard" ||
                                  id === "teacher" ||
                                  id === "customization"
                                ? "text-emerald-100/70 hover:bg-emerald-800/50 font-black"
                                : config.colorClass ||
                                  "text-emerald-100/70 hover:bg-emerald-800/50",
                          )}
                        >
                          <Icon className="w-4 h-4" /> {config.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            },
          )}
        </div>

        {(user.email?.toLowerCase() === "dutatama@gmail.com" ||
          user.role === "admin") && (
          <div className="px-4 pb-6">
            <button
              onClick={() => {
                setActiveTab("admin-users");
                setIsSidebarOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[11px] font-black transition-all tracking-wide",
                activeTab === "admin-users"
                  ? "bg-red-700 text-white shadow-lg"
                  : "text-red-100/70 hover:bg-red-800/50",
              )}
            >
              <ShieldCheck className="w-4 h-4" /> ADMINISTRASI PENGGUNA
            </button>
          </div>
        )}
        <div className="p-6 border-t border-emerald-700/50 space-y-3">
          <button
            onClick={() => setView("create-test")}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-emerald-500 hover:bg-emerald-400 rounded-xl text-xs font-black transition-all text-white shadow-xl shadow-emerald-950/30 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> BUAT TES KUSTOM
          </button>
        </div>
      </div>
      <div
        className="hidden lg:block absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-emerald-500 transition-colors z-[100]"
        onMouseDown={startResizing}
      />

      {/* Main Content */}
      <div className="flex-1 min-w-0 overflow-y-auto p-4 sm:p-8 bg-slate-50/50">
        <div className="w-full space-y-8 px-2 sm:px-6">
          {/* Critical Anxiety Alerts */}
          {notifications.filter((n) => n.type === "warning" && !n.read).length >
            0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 border-2 border-red-200 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-red-100/50"
            >
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center animate-pulse shadow-lg shadow-red-200">
                  <AlertTriangle className="w-9 h-9 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-red-900 leading-none">
                    PERHATIAN KRITIS!
                  </h4>
                  <p className="text-red-700 text-sm mt-2 font-bold leading-relaxed">
                    Terdapat{" "}
                    {
                      notifications.filter(
                        (n) => n.type === "warning" && !n.read,
                      ).length
                    }{" "}
                    laporan kecemasan tinggi yang belum ditangani. Mohon segera
                    periksa notifikasi dan berikan bimbingan kepada siswa
                    terkait.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setActiveTab("history")}
                  className="px-6 py-3 bg-red-600 text-white rounded-2xl font-black text-xs hover:bg-red-700 transition-all shadow-lg hover:shadow-red-200 uppercase tracking-widest"
                >
                  LIHAT SEMUA RIWAYAT
                </button>
                <button
                  onClick={() => setActiveTab("counseling")}
                  className="px-6 py-3 bg-white text-red-600 border-2 border-red-600 rounded-2xl font-black text-xs hover:bg-red-50 transition-all uppercase tracking-widest"
                >
                  MENU KONSELING
                </button>
              </div>
            </motion.div>
          )}

          {/* Header Title based on activeTab */}
          <div className="bg-emerald-500 p-6 rounded-2xl border border-emerald-600 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-6">
              <h2 className="text-2xl font-black text-white tracking-tight">
                {activeTab === "dashboard" && "Dashboard Utama"}
                {activeTab === "history" && "Riwayat Tes Siswa"}
                {activeTab === "students" && "Manajemen Siswa"}
                {activeTab === "teacher" && "Data Guru BK"}
                {activeTab === "interactive-report" && "Laporan Interaktif"}
                {activeTab === "report" && "Laporan Siswa"}
                {activeTab === "recap" && "Rekap Hasil Tes Siswa"}
                {activeTab === "recap-tamu" && "Rekap Peserta Umum"}
                {activeTab === "hasil-tes-tamu" && "Hasil Tes Umum"}
                {activeTab === "manajemen-tamu" && "Manajemen Umum"}
                {activeTab === "tamu" && "Riwayat Tes Umum"}
                {activeTab === "monitor" && "Progres Tes Siswa"}
                {activeTab === "hasil-tes" && "Hasil Tes Psikologi"}
                {activeTab === "counseling" && "Catatan Konseling Terpadu"}
                {activeTab === "admin-users" && "Manajemen Guru & Admin"}
                {activeTab === "report-individu-siswa" && "Laporan Individu"}
                {activeTab === "report-individu-umum" &&
                  "Laporan Individu Umum"}
                {activeTab === "backup-restore" && "Backup & Restore Data"}
                {activeTab === "customization" && "Kustomisasi Dashboard"}
              </h2>
            </div>
            <button
              onClick={() => setView("student-login")}
              className="px-6 py-2.5 bg-white text-emerald-600 rounded-xl text-xs font-black hover:bg-emerald-50 transition-all shadow-lg shadow-emerald-900/20"
            >
              MENU SISWA
            </button>
          </div>

          {activeTab === "dashboard" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Summary Cards */}
              {enabledWidgets.includes("summary_cards") && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0">
                      <ClipboardCheck className="w-7 h-7 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Total Tes
                      </p>
                      <h4 className="text-3xl font-black text-slate-900">
                        {totalTests}
                      </h4>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center shrink-0">
                      <Users className="w-7 h-7 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Siswa Unik
                      </p>
                      <h4 className="text-3xl font-black text-slate-900">
                        {uniqueStudents}
                      </h4>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0">
                      <BarChart3 className="w-7 h-7 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Rata-rata Skor*
                      </p>
                      <h4 className="text-3xl font-black text-slate-900">
                        {avgScore}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-1 font-medium">
                        *Populer:{" "}
                        {mostFrequentTestType?.replace("_", " ") || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {enabledWidgets.includes("test_distribution") && (
                  <div
                    className={cn(
                      "bg-white p-6 rounded-2xl border border-slate-200 shadow-sm",
                      enabledWidgets.includes("quick_stats")
                        ? "lg:col-span-2"
                        : "lg:col-span-3",
                    )}
                  >
                    <h3 className="text-base font-bold text-slate-900 mb-6">
                      Distribusi Tes (Terfilter)
                    </h3>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={pieData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#e2e8f0"
                          />
                          <XAxis
                            dataKey="name"
                            fontSize={11}
                            tick={{ fill: "#64748b" }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            fontSize={11}
                            tick={{ fill: "#64748b" }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip
                            cursor={{ fill: "#f8fafc" }}
                            contentStyle={{
                              borderRadius: "12px",
                              border: "none",
                              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                            }}
                          />
                          <Bar
                            dataKey="value"
                            radius={[6, 6, 0, 0]}
                            maxBarSize={60}
                          >
                            {pieData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {enabledWidgets.includes("quick_stats") && (
                  <div
                    className={cn(
                      "bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col",
                      !enabledWidgets.includes("test_distribution") &&
                        "lg:col-span-3",
                    )}
                  >
                    <h3 className="text-base font-bold text-slate-900 mb-6">
                      Statistik Cepat
                    </h3>
                    <div className="space-y-4 flex-1">
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-lg text-emerald-600 shadow-sm border border-slate-200">
                            <Users className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-slate-700 text-sm">
                            Total Kelas
                          </span>
                        </div>
                        <span className="text-lg font-black text-emerald-600">
                          {classes.length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-lg text-teal-600 shadow-sm border border-slate-200">
                            <GraduationCap className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-slate-700 text-sm">
                            Siswa Terdaftar
                          </span>
                        </div>
                        <span className="text-lg font-black text-teal-600">
                          {students.length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-lg text-emerald-600 shadow-sm border border-slate-200">
                            <ClipboardCheck className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-slate-700 text-sm">
                            Hasil Terfilter
                          </span>
                        </div>
                        <span className="text-lg font-black text-emerald-600">
                          {filteredResults.length}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "customization" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8 pb-12"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Widget Selection */}
                <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-tight">
                        <Layout className="w-6 h-6 text-emerald-600" /> Pilih
                        Widget Dashboard
                      </h3>
                      <p className="text-sm text-slate-500 mt-1 font-medium">
                        Aktifkan widget yang ingin Anda tampilkan di halaman
                        utama dashboard.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {AVAILABLE_WIDGETS.map((widget) => (
                      <label
                        key={widget.id}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                              enabledWidgets.includes(widget.id)
                                ? "bg-emerald-600 text-white shadow-lg"
                                : "bg-white text-slate-400 border border-slate-200",
                            )}
                          >
                            {enabledWidgets.includes(widget.id) ? (
                              <Check className="w-5 h-5" />
                            ) : (
                              <Settings2 className="w-5 h-5" />
                            )}
                          </div>
                          <span
                            className={cn(
                              "font-bold text-sm",
                              enabledWidgets.includes(widget.id)
                                ? "text-slate-900"
                                : "text-slate-500",
                            )}
                          >
                            {widget.name}
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={enabledWidgets.includes(widget.id)}
                          onChange={(e) => {
                            if (e.target.checked)
                              setEnabledWidgets([...enabledWidgets, widget.id]);
                            else
                              setEnabledWidgets(
                                enabledWidgets.filter((w) => w !== widget.id),
                              );
                          }}
                        />
                        <div
                          className={cn(
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                            enabledWidgets.includes(widget.id)
                              ? "border-emerald-600 bg-emerald-600"
                              : "border-slate-200 bg-white",
                          )}
                        >
                          {enabledWidgets.includes(widget.id) && (
                            <Check className="w-4 h-4 text-white" />
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Tab Ordering */}
                <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-tight">
                        <GripVertical className="w-6 h-6 text-emerald-600" />{" "}
                        Urutan Sidebar & Tab
                      </h3>
                      <p className="text-sm text-slate-500 mt-1 font-medium">
                        Gunakan panah untuk mengatur urutan menu navigasi di
                        sidebar.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {sidebarOrder.map((tabId, index) => {
                      const tabInfo = AVAILABLE_TABS.find(
                        (t) => t.id === tabId,
                      );
                      if (!tabInfo) return null;
                      const config = TAB_CONFIG[tabId];
                      const Icon = config?.icon || History;

                      return (
                        <div
                          key={tabId}
                          className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100 group hover:shadow-md transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-600 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-bold text-sm text-slate-800 tracking-tight">
                                {tabInfo.name}
                              </p>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {tabInfo.group}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => moveTab(index, "up")}
                              disabled={index === 0}
                              className="p-2 bg-white text-slate-400 hover:text-emerald-600 rounded-xl border border-slate-100 shadow-sm disabled:opacity-30 disabled:hover:text-slate-400"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => moveTab(index, "down")}
                              disabled={index === sidebarOrder.length - 1}
                              className="p-2 bg-white text-slate-400 hover:text-emerald-600 rounded-xl border border-slate-100 shadow-sm disabled:opacity-30 disabled:hover:text-slate-400"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex justify-center pt-6">
                <button
                  onClick={handleSaveCustomization}
                  className="px-12 py-4 bg-emerald-600 text-white rounded-[2rem] font-black text-lg hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-900/20 flex items-center gap-3 active:scale-95"
                >
                  <Save className="w-6 h-6" /> SIMPAN KUSTOMISASI
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === "admin-users" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-wrap gap-4 items-center justify-between">
                  <div className="max-w-md">
                    <h3 className="text-lg font-bold text-slate-800">
                      Daftar Pengguna & Hak Akses
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Guru BK lain harus login terlebih dahulu menggunakan
                      Google agar akun mereka muncul di daftar ini. Setelah itu,
                      Anda dapat mengubah role mereka menjadi 'Guru BK' atau
                      'Admin'.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Cari user..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-600 outline-none text-sm font-medium w-64"
                      />
                    </div>
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                      <Filter className="w-4 h-4 text-slate-400" />
                      <select
                        value={userRoleFilter}
                        onChange={(e) => setUserRoleFilter(e.target.value)}
                        className="bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700 pr-6 py-1 outline-none"
                      >
                        <option value="all">Semua Role</option>
                        <option value="admin">Admin</option>
                        <option value="teacher">Guru BK</option>
                        <option value="student">Siswa</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto min-w-[1000px]">
                  <table className="w-full text-left min-w-[1000px]">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <th className="px-6 py-4">Nama</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Role Saat Ini</th>
                        <th className="px-6 py-4 text-right">
                          Aksi / Ubah Role
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {allUsers
                        .filter((u) => u.email && u.email.trim() !== "")
                        .filter((u) => {
                          const matchesSearch =
                            u.name
                              .toLowerCase()
                              .includes(userSearch.toLowerCase()) ||
                            u.email
                              .toLowerCase()
                              .includes(userSearch.toLowerCase());
                          const matchesRole =
                            userRoleFilter === "all" ||
                            u.role === userRoleFilter;
                          return matchesSearch && matchesRole;
                        })
                        .slice(
                          (currentPage - 1) * itemsPerPage,
                          currentPage * itemsPerPage,
                        )
                        .map((u) => (
                          <tr
                            key={u.id}
                            className="hover:bg-slate-50/80 transition-colors"
                          >
                            <td className="px-6 py-4 text-sm font-bold text-slate-700">
                              {u.name}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-500">
                              {u.email}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={cn(
                                  "px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter",
                                  u.role === "admin"
                                    ? "bg-red-100 text-red-600"
                                    : u.role === "teacher"
                                      ? "bg-amber-100 text-amber-600"
                                      : "bg-emerald-100 text-emerald-600",
                                )}
                              >
                                {u.role === "admin"
                                  ? "Administrator"
                                  : u.role === "teacher"
                                    ? "Guru BK"
                                    : "Siswa"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex flex-col items-end gap-2">
                                <div className="flex items-center justify-end gap-2">
                                  <select
                                    disabled={
                                      u.email?.toLowerCase() ===
                                      "dutatama@gmail.com"
                                    }
                                    value={u.role}
                                    onChange={async (e) => {
                                      try {
                                        await updateDoc(
                                          doc(db, "users", u.id),
                                          { role: e.target.value },
                                        );
                                        showToast(
                                          `Role ${u.name} berhasil diubah menjadi ${e.target.value}`,
                                          "success",
                                        );
                                      } catch (error) {
                                        handleFirestoreError(
                                          error,
                                          OperationType.UPDATE,
                                          "users",
                                        );
                                      }
                                    }}
                                    className="text-xs font-bold bg-slate-100 border-none rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                                  >
                                    <option value="student">Siswa</option>
                                    <option value="teacher">Guru BK</option>
                                    <option value="admin">Admin</option>
                                  </select>
                                  <button
                                    onClick={() => setEditingUser(u)}
                                    className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                    title="Edit Pengguna"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      setConfirmDelete({
                                        id: u.id,
                                        type: "user",
                                        title: "Hapus Pengguna?",
                                        message: `Apakah Anda yakin ingin menghapus pengguna ${u.name}?`,
                                      })
                                    }
                                    disabled={
                                      u.email?.toLowerCase() ===
                                      "dutatama@gmail.com"
                                    }
                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                    title="Hapus Pengguna"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                                {u.role === "teacher" && (
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={cn(
                                        "flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black transition-all",
                                        u.expiryDate &&
                                          new Date(
                                            u.expiryDate.seconds * 1000,
                                          ) < new Date()
                                          ? "bg-red-50 text-red-600 border-red-200 shadow-sm shadow-red-100"
                                          : "bg-amber-50 text-amber-600 border-amber-200 shadow-sm shadow-amber-100",
                                      )}
                                    >
                                      <Calendar className="w-3.5 h-3.5" />
                                      <span className="uppercase tracking-tighter shrink-0 text-[9px]">
                                        Masa Aktif:
                                      </span>
                                      <input
                                        type="date"
                                        value={
                                          u.expiryDate
                                            ? new Date(
                                                u.expiryDate.seconds * 1000,
                                              )
                                                .toISOString()
                                                .split("T")[0]
                                            : ""
                                        }
                                        onChange={async (e) => {
                                          try {
                                            const date = new Date(
                                              e.target.value,
                                            );
                                            date.setHours(23, 59, 59, 999);
                                            await updateDoc(
                                              doc(db, "users", u.id),
                                              {
                                                expiryDate:
                                                  Timestamp.fromDate(date),
                                              },
                                            );
                                            showToast(
                                              `Masa aktif Guru BK ${u.name} berhasil diperbarui.`,
                                              "success",
                                            );
                                          } catch (error) {
                                            handleFirestoreError(
                                              error,
                                              OperationType.UPDATE,
                                              "users",
                                            );
                                          }
                                        }}
                                        className="bg-transparent border-none p-0 focus:ring-0 text-[10px] font-black cursor-pointer outline-none w-24 leading-none"
                                      />
                                      {u.expiryDate &&
                                        new Date(u.expiryDate.seconds * 1000) <
                                          new Date() && (
                                          <span
                                            className="w-2 h-2 bg-red-600 rounded-full animate-pulse ml-1"
                                            title="Kadaluarsa"
                                          />
                                        )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                  <PaginationControls
                    currentPage={currentPage}
                    totalPages={Math.ceil(
                      allUsers
                        .filter((u) => u.email && u.email.trim() !== "")
                        .filter((u) => {
                          const matchesSearch =
                            u.name
                              .toLowerCase()
                              .includes(userSearch.toLowerCase()) ||
                            u.email
                              .toLowerCase()
                              .includes(userSearch.toLowerCase());
                          const matchesRole =
                            userRoleFilter === "all" ||
                            u.role === userRoleFilter;
                          return matchesSearch && matchesRole;
                        }).length / itemsPerPage,
                    )}
                    onPageChange={setCurrentPage}
                    totalItems={
                      allUsers
                        .filter((u) => u.email && u.email.trim() !== "")
                        .filter((u) => {
                          const matchesSearch =
                            u.name
                              .toLowerCase()
                              .includes(userSearch.toLowerCase()) ||
                            u.email
                              .toLowerCase()
                              .includes(userSearch.toLowerCase());
                          const matchesRole =
                            userRoleFilter === "all" ||
                            u.role === userRoleFilter;
                          return matchesSearch && matchesRole;
                        }).length
                    }
                    itemsPerPage={itemsPerPage}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "history" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
            >
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
                        {Object.keys(TESTS).map((type) => (
                          <option key={type} value={type}>
                            {TESTS[type as TestType].title}
                          </option>
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
                      <School className="w-4 h-4 text-slate-400" />
                      <select
                        value={tableSchoolFilter}
                        onChange={(e) => {
                          setTableSchoolFilter(e.target.value);
                          setTableClassFilter("all"); // Reset class filter when school changes
                        }}
                        className="bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700 pr-6 py-1 outline-none"
                      >
                        <option value="all">Semua Sekolah</option>
                        {Array.from(
                          new Set(
                            students.map((s) => s.schoolName).filter(Boolean),
                          ),
                        )
                          .sort()
                          .map((school) => (
                            <option key={school} value={school}>
                              {school}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                      <Users className="w-4 h-4 text-slate-400" />
                      <select
                        value={tableClassFilter}
                        onChange={(e) => setTableClassFilter(e.target.value)}
                        className="bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700 pr-6 py-1 outline-none"
                      >
                        <option value="all">Semua Kelas</option>
                        {classes
                          .filter((c) => {
                            if (tableSchoolFilter === "all") return true;
                            // Only show classes that have at least one student from the selected school
                            return students.some(
                              (s) =>
                                s.schoolName === tableSchoolFilter &&
                                s.className === c.name,
                            );
                          })
                          .map((c) => (
                            <option key={c.id} value={c.name}>
                              {c.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {isSelectingHistory && selectedHistoryIds.length > 0 && (
                      <button
                        onClick={handleDeleteSelectedHistory}
                        className="px-4 py-2 bg-red-600 text-white rounded-xl font-bold text-xs hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                      >
                        HAPUS ({selectedHistoryIds.length})
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setIsSelectingHistory(!isSelectingHistory);
                        if (isSelectingHistory) setSelectedHistoryIds([]);
                      }}
                      className={cn(
                        "px-4 py-2 rounded-xl border font-bold text-xs transition-colors",
                        isSelectingHistory
                          ? "bg-slate-800 text-white border-slate-800"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50",
                      )}
                    >
                      {isSelectingHistory ? "BATAL" : "PILIH BANYAK"}
                    </button>
                    <span className="text-xs font-bold text-slate-500 bg-slate-200/50 px-3 py-1.5 rounded-lg">
                      {tableFilteredResults.length} hasil ditemukan
                    </span>
                  </div>
                </div>
              </div>
              <div
                className="overflow-x-auto"
                style={{ transform: "rotateX(180deg)" }}
              >
                <div style={{ transform: "rotateX(180deg)" }}>
                  <table className="w-full text-left">
                    <thead className="bg-white border-b border-slate-100 text-slate-500 text-[10px] uppercase tracking-widest font-black">
                      <tr>
                        {isSelectingHistory && (
                          <th className="px-6 py-4 w-10">
                            <input
                              type="checkbox"
                              checked={
                                selectedHistoryIds.length ===
                                  paginatedResults.length &&
                                paginatedResults.length > 0
                              }
                              onChange={toggleSelectAllHistory}
                              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-600 cursor-pointer"
                            />
                          </th>
                        )}
                        <th
                          className="px-6 py-4 cursor-pointer hover:bg-slate-50 transition-colors group"
                          onClick={() => toggleHistorySort("name")}
                        >
                          <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest">
                            Siswa
                            <ArrowUpDown
                              className={cn(
                                "w-3 h-3 transition-opacity",
                                historySortField === "name"
                                  ? "opacity-100 text-emerald-600"
                                  : "opacity-20 group-hover:opacity-100",
                              )}
                            />
                          </div>
                        </th>
                        <th
                          className="px-6 py-4 cursor-pointer hover:bg-slate-50 transition-colors group"
                          onClick={() => toggleHistorySort("school")}
                        >
                          <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-emerald-600">
                            Nama Sekolah
                            <ArrowUpDown className="w-3 h-3" />
                          </div>
                        </th>
                        <th
                          className="px-6 py-4 cursor-pointer hover:bg-slate-50 transition-colors group"
                          onClick={() => toggleHistorySort("class")}
                        >
                          <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest">
                            Kelas
                            <ArrowUpDown
                              className={cn(
                                "w-3 h-3 transition-opacity",
                                historySortField === "class"
                                  ? "opacity-100 text-emerald-600"
                                  : "opacity-20 group-hover:opacity-100",
                              )}
                            />
                          </div>
                        </th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                          GURU BK
                        </th>
                        <th
                          className="px-6 py-4 cursor-pointer hover:bg-slate-50 transition-colors group"
                          onClick={() => toggleHistorySort("type")}
                        >
                          <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest">
                            Jenis Tes
                            <ArrowUpDown
                              className={cn(
                                "w-3 h-3 transition-opacity",
                                historySortField === "type"
                                  ? "opacity-100 text-emerald-600"
                                  : "opacity-20 group-hover:opacity-100",
                              )}
                            />
                          </div>
                        </th>
                        <th
                          className="px-6 py-4 cursor-pointer hover:bg-slate-50 transition-colors group"
                          onClick={() => toggleHistorySort("date")}
                        >
                          <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest">
                            Tanggal
                            <ArrowUpDown
                              className={cn(
                                "w-3 h-3 transition-opacity",
                                historySortField === "date"
                                  ? "opacity-100 text-emerald-600"
                                  : "opacity-20 group-hover:opacity-100",
                              )}
                            />
                          </div>
                        </th>
                        <th className="px-6 py-4">Waktu</th>
                        <th className="px-6 py-4">Hasil Tes</th>
                        <th className="px-6 py-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {paginatedResults.map((r, i) => {
                        const student = students.find(
                          (s) =>
                            s.id === r.studentId ||
                            (s.name === r.studentName &&
                              s.className === r.studentClass),
                        );
                        return (
                          <tr
                            key={r.id || i}
                            className={cn(
                              "hover:bg-slate-50/80 transition-colors text-sm",
                              selectedHistoryIds.includes(r.id!)
                                ? "bg-emerald-50/50"
                                : "",
                            )}
                          >
                            {isSelectingHistory && (
                              <td className="px-6 py-4">
                                <input
                                  type="checkbox"
                                  checked={selectedHistoryIds.includes(r.id!)}
                                  onChange={() => toggleSelectHistory(r.id!)}
                                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-600 cursor-pointer"
                                />
                              </td>
                            )}
                            <td className="px-6 py-4 font-bold text-slate-900">
                              <button
                                onClick={() => setTestResult(r)}
                                className="hover:text-emerald-600 hover:underline text-left"
                              >
                                {r.studentName}
                              </button>
                            </td>
                            <td className="px-6 py-4 text-slate-600 font-medium">
                              {student?.schoolName || "-"}
                            </td>
                            <td className="px-6 py-4 text-slate-600 font-medium">
                              {r.studentClass || "-"}
                            </td>
                            <td className="px-6 py-4 text-slate-500 font-medium">
                              {allUsers.find(
                                (u) =>
                                  u.uid === r.teacherId || u.id === r.teacherId,
                              )?.name ||
                                (r.teacherId === user?.uid
                                  ? user?.name
                                  : "Administrator")}
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-black border border-emerald-100/50 tracking-wide">
                                {TESTS[r.testType]?.title || r.testType}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-500 font-medium">
                              {r.timestamp
                                ? new Date(
                                    r.timestamp.seconds * 1000,
                                  ).toLocaleDateString("id-ID")
                                : "-"}
                            </td>
                            <td className="px-6 py-4 text-slate-500 font-medium">
                              {r.timestamp
                                ? new Date(
                                    r.timestamp.seconds * 1000,
                                  ).toLocaleTimeString("id-ID", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "-"}
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
                                    const student = students.find(
                                      (s) =>
                                        s.id === r.studentId ||
                                        (s.name === r.studentName &&
                                          s.className === r.studentClass),
                                    );
                                    if (student) {
                                      setEditingStudent(student);
                                      setActiveTab("students");
                                    } else {
                                      showToast(
                                        "Data siswa tidak ditemukan.",
                                        "error",
                                      );
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
                                  <span className="font-bold text-[10px]">
                                    LIHAT
                                  </span>
                                </button>
                                <button
                                  onClick={() =>
                                    r.id &&
                                    setConfirmDelete({
                                      id: r.id,
                                      type: "result",
                                      title: "Hapus Hasil Tes",
                                      message: `Hapus hasil tes ${r.studentName}?`,
                                    })
                                  }
                                  className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1.5 border border-transparent hover:border-red-100"
                                  title="Hapus Hasil Tes"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {tableFilteredResults.length === 0 && (
                        <tr>
                          <td
                            colSpan={isSelectingHistory ? 10 : 9}
                            className="px-6 py-12 text-center text-slate-400 text-sm font-medium"
                          >
                            Tidak ada hasil yang cocok dengan filter.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  <PaginationControls
                    currentPage={currentPage}
                    totalPages={Math.ceil(
                      tableFilteredResults.length / itemsPerPage,
                    )}
                    onPageChange={setCurrentPage}
                    totalItems={tableFilteredResults.length}
                    itemsPerPage={itemsPerPage}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "students" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-black tracking-wide border border-emerald-100">
                      {students.length} SISWA TERDAFTAR
                    </span>
                  </div>
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
                    <Upload className="w-4 h-4" /> UPLOAD TEMPLATE
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      className="hidden"
                      onChange={handleUploadStudents}
                    />
                  </label>
                  <button
                    onClick={() =>
                      handlePrintLoginCards(
                        selectedStudentIds.length > 0
                          ? students.filter((s) =>
                              selectedStudentIds.includes(s.id!),
                            )
                          : filteredStudents,
                      )
                    }
                    className="px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl font-bold text-xs hover:bg-indigo-100 flex items-center gap-2 transition-colors"
                  >
                    <Contact className="w-4 h-4" /> CETAK KARTU LOGIN{" "}
                    {selectedStudentIds.length > 0 ? "(TERPILIH)" : ""}
                  </button>
                  <button
                    onClick={() =>
                      setConfirmDelete({
                        id: "all",
                        type: "all_students",
                        title: "Hapus Semua Siswa",
                        message:
                          "Apakah Anda yakin ingin menghapus SEMUA data siswa? Tindakan ini akan menghapus SEMUA hasil tes dan catatan konseling terkait. Tindakan ini tidak dapat dibatalkan.",
                      })
                    }
                    className="px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-xl font-bold text-xs hover:bg-red-100 flex items-center gap-2 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> HAPUS SEMUA
                  </button>
                  {selectedStudentIds.length > 0 && (
                    <button
                      onClick={() =>
                        setConfirmDelete({
                          id: "selected",
                          type: "all_selected_students",
                          title: "Hapus Siswa Terpilih",
                          message: `Apakah Anda yakin ingin menghapus ${selectedStudentIds.length} siswa yang dipilih? Tindakan ini akan menghapus SEMUA hasil tes dan catatan konseling terkait. Tindakan ini tidak dapat dibatalkan.`,
                        })
                      }
                      className="px-4 py-2 bg-red-600 text-white border border-red-700 rounded-xl font-bold text-xs hover:bg-red-700 flex items-center gap-2 transition-colors shadow-lg shadow-red-200"
                    >
                      <Trash2 className="w-4 h-4" /> HAPUS TERPILIH (
                      {selectedStudentIds.length})
                    </button>
                  )}
                </div>
              </div>

              {/* Class Summary Section */}
              <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <LayoutDashboard className="w-3 h-3" /> Ringkasan Siswa per
                  Kelas
                </h4>
                <div className="flex flex-wrap gap-2">
                  {classes.map((c) => (
                    <div
                      key={c.id}
                      className="bg-white px-3 py-2 rounded-xl border border-slate-200 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0">
                        <Users className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 leading-none mb-1 uppercase tracking-tighter">
                          {c.name}
                        </p>
                        <p className="text-xs font-bold text-slate-700 leading-none">
                          {studentsCountByClass[c.name] || 0} Siswa
                        </p>
                      </div>
                    </div>
                  ))}
                  {Object.entries(studentsCountByClass)
                    .filter(([cName]) => !classes.some((c) => c.name === cName))
                    .map(([cName, count]) => (
                      <div
                        key={cName}
                        className="bg-white px-3 py-2 rounded-xl border border-amber-200 flex items-center gap-3 shadow-sm"
                      >
                        <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center shrink-0">
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-amber-600 leading-none mb-1 uppercase tracking-tighter">
                            {cName}
                          </p>
                          <p className="text-xs font-bold text-slate-700 leading-none">
                            {count} Siswa
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {uploadSummary && (
                <div className="space-y-3">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                      "p-4 rounded-xl flex items-center gap-3 text-sm shadow-sm",
                      uploadSummary.success === uploadSummary.total
                        ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                        : "bg-amber-50 border border-amber-200 text-amber-800",
                    )}
                  >
                    {uploadSummary.success === uploadSummary.total ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                    )}
                    <span className="font-bold">
                      Selesai Impor: {uploadSummary.success} Berhasil,{" "}
                      {uploadSummary.total - uploadSummary.success} Gagal (Total{" "}
                      {uploadSummary.total} Baris).
                    </span>
                    <button
                      onClick={() => setUploadSummary(null)}
                      className="ml-auto text-[10px] font-black uppercase tracking-widest opacity-50 hover:opacity-100"
                    >
                      Tutup
                    </button>
                  </motion.div>

                  {importErrors.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="bg-rose-50 border border-rose-100 rounded-xl p-4 overflow-hidden"
                    >
                      <div className="flex items-center gap-2 text-rose-800 font-bold text-xs mb-3 uppercase tracking-wider">
                        <AlertCircle className="w-4 h-4" /> Detail Kesalahan
                        Impor ({importErrors.length})
                      </div>
                      <div className="max-h-32 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                        {importErrors.map((err, idx) => (
                          <div
                            key={idx}
                            className="text-[10px] font-medium text-rose-600 flex gap-2"
                          >
                            <span className="opacity-50">#</span> {err}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
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
                      <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none">
                        JUMLAH SISWA
                      </span>
                      <span className="text-sm font-bold text-emerald-600 leading-none mt-0.5">
                        {filteredStudents.length}
                      </span>
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
                    {classes.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={studentSchoolFilter}
                    onChange={(e) => setStudentSchoolFilter(e.target.value)}
                    className="w-full sm:w-48 px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-600 outline-none text-sm font-bold text-slate-700 bg-white"
                  >
                    <option value="all">Semua Sekolah</option>
                    {[
                      ...new Set(
                        students.map((s) => s.schoolName).filter(Boolean),
                      ),
                    ]
                      .sort()
                      .map((school) => (
                        <option key={school} value={school}>
                          {school}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="bg-emerald-50/30 p-5 rounded-2xl border border-emerald-100">
                <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-emerald-600" /> Tambah Siswa
                  Baru
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                  <input
                    type="text"
                    placeholder="NO"
                    value={newStudentNumber}
                    onChange={(e) => setNewStudentNumber(e.target.value)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm font-medium focus:ring-2 focus:ring-emerald-600"
                  />
                  <div className="relative group/pwd">
                    <input
                      type="text"
                      placeholder="Buat Password"
                      value={newStudentPassword}
                      onChange={(e) => {
                        const val = e.target.value.toUpperCase();
                        if (val === "" || /^[0-9A-Z]+$/.test(val)) {
                          setNewStudentPassword(val);
                        } else {
                          showToast(
                            "Password hanya boleh berisi angka dan huruf besar.",
                            "error",
                          );
                        }
                      }}
                      className="w-full px-4 py-2.5 pr-10 rounded-xl border border-slate-200 outline-none text-sm font-medium focus:ring-2 focus:ring-emerald-600"
                    />
                    <button
                      onClick={handleGeneratePassword}
                      title="Generate Password Otomatis"
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-emerald-600 transition-colors"
                    >
                      <RefreshCcw className="w-4 h-4" />
                    </button>
                  </div>
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
                  <input
                    type="text"
                    placeholder="NAMA SEKOLAH"
                    value={newStudentSchool}
                    onChange={(e) => setNewStudentSchool(e.target.value)}
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
                <div
                  className="overflow-x-auto min-w-[1000px]"
                  style={{ transform: "rotateX(180deg)" }}
                >
                  <div style={{ transform: "rotateX(180deg)" }}>
                    <table className="w-full text-left min-w-[1000px]">
                      <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200">
                        <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          <th className="px-6 py-4 w-12">
                            <input
                              type="checkbox"
                              checked={
                                filteredStudents.length > 0 &&
                                selectedStudentIds.length ===
                                  filteredStudents.length
                              }
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedStudentIds(
                                    filteredStudents
                                      .map((s) => s.id!)
                                      .filter(Boolean),
                                  );
                                } else {
                                  setSelectedStudentIds([]);
                                }
                              }}
                              className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                            />
                          </th>
                          <th className="px-6 py-4">No</th>
                          <th className="px-6 py-4">ID/ABSEN</th>
                          <th className="px-6 py-4">PASSWORD</th>
                          <th
                            className="px-6 py-4 cursor-pointer hover:bg-slate-100"
                            onClick={() => {
                              setSortStudentField("name");
                              setSortStudentOrder(
                                sortStudentField === "name" &&
                                  sortStudentOrder === "asc"
                                  ? "desc"
                                  : "asc",
                              );
                            }}
                          >
                            Nama Siswa{" "}
                            {sortStudentField === "name" &&
                              (sortStudentOrder === "asc" ? "▲" : "▼")}
                          </th>
                          <th
                            className="px-6 py-4 cursor-pointer hover:bg-slate-100"
                            onClick={() => {
                              setSortStudentField("className");
                              setSortStudentOrder(
                                sortStudentField === "className" &&
                                  sortStudentOrder === "asc"
                                  ? "desc"
                                  : "asc",
                              );
                            }}
                          >
                            Kelas{" "}
                            {sortStudentField === "className" &&
                              (sortStudentOrder === "asc" ? "▲" : "▼")}
                          </th>
                          <th
                            className="px-6 py-4 cursor-pointer hover:bg-slate-100"
                            onClick={() => {
                              setSortStudentField("schoolName");
                              setSortStudentOrder(
                                sortStudentField === "schoolName" &&
                                  sortStudentOrder === "asc"
                                  ? "desc"
                                  : "asc",
                              );
                            }}
                          >
                            Nama Sekolah{" "}
                            {sortStudentField === "schoolName" &&
                              (sortStudentOrder === "asc" ? "▲" : "▼")}
                          </th>
                          <th className="px-6 py-4 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {filteredStudents.length > 0 ? (
                          filteredStudents
                            .slice(
                              (currentPage - 1) * itemsPerPage,
                              currentPage * itemsPerPage,
                            )
                            .map((s, idx) => (
                              <tr
                                key={s.id || idx}
                                className={cn(
                                  "text-sm transition-colors",
                                  selectedStudentIds.includes(s.id!)
                                    ? "bg-emerald-50/30"
                                    : recentlyAddedIds.includes(s.id!)
                                      ? "bg-emerald-50/50"
                                      : "hover:bg-slate-50/80",
                                )}
                              >
                                <td className="px-6 py-4">
                                  <input
                                    type="checkbox"
                                    checked={selectedStudentIds.includes(s.id!)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedStudentIds((prev) => [
                                          ...prev,
                                          s.id!,
                                        ]);
                                      } else {
                                        setSelectedStudentIds((prev) =>
                                          prev.filter((id) => id !== s.id),
                                        );
                                      }
                                    }}
                                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                  />
                                </td>
                                {editingStudent?.id === s.id ? (
                                  <>
                                    <td className="px-6 py-3 text-xs font-bold text-slate-400 text-center">
                                      {(currentPage - 1) * itemsPerPage +
                                        idx +
                                        1}
                                    </td>
                                    <td className="px-6 py-3">
                                      <input
                                        type="text"
                                        value={editingStudent.number}
                                        onChange={(e) =>
                                          setEditingStudent({
                                            ...editingStudent,
                                            number: e.target.value,
                                          })
                                        }
                                        className="w-full px-3 py-1.5 rounded-lg border border-emerald-300 outline-none text-xs font-mono"
                                      />
                                    </td>
                                    <td className="px-6 py-3">
                                      <div className="relative group/pwd">
                                        <input
                                          type="text"
                                          value={editingStudent.password}
                                          onChange={(e) => {
                                            const val =
                                              e.target.value.toUpperCase();
                                            if (
                                              val === "" ||
                                              /^[0-9A-Z]+$/.test(val)
                                            ) {
                                              setEditingStudent({
                                                ...editingStudent,
                                                password: val,
                                              });
                                            }
                                          }}
                                          className="w-full px-3 py-1.5 pr-8 rounded-lg border border-emerald-300 outline-none text-xs font-mono"
                                        />
                                        <button
                                          onClick={() => {
                                            const chars =
                                              "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
                                            let result = "";
                                            for (let i = 0; i < 5; i++) {
                                              result += chars.charAt(
                                                Math.floor(
                                                  Math.random() * chars.length,
                                                ),
                                              );
                                            }
                                            setEditingStudent({
                                              ...editingStudent,
                                              password: result,
                                            });
                                          }}
                                          title="Generate Password Otomatis"
                                          className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-emerald-600 transition-colors"
                                        >
                                          <RefreshCcw className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </td>
                                    <td className="px-6 py-3">
                                      <input
                                        type="text"
                                        value={editingStudent.name}
                                        onChange={(e) =>
                                          setEditingStudent({
                                            ...editingStudent,
                                            name: e.target.value,
                                          })
                                        }
                                        className="w-full px-3 py-1.5 rounded-lg border border-emerald-300 outline-none text-sm font-bold"
                                      />
                                    </td>
                                    <td className="px-6 py-3">
                                      <select
                                        value={editingStudent.className}
                                        onChange={(e) =>
                                          setEditingStudent({
                                            ...editingStudent,
                                            className: e.target.value,
                                          })
                                        }
                                        className="w-full px-3 py-1.5 rounded-lg border border-emerald-300 outline-none text-sm font-bold"
                                      >
                                        {classes.map((c) => (
                                          <option key={c.id} value={c.name}>
                                            {c.name}
                                          </option>
                                        ))}
                                      </select>
                                    </td>
                                    <td className="px-6 py-3">
                                      <input
                                        type="text"
                                        value={editingStudent.schoolName || ""}
                                        onChange={(e) =>
                                          setEditingStudent({
                                            ...editingStudent,
                                            schoolName: e.target.value,
                                          })
                                        }
                                        className="w-full px-3 py-1.5 rounded-lg border border-emerald-300 outline-none text-sm font-bold"
                                      />
                                    </td>
                                    <td className="px-6 py-3 text-right">
                                      <div className="flex justify-end gap-2">
                                        <button
                                          onClick={handleUpdateStudent}
                                          className="text-emerald-600 hover:bg-emerald-50 p-2 rounded-lg transition-colors"
                                          title="Simpan"
                                        >
                                          <Save className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={() =>
                                            setEditingStudent(null)
                                          }
                                          className="text-slate-400 hover:bg-slate-100 p-2 rounded-lg transition-colors"
                                          title="Batal"
                                        >
                                          <X className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </td>
                                  </>
                                ) : (
                                  <>
                                    <td className="px-6 py-4 text-xs font-bold text-slate-400 text-center">
                                      {(currentPage - 1) * itemsPerPage +
                                        idx +
                                        1}
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs text-slate-500">
                                      {s.number}
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs text-slate-500">
                                      {s.password ||
                                        results.find(
                                          (r) =>
                                            (r.studentId === s.id ||
                                              (r.studentName === s.name &&
                                                r.studentClass ===
                                                  s.className)) &&
                                            r.studentPassword,
                                        )?.studentPassword ||
                                        "-"}
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-900">
                                          {s.name}
                                        </span>
                                        {recentlyAddedIds.includes(s.id!) && (
                                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase rounded-md tracking-wider">
                                            Baru
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 font-medium">
                                      {s.className}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 font-medium">
                                      {s.schoolName || "-"}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                      <div className="flex justify-end gap-2">
                                        <button
                                          onClick={() =>
                                            handlePrintLoginCards([s])
                                          }
                                          className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition-colors"
                                          title="Cetak Kartu Login"
                                        >
                                          <Contact className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={() =>
                                            setViewingStudentProfile(s)
                                          }
                                          className="text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 p-2 rounded-lg transition-colors"
                                          title="Profil & Analisis Tren"
                                        >
                                          <UserIcon className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={() => setEditingStudent(s)}
                                          className="text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 p-2 rounded-lg transition-colors"
                                          title="Edit Siswa"
                                        >
                                          <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={() =>
                                            setConfirmDelete({
                                              id: s.id!,
                                              type: "student",
                                              title: "Hapus Siswa",
                                              message: `Hapus data siswa ${s.name}?`,
                                            })
                                          }
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
                            <td
                              colSpan={4}
                              className="px-6 py-12 text-center text-slate-400 text-sm font-medium"
                            >
                              {studentSearch
                                ? "Tidak ada kecocokan."
                                : "Belum ada data siswa."}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                    <PaginationControls
                      currentPage={currentPage}
                      totalPages={Math.ceil(
                        filteredStudents.length / itemsPerPage,
                      )}
                      onPageChange={setCurrentPage}
                      totalItems={filteredStudents.length}
                      itemsPerPage={itemsPerPage}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "counseling" && (
            <CounselingDashboard
              students={students}
              counselingLogs={counselingLogs}
              onOpenProfile={(s) => setViewingStudentProfile(s)}
            />
          )}

          {activeTab === "teacher" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-3xl space-y-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                    Nama Guru BK
                  </label>
                  <input
                    type="text"
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-600 outline-none text-sm font-medium bg-slate-50 focus:bg-white transition-colors"
                    placeholder="Nama Lengkap & Gelar"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                    NIP
                  </label>
                  <input
                    type="text"
                    value={teacherNip}
                    onChange={(e) => setTeacherNip(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-600 outline-none text-sm font-medium bg-slate-50 focus:bg-white transition-colors"
                    placeholder="Nomor Induk Pegawai"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                    Nama Sekolah
                  </label>
                  <input
                    type="text"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-600 outline-none text-sm font-medium bg-slate-50 focus:bg-white transition-colors"
                    placeholder="Contoh: SMP Negeri 1 Jakarta"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                    Alamat Sekolah
                  </label>
                  <input
                    type="text"
                    value={schoolAddress}
                    onChange={(e) => setSchoolAddress(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-600 outline-none text-sm font-medium bg-slate-50 focus:bg-white transition-colors"
                    placeholder="Alamat lengkap sekolah"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                    Nama Pemda (Opsional)
                  </label>
                  <input
                    type="text"
                    value={pemdaName}
                    onChange={(e) => setPemdaName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-600 outline-none text-sm font-medium bg-slate-50 focus:bg-white transition-colors"
                    placeholder="Contoh: PEMERINTAH PROVINSI DKI JAKARTA"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                    Nama Dinas (Opsional)
                  </label>
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
                <p className="text-sm text-slate-500 mb-6 font-medium">
                  Ganti email akun admin Anda. Masukkan password untuk
                  melanjutkan.
                </p>

                {!showChangeAccountForm ? (
                  <div className="flex items-center gap-4 max-w-md">
                    <div className="relative flex-1">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={changeAccountPassword}
                        onChange={(e) =>
                          setChangeAccountPassword(e.target.value)
                        }
                        placeholder="Masukkan Password"
                        className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-600 outline-none text-sm font-medium bg-slate-50 focus:bg-white transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        if (changeAccountPassword === "@dutatama220469") {
                          setShowChangeAccountForm(true);
                          setChangeAccountPassword("");
                          setShowPassword(false);
                        } else {
                          showToast("Password salah!", "error");
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
                      <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                        Akun Lama
                      </label>
                      <input
                        type="text"
                        value={user.email}
                        disabled
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 text-sm font-medium cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                        Akun Baru
                      </label>
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
                            await updateDoc(doc(db, "users", user.uid), {
                              email: newAdminEmail,
                            });
                            showToast(
                              "Berhasil mengganti akun admin!",
                              "success",
                            );
                            setShowChangeAccountForm(false);
                            setNewAdminEmail("");
                          } catch (error: any) {
                            console.error(error);
                            if (error.code === "auth/requires-recent-login") {
                              showToast(
                                "Gagal: Silakan logout dan login kembali sebelum mengganti akun.",
                                "error",
                              );
                            } else {
                              showToast(
                                "Gagal mengganti akun. Pastikan format email benar.",
                                "error",
                              );
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
                          "GANTI"
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setShowChangeAccountForm(false);
                          setNewAdminEmail("");
                        }}
                        disabled={isChangingAccount}
                        className="flex-1 bg-white text-slate-700 border border-slate-200 px-4 py-3 rounded-xl font-bold hover:bg-slate-50 transition-all text-sm disabled:opacity-50"
                      >
                        BATAL
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-200 w-full text-center">
                  <h3 className="text-sm font-black text-slate-900 mb-2 flex items-center justify-center gap-2 uppercase tracking-wider">
                    <Info className="w-4 h-4 text-emerald-600" /> Pengembang
                    Aplikasi
                  </h3>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                    Aplikasi ini di desain & dikembangkan oleh:{" "}
                    <span className="font-bold text-slate-700">
                      W. Purnomo-SMPN 2 Magelang
                    </span>
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "backup-restore" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-3xl space-y-6"
            >
              <div>
                <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight">
                  Backup & Restore Data
                </h3>
                <p className="text-sm text-slate-500 font-medium">
                  Cadangkan atau pulihkan seluruh data aplikasi Anda.
                </p>
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                  <h3 className="text-lg font-black text-slate-900 mb-2 flex items-center gap-2 uppercase">
                    <Database className="w-5 h-5 text-emerald-600" />{" "}
                    Pengelolaan Database
                  </h3>
                  <p className="text-sm text-slate-500 mb-6 font-medium leading-relaxed">
                    Ekspor seluruh data aplikasi (Siswa, Hasil Tes, Catatan
                    Konseling, Pengaturan) ke dalam file JSON. Gunakan fitur ini
                    untuk mencadangkan data ke HDD atau Flashdisk Anda secara
                    berkala.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 flex flex-col justify-between">
                      <div>
                        <h4 className="font-black text-emerald-900 text-sm uppercase mb-2">
                          Cadangkan Data (Backup)
                        </h4>
                        <p className="text-xs text-emerald-700 mb-4 font-medium">
                          Download semua data sistem saat ini untuk disimpan
                          secara lokal.
                        </p>
                      </div>
                      <button
                        onClick={handleBackupData}
                        disabled={isBackingUp}
                        className="w-full py-3 bg-emerald-600 text-white rounded-xl font-black text-xs hover:bg-emerald-700 transition-all shadow-md shadow-emerald-200 flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50"
                      >
                        {isBackingUp ? (
                          <>Proses Backup...</>
                        ) : (
                          <>
                            <Download className="w-4 h-4" /> Backup Sekarang
                          </>
                        )}
                      </button>
                    </div>

                    <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 flex flex-col justify-between">
                      <div>
                        <h4 className="font-black text-amber-900 text-sm uppercase mb-2">
                          Pulihkan Data (Restore)
                        </h4>
                        <p className="text-xs text-amber-700 mb-4 font-medium">
                          Impor file backup (.json) untuk memulihkan data
                          sistem.
                        </p>
                      </div>
                      <label className="w-full py-3 bg-slate-800 text-white rounded-xl font-black text-xs hover:bg-slate-900 transition-all shadow-md shadow-slate-200 flex items-center justify-center gap-2 uppercase tracking-widest cursor-pointer text-center disabled:opacity-50">
                        {isRestoring ? (
                          <>Proses Restore...</>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" /> Pilih File Backup
                            <input
                              type="file"
                              accept=".json"
                              onChange={handleRestoreData}
                              className="hidden"
                              disabled={isRestoring}
                            />
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-black text-blue-900 uppercase">
                      Tips Keamanan
                    </p>
                    <p className="text-[10px] text-blue-700 font-medium leading-relaxed">
                      Lakukan backup data minimal seminggu sekali untuk
                      menghindari kehilangan data jika terjadi kendala pada
                      sistem cloud atau koneksi internet.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "interactive-report" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <InteractiveReport
                results={results}
                classes={classes}
                students={students}
                TESTS={TESTS}
              />
            </motion.div>
          )}

          {activeTab === "report" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Laporan Agregat:{" "}
                    {selectedClass === "all" ? "Semua Kelas" : selectedClass}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
                    {
                      filteredResults.filter(
                        (r) =>
                          filterType === "all" || r.testType === filterType,
                      ).length
                    }{" "}
                    Data Tersedia
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleDownloadClassReport}
                    className="px-3 py-2 bg-emerald-600 text-white rounded-xl font-bold text-[10px] hover:bg-emerald-700 flex items-center gap-2 transition-all shadow-lg shadow-emerald-900/20"
                  >
                    <Printer className="w-3.5 h-3.5" /> CETAK LAPORAN
                  </button>
                  <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-1.5 px-1.5">
                      <Filter className="w-3.5 h-3.5 text-slate-400" />
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="bg-transparent border-none focus:ring-0 text-xs font-bold text-slate-700 pr-5 py-0.5 outline-none"
                      >
                        <option value="all">Pilih Jenis Tes...</option>
                        {Object.keys(TESTS).map((type) => (
                          <option key={type} value={type}>
                            {TESTS[type as TestType].title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="w-px h-5 bg-slate-200"></div>
                    <div className="flex items-center gap-1.5 px-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="date"
                        value={reportStartDate}
                        onChange={(e) => setReportStartDate(e.target.value)}
                        className="bg-transparent border-none focus:ring-0 text-[10px] font-bold text-slate-700 py-0.5 outline-none"
                      />
                      <span className="text-slate-400">-</span>
                      <input
                        type="date"
                        value={reportEndDate}
                        onChange={(e) => setReportEndDate(e.target.value)}
                        className="bg-transparent border-none focus:ring-0 text-[10px] font-bold text-slate-700 py-0.5 outline-none"
                      />
                    </div>
                    <div className="w-px h-5 bg-slate-200"></div>
                    <div className="flex items-center gap-1.5 px-1.5">
                      <School className="w-3.5 h-3.5 text-slate-400" />
                      <select
                        value={selectedSchool}
                        onChange={(e) => {
                          setSelectedSchool(e.target.value);
                          setSelectedClass("all"); // Reset class when school changes
                        }}
                        className="bg-transparent border-none focus:ring-0 text-xs font-bold text-slate-700 pr-5 py-0.5 outline-none"
                      >
                        <option value="all">Semua Sekolah</option>
                        {Array.from(
                          new Set(
                            students.map((s) => s.schoolName).filter(Boolean),
                          ),
                        )
                          .sort()
                          .map((school) => (
                            <option key={school} value={school}>
                              {school}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div className="w-px h-5 bg-slate-200"></div>
                    <div className="flex items-center gap-1.5 px-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="bg-transparent border-none focus:ring-0 text-xs font-bold text-slate-700 pr-5 py-0.5 outline-none"
                      >
                        <option value="all">Semua Kelas</option>
                        {classes
                          .filter((c) => {
                            if (selectedSchool === "all") return true;
                            return students.some(
                              (s) =>
                                s.schoolName === selectedSchool &&
                                s.className === c.name,
                            );
                          })
                          .map((c) => (
                            <option key={c.id} value={c.name}>
                              {c.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {filterType === "all" ? (
                <div className="py-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                    <BarChart3 className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h4 className="text-lg font-black text-slate-800 mb-1">
                    Pilih Jenis Tes
                  </h4>
                  <p className="text-slate-500 text-xs font-medium max-w-xs mx-auto">
                    Silakan pilih jenis tes pada filter di atas untuk melihat
                    visualisasi data agregat kelas.
                  </p>
                </div>
              ) : filteredResults.filter((r) => r.testType === filterType)
                  .length === 0 ? (
                <div className="py-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                    <Info className="w-8 h-8 text-slate-300" />
                  </div>
                  <h4 className="text-lg font-black text-slate-700 mb-1">
                    Data Belum Tersedia
                  </h4>
                  <p className="text-slate-500 text-xs font-medium max-w-xs mx-auto">
                    Belum ada siswa dari kelas ini yang menyelesaikan tes{" "}
                    {TESTS[filterType as TestType]?.title || filterType}.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Quick Stats Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                        <Users className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          Partisipan
                        </p>
                        <h5 className="text-lg font-black text-slate-900">
                          {
                            filteredResults.filter(
                              (r) => r.testType === filterType,
                            ).length
                          }{" "}
                          Siswa
                        </h5>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                        <Trophy className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          Dominan
                        </p>
                        <h5 className="text-lg font-black text-slate-900 truncate max-w-[120px]">
                          {classChartData.length > 0
                            ? [...classChartData].sort(
                                (a, b) => b.value - a.value,
                              )[0].name
                            : "-"}
                        </h5>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                      <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center shrink-0">
                        <TrendingUp className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          Rata-rata Skor
                        </p>
                        <h5 className="text-lg font-black text-slate-900">
                          {classChartData.length > 0
                            ? (
                                classChartData.reduce(
                                  (acc, curr) => acc + curr.value,
                                  0,
                                ) / classChartData.length
                              ).toFixed(1)
                            : "0"}
                        </h5>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="font-black text-slate-800 text-base tracking-tight">
                          Rata-rata Skor per Kelas
                        </h4>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-slate-50 text-slate-500 font-bold uppercase">
                            <tr>
                              <th className="p-3">Nama Sekolah</th>
                              <th className="p-3">Kelas</th>
                              <th className="p-3">Rata-rata</th>
                              <th className="p-3">Rata-rata Kelas</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {classAverages &&
                              classAverages.map((c) => {
                                const avgValues = Object.values(c.averages);
                                const classCombinedAvg =
                                  avgValues.length > 0
                                    ? avgValues.reduce((a, b) => a + b, 0) /
                                      avgValues.length
                                    : 0;
                                return (
                                  <tr key={c.className}>
                                    <td className="p-3 text-slate-600 italic">
                                      {c.schoolName || "-"}
                                    </td>
                                    <td className="p-3 font-bold text-slate-800">
                                      {c.className}
                                    </td>
                                    <td className="p-3 font-mono text-slate-600">
                                      {(
                                        avgValues.reduce((a, b) => a + b, 0) /
                                        avgValues.length
                                      ).toFixed(1)}
                                    </td>
                                    <td className="p-3 font-mono font-bold text-indigo-700 bg-indigo-50/50">
                                      {classCombinedAvg.toFixed(1)}
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="font-black text-slate-800 text-base tracking-tight">
                          Distribusi Rata-rata Skor
                        </h4>
                        <div className="p-1.5 bg-slate-50 rounded-lg">
                          <BarChart3 className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                      </div>
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={classChartData}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              vertical={false}
                              stroke="#f1f5f9"
                            />
                            <XAxis
                              dataKey="name"
                              fontSize={9}
                              tick={{ fill: "#94a3b8", fontWeight: 600 }}
                              axisLine={false}
                              tickLine={false}
                              dy={8}
                            />
                            <YAxis
                              fontSize={9}
                              tick={{ fill: "#94a3b8", fontWeight: 600 }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <Tooltip
                              cursor={{ fill: "#f8fafc" }}
                              contentStyle={{
                                borderRadius: "12px",
                                border: "none",
                                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                                padding: "10px",
                                fontSize: "11px",
                              }}
                            />
                            <Bar
                              dataKey="value"
                              fill="#4f46e5"
                              radius={[6, 6, 0, 0]}
                              maxBarSize={40}
                            >
                              {classChartData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="font-black text-slate-800 text-base tracking-tight">
                          Profil Kemampuan (Radar)
                        </h4>
                        <div className="p-1.5 bg-slate-50 rounded-lg">
                          <Brain className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                      </div>
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart
                            cx="50%"
                            cy="50%"
                            outerRadius="70%"
                            data={classChartData}
                          >
                            <PolarGrid stroke="#e2e8f0" />
                            <PolarAngleAxis
                              dataKey="name"
                              fontSize={9}
                              tick={{ fill: "#64748b", fontWeight: 600 }}
                            />
                            <PolarRadiusAxis
                              angle={30}
                              domain={[0, 100]}
                              fontSize={8}
                            />
                            <RechartsRadar
                              name="Rata-rata Skor"
                              dataKey="value"
                              stroke="#4f46e5"
                              fill="#4f46e5"
                              fillOpacity={0.6}
                            />
                            <Tooltip
                              contentStyle={{
                                borderRadius: "12px",
                                border: "none",
                                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                                padding: "10px",
                                fontSize: "11px",
                              }}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Class Comparison Chart */}
                  {classComparisonData.length > 1 && (
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h4 className="font-black text-slate-800 text-base tracking-tight">
                            Perbandingan Performa Kelas
                          </h4>
                          <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                            Rata-rata skor keseluruhan untuk tes{" "}
                            {TESTS[filterType as TestType]?.title}
                          </p>
                        </div>
                        <div className="p-1.5 bg-emerald-50 rounded-lg">
                          <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
                        </div>
                      </div>
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={classComparisonData}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              vertical={false}
                              stroke="#f1f5f9"
                            />
                            <XAxis
                              dataKey="name"
                              fontSize={9}
                              tick={{ fill: "#64748b", fontWeight: 700 }}
                              axisLine={false}
                              tickLine={false}
                              dy={8}
                            />
                            <YAxis
                              fontSize={9}
                              tick={{ fill: "#94a3b8", fontWeight: 600 }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <Tooltip
                              cursor={{ fill: "#f8fafc" }}
                              contentStyle={{
                                borderRadius: "12px",
                                border: "none",
                                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                                padding: "10px",
                                fontSize: "11px",
                              }}
                            />
                            <Bar
                              dataKey="value"
                              fill="#10b981"
                              radius={[6, 6, 0, 0]}
                              maxBarSize={50}
                            >
                              {classComparisonData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={
                                    entry.value ===
                                    Math.max(
                                      ...classComparisonData.map(
                                        (d) => d.value,
                                      ),
                                    )
                                      ? "#059669"
                                      : "#10b981"
                                  }
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-100 flex justify-center">
                        <button
                          onClick={handleGenerateClassAnalysis}
                          disabled={isGeneratingClassAnalysis}
                          className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-lg shadow-emerald-100"
                        >
                          {isGeneratingClassAnalysis ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{
                                  repeat: Infinity,
                                  duration: 1,
                                  ease: "linear",
                                }}
                              >
                                <Brain className="w-3.5 h-3.5" />
                              </motion.div>
                              Menganalisis Tren...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5" />
                              ANALISIS AI: TREN KINERJA KELAS
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-xl">
                            <Sparkles className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="text-lg font-black">
                              Analisis Kelas Cerdas
                            </h4>
                            <p className="text-emerald-100 text-xs font-medium">
                              Wawasan mendalam berbasis AI untuk strategi
                              bimbingan.
                            </p>
                          </div>
                        </div>
                        {!classAnalysis && (
                          <button
                            onClick={handleGenerateClassAnalysis}
                            disabled={isGeneratingClassAnalysis}
                            className="w-full sm:w-auto px-6 py-3 bg-white text-emerald-600 rounded-xl text-xs font-black hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-900/20"
                          >
                            {isGeneratingClassAnalysis ? (
                              <>
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{
                                    repeat: Infinity,
                                    duration: 1,
                                    ease: "linear",
                                  }}
                                >
                                  <Brain className="w-4 h-4" />
                                </motion.div>
                                Menganalisis Data...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4" />
                                BUAT ANALISIS KELAS
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {isGeneratingClassAnalysis ? (
                      <PulseLoader text="AI sedang memproses tren data kelas..." />
                    ) : classAnalysis ? (
                      <div className="p-6 bg-slate-50/50">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm"
                        >
                          <div className="prose prose-emerald prose-sm max-w-none font-medium text-slate-700 leading-relaxed">
                            <ReactMarkdown>{classAnalysis}</ReactMarkdown>
                          </div>
                          <div className="mt-6 pt-6 border-t border-slate-100 flex justify-between items-center">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                              Analisis dihasilkan secara otomatis oleh Gemini AI
                            </p>
                            <button
                              onClick={() => setClassAnalysis("")}
                              className="text-[10px] font-bold text-emerald-600 hover:underline"
                            >
                              Reset Analisis
                            </button>
                          </div>
                        </motion.div>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "recap" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <TestRecap
                results={results}
                classes={classes}
                students={students}
                teacherSettings={teacherSettings}
                onEdit={(s) => {
                  setEditingStudent(s);
                  setActiveTab("students");
                }}
                onDelete={(s) =>
                  setConfirmDelete({
                    id: s.id || "",
                    type: "results_by_student",
                    title: "Hapus Semua Hasil Tes",
                    message: `Apakah Anda yakin ingin menghapus SEMUA hasil tes untuk ${s.name}?`,
                    extraData: { name: s.name, className: s.className },
                  })
                }
              />
            </motion.div>
          )}

          {activeTab === "recap-tamu" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <GuestRecap
                results={results}
                teacherSettings={teacherSettings}
                classes={classes}
                onEdit={(name) => {
                  showToast(
                    `Fitur edit data tamu (${name}) akan segera hadir.`,
                    "info",
                  );
                }}
                onDelete={(name) =>
                  setConfirmDelete({
                    id: name,
                    type: "results_by_guest",
                    title: "Hapus Semua Hasil Tes Peserta Umum",
                    message: `Apakah Anda yakin ingin menghapus SEMUA hasil tes untuk tamu ${name}?`,
                  })
                }
              />
            </motion.div>
          )}

          {activeTab === "manajemen-tamu" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ManajemenTamu
                users={allUsers}
                classes={classes}
                setEditingStudent={setEditingStudent}
                setConfirmDelete={setConfirmDelete}
                selectedGuestIds={selectedGuestIds}
                setSelectedGuestIds={setSelectedGuestIds}
              />
            </motion.div>
          )}

          {activeTab === "tamu" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Rekapitulasi Tamu */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
                  <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center shrink-0">
                    <Users className="w-7 h-7 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Total Peserta Umum
                    </p>
                    <h4 className="text-3xl font-black text-slate-900">
                      {
                        Array.from(
                          new Set(
                            results
                              .filter((r) => !isStudentResult(r))
                              .map((r) => r.studentName),
                          ),
                        ).length
                      }
                    </h4>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
                  <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center shrink-0">
                    <ClipboardCheck className="w-7 h-7 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Total Tes Peserta Umum
                    </p>
                    <h4 className="text-3xl font-black text-slate-900">
                      {results.filter((r) => !isStudentResult(r)).length}
                    </h4>
                  </div>
                </div>
              </div>

              {/* Riwayat Tamu */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex flex-wrap gap-3">
                      {selectedResultIds.length > 0 && (
                        <button
                          onClick={() =>
                            setConfirmDelete({
                              id: "selected_results_riwayat",
                              type: "all_selected_results",
                              title: "Hapus Hasil Tes Terpilih?",
                              message: `Apakah Anda yakin ingin menghapus ${selectedResultIds.length} hasil tes terpilih? Data yang dihapus tidak dapat dikembalikan.`,
                            })
                          }
                          className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-all font-bold text-xs shadow-lg shadow-rose-200 animate-in fade-in zoom-in duration-200 mr-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          HAPUS TERPILIH ({selectedResultIds.length})
                        </button>
                      )}
                      <button
                        onClick={() =>
                          setConfirmDelete({
                            id: "all_guests_riwayat",
                            type: "all_guests_comprehensive",
                            title: "Hapus SEMUA Riwayat Tes Umum?",
                            message:
                              "Apakah Anda yakin ingin menghapus SEMUA riwayat tes peserta umum? Tindakan ini tidak dapat dibatalkan.",
                          })
                        }
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-900 transition-all font-bold text-xs shadow-lg shadow-slate-200 mr-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        HAPUS SEMUA RIWAYAT
                      </button>
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
                          {Object.keys(TESTS).map((type) => (
                            <option key={type} value={type}>
                              {TESTS[type as TestType].title}
                            </option>
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
                      {filteredRiwayatTamuResults.length} hasil ditemukan
                    </span>
                  </div>
                </div>
                <div
                  className="overflow-x-auto"
                  style={{ transform: "rotateX(180deg)" }}
                >
                  <div style={{ transform: "rotateX(180deg)" }}>
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="p-4 text-center">
                            <input
                              type="checkbox"
                              checked={
                                filteredRiwayatTamuResults.length > 0 &&
                                selectedResultIds.length ===
                                  filteredRiwayatTamuResults.length
                              }
                              onChange={toggleSelectRiwayatAll}
                              className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600 cursor-pointer"
                            />
                          </th>
                          <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-wider text-center">
                            NO
                          </th>
                          <th
                            className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors group"
                            onClick={() => toggleTamuSort("date")}
                          >
                            <div className="flex items-center gap-1">
                              TANGGAL
                              <ArrowUpDown
                                className={cn(
                                  "w-3 h-3 transition-opacity",
                                  tamuSortField === "date"
                                    ? "opacity-100 text-emerald-600"
                                    : "opacity-20 group-hover:opacity-100",
                                )}
                              />
                            </div>
                          </th>
                          <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                            WAKTU
                          </th>
                          <th
                            className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors group"
                            onClick={() => toggleTamuSort("name")}
                          >
                            <div className="flex items-center gap-1">
                              NAMA SISWA
                              <ArrowUpDown
                                className={cn(
                                  "w-3 h-3 transition-opacity",
                                  tamuSortField === "name"
                                    ? "opacity-100 text-emerald-600"
                                    : "opacity-20 group-hover:opacity-100",
                                )}
                              />
                            </div>
                          </th>
                          <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                            JENJANG
                          </th>
                          <th
                            className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors group"
                            onClick={() => toggleTamuSort("school")}
                          >
                            <div className="flex items-center gap-1">
                              SEKOLAH/ALAMAT
                              <ArrowUpDown
                                className={cn(
                                  "w-3 h-3 transition-opacity",
                                  tamuSortField === "school"
                                    ? "opacity-100 text-emerald-600"
                                    : "opacity-20 group-hover:opacity-100",
                                )}
                              />
                            </div>
                          </th>
                          <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                            KELAS/UMUR
                          </th>
                          <th
                            className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors group"
                            onClick={() => toggleTamuSort("type")}
                          >
                            <div className="flex items-center gap-1">
                              JENIS TES
                              <ArrowUpDown
                                className={cn(
                                  "w-3 h-3 transition-opacity",
                                  tamuSortField === "type"
                                    ? "opacity-100 text-emerald-600"
                                    : "opacity-20 group-hover:opacity-100",
                                )}
                              />
                            </div>
                          </th>
                          <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                            HASIL/SKOR
                          </th>
                          <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-wider text-right">
                            AKSI
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredRiwayatTamuResults
                          .slice(
                            (currentPage - 1) * itemsPerPage,
                            currentPage * itemsPerPage,
                          )
                          .map((result, idx) => (
                            <tr
                              key={result.id}
                              className={`hover:bg-slate-50/80 transition-colors ${selectedResultIds.includes(result.id!) ? "bg-emerald-50/30" : ""}`}
                            >
                              <td className="p-4 text-center">
                                <input
                                  type="checkbox"
                                  checked={selectedResultIds.includes(
                                    result.id!,
                                  )}
                                  onChange={() =>
                                    toggleSelectRiwayat(result.id!)
                                  }
                                  className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600 cursor-pointer"
                                />
                              </td>
                              <td className="p-4 text-[10px] font-bold text-slate-500 text-center">
                                {(currentPage - 1) * itemsPerPage + idx + 1}
                              </td>
                              <td className="p-4 text-xs font-bold text-slate-600">
                                {result.timestamp?.seconds
                                  ? new Date(
                                      result.timestamp.seconds * 1000,
                                    ).toLocaleDateString("id-ID")
                                  : "-"}
                              </td>
                              <td className="p-4 text-xs font-medium text-slate-600">
                                {result.timestamp?.seconds
                                  ? new Date(
                                      result.timestamp.seconds * 1000,
                                    ).toLocaleTimeString("id-ID", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : "-"}
                              </td>
                              <td className="p-4">
                                <div className="font-bold text-slate-900 leading-tight">
                                  {result.studentName}
                                </div>
                                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                  {result.studentEmail || "-"}
                                </div>
                              </td>
                              <td className="p-4">
                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-[9px] font-black border border-emerald-100 uppercase tracking-tighter">
                                  {result.studentJenjang ||
                                    allUsers.find(
                                      (u) => u.uid === result.studentId,
                                    )?.jenjang ||
                                    "UMUM"}
                                </span>
                              </td>
                              <td className="p-4">
                                <div className="text-xs font-bold text-slate-700 leading-tight">
                                  {result.studentSchoolName ||
                                    result.studentPassword ||
                                    "-"}
                                </div>
                              </td>
                              <td className="p-4">
                                <span className="text-[9px] font-black text-slate-700 px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200 uppercase tracking-tighter">
                                  {result.studentClass || "-"}
                                </span>
                              </td>
                              <td className="p-4">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                  {TESTS[result.testType]?.title ||
                                    customTests.find(
                                      (ct) => ct.id === result.testType,
                                    )?.title ||
                                    result.testType}
                                </span>
                              </td>
                              <td className="p-4">
                                <div
                                  className="text-sm text-slate-600 line-clamp-2 max-w-xs"
                                  title={result.analysis}
                                >
                                  {result.analysis
                                    .replace(
                                      /Penjelasan lebih lanjut tentang hasil tes bisa dibaca pada lampiran surat keterangan ini\./g,
                                      "",
                                    )
                                    .trim()}
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
                                    <span className="font-bold text-[10px]">
                                      LIHAT
                                    </span>
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDownloadPDF(result, teacherSettings)
                                    }
                                    className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-1.5 border border-transparent hover:border-blue-100"
                                    title="Unduh Laporan"
                                  >
                                    <Download className="w-4 h-4" />
                                    <span className="font-bold text-[10px]">
                                      PDF
                                    </span>
                                  </button>
                                  <button
                                    onClick={() =>
                                      result.id &&
                                      setConfirmDelete({
                                        id: result.id,
                                        type: "result",
                                        title: "Hapus Hasil Tes?",
                                        message:
                                          "Data yang dihapus tidak dapat dikembalikan.",
                                      })
                                    }
                                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                    title="Hapus Hasil"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        {filteredRiwayatTamuResults.length === 0 && (
                          <tr>
                            <td
                              colSpan={9}
                              className="p-8 text-center text-slate-500 font-medium"
                            >
                              Belum ada data riwayat tes untuk tamu.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                    <div className="p-4 border-t border-slate-200">
                      <PaginationControls
                        currentPage={currentPage}
                        totalPages={Math.ceil(
                          filteredRiwayatTamuResults.length / itemsPerPage,
                        )}
                        onPageChange={setCurrentPage}
                        totalItems={filteredRiwayatTamuResults.length}
                        itemsPerPage={itemsPerPage}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "monitor" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <MonitorSiswa
                results={results}
                students={students}
                classes={classes}
                teacherSettings={teacherSettings}
                setTestResult={setTestResult}
                setEditingStudent={setEditingStudent}
                setConfirmDelete={setConfirmDelete}
              />
            </motion.div>
          )}

          {activeTab === "hasil-tes" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <HasilTesSummary
                results={results}
                students={students}
                classes={classes}
                teacherSettings={teacherSettings}
                onEdit={(s) => {
                  setEditingStudent(s);
                  setActiveTab("students");
                }}
                onDelete={(s) =>
                  setConfirmDelete({
                    id: s.id || "",
                    type: "results_by_student",
                    title: "Hapus Semua Hasil Tes",
                    message: `Apakah Anda yakin ingin menghapus SEMUA hasil tes untuk ${s.name}?`,
                    extraData: { name: s.name, className: s.className },
                  })
                }
              />
            </motion.div>
          )}

          {activeTab === "hasil-tes-tamu" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <HasilTesTamu
                results={results}
                classes={classes}
                users={allUsers}
                teacherSettings={teacherSettings}
                setConfirmDelete={setConfirmDelete}
                selectedGuestIds={selectedGuestIds}
                setSelectedGuestIds={setSelectedGuestIds}
                onDelete={(g) =>
                  setConfirmDelete({
                    id: g.uid || "",
                    type: "results_by_guest",
                    title: "Hapus Data Peserta & Riwayat",
                    message: `Apakah Anda yakin ingin menghapus data peserta ${g.name} beserta seluruh riwayat tes dan bimbingannya secara permanen?`,
                    extraData: { name: g.name, className: g.className },
                  })
                }
              />
            </motion.div>
          )}

          {activeTab === "report-individu-siswa" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <LaporanIndividuSiswa
                results={results}
                students={students}
                classes={classes}
                teacherSettings={teacherSettings}
                onEdit={(s) => {
                  setEditingStudent(s);
                  setActiveTab("students");
                }}
                onDelete={(s) =>
                  setConfirmDelete({
                    id: s.id || "",
                    type: "results_by_student",
                    title: "Hapus Semua Hasil Tes",
                    message: `Apakah Anda yakin ingin menghapus SEMUA hasil tes untuk ${s.name}?`,
                    extraData: { name: s.name, className: s.className },
                  })
                }
              />
            </motion.div>
          )}

          {activeTab === "report-individu-umum" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <LaporanIndividuUmum
                results={results}
                classes={classes}
                users={allUsers}
                teacherSettings={teacherSettings}
                selectedGuestIds={selectedGuestIds}
                setSelectedGuestIds={setSelectedGuestIds}
                setConfirmDelete={setConfirmDelete}
                onDelete={(g) =>
                  setConfirmDelete({
                    id: g.uid || "",
                    type: "results_by_guest",
                    title: "Hapus Semua Hasil Tes Peserta",
                    message: `Apakah Anda yakin ingin menghapus SEMUA hasil tes untuk ${g.name}?`,
                    extraData: { name: g.name, className: g.className },
                  })
                }
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
          onConfirm={async () => {
            if (confirmDelete.type === "student")
              await handleDeleteStudent(confirmDelete.id);
            else if (confirmDelete.type === "guest")
              await handleDeleteGuest(confirmDelete.id);
            else if (confirmDelete.type === "result")
              await handleDeleteResult(confirmDelete.id);
            else if (confirmDelete.type === "all_students")
              await handleDeleteAllStudents();
            else if (confirmDelete.type === "all_selected_students")
              await handleDeleteSelectedStudents();
            else if (confirmDelete.type === "results_by_student")
              await handleDeleteAllResultsForStudent(
                confirmDelete.id,
                confirmDelete.extraData.name,
                confirmDelete.extraData.className,
              );
            else if (confirmDelete.type === "results_by_guest")
              await handleDeleteAllResultsForGuest(
                confirmDelete.id,
                confirmDelete.extraData.name,
              );
            else if (confirmDelete.type === "results_by_selected_guests")
              await handleDeleteSelectedGuests();
            else if (confirmDelete.type === "all_selected_results")
              await handleDeleteSelectedResults();
            else if (confirmDelete.type === "all_selected_history_results")
              await handleDeleteSelectedHistoryResults();
            else if (confirmDelete.type === "all_guests_comprehensive")
              await handleDeleteAllGuestsResults();
            else if (confirmDelete.type === "user")
              await handleDeleteUser(confirmDelete.id);
            else if (confirmDelete.type === "counseling_log")
              await handleDeleteCounselingLog(confirmDelete.id);
          }}
        />
      )}

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">
                Edit Pengguna
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Nama
                </label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, name: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-600 outline-none text-sm font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, email: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-600 outline-none text-sm font-medium"
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                onClick={async () => {
                  try {
                    await updateDoc(doc(db, "users", editingUser.id), {
                      name: editingUser.name,
                      email: editingUser.email,
                    });
                    showToast("Data pengguna berhasil diperbarui.", "success");
                    setEditingUser(null);
                  } catch (error) {
                    handleFirestoreError(error, OperationType.UPDATE, "users");
                  }
                }}
                className="px-4 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors"
              >
                Simpan Perubahan
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Student Profile & Counseling Modal */}
      {viewingStudentProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Modal Header */}
            <div className="p-8 border-b border-slate-100 flex justify-between items-start bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center text-emerald-600 shadow-inner">
                  <UserIcon className="w-10 h-10" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                    {viewingStudentProfile.name}
                  </h2>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-black border border-emerald-100 uppercase tracking-wider">
                      Kelas {viewingStudentProfile.className}
                    </span>
                    <span className="text-slate-400 font-bold text-sm">
                      PASSWORD: {viewingStudentProfile.password || "-"}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setViewingStudentProfile(null);
                  setIsAddingLog(false);
                }}
                className="p-3 hover:bg-slate-100 rounded-2xl transition-colors text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Analytics & History */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Longitudinal Analysis */}
                  <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-lg font-black text-slate-900 flex items-center gap-3 uppercase tracking-tight">
                        <TrendingUp className="w-5 h-5 text-emerald-600" />{" "}
                        Analisis Tren & Longitudinal
                      </h3>
                    </div>

                    <div className="h-64 w-full">
                      {results.filter(
                        (r) => r.studentId === viewingStudentProfile.id,
                      ).length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={results
                              .filter(
                                (r) => r.studentId === viewingStudentProfile.id,
                              )
                              .sort(
                                (a, b) =>
                                  (a.timestamp?.seconds || 0) -
                                  (b.timestamp?.seconds || 0),
                              )
                              .map((r) => ({
                                date: new Date(
                                  r.timestamp?.seconds * 1000,
                                ).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                }),
                                score:
                                  (Object.values(r.scores).reduce(
                                    (a, b) => (a as number) + (b as number),
                                    0,
                                  ) as number) /
                                  (Object.values(r.scores).length || 1),
                                test: TESTS[r.testType]?.title || r.testType,
                              }))}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              vertical={false}
                              stroke="#f1f5f9"
                            />
                            <XAxis
                              dataKey="date"
                              fontSize={10}
                              tick={{ fill: "#94a3b8", fontWeight: 600 }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <YAxis
                              fontSize={10}
                              tick={{ fill: "#94a3b8", fontWeight: 600 }}
                              axisLine={false}
                              tickLine={false}
                              domain={[0, 100]}
                            />
                            <Tooltip
                              contentStyle={{
                                borderRadius: "16px",
                                border: "none",
                                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                                padding: "12px",
                              }}
                              labelStyle={{
                                fontWeight: "black",
                                color: "#1e293b",
                                marginBottom: "4px",
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey="score"
                              stroke="#10b981"
                              strokeWidth={4}
                              dot={{
                                r: 6,
                                fill: "#10b981",
                                strokeWidth: 3,
                                stroke: "#fff",
                              }}
                              activeDot={{ r: 8, strokeWidth: 0 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                          <BarChart3 className="w-10 h-10 mb-2 opacity-20" />
                          <p className="text-sm font-bold">
                            Belum ada data tes untuk dianalisis
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Multiple Intelligences Profile Card */}
                  {(() => {
                    const miResult = results
                      .filter(
                        (r) =>
                          r.studentId === viewingStudentProfile.id &&
                          r.testType === "multiple_intelligences",
                      )
                      .sort(
                        (a, b) =>
                          (b.timestamp?.seconds || 0) -
                          (a.timestamp?.seconds || 0),
                      )[0];

                    if (!miResult) return null;

                    const miData = Object.entries(miResult.scores).map(
                      ([name, value]) => {
                        const indonesianMap: Record<string, string> = {
                          linguistic: "Linguistik",
                          logical: "Logika",
                          spatial: "Spasial",
                          musical: "Musikal",
                          kinesthetic: "Kinestetik",
                          interpersonal: "Interpersonal",
                          intrapersonal: "Intrapersonal",
                          naturalist: "Naturalis",
                        };
                        return {
                          name:
                            indonesianMap[name] ||
                            name.charAt(0).toUpperCase() + name.slice(1),
                          value: Number(value),
                        };
                      },
                    );

                    return (
                      <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between mb-8">
                          <h3 className="text-lg font-black text-slate-900 flex items-center gap-3 uppercase tracking-tight">
                            <RadarIcon className="w-5 h-5 text-emerald-600" />{" "}
                            Profil Kecerdasan Majemuk
                          </h3>
                        </div>

                        <div className="h-80 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart
                              cx="50%"
                              cy="50%"
                              outerRadius="70%"
                              data={miData}
                            >
                              <PolarGrid stroke="#e2e8f0" />
                              <PolarAngleAxis
                                dataKey="name"
                                fontSize={10}
                                tick={{ fill: "#64748b", fontWeight: "bold" }}
                              />
                              <PolarRadiusAxis
                                fontSize={10}
                                angle={30}
                                tick={{ fill: "#94a3b8" }}
                                domain={[0, 4]}
                              />
                              <RechartsRadar
                                name="Skor"
                                dataKey="value"
                                stroke="#10b981"
                                fill="#10b981"
                                fillOpacity={0.4}
                                animationDuration={1500}
                              />
                              <Tooltip
                                contentStyle={{
                                  borderRadius: "16px",
                                  border: "none",
                                  boxShadow:
                                    "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                                  padding: "12px",
                                }}
                                labelStyle={{
                                  fontWeight: "black",
                                  color: "#1e293b",
                                  marginBottom: "4px",
                                }}
                              />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Test History */}
                  <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3 uppercase tracking-tight">
                      <History className="w-5 h-5 text-emerald-600" /> Riwayat
                      Tes Lengkap
                    </h3>
                    <div className="space-y-4">
                      {results
                        .filter((r) => r.studentId === viewingStudentProfile.id)
                        .sort(
                          (a, b) =>
                            (b.timestamp?.seconds || 0) -
                            (a.timestamp?.seconds || 0),
                        )
                        .map((result) => (
                          <div
                            key={result.id}
                            className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-all group"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                                <FileText className="w-6 h-6" />
                              </div>
                              <div>
                                <p className="font-black text-slate-900 text-sm">
                                  {TESTS[result.testType]?.title ||
                                    result.testType}
                                </p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                  {new Date(
                                    result.timestamp?.seconds * 1000,
                                  ).toLocaleDateString("id-ID", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                  })}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => setTestResult(result)}
                                className="px-4 py-2 bg-white text-emerald-600 rounded-xl text-[10px] font-black hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100 shadow-sm"
                              >
                                LIHAT DETAIL
                              </button>
                            </div>
                          </div>
                        ))}
                      {results.filter(
                        (r) => r.studentId === viewingStudentProfile.id,
                      ).length === 0 && (
                        <p className="text-center py-8 text-slate-400 font-medium text-sm italic">
                          Belum ada riwayat tes.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Counseling Logs */}
                <div className="space-y-8">
                  <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm h-full flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-black text-slate-900 flex items-center gap-3 uppercase tracking-tight">
                        <MessageSquare className="w-5 h-5 text-emerald-600" />{" "}
                        Catatan Konseling
                      </h3>
                      <button
                        onClick={() => setIsAddingLog(true)}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20 flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-wider">
                          Tambah Catatan
                        </span>
                      </button>
                    </div>

                    {isAddingLog && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 p-6 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-4"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-xs font-black text-emerald-800 uppercase tracking-widest">
                            Sesi Konseling Baru
                          </h4>
                          <button
                            onClick={() => setIsAddingLog(false)}
                            className="text-emerald-400 hover:text-emerald-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <input
                          type="date"
                          value={newLogDate}
                          onChange={(e) => setNewLogDate(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-emerald-200 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Topik Pembahasan"
                          value={newLogTopic}
                          onChange={(e) => setNewLogTopic(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-emerald-200 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                        <textarea
                          placeholder="Catatan Konseling..."
                          value={newLogNotes}
                          onChange={(e) => setNewLogNotes(e.target.value)}
                          rows={3}
                          className="w-full px-4 py-2.5 rounded-xl border border-emerald-200 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                        />
                        <div className="flex items-center gap-4">
                          <select
                            value={newLogStatus}
                            onChange={(e) =>
                              setNewLogStatus(e.target.value as any)
                            }
                            className="flex-1 px-4 py-2.5 rounded-xl border border-emerald-200 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                          >
                            <option value="pending">Belum Selesai</option>
                            <option value="in-progress">Dalam Proses</option>
                            <option value="completed">Selesai</option>
                          </select>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={newLogIsPrivate}
                              onChange={(e) =>
                                setNewLogIsPrivate(e.target.checked)
                              }
                              className="w-4 h-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider">
                              Privat
                            </span>
                          </label>
                        </div>
                        <button
                          onClick={handleSaveCounselingLog}
                          className="w-full py-3 bg-emerald-600 text-white rounded-xl font-black text-xs hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20"
                        >
                          SIMPAN CATATAN
                        </button>
                      </motion.div>
                    )}

                    <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                      {counselingLogs
                        .filter(
                          (log) => log.studentId === viewingStudentProfile.id,
                        )
                        .sort(
                          (a, b) =>
                            (b.timestamp?.seconds || 0) -
                            (a.timestamp?.seconds || 0),
                        )
                        .map((log) => (
                          <div
                            key={log.id}
                            className="p-5 bg-slate-50 rounded-2xl border border-slate-100 relative group"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {new Date(log.date).toLocaleDateString(
                                  "id-ID",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )}
                              </span>
                              <div className="flex items-center gap-2">
                                {log.isPrivate && (
                                  <Lock className="w-3 h-3 text-amber-500" />
                                )}
                                <span
                                  className={cn(
                                    "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter",
                                    log.interventionStatus === "completed"
                                      ? "bg-emerald-100 text-emerald-700"
                                      : log.interventionStatus === "in-progress"
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-slate-200 text-slate-600",
                                  )}
                                >
                                  {log.interventionStatus === "completed"
                                    ? "Selesai"
                                    : log.interventionStatus === "in-progress"
                                      ? "Proses"
                                      : "Pending"}
                                </span>
                              </div>
                            </div>
                            <h4 className="font-black text-slate-900 text-sm mb-2">
                              {log.topic}
                            </h4>
                            <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                              {log.notes}
                            </p>

                            <button
                              onClick={() =>
                                setConfirmDelete({
                                  id: log.id!,
                                  type: "counseling_log",
                                  title: "Hapus Catatan Konseling?",
                                  message:
                                    "Apakah Anda yakin ingin menghapus catatan konseling ini? Data yang dihapus tidak dapat dikembalikan.",
                                })
                              }
                              className="absolute top-4 right-4 p-1.5 text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all font-bold"
                              title="Hapus Catatan"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      {counselingLogs.filter(
                        (log) => log.studentId === viewingStudentProfile.id,
                      ).length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-300">
                          <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
                          <p className="text-xs font-bold uppercase tracking-widest">
                            Belum ada catatan
                          </p>
                        </div>
                      )}
                    </div>
                    {counselingLogs.filter(
                      (log) => log.studentId === viewingStudentProfile.id,
                    ).length > 0 && (
                      <button
                        onClick={() => setShowCounselingHistory(true)}
                        className="w-full mt-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group border border-slate-800 shadow-lg shadow-slate-900/10"
                      >
                        <History className="w-4 h-4 group-hover:rotate-[-45deg] transition-transform" />
                        Lihat Riwayat Konseling Lengkap
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Full Counseling History Modal */}
      {showCounselingHistory && viewingStudentProfile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowCounselingHistory(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] w-full max-w-5xl max-h-[90vh] shadow-2xl relative z-10 flex flex-col overflow-hidden border border-slate-100"
          >
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner">
                  <History className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-2">
                    Riwayat Konseling Lengkap
                  </h3>
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
                    {viewingStudentProfile.name} •{" "}
                    {viewingStudentProfile.className}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCounselingHistory(false)}
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all border border-slate-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-8 bg-slate-50/30">
              <div className="grid grid-cols-1 gap-6">
                <table className="w-full border-separate border-spacing-y-4">
                  <thead>
                    <tr className="text-left">
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Tanggal
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Topik
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Status
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                        Privasi
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Catatan
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {counselingLogs
                      .filter(
                        (log) => log.studentId === viewingStudentProfile.id,
                      )
                      .sort(
                        (a, b) =>
                          (b.timestamp?.seconds || 0) -
                          (a.timestamp?.seconds || 0),
                      )
                      .map((log) => (
                        <tr
                          key={log.id}
                          className="group bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-emerald-200 transition-all"
                        >
                          <td className="px-6 py-6 rounded-l-2xl whitespace-nowrap">
                            <span className="text-sm font-bold text-slate-900 border-l-4 border-emerald-500 pl-3">
                              {new Date(log.date).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </span>
                          </td>
                          <td className="px-6 py-6">
                            <span className="text-sm font-black text-slate-900">
                              {log.topic}
                            </span>
                          </td>
                          <td className="px-6 py-6">
                            <span
                              className={cn(
                                "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider block w-fit",
                                log.interventionStatus === "completed"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : log.interventionStatus === "in-progress"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-slate-200 text-slate-600",
                              )}
                            >
                              {log.interventionStatus === "completed"
                                ? "Selesai"
                                : log.interventionStatus === "in-progress"
                                  ? "Proses"
                                  : "Pending"}
                            </span>
                          </td>
                          <td className="px-6 py-6 text-center">
                            {log.isPrivate ? (
                              <div
                                className="flex justify-center"
                                title="Hanya Guru/Admin"
                              >
                                <Lock className="w-4 h-4 text-amber-500" />
                              </div>
                            ) : (
                              <div
                                className="flex justify-center"
                                title="Publik"
                              >
                                <Users className="w-4 h-4 text-slate-300" />
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-6 rounded-r-2xl max-w-md">
                            <p className="text-sm text-slate-600 leading-relaxed italic">
                              "{log.notes}"
                            </p>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-8 bg-white border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3 text-slate-400">
                <Info className="w-5 h-5" />
                <p className="text-xs font-bold leading-tight">
                  Total:{" "}
                  {
                    counselingLogs.filter(
                      (log) => log.studentId === viewingStudentProfile.id,
                    ).length
                  }{" "}
                  Catatan Konseling
                </p>
              </div>
              <button
                onClick={() => window.print()}
                className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-900/10"
              >
                <Printer className="w-4 h-4" />
                Cetak Riwayat
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

const TeacherGuide = ({ onBack }: { onBack: () => void }) => (
  <div className="max-w-4xl mx-auto py-8 px-4 space-y-12">
    <button
      onClick={onBack}
      className="flex items-center text-slate-500 mb-8 hover:text-slate-900"
    >
      <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Dashboard
    </button>

    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
      <div className="bg-emerald-600 p-12 text-white">
        <h2 className="text-3xl font-bold mb-4">
          Panduan Penggunaan Dashboard Guru
        </h2>
        <p className="text-emerald-100">
          Pelajari cara mengelola kelas, memantau progres siswa, dan
          menginterpretasi hasil tes.
        </p>
      </div>

      <div className="p-8 sm:p-12 space-y-10">
        <section>
          <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-emerald-600" /> 1.
            Menggunakan Dashboard Admin
          </h3>
          <div className="prose prose-emerald text-slate-600">
            <p>
              Dashboard Admin memberikan gambaran umum tentang aktivitas tes di
              sekolah Anda. Anda dapat:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Melihat <strong>Statistik Cepat</strong>: Jumlah total siswa
                yang terdaftar dan jumlah tes yang telah diselesaikan.
              </li>
              <li>
                Memantau <strong>Distribusi Tes</strong>: Grafik batang yang
                menunjukkan jenis tes mana yang paling sering diambil oleh
                siswa.
              </li>
              <li>
                Melihat <strong>Riwayat Tes Terbaru</strong>: Daftar kronologis
                siswa yang baru saja menyelesaikan tes.
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-600" /> 2.
            Menginterpretasi Hasil Siswa
          </h3>
          <div className="prose prose-emerald text-slate-600">
            <p>Setiap tes memiliki cara interpretasi yang berbeda:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Gaya Belajar</strong>: Fokus pada skor tertinggi
                (Visual, Auditori, atau Kinestetik) untuk menyesuaikan metode
                mengajar di kelas.
              </li>
              <li>
                <strong>Kecerdasan Majemuk</strong>: Membantu mengidentifikasi
                kekuatan unik siswa (misal: Logika-Matematika vs Linguistik).
              </li>
              <li>
                <strong>Tes Kecemasan</strong>: Perhatikan skor tinggi. Siswa
                dengan skor kecemasan tinggi memerlukan perhatian lebih atau
                rujukan ke konselor.
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" /> 3. Manajemen Kelas &
            Laporan
          </h3>
          <div className="prose prose-emerald text-slate-600">
            <p>Untuk pelaporan yang efektif:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Gunakan <strong>Filter Kelas</strong> di bagian atas dashboard
                untuk melihat data spesifik per kelas.
              </li>
              <li>
                Klik <strong>"Lihat Detail"</strong> pada tabel riwayat untuk
                melihat laporan individu lengkap siswa.
              </li>
              <li>
                Gunakan fitur <strong>Cetak Laporan</strong> pada halaman detail
                hasil untuk mendapatkan dokumen fisik atau PDF yang bisa
                dibagikan kepada orang tua.
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-emerald-600" /> 4. Cara Login
            bagi siswa (usia dibawah 18 tahun)
          </h3>
          <div className="prose prose-emerald text-slate-600">
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Login sebagai tamu (jangan login menggunakan akun belajar.id
                atau akun pribadi jika usia belum 18 tahun)
              </li>
              <li>
                Masukkan link :{" "}
                <span className="font-bold text-emerald-600">
                  https://bit.ly/Psikotest_v_1
                </span>
              </li>
              <li>
                Muncul Notifikasi Pengalihan: Halaman sebelumnya berusaha untuk
                mengarahkan Anda ke{" "}
                <span className="text-xs bg-slate-100 px-1">
                  https://ais-pre-442whtbiqchwwuwgg6aaue-10864217327.asia-southeast1.run.app
                </span>
              </li>
              <li>
                Pilih / klik alamat :{" "}
                <span className="font-bold text-emerald-600">
                  https://ais-pre-442whtbiqchwwuwgg6aaue-10864217327.asia-southeast1.run.app
                </span>
              </li>
              <li>Muncul Menu Login</li>
              <li>
                Pilih tombol : <strong>Masuk tanpa akun Google</strong>
              </li>
            </ul>
            <p className="mt-4 text-sm italic bg-slate-50 p-3 rounded-lg border border-slate-200">
              <strong>Catatan :</strong> Untuk akun dengan usia di atas 18 tahun
              bisa menggunakan tombol yang lain.
            </p>
          </div>
        </section>

        <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
          <h4 className="font-bold text-emerald-900 mb-2">
            Tips Progres Siswa:
          </h4>
          <p className="text-sm text-emerald-700">
            Lakukan evaluasi berkala (misal: setiap semester) untuk melihat
            perubahan minat atau tingkat kecemasan siswa seiring dengan
            perkembangan akademik mereka.
          </p>
        </div>
      </div>
    </div>
  </div>
);

// --- Main App ---

const IdentityForm = ({
  classes,
  students,
  onSave,
  onLogout,
  initialStep = "initial",
}: {
  classes: ClassInfo[];
  students: StudentData[];
  onSave: (data: {
    name: string;
    className: string;
    password?: string;
    schoolName?: string;
    jenjang?: string;
  }) => void;
  onLogout: () => void;
  initialStep?: "initial" | "registered" | "studentCard" | "guest";
}) => {
  const [step, setStep] = useState<
    "initial" | "registered" | "studentCard" | "guest"
  >(initialStep);
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [foundStudent, setFoundStudent] = useState<StudentData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [guestName, setGuestName] = useState("");
  const [guestJenjang, setGuestJenjang] = useState("");
  const [guestAsal, setGuestAsal] = useState("");
  const [guestKelas, setGuestKelas] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleCheckPassword = async () => {
    const trimmedInput = passwordInput.trim().toUpperCase();
    if (!trimmedInput) return;

    setIsLoading(true);
    try {
      // First try local students list
      let student = students.find(
        (s) => s.password?.trim().toUpperCase() === trimmedInput,
      );

      // If not found (could be due to sync lag or not loaded yet for this user), check Firestore directly
      if (!student) {
        const q = query(
          collection(db, "students"),
          where("password", "==", trimmedInput),
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          student = {
            id: snap.docs[0].id,
            ...snap.docs[0].data(),
          } as StudentData;
        }
      }

      if (student) {
        setFoundStudent(student);
        setStep("studentCard");
        setErrorMsg("");
      } else {
        setErrorMsg(
          'Anda tidak terdaftar, apabila ingin mengikuti tes ini silahkan pilih tombol "UMUM"',
        );
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Terjadi kesalahan saat memeriksa password.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestSubmit = async () => {
    const newErrors: Record<string, string> = {};
    if (!guestName.trim()) newErrors.name = "Nama lengkap wajib diisi.";
    if (!guestJenjang) newErrors.jenjang = "Silakan pilih jenjang pendidikan.";
    if (!guestAsal.trim())
      newErrors.asal = "Asal sekolah atau alamat wajib diisi.";
    if (!guestKelas.trim()) newErrors.kelas = "Kelas atau umur wajib diisi.";

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      setErrorMsg("Mohon lengkapi seluruh data yang diperlukan.");
      return;
    }

    setIsLoading(true);
    setFormErrors({});
    setErrorMsg("");
    try {
      await onSave({
        name: guestName.trim(),
        className: guestKelas.trim() || guestJenjang,
        password: guestAsal.trim(),
        schoolName: guestAsal.trim(),
        jenjang: guestJenjang,
      });
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
  };

  const handleStudentSubmit = async () => {
    if (foundStudent) {
      setIsLoading(true);
      setErrorMsg("");
      try {
        await onSave({
          name: foundStudent.name,
          className: foundStudent.className,
          password: foundStudent.password,
        });
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

        {step === "initial" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-slate-900">Menu Login</h2>
            <p className="text-slate-500 text-sm">
              Silakan pilih kategori peserta tes:
            </p>

            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => setStep("registered")}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-3"
              >
                <GraduationCap className="w-5 h-5" /> SISWA TERDAFTAR
              </button>
              <button
                onClick={() => setStep("guest")}
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
                <span className="font-bold">Petunjuk :</span> Siswa yang
                terdaftar sebagai siswa bimbingan, silahkan pilih tombol{" "}
                <span className="font-bold">SISWA TERDAFTAR</span> (Login dengan
                menggunakan Password). Apabila belum terdaftar silahkan hubungi
                guru BK, bagi peserta tes yang lain silahkan pilih tombol{" "}
                <span className="font-bold">UMUM</span>.
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <p className="text-[11px] text-blue-800 leading-relaxed">
                <span className="font-bold">Info:</span> Gunakan tombol "MASUK
                TANPA AKUN GOOGLE" jika gagal masuk melalui tombol ketiga di
                atas.
              </p>
              <p className="text-[11px] text-blue-800 leading-relaxed mt-2">
                <span className="font-bold">Refresh:</span> Refresh aplikasi
                apabila layar blank atau gagal login, tombol berupa tanda panah
                melingkar berada di kiri atas layar.
              </p>
            </div>
          </div>
        )}

        {step === "registered" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-slate-900">Login Siswa</h2>
            <p className="text-slate-500 text-sm">
              Masukkan Password Anda (apabila belum punya, tanyakan guru BK
              anda)
            </p>

            <div className="relative">
              <label className="block text-sm font-bold text-slate-700 mb-2">
                PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordInput}
                  onChange={(e) =>
                    setPasswordInput(e.target.value.toUpperCase())
                  }
                  placeholder="Masukkan Password"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-emerald-600 focus:outline-none transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-emerald-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                <p className="text-xs text-red-600 font-medium leading-relaxed">
                  {errorMsg}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={handleCheckPassword}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
              >
                OK
              </button>
              <button
                onClick={() => {
                  setStep("initial");
                  setErrorMsg("");
                  setPasswordInput("");
                }}
                className="w-full bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> KEMBALI
              </button>
            </div>
          </div>
        )}

        {step === "studentCard" && foundStudent && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-slate-900">
              Kartu Identitas
            </h2>

            <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                    Nama Siswa
                  </p>
                  <p className="text-lg font-black text-slate-900">
                    {foundStudent.name}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                    Kelas
                  </p>
                  <p className="text-base font-bold text-slate-800">
                    {foundStudent.className}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                    Nama Sekolah
                  </p>
                  <p className="text-base font-bold text-slate-800">
                    {foundStudent.schoolName || "-"}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                    PASSWORD
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-base font-bold text-slate-800">
                      {showPassword ? foundStudent.password : "●●●●●●●●●●"}
                    </p>
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-emerald-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-xs text-red-600 font-medium leading-relaxed">
                  {errorMsg}
                </p>
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
                      transition={{
                        repeat: Infinity,
                        duration: 1,
                        ease: "linear",
                      }}
                    >
                      <Loader2 className="w-5 h-5" />
                    </motion.div>
                    MEMULAI...
                  </div>
                ) : (
                  "MULAI TES"
                )}
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

        {step === "guest" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Pendaftaran Peserta
            </h2>
            <p className="text-slate-500 text-sm font-medium">
              Lengkapi data diri untuk memulai tes psikologi sebagai peserta
              umum.
            </p>

            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <UserIcon
                    className={cn(
                      "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors",
                      formErrors.name ? "text-red-400" : "text-slate-400",
                    )}
                  />
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => {
                      setGuestName(e.target.value);
                      if (formErrors.name)
                        setFormErrors((prev) => ({ ...prev, name: "" }));
                    }}
                    placeholder="Contoh: Budi Santoso"
                    className={cn(
                      "w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 transition-all outline-none text-sm font-bold",
                      formErrors.name
                        ? "border-red-100 bg-red-50 focus:border-red-400 text-red-900 placeholder:text-red-300"
                        : "border-slate-100 bg-slate-50 focus:border-emerald-500 focus:bg-white text-slate-900",
                    )}
                  />
                </div>
                {formErrors.name && (
                  <p className="text-[10px] font-bold text-red-500 pl-1">
                    {formErrors.name}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">
                  Jenjang Pendidikan
                </label>
                <div className="relative">
                  <GraduationCap
                    className={cn(
                      "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors z-10",
                      formErrors.jenjang ? "text-red-400" : "text-slate-400",
                    )}
                  />
                  <select
                    value={guestJenjang}
                    onChange={(e) => {
                      setGuestJenjang(e.target.value);
                      if (formErrors.jenjang)
                        setFormErrors((prev) => ({ ...prev, jenjang: "" }));
                    }}
                    className={cn(
                      "w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 transition-all outline-none text-sm font-bold appearance-none bg-no-repeat bg-[right_1rem_center]",
                      formErrors.jenjang
                        ? "border-red-100 bg-red-50 focus:border-red-400 text-red-900"
                        : "border-slate-100 bg-slate-50 focus:border-emerald-500 focus:bg-white text-slate-900",
                    )}
                  >
                    <option value="">-- Pilih Jenjang --</option>
                    {["SMP", "MTs", "SMA", "SMK", "KULIAH", "UMUM"].map((j) => (
                      <option key={j} value={j}>
                        {j}
                      </option>
                    ))}
                  </select>
                </div>
                {formErrors.jenjang && (
                  <p className="text-[10px] font-bold text-red-500 pl-1">
                    {formErrors.jenjang}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">
                  Asal Sekolah / Instansi
                </label>
                <div className="relative">
                  <Home
                    className={cn(
                      "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors",
                      formErrors.asal ? "text-red-400" : "text-slate-400",
                    )}
                  />
                  <input
                    type="text"
                    value={guestAsal}
                    onChange={(e) => {
                      setGuestAsal(e.target.value);
                      if (formErrors.asal)
                        setFormErrors((prev) => ({ ...prev, asal: "" }));
                    }}
                    placeholder="Contoh: SMK Negeri 1 Jakarta"
                    className={cn(
                      "w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 transition-all outline-none text-sm font-bold",
                      formErrors.asal
                        ? "border-red-100 bg-red-50 focus:border-red-400 text-red-900 placeholder:text-red-300"
                        : "border-slate-100 bg-slate-50 focus:border-emerald-500 focus:bg-white text-slate-900",
                    )}
                  />
                </div>
                {formErrors.asal && (
                  <p className="text-[10px] font-bold text-red-500 pl-1">
                    {formErrors.asal}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">
                  Kelas / Umur
                </label>
                <div className="relative">
                  <Hash
                    className={cn(
                      "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors",
                      formErrors.kelas ? "text-red-400" : "text-slate-400",
                    )}
                  />
                  <input
                    type="text"
                    value={guestKelas}
                    onChange={(e) => {
                      setGuestKelas(e.target.value);
                      if (formErrors.kelas)
                        setFormErrors((prev) => ({ ...prev, kelas: "" }));
                    }}
                    placeholder="Contoh: Kelas 12 atau 17 Tahun"
                    className={cn(
                      "w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 transition-all outline-none text-sm font-bold",
                      formErrors.kelas
                        ? "border-red-100 bg-red-50 focus:border-red-400 text-red-900 placeholder:text-red-300"
                        : "border-slate-100 bg-slate-50 focus:border-emerald-500 focus:bg-white text-slate-900",
                    )}
                  />
                </div>
                {formErrors.kelas && (
                  <p className="text-[10px] font-bold text-red-500 pl-1">
                    {formErrors.kelas}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              {errorMsg && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700 font-bold leading-relaxed">
                    {errorMsg}
                  </p>
                </div>
              )}
              <button
                onClick={handleGuestSubmit}
                disabled={isLoading}
                className="w-full bg-emerald-600 text-white py-4.5 rounded-2xl font-black hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 disabled:opacity-50 text-sm tracking-tight uppercase"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        repeat: Infinity,
                        duration: 1,
                        ease: "linear",
                      }}
                    >
                      <Loader2 className="w-5 h-5" />
                    </motion.div>
                    MEMPROSES DATA...
                  </div>
                ) : (
                  "DAFTAR & MULAI TES"
                )}
              </button>
              <button
                onClick={() => {
                  setStep("initial");
                  setErrorMsg("");
                  setFormErrors({});
                }}
                disabled={isLoading}
                className="w-full bg-white text-slate-500 py-3 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2 text-xs"
              >
                <ArrowLeft className="w-4 h-4" /> KEMBALI KE MENU
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const SplashWelcome = ({ onStart }: { onStart: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-white overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,#ecfdf5_0%,transparent_70%),radial-gradient(circle_at_80%_70%,#f0fdf4_0%,transparent_70%)] opacity-70" />
      <div className="relative z-10 max-w-4xl w-full px-6 text-center space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-6"
        >
          <div className="inline-block px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black tracking-[0.2em] uppercase border border-emerald-100/50 mb-4">
            Aplikasi Psikologi Modern
          </div>
          <h1 className="text-5xl md:text-9xl font-black text-slate-900 tracking-tighter leading-[0.85] uppercase">
            Psiko<span className="text-emerald-600">Test</span>
          </h1>
          <p className="text-lg md:text-2xl text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed italic font-serif">
            "Jelajahi potensi diri, pahami pola pikir, dan temukan jalan menuju
            pertumbuhan optimal dengan akurasi psikologis."
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex flex-col items-center gap-6"
        >
          <button
            onClick={onStart}
            className="group relative px-12 py-5 bg-slate-900 text-white rounded-full font-black text-lg tracking-wider hover:bg-emerald-600 transition-all duration-500 shadow-2xl hover:shadow-emerald-200"
          >
            <span className="relative z-10 flex items-center gap-3">
              MULAI SEKARANG
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </span>
          </button>
          <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
            Dikembangkan untuk konseling pendidikan modern
          </p>
        </motion.div>
      </div>

      {/* Background Decorative Elements */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
      <div className="absolute top-1/3 -right-20 w-80 h-80 bg-teal-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-cyan-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
    </motion.div>
  );
};

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [resumeTestType, setResumeTestType] = useState<TestType | null>(null);

  const [loading, setLoading] = useState(true);
  const [activeTest, setActiveTest] = useState<TestType | null>(null);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [allResults, setAllResults] = useState<TestResult[]>([]);
  const [userResults, setUserResults] = useState<TestResult[]>([]);
  const [allCounselingLogs, setAllCounselingLogs] = useState<CounselingLog[]>(
    [],
  );
  const [students, setStudents] = useState<StudentData[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);

  // Derive classes dari data siswa secara otomatis (hanya yang terdaftar di Manajemen Siswa)
  const classes = React.useMemo(() => {
    const studentClasses = students.map((s) => s.className);
    const uniqueNames = Array.from(new Set(studentClasses))
      .filter(Boolean)
      .sort();
    return uniqueNames.map((name) => ({ id: name, name, teacherId: "" }));
  }, [students]);
  const [teacherSettings, setTeacherSettings] =
    useState<TeacherSettings | null>(null);
  const [customTests, setCustomTests] = useState<any[]>([]);
  const [activeCustomTest, setActiveCustomTest] = useState<any | null>(null);
  const [isAnalyzingTest, setIsAnalyzingTest] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [view, setView] = useState<
    "dashboard" | "admin" | "guide" | "create-test" | "history"
  >("dashboard");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (user) {
      const keys = Object.keys(localStorage);
      const userPrefix = `psikotest_progress_${user.uid}_`;
      const foundKey = keys.find((k) => k.startsWith(userPrefix));
      if (foundKey) {
        const type = foundKey.replace(userPrefix, "") as TestType;
        setResumeTestType(type);
      } else {
        setResumeTestType(null);
      }
    }
  }, [user, activeTest, activeCustomTest, view]);

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "info",
  ) => {
    setToast({ message, type });
  };

  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [showEmergencyMenu, setShowEmergencyMenu] = useState(false);
  const [initialIdentityStep, setInitialIdentityStep] = useState<
    "initial" | "registered" | "studentCard" | "guest"
  >("initial");
  const [profileData, setProfileData] = useState({ name: "", className: "" });
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showPreview, setShowPreview] = useState<TestType | null>(null);
  const [showStudentGuide, setShowStudentGuide] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [showWelcome, setShowWelcome] = useState(() => {
    return localStorage.getItem("hasSeenWelcome") !== "true";
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const isAdminEmail =
            firebaseUser.email?.toLowerCase() === "dutatama@gmail.com";
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

          if (userDoc.exists()) {
            const userData = userDoc.data() as UserProfile;

            // Check expiry for BK Teachers
            const isBKTeacher = userData.role === "teacher";
            const isExpired =
              userData.expiryDate &&
              new Date(userData.expiryDate.seconds * 1000) < new Date();

            if (isBKTeacher && isExpired && !isAdminEmail) {
              showToast(
                `Masa aktif akun Guru BK Anda telah berakhir. Silakan hubungi Admin.`,
                "error",
              );
              setUser(userData);
              setView("dashboard");
            } else if (isAdminEmail && userData.role !== "admin") {
              await updateDoc(doc(db, "users", firebaseUser.uid), {
                role: "admin",
              });
              setUser({ ...userData, role: "admin" });
              setView("admin");
            } else if (
              !isAdminEmail &&
              firebaseUser.email?.toLowerCase() === "purnomowiwit@gmail.com"
            ) {
              // Maintain role but ensure they can access admin dashboard
              setUser(userData);
              setView("admin");
            } else {
              setUser(userData);
              // If student hasn't set their class/name properly
              if (
                userData.role === "student" &&
                (!userData.className || userData.name === "Siswa")
              ) {
                setShowProfileSetup(true);
              }
              if (
                userData.role === "admin" ||
                userData.role === "teacher" ||
                isAdminEmail
              ) {
                // Final check for teacher access in case they try to force view
                if (userData.role === "teacher" && isExpired) {
                  setView("dashboard");
                } else {
                  setView("admin");
                }
              }
            }
          } else {
            const newUser: UserProfile = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || "Siswa",
              email: firebaseUser.email || "",
              role: isAdminEmail ? "admin" : "student",
              createdAt: serverTimestamp(),
            };
            await setDoc(doc(db, "users", firebaseUser.uid), newUser);
            setUser(newUser);
            if (isAdminEmail) {
              setView("admin");
            } else {
              setShowProfileSetup(true);
            }
          }
        } else {
          setUser(null);
          setView("dashboard");
          setShowProfileSetup(false);
        }
      } catch (error) {
        if (error instanceof Error && error.message.includes("permission")) {
          handleFirestoreError(error, OperationType.GET, "users");
        }
      } finally {
        setLoading(false);
        setIsLoggingIn(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateProfile = async (data?: {
    name: string;
    className: string;
    password?: string;
    schoolName?: string;
    jenjang?: string;
  }) => {
    const finalData = data || {
      name: profileData.name,
      className: profileData.className,
      password: "",
      schoolName: "",
      jenjang: "",
    };
    if (!user || !finalData.name || !finalData.className) return;

    try {
      const isLocal = user.uid.startsWith("local_");
      const payload: any = {
        name: finalData.name,
        className: finalData.className,
        password: finalData.password || "",
        schoolName: finalData.schoolName || finalData.password || "",
        jenjang: finalData.jenjang || "",
      };

      if (isLocal) {
        payload.uid = user.uid;
        payload.role = user.role;
        payload.email = user.email || "";
        payload.createdAt = serverTimestamp();
      }

      await setDoc(doc(db, "users", user.uid), payload, { merge: true });

      // Try to link student to their teacher
      try {
        const studentsRef = collection(db, "students");
        let q;
        if (finalData.password) {
          q = query(studentsRef, where("password", "==", finalData.password));
        } else {
          q = query(
            studentsRef,
            where("name", "==", finalData.name),
            where("className", "==", finalData.className),
          );
        }

        const studentSnap = await getDocs(q);
        if (!studentSnap.empty) {
          const studentData = studentSnap.docs[0].data() as StudentData;
          const teacherId = studentData.addedBy;
          const studentSchoolName = studentData.schoolName || "";
          await updateDoc(doc(db, "users", user.uid), {
            teacherId,
            schoolName: studentSchoolName,
          });
          payload.teacherId = teacherId;
          payload.schoolName = studentSchoolName;
        }
      } catch (err) {
        console.error("Error linking student to teacher:", err);
      }

      setUser({
        ...user,
        ...payload,
        createdAt: isLocal ? new Date() : user.createdAt,
      });
      setShowProfileSetup(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, "users");
    }
  };

  useEffect(() => {
    if (user) {
      // Fetch user's own results for recommendations
      const q = query(
        collection(db, "test_results"),
        where("studentId", "==", user.uid),
      );
      const unsubUserResults = onSnapshot(
        q,
        (snapshot) => {
          setUserResults(
            snapshot.docs.map(
              (doc) => ({ id: doc.id, ...doc.data() }) as TestResult,
            ),
          );
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, "test_results");
        },
      );

      const isAdminEmail = user.email?.toLowerCase() === "dutatama@gmail.com";
      const isLegacyAdmin =
        user.email?.toLowerCase() === "purnomowiwit@gmail.com";
      const isSuperAdmin =
        user.role === "admin" || isAdminEmail || isLegacyAdmin;

      const studentsQuery =
        isSuperAdmin || user.role === "student"
          ? collection(db, "students")
          : isLegacyAdmin
            ? query(
                collection(db, "students"),
                where("addedBy", "in", [user.uid, "admin"]),
              )
            : query(
                collection(db, "students"),
                where("addedBy", "==", user.uid),
              );

      const unsubStudents = onSnapshot(
        studentsQuery,
        (snapshot) => {
          setStudents(
            snapshot.docs.map(
              (doc) => ({ id: doc.id, ...doc.data() }) as StudentData,
            ),
          );
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, "students");
        },
      );

      const customTestsQuery =
        user.role === "student"
          ? query(
              collection(db, "custom_tests"),
              where("teacherId", "==", (user as any).teacherId || "admin"),
            )
          : isSuperAdmin
            ? collection(db, "custom_tests")
            : isLegacyAdmin
              ? query(
                  collection(db, "custom_tests"),
                  where("teacherId", "in", [user.uid, "admin"]),
                )
              : query(
                  collection(db, "custom_tests"),
                  where("teacherId", "==", user.uid),
                );

      const unsubCustomTests = onSnapshot(customTestsQuery, (snapshot) => {
        setCustomTests(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
        );
      });

      const notifTargets = [user.uid, "all"];
      if (user.role === "student" && user.className) {
        notifTargets.push(`class:${user.className}`);
      }

      const qNotif =
        user.role === "student"
          ? query(
              collection(db, "notifications"),
              where("userId", "in", notifTargets),
              where("teacherId", "==", (user as any).teacherId || "admin"),
              orderBy("timestamp", "desc"),
            )
          : isSuperAdmin
            ? query(
                collection(db, "notifications"),
                orderBy("timestamp", "desc"),
              )
            : isLegacyAdmin
              ? query(
                  collection(db, "notifications"),
                  where("teacherId", "in", [user.uid, "admin"]),
                  orderBy("timestamp", "desc"),
                )
              : query(
                  collection(db, "notifications"),
                  where("teacherId", "==", user.uid),
                  orderBy("timestamp", "desc"),
                );
      const unsubNotifications = onSnapshot(
        qNotif,
        (snapshot) => {
          setNotifications(
            snapshot.docs.map(
              (doc) => ({ id: doc.id, ...doc.data() }) as AppNotification,
            ),
          );
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, "notifications");
        },
      );

      let unsubLogs = () => {};
      if (user.role === "teacher" || user.role === "admin") {
        const qLogs = isSuperAdmin
          ? collection(db, "counseling_logs")
          : isLegacyAdmin
            ? query(
                collection(db, "counseling_logs"),
                where("teacherId", "in", [user.uid, "admin"]),
              )
            : query(
                collection(db, "counseling_logs"),
                where("teacherId", "==", user.uid),
              );
        unsubLogs = onSnapshot(
          qLogs,
          (snapshot) => {
            setAllCounselingLogs(
              snapshot.docs.map(
                (doc) => ({ id: doc.id, ...doc.data() }) as CounselingLog,
              ),
            );
          },
          (error) => {
            handleFirestoreError(error, OperationType.LIST, "counseling_logs");
          },
        );
      } else if (user.role === "student") {
        const qLogs = query(
          collection(db, "counseling_logs"),
          where("studentId", "==", user.uid),
          where("isPrivate", "==", false),
        );
        unsubLogs = onSnapshot(qLogs, (snapshot) => {
          setAllCounselingLogs(
            snapshot.docs.map(
              (doc) => ({ id: doc.id, ...doc.data() }) as CounselingLog,
            ),
          );
        });
      }

      if (user.role === "teacher" || user.role === "admin") {
        const qAll = isSuperAdmin
          ? query(collection(db, "test_results"))
          : isLegacyAdmin
            ? query(
                collection(db, "test_results"),
                where("teacherId", "in", [user.uid, "admin"]),
              )
            : query(
                collection(db, "test_results"),
                where("teacherId", "==", user.uid),
              );
        const unsubResults = onSnapshot(
          qAll,
          (snapshot) => {
            setAllResults(
              snapshot.docs.map(
                (doc) => ({ id: doc.id, ...doc.data() }) as TestResult,
              ),
            );
          },
          (error) => {
            handleFirestoreError(error, OperationType.LIST, "test_results");
          },
        );

        const unsubTeacherSettings = onSnapshot(
          doc(db, "teacher_settings", user.uid),
          (doc) => {
            if (doc.exists()) {
              setTeacherSettings(doc.data() as TeacherSettings);
            }
          },
        );

        const usersQuery = isSuperAdmin
          ? collection(db, "users")
          : query(collection(db, "users"), where("teacherId", "==", user.uid));

        const unsubUsers = onSnapshot(
          usersQuery,
          (snapshot) => {
            setAllUsers(
              snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
            );
          },
          (error) => {
            handleFirestoreError(error, OperationType.LIST, "users");
          },
        );

        return () => {
          unsubUserResults();
          unsubResults();
          unsubStudents();
          unsubTeacherSettings();
          unsubCustomTests();
          unsubUsers();
          unsubNotifications();
          unsubLogs();
        };
      }

      return () => {
        unsubUserResults();
        unsubStudents();
        unsubCustomTests();
        unsubNotifications();
        unsubLogs();
      };
    }
  }, [user]);

  useEffect(() => {
    if (
      user &&
      user.role === "student" &&
      customTests.length > 0 &&
      userResults.length >= 0
    ) {
      const unfinishedTests = customTests.filter(
        (ct) =>
          ct.isActive && !userResults.some((ur) => ur.testType === ct.testType),
      );

      if (unfinishedTests.length > 0) {
        // We could add a notification to the state or just show a toast
        // For now, let's just make sure they see it in the dashboard
      }
    }
  }, [user, customTests, userResults]);

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, "notifications", id), { read: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const getRecommendation = (type: TestType) => {
    const latest = userResults.find((r) => r.testType === type);
    if (!latest) return undefined;

    // Simple recommendation logic based on analysis
    if (type === "anxiety") {
      if (latest.analysis.includes("Tinggi"))
        return "Fokus pada teknik relaksasi dan meditasi.";
      if (latest.analysis.includes("Sedang"))
        return "Jaga pola tidur dan kurangi kafein.";
      return "Pertahankan keseimbangan emosional Anda.";
    }
    if (type === "learning_style") {
      if (latest.analysis.includes("Visual"))
        return "Gunakan mind map dan video pembelajaran.";
      if (latest.analysis.includes("Auditori"))
        return "Dengarkan rekaman atau diskusi kelompok.";
      return "Lakukan simulasi atau praktik langsung.";
    }
    if (type === "subject_interest") {
      if (latest.analysis.includes("Sains"))
        return "Perdalam pemahaman konsep matematika dan sains.";
      if (latest.analysis.includes("Sastra"))
        return "Tingkatkan kemampuan bahasa dan ekspresi kreatif.";
      return "Eksplorasi materi pelajaran yang relevan dengan minat Anda.";
    }
    if (type === "multiple_intelligences") {
      if (latest.analysis.includes("Logis"))
        return "Asah kemampuan problem solving dan logika.";
      if (latest.analysis.includes("Linguistik"))
        return "Tingkatkan kosakata dan kemampuan menulis.";
      return "Kembangkan potensi kecerdasan dominan Anda.";
    }
    if (type === "wartegg") {
      return "Konsultasikan hasil gambar Anda dengan psikolog.";
    }
    return "Terus asah potensi diri berdasarkan hasil tes ini.";
  };

  const handleCompleteTest = async (
    scores: Record<string, number>,
    extraData?: any,
  ) => {
    if (!user || (!activeTest && !activeCustomTest)) return;

    setIsAnalyzingTest(true);
    const testType = activeTest || activeCustomTest.testType;
    let analysis = "";

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("GEMINI_API_KEY is missing");
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Sebagai seorang psikolog dan konselor pendidikan, tolong analisis hasil tes ${testType} dari siswa bernama ${user.name} (Kelas: ${user.className || "Umum"}).
      
Skor yang diperoleh:
${Object.entries(scores)
  .map(([k, v]) => `- ${k}: ${v}`)
  .join("\n")}
${
  testType === "wartegg" && extraData?.titles
    ? `Judul Gambar Wartegg:\n${Object.entries(extraData.titles)
        .map(([k, v]) => `- Kotak ${parseInt(k) + 1}: ${v}`)
        .join("\n")}`
    : ""
}
${
  testType === "subject_interest" && extraData?.reasons
    ? `Minat Mata Pelajaran & Alasan:\n${Object.entries(extraData.reasons)
        .map(([id, reason]) => {
          const map: Record<string, string> = {
            agama: "Pendidikan Agama",
            ppkn: "PPKn",
            b_indo: "Bahasa Indonesia",
            mtk: "Matematika",
            ipa: "IPA",
            ips: "IPS",
            b_ing: "Bahasa Inggris",
            seni: "Seni Budaya",
            pjok: "PJOK",
            prakarya: "Prakarya",
            informatika: "Informatika",
            b_daerah: "Bahasa Daerah",
            bk: "BK",
          };
          return `- ${map[id] || id}: ${reason}`;
        })
        .join("\n")}`
    : ""
}

Berikan analisis mendalam dan rekomendasi yang dipersonalisasi untuk pengembangan diri dan karir/pendidikan selanjutnya. Fokuskan pada:
1. **Profil Psikologis & Kekuatan Utama**: Identifikasi ciri kepribadian dominan dan kelebihan spesifik siswa.
2. **Area Pengembangan & Tantangan**: Identifikasi aspek yang perlu ditingkatkan, potensi hambatan, dan cara menghadapinya.
3. **Rekomendasi Karir Personal**: Daftar minimal 3 jalur karir yang sangat sesuai dengan profil ini beserta alasannya.
4. **Strategi Pembelajaran & Studi**: Metode belajar atau jenis lingkungan pendidikan yang paling efektif untuk siswa ini.

Gunakan bahasa Indonesia yang profesional, empatik, dan inspiratif. Gunakan format Markdown yang rapi (bold headings, bullet points, numbered lists).`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
      });

      analysis =
        response?.text ||
        activeCustomTest?.aiRecommendation ||
        analyzeResult(testType, scores);
    } catch (error) {
      console.error("Error generating AI analysis:", error);
      // Fallback to static analysis
      analysis =
        activeCustomTest?.aiRecommendation || analyzeResult(testType, scores);
    }

    const result: any = {
      studentId: user.uid,
      studentName: user.name,
      studentEmail: user.email || "",
      studentClass: user.className || "Umum",
      studentPassword: user.password || "",
      studentSchoolName: (user as any).schoolName || "",
      testType: testType,
      scores,
      analysis,
      extraData: extraData || null,
      timestamp: serverTimestamp(),
      teacherId: (user as any).teacherId || "admin",
    };

    if (activeCustomTest?.visualizationType) {
      result.visualizationType = activeCustomTest.visualizationType;
    } else {
      result.visualizationType = null;
    }

    try {
      const docRef = await addDoc(collection(db, "test_results"), result);

      // Notify teacher if anxiety is high
      const targetTeacherId = (user as any).teacherId || "admin";

      const anxietyScore = scores["anxiety_score"] || 0;
      if (testType === "anxiety" && anxietyScore > 45) {
        await addDoc(collection(db, "notifications"), {
          userId: targetTeacherId,
          title: "PERINGATAN: Kecemasan Tinggi Terdeteksi",
          message: `Siswa ${result.studentName} (${result.studentClass}) mendapatkan skor kecemasan TINGGI (${anxietyScore}). Mohon segera dilakukan pendekatan atau bimbingan khusus.`,
          type: "warning",
          read: false,
          timestamp: serverTimestamp(),
        });
      } else if (testType === "anxiety" && anxietyScore > 15) {
        await addDoc(collection(db, "notifications"), {
          userId: targetTeacherId,
          title: "Info: Hasil Tes Kecemasan Sedang",
          message: `Siswa ${result.studentName} (${result.studentClass}) mendapatkan skor kecemasan SEDANG (${anxietyScore}).`,
          type: "info",
          read: false,
          timestamp: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, "notifications"), {
          userId: targetTeacherId,
          title: "Tes Baru Selesai",
          message: `Siswa ${result.studentName} (${result.studentClass}) telah menyelesaikan tes ${TESTS[testType as TestType]?.title || testType}.`,
          type: "success",
          read: false,
          timestamp: serverTimestamp(),
        });
      }

      setTestResult({ ...result, id: docRef.id });
      setActiveTest(null);
      setActiveCustomTest(null);
      showToast("Hasil tes berhasil disimpan.", "success");
    } catch (error) {
      console.error("Error saving test result:", error);
      showToast("Gagal menyimpan hasil tes. Silakan coba lagi.", "error");
      // Don't clear activeTest so they can try again or see the error
      handleFirestoreError(error, OperationType.WRITE, "test_results");
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
      if (error.code === "auth/popup-blocked") {
        showToast(
          "Popup diblokir oleh browser. Silakan izinkan popup untuk masuk.",
          "error",
        );
      } else {
        showToast("Gagal masuk dengan Google. Silakan coba lagi.", "error");
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
      showToast("Gagal keluar. Silakan coba lagi.", "error");
    }
  };

  if (loading) {
    return <GlobalLoader />;
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

            <h2 className="text-3xl font-black text-slate-900 mb-2">
              Menu Login
            </h2>
            <p className="text-slate-500 text-sm mb-8">
              Silakan pilih kategori peserta tes:
            </p>

            <div className="space-y-4">
              <button
                onClick={() => {
                  const dummyUid = `local_${Date.now()}`;
                  const dummyUser: UserProfile = {
                    uid: dummyUid,
                    name: "Siswa",
                    email: "",
                    role: "student",
                    createdAt: new Date(),
                  };
                  setUser(dummyUser);
                  setInitialIdentityStep("registered");
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
                    name: "Peserta Umum",
                    email: "",
                    role: "student",
                    createdAt: new Date(),
                  };
                  setUser(dummyUser);
                  setInitialIdentityStep("guest");
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

            <button
              onClick={() => setShowStudentGuide(true)}
              className="mt-4 w-full bg-emerald-50 text-emerald-700 text-xs font-black hover:bg-emerald-100 transition-all py-3 border-2 border-emerald-200 rounded-xl flex items-center justify-center gap-2 shadow-sm"
            >
              <BookOpen className="w-4 h-4" /> PANDUAN AKSES SISWA
            </button>

            {showStudentGuide && (
              <StudentGuideModal onClose={() => setShowStudentGuide(false)} />
            )}

            <div className="mt-8 p-5 bg-indigo-50 rounded-2xl border border-indigo-100 text-left">
              <p className="text-[11px] text-indigo-900 leading-relaxed">
                <span className="font-black text-indigo-700">Petunjuk :</span>{" "}
                Siswa yang terdaftar sebagai siswa bimbingan, silahkan pilih
                tombol <b>SISWA TERDAFTAR</b> (Login dengan menggunakan
                Password). Apabila belum terdaftar silahkan hubungi guru BK,
                bagi peserta tes yang lain silahkan pilih tombol <b>UMUM</b>.
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
            {toast && (
              <Toast
                message={toast.message}
                type={toast.type}
                onClose={() => setToast(null)}
              />
            )}
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
          <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">
            PsikoTest
          </h1>
          <img
            src="https://lh3.googleusercontent.com/d/1UNix_IGpjmt2q0apsIQy-6s3Zr9SnLJ9"
            alt="Dutatama Logo"
            className="h-6 w-auto mx-auto mb-4 opacity-90"
            referrerPolicy="no-referrer"
          />
          <p className="text-slate-500 mb-8 leading-relaxed">
            Platform asesmen psikologi profesional untuk membantu siswa SMP &
            SMA menemukan potensi terbaik mereka.
          </p>

          <div className="my-6 border-t border-slate-200"></div>

          <button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="w-full bg-white text-slate-700 border border-slate-200 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-sm disabled:opacity-50 mb-4 cursor-pointer"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              className="w-5 h-5"
              alt="Google"
            />
            LOGIN DENGAN GOOGLE
          </button>

          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={() => setShowStudentGuide(true)}
              className="w-full bg-emerald-50 text-emerald-700 text-xs font-black hover:bg-emerald-100 transition-all py-3 border-2 border-emerald-200 rounded-xl flex items-center justify-center gap-2 shadow-sm"
            >
              <BookOpen className="w-4 h-4" /> PANDUAN AKSES SISWA
            </button>
            <button
              onClick={() => setShowEmergencyMenu(true)}
              className="w-full text-emerald-600 text-xs font-black hover:bg-emerald-50 transition-all py-3 border-2 border-emerald-600 rounded-xl flex items-center justify-center gap-2 shadow-sm"
            >
              <AlertCircle className="w-4 h-4" /> MASUK TANPA AKUN GOOGLE
            </button>
            <button
              onClick={() => setShowEmergencyMenu(false)}
              className="w-full text-slate-500 text-xs font-black hover:bg-slate-100 transition-all py-3 border-2 border-slate-200 rounded-xl flex items-center justify-center gap-2 shadow-sm"
            >
              <X className="w-4 h-4" /> BATAL
            </button>
          </div>

          {showStudentGuide && (
            <StudentGuideModal onClose={() => setShowStudentGuide(false)} />
          )}

          <div className="mt-8 p-4 bg-blue-50 rounded-2xl border border-blue-100 text-left">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-blue-900 mb-1">
                  Penting untuk Siswa!
                </p>
                <p className="text-[10px] text-blue-800 leading-relaxed">
                  Gunakan tombol <b>"MASUK TANPA AKUN GOOGLE"</b> apabila gagal
                  masuk lewat tombol <b>"LOGIN DENGAN GOOGLE"</b>.
                </p>
                <p className="text-[10px] text-blue-800 leading-relaxed mt-2">
                  Refresh aplikasi apabila layar blank atau gagal login, tombol
                  berupa tanda panah melingkar berada di kiri atas layar.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
        <AnimatePresence>
          {toast && (
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <AnimatePresence>
        {showWelcome && (
          <SplashWelcome
            onStart={() => {
              setShowWelcome(false);
              localStorage.setItem("hasSeenWelcome", "true");
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showExitConfirm && (
          <ConfirmModal
            title="Keluar Aplikasi"
            message="Apakah Anda yakin ingin keluar dari aplikasi?"
            onCancel={() => setShowExitConfirm(false)}
            onConfirm={handleLogout}
          />
        )}
      </AnimatePresence>

      <Navbar
        user={user}
        onLogout={handleLogout}
        setView={setView}
        view={view}
        notifications={notifications}
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
        markAsRead={markAsRead}
        onBack={() => {
          setActiveTest(null);
          setTestResult(null);
          setView("dashboard");
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
                userId={user.uid}
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
                  if (user?.role === "student") {
                    setView("dashboard");
                  }
                }}
                showToast={showToast}
                teacherSettings={teacherSettings}
                results={
                  user?.role === "admin" || user?.role === "teacher"
                    ? allResults
                    : userResults
                }
              />
            </motion.div>
          ) : view === "admin" ? (
            <motion.div
              key="admin-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <AdminDashboard
                results={allResults}
                classes={classes}
                students={students}
                teacherSettings={teacherSettings}
                user={user}
                setView={setView}
                showToast={showToast}
                setTestResult={setTestResult}
                allUsers={allUsers}
                notifications={notifications}
                counselingLogs={allCounselingLogs}
                customTests={customTests}
              />
            </motion.div>
          ) : view === "create-test" ? (
            <motion.div
              key="create-test-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <TestCreator
                onBack={() => setView("admin")}
                showToast={showToast}
                user={user!}
              />
            </motion.div>
          ) : view === "guide" ? (
            <motion.div
              key="guide-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <TeacherGuide onBack={() => setView("dashboard")} />
            </motion.div>
          ) : view === "history" ? (
            <motion.div
              key="history-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
            >
              <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="p-8 border-b border-slate-100 bg-emerald-50/30 flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">
                      Riwayat Tes Saya
                    </h3>
                    <p className="text-slate-500 text-sm font-medium">
                      Lihat dan unduh laporan hasil tes yang telah kamu
                      selesaikan.
                    </p>
                  </div>
                  <button
                    onClick={() => setView("dashboard")}
                    className="p-3 bg-white border-2 border-slate-100 text-slate-400 rounded-2xl hover:text-emerald-600 hover:border-emerald-100 transition-all shadow-sm"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-8">
                  {userResults.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {userResults
                        .sort((a, b) => {
                          const timeA = a.timestamp?.seconds || 0;
                          const timeB = b.timestamp?.seconds || 0;
                          return timeB - timeA;
                        })
                        .map((res, i) => (
                          <div
                            key={i}
                            className="group p-6 rounded-3xl border border-slate-100 bg-slate-50/30 hover:bg-white hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/5 transition-all flex flex-col gap-5"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center shrink-0 border-2 border-white shadow-sm">
                                  <FileText className="w-6 h-6 text-emerald-600" />
                                </div>
                                <div>
                                  <h4 className="font-black text-slate-900 text-sm leading-tight mb-1">
                                    {TESTS[res.testType]?.title || res.testType}
                                  </h4>
                                  <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                                    {res.timestamp
                                      ? new Date(
                                          res.timestamp.seconds * 1000,
                                        ).toLocaleDateString("id-ID", {
                                          day: "numeric",
                                          month: "short",
                                          year: "numeric",
                                        })
                                      : "-"}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDownloadPDF(res, user!)}
                              className="w-full py-3.5 bg-emerald-600 text-white rounded-2xl text-xs font-black hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 group-hover:-translate-y-0.5"
                            >
                              <Download className="w-4 h-4" /> UNDUH LAPORAN
                              (PDF)
                            </button>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="py-24 text-center">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-dashed border-slate-200">
                        <History className="w-10 h-10 text-slate-200" />
                      </div>
                      <h4 className="text-lg font-black text-slate-900 mb-2">
                        Belum ada riwayat tes
                      </h4>
                      <p className="text-slate-500 text-sm font-medium mb-8">
                        Kamu belum menyelesaikan tes apapun secara mandiri.
                      </p>
                      <button
                        onClick={() => setView("dashboard")}
                        className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200"
                      >
                        MULAI TES SEKARANG
                      </button>
                    </div>
                  )}
                </div>
              </div>
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
                  <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">
                    Halo, {user.name.split(" ")[0]}! 👋
                  </h2>
                  <p className="text-slate-500 text-lg">
                    {user.role === "student"
                      ? `Siswa Kelas ${user.className || "-"}`
                      : "Pilih tes yang ingin kamu lakukan hari ini."}
                  </p>
                </div>
                {(user.role === "teacher" ||
                  user.role === "admin" ||
                  user.email.toLowerCase() === "dutatama@gmail.com") && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowExitConfirm(true)}
                      className="bg-white text-red-600 border-2 border-red-100 px-6 py-3 rounded-2xl font-bold hover:bg-red-50 transition-all flex items-center gap-2"
                    >
                      <LogOut className="w-5 h-5" /> KELUAR APLIKASI
                    </button>
                    <button
                      onClick={() => setView("guide")}
                      className="bg-white text-slate-600 border-2 border-slate-200 px-6 py-3 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center gap-2"
                    >
                      <BookOpen className="w-5 h-5" /> Panduan Guru
                    </button>
                    <button
                      onClick={() => setView("admin")}
                      className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-200"
                    >
                      <LayoutDashboard className="w-5 h-5" /> Admin Dasbor
                    </button>
                  </div>
                )}
              </div>

              {resumeTestType && !activeTest && !activeCustomTest && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8 p-6 bg-emerald-50 border border-emerald-200 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                      <History className="w-7 h-7 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-emerald-900">
                        Progres Tersimpan
                      </h4>
                      <p className="text-emerald-700 text-sm font-medium">
                        Kami menemukan progres pengerjaan tes{" "}
                        <b>
                          {TESTS[resumeTestType]?.title ||
                            customTests.find(
                              (ct) => ct.testType === resumeTestType,
                            )?.title ||
                            resumeTestType}
                        </b>{" "}
                        yang belum selesai.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const ctFound = customTests.find(
                        (ct) => ct.testType === resumeTestType,
                      );
                      if (ctFound) {
                        setActiveCustomTest(ctFound);
                      } else {
                        setActiveTest(resumeTestType);
                      }
                    }}
                    className="px-8 py-3 bg-emerald-600 text-white rounded-2xl font-black text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 shrink-0 flex items-center gap-2"
                  >
                    LANJUTKAN SEKARANG <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}

              {user.role === "student" &&
                customTests.filter(
                  (ct) =>
                    ct.isActive &&
                    !userResults.some((ur) => ur.testType === ct.testType),
                ).length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 p-6 bg-amber-50 border border-amber-200 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                        <Bell className="w-7 h-7 text-amber-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-amber-900">
                          Tes Belum Selesai
                        </h4>
                        <p className="text-amber-700 text-sm font-medium">
                          Kamu memiliki{" "}
                          {
                            customTests.filter(
                              (ct) =>
                                ct.isActive &&
                                !userResults.some(
                                  (ur) => ur.testType === ct.testType,
                                ),
                            ).length
                          }{" "}
                          tes kustom yang belum dikerjakan.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const firstUnfinished = customTests.find(
                          (ct) =>
                            ct.isActive &&
                            !userResults.some(
                              (ur) => ur.testType === ct.testType,
                            ),
                        );
                        if (firstUnfinished)
                          setActiveCustomTest(firstUnfinished);
                      }}
                      className="px-8 py-3 bg-amber-600 text-white rounded-2xl font-black text-sm hover:bg-amber-700 transition-all shadow-lg shadow-amber-200 shrink-0"
                    >
                      KERJAKAN SEKARANG
                    </button>
                  </motion.div>
                )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {(Object.keys(TESTS) as TestType[]).map((type) => (
                  <TestCard
                    key={type}
                    type={type}
                    test={TESTS[type]}
                    onSelect={setActiveTest}
                    onPreview={setShowPreview}
                    recommendation={getRecommendation(type)}
                    results={userResults.filter((r) => r.testType === type)}
                  />
                ))}
                {customTests
                  .filter((t) => t.isActive)
                  .map((test) => (
                    <TestCard
                      key={test.id}
                      type={test.testType}
                      test={test}
                      onSelect={() => setActiveCustomTest(test)}
                      onPreview={setShowPreview}
                      recommendation={undefined}
                      results={userResults.filter(
                        (r) => r.testType === test.testType,
                      )}
                    />
                  ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
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
        {showPreview && (
          <TestPreviewModal
            type={showPreview}
            onClose={() => setShowPreview(null)}
            onStart={(type) => {
              setShowPreview(null);
              setActiveTest(type);
            }}
          />
        )}
      </AnimatePresence>
      <DutaAssistant />
    </div>
  );
}
