/**
 * SUNTON & HSG - SUPABASE & LOCAL DATA ADAPTER LAYER
 * ==============================================================================
 */

const STORAGE_KEYS = {
  SUPABASE_URL: 'sunton_supabase_url',
  SUPABASE_KEY: 'sunton_supabase_anon_key',
  USE_LIVE_SUPABASE: 'sunton_use_live_db',
  INVENTORY: 'sunton_inventory_data',
  SHIPMENTS: 'sunton_shipments_data',
  REQUESTS: 'sunton_requests_data',
  SUPPLIERS: 'sunton_suppliers_data',
  REMINDERS: 'sunton_reminders_data'
};

const INITIAL_DATA = {
  inventory: [
    { id: '1', sku: 'SKU-9021-HSG', name: 'Hidrolik Pompa Valfi', category: 'Sistem Basınç Parçası', depot: 'Çin HSG Hub', quantity: 45, status: 'Kritik' },
    { id: '2', sku: 'SKU-4412-STN', name: 'Ana Dişli Kutusu Rulmanı', category: 'Aktarma Organları', depot: 'İstanbul Ana', quantity: 210, status: 'Normal' },
    { id: '3', sku: 'SKU-7738-HSG', name: 'PLC Kontrol Kartı v3', category: 'Elektronik Ünite', depot: 'Çin HSG Hub', quantity: 12, status: 'Kritik' },
    { id: '4', sku: 'SKU-1102-STN', name: 'Ağır Hizmet Keçe Seti', category: 'Sızdırmazlık Elemanları', depot: 'İstanbul Ana', quantity: 540, status: 'Normal' },
    { id: '5', sku: 'SKU-5563-HSG', name: 'Konveyör Tahrik Kayışı', category: 'Mekanik Parça', depot: 'Çin HSG Hub', quantity: 1250, status: 'Normal' },
    { id: '6', sku: 'SKU-3329-STN', name: 'Pnömatik Silindir 100mm', category: 'Otomasyon Grubu', depot: 'İstanbul Ana', quantity: 88, status: 'Normal' },
    { id: '7', sku: 'SKU-8891-HSG', name: 'Sensör Optik Mesafe', category: 'Algılayıcılar', depot: 'Çin HSG Hub', quantity: 300, status: 'Normal' },
    { id: '8', sku: 'SKU-2044-STN', name: 'Endüstriyel Soğutma Fanı', category: 'Termal Kontrol', depot: 'İstanbul Ana', quantity: 8, status: 'Kritik' }
  ],
  suppliers: [
    {
      id: 'sup-1',
      name: 'Anadolu Hidrolik Makina',
      code: 'TR-IST-042',
      category: 'turkey',
      contact_person: 'Kerem Yılmaz',
      location: 'İstanbul, TR',
      phone: '+90 212 555 0192',
      active_demands: 14
    },
    {
      id: 'sup-2',
      name: 'HSG Shanghai Precision Parts',
      code: 'CN-SH-109',
      category: 'china',
      contact_person: 'Li Wei',
      location: 'Şanghay, Çin',
      phone: '+86 21 6888 1234',
      active_demands: 32
    },
    {
      id: 'sup-3',
      name: 'Marmara Yedek Parça Ltd.',
      code: 'TR-BUR-019',
      category: 'turkey',
      contact_person: 'Ayşe Demir',
      location: 'Bursa, TR',
      phone: '+90 224 444 8812',
      active_demands: 5
    },
    {
      id: 'sup-4',
      name: 'HSG Guangzhou Logistics',
      code: 'CN-GZ-088',
      category: 'china',
      contact_person: 'Chen Hu',
      location: 'Guangzhou, Çin',
      phone: '+86 20 8900 4567',
      active_demands: 19
    },
    {
      id: 'sup-5',
      name: 'Çukurova Motorlu Araçlar',
      code: 'TR-ADN-011',
      category: 'turkey',
      contact_person: 'Hakan Çelik',
      location: 'Adana, TR',
      phone: '+90 322 300 7741',
      active_demands: 8
    },
    {
      id: 'sup-6',
      name: 'HSG Ningbo Foundry',
      code: 'CN-NGB-055',
      category: 'china',
      contact_person: 'Zhang Ming',
      location: 'Ningbo, Çin',
      phone: '+86 574 8700 9911',
      active_demands: 27
    }
  ],
  shipments: [
    {
      id: 'shp-1',
      tracking_code: 'SHG-TR-2024-889',
      supplier_name: 'HSG Shanghai Precision Parts',
      carrier: 'Maersk Line',
      transport_mode: 'Denizyolu',
      origin: 'Şanghay',
      destination: 'Ambarlı, İstanbul',
      cargo_summary: '42 Palet / Hidrolik Valf Takımı',
      progress_percentage: 85,
      eta_date: '5 Gün Kaldı (28 Ekim)',
      status: 'Gümrükte'
    },
    {
      id: 'shp-2',
      tracking_code: 'IST-FRA-2024-912',
      supplier_name: 'Anadolu Hidrolik Makina',
      carrier: 'DHL Global',
      transport_mode: 'Havayolu',
      origin: 'Frankfurt',
      destination: 'İstanbul (IST)',
      cargo_summary: '8 Koli / Acil PLC Kartları',
      progress_percentage: 92,
      eta_date: 'Bugün, 18:45',
      status: 'Yolda'
    },
    {
      id: 'shp-3',
      tracking_code: 'BUR-ANT-2024-405',
      supplier_name: 'Marmara Yedek Parça Ltd.',
      carrier: 'Kuehne+Nagel',
      transport_mode: 'Karayolu',
      origin: 'Bursa',
      destination: 'Antalya Depo',
      cargo_summary: '18 Palet / Keçe Seti & Rulman',
      progress_percentage: 60,
      eta_date: 'Yarın, 10:30',
      status: 'Yolda'
    }
  ],
  requests: [
    {
      id: 'req-1',
      request_no: 'TR-HSG-88421',
      company: 'Sunton Makine Sanayi A.Ş.',
      supplier_name: 'HSG Shanghai Precision Parts',
      part_sku: 'SKU-9021-HSG',
      part_name: 'Hidrolik Pompa Valfi',
      quantity: 14,
      priority: 'Normal',
      supply_channel: 'HSG Çin',
      stage_step: 4,
      stage_label: 'Kargo / Transit',
      hsg_status: 'Pekin Gümrük Çıkışı Yapıldı',
      last_update: '10 dk önce',
      created_at: new Date(Date.now() - 3600000 * 24).toLocaleDateString('tr-TR')
    },
    {
      id: 'req-2',
      request_no: 'TR-HSG-88420',
      company: 'Sunton Makine Sanayi A.Ş.',
      supplier_name: 'HSG Ningbo Foundry',
      part_sku: 'SKU-4412-STN',
      part_name: 'Ana Rotor Dişli Grubu',
      quantity: 28,
      priority: 'Acil',
      supply_channel: 'HSG Çin',
      stage_step: 2,
      stage_label: 'HSG İnceleme',
      hsg_status: 'Mühendislik Onayı Bekliyor',
      last_update: '35 dk önce',
      created_at: new Date(Date.now() - 3600000 * 48).toLocaleDateString('tr-TR')
    },
    {
      id: 'req-3',
      request_no: 'TR-HSG-88419',
      company: 'HSG Global Logistics Ltd.',
      supplier_name: 'Anadolu Hidrolik Makina',
      part_sku: 'SKU-7738-HSG',
      part_name: 'PLC Kontrol Kartı v3',
      quantity: 45,
      priority: 'Normal',
      supply_channel: 'Yerel Depo',
      stage_step: 3,
      stage_label: 'Yanıt & Onay',
      hsg_status: 'Tedarikçi Onayladı, Hazırlanıyor',
      last_update: '1 saat önce',
      created_at: new Date(Date.now() - 3600000 * 72).toLocaleDateString('tr-TR')
    },
    {
      id: 'req-4',
      request_no: 'TR-HSG-88418',
      company: 'Ankara Montaj Hattı #3',
      supplier_name: 'Marmara Yedek Parça Ltd.',
      part_sku: 'SKU-1102-STN',
      part_name: 'Ağır Hizmet Keçe Seti',
      quantity: 156,
      priority: 'Normal',
      supply_channel: 'Yerel Depo',
      stage_step: 5,
      stage_label: 'Teslim Edildi',
      hsg_status: 'Merkez Depo Teslim Alındı',
      last_update: 'Dün',
      created_at: new Date(Date.now() - 3600000 * 96).toLocaleDateString('tr-TR')
    }
  ],
  reminders: [
    {
      id: 'rem-1',
      target_type: 'HSG Çin',
      supplier_name: 'HSG Shanghai Precision Parts',
      reference_id: '#HSG-8821',
      title: 'Rezonatör Aynası Teknik Şeması Onayı',
      days_left: 4,
      priority: 'Kritik'
    },
    {
      id: 'rem-2',
      target_type: 'Müşteri Onayı',
      supplier_name: 'Anadolu Hidrolik Makina',
      reference_id: '#MŞT-4402',
      title: 'Hidrolik Valf Takımı Kalite Tutanağı',
      days_left: 1,
      priority: 'Acil'
    },
    {
      id: 'rem-3',
      target_type: 'Lojistik & Gümrük',
      supplier_name: 'HSG Guangzhou Logistics',
      reference_id: '#HSG-9104',
      title: 'CNC Sürücü Kartı Gümrük Beyannamesi',
      days_left: 6,
      priority: 'Normal'
    }
  ]
};

const DEFAULT_SUPABASE_CONFIG = {
  url: 'https://fgihcsaqbszlayxoptwt.supabase.co',
  anonKey: 'sb_publishable_tTdOCpRiJ_Pf_BIfhVHDYw_2mzofSin'
};

class SupabaseService {
  constructor() {
    this.client = null;
    this.isLive = false;
    this.init();
  }

  init() {
    const savedUrl = localStorage.getItem(STORAGE_KEYS.SUPABASE_URL) || DEFAULT_SUPABASE_CONFIG.url;
    const savedKey = localStorage.getItem(STORAGE_KEYS.SUPABASE_KEY) || DEFAULT_SUPABASE_CONFIG.anonKey;
    const useLive = localStorage.getItem(STORAGE_KEYS.USE_LIVE_SUPABASE) !== 'false';

    if (savedUrl && savedKey && window.supabase && useLive) {
      try {
        this.client = window.supabase.createClient(savedUrl, savedKey);
        this.isLive = true;
      } catch (err) {
        console.warn('Supabase client error:', err);
        this.isLive = false;
      }
    } else {
      this.isLive = false;
    }

    this._ensureLocalStorage();
  }

  _ensureLocalStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.INVENTORY)) {
      localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(INITIAL_DATA.inventory));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SUPPLIERS)) {
      localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(INITIAL_DATA.suppliers));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SHIPMENTS)) {
      localStorage.setItem(STORAGE_KEYS.SHIPMENTS, JSON.stringify(INITIAL_DATA.shipments));
    }
    if (!localStorage.getItem(STORAGE_KEYS.REQUESTS)) {
      localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(INITIAL_DATA.requests));
    }
    if (!localStorage.getItem(STORAGE_KEYS.REMINDERS)) {
      localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(INITIAL_DATA.reminders));
    }
  }

  setCredentials(url, key, enableLive = true) {
    localStorage.setItem(STORAGE_KEYS.SUPABASE_URL, url);
    localStorage.setItem(STORAGE_KEYS.SUPABASE_KEY, key);
    localStorage.setItem(STORAGE_KEYS.USE_LIVE_SUPABASE, enableLive ? 'true' : 'false');
    this.init();
  }

  getCredentials() {
    return {
      url: localStorage.getItem(STORAGE_KEYS.SUPABASE_URL) || DEFAULT_SUPABASE_CONFIG.url,
      key: localStorage.getItem(STORAGE_KEYS.SUPABASE_KEY) || DEFAULT_SUPABASE_CONFIG.anonKey,
      isLive: this.isLive
    };
  }

  // ==================== INVENTORY ====================
  async getInventory() {
    if (this.isLive && this.client) {
      const { data } = await this.client.from('inventory').select('*').order('created_at', { ascending: false });
      if (data) return data;
    }
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.INVENTORY) || '[]');
  }

  async saveInventoryItem(item) {
    const list = await this.getInventory();
    const idx = list.findIndex(i => i.sku === item.sku);
    const qty = parseInt(item.quantity) || 0;
    const clean = {
      ...item,
      quantity: qty,
      status: qty <= 15 ? 'Kritik' : 'Normal'
    };

    if (idx >= 0) {
      list[idx] = { ...list[idx], ...clean };
    } else {
      clean.id = 'inv-' + Date.now();
      list.unshift(clean);
    }
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(list));
    if (this.isLive && this.client) await this.client.from('inventory').upsert([clean]);
    return list;
  }

  async deleteInventoryItem(sku) {
    let list = await this.getInventory();
    list = list.filter(i => i.sku !== sku);
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(list));
    if (this.isLive && this.client) await this.client.from('inventory').delete().eq('sku', sku);
    return list;
  }

  // ==================== SUPPLIERS ====================
  async getSuppliers() {
    if (this.isLive && this.client) {
      const { data } = await this.client.from('suppliers').select('*').order('name', { ascending: true });
      if (data) return data;
    }
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SUPPLIERS) || '[]');
  }

  async saveSupplier(supplier) {
    const list = await this.getSuppliers();
    const idx = list.findIndex(s => s.id === supplier.id || (supplier.originalName && s.name === supplier.originalName));
    
    const clean = {
      id: supplier.id || 'sup-' + Date.now(),
      name: supplier.name,
      code: supplier.code || ((supplier.category === 'china' ? 'CN-SH-' : 'TR-IST-') + Math.floor(100 + Math.random() * 900)),
      category: supplier.category || 'turkey',
      contact_person: supplier.contact_person || 'Yetkili',
      location: supplier.location || 'İstanbul, TR',
      phone: supplier.phone || '+90 212 555 0000',
      email: supplier.email || '',
      active_demands: supplier.active_demands || 0
    };

    if (idx >= 0) {
      list[idx] = { ...list[idx], ...clean };
    } else {
      list.unshift(clean);
    }

    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(list));
    if (this.isLive && this.client) await this.client.from('suppliers').upsert([clean]);
    return clean;
  }

  async addSupplier(supplier) {
    return this.saveSupplier(supplier);
  }

  async deleteSupplier(id) {
    let list = await this.getSuppliers();
    list = list.filter(s => s.id !== id && s.name !== id);
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(list));
    if (this.isLive && this.client) await this.client.from('suppliers').delete().eq('id', id);
    return list;
  }

  // ==================== SHIPMENTS ====================
  async getShipments() {
    if (this.isLive && this.client) {
      const { data } = await this.client.from('shipments').select('*').order('created_at', { ascending: false });
      if (data) return data;
    }
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SHIPMENTS) || '[]');
  }

  async saveShipment(shp) {
    const list = await this.getShipments();
    const idx = list.findIndex(s => s.id === shp.id || (shp.id && s.id === shp.id));

    const clean = {
      id: shp.id || 'shp-' + Date.now(),
      tracking_code: shp.tracking_code || ('TR-SHP-' + Math.floor(1000 + Math.random() * 9000)),
      supplier_name: shp.supplier_name || 'Genel Tedarikçi',
      carrier: shp.carrier || 'Maersk Line',
      transport_mode: shp.transport_mode || 'Denizyolu',
      origin: shp.origin || 'Şanghay',
      destination: shp.destination || 'İstanbul',
      cargo_summary: shp.cargo_summary || 'Yedek Parça',
      progress_percentage: Math.min(100, Math.max(0, parseInt(shp.progress_percentage) || 15)),
      eta_date: shp.eta_date || '7 Gün',
      status: shp.status || 'Yolda'
    };

    if (idx >= 0) {
      list[idx] = { ...list[idx], ...clean };
    } else {
      list.unshift(clean);
    }

    localStorage.setItem(STORAGE_KEYS.SHIPMENTS, JSON.stringify(list));
    if (this.isLive && this.client) await this.client.from('shipments').upsert([clean]);
    return clean;
  }

  async addShipment(shp) {
    return this.saveShipment(shp);
  }

  async deleteShipment(id) {
    let list = await this.getShipments();
    list = list.filter(s => s.id !== id && s.tracking_code !== id);
    localStorage.setItem(STORAGE_KEYS.SHIPMENTS, JSON.stringify(list));
    if (this.isLive && this.client) await this.client.from('shipments').delete().eq('id', id);
    return list;
  }

  // ==================== REQUESTS ====================
  async getRequests() {
    if (this.isLive && this.client) {
      const { data } = await this.client.from('requests').select('*').order('created_at', { ascending: false });
      if (data) return data;
    }
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.REQUESTS) || '[]');
  }

  async addRequest(req) {
    const list = await this.getRequests();
    const clean = {
      id: 'req-' + Date.now(),
      request_no: 'TR-HSG-' + Math.floor(10000 + Math.random() * 90000),
      company: req.company || 'Sunton A.Ş.',
      supplier_name: req.supplier_name || (req.supply_channel === 'HSG Çin' ? 'HSG Shanghai Precision Parts' : 'Anadolu Hidrolik Makina'),
      part_sku: req.part_sku || 'SKU-' + Math.floor(1000 + Math.random() * 9000),
      part_name: req.part_name,
      quantity: parseInt(req.quantity) || 1,
      priority: req.priority || 'Normal',
      supply_channel: req.supply_channel || 'HSG Çin',
      notes: req.notes || '',
      stage_step: 1,
      stage_label: 'Talep Oluşturuldu',
      hsg_status: 'Kuyruğa Eklendi',
      last_update: 'Az önce',
      created_at: new Date().toLocaleDateString('tr-TR')
    };
    list.unshift(clean);
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(list));
    if (this.isLive && this.client) await this.client.from('requests').insert([clean]);
    return clean;
  }

  // ==================== REMINDERS ====================
  async getReminders() {
    if (this.isLive && this.client) {
      const { data } = await this.client.from('reminders').select('*').order('deadline_days', { ascending: true });
      if (data) return data;
    }
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.REMINDERS) || '[]');
  }

  async addReminder(rem) {
    const list = await this.getReminders();
    const clean = {
      id: 'rem-' + Date.now(),
      target_type: rem.target_type || 'HSG Çin',
      supplier_name: rem.supplier_name || 'Genel Tedarikçi',
      reference_id: '#REF-' + Math.floor(1000 + Math.random() * 9000),
      title: rem.title,
      days_left: parseInt(rem.days_left) || 3,
      priority: rem.priority || 'Normal'
    };
    list.unshift(clean);
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(list));
    if (this.isLive && this.client) await this.client.from('reminders').insert([clean]);
    return clean;
  }

  async completeReminder(id) {
    let list = await this.getReminders();
    list = list.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(list));
    if (this.isLive && this.client) await this.client.from('reminders').delete().eq('id', id);
    return list;
  }
}

window.dbService = new SupabaseService();
