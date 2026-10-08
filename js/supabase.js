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

function safeSetStorage(key, val) {
  try {
    localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val));
  } catch (err) {
    console.warn('LocalStorage quota limit reached for key:', key, err);
    try {
      if (typeof val === 'string') {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) {
          localStorage.setItem(key, JSON.stringify(parsed.slice(0, 30)));
        }
      }
    } catch (e) {}
  }
}

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
      part_name: 'Hidrolik Pompa Valfi (Yüksek Basınç)',
      quantity: 14,
      priority: 'Kritik',
      supply_channel: 'HSG Çin',
      stage_step: 4,
      stage_label: 'Uluslararası Sevkiyatta / Yolda',
      hsg_status: 'Pekin Limanı Gemiye Yüklendi (Maersk)',
      notes: 'WeChat üzerinden Wang Bey ile teyit edildi. Gemi takip no: MAEU902194',
      chat_image: '',
      proforma_file: '',
      proforma_name: '',
      proforma_type: '',
      proforma_no: '',
      proforma_amount: '',
      proforma_notes: '',
      proforma_date: '',
      created_at: new Date(Date.now() - 3600000 * 26).toISOString(),
      created_at_date: '07 Ekim 2026',
      created_at_time: '09:30'
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
      stage_step: 3,
      stage_label: "Çin'den Çıkış Bekliyor",
      hsg_status: 'Fabrika üretimi tamamladı, Ningbo antrepo çıkışı bekleniyor',
      notes: 'Fatura ve çeki listesi WhatsApp üzerinden iletildi.',
      chat_image: '',
      proforma_file: 'data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDtsOfCjEgMCBvYmoKPDwvVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFI+PgplbmRvYmoKMiAwIG9iago8PC9UeXBlIC9QYWdlcwovS2lkcyBbMyAwIFJdCi9Db3VudCAxPj4KZW5kb2JqCjMgMCBvYmoKPDwvVHlwZSAvUGFnZQovUGFyZW50IDIgMCBSCi9NZWRpYUJveCBbMCAwIDU5NSA4NDJdCi9Db250ZW50cyA0IDAgUgovUmVzb3VyY2VzIDw8L1Byb2NTZXQgWy9QREYgL1RleHRdCi9Gb250IDw8L0YxIDUgMCBSPj4+Pj4KZW5kb2JqCjUgMCBvYmoKPDwvVHlwZSAvRm9udAovU3VidHlwZSAvVHlwZTEKL0Jhc2VGb250IC9IZWx2ZXRpY2EtQm9sZD4+CmVuZG9iago0IDAgb2JqCjw8L0xlbmd0aCAxOTU+PgpzdHJlYW0KQlQKL0YxIDE4IFRmCjUwIDgwMCBUZAooUFJPRk9STUEgRkFUVVJBIChQUk9GT1JNQSBJTlZPSUNFKSkgVGoKL0YxIDEyIFRmCjUwIDc2MCBUZAooRmlybWE6IEhTRyBOaW5nYm8gRm91bmRyeSAvIFRhbGVwIE5vOiBUUi1IU0ctODg0MjApIFRqCjUwIDczNSBUZAooUGFyY2E6IEFuYSBSb3RvciBEaXNsaSBHcnVidSAtIE1pa3RhcjogMjggQWRldCkgVGoKNTAgNzEwIFRkCihQcm9mb3JtYSBObzogUEktMjAyNi00NDEyIHwgVHV0YXI6ICQzLjg1MCBVU0QpIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDE1IDAwMDAwIG4gCjAwMDAwMDAwNjggMDAwMDAgbiAKMDAwMDAwMDEyNSAwMDAwMCBuIAowMDAwMDAwMzM2IDAwMDAwIG4gCjAwMDAwMDAyNTYgMDAwMDAgbiAKdHJhaWxlcgo8PC9TaXplIDYKL1Jvb3QgMSAwIFI+PgpzdGFydHhyZWYKNTgxCiUlRU9GCg==',
      proforma_name: 'Proforma_HSG_Ningbo_88420.pdf',
      proforma_type: 'pdf',
      proforma_no: 'PI-2026-4412',
      proforma_amount: '$3,850 USD',
      proforma_notes: 'FOB Ningbo teslim şartı',
      proforma_date: '07 Ekim 2026, 21:30',
      created_at: new Date(Date.now() - 3600000 * 14).toISOString(),
      created_at_date: '07 Ekim 2026',
      created_at_time: '21:15'
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
      stage_step: 2,
      stage_label: 'Tedarikçi Onayladı / Hazırlanıyor',
      hsg_status: 'Kerem Bey ile görüşüldü, paketleme yapılıyor',
      notes: 'Yarın kargo takip kodu verilecek.',
      chat_image: '',
      proforma_file: 'data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDtsOfCjEgMCBvYmoKPDwvVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFI+PgplbmRvYmoKMiAwIG9iago8PC9UeXBlIC9QYWdlcwovS2lkcyBbMyAwIFJdCi9Db3VudCAxPj4KZW5kb2JqCjMgMCBvYmoKPDwvVHlwZSAvUGFnZQovUGFyZW50IDIgMCBSCi9NZWRpYUJveCBbMCAwIDU5NSA4NDJdCi9Db250ZW50cyA0IDAgUgovUmVzb3VyY2VzIDw8L1Byb2NTZXQgWy9QREYgL1RleHRdCi9Gb250IDw8L0YxIDUgMCBSPj4+Pj4KZW5kb2JqCjUgMCBvYmoKPDwvVHlwZSAvRm9udAovU3VidHlwZSAvVHlwZTEKL0Jhc2VGb250IC9IZWx2ZXRpY2EtQm9sZD4+CmVuZG9iago0IDAgb2JqCjw8L0xlbmd0aCAxOTU+PgpzdHJlYW0KQlQKL0YxIDE4IFRmCjUwIDgwMCBUZAooUFJPRk9STUEgRkFUVVJBIChQUk9GT1JNQSBJTlZPSUNFKSkgVGoKL0YxIDEyIFRmCjUwIDc2MCBUZAooRmlybWE6IEFuYWRvbHUgSGlkcm9saWsgTWFraW5hIC8gVGFsZXAgTm86IFRSLUhTRy04ODQxOSkgVGoKNTAgNzM1IFRkCihQYXJjYTogUExDIEtvbnRyb2wgS2FydGkgdjMgLSBNaWt0YXI6IDQ1IEFkZXQpIFRqCjUwIDcxMCBUZAooUHJvZm9ybWEgTm86IFBJLTIwMjYtODgxOSB8IFR1dGFyOiAxMjUuMDAwIFRMICg1MCUgUGVzaW4pKSBUagpFVAplbmRzdHJlYW0KZW5kb2JqCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxNSAwMDAwMCBuIAowMDAwMDAwMDY4IDAwMDAwIG4gCjAwMDAwMDAxMjUgMDAwMDAgbiAKMDAwMDAwMDMzNiAwMDAwMCBuIAowMDAwMDAwMjU2IDAwMDAwIG4gCnRyYWlsZXIKPDwvU2l6ZSA2Ci9Sb290IDEgMCBSPj4Kc3RhcnR4cmVmCjU4MQolJUVPRgo=',
      proforma_name: 'Proforma_Anadolu_Hidrolik_88419.pdf',
      proforma_type: 'pdf',
      proforma_no: 'PI-2026-8819',
      proforma_amount: '125.000 ₺',
      proforma_notes: '%50 peşin, %50 teslimatta',
      proforma_date: '08 Ekim 2026, 08:30',
      created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      created_at_date: '08 Ekim 2026',
      created_at_time: '07:45'
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
      stage_step: 6,
      stage_label: 'Merkez Depo Teslim Edildi',
      hsg_status: 'Merkez Depo Raf No: B-14 teslim alındı',
      notes: 'İrsaliye imzalandı, stok sistemine aktarıldı.',
      chat_image: '',
      proforma_file: '',
      proforma_name: '',
      proforma_type: '',
      proforma_no: '',
      proforma_amount: '',
      proforma_notes: '',
      proforma_date: '',
      created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
      created_at_date: '05 Ekim 2026',
      created_at_time: '14:20'
    }
  ],
  reminders: [
    {
      id: 'rem-1',
      target_type: 'HSG Çin',
      supplier_name: 'HSG Shanghai Precision Parts',
      reference_id: '#HSG-8821',
      title: 'Rezonatör Aynası Teknik Şeması Onayı',
      deadline_days: 4,
      days_left: 4,
      created_at: new Date(Date.now() - 3600000 * 24).toLocaleDateString('en-CA', { timeZone: 'Europe/Istanbul' }),
      due_date: new Date(Date.now() + 3600000 * 24 * 3).toLocaleDateString('en-CA', { timeZone: 'Europe/Istanbul' }),
      priority: 'Kritik'
    },
    {
      id: 'rem-2',
      target_type: 'Müşteri Onayı',
      supplier_name: 'Anadolu Hidrolik Makina',
      reference_id: '#MŞT-4402',
      title: 'Hidrolik Valf Takımı Kalite Tutanağı',
      deadline_days: 1,
      days_left: 0,
      created_at: new Date(Date.now() - 3600000 * 24 * 2).toLocaleDateString('en-CA', { timeZone: 'Europe/Istanbul' }),
      due_date: new Date(Date.now()).toLocaleDateString('en-CA', { timeZone: 'Europe/Istanbul' }),
      priority: 'Acil'
    },
    {
      id: 'rem-3',
      target_type: 'Lojistik & Gümrük',
      supplier_name: 'HSG Guangzhou Logistics',
      reference_id: '#HSG-9104',
      title: 'CNC Sürücü Kartı Gümrük Beyannamesi',
      deadline_days: 6,
      days_left: 5,
      created_at: new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Istanbul' }),
      due_date: new Date(Date.now() + 3600000 * 24 * 5).toLocaleDateString('en-CA', { timeZone: 'Europe/Istanbul' }),
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
    let localList = [];
    try {
      localList = JSON.parse(localStorage.getItem(STORAGE_KEYS.REQUESTS) || '[]');
      if (!Array.isArray(localList)) localList = [];
    } catch (e) {
      localList = [];
    }

    if (this.isLive && this.client) {
      try {
        const { data, error } = await this.client.from('requests').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          // Merge remote data with local rich fields (chat_image, proforma_*) to prevent accidental image wiping
          const mergedList = data.map(remoteItem => {
            const localMatch = localList.find(l => 
              (l.id && remoteItem.id && l.id === remoteItem.id) ||
              (l.request_no && remoteItem.request_no && l.request_no === remoteItem.request_no)
            );
            if (localMatch) {
              return {
                ...localMatch,
                ...remoteItem,
                // Preserve local media if remote column is null or empty
                chat_image: remoteItem.chat_image || localMatch.chat_image || '',
                proforma_file: remoteItem.proforma_file || localMatch.proforma_file || '',
                proforma_name: remoteItem.proforma_name || localMatch.proforma_name || '',
                proforma_type: remoteItem.proforma_type || localMatch.proforma_type || '',
                proforma_no: remoteItem.proforma_no || localMatch.proforma_no || '',
                proforma_amount: remoteItem.proforma_amount || localMatch.proforma_amount || '',
                proforma_notes: remoteItem.proforma_notes || localMatch.proforma_notes || '',
                proforma_date: remoteItem.proforma_date || localMatch.proforma_date || ''
              };
            }
            return remoteItem;
          });

          // Also keep local requests that are not yet on remote Supabase
          localList.forEach(localItem => {
            const exists = mergedList.some(m => 
              (m.id && localItem.id && m.id === localItem.id) ||
              (m.request_no && localItem.request_no && m.request_no === localItem.request_no)
            );
            if (!exists) {
              mergedList.push(localItem);
            }
          });

          safeSetStorage(STORAGE_KEYS.REQUESTS, JSON.stringify(mergedList));
          return mergedList;
        }
      } catch (err) {
        console.warn('Supabase getRequests error:', err);
      }
    }
    return localList;
  }

  async addRequest(req) {
    let list = JSON.parse(localStorage.getItem(STORAGE_KEYS.REQUESTS) || '[]');
    if (!Array.isArray(list)) list = [];

    const now = new Date();
    const trDateFormatted = now.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });
    const trTimeFormatted = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Istanbul' });
    const step = parseInt(req.stage_step) || 1;
    const stageMap = {
      1: 'Talep Açıldı / Mesaj Bekleniyor',
      2: 'Tedarikçi Onayladı / Hazırlanıyor',
      3: "Çin'den Çıkış Bekliyor",
      4: 'Uluslararası Sevkiyatta / Yolda',
      5: "Türkiye'de / Gümrükte",
      6: 'Merkez Depo Teslim Edildi'
    };

    const clean = {
      id: req.id || ('req-' + Date.now()),
      request_no: req.request_no || ('TR-HSG-' + Math.floor(10000 + Math.random() * 90000)),
      company: req.company || 'Sunton Makine Sanayi A.Ş.',
      supplier_name: req.supplier_name || 'HSG Shanghai Precision Parts',
      part_sku: req.part_sku || ('SKU-' + Math.floor(1000 + Math.random() * 9000)),
      part_name: req.part_name,
      quantity: parseInt(req.quantity) || 1,
      priority: req.priority || 'Normal',
      supply_channel: req.supply_channel || 'HSG Çin',
      notes: req.notes || '',
      chat_image: req.chat_image || '',
      proforma_file: req.proforma_file || '',
      proforma_name: req.proforma_name || '',
      proforma_type: req.proforma_type || '',
      proforma_no: req.proforma_no || '',
      proforma_amount: req.proforma_amount || '',
      proforma_notes: req.proforma_notes || '',
      proforma_date: req.proforma_date || (req.proforma_file ? (trDateFormatted + ', ' + trTimeFormatted) : ''),
      stage_step: step,
      stage_label: req.stage_label || stageMap[step] || 'Talep Açıldı / Mesaj Bekleniyor',
      hsg_status: req.hsg_status || 'İşleme Alındı',
      created_at: req.created_at || now.toISOString(),
      created_at_date: req.created_at_date || trDateFormatted,
      created_at_time: req.created_at_time || trTimeFormatted
    };

    list.unshift(clean);
    safeSetStorage(STORAGE_KEYS.REQUESTS, JSON.stringify(list));

    if (this.isLive && this.client) {
      try {
        const payload = {
          request_no: clean.request_no,
          company: clean.company,
          supplier_name: clean.supplier_name,
          part_sku: clean.part_sku,
          part_name: clean.part_name,
          quantity: clean.quantity,
          priority: clean.priority,
          supply_channel: clean.supply_channel,
          notes: clean.notes,
          chat_image: clean.chat_image,
          proforma_file: clean.proforma_file,
          proforma_name: clean.proforma_name,
          proforma_type: clean.proforma_type,
          proforma_no: clean.proforma_no,
          proforma_amount: clean.proforma_amount,
          proforma_notes: clean.proforma_notes,
          proforma_date: clean.proforma_date,
          stage_step: clean.stage_step,
          stage_label: clean.stage_label,
          status: clean.stage_label,
          created_at: clean.created_at
        };
        await this.client.from('requests').insert([payload]);
      } catch (err) {
        console.warn('Supabase addRequest full insert failed, trying basic payload fallback:', err);
        try {
          const basicPayload = {
            request_no: clean.request_no,
            company: clean.company,
            supplier_name: clean.supplier_name,
            part_sku: clean.part_sku,
            part_name: clean.part_name,
            quantity: clean.quantity,
            priority: clean.priority,
            supply_channel: clean.supply_channel,
            notes: clean.notes,
            stage_step: clean.stage_step,
            stage_label: clean.stage_label,
            status: clean.stage_label,
            created_at: clean.created_at
          };
          await this.client.from('requests').insert([basicPayload]);
        } catch (fbErr) {
          console.warn('Supabase basic insert fallback error:', fbErr);
        }
      }
    }
    return clean;
  }

  async saveRequest(req) {
    let list = JSON.parse(localStorage.getItem(STORAGE_KEYS.REQUESTS) || '[]');
    if (!Array.isArray(list)) list = [];

    // Find by matching id or request_no
    const idx = list.findIndex(r => 
      (req.id && (r.id === req.id || r.request_no === req.id)) ||
      (req.request_no && (r.request_no === req.request_no || r.id === req.request_no))
    );

    const step = parseInt(req.stage_step) || (idx >= 0 ? list[idx].stage_step : 1);
    const stageMap = {
      1: 'Talep Açıldı / Mesaj Bekleniyor',
      2: 'Tedarikçi Onayladı / Hazırlanıyor',
      3: "Çin'den Çıkış Bekliyor",
      4: 'Uluslararası Sevkiyatta / Yolda',
      5: "Türkiye'de / Gümrükte",
      6: 'Merkez Depo Teslim Edildi'
    };

    let updatedItem = null;

    if (idx >= 0) {
      const originalReqNo = list[idx].request_no;
      const originalId = list[idx].id;

      updatedItem = {
        ...list[idx],
        ...req,
        id: originalId,
        request_no: (req.request_no && req.request_no.startsWith('TR-')) ? req.request_no : originalReqNo,
        stage_step: step,
        stage_label: req.stage_label || stageMap[step] || list[idx].stage_label,
        quantity: parseInt(req.quantity) || list[idx].quantity || 1,
        chat_image: req.chat_image !== undefined ? req.chat_image : (list[idx].chat_image || ''),
        proforma_file: req.proforma_file !== undefined ? req.proforma_file : (list[idx].proforma_file || ''),
        proforma_name: req.proforma_name !== undefined ? req.proforma_name : (list[idx].proforma_name || ''),
        proforma_type: req.proforma_type !== undefined ? req.proforma_type : (list[idx].proforma_type || ''),
        proforma_no: req.proforma_no !== undefined ? req.proforma_no : (list[idx].proforma_no || ''),
        proforma_amount: req.proforma_amount !== undefined ? req.proforma_amount : (list[idx].proforma_amount || ''),
        proforma_notes: req.proforma_notes !== undefined ? req.proforma_notes : (list[idx].proforma_notes || ''),
        proforma_date: req.proforma_date !== undefined ? req.proforma_date : (list[idx].proforma_date || '')
      };
      list[idx] = updatedItem;
    } else {
      updatedItem = {
        id: req.id || ('req-' + Date.now()),
        request_no: req.request_no || ('TR-HSG-' + Math.floor(10000 + Math.random() * 90000)),
        ...req,
        stage_step: step,
        stage_label: req.stage_label || stageMap[step] || 'Talep Açıldı / Mesaj Bekleniyor',
        quantity: parseInt(req.quantity) || 1,
        chat_image: req.chat_image || '',
        proforma_file: req.proforma_file || '',
        created_at: req.created_at || new Date().toISOString()
      };
      list.unshift(updatedItem);
    }

    safeSetStorage(STORAGE_KEYS.REQUESTS, JSON.stringify(list));

    if (this.isLive && this.client && updatedItem) {
      try {
        const payload = {
          company: updatedItem.company || 'Sunton Makine Sanayi A.Ş.',
          supplier_name: updatedItem.supplier_name,
          part_name: updatedItem.part_name,
          quantity: updatedItem.quantity,
          priority: updatedItem.priority || 'Normal',
          supply_channel: updatedItem.supply_channel || 'HSG Çin',
          notes: updatedItem.notes || '',
          chat_image: updatedItem.chat_image || '',
          proforma_file: updatedItem.proforma_file || '',
          proforma_name: updatedItem.proforma_name || '',
          proforma_type: updatedItem.proforma_type || '',
          proforma_no: updatedItem.proforma_no || '',
          proforma_amount: updatedItem.proforma_amount || '',
          proforma_notes: updatedItem.proforma_notes || '',
          proforma_date: updatedItem.proforma_date || '',
          stage_step: updatedItem.stage_step,
          stage_label: updatedItem.stage_label,
          status: updatedItem.stage_label
        };

        if (this._isUUID(updatedItem.id)) {
          await this.client.from('requests').update(payload).eq('id', updatedItem.id);
        } else {
          const res = await this.client.from('requests').update(payload).eq('request_no', updatedItem.request_no).select();
          if (res.error || !res.data || res.data.length === 0) {
            // Row not in Supabase yet -> insert it so it exists
            await this.client.from('requests').insert([{
              ...payload,
              request_no: updatedItem.request_no,
              part_sku: updatedItem.part_sku || ('SKU-' + Math.floor(1000 + Math.random() * 9000)),
              created_at: updatedItem.created_at || new Date().toISOString()
            }]);
          }
        }
      } catch (err) {
        console.warn('Supabase saveRequest full update failed, falling back to basic payload:', err);
        try {
          const fallbackPayload = {
            company: updatedItem.company,
            supplier_name: updatedItem.supplier_name,
            part_name: updatedItem.part_name,
            quantity: updatedItem.quantity,
            priority: updatedItem.priority,
            supply_channel: updatedItem.supply_channel,
            notes: updatedItem.notes || '',
            stage_step: updatedItem.stage_step,
            stage_label: updatedItem.stage_label,
            status: updatedItem.stage_label
          };
          await this.client.from('requests').update(fallbackPayload).eq('request_no', updatedItem.request_no);
        } catch (fbErr) {
          console.warn('Supabase saveRequest fallback error:', fbErr);
        }
      }
    }
    return updatedItem;
  }

  async deleteRequest(idOrNo) {
    let list = JSON.parse(localStorage.getItem(STORAGE_KEYS.REQUESTS) || '[]');
    const target = list.find(r => r.id === idOrNo || r.request_no === idOrNo);
    const targetNo = target ? target.request_no : idOrNo;

    list = list.filter(r => r.id !== idOrNo && r.request_no !== idOrNo && (targetNo ? r.request_no !== targetNo : true));
    safeSetStorage(STORAGE_KEYS.REQUESTS, JSON.stringify(list));

    if (this.isLive && this.client) {
      try {
        if (targetNo) {
          await this.client.from('requests').delete().eq('request_no', targetNo);
        }
        if (this._isUUID(idOrNo)) {
          await this.client.from('requests').delete().eq('id', idOrNo);
        }
      } catch (err) {
        console.warn('Supabase deleteRequest error:', err);
      }
    }
    return list;
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
    const now = new Date();
    const trTodayStr = now.toLocaleDateString('en-CA', { timeZone: 'Europe/Istanbul' });
    const days = parseInt(rem.days_left || rem.deadline_days) || 3;
    
    // TR saatine göre hedef son tarih hesabı
    const todayMs = new Date(trTodayStr + 'T00:00:00').getTime();
    const dueMs = todayMs + (days * 86400000);
    const trDueStr = new Date(dueMs).toLocaleDateString('en-CA', { timeZone: 'Europe/Istanbul' });

    const clean = {
      id: 'rem-' + Date.now(),
      target_type: rem.target_type || 'HSG Çin',
      supplier_name: rem.supplier_name || 'Genel Tedarikçi',
      reference_id: '#REF-' + Math.floor(1000 + Math.random() * 9000),
      title: rem.title,
      deadline_days: days,
      days_left: days,
      created_at: trTodayStr,
      due_date: trDueStr,
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
          deadline_days: clean.deadline_days,
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

