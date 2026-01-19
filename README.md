# 🏢 Apartmanım Cepte

Apartman ve site yönetimi için geliştirilmiş **Modüler Monolith** mimaride full-stack web uygulaması.

[![Live Demo](https://img.shields.io/badge/🌐_Demo-apartmanimcepte.me-brightgreen)](https://apartmanimcepte.me)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.5-6db33f?logo=springboot)](https://spring.io/projects/spring-boot)
[![Hibernate](https://img.shields.io/badge/Hibernate-6.4.2-59666c?logo=hibernate)](https://hibernate.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ed?logo=docker)](https://www.docker.com/)

---

## 📋 İçindekiler

1. [Proje Hakkında](#-proje-hakkında)
2. [Mimari Tasarım](#-mimari-tasarım)
3. [Modüller](#-modüller)
4. [Teknoloji Stack](#-teknoloji-stack)
5. [Veritabanı Tasarımı](#-veritabanı-tasarımı)
6. [İş Akışları](#-iş-akışları)
7. [Kurulum](#-kurulum)
8. [Proje Yapısı](#-proje-yapısı)

---

## 🎯 Proje Hakkında

**Apartmanım Cepte**, apartman ve site yöneticilerinin günlük işlerini dijitalleştiren bir platformdur. Yöneticiler site, blok ve daire yapılarını oluşturabilir; sakinlere aidat tanımlayabilir, giderleri kaydedebilir ve duyurular yayınlayabilir. Sakinler ise borç durumlarını takip edebilir ve site duyurularını görüntüleyebilir.

### Temel Özellikler

| Rol | Özellikler |
|-----|------------|
| **Yönetici** | Site/Blok/Daire CRUD, Aidat tanımlama, Gider kaydı, Duyuru yönetimi, Ödeme onaylama |
| **Sakin** | Borç görüntüleme, Ödeme talebi, Duyuru okuma, Profil yönetimi |

---

## 🏛 Mimari Tasarım

### Neden Modüler Monolith?

Proje, **Modüler Monolith** mimari deseni ile geliştirilmiştir. Her modül kendi iş mantığını, veri erişim katmanını ve API'lerini içerir. Microservice karmaşıklığı olmadan, gevşek bağlı (loosely coupled) bir yapı sunar.

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        APARTMANIM CEPTE BACKEND                          │
│                          Spring Boot 3.5.5                               │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐     │
│   │    IDENTITY     │    │   STRUCTURE     │    │  ANNOUNCEMENT   │     │
│   │     Modülü      │    │     Modülü      │    │     Modülü      │     │
│   ├─────────────────┤    ├─────────────────┤    ├─────────────────┤     │
│   │ • Kullanıcı     │    │ • Site          │    │ • Duyuru        │     │
│   │ • JWT Auth      │    │ • Blok          │    │                 │     │
│   │ • Rol Yönetimi  │    │ • Daire         │    │                 │     │
│   │ • Security      │    │ • Daire-Sakin   │    │                 │     │
│   └────────┬────────┘    └────────┬────────┘    └────────┬────────┘     │
│            │                      │                      │              │
│            └──────────────────────┼──────────────────────┘              │
│                                   │                                      │
│                    ┌──────────────┴──────────────┐                       │
│                    │         FINANCE             │                       │
│                    │          Modülü             │                       │
│                    ├─────────────────────────────┤                       │
│                    │ • Borç Tanımı (Aidat)       │                       │
│                    │ • Daire Borç                │                       │
│                    │ • Borç Ödeme İsteği         │                       │
│                    │ • Gider                     │                       │
│                    │ • Gider Belgesi             │                       │
│                    └─────────────────────────────┘                       │
│                                                                          │
├──────────────────────────────────────────────────────────────────────────┤
│                         PERSISTENCE LAYER                                │
│                    Hibernate 6.4.2 + PostgreSQL 15                       │
└──────────────────────────────────────────────────────────────────────────┘
```

### Mimari Avantajları

| Özellik | Açıklama |
|---------|----------|
| **Modül Bağımsızlığı** | Her modül kendi entity, DTO, DAO ve controller'ına sahip |
| **Kolay Bakım** | Bir modüldeki değişiklik diğerlerini etkilemez |
| **Transaction Yönetimi** | Tek veritabanı ile ACID garantisi |
| **Basit Deployment** | Tek JAR dosyası, tek container |
| **Microservice'e Geçiş** | Modüller bağımsız olduğu için kolayca ayrılabilir |

---

## 📦 Modüller

### 1️⃣ Identity Modülü (Kimlik & Güvenlik)

Kullanıcı yönetimi ve JWT tabanlı kimlik doğrulama işlemlerinden sorumlu ana modül.

```
identity/
├── bus/                    # İş mantığı servisleri
├── config/                 # Security & JWT konfigürasyonu
├── controller/             # Auth & User REST endpoints
├── dao/                    # Kullanıcı repository
├── dto/                    # Login/Register request-response
├── entity/
│   └── Kullanici.java      # Kullanıcı entity
├── Enum/                   # KullaniciRol (YONETICI, KULLANICI)
└── filter/                 # JWT Authentication Filter
```

**Temel İşlevler:**
- Kullanıcı kayıt (Yönetici/Sakin)
- JWT token üretimi ve doğrulama
- Rol tabanlı yetkilendirme
- Şifre hashleme (BCrypt)

**Akış:**
```
[Login Request] → [AuthController] → [AuthService] → [JWT Token Üretimi]
                                           ↓
                                    [KullaniciDAO] → [PostgreSQL]
```

---

### 2️⃣ Structure Modülü (Yapı Yönetimi)

Site, blok ve daire hiyerarşisini yöneten modül. Yöneticilerin fiziksel yapıyı sisteme tanımlamasını sağlar.

```
structure/
├── bus/                    # Site, Blok, Daire servisleri
├── controller/             # REST endpoints
├── dao/                    # Repository sınıfları
├── dto/                    # Request-Response DTO'ları
└── entity/
    ├── Site.java           # Ana site entity
    ├── Blok.java           # Blok entity (Site'e bağlı)
    └── Daire.java          # Daire entity (Blok'a bağlı)
```

**Hiyerarşi:**
```
Site (1) ──────┬────────> Blok (N) ──────┬────────> Daire (N)
               │                         │
               │                         └────────> DaireSakin (N:M)
               │
               └────────> Yönetici (1) [identity modülünden]
```

**Temel İşlevler:**
- Site oluşturma ve yönetici atama
- Site altına blok ekleme
- Blok altına daire ekleme
- Daireye sakin atama (DaireSakin ilişki tablosu)

---

### 3️⃣ Finance Modülü (Finansal İşlemler)

Aidat, borç ve gider yönetimini sağlayan ana iş modülü. Sistemin en kapsamlı modülüdür.

```
finance/
├── bus/                    # Finansal iş mantığı servisleri
├── controller/             
│   ├── BorcTanimiController
│   ├── DaireBorcController
│   ├── BorcOdemeIstekController
│   ├── GiderController
│   └── GiderBelgeController
├── dao/                    # Repository sınıfları
├── dto/                    # Request-Response DTO'ları
├── entity/
│   ├── BorcTanimi.java     # Aidat tanımı (site bazlı)
│   ├── DaireBorc.java      # Daire-borç ilişkisi
│   ├── BorcOdemeIstek.java # Ödeme talepleri
│   ├── Gider.java          # Site giderleri
│   └── GiderBelge.java     # Gider belgeleri (fatura vs)
└── Enum/
    ├── BorcTuru            # AIDAT, EK_AIDAT, OZEL
    └── GiderTuru           # ELEKTRIK, SU, DOGALGAZ, BAKIM...
```

**Borç Akışı:**
```
┌─────────────────────────────────────────────────────────────────────────┐
│                           BORÇ YAŞAM DÖNGÜSÜ                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  1. YÖNETİCİ                2. SİSTEM                3. SAKİN           │
│  ───────────                ─────────                ────────           │
│                                                                         │
│  [BorcTanimi Oluştur]                                                   │
│        │                                                                │
│        ▼                                                                │
│  Site için aidat          ───────────►  [DaireBorc Kayıtları]           │
│  tanımı yapılır                         Her daireye borç atanır         │
│  (tutar, vade, açıklama)                                                │
│                                                   │                     │
│                                                   ▼                     │
│                                         Sakin borçlarını görür          │
│                                                   │                     │
│                                                   ▼                     │
│                                         [BorcOdemeIstek]                │
│                                         Ödeme talebi oluşturur          │
│        │                                         │                      │
│        ◄─────────────────────────────────────────┘                      │
│        │                                                                │
│        ▼                                                                │
│  [Ödeme Onaylama]                                                       │
│  Yönetici onaylar         ───────────►  DaireBorc.odendi = true         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Gider Akışı:**
```
[Yönetici] → [Gider Kaydı] → [GiderBelge Yükleme (Opsiyonel)]
                 │
                 ▼
           Site giderleri
           raporlanabilir
```

---

### 4️⃣ Announcement Modülü (Duyuru Yönetimi)

Site duyurularının oluşturulması ve yayınlanmasından sorumlu modül.

```
announcement/
├── bus/                    # Duyuru servisleri
├── controller/             # Duyuru REST endpoints
├── dao/                    # Duyuru repository
├── dto/                    # Duyuru DTO'ları
├── entity/
│   └── Duyuru.java         # Duyuru entity
└── Enum/
    └── DuyuruTipi          # GENEL, ACIL, BAKIM, TOPLANTI
```

**İşleyiş:**
```
[Yönetici] → [Duyuru Oluştur] → [Site'ye bağlı duyuru kaydı]
                                          │
                                          ▼
                              [Sakinler duyuruları görüntüler]
```

---

## 🛠 Teknoloji Stack

### Backend Core

| Teknoloji | Versiyon | Kullanım Amacı |
|-----------|----------|----------------|
| **Java** | 17 LTS | Ana programlama dili |
| **Spring Boot** | 3.5.5 | Application framework |
| **Spring Security** | 3.3.3 | Authentication & Authorization |
| **Spring Web** | 3.5.5 | REST API |
| **Spring Validation** | 3.5.5 | DTO validasyonu |
| **Hibernate ORM** | 6.4.2 | Object-Relational Mapping |
| **Spring ORM** | 6.x | Hibernate entegrasyonu |
| **PostgreSQL** | 15 | İlişkisel veritabanı |
| **jjwt** | 0.12.6 | JWT token işlemleri |
| **Lombok** | 1.18.x | Boilerplate kod azaltma |
| **SpringDoc OpenAPI** | 2.2.0 | Swagger API dokümantasyonu |

### DevOps

| Teknoloji | Kullanım Amacı |
|-----------|----------------|
| **Docker** | Containerization |
| **Docker Compose** | Multi-container orchestration |
| **Nginx** | Reverse proxy, SSL termination |
| **GitHub Actions** | CI/CD pipeline |
| **Let's Encrypt** | SSL/TLS sertifikası |
| **DigitalOcean** | Cloud VPS hosting |

### Frontend

| Teknoloji | Kullanım Amacı |
|-----------|----------------|
| React 18 | UI library |
| Tailwind CSS | Utility-first CSS |
| Axios | HTTP client |
| React Router | Client-side routing |

---

## 🗄 Veritabanı Tasarımı

### ER Diagram

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│    kullanici    │       │     siteler     │       │     bloklar     │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ kullanici_id PK │◄──┐   │ site_id PK      │◄──────│ blok_id PK      │
│ kullanici_ad    │   │   │ site_isim       │       │ blok_isim       │
│ kullanici_soyad │   │   │ site_il         │       │ site_id FK      │
│ kullanici_eposta│   │   │ site_ilce       │       └────────┬────────┘
│ kullanici_sifre │   │   │ site_mahalle    │                │
│ kullanici_tel   │   │   │ site_sokak      │                │
│ apartmanno      │   │   │ yonetici_id FK──┼────────┐       │
│ konutkullanim   │   │   └─────────────────┘        │       │
└─────────────────┘   │                              │       │
        ▲             │                              │       │
        │             │   ┌──────────────────────────┘       │
        │             │   │                                  │
┌───────┴─────────┐   │   │   ┌─────────────────┐            │
│  daire_sakinler │   │   │   │    daireler     │◄───────────┘
├─────────────────┤   │   │   ├─────────────────┤
│ daire_id FK     │   │   │   │ daire_id PK     │
│ kullanici_id FK─┼───┘   │   │ daire_no        │
└─────────────────┘       │   │ kat_no          │
                          │   │ blok_id FK      │
                          │   └────────┬────────┘
                          │            │
┌─────────────────┐       │            │        ┌─────────────────┐
│   borctanimi    │       │            │        │    daireborc    │
├─────────────────┤       │            │        ├─────────────────┤
│ borc_tanim_id PK│◄──────┼────────────┼────────│ daire_borc_id PK│
│ aciklama        │       │            │        │ borc_tanim_id FK│
│ borc_turu       │       │            └───────►│ daire_id FK     │
│ olusturma_tarih │       │                     │ tutar           │
│ son_odeme_tarih │       │                     │ odeme_tarihi    │
│ tutar           │       │                     │ odendi_mi       │
│ site_id FK──────┼───────┘                     └────────┬────────┘
└─────────────────┘                                      │
                                                         │
┌─────────────────┐       ┌─────────────────┐            │
│      gider      │       │ borcodemeistek  │◄───────────┘
├─────────────────┤       ├─────────────────┤
│ gider_id PK     │       │ id PK           │
│ gider_aciklama  │       │ istek_tarih     │
│ gider_olusturma │       │ onay_tarih      │
│ gider_turu      │       │ onaylandi_mi    │
│ gider_tutar     │       │ daire_borc_id FK│
│ site_id FK      │       └─────────────────┘
│ aktif           │
└────────┬────────┘
         │
         │        ┌─────────────────┐
         │        │   giderbelge    │
         └───────►├─────────────────┤
                  │ gider_belge_id  │
                  │ dosya_ad        │
                  │ dosya_boyutu    │
                  │ dosya_turu      │
                  │ dosya_yolu      │
                  │ yukleme_tarih   │
                  │ gider_id FK     │
                  │ aktif           │
                  └─────────────────┘

┌─────────────────┐
│    duyurular    │
├─────────────────┤
│ duyuru_id PK    │
│ baslik          │
│ icerik          │
│ olusturma_tarih │
│ duyuru_tipi     │
│ site_id FK      │
└─────────────────┘
```

### Tablo Açıklamaları

| Tablo | Modül | Açıklama |
|-------|-------|----------|
| `kullanici` | identity | Tüm kullanıcılar (yönetici & sakin) |
| `siteler` | structure | Ana site kayıtları |
| `bloklar` | structure | Site'ye bağlı bloklar |
| `daireler` | structure | Blok'a bağlı daireler |
| `daire_sakinler` | structure | Daire-Kullanıcı many-to-many ilişkisi |
| `borctanimi` | finance | Aidat tanımları (site bazlı) |
| `daireborc` | finance | Daireye atanmış borçlar |
| `borcodemeistekleri` | finance | Sakinlerin ödeme talepleri |
| `gider` | finance | Site giderleri |
| `giderbelge` | finance | Gidere ait belgeler |
| `duyurular` | announcement | Site duyuruları |

---

## 🔄 İş Akışları

### 1. Site Kurulum Akışı
Yönetici ilk kayıt sonrası giriş yapar.Giriş sonrasında site eklemek zorunludur.
<img width="1919" height="946" alt="1-YöneticiİlkGiriş" src="https://github.com/user-attachments/assets/dc2d0ed7-09d4-402c-a3e8-cbb1997bfc79" />

### 2. Aidat Yönetim Akışı

```
┌────────────────────────────────────────────────────────────────┐
│                    AİDAT YÖNETİM SÜRECİ                        │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────┐                                              │
│  │   YÖNETİCİ   │                                              │
│  └──────┬───────┘                                              │
│         │                                                      │
│         ▼                                                      │
│  [1] Borç Tanımı Oluştur                                       │
│      POST /api/borc-tanimi                                     │
│      {                                                         │
│        "aciklama": "Ocak 2026 Aidatı",                         │
│        "borcTuru": "AIDAT",                                    │
│        "tutar": 500.00,                                        │
│        "sonOdemeTarihi": "2026-01-31",                         │
│        "siteId": 1                                             │
│      }                                                         │
│         │                                                      │
│         ▼                                                      │
│  [2] Sistem otomatik olarak sitedeki                           │
│      her daireye DaireBorc kaydı oluşturur                     │
│         │                                                      │
│         ▼                                                      │
│  ┌──────────────┐                                              │
│  │    SAKİN     │                                              │
│  └──────┬───────┘                                              │
│         │                                                      │
│         ▼                                                      │
│  [3] Borçlarını Görüntüler                                     │
│      GET /api/daire-borc/daire/{daireId}                       │
│         │                                                      │
│         ▼                                                      │
│  [4] Ödeme İsteği Oluşturur                                    │
│      POST /api/odeme-istek                                     │
│      { "daireBorcId": 15 }                                     │
│         │                                                      │
│         ▼                                                      │
│  ┌──────────────┐                                              │
│  │   YÖNETİCİ   │                                              │
│  └──────┬───────┘                                              │
│         │                                                      │
│         ▼                                                      │
│  [5] Ödeme İsteklerini Görüntüler                              │
│      GET /api/odeme-istek/site/{siteId}                        │
│         │                                                      │
│         ▼                                                      │
│  [6] Ödemeyi Onaylar                                           │
│      PUT /api/odeme-istek/{id}/onayla                          │
│         │                                                      │
│         ▼                                                      │
│  [7] DaireBorc.odendiMi = true olur ✓                          │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### 3. Kimlik Doğrulama Akışı

```
┌────────────────────────────────────────────────────────────────┐
│                    JWT AUTH AKIŞI                              │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  [Client]                              [Server]                │
│     │                                      │                   │
│     │  POST /api/auth/login                │                   │
│     │  { email, password }                 │                   │
│     │─────────────────────────────────────►│                   │
│     │                                      │                   │
│     │                         [AuthController]                 │
│     │                               │                          │
│     │                               ▼                          │
│     │                         [AuthService]                    │
│     │                               │                          │
│     │                               ▼                          │
│     │                      Password Check (BCrypt)             │
│     │                               │                          │
│     │                               ▼                          │
│     │                        JWT Token Üret                    │
│     │                               │                          │
│     │◄──────────────────────────────┘                          │
│     │  { token, kullaniciId, rol }                             │
│     │                                                          │
│     │  GET /api/protected-endpoint                             │
│     │  Header: Authorization: Bearer {token}                   │
│     │─────────────────────────────────────►│                   │
│     │                                      │                   │
│     │                         [JwtAuthFilter]                  │
│     │                               │                          │
│     │                               ▼                          │
│     │                        Token Doğrula                     │
│     │                               │                          │
│     │                               ▼                          │
│     │                    SecurityContext'e User Set            │
│     │                               │                          │
│     │                               ▼                          │
│     │                         [Controller]                     │
│     │◄──────────────────────────────┘                          │
│     │  Response                                                │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Kurulum

### Gereksinimler

- Java 17+
- Maven 3.9+
- PostgreSQL 15+
- Docker & Docker Compose (opsiyonel)

### 🐳 Docker ile Kurulum

```bash
# Repo'yu klonla
git clone https://github.com/hazarsahinler/apartmanim-cepte.git
cd apartmanim-cepte

# Docker ile başlat
docker-compose up -d
```

| Container | Port | Açıklama |
|-----------|------|----------|
| apartman-frontend | 3000 | React + Nginx |
| apartman-backend | 8080 | Spring Boot API |
| apartman-db | 5432 | PostgreSQL |

### 💻 Manuel Kurulum

```bash
# Backend
cd backend
./mvnw clean package -DskipTests
java -jar target/backend-0.0.1-SNAPSHOT.jar

# Frontend
cd frontend
npm install
npm start
```

### Swagger API Docs

Backend çalışırken: `http://localhost:8080/swagger-ui.html`

---

## 📁 Proje Yapısı

```
apartmanim-cepte/
│
├── backend/                              # Spring Boot Backend
│   ├── src/main/java/com/apartmanimcepte/backend/
│   │   │
│   │   ├── identity/                     # 🔐 KİMLİK MODÜLÜ
│   │   │   ├── bus/                      # AuthService, KullaniciService
│   │   │   ├── config/                   # SecurityConfig, JwtConfig
│   │   │   ├── controller/               # AuthController, KullaniciController
│   │   │   ├── dao/                      # KullaniciDAO
│   │   │   ├── dto/                      # LoginRequest, RegisterRequest, TokenResponse
│   │   │   ├── entity/
│   │   │   │   └── Kullanici.java
│   │   │   ├── Enum/
│   │   │   │   └── KullaniciRol.java     # YONETICI, KULLANICI
│   │   │   └── filter/
│   │   │       └── JwtAuthFilter.java
│   │   │
│   │   ├── structure/                    # 🏗️ YAPI MODÜLÜ
│   │   │   ├── bus/                      # SiteService, BlokService, DaireService
│   │   │   ├── controller/               # SiteController, BlokController, DaireController
│   │   │   ├── dao/                      # SiteDAO, BlokDAO, DaireDAO
│   │   │   ├── dto/                      # SiteDTO, BlokDTO, DaireDTO
│   │   │   └── entity/
│   │   │       ├── Site.java
│   │   │       ├── Blok.java
│   │   │       └── Daire.java
│   │   │
│   │   ├── finance/                      # 💰 FİNANS MODÜLÜ
│   │   │   ├── bus/                      # BorcService, GiderService, OdemeService
│   │   │   ├── controller/
│   │   │   │   ├── BorcTanimiController.java
│   │   │   │   ├── DaireBorcController.java
│   │   │   │   ├── BorcOdemeIstekController.java
│   │   │   │   ├── GiderController.java
│   │   │   │   └── GiderBelgeController.java
│   │   │   ├── dao/
│   │   │   ├── dto/
│   │   │   ├── entity/
│   │   │   │   ├── BorcTanimi.java       # Aidat tanımı
│   │   │   │   ├── DaireBorc.java        # Daire-borç ilişkisi
│   │   │   │   ├── BorcOdemeIstek.java   # Ödeme talepleri
│   │   │   │   ├── Gider.java            # Site giderleri
│   │   │   │   └── GiderBelge.java       # Gider belgeleri
│   │   │   └── Enum/
│   │   │       ├── BorcTuru.java
│   │   │       └── GiderTuru.java
│   │   │
│   │   └── announcement/                 # 📢 DUYURU MODÜLÜ
│   │       ├── bus/                      # DuyuruService
│   │       ├── controller/               # DuyuruController
│   │       ├── dao/                      # DuyuruDAO
│   │       ├── dto/                      # DuyuruDTO
│   │       ├── entity/
│   │       │   └── Duyuru.java
│   │       └── Enum/
│   │           └── DuyuruTipi.java
│   │
│   ├── src/main/resources/
│   │   └── application.properties
│   │
│   └── pom.xml
│
├── frontend/                             # React Frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── contexts/
│   └── package.json
│
├── .github/workflows/
│   └── deploy-frontend.yml               # CI/CD
│
└── docker-compose.yml
```

---

## 👨‍💻 Geliştirici

**Hazar Şahinler** - Backend Developer

[![GitHub](https://img.shields.io/badge/GitHub-hazarsahinler-181717?logo=github)](https://github.com/hazarsahinler)

---

<p align="center">
  ⭐ Projeyi beğendiyseniz yıldız vermeyi unutmayın!
</p>
