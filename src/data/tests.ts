import { TestData, TestType } from '../types';

export const TESTS: Record<TestType, TestData> = {
  learning_style: {
    title: "Tes Gaya Belajar",
    description: "Kenali cara terbaikmu dalam menyerap informasi: Visual, Auditori, atau Kinestetik.",
    educationalObjective: "Tujuan tes ini adalah membantu kamu mengetahui gaya belajar mana yang paling dominan dalam dirimu. Dengan mengetahui gaya belajar, kamu bisa menemukan cara belajar yang paling nyaman dan efektif, sehingga proses memahami pelajaran menjadi lebih menyenangkan dan tidak mudah bosan.",
    questionTypeDesc: "Kamu akan diberikan berbagai situasi sehari-hari, dari cara menghafal sampai saat melakukan kegiatan luang. Kamu cukup memilih satu opsi yang paling menggambarkan kebiasaan atau reaksimu.",
    resultInterpretation: "Hasil tes akan menunjukkan apakah kamu tipe Visual (mudah belajar dengan melihat gambar/catatan visual), Auditori (mudah belajar dengan mendengar/berdiskusi), atau Kinestetik (mudah belajar melalui praktik dan gerakan tubuh). Setelah tahu, kamu bisa mengatur strategi belajarmu sendiri!",
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
    educationalObjective: "Tujuan tes ini adalah untuk memetakan kekuatan tersembunyimu berdasarkan teori Kecerdasan Majemuk (Multiple Intelligences). Ingat, setiap orang cerdas dengan caranya masing-masing!",
    questionTypeDesc: "Kamu akan menjawab beberapa pernyataan tentang hal yang kamu sukai atau kebiasaanmu dalam bentuk skala (Sangat Tidak Setuju hingga Sangat Setuju). Jawab jujur sesuai dengan kenyataan.",
    resultInterpretation: "Hasil akhirnya akan menampilkan skor tertinggi di antara 8 tipe kecerdasan (Linguistik/Bahasa, Logika-Matematika, Visual-Spasial, Musikal, Kinestetik, Interpersonal/Sosial, Intrapersonal/Diri Sendiri, atau Naturalis/Alam). Fokuslah untuk mengasah kecerdasan dominanmu dan menjadikannya kekuatan utamamu ke depan.",
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
    educationalObjective: "Tes Kepribadian ini bertujuan untuk mengenali bagaimana kamu mendapatkan energimu (Sosialisasi VS Menyendiri) serta bagaimana kamu membuat keputusan (Logika VS Perasaan). Mengenali sifat aslimu membantu kamu lebih percaya diri dan bisa beradaptasi di masyarakat.",
    questionTypeDesc: "Diberikan beberapa situasi atau kebiasaan, dan kamu tinggal memilih satu opsi yang paling terasa 'Kamu Banget'.",
    resultInterpretation: "Hasil tes ini akan memberikan gambaran apakah kamu cenderung Ekstrovert (suka keramaian) atau Introvert (butuh waktu tenang). Juga apakah kamu dominan Logika (Thinking) atau Perasaan (Feeling). Ini sangat berguna untuk menentukan gaya belajarmu atau caramu bekerja dalam kelompok kerja/tugas sekolah.",
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
    educationalObjective: "Tes ini mengeksplorasi minat dan bakat bawaanmu berdasarkan teori RIASEC (Realistic, Investigative, Artistic, Social, Enterprising, Conventional). Tujuannya adalah untuk membantu kamu menemukan bidang yang kemungkinan besar akan membuatmu sukses dan bahagia jika kamu tekuni nanti (seperti ekskul, lomba, atau karir).",
    questionTypeDesc: "Kamu akan menjawab 'Ya' atau 'Tidak' terhadap berbagai macam kegiatan. Pilihlah kegiatan yang jujur kamu sukai atau bisa kamu bayangkan dirimu asyik melakukannya.",
    resultInterpretation: "Hasilnya akan menunjukkan 2-3 tipe kepribadian kerja yang paling dominan dalam dirimu (misal: Suka angka/data, suka seni, atau suka menolong orang). Dari sini kamu bisa mencocokkan dengan cita-cita atau jurusan kuliah nanti.",
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
    educationalObjective: "Tes ini sangat penting untuk membantu kamu kelas 9 SMP yang sedang bingung memilih mau lanjut SMA jurusan apa (IPA/IPS/Bahasa), atau lebih cocok masuk SMK (Sekolah Menengah Kejuruan) biar bisa langsung bekerja/praktik.",
    questionTypeDesc: "Pertanyaannya berkaitan dengan mata pelajaran favoritmu dan hal-hal yang suka kamu observasi atau praktikkan dalam kehidupan sehari-hari.",
    resultInterpretation: "Berdasarkan skor dari jawabanmu, tes ini akan merekomendasikan pilihan apakah kamu lebih memiliki ketertarikan di ilmu Sains (IPA), ilmu pertimbangan Sosial/Ekonomi (IPS), sastra (Bahasa), atau sekolah keterampilan praktis (SMK). Gunakan ini sebagai referensi, bukan patokan mutlak!",
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
    educationalObjective: "Tes Kecemasan bertujuan mengecek bagaimana kondisi jiwamu saat ini dan apakah ada tanda-tanda stres berlebih atau kekhawatiran yang mengganggu. Tujuannya adalah untuk mendeteksi dini agar kamu bisa lebih mawas diri dan mencari dukungan atau cara relaksasi jika diperlukan.",
    questionTypeDesc: "Kamu akan menjawab seberapa sering kamu merasakan keluhan fisik atau tekanan pikiran tertentu dalam satu atau dua minggu terakhir (Tidak Pernah hingga Selalu).",
    resultInterpretation: "Hasil dari tes ini adalah tingkat kecemasanmu, berjenjang dari Rendah (normal) hingga Sangat Tinggi. Hasil tes ini bersifat skrining, artinya, bukan diagnosis medis asli, tetapi peringatan jika stresmu sudah mengganggu aktivitas agar kamu bisa bercerita ke Guru BK atau profesional (Psikolog).",
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
      { id: "cf1", text: "Seri: Sebuah titik sudut belah ketupat bergerak memutar searah jarum jam dari atas, ke kanan, ke bawah. Posisi titik sudut pada perubahan keempat akan berada di?", options: [{ text: "Kiri", value: "cfit", score: 1 }, { text: "Tengah", value: "cfit", score: 0 }, { text: "Atas", value: "cfit", score: 0 }, { text: "Kanan bawah", value: "cfit", score: 0 }] },
      { id: "cf2", text: "Seri: Sebuah garis vertikal (1), lalu garis membentuk sudut siku-siku (2), lalu bentuk bujur sangkar dengan satu sisi terbuka (3). Gambar selanjutnya berupa?", options: [{ text: "Persegi/Bujur sangkar utuh", value: "cfit", score: 1 }, { text: "Belah ketupat", value: "cfit", score: 0 }, { text: "Segitiga", value: "cfit", score: 0 }, { text: "Dua garis silang", value: "cfit", score: 0 }] },
      { id: "cf3", text: "Seri: Lingkaran dibagi 2 area, lalu dibagi 4 area, lalu dibagi 8 area. Selanjutnya lingkaran dibagi menjadi?", options: [{ text: "16 area", value: "cfit", score: 1 }, { text: "10 area", value: "cfit", score: 0 }, { text: "12 area", value: "cfit", score: 0 }, { text: "32 area", value: "cfit", score: 0 }] },
      { id: "cf4", text: "Seri: Tanda panah menunjuk Utara, Timur Laut, Timur. Selanjutnya menunjuk ke arah?", options: [{ text: "Tenggara", value: "cfit", score: 1 }, { text: "Selatan", value: "cfit", score: 0 }, { text: "Barat Daya", value: "cfit", score: 0 }, { text: "Selatan Timur", value: "cfit", score: 0 }] },
      { id: "cf5", text: "Seri: Kotak hitam bergeser dari pojok kiri atas, ke pojok kanan atas, lalu pojok kanan bawah. Posisi selanjutnya?", options: [{ text: "Pojok kiri bawah", value: "cfit", score: 1 }, { text: "Tengah", value: "cfit", score: 0 }, { text: "Kembali ke pojok kiri atas", value: "cfit", score: 0 }, { text: "Pojok kiri atas", value: "cfit", score: 0 }] },
      { id: "cf6", text: "Seri: Bintang segi-5 tertutup, segi-4 tertutup, bidang segitiga (terbuka satu garis). Selanjutnya?", options: [{ text: "Garis saling silang (X)", value: "cfit", score: 0 }, { text: "Garis lengkung (U)", value: "cfit", score: 0 }, { text: "Satu garis sejajar atau dua titik", value: "cfit", score: 1 }, { text: "Lingkaran terbuka", value: "cfit", score: 0 }] },
      { id: "cf7", text: "Seri: Poligon segi-6 bersudut tumpul, bangun segi-5 bersudut siku, bangun segi-4 bersudut lancip. Susunan berikutnya yang paling logis adalah?", options: [{ text: "Segitiga", value: "cfit", score: 1 }, { text: "Bujur sangkar 2 dimensi", value: "cfit", score: 0 }, { text: "Lingkaran tanpa sudut", value: "cfit", score: 0 }, { text: "Garis saling berpotongan", value: "cfit", score: 0 }] },
      { id: "cf8", text: "Seri: Di dalam lingkaran terdapat 1 tanda (x), lalu 3 tanda (x), lalu 5 tanda (x). Selanjutnya terdapat?", options: [{ text: "7 tanda (x)", value: "cfit", score: 1 }, { text: "6 tanda (x)", value: "cfit", score: 0 }, { text: "8 tanda (x)", value: "cfit", score: 0 }, { text: "Tanda (+) saja", value: "cfit", score: 0 }] },
      { id: "cf9", text: "Seri: Area blok hitam pada persegi ada di kiri, merotasi ke atas, lalu ke kanan. Posisi blok hitam selanjutnya merotasi ke?", options: [{ text: "Bawah", value: "cfit", score: 1 }, { text: "Tengah", value: "cfit", score: 0 }, { text: "Samping Kiri", value: "cfit", score: 0 }, { text: "Bawah Kanan", value: "cfit", score: 0 }] },
      { id: "cf10", text: "Seri: Segitiga sama sisi berotasi 120 derajat ke kanan pada sumbu pusatnya, lalu berotasi lagi 120 derajat. Rotasi selanjutnya akan membuat posisi segitiga?", options: [{ text: "Kembali ke posisi semula (0 derajat)", value: "cfit", score: 1 }, { text: "Menghadap ke bawah (180 derajat)", value: "cfit", score: 0 }, { text: "Menghadap miring 45 derajat", value: "cfit", score: 0 }, { text: "Membalik orientasinya secara horizontal", value: "cfit", score: 0 }] },
      { id: "cf11", text: "Klasifikasi: Manakah dari bangun berikut yang aturan geometrinya paling tidak sesuai dengan yang lain?", options: [{ text: "Persegi panjang", value: "cfit", score: 0 }, { text: "Segitiga siku-siku", value: "cfit", score: 0 }, { text: "Trapesium", value: "cfit", score: 0 }, { text: "Lingkaran", value: "cfit", score: 1 }] },
      { id: "cf12", text: "Klasifikasi: Manakah dari susunan pola ini yang tidak selaras aturannya?", options: [{ text: "A-C-E", value: "cfit", score: 0 }, { text: "B-D-F", value: "cfit", score: 0 }, { text: "G-I-K", value: "cfit", score: 0 }, { text: "M-N-O", value: "cfit", score: 1 }] },
      { id: "cf13", text: "Klasifikasi: Manakah dari sifat dua garis di bawah ini yang dipastikan selalu membentuk sudut tajam/tumpul jika diteruskan?", options: [{ text: "Garis horizontal yang ditumpuk", value: "cfit", score: 0 }, { text: "Garis vertikal yang bersebelahan", value: "cfit", score: 0 }, { text: "Garis diagonal yang tidak sejajar", value: "cfit", score: 1 }, { text: "Kumpulan garis sejajar", value: "cfit", score: 0 }] },
      { id: "cf14", text: "Klasifikasi: Cari kelompok urutan bertingkat dengan logika matematika yang menyimpang dari yang lain.", options: [{ text: "2-4-6", value: "cfit", score: 0 }, { text: "3-6-9", value: "cfit", score: 0 }, { text: "5-10-15", value: "cfit", score: 0 }, { text: "1-4-9", value: "cfit", score: 1 }] },
      { id: "cf15", text: "Klasifikasi: Hubungan penempatan mana yang memiliki hierarki berbeda dengan 3 bentuk lainnya?", options: [{ text: "Kotak berongga yang membungkus kotak utuh", value: "cfit", score: 0 }, { text: "Lingkaran besar melingkupi lingkaran kecil", value: "cfit", score: 0 }, { text: "Segitiga luar melindungi segitiga dalam", value: "cfit", score: 0 }, { text: "Tanda silang di bagian eksterior luar dari segi empat", value: "cfit", score: 1 }] },
      { id: "cf16", text: "Klasifikasi: Susunan kertas mana yang TIDAK mungkin membentuk satu kubus tertutup tiga dimensi saat dilipat?", options: [{ text: "Jaring-jaring 6 bidang menyerupai salib (T)", value: "cfit", score: 0 }, { text: "Jaring-jaring tangga bergeser", value: "cfit", score: 0 }, { text: "Jaring-jaring 4 deret dengan 1 sayap atas dan 1 sayap bawah", value: "cfit", score: 0 }, { text: "Jaring-jaring 5 bidang berderet sejajar vertikal sepenuhnya", value: "cfit", score: 1 }] },
      { id: "cf17", text: "Klasifikasi: Jika suatu balok mengalami transformasi, manakah dari transformasi ini yang tidak mengubah ukuran volumenya?", options: [{ text: "Penyusutan setiap sisi sebesar 10%", value: "cfit", score: 0 }, { text: "Rotasi orientasinya secara diagonal sejauh 45 derajat", value: "cfit", score: 1 }, { text: "Pembelahan sempurna diagonal menjadi dua sisi prisma", value: "cfit", score: 0 }, { text: "Penambahan rusuk di satu sisi memanjangkan balok", value: "cfit", score: 0 }] },
      { id: "cf18", text: "Klasifikasi: Manakah dari susunan huruf yang BUKAN terbentuk dari pencerminan aksis vertikal tegak lurus secara utuh? (Tampak sama di cermin)", options: [{ text: "M", value: "cfit", score: 0 }, { text: "T", value: "cfit", score: 0 }, { text: "O", value: "cfit", score: 0 }, { text: "L", value: "cfit", score: 1 }] },
      { id: "cf19", text: "Klasifikasi: Perhatikan proposisi ukuran logis berikut, mana yang jelas bertentangan?", options: [{ text: "Atom < Sel kecil", value: "cfit", score: 0 }, { text: "Kucing rumahan < Jerapah", value: "cfit", score: 0 }, { text: "Paus Biru = Seekor Gajah Darat", value: "cfit", score: 1 }, { text: "Bulan satelit < Planet Bumi", value: "cfit", score: 0 }] },
      { id: "cf20", text: "Klasifikasi: Hubungan relasional antitesis mana yang polanya menyimpang (Bukan pasangan berlawanan murni)?", options: [{ text: "Utara : Selatan", value: "cfit", score: 0 }, { text: "Timur : Barat", value: "cfit", score: 0 }, { text: "Atas : Bawah", value: "cfit", score: 0 }, { text: "Kiri : Pusat Tengah", value: "cfit", score: 1 }] },
      { id: "cf21", text: "Matriks: Apabila titik tunggal memanjang menjadi garis lurus, maka garis lurus yang ditarik secara tegak lurus dimensinya mendatar akan menjadi?", options: [{ text: "Bidang datar", value: "cfit", score: 1 }, { text: "Dua titik memisah", value: "cfit", score: 0 }, { text: "Kurva", value: "cfit", score: 0 }, { text: "Ruang 3 dimensi", value: "cfit", score: 0 }] },
      { id: "cf22", text: "Matriks: Kotak utuh terbelah menjadi dua segitiga bersentuhan. Suatu lingkaran utuh yang dibelah dari tengah menjadi dua area simetris yang bersentuhan membentuk?", options: [{ text: "Dua bentuk setengah lingkaran", value: "cfit", score: 1 }, { text: "Dua persegi", value: "cfit", score: 0 }, { text: "Elips ganda", value: "cfit", score: 0 }, { text: "Cincin berongga", value: "cfit", score: 0 }] },
      { id: "cf23", text: "Matriks: Putih transisi ke Abu-abu, lalu ke Hitam. Padanan gradasi untuk Pendek transisi ke Menengah, lalu ke...?", options: [{ text: "Panjang/Tinggi", value: "cfit", score: 1 }, { text: "Lebar", value: "cfit", score: 0 }, { text: "Bawah", value: "cfit", score: 0 }, { text: "Menyusut", value: "cfit", score: 0 }] },
      { id: "cf24", text: "Matriks: Baris 1: Panah menghadap Kiri, Atas, Kanan. Baris 2: Segitiga menunjuk Kiri, Atas...?", options: [{ text: "Kanan", value: "cfit", score: 1 }, { text: "Bawah", value: "cfit", score: 0 }, { text: "Pusat", value: "cfit", score: 0 }, { text: "Di Balik", value: "cfit", score: 0 }] },
      { id: "cf25", text: "Matriks: Analogi cermin lurus vertikal: Huruf 'p' kecil menghasilkan 'q' kecil. Maka huruf 'd' kecil menghasilkan...?", options: [{ text: "b", value: "cfit", score: 1 }, { text: "p", value: "cfit", score: 0 }, { text: "d terbalik (q)", value: "cfit", score: 0 }, { text: "c", value: "cfit", score: 0 }] },
      { id: "cf26", text: "Matriks: 1 garis lurus sempurna memotong sebuah lingkaran menghasilkan 2 bagian bidang. Jika 2 garis silang sempurna memotong lingkaran di titik pusat, menghasilkan...", options: [{ text: "3 bagian sama besar", value: "cfit", score: 0 }, { text: "4 bagian sama besar", value: "cfit", score: 1 }, { text: "6 bagian asimetris", value: "cfit", score: 0 }, { text: "8 irisan", value: "cfit", score: 0 }] },
      { id: "cf27", text: "Matriks: Jam mekanik menunjukkan pukul 03.00 akan menghasilkan sudut tegak (90 derajat) pada jarumnya. Arah jarum yang menghasilkan sudut garis lurus horizontal sempurna mendatar adalah pukul...", options: [{ text: "06.00", value: "cfit", score: 0 }, { text: "09.15 (Aproksimasi lurus 180 derajat sempurna)", value: "cfit", score: 1 }, { text: "12.00", value: "cfit", score: 0 }, { text: "03.00", value: "cfit", score: 0 }] },
      { id: "cf28", text: "Matriks: Menghadap ke cermin tegak datar di depan anda, jika anda menunjuk sudut kiri atas, bayangan anda terlihat menunjuk ke arah?", options: [{ text: "Kanan bawah anda", value: "cfit", score: 0 }, { text: "Kanan atas bayangan", value: "cfit", score: 1 }, { text: "Samping kiri tepat", value: "cfit", score: 0 }, { text: "Kiri atas posisi real anda", value: "cfit", score: 0 }] },
      { id: "cf29", text: "Matriks: 2 persegi kongruen direkatkan sejajar pada salah satu sisi rusuk membentuk 1 Persegi panjang utuh. Jika 2 segitiga siku-siku yang ukuran dan sudutnya ekuivalen diletakkan merekat sempurna secara terbalik simetris, menghasilkan bangun?", options: [{ text: "Lingkaran", value: "cfit", score: 0 }, { text: "Bujursangkar bersudut tumpul", value: "cfit", score: 0 }, { text: "Persegi empat panjang utuh penuh", value: "cfit", score: 1 }, { text: "Poligon acak 7 sudut", value: "cfit", score: 0 }] },
      { id: "cf30", text: "Matriks: Transformasi Deret Skalar X → 2X. Pola: x=3 berubah menjadi 6. Jika x=15 dirubah mematuhi kaidah tersebut, ia menghasilkan...", options: [{ text: "25", value: "cfit", score: 0 }, { text: "30", value: "cfit", score: 1 }, { text: "45", value: "cfit", score: 0 }, { text: "75", value: "cfit", score: 0 }] },
      { id: "cf31", text: "Syarat Abstrak: Sebuah titik padat harus diletakkan DI DALAM bangun Lingkaran, tetapi sepenuhnya TETAP DI LUAR Segitiga interior. Jika ternyata posisi Lingkaran berada sepenuhnya terkurung seluruhnya di dalam Segitiga, mungkinkah kondisi peletakkan titik itu ada?", options: [{ text: "Pasti Mungkin disudut", value: "cfit", score: 0 }, { text: "Tidak Mungkin diwujudkan", value: "cfit", score: 1 }, { text: "Selalu Mungkin dimana saja", value: "cfit", score: 0 }, { text: "Hanya berpotongan iris", value: "cfit", score: 0 }] },
      { id: "cf32", text: "Syarat Relasional: Tali Z terukur lebih panjang ukurannya dari tali V. Tapi Tali W terpotong lebih pendek dari tali V. Manakah di antara tali ini yang mutlak memegang ukuran bentang terpanjang?", options: [{ text: "Tali V", value: "cfit", score: 0 }, { text: "Tali W", value: "cfit", score: 0 }, { text: "Tali Z", value: "cfit", score: 1 }, { text: "Tali X", value: "cfit", score: 0 }] },
      { id: "cf33", text: "Syarat Irisan: Area abu-abu ditetapkan mutlak merupakan ruang yang beririsan (overlap) tumpang tindih antara Bujur Sangkar dan Lingkaran. Berarti sebuah Objek Y yang mendarat di area abu-abu...", options: [{ text: "Objek Y bebas di luar Lingkaran", value: "cfit", score: 0 }, { text: "Objek Y menduduki area di kedua bangun secara bersamaan-paralel", value: "cfit", score: 1 }, { text: "Objek Y hanya eksklusif ada di Bujur Sangkar", value: "cfit", score: 0 }, { text: "Objek Y batal menduduki area", value: "cfit", score: 0 }] },
      { id: "cf34", text: "Syarat Fisik Dasar: Diketahui air pasif statis akan selalu mencari keseimbangan permukaannya dari level lebih tinggi menetap ke rendah gravitasi. Adanya suatu pipa bentuk letter U memanjang dari bawah, yang dimiringkan sejajar di tanah namun diisi penuh pasokan air, kedua menara pipa terbuka atasnya akan menampilkan permukaan batas air dengan wujud?", options: [{ text: "Permukaan di sisi satu lebih curam menonjol tajam", value: "cfit", score: 0 }, { text: "Sama tingginya di batas horizontal (hukum bejana berhubungan sejajar level ekuivalen)", value: "cfit", score: 1 }, { text: "Tergantung ukuran pipanya saja", value: "cfit", score: 0 }, { text: "Permukaan menukik curam ke dinding pipa", value: "cfit", score: 0 }] },
      { id: "cf35", text: "Syarat Hipotetis Rotasi: Jika satu Roda Ratusan gigi Utama G berputar arah maju/searah jarum jam mekanik, menautkan persis gerigi ke gigi sebuah Roda Turunan Kecil sekunder H yang menempel, maka perputaran mekanik Roda H dijamin absolut...?", options: [{ text: "Akan melayang", value: "cfit", score: 0 }, { text: "Berhenti", value: "cfit", score: 0 }, { text: "Berotasi Berlawanan/mundur menyimpang orientasi dari dari Roda Utama G", value: "cfit", score: 1 }, { text: "Searah identik seutuhnya", value: "cfit", score: 0 }] },
      { id: "cf36", text: "Syarat Proposisi Logis Mutlak: Apabila SEMUA jenis golongan A diketahui pasti termasuk bagian kelompok B. Sementara SEBAGIAN kecil dari B adalah bagian kelompok C. Apakah secara fakta mutlak SEMUA populasi A terjamin termasuk golongan C?", options: [{ text: "Bisa dipastikan ya", value: "cfit", score: 0 }, { text: "Hanya 50% saja", value: "cfit", score: 0 }, { text: "Kesimpulan Tidak Mutlak bisa ditarik pasti (Belum Tentu/Kemungkinan tidak)", value: "cfit", score: 1 }, { text: "Tidak terpengaruh", value: "cfit", score: 0 }] },
      { id: "cf37", text: "Syarat Transformasi Geometri: Seandainya lembar kertas dasar bentuk persegi, dilipat presisi membelah simetris ganda dua tahap membentuk lipatan titik temuk tengah bujur sangkar, lalu anda menuak lubang lubrikasi bolong dari posisi tegak lurus menembusnya. Ketika kertas diekspansi terbuka sepenuhnya, total deteksi proyeksi lubang pada struktur awal berjumlah?", options: [{ text: "1 tembusan", value: "cfit", score: 0 }, { text: "2 lubang", value: "cfit", score: 0 }, { text: "4 lubang pantul sejajar terdistribusi simetris", value: "cfit", score: 1 }, { text: "8 lubang", value: "cfit", score: 0 }] },
      { id: "cf38", text: "Syarat Analistis Proyeksi Cahaya Arah: Suatu tongkat silinder tiang berdiri tegak lurus sejajar aksis pada sudut tanah datar khatulistiwa yang rata. Bila presisi tepat menunjuk waktu Pukul 12 siang zenith matahari persis sempurna titik zenith, proyeksi ekor bayangan benda tersebut di daratan akan...?", options: [{ text: "Membentuk siluet horisontal memanjang di barat", value: "cfit", score: 0 }, { text: "Sangat minim terpusat tepat sentris tidak tampak condong mengarah bayangan panjang menyudut ke satu mata angin sisi luar eksterior", value: "cfit", score: 1 }, { text: "Mengarah timur laut condong", value: "cfit", score: 0 }, { text: "Memantulkan garis siluet lurus timur", value: "cfit", score: 0 }] },
      { id: "cf39", text: "Syarat Analisis Volumetrik Tiga Dimensi Kasar: Seandainya blok struktur kubus sempurna berdimensi tebal besar diletakkan tertebas gergaji sayat tepat membelah aksis sentral di tengah sumbu pusat vertikal, mengamputasi geometri kubus ekuivalen menjadi 2 sisa komposit seimbang, konfigurasi sebut geometri bagian keping barunya tersebut dikenal secara struktural sebagai...?", options: [{ text: "Pita mobion", value: "cfit", score: 0 }, { text: "Bola sphere tak simetris", value: "cfit", score: 0 }, { text: "Kerucut dasar kubus prisma segi lima", value: "cfit", score: 0 }, { text: "Dua buah potongan balok kongruen persis saling ekivalen", value: "cfit", score: 1 }] },
      { id: "cf40", text: "Syarat Penilaian Usia Deduktif: Pernyataan 1 menyajikan data: Ibu Maria lahir sebelum Tante Helen dilahirkan ke dunia. Pernyataan 2 menyajikan: Kakak kandung Maria yang lelaki, lahir tepat sesudah Tante Helen. Manakah entitas figur rasional logis individu dengan catatan absolut secara usia murni tergolong insan dengan angka masa usia termuda...?", options: [{ text: "Paman", value: "cfit", score: 0 }, { text: "Tante Helen", value: "cfit", score: 0 }, { text: "Ayah", value: "cfit", score: 0 }, { text: "Kakak Lelaki Maria", value: "cfit", score: 1 }] }
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
      { id: "sc4", text: "Apa satu hal yang ingin kamu capai di masa depan?", options: [{ text: "Menjadi ahli di bidangku", value: "expert" }, { text: "Membangun usaha sendiri", value: "entrepreneur" }, { text: "Berdampak bagi masyarakat", value: "impactful" }, { text: "Meraih jabatan tinggi", value: "high_position" }] },
      { id: "sc5", text: "Ketika menyelesaikan tugas sulit, apa yang kamu harapkan?", options: [{ text: "Imbalan finansial", value: "salarry" }, { text: "Ucapan terima kasih dari yang dibantu", value: "social" }, { text: "Kepuasan menciptakan sesuatu", value: "creative" }, { text: "Waktu istirahat yang cukup", value: "balance" }] },
      { id: "sc6", text: "Pekerjaan ideal bagimu adalah yang...", options: [{ text: "Memberikan kemakmuran ekonomi", value: "salarry" }, { text: "Bermanfaat bagi banyak orang", value: "social" }, { text: "Menuntut ide-ide baru", value: "creative" }, { text: "Tidak menyita waktu pribadi", value: "balance" }] },
      { id: "sc7", text: "Mengapa kamu ingin mencapai kesuksesan?", options: [{ text: "Mencapai kebebasan finansial", value: "salarry" }, { text: "Bisa membantu keluarga/orang lain", value: "social" }, { text: "Ingin menciptakan sesuatu yang unik", value: "creative" }, { text: "Ingin hidup tenang dan nyaman", value: "balance" }] },
      { id: "sc8", text: "Apa yang membuatmu paling bersemangat memulai hari?", options: [{ text: "Target penghasilan yang meningkat", value: "salarry" }, { text: "Membantu orang yang membutuhkan", value: "social" }, { text: "Mengerjakan proyek kreatif baru", value: "creative" }, { text: "Tahu hari ini akan berjalan santai", value: "balance" }] },
      { id: "sc9", text: "Penghargaan kerja macam apa yang paling kamu sukai?", options: [{ text: "Bonus uang atau materi", value: "salarry" }, { text: "Penghargaan atas jasa sosial", value: "social" }, { text: "Kebebasan untuk berkarya", value: "creative" }, { text: "Jatah cuti tambahan", value: "balance" }] },
      { id: "sc10", text: "Dalam sebuah tim, kamu merasa puas jika...", options: [{ text: "Tim mencapai keuntungan besar", value: "salarry" }, { text: "Tim membantu kesejahteraan warga", value: "social" }, { text: "Tim selalu menghasilkan inovasi", value: "creative" }, { text: "Tim bekerja tanpa lembur berlebihan", value: "balance" }] },
      { id: "sc11", text: "Apa arti 'kerja keras' yang paling tepat bagimu?", options: [{ text: "Jalan pintas menuju kekayaan", value: "salarry" }, { text: "Bentuk pengabdian pada sesama", value: "social" }, { text: "Proses mewujudkan ide orisinal", value: "creative" }, { text: "Upaya menyeimbangkan kebutuhan hidup", value: "balance" }] },
      { id: "sc12", text: "Nilai hidup mana yang paling kamu prioritaskan?", options: [{ text: "Kesejahteraan ekonomi", value: "salarry" }, { text: "Kepedulian terhadap sesama", value: "social" }, { text: "Keaslian diri (autentisitas)", value: "creative" }, { text: "Ketenangan batin dan stabilitas", value: "balance" }] },
      { id: "sc13", text: "Kamu merasa paling kecewa (gagal) jika...", options: [{ text: "Kehilangan penghasilan yang besar", value: "salarry" }, { text: "Tidak bisa membantu teman/saudara", value: "social" }, { text: "Ide-idemu ditolak atau tidak terpakai", value: "creative" }, { text: "Stres karena beban kerja berlebih", value: "balance" }] },
      { id: "sc14", text: "Teman-temanmu sering meminta bantuan padamu untuk...", options: [{ text: "Memecahkan logika masalah rumit", value: "analytical" }, { text: "Menjelaskan sesuatu agar mudah dimengerti", value: "communication" }, { text: "Memperbaiki peralatan yang rusak", value: "technical" }, { text: "Memandu atau memimpin kelompok", value: "leadership" }] },
      { id: "sc15", text: "Saat di sekolah, bidang apa yang paling kamu kuasai?", options: [{ text: "Matematika/Logika/Analisis", value: "analytical" }, { text: "Bahasa/Debat/Presentasi", value: "communication" }, { text: "Tugas praktik/Laboratorium", value: "technical" }, { text: "Organisasi/Ketua Kelas", value: "leadership" }] },
      { id: "sc16", text: "Ketika menghadapi masalah besar, tindakan pertamamu adalah...", options: [{ text: "Menganalisis data penyebab masalah", value: "analytical" }, { text: "Membicarakannya dengan rekan tim", value: "communication" }, { text: "Mencoba memperbaikinya secara langsung", value: "technical" }, { text: "Mengambil alih kendali situasi", value: "leadership" }] },
      { id: "sc17", text: "Pekerjaan apa yang menurutmu paling mudah dilakukan?", options: [{ text: "Menyusun laporan data", value: "analytical" }, { text: "Menjelaskan ide kepada orang lain", value: "communication" }, { text: "Merakit atau membuat alat", value: "technical" }, { text: "Mengarahkan orang untuk bekerja", value: "leadership" }] },
      { id: "sc18", text: "Kamu merasa sangat percaya diri saat...", options: [{ text: "Menemukan solusi logis yang tepat", value: "analytical" }, { text: "Meyakinkan orang dengan argumen", value: "communication" }, { text: "Menggunakan peralatan canggih", value: "technical" }, { text: "Menentukan arah keputusan tim", value: "leadership" }] },
      { id: "sc19", text: "Hobi apa yang dirasa paling mewakili kemampuanmu?", options: [{ text: "Catur, puzzle, atau teka-teki silang", value: "analytical" }, { text: "Menulis artikel atau berdiskusi", value: "communication" }, { text: "Modifikasi barang atau instalasi", value: "technical" }, { text: "Menjadi ketua komunitas/panitia", value: "leadership" }] },
      { id: "sc20", text: "Jika harus memilih peran dalam proyek besar, kamu memilih...", options: [{ text: "Peneliti dan pengolah data", value: "analytical" }, { text: "Juru bicara atau humas", value: "communication" }, { text: "Teknisi pelaksana lapangan", value: "technical" }, { text: "Manajer atau koordinator", value: "leadership" }] },
      { id: "sc21", text: "Kualitas apa yang paling dihargai orang darimu?", options: [{ text: "Ketelitian dalam berpikir", value: "analytical" }, { text: "Kemampuan berbicara komunikatif", value: "communication" }, { text: "Keterampilan teknis yang handal", value: "technical" }, { text: "Ketegasan dalam memimpin", value: "leadership" }] },
      { id: "sc22", text: "Bagaimana cara belajarmu yang paling efektif?", options: [{ text: "Mendalami teori dan logika dasar", value: "analytical" }, { text: "Berdiskusi interaktif dengan orang lain", value: "communication" }, { text: "Praktik langsung menggunakan alat", value: "technical" }, { text: "Memandu rekan lain saat belajar", value: "leadership" }] },
      { id: "sc23", text: "Kamu lebih produktif jika bekerja di lokasi yang...", options: [{ text: "Rapi, tenang, dan terstruktur", value: "formal" }, { text: "Santai, fleksibel, dan dinamis", value: "flexible" }, { text: "Terbuka dan dekat dengan alam", value: "outdoor" }, { text: "Khusus riset dengan fasilitas lengkap", value: "lab" }] },
      { id: "sc24", text: "Jadwal kerja yang paling ideal menurutmu adalah...", options: [{ text: "Jam kerja rutin (9 pagi - 5 sore)", value: "formal" }, { text: "Bisa diatur sendiri sesuai mood", value: "flexible" }, { text: "Lebih banyak di luar ruangan", value: "outdoor" }, { text: "Fokus penuh di tempat penelitian", value: "lab" }] },
      { id: "sc25", text: "Rekan kerja yang paling kamu sukai adalah...", options: [{ text: "Sangat profesional dan taat aturan", value: "formal" }, { text: "Kreatif dan suka spontanitas", value: "flexible" }, { text: "Aktif bergerak dan suka tantangan", value: "outdoor" }, { text: "Memiliki keahlian riset yang cerdas", value: "lab" }] },
      { id: "sc26", text: "Pakaian kerja impianmu adalah jenis...", options: [{ text: "Seragam resmi atau setelan rapi", value: "formal" }, { text: "Pakaian bebas dan nyaman (casual)", value: "flexible" }, { text: "Baju lapangan atau safety wear", value: "outdoor" }, { text: "Jas khusus atau pakaian lab", value: "lab" }] },
      { id: "sc27", text: "Bagaimana pandanganmu mengenai rapat rutin?", options: [{ text: "Sangat penting untuk koordinasi resmi", value: "formal" }, { text: "Lebih baik diskusi santai saja", value: "flexible" }, { text: "Pertemuan langsung di lokasi kerja saja", value: "outdoor" }, { text: "Ajang berbagi hasil temuan teknis baru", value: "lab" }] },
      { id: "sc28", text: "Tantangan lingkungan kerja yang kamu nikmati adalah...", options: [{ text: "Sistem kompetisi yang ketat", value: "formal" }, { text: "Perubahan tren yang sangat dinamis", value: "flexible" }, { text: "Kondisi medan dan cuaca lapangan", value: "outdoor" }, { text: "Ketelitian riset tingkat tinggi", value: "lab" }] },
      { id: "sc29", text: "Dimana kamu ingin menghabiskan waktu 8 jam kerjamu?", options: [{ text: "Di gedung kantor di pusat kota", value: "formal" }, { text: "Di rumah atau cafe yang nyaman", value: "flexible" }, { text: "Di area proyek atau alam terbuka", value: "outdoor" }, { text: "Di depan monitor riset atau lab", value: "lab" }] },
      { id: "sc30", text: "Budaya perusahaan mana yang paling kamu pilih?", options: [{ text: "Hierarki dan aturan yang jelas", value: "formal" }, { text: "Keluarga dan kebebasan berekspresi", value: "flexible" }, { text: "Eksplorasi fisik dan petualangan", value: "outdoor" }, { text: "Pusat inovasi ilmu pengetahuan", value: "lab" }] },
      { id: "sc31", text: "Jika ditawari pindah kota, kamu memilih kota yang...", options: [{ text: "Memiliki pusat bisnis yang prestisius", value: "formal" }, { text: "Memiliki komunitas kreatif yang hidup", value: "flexible" }, { text: "Dekat dengan lokasi alam/pertambangan", value: "outdoor" }, { text: "Memiliki fasilitas penelitian terbaik", value: "lab" }] },
      { id: "sc32", text: "Sepuluh tahun lagi, kamu ingin dikenal sebagai...", options: [{ text: "Pakar atau ahli di bidang spesifik", value: "expert" }, { text: "Pemilik bisnis atau pengusaha sukses", value: "entrepreneur" }, { text: "Pahlawan yang mengubah nasib orang", value: "impactful" }, { text: "Pemegang jabatan tinggi yang disegani", value: "high_position" }] },
      { id: "sc33", text: "Apa tolok ukur kesuksesan jangka panjang bagimu?", options: [{ text: "Diakui sebagai ahli internasional", value: "expert" }, { text: "Mandiri finansial dan punya usaha", value: "entrepreneur" }, { text: "Bermanfaat besar bagi lingkungan", value: "impactful" }, { text: "Meraih otoritas dan pengaruh besar", value: "high_position" }] },
      { id: "sc34", text: "Warisan apa yang ingin kamu tinggalkan di masa tua?", options: [{ text: "Buku atau teori hasil pemikiranmu", value: "expert" }, { text: "Perusahaan yang terus berkembang", value: "entrepreneur" }, { text: "Kehidupan masyarakat yang lebih baik", value: "impactful" }, { text: "Sistem atau organisasi yang kokoh", value: "high_position" }] },
      { id: "sc35", text: "Kapan kamu merasa karirmu sangat bermakna?", options: [{ text: "Saat bisa memecahkan masalah ilmiah", value: "expert" }, { text: "Saat bisa membuka lapangan kerja", value: "entrepreneur" }, { text: "Saat bisa menyelamatkan nasib orang", value: "impactful" }, { text: "Saat bisa memimpin organisasi besar", value: "high_position" }] },
      { id: "sc36", text: "Impian terbesar dalam karirmu adalah...", options: [{ text: "Menemukan inovasi yang dipatenkan", value: "expert" }, { text: "Memperluas kerajaan bisnis global", value: "entrepreneur" }, { text: "Mengatasi masalah sosial yang nyata", value: "impactful" }, { text: "Menjadi pimpinan tertinggi institusi", value: "high_position" }] },
      { id: "sc37", text: "Siapa tipe tokoh sukses yang paling kamu kagumi?", options: [{ text: "Ilmuwan jenius (seperti Einstein)", value: "expert" }, { text: "Pengusaha tangguh (seperti Elon Musk)", value: "entrepreneur" }, { text: "Tokoh kemanusiaan (Mother Teresa)", value: "impactful" }, { text: "Pemimpin visioner (seperti Soekarno)", value: "high_position" }] },
      { id: "sc38", text: "Apa yang ingin kamu ucapkan saat pensiun nanti?", options: [{ text: "Saya master dalam bidang saya", value: "expert" }, { text: "Saya membangun ini semua dari awal", value: "entrepreneur" }, { text: "Saya telah berguna bagi sesama", value: "impactful" }, { text: "Saya sudah mencapai puncak karir", value: "high_position" }] },
      { id: "sc39", text: "Jika kamu sudah cukup kaya, apa yang tetap kamu kerjakan?", options: [{ text: "Meneruskan penelitian dan belajar", value: "expert" }, { text: "Mengelola investasi dan bisnis baru", value: "entrepreneur" }, { text: "Fokus pada kegiatan sosial/filantropi", value: "impactful" }, { text: "Memimpin yayasan atau organisasi", value: "high_position" }] },
      { id: "sc40", text: "Apa yang kamu cari dalam sebuah perjalanan karir?", options: [{ text: "Kedalaman ilmu dan pengakuan ahli", value: "expert" }, { text: "Kebebasan dan kemandirian finansial", value: "entrepreneur" }, { text: "Kebermaknaan bagi orang banyak", value: "impactful" }, { text: "Pengaruh, kuasa, dan jabatan", value: "high_position" }] }
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
      const getTop = (keys: string[]) => {
        return keys.reduce((a, b) => (scores[a] || 0) > (scores[b] || 0) ? a : b);
      };

      const topMotiv = getTop(['social', 'creative', 'balance', 'salarry']);
      const topStrength = getTop(['communication', 'analytical', 'leadership', 'technical']);
      const topEnv = getTop(['formal', 'flexible', 'outdoor', 'lab']);
      const topGoal = getTop(['expert', 'entrepreneur', 'impactful', 'high_position']);

      const motivMap: Record<string, string> = { social: 'Kepedulian Sosial', creative: 'Kreativitas', balance: 'Keseimbangan Hidup', salarry: 'Kesejahteraan Finansial' };
      const strengthMap: Record<string, string> = { communication: 'Komunikasi', analytical: 'Analisis', leadership: 'Kepemimpinan', technical: 'Teknis' };
      const envMap: Record<string, string> = { formal: 'Kantor Formal', flexible: 'Tim Fleksibel', outdoor: 'Lapangan/Alam', lab: 'Riset/Laboratorium' };
      const goalMap: Record<string, string> = { expert: 'Menjadi Pakar', entrepreneur: 'Wirausaha', impactful: 'Dampak Sosial', high_position: 'Jabatan Tinggi' };

      return `### Hasil Analisis: Perencanaan Karir
Terima kasih telah mengikuti tes perencanaan karir. Hasil tes Anda memberikan gambaran komprehensif mengenai profil karir masa depan Anda.

**Profil Karir Anda:**
1. **Motivasi Utama:** Anda sangat didorong oleh **${motivMap[topMotiv]}**. Ini adalah nilai inti yang Anda cari dalam sebuah pekerjaan.
2. **Kekuatan Dominan:** Anda memiliki keunggulan kompetitif di bidang **${strengthMap[topStrength]}**. Gunakan ini sebagai "senjata" utama Anda.
3. **Preferensi Lingkungan:** Anda akan bekerja paling optimal di lingkungan **${envMap[topEnv]}**.
4. **Tujuan Jangka Panjang:** Visi masa depan Anda cenderung ke arah **${goalMap[topGoal]}**.

**Saran Pengembangan Karir:**
1. **Eksplorasi Spesifik:** Cari tahu jalur karir yang memadukan kekuatan **${strengthMap[topStrength]}** Anda dengan lingkungan **${envMap[topEnv]}**.
2. **Pengembangan Diri:** Fokuslah mengasah keterampilan pendukung yang sesuai dengan tujuan Anda menjadi **${goalMap[topGoal]}**.
3. **Konsultasi Lanjutan:** Bicarakan grafik hasil tes Anda dengan Guru BK untuk memetakan jurusan sekolah atau kuliah yang paling relevan.

*Ingatlah bahwa pilihan karir adalah perjalanan panjang yang dinamis. Gunakan hasil ini sebagai kompas untuk melangkah lebih percaya diri.*`;
    }

    default:
      return "Analisis hasil tes menunjukkan potensi yang baik pada bidang yang Anda pilih. Teruslah kembangkan minat dan bakat Anda.";
  }
};
