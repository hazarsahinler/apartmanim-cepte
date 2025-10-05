/**
 * Site Storage Service
 * Yerel depolama (localStorage) ile site bilgilerinin offline erişim ve önbellekleme
 * işlemlerini yönetir.
 */

// Sabit değişkenler
const STORAGE_KEYS = {
  SITES: 'userSites',
  LAST_FETCH: 'lastSiteFetch',
  SITE_DETAILS: 'siteDetails_',
  USER_SITES_MAPPING: 'userSitesMapping'
};

// Siteleri localStorage'a kaydetme
const saveSites = (sites, userId = null) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SITES, JSON.stringify(sites));
    localStorage.setItem(STORAGE_KEYS.LAST_FETCH, new Date().toISOString());
    
    // Eğer userId varsa, kullanıcı-site eşleşmesini de kaydedelim
    if (userId) {
      const mappingJson = localStorage.getItem(STORAGE_KEYS.USER_SITES_MAPPING);
      let mapping = {};
      
      if (mappingJson) {
        try {
          mapping = JSON.parse(mappingJson);
        } catch (e) {
          console.error('Kullanıcı-site eşleştirme verisi hatalı, sıfırlanıyor');
          mapping = {};
        }
      }
      
      // Bu kullanıcının site ID'lerini kaydet
      mapping[userId] = sites.map(site => site.id);
      localStorage.setItem(STORAGE_KEYS.USER_SITES_MAPPING, JSON.stringify(mapping));
    }
    
    return true;
  } catch (e) {
    console.error('Site verileri önbelleğe kaydedilemedi:', e);
    return false;
  }
};

// Siteleri localStorage'dan getirme
const getSites = (userId = null) => {
  try {
    const sitesJson = localStorage.getItem(STORAGE_KEYS.SITES);
    
    if (!sitesJson) return { sites: [], lastFetch: null };
    
    const sites = JSON.parse(sitesJson);
    const lastFetch = localStorage.getItem(STORAGE_KEYS.LAST_FETCH);
    
    // Eğer userId varsa ve mapping varsa, sadece o kullanıcıya ait siteleri filtrele
    if (userId) {
      const mappingJson = localStorage.getItem(STORAGE_KEYS.USER_SITES_MAPPING);
      if (mappingJson) {
        const mapping = JSON.parse(mappingJson);
        if (mapping[userId]) {
          const userSiteIds = mapping[userId];
          const filteredSites = sites.filter(site => userSiteIds.includes(site.id));
          return { 
            sites: filteredSites, 
            lastFetch: lastFetch ? new Date(lastFetch) : null
          };
        }
      }
    }
    
    return { 
      sites, 
      lastFetch: lastFetch ? new Date(lastFetch) : null 
    };
  } catch (e) {
    console.error('Site verileri önbellekten okunamadı:', e);
    return { sites: [], lastFetch: null };
  }
};

// Yeni site ekleme ve önbellekleme
const addSite = (site, userId = null) => {
  try {
    const { sites } = getSites();
    // ID'si aynı site varsa güncelle, yoksa ekle
    const index = sites.findIndex(s => s.id === site.id);
    
    if (index >= 0) {
      sites[index] = { ...sites[index], ...site };
    } else {
      sites.push(site);
    }
    
    return saveSites(sites, userId);
  } catch (e) {
    console.error('Site eklenirken önbellekleme hatası:', e);
    return false;
  }
};

// Belirli bir sitenin detaylarını kaydetme
const saveSiteDetail = (siteId, siteDetail) => {
  try {
    localStorage.setItem(
      `${STORAGE_KEYS.SITE_DETAILS}${siteId}`,
      JSON.stringify({
        ...siteDetail,
        lastUpdated: new Date().toISOString()
      })
    );
    return true;
  } catch (e) {
    console.error(`Site ${siteId} detayları önbelleğe kaydedilemedi:`, e);
    return false;
  }
};

// Belirli bir sitenin detaylarını getirme
const getSiteDetail = (siteId) => {
  try {
    const detailJson = localStorage.getItem(`${STORAGE_KEYS.SITE_DETAILS}${siteId}`);
    if (!detailJson) return null;
    
    const detail = JSON.parse(detailJson);
    return {
      ...detail,
      lastUpdated: detail.lastUpdated ? new Date(detail.lastUpdated) : null
    };
  } catch (e) {
    console.error(`Site ${siteId} detayları önbellekten okunamadı:`, e);
    return null;
  }
};

// Önbelleğin güncelliğini kontrol etme (24 saatten eski mi?)
const isCacheStale = (lastFetch, maxAge = 24 * 60 * 60 * 1000) => {
  if (!lastFetch) return true;
  
  const now = new Date();
  const fetchTime = new Date(lastFetch);
  
  // Milisaniye cinsinden fark
  return (now - fetchTime) > maxAge;
};

// Belirli bir kullanıcının site verilerini temizleme (çıkış yaparken)
const clearUserSiteData = (userId) => {
  if (!userId) return;
  
  try {
    // Kullanıcı-site eşleştirmesini güncelle
    const mappingJson = localStorage.getItem(STORAGE_KEYS.USER_SITES_MAPPING);
    if (mappingJson) {
      const mapping = JSON.parse(mappingJson);
      if (mapping[userId]) {
        delete mapping[userId];
        localStorage.setItem(STORAGE_KEYS.USER_SITES_MAPPING, JSON.stringify(mapping));
      }
    }
  } catch (e) {
    console.error('Kullanıcı site verisi temizlenirken hata:', e);
  }
};

export const siteStorageService = {
  saveSites,
  getSites,
  addSite,
  saveSiteDetail,
  getSiteDetail,
  isCacheStale,
  clearUserSiteData
};