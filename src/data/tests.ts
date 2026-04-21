import { TestData, TestType } from '../types';

export const TESTS: Record<TestType, TestData> = {
  learning_style: {
    title: "Tes Gaya Belajar",
    description: "Kenali cara terbaikmu dalam menyerap informasi: Visual, Auditori, atau Kinestetik.",
    questions: [
      { id: "ls1", text: "Ketika menghafal sesuatu, saya biasanya...", options: [{ text: "Melihat gambar atau tulisan di pikiran saya", value: "visual" }, { text: "Mengucapkannya berulang-ulang dengan suara keras", value: "auditory" }, { text: "Menuliskannya berulang kali atau mempraktikkannya", value: "kinesthetic" }] },
      { id: "ls2", text: "Saya lebih mudah memahami instruksi jika...", options: [{ text: "Diberikan dalam bentuk diagram atau peta", value: "visual" }, { text: "Dijelaskan secara lisan oleh guru", value: "auditory" }, { text: "Saya langsung mencoba melakukannya sendiri", value: "kinesthetic" }] },
      { id: "ls3", text: "Saat sedang santai, saya lebih suka...", options: [{ text: "Membaca buku atau komik", value: "visual" }, { text: "Mendengarkan musik atau podcast", value: "auditory" }, { text: "Berolahraga atau membuat sesuatu dengan tangan", value: "kinesthetic" }] },
      { id: "ls4", text: "Saat mengeja kata, saya biasanya...", options: [{ text: "Membayangkan kata tersebut di kepala", value: "visual" }, { text: "Mengucapkan huruf-hurufnya dengan suara pelan", value: "auditory" }, { text: "Menuliskan kata tersebut di kertas atau di udara", value: "kinesthetic" }] },
      { id: "ls5", text: "Saya paling terganggu saat belajar jika ada...", options: [{ text: "Pemandangan yang berantakan di sekitar saya", value: "visual" }, { text: "Suara bising atau orang yang mengobrol", value: "auditory" }, { text: "Kursi yang tidak nyaman atau suhu ruangan yang buruk", value: "kinesthetic" }] },
      { id: "ls6", text: "Ketika saya sedang marah, saya cenderung...", options: [{ text: "Menjadi diam dan cemberut", value: "visual" }, { text: "Berteriak atau mengomel", value: "auditory" }, { text: "Membanting pintu atau berjalan mondar-mendir", value: "kinesthetic" }] },
      { id: "ls7", text: "Saat bertemu orang baru, saya paling ingat...", options: [{ text: "Wajah mereka tapi lupa namanya", value: "visual" }, { text: "Nama mereka tapi lupa wajahnya", value: "auditory" }, { text: "Apa yang kami lakukan bersama atau jabat tangannya", value: "kinesthetic" }] },
      { id: "ls8", text: "Saya lebih suka guru yang mengajar dengan...", options: [{ text: "Banyak menggunakan slide, video, dan papan tulis", value: "visual" }, { text: "Banyak bercerita dan berdiskusi", value: "auditory" }, { text: "Banyak memberikan tugas praktik atau simulasi", value: "kinesthetic" }] },
      { id: "ls9", text: "Saat merakit mainan baru, saya biasanya...", options: [{ text: "Melihat gambar petunjuknya terlebih dahulu", value: "visual" }, { text: "Membaca instruksinya dengan suara keras", value: "auditory" }, { text: "Langsung mencoba memasangnya tanpa melihat petunjuk", value: "kinesthetic" }] },
      { id: "ls10", text: "Hobi yang paling saya sukai adalah...", options: [{ text: "Melukis, fotografi, atau menonton film", value: "visual" }, { text: "Bermain musik, bernyanyi, atau mendengarkan radio", value: "auditory" }, { text: "Menari, berkebun, atau olahraga fisik", value: "kinesthetic" }] },
      { id: "ls11", text: "Saat berbicara dengan orang lain, saya cenderung...", options: [{ text: "Melihat langsung ke mata mereka", value: "visual" }, { text: "Mendengarkan dengan seksama tanpa banyak melihat", value: "auditory" }, { text: "Banyak menggunakan gerakan tangan atau menyentuh", value: "kinesthetic" }] },
      { id: "ls12", text: "Saya merasa paling nyaman belajar di...", options: [{ text: "Ruangan yang terang dan bersih", value: "visual" }, { text: "Ruangan yang tenang atau ada musik latar lembut", value: "auditory" }, { text: "Ruangan yang luas agar saya bisa bebas bergerak", value: "kinesthetic" }] },
      { id: "ls13", text: "Saat mengingat perjalanan liburan, saya paling ingat...", options: [{ text: "Pemandangan indah yang saya lihat", value: "visual" }, { text: "Suara ombak, musik, atau percakapan di sana", value: "auditory" }, { text: "Perasaan senang saat berenang atau mendaki", value: "kinesthetic" }] },
      { id: "ls14", text: "Jika saya harus belajar cara menggunakan komputer, saya lebih suka...", options: [{ text: "Menonton video tutorial", value: "visual" }, { text: "Mendengarkan penjelasan seseorang", value: "auditory" }, { text: "Langsung mencoba menekan tombol-tombolnya", value: "kinesthetic" }] },
      { id: "ls15", text: "Saat menunggu antrean yang lama, saya biasanya...", options: [{ text: "Melihat-lihat sekeliling atau membaca brosur", value: "visual" }, { text: "Berbicara dengan orang di sebelah atau bersenandung", value: "auditory" }, { text: "Menggerak-gerakkan kaki atau berjalan kecil", value: "kinesthetic" }] },
      { id: "ls16", text: "Saya lebih mudah menghafal lirik lagu jika...", options: [{ text: "Membaca teks liriknya", value: "visual" }, { text: "Mendengarkan lagunya berulang kali", value: "auditory" }, { text: "Menyanyikannya sambil menari atau bergerak", value: "kinesthetic" }] },
      { id: "ls17", text: "Saat mengerjakan tugas kelompok, saya lebih suka bagian...", options: [{ text: "Membuat poster atau desain presentasi", value: "visual" }, { text: "Menjadi pembicara saat presentasi", value: "auditory" }, { text: "Membuat maket atau alat peraga", value: "kinesthetic" }] },
      { id: "ls18", text: "Saya sering menggunakan kata-kata seperti...", options: [{ text: "\"Saya lihat...\" atau \"Kelihatannya...\"", value: "visual" }, { text: "\"Saya dengar...\" atau \"Kedengarannya...\"", value: "auditory" }, { text: "\"Saya rasa...\" atau \"Rasanya...\"", value: "kinesthetic" }] },
      { id: "ls19", text: "Saat membaca buku, saya paling menikmati...", options: [{ text: "Deskripsi detail tentang latar dan suasana", value: "visual" }, { text: "Dialog antar tokoh yang menarik", value: "auditory" }, { text: "Aksi dan petualangan yang mendebarkan", value: "kinesthetic" }] },
      { id: "ls20", text: "Saya merasa paling pintar saat...", options: [{ text: "Bisa memvisualisasikan ide yang rumit", value: "visual" }, { text: "Bisa menjelaskan sesuatu dengan kata-kata yang jelas", value: "auditory" }, { text: "Bisa memperbaiki atau membuat sesuatu yang nyata", value: "kinesthetic" }] },
      { id: "ls21", text: "Saat belajar sejarah, saya lebih suka...", options: [{ text: "Melihat peta dan garis waktu", value: "visual" }, { text: "Mendengarkan rekaman pidato atau cerita sejarah", value: "auditory" }, { text: "Mengunjungi museum atau situs bersejarah", value: "kinesthetic" }] },
      { id: "ls22", text: "Ketika saya bingung mencari jalan, saya lebih suka...", options: [{ text: "Melihat peta atau aplikasi navigasi", value: "visual" }, { text: "Bertanya kepada orang di jalan", value: "auditory" }, { text: "Terus berjalan sampai saya merasa jalannya benar", value: "kinesthetic" }] },
      { id: "ls23", text: "Saat menonton film, saya paling terkesan dengan...", options: [{ text: "Efek visual dan sinematografinya", value: "visual" }, { text: "Musik latar dan kualitas suaranya", value: "auditory" }, { text: "Emosi dan gerakan fisik para aktornya", value: "kinesthetic" }] },
      { id: "ls24", text: "Saya lebih suka belajar bahasa baru dengan...", options: [{ text: "Melihat kartu kata (flashcards)", value: "visual" }, { text: "Mendengarkan percakapan penutur asli", value: "auditory" }, { text: "Mempraktikkan percakapan langsung", value: "kinesthetic" }] },
      { id: "ls25", text: "Saat presentasi di depan kelas, saya merasa terbantu jika...", options: [{ text: "Ada catatan tertulis atau slide", value: "visual" }, { text: "Saya sudah melatih apa yang akan saya katakan", value: "auditory" }, { text: "Saya bisa bergerak atau menggunakan alat peraga", value: "kinesthetic" }] },
      { id: "ls26", text: "Jika saya bosan di kelas, saya biasanya...", options: [{ text: "Menggambar coretan di buku", value: "visual" }, { text: "Mengobrol dengan teman", value: "auditory" }, { text: "Memainkan pulpen atau menggoyang kaki", value: "kinesthetic" }] },
      { id: "ls27", text: "Saya lebih suka hadiah berupa...", options: [{ text: "Buku, lukisan, atau barang pajangan", value: "visual" }, { text: "Alat musik, headphone, atau tiket konser", value: "auditory" }, { text: "Peralatan olahraga atau kit kerajinan tangan", value: "kinesthetic" }] },
      { id: "ls28", text: "Saat memecahkan masalah, saya biasanya...", options: [{ text: "Membuat daftar pro dan kontra secara tertulis", value: "visual" }, { text: "Membicarakannya dengan orang lain", value: "auditory" }, { text: "Mencoba berbagai solusi secara langsung", value: "kinesthetic" }] },
      { id: "ls29", text: "Saya paling mudah mengingat informasi jika...", options: [{ text: "Informasi tersebut berwarna-warni", value: "visual" }, { text: "Informasi tersebut disampaikan dalam bentuk rima", value: "auditory" }, { text: "Saya terlibat langsung dalam prosesnya", value: "kinesthetic" }] },
      { id: "ls30", text: "Secara keseluruhan, saya merasa paling efektif belajar jika...", options: [{ text: "Saya bisa melihat apa yang dipelajari", value: "visual" }, { text: "Saya bisa mendengar apa yang dipelajari", value: "auditory" }, { text: "Saya bisa melakukan apa yang dipelajari", value: "kinesthetic" }] },
      { id: "ls31", text: "Saat belajar hal baru, saya lebih suka...", options: [{ text: "Melihat demonstrasi atau video", value: "visual" }, { text: "Mendengarkan penjelasan langkah demi langkah", value: "auditory" }, { text: "Langsung mempraktikkannya sendiri", value: "kinesthetic" }] },
      { id: "ls32", text: "Saya lebih suka membaca buku yang memiliki...", options: [{ text: "Banyak ilustrasi dan gambar", value: "visual" }, { text: "Gaya bahasa yang enak didengar jika dibaca keras", value: "auditory" }, { text: "Petunjuk praktis yang bisa langsung dicoba", value: "kinesthetic" }] },
      { id: "ls33", text: "Saat mengingat nama seseorang, saya biasanya...", options: [{ text: "Mengingat wajahnya dengan sangat jelas", value: "visual" }, { text: "Mengingat suara atau cara bicaranya", value: "auditory" }, { text: "Mengingat perasaan saat bersalaman dengannya", value: "kinesthetic" }] },
      { id: "ls34", text: "Saya merasa lebih mudah belajar di kelas yang...", options: [{ text: "Banyak menggunakan alat peraga visual", value: "visual" }, { text: "Banyak sesi diskusi dan tanya jawab", value: "auditory" }, { text: "Banyak kegiatan praktikum atau lapangan", value: "kinesthetic" }] },
      { id: "ls35", text: "Saat mencoba resep masakan baru, saya lebih suka...", options: [{ text: "Melihat foto hasil jadinya", value: "visual" }, { text: "Mendengarkan instruksi dari orang lain", value: "auditory" }, { text: "Langsung mencoba memasaknya", value: "kinesthetic" }] },
      { id: "ls36", text: "Saya sering mencoret-coret kertas saat...", options: [{ text: "Sedang berpikir atau melamun", value: "visual" }, { text: "Sedang mendengarkan telepon atau penjelasan", value: "auditory" }, { text: "Sedang merasa bosan dan ingin bergerak", value: "kinesthetic" }] },
      { id: "ls37", text: "Saat belajar matematika, saya lebih terbantu dengan...", options: [{ text: "Grafik dan visualisasi rumus", value: "visual" }, { text: "Penjelasan logika secara lisan", value: "auditory" }, { text: "Menggunakan alat hitung atau benda nyata", value: "kinesthetic" }] },
      { id: "ls38", text: "Saya lebih suka menghabiskan waktu luang dengan...", options: [{ text: "Menonton TV atau YouTube", value: "visual" }, { text: "Mendengarkan musik atau radio", value: "auditory" }, { text: "Bermain game yang aktif atau olahraga", value: "kinesthetic" }] },
      { id: "ls39", text: "Saat menjelaskan sesuatu, saya cenderung...", options: [{ text: "Menggambar atau menunjukkan sesuatu", value: "visual" }, { text: "Menggunakan banyak variasi nada suara", value: "auditory" }, { text: "Banyak menggunakan gerakan tubuh", value: "kinesthetic" }] },
      { id: "ls40", text: "Saya merasa paling cepat paham jika materi...", options: [{ text: "Disajikan dalam bentuk infografis", value: "visual" }, { text: "Disampaikan melalui podcast atau ceramah", value: "auditory" }, { text: "Diberikan dalam bentuk proyek nyata", value: "kinesthetic" }] }
    ]
  },
  multiple_intelligences: {
    title: "Tes Kecerdasan Majemuk",
    description: "Temukan potensi kecerdasan dominanmu dari 8 jenis kecerdasan Howard Gardner.",
    questions: [
      { id: "mi1", text: "Saya suka bermain dengan kata-kata, teka-teki silang, atau menulis cerita.", options: [{ text: "Sangat Tidak Setuju", value: "linguistic", score: 1 }, { text: "Tidak Setuju", value: "linguistic", score: 2 }, { text: "Setuju", value: "linguistic", score: 3 }, { text: "Sangat Setuju", value: "linguistic", score: 4 }] },
      { id: "mi2", text: "Saya mudah memahami pola angka dan suka memecahkan masalah logika.", options: [{ text: "Sangat Tidak Setuju", value: "logical", score: 1 }, { text: "Tidak Setuju", value: "logical", score: 2 }, { text: "Setuju", value: "logical", score: 3 }, { text: "Sangat Setuju", value: "logical", score: 4 }] },
      { id: "mi3", text: "Saya suka menggambar, merancang sesuatu, atau membayangkan ruang.", options: [{ text: "Sangat Tidak Setuju", value: "spatial", score: 1 }, { text: "Tidak Setuju", value: "spatial", score: 2 }, { text: "Setuju", value: "spatial", score: 3 }, { text: "Sangat Setuju", value: "spatial", score: 4 }] },
      { id: "mi4", text: "Saya suka berolahraga, menari, atau aktivitas fisik lainnya.", options: [{ text: "Sangat Tidak Setuju", value: "kinesthetic", score: 1 }, { text: "Tidak Setuju", value: "kinesthetic", score: 2 }, { text: "Setuju", value: "kinesthetic", score: 3 }, { text: "Sangat Setuju", value: "kinesthetic", score: 4 }] },
      { id: "mi5", text: "Saya peka terhadap nada, irama, dan melodi musik.", options: [{ text: "Sangat Tidak Setuju", value: "musical", score: 1 }, { text: "Tidak Setuju", value: "musical", score: 2 }, { text: "Setuju", value: "musical", score: 3 }, { text: "Sangat Setuju", value: "musical", score: 4 }] },
      { id: "mi6", text: "Saya mudah memahami perasaan orang lain dan suka bekerja dalam tim.", options: [{ text: "Sangat Tidak Setuju", value: "interpersonal", score: 1 }, { text: "Tidak Setuju", value: "interpersonal", score: 2 }, { text: "Setuju", value: "interpersonal", score: 3 }, { text: "Sangat Setuju", value: "interpersonal", score: 4 }] },
      { id: "mi7", text: "Saya suka merenung dan memahami kekuatan serta kelemahan diri sendiri.", options: [{ text: "Sangat Tidak Setuju", value: "intrapersonal", score: 1 }, { text: "Tidak Setuju", value: "intrapersonal", score: 2 }, { text: "Setuju", value: "intrapersonal", score: 3 }, { text: "Sangat Setuju", value: "intrapersonal", score: 4 }] },
      { id: "mi8", text: "Saya suka mengamati alam, hewan, dan tumbuhan.", options: [{ text: "Sangat Tidak Setuju", value: "naturalist", score: 1 }, { text: "Tidak Setuju", value: "naturalist", score: 2 }, { text: "Setuju", value: "naturalist", score: 3 }, { text: "Sangat Setuju", value: "naturalist", score: 4 }] },
      { id: "mi9", text: "Saya menikmati membaca buku yang menantang pikiran.", options: [{ text: "Sangat Tidak Setuju", value: "linguistic", score: 1 }, { text: "Tidak Setuju", value: "linguistic", score: 2 }, { text: "Setuju", value: "linguistic", score: 3 }, { text: "Sangat Setuju", value: "linguistic", score: 4 }] },
      { id: "mi10", text: "Saya suka melakukan eksperimen untuk melihat cara kerja sesuatu.", options: [{ text: "Sangat Tidak Setuju", value: "logical", score: 1 }, { text: "Tidak Setuju", value: "logical", score: 2 }, { text: "Setuju", value: "logical", score: 3 }, { text: "Sangat Setuju", value: "logical", score: 4 }] },
      { id: "mi11", text: "Saya sering membayangkan gambar di kepala saat memecahkan masalah.", options: [{ text: "Sangat Tidak Setuju", value: "spatial", score: 1 }, { text: "Tidak Setuju", value: "spatial", score: 2 }, { text: "Setuju", value: "spatial", score: 3 }, { text: "Sangat Setuju", value: "spatial", score: 4 }] },
      { id: "mi12", text: "Saya merasa lebih baik saat bergerak daripada duduk diam.", options: [{ text: "Sangat Tidak Setuju", value: "kinesthetic", score: 1 }, { text: "Tidak Setuju", value: "kinesthetic", score: 2 }, { text: "Setuju", value: "kinesthetic", score: 3 }, { text: "Sangat Setuju", value: "kinesthetic", score: 4 }] },
      { id: "mi13", text: "Saya bisa mengenali instrumen musik yang berbeda dalam sebuah lagu.", options: [{ text: "Sangat Tidak Setuju", value: "musical", score: 1 }, { text: "Tidak Setuju", value: "musical", score: 2 }, { text: "Setuju", value: "musical", score: 3 }, { text: "Sangat Setuju", value: "musical", score: 4 }] },
      { id: "mi14", text: "Orang sering datang kepada saya untuk meminta nasihat.", options: [{ text: "Sangat Tidak Setuju", value: "interpersonal", score: 1 }, { text: "Tidak Setuju", value: "interpersonal", score: 2 }, { text: "Setuju", value: "interpersonal", score: 3 }, { text: "Sangat Setuju", value: "interpersonal", score: 4 }] },
      { id: "mi15", text: "Saya memiliki tujuan hidup yang jelas dan tahu cara mencapainya.", options: [{ text: "Sangat Tidak Setuju", value: "intrapersonal", score: 1 }, { text: "Tidak Setuju", value: "intrapersonal", score: 2 }, { text: "Setuju", value: "intrapersonal", score: 3 }, { text: "Sangat Setuju", value: "intrapersonal", score: 4 }] },
      { id: "mi16", text: "Saya peduli dengan isu lingkungan dan pelestarian alam.", options: [{ text: "Sangat Tidak Setuju", value: "naturalist", score: 1 }, { text: "Tidak Setuju", value: "naturalist", score: 2 }, { text: "Setuju", value: "naturalist", score: 3 }, { text: "Sangat Setuju", value: "naturalist", score: 4 }] },
      { id: "mi17", text: "Saya suka menulis jurnal atau catatan harian.", options: [{ text: "Sangat Tidak Setuju", value: "linguistic", score: 1 }, { text: "Tidak Setuju", value: "linguistic", score: 2 }, { text: "Setuju", value: "linguistic", score: 3 }, { text: "Sangat Setuju", value: "linguistic", score: 4 }] },
      { id: "mi18", text: "Saya suka permainan strategi seperti catur.", options: [{ text: "Sangat Tidak Setuju", value: "logical", score: 1 }, { text: "Tidak Setuju", value: "logical", score: 2 }, { text: "Setuju", value: "logical", score: 3 }, { text: "Sangat Setuju", value: "logical", score: 4 }] },
      { id: "mi19", text: "Saya pandai membaca peta dan navigasi.", options: [{ text: "Sangat Tidak Setuju", value: "spatial", score: 1 }, { text: "Tidak Setuju", value: "spatial", score: 2 }, { text: "Setuju", value: "spatial", score: 3 }, { text: "Sangat Setuju", value: "spatial", score: 4 }] },
      { id: "mi20", text: "Saya suka membuat kerajinan tangan atau merakit model.", options: [{ text: "Sangat Tidak Setuju", value: "kinesthetic", score: 1 }, { text: "Tidak Setuju", value: "kinesthetic", score: 2 }, { text: "Setuju", value: "kinesthetic", score: 3 }, { text: "Sangat Setuju", value: "kinesthetic", score: 4 }] },
      { id: "mi21", text: "Saya sering bersenandung atau mengetuk-ngetuk irama.", options: [{ text: "Sangat Tidak Setuju", value: "musical", score: 1 }, { text: "Tidak Setuju", value: "musical", score: 2 }, { text: "Setuju", value: "musical", score: 3 }, { text: "Sangat Setuju", value: "musical", score: 4 }] },
      { id: "mi22", text: "Saya suka menghadiri acara sosial dan bertemu orang baru.", options: [{ text: "Sangat Tidak Setuju", value: "interpersonal", score: 1 }, { text: "Tidak Setuju", value: "interpersonal", score: 2 }, { text: "Setuju", value: "interpersonal", score: 3 }, { text: "Sangat Setuju", value: "interpersonal", score: 4 }] },
      { id: "mi23", text: "Saya sering menganalisis emosi dan pikiran saya sendiri.", options: [{ text: "Sangat Tidak Setuju", value: "intrapersonal", score: 1 }, { text: "Tidak Setuju", value: "intrapersonal", score: 2 }, { text: "Setuju", value: "intrapersonal", score: 3 }, { text: "Sangat Setuju", value: "intrapersonal", score: 4 }] },
      { id: "mi24", text: "Saya suka berkebun atau memelihara hewan peliharaan.", options: [{ text: "Sangat Tidak Setuju", value: "naturalist", score: 1 }, { text: "Tidak Setuju", value: "naturalist", score: 2 }, { text: "Setuju", value: "naturalist", score: 3 }, { text: "Sangat Setuju", value: "naturalist", score: 4 }] },
      { id: "mi25", text: "Saya pandai meyakinkan orang lain melalui kata-kata.", options: [{ text: "Sangat Tidak Setuju", value: "linguistic", score: 1 }, { text: "Tidak Setuju", value: "linguistic", score: 2 }, { text: "Setuju", value: "linguistic", score: 3 }, { text: "Sangat Setuju", value: "linguistic", score: 4 }] },
      { id: "mi26", text: "Saya suka menghitung dan mengelola keuangan.", options: [{ text: "Sangat Tidak Setuju", value: "logical", score: 1 }, { text: "Tidak Setuju", value: "logical", score: 2 }, { text: "Setuju", value: "logical", score: 3 }, { text: "Sangat Setuju", value: "logical", score: 4 }] },
      { id: "mi27", text: "Saya suka mendekorasi ruangan atau menata barang.", options: [{ text: "Sangat Tidak Setuju", value: "spatial", score: 1 }, { text: "Tidak Setuju", value: "spatial", score: 2 }, { text: "Setuju", value: "spatial", score: 3 }, { text: "Sangat Setuju", value: "spatial", score: 4 }] },
      { id: "mi28", text: "Saya suka belajar melalui praktik langsung.", options: [{ text: "Sangat Tidak Setuju", value: "kinesthetic", score: 1 }, { text: "Tidak Setuju", value: "kinesthetic", score: 2 }, { text: "Setuju", value: "kinesthetic", score: 3 }, { text: "Sangat Setuju", value: "kinesthetic", score: 4 }] },
      { id: "mi29", text: "Saya suka mendengarkan berbagai jenis musik.", options: [{ text: "Sangat Tidak Setuju", value: "musical", score: 1 }, { text: "Tidak Setuju", value: "musical", score: 2 }, { text: "Setuju", value: "musical", score: 3 }, { text: "Sangat Setuju", value: "musical", score: 4 }] },
      { id: "mi30", text: "Saya suka membantu teman yang sedang dalam masalah.", options: [{ text: "Sangat Tidak Setuju", value: "interpersonal", score: 1 }, { text: "Tidak Setuju", value: "interpersonal", score: 2 }, { text: "Setuju", value: "interpersonal", score: 3 }, { text: "Sangat Setuju", value: "interpersonal", score: 4 }] },
      { id: "mi31", text: "Saya suka mempelajari kata-kata baru dan asal-usulnya.", options: [{ text: "Sangat Tidak Setuju", value: "linguistic", score: 1 }, { text: "Tidak Setuju", value: "linguistic", score: 2 }, { text: "Setuju", value: "linguistic", score: 3 }, { text: "Sangat Setuju", value: "linguistic", score: 4 }] },
      { id: "mi32", text: "Saya suka memecahkan teka-teki logika yang rumit.", options: [{ text: "Sangat Tidak Setuju", value: "logical", score: 1 }, { text: "Tidak Setuju", value: "logical", score: 2 }, { text: "Setuju", value: "logical", score: 3 }, { text: "Sangat Setuju", value: "logical", score: 4 }] },
      { id: "mi33", text: "Saya bisa membayangkan objek dari berbagai sudut pandang dengan mudah.", options: [{ text: "Sangat Tidak Setuju", value: "spatial", score: 1 }, { text: "Tidak Setuju", value: "spatial", score: 2 }, { text: "Setuju", value: "spatial", score: 3 }, { text: "Sangat Setuju", value: "spatial", score: 4 }] },
      { id: "mi34", text: "Saya suka membongkar pasang barang untuk melihat cara kerjanya.", options: [{ text: "Sangat Tidak Setuju", value: "kinesthetic", score: 1 }, { text: "Tidak Setuju", value: "kinesthetic", score: 2 }, { text: "Setuju", value: "kinesthetic", score: 3 }, { text: "Sangat Setuju", value: "kinesthetic", score: 4 }] },
      { id: "mi35", text: "Saya bisa mengenali melodi yang pernah saya dengar meskipun hanya sekali.", options: [{ text: "Sangat Tidak Setuju", value: "musical", score: 1 }, { text: "Tidak Setuju", value: "musical", score: 2 }, { text: "Setuju", value: "musical", score: 3 }, { text: "Sangat Setuju", value: "musical", score: 4 }] },
      { id: "mi36", text: "Saya suka menjadi penengah saat ada teman yang berselisih.", options: [{ text: "Sangat Tidak Setuju", value: "interpersonal", score: 1 }, { text: "Tidak Setuju", value: "interpersonal", score: 2 }, { text: "Setuju", value: "interpersonal", score: 3 }, { text: "Sangat Setuju", value: "interpersonal", score: 4 }] },
      { id: "mi37", text: "Saya sering merenungkan makna hidup dan tujuan keberadaan saya.", options: [{ text: "Sangat Tidak Setuju", value: "intrapersonal", score: 1 }, { text: "Tidak Setuju", value: "intrapersonal", score: 2 }, { text: "Setuju", value: "intrapersonal", score: 3 }, { text: "Sangat Setuju", value: "intrapersonal", score: 4 }] },
      { id: "mi38", text: "Saya suka mengoleksi benda-benda dari alam seperti batu atau daun.", options: [{ text: "Sangat Tidak Setuju", value: "naturalist", score: 1 }, { text: "Tidak Setuju", value: "naturalist", score: 2 }, { text: "Setuju", value: "naturalist", score: 3 }, { text: "Sangat Setuju", value: "naturalist", score: 4 }] },
      { id: "mi39", text: "Saya suka berdebat atau berdiskusi tentang topik yang menarik.", options: [{ text: "Sangat Tidak Setuju", value: "linguistic", score: 1 }, { text: "Tidak Setuju", value: "linguistic", score: 2 }, { text: "Setuju", value: "linguistic", score: 3 }, { text: "Sangat Setuju", value: "linguistic", score: 4 }] },
      { id: "mi40", text: "Saya suka mencari alasan logis di balik setiap kejadian.", options: [{ text: "Sangat Tidak Setuju", value: "logical", score: 1 }, { text: "Tidak Setuju", value: "logical", score: 2 }, { text: "Setuju", value: "logical", score: 3 }, { text: "Sangat Setuju", value: "logical", score: 4 }] },
      { id: "mi41", text: "Saya suka membuat sketsa atau coretan saat sedang berpikir.", options: [{ text: "Sangat Tidak Setuju", value: "spatial", score: 1 }, { text: "Tidak Setuju", value: "spatial", score: 2 }, { text: "Setuju", value: "spatial", score: 3 }, { text: "Sangat Setuju", value: "spatial", score: 4 }] },
      { id: "mi42", text: "Saya merasa lebih mudah belajar jika saya bisa menyentuh objeknya.", options: [{ text: "Sangat Tidak Setuju", value: "kinesthetic", score: 1 }, { text: "Tidak Setuju", value: "kinesthetic", score: 2 }, { text: "Setuju", value: "kinesthetic", score: 3 }, { text: "Sangat Setuju", value: "kinesthetic", score: 4 }] },
      { id: "mi43", text: "Saya suka menciptakan lagu atau melodi sendiri.", options: [{ text: "Sangat Tidak Setuju", value: "musical", score: 1 }, { text: "Tidak Setuju", value: "musical", score: 2 }, { text: "Setuju", value: "musical", score: 3 }, { text: "Sangat Setuju", value: "musical", score: 4 }] },
      { id: "mi44", text: "Saya peka terhadap bahasa tubuh orang lain.", options: [{ text: "Sangat Tidak Setuju", value: "interpersonal", score: 1 }, { text: "Tidak Setuju", value: "interpersonal", score: 2 }, { text: "Setuju", value: "interpersonal", score: 3 }, { text: "Sangat Setuju", value: "interpersonal", score: 4 }] },
      { id: "mi45", text: "Saya tahu apa yang memotivasi saya untuk terus maju.", options: [{ text: "Sangat Tidak Setuju", value: "intrapersonal", score: 1 }, { text: "Tidak Setuju", value: "intrapersonal", score: 2 }, { text: "Setuju", value: "intrapersonal", score: 3 }, { text: "Sangat Setuju", value: "intrapersonal", score: 4 }] },
      { id: "mi46", text: "Saya merasa tenang dan damai saat berada di alam terbuka.", options: [{ text: "Sangat Tidak Setuju", value: "naturalist", score: 1 }, { text: "Tidak Setuju", value: "naturalist", score: 2 }, { text: "Setuju", value: "naturalist", score: 3 }, { text: "Sangat Setuju", value: "naturalist", score: 4 }] },
      { id: "mi47", text: "Saya memiliki pemahaman yang kuat tentang nilai-nilai yang saya pegang teguh.", options: [{ text: "Sangat Tidak Setuju", value: "intrapersonal", score: 1 }, { text: "Tidak Setuju", value: "intrapersonal", score: 2 }, { text: "Setuju", value: "intrapersonal", score: 3 }, { text: "Sangat Setuju", value: "intrapersonal", score: 4 }] },
      { id: "mi48", text: "Saya suka mempelajari ekosistem dan bagaimana makhluk hidup berinteraksi.", options: [{ text: "Sangat Tidak Setuju", value: "naturalist", score: 1 }, { text: "Tidak Setuju", value: "naturalist", score: 2 }, { text: "Setuju", value: "naturalist", score: 3 }, { text: "Sangat Setuju", value: "naturalist", score: 4 }] }
    ]
  },
  personality: {
    title: "Tes Kepribadian",
    description: "Pahami karakter dasar dan caramu berinteraksi dengan orang lain.",
    questions: [
      { id: "p1", text: "Setelah seharian beraktivitas dengan banyak orang, saya merasa...", options: [{ text: "Bersemangat dan ingin lanjut mengobrol", value: "extrovert" }, { text: "Lelah dan butuh waktu sendirian untuk mengisi energi", value: "introvert" }] },
      { id: "p2", text: "Dalam mengambil keputusan, saya lebih mengandalkan...", options: [{ text: "Logika dan fakta yang ada", value: "thinking" }, { text: "Perasaan dan dampaknya bagi orang lain", value: "feeling" }] },
      { id: "p3", text: "Saya lebih suka merencanakan segala sesuatu terlebih dahulu.", options: [{ text: "Ya, saya suka jadwal yang jelas", value: "judging" }, { text: "Tidak, saya lebih suka fleksibel", value: "perceiving" }] },
      { id: "p4", text: "Saya lebih fokus pada detail kecil daripada gambaran besar.", options: [{ text: "Ya, detail itu penting", value: "sensing" }, { text: "Tidak, gambaran besar lebih utama", value: "intuition" }] },
      { id: "p5", text: "Saya merasa nyaman menjadi pusat perhatian.", options: [{ text: "Ya, saya menikmatinya", value: "extrovert" }, { text: "Tidak, saya lebih suka di balik layar", value: "introvert" }] },
      { id: "p6", text: "Saya lebih suka bekerja dengan data daripada dengan orang.", options: [{ text: "Ya, data lebih pasti", value: "thinking" }, { text: "Tidak, interaksi orang lebih menarik", value: "feeling" }] },
      { id: "p7", text: "Saya sering bertindak secara spontan.", options: [{ text: "Ya, hidup harus penuh kejutan", value: "perceiving" }, { text: "Tidak, saya butuh persiapan", value: "judging" }] },
      { id: "p8", text: "Saya lebih percaya pada pengalaman nyata daripada teori.", options: [{ text: "Ya, pengalaman adalah guru terbaik", value: "sensing" }, { text: "Tidak, teori memberikan wawasan baru", value: "intuition" }] },
      { id: "p9", text: "Saya mudah memulai percakapan dengan orang asing.", options: [{ text: "Ya, sangat mudah", value: "extrovert" }, { text: "Tidak, saya butuh waktu", value: "introvert" }] },
      { id: "p10", text: "Saya lebih suka lingkungan kerja yang teratur.", options: [{ text: "Ya, keteraturan itu kunci", value: "judging" }, { text: "Tidak, kebebasan itu penting", value: "perceiving" }] },
      { id: "p11", text: "Saya sering memikirkan masa depan dan kemungkinannya.", options: [{ text: "Ya, selalu", value: "intuition" }, { text: "Tidak, saya fokus pada saat ini", value: "sensing" }] },
      { id: "p12", text: "Saya lebih suka mengkritik daripada memuji jika itu benar.", options: [{ text: "Ya, kejujuran itu utama", value: "thinking" }, { text: "Tidak, menjaga perasaan itu penting", value: "feeling" }] },
      { id: "p13", text: "Saya merasa lelah jika harus berada di keramaian terlalu lama.", options: [{ text: "Ya, energi saya terkuras", value: "introvert" }, { text: "Tidak, saya justru berenergi", value: "extrovert" }] },
      { id: "p14", text: "Saya suka mencoba hal-hal baru yang belum pernah saya lakukan.", options: [{ text: "Ya, saya suka tantangan", value: "perceiving" }, { text: "Tidak, saya suka yang sudah pasti", value: "judging" }] },
      { id: "p15", text: "Saya lebih suka instruksi yang spesifik daripada yang abstrak.", options: [{ text: "Ya, agar tidak bingung", value: "sensing" }, { text: "Tidak, saya suka interpretasi sendiri", value: "intuition" }] },
      { id: "p16", text: "Saya lebih mengutamakan harmoni dalam kelompok.", options: [{ text: "Ya, kedamaian itu penting", value: "feeling" }, { text: "Tidak, hasil akhir lebih penting", value: "thinking" }] },
      { id: "p17", text: "Saya sering menunda pekerjaan sampai mendekati tenggat waktu.", options: [{ text: "Ya, saya bekerja lebih baik di bawah tekanan", value: "perceiving" }, { text: "Tidak, saya menyelesaikannya jauh hari", value: "judging" }] },
      { id: "p18", text: "Saya lebih suka membaca buku non-fiksi daripada fiksi.", options: [{ text: "Ya, saya suka fakta", value: "sensing" }, { text: "Tidak, saya suka imajinasi", value: "intuition" }] },
      { id: "p19", text: "Saya lebih suka menghabiskan waktu luang dengan teman dekat.", options: [{ text: "Ya, lingkaran kecil lebih nyaman", value: "introvert" }, { text: "Tidak, semakin ramai semakin seru", value: "extrovert" }] },
      { id: "p20", text: "Saya lebih suka mengikuti aturan yang sudah ada.", options: [{ text: "Ya, aturan ada untuk diikuti", value: "judging" }, { text: "Tidak, aturan bisa diubah", value: "perceiving" }] },
      { id: "p21", text: "Saya sering memiliki ide-ide yang tidak biasa.", options: [{ text: "Ya, saya kreatif", value: "intuition" }, { text: "Tidak, saya praktis", value: "sensing" }] },
      { id: "p22", text: "Saya lebih suka bekerja secara mandiri daripada dalam tim.", options: [{ text: "Ya, lebih fokus", value: "introvert" }, { text: "Tidak, tim lebih baik", value: "extrovert" }] },
      { id: "p23", text: "Saya mudah merasa iba pada orang lain.", options: [{ text: "Ya, saya empati", value: "feeling" }, { text: "Tidak, saya objektif", value: "thinking" }] },
      { id: "p24", text: "Saya suka menjaga meja kerja saya tetap rapi.", options: [{ text: "Ya, rapi itu nyaman", value: "judging" }, { text: "Tidak, berantakan itu kreatif", value: "perceiving" }] },
      { id: "p25", text: "Saya lebih suka berbicara daripada mendengarkan.", options: [{ text: "Ya, saya suka berbagi", value: "extrovert" }, { text: "Tidak, saya pendengar yang baik", value: "introvert" }] },
      { id: "p26", text: "Saya lebih suka hal-hal yang sudah terbukti berhasil.", options: [{ text: "Ya, aman dan pasti", value: "sensing" }, { text: "Tidak, saya suka inovasi", value: "intuition" }] },
      { id: "p27", text: "Saya sering mempertanyakan otoritas.", options: [{ text: "Ya, jika tidak masuk akal", value: "thinking" }, { text: "Tidak, saya menghormati struktur", value: "feeling" }] },
      { id: "p28", text: "Saya merasa gelisah jika tidak ada rencana untuk hari esok.", options: [{ text: "Ya, saya butuh kepastian", value: "judging" }, { text: "Tidak, biarkan mengalir", value: "perceiving" }] },
      { id: "p29", text: "Saya lebih suka film dokumenter daripada film fantasi.", options: [{ text: "Ya, saya suka kenyataan", value: "sensing" }, { text: "Tidak, saya suka dunia lain", value: "intuition" }] },
      { id: "p30", text: "Saya merasa lebih hidup saat berada di tengah banyak orang.", options: [{ text: "Ya, sangat bersemangat", value: "extrovert" }, { text: "Tidak, saya merasa lelah", value: "introvert" }] },
      { id: "p31", text: "Saya lebih suka bekerja dengan instruksi yang jelas dan terperinci.", options: [{ text: "Ya, saya suka kejelasan", value: "sensing" }, { text: "Tidak, saya suka kebebasan", value: "intuition" }] },
      { id: "p32", text: "Saya sering merasa sulit untuk menolak permintaan orang lain.", options: [{ text: "Ya, saya ingin membantu", value: "feeling" }, { text: "Tidak, saya harus tegas", value: "thinking" }] },
      { id: "p33", text: "Saya lebih suka menyelesaikan satu tugas sebelum memulai yang lain.", options: [{ text: "Ya, saya suka fokus", value: "judging" }, { text: "Tidak, saya suka multitasking", value: "perceiving" }] },
      { id: "p34", text: "Saya merasa lebih nyaman di lingkungan yang tenang.", options: [{ text: "Ya, saya butuh ketenangan", value: "introvert" }, { text: "Tidak, saya suka keramaian", value: "extrovert" }] },
      { id: "p35", text: "Saya sering memikirkan implikasi jangka panjang dari suatu tindakan.", options: [{ text: "Ya, saya visioner", value: "intuition" }, { text: "Tidak, saya praktis", value: "sensing" }] },
      { id: "p36", text: "Saya lebih suka mendasarkan keputusan pada prinsip moral.", options: [{ text: "Ya, nilai itu penting", value: "feeling" }, { text: "Tidak, fakta itu utama", value: "thinking" }] },
      { id: "p37", text: "Saya merasa lebih produktif jika memiliki jadwal harian.", options: [{ text: "Ya, saya butuh struktur", value: "judging" }, { text: "Tidak, saya suka fleksibilitas", value: "perceiving" }] },
      { id: "p38", text: "Saya lebih suka belajar melalui observasi daripada partisipasi.", options: [{ text: "Ya, saya pengamat", value: "introvert" }, { text: "Tidak, saya praktisi", value: "extrovert" }] },
      { id: "p39", text: "Saya sering mencari makna yang lebih dalam di balik sebuah peristiwa.", options: [{ text: "Ya, saya intuitif", value: "intuition" }, { text: "Tidak, saya realistis", value: "sensing" }] },
      { id: "p40", text: "Saya lebih suka memberikan umpan balik yang jujur meskipun menyakitkan.", options: [{ text: "Ya, kebenaran itu penting", value: "thinking" }, { text: "Tidak, kelembutan itu utama", value: "feeling" }] }
    ]
  },
  aptitude_interest: {
    title: "Tes Bakat Minat",
    description: "Identifikasi bidang pekerjaan atau aktivitas yang paling sesuai dengan minatmu (RIASEC).",
    questions: [
      { id: "ai1", text: "Saya suka memperbaiki barang-barang yang rusak atau bekerja dengan mesin.", options: [{ text: "Ya", value: "realistic", score: 1 }, { text: "Tidak", value: "none", score: 0 }] },
      { id: "ai2", text: "Saya suka melakukan eksperimen sains atau meneliti sesuatu.", options: [{ text: "Ya", value: "investigative", score: 1 }, { text: "Tidak", value: "none", score: 0 }] },
      { id: "ai3", text: "Saya suka menggambar, menulis puisi, atau bermain musik.", options: [{ text: "Ya", value: "artistic", score: 1 }, { text: "Tidak", value: "none", score: 0 }] },
      { id: "ai4", text: "Saya suka membantu orang lain memecahkan masalah mereka.", options: [{ text: "Ya", value: "social", score: 1 }, { text: "Tidak", value: "none", score: 0 }] },
      { id: "ai5", text: "Saya suka memimpin orang lain atau memulai bisnis baru.", options: [{ text: "Ya", value: "enterprising", score: 1 }, { text: "Tidak", value: "none", score: 0 }] },
      { id: "ai6", text: "Saya suka mengatur data, file, atau bekerja dengan angka.", options: [{ text: "Ya", value: "conventional", score: 1 }, { text: "Tidak", value: "none", score: 0 }] },
      { id: "ai7", text: "Saya suka bekerja di luar ruangan dan melakukan aktivitas fisik.", options: [{ text: "Ya", value: "realistic", score: 1 }, { text: "Tidak", value: "none", score: 0 }] },
      { id: "ai8", text: "Saya suka menganalisis masalah yang rumit.", options: [{ text: "Ya", value: "investigative", score: 1 }, { text: "Tidak", value: "none", score: 0 }] },
      { id: "ai9", text: "Saya suka merancang pakaian atau dekorasi ruangan.", options: [{ text: "Ya", value: "artistic", score: 1 }, { text: "Tidak", value: "none", score: 0 }] },
      { id: "ai10", text: "Saya suka mengajar atau melatih orang lain.", options: [{ text: "Ya", value: "social", score: 1 }, { text: "Tidak", value: "none", score: 0 }] },
      { id: "ai11", text: "Saya suka bernegosiasi atau menjual produk.", options: [{ text: "Ya", value: "enterprising", score: 1 }, { text: "Tidak", value: "none", score: 0 }] },
      { id: "ai12", text: "Saya suka mengikuti prosedur yang sudah ditetapkan.", options: [{ text: "Ya", value: "conventional", score: 1 }, { text: "Tidak", value: "none", score: 0 }] },
      { id: "ai13", text: "Saya suka berkebun atau bekerja dengan hewan.", options: [{ text: "Ya", value: "realistic", score: 1 }, { text: "Tidak", value: "none", score: 0 }] },
      { id: "ai14", text: "Saya suka membaca jurnal ilmiah atau berita teknologi.", options: [{ text: "Ya", value: "investigative", score: 1 }, { text: "Tidak", value: "none", score: 0 }] },
      { id: "ai15", text: "Saya suka berakting atau tampil di depan umum.", options: [{ text: "Ya", value: "artistic", score: 1 }, { text: "Tidak", value: "none", score: 0 }] },
      { id: "ai16", text: "Saya suka menjadi sukarelawan di komunitas.", options: [{ text: "Ya", value: "social", score: 1 }, { text: "Tidak", value: "none", score: 0 }] },
      { id: "ai17", text: "Saya suka meyakinkan orang untuk mengikuti ide saya.", options: [{ text: "Ya", value: "enterprising", score: 1 }, { text: "Tidak", value: "none", score: 0 }] },
      { id: "ai18", text: "Saya suka membuat jadwal dan rencana kerja.", options: [{ text: "Ya", value: "conventional", score: 1 }, { text: "Tidak", value: "none", score: 0 }] },
      { id: "ai19", text: "Saya suka memancing atau berkemah.", options: [{ text: "Ya", value: "realistic", score: 1 }, { text: "Tidak", value: "none", score: 0 }] },
      { id: "ai20", text: "Saya suka memecahkan teka-teki matematika.", options: [{ text: "Ya", value: "investigative", score: 1 }, { text: "Tidak", value: "none", score: 0 }] },
      { id: "ai21", text: "Saya suka menulis blog atau membuat konten kreatif.", options: [{ text: "Ya", value: "artistic", score: 1 }, { text: "Tidak", value: "none", score: 0 }] },
      { id: "ai22", text: "Saya suka mendengarkan curhatan teman.", options: [{ text: "Ya", value: "social", score: 1 }, { text: "Tidak", value: "none", score: 0 }] },
      { id: "ai23", text: "Saya suka berkompetisi dalam bisnis atau olahraga.", options: [{ text: "Ya", value: "enterprising", score: 1 }, { text: "Tidak", value: "none", score: 0 }] },
      { id: "ai24", text: "Saya suka mengelola inventaris atau stok barang.", options: [{ text: "Ya", value: "conventional", score: 1 }, { text: "Tidak", value: "none", score: 0 }] },
      { id: "ai25", text: "Saya suka pertukangan atau membuat furnitur.", options: [{ text: "Ya", value: "realistic", score: 1 }, { text: "Tidak", value: "none", score: 0 }] },
      { id: "ai26", text: "Saya suka meneliti sejarah atau arkeologi.", options: [{ text: "Ya", value: "investigative", score: 1 }, { text: "Tidak", value: "none", score: 0 }] },
      { id: "ai27", text: "Saya suka mengunjungi galeri seni atau museum.", options: [{ text: "Ya", value: "artistic", score: 1 }, { text: "Tidak", value: "none", score: 0 }] },
      { id: "ai28", text: "Saya suka bekerja di bidang pelayanan kesehatan.", options: [{ text: "Ya", value: "social", score: 1 }, { text: "Tidak", value: "none", score: 0 }] },
      { id: "ai29", text: "Saya suka mengelola tim untuk mencapai target.", options: [{ text: "Ya", value: "enterprising", score: 1 }, { text: "Tidak", value: "none", score: 0 }] },
      { id: "ai30", text: "Saya suka melakukan audit atau pemeriksaan data.", options: [{ text: "Ya", value: "conventional", score: 1 }, { text: "Tidak", value: "none", score: 0 }] },
      { id: "ai31", text: "Saya suka mengoperasikan peralatan berat atau mesin industri.", options: [{ text: "Ya", value: "realistic", score: 1 }, { text: "Tidak", value: "none", score: 0 }] },
      { id: "ai32", text: "Saya suka mempelajari struktur kimia suatu zat.", options: [{ text: "Ya", value: "investigative", score: 1 }, { text: "Tidak", value: "none", score: 0 }] },
      { id: "ai33", text: "Saya suka mengedit video atau membuat animasi.", options: [{ text: "Ya", value: "artistic", score: 1 }, { text: "Tidak", value: "none", score: 0 }] },
      { id: "ai34", text: "Saya suka memberikan konseling atau bimbingan kepada orang lain.", options: [{ text: "Ya", value: "social", score: 1 }, { text: "Tidak", value: "none", score: 0 }] },
      { id: "ai35", text: "Saya suka merancang strategi pemasaran untuk sebuah produk.", options: [{ text: "Ya", value: "enterprising", score: 1 }, { text: "Tidak", value: "none", score: 0 }] },
      { id: "ai36", text: "Saya suka menyusun laporan keuangan yang detail.", options: [{ text: "Ya", value: "conventional", score: 1 }, { text: "Tidak", value: "none", score: 0 }] },
      { id: "ai37", text: "Saya suka bekerja di bidang konstruksi atau bangunan.", options: [{ text: "Ya", value: "realistic", score: 1 }, { text: "Tidak", value: "none", score: 0 }] },
      { id: "ai38", text: "Saya suka meneliti tentang luar angkasa atau astronomi.", options: [{ text: "Ya", value: "investigative", score: 1 }, { text: "Tidak", value: "none", score: 0 }] },
      { id: "ai39", text: "Saya suka menulis naskah drama atau skenario film.", options: [{ text: "Ya", value: "artistic", score: 1 }, { text: "Tidak", value: "none", score: 0 }] },
      { id: "ai40", text: "Saya suka bekerja di bidang kemanusiaan atau LSM.", options: [{ text: "Ya", value: "social", score: 1 }, { text: "Tidak", value: "none", score: 0 }] }
    ]
  },
  school_major: {
    title: "Tes Penjurusan Sekolah Lanjut (SMA/SMK)",
    description: "Rekomendasi jurusan SMA (IPA/IPS/Bahasa) atau SMK berdasarkan minat dan kemampuan.",
    questions: [
      { id: "sm1", text: "Mata pelajaran apa yang paling kamu sukai?", options: [{ text: "Matematika/Fisika/Biologi", value: "ipa" }, { text: "Ekonomi/Sosiologi/Geografi", value: "ips" }, { text: "Bahasa Indonesia/Inggris/Asing", value: "bahasa" }, { text: "Pelajaran Praktik/Keterampilan", value: "smk" }] },
      { id: "sm2", text: "Saya suka melakukan eksperimen di laboratorium.", options: [{ text: "Ya", value: "ipa" }, { text: "Tidak", value: "ips" }] },
      { id: "sm3", text: "Saya tertarik mempelajari fenomena sosial dan masyarakat.", options: [{ text: "Ya", value: "ips" }, { text: "Tidak", value: "ipa" }] },
      { id: "sm4", text: "Saya suka mempelajari struktur bahasa dan sastra.", options: [{ text: "Ya", value: "bahasa" }, { text: "Tidak", value: "smk" }] },
      { id: "sm5", text: "Saya lebih suka belajar praktik langsung daripada teori.", options: [{ text: "Ya", value: "smk" }, { text: "Tidak", value: "ipa" }] },
      { id: "sm6", text: "Saya suka menghitung rumus-rumus yang rumit.", options: [{ text: "Ya", value: "ipa" }, { text: "Tidak", value: "ips" }] },
      { id: "sm7", text: "Saya suka membaca berita tentang ekonomi dan politik.", options: [{ text: "Ya", value: "ips" }, { text: "Tidak", value: "bahasa" }] },
      { id: "sm8", text: "Saya ingin bisa berbicara banyak bahasa asing.", options: [{ text: "Ya", value: "bahasa" }, { text: "Tidak", value: "ipa" }] },
      { id: "sm9", text: "Saya ingin cepat bekerja setelah lulus sekolah.", options: [{ text: "Ya", value: "smk" }, { text: "Tidak", value: "ips" }] },
      { id: "sm10", text: "Saya suka mengamati makhluk hidup dan alam.", options: [{ text: "Ya", value: "ipa" }, { text: "Tidak", value: "ips" }] },
      { id: "sm11", text: "Saya suka menganalisis peta dan wilayah.", options: [{ text: "Ya", value: "ips" }, { text: "Tidak", value: "ipa" }] },
      { id: "sm12", text: "Saya suka menulis puisi atau cerita pendek.", options: [{ text: "Ya", value: "bahasa" }, { text: "Tidak", value: "smk" }] },
      { id: "sm13", text: "Saya suka membongkar pasang alat elektronik.", options: [{ text: "Ya", value: "smk" }, { text: "Tidak", value: "ipa" }] },
      { id: "sm14", text: "Saya suka memecahkan soal logika matematika.", options: [{ text: "Ya", value: "ipa" }, { text: "Tidak", value: "ips" }] },
      { id: "sm15", text: "Saya suka mempelajari sejarah peradaban manusia.", options: [{ text: "Ya", value: "ips" }, { text: "Tidak", value: "bahasa" }] },
      { id: "sm16", text: "Saya suka menonton film asing tanpa subtitle.", options: [{ text: "Ya", value: "bahasa" }, { text: "Tidak", value: "ipa" }] },
      { id: "sm17", text: "Saya tertarik pada bidang kuliner atau otomotif.", options: [{ text: "Ya", value: "smk" }, { text: "Tidak", value: "ips" }] },
      { id: "sm18", text: "Saya ingin menjadi dokter atau insinyur.", options: [{ text: "Ya", value: "ipa" }, { text: "Tidak", value: "ips" }] },
      { id: "sm19", text: "Saya ingin menjadi pengusaha atau diplomat.", options: [{ text: "Ya", value: "ips" }, { text: "Tidak", value: "ipa" }] },
      { id: "sm20", text: "Saya ingin menjadi penerjemah atau penulis.", options: [{ text: "Ya", value: "bahasa" }, { text: "Tidak", value: "smk" }] },
      { id: "sm21", text: "Saya ingin menjadi teknisi atau desainer grafis.", options: [{ text: "Ya", value: "smk" }, { text: "Tidak", value: "ipa" }] },
      { id: "sm22", text: "Saya suka mempelajari zat kimia dan reaksinya.", options: [{ text: "Ya", value: "ipa" }, { text: "Tidak", value: "ips" }] },
      { id: "sm23", text: "Saya suka mempelajari cara kerja pasar dan uang.", options: [{ text: "Ya", value: "ips" }, { text: "Tidak", value: "bahasa" }] },
      { id: "sm24", text: "Saya suka mempelajari budaya negara lain.", options: [{ text: "Ya", value: "bahasa" }, { text: "Tidak", value: "ipa" }] },
      { id: "sm25", text: "Saya suka membuat program komputer atau aplikasi.", options: [{ text: "Ya", value: "smk" }, { text: "Tidak", value: "ips" }] },
      { id: "sm26", text: "Saya suka mempelajari hukum-hukum alam (Fisika).", options: [{ text: "Ya", value: "ipa" }, { text: "Tidak", value: "ips" }] },
      { id: "sm27", text: "Saya suka mempelajari perilaku manusia (Sosiologi).", options: [{ text: "Ya", value: "ips" }, { text: "Tidak", value: "ipa" }] },
      { id: "sm28", text: "Saya suka membaca karya sastra klasik.", options: [{ text: "Ya", value: "bahasa" }, { text: "Tidak", value: "smk" }] },
      { id: "sm29", text: "Saya suka mempelajari teknik bangunan atau mesin.", options: [{ text: "Ya", value: "smk" }, { text: "Tidak", value: "ipa" }] },
      { id: "sm30", text: "Saya lebih suka bekerja dengan angka dan data eksak.", options: [{ text: "Ya", value: "ipa" }, { text: "Tidak", value: "ips" }] },
      { id: "sm31", text: "Saya tertarik mempelajari bioteknologi dan rekayasa genetika.", options: [{ text: "Ya", value: "ipa" }, { text: "Tidak", value: "ips" }] },
      { id: "sm32", text: "Saya suka mempelajari tentang psikologi dan perilaku sosial.", options: [{ text: "Ya", value: "ips" }, { text: "Tidak", value: "ipa" }] },
      { id: "sm33", text: "Saya tertarik mempelajari sastra dunia dan perkembangannya.", options: [{ text: "Ya", value: "bahasa" }, { text: "Tidak", value: "smk" }] },
      { id: "sm34", text: "Saya suka mempelajari desain interior atau tata busana.", options: [{ text: "Ya", value: "smk" }, { text: "Tidak", value: "ipa" }] },
      { id: "sm35", text: "Saya suka melakukan perhitungan statistik.", options: [{ text: "Ya", value: "ipa" }, { text: "Tidak", value: "ips" }] },
      { id: "sm36", text: "Saya tertarik mempelajari tentang geografi dan kependudukan.", options: [{ text: "Ya", value: "ips" }, { text: "Tidak", value: "bahasa" }] },
      { id: "sm37", text: "Saya ingin menguasai lebih dari tiga bahasa asing.", options: [{ text: "Ya", value: "bahasa" }, { text: "Tidak", value: "ipa" }] },
      { id: "sm38", text: "Saya suka mempelajari tentang teknik komputer dan jaringan.", options: [{ text: "Ya", value: "smk" }, { text: "Tidak", value: "ips" }] },
      { id: "sm39", text: "Saya tertarik pada penelitian ilmiah di bidang kesehatan.", options: [{ text: "Ya", value: "ipa" }, { text: "Tidak", value: "ips" }] },
      { id: "sm40", text: "Saya suka mempelajari tentang manajemen bisnis dan akuntansi.", options: [{ text: "Ya", value: "ips" }, { text: "Tidak", value: "smk" }] }
    ]
  },
  anxiety: {
    title: "Tes Kecemasan",
    description: "Ukur tingkat kecemasanmu untuk mendapatkan saran penanganan yang tepat.",
    questions: [
      { id: "ax1", text: "Saya merasa tegang atau sulit untuk rileks.", options: [{ text: "Tidak Pernah", value: "anxiety", score: 0 }, { text: "Kadang-kadang", value: "anxiety", score: 1 }, { text: "Sering", value: "anxiety", score: 2 }, { text: "Selalu", value: "anxiety", score: 3 }] },
      { id: "ax2", text: "Saya merasa khawatir berlebihan tentang hal-hal buruk yang mungkin terjadi.", options: [{ text: "Tidak Pernah", value: "anxiety", score: 0 }, { text: "Kadang-kadang", value: "anxiety", score: 1 }, { text: "Sering", value: "anxiety", score: 2 }, { text: "Selalu", value: "anxiety", score: 3 }] },
      { id: "ax3", text: "Saya merasa jantung saya berdebar kencang tanpa alasan yang jelas.", options: [{ text: "Tidak Pernah", value: "anxiety", score: 0 }, { text: "Kadang-kadang", value: "anxiety", score: 1 }, { text: "Sering", value: "anxiety", score: 2 }, { text: "Selalu", value: "anxiety", score: 3 }] },
      { id: "ax4", text: "Saya merasa gemetar pada tangan atau kaki.", options: [{ text: "Tidak Pernah", value: "anxiety", score: 0 }, { text: "Kadang-kadang", value: "anxiety", score: 1 }, { text: "Sering", value: "anxiety", score: 2 }, { text: "Selalu", value: "anxiety", score: 3 }] },
      { id: "ax5", text: "Saya merasa pusing atau seperti akan pingsan saat cemas.", options: [{ text: "Tidak Pernah", value: "anxiety", score: 0 }, { text: "Kadang-kadang", value: "anxiety", score: 1 }, { text: "Sering", value: "anxiety", score: 2 }, { text: "Selalu", value: "anxiety", score: 3 }] },
      { id: "ax6", text: "Saya merasa sulit bernapas atau sesak napas.", options: [{ text: "Tidak Pernah", value: "anxiety", score: 0 }, { text: "Kadang-kadang", value: "anxiety", score: 1 }, { text: "Sering", value: "anxiety", score: 2 }, { text: "Selalu", value: "anxiety", score: 3 }] },
      { id: "ax7", text: "Saya merasa takut akan kehilangan kendali diri.", options: [{ text: "Tidak Pernah", value: "anxiety", score: 0 }, { text: "Kadang-kadang", value: "anxiety", score: 1 }, { text: "Sering", value: "anxiety", score: 2 }, { text: "Selalu", value: "anxiety", score: 3 }] },
      { id: "ax8", text: "Saya merasa takut akan mati.", options: [{ text: "Tidak Pernah", value: "anxiety", score: 0 }, { text: "Kadang-kadang", value: "anxiety", score: 1 }, { text: "Sering", value: "anxiety", score: 2 }, { text: "Selalu", value: "anxiety", score: 3 }] },
      { id: "ax9", text: "Saya merasa berkeringat dingin.", options: [{ text: "Tidak Pernah", value: "anxiety", score: 0 }, { text: "Kadang-kadang", value: "anxiety", score: 1 }, { text: "Sering", value: "anxiety", score: 2 }, { text: "Selalu", value: "anxiety", score: 3 }] },
      { id: "ax10", text: "Saya merasa wajah saya memerah atau terasa panas.", options: [{ text: "Tidak Pernah", value: "anxiety", score: 0 }, { text: "Kadang-kadang", value: "anxiety", score: 1 }, { text: "Sering", value: "anxiety", score: 2 }, { text: "Selalu", value: "anxiety", score: 3 }] },
      { id: "ax11", text: "Saya merasa sulit untuk berkonsentrasi karena pikiran cemas.", options: [{ text: "Tidak Pernah", value: "anxiety", score: 0 }, { text: "Kadang-kadang", value: "anxiety", score: 1 }, { text: "Sering", value: "anxiety", score: 2 }, { text: "Selalu", value: "anxiety", score: 3 }] },
      { id: "ax12", text: "Saya merasa gelisah dan tidak bisa duduk diam.", options: [{ text: "Tidak Pernah", value: "anxiety", score: 0 }, { text: "Kadang-kadang", value: "anxiety", score: 1 }, { text: "Sering", value: "anxiety", score: 2 }, { text: "Selalu", value: "anxiety", score: 3 }] },
      { id: "ax13", text: "Saya merasa otot-otot saya tegang atau kaku.", options: [{ text: "Tidak Pernah", value: "anxiety", score: 0 }, { text: "Kadang-kadang", value: "anxiety", score: 1 }, { text: "Sering", value: "anxiety", score: 2 }, { text: "Selalu", value: "anxiety", score: 3 }] },
      { id: "ax14", text: "Saya merasa mudah terkejut oleh suara atau gerakan tiba-tiba.", options: [{ text: "Tidak Pernah", value: "anxiety", score: 0 }, { text: "Kadang-kadang", value: "anxiety", score: 1 }, { text: "Sering", value: "anxiety", score: 2 }, { text: "Selalu", value: "anxiety", score: 3 }] },
      { id: "ax15", text: "Saya merasa sulit tidur karena pikiran yang mengganggu.", options: [{ text: "Tidak Pernah", value: "anxiety", score: 0 }, { text: "Kadang-kadang", value: "anxiety", score: 1 }, { text: "Sering", value: "anxiety", score: 2 }, { text: "Selalu", value: "anxiety", score: 3 }] },
      { id: "ax16", text: "Saya merasa perut saya tidak nyaman atau mual.", options: [{ text: "Tidak Pernah", value: "anxiety", score: 0 }, { text: "Kadang-kadang", value: "anxiety", score: 1 }, { text: "Sering", value: "anxiety", score: 2 }, { text: "Selalu", value: "anxiety", score: 3 }] },
      { id: "ax17", text: "Saya merasa takut berada di tempat umum yang ramai.", options: [{ text: "Tidak Pernah", value: "anxiety", score: 0 }, { text: "Kadang-kadang", value: "anxiety", score: 1 }, { text: "Sering", value: "anxiety", score: 2 }, { text: "Selalu", value: "anxiety", score: 3 }] },
      { id: "ax18", text: "Saya merasa takut akan dipermalukan di depan orang lain.", options: [{ text: "Tidak Pernah", value: "anxiety", score: 0 }, { text: "Kadang-kadang", value: "anxiety", score: 1 }, { text: "Sering", value: "anxiety", score: 2 }, { text: "Selalu", value: "anxiety", score: 3 }] },
      { id: "ax19", text: "Saya merasa sering buang air kecil saat cemas.", options: [{ text: "Tidak Pernah", value: "anxiety", score: 0 }, { text: "Kadang-kadang", value: "anxiety", score: 1 }, { text: "Sering", value: "anxiety", score: 2 }, { text: "Selalu", value: "anxiety", score: 3 }] },
      { id: "ax20", text: "Saya merasa mulut saya kering.", options: [{ text: "Tidak Pernah", value: "anxiety", score: 0 }, { text: "Kadang-kadang", value: "anxiety", score: 1 }, { text: "Sering", value: "anxiety", score: 2 }, { text: "Selalu", value: "anxiety", score: 3 }] },
      { id: "ax21", text: "Saya merasa tangan saya dingin dan lembap.", options: [{ text: "Tidak Pernah", value: "anxiety", score: 0 }, { text: "Kadang-kadang", value: "anxiety", score: 1 }, { text: "Sering", value: "anxiety", score: 2 }, { text: "Selalu", value: "anxiety", score: 3 }] },
      { id: "ax22", text: "Saya merasa takut melakukan kesalahan sepele.", options: [{ text: "Tidak Pernah", value: "anxiety", score: 0 }, { text: "Kadang-kadang", value: "anxiety", score: 1 }, { text: "Sering", value: "anxiety", score: 2 }, { text: "Selalu", value: "anxiety", score: 3 }] },
      { id: "ax23", text: "Saya merasa sering mimpi buruk.", options: [{ text: "Tidak Pernah", value: "anxiety", score: 0 }, { text: "Kadang-kadang", value: "anxiety", score: 1 }, { text: "Sering", value: "anxiety", score: 2 }, { text: "Selalu", value: "anxiety", score: 3 }] },
      { id: "ax24", text: "Saya merasa mudah marah atau tersinggung.", options: [{ text: "Tidak Pernah", value: "anxiety", score: 0 }, { text: "Kadang-kadang", value: "anxiety", score: 1 }, { text: "Sering", value: "anxiety", score: 2 }, { text: "Selalu", value: "anxiety", score: 3 }] },
      { id: "ax25", text: "Saya merasa tidak berdaya menghadapi masalah.", options: [{ text: "Tidak Pernah", value: "anxiety", score: 0 }, { text: "Kadang-kadang", value: "anxiety", score: 1 }, { text: "Sering", value: "anxiety", score: 2 }, { text: "Selalu", value: "anxiety", score: 3 }] },
      { id: "ax26", text: "Saya merasa sering merasa lelah tanpa sebab.", options: [{ text: "Tidak Pernah", value: "anxiety", score: 0 }, { text: "Kadang-kadang", value: "anxiety", score: 1 }, { text: "Sering", value: "anxiety", score: 2 }, { text: "Selalu", value: "anxiety", score: 3 }] },
      { id: "ax27", text: "Saya merasa takut akan masa depan saya.", options: [{ text: "Tidak Pernah", value: "anxiety", score: 0 }, { text: "Kadang-kadang", value: "anxiety", score: 1 }, { text: "Sering", value: "anxiety", score: 2 }, { text: "Selalu", value: "anxiety", score: 3 }] },
      { id: "ax28", text: "Saya merasa sulit untuk mengambil keputusan.", options: [{ text: "Tidak Pernah", value: "anxiety", score: 0 }, { text: "Kadang-kadang", value: "anxiety", score: 1 }, { text: "Sering", value: "anxiety", score: 2 }, { text: "Selalu", value: "anxiety", score: 3 }] },
      { id: "ax29", text: "Saya merasa sering menyalahkan diri sendiri.", options: [{ text: "Tidak Pernah", value: "anxiety", score: 0 }, { text: "Kadang-kadang", value: "anxiety", score: 1 }, { text: "Sering", value: "anxiety", score: 2 }, { text: "Selalu", value: "anxiety", score: 3 }] },
      { id: "ax30", text: "Saya merasa hidup ini penuh dengan beban.", options: [{ text: "Tidak Pernah", value: "anxiety", score: 0 }, { text: "Kadang-kadang", value: "anxiety", score: 1 }, { text: "Sering", value: "anxiety", score: 2 }, { text: "Selalu", value: "anxiety", score: 3 }] },
      { id: "ax31", text: "Saya merasa sulit untuk berhenti memikirkan hal-hal yang mencemaskan.", options: [{ text: "Tidak Pernah", value: "anxiety", score: 0 }, { text: "Kadang-kadang", value: "anxiety", score: 1 }, { text: "Sering", value: "anxiety", score: 2 }, { text: "Selalu", value: "anxiety", score: 3 }] },
      { id: "ax32", text: "Saya merasa takut akan terjadi sesuatu yang mengerikan.", options: [{ text: "Tidak Pernah", value: "anxiety", score: 0 }, { text: "Kadang-kadang", value: "anxiety", score: 1 }, { text: "Sering", value: "anxiety", score: 2 }, { text: "Selalu", value: "anxiety", score: 3 }] },
      { id: "ax33", text: "Saya merasa tidak sabar dan mudah frustrasi.", options: [{ text: "Tidak Pernah", value: "anxiety", score: 0 }, { text: "Kadang-kadang", value: "anxiety", score: 1 }, { text: "Sering", value: "anxiety", score: 2 }, { text: "Selalu", value: "anxiety", score: 3 }] },
      { id: "ax34", text: "Saya merasa sulit untuk berkonsentrasi pada tugas yang sedang dikerjakan.", options: [{ text: "Tidak Pernah", value: "anxiety", score: 0 }, { text: "Kadang-kadang", value: "anxiety", score: 1 }, { text: "Sering", value: "anxiety", score: 2 }, { text: "Selalu", value: "anxiety", score: 3 }] },
      { id: "ax35", text: "Saya merasa sering terbangun di malam hari karena cemas.", options: [{ text: "Tidak Pernah", value: "anxiety", score: 0 }, { text: "Kadang-kadang", value: "anxiety", score: 1 }, { text: "Sering", value: "anxiety", score: 2 }, { text: "Selalu", value: "anxiety", score: 3 }] },
      { id: "ax36", text: "Saya merasa takut akan penilaian orang lain terhadap saya.", options: [{ text: "Tidak Pernah", value: "anxiety", score: 0 }, { text: "Kadang-kadang", value: "anxiety", score: 1 }, { text: "Sering", value: "anxiety", score: 2 }, { text: "Selalu", value: "anxiety", score: 3 }] },
      { id: "ax37", text: "Saya merasa sering merasa tertekan oleh tanggung jawab.", options: [{ text: "Tidak Pernah", value: "anxiety", score: 0 }, { text: "Kadang-kadang", value: "anxiety", score: 1 }, { text: "Sering", value: "anxiety", score: 2 }, { text: "Selalu", value: "anxiety", score: 3 }] },
      { id: "ax38", text: "Saya merasa sulit untuk menikmati waktu luang saya.", options: [{ text: "Tidak Pernah", value: "anxiety", score: 0 }, { text: "Kadang-kadang", value: "anxiety", score: 1 }, { text: "Sering", value: "anxiety", score: 2 }, { text: "Selalu", value: "anxiety", score: 3 }] },
      { id: "ax39", text: "Saya merasa sering merasa kesepian meskipun di tengah keramaian.", options: [{ text: "Tidak Pernah", value: "anxiety", score: 0 }, { text: "Kadang-kadang", value: "anxiety", score: 1 }, { text: "Sering", value: "anxiety", score: 2 }, { text: "Selalu", value: "anxiety", score: 3 }] },
      { id: "ax40", text: "Saya merasa takut tidak bisa memenuhi ekspektasi orang lain.", options: [{ text: "Tidak Pernah", value: "anxiety", score: 0 }, { text: "Kadang-kadang", value: "anxiety", score: 1 }, { text: "Sering", value: "anxiety", score: 2 }, { text: "Selalu", value: "anxiety", score: 3 }] }
    ]
  },
  wartegg: {
    title: "Tes Wartegg",
    description: "Tes proyektif untuk mengevaluasi kepribadian melalui 8 kotak gambar yang harus diselesaikan.",
    questions: [
      { id: "w1", text: "Kotak 1: Titik di tengah (Pusat/Identitas diri)", options: [] },
      { id: "w2", text: "Kotak 2: Garis lengkung (Emosi/Fleksibilitas)", options: [] },
      { id: "w3", text: "Kotak 3: Tiga garis vertikal naik (Ambisi/Prestasi)", options: [] },
      { id: "w4", text: "Kotak 4: Kotak kecil hitam (Masalah/Beban)", options: [] },
      { id: "w5", text: "Kotak 5: Dua garis miring berlawanan (Dinamika/Konflik)", options: [] },
      { id: "w6", text: "Kotak 6: Garis horizontal dan vertikal (Logika/Intelek)", options: [] },
      { id: "w7", text: "Kotak 7: Titik-titik melengkung (Sensitivitas/Seksualitas)", options: [] },
      { id: "w8", text: "Kotak 8: Garis melengkung besar (Perlindungan/Sosial)", options: [] }
    ]
  },
  cfit: {
    title: "Tes CFIT (Culture Fair Intelligence Test)",
    description: "Mengukur kecerdasan fluid (logika murni) yang bersifat universal dan bebas budaya (non-verbal).",
    questions: [
      { id: "cf1", text: "Seri: Garis mengarah ke atas, lalu ke kanan, lalu ke bawah. Gambar selanjutnya mengarah ke?", options: [{ text: "Kiri", value: "cfit", score: 1 }, { text: "Atas", value: "cfit", score: 0 }, { text: "Serong", value: "cfit", score: 0 }, { text: "Titik", value: "cfit", score: 0 }] },
      { id: "cf2", text: "Seri: Satu lingkaran kecil, lalu dua, lalu tiga. Gambar selanjutnya berisi?", options: [{ text: "Empat lingkaran kecil", value: "cfit", score: 1 }, { text: "Dua lingkaran besar", value: "cfit", score: 0 }, { text: "Kotak", value: "cfit", score: 0 }, { text: "Kosong", value: "cfit", score: 0 }] },
      { id: "cf3", text: "Seri: Kotak kosong, kotak bertitik tengah, kotak bersilang. Selanjutnya?", options: [{ text: "Kotak hitam penuh", value: "cfit", score: 1 }, { text: "Lingkaran", value: "cfit", score: 0 }, { text: "Garis horizontal", value: "cfit", score: 0 }, { text: "Segitiga", value: "cfit", score: 0 }] },
      { id: "cf4", text: "Seri: Segitiga menghadap atas, lalu menyamping kanan, lalu bawah. Selanjutnya?", options: [{ text: "Menghadap samping kiri", value: "cfit", score: 1 }, { text: "Menghadap atas", value: "cfit", score: 0 }, { text: "Membentuk kotak", value: "cfit", score: 0 }, { text: "Terbalik", value: "cfit", score: 0 }] },
      { id: "cf5", text: "Seri: Tangan jam di angka 12, lalu 3, lalu 6. Selanjutnya ke arah angka?", options: [{ text: "9", value: "cfit", score: 1 }, { text: "12", value: "cfit", score: 0 }, { text: "1", value: "cfit", score: 0 }, { text: "8", value: "cfit", score: 0 }] },
      { id: "cf6", text: "Seri: Huruf A, C, E. Huruf selanjutnya adalah?", options: [{ text: "G", value: "cfit", score: 1 }, { text: "F", value: "cfit", score: 0 }, { text: "H", value: "cfit", score: 0 }, { text: "I", value: "cfit", score: 0 }] },
      { id: "cf7", text: "Seri: Bintang bersudut 3, lalu 4, lalu 5. Selanjutnya bersudut?", options: [{ text: "6", value: "cfit", score: 1 }, { text: "7", value: "cfit", score: 0 }, { text: "Bentuk bulat", value: "cfit", score: 0 }, { text: "Kotak", value: "cfit", score: 0 }] },
      { id: "cf8", text: "Seri: Hitam di sisi kiri, lalu atas, lalu kanan. Selanjutnya di sisi?", options: [{ text: "Bawah", value: "cfit", score: 1 }, { text: "Tengah", value: "cfit", score: 0 }, { text: "Seluruh bagian", value: "cfit", score: 0 }, { text: "Kembali ke kiri", value: "cfit", score: 0 }] },
      { id: "cf9", text: "Seri: Garis lurus, garis patah satu kali, zig-zag dua kali. Selanjutnya?", options: [{ text: "Zig-zag tiga kali", value: "cfit", score: 1 }, { text: "Garis lengkung", value: "cfit", score: 0 }, { text: "Titik-titik", value: "cfit", score: 0 }, { text: "Lingkaran", value: "cfit", score: 0 }] },
      { id: "cf10", text: "Seri: Angka 1, 2, 4, 7, 11. Angka selanjutnya?", options: [{ text: "16", value: "cfit", score: 1 }, { text: "15", value: "cfit", score: 0 }, { text: "12", value: "cfit", score: 0 }, { text: "20", value: "cfit", score: 0 }] },
      { id: "cf11", text: "Klasifikasi: Mana yang tidak termasuk kelompok bunga?", options: [{ text: "Mawar", value: "cfit", score: 0 }, { text: "Melati", value: "cfit", score: 0 }, { text: "Anggrek", value: "cfit", score: 0 }, { text: "Bayam", value: "cfit", score: 1 }] },
      { id: "cf12", text: "Klasifikasi: Pilih bentuk yang paling berbeda.", options: [{ text: "Segitiga", value: "cfit", score: 0 }, { text: "Persegi", value: "cfit", score: 0 }, { text: "Trapesium", value: "cfit", score: 0 }, { text: "Lingkaran", value: "cfit", score: 1 }] },
      { id: "cf13", text: "Klasifikasi: Mana yang bukan transportasi darat?", options: [{ text: "Mobil", value: "cfit", score: 0 }, { text: "Motor", value: "cfit", score: 0 }, { text: "Kapal", value: "cfit", score: 1 }, { text: "Sepeda", value: "cfit", score: 0 }] },
      { id: "cf14", text: "Klasifikasi: Pilih yang tidak masuk kelompok kota di Indonesia.", options: [{ text: "Jakarta", value: "cfit", score: 0 }, { text: "Bandung", value: "cfit", score: 0 }, { text: "Singapura", value: "cfit", score: 1 }, { text: "Medan", value: "cfit", score: 0 }] },
      { id: "cf15", text: "Klasifikasi: Mana yang merupakan angka ganjil?", options: [{ text: "2", value: "cfit", score: 0 }, { text: "4", value: "cfit", score: 0 }, { text: "6", value: "cfit", score: 0 }, { text: "9", value: "cfit", score: 1 }] },
      { id: "cf16", text: "Klasifikasi: Pilih yang bukan alat musik petik.", options: [{ text: "Gitar", value: "cfit", score: 0 }, { text: "Kecapi", value: "cfit", score: 0 }, { text: "Piano", value: "cfit", score: 1 }, { text: "Ukulele", value: "cfit", score: 0 }] },
      { id: "cf17", text: "Klasifikasi: Mana benda yang volumenya paling besar?", options: [{ text: "Gelas", value: "cfit", score: 0 }, { text: "Ember", value: "cfit", score: 0 }, { text: "Bak Mandi", value: "cfit", score: 1 }, { text: "Sendok", value: "cfit", score: 0 }] },
      { id: "cf18", text: "Klasifikasi: Mana yang bukan termasuk planet dalam (Terestrial)?", options: [{ text: "Merkurius", value: "cfit", score: 0 }, { text: "Bumi", value: "cfit", score: 0 }, { text: "Mars", value: "cfit", score: 0 }, { text: "Saturnus", value: "cfit", score: 1 }] },
      { id: "cf19", text: "Klasifikasi: Mana yang bukan warna primer?", options: [{ text: "Merah", value: "cfit", score: 0 }, { text: "Biru", value: "cfit", score: 0 }, { text: "Kuning", value: "cfit", score: 0 }, { text: "Hijau", value: "cfit", score: 1 }] },
      { id: "cf20", text: "Klasifikasi: Pilih profesi yang paling berbeda bidang kerjanya.", options: [{ text: "Dokter", value: "cfit", score: 0 }, { text: "Perawat", value: "cfit", score: 0 }, { text: "Apoteker", value: "cfit", score: 0 }, { text: "Sopir", value: "cfit", score: 1 }] },
      { id: "cf21", text: "Matriks: A ke B (Kecil ke Besar), maka C ke?", options: [{ text: "D (Lebih Besar)", value: "cfit", score: 1 }, { text: "D (Tetap)", value: "cfit", score: 0 }, { text: "D (Berwarna)", value: "cfit", score: 0 }, { text: "E (Terbalik)", value: "cfit", score: 0 }] },
      { id: "cf22", text: "Matriks: Apel ke Buah seperti Mawar ke?", options: [{ text: "Bunga", value: "cfit", score: 1 }, { text: "Tanaman", value: "cfit", score: 0 }, { text: "Harum", value: "cfit", score: 0 }, { text: "Merah", value: "cfit", score: 0 }] },
      { id: "cf23", text: "Matriks: Manusia ke Rumah seperti Burung ke?", options: [{ text: "Sarang", value: "cfit", score: 1 }, { text: "Langit", value: "cfit", score: 0 }, { text: "Pohon", value: "cfit", score: 0 }, { text: "Sayap", value: "cfit", score: 0 }] },
      { id: "cf24", text: "Matriks: Haus ke Minum seperti Lapar ke?", options: [{ text: "Makan", value: "cfit", score: 1 }, { text: "Tidur", value: "cfit", score: 0 }, { text: "Lari", value: "cfit", score: 0 }, { text: "Kerja", value: "cfit", score: 0 }] },
      { id: "cf25", text: "Matriks: Malam ke Bulan seperti Siang ke?", options: [{ text: "Matahari", value: "cfit", score: 1 }, { text: "Awan", value: "cfit", score: 0 }, { text: "Biru", value: "cfit", score: 0 }, { text: "Terang", value: "cfit", score: 0 }] },
      { id: "cf26", text: "Matriks: Pilot ke Pesawat seperti Masinis ke?", options: [{ text: "Kereta Api", value: "cfit", score: 1 }, { text: "Mobil", value: "cfit", score: 0 }, { text: "Kapal Laut", value: "cfit", score: 0 }, { text: "Bus", value: "cfit", score: 0 }] },
      { id: "cf27", text: "Matriks: Dingin ke Es seperti Panas ke?", options: [{ text: "Api", value: "cfit", score: 1 }, { text: "Air", value: "cfit", score: 0 }, { text: "Udara", value: "cfit", score: 0 }, { text: "Matahari", value: "cfit", score: 0 }] },
      { id: "cf28", text: "Matriks: Buku ke Baca seperti Radio ke?", options: [{ text: "Dengar", value: "cfit", score: 1 }, { text: "Lihat", value: "cfit", score: 0 }, { text: "Gambar", value: "cfit", score: 0 }, { text: "Tonton", value: "cfit", score: 0 }] },
      { id: "cf29", text: "Matriks: Kaki ke Sepatu seperti Kepala ke?", options: [{ text: "Topi", value: "cfit", score: 1 }, { text: "Kacamata", value: "cfit", score: 0 }, { text: "Baju", value: "cfit", score: 0 }, { text: "Kalung", value: "cfit", score: 0 }] },
      { id: "cf30", text: "Matriks: Angka 2 ke 4 (Dikalikan 2), maka 15 ke?", options: [{ text: "30", value: "cfit", score: 1 }, { text: "17", value: "cfit", score: 0 }, { text: "20", value: "cfit", score: 0 }, { text: "45", value: "cfit", score: 0 }] },
      { id: "cf31", text: "Syarat: Semua A adalah B. C adalah A. Kesimpulannya?", options: [{ text: "C adalah B", value: "cfit", score: 1 }, { text: "B adalah C", value: "cfit", score: 0 }, { text: "A adalah C", value: "cfit", score: 0 }, { text: "Tidak ada", value: "cfit", score: 0 }] },
      { id: "cf32", text: "Syarat: Jika hari ini Selasa, maka lusa adalah?", options: [{ text: "Kamis", value: "cfit", score: 1 }, { text: "Rabu", value: "cfit", score: 0 }, { text: "Jumat", value: "cfit", score: 0 }, { text: "Sabtu", value: "cfit", score: 0 }] },
      { id: "cf33", text: "Syarat: Jika belajar rajin maka lulus. Andi belajar rajin.", options: [{ text: "Andi lulus", value: "cfit", score: 1 }, { text: "Andi malas", value: "cfit", score: 0 }, { text: "Andi gagal", value: "cfit", score: 0 }, { text: "Guru senang", value: "cfit", score: 0 }] },
      { id: "cf34", text: "Syarat: Semua burung punya sayap. Elang adalah burung.", options: [{ text: "Elang punya sayap", value: "cfit", score: 1 }, { text: "Sayap punya elang", value: "cfit", score: 0 }, { text: "Elang burung gagah", value: "cfit", score: 0 }, { text: "Semua punya sayap", value: "cfit", score: 0 }] },
      { id: "cf35", text: "Syarat: Pola (1, 3, 5) mirip dengan pola?", options: [{ text: "(10, 12, 14)", value: "cfit", score: 1 }, { text: "(2, 4, 8)", value: "cfit", score: 0 }, { text: "(1, 2, 3)", value: "cfit", score: 0 }, { text: "(5, 3, 1)", value: "cfit", score: 0 }] },
      { id: "cf36", text: "Syarat: Jika MERAH=1, KUNING=2, maka CAMPURANNYA (ORANGE) ?", options: [{ text: "3", value: "cfit", score: 1 }, { text: "4", value: "cfit", score: 0 }, { text: "5", value: "cfit", score: 0 }, { text: "0", value: "cfit", score: 0 }] },
      { id: "cf37", text: "Syarat: Bayangan huruf 'E' di cermin sebelah kanan?", options: [{ text: "Huruf 'E' terbalik horisontal", value: "cfit", score: 1 }, { text: "Huruf 'E' terbalik vertikal", value: "cfit", score: 0 }, { text: "Huruf 'M'", value: "cfit", score: 0 }, { text: "Huruf 'W'", value: "cfit", score: 0 }] },
      { id: "cf38", text: "Syarat: Berapa jumlah titik sudut pada segitiga?", options: [{ text: "3", value: "cfit", score: 1 }, { text: "4", value: "cfit", score: 0 }, { text: "5", value: "cfit", score: 0 }, { text: "0", value: "cfit", score: 0 }] },
      { id: "cf39", text: "Syarat: Roda A putar kanan, kena Roda B. Roda B putar?", options: [{ text: "Kiri", value: "cfit", score: 1 }, { text: "Kanan", value: "cfit", score: 0 }, { text: "Diam", value: "cfit", score: 0 }, { text: "Bebas", value: "cfit", score: 0 }] },
      { id: "cf40", text: "Syarat: Mana yang paling berat? 1kg Kapas atau 1kg Besi?", options: [{ text: "Sama berat", value: "cfit", score: 1 }, { text: "Besi", value: "cfit", score: 0 }, { text: "Kapas", value: "cfit", score: 0 }, { text: "Besi lebih padat", value: "cfit", score: 0 }] }
    ]
  },
  subject_interest: {
    title: "Minat Terhadap Mata Pelajaran (SMP)",
    description: "Identifikasi mata pelajaran yang paling Anda sukai dan alasan di baliknya untuk membantu perencanaan studi.",
    questions: [
      { 
        id: "si1", 
        text: "Pelajaran apa yang Anda sukai? (Pilih satu atau lebih dan berikan alasannya)", 
        options: [
          { text: "Pendidikan Agama dan Budi Pekerti", value: "agama" },
          { text: "Pendidikan Pancasila dan Kewarganegaraan", value: "ppkn" },
          { text: "Bahasa Indonesia", value: "b_indo" },
          { text: "Matematika", value: "mtk" },
          { text: "Ilmu Pengetahuan Alam (IPA)", value: "ipa" },
          { text: "Ilmu Pengetahuan Sosial (IPS)", value: "ips" },
          { text: "Bahasa Inggris", value: "b_ing" },
          { text: "Seni Budaya", value: "seni" },
          { text: "Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)", value: "pjok" },
          { text: "Prakarya", value: "prakarya" },
          { text: "Informatika", value: "informatika" },
          { text: "Bahasa Daerah", value: "b_daerah" },
          { text: "Bimbingan Konseling (BK)", value: "bk" }
        ] 
      }
    ]
  },
  school_career: {
    title: "Tes Perencanaan Karir",
    description: "Rekomendasi karir masa depan berdasarkan minat, kemampuan, dan nilai-nilai pribadi.",
    questions: [
      { id: "sc1", text: "Apa yang paling memotivasimu dalam bekerja?", options: [{ text: "Gaji yang tinggi", value: "salarry" }, { text: "Membantu orang lain", value: "social" }, { text: "Kreativitas dan inovasi", value: "creative" }, { text: "Keseimbangan hidup", value: "balance" }] },
      { id: "sc2", text: "Apa kelebihanmu yang paling menonjol?", options: [{ text: "Berpikir analitis", value: "analytical" }, { text: "Komunikasi", value: "communication" }, { text: "Teknis/Praktik", value: "technical" }, { text: "Kepemimpinan", value: "leadership" }] },
      { id: "sc3", text: "Lingkungan kerja seperti apa yang kamu inginkan?", options: [{ text: "Kantor yang formal", value: "formal" }, { text: "Tim fleksibel/start-up", value: "flexible" }, { text: "Lapangan/luar ruangan", value: "outdoor" }, { text: "Pusat penelitian/lab", value: "lab" }] },
      { id: "sc4", text: "Apa satu hal yang ingin kamu capai di masa depan?", options: [{ text: "Menjadi ahli di bidangku", value: "expert" }, { text: "Membangun usaha sendiri", value: "entrepreneur" }, { text: "Berdampak bagi masyarakat", value: "impactful" }, { text: "Meraih jabatan tinggi", value: "high_position" }] }
    ]
  }
};

export const getShortResult = (testType: TestType, scores: Record<string, number>): string => {
  const testInfo = TESTS[testType];
  const testTitle = testInfo ? testInfo.title.replace('Tes ', '') : testType;

  switch (testType) {
    case 'subject_interest': {
      const selected = Object.keys(scores).filter(k => scores[k] > 0);
      return `Minat Mapel: ${selected.length} Pelajaran`;
    }
    case 'learning_style': {
      const maxLs = Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b);
      const map: Record<string, string> = { visual: 'Visual', auditory: 'Auditori', kinesthetic: 'Kinestetik' };
      return `Gaya Belajar: ${map[maxLs[0]] || maxLs[0]}`;
    }
    case 'multiple_intelligences': {
      const sortedMi = Object.entries(scores).sort((a, b) => b[1] - a[1]);
      const top3 = sortedMi.slice(0, 3).map(([key]) => {
        const map: Record<string, string> = {
          linguistic: "Linguistik", logical: "Logis", spatial: "Spasial",
          kinesthetic: "Kinestetik", musical: "Musikal", interpersonal: "Interpersonal",
          intrapersonal: "Intrapersonal", naturalist: "Naturalis"
        };
        return map[key] || key;
      });
      return `Kec. Majemuk: ${top3.join(', ')}`;
    }
    case 'personality': {
      const e_i = (scores['extrovert'] || 0) > (scores['introvert'] || 0) ? 'E' : 'I';
      const s_n = (scores['sensing'] || 0) > (scores['intuition'] || 0) ? 'S' : 'N';
      const t_f = (scores['thinking'] || 0) > (scores['feeling'] || 0) ? 'T' : 'F';
      const j_p = (scores['judging'] || 0) > (scores['perceiving'] || 0) ? 'J' : 'P';
      return `Kepribadian: ${e_i}${s_n}${t_f}${j_p}`;
    }
    case 'aptitude_interest': {
      const sortedRiasec = Object.entries(scores).filter(([k]) => k !== 'none').sort((a, b) => b[1] - a[1]);
      const top3 = sortedRiasec.slice(0, 3).map(([key]) => {
        const map: Record<string, string> = {
          realistic: "R", investigative: "I", artistic: "A",
          social: "S", enterprising: "E", conventional: "C"
        };
        return map[key] || key;
      });
      return `Bakat Minat: ${top3.join('')}`;
    }
    case 'school_major': {
      const sortedMajors = Object.entries(scores).sort((a, b) => b[1] - a[1]);
      const topMajor = sortedMajors[0][0];
      const map: Record<string, string> = { ipa: "IPA", ips: "IPS", bahasa: "Bahasa", smk: "SMK" };
      return `Penjurusan: ${map[topMajor] || topMajor}`;
    }
    case 'anxiety': {
      const totalAx = scores['anxiety'] || 0;
      let level = "";
      if (totalAx <= 15) level = "Rendah";
      else if (totalAx <= 45) level = "Sedang";
      else level = "Tinggi";
      return `Kecemasan: ${level}`;
    }
    case 'cfit': {
      const totalScore = scores['cfit'] || 0;
      const estimatedIQ = Math.round((totalScore / 40) * 70 + 70);
      return `IQ CFIT: ${estimatedIQ}`;
    }
    case 'wartegg': {
      return "Wartegg: Selesai";
    }
    case 'school_career': {
      return "Karir: Selesai";
    }
    default:
      return `${testTitle}: Selesai`;
  }
};

export const analyzeResult = (testType: TestType, scores: Record<string, number>) => {
  switch (testType) {
    case 'subject_interest': {
      const selected = Object.entries(scores)
        .filter(([k, v]) => v > 0)
        .map(([k]) => {
          const map: Record<string, string> = {
            agama: "Pendidikan Agama", ppkn: "PPKn", b_indo: "Bahasa Indonesia",
            mtk: "Matematika", ipa: "IPA", ips: "IPS", b_ing: "Bahasa Inggris",
            seni: "Seni Budaya", pjok: "PJOK", prakarya: "Prakarya",
            informatika: "Informatika", b_daerah: "Bahasa Daerah", bk: "BK"
          };
          return map[k] || k;
        });

      return `### Hasil Analisis: Minat Mata Pelajaran
Anda telah memilih **${selected.length}** mata pelajaran yang Anda sukai:
${selected.map(s => `- ${s}`).join('\n')}

**Interpretasi:**
Minat terhadap mata pelajaran tertentu menunjukkan kecenderungan bakat dan potensi akademik Anda. Hal ini sangat penting untuk:
1. **Perencanaan Studi:** Membantu memilih jurusan di jenjang SMA/SMK.
2. **Pengembangan Diri:** Fokus pada bidang yang paling Anda nikmati agar hasil belajar lebih maksimal.
3. **Bimbingan Karir:** Memberikan gambaran awal mengenai bidang pekerjaan yang mungkin sesuai di masa depan.

**Saran:**
- Teruslah eksplorasi alasan mengapa Anda menyukai pelajaran tersebut.
- Diskusikan hasil ini dengan guru mata pelajaran terkait untuk mendapatkan bimbingan lebih lanjut.
- Gunakan minat ini sebagai motivasi untuk tetap semangat belajar di pelajaran lainnya juga.`;
    }

    case 'learning_style': {
      const maxLs = Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b);
      if (maxLs[0] === 'visual') {
        return `### Hasil Analisis: Gaya Belajar Visual
Anda memiliki kecenderungan belajar secara visual. Ini berarti Anda lebih mudah menyerap informasi melalui penglihatan.

**Karakteristik:**
- Mudah mengingat apa yang dilihat daripada yang didengar.
- Suka membaca dan memperhatikan detail visual.
- Membutuhkan gambaran menyeluruh sebelum memahami suatu konsep.

**Saran Tindak Lanjut:**
- Gunakan mind map, diagram, atau grafik saat mencatat.
- Tandai bagian penting di buku dengan stabilo berwarna.
- Tonton video pembelajaran atau gunakan flashcard bergambar.`;
      }
      if (maxLs[0] === 'auditory') {
        return `### Hasil Analisis: Gaya Belajar Auditori
Anda memiliki kecenderungan belajar secara auditori. Ini berarti Anda lebih mudah menyerap informasi melalui pendengaran.

**Karakteristik:**
- Mudah mengingat apa yang didengar dan diucapkan.
- Suka berdiskusi dan mendengarkan penjelasan lisan.
- Terkadang mudah terganggu oleh keributan.

**Saran Tindak Lanjut:**
- Rekam penjelasan guru dan dengarkan kembali saat belajar.
- Belajar kelompok dan diskusikan materi dengan teman.
- Baca materi pelajaran dengan suara lantang (reading aloud).`;
      }
      return `### Hasil Analisis: Gaya Belajar Kinestetik
Anda memiliki kecenderungan belajar secara kinestetik. Ini berarti Anda lebih mudah menyerap informasi melalui gerakan dan praktik langsung.

**Karakteristik:**
- Belajar lebih baik melalui pengalaman dan aktivitas fisik.
- Sulit duduk diam dalam waktu lama.
- Suka menyentuh atau mempraktikkan apa yang dipelajari.

**Saran Tindak Lanjut:**
- Lakukan eksperimen atau simulasi langsung terkait materi.
- Belajar sambil berjalan-jalan kecil atau menggunakan gerakan tangan.
- Beristirahat sejenak (jeda) di sela-sela waktu belajar yang panjang.`;
    }

    case 'multiple_intelligences': {
      const sortedMi = Object.entries(scores).sort((a, b) => b[1] - a[1]);
      const topMi = sortedMi[0][0];
      const miNames: Record<string, string> = {
        linguistic: "Kecerdasan Linguistik (Bahasa)",
        logical: "Kecerdasan Logis-Matematis",
        spatial: "Kecerdasan Visual-Spasial",
        kinesthetic: "Kecerdasan Kinestetik-Jasmani",
        musical: "Kecerdasan Musikal",
        interpersonal: "Kecerdasan Interpersonal (Sosial)",
        intrapersonal: "Kecerdasan Intrapersonal (Diri)",
        naturalist: "Kecerdasan Naturalis (Alam)"
      };
      
      const miDescriptions: Record<string, string> = {
        linguistic: "Anda mahir dalam menggunakan kata-kata, baik lisan maupun tulisan. Anda pandai bercerita, berdebat, dan mudah memahami informasi tekstual.\n\n**Saran:** Kembangkan kemampuan menulis, jurnalistik, atau public speaking. Banyak membaca buku dan berlatih menulis artikel.",
        logical: "Anda memiliki kemampuan kuat dalam penalaran, logika, dan angka. Anda menyukai pemecahan masalah yang sistematis dan berpikir kritis.\n\n**Saran:** Ikuti klub sains atau matematika. Latih kemampuan coding atau pelajari analisis data.",
        spatial: "Anda memiliki kepekaan tinggi terhadap ruang dan visual. Anda pandai membayangkan bentuk, membaca peta, dan merancang sesuatu.\n\n**Saran:** Kembangkan bakat di bidang desain grafis, arsitektur, atau seni rupa. Gunakan visualisasi dalam memecahkan masalah.",
        kinesthetic: "Anda sangat terampil menggunakan tubuh untuk mengekspresikan ide atau menciptakan sesuatu. Anda memiliki koordinasi fisik yang baik.\n\n**Saran:** Ikuti kegiatan olahraga, teater, atau tari. Pelajari keterampilan praktis yang membutuhkan ketangkasan tangan.",
        musical: "Anda memiliki kepekaan tinggi terhadap nada, irama, dan melodi. Anda mudah mengingat lagu dan mungkin pandai memainkan alat musik.\n\n**Saran:** Bergabunglah dengan paduan suara atau band. Gunakan musik sebagai media untuk membantu konsentrasi belajar.",
        interpersonal: "Anda sangat pandai memahami dan berinteraksi dengan orang lain. Anda memiliki empati tinggi dan mampu bekerja sama dalam tim.\n\n**Saran:** Ambil peran kepemimpinan dalam organisasi sekolah. Kembangkan kemampuan komunikasi dan mediasi.",
        intrapersonal: "Anda memiliki pemahaman yang mendalam tentang diri sendiri, termasuk emosi, tujuan, dan motivasi pribadi. Anda mandiri dan reflektif.\n\n**Saran:** Luangkan waktu untuk refleksi diri dan membuat jurnal. Tetapkan tujuan pribadi yang jelas dan rencanakan langkah pencapaiannya.",
        naturalist: "Anda memiliki ketertarikan dan kepekaan tinggi terhadap alam, hewan, dan tumbuhan. Anda suka mengamati lingkungan sekitar.\n\n**Saran:** Ikuti kegiatan pecinta alam atau berkebun. Pelajari biologi, ekologi, atau ilmu lingkungan lebih mendalam."
      };

      return `### Hasil Analisis: ${miNames[topMi] || topMi}
Kecerdasan dominan Anda adalah **${miNames[topMi] || topMi}**.

**Karakteristik:**
${miDescriptions[topMi] || "Anda memiliki potensi unik di bidang ini."}

*Catatan: Setiap orang memiliki perpaduan dari berbagai kecerdasan. Jangan ragu untuk mengeksplorasi bidang lainnya!*`;
    }

    case 'personality': {
      const e_i = (scores['extrovert'] || 0) > (scores['introvert'] || 0) ? 'E' : 'I';
      const s_n = (scores['sensing'] || 0) > (scores['intuition'] || 0) ? 'S' : 'N';
      const t_f = (scores['thinking'] || 0) > (scores['feeling'] || 0) ? 'T' : 'F';
      const j_p = (scores['judging'] || 0) > (scores['perceiving'] || 0) ? 'J' : 'P';
      const mbti = `${e_i}${s_n}${t_f}${j_p}`;

      return `### Hasil Analisis: Tipe Kepribadian ${mbti}
Berdasarkan jawaban Anda, kecenderungan kepribadian Anda mengarah pada tipe **${mbti}**.

**Interpretasi Singkat:**
- **${e_i === 'E' ? 'Extrovert (E)' : 'Introvert (I)'}:** Anda mendapatkan energi dari ${e_i === 'E' ? 'interaksi sosial dan dunia luar' : 'waktu sendiri dan refleksi internal'}.
- **${s_n === 'S' ? 'Sensing (S)' : 'Intuition (N)'}:** Anda memproses informasi dengan fokus pada ${s_n === 'S' ? 'fakta, detail, dan realitas masa kini' : 'ide, konsep abstrak, dan kemungkinan masa depan'}.
- **${t_f === 'T' ? 'Thinking (T)' : 'Feeling (F)'}:** Dalam mengambil keputusan, Anda mengutamakan ${t_f === 'T' ? 'logika, objektivitas, dan analisis' : 'empati, nilai-nilai personal, dan harmoni'}.
- **${j_p === 'J' ? 'Judging (J)' : 'Perceiving (P)'}:** Anda lebih menyukai gaya hidup yang ${j_p === 'J' ? 'terstruktur, terencana, dan teratur' : 'fleksibel, spontan, dan terbuka terhadap perubahan'}.

**Saran Tindak Lanjut:**
- Pahami kekuatan utama Anda dan gunakan dalam kerja tim.
- Sadari area yang perlu dikembangkan (misalnya, jika Anda sangat logis, cobalah untuk lebih melatih empati).
- Pilih lingkungan belajar atau kerja yang mendukung gaya kepribadian Anda.`;
    }

    case 'aptitude_interest': {
      const sortedRiasec = Object.entries(scores)
        .filter(([k]) => k !== 'none')
        .sort((a, b) => b[1] - a[1]);
      const topInterest = sortedRiasec[0][0];
      
      const riasecNames: Record<string, string> = {
        realistic: "Realistic (Praktis/Fisik)",
        investigative: "Investigative (Analitis/Ilmiah)",
        artistic: "Artistic (Kreatif/Seni)",
        social: "Social (Sosial/Pelayanan)",
        enterprising: "Enterprising (Kewirausahaan/Kepemimpinan)",
        conventional: "Conventional (Teratur/Administratif)"
      };

      const riasecDesc: Record<string, string> = {
        realistic: "Anda menyukai pekerjaan yang melibatkan aktivitas fisik, mesin, alat, atau berada di luar ruangan. Anda lebih suka bekerja dengan benda daripada ide atau orang.\n\n**Saran Karir:** Teknik, mekanik, pertanian, atlet, atau kepolisian.",
        investigative: "Anda menyukai observasi, penelitian, analisis, dan pemecahan masalah yang kompleks. Anda lebih suka bekerja dengan ide dan konsep.\n\n**Saran Karir:** Ilmuwan, peneliti, dokter, programmer, atau analis data.",
        artistic: "Anda memiliki imajinasi tinggi, menyukai kebebasan berekspresi, dan menghindari rutinitas yang kaku. Anda menyukai seni, desain, dan kreativitas.\n\n**Saran Karir:** Desainer, penulis, musisi, arsitek, atau aktor.",
        social: "Anda sangat suka berinteraksi, membantu, melatih, atau menyembuhkan orang lain. Anda memiliki empati dan keterampilan komunikasi yang baik.\n\n**Saran Karir:** Guru, perawat, konselor, psikolog, atau pekerja sosial.",
        enterprising: "Anda suka memimpin, memengaruhi orang lain, dan mengambil risiko untuk mencapai tujuan ekonomi atau organisasi. Anda ambisius dan energik.\n\n**Saran Karir:** Pengusaha, manajer, pengacara, sales, atau politisi.",
        conventional: "Anda menyukai pekerjaan yang terstruktur, teratur, dan melibatkan data atau angka. Anda sangat teliti dan menghargai keteraturan.\n\n**Saran Karir:** Akuntan, administrator, pustakawan, atau analis keuangan."
      };

      return `### Hasil Analisis: Minat ${riasecNames[topInterest] || topInterest}
Minat karir dominan Anda berada pada bidang **${riasecNames[topInterest] || topInterest}**.

**Karakteristik:**
${riasecDesc[topInterest] || "Anda memiliki minat yang kuat di bidang ini."}

**Saran Tindak Lanjut:**
- Cari tahu lebih banyak tentang profesi-profesi di bidang tersebut.
- Ikuti ekstrakurikuler atau magang yang relevan dengan minat Anda.
- Diskusikan rencana karir Anda dengan guru BK atau orang tua.`;
    }

    case 'school_major': {
      const sortedMajors = Object.entries(scores).sort((a, b) => b[1] - a[1]);
      const topMajor = sortedMajors[0][0];
      
      const majorNames: Record<string, string> = {
        ipa: "MIPA (Matematika dan Ilmu Pengetahuan Alam)",
        ips: "IPS (Ilmu Pengetahuan Sosial)",
        bahasa: "Bahasa dan Budaya",
        smk: "SMK (Sekolah Menengah Kejuruan)"
      };

      const majorDesc: Record<string, string> = {
        ipa: "Anda memiliki minat dan kemampuan yang kuat dalam logika, perhitungan, dan sains. Anda cocok mempelajari ilmu pasti dan alam.\n\n**Saran:** Pertimbangkan jurusan MIPA. Persiapkan diri dengan memperkuat dasar matematika dan sains.",
        ips: "Anda tertarik pada interaksi sosial, ekonomi, sejarah, dan fenomena masyarakat. Anda memiliki kemampuan analisis sosial yang baik.\n\n**Saran:** Pertimbangkan jurusan IPS. Perbanyak membaca berita, buku sejarah, dan isu-isu sosial terkini.",
        bahasa: "Anda memiliki ketertarikan tinggi pada sastra, komunikasi, dan budaya asing. Anda mahir dalam mengekspresikan diri melalui bahasa.\n\n**Saran:** Pertimbangkan jurusan Bahasa. Tingkatkan kemampuan menulis dan pelajari bahasa asing secara aktif.",
        smk: "Anda lebih menyukai pembelajaran yang bersifat praktis, aplikatif, dan siap kerja. Anda suka mencoba dan mempraktikkan langsung apa yang dipelajari.\n\n**Saran:** Pertimbangkan untuk masuk SMK. Cari tahu program keahlian yang paling sesuai dengan hobi dan minat Anda (misal: IT, Otomotif, Tata Boga, dll)."
      };

      return `### Hasil Analisis: Rekomendasi Penjurusan
Berdasarkan jawaban Anda, rekomendasi penjurusan yang paling sesuai adalah **${majorNames[topMajor] || topMajor}**.

**Karakteristik:**
${majorDesc[topMajor] || "Anda memiliki potensi di bidang ini."}

**Saran Tindak Lanjut:**
- Diskusikan hasil ini dengan orang tua dan guru BK Anda.
- Pertimbangkan juga nilai akademik Anda di mata pelajaran terkait.
- Jangan ragu untuk memilih jurusan yang benar-benar Anda minati, bukan karena ikut-ikutan teman.`;
    }

    case 'anxiety': {
      const totalAx = scores['anxiety'] || 0;
      let level = "";
      let desc = "";
      let advice = "";

      if (totalAx <= 15) {
        level = "Rendah (Normal)";
        desc = "Anda memiliki tingkat kecemasan yang rendah dan mampu mengelola stres dengan baik. Kondisi emosional Anda stabil.";
        advice = "- Pertahankan gaya hidup sehat dan pola pikir positif.\n- Lanjutkan rutinitas relaksasi yang sudah Anda lakukan.";
      } else if (totalAx <= 45) {
        level = "Sedang";
        desc = "Anda mengalami tingkat kecemasan sedang. Ada beberapa hal yang mungkin membebani pikiran Anda saat ini, namun masih dalam batas yang bisa dikendalikan.";
        advice = "- Cobalah teknik relaksasi seperti pernapasan dalam atau meditasi.\n- Ceritakan perasaan Anda kepada teman terpercaya atau keluarga.\n- Kurangi konsumsi kafein dan pastikan tidur yang cukup.";
      } else {
        level = "Tinggi";
        desc = "Anda mengalami tingkat kecemasan yang tinggi. Hal ini mungkin sudah mulai mengganggu aktivitas sehari-hari dan konsentrasi belajar Anda.";
        advice = "- **Sangat disarankan** untuk berkonsultasi dengan guru BK, konselor, atau psikolog profesional.\n- Jangan memendam perasaan sendiri, carilah dukungan dari orang terdekat.\n- Fokus pada hal-hal yang bisa Anda kontrol saat ini.";
      }

      return `### Hasil Analisis: Tingkat Kecemasan ${level}
Skor Kecemasan Anda: **${totalAx}**

**Interpretasi:**
${desc}

**Saran Tindak Lanjut:**
${advice}`;
    }

    case 'cfit': {
      const rawScore = scores['cfit'] || 0;
      const estimatedIQ = Math.round((rawScore / 40) * 70 + 70);
      
      let category = "";
      if (estimatedIQ >= 130) category = "Sangat Superior";
      else if (estimatedIQ >= 120) category = "Superior";
      else if (estimatedIQ >= 110) category = "Rata-rata Atas";
      else if (estimatedIQ >= 90) category = "Rata-rata";
      else if (estimatedIQ >= 80) category = "Rata-rata Bawah";
      else category = "Rendah";

      return `### Hasil Analisis: Tes IQ CFIT
Skor Mentah: **${rawScore}** / 40
Estimasi IQ: **${estimatedIQ}**
Kategori: **${category}**

**Interpretasi:**
Culture Fair Intelligence Test (CFIT) mengukur kecerdasan fluid Anda—kemampuan untuk bernalar secara logis dan memecahkan masalah dalam situasi baru, terlepas dari pengetahuan yang diperoleh sebelumnya.

Skor IQ Anda sebesar **${estimatedIQ}** termasuk dalam kategori **${category}**. Ini menunjukkan tingkat efisiensi intelektual Anda dalam memahami hubungan kompleks dan memproses informasi non-verbal.

**Karakteristik Kategori ${category}:**
- Kemampuan abstraksi dan pemecahan masalah yang ${rawScore > 25 ? 'sangat baik' : 'cukup baik'}.
- Kecepatan dalam menangkap pola dan logika non-verbal.
- Kemampuan beradaptasi dengan tugas-tugas baru yang menantang secara kognitif.

**Saran Tindak Lanjut:**
- Terus asah potensi intelektual Anda melalui kegiatan yang menantang otak seperti puzzle, strategi, dan analisis data.
- Gunakan kemampuan logika Anda untuk membantu dalam pengambilan keputusan yang objektif.
- Kembangkan pula kecerdasan emosional dan keterampilan praktis untuk menyeimbangkan potensi intelektual Anda.`;
    }

    case 'wartegg': {
      return `### Hasil Analisis Tes Wartegg
Status: **Analisis Rekomendasi Tersedia**

Tes Wartegg adalah salah satu alat tes proyektif psikologi yang digunakan untuk mengungkap struktur kepribadian seseorang. Melalui 8 kotak tugas menggambar ini, kita dapat melihat bagaimana Anda mengelola emosi, menghadapi masalah, hingga ambisi masa depan.

**Panduan Interpretasi Per Kotak:**

1.  **Kotak I (Diri Sendiri):** Melambangkan identitas diri, kepercayaan diri, dan bagaimana Anda menempatkan diri di pusat lingkungan. Gambar yang terpusat dan rapi menunjukkan kesadaran diri yang baik.
2.  **Kotak II (Afeksi/Emosi):** Fokus pada fleksibilitas emosional dan hubungan sosial. Garis-garis lengkung biasanya menunjukkan ekspresi emosional yang luwes.
3.  **Kotak III (Ambisi & Motivasi):** Mencerminkan keinginan untuk maju, ambisi, dan efisiensi dalam mencapai tujuan. Garis yang naik menunjukkan semangat yang tinggi.
4.  **Kotak IV (Beban/Masalah):** Melambangkan bagaimana Anda menghadapi ketakutan, kecemasan, atau masalah yang berat. Cara Anda mengintegrasikan titik hitam kotak ini mencerminkan mekanisme pertahanan diri Anda.
5.  **Kotak V (Energi & Agresi):** Terkait dengan cara mengatasi ketegangan dan energi psikis dalam bertindak atau menghadapi konflik.
6.  **Kotak VI (Intelektualitas):** Mengukur kemampuan integrasi, pengorganisasian, dan berpikir logis. Bagaimana Anda menghubungkan dua garis menunjukkan kemandirian berpikir.
7.  **Kotak VII (Sensitivitas):** Melambangkan kepekaan, kelembutan, dan erotisme (dalam konteks psikologis berarti kemampuan untuk mencintai atau empati).
8.  **Kotak VIII (Integrasi Sosial):** Menunjukkan perasaan terlindungi, rasa aman, dan bagaimana Anda berbaur dengan norma sosial di masyarakat.

**Langkah Selanjutnya:**
Gunakan fitur **ANALISA AI** pada halaman hasil untuk mendapatkan interpretasi personal yang lebih mendalam berdasarkan gambar dan judul yang Anda buat. Disarankan juga untuk berkonsultasi dengan Guru BK atau Psikolog untuk interpretasi profesional yang lebih komprehensif.`;
    }

    case 'school_career': {
      return `### Hasil Analisis: Perencanaan Karir
Terima kasih telah mengikuti tes perencanaan karir. Hasil tes Anda menunjukkan preferensi yang berharga mengenai motivasi dan keahlian Anda.

**Interpretasi Singkat:**
- **Motivasi:** Anda didorong oleh ${scores['social'] ? 'keinginan untuk membantu orang lain' : scores['creative'] ? 'kreativitas dan inovasi' : scores['balance'] ? 'keseimbangan hidup' : 'gaji dan status'}.
- **Kelebihan:** Anda memiliki keunggulan utama dalam hal ${scores['communication'] ? 'komunikasi' : scores['analytical'] ? 'analisis' : scores['leadership'] ? 'kepemimpinan' : 'bidang teknis'}.

**Saran Pengembangan Karir:**
1. **Eksplorasi:** Cari tahu lebih lanjut tentang industri yang relevan dengan hasil analisis di atas.
2. **Magang:** Jika memungkinkan, carilah kesempatan internship atau workshop singkat yang sesuai dengan bidang yang diminati.
3. **Diskusi:** Bicarakan hasil ini dengan Guru BK atau mentor untuk mendapatkan pandangan lebih luas tentang jalur pendidikan dan karir yang tepat.

*Ingatlah bahwa pilihan karir adalah perjalanan panjang. Fokuslah untuk terus meningkatkan keterampilan yang relevan dengan minat Anda.*`;
    }

    default:
      return "Analisis hasil tes menunjukkan potensi yang baik pada bidang yang Anda pilih. Teruslah kembangkan minat dan bakat Anda.";
  }
};
