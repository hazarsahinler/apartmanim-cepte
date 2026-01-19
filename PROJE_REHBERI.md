# 🏢 Apartmanım Cepte - Proje Rehberi

> **Son Güncelleme:** 19 Ocak 2025  
> **Canlı Site:** https://apartmanimcepte.me

---

## 📋 İçindekiler

1. [Proje Yapısı](#proje-yapısı)
2. [Sunucu Bilgileri](#sunucu-bilgileri)
3. [Lokal Geliştirme](#lokal-geliştirme)
4. [Deploy Yöntemleri](#deploy-yöntemleri)
5. [Docker Komutları](#docker-komutları)
6. [Sorun Giderme](#sorun-giderme)
7. [Git Komutları](#git-komutları)
8. [Sık Yapılan Hatalar](#sık-yapılan-hatalar)

---

## 🏗️ Proje Yapısı

```
apartmanim-cepte/
├── frontend/          # React uygulaması (Bu klasör)
│   ├── src/
│   │   ├── components/   # Tekrar kullanılan bileşenler
│   │   ├── pages/        # Sayfa bileşenleri
│   │   ├── services/     # API servisleri
│   │   ├── contexts/     # React Context'leri
│   │   ├── constants/    # Sabit değerler
│   │   └── utils/        # Yardımcı fonksiyonlar
│   ├── build/            # Production build çıktısı
│   └── public/           # Statik dosyalar
│
├── backend/           # Spring Boot API (ayrı klasör)
├── .github/
│   └── workflows/     # GitHub Actions CI/CD
└── PROJE_REHBERI.md   # Bu dosya
```

---

## 🖥️ Sunucu Bilgileri

| Bilgi | Değer |
|-------|-------|
| **Sunucu** | DigitalOcean Droplet |
| **IP** | `142.93.139.200` |
| **Domain** | `apartmanimcepte.me` |
| **SSL** | Let's Encrypt (Otomatik Yenileme) |
| **OS** | Ubuntu |

### Docker Container'ları

```
┌─────────────────────────────────────────────────────────────┐
│                    SUNUCU (142.93.139.200)                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐  ┌───────────────┐  ┌─────────────┐  │
│  │ apartman-frontend│  │apartman-backend│  │ apartman-db │  │
│  │  (React+Nginx)   │  │ (Spring Boot) │  │ (PostgreSQL)│  │
│  │   Port: 3000     │  │  Port: 8080   │  │ Port: 5432  │  │
│  └──────────────────┘  └───────────────┘  └─────────────┘  │
│                                                             │
│  Frontend dosyaları: /usr/share/nginx/html/ (container içi)│
└─────────────────────────────────────────────────────────────┘
```

### SSH Bağlantısı

**Windows PowerShell:**
```powershell
ssh -i $env:USERPROFILE\.ssh\apartmanim_key root@142.93.139.200
```

**Mac/Linux:**
```bash
ssh -i ~/.ssh/apartmanim_key root@142.93.139.200
```

---

## 💻 Lokal Geliştirme

### Gereksiniimler
- Node.js 18+
- npm

### Kurulum
```bash
cd frontend
npm install
```

### Çalıştırma
```bash
npm start
```
Tarayıcıda: http://localhost:3000

### Build Alma
```bash
npm run build
```
Build dosyaları `frontend/build/` klasörüne oluşturulur.

---

## 🚀 Deploy Yöntemleri

### 🔵 Yöntem 1: Otomatik Deploy (Önerilen)

GitHub'a push yaptığında otomatik deploy olur.

```bash
# Değişiklikleri commit et
git add .
git commit -m "Açıklama"

# Push et - otomatik deploy başlar
git push
```

**Not:** Sadece `frontend/` klasöründeki değişiklikler deploy'u tetikler.

### 🟡 Yöntem 2: Manuel Deploy (Hızlı)

Build alıp direkt sunucuya yükle:

```powershell
# 1. Build al
cd frontend
npm run build

# 2. Build'ı sunucuya gönder
scp -i $env:USERPROFILE\.ssh\apartmanim_key -r build/* root@142.93.139.200:/tmp/frontend-build/

# 3. Sunucuya bağlan
ssh -i $env:USERPROFILE\.ssh\apartmanim_key root@142.93.139.200

# 4. Container'a kopyala (sunucuda çalıştır)
docker cp /tmp/frontend-build/. apartman-frontend:/usr/share/nginx/html/
docker exec apartman-frontend chmod -R 755 /usr/share/nginx/html/
rm -rf /tmp/frontend-build
```

### 🟢 Yöntem 3: Tek Komutla Deploy (En Hızlı)

Sunucuya bağlandıktan sonra tek komutla:

```bash
# Sunucuda çalıştır
docker exec apartman-frontend rm -rf /usr/share/nginx/html/* && \
docker cp /tmp/frontend-build/. apartman-frontend:/usr/share/nginx/html/ && \
docker exec apartman-frontend chmod -R 755 /usr/share/nginx/html/
```

---

## 🐳 Docker Komutları

### Temel Komutlar

```bash
# Container'ları listele
docker ps

# Logları gör
docker logs apartman-frontend
docker logs apartman-backend
docker logs apartman-db

# Container'ı yeniden başlat
docker restart apartman-frontend

# Tüm container'ları yeniden başlat
docker-compose restart

# Container içine gir
docker exec -it apartman-frontend sh
docker exec -it apartman-backend bash
```

### Frontend Dosya Yönetimi

```bash
# Container'daki dosyaları listele
docker exec apartman-frontend ls -la /usr/share/nginx/html/

# index.html içeriğine bak
docker exec apartman-frontend cat /usr/share/nginx/html/index.html

# Dosya kopyala (sunucudan container'a)
docker cp /kaynak/dosya apartman-frontend:/usr/share/nginx/html/

# Dosya kopyala (container'dan sunucuya)
docker cp apartman-frontend:/usr/share/nginx/html/index.html ./
```

### Container Yönetimi

```bash
# Container'ı durdur
docker stop apartman-frontend

# Container'ı başlat
docker start apartman-frontend

# Container'ı sil ve yeniden oluştur
docker-compose up -d --force-recreate apartman-frontend
```

---

## 🔧 Sorun Giderme

### ❌ "Unexpected token '<'" Hatası

**Sebep:** JS dosyaları bulunamıyor, index.html dönüyor.

**Çözüm:**
```bash
# 1. Build dosyalarının doğru yerde olduğunu kontrol et
docker exec apartman-frontend ls -la /usr/share/nginx/html/static/js/

# 2. index.html'deki JS referansını kontrol et
docker exec apartman-frontend cat /usr/share/nginx/html/index.html | grep main

# 3. Dosya varsa ama 404 veriyorsa, nginx'i yeniden başlat
docker restart apartman-frontend
```

### ❌ Site Güncellenmiyor

**Kontrol:**
1. Tarayıcı cache'ini temizle (Ctrl+Shift+R)
2. Build dosyalarının hash'ini kontrol et:
   ```bash
   docker exec apartman-frontend ls /usr/share/nginx/html/static/js/
   ```
3. Yeni build'daki hash ile karşılaştır:
   ```bash
   ls frontend/build/static/js/
   ```

### ❌ 502 Bad Gateway

**Sebep:** Backend container çalışmıyor.

**Çözüm:**
```bash
docker logs apartman-backend
docker restart apartman-backend
```

### ❌ SSL Sertifika Hatası

**Çözüm:**
```bash
# Sertifikaları yenile
certbot renew

# Nginx'i yeniden başlat
docker restart apartman-frontend
```

### ❌ GitHub Actions Deploy Çalışmıyor

**Kontrol:**
1. GitHub → Actions sekmesine git
2. Workflow'un tetiklenip tetiklenmediğini kontrol et
3. Secrets'ların doğru ayarlandığından emin ol:
   - `SERVER_HOST`: 142.93.139.200
   - `SERVER_USER`: root
   - `SSH_PRIVATE_KEY`: Private key içeriği

---

## 📝 Git Komutları

### Günlük Kullanım

```bash
# Değişiklikleri gör
git status

# Tüm değişiklikleri ekle
git add .

# Commit yap
git commit -m "Açıklama"

# Push et
git push

# Son commit'i değiştir
git commit --amend -m "Yeni açıklama"

# Son commit'i geri al (değişiklikleri koru)
git reset --soft HEAD~1
```

### Branch İşlemleri

```bash
# Yeni branch oluştur
git checkout -b feature/yeni-ozellik

# Main'e geç
git checkout main

# Branch'ı main ile birleştir
git merge feature/yeni-ozellik
```

---

## ⚠️ Sık Yapılan Hatalar

### 1. `/var/www/html/` yerine Docker'a yükle!

```bash
# ❌ YANLIŞ - Site güncellenmez
cp -r build/* /var/www/html/

# ✅ DOĞRU - Container'a kopyala
docker cp build/. apartman-frontend:/usr/share/nginx/html/
```

### 2. console.log'ları silme

Production'da console.log güvenlik açığı oluşturur. Silmeden önce multi-line kontrolü yap:

```javascript
// ❌ Bu şekilde silersen hata verir:
console.log("data:", {
  token: "xxx",
  user: "yyy"
});

// Sonuç:
{
  token: "xxx",  // Orphan kod - syntax error
  user: "yyy"
});
```

### 3. Build almadan push etme

Deploy workflow build alır ama test için önce lokal build al:

```bash
npm run build  # Hata var mı kontrol et
git add .
git commit -m "message"
git push
```

---

## 📊 Hızlı Referans

### Sık Kullanılan URL'ler

| Sayfa | URL |
|-------|-----|
| Ana Sayfa | https://apartmanimcepte.me |
| API | https://apartmanimcepte.me/api |
| GitHub Repo | [GitHub Link] |
| GitHub Actions | [GitHub Actions Link] |

### Önemli Dosyalar

| Dosya | Açıklama |
|-------|----------|
| `frontend/src/App.js` | Ana uygulama komponenti |
| `frontend/src/services/api.js` | API konfigürasyonu |
| `frontend/src/config/apiConfig.js` | API URL ayarları |
| `.github/workflows/deploy-frontend.yml` | CI/CD workflow |

### Port Bilgileri

| Servis | Host Port | Container Port |
|--------|-----------|----------------|
| Frontend | 3000 | 80 |
| Backend | 8080 | 8080 |
| Database | 5432 | 5432 |

---

## 📞 Acil Durum Checklist

Site çöktüğünde sırayla kontrol et:

- [ ] `docker ps` - Tüm container'lar çalışıyor mu?
- [ ] `docker logs apartman-frontend` - Hata var mı?
- [ ] `docker logs apartman-backend` - Backend çalışıyor mu?
- [ ] Browser console'da hata var mı? (F12)
- [ ] SSL sertifikası geçerli mi?
- [ ] Sunucuya SSH ile bağlanabiliyor musun?

---

*Bu rehber, projenin sürdürülebilirliği için hazırlanmıştır. Güncelleme gerektiğinde bu dosyayı düzenleyin.*
