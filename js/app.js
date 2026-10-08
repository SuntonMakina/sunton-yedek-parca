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
  await loadAllData();
  const hash = window.location.hash.replace('#', '') || 'kontrol-paneli';
  navigateTo(hash);
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
    const hash = window.location.hash.replace('#', '') || 'kontrol-paneli';
    navigateTo(hash);
  });
}

function navigateTo(path) {
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
    const recent = appState.requests.slice(0, 6);
    if (recent.length === 0) {
      recentReqEl.innerHTML = '<p class="text-xs text-slate-400 py-4 text-center">Henüz parça talebi bulunmuyor. Sağ üstteki "+ Talep Oluştur" butonuna basarak ekleyebilirsiniz.</p>';
    } else {
      recentReqEl.innerHTML = recent.map(r => {
        const dt = getRequestCreatedDateTimeFormatted(r);
        const stage = getStageInfo(r.stage_step);
        const hasImage = !!r.chat_image;

        return `
          <div class="py-3 px-3 -mx-2 rounded-xl hover:bg-slate-50 transition-all cursor-pointer border border-transparent hover:border-slate-200 group flex items-center justify-between gap-3" onclick="openRequestDetailModal('${r.id || r.request_no}')" title="Detayları, Saati ve Adımları Görüntüle">
            <div class="min-w-0">
              <div class="flex items-center gap-2 mb-1 flex-wrap">
                <span class="font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-sm truncate">${r.part_name}</span>
                <span class="font-mono text-[11px] text-slate-400 font-semibold">${r.request_no}</span>
                ${hasImage ? `<span class="inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200"><span class="material-symbols-outlined text-[13px]">image</span>📷 Sohbet Ekli</span>` : ''}
              </div>
              <div class="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
                <span>🏢 <strong class="text-slate-700 font-semibold">${r.supplier_name || 'Tedarikçi'}</strong></span>
                <span>• ${r.quantity} Adet (${r.company})</span>
                <span>• 📅 ${dt.date}, ⏰ <strong>${dt.time}</strong></span>
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
            <div class="font-bold text-slate-900">${r.part_name}</div>
            <div class="text-[11px] font-mono text-slate-500">${r.part_sku} • ${r.request_no}</div>
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

// ==================== 6. YENİ TALEP & GÖRSEL YÜKLEME ====================
function handleRequestImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    alert('Lütfen 5MB\'dan küçük bir görsel seçin.');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const base64 = e.target.result;
    document.getElementById('formReqChatImageBase64').value = base64;
    document.getElementById('formReqImagePreview').src = base64;
    document.getElementById('formReqImageFileName').textContent = file.name;
    document.getElementById('formReqUploadPrompt').classList.add('hidden');
    document.getElementById('formReqImagePreviewContainer').classList.remove('hidden');
  };
  reader.readAsDataURL(file);
}

function removeRequestUploadedImage() {
  const fileInput = document.getElementById('formReqChatImageFile');
  if (fileInput) fileInput.value = '';
  document.getElementById('formReqChatImageBase64').value = '';
  document.getElementById('formReqImagePreview').src = '';
  document.getElementById('formReqUploadPrompt').classList.remove('hidden');
  document.getElementById('formReqImagePreviewContainer').classList.add('hidden');
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
    chat_image
  });

  document.getElementById('simpleRequestForm').reset();
  removeRequestUploadedImage();
  await loadAllData();
  showToast(`Talep oluşturuldu (${created.request_no} - ${supplier_name})`);
  setTimeout(() => navigateTo('kontrol-paneli'), 500);
}

// ==================== 7. TALEP DETAY MODALI VE DURUM TAKİP SİSTEMİ ====================
let currentViewingRequestId = '';
let currentEditingRequestStage = 1;
let currentEditingRequestImage = '';

function openRequestDetailModal(idOrNo) {
  const req = appState.requests.find(r => r.id === idOrNo || r.request_no === idOrNo);
  if (!req) return;

  currentViewingRequestId = req.id || req.request_no;
  currentEditingRequestStage = parseInt(req.stage_step) || 1;
  currentEditingRequestImage = req.chat_image || '';

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

  document.getElementById('requestDetailModal').classList.remove('hidden');
}

function renderRequestDetailSteppers() {
  const container = document.getElementById('reqDetStepperContainer');
  if (!container) return;

  const currentStageInfo = getStageInfo(currentEditingRequestStage);
  const stageTextEl = document.getElementById('reqDetCurrentStageText');
  if (stageTextEl) stageTextEl.textContent = `Mevcut Aşama: ${currentStageInfo.label}`;

  container.innerHTML = REQUEST_STAGES.map(stage => {
    const isSelected = stage.step === currentEditingRequestStage;
    const isPassed = stage.step < currentEditingRequestStage;

    let btnClass = 'bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:bg-blue-50/50';
    if (isSelected) {
      btnClass = 'bg-blue-600 text-white border-blue-600 shadow-md font-bold ring-2 ring-blue-300';
    } else if (isPassed) {
      btnClass = 'bg-emerald-50 text-emerald-800 border-emerald-300 font-medium';
    }

    return `
      <button type="button" class="p-2.5 rounded-xl border text-left flex items-start gap-2 transition-all cursor-pointer ${btnClass}" onclick="setRequestDetailStage(${stage.step})">
        <span class="material-symbols-outlined text-[18px] shrink-0 mt-0.5 ${isSelected ? 'text-white' : (isPassed ? 'text-emerald-600' : 'text-slate-400')}">
          ${isPassed ? 'check_circle' : stage.icon}
        </span>
        <div class="leading-tight">
          <div class="text-[10px] font-bold uppercase tracking-wider opacity-80">${stage.step}. Adım</div>
          <div class="text-xs font-semibold mt-0.5">${stage.short}</div>
        </div>
      </button>
    `;
  }).join('');
}

function setRequestDetailStage(step) {
  currentEditingRequestStage = parseInt(step);
  renderRequestDetailSteppers();
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

function handleRequestDetailImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    alert('Lütfen 5MB\'dan küçük bir görsel seçin.');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    currentEditingRequestImage = e.target.result;
    renderRequestDetailImage();
    showToast('Yeni görsel seçildi. "Değişiklikleri Kaydet" butonuna basınız.');
  };
  reader.readAsDataURL(file);
}

function removeRequestDetailImage() {
  currentEditingRequestImage = '';
  const input = document.getElementById('reqDetUploadInput');
  if (input) input.value = '';
  renderRequestDetailImage();
  showToast('Görsel kaldırıldı. "Değişiklikleri Kaydet" ile onaylayın.');
}

function closeRequestDetailModal() {
  document.getElementById('requestDetailModal').classList.add('hidden');
}

async function saveRequestDetailChanges() {
  const idOrNo = document.getElementById('reqDetId').value;
  const notes = document.getElementById('reqDetNotes').value.trim();
  const stageInfo = getStageInfo(currentEditingRequestStage);

  closeRequestDetailModal();

  await window.dbService.saveRequest({
    id: idOrNo,
    request_no: idOrNo,
    stage_step: currentEditingRequestStage,
    stage_label: stageInfo.label,
    notes: notes,
    chat_image: currentEditingRequestImage
  });

  await loadAllData();
  renderDashboard();
  showToast(`Talep durumu "${stageInfo.label}" olarak güncellendi.`);
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

// ==================== 8. RESİM BÜYÜTME (LIGHTBOX) ====================
function openImageLightbox(src) {
  if (!src) return;
  document.getElementById('lightboxImage').src = src;
  document.getElementById('imageLightboxModal').classList.remove('hidden');
}

function closeImageLightbox() {
  document.getElementById('imageLightboxModal').classList.add('hidden');
}
