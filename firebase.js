// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs,
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
  where,
  arrayUnion,
  arrayRemove
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { 
  getMessaging, 
  getToken, 
  onMessage 
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-messaging.js";

// ============================================================
// KONFIGURASI FIREBASE - GANTI DENGAN DATA KAMU
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
const auth = getAuth(app);
const db = getFirestore(app);
const messaging = getMessaging(app);

// VAPID KEY untuk notifikasi push
const VAPID_KEY = "BFs1kccEgDcaL9RHZwrVH2ltSgNLZusqQmep5NfX-29PKt_0EiQ5_WDHnCv4Er6ZCmSLagAH9QdPFmpSHqEYHbgY";

// ============================================================
// AUTHENTICATION FUNCTIONS
// ============================================================

// Login dengan email dan password
async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message, code: error.code };
  }
}

// Logout
async function logoutUser() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Dapatkan data user dari Firestore
async function getUserData(uid) {
  try {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    } else {
      return { success: false, error: "User not found" };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Simpan user ke Firestore
async function saveUserData(uid, data) {
  try {
    await setDoc(doc(db, "users", uid), data, { merge: true });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================================
// NOTIFICATION FUNCTIONS
// ============================================================

// Setup push notification
async function setupPushNotification() {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("Notifikasi tidak diizinkan");
      return null;
    }

    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    if (token) {
      console.log("FCM Token:", token);
      localStorage.setItem("fcm_token", token);
      
      // Simpan token ke Firestore
      const uid = localStorage.getItem("userUid");
      if (uid) {
        await setDoc(doc(db, "users", uid, "fcm", token), {
          token: token,
          device: navigator.userAgent,
          timestamp: serverTimestamp(),
          active: true
        });
      }
      return token;
    }
    return null;
  } catch (error) {
    console.error("Error setup push:", error);
    return null;
  }
}

// Listener untuk notifikasi foreground
function listenForegroundMessages() {
  onMessage(messaging, (payload) => {
    console.log("Message received:", payload);
    
    if (payload.notification) {
      new Notification(payload.notification.title, {
        body: payload.notification.body,
        icon: "/asset/Adhigana prapti.png",
        badge: "/asset/Adhigana prapti.png"
      });
    }
  });
}

// ============================================================
// FIRESTORE FUNCTIONS - NOTIFICATIONS
// ============================================================

// Kirim notifikasi ke Firestore
async function sendNotification(title, body, type = "info", data = {}) {
  try {
    const notifData = {
      title: title,
      body: body,
      type: type,
      data: data,
      timestamp: serverTimestamp(),
      read: false,
      pushTo: "all"
    };
    
    const docRef = await addDoc(collection(db, "notifications"), notifData);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error sending notification:", error);
    return { success: false, error: error.message };
  }
}

// Dengarkan notifikasi real-time
function listenNotifications(uid, callback) {
  try {
    const q = query(
      collection(db, "notifications"),
      orderBy("timestamp", "desc"),
      limit(20)
    );
    
    return onSnapshot(q, (snapshot) => {
      const notifs = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        notifs.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate?.() || new Date()
        });
      });
      callback(notifs);
    });
  } catch (error) {
    console.error("Error listening notifications:", error);
    return null;
  }
}

// Tandai notifikasi sebagai dibaca
async function markNotificationRead(notifId) {
  try {
    await updateDoc(doc(db, "notifications", notifId), {
      read: true
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================================
// FIRESTORE FUNCTIONS - ORDERS
// ============================================================

// Kirim order ke Firestore
async function sendOrder(orderData) {
  try {
    const order = {
      ...orderData,
      status: "pending",
      timestamp: serverTimestamp()
    };
    const docRef = await addDoc(collection(db, "orders"), order);
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Dengarkan orders real-time
function listenOrders(callback) {
  try {
    const q = query(
      collection(db, "orders"),
      orderBy("timestamp", "desc"),
      limit(20)
    );
    
    return onSnapshot(q, (snapshot) => {
      const orders = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        orders.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate?.() || new Date()
        });
      });
      callback(orders);
    });
  } catch (error) {
    console.error("Error listening orders:", error);
    return null;
  }
}

// Update status order
async function updateOrderStatus(orderId, status) {
  try {
    await updateDoc(doc(db, "orders", orderId), {
      status: status,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================================
// FIRESTORE FUNCTIONS - MADING
// ============================================================

// Kirim mading ke Firestore
async function sendMading(judul, isi) {
  try {
    const madingData = {
      judul: judul,
      isi: isi,
      tanggal: serverTimestamp()
    };
    const docRef = await addDoc(collection(db, "mading"), madingData);
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Dapatkan semua mading
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

// Dengarkan mading real-time
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
    console.error("Error listening mading:", error);
    return null;
  }
}

// Hapus mading
async function deleteMading(madingId) {
  try {
    await deleteDoc(doc(db, "mading", madingId));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================================
// FIRESTORE FUNCTIONS - KAS
// ============================================================

// Tambah transaksi kas
async function addKasTransaction(jenis, nominal, keterangan) {
  try {
    const data = {
      jenis: jenis,
      nominal: nominal,
      keterangan: keterangan,
      tanggal: serverTimestamp()
    };
    const docRef = await addDoc(collection(db, "kas"), data);
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Dapatkan semua transaksi kas
async function getKasTransactions() {
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

// Dengarkan kas real-time
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
    console.error("Error listening kas:", error);
    return null;
  }
}

// Hapus transaksi kas
async function deleteKasTransaction(kasId) {
  try {
    await deleteDoc(doc(db, "kas", kasId));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================================
// FIRESTORE FUNCTIONS - ABSENSI
// ============================================================

// Simpan absensi
async function saveAbsensi(records) {
  try {
    // Simpan ke collection absensi dengan timestamp
    const data = {
      records: records,
      tanggal: new Date().toISOString().split('T')[0], // YYYY-MM-DD
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
// AUTH STATE LISTENER
// ============================================================

function onAuthChange(callback) {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const result = await getUserData(user.uid);
      if (result.success) {
        callback({
          isLoggedIn: true,
          uid: user.uid,
          email: user.email,
          ...result.data
        });
      } else {
        callback({
          isLoggedIn: true,
          uid: user.uid,
          email: user.email
        });
      }
    } else {
      callback({ isLoggedIn: false });
    }
  });
}

// ============================================================
// EXPORT
// ============================================================

export {
  // Auth
  auth,
  loginUser,
  logoutUser,
  getUserData,
  saveUserData,
  onAuthChange,
  
  // Firestore
  db,
  
  // Notifications
  messaging,
  VAPID_KEY,
  setupPushNotification,
  listenForegroundMessages,
  sendNotification,
  listenNotifications,
  markNotificationRead,
  
  // Orders
  sendOrder,
  listenOrders,
  updateOrderStatus,
  
  // Mading
  sendMading,
  getMading,
  listenMading,
  deleteMading,
  
  // Kas
  addKasTransaction,
  getKasTransactions,
  listenKas,
  deleteKasTransaction,
  
  // Absensi
  saveAbsensi,
  getAbsensiToday,
  
  // Utils
  serverTimestamp,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  where,
  arrayUnion,
  arrayRemove
};
