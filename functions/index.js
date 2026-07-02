// ============================================================
// CLOUD FUNCTIONS - ADHIGANA PRAPTI
// Mengirim Web Push Notification (FCM) yang SUNGGUHAN,
// sampai ke HP/browser walau tab/app sudah ditutup.
// ============================================================
//
// Cara kerja:
// 1. Client (Login.html) menulis dokumen baru ke koleksi
//    "push_notifications" berisi { title, body, type, tokens }
// 2. Function ini otomatis terpicu (onCreate) setiap ada
//    dokumen baru di koleksi tsb.
// 3. Function mengirim pesan ke semua token via Firebase
//    Cloud Messaging (Admin SDK) -> ini yang membuat notifikasi
//    benar-benar muncul di notif bar HP + bunyi, walau app closed.
// 4. Token yang sudah tidak valid (uninstall/logout) otomatis
//    dihapus dari koleksi "fcm_tokens" agar daftar tetap bersih.
// ============================================================

const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getMessaging } = require("firebase-admin/messaging");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

initializeApp();
const db = getFirestore();

exports.sendPushNotification = onDocumentCreated(
  { document: "push_notifications/{pushId}", region: "us-central1" },
  async (event) => {
    const snap = event.data;
    if (!snap) return;
    const data = snap.data();

    const title = data.title || "ADHIGANA PRAPTI";
    const body = data.body || "Ada notifikasi baru!";
    const type = data.type || "info";
    const tokens = Array.isArray(data.tokens) ? data.tokens : [];

    if (tokens.length === 0) {
      console.log("Tidak ada token, lewati.");
      return;
    }

    // Data-only payload (bukan "notification") supaya konsisten
    // ditangani sendiri oleh service-worker.js / onMessage di
    // client, lengkap dengan suara & ikon custom.
    const message = {
      data: {
        title,
        body,
        type,
        url: "/",
      },
      webpush: {
        headers: { Urgency: "high" },
        fcmOptions: { link: "/" },
      },
      tokens,
    };

    const response = await getMessaging().sendEachForMulticast(message);
    console.log(
      `Push terkirim: ${response.successCount} sukses, ${response.failureCount} gagal`
    );

    // Bersihkan token yang sudah tidak valid (unregistered / expired)
    const invalidTokens = [];
    response.responses.forEach((res, idx) => {
      if (!res.success) {
        const code = res.error && res.error.code;
        if (
          code === "messaging/invalid-registration-token" ||
          code === "messaging/registration-token-not-registered"
        ) {
          invalidTokens.push(tokens[idx]);
        }
      }
    });

    if (invalidTokens.length > 0) {
      const batch = db.batch();
      invalidTokens.forEach((t) => batch.delete(db.collection("fcm_tokens").doc(t)));
      await batch.commit();
      console.log(`Menghapus ${invalidTokens.length} token tidak valid.`);
    }

    // Tandai dokumen sudah diproses (opsional, buat histori/debug)
    await snap.ref.update({
      processed: true,
      processedAt: FieldValue.serverTimestamp(),
      successCount: response.successCount,
      failureCount: response.failureCount,
    });
  }
);
