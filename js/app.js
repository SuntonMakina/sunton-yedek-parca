/**
 * SUNTON & HSG - V1 MİNİMALİST VE SADE UYGULAMA MANTIĞI (v1.1)
 * ==============================================================================
 * Tedarikçi Bağlantılı Sevkiyatlar, Hatırlatıcılar ve Tedarikçi Parça Geçmişi
 * ==============================================================================
 */

// Basit Bildirim (Toast)
function showToast(message) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast-msg';
  toast.innerHTML = `
    <span>${message}</span>
    <button class="text-slate-400 hover:text-white text-xs ml-3" onclick="this.parentElement.remove()">✕</button>
  `;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ==================== KİMLİK DOĞRULAMA (AUTH) YAPISI ====================
const AUTH_CONFIG = {
  REQUIRED_EMAIL: 'leyla.kaplan@suntonmakina.com',
  REQUIRED_PASS: 'Leyla2026',
  USER_PROFILE: {
    fullName: 'Leyla Kaplan',
    email: 'leyla.kaplan@suntonmakina.com',
    role: 'Yedek Parça & Tedarik Yöneticisi',
    title: 'Tedarik Yöneticisi',
    avatar: 'LK',
    company: 'Sunton & HSG'
  }
};

function getAuthenticatedUser() {
  try {
    const raw = localStorage.getItem('sunton_portal_auth_user');
    if (!raw) return null;
    const user = JSON.parse(raw);
    if (user && user.email && user.email.toLowerCase() === AUTH_CONFIG.REQUIRED_EMAIL.toLowerCase()) {
      return user;
    }
    return null;
  } catch (e) {
    return null;
  }
}

function updateHeaderUserInfo(user) {
  const avatarEl = document.getElementById('headerUserAvatar');
  const nameEl = document.getElementById('headerUserName');
  const roleEl = document.getElementById('headerUserRole');
  if (avatarEl) avatarEl.textContent = user.avatar || 'LK';
  if (nameEl) nameEl.textContent = user.fullName || 'Leyla Kaplan';
  if (roleEl) roleEl.textContent = user.title || 'Tedarik Yöneticisi';
}

function checkAuthAndRender() {
  const user = getAuthenticatedUser();
  const authScreen = document.getElementById('authLoginScreen');
  const appWrapper = document.getElementById('appMainWrapper');

  if (!user) {
    // Giriş yapılmamış: Giriş ekranını göster, ana paneli gizle
    if (authScreen) {
      authScreen.classList.remove('hidden');
      authScreen.classList.add('flex');
    }
    if (appWrapper) {
      appWrapper.classList.add('hidden');
    }
    return false;
  } else {
    // Giriş yapılmış: Giriş ekranını gizle, ana paneli aç
    if (authScreen) {
      authScreen.classList.add('hidden');
      authScreen.classList.remove('flex');
    }
    if (appWrapper) {
      appWrapper.classList.remove('hidden');
    }
    updateHeaderUserInfo(user);
    return true;
  }
}

function togglePasswordVisibility() {
  const passInput = document.getElementById('loginPassword');
  const icon = document.getElementById('passwordToggleIcon');
  if (!passInput || !icon) return;
  if (passInput.type === 'password') {
    passInput.type = 'text';
    icon.textContent = 'visibility_off';
  } else {
    passInput.type = 'password';
    icon.textContent = 'visibility';
  }
}

function fillDemoCredentials() {
  const emailInput = document.getElementById('loginEmail');
  const passInput = document.getElementById('loginPassword');
  if (emailInput) emailInput.value = AUTH_CONFIG.REQUIRED_EMAIL;
  if (passInput) passInput.value = AUTH_CONFIG.REQUIRED_PASS;
  showToast('Giriş bilgileri form alanlarına dolduruldu.');
}

async function handleLoginSubmit(event) {
  if (event) event.preventDefault();

  const emailInput = document.getElementById('loginEmail');
  const passInput = document.getElementById('loginPassword');
  const errorAlert = document.getElementById('authErrorAlert');
  const successAlert = document.getElementById('authSuccessAlert');
  const errorMsg = document.getElementById('authErrorMessage');
  const btnSubmit = document.getElementById('btnLoginSubmit');
  const btnText = document.getElementById('btnLoginText');

  const emailVal = (emailInput?.value || '').trim().toLowerCase();
  const passVal = passInput?.value || '';

  // Önceki hata durumunu temizle
  if (errorAlert) {
    errorAlert.classList.add('hidden');
    errorAlert.classList.remove('animate-shake');
  }

  // Bilgileri Doğrula
  if (emailVal === AUTH_CONFIG.REQUIRED_EMAIL.toLowerCase() && passVal === AUTH_CONFIG.REQUIRED_PASS) {
    // Başarılı Giriş
    if (successAlert) successAlert.classList.remove('hidden');
    if (btnSubmit) btnSubmit.disabled = true;
    if (btnText) btnText.textContent = 'Giriş Yapılıyor...';

    const sessionData = {
      ...AUTH_CONFIG.USER_PROFILE,
      loginAt: new Date().toISOString()
    };

    localStorage.setItem('sunton_portal_auth_user', JSON.stringify(sessionData));

    setTimeout(async () => {
      if (successAlert) successAlert.classList.add('hidden');
      if (btnSubmit) btnSubmit.disabled = false;
      if (btnText) btnText.textContent = 'Giriş Yap';
      
      checkAuthAndRender();
      await loadAllData();
      const hash = window.location.hash.replace('#', '') || 'kontrol-paneli';
      navigateTo(hash);
      showToast(`Hoş geldiniz, ${AUTH_CONFIG.USER_PROFILE.fullName}!`);
    }, 450);

  } else {
    // Hatalı Giriş
    if (errorAlert) {
      errorAlert.classList.remove('hidden');
      void errorAlert.offsetWidth; // Reflow tetikle
      errorAlert.classList.add('animate-shake');
      if (errorMsg) {
        if (emailVal !== AUTH_CONFIG.REQUIRED_EMAIL.toLowerCase()) {
          errorMsg.textContent = 'Bu e-posta adresiyle yetkili kullanıcı kaydı bulunamadı.';
        } else {
          errorMsg.textContent = 'Girdiğiniz şifre hatalı! Lütfen bilgilerinizi kontrol edin.';
        }
      }
    }
    if (passInput) {
      passInput.focus();
      passInput.select();
    }
  }
}

function handleLogout() {
  if (confirm('Sunton & HSG Portalı oturumunuzu kapatmak istediğinize emin misiniz?')) {
    localStorage.removeItem('sunton_portal_auth_user');
    checkAuthAndRender();
    showToast('Oturum güvenli bir şekilde kapatıldı.');
  }
}

// Global Uygulama Durumu
const appState = {
  currentPath: 'kontrol-paneli',
  inventory: [],
  shipments: [],
  requests: [],
  reminders: [],
  suppliers: []
};

// Başlangıç
document.addEventListener('DOMContentLoaded', async () => {
  setupNavigation();
  setupDragAndDropAndPasteListeners();
  
  const isAuth = checkAuthAndRender();
  if (isAuth) {
    await loadAllData();
    const hash = window.location.hash.replace('#', '') || 'kontrol-paneli';
    navigateTo(hash);
  }
});

// Veri Yükleme
async function loadAllData() {
  appState.inventory = await window.dbService.getInventory();
  appState.shipments = await window.dbService.getShipments();
  appState.requests = await window.dbService.getRequests();
  appState.reminders = await window.dbService.getReminders();
  appState.suppliers = await window.dbService.getSuppliers();

  populateSupplierDropdowns();
  renderCurrentPage();
}

// Tedarikçi Seçim Kutularını Doldur
function populateSupplierDropdowns() {
  const selects = ['formReqSupplier', 'modalShipSupplier', 'modalRemSupplier'];
  selects.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = appState.suppliers.map(s => `
      <option value="${s.name}">${s.name} (${s.category === 'china' ? 'Çin HSG' : 'Türkiye Bayi'})</option>
    `).join('');
  });
}

// Gezinme & Yönlendirme (Router)
function setupNavigation() {
  window.addEventListener('hashchange', () => {
    if (!getAuthenticatedUser()) {
      checkAuthAndRender();
      return;
    }
    const hash = window.location.hash.replace('#', '') || 'kontrol-paneli';
    navigateTo(hash);
  });
}

function navigateTo(path) {
  if (!getAuthenticatedUser()) {
    checkAuthAndRender();
    return;
  }

  appState.currentPath = path;
  window.location.hash = path;

  // Menü Aktifliği
  document.querySelectorAll('.nav-item').forEach(btn => {
    if (btn.getAttribute('data-path') === path) {
      btn.className = 'nav-item px-3 py-1.5 rounded-lg text-sm transition-colors active bg-slate-900 text-white font-semibold';
    } else {
      btn.className = 'nav-item px-3 py-1.5 rounded-lg text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors';
    }
  });

  // Sayfayı Göster
  document.querySelectorAll('.page-view').forEach(view => view.classList.remove('active'));
  const target = document.getElementById(`view-${path}`);
  if (target) {
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  renderCurrentPage();
}

function renderCurrentPage() {
  const p = appState.currentPath;
  if (p === 'kontrol-paneli') renderDashboard();
  else if (p === 'envanter') renderInventory();
  else if (p === 'sevkiyatlar') renderShipments();
  else if (p === 'mesaj-ve-hatirlaticilar') renderReminders();
  else if (p === 'tedarikciler') renderSuppliers();
}

// ==================== TALEP AŞAMALARI VE DURUMLARI (6 AŞAMA) ====================
const REQUEST_STAGES = [
  { step: 1, label: 'Talep Açıldı / Mesaj Bekleniyor', short: '1. Mesaj Bekleniyor', color: 'bg-slate-100 text-slate-800 border-slate-300', icon: 'chat' },
  { step: 2, label: 'Tedarikçi Onayladı / Hazırlanıyor', short: '2. Onaylandı & Hazırlanıyor', color: 'bg-amber-50 text-amber-800 border-amber-300', icon: 'inventory' },
  { step: 3, label: "Çin'den Çıkış Bekliyor", short: "3. Çin Çıkış Bekliyor", color: 'bg-orange-50 text-orange-800 border-orange-300', icon: 'flight_takeoff' },
  { step: 4, label: 'Uluslararası Sevkiyatta / Yolda', short: '4. Yolda / Sevkiyatta', color: 'bg-blue-50 text-blue-800 border-blue-300', icon: 'directions_boat' },
  { step: 5, label: "Türkiye'de / Gümrükte", short: "5. TR Gümrükte", color: 'bg-purple-50 text-purple-800 border-purple-300', icon: 'flag' },
  { step: 6, label: 'Merkez Depo Teslim Edildi', short: '6. Teslim Edildi', color: 'bg-emerald-50 text-emerald-800 border-emerald-300', icon: 'check_circle' }
];

function getStageInfo(step) {
  const s = parseInt(step) || 1;
  return REQUEST_STAGES.find(st => st.step === s) || REQUEST_STAGES[0];
}

function getStageColor(step) {
  const s = parseInt(step) || 1;
  if (s === 1) return 'bg-slate-100 text-slate-700 border border-slate-200';
  if (s === 2) return 'bg-amber-50 text-amber-800 border border-amber-200';
  if (s === 3) return 'bg-orange-50 text-orange-800 border border-orange-200';
  if (s === 4) return 'bg-blue-50 text-blue-800 border border-blue-200';
  if (s === 5) return 'bg-purple-50 text-purple-800 border border-purple-200';
  return 'bg-emerald-50 text-emerald-800 border border-emerald-200';
}

// Saat, Dakika, Saniye ve Salise (Milisaniye) Hassasiyetinde Tarih/Zaman Biçimlendirici
function formatPreciseDateTime(dateInput) {
  let d = dateInput instanceof Date ? dateInput : (dateInput ? new Date(dateInput) : new Date());
  if (isNaN(d.getTime())) d = new Date();
  
  const dateFormatted = d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  const ms = String(d.getMilliseconds()).padStart(3, '0');
  const timeFormatted = `${hours}:${minutes}:${seconds}.${ms}`;
  
  return {
    date: dateFormatted,
    time: timeFormatted,
    shortTime: `${hours}:${minutes}`,
    full: `${dateFormatted}, ${timeFormatted}`,
    iso: d.toISOString()
  };
}

function getRequestCreatedDateTimeFormatted(req) {
  if (req.created_at_date && req.created_at_time) {
    return { date: req.created_at_date, time: req.created_at_time };
  }
  if (req.created_at) {
    try {
      const d = new Date(req.created_at);
      if (!isNaN(d.getTime())) {
        const date = d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });
        const time = d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Istanbul' });
        return { date, time };
      }
    } catch (e) {}
  }
  return { date: 'Bugün', time: '10:00' };
}

// Türkiye Saatine (UTC+3) Göre Kalan Gün Hesabı
function calculateReminderDaysLeft(rem) {
  if (!rem) return 0;
  
  const now = new Date();
  const trTodayStr = now.toLocaleDateString('en-CA', { timeZone: 'Europe/Istanbul' });
  const todayMs = new Date(trTodayStr + 'T00:00:00').getTime();

  let targetDueMs = null;

  if (rem.due_date) {
    const dueStr = String(rem.due_date).substring(0, 10);
    targetDueMs = new Date(dueStr + 'T00:00:00').getTime();
  } else if (rem.created_at && (rem.deadline_days !== undefined || rem.days_left !== undefined)) {
    const createdStr = String(rem.created_at).substring(0, 10);
    const createdMs = new Date(createdStr + 'T00:00:00').getTime();
    const days = parseInt(rem.deadline_days !== undefined ? rem.deadline_days : rem.days_left) || 0;
    targetDueMs = createdMs + (days * 86400000);
  }

  if (targetDueMs !== null && !isNaN(targetDueMs)) {
    const diffMs = targetDueMs - todayMs;
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
  }

  return parseInt(rem.days_left) || 0;
}

// Modalda Türkiye Saatine Göre Son Tarihi Dinamik Göster
function updateReminderCalculatedDate() {
  const daysInput = document.getElementById('modalRemDays');
  const dateEl = document.getElementById('modalRemCalculatedDate');
  if (!daysInput || !dateEl) return;

  const days = parseInt(daysInput.value) || 0;
  const now = new Date();
  const trTodayStr = now.toLocaleDateString('en-CA', { timeZone: 'Europe/Istanbul' });
  const todayMs = new Date(trTodayStr + 'T00:00:00').getTime();
  const dueMs = todayMs + (days * 86400000);
  const targetDate = new Date(dueMs);
  
  const formatted = targetDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'short' });
  dateEl.textContent = formatted;
}

// ==================== 1. GENEL BAKIŞ (DASHBOARD) ====================
function renderDashboard() {
  const totalStock = appState.inventory.reduce((acc, i) => acc + (parseInt(i.quantity) || 0), 0);
  const stockEl = document.getElementById('dashTotalStock');
  if (stockEl) stockEl.textContent = `${totalStock} Adet`;
  
  const shipEl = document.getElementById('dashActiveShipments');
  if (shipEl) shipEl.textContent = appState.shipments.length;

  const supEl = document.getElementById('dashSuppliersCount');
  if (supEl) supEl.textContent = `${appState.suppliers.length} Firma`;

  // Hatırlatıcılar & Süresi Dolan Kritik Uyarılar
  const overdueReminders = appState.reminders.filter(r => calculateReminderDaysLeft(r) <= 0);
  const remEl = document.getElementById('dashRemindersCount');
  if (remEl) {
    if (overdueReminders.length > 0) {
      remEl.innerHTML = `<span class="flex items-center gap-2 text-red-600">${appState.reminders.length} <span class="text-xs px-2 py-0.5 rounded-full bg-red-600 text-white font-bold animate-pulse">🚨 ${overdueReminders.length} Süresi Doldu!</span></span>`;
    } else {
      remEl.textContent = appState.reminders.length;
    }
  }

  // Son Parça Talepleri (Tıklanabilir ve Zengin Kartlar)
  const recentReqEl = document.getElementById('dashRecentRequests');
  if (recentReqEl) {
    const recent = appState.requests.slice(0, 8);
    if (recent.length === 0) {
      recentReqEl.innerHTML = '<p class="text-xs text-slate-400 py-4 text-center">Henüz parça talebi bulunmuyor. Sağ üstteki "+ Talep Oluştur" butonuna basarak ekleyebilirsiniz.</p>';
    } else {
      recentReqEl.innerHTML = recent.map(r => {
        const dt = getRequestCreatedDateTimeFormatted(r);
        const stage = getStageInfo(r.stage_step);
        const hasImage = !!r.chat_image;
        const hasProforma = !!r.proforma_file;

        return `
          <div class="py-3 px-3 -mx-2 rounded-xl hover:bg-slate-50 transition-all cursor-pointer border border-transparent hover:border-slate-200 group flex items-center justify-between gap-3" onclick="openRequestDetailModal('${r.id || r.request_no}')" title="Detayları, Saati ve Adımları Görüntüle">
            <div class="min-w-0">
              <div class="flex items-center gap-2 mb-1 flex-wrap">
                <span class="font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-sm truncate">${r.part_name}</span>
                <span class="font-mono text-[11px] text-slate-400 font-semibold">${r.request_no}</span>
                ${hasImage ? `
                  <button type="button" class="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors cursor-pointer shadow-2xs" onclick="event.stopPropagation(); openRequestImageModal('${r.id || r.request_no}')" title="Sohbet / Parça Görselini Büyüt">
                    <span class="material-symbols-outlined text-[13px]">image</span>
                    <span>📷 Görsel</span>
                  </button>
                ` : ''}
                ${hasProforma ? `
                  <button type="button" class="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition-colors cursor-pointer shadow-2xs" onclick="event.stopPropagation(); openProformaViewer('${r.id || r.request_no}')" title="2. Adım Proforma Faturasını İncele">
                    <span class="material-symbols-outlined text-[13px] text-amber-700">description</span>
                    <span>📄 Proforma İncele</span>
                  </button>
                ` : ''}
              </div>
              <div class="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
                <span>🏢 <strong class="text-slate-700 font-semibold">${r.supplier_name || 'Tedarikçi'}</strong></span>
                <span>• ${r.quantity} Adet (${r.company})</span>
                <span>• 📅 ${dt.date}, ⏰ <strong>${dt.time}</strong></span>
                ${r.proforma_amount ? `<span class="text-emerald-700 font-bold">• 💰 ${r.proforma_amount}</span>` : ''}
              </div>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <span class="text-xs px-2.5 py-1 rounded-full font-bold shadow-xs ${getStageColor(r.stage_step)}">
                ${stage.short || r.stage_label}
              </span>
              <span class="material-symbols-outlined text-slate-400 group-hover:text-blue-600 text-[18px]">chevron_right</span>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // Bekleyen Hatırlatıcılar (Süresi dolanlar ve aciller en üstte!)
  const recentRemEl = document.getElementById('dashRecentReminders');
  if (recentRemEl) {
    if (appState.reminders.length === 0) {
      recentRemEl.innerHTML = '<p class="text-xs text-slate-400 py-3">Bekleyen hatırlatıcı yok.</p>';
    } else {
      const sortedReminders = [...appState.reminders].sort((a, b) => {
        return calculateReminderDaysLeft(a) - calculateReminderDaysLeft(b);
      }).slice(0, 5);

      recentRemEl.innerHTML = sortedReminders.map(rem => {
        const daysLeft = calculateReminderDaysLeft(rem);
        const isOverdue = daysLeft <= 0;
        const isTomorrow = daysLeft === 1;

        if (isOverdue) {
          return `
            <div class="py-2.5 px-3 my-1.5 rounded-xl bg-red-50 border-2 border-red-400 shadow-xs flex items-center justify-between text-sm animate-pulse">
              <div>
                <div class="font-bold text-red-900 flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-red-600 text-[18px]">error</span>
                  <span>${rem.title}</span>
                </div>
                <div class="text-xs text-red-700 mt-0.5">${rem.supplier_name || rem.target_type} • <span class="font-mono">${rem.reference_id}</span></div>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <span class="text-xs font-black px-2.5 py-1 rounded-lg bg-red-600 text-white shadow-xs">
                  ${daysLeft < 0 ? `🚨 SÜRESİ GEÇTİ (${Math.abs(daysLeft)}g)` : '🚨 0 GÜN - BUGÜN!'}
                </span>
                <button class="bg-red-700 hover:bg-red-800 text-white px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition-colors" onclick="completeReminder('${rem.id || rem.reference_id}')">Tamamla ✓</button>
              </div>
            </div>
          `;
        }

        if (isTomorrow) {
          return `
            <div class="py-2.5 px-3 my-1 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-between text-sm">
              <div>
                <div class="font-semibold text-amber-950 flex items-center gap-1">
                  <span class="material-symbols-outlined text-amber-600 text-[16px]">schedule</span>
                  <span>${rem.title}</span>
                </div>
                <div class="text-xs text-amber-800">${rem.supplier_name || rem.target_type} • <span class="font-mono">${rem.reference_id}</span></div>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <span class="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">⚡ 1 Gün Kaldı</span>
                <button class="bg-slate-900 hover:bg-slate-800 text-white px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer" onclick="completeReminder('${rem.id || rem.reference_id}')">Tamamla</button>
              </div>
            </div>
          `;
        }

        return `
          <div class="py-3 flex items-center justify-between text-sm">
            <div>
              <div class="font-medium text-slate-900">${rem.title}</div>
              <div class="text-xs text-slate-500">${rem.supplier_name || rem.target_type} • <span class="font-mono">${rem.reference_id}</span></div>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">⏳ ${daysLeft} Gün</span>
              <button class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer" onclick="completeReminder('${rem.id || rem.reference_id}')">Tamamla</button>
            </div>
          </div>
        `;
      }).join('');
    }
  }
}

function getStageColor(step) {
  if (step === 1) return 'bg-slate-100 text-slate-700';
  if (step === 2) return 'bg-blue-50 text-blue-700';
  if (step === 3) return 'bg-indigo-50 text-indigo-700';
  if (step === 4) return 'bg-amber-50 text-amber-700';
  return 'bg-emerald-50 text-emerald-700';
}

// ==================== 2. ENVANTER ====================
function renderInventory() {
  const tbody = document.getElementById('inventoryTableBody');
  if (!tbody) return;

  const search = (document.getElementById('invSearchInput')?.value || '').toLowerCase();
  const depot = document.getElementById('invDepotFilter')?.value || '';

  const filtered = appState.inventory.filter(i => {
    const mSearch = !search || i.sku.toLowerCase().includes(search) || i.name.toLowerCase().includes(search);
    const mDepot = !depot || i.depot === depot;
    return mSearch && mDepot;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="py-8 text-center text-slate-400 text-sm">Kayıt bulunamadı.</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(item => `
    <tr class="hover:bg-slate-50/80">
      <td class="py-3 px-4 font-mono text-xs font-semibold text-blue-600">${item.sku}</td>
      <td class="py-3 px-4 font-medium text-slate-900">${item.name}</td>
      <td class="py-3 px-4 text-slate-600 text-xs">${item.depot}</td>
      <td class="py-3 px-4 font-semibold text-slate-900">
        <div class="flex items-center gap-2">
          <span>${item.quantity} Adet</span>
          <div class="inline-flex gap-1">
            <button class="w-5 h-5 bg-slate-100 hover:bg-slate-200 rounded text-xs flex items-center justify-center font-bold" onclick="quickStock('${item.sku}', -1)">-</button>
            <button class="w-5 h-5 bg-slate-100 hover:bg-slate-200 rounded text-xs flex items-center justify-center font-bold" onclick="quickStock('${item.sku}', 1)">+</button>
          </div>
        </div>
      </td>
      <td class="py-3 px-4">
        <span class="text-xs px-2 py-0.5 rounded-full font-medium ${item.status === 'Kritik' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}">${item.status}</span>
      </td>
      <td class="py-3 px-4 text-right">
        <div class="flex items-center justify-end gap-1">
          <button class="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-900" title="Düzenle" onclick="openEditInventoryModal('${item.sku}')">
            <span class="material-symbols-outlined text-[16px]">edit</span>
          </button>
          <button class="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-600" title="Sil" onclick="deleteInventory('${item.sku}')">
            <span class="material-symbols-outlined text-[16px]">delete</span>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function filterInventory() {
  renderInventory();
}

async function quickStock(sku, delta) {
  const item = appState.inventory.find(i => i.sku === sku);
  if (!item) return;
  item.quantity = Math.max(0, (parseInt(item.quantity) || 0) + delta);
  await window.dbService.saveInventoryItem(item);
  await loadAllData();
  showToast(`${item.name} stok güncellendi: ${item.quantity} Adet`);
}

function openAddInventoryModal() {
  document.getElementById('invModalTitle').innerText = 'Parça Ekle';
  document.getElementById('modalInvSku').value = '';
  document.getElementById('modalInvSku').disabled = false;
  document.getElementById('modalInvName').value = '';
  document.getElementById('modalInvDepot').value = 'Çin HSG Hub';
  document.getElementById('modalInvQty').value = '10';
  document.getElementById('inventoryModal').classList.remove('hidden');
}

function openEditInventoryModal(sku) {
  const item = appState.inventory.find(i => i.sku === sku);
  if (!item) return;
  document.getElementById('invModalTitle').innerText = 'Stok Düzenle';
  document.getElementById('modalInvSku').value = item.sku;
  document.getElementById('modalInvSku').disabled = true;
  document.getElementById('modalInvName').value = item.name;
  document.getElementById('modalInvDepot').value = item.depot;
  document.getElementById('modalInvQty').value = item.quantity;
  document.getElementById('inventoryModal').classList.remove('hidden');
}

function closeInventoryModal() {
  document.getElementById('inventoryModal').classList.add('hidden');
}

async function handleInventorySubmit(e) {
  e.preventDefault();
  const sku = document.getElementById('modalInvSku').value.trim();
  const name = document.getElementById('modalInvName').value.trim();
  const depot = document.getElementById('modalInvDepot').value;
  const quantity = parseInt(document.getElementById('modalInvQty').value) || 0;

  await window.dbService.saveInventoryItem({ sku, name, depot, quantity });
  closeInventoryModal();
  await loadAllData();
  showToast('Parça başarıyla kaydedildi.');
}

async function deleteInventory(sku) {
  if (confirm(`${sku} kodlu parçayı silmek istiyor musunuz?`)) {
    appState.inventory = appState.inventory.filter(i => i.sku !== sku);
    renderInventory();
    renderDashboard();
    await window.dbService.deleteInventoryItem(sku);
    await loadAllData();
    renderInventory();
    renderDashboard();
    showToast(`${sku} silindi.`);
  }
}

// ==================== 3. SEVKİYATLAR (DÜZENLEME & YÖNETİM) ====================
function getShipmentStatusBadge(status) {
  if (status === 'Gümrükte') return 'bg-amber-50 text-amber-700 border border-amber-200';
  if (status === 'Teslim Edildi') return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
  if (status === 'Gecikmede') return 'bg-red-50 text-red-700 border border-red-200';
  if (status === 'Hazırlanıyor') return 'bg-slate-100 text-slate-700 border border-slate-200';
  return 'bg-blue-50 text-blue-700 border border-blue-200'; // Yolda
}

function renderShipments() {
  const container = document.getElementById('shipmentsGrid');
  if (!container) return;

  if (appState.shipments.length === 0) {
    container.innerHTML = '<p class="col-span-full text-center text-slate-400 py-8 text-sm">Aktif sevkiyat bulunmuyor.</p>';
    return;
  }

  container.innerHTML = appState.shipments.map(shp => `
    <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-colors">
      <div>
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <span class="font-mono text-xs font-bold text-slate-900">${shp.tracking_code}</span>
            <span class="text-xs px-2 py-0.5 rounded-full font-medium ${getShipmentStatusBadge(shp.status)}">${shp.status}</span>
          </div>
          <div class="flex items-center gap-1">
            <button class="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-blue-600 transition-colors cursor-pointer" title="Sevkiyatı Düzenle" onclick="openEditShipmentModal('${shp.id || shp.tracking_code}')">
              <span class="material-symbols-outlined text-[16px]">edit</span>
            </button>
            <button class="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-600 transition-colors cursor-pointer" title="Sevkiyatı Sil" onclick="deleteShipment('${shp.id || shp.tracking_code}')">
              <span class="material-symbols-outlined text-[16px]">delete</span>
            </button>
          </div>
        </div>
        
        <!-- Tedarikçi Etiketi -->
        <div class="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-medium mb-2">
          <span class="material-symbols-outlined text-[14px]">domain</span>
          <span>${shp.supplier_name || 'Tedarikçi Belirtilmedi'}</span>
        </div>

        <div class="text-xs text-slate-500 font-medium mb-1">${shp.carrier} • ${shp.transport_mode}</div>
        <div class="text-sm font-semibold text-slate-900 mb-1.5">${shp.origin} ➔ ${shp.destination}</div>
        <div class="text-xs text-slate-600 mb-3">${shp.cargo_summary}</div>
      </div>

      <div class="pt-3 border-t border-slate-100">
        <div class="flex justify-between text-xs text-slate-500 mb-1">
          <span>İlerleme: %${shp.progress_percentage || 0}</span>
          <span class="font-semibold text-blue-600">⏱️ ${shp.eta_date}</span>
        </div>
        <div class="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div class="bg-blue-600 h-full rounded-full transition-all duration-300" style="width: ${shp.progress_percentage || 0}%;"></div>
        </div>
      </div>
    </div>
  `).join('');
}

function openAddShipmentModal() {
  populateSupplierDropdowns();
  document.getElementById('shipmentModalTitle').textContent = 'Yeni Sevkiyat Ekle';
  document.getElementById('modalShipId').value = '';
  document.getElementById('modalShipTrackingCode').value = 'TR-SHP-' + Math.floor(1000 + Math.random() * 9000);
  document.getElementById('modalShipCarrier').value = 'Maersk Line';
  document.getElementById('modalShipMode').value = 'Denizyolu';
  document.getElementById('modalShipOrigin').value = 'Şanghay';
  document.getElementById('modalShipDestination').value = 'İstanbul (Ambarlı)';
  document.getElementById('modalShipCargo').value = '';
  document.getElementById('modalShipEta').value = '7 Gün Sonra';
  document.getElementById('modalShipStatus').value = 'Yolda';
  document.getElementById('modalShipProgress').value = '20';
  document.getElementById('modalShipProgressVal').textContent = '%20';

  const btnDel = document.getElementById('btnDeleteShipment');
  if (btnDel) btnDel.classList.add('hidden');

  document.getElementById('shipmentModal').classList.remove('hidden');
}

function openEditShipmentModal(id) {
  populateSupplierDropdowns();
  const shp = appState.shipments.find(s => s.id === id || s.tracking_code === id);
  if (!shp) return;

  document.getElementById('shipmentModalTitle').textContent = `Sevkiyatı Düzenle (${shp.tracking_code})`;
  document.getElementById('modalShipId').value = shp.id;
  document.getElementById('modalShipTrackingCode').value = shp.tracking_code;
  document.getElementById('modalShipSupplier').value = shp.supplier_name;
  document.getElementById('modalShipCarrier').value = shp.carrier;
  document.getElementById('modalShipMode').value = shp.transport_mode;
  document.getElementById('modalShipOrigin').value = shp.origin;
  document.getElementById('modalShipDestination').value = shp.destination;
  document.getElementById('modalShipCargo').value = shp.cargo_summary;
  document.getElementById('modalShipEta').value = shp.eta_date;
  document.getElementById('modalShipStatus').value = shp.status || 'Yolda';
  
  const prog = shp.progress_percentage !== undefined ? shp.progress_percentage : 50;
  document.getElementById('modalShipProgress').value = prog;
  document.getElementById('modalShipProgressVal').textContent = `%${prog}`;

  const btnDel = document.getElementById('btnDeleteShipment');
  if (btnDel) btnDel.classList.remove('hidden');

  document.getElementById('shipmentModal').classList.remove('hidden');
}

function closeShipmentModal() {
  document.getElementById('shipmentModal').classList.add('hidden');
}

async function handleShipmentSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('modalShipId').value;
  const tracking_code = document.getElementById('modalShipTrackingCode').value.trim() || ('TR-SHP-' + Math.floor(1000 + Math.random() * 9000));
  const supplier_name = document.getElementById('modalShipSupplier').value;
  const carrier = document.getElementById('modalShipCarrier').value;
  const transport_mode = document.getElementById('modalShipMode').value;
  const origin = document.getElementById('modalShipOrigin').value.trim() || 'Şanghay';
  const destination = document.getElementById('modalShipDestination').value.trim() || 'İstanbul';
  const cargo_summary = document.getElementById('modalShipCargo').value.trim() || 'Yedek Parça';
  const eta_date = document.getElementById('modalShipEta').value.trim() || '7 Gün Sonra';
  const status = document.getElementById('modalShipStatus').value;
  const progress_percentage = parseInt(document.getElementById('modalShipProgress').value) || 0;

  closeShipmentModal();
  await window.dbService.saveShipment({
    id: id || undefined,
    tracking_code,
    supplier_name,
    carrier,
    transport_mode,
    origin,
    destination,
    cargo_summary,
    eta_date,
    status,
    progress_percentage
  });

  await loadAllData();
  renderShipments();
  renderDashboard();
  showToast(`${tracking_code} sevkiyatı kaydedildi.`);
}

async function deleteShipment(id) {
  const shp = appState.shipments.find(s => s.id === id || s.tracking_code === id);
  const code = shp ? shp.tracking_code : id;
  const targetId = shp ? (shp.id || shp.tracking_code) : id;

  if (confirm(`${code} kodlu sevkiyatı silmek istediğinize emin misiniz?`)) {
    appState.shipments = appState.shipments.filter(s => s.id !== targetId && s.tracking_code !== code);
    closeShipmentModal();
    renderShipments();
    renderDashboard();

    await window.dbService.deleteShipment(targetId);
    await loadAllData();
    renderShipments();
    renderDashboard();
    showToast(`${code} silindi.`);
  }
}

function deleteCurrentShipment() {
  const id = document.getElementById('modalShipId').value;
  if (id) deleteShipment(id);
}

// ==================== 4. MESAJ VE HATIRLATICILAR ====================
function renderReminders() {
  const container = document.getElementById('remindersListContainer');
  if (!container) return;

  if (appState.reminders.length === 0) {
    container.innerHTML = '<p class="text-center text-slate-400 py-8 text-sm">Bekleyen hatırlatıcı bulunmuyor.</p>';
    return;
  }

  // Sıralama: Süresi dolanlar (0 ve negatif) en üstte
  const sorted = [...appState.reminders].sort((a, b) => {
    return calculateReminderDaysLeft(a) - calculateReminderDaysLeft(b);
  });

  container.innerHTML = sorted.map(rem => {
    const daysLeft = calculateReminderDaysLeft(rem);
    const isOverdue = daysLeft <= 0;
    const isTomorrow = daysLeft === 1;

    let cardBg = 'bg-white border-slate-200 hover:border-slate-300';
    let badgeHtml = `<span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">⏳ ${daysLeft} Gün Kaldı</span>`;
    let bannerHtml = '';

    if (isOverdue) {
      cardBg = 'bg-red-50/80 border-2 border-red-400 shadow-sm';
      badgeHtml = `
        <span class="text-xs font-black px-3 py-1.5 rounded-lg bg-red-600 text-white shadow-xs animate-pulse">
          ${daysLeft < 0 ? `🚨 SÜRESİ GEÇTİ (${Math.abs(daysLeft)} GÜN)` : '🚨 0 GÜN - BUGÜN SON GÜN!'}
        </span>
      `;
      bannerHtml = `
        <div class="mb-2 px-2.5 py-1 rounded-md bg-red-100 border border-red-300 text-red-900 text-xs font-bold flex items-center gap-1.5">
          <span class="material-symbols-outlined text-[16px] text-red-600">warning</span>
          <span>DİKKAT: Bu hatırlatıcının süresi dolmuştur! Acil işlem yapınız.</span>
        </div>
      `;
    } else if (isTomorrow) {
      cardBg = 'bg-amber-50/50 border-amber-300';
      badgeHtml = `<span class="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">⚡ 1 Gün Kaldı (Yarın)</span>`;
    }

    // Tarih bilgisi
    let dateInfo = '';
    if (rem.due_date) {
      const dueObj = new Date(String(rem.due_date).substring(0, 10) + 'T00:00:00');
      const formattedDue = dueObj.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
      dateInfo = ` • <span class="font-medium text-slate-600">Son Gün: ${formattedDue}</span>`;
    }

    return `
      <div class="p-4 rounded-xl border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${cardBg}">
        <div>
          ${bannerHtml}
          <div class="flex items-center gap-2 mb-1.5 flex-wrap">
            <span class="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">${rem.supplier_name || 'Tedarikçi'}</span>
            <span class="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700">${rem.target_type}</span>
            <span class="text-xs text-slate-400 font-mono">${rem.reference_id}</span>
            <span class="text-[11px] text-slate-400">${dateInfo}</span>
          </div>
          <div class="font-bold text-slate-900 text-base">${rem.title}</div>
        </div>

        <div class="flex items-center gap-3 shrink-0 self-end sm:self-center">
          ${badgeHtml}
          <button class="${isOverdue ? 'bg-red-600 hover:bg-red-700 text-white font-bold' : 'bg-slate-900 hover:bg-slate-800 text-white font-medium'} px-4 py-2 rounded-lg text-xs cursor-pointer transition-colors shadow-xs" onclick="completeReminder('${rem.id || rem.reference_id}')">
            Tamamla ✓
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function openAddReminderModal() {
  populateSupplierDropdowns();
  updateReminderCalculatedDate();
  document.getElementById('reminderModal').classList.remove('hidden');
}
function closeReminderModal() {
  document.getElementById('reminderModal').classList.add('hidden');
}

async function handleReminderSubmit(e) {
  e.preventDefault();
  const supplier_name = document.getElementById('modalRemSupplier').value;
  const target_type = document.getElementById('modalRemTarget').value;
  const title = document.getElementById('modalRemTitle').value;
  const days_left = parseInt(document.getElementById('modalRemDays').value) || 3;

  closeReminderModal();
  await window.dbService.addReminder({ supplier_name, target_type, title, days_left });
  await loadAllData();
  renderReminders();
  renderDashboard();
  showToast(`${supplier_name} için hatırlatıcı eklendi.`);
}

async function completeReminder(id) {
  appState.reminders = appState.reminders.filter(r => r.id !== id && r.reference_id !== id);
  renderReminders();
  renderDashboard();
  await window.dbService.completeReminder(id);
  await loadAllData();
  renderReminders();
  renderDashboard();
  showToast('Hatırlatıcı tamamlandı.');
}

// ==================== 5. TEDARİKÇİLER (DÜZENLEME & DETAYLI GEÇMİŞ) ====================
let currentViewingSupplierName = '';

function renderSuppliers() {
  const container = document.getElementById('suppliersGrid');
  if (!container) return;

  if (appState.suppliers.length === 0) {
    container.innerHTML = '<p class="col-span-full text-center text-slate-400 py-8 text-sm">Kayıtlı tedarikçi firma bulunmuyor.</p>';
    return;
  }

  container.innerHTML = appState.suppliers.map(sup => {
    // İlgili sipariş/parça sayısı
    const relatedRequests = appState.requests.filter(r => r.supplier_name === sup.name);
    const totalQty = relatedRequests.reduce((a, b) => a + (parseInt(b.quantity) || 0), 0);

    return `
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group" onclick="openSupplierHistoryModal('${sup.name}')">
        <div>
          <div class="flex items-center justify-between mb-1">
            <h4 class="font-semibold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">${sup.name}</h4>
            <div class="flex items-center gap-1">
              <span class="text-[11px] px-2 py-0.5 rounded-full font-medium ${sup.category === 'china' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}">${sup.category === 'china' ? 'Çin HSG' : (sup.category === 'global' ? 'Global' : 'Türkiye Bayi')}</span>
              <button class="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-blue-600 transition-colors cursor-pointer" title="Firmayı Düzenle" onclick="event.stopPropagation(); openEditSupplierModal('${sup.id || sup.name}')">
                <span class="material-symbols-outlined text-[16px]">edit</span>
              </button>
              <button class="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-600 transition-colors cursor-pointer" title="Firmayı Sil" onclick="event.stopPropagation(); deleteSupplier('${sup.id || sup.name}')">
                <span class="material-symbols-outlined text-[16px]">delete</span>
              </button>
            </div>
          </div>
          <div class="text-xs text-slate-500 mb-2">${sup.location || ''} • <span class="font-mono">${sup.code || ''}</span></div>
          <div class="text-xs text-slate-700 mb-1"><strong>Yetkili:</strong> ${sup.contact_person || '-'}</div>
          <div class="text-xs text-slate-700 mb-1"><strong>Tel:</strong> ${sup.phone || '+90 212 555 0000'}</div>
          ${sup.email ? `<div class="text-xs text-slate-500 mb-2"><strong>E-posta:</strong> ${sup.email}</div>` : ''}
        </div>

        <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span class="text-blue-600 font-semibold">${totalQty} Parça Alındı (${relatedRequests.length} Sipariş)</span>
          <span class="text-slate-400 group-hover:text-blue-600 flex items-center gap-0.5">Geçmişi Gör ➔</span>
        </div>
      </div>
    `;
  }).join('');
}

function openSupplierHistoryModal(supplierName) {
  currentViewingSupplierName = supplierName;
  const sup = appState.suppliers.find(s => s.name === supplierName) || {
    name: supplierName,
    category: 'turkey',
    location: 'Merkez',
    contact_person: 'Yetkili',
    phone: '-'
  };

  // 1. Üst Başlık Bilgileri
  document.getElementById('histSupName').textContent = sup.name;
  const badgeEl = document.getElementById('histSupBadge');
  badgeEl.textContent = sup.category === 'china' ? 'Çin HSG Partner' : (sup.category === 'global' ? 'Global Tedarikçi' : 'Türkiye Bayisi');
  badgeEl.className = `text-xs px-2.5 py-0.5 rounded-full font-medium ${sup.category === 'china' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}`;
  document.getElementById('histSupMeta').textContent = `${sup.location || ''} • Yetkili: ${sup.contact_person || '-'} • Tel: ${sup.phone || '-'}`;

  // 2. Bu Tedarikçiden Alınan Parçalar & Siparişler
  const requests = appState.requests.filter(r => r.supplier_name === supplierName);
  const totalQty = requests.reduce((a, b) => a + (parseInt(b.quantity) || 0), 0);
  const shipments = appState.shipments.filter(s => s.supplier_name === supplierName);
  const reminders = appState.reminders.filter(r => r.supplier_name === supplierName);

  document.getElementById('histTotalQty').textContent = `${totalQty} Adet`;
  document.getElementById('histTotalOrders').textContent = `${requests.length} Sipariş`;
  document.getElementById('histTotalShipments').textContent = `${shipments.length} Sevkiyat`;

  // 3. Parçalar Tablosu Doldur
  const partsTbody = document.getElementById('histPartsTableBody');
  if (requests.length === 0) {
    partsTbody.innerHTML = '<tr><td colspan="5" class="py-4 text-center text-slate-400">Bu tedarikçiden henüz parça siparişi girilmemiş.</td></tr>';
  } else {
    partsTbody.innerHTML = requests.map(r => {
      const dt = getRequestCreatedDateTimeFormatted(r);
      return `
        <tr class="hover:bg-blue-50/60 cursor-pointer transition-colors" onclick="closeSupplierHistoryModal(); openRequestDetailModal('${r.id || r.request_no}')" title="Talep Detayını Aç">
          <td class="py-2.5 px-3">
            <div class="font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
              <span>${r.part_name}</span>
              ${r.proforma_file ? `<span class="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300">📄 Proforma</span>` : ''}
              ${r.chat_image ? `<span class="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200">📷 Görsel</span>` : ''}
            </div>
            <div class="text-[11px] font-mono text-slate-500">${r.part_sku} • ${r.request_no} ${r.proforma_amount ? `• 💰 ${r.proforma_amount}` : ''}</div>
          </td>
          <td class="py-2.5 px-3 font-semibold text-slate-900">${r.quantity} Adet</td>
          <td class="py-2.5 px-3 text-slate-600">${r.supply_channel}</td>
          <td class="py-2.5 px-3">
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${getStageColor(r.stage_step)}">${getStageInfo(r.stage_step).short}</span>
          </td>
          <td class="py-2.5 px-3 text-right text-slate-500 text-[11px]">${dt.date} ${dt.time}</td>
        </tr>
      `;
    }).join('');
  }

  // 4. Bağlı Sevkiyatlar Doldur
  const shipContainer = document.getElementById('histShipmentsContainer');
  if (shipments.length === 0) {
    shipContainer.innerHTML = '<p class="text-xs text-slate-400 py-2">Bu tedarikçiye ait aktif sevkiyat bulunmuyor.</p>';
  } else {
    shipContainer.innerHTML = shipments.map(s => `
      <div class="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
        <div>
          <span class="font-mono font-bold text-slate-900">${s.tracking_code}</span>
          <span class="text-slate-500 ml-2">${s.carrier} (${s.origin} ➔ ${s.destination})</span>
          <div class="text-slate-700 font-medium mt-0.5">${s.cargo_summary}</div>
        </div>
        <div class="text-right">
          <span class="font-semibold text-blue-600 block">⏱️ ${s.eta_date}</span>
          <span class="text-[11px] px-2 py-0.5 rounded-full ${getShipmentStatusBadge(s.status)}">${s.status}</span>
        </div>
      </div>
    `).join('');
  }

  // 5. Bağlı Hatırlatıcılar Doldur
  const remContainer = document.getElementById('histRemindersContainer');
  if (reminders.length === 0) {
    remContainer.innerHTML = '<p class="text-xs text-slate-400 py-2">Bu tedarikçiyle ilgili bekleyen hatırlatıcı yok.</p>';
  } else {
    remContainer.innerHTML = reminders.map(rem => {
      const daysLeft = calculateReminderDaysLeft(rem);
      const isOverdue = daysLeft <= 0;
      return `
        <div class="p-2.5 rounded-lg border flex items-center justify-between text-xs ${isOverdue ? 'bg-red-50 border-red-300 text-red-900 font-semibold' : 'bg-slate-50 border-slate-200'}">
          <div>
            <span class="font-semibold">${rem.title}</span>
            <span class="text-slate-500 ml-2 font-mono">${rem.reference_id}</span>
          </div>
          <span class="font-bold ${isOverdue ? 'text-red-700 bg-red-100 px-2 py-0.5 rounded' : (daysLeft === 1 ? 'text-amber-700' : 'text-slate-700')}">
            ${isOverdue ? (daysLeft < 0 ? `🚨 Süresi Geçti (${Math.abs(daysLeft)}g)` : '🚨 0 Gün (Bugün)') : `⏳ ${daysLeft} Gün`}
          </span>
        </div>
      `;
    }).join('');
  }

  // Modalı Göster
  document.getElementById('supplierHistoryModal').classList.remove('hidden');
}

function openEditSupplierModalFromHistory() {
  const supName = currentViewingSupplierName;
  closeSupplierHistoryModal();
  openEditSupplierModal(supName);
}

function closeSupplierHistoryModal() {
  document.getElementById('supplierHistoryModal').classList.add('hidden');
}

function openAddSupplierModal() {
  document.getElementById('supplierModalTitle').textContent = 'Yeni Firma Ekle';
  document.getElementById('modalSupId').value = '';
  document.getElementById('modalSupOrigName').value = '';
  document.getElementById('modalSupName').value = '';
  document.getElementById('modalSupCode').value = 'TR-IST-' + Math.floor(100 + Math.random() * 900);
  document.getElementById('modalSupCategory').value = 'turkey';
  document.getElementById('modalSupLoc').value = '';
  document.getElementById('modalSupContact').value = '';
  document.getElementById('modalSupPhone').value = '';
  document.getElementById('modalSupEmail').value = '';

  const btnDel = document.getElementById('btnDeleteSupplier');
  if (btnDel) btnDel.classList.add('hidden');

  document.getElementById('supplierModal').classList.remove('hidden');
}

function openEditSupplierModal(idOrName) {
  const sup = appState.suppliers.find(s => s.id === idOrName || s.name === idOrName || s.code === idOrName);
  if (!sup) return;

  document.getElementById('supplierModalTitle').textContent = `Firma Bilgilerini Düzenle (${sup.name})`;
  document.getElementById('modalSupId').value = sup.id || sup.name;
  document.getElementById('modalSupOrigName').value = sup.name;
  document.getElementById('modalSupName').value = sup.name;
  document.getElementById('modalSupCode').value = sup.code || '';
  document.getElementById('modalSupCategory').value = sup.category || 'turkey';
  document.getElementById('modalSupLoc').value = sup.location || '';
  document.getElementById('modalSupContact').value = sup.contact_person || '';
  document.getElementById('modalSupPhone').value = sup.phone || '';
  document.getElementById('modalSupEmail').value = sup.email || '';

  const btnDel = document.getElementById('btnDeleteSupplier');
  if (btnDel) btnDel.classList.remove('hidden');

  document.getElementById('supplierModal').classList.remove('hidden');
}

function closeSupplierModal() {
  document.getElementById('supplierModal').classList.add('hidden');
}

async function handleSupplierSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('modalSupId').value;
  const originalName = document.getElementById('modalSupOrigName').value;
  const name = document.getElementById('modalSupName').value.trim();
  const category = document.getElementById('modalSupCategory').value;
  const code = document.getElementById('modalSupCode').value.trim() || ((category === 'china' ? 'CN-SH-' : 'TR-IST-') + Math.floor(100 + Math.random() * 900));
  const location = document.getElementById('modalSupLoc').value.trim();
  const contact_person = document.getElementById('modalSupContact').value.trim();
  const phone = document.getElementById('modalSupPhone').value.trim();
  const email = document.getElementById('modalSupEmail').value.trim();

  // İsim değiştiyse ilişkili kayıtları da güncelle
  if (originalName && originalName !== name) {
    appState.shipments.forEach(s => {
      if (s.supplier_name === originalName) s.supplier_name = name;
    });
    appState.requests.forEach(r => {
      if (r.supplier_name === originalName) r.supplier_name = name;
    });
    appState.reminders.forEach(rem => {
      if (rem.supplier_name === originalName) rem.supplier_name = name;
    });
    localStorage.setItem('sunton_shipments_data', JSON.stringify(appState.shipments));
    localStorage.setItem('sunton_requests_data', JSON.stringify(appState.requests));
    localStorage.setItem('sunton_reminders_data', JSON.stringify(appState.reminders));
  }

  closeSupplierModal();
  await window.dbService.saveSupplier({ id: id || undefined, originalName, name, code, category, location, contact_person, phone, email });
  await loadAllData();
  renderSuppliers();
  renderDashboard();
  populateSupplierDropdowns();
  showToast(`${name} başarıyla kaydedildi.`);
}

async function deleteSupplier(id) {
  const sup = appState.suppliers.find(s => s.id === id || s.name === id || s.code === id);
  const name = sup ? sup.name : id;
  const targetId = sup ? (sup.id || sup.name) : id;

  if (confirm(`${name} firmasını silmek istediğinize emin misiniz?`)) {
    // 1. Önce hafızadaki listeden anında çıkar
    appState.suppliers = appState.suppliers.filter(s => s.id !== targetId && s.name !== name && s.name !== id);
    
    // 2. Modalları anında kapat
    closeSupplierModal();
    closeSupplierHistoryModal();

    // 3. Arayüzü beklemeden hemen çiz
    renderSuppliers();
    renderDashboard();
    populateSupplierDropdowns();

    // 4. Veritabanından sil
    await window.dbService.deleteSupplier(targetId);

    // 5. Güncel verileri çek ve tekrar çiz
    await loadAllData();
    renderSuppliers();
    renderDashboard();
    populateSupplierDropdowns();

    showToast(`${name} başarıyla silindi.`);
  }
}

// ==================== IMAGE OPTIMIZATION & COMPRESSION HELPER ====================
function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return '0 KB';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

async function compressImageFile(file, maxWidth = 1280, maxHeight = 1280, quality = 0.82) {
  return new Promise((resolve) => {
    if (!file) return resolve({ base64: '', sizeFormatted: '', type: '', name: '' });
    
    // PDF ise canvas'a sokmadan doğrudan Data URL oku
    if (file.type === 'application/pdf' || file.name?.toLowerCase().endsWith('.pdf')) {
      const reader = new FileReader();
      reader.onload = (e) => resolve({
        base64: e.target.result,
        sizeFormatted: formatBytes(file.size),
        type: 'pdf',
        name: file.name
      });
      reader.onerror = () => resolve({ base64: '', sizeFormatted: '', type: 'pdf', name: file.name });
      reader.readAsDataURL(file);
      return;
    }

    // Resim dosyalarını Canvas ile 1280px max boyuta küçült ve JPEG 0.82 kalitede sıkıştır (ortalama ~70KB)
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
          const approxBytes = Math.round((compressedBase64.length * 3) / 4);
          
          resolve({
            base64: compressedBase64,
            sizeFormatted: formatBytes(approxBytes),
            type: 'image',
            name: file.name || 'gorsel.jpg'
          });
        } catch (err) {
          console.warn('Canvas sıkıştırma hatası, ham veri dönülüyor:', err);
          resolve({
            base64: e.target.result,
            sizeFormatted: formatBytes(file.size),
            type: 'image',
            name: file.name || 'gorsel.jpg'
          });
        }
      };
      img.onerror = () => {
        resolve({
          base64: e.target.result,
          sizeFormatted: formatBytes(file.size),
          type: 'image',
          name: file.name || 'gorsel.jpg'
        });
      };
      img.src = e.target.result;
    };
    reader.onerror = () => resolve({ base64: '', sizeFormatted: '', type: 'image', name: file.name });
    reader.readAsDataURL(file);
  });
}

function setupDragAndDropAndPasteListeners() {
  // 1. WeChat / WhatsApp Ekran Görüntüsü İçin Global Pano (Ctrl+V / Cmd+V) Yakalayıcı
  window.addEventListener('paste', async (e) => {
    const items = (e.clipboardData || window.clipboardData)?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type && items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (!blob) continue;

        const detailModal = document.getElementById('requestDetailModal');
        const isDetailModalOpen = detailModal && !detailModal.classList.contains('hidden');
        
        const result = await compressImageFile(blob);
        if (!result.base64) continue;

        if (isDetailModalOpen) {
          currentEditingRequestImage = result.base64;
          renderRequestDetailImage();
          showToast('📷 Panodan kopyalanan ekran görüntüsü talep detayına eklendi!');
        } else {
          document.getElementById('formReqChatImageBase64').value = result.base64;
          document.getElementById('formReqImagePreview').src = result.base64;
          document.getElementById('formReqImageFileName').textContent = 'Pano-Ekran-Goruntusu.jpg';
          const sizeEl = document.getElementById('formReqImageFileSize');
          if (sizeEl) sizeEl.textContent = `(${result.sizeFormatted})`;
          document.getElementById('formReqUploadPrompt').classList.add('hidden');
          document.getElementById('formReqImagePreviewContainer').classList.remove('hidden');
          showToast('📷 Panodan kopyalanan ekran görüntüsü form alanına eklendi!');
        }
        break;
      }
    }
  });

  // 2. Form Görsel Sürükle-Bırak (Drag & Drop)
  const imgDropzone = document.getElementById('formReqImageDropzone');
  if (imgDropzone) {
    ['dragenter', 'dragover'].forEach(eventName => {
      imgDropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        imgDropzone.classList.add('border-blue-500', 'bg-blue-50');
      }, false);
    });
    ['dragleave', 'drop'].forEach(eventName => {
      imgDropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        imgDropzone.classList.remove('border-blue-500', 'bg-blue-50');
      }, false);
    });
    imgDropzone.addEventListener('drop', async (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files && files.length > 0) {
        await processFormImageFile(files[0]);
      }
    });
  }

  // 3. Talep Detayı Modal Görsel Sürükle-Bırak
  const reqDetImgDropzone = document.getElementById('reqDetImageDropzone');
  if (reqDetImgDropzone) {
    ['dragenter', 'dragover'].forEach(eventName => {
      reqDetImgDropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        reqDetImgDropzone.classList.add('border-blue-500', 'bg-blue-50');
      }, false);
    });
    ['dragleave', 'drop'].forEach(eventName => {
      reqDetImgDropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        reqDetImgDropzone.classList.remove('border-blue-500', 'bg-blue-50');
      }, false);
    });
    reqDetImgDropzone.addEventListener('drop', async (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files && files.length > 0) {
        const result = await compressImageFile(files[0]);
        if (result.base64) {
          currentEditingRequestImage = result.base64;
          renderRequestDetailImage();
          showToast('✓ Görsel seçildi. "Değişiklikleri Kaydet" ile onaylayın.');
        }
      }
    });
  }

  // 4. Form Proforma Sürükle-Bırak
  const profDropzone = document.getElementById('formReqProformaDropzone');
  if (profDropzone) {
    ['dragenter', 'dragover'].forEach(eventName => {
      profDropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        profDropzone.classList.add('border-amber-500', 'bg-amber-100/50');
      }, false);
    });
    ['dragleave', 'drop'].forEach(eventName => {
      profDropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        profDropzone.classList.remove('border-amber-500', 'bg-amber-100/50');
      }, false);
    });
    profDropzone.addEventListener('drop', async (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files && files.length > 0) {
        await processFormProformaFile(files[0]);
      }
    });
  }
}

// ==================== 6. YENİ TALEP, GÖRSEL VE PROFORMA İŞLEMLERİ ====================
async function processFormImageFile(file) {
  if (!file) return;
  const result = await compressImageFile(file);
  if (!result.base64) return;

  document.getElementById('formReqChatImageBase64').value = result.base64;
  document.getElementById('formReqImagePreview').src = result.base64;
  document.getElementById('formReqImageFileName').textContent = file.name || 'gorsel.jpg';
  const sizeEl = document.getElementById('formReqImageFileSize');
  if (sizeEl) sizeEl.textContent = `(${result.sizeFormatted})`;
  document.getElementById('formReqUploadPrompt').classList.add('hidden');
  document.getElementById('formReqImagePreviewContainer').classList.remove('hidden');
  showToast('✓ Görsel eklendi ve optimize edildi.');
}

async function handleRequestImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  await processFormImageFile(file);
}

function removeRequestUploadedImage() {
  const fileInput = document.getElementById('formReqChatImageFile');
  if (fileInput) fileInput.value = '';
  document.getElementById('formReqChatImageBase64').value = '';
  document.getElementById('formReqImagePreview').src = '';
  document.getElementById('formReqUploadPrompt').classList.remove('hidden');
  document.getElementById('formReqImagePreviewContainer').classList.add('hidden');
}

function toggleFormProformaSection(stageStep) {
  const section = document.getElementById('formReqProformaSection');
  if (!section) return;
  if (parseInt(stageStep) === 2) {
    section.classList.add('ring-2', 'ring-amber-400', 'bg-amber-100/40');
  } else {
    section.classList.remove('ring-2', 'ring-amber-400', 'bg-amber-100/40');
  }
}

async function processFormProformaFile(file) {
  if (!file) return;
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  const result = await compressImageFile(file);
  if (!result.base64) return;

  document.getElementById('formReqProformaBase64').value = result.base64;
  document.getElementById('formReqProformaFileName').value = file.name;
  document.getElementById('formReqProformaFileType').value = isPdf ? 'pdf' : 'image';
  document.getElementById('formReqProformaDispName').textContent = file.name;

  const iconEl = document.getElementById('formReqProformaIcon');
  if (iconEl) iconEl.textContent = isPdf ? 'picture_as_pdf' : 'image';

  document.getElementById('formReqProformaPrompt').classList.add('hidden');
  document.getElementById('formReqProformaPreviewContainer').classList.remove('hidden');
  showToast(`✓ Proforma belgesi eklendi (${isPdf ? 'PDF' : 'Görsel'})`);
}

async function handleFormProformaUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  await processFormProformaFile(file);
}

function removeFormProforma() {
  const fileInput = document.getElementById('formReqProformaFile');
  if (fileInput) fileInput.value = '';
  document.getElementById('formReqProformaBase64').value = '';
  document.getElementById('formReqProformaFileName').value = '';
  document.getElementById('formReqProformaFileType').value = '';
  document.getElementById('formReqProformaPrompt').classList.remove('hidden');
  document.getElementById('formReqProformaPreviewContainer').classList.add('hidden');
}

async function handleSimpleRequestSubmit(e) {
  e.preventDefault();
  const company = document.getElementById('formReqCompany').value;
  const supplier_name = document.getElementById('formReqSupplier').value;
  const part_name = document.getElementById('formReqPart').value.trim();
  const quantity = parseInt(document.getElementById('formReqQty').value) || 1;
  const priority = document.getElementById('formReqPriority').value;
  const stage_step = parseInt(document.getElementById('formReqStage').value) || 1;
  const stage_label = getStageInfo(stage_step).label;
  const supply_channel = document.querySelector('input[name="formReqChannel"]:checked')?.value || 'HSG Çin';
  const notes = document.getElementById('formReqNotes').value.trim();
  
  const chat_image = document.getElementById('formReqChatImageBase64').value || '';
  const proforma_file = document.getElementById('formReqProformaBase64').value || '';
  const proforma_name = document.getElementById('formReqProformaFileName').value || '';
  const proforma_type = document.getElementById('formReqProformaFileType').value || (proforma_file.includes('application/pdf') ? 'pdf' : (proforma_file ? 'image' : ''));
  const proforma_no = document.getElementById('formReqProformaNo').value.trim();
  const proforma_amount = document.getElementById('formReqProformaAmount').value.trim();

  // 2. adım veya sonraki adımlarda proforma yükleme zorunluluğu
  if (stage_step >= 2 && !proforma_file) {
    alert('⚠️ 2. Adım veya sonraki aşamalarda talep oluşturabilmek için Tedarikçi Proforma Faturası yüklenmesi zorunludur!\n\nLütfen formu kaydetmeden önce "2. Adım: Tedarikçi Proforma Faturası" alanından PDF veya görsel proforma yükleyiniz.');
    const section = document.getElementById('formReqProformaSection');
    if (section) section.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  // Kayıt onay sorusu
  const confirmMsg = `Yeni parça talebini oluşturmak ve kaydetmek istediğinize emin misiniz?\n\n` +
    `• Parça: ${part_name}\n` +
    `• Miktar: ${quantity} Adet\n` +
    `• Tedarikçi: ${supplier_name}\n` +
    `• Aşama: ${stage_step}. Adım (${stage_label})\n\n` +
    `Onaylıyor musunuz?`;

  if (!confirm(confirmMsg)) {
    showToast('Talep oluşturma işlemi iptal edildi.');
    return;
  }

  const nowPrecise = formatPreciseDateTime(new Date());
  const initialLogs = [
    {
      id: 'log-' + Date.now() + '-1',
      timestamp: nowPrecise.iso,
      date_formatted: nowPrecise.date,
      time_formatted: nowPrecise.time,
      action_title: '1. Adım: Talep Başlatıldı / Mesaj Bekleniyor',
      action_desc: `${company} adına ${supplier_name} tedarikçisinden ${quantity} adet "${part_name}" sipariş talebi oluşturuldu.`
    }
  ];

  if (chat_image) {
    initialLogs.push({
      id: 'log-' + Date.now() + '-img',
      timestamp: nowPrecise.iso,
      date_formatted: nowPrecise.date,
      time_formatted: nowPrecise.time,
      action_title: 'Sohbet / Parça Görseli Kaydedildi',
      action_desc: 'Talep kartına parça ekran görüntüsü / teknik görseli eklendi.'
    });
  }

  if (stage_step >= 2 || proforma_file) {
    initialLogs.push({
      id: 'log-' + Date.now() + '-2',
      timestamp: nowPrecise.iso,
      date_formatted: nowPrecise.date,
      time_formatted: nowPrecise.time,
      action_title: '2. Adım: Tedarikçi Onayladı & Hazırlanıyor' + (proforma_file ? ' (Proforma Eklendi)' : ''),
      action_desc: proforma_file 
        ? `Tedarikçi proforma faturası (${proforma_no || '-'}, Tutar: ${proforma_amount || '-'}) eklendi.`
        : 'Tedarikçi siparişi onayladı ve hazırlık aşamasına alındı.'
    });
  }

  const created = await window.dbService.addRequest({
    company,
    supplier_name,
    part_sku: 'SKU-' + Math.floor(1000 + Math.random() * 9000),
    part_name,
    quantity,
    priority,
    supply_channel,
    stage_step,
    stage_label,
    notes,
    chat_image,
    proforma_file,
    proforma_name,
    proforma_type,
    proforma_no,
    proforma_amount,
    activity_log: initialLogs
  });

  document.getElementById('simpleRequestForm').reset();
  removeRequestUploadedImage();
  removeFormProforma();
  
  await loadAllData();
  renderDashboard();
  showToast(`Talep oluşturuldu (${created.request_no} - ${supplier_name})`);
  setTimeout(() => navigateTo('kontrol-paneli'), 400);
}

// ==================== 7. TALEP DETAY MODALI VE DURUM TAKİP SİSTEMİ ====================
let currentViewingRequestId = '';
let currentRequestSavedBaseStage = 1; // Kayıtlı mevcut aşama (Geriye dönüşü engellemek için taban adım)
let currentEditingRequestStage = 1;
let currentEditingRequestImage = '';
let currentEditingRequestProforma = {
  file: '',
  name: '',
  type: '',
  no: '',
  amount: '',
  notes: '',
  date: ''
};

// Talep için varsayılan kronolojik adım adım işlem geçmişi üretici
function generateDefaultActivityLog(req) {
  const currentStep = parseInt(req.stage_step) || 1;
  const createdDateObj = req.created_at ? new Date(req.created_at) : new Date(Date.now() - 3600000 * 24);
  const createdPrecise = formatPreciseDateTime(createdDateObj);
  const logs = [];

  // 1. Adım: Talep Oluşturma Kaydı
  logs.push({
    id: 'log-' + (req.id || 'req') + '-1',
    timestamp: req.created_at || createdDateObj.toISOString(),
    date_formatted: createdPrecise.date,
    time_formatted: req.created_at_time ? `${req.created_at_time}:12.104` : createdPrecise.time,
    action_title: '1. Adım: Talep Açıldı / Mesaj Bekleniyor',
    action_desc: `${req.company || 'Sunton Makine'} adına ${req.supplier_name || 'Tedarikçi'} için ${req.quantity || 1} adet "${req.part_name || 'Parça'}" talebi sisteme girildi.`
  });

  // Ekli Görsel Varsa
  if (req.chat_image) {
    const imgTime = new Date(createdDateObj.getTime() + 1000 * 60 * 6);
    const imgPrecise = formatPreciseDateTime(imgTime);
    logs.push({
      id: 'log-' + (req.id || 'req') + '-img',
      timestamp: imgPrecise.iso,
      date_formatted: imgPrecise.date,
      time_formatted: imgPrecise.time,
      action_title: 'Sohbet / Parça Görseli Kaydedildi',
      action_desc: 'WeChat / WhatsApp üzerinden iletilen parça teknik çizimi veya etiket fotoğrafı talep kartına eklendi.'
    });
  }

  // 2. Adım: Proforma ve Tedarikçi Onayı
  if (currentStep >= 2 || req.proforma_file) {
    const step2Time = new Date(createdDateObj.getTime() + 1000 * 60 * 48);
    const step2Precise = formatPreciseDateTime(step2Time);
    const profDesc = req.proforma_file 
      ? `Tedarikçi siparişi onayladı ve Proforma Faturasını (${req.proforma_no || 'PI-2026-4412'}, Tutar: ${req.proforma_amount || '$3,850 USD'}) sisteme iletti.`
      : 'Tedarikçi parça stoğunu ve üretim hazırlığını onayladı.';
    logs.push({
      id: 'log-' + (req.id || 'req') + '-2',
      timestamp: step2Precise.iso,
      date_formatted: step2Precise.date,
      time_formatted: step2Precise.time,
      action_title: '2. Adım: Tedarikçi Onayladı & Hazırlanıyor' + (req.proforma_file ? ' (Proforma Eklendi)' : ''),
      action_desc: profDesc
    });
  }

  // 3. Adım: Çin Çıkış
  if (currentStep >= 3) {
    const step3Time = new Date(createdDateObj.getTime() + 1000 * 60 * 60 * 7);
    const step3Precise = formatPreciseDateTime(step3Time);
    logs.push({
      id: 'log-' + (req.id || 'req') + '-3',
      timestamp: step3Precise.iso,
      date_formatted: step3Precise.date,
      time_formatted: step3Precise.time,
      action_title: "3. Adım: Çin Fabrikadan Çıkış / Paketleme Tamamlandı",
      action_desc: "Tedarikçi fabrikanın paketleme ve ihracat kalite kontrol sürecini tamamladı. Çin ana lojistik merkezine teslim bekleniyor."
    });
  }

  // 4. Adım: Sevkiyatta / Yolda
  if (currentStep >= 4) {
    const step4Time = new Date(createdDateObj.getTime() + 1000 * 60 * 60 * 19);
    const step4Precise = formatPreciseDateTime(step4Time);
    logs.push({
      id: 'log-' + (req.id || 'req') + '-4',
      timestamp: step4Precise.iso,
      date_formatted: step4Precise.date,
      time_formatted: step4Precise.time,
      action_title: '4. Adım: Uluslararası Sevkiyatta / Gemiye Yüklendi',
      action_desc: 'Konteyner limanda gemiye/uçağa yüklendi. Sevkiyat Türkiye rotasında hareket halinde.'
    });
  }

  // 5. Adım: TR Gümrük
  if (currentStep >= 5) {
    const step5Time = new Date(createdDateObj.getTime() + 1000 * 60 * 60 * 38);
    const step5Precise = formatPreciseDateTime(step5Time);
    logs.push({
      id: 'log-' + (req.id || 'req') + '-5',
      timestamp: step5Precise.iso,
      date_formatted: step5Precise.date,
      time_formatted: step5Precise.time,
      action_title: "5. Adım: Türkiye'de / Gümrük İşlemleri Başladı",
      action_desc: 'Kargo İstanbul Ambarlı / Havalimanı gümrük sahasına ulaştı, beyanname ve ithalat işlemleri devam ediyor.'
    });
  }

  // 6. Adım: Teslim Edildi
  if (currentStep >= 6) {
    const step6Time = new Date(createdDateObj.getTime() + 1000 * 60 * 60 * 52);
    const step6Precise = formatPreciseDateTime(step6Time);
    logs.push({
      id: 'log-' + (req.id || 'req') + '-6',
      timestamp: step6Precise.iso,
      date_formatted: step6Precise.date,
      time_formatted: step6Precise.time,
      action_title: '6. Adım: Merkez Depo Teslim Edildi / Tamamlandı',
      action_desc: 'Parça sağlam ve eksiksiz şekilde ana merkez deposuna teslim alındı, stok kayıtları güncellendi.'
    });
  }

  return logs;
}

function renderRequestDetailTimeline(req) {
  const container = document.getElementById('reqDetTimelineContainer');
  const countBadge = document.getElementById('reqDetTimelineCount');
  if (!container) return;

  let logs = req.activity_log;
  if (!Array.isArray(logs) || logs.length === 0) {
    logs = generateDefaultActivityLog(req);
    req.activity_log = logs;
  }

  if (countBadge) {
    countBadge.textContent = `${logs.length} İşlem Kaydı`;
  }

  // En son yapılan işlem en üstte görünecek şekilde sırala
  const sortedLogs = [...logs].reverse();

  container.innerHTML = sortedLogs.map((log, index) => {
    const isLatest = index === 0;

    let icon = 'schedule';
    if (log.action_title.includes('6. Adım')) icon = 'verified';
    else if (log.action_title.includes('5. Adım')) icon = 'flag';
    else if (log.action_title.includes('4. Adım')) icon = 'directions_boat';
    else if (log.action_title.includes('3. Adım')) icon = 'flight_takeoff';
    else if (log.action_title.includes('2. Adım') || log.action_title.includes('Proforma')) icon = 'description';
    else if (log.action_title.includes('Görsel')) icon = 'image';
    else if (log.action_title.includes('1. Adım')) icon = 'chat';

    return `
      <div class="relative pl-7 group">
        <!-- İkon Çemberi -->
        <div class="absolute left-0 top-1.5 w-6 h-6 rounded-full ${isLatest ? 'bg-blue-600 text-white shadow-md ring-4 ring-blue-100' : 'bg-slate-200 text-slate-700'} flex items-center justify-center -translate-x-1/2">
          <span class="material-symbols-outlined text-[13px]">${icon}</span>
        </div>

        <div class="bg-white p-3 rounded-xl border ${isLatest ? 'border-blue-300 shadow-xs ring-1 ring-blue-100' : 'border-slate-200'} transition-all hover:border-slate-300">
          <div class="flex items-start justify-between gap-2 mb-1 flex-wrap">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="text-xs font-bold text-slate-900">${log.action_title}</span>
              ${isLatest ? '<span class="text-[9px] font-extrabold uppercase px-1.5 py-0.2 bg-blue-600 text-white rounded">SON İŞLEM</span>' : ''}
            </div>
            <div class="text-[11px] font-mono font-bold text-slate-600 flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
              <span>📅 ${log.date_formatted || '-'}</span>
              <span class="text-blue-700 font-semibold">⏰ ${log.time_formatted || '-'}</span>
            </div>
          </div>
          <div class="text-xs text-slate-600 leading-relaxed">${log.action_desc || ''}</div>
        </div>
      </div>
    `;
  }).join('');
}

function openRequestDetailModal(idOrNo) {
  const req = appState.requests.find(r => r.id === idOrNo || r.request_no === idOrNo);
  if (!req) return;

  currentViewingRequestId = req.id || req.request_no;
  currentRequestSavedBaseStage = parseInt(req.stage_step) || 1; // Kayıtlı mevcut aşama (Geriye dönüşü engelleyen sınır)
  currentEditingRequestStage = currentRequestSavedBaseStage;
  currentEditingRequestImage = req.chat_image || '';
  currentEditingRequestProforma = {
    file: req.proforma_file || '',
    name: req.proforma_name || '',
    type: req.proforma_type || (req.proforma_file?.includes('application/pdf') ? 'pdf' : (req.proforma_file ? 'image' : '')),
    no: req.proforma_no || '',
    amount: req.proforma_amount || '',
    notes: req.proforma_notes || '',
    date: req.proforma_date || ''
  };

  const dt = getRequestCreatedDateTimeFormatted(req);

  document.getElementById('reqDetId').value = req.id || req.request_no;
  document.getElementById('reqDetNo').textContent = req.request_no;
  document.getElementById('reqDetCompany').textContent = req.company || 'Sunton Makine';
  document.getElementById('reqDetDate').textContent = dt.date;
  document.getElementById('reqDetTime').textContent = dt.time;
  document.getElementById('reqDetChannel').textContent = req.supply_channel || 'HSG Çin';
  
  const priorityBadge = document.getElementById('reqDetPriorityBadge');
  priorityBadge.textContent = req.priority || 'Normal';
  priorityBadge.className = `text-xs px-2.5 py-0.5 rounded-full font-bold ${
    req.priority === 'Kritik' ? 'bg-red-100 text-red-700 border border-red-200' :
    (req.priority === 'Acil' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-blue-50 text-blue-700 border border-blue-200')
  }`;

  document.getElementById('reqDetPartName').textContent = req.part_name;
  document.getElementById('reqDetSupplier').textContent = req.supplier_name;
  document.getElementById('reqDetSku').textContent = req.part_sku;
  document.getElementById('reqDetQty').textContent = `${req.quantity} Adet`;
  document.getElementById('reqDetNotes').value = req.notes || '';

  renderRequestDetailSteppers();
  renderRequestDetailImage();
  renderRequestDetailProforma();
  renderRequestDetailTimeline(req);

  document.getElementById('requestDetailModal').classList.remove('hidden');
}

function renderRequestDetailSteppers() {
  const container = document.getElementById('reqDetStepperContainer');
  if (!container) return;

  const currentStageInfo = getStageInfo(currentEditingRequestStage);
  const stageTextEl = document.getElementById('reqDetCurrentStageText');
  if (stageTextEl) stageTextEl.textContent = `Mevcut Aşama: ${currentStageInfo.label}`;

  const hasProforma = !!(currentEditingRequestProforma && currentEditingRequestProforma.file);
  const baseStep = currentRequestSavedBaseStage || 1;

  container.innerHTML = REQUEST_STAGES.map(stage => {
    const isCurrentActive = stage.step === currentEditingRequestStage;
    const isPastLocked = stage.step < baseStep; // Daha önce tamamlanmış, geriye dönülemez kilitli adım
    const isPassedInPreview = stage.step < currentEditingRequestStage && stage.step >= baseStep;
    const isLockedWithoutProforma = stage.step > 2 && !hasProforma;

    let btnClass = 'bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 cursor-pointer';
    let badgeHtml = `<span class="text-[8.5px] text-blue-600 font-bold">İLERİ ➔</span>`;
    let iconName = stage.icon;
    let iconColor = 'text-slate-400';

    if (isCurrentActive) {
      btnClass = 'bg-blue-600 text-white border-blue-600 shadow-md font-bold ring-2 ring-blue-300 cursor-default';
      badgeHtml = `<span class="text-[8.5px] font-extrabold uppercase px-1.5 py-0.2 bg-white/20 text-white rounded">AKTİF</span>`;
      iconColor = 'text-white';
    } else if (isPastLocked) {
      btnClass = 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed opacity-80';
      badgeHtml = `<span class="text-[8.5px] font-bold text-slate-600 bg-slate-200 px-1.5 py-0.2 rounded border border-slate-300">🔒 KİLİTLİ</span>`;
      iconName = 'check_circle';
      iconColor = 'text-emerald-600';
    } else if (isPassedInPreview) {
      btnClass = 'bg-emerald-50 text-emerald-800 border-emerald-300 font-medium cursor-pointer';
      badgeHtml = `<span class="text-[8.5px] font-bold text-emerald-700 bg-emerald-100 px-1 py-0.2 rounded">✓ GEÇİLDİ</span>`;
      iconName = 'check_circle';
      iconColor = 'text-emerald-600';
    } else if (isLockedWithoutProforma) {
      btnClass = 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed opacity-75';
      badgeHtml = `<span class="text-[8.5px] text-amber-600 font-bold">🔒 Proforma Gerekli</span>`;
      iconName = 'lock';
      iconColor = 'text-amber-500';
    }

    return `
      <button type="button" class="p-2.5 rounded-xl border text-left flex items-start gap-2 transition-all ${btnClass}" onclick="setRequestDetailStage(${stage.step})" title="${isPastLocked ? 'Bu aşama daha önce tamamlanmıştır ve geriye dönülemez (Kilitli)' : (isLockedWithoutProforma ? '2. Adımda Proforma Faturası yüklenmeden bu adıma geçilemez' : '')}">
        <span class="material-symbols-outlined text-[18px] shrink-0 mt-0.5 ${iconColor}">
          ${iconName}
        </span>
        <div class="leading-tight flex-1 min-w-0">
          <div class="text-[10px] font-bold uppercase tracking-wider flex items-center justify-between gap-1">
            <span>${stage.step}. Adım</span>
            ${badgeHtml}
          </div>
          <div class="text-xs font-semibold mt-0.5 truncate">${stage.short}</div>
        </div>
      </button>
    `;
  }).join('');
}

function setRequestDetailStage(step) {
  const targetStep = parseInt(step);
  const baseStep = currentRequestSavedBaseStage || 1;
  const hasProforma = !!(currentEditingRequestProforma && currentEditingRequestProforma.file);

  // 1. KURAL: Geriye Dönüş Kesinlikle Kilitli! Tamamlanan önceki aşamalara asla dönülemez
  if (targetStep < baseStep) {
    showToast(`🔒 Güvenlik Kuralı: ${targetStep}. Adım daha önce tamamlanmıştır ve geriye dönülemez! Süreç yalnızca ileriye doğru ilerleyebilir.`);
    return;
  }

  if (targetStep === currentEditingRequestStage) {
    return;
  }

  // 2. KURAL: 2. Adımda proforma yüklemesi gereksin. Yüklemeden adım atmasın kuralı
  if (targetStep > 2 && !hasProforma) {
    showToast('⚠️ 2. Adımda Proforma Faturası yüklenmeden sonraki adımlara geçilemez! Lütfen önce proforma faturasını yükleyiniz.');
    currentEditingRequestStage = Math.max(2, baseStep);
    renderRequestDetailSteppers();
    renderRequestDetailProforma();

    const section = document.getElementById('reqDetProformaSection');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'center' });
      section.classList.add('ring-4', 'ring-amber-400');
      setTimeout(() => section.classList.remove('ring-4', 'ring-amber-400'), 1500);
    }
    return;
  }

  currentEditingRequestStage = targetStep;
  renderRequestDetailSteppers();
  renderRequestDetailProforma(); // Aşama değiştikçe proforma kilitlenme durumunu interaktif güncelle!
}

function renderRequestDetailImage() {
  const container = document.getElementById('reqDetImageContainer');
  const thumb = document.getElementById('reqDetImageThumb');
  const statusEl = document.getElementById('reqDetImageStatus');
  const btnRemove = document.getElementById('btnReqDetRemoveImg');

  if (currentEditingRequestImage) {
    thumb.src = currentEditingRequestImage;
    container.classList.remove('hidden');
    statusEl.textContent = '✓ 1 Görsel Ekli';
    statusEl.className = 'text-[11px] text-emerald-600 font-bold';
    btnRemove.classList.remove('hidden');
  } else {
    thumb.src = '';
    container.classList.add('hidden');
    statusEl.textContent = 'Ekli Görsel Yok';
    statusEl.className = 'text-[11px] text-slate-400';
    btnRemove.classList.add('hidden');
  }
}

async function handleRequestDetailImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const result = await compressImageFile(file);
  if (!result.base64) return;

  currentEditingRequestImage = result.base64;
  renderRequestDetailImage();
  showToast('✓ Yeni görsel seçildi. "Değişiklikleri Kaydet" ile onaylayın.');
}

function removeRequestDetailImage() {
  currentEditingRequestImage = '';
  const input = document.getElementById('reqDetUploadInput');
  if (input) input.value = '';
  renderRequestDetailImage();
  showToast('Görsel kaldırıldı. "Değişiklikleri Kaydet" ile onaylayın.');
}

// 2. Adım Proforma Faturası Yükleme & Kesin Kilitleme Sistemi
function renderRequestDetailProforma() {
  const card = document.getElementById('reqDetProformaCard');
  const badge = document.getElementById('reqDetProformaStatusBadge');
  const nameEl = document.getElementById('reqDetProformaName');
  const noBadge = document.getElementById('reqDetProformaNoBadge');
  const amtBadge = document.getElementById('reqDetProformaAmountBadge');
  const dateBadge = document.getElementById('reqDetProformaDateBadge');
  const btnRemove = document.getElementById('btnReqDetRemoveProforma');
  const btnUpload = document.getElementById('btnReqDetProformaUpload');
  const uploadText = document.getElementById('btnReqDetProformaUploadText');
  const iconEl = document.getElementById('reqDetProformaTypeIcon');

  const noInput = document.getElementById('reqDetProformaNoInput');
  const amtInput = document.getElementById('reqDetProformaAmountInput');
  const noticeBox = document.getElementById('reqDetProformaStepNotice');
  const noticeText = document.getElementById('reqDetProformaStepNoticeText');
  const noticeBadge = document.getElementById('reqDetProformaStepNoticeBadge');
  const proformaSection = document.getElementById('reqDetProformaSection');

  const stage = currentEditingRequestStage;
  const hasFile = !!(currentEditingRequestProforma && currentEditingRequestProforma.file);
  const isPdf = hasFile && (currentEditingRequestProforma.type === 'pdf' || currentEditingRequestProforma.name?.toLowerCase().endsWith('.pdf') || currentEditingRequestProforma.file.includes('application/pdf'));

  // 1. Proforma Ekli Belge Kartı
  if (hasFile) {
    card.classList.remove('hidden');
    badge.textContent = `✓ PROFORMA EKLİ (${isPdf ? 'PDF' : 'GÖRSEL'})`;
    badge.className = 'text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300';
    
    nameEl.textContent = currentEditingRequestProforma.name || (isPdf ? 'proforma.pdf' : 'proforma.jpg');
    
    if (currentEditingRequestProforma.no) {
      noBadge.textContent = `No: ${currentEditingRequestProforma.no}`;
      noBadge.classList.remove('hidden');
    } else {
      noBadge.classList.add('hidden');
    }

    if (currentEditingRequestProforma.amount) {
      amtBadge.textContent = `Tutar: ${currentEditingRequestProforma.amount}`;
      amtBadge.classList.remove('hidden');
    } else {
      amtBadge.classList.add('hidden');
    }

    dateBadge.textContent = currentEditingRequestProforma.date ? `📅 ${currentEditingRequestProforma.date}` : '';

    if (iconEl) {
      iconEl.innerHTML = isPdf 
        ? '<span class="material-symbols-outlined text-[24px] text-red-600">picture_as_pdf</span>'
        : '<span class="material-symbols-outlined text-[24px] text-blue-600">image</span>';
    }

    if (noInput) noInput.value = currentEditingRequestProforma.no || '';
    if (amtInput) amtInput.value = currentEditingRequestProforma.amount || '';
  } else {
    card.classList.add('hidden');
    badge.textContent = 'Ekli Belge Yok';
    badge.className = 'text-[11px] text-slate-400 font-normal';
    if (noInput) noInput.value = '';
    if (amtInput) amtInput.value = '';
  }

  // 2. AŞAMA KURALLARI: SADECE VE SADECE 2. ADIMDA YÜKLENİR / DEĞİŞTİRİLİR
  if (stage === 1) {
    // 1. ADIM: Henüz proforma aşaması değil
    if (noticeBox) {
      noticeBox.className = 'mb-3 p-2.5 rounded-lg text-xs flex items-center justify-between transition-all bg-slate-100 text-slate-700 border border-slate-200';
    }
    if (noticeText) {
      noticeText.innerHTML = '<span class="material-symbols-outlined text-[16px] text-slate-500">info</span><span>Proforma faturası <strong>2. Adım (Onaylandı & Hazırlanıyor)</strong> aşamasında tedarikçi tarafından iletilir ve yüklenir.</span>';
    }
    if (noticeBadge) {
      noticeBadge.className = 'text-[10px] font-bold uppercase px-1.5 py-0.5 rounded font-mono bg-slate-200 text-slate-700';
      noticeBadge.textContent = '2. ADIMDA AÇILIR';
    }
    if (proformaSection) {
      proformaSection.className = 'mb-5 p-4 bg-slate-50/70 rounded-xl border border-slate-200 transition-all relative';
    }

    if (noInput) {
      noInput.disabled = true;
      noInput.placeholder = 'Proforma No (2. Adımda aktifleşir)';
    }
    if (amtInput) {
      amtInput.disabled = true;
      amtInput.placeholder = 'Tutar (2. Adımda aktifleşir)';
    }

    if (btnUpload) btnUpload.classList.add('hidden');
    if (btnRemove) btnRemove.classList.add('hidden');

  } else if (stage === 2) {
    // 2. ADIM: TAM YETKİ - Proforma yüklenebilir, bilgileri değiştirilebilir
    if (noticeBox) {
      noticeBox.className = 'mb-3 p-2.5 rounded-lg text-xs flex items-center justify-between transition-all bg-amber-100 text-amber-900 border border-amber-300';
    }
    if (noticeText) {
      noticeText.innerHTML = '<span class="material-symbols-outlined text-[16px] text-amber-700">edit_document</span><span>⭐ <strong>2. AŞAMA AKTİF (ZORUNLU):</strong> Tedarikçiden gelen Proforma Faturasını (PDF veya görsel) bu adımda yükleyip tutar ve belge no bilgilerini kaydediniz.</span>';
    }
    if (noticeBadge) {
      noticeBadge.className = 'text-[10px] font-bold uppercase px-1.5 py-0.5 rounded font-mono bg-amber-200 text-amber-900 border border-amber-300';
      noticeBadge.textContent = '⭐ DÜZENLENEBİLİR';
    }
    if (proformaSection) {
      proformaSection.className = 'mb-5 p-4 bg-amber-50/70 rounded-xl border-2 border-amber-300 transition-all relative shadow-xs';
    }

    if (noInput) {
      noInput.disabled = false;
      noInput.placeholder = 'Proforma No (örn: PI-2026-4412)';
    }
    if (amtInput) {
      amtInput.disabled = false;
      amtInput.placeholder = 'Tutar (örn: $3,850 USD)';
    }

    if (btnUpload) {
      btnUpload.classList.remove('hidden');
      if (uploadText) uploadText.textContent = hasFile ? 'Proformayı Değiştir' : 'Proforma Faturası Yükle (PDF / Görsel)';
    }
    if (btnRemove) {
      if (hasFile) btnRemove.classList.remove('hidden');
      else btnRemove.classList.add('hidden');
    }

  } else {
    // 3., 4., 5., 6. ADIMLAR: PROFORMA KİLİTLİ (DEĞİŞTİRİLEMEZ / SİLİNEMEZ) - HER VAKİT İNCELENEBİLİR & İNDİRİLEBİLİR
    if (noticeBox) {
      noticeBox.className = 'mb-3 p-2.5 rounded-lg text-xs flex items-center justify-between transition-all ' + (hasFile ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-slate-100 text-slate-700 border border-slate-200');
    }
    if (noticeText) {
      noticeText.innerHTML = hasFile
        ? '<span class="material-symbols-outlined text-[16px] text-emerald-600">lock</span><span>🔒 <strong>Proforma Faturası Kilitli:</strong> 2. adım tamamlandığı için proforma belgesi dondurulmuştur ve değiştirilemez. Belgeyi yukarıdaki <strong>"İncele"</strong> veya <strong>"İndir"</strong> butonlarıyla dilediğiniz an görüntüleyebilirsiniz.</span>'
        : '<span class="material-symbols-outlined text-[16px] text-slate-500">lock</span><span>🔒 <strong>Proforma Alanı Kilitli:</strong> 2. adım geride kaldığı için yeni proforma yüklenemez. İhtiyaç halinde talebi 2. Adıma alarak belge ekleyebilirsiniz.</span>';
    }
    if (noticeBadge) {
      noticeBadge.className = 'text-[10px] font-bold uppercase px-1.5 py-0.5 rounded font-mono ' + (hasFile ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-200 text-slate-700');
      noticeBadge.textContent = '🔒 KİLİTLİ';
    }
    if (proformaSection) {
      proformaSection.className = 'mb-5 p-4 bg-slate-50 rounded-xl border border-slate-200 transition-all relative';
    }

    if (noInput) {
      noInput.disabled = true;
      noInput.placeholder = 'Proforma No (Kilitli)';
    }
    if (amtInput) {
      amtInput.disabled = true;
      amtInput.placeholder = 'Tutar (Kilitli)';
    }

    if (btnUpload) btnUpload.classList.add('hidden');
    if (btnRemove) btnRemove.classList.add('hidden');
  }
}

async function handleRequestDetailProformaUpload(event) {
  if (currentEditingRequestStage !== 2) {
    showToast('⚠️ Proforma faturası sadece ve sadece 2. Adımda (Onaylandı & Hazırlanıyor) yüklenebilir / değiştirilebilir!');
    if (event.target) event.target.value = '';
    return;
  }

  const file = event.target.files[0];
  if (!file) return;

  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  const result = await compressImageFile(file);
  if (!result.base64) return;

  const precise = formatPreciseDateTime(new Date());

  const noInputVal = document.getElementById('reqDetProformaNoInput')?.value.trim() || '';
  const amtInputVal = document.getElementById('reqDetProformaAmountInput')?.value.trim() || '';

  currentEditingRequestProforma = {
    file: result.base64,
    name: file.name,
    type: isPdf ? 'pdf' : 'image',
    no: noInputVal || currentEditingRequestProforma.no || '',
    amount: amtInputVal || currentEditingRequestProforma.amount || '',
    notes: '',
    date: `${precise.date}, ${precise.shortTime}`
  };

  renderRequestDetailProforma();
  renderRequestDetailSteppers(); // Proforma eklendiğinde sonraki adımların kilidi açılsın
  showToast('✓ Proforma belgesi seçildi. "Değişiklikleri Kaydet" butonuna basınız.');
}

function removeRequestDetailProforma() {
  if (currentEditingRequestStage !== 2) {
    showToast('⚠️ 2. adımdan sonraki aşamalarda proforma faturası silinemez veya değiştirilemez!');
    return;
  }

  currentEditingRequestProforma = {
    file: '',
    name: '',
    type: '',
    no: '',
    amount: '',
    notes: '',
    date: ''
  };
  const input = document.getElementById('reqDetProformaUploadInput');
  if (input) input.value = '';
  renderRequestDetailProforma();
  renderRequestDetailSteppers();
  showToast('Proforma belgesi kaldırıldı. "Değişiklikleri Kaydet" ile onaylayın.');
}

function closeRequestDetailModal() {
  document.getElementById('requestDetailModal').classList.add('hidden');
}

async function saveRequestDetailChanges() {
  const idOrNo = document.getElementById('reqDetId').value;
  const existing = appState.requests.find(r => r.id === idOrNo || r.request_no === idOrNo);
  const targetReqNo = existing ? existing.request_no : (idOrNo.startsWith('TR-') ? idOrNo : '');
  const targetId = existing ? existing.id : idOrNo;
  const notes = document.getElementById('reqDetNotes').value.trim();
  const stageInfo = getStageInfo(currentEditingRequestStage);

  // GÜVENLİK KONTROLÜ 1: Kayıtlı mevcut adımdan geriye dönülemez!
  if (currentEditingRequestStage < currentRequestSavedBaseStage) {
    alert(`🔒 Güvenlik Kuralı: Bu talep daha önce ${currentRequestSavedBaseStage}. Adıma ulaşmıştır. Geriye dönük aşama seçilemez ve kaydedilemez!`);
    currentEditingRequestStage = currentRequestSavedBaseStage;
    renderRequestDetailSteppers();
    return;
  }

  const proformaNo = document.getElementById('reqDetProformaNoInput')?.value.trim() || '';
  const proformaAmt = document.getElementById('reqDetProformaAmountInput')?.value.trim() || '';

  // Proforma sadece 2. adımda iken formdan güncellenir
  if (currentEditingRequestStage === 2 && currentEditingRequestProforma.file) {
    currentEditingRequestProforma.no = proformaNo;
    currentEditingRequestProforma.amount = proformaAmt;
  }

  const hasProf = !!(currentEditingRequestProforma && currentEditingRequestProforma.file);

  // GÜVENLİK KONTROLÜ 2: 2. Adımda proforma yüklenmesi zorunludur! Yüklemeden adım atılmasın ve kaydedilmesin!
  if (currentEditingRequestStage === 2 && !hasProf) {
    alert('⚠️ 2. Adımda (Tedarikçi Onayladı & Hazırlanıyor) Proforma Faturası yüklenmesi zorunludur!\n\nLütfen formu kaydetmeden önce 2. Adım bölümünden proforma faturasını (PDF veya görsel) yükleyiniz.');
    const profSection = document.getElementById('reqDetProformaSection');
    if (profSection) {
      profSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      profSection.classList.add('ring-4', 'ring-amber-400');
      setTimeout(() => profSection.classList.remove('ring-4', 'ring-amber-400'), 1500);
    }
    return;
  }

  if (currentEditingRequestStage > 2 && !hasProf) {
    alert(`⚠️ 2. Adımda Proforma Faturası yüklenmeden ${currentEditingRequestStage}. Adıma (${stageInfo.short}) geçilemez ve kaydedilemez!\n\nLütfen önce 2. Adımda proforma faturasını yükleyiniz.`);
    currentEditingRequestStage = Math.max(2, currentRequestSavedBaseStage);
    renderRequestDetailSteppers();
    renderRequestDetailProforma();
    return;
  }

  // ONAY PENCERESİ: Değişikliği kaydet dediğinde emin misin diye sorulsun!
  const partTitle = existing ? existing.part_name : (document.getElementById('reqDetPartName')?.textContent || 'Parça');
  const reqNumber = existing ? existing.request_no : (targetReqNo || '-');
  const stageTitle = `${currentEditingRequestStage}. Adım (${stageInfo.short})`;

  const confirmMsg = `Talep üzerinde yapılan değişiklikleri kaydetmek istediğinize emin misiniz?\n\n` +
    `• Talep No: ${reqNumber}\n` +
    `• Parça: ${partTitle}\n` +
    `• Yeni Aşama: ${stageTitle}\n` +
    `• Proforma Belgesi: ${hasProf ? (currentEditingRequestProforma.name || 'Ekli Belge') + (currentEditingRequestProforma.no ? ' (No: ' + currentEditingRequestProforma.no + ')' : '') : 'Yok'}\n\n` +
    `Bu işlemi onaylıyor musunuz?`;

  if (!confirm(confirmMsg)) {
    showToast('Kayıt işlemi iptal edildi.');
    return;
  }

  // Yalnızca onay verildikten sonra işlem kaydedilsin ve loglansın
  const previousStage = existing ? (parseInt(existing.stage_step) || 1) : 1;
  const previousStageInfo = getStageInfo(previousStage);
  const previousProformaFile = existing ? (existing.proforma_file || '') : '';
  const previousProformaNo = existing ? (existing.proforma_no || '') : '';
  const previousProformaAmt = existing ? (existing.proforma_amount || '') : '';
  const previousImage = existing ? (existing.chat_image || '') : '';
  const previousNotes = existing ? (existing.notes || '') : '';

  let currentLogs = existing && Array.isArray(existing.activity_log) && existing.activity_log.length > 0 
    ? [...existing.activity_log] 
    : generateDefaultActivityLog(existing || { id: targetId, request_no: targetReqNo, stage_step: previousStage });

  const nowPrecise = formatPreciseDateTime(new Date());

  // 1. Aşama Değişikliği Logu
  if (previousStage !== currentEditingRequestStage) {
    currentLogs.push({
      id: 'log-' + Date.now() + '-stg',
      timestamp: nowPrecise.iso,
      date_formatted: nowPrecise.date,
      time_formatted: nowPrecise.time,
      action_title: `${currentEditingRequestStage}. Adım: ${stageInfo.label}`,
      action_desc: `Talep aşaması "${previousStageInfo.label}" durumundan "${stageInfo.label}" durumuna güncellendi.`
    });
  }

  // 2. Proforma Değişikliği Logu (Sadece 2. Adımda yapılır)
  if (currentEditingRequestProforma.file && (!previousProformaFile || previousProformaFile !== currentEditingRequestProforma.file || previousProformaNo !== proformaNo || previousProformaAmt !== proformaAmt)) {
    currentLogs.push({
      id: 'log-' + Date.now() + '-prof',
      timestamp: nowPrecise.iso,
      date_formatted: nowPrecise.date,
      time_formatted: nowPrecise.time,
      action_title: '2. Adım: Tedarikçi Proforma Faturası Kaydedildi',
      action_desc: `Proforma Belgesi: ${currentEditingRequestProforma.name || 'proforma.pdf'} • Belge No: ${proformaNo || 'Belirtilmedi'} • Tutar: ${proformaAmt || 'Belirtilmedi'}`
    });
  } else if (!currentEditingRequestProforma.file && previousProformaFile) {
    currentLogs.push({
      id: 'log-' + Date.now() + '-prof-del',
      timestamp: nowPrecise.iso,
      date_formatted: nowPrecise.date,
      time_formatted: nowPrecise.time,
      action_title: '2. Adım: Proforma Faturası Kaldırıldı',
      action_desc: 'Ekli olan tedarikçi proforma belgesi silindi.'
    });
  }

  // 3. Görsel Değişikliği Logu
  if (currentEditingRequestImage && (!previousImage || previousImage !== currentEditingRequestImage)) {
    currentLogs.push({
      id: 'log-' + Date.now() + '-img',
      timestamp: nowPrecise.iso,
      date_formatted: nowPrecise.date,
      time_formatted: nowPrecise.time,
      action_title: 'Sohbet / Parça Görseli Güncellendi',
      action_desc: 'Talebe yeni WeChat/WhatsApp ekran görüntüsü veya parça fotoğrafı eklendi.'
    });
  } else if (!currentEditingRequestImage && previousImage) {
    currentLogs.push({
      id: 'log-' + Date.now() + '-img-del',
      timestamp: nowPrecise.iso,
      date_formatted: nowPrecise.date,
      time_formatted: nowPrecise.time,
      action_title: 'Sohbet / Parça Görseli Kaldırıldı',
      action_desc: 'Ekli olan görsel talep kartından silindi.'
    });
  }

  // 4. Görüşme Notu Değişikliği Logu
  if (notes !== previousNotes && notes.length > 0) {
    currentLogs.push({
      id: 'log-' + Date.now() + '-note',
      timestamp: nowPrecise.iso,
      date_formatted: nowPrecise.date,
      time_formatted: nowPrecise.time,
      action_title: 'Açıklama / Görüşme Notu Güncellendi',
      action_desc: `Not detayı: "${notes.length > 90 ? notes.substring(0, 90) + '...' : notes}"`
    });
  }

  // Taban adımı da güncelle (artık geriye dönülemez)
  currentRequestSavedBaseStage = currentEditingRequestStage;

  // Anında bellek durumunu güncelle
  if (existing) {
    existing.stage_step = currentEditingRequestStage;
    existing.stage_label = stageInfo.label;
    existing.notes = notes;
    existing.chat_image = currentEditingRequestImage;
    existing.proforma_file = currentEditingRequestProforma.file || '';
    existing.proforma_name = currentEditingRequestProforma.name || '';
    existing.proforma_type = currentEditingRequestProforma.type || '';
    existing.proforma_no = currentEditingRequestProforma.no || '';
    existing.proforma_amount = currentEditingRequestProforma.amount || '';
    existing.proforma_notes = currentEditingRequestProforma.notes || '';
    existing.proforma_date = currentEditingRequestProforma.date || '';
    existing.activity_log = currentLogs;
  }

  closeRequestDetailModal();

  await window.dbService.saveRequest({
    id: targetId,
    request_no: targetReqNo,
    stage_step: currentEditingRequestStage,
    stage_label: stageInfo.label,
    notes: notes,
    chat_image: currentEditingRequestImage,
    proforma_file: currentEditingRequestProforma.file || '',
    proforma_name: currentEditingRequestProforma.name || '',
    proforma_type: currentEditingRequestProforma.type || '',
    proforma_no: currentEditingRequestProforma.no || '',
    proforma_amount: currentEditingRequestProforma.amount || '',
    proforma_notes: currentEditingRequestProforma.notes || '',
    proforma_date: currentEditingRequestProforma.date || '',
    activity_log: currentLogs
  });

  await loadAllData();
  renderDashboard();
  showToast(`✓ Talep, ${currentEditingRequestStage}. aşama ve zaman günlüğü başarıyla kaydedildi.`);
}

async function deleteCurrentRequest() {
  const idOrNo = document.getElementById('reqDetId').value;
  const req = appState.requests.find(r => r.id === idOrNo || r.request_no === idOrNo);
  const title = req ? req.part_name : idOrNo;

  if (confirm(`"${title}" parça talebini silmek istediğinize emin misiniz?`)) {
    closeRequestDetailModal();
    appState.requests = appState.requests.filter(r => r.id !== idOrNo && r.request_no !== idOrNo);
    renderDashboard();

    await window.dbService.deleteRequest(idOrNo);
    await loadAllData();
    renderDashboard();
    showToast(`Talep başarıyla silindi.`);
  }
}

// ==================== 8. PROFORMA FATURA İNCELEME & GÖRÜNTÜLEME (MODAL ÇAKIŞMASI ÇÖZÜMÜ) ====================
let currentActiveViewingProforma = null;
let returnToRequestDetailModalOnClose = false;

function openProformaViewer(idOrNo) {
  const req = appState.requests.find(r => r.id === idOrNo || r.request_no === idOrNo);
  if (!req || !req.proforma_file) {
    if (req) {
      openRequestDetailModal(idOrNo);
      showToast('Bu talebe henüz proforma eklenmemiş. 2. Adıma geçerek ekleyebilirsiniz.');
    }
    return;
  }

  returnToRequestDetailModalOnClose = false;

  currentActiveViewingProforma = {
    file: req.proforma_file,
    name: req.proforma_name || `${req.request_no}_Proforma.pdf`,
    type: req.proforma_type || (req.proforma_file.includes('application/pdf') ? 'pdf' : 'image'),
    no: req.proforma_no || req.request_no,
    amount: req.proforma_amount || '',
    supplier: req.supplier_name || 'Tedarikçi',
    part: req.part_name || 'Parça'
  };

  displayProformaInViewerModal(currentActiveViewingProforma);
}

function openCurrentProformaViewer() {
  if (currentEditingRequestProforma && currentEditingRequestProforma.file) {
    const req = appState.requests.find(r => r.id === currentViewingRequestId || r.request_no === currentViewingRequestId);
    
    // Talep detay modalını arkada üst üste bindirmemek için gizle ve geri dönüş bayrağını aktif et
    const reqModal = document.getElementById('requestDetailModal');
    if (reqModal && !reqModal.classList.contains('hidden')) {
      reqModal.classList.add('hidden');
      returnToRequestDetailModalOnClose = true;
    } else {
      returnToRequestDetailModalOnClose = false;
    }

    currentActiveViewingProforma = {
      file: currentEditingRequestProforma.file,
      name: currentEditingRequestProforma.name || 'proforma_belgesi.pdf',
      type: currentEditingRequestProforma.type || (currentEditingRequestProforma.file.includes('application/pdf') ? 'pdf' : 'image'),
      no: currentEditingRequestProforma.no || document.getElementById('reqDetProformaNoInput')?.value.trim() || '-',
      amount: currentEditingRequestProforma.amount || document.getElementById('reqDetProformaAmountInput')?.value.trim() || '',
      supplier: req?.supplier_name || 'Tedarikçi',
      part: req?.part_name || 'Yedek Parça'
    };
    displayProformaInViewerModal(currentActiveViewingProforma);
  } else {
    showToast('Görüntülenecek proforma dosyası bulunamadı.');
  }
}

function displayProformaInViewerModal(prof) {
  if (!prof || !prof.file) return;

  document.getElementById('proformaModalTitle').textContent = prof.no ? `Proforma Fatura (${prof.no})` : 'Tedarikçi Proforma Faturası';
  document.getElementById('proformaModalNo').textContent = prof.no ? `No: ${prof.no}` : '';
  document.getElementById('proformaModalSupplier').textContent = prof.supplier;
  document.getElementById('proformaModalPart').textContent = prof.part;
  document.getElementById('proformaModalFileName').textContent = prof.name;

  const amtWrapper = document.getElementById('proformaModalAmountWrapper');
  const amtEl = document.getElementById('proformaModalAmount');
  if (prof.amount) {
    amtEl.textContent = prof.amount;
    amtWrapper.classList.remove('hidden');
  } else {
    amtWrapper.classList.add('hidden');
  }

  const pdfContainer = document.getElementById('proformaPdfContainer');
  const pdfIframe = document.getElementById('proformaPdfIframe');
  const imgContainer = document.getElementById('proformaImageContainer');
  const imgPreview = document.getElementById('proformaImagePreview');
  const emptyState = document.getElementById('proformaEmptyState');

  const isPdf = prof.type === 'pdf' || prof.file.includes('application/pdf') || prof.name?.toLowerCase().endsWith('.pdf');

  if (isPdf) {
    pdfIframe.src = prof.file;
    pdfContainer.classList.remove('hidden');
    imgContainer.classList.add('hidden');
    emptyState.classList.add('hidden');
  } else {
    imgPreview.src = prof.file;
    imgContainer.classList.remove('hidden');
    pdfContainer.classList.add('hidden');
    emptyState.classList.add('hidden');
  }

  document.getElementById('proformaViewerModal').classList.remove('hidden');
}

function closeProformaViewer() {
  const modal = document.getElementById('proformaViewerModal');
  if (modal) modal.classList.add('hidden');
  const iframe = document.getElementById('proformaPdfIframe');
  if (iframe) iframe.src = '';
  currentActiveViewingProforma = null;

  // Eğer talep detay modalından açıldıysa, talep detay modalını temiz bir şekilde geri getir
  if (returnToRequestDetailModalOnClose) {
    const reqModal = document.getElementById('requestDetailModal');
    if (reqModal) reqModal.classList.remove('hidden');
    returnToRequestDetailModalOnClose = false;
  }
}

function downloadCurrentProformaFromViewer() {
  if (currentActiveViewingProforma && currentActiveViewingProforma.file) {
    triggerFileDownload(currentActiveViewingProforma.file, currentActiveViewingProforma.name || 'proforma_fatura.pdf');
  }
}

function downloadCurrentProforma() {
  if (currentEditingRequestProforma && currentEditingRequestProforma.file) {
    triggerFileDownload(currentEditingRequestProforma.file, currentEditingRequestProforma.name || 'proforma_fatura.pdf');
  } else {
    showToast('İndirilecek proforma dosyası bulunamadı.');
  }
}

function triggerFileDownload(dataUrl, filename) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename || 'proforma_belgesi.pdf';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast(`📥 "${filename}" indiriliyor...`);
}

function printCurrentProforma() {
  if (!currentActiveViewingProforma) return;
  const isPdf = currentActiveViewingProforma.type === 'pdf' || currentActiveViewingProforma.file.includes('application/pdf');
  
  if (isPdf) {
    const iframe = document.getElementById('proformaPdfIframe');
    if (iframe && iframe.contentWindow) {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        return;
      } catch (e) {}
    }
  }

  const win = window.open('', '_blank');
  if (win) {
    win.document.write(`
      <html>
        <head><title>${currentActiveViewingProforma.name}</title></head>
        <body style="margin:0; display:flex; justify-content:center; align-items:center; min-height:100vh;">
          ${isPdf ? `<iframe src="${currentActiveViewingProforma.file}" style="width:100%; height:100vh; border:none;"></iframe>` : `<img src="${currentActiveViewingProforma.file}" style="max-width:100%; height:auto;" onload="window.print();"/>`}
        </body>
      </html>
    `);
    win.document.close();
  }
}

// ==================== 9. RESİM BÜYÜTME (LIGHTBOX) ====================
function openRequestImageModal(idOrNo) {
  const req = appState.requests.find(r => r.id === idOrNo || r.request_no === idOrNo);
  if (req && req.chat_image) {
    openImageLightbox(req.chat_image);
  } else if (req) {
    openRequestDetailModal(idOrNo);
    showToast('Bu talebe henüz görsel eklenmemiş.');
  }
}

function openImageLightbox(src) {
  if (!src) return;
  document.getElementById('lightboxImage').src = src;
  document.getElementById('imageLightboxModal').classList.remove('hidden');
}

function closeImageLightbox() {
  document.getElementById('imageLightboxModal').classList.add('hidden');
}
