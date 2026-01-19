# 🏠 Apartmanım Cepte - Proje Yönetim Kılavuzu

## 📋 İçindekiler
1. [Proje Yapısı](#-proje-yapısı)
2. [Sunucu Bilgileri](#-sunucu-bilgileri)
3. [Lokal Geliştirme](#-lokal-geliştirme)
4. [Deploy Süreci](#-deploy-süreci)
5. [Sık Kullanılan Komutlar](#-sık-kullanılan-komutlar)
6. [Sorun Giderme](#-sorun-giderme)

---

## 🏗 Proje Yapısı

```
apartmanim-cepte/
├── frontend/          # React uygulaması
├── backend/           # Spring Boot API
├── .github/
│   └── workflows/
│       ├── deploy-frontend.yml
│       └── deploy-backend.yml
└── docker-compose.yml
```

### Docker Container'lar
| Container | Port | Açıklama |
|-----------|------|----------|
| apartman-frontend | 3000 → 80 | React + Nginx |
| apartman-backend | 8080 | Spring Boot API |
| apartman-db | 5432 | PostgreSQL |

---

## 🖥 Sunucu Bilgileri

- **IP:** 142.93.139.200
- **Domain:** apartmanimcepte.me
- **SSH Key:** `~/.ssh/apartmanim_key`
- **SSL:** Let's Encrypt (otomatik yenilenir)

### SSH Bağlantı
```powershell
ssh -i "$env:USERPROFILE\.ssh\apartmanim_key" root@142.93.139.200
```

---

## 💻 Lokal Geliştirme

### Frontend Başlatma
```powershell
cd frontend
npm install
npm start
```
Tarayıcıda: http://localhost:3000

### Backend Başlatma
```powershell
cd backend
./mvnw spring-boot:run
```
API: http://localhost:8080

---

## 🚀 Deploy Süreci

### Yöntem 1: Otomatik Deploy (Önerilen) ✅

GitHub'a push yaptığında otomatik deploy olur:

```powershell
# Frontend değişiklikleri
cd frontend
git add .
git commit -m "feat: yeni özellik açıklaması"
git push origin main
```

GitHub Actions otomatik olarak:
1. Build yapar
2. Sunucuya dosyaları kopyalar
3. Docker container'ı günceller

### Yöntem 2: Manuel Deploy (Acil Durumlar İçin)

```powershell
# 1. Build yap
cd frontend
npm run build

# 2. Sunucuya kopyala
scp -i "$env:USERPROFILE\.ssh\apartmanim_key" -r build/* root@142.93.139.200:/tmp/frontend-build/

# 3. Container'a aktar
ssh -i "$env:USERPROFILE\.ssh\apartmanim_key" root@142.93.139.200 "docker cp /tmp/frontend-build/. apartman-frontend:/usr/share/nginx/html/ && docker exec apartman-frontend chmod -R 755 /usr/share/nginx/html/"
```

### Yöntem 3: Docker Image Yeniden Build (Büyük Değişiklikler)

```powershell
ssh -i "$env:USERPROFILE\.ssh\apartmanim_key" root@142.93.139.200

# Sunucuda:
cd /root/apartmanim-cepte
git pull
docker-compose build frontend
docker-compose up -d frontend
```

---

## 📝 Sık Kullanılan Komutlar

### Sunucu Bağlantı
```powershell
# SSH bağlantı
ssh -i "$env:USERPROFILE\.ssh\apartmanim_key" root@142.93.139.200
```

### Docker Komutları (Sunucuda)
```bash
# Container durumunu gör
docker ps

# Logları gör
docker logs apartman-frontend --tail 100
docker logs apartman-backend --tail 100

# Container yeniden başlat
docker restart apartman-frontend
docker restart apartman-backend

# Tüm sistemi yeniden başlat
docker-compose restart
```

### Git Komutları
```powershell
# Değişiklikleri gör
git status

# Commit ve push
git add .
git commit -m "açıklama"
git push origin main

# Son commit'leri gör
git log --oneline -5
```

### Build Komutları
```powershell
# Frontend build
cd frontend
npm run build

# Backend build
cd backend
./mvnw clean package -DskipTests
```

---

## 🔧 Sorun Giderme

### Site Açılmıyor
```powershell
# 1. Container çalışıyor mu?
ssh -i "$env:USERPROFILE\.ssh\apartmanim_key" root@142.93.139.200 "docker ps"

# 2. Container loglarına bak
ssh -i "$env:USERPROFILE\.ssh\apartmanim_key" root@142.93.139.200 "docker logs apartman-frontend --tail 50"

# 3. Container'ı yeniden başlat
ssh -i "$env:USERPROFILE\.ssh\apartmanim_key" root@142.93.139.200 "docker restart apartman-frontend"
```

### "Unexpected token '<'" Hatası
Bu hata JS dosyası yerine HTML döndürüldüğünde olur.

```powershell
# İzinleri düzelt
ssh -i "$env:USERPROFILE\.ssh\apartmanim_key" root@142.93.139.200 "docker exec apartman-frontend chmod -R 755 /usr/share/nginx/html/"
```

### Cache Sorunu (Eski Versiyon Görünüyor)
1. Tarayıcıda `Ctrl + Shift + R` (Hard Refresh)
2. Gizli pencerede test et
3. Tarayıcı cache temizle

### Deploy Yansımıyor
```powershell
# Container içindeki JS versiyonunu kontrol et
ssh -i "$env:USERPROFILE\.ssh\apartmanim_key" root@142.93.139.200 "docker exec apartman-frontend ls /usr/share/nginx/html/static/js/"

# index.html hangi JS'i gösteriyor?
ssh -i "$env:USERPROFILE\.ssh\apartmanim_key" root@142.93.139.200 "docker exec apartman-frontend cat /usr/share/nginx/html/index.html | grep main"
```

### Backend API Hatası
```powershell
# Backend loglarına bak
ssh -i "$env:USERPROFILE\.ssh\apartmanim_key" root@142.93.139.200 "docker logs apartman-backend --tail 100"

# Backend'i yeniden başlat
ssh -i "$env:USERPROFILE\.ssh\apartmanim_key" root@142.93.139.200 "docker restart apartman-backend"
```

### Veritabanı Sorunu
```powershell
# PostgreSQL'e bağlan
ssh -i "$env:USERPROFILE\.ssh\apartmanim_key" root@142.93.139.200 "docker exec -it apartman-db psql -U postgres -d apartman"
```

---

## 🔑 Önemli Dosya Konumları

### Sunucuda
| Konum | Açıklama |
|-------|----------|
| `/root/apartmanim-cepte/` | Proje ana dizini |
| `/usr/share/nginx/html/` (container içi) | Frontend dosyaları |
| `/var/www/html/` | Nginx default (kullanılmıyor) |

### Lokalde
| Konum | Açıklama |
|-------|----------|
| `frontend/src/` | React kaynak kodları |
| `frontend/build/` | Production build |
| `backend/src/` | Spring Boot kaynak kodları |

---

## 📅 Güncellenme Tarihi
Son güncelleme: 19 Ocak 2026

---

## 🆘 Acil Durumda
Eğer site tamamen çöktüyse:

```powershell
ssh -i "$env:USERPROFILE\.ssh\apartmanim_key" root@142.93.139.200

# Sunucuda tüm servisleri yeniden başlat
cd /root/apartmanim-cepte
docker-compose down
docker-compose up -d
```
