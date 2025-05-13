require("dotenv").config();
const { SystemTask } = require("../model");
const db = require("../config/databaseConfig");

const taskList = [
  {
    title: "Ucapkan Selamat Pagi!",
    description:
      "Mulailah hari dengan sapaan sederhana kepada orang tua atau anakmu.",
    recurrenceInterval: "daily",
    targetRole: "all",
  },
  {
    title: "Beri Pujian",
    description:
      "Beri pujian yang tulus kepada orang tua atau anakmu hari ini.",
    recurrenceInterval: "daily",
    targetRole: "all",
  },
  {
    title: "Tanya Tentang Harinya",
    description:
      "Tunjukkan ketertarikan pada apa yang dilakukan oleh anggota keluargamu hari ini.",
    recurrenceInterval: "daily",
    targetRole: "all",
  },
  {
    title: "Minum Air Bersama",
    description:
      "Ingatkan satu sama lain untuk tetap terhidrasi dengan minum air bersama.",
    recurrenceInterval: "daily",
    targetRole: "all",
  },
  {
    title: "Tonton Sesuatu Bersama",
    description: "Pilih video atau film pendek dan nikmati bersama.",
    recurrenceInterval: "weekly",
    targetRole: "all",
  },
  {
    title: "Kerjakan Tugas Rumah Kecil Bersama",
    description:
      "Bekerja sama untuk melakukan tugas kecil seperti melipat baju atau merapikan ruangan.",
    recurrenceInterval: "weekly",
    targetRole: "all",
  },
  {
    title: "Bagikan Kenangan",
    description:
      "Ingat kembali momen menyenangkan atau bermakna yang pernah kalian alami bersama.",
    recurrenceInterval: "monthly",
    targetRole: "all",
  },
  {
    title: "Buat Tujuan Bulan Ini",
    description:
      "Tentukan tujuan kecil dan saling mendukung untuk mencapainya.",
    recurrenceInterval: "monthly",
    targetRole: "all",
  },
  {
    title: "Ceritakan Lelucon",
    description: "Ceriakan suasana dengan sesuatu yang lucu.",
    recurrenceInterval: "daily",
    targetRole: "child",
  },
  {
    title: "Tawarkan Bantuan",
    description:
      "Bantu orang tuamu dengan tugas kecil seperti mencuci piring atau melipat baju.",
    recurrenceInterval: "daily",
    targetRole: "child",
  },
  {
    title: "Ajarkan Hal Baru",
    description: "Ajarkan anakmu sesuatu yang berguna atau menyenangkan.",
    recurrenceInterval: "weekly",
    targetRole: "parent",
  },
  {
    title: "Ucapkan Terima Kasih",
    description:
      "Hargai hal-hal yang telah mereka lakukan, sekecil apapun itu.",
    recurrenceInterval: "monthly",
    targetRole: "all",
  },
  {
    title: "Berikan Pelukan",
    description: "Sentuhan fisik membantu memperkuat ikatan emosional.",
    recurrenceInterval: "weekly",
    targetRole: "all",
  },
  {
    title: "Minta Bantuan",
    description: "Izinkan anggota keluargamu membantumu dalam hal kecil.",
    recurrenceInterval: "weekly",
    targetRole: "all",
  },
];

async function seedTasks() {
  try {
    await db.authenticate();
    await db.sync();

    for (const task of taskList) {
      await SystemTask.findOrCreate({
        where: { title: task.title },
        defaults: task,
      });
    }

    console.log("✅ Seeding selesai.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Gagal menanam data:", err);
    process.exit(1);
  }
}

seedTasks();
