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

  // Helper: UUID validator
  _isUUID(str) {
    return typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
  }

  // ==================== INVENTORY ====================
  async getInventory() {
    if (this.isLive && this.client) {
      try {
        const { data, error } = await this.client.from('inventory').select('*').order('name', { ascending: true });
        if (!error && data && data.length > 0) {
          localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(data));
          return data;
        }
      } catch (err) {
        console.warn('Supabase getInventory error:', err);
      }
    }
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.INVENTORY) || '[]');
  }

  async saveInventoryItem(item) {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.INVENTORY) || '[]');
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

    if (this.isLive && this.client) {
      try {
        const payload = {
          sku: clean.sku,
          name: clean.name,
          depot: clean.depot,
          quantity: clean.quantity,
          min_alert_qty: 15
        };
        await this.client.from('inventory').upsert([payload], { onConflict: 'sku' });
      } catch (err) {
        console.warn('Supabase saveInventory error:', err);
      }
    }
    return list;
  }

  async deleteInventoryItem(sku) {
    let list = JSON.parse(localStorage.getItem(STORAGE_KEYS.INVENTORY) || '[]');
    list = list.filter(i => i.sku !== sku);
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(list));

    if (this.isLive && this.client) {
      try {
        await this.client.from('inventory').delete().eq('sku', sku);
      } catch (err) {
        console.warn('Supabase deleteInventory error:', err);
      }
    }
    return list;
  }

  // ==================== SUPPLIERS ====================
  async getSuppliers() {
    if (this.isLive && this.client) {
      try {
        const { data, error } = await this.client.from('suppliers').select('*').order('name', { ascending: true });
        if (!error && data && data.length > 0) {
          localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(data));
          return data;
        }
      } catch (err) {
        console.warn('Supabase getSuppliers error:', err);
      }
    }
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SUPPLIERS) || '[]');
  }

  async saveSupplier(supplier) {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.SUPPLIERS) || '[]');
    const idx = list.findIndex(s => s.id === supplier.id || (supplier.originalName && s.name === supplier.originalName) || s.name === supplier.name);
    
    const clean = {
      id: supplier.id || 'sup-' + Date.now(),
      name: supplier.name,
      code: supplier.code || ((supplier.category === 'china' ? 'CN-SH-' : 'TR-IST-') + Math.floor(100 + Math.random() * 900)),
      category: supplier.category || 'turkey',
      contact_person: supplier.contact_person || 'Yetkili',
      location: supplier.location || 'İstanbul, TR',
      phone: supplier.phone || '+90 212 555 0000',
      email: supplier.email || '',
      active_demands_count: supplier.active_demands || supplier.active_demands_count || 0
    };

    if (idx >= 0) {
      list[idx] = { ...list[idx], ...clean };
    } else {
      list.unshift(clean);
    }

    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(list));

    if (this.isLive && this.client) {
      try {
        const payload = {
          name: clean.name,
          code: clean.code,
          category: clean.category,
          contact_person: clean.contact_person,
          location: clean.location,
          phone: clean.phone,
          email: clean.email
        };
        if (this._isUUID(clean.id)) {
          payload.id = clean.id;
        }
        await this.client.from('suppliers').upsert([payload], { onConflict: 'code' });
      } catch (err) {
        console.warn('Supabase saveSupplier error:', err);
      }
    }
    return clean;
  }

  async addSupplier(supplier) {
    return this.saveSupplier(supplier);
  }

  async deleteSupplier(idOrName) {
    let list = JSON.parse(localStorage.getItem(STORAGE_KEYS.SUPPLIERS) || '[]');
    const target = list.find(s => s.id === idOrName || s.name === idOrName || s.code === idOrName);
    const targetName = target ? target.name : idOrName;
    const targetCode = target ? target.code : null;

    list = list.filter(s => s.id !== idOrName && s.name !== idOrName && (targetName ? s.name !== targetName : true));
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(list));

    if (this.isLive && this.client) {
      try {
        if (targetCode) {
          await this.client.from('suppliers').delete().eq('code', targetCode);
        }
        if (targetName) {
          await this.client.from('suppliers').delete().eq('name', targetName);
        }
        if (this._isUUID(idOrName)) {
          await this.client.from('suppliers').delete().eq('id', idOrName);
        }
      } catch (err) {
        console.warn('Supabase deleteSupplier error:', err);
      }
    }
    return list;
  }

  // ==================== SHIPMENTS ====================
  async getShipments() {
    if (this.isLive && this.client) {
      try {
        const { data, error } = await this.client.from('shipments').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          localStorage.setItem(STORAGE_KEYS.SHIPMENTS, JSON.stringify(data));
          return data;
        }
      } catch (err) {
        console.warn('Supabase getShipments error:', err);
      }
    }
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SHIPMENTS) || '[]');
  }

  async saveShipment(shp) {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.SHIPMENTS) || '[]');
    const idx = list.findIndex(s => s.id === shp.id || s.tracking_code === shp.tracking_code);

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

    if (this.isLive && this.client) {
      try {
        const payload = {
          tracking_code: clean.tracking_code,
          supplier_name: clean.supplier_name,
          carrier: clean.carrier,
          transport_mode: clean.transport_mode,
          origin: clean.origin,
          destination: clean.destination,
          cargo_summary: clean.cargo_summary,
          progress_percentage: clean.progress_percentage,
          eta_date: clean.eta_date,
          status: clean.status
        };
        if (this._isUUID(clean.id)) {
          payload.id = clean.id;
        }
        await this.client.from('shipments').upsert([payload], { onConflict: 'tracking_code' });
      } catch (err) {
        console.warn('Supabase saveShipment error:', err);
      }
    }
    return clean;
  }

  async addShipment(shp) {
    return this.saveShipment(shp);
  }

  async deleteShipment(idOrCode) {
    let list = JSON.parse(localStorage.getItem(STORAGE_KEYS.SHIPMENTS) || '[]');
    const target = list.find(s => s.id === idOrCode || s.tracking_code === idOrCode);
    const targetCode = target ? target.tracking_code : idOrCode;

    list = list.filter(s => s.id !== idOrCode && s.tracking_code !== idOrCode && (targetCode ? s.tracking_code !== targetCode : true));
    localStorage.setItem(STORAGE_KEYS.SHIPMENTS, JSON.stringify(list));

    if (this.isLive && this.client) {
      try {
        if (targetCode) {
          await this.client.from('shipments').delete().eq('tracking_code', targetCode);
        }
        if (this._isUUID(idOrCode)) {
          await this.client.from('shipments').delete().eq('id', idOrCode);
        }
      } catch (err) {
        console.warn('Supabase deleteShipment error:', err);
      }
    }
    return list;
  }

  // ==================== REQUESTS ====================
  async getRequests() {
    if (this.isLive && this.client) {
      try {
        const { data, error } = await this.client.from('requests').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(data));
          return data;
        }
      } catch (err) {
        console.warn('Supabase getRequests error:', err);
      }
    }
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.REQUESTS) || '[]');
  }

  async addRequest(req) {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.REQUESTS) || '[]');
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

    if (this.isLive && this.client) {
      try {
        await this.client.from('requests').insert([{
          request_no: clean.request_no,
          company: clean.company,
          supplier_name: clean.supplier_name,
          part_sku: clean.part_sku,
          part_name: clean.part_name,
          quantity: clean.quantity,
          priority: clean.priority,
          supply_channel: clean.supply_channel,
          notes: clean.notes
        }]);
      } catch (err) {
        console.warn('Supabase addRequest error:', err);
      }
    }
    return clean;
  }

  // ==================== REMINDERS ====================
  async getReminders() {
    if (this.isLive && this.client) {
      try {
        const { data, error } = await this.client.from('reminders').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(data));
          return data;
        }
      } catch (err) {
        console.warn('Supabase getReminders error:', err);
      }
    }
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.REMINDERS) || '[]');
  }

  async addReminder(rem) {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.REMINDERS) || '[]');
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

    if (this.isLive && this.client) {
      try {
        await this.client.from('reminders').insert([{
          target_type: clean.target_type,
          supplier_name: clean.supplier_name,
          reference_id: clean.reference_id,
          title: clean.title,
          deadline_days: clean.days_left,
          priority: clean.priority
        }]);
      } catch (err) {
        console.warn('Supabase addReminder error:', err);
      }
    }
    return clean;
  }

  async completeReminder(idOrRef) {
    let list = JSON.parse(localStorage.getItem(STORAGE_KEYS.REMINDERS) || '[]');
    const target = list.find(r => r.id === idOrRef || r.reference_id === idOrRef);
    const refId = target ? target.reference_id : null;

    list = list.filter(r => r.id !== idOrRef && r.reference_id !== idOrRef);
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(list));

    if (this.isLive && this.client) {
      try {
        if (refId) {
          await this.client.from('reminders').delete().eq('reference_id', refId);
        }
        if (this._isUUID(idOrRef)) {
          await this.client.from('reminders').delete().eq('id', idOrRef);
        }
      } catch (err) {
        console.warn('Supabase completeReminder error:', err);
      }
    }
    return list;
  }
}

window.dbService = new SupabaseService();

