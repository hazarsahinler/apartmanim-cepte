# 🏢 Apartmanım Cepte

Modern apartman ve site yönetimi için geliştirilmiş full-stack web uygulaması.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://apartmanimcepte.me)
[![React](https://img.shields.io/badge/React-18.x-61dafb?logo=react)](https://reactjs.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-6db33f?logo=springboot)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ed?logo=docker)](https://www.docker.com/)

---

## 📋 İçindekiler

- [Özellikler](#-özellikler)
- [Teknolojiler](#-teknolojiler)
- [Ekran Görüntüleri](#-ekran-görüntüleri)
- [Kurulum](#-kurulum)
- [Proje Yapısı](#-proje-yapısı)
- [API Dokümantasyonu](#-api-dokümantasyonu)
- [Katkıda Bulunma](#-katkıda-bulunma)
- [Lisans](#-lisans)

---

## ✨ Özellikler

### 👤 Kullanıcı Özellikleri
- 🔐 Güvenli giriş ve kayıt sistemi
- 🏠 Daire bilgilerini görüntüleme
- 💰 Aidat ve borç takibi
- 📢 Duyuruları görüntüleme
- 💳 Online ödeme yapabilme
- 📊 Kişisel dashboard

### 👨‍💼 Yönetici Özellikleri
- 🏗️ Site ve blok yönetimi
- 🏠 Daire ekleme/düzenleme/silme
- 👥 Sakin yönetimi
- 📢 Duyuru oluşturma ve yönetimi
- 💰 Aidat ve gider takibi
- 📈 Finansal raporlama
- 💳 Ödeme istekleri oluşturma
- 📊 Gelişmiş yönetici dashboard'u

### 🛠️ Teknik Özellikler
- 📱 Responsive tasarım (mobil uyumlu)
- 🌙 Koyu/Açık tema desteği
- 🔄 Gerçek zamanlı veri güncelleme
- 🔒 JWT tabanlı kimlik doğrulama
- 🚀 Docker ile kolay deployment
- ⚡ CI/CD pipeline (GitHub Actions)

---

## 🛠 Teknolojiler

### Frontend
| Teknoloji | Açıklama |
|-----------|----------|
| React 18 | UI kütüphanesi |
| Tailwind CSS | Utility-first CSS framework |
| React Router | Client-side routing |
| Axios | HTTP client |
| Context API | State management |
| Craco | Create React App configuration |

### Backend
| Teknoloji | Açıklama |
|-----------|----------|
| Spring Boot 3 | Java framework |
| Spring Security | Kimlik doğrulama & yetkilendirme |
| Spring Data JPA | ORM |
| PostgreSQL | Veritabanı |
| JWT | Token tabanlı auth |
| Maven | Build tool |

### DevOps
| Teknoloji | Açıklama |
|-----------|----------|
| Docker | Containerization |
| Docker Compose | Multi-container orchestration |
| Nginx | Reverse proxy & static file server |
| GitHub Actions | CI/CD |
| Let's Encrypt | SSL sertifikası |
| DigitalOcean | Cloud hosting |

---

## 📸 Ekran Görüntüleri

<details>
<summary>🖼️ Ekran görüntülerini görmek için tıklayın</summary>

### Ana Sayfa
![Ana Sayfa](docs/screenshots/homepage.png)

### Yönetici Dashboard
![Dashboard](docs/screenshots/dashboard.png)

### Duyuru Yönetimi
![Duyurular](docs/screenshots/announcements.png)

### Finansal İşlemler
![Finansal](docs/screenshots/finance.png)

</details>

---

## 🚀 Kurulum

### Gereksinimler

- Node.js 18+
- Java 17+
- PostgreSQL 15+
- Docker & Docker Compose (opsiyonel)

### 🐳 Docker ile Kurulum (Önerilen)

```bash
# Repo'yu klonla
git clone https://github.com/hazarsahinler/apartmanim-cepte.git
cd apartmanim-cepte

# Docker ile başlat
docker-compose up -d
```

Uygulama şu adreslerde çalışacak:
- Frontend: http://localhost:3000
- Backend: http://localhost:8080
- Database: localhost:5432

### 💻 Manuel Kurulum

#### Backend

```bash
cd backend

# application.properties dosyasını düzenle
# Veritabanı bağlantı bilgilerini gir

# Çalıştır
./mvnw spring-boot:run
```

#### Frontend

```bash
cd frontend

# Bağımlılıkları yükle
npm install

# Development modunda çalıştır
npm start

# Production build al
npm run build
```

### ⚙️ Ortam Değişkenleri

Frontend için `.env` dosyası oluşturun:

```env
REACT_APP_API_URL=http://localhost:8080/api
```

---

## 📁 Proje Yapısı

```
apartmanim-cepte/
│
├── frontend/                   # React uygulaması
│   ├── src/
│   │   ├── components/         # Tekrar kullanılan bileşenler
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── ...
│   │   ├── pages/              # Sayfa bileşenleri
│   │   │   ├── auth/           # Giriş/Kayıt sayfaları
│   │   │   ├── DashboardNew.jsx
│   │   │   ├── Duyurular.jsx
│   │   │   └── ...
│   │   ├── services/           # API servisleri
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   └── ...
│   │   ├── contexts/           # React Context'leri
│   │   ├── constants/          # Sabit değerler
│   │   └── utils/              # Yardımcı fonksiyonlar
│   ├── public/
│   └── package.json
│
├── backend/                    # Spring Boot uygulaması
│   ├── src/main/java/
│   │   ├── controller/         # REST API endpoints
│   │   ├── service/            # İş mantığı
│   │   ├── repository/         # Veritabanı işlemleri
│   │   ├── model/              # Entity sınıfları
│   │   ├── dto/                # Data transfer objects
│   │   ├── security/           # JWT & Spring Security
│   │   └── config/             # Konfigürasyon sınıfları
│   └── pom.xml
│
├── .github/
│   └── workflows/              # CI/CD pipeline
│       └── deploy-frontend.yml
│
├── docker-compose.yml
└── README.md
```

---

## 📚 API Dokümantasyonu

### Kimlik Doğrulama

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/api/auth/login` | Kullanıcı girişi |
| POST | `/api/auth/register` | Kullanıcı kaydı |
| POST | `/api/auth/refresh` | Token yenileme |

### Site Yönetimi

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/sites` | Tüm siteleri getir |
| GET | `/api/sites/{id}` | Site detayı |
| POST | `/api/sites` | Yeni site ekle |
| PUT | `/api/sites/{id}` | Site güncelle |
| DELETE | `/api/sites/{id}` | Site sil |

### Blok Yönetimi

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/bloklar/site/{siteId}` | Siteye ait bloklar |
| POST | `/api/bloklar` | Yeni blok ekle |
| PUT | `/api/bloklar/{id}` | Blok güncelle |
| DELETE | `/api/bloklar/{id}` | Blok sil |

### Daire Yönetimi

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/daireler/blok/{blokId}` | Bloğa ait daireler |
| POST | `/api/daireler` | Yeni daire ekle |
| PUT | `/api/daireler/{id}` | Daire güncelle |
| DELETE | `/api/daireler/{id}` | Daire sil |

### Duyuru Yönetimi

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/duyurular/site/{siteId}` | Siteye ait duyurular |
| POST | `/api/duyurular` | Yeni duyuru oluştur |
| PUT | `/api/duyurular/{id}` | Duyuru güncelle |
| DELETE | `/api/duyurular/{id}` | Duyuru sil |

### Finansal İşlemler

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/giderler/site/{siteId}` | Site giderleri |
| POST | `/api/giderler` | Yeni gider ekle |
| GET | `/api/alacaklar/daire/{daireId}` | Daire borçları |
| POST | `/api/odeme-istekleri` | Ödeme isteği oluştur |

---

## 🤝 Katkıda Bulunma

Katkılarınızı memnuniyetle karşılıyoruz! 

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/YeniOzellik`)
3. Değişikliklerinizi commit edin (`git commit -m 'Yeni özellik eklendi'`)
4. Branch'ı push edin (`git push origin feature/YeniOzellik`)
5. Pull Request açın

### Geliştirme Kuralları

- Commit mesajları Türkçe ve açıklayıcı olmalı
- Her yeni özellik için ayrı branch açılmalı
- Kod standartlarına uyulmalı (ESLint, Prettier)
- Test coverage düşürülmemeli

---

## 📄 Lisans

Bu proje [MIT Lisansı](LICENSE) altında lisanslanmıştır.

---

## 👨‍💻 Geliştirici

**Hazar Şahinler**

[![GitHub](https://img.shields.io/badge/GitHub-hazarsahinler-181717?logo=github)](https://github.com/hazarsahinler)

---

## 🙏 Teşekkürler

- [React](https://reactjs.org/) - UI kütüphanesi
- [Spring Boot](https://spring.io/projects/spring-boot) - Backend framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [DigitalOcean](https://www.digitalocean.com/) - Cloud hosting

---

<p align="center">
  ⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!
</p>
