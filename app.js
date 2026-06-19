// ============================================================
// APP.JS - ADHIGANA PRAPTI
// Firebase SDK v9 Compat Mode
// ============================================================

// ──────────────────────────────────────────────────────────────
// FIREBASE CONFIG
// ──────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyATh7MiV8xr4vHgF3AjqMhXc87LhCRF7N0",
  authDomain: "adhiganaprapti-e8f13.firebaseapp.com",
  projectId: "adhiganaprapti-e8f13",
  storageBucket: "adhiganaprapti-e8f13.firebasestorage.app",
  messagingSenderId: "1011133018564",
  appId: "1:1011133018564:web:57e9537b39c85a44593491",
  measurementId: "G-DP6L1NQXR4"
};

// ──────────────────────────────────────────────────────────────
// FIREBASE INIT
// ──────────────────────────────────────────────────────────────
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
const messaging = firebase.messaging.isSupported() ? firebase.messaging() : null;

console.log("🔥 Firebase Connected - Adhigana Prapti");

// ──────────────────────────────────────────────────────────────
// DOM ELEMENTS
// ──────────────────────────────────────────────────────────────
const DOM = {
  // Navbar
  navUserInfo: document.getElementById('navUserInfo'),
  navAvatar: document.getElementById('navAvatar'),
  navUserName: document.getElementById('navUserName'),
  btnNavLogin: document.getElementById('btnNavLogin'),
  btnNavLogout: document.getElementById('btnNavLogout'),
  mobileBtnLogin: document.getElementById('mobileBtnLogin'),
  mobileBtnLogout: document.getElementById('mobileBtnLogout'),
  
  // Notifikasi Bell
  notifBell: document.getElementById('notifBell'),
  mobNotifBell: document.getElementById('mobNotifBell'),
  notifBadge: document.getElementById('notifBadge'),
  mobNotifBadge: document.getElementById('mobNotifBadge'),
  notifDropdown: document.getElementById('notifDropdown'),
  notifList: document.getElementById('notifList'),
  clearNotifBtn: document.getElementById('clearNotifBtn'),
  
  // Toast
  toastContainer: document.getElementById('toastContainer'),
  
  // Login
  loginOverlay: document.getElementById('loginOverlay'),
  loginEmail: document.getElementById('loginEmail'),
  loginPassword: document.getElementById('loginPassword'),
  loginSubmit: document.getElementById('loginSubmit'),
  loginError: document.getElementById('loginError'),
  loginErrorText: document.getElementById('loginErrorText'),
  btnModalClose: document.getElementById('btnModalClose'),
  heroBtnLogin: document.getElementById('heroBtnLogin'),
  forgotLink: document.getElementById('forgotLink'),
  
  // Dashboard
  portalDashboard: document.getElementById('portalDashboard'),
  dashUserInfo: document.getElementById('dashUserInfo'),
  dashRoleBadge: document.getElementById('dashRoleBadge'),
  notifStatus: document.getElementById('notifStatus'),
  btnEnablePush: document.getElementById('btnEnablePush'),
  btnTestNotif: document.getElementById('btnTestNotif'),
  
  // Mading Publik
  madingPubGrid: document.getElementById('madingPubGrid'),
  
  // Mading Admin
  madingJudul: document.getElementById('madingJudul'),
  madingIsi: document.getElementById('madingIsi'),
  btnPublishMading: document.getElementById('btnPublishMading'),
  madingList: document.getElementById('madingList'),
  
  // Kas
  kasJenis: document.getElementById('kasJenis'),
  kasNominal: document.getElementById('kasNominal'),
  kasKeterangan: document.getElementById('kasKeterangan'),
  btnTambahKas: document.getElementById('btnTambahKas'),
  kasRiwayat: document.getElementById('kasRiwayat'),
  kasSaldoInfo: document.getElementById('kasSaldoInfo'),
  
  // Absensi
  absSearch: document.getElementById('absSearch'),
  absensiList: document.getElementById('absensiList'),
  btnHadirSemua: document.getElementById('btnHadirSemua'),
  btnResetAbsensi: document.getElementById('btnResetAbsensi'),
  btnSimpanAbsensi: document.getElementById('btnSimpanAbsensi'),
  absensiRiwayat: document.getElementById('absensiRiwayat'),
  
  // Ringkasan
  rHadir: document.getElementById('rHadir'),
  rTotal: document.getElementById('rTotal'),
  rPengumuman: document.getElementById('rPengumuman'),
  rSaldo: document.getElementById('rSaldo'),
  ringkasAbsensi: document.getElementById('ringkasAbsensi'),
  
  // PWA
  pwaBanner: document.getElementById('pwaBanner'),
  pwaBtnInstall: document.getElementById('pwaBtnInstall'),
  pwaBtnDismiss: document.getElementById('pwaBtnDismiss'),
  
  // Sync
  syncDot: document.getElementById('syncDot'),
  syncText: document.getElementById('syncText'),
  
  // Hero & Sections
  hero: document.getElementById('hero'),
  madingPublik: document.getElementById('madingPublik'),
  
  // Hamburger
  hamburger: document.getElementById('hamburger'),
  mobileMenu: document.getElementById('mobileMenu'),
  
  // Tabs
  tabBar: document.getElementById('tabBar'),
  tabPanes: document.querySelectorAll('.tab-pane'),
  tabBtns: document.querySelectorAll('.tab-btn'),
  adminOnlyTabs: document.querySelectorAll('.tab-btn.admin-only')
};

// ──────────────────────────────────────────────────────────────
// STATE
// ──────────────────────────────────────────────────────────────
let currentUser = null;
let currentRole = 'anggota';
let unreadCount = 0;
let isFirstLoad = true;
let knownNotifIds = new Set();
let unsubMading = null;
let unsubKas = null;
let unsubAbsensi = null;
let unsubNotif = null;
let absDraft = {};

// ──────────────────────────────────────────────────────────────
// DATA ANGGOTA (54 orang)
// ──────────────────────────────────────────────────────────────
const ALL_ANGGOTA = [
  {uid:'u001', nama:'M. Daffa Saeful Faiz', jabatan:'Ketua Umum'},
  {uid:'u002', nama:'Yasna Nur Azka Zakiyah', jabatan:'Sekretaris Umum'},
  {uid:'u003', nama:'Putri Nur Apriani', jabatan:'Bendahara Umum'},
  {uid:'u004', nama:'Rafi Keny Akhdan', jabatan:'Ketua Pelaksana'},
  {uid:'u005', nama:'Kaysa Hasnah Mumtaaza', jabatan:'Sekretaris Pelaksana'},
  {uid:'u006', nama:'Naya Salsabila', jabatan:'Bendahara Pelaksana'},
  {uid:'u007', nama:'Rayhan Nur Pajri', jabatan:'Koord. Div. Lapangan'},
  {uid:'u008', nama:'M. Haikal Abil Fida', jabatan:'Div. Koordinasi Lapangan'},
  {uid:'u009', nama:'Ardiansyah Pramadani', jabatan:'Div. Koordinasi Lapangan'},
  {uid:'u010', nama:'Fahmi Maulana', jabatan:'Div. Koordinasi Lapangan'},
  {uid:'u011', nama:'Daffa Yusuf Afandy', jabatan:'Div. Koordinasi Lapangan'},
  {uid:'u012', nama:'M. Faiq Ahsan', jabatan:'Koord. Div. Acara'},
  {uid:'u013', nama:'M. Zidan Ziyadul Haq', jabatan:'Div. Acara'},
  {uid:'u014', nama:'Arfan Najmi', jabatan:'Div. Acara'},
  {uid:'u015', nama:'M. Badrul Zaman', jabatan:'Div. Acara'},
  {uid:'u016', nama:'Mutia Zahran', jabatan:'Div. Acara'},
  {uid:'u017', nama:'Raifa Putri Ramadhani', jabatan:'Div. Acara'},
  {uid:'u018', nama:'Panji Jatmika', jabatan:'Koord. Div. Pubdok'},
  {uid:'u019', nama:'Fachri Akbar', jabatan:'Div. Publikasi & Dokumentasi'},
  {uid:'u020', nama:'Muhamad Darul Tahqiq', jabatan:'Div. Publikasi & Dokumentasi'},
  {uid:'u021', nama:'Rhicelle Apriliana', jabatan:'Div. Publikasi & Dokumentasi'},
  {uid:'u022', nama:'Riska Maulida Fitri', jabatan:'Div. Publikasi & Dokumentasi'},
  {uid:'u023', nama:'Agisna Maulida Noer', jabatan:'Div. Publikasi & Dokumentasi'},
  {uid:'u024', nama:'Anggita Nurfadillah', jabatan:'Div. Publikasi & Dokumentasi'},
  {uid:'u025', nama:'M. Alfin Saputra', jabatan:'Koord. Div. Humas'},
  {uid:'u026', nama:'M. Huda Kasya Islami', jabatan:'Div. Hubungan Masyarakat'},
  {uid:'u027', nama:'M. Irham Ghifarul Khilmi', jabatan:'Div. Hubungan Masyarakat'},
  {uid:'u028', nama:'Almas Dara Saputri Wiwaha', jabatan:'Div. Hubungan Masyarakat'},
  {uid:'u029', nama:'Zulfa Hamidah', jabatan:'Div. Hubungan Masyarakat'},
  {uid:'u030', nama:'Windi Meliana', jabatan:'Div. Hubungan Masyarakat'},
  {uid:'u031', nama:'Arum Rohimah', jabatan:'Div. Hubungan Masyarakat'},
  {uid:'u032', nama:'Alvyra Mutiara Andira', jabatan:'Div. Hubungan Masyarakat'},
  {uid:'u033', nama:'Zahran Saputra Wiwaha', jabatan:'Koord. Div. Konsumsi'},
  {uid:'u034', nama:'Gema Darma Wijana', jabatan:'Div. Konsumsi'},
  {uid:'u035', nama:'Raihan Muzhafar Yusuf', jabatan:'Div. Konsumsi'},
  {uid:'u036', nama:'Ari Pratama Putra', jabatan:'Div. Konsumsi'},
  {uid:'u037', nama:'Aurel Pricila Ananta', jabatan:'Div. Konsumsi'},
  {uid:'u038', nama:'Vina Siti Aminah', jabatan:'Div. Konsumsi'},
  {uid:'u039', nama:'April Amelia Putri', jabatan:'Div. Konsumsi'},
  {uid:'u040', nama:'Dinda Aulia', jabatan:'Div. Konsumsi'},
  {uid:'u041', nama:'Agnia Ilma Triana Putri Hidayat', jabatan:'Div. Konsumsi'},
  {uid:'u042', nama:'M. Abdul Azis', jabatan:'Koord. Div. Dekorasi & Logistik'},
  {uid:'u043', nama:'Romi Zayyinul Aripin', jabatan:'Div. Dekorasi & Logistik'},
  {uid:'u044', nama:'Rojab Mulyana', jabatan:'Div. Dekorasi & Logistik'},
  {uid:'u045', nama:'Irfan Naufal Amrulloh', jabatan:'Div. Dekorasi & Logistik'},
  {uid:'u046', nama:'Fadlan Nurullah', jabatan:'Div. Dekorasi & Logistik'},
  {uid:'u047', nama:'Arya Maulana', jabatan:'Div. Dekorasi & Logistik'},
  {uid:'u048', nama:'Danil Mauluda', jabatan:'Div. Dekorasi & Logistik'},
  {uid:'u049', nama:'Fabin Alfarizi Rizal Riyansah', jabatan:'Div. Dekorasi & Logistik'},
  {uid:'u050', nama:'Rai Nepal Ibrahim', jabatan:'Div. Dekorasi & Logistik'},
  {uid:'u051', nama:'Robby Muharram', jabatan:'Div. Dekorasi & Logistik'},
  {uid:'u052', nama:'Rama Pratama Adila', jabatan:'Koord. Div. Kebersihan'},
  {uid:'u053', nama:'Arfik Ramdhani', jabatan:'Div. Kebersihan'},
  {uid:'u054', nama:'M. Fariz Saeful Ammar', jabatan:'Div. Kebersihan'},
];

// ──────────────────────────────────────────────────────────────
// UTILS
// ──────────────────────────────────────────────────────────────
const esc = s => String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const fmtRp = n => 'Rp ' + (Number(n)||0).toLocaleString('id-ID');
const fmtDate = ts => {
  if (!ts) return '-';
  const d = ts instanceof Date ? ts : (ts.toDate ? ts.toDate() : new Date(ts));
  return d.toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'});
};
const fmtDT = ts => {
  if (!ts) return '-';
  const d = ts instanceof Date ? ts : (ts.toDate ? ts.toDate() : new Date(ts));
  return d.toLocaleString('id-ID', {day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit'});
};
const fmtTime = () => new Date().toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'});

// ──────────────────────────────────────────────────────────────
// SUARA NOTIFIKASI
// ──────────────────────────────────────────────────────────────
function playSound(type = 'default') {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const patterns = {
      kas: [{f:880,d:.08,t:0},{f:1100,d:.08,t:.1},{f:1320,d:.15,t:.2}],
      mading: [{f:660,d:.1,t:0},{f:880,d:.1,t:.12},{f:1100,d:.15,t:.24}],
      absensi: [{f:760,d:.1,t:0},{f:960,d:.1,t:.13},{f:760,d:.1,t:.26}],
      default: [{f:760,d:.1,t:0},{f:960,d:.12,t:.13}]
    };
    const notes = patterns[type] || patterns.default;
    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.38;
    masterGain.connect(ctx.destination);
    notes.forEach(({f,d,t}) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(masterGain);
      osc.frequency.value = f;
      osc.type = (type==='kas'||type==='mading') ? 'square' : 'sine';
      const start = ctx.currentTime + t;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.3, start + .01);
      gain.gain.exponentialRampToValueAtTime(0.001, start + d);
      osc.start(start); osc.stop(start + d + .05);
    });
  } catch(e) {
    if (navigator.vibrate) navigator.vibrate([150,50,150]);
  }
}

// ──────────────────────────────────────────────────────────────
// TOAST SYSTEM
// ──────────────────────────────────────────────────────────────
function showToast({type='info', title='', desc='', amount='', amountColor=''}) {
  const iconMap = {
    kas:    {icon:'fa-coins', cls:'kas'},
    mading: {icon:'fa-newspaper', cls:'mading'},
    absensi:{icon:'fa-clipboard-check', cls:'absensi'},
    info:   {icon:'fa-circle-info', cls:'info'}
  };
  const t = iconMap[type] || iconMap.info;
  const id = 'toast_' + Date.now();
  
  const el = document.createElement('div');
  el.className = 'toast';
  el.id = id;
  el.innerHTML = `
    <div class="toast-accent ${t.cls}"></div>
    <button class="toast-close" onclick="this.closest('.toast').remove()"><i class="fa-solid fa-xmark"></i></button>
    <div class="toast-body">
      <div class="toast-icon ${t.cls}"><i class="fa-solid ${t.icon}"></i></div>
      <div class="toast-text">
        <div class="toast-label">${type.toUpperCase()}</div>
        <div class="toast-title">${esc(title)}</div>
        ${desc ? `<div class="toast-desc">${esc(desc)}</div>` : ''}
        ${amount ? `<div class="toast-val ${amountColor}">${esc(amount)}</div>` : ''}
        <div class="toast-time">${fmtTime()}</div>
      </div>
    </div>
    <div class="toast-progress"><div class="toast-progress-bar ${t.cls}" style="width:100%;transition:width 5s linear" id="bar_${id}"></div></div>
  `;
  DOM.toastContainer.appendChild(el);
  
  requestAnimationFrame(() => {
    const bar = document.getElementById('bar_'+id);
    if (bar) bar.style.width = '0%';
  });
  
  setTimeout(() => {
    const toast = document.getElementById(id);
    if (toast) toast.remove();
  }, 5200);
}

// ──────────────────────────────────────────────────────────────
// BROWSER NOTIFICATION
// ──────────────────────────────────────────────────────────────
function showBrowserNotif(title, body, type='info') {
  if (Notification.permission !== 'granted') return;
  try {
    const vibrate = type==='kas' ? [200,100,200,100,200] : [200,100,200];
    const opts = {
      body,
      icon: '/asset/Adhigana prapti.png',
      badge: '/asset/Adhigana prapti.png',
      vibrate,
      requireInteraction: true,
      tag: 'adhigana-' + type + '-' + Date.now(),
      data: { url: '/' }
    };
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(r => r.showNotification(title, opts));
    } else {
      const n = new Notification(title, opts);
      n.onclick = () => { window.focus(); n.close(); };
    }
  } catch(e) { console.warn('Notif error:', e); }
}

// ──────────────────────────────────────────────────────────────
// NOTIFIKASI DROPDOWN
// ──────────────────────────────────────────────────────────────
function addToDropdown(notif) {
  const saved = JSON.parse(localStorage.getItem('ap_notifs_v3') || '[]');
  if (!saved.some(n => n.id === notif.id)) {
    saved.unshift(notif);
    if (saved.length > 50) saved.pop();
    localStorage.setItem('ap_notifs_v3', JSON.stringify(saved));
  }
  renderDropdown();
}

function renderDropdown() {
  if (!DOM.notifList) return;
  const saved = JSON.parse(localStorage.getItem('ap_notifs_v3') || '[]');
  if (!saved.length) {
    DOM.notifList.innerHTML = '<div class="notif-empty"><i class="fa-regular fa-bell-slash"></i>Belum ada notifikasi</div>';
    return;
  }
  const ICON = {kas:'fa-coins', mading:'fa-newspaper', absensi:'fa-clipboard-check', info:'fa-circle-info'};
  const LABEL = {kas:'Kas', mading:'Mading', absensi:'Absensi', info:'Info'};
  DOM.notifList.innerHTML = saved.slice(0,30).map(n => {
    const ic = ICON[n.type] || 'fa-bell';
    const time = n.timestamp ? new Date(n.timestamp).toLocaleString('id-ID', {hour:'2-digit', minute:'2-digit', day:'numeric', month:'short'}) : '';
    return `
      <div class="notif-item unread-${n.type}">
        <div class="notif-icon-wrap ${n.type}"><i class="fa-solid ${ic}"></i></div>
        <div class="notif-content">
          <div><span class="notif-type-tag ${n.type}">${LABEL[n.type]||'Info'}</span></div>
          <div class="notif-title-text">${esc(n.title)}</div>
          <div class="notif-body-text">${esc(n.body)}</div>
          <div class="notif-time">${time}</div>
        </div>
      </div>
    `;
  }).join('');
}

function updateBadge() {
  const count = unreadCount > 99 ? '99+' : String(unreadCount);
  [DOM.notifBadge, DOM.mobNotifBadge].forEach(el => {
    if (!el) return;
    el.textContent = count;
    el.classList.toggle('show', unreadCount > 0);
    if (unreadCount > 0) {
      el.classList.remove('pulse');
      void el.offsetWidth;
      el.classList.add('pulse');
    }
  });
}

// ──────────────────────────────────────────────────────────────
// SYNC STATUS
// ──────────────────────────────────────────────────────────────
function setSyncStatus(status) {
  if (!DOM.syncDot || !DOM.syncText) return;
  if (status === 'ok') {
    DOM.syncDot.className = 'sync-dot';
    DOM.syncText.textContent = 'Terhubung real-time';
    DOM.syncText.style.color = 'var(--c-green)';
  } else if (status === 'loading') {
    DOM.syncDot.className = 'sync-dot loading';
    DOM.syncText.textContent = 'Menghubungkan...';
    DOM.syncText.style.color = 'var(--c-amber)';
  } else {
    DOM.syncDot.className = 'sync-dot offline';
    DOM.syncText.textContent = 'Offline';
    DOM.syncText.style.color = 'var(--c-red)';
  }
}

// ──────────────────────────────────────────────────────────────
// 🔥 REALTIME LISTENERS
// ──────────────────────────────────────────────────────────────

function startListeners() {
  setSyncStatus('loading');
  
  // ── MADING LISTENER ──────────────────────────────────────
  const qMading = db.collection('mading').orderBy('tanggal', 'desc').limit(30);
  unsubMading = qMading.onSnapshot(snap => {
    setSyncStatus('ok');
    const items = [];
    snap.forEach(d => items.push({id: d.id, ...d.data()}));
    
    renderMadingList(items);
    renderMadingPub(items);
    if (DOM.rPengumuman) DOM.rPengumuman.textContent = items.length;
    
    snap.docChanges().forEach(ch => {
      if (ch.type === 'added') {
        if (isFirstLoad) { knownNotifIds.add(ch.doc.id); return; }
        if (knownNotifIds.has(ch.doc.id)) return;
        knownNotifIds.add(ch.doc.id);
        const d = ch.doc.data();
        const judul = d.judul || 'Pengumuman Baru';
        const isi = d.isi || '';
        playSound('mading');
        showToast({type:'mading', title:`📰 ${judul}`, desc: isi.slice(0,80)+(isi.length>80?'...':'')});
        showBrowserNotif(`📰 ${judul}`, isi.slice(0,100), 'mading');
        unreadCount++;
        updateBadge();
        addToDropdown({id:ch.doc.id, type:'mading', title:`📰 ${judul}`, body:isi.slice(0,100), timestamp:new Date().toISOString()});
      }
    });
    isFirstLoad = false;
  }, err => { console.error('❌ Mading listener:', err); setSyncStatus('offline'); });
  
  // ── KAS LISTENER ──────────────────────────────────────────
  const qKas = db.collection('kas').orderBy('tanggal', 'desc').limit(50);
  unsubKas = qKas.onSnapshot(snap => {
    const items = [];
    snap.forEach(d => items.push({id: d.id, ...d.data()}));
    renderKasList(items);
    
    snap.docChanges().forEach(ch => {
      if (ch.type === 'added') {
        if (knownNotifIds.has(ch.doc.id)) return;
        if (isFirstLoad) { knownNotifIds.add(ch.doc.id); return; }
        knownNotifIds.add(ch.doc.id);
        const d = ch.doc.data();
        const jenis = d.jenis || 'masuk';
        const nominal = d.nominal || 0;
        const ket = d.keterangan || 'Transaksi kas';
        const masuk = jenis === 'masuk';
        const title = masuk ? '💰 Kas Masuk!' : '💸 Kas Keluar';
        const amount = (masuk ? '+' : '-') + fmtRp(nominal);
        playSound('kas');
        showToast({type:'kas', title, desc:ket, amount, amountColor: masuk ? 'green' : 'red'});
        showBrowserNotif(title, `${ket} — ${amount}`, 'kas');
        unreadCount++;
        updateBadge();
        addToDropdown({id:ch.doc.id, type:'kas', title, body:`${ket} — ${amount}`, timestamp:new Date().toISOString()});
      }
    });
  }, err => console.error('❌ Kas listener:', err));
  
  // ── ABSENSI LISTENER ──────────────────────────────────────
  const qAbs = db.collection('absensi').orderBy('timestamp', 'desc').limit(10);
  unsubAbsensi = qAbs.onSnapshot(snap => {
    const all = [];
    snap.forEach(d => all.push({id: d.id, ...d.data()}));
    renderAbsensiRiwayat(all);
    
    const today = new Date().toISOString().split('T')[0];
    const todayDoc = all.find(r => r.tanggal === today);
    if (todayDoc && todayDoc.records) {
      const vals = Object.values(todayDoc.records);
      const h = vals.filter(v=>v==='hadir').length;
      const i = vals.filter(v=>v==='izin').length;
      const a = vals.filter(v=>v==='alfa').length;
      if (DOM.rHadir) DOM.rHadir.textContent = h;
      if (DOM.ringkasAbsensi) {
        DOM.ringkasAbsensi.innerHTML = `
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">
            <div style="padding:12px;border-radius:12px;background:rgba(110,231,247,.06);text-align:center;">
              <div style="font-size:22px;font-weight:800;color:var(--c-cyan);">${h}</div>
              <div style="font-size:11px;color:var(--c-muted);">Hadir</div>
            </div>
            <div style="padding:12px;border-radius:12px;background:rgba(255,179,64,.06);text-align:center;">
              <div style="font-size:22px;font-weight:800;color:var(--c-amber);">${i}</div>
              <div style="font-size:11px;color:var(--c-muted);">Izin</div>
            </div>
            <div style="padding:12px;border-radius:12px;background:rgba(255,95,95,.06);text-align:center;">
              <div style="font-size:22px;font-weight:800;color:var(--c-red);">${a}</div>
              <div style="font-size:11px;color:var(--c-muted);">Alfa</div>
            </div>
          </div>
          <p style="font-size:11px;color:var(--c-muted);margin-top:8px;">Data hari ini (${today})</p>
        `;
      }
    } else {
      if (DOM.rHadir) DOM.rHadir.textContent = '—';
      if (DOM.ringkasAbsensi) DOM.ringkasAbsensi.innerHTML = '<p style="font-size:13px;color:var(--c-muted);">Belum ada absensi hari ini.</p>';
    }
    
    snap.docChanges().forEach(ch => {
      if (ch.type === 'added' && !isFirstLoad && !knownNotifIds.has(ch.doc.id)) {
        knownNotifIds.add(ch.doc.id);
        const d = ch.doc.data();
        const vals = Object.values(d.records||{});
        const h = vals.filter(v=>v==='hadir').length;
        const title = `📋 Absensi ${d.tanggal||''}`;
        const body = `Hadir: ${h} dari ${ALL_ANGGOTA.length} anggota`;
        playSound('absensi');
        showToast({type:'absensi', title, desc: body});
        showBrowserNotif(title, body, 'absensi');
        unreadCount++;
        updateBadge();
        addToDropdown({id:ch.doc.id, type:'absensi', title, body, timestamp:new Date().toISOString()});
      }
    });
  }, err => console.error('❌ Absensi listener:', err));
}

function stopListeners() {
  if (unsubMading) { unsubMading(); unsubMading = null; }
  if (unsubKas) { unsubKas(); unsubKas = null; }
  if (unsubAbsensi) { unsubAbsensi(); unsubAbsensi = null; }
}

// ──────────────────────────────────────────────────────────────
// RENDER FUNCTIONS
// ──────────────────────────────────────────────────────────────

function renderMadingPub(items) {
  if (!DOM.madingPubGrid) return;
  if (!items || !items.length) {
    DOM.madingPubGrid.innerHTML = '<div class="empty-state"><i class="fa-solid fa-newspaper"></i>Belum ada pengumuman.</div>';
    return;
  }
  DOM.madingPubGrid.innerHTML = '';
  items.forEach(it => {
    const card = document.createElement('div');
    card.className = 'mading-card';
    card.innerHTML = `
      <h3>${esc(it.judul||'')}</h3>
      <div class="mdate"><i class="fa-regular fa-calendar"></i> ${fmtDate(it.tanggal)}</div>
      <p>${esc(it.isi||'')}</p>
    `;
    DOM.madingPubGrid.appendChild(card);
  });
}

function renderMadingList(items) {
  if (!DOM.madingList) return;
  if (!items || !items.length) {
    DOM.madingList.innerHTML = '<div style="color:var(--c-muted);font-size:13px;">Belum ada pengumuman.</div>';
    return;
  }
  DOM.madingList.innerHTML = '';
  items.forEach(it => {
    const d = document.createElement('div');
    d.style.cssText = 'padding:14px 16px;border:1px solid var(--c-border);border-radius:16px;background:rgba(255,255,255,.02);';
    d.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;">
        <div style="flex:1;min-width:0;">
          <div style="color:var(--c-cyan);font-weight:700;font-size:14px;margin-bottom:4px;">${esc(it.judul||'')}</div>
          <div style="color:var(--c-muted);font-size:11px;margin-bottom:8px;">${fmtDate(it.tanggal)}</div>
          <div style="color:rgba(238,242,255,.82);font-size:13px;white-space:pre-wrap;line-height:1.7;">${esc(it.isi||'')}</div>
        </div>
        ${(currentRole==='admin'||currentRole==='pengurus') ? `<button data-id="${it.id}" class="btn btn-danger btn-sm mading-del"><i class="fa-solid fa-trash"></i> Hapus</button>` : ''}
      </div>
    `;
    const delBtn = d.querySelector('.mading-del');
    if (delBtn) {
      delBtn.addEventListener('click', async () => {
        if (!confirm('Hapus pengumuman ini?')) return;
        await db.collection('mading').doc(it.id).delete();
      });
    }
    DOM.madingList.appendChild(d);
  });
}

function renderKasList(items) {
  if (!DOM.kasRiwayat) return;
  const saldo = items.reduce((a,it) => {
    const n = Number(it.nominal)||0;
    return it.jenis==='masuk' ? a+n : a-n;
  }, 0);
  if (DOM.kasSaldoInfo) {
    DOM.kasSaldoInfo.innerHTML = `Saldo: <strong style="color:${saldo>=0?'var(--c-cyan)':'var(--c-red)'}">${fmtRp(saldo)}</strong>`;
  }
  if (DOM.rSaldo) DOM.rSaldo.textContent = fmtRp(saldo);
  
  if (!items || !items.length) {
    DOM.kasRiwayat.innerHTML = '<div style="color:var(--c-muted);font-size:13px;">Belum ada transaksi.</div>';
    return;
  }
  DOM.kasRiwayat.innerHTML = '';
  items.forEach(it => {
    const masuk = it.jenis === 'masuk';
    const d = document.createElement('div');
    d.style.cssText = 'padding:14px 16px;border:1px solid var(--c-border);border-radius:16px;background:rgba(255,255,255,.02);';
    d.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;">
        <div style="flex:1;min-width:0;">
          <div style="font-weight:700;font-size:13px;margin-bottom:4px;color:${masuk?'var(--c-green)':'var(--c-red)'}">
            ${masuk?'<i class="fa-solid fa-arrow-up"></i> Pemasukan':'<i class="fa-solid fa-arrow-down"></i> Pengeluaran'}
          </div>
          <div style="color:var(--c-muted);font-size:11px;margin-bottom:6px;">${fmtDT(it.tanggal)}</div>
          <div style="color:rgba(238,242,255,.82);font-size:13px;">${esc(it.keterangan||'')}</div>
        </div>
        <div style="text-align:right;flex-shrink:0;">
          <div style="font-weight:800;font-size:16px;color:${masuk?'var(--c-green)':'var(--c-red)'};">${fmtRp(it.nominal)}</div>
          ${(currentRole==='admin'||currentRole==='pengurus') ? `<button data-id="${it.id}" class="btn btn-danger btn-sm kas-del" style="margin-top:8px;"><i class="fa-solid fa-trash"></i> Hapus</button>` : ''}
        </div>
      </div>
    `;
    const delBtn = d.querySelector('.kas-del');
    if (delBtn) {
      delBtn.addEventListener('click', async () => {
        if (!confirm('Hapus transaksi ini?')) return;
        await db.collection('kas').doc(it.id).delete();
      });
    }
    DOM.kasRiwayat.appendChild(d);
  });
}

function renderAbsensiRiwayat(items) {
  if (!DOM.absensiRiwayat) return;
  if (!items || !items.length) {
    DOM.absensiRiwayat.innerHTML = '<p style="font-size:13px;color:var(--c-muted);">Belum ada riwayat absensi.</p>';
    return;
  }
  DOM.absensiRiwayat.innerHTML = '';
  items.forEach(it => {
    const vals = Object.values(it.records||{});
    const h = vals.filter(v=>v==='hadir').length;
    const i = vals.filter(v=>v==='izin').length;
    const a = vals.filter(v=>v==='alfa').length;
    const d = document.createElement('div');
    d.style.cssText = 'padding:14px 16px;border:1px solid var(--c-border);border-radius:14px;background:rgba(255,255,255,.015);';
    d.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
        <div>
          <div style="font-weight:700;font-size:13px;margin-bottom:3px;"><i class="fa-regular fa-calendar" style="color:var(--c-amber);margin-right:6px;"></i>${it.tanggal||'-'}</div>
          <div style="font-size:11px;color:var(--c-muted);">${fmtDT(it.timestamp)}</div>
        </div>
        <div style="display:flex;gap:8px;">
          <span style="padding:4px 10px;border-radius:999px;background:rgba(110,231,247,.1);color:var(--c-cyan);font-size:12px;font-weight:700;">Hadir: ${h}</span>
          <span style="padding:4px 10px;border-radius:999px;background:rgba(255,179,64,.1);color:var(--c-amber);font-size:12px;font-weight:700;">Izin: ${i}</span>
          <span style="padding:4px 10px;border-radius:999px;background:rgba(255,95,95,.1);color:var(--c-red);font-size:12px;font-weight:700;">Alfa: ${a}</span>
        </div>
      </div>
    `;
    DOM.absensiRiwayat.appendChild(d);
  });
}

// ──────────────────────────────────────────────────────────────
// ABSENSI DRAFT
// ──────────────────────────────────────────────────────────────

function initAbsensi() {
  ALL_ANGGOTA.forEach(a => { if (!absDraft[a.uid]) absDraft[a.uid] = 'alfa'; });
  renderAbsensiForm('');
}

function renderAbsensiForm(q) {
  if (!DOM.absensiList) return;
  const fil = q.toLowerCase();
  const list = fil ? ALL_ANGGOTA.filter(a => a.nama.toLowerCase().includes(fil) || a.jabatan.toLowerCase().includes(fil)) : ALL_ANGGOTA;
  if (!list.length) {
    DOM.absensiList.innerHTML = '<div style="color:var(--c-muted);font-size:13px;padding:10px;">Tidak ditemukan.</div>';
    return;
  }
  DOM.absensiList.innerHTML = '';
  list.forEach(a => {
    const st = absDraft[a.uid] || 'alfa';
    const row = document.createElement('div');
    row.className = 'abs-row';
    row.innerHTML = `
      <div class="abs-name"><strong>${esc(a.nama)}</strong><small>${esc(a.jabatan)}</small></div>
      <div class="abs-btns">
        <button class="abs-btn ${st==='hadir'?'sel-hadir':''}" data-uid="${a.uid}" data-s="hadir">Hadir</button>
        <button class="abs-btn ${st==='izin'?'sel-izin':''}" data-uid="${a.uid}" data-s="izin">Izin</button>
        <button class="abs-btn ${st==='alfa'?'sel-alfa':''}" data-uid="${a.uid}" data-s="alfa">Alfa</button>
      </div>
    `;
    row.querySelectorAll('.abs-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        absDraft[btn.dataset.uid] = btn.dataset.s;
        renderAbsensiForm(DOM.absSearch?.value || '');
      });
    });
    DOM.absensiList.appendChild(row);
  });
}

// ──────────────────────────────────────────────────────────────
// LOGIN / LOGOUT
// ──────────────────────────────────────────────────────────────

function openLoginModal() {
  DOM.loginOverlay.classList.add('open');
  DOM.loginError.classList.remove('show');
  DOM.loginEmail.value = '';
  DOM.loginPassword.value = '';
  setTimeout(() => DOM.loginEmail.focus(), 50);
}

function closeLoginModal() {
  DOM.loginOverlay.classList.remove('open');
}

// Login form submit
DOM.loginSubmit.addEventListener('click', async () => {
  const email = DOM.loginEmail.value.trim();
  const pw = DOM.loginPassword.value.trim();
  if (!email || !pw) {
    DOM.loginErrorText.textContent = 'Harap isi email dan password.';
    DOM.loginError.classList.add('show');
    return;
  }
  DOM.loginSubmit.disabled = true;
  DOM.loginSubmit.innerHTML = '<span class="spinner"></span> Memproses...';
  DOM.loginError.classList.remove('show');
  try {
    await auth.signInWithEmailAndPassword(email, pw);
    closeLoginModal();
  } catch(err) {
    const msgs = {
      'auth/user-not-found': 'Email tidak terdaftar.',
      'auth/wrong-password': 'Password salah.',
      'auth/invalid-email': 'Format email tidak valid.',
      'auth/too-many-requests': 'Terlalu banyak percobaan. Coba lagi nanti.',
      'auth/invalid-credential': 'Email atau password salah.'
    };
    DOM.loginErrorText.textContent = msgs[err.code] || 'Gagal masuk: ' + err.message;
    DOM.loginError.classList.add('show');
  } finally {
    DOM.loginSubmit.disabled = false;
    DOM.loginSubmit.innerHTML = '<i class="fa-solid fa-arrow-right-to-bracket"></i> Masuk ke Portal';
  }
});

// Enter key login
[DOM.loginEmail, DOM.loginPassword].forEach(el => {
  el.addEventListener('keydown', e => { if (e.key==='Enter') DOM.loginSubmit.click(); });
});

// Forgot password
DOM.forgotLink.addEventListener('click', () => {
  const email = DOM.loginEmail.value.trim();
  if (!email) { alert('Masukkan email kamu dulu.'); return; }
  auth.sendPasswordResetEmail(email)
    .then(() => alert('Link reset password telah dikirim ke ' + email))
    .catch(err => alert('Gagal kirim reset: ' + err.message));
});

// Logout
async function handleLogout() {
  await auth.signOut();
  DOM.hamburger.classList.remove('active');
  DOM.mobileMenu.classList.remove('open');
}

// ──────────────────────────────────────────────────────────────
// DASHBOARD SHOW / HIDE
// ──────────────────────────────────────────────────────────────

function showDashboard() {
  DOM.hero.style.display = 'none';
  DOM.madingPublik.style.display = 'none';
  DOM.portalDashboard.classList.add('open');
  
  DOM.btnNavLogin.style.display = 'none';
  DOM.btnNavLogout.style.display = 'inline-flex';
  DOM.mobileBtnLogin.style.display = 'none';
  DOM.mobileBtnLogout.style.display = 'flex';
  DOM.mobileBtnLogout.classList.add('show');
  
  // User info
  const email = currentUser?.email || '';
  const nama = email.split('@')[0];
  const init = nama.charAt(0).toUpperCase();
  DOM.dashUserInfo.innerHTML = `${esc(email)} &nbsp;<span class="sync-dot loading"></span> <span style="font-size:11px;">Menghubungkan...</span>`;
  DOM.navUserInfo.style.display = 'inline-flex';
  DOM.navAvatar.textContent = init;
  DOM.navUserName.textContent = nama;
  
  DOM.dashRoleBadge.textContent = currentRole;
  DOM.dashRoleBadge.className = 'role-badge' + (currentRole==='admin' ? ' admin' : currentRole==='pengurus' ? ' pengurus' : '');
  
  DOM.adminOnlyTabs.forEach(el => {
    el.classList.toggle('show', currentRole==='admin');
  });
  
  isFirstLoad = true;
  knownNotifIds.clear();
  initAbsensi();
}

function hideDashboard() {
  DOM.hero.style.display = '';
  DOM.madingPublik.style.display = 'block';
  DOM.portalDashboard.classList.remove('open');
  
  DOM.btnNavLogin.style.display = 'inline-flex';
  DOM.btnNavLogout.style.display = 'none';
  DOM.mobileBtnLogin.style.display = 'inline-flex';
  DOM.mobileBtnLogout.style.display = 'none';
  DOM.mobileBtnLogout.classList.remove('show');
  DOM.navUserInfo.style.display = 'none';
}

// ──────────────────────────────────────────────────────────────
// AUTH STATE CHANGED
// ──────────────────────────────────────────────────────────────

auth.onAuthStateChanged(async (user) => {
  if (user) {
    currentUser = user;
    try {
      const uDoc = await db.collection('users').doc(user.uid).get();
      currentRole = uDoc.exists ? (uDoc.data().role || 'pengurus') : 'pengurus';
    } catch { currentRole = 'pengurus'; }
    showDashboard();
    startListeners();
    if (Notification.permission === 'default') {
      setTimeout(() => {
        if (confirm('Aktifkan notifikasi untuk menerima update kas & mading secara real-time?')) {
          Notification.requestPermission().then(updateNotifStatus);
        }
      }, 800);
    } else {
      updateNotifStatus(Notification.permission);
    }
  } else {
    currentUser = null;
    currentRole = 'anggota';
    stopListeners();
    hideDashboard();
    loadMadingPublik();
  }
});

function loadMadingPublik() {
  db.collection('mading').orderBy('tanggal', 'desc').limit(20)
    .onSnapshot(snap => {
      const items = [];
      snap.forEach(d => items.push({id: d.id, ...d.data()}));
      renderMadingPub(items);
    });
}

// ──────────────────────────────────────────────────────────────
// NOTIFICATION STATUS
// ──────────────────────────────────────────────────────────────

function updateNotifStatus(perm) {
  if (!DOM.notifStatus) return;
  if (perm === 'granted') {
    DOM.notifStatus.innerHTML = '✅ Notifikasi aktif — update kas & mading masuk real-time';
    DOM.notifStatus.style.color = 'var(--c-green)';
  } else if (perm === 'denied') {
    DOM.notifStatus.innerHTML = '⚠️ Izin notifikasi ditolak. Aktifkan di pengaturan browser.';
    DOM.notifStatus.style.color = 'var(--c-amber)';
  } else {
    DOM.notifStatus.innerHTML = 'Klik "Aktifkan Notifikasi" untuk menerima update real-time';
    DOM.notifStatus.style.color = '';
  }
}

// ──────────────────────────────────────────────────────────────
// PUBLISH MADING
// ──────────────────────────────────────────────────────────────

DOM.btnPublishMading.addEventListener('click', async () => {
  const judul = DOM.madingJudul?.value?.trim();
  const isi = DOM.madingIsi?.value?.trim();
  if (!judul || !isi) {
    showToast({type:'info', title:'⚠️ Lengkapi Data', desc:'Judul dan isi wajib diisi!'});
    return;
  }
  
  DOM.btnPublishMading.disabled = true;
  DOM.btnPublishMading.innerHTML = '<span class="spinner"></span> Mempublish...';
  try {
    await db.collection('mading').add({
      judul, isi,
      tanggal: firebase.firestore.FieldValue.serverTimestamp(),
      publish_by: currentUser?.email || 'unknown'
    });
    DOM.madingJudul.value = '';
    DOM.madingIsi.value = '';
    showToast({type:'mading', title:'✅ Pengumuman Dipublish!', desc:'Notifikasi dikirim ke semua pengguna real-time'});
  } catch(err) {
    showToast({type:'info', title:'❌ Gagal Publish', desc: err.message});
  } finally {
    DOM.btnPublishMading.disabled = false;
    DOM.btnPublishMading.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Publish & Kirim Notif';
  }
});

// ──────────────────────────────────────────────────────────────
// TAMBAH KAS
// ──────────────────────────────────────────────────────────────

DOM.btnTambahKas.addEventListener('click', async () => {
  const jenis = DOM.kasJenis?.value;
  const nominal = Number(DOM.kasNominal?.value);
  const ket = DOM.kasKeterangan?.value?.trim();
  if (!jenis || !nominal || nominal <= 0 || !ket) {
    showToast({type:'info', title:'⚠️ Lengkapi Data', desc:'Isi semua field dengan benar!'});
    return;
  }
  
  DOM.btnTambahKas.disabled = true;
  DOM.btnTambahKas.innerHTML = '<span class="spinner"></span> Menyimpan...';
  try {
    await db.collection('kas').add({
      jenis, nominal, keterangan: ket,
      tanggal: firebase.firestore.FieldValue.serverTimestamp(),
      dicatat_oleh: currentUser?.email || 'unknown'
    });
    DOM.kasNominal.value = '';
    DOM.kasKeterangan.value = '';
    const masuk = jenis==='masuk';
    showToast({type:'kas', title: masuk ? '✅ Kas Masuk Dicatat!' : '✅ Kas Keluar Dicatat!', desc:'Data tersinkron ke Firestore & notifikasi terkirim'});
  } catch(err) {
    showToast({type:'info', title:'❌ Gagal Simpan', desc: err.message});
  } finally {
    DOM.btnTambahKas.disabled = false;
    DOM.btnTambahKas.innerHTML = '<i class="fa-solid fa-plus"></i> Tambah & Kirim Notif';
  }
});

// ──────────────────────────────────────────────────────────────
// SIMPAN ABSENSI
// ──────────────────────────────────────────────────────────────

DOM.btnSimpanAbsensi.addEventListener('click', async () => {
  const btn = DOM.btnSimpanAbsensi;
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Menyimpan...';
  try {
    const today = new Date().toISOString().split('T')[0];
    await db.collection('absensi').add({
      records: absDraft,
      tanggal: today,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      dicatat_oleh: currentUser?.email || 'unknown'
    });
    playSound('absensi');
    const vals = Object.values(absDraft);
    const h = vals.filter(v=>v==='hadir').length;
    const i = vals.filter(v=>v==='izin').length;
    const a = vals.filter(v=>v==='alfa').length;
    showToast({type:'absensi', title:'📋 Absensi Tersimpan!', desc:`Hadir: ${h} · Izin: ${i} · Alfa: ${a} — tersinkron ke Firestore`});
  } catch(err) {
    showToast({type:'info', title:'❌ Gagal Simpan', desc: err.message});
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Simpan ke Firestore';
  }
});

// ──────────────────────────────────────────────────────────────
// ABSENSI - HADIR SEMUA & RESET
// ──────────────────────────────────────────────────────────────

DOM.btnHadirSemua.addEventListener('click', () => {
  ALL_ANGGOTA.forEach(a => absDraft[a.uid] = 'hadir');
  renderAbsensiForm(DOM.absSearch?.value || '');
});

DOM.btnResetAbsensi.addEventListener('click', () => {
  ALL_ANGGOTA.forEach(a => absDraft[a.uid] = 'alfa');
  renderAbsensiForm(DOM.absSearch?.value || '');
});

DOM.absSearch.addEventListener('input', e => renderAbsensiForm(e.target.value));

// ──────────────────────────────────────────────────────────────
// NOTIF BELL TOGGLE
// ──────────────────────────────────────────────────────────────

DOM.notifBell.addEventListener('click', e => {
  e.stopPropagation();
  DOM.notifDropdown.classList.toggle('open');
});

DOM.mobNotifBell.addEventListener('click', e => {
  e.stopPropagation();
  DOM.notifDropdown.classList.toggle('open');
});

document.addEventListener('click', () => DOM.notifDropdown.classList.remove('open'));

DOM.clearNotifBtn.addEventListener('click', () => {
  localStorage.removeItem('ap_notifs_v3');
  unreadCount = 0;
  updateBadge();
  renderDropdown();
  DOM.notifDropdown.classList.remove('open');
});

// ──────────────────────────────────────────────────────────────
// ENABLE PUSH NOTIFICATION
// ──────────────────────────────────────────────────────────────

DOM.btnEnablePush.addEventListener('click', async () => {
  const perm = await Notification.requestPermission();
  updateNotifStatus(perm);
  if (perm === 'granted') {
    showBrowserNotif('✅ Notifikasi Aktif', 'Kamu akan menerima update kas & mading!', 'info');
    // Get FCM Token if messaging available
    if (messaging) {
      try {
        const token = await messaging.getToken({
          vapidKey: "BFs1kccEgDcaL9RHZwrVH2ltSgNLZusqQmep5NfX-29PKt_0EiQ5_WDHnCv4Er6ZCmSLagAH9QdPFmpSHqEYHbgY"
        });
        console.log('📨 FCM Token:', token);
      } catch(e) { console.warn('FCM token error:', e); }
    }
  }
});

DOM.btnTestNotif.addEventListener('click', () => {
  playSound('kas');
  setTimeout(() => playSound('mading'), 800);
  showToast({type:'info', title:'🔔 Tes Notifikasi', desc:'Sistem notifikasi Adhigana Prapti aktif!'});
  showBrowserNotif('🔔 Tes Notifikasi', 'Sistem berjalan normal!', 'info');
});

// ──────────────────────────────────────────────────────────────
// TABS
// ──────────────────────────────────────────────────────────────

DOM.tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    DOM.tabBtns.forEach(b => b.classList.remove('active'));
    DOM.tabPanes.forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    const key = btn.dataset.tab;
    const pane = document.getElementById('pane' + key.charAt(0).toUpperCase() + key.slice(1));
    if (pane) pane.classList.add('active');
  });
});

// ──────────────────────────────────────────────────────────────
// HAMBURGER
// ──────────────────────────────────────────────────────────────

DOM.hamburger.addEventListener('click', () => {
  DOM.hamburger.classList.toggle('active');
  DOM.mobileMenu.classList.toggle('open');
});

document.querySelectorAll('.mobile-menu a, .mobile-menu button').forEach(el => {
  el.addEventListener('click', () => {
    DOM.hamburger.classList.remove('active');
    DOM.mobileMenu.classList.remove('open');
  });
});

document.querySelectorAll('[data-scroll]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = document.getElementById(a.dataset.scroll);
    if (target) target.scrollIntoView({behavior:'smooth'});
  });
});

// ──────────────────────────────────────────────────────────────
// PWA INSTALL
// ──────────────────────────────────────────────────────────────

let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  if (!localStorage.getItem('pwa_dismissed')) {
    setTimeout(() => DOM.pwaBanner.classList.add('show'), 2500);
  }
});

DOM.pwaBtnInstall.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const {outcome} = await deferredPrompt.userChoice;
  if (outcome === 'accepted') DOM.pwaBanner.classList.remove('show');
  deferredPrompt = null;
});

DOM.pwaBtnDismiss.addEventListener('click', () => {
  localStorage.setItem('pwa_dismissed', '1');
  DOM.pwaBanner.classList.remove('show');
});

// ──────────────────────────────────────────────────────────────
// SERVICE WORKER
// ──────────────────────────────────────────────────────────────

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js', {scope:'/'})
    .then(r => console.log('✅ SW registered', r.scope))
    .catch(e => console.warn('SW error:', e));
}

// ──────────────────────────────────────────────────────────────
// INIT
// ──────────────────────────────────────────────────────────────

renderDropdown();
updateNotifStatus(Notification.permission);
console.log('🔥 Portal Adhigana Prapti siap!');
