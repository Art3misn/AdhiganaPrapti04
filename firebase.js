// ============================================================
// FIREBASE.JS - KONFIGURASI UNTUK PORTAL ADHIGANA PRAPTI
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  doc, 
  addDoc, 
  deleteDoc, 
  updateDoc, 
  getDoc, 
  getDocs,
  setDoc,
  onSnapshot, 
  query, 
  orderBy, 
  limit,
  where,
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ============================================================
// FIREBASE CONFIG
// ============================================================
const firebaseConfig = {
  apiKey: "AIzaSyATh7MiV8xr4vHgF3AjqMhXc87LhCRF7N0",
  authDomain: "adhiganaprapti-e8f13.firebaseapp.com",
  projectId: "adhiganaprapti-e8f13",
  storageBucket: "adhiganaprapti-e8f13.firebasestorage.app",
  messagingSenderId: "1011133018564",
  appId: "1:1011133018564:web:57e9537b39c85a44593491",
  measurementId: "G-DP6L1NQXR4"
};

// ============================================================
// INISIALISASI
// ============================================================
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log("🔥 Firebase Connected - Portal Adhigana Prapti");

// ============================================================
// FUNGSI UNTUK MADING
// ============================================================

// Kirim Mading ke Firestore
async function sendMading(judul, isi) {
  try {
    const docRef = await addDoc(collection(db, "mading"), {
      judul: judul,
      isi: isi,
      tanggal: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("❌ Gagal kirim mading:", error);
    return { success: false, error: error.message };
  }
}

// Dapatkan semua Mading
async function getMading() {
  try {
    const q = query(
      collection(db, "mading"),
      orderBy("tanggal", "desc"),
      limit(20)
    );
    const snapshot = await getDocs(q);
    const items = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      items.push({
        id: doc.id,
        ...data,
        tanggal: data.tanggal?.toDate?.() || new Date()
      });
    });
    return { success: true, data: items };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Dengarkan Mading real-time
function listenMading(callback) {
  try {
    const q = query(
      collection(db, "mading"),
      orderBy("tanggal", "desc"),
      limit(20)
    );
    
    return onSnapshot(q, (snapshot) => {
      const items = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: doc.id,
          ...data,
          tanggal: data.tanggal?.toDate?.() || new Date()
        });
      });
      callback(items);
    });
  } catch (error) {
    console.error("❌ Error listen mading:", error);
    return null;
  }
}

// Hapus Mading
async function deleteMading(madingId) {
  try {
    await deleteDoc(doc(db, "mading", madingId));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================================
// FUNGSI UNTUK KAS
// ============================================================

// Kirim transaksi Kas ke Firestore
async function sendKas(jenis, nominal, keterangan) {
  try {
    const docRef = await addDoc(collection(db, "kas"), {
      jenis: jenis,
      nominal: nominal,
      keterangan: keterangan,
      tanggal: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("❌ Gagal kirim kas:", error);
    return { success: false, error: error.message };
  }
}

// Dapatkan semua transaksi Kas
async function getKas() {
  try {
    const q = query(
      collection(db, "kas"),
      orderBy("tanggal", "desc"),
      limit(50)
    );
    const snapshot = await getDocs(q);
    const items = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      items.push({
        id: doc.id,
        ...data,
        tanggal: data.tanggal?.toDate?.() || new Date()
      });
    });
    return { success: true, data: items };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Dengarkan Kas real-time
function listenKas(callback) {
  try {
    const q = query(
      collection(db, "kas"),
      orderBy("tanggal", "desc"),
      limit(50)
    );
    
    return onSnapshot(q, (snapshot) => {
      const items = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: doc.id,
          ...data,
          tanggal: data.tanggal?.toDate?.() || new Date()
        });
      });
      callback(items);
    });
  } catch (error) {
    console.error("❌ Error listen kas:", error);
    return null;
  }
}

// Hapus transaksi Kas
async function deleteKas(kasId) {
  try {
    await deleteDoc(doc(db, "kas", kasId));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================================
// FUNGSI UNTUK NOTIFIKASI
// ============================================================

// Kirim notifikasi ke Firestore
async function sendNotification(title, body, type = "info", data = {}) {
  try {
    const docRef = await addDoc(collection(db, "notifications"), {
      title: title,
      body: body,
      type: type,
      data: data,
      timestamp: serverTimestamp(),
      read: false,
      pushTo: "all"
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("❌ Gagal kirim notifikasi:", error);
    return { success: false, error: error.message };
  }
}

// Dengarkan notifikasi real-time
function listenNotifications(callback) {
  try {
    const q = query(
      collection(db, "notifications"),
      orderBy("timestamp", "desc"),
      limit(20)
    );
    
    return onSnapshot(q, (snapshot) => {
      const items = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate?.() || new Date()
        });
      });
      callback(items);
    });
  } catch (error) {
    console.error("❌ Error listen notifications:", error);
    return null;
  }
}

// ============================================================
// FUNGSI UNTUK ABSENSI
// ============================================================

// Simpan absensi ke Firestore
async function saveAbsensi(records) {
  try {
    const data = {
      records: records,
      tanggal: new Date().toISOString().split('T')[0],
      timestamp: serverTimestamp()
    };
    const docRef = await addDoc(collection(db, "absensi"), data);
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Dapatkan absensi hari ini
async function getAbsensiToday() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const q = query(
      collection(db, "absensi"),
      where("tanggal", "==", today),
      orderBy("timestamp", "desc"),
      limit(1)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return { success: true, data: doc.data().records };
    }
    return { success: true, data: {} };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================================
// EKSPORT
// ============================================================

export {
  // Firestore instance
  db,
  
  // Mading
  sendMading,
  getMading,
  listenMading,
  deleteMading,
  
  // Kas
  sendKas,
  getKas,
  listenKas,
  deleteKas,
  
  // Notifikasi
  sendNotification,
  listenNotifications,
  
  // Absensi
  saveAbsensi,
  getAbsensiToday,
  
  // Utils
  serverTimestamp,
  collection,
  doc,
  addDoc,
  deleteDoc,
  updateDoc,
  getDoc,
  getDocs,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  where,
  arrayUnion,
  arrayRemove
};
