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

// ==================== 1. GENEL BAKIŞ (DASHBOARD) ====================
function renderDashboard() {
  const totalStock = appState.inventory.reduce((acc, i) => acc + (parseInt(i.quantity) || 0), 0);
  const stockEl = document.getElementById('dashTotalStock');
  if (stockEl) stockEl.textContent = `${totalStock} Adet`;
  
  const shipEl = document.getElementById('dashActiveShipments');
  if (shipEl) shipEl.textContent = appState.shipments.length;

  const supEl = document.getElementById('dashSuppliersCount');
  if (supEl) supEl.textContent = `${appState.suppliers.length} Firma`;

  const remEl = document.getElementById('dashRemindersCount');
  if (remEl) remEl.textContent = appState.reminders.length;

  // Son Parça Talepleri
  const recentReqEl = document.getElementById('dashRecentRequests');
  if (recentReqEl) {
    const recent = appState.requests.slice(0, 4);
    if (recent.length === 0) {
      recentReqEl.innerHTML = '<p class="text-xs text-slate-400 py-3">Henüz talep bulunmuyor.</p>';
    } else {
      recentReqEl.innerHTML = recent.map(r => `
        <div class="py-3 flex items-center justify-between text-sm">
          <div>
            <div class="font-medium text-slate-900">${r.part_name}</div>
            <div class="text-xs text-slate-500">${r.supplier_name || 'Tedarikçi'} • ${r.quantity} Adet (${r.company})</div>
          </div>
          <span class="text-xs px-2.5 py-1 rounded-full font-medium ${getStageColor(r.stage_step)}">${r.stage_label || 'Talep'}</span>
        </div>
      `).join('');
    }
  }

  // Bekleyen Hatırlatıcılar
  const recentRemEl = document.getElementById('dashRecentReminders');
  if (recentRemEl) {
    const reminders = appState.reminders.slice(0, 4);
    if (reminders.length === 0) {
      recentRemEl.innerHTML = '<p class="text-xs text-slate-400 py-3">Bekleyen hatırlatıcı yok.</p>';
    } else {
      recentRemEl.innerHTML = reminders.map(rem => `
        <div class="py-3 flex items-center justify-between text-sm">
          <div>
            <div class="font-medium text-slate-900">${rem.title}</div>
            <div class="text-xs text-slate-500">${rem.supplier_name || rem.target_type}</div>
          </div>
          <span class="text-xs font-semibold px-2 py-0.5 rounded-full ${rem.days_left <= 2 ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-700'}">${rem.days_left} Gün</span>
        </div>
      `).join('');
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

  container.innerHTML = appState.reminders.map(rem => `
    <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1 flex-wrap">
          <span class="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">${rem.supplier_name || 'Tedarikçi'}</span>
          <span class="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700">${rem.target_type}</span>
          <span class="text-xs text-slate-400 font-mono">${rem.reference_id}</span>
        </div>
        <div class="font-medium text-slate-900 text-sm">${rem.title}</div>
      </div>

      <div class="flex items-center gap-3 shrink-0">
        <span class="text-xs font-bold ${rem.days_left <= 2 ? 'text-red-600' : 'text-slate-700'}">${rem.days_left} Gün Kaldı</span>
        <button class="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1 rounded text-xs font-medium cursor-pointer" onclick="completeReminder('${rem.id || rem.reference_id}')">Tamamla</button>
      </div>
    </div>
  `).join('');
}

function openAddReminderModal() {
  populateSupplierDropdowns();
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
    partsTbody.innerHTML = requests.map(r => `
      <tr class="hover:bg-slate-50">
        <td class="py-2 px-3">
          <div class="font-medium text-slate-900">${r.part_name}</div>
          <div class="text-[11px] font-mono text-slate-400">${r.part_sku}</div>
        </td>
        <td class="py-2 px-3 font-semibold text-slate-900">${r.quantity} Adet</td>
        <td class="py-2 px-3 text-slate-600">${r.supply_channel}</td>
        <td class="py-2 px-3">
          <span class="px-2 py-0.5 rounded-full text-[10px] font-medium ${getStageColor(r.stage_step)}">${r.stage_label || 'Talep'}</span>
        </td>
        <td class="py-2 px-3 text-right text-slate-400">${r.created_at || 'Bugün'}</td>
      </tr>
    `).join('');
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
    remContainer.innerHTML = reminders.map(rem => `
      <div class="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
        <div>
          <span class="font-semibold text-slate-900">${rem.title}</span>
          <span class="text-slate-500 ml-2 font-mono">${rem.reference_id}</span>
        </div>
        <span class="font-bold ${rem.days_left <= 2 ? 'text-red-600' : 'text-slate-700'}">${rem.days_left} Gün Kaldı</span>
      </div>
    `).join('');
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

function deleteCurrentSupplier() {
  const id = document.getElementById('modalSupId').value;
  if (id) deleteSupplier(id);
}

// ==================== 6. YENİ TALEP ====================
async function handleSimpleRequestSubmit(e) {
  e.preventDefault();
  const company = document.getElementById('formReqCompany').value;
  const supplier_name = document.getElementById('formReqSupplier').value;
  const part_name = document.getElementById('formReqPart').value.trim();
  const quantity = parseInt(document.getElementById('formReqQty').value) || 1;
  const priority = document.getElementById('formReqPriority').value;
  const supply_channel = document.querySelector('input[name="formReqChannel"]:checked')?.value || 'HSG Çin';
  const notes = document.getElementById('formReqNotes').value.trim();

  const created = await window.dbService.addRequest({
    company,
    supplier_name,
    part_sku: 'SKU-' + Math.floor(1000 + Math.random() * 9000),
    part_name,
    quantity,
    priority,
    supply_channel,
    notes
  });

  document.getElementById('simpleRequestForm').reset();
  await loadAllData();
  showToast(`Talep oluşturuldu (${created.request_no} - ${supplier_name})`);
  setTimeout(() => navigateTo('kontrol-paneli'), 600);
}
