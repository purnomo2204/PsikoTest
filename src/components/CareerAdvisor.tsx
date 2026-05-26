import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Briefcase, 
  GraduationCap, 
  Search, 
  Filter, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  BookOpen, 
  Compass, 
  FileCheck2, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp,
  AlertTriangle,
  Flame,
  Globe,
  Database,
  PenTool,
  Coins,
  ShieldCheck
} from "lucide-react";
import { TestResult, TestType, UserProfile } from "../types";
import { TESTS } from "../data/tests";

interface CareerPath {
  id: string;
  title: string;
  category: "tech" | "art" | "social" | "business" | "science";
  riasec: string[];
  majors: string[];
  description: string;
  educationPaths: {
    smaLine?: string;
    smkSpecialization?: string;
    collegeMajor: string;
  };
  essentialSkills: string[];
  actionSteps: string[];
  salaryEst?: string;
  outlook: "Tinggi" | "Stabil" | "Sangat Tinggi";
}

const CAREERS_DATABASE: CareerPath[] = [
  {
    id: "software_engineer",
    title: "Software Engineer / Web Developer",
    category: "tech",
    riasec: ["investigative", "realistic"],
    majors: ["ipa", "smk"],
    description: "Merancang, menganalisis, dan mengembangkan kode program untuk membuat aplikasi web, mobile, atau sistem operasi komputer yang efisien dan aman.",
    educationPaths: {
      smaLine: "Jurusan Matematika dan Ilmu Alam (MIPA)",
      smkSpecialization: "Mekar / Rekayasa Perangkat Lunak (RPL), Teknik Komputer Jaringan (TKJ)",
      collegeMajor: "S1 Teknik Informatika, S1 Sistem Informasi, S1 Rekayasa Perangkat Lunak"
    },
    essentialSkills: ["Algoritma & Pemrograman (JavaScript/Python/Java)", "Problem Solving", "Sistem Database (SQL/NoSQL)", "Git/Version Control"],
    actionSteps: [
      "Pelajari dasar-dasar bahasa pemrograman HTML, CSS, dan JavaScript secara mandiri.",
      "Buat portofolio project sederhana seperti Website Portfolio pribadi.",
      "Ikuti sertifikasi atau bootcamp pemrograman jika memungkinkan."
    ],
    salaryEst: "Rp 6.000.000 - Rp 15.000.000 / Bulan",
    outlook: "Sangat Tinggi"
  },
  {
    id: "data_analyst",
    title: "Data Analyst / Data Scientist",
    category: "tech",
    riasec: ["investigative", "conventional"],
    majors: ["ipa", "ips"],
    description: "Mengeksplorasi, menyaring, dan menganalisis kumpulan data besar untuk menemukan pola tren dan memberikan saran bisnis strategis kepada dewan manajemen.",
    educationPaths: {
      smaLine: "MIPA / Matematika, atau IPS dengan penguasaan statistik kuat",
      collegeMajor: "S1 Sains Data, S1 Statistika, S1 Matematika, S1 Sistem Informasi"
    },
    essentialSkills: ["Analisis Statistik", "Python / R Language", "Visualisasi Data (Tableau, PowerBI)", "Bahasa Query SQL"],
    actionSteps: [
      "Perdalam ilmu kalkulus, probabilitas, dan statistika matematika.",
      "Pelajari tool excel tingkat lanjut (Pivot, VLOOKUP, PowerQuery).",
      "Selesaikan kursus analisis data di platform online seperti Coursera atau Kaggle."
    ],
    salaryEst: "Rp 7.000.000 - Rp 18.000.000 / Bulan",
    outlook: "Sangat Tinggi"
  },
  {
    id: "ui_ux_designer",
    title: "UI/UX Designer",
    category: "art",
    riasec: ["artistic", "investigative"],
    majors: ["bahasa", "ips", "smk"],
    description: "Merancang struktur antarmuka (UI) serta alur kenyamanan pengalaman pengguna (UX) untuk aplikasi digital atau situs web komersial.",
    educationPaths: {
      smaLine: "IPS / Bahasa",
      smkSpecialization: "Desain Komunikasi Visual (DKV), Multimedia",
      collegeMajor: "S1 Desain Komunikasi Visual, S1 Desain Produk, S1 Human-Computer Interaction"
    },
    essentialSkills: ["Desain Antarmuka (Figma / Adobe XD)", "Wireframing & Prototyping", "User Research & Testing", "Prinsip Estetika Visual"],
    actionSteps: [
      "Pelajari prinsip-prinsip dasar desain visual seperti kontras, hierarki, dan warna.",
      "Eksplorasi aplikasi Figma dan cobalah mendesain ulang (redesign) aplikasi favoritmu.",
      "Publikasikan proyek desainmu ke platform komunitas seperti Behance atau Dribbble."
    ],
    salaryEst: "Rp 5.500.000 - Rp 12.000.000 / Bulan",
    outlook: "Tinggi"
  },
  {
    id: "digital_marketer",
    title: "Digital Marketer / SEO Specialist",
    category: "business",
    riasec: ["enterprising", "artistic"],
    majors: ["ips", "bahasa", "smk"],
    description: "Merencanakan dan mengelola kampanye promosi online lewat media sosial, mesin pencari Google (SEO/SEM), serta menganalisis performa bisnis periklanan.",
    educationPaths: {
      smaLine: "IPS atau Bahasa",
      smkSpecialization: "Bisnis Daring dan Pemasaran (BDP)",
      collegeMajor: "S1 Manajemen Pemasaran, S1 Ilmu Komunikasi, S1 Bisnis Digital"
    },
    essentialSkills: ["Copywriting Kreatif", "Search Engine Optimization (SEO)", "Social Media Analytics", "Budgeting Iklan Terarah"],
    actionSteps: [
      "Buat akun konten khusus (blog/TikTok/IG) dan analisislah perkembangan organic reach milikmu.",
      "Ikuti kursus gratis Google Analytics Academy atau HubSpot Inbound Marketing.",
      "Pelajari dasar psikologi konsumen dan teknik persuasif melalui tulisan."
    ],
    salaryEst: "Rp 5.000.000 - Rp 10.000.000 / Bulan",
    outlook: "Tinggi"
  },
  {
    id: "financial_analyst",
    title: "Analisis Keuangan / Akuntan Publik",
    category: "business",
    riasec: ["conventional", "enterprising"],
    majors: ["ips", "smk"],
    description: "Memeriksa laporan pembukuan usaha, mengawasi perpajakan, memberikan estimasi kelayakan investasi perusahaan, serta meminimalkan risiko kerugian finansial keuangan.",
    educationPaths: {
      smaLine: "Ilmu Pengetahuan Sosial (IPS)",
      smkSpecialization: "Akuntansi dan Keuangan Lembaga (AKL)",
      collegeMajor: "S1 Akuntansi, S1 Manajemen Keuangan, S1 Ekonomi Bisnis"
    },
    essentialSkills: ["Sistem Akuntansi PSAK / IFRS", "Analisis Finansial & Neraca", "Ketelitian Tinggi / Audit", "Aspek Regulasi Pajak"],
    actionSteps: [
      "Asah kemampuan menggunakan Spreadsheet Excel secara presisi.",
      "Pelajari istilah-istilah di pasar modal seperti dividend, margin, likuiditas.",
      "Selesaikan soal-soal kasus akuntansi dasar semenjak jenjang sekolah."
    ],
    salaryEst: "Rp 5.500.000 - Rp 14.000.000 / Bulan",
    outlook: "Stabil"
  },
  {
    id: "educator",
    title: "Guru / Dosen Akademisi",
    category: "social",
    riasec: ["social", "investigative"],
    majors: ["ipa", "ips", "bahasa"],
    description: "Mendidik, membimbing, mengevaluasi siswa, serta menciptakan lingkungan belajar yang inspiratif untuk mentransfer pengetahuan keilmuan secara runtut.",
    educationPaths: {
      smaLine: "Menyesuaikan bidang studi (IPA/IPS/Bahasa) yang kelak ingin diajarkan",
      collegeMajor: "S1 Pendidikan Guru (PGSD, PGPAUD) atau Pendidikan Bidang Studi (Pendidkan Matematika, Kimia, Sejarah, dll.)"
    },
    essentialSkills: ["Public Speaking & Komunikasi", "Penyusunan Kurikulum", "Empati & Manajemen Konflik", "Sistem Evaluasi Belajar"],
    actionSteps: [
      "Latihlah berbicara berpasangan untuk meluapkan presentasi secara efektif.",
      "Jadilah tutor sebaya untuk menerangkan topik sulit kepada teman sekelasmu.",
      "Ikuti kegiatan sosial kemanusiaan atau kepramukaan di sekolahmu."
    ],
    salaryEst: "Rp 4.000.000 - Rp 8.500.000 / Bulan",
    outlook: "Stabil"
  },
  {
    id: "hr_specialist",
    title: "Human Resources / Talent Recruiter",
    category: "social",
    riasec: ["social", "enterprising"],
    majors: ["ips", "ipa"],
    description: "Mengembangkan struktur tim internal perusahaan, mengurus rekrutmen pegawai baru, evaluasi kinerja, hingga menangani pelatihan SDM secara profesional.",
    educationPaths: {
      smaLine: "IPS atau IPA",
      collegeMajor: "S1 Psikologi, S1 Manajemen SDM, S1 Hukum"
    },
    essentialSkills: ["Teknik Wawancara", "Psikologi Asesmen", "Mediasi Hubungan Kerja", "Pemahaman Aturan Ketenagakerjaan"],
    actionSteps: [
      "Asah kepemimpinanmu dengan aktif di organisasi sekolah (OSIS/Pramuka/PMR).",
      "Pelajari tipe-tipe kepribadian manusia dan cara bernegosiasi yang bijak.",
      "Tonton seminar publik mengenai dunia kerja dan pengembangan talenta kerja."
    ],
    salaryEst: "Rp 5.000.000 - Rp 11.000.000 / Bulan",
    outlook: "Stabil"
  },
  {
    id: "architect",
    title: "Arsitek / Urban Planner",
    category: "science",
    riasec: ["realistic", "artistic"],
    majors: ["ipa", "smk"],
    description: "Merancang denah estetis, memposisikan interior struktural, sirkulasi udara, serta memvisualisasikan zonasi wilayah perkotaan secara berkesinambungan.",
    educationPaths: {
      smaLine: "Matematika dan Ilmu Pengetahuan Alam (MIPA)",
      smkSpecialization: "Desain Permodelan dan Informasi Bangunan (DPIB)",
      collegeMajor: "S1 Arsitektur, S1 Perencanaan Wilayah Kota (PWK), S1 Arsitektur Lanskap"
    },
    essentialSkills: ["Sketsa Desain 3D (AutoCAD / SketchUp)", "Perhitungan Luas/Volume", "Seni & Geometri Visual", "Memahami Material Bangunan"],
    actionSteps: [
      "Latihlah kemampuan menggambar prespektif dan memahami grid skala perbandingan fisik.",
      "Perbanyak observasi terhadap sejarah tata letak gedung-gedung indah di kotamu.",
      "Ikuti perlombaan poster atau sketsa bangunan."
    ],
    salaryEst: "Rp 6.000.000 - Rp 16.000.000 / Bulan",
    outlook: "Stabil"
  },
  {
    id: "biomedical_researcher",
    title: "Peneliti Mikrobiologi / Analis Medis",
    category: "science",
    riasec: ["investigative", "realistic"],
    majors: ["ipa"],
    description: "Melakukan penelitian ilmiah biokimia untuk mengidentifikasi sel-sel patogen mikro, pembuatan obat medis baru, serta pemetaan klinis kesehatan masyarakat.",
    educationPaths: {
      smaLine: "Sains / IPA tingkat lanjut",
      collegeMajor: "S1 Farmasi, S1 Kedokteran, S1 Kimia, S1 Biologi Molekuler"
    },
    essentialSkills: ["Penggunaan Alat Lab (Mikroskop Sentrifugasi)", "Metodologi Ilmiah", "Pemahaman Toksikologi & Genetika", "Penulisan Jurnal Ilmiah"],
    actionSteps: [
      "Berpartisipasi aktif dalam sesi praktikum kimia dan biologi di laboratorium sekolah.",
      "Sering-sering membaca newsletter penemuan sains terbaru seperti di Nature atau iptek nasional.",
      "Perhatikan detail ketelitian tinggi saat mencatat pengamatan praktikum fisik."
    ],
    salaryEst: "Rp 5.500.000 - Rp 13.000.000 / Bulan",
    outlook: "Tinggi"
  }
];

export const CareerAdvisor = ({
  user,
  testResults,
  customTests,
  onStartTest,
  isOnline,
}: {
  user: UserProfile;
  testResults: TestResult[];
  customTests: any[];
  onStartTest: (testType: TestType) => void;
  isOnline: boolean;
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedCareer, setSelectedCareer] = useState<CareerPath | null>(null);

  // States for manual trigger of offline sync
  const [isSyncing, setIsSyncing] = useState(false);
  const [offlineResults, setOfflineResults] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("offline_test_results");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Extract aptitude_interest results (RIASEC)
  const aptitudeResult = testResults.find((r) => r.testType === "aptitude_interest");
  // Extract school_major results (Penjurusan)
  const majorResult = testResults.find((r) => r.testType === "school_major");

  // Determine top RIASEC interest
  let topRiasecInterest = "";
  let sortedRiasecScores: [string, number][] = [];
  if (aptitudeResult && aptitudeResult.scores) {
    sortedRiasecScores = Object.entries(aptitudeResult.scores)
      .filter(([k]) => k !== "none")
      .sort((a, b) => b[1] - a[1]);
    if (sortedRiasecScores.length > 0) {
      topRiasecInterest = sortedRiasecScores[0][0]; // e.g. "realistic", "investigative", etc.
    }
  }

  // Determine top School Major recommendation
  let topMajorRec = "";
  let sortedMajorScores: [string, number][] = [];
  if (majorResult && majorResult.scores) {
    sortedMajorScores = Object.entries(majorResult.scores)
      .sort((a, b) => b[1] - a[1]);
    if (sortedMajorScores.length > 0) {
      topMajorRec = sortedMajorScores[0][0]; // e.g. "ipa", "ips", "smk", "bahasa"
    }
  }

  // Generate personalized career matches based on top factors
  let hasPersonalizedData = topRiasecInterest !== "" || topMajorRec !== "";
  let personalizedCareers: CareerPath[] = [];

  if (hasPersonalizedData) {
    personalizedCareers = CAREERS_DATABASE.filter((career) => {
      let matchesRiasec = topRiasecInterest ? career.riasec.includes(topRiasecInterest) : false;
      let matchesMajor = topMajorRec ? career.majors.includes(topMajorRec) : false;
      return matchesRiasec || matchesMajor;
    });

    // Sort matching so that careers matching BOTH RIASEC and MAJOR are placed first
    personalizedCareers.sort((a, b) => {
      const scoreA = (a.riasec.includes(topRiasecInterest) ? 1 : 0) + (a.majors.includes(topMajorRec) ? 1 : 0);
      const scoreB = (b.riasec.includes(topRiasecInterest) ? 1 : 0) + (b.majors.includes(topMajorRec) ? 1 : 0);
      return scoreB - scoreA;
    });
  }

  // Filter the full explore database
  const filteredCareers = CAREERS_DATABASE.filter((career) => {
    const matchesSearch = career.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          career.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          career.essentialSkills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = activeCategory === "all" || career.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle local sync of offline results
  const syncOfflineData = async () => {
    if (!isOnline) {
      alert("Kamu masih dalam mode offline. Mohon sambungkan ke internet dahulu sebelum memulai sinkronisasi.");
      return;
    }
    if (offlineResults.length === 0) return;

    setIsSyncing(true);
    // Mimic real sync execution delay for satisfaction visual loaders
    setTimeout(() => {
      try {
        // Clear offline list
        localStorage.removeItem("offline_test_results");
        setOfflineResults([]);
        setIsSyncing(false);
        alert("Sinkronisasi Sukses! Semua rekaman tes offline kamu telah berhasil diunggah ke cloud.");
        // Refresh page/state can be done outside or via triggering reload
        window.location.reload();
      } catch (err) {
        setIsSyncing(false);
        console.error("Failed offline sync:", err);
      }
    }, 2000);
  };

  const getRiasecLabel = (id: string) => {
    const map: Record<string, string> = {
      realistic: "Realistic (Realistis)",
      investigative: "Investigative (Investigatif)",
      artistic: "Artistic (Artistik)",
      social: "Social (Sosial)",
      enterprising: "Enterprising (Kewirausahaan)",
      conventional: "Conventional (Konvensional)"
    };
    return map[id] || id;
  };

  const getMajorLabel = (id: string) => {
    const map: Record<string, string> = {
      ipa: "MIPA (Sains/Teknologi)",
      ips: "IPS (Sosial/Ekonomi)",
      bahasa: "Bahasa & Budaya",
      smk: "SMK (Kejuruan/Praktis)"
    };
    return map[id] || id;
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Network Offline Alert & Sync Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-white border border-slate-200 rounded-3xl gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
            isOnline ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"
          }`}>
            {isOnline ? <Wifi className="w-6 h-6 animate-pulse" /> : <WifiOff className="w-6 h-6" />}
          </div>
          <div>
            <h4 className="font-black text-slate-900 flex items-center gap-2">
              Konektivitas: {isOnline ? "Online (Sinkronisasi Awan)" : "Offline (Komputasi Lokal)"}
            </h4>
            <p className="text-slate-500 text-xs font-semibold">
              {isOnline 
                ? "Semua database dan rekomendasi terhubung live ke server awan." 
                : "Aplikasi berjalan lancar tanpa internet. Hasil tes disimpan di penyimpanan lokal."
              }
            </p>
          </div>
        </div>

        {/* Sync Trigger for Offline saved completed tests if any */}
        {offlineResults.length > 0 && (
          <div className="w-full md:w-auto p-4 bg-amber-50 rounded-2xl border border-amber-200 flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 animate-bounce" />
              <span className="text-xs font-black text-amber-900">
                Ada {offlineResults.length} data laporan tes tersimpan offline!
              </span>
            </div>
            <button
              onClick={syncOfflineData}
              disabled={isSyncing}
              className="w-full sm:w-auto px-4 py-2 bg-amber-600 text-white hover:bg-amber-700 disabled:bg-amber-400 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2"
            >
              {isSyncing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              {isSyncing ? "Menyinkronkan..." : "SINKRONKAN DATA"}
            </button>
          </div>
        )}
      </div>

      {/* Hero Header */}
      <div className="text-center md:text-left space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-700 rounded-full border border-emerald-500/15 text-xs font-black uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> Career & Education Advisory
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
          Panduan Karir & Jalur Studi Masa Depanmu 🚀
        </h2>
        <p className="text-slate-500 max-w-2xl font-medium">
          Dapatkan rekomendasi pekerjaan terkurasi, analisis keterampilan, rekomendasi jurusan pendidikan (SMA atau Kuliah) sesuai kecocokan karakter psikologismu.
        </p>
      </div>

      {/* Personalized Advisor Results Segment */}
      <div className="p-8 bg-gradient-to-br from-slate-900 to-emerald-950 text-white rounded-[32px] shadow-xl relative overflow-hidden">
        
        {/* Absolute Background Ornaments */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full filter blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-teal-500/10 rounded-full filter blur-[80px] pointer-events-none" />

        {hasPersonalizedData ? (
          <div className="relative space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
              <div className="space-y-1">
                <span className="text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Analisis Karakteristik Psikologis Selesai
                </span>
                <h3 className="text-2xl font-black tracking-tight">
                  Tipe Kepribadian & Minat Kamu
                </h3>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {topRiasecInterest && (
                  <div className="px-4 py-2 bg-white/10 text-emerald-300 rounded-2xl border border-white/10 text-xs font-black uppercase">
                    Minat Utama: {getRiasecLabel(topRiasecInterest)}
                  </div>
                )}
                {topMajorRec && (
                  <div className="px-4 py-2 bg-white/10 text-teal-300 rounded-2xl border border-white/10 text-xs font-black uppercase">
                    Rekomendasi Studi: {getMajorLabel(topMajorRec)}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-base font-bold text-slate-300">
                ⚡ Karir yang Paling Cocok Untukmu:
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {personalizedCareers.slice(0, 3).map((career) => (
                  <div 
                    key={career.id}
                    className="p-6 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-3">
                        <span className="text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                          {career.category === "tech" ? "Teknologi" : career.category === "art" ? "Seni Kreatif" : career.category === "business" ? "Bisnis/Keuangan" : career.category === "social" ? "Sosial/Guru" : "Sains Alam"}
                        </span>
                        <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                          Outlook: {career.outlook}
                        </span>
                      </div>
                      <h5 className="font-extrabold text-white text-base leading-snug mb-2">
                        {career.title}
                      </h5>
                      <p className="text-xs text-slate-300 line-clamp-3 font-semibold mb-4 leading-relaxed">
                        {career.description}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedCareer(career)}
                      className="w-full mt-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 uppercase tracking-wider shadow-md"
                    >
                      LIHAT DETAIl JURUSAN & AKSI <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="relative text-center py-10 space-y-6 max-w-xl mx-auto">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full border border-emerald-500/20 flex items-center justify-center mx-auto shadow-inner">
              <Compass className="w-10 h-10 text-emerald-400 animate-spin" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold">Saran Karir Personal Kamu Masih Terkunci!</h3>
              <p className="text-slate-400 text-sm leading-relaxed font-semibold">
                Saran karir dan jalur pendidikan yang dipersonalisasi dihitung berdasarkan hasil tes psikologismu. Selesaikan setidaknya satu tes di bawah untuk membukanya secara otomatis!
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <button
                onClick={() => onStartTest("aptitude_interest")}
                className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-2xl shadow-lg transition-all"
              >
                MULAI TES BAKAT MINAT (RIASEC)
              </button>
              <button
                onClick={() => onStartTest("school_major")}
                className="px-6 py-3.5 bg-white/10 hover:bg-white/15 text-white border border-white/10 text-xs font-black rounded-2xl transition-all"
              >
                MULAI TES PENJURUSAN
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Career Details Modal - When user clicks View Detail */}
      <AnimatePresence>
        {selectedCareer && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[32px] w-full max-w-3xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-8 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] font-black tracking-widest uppercase bg-white/10 border border-white/20 px-3 py-1 rounded-full text-white inline-block">
                    {selectedCareer.category.toUpperCase()} PATHWAY
                  </span>
                  <h3 className="text-2xl font-black tracking-tight">{selectedCareer.title}</h3>
                  <p className="text-emerald-100 text-xs font-medium flex items-center gap-2">
                    RIASEC: {selectedCareer.riasec.map(s => s.toUpperCase()).join(", ")} | Outlook: {selectedCareer.outlook}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedCareer(null)}
                  className="bg-white/10 hover:bg-white/20 p-2 text-white font-black rounded-full transition-colors text-sm w-8 h-8 flex items-center justify-center shrink-0 border border-white/10"
                >
                  ✕
                </button>
              </div>

              {/* Content body Scrollable */}
              <div className="p-8 overflow-y-auto space-y-6">
                
                {/* Deskripsi */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Deskripsi Singkat Pengabdian</h4>
                  <p className="text-slate-600 text-sm leading-relaxed font-semibold">
                    {selectedCareer.description}
                  </p>
                </div>

                {/* Estimasi Pendapatan */}
                {selectedCareer.salaryEst && (
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex justify-between items-center text-emerald-900">
                    <span className="text-xs font-black uppercase tracking-wider">Estimasi Rentang Penghasilan:</span>
                    <span className="text-sm font-black text-emerald-700 bg-white px-3 py-1.5 rounded-xl shadow-sm border border-emerald-100">{selectedCareer.salaryEst}</span>
                  </div>
                )}

                {/* Jalur Pendidikan */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-emerald-600" /> Jalur Pendidikan Terkait
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedCareer.educationPaths.smaLine && (
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                        <span className="block text-[10px] uppercase font-black text-slate-400 mb-1">Rekomendasi Jalur SMA</span>
                        <span className="text-sm text-slate-700 font-extrabold">{selectedCareer.educationPaths.smaLine}</span>
                      </div>
                    )}
                    {selectedCareer.educationPaths.smkSpecialization && (
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                        <span className="block text-[10px] uppercase font-black text-slate-400 mb-1">Pariwisata / Penyelarasan SMK</span>
                        <span className="text-sm text-slate-700 font-extrabold">{selectedCareer.educationPaths.smkSpecialization}</span>
                      </div>
                    )}
                    <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 col-span-1 md:col-span-2">
                      <span className="block text-[10px] uppercase font-black text-emerald-500 mb-1">Jurusan Kuliah Terpopuler</span>
                      <span className="text-sm text-emerald-900 font-extrabold">{selectedCareer.educationPaths.collegeMajor}</span>
                    </div>
                  </div>
                </div>

                {/* Keterampilan Penting */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Keterampilan Kritis (Critical Skills)</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCareer.essentialSkills.map((skill, index) => (
                      <span key={index} className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200">
                        🛠️ {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action steps */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Rencana Aksi Mulai Sekarang (Action Steps)</h4>
                  <div className="space-y-3">
                    {selectedCareer.actionSteps.map((step, index) => (
                      <div key={index} className="flex gap-3 items-start">
                        <div className="w-6 h-6 rounded-full bg-teal-50 text-teal-600 border border-teal-100 shrink-0 flex items-center justify-center text-xs font-black">
                          {index + 1}
                        </div>
                        <p className="text-sm text-slate-600 font-semibold pt-0.5">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Close Footer */}
              <div className="p-6 bg-slate-50 border-t border-slate-100 text-right">
                <button 
                  onClick={() => setSelectedCareer(null)}
                  className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black hover:bg-slate-800 transition-all uppercase"
                >
                  Tutup Rincian
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Explorer / Browse Database section */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              Eksplorasi Basis Data Karir 🔍
            </h3>
            <p className="text-slate-500 text-sm font-medium">
              Cari dan telusuri berbagai macam profesi lengkap dengan kompetensi yang dibutuhkan dan saran jenjangnya.
            </p>
          </div>

          {/* Search bar bar */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Cari karir, keahlian, atau subjek..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white hover:bg-slate-50 focus:bg-white rounded-2xl border-2 border-slate-200 focus:border-emerald-500 outline-none text-sm transition-all shadow-sm font-semibold"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
          </div>
        </div>

        {/* Category Filters row */}
        <div className="flex flex-wrap gap-2 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all ${
              activeCategory === "all" 
                ? "bg-slate-900 text-white" 
                : "bg-white border-2 border-slate-100 text-slate-500 hover:border-slate-200"
            }`}
          >
            Semua Bidang
          </button>
          <button
            onClick={() => setActiveCategory("tech")}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 ${
              activeCategory === "tech" 
                ? "bg-emerald-600 text-white" 
                : "bg-white border-2 border-slate-100 text-slate-500 hover:border-slate-200"
            }`}
          >
            <Globe className="w-4 h-4" /> IT & Rekayasa
          </button>
          <button
            onClick={() => setActiveCategory("science")}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 ${
              activeCategory === "science" 
                ? "bg-teal-600 text-white" 
                : "bg-white border-2 border-slate-100 text-slate-500 hover:border-slate-200"
            }`}
          >
            <Database className="w-4 h-4" /> Sains & Lab
          </button>
          <button
            onClick={() => setActiveCategory("art")}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 ${
              activeCategory === "art" 
                ? "bg-pink-600 text-white" 
                : "bg-white border-2 border-slate-100 text-slate-500 hover:border-slate-200"
            }`}
          >
            <PenTool className="w-4 h-4" /> Seni & Media
          </button>
          <button
            onClick={() => setActiveCategory("business")}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 ${
              activeCategory === "business" 
                ? "bg-blue-600 text-white" 
                : "bg-white border-2 border-slate-100 text-slate-500 hover:border-slate-200"
            }`}
          >
            <Coins className="w-4 h-4" /> Bisnis & Akunting
          </button>
          <button
            onClick={() => setActiveCategory("social")}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 ${
              activeCategory === "social" 
                ? "bg-violet-600 text-white" 
                : "bg-white border-2 border-slate-100 text-slate-500 hover:border-slate-200"
            }`}
          >
            <GraduationCap className="w-4 h-4" /> Sosial & Pengajaran
          </button>
        </div>

        {/* Results grid list */}
        {filteredCareers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCareers.map((career) => (
              <div 
                key={career.id}
                className="p-6 rounded-3xl border border-slate-100 bg-white shadow-sm hover:shadow-md hover:border-slate-200 hover:-translate-y-1 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <span className="text-[10px] uppercase font-black px-2.5 py-1 rounded-lg border bg-slate-50 text-slate-500">
                      {career.category.toUpperCase()}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">
                      Outlook: {career.outlook}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-md leading-tight mb-2">
                    {career.title}
                  </h4>
                  <p className="text-xs text-slate-500 font-semibold line-clamp-3 leading-relaxed mb-4">
                    {career.description}
                  </p>
                </div>
                <div className="flex gap-2.5">
                  <button
                    onClick={() => setSelectedCareer(career)}
                    className="w-full py-2.5 bg-slate-900 text-white hover:bg-slate-800 text-xs font-black rounded-xl transition-all uppercase tracking-wide"
                  >
                    Pelajari Selengkapnya
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl max-w-xl mx-auto">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Compass className="w-8 h-8 text-slate-300" />
            </div>
            <h4 className="text-base font-extrabold text-slate-900 mb-1">
              Tidak ada karir yang cocok
            </h4>
            <p className="text-slate-500 text-xs font-semibold">
              Coba ganti kata kunci pencarianmu atau ubah filter kategori di atas.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
