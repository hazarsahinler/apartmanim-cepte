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
<img width="1919" height="945" alt="2-Yönetici Siteyi oluşturdu" src="https://github.com/user-attachments/assets/4a9fb0d6-3291-4225-a1e4-8a2cc23384f2" />

Siteye Blok ve daireleri ekler.

<img width="1919" height="941" alt="3-Siteye Blok ekleme işlemi" src="https://github.com/user-attachments/assets/c25008cb-9e89-4961-9d5a-0d8593fe4df6" />
<img width="1917" height="948" alt="4-Blok ekleme ekranı" src="https://github.com/user-attachments/assets/3b16a97c-a51b-4fbe-ac14-44ba71a9154a" />
<img width="1917" height="944" alt="5-ekleme sonrası" src="https://github.com/user-attachments/assets/bd253e24-9270-4dc3-ac2a-85662ae3afd3" />
<img width="1919" height="946" alt="6-blok detay" src="https://github.com/user-attachments/assets/d2cca4d2-0d87-4613-9dbe-c8b8e6a4e3d1" />
<img width="1916" height="946" alt="7-dairedetay" src="https://github.com/user-attachments/assets/b2ed6376-e140-42ae-ae26-ad8937fdb7e4" />

Daireye Kullanıcı Ekler.

<img width="1919" height="947" alt="8-daireye kullanıcı eklemek" src="https://github.com/user-attachments/assets/0e984d3a-fab1-4358-9ac8-52666800ebb5" />
<img width="1918" height="948" alt="9-kullanıcıyı bulması" src="https://github.com/user-attachments/assets/b7753ff4-7e03-4c64-805d-1e065ffc3672" />
<img width="1916" height="940" alt="10-kullanıcı eklendkten sonra blok detay" src="https://github.com/user-attachments/assets/1e7a5083-ef2f-4bbb-b9c9-ecaf28ef0544" />


### 2. Finansal Yönetim Akışı

Yönetici alacak veya gider eklemesi yapar. Kullanıcılar alacakları yöneticiye ödemesini yapar ve sistem üzerinden yaptığına dair istek yollar. 
Yönetici isteği kontrol edip onaylar.

<img width="1917" height="944" alt="11-finansal detaylar" src="https://github.com/user-attachments/assets/e6219102-605a-4800-8f4f-b3b47eec4cc1" />
<img width="1919" height="944" alt="12-alacak yönetimi" src="https://github.com/user-attachments/assets/0a41ed33-418d-421a-ae6e-0853a6fc4a31" />
<img width="1918" height="940" alt="13-alacak ekleme sonrası" src="https://github.com/user-attachments/assets/2f9d9c08-533c-4b45-ad46-7e82e4809d3c" />
<img width="1918" height="944" alt="14-gider ekleme" src="https://github.com/user-attachments/assets/c3b9b68d-fd10-4d12-aa37-cec277740117" />
<img width="1917" height="949" alt="15-son görüntü finansal işlemler" src="https://github.com/user-attachments/assets/b560c43d-34f0-4569-adf1-d15569a634cb" />
<img width="1917" height="942" alt="16-detaylıAlacakTakibi" src="https://github.com/user-attachments/assets/acbba572-3d73-4e29-bd8c-1240cc86d897" />
<img width="1919" height="940" alt="17-ödemeistekOnay" src="https://github.com/user-attachments/assets/264bf692-bf85-4b73-9796-ecf728d7b449" />
<img width="1919" height="949" alt="18-ödeme sonrası" src="https://github.com/user-attachments/assets/865b8f8b-49c9-4316-a448-18df286c7728" />




### 3. Duyuru yönetim Akışı

Yönetici gerekli duyuruları site panelinden ekler ve site sakinleri duyuruları görebilirler.

<img width="1919" height="939" alt="19-duyuru" src="https://github.com/user-attachments/assets/ab750308-3d0e-4bbd-9cd4-5017092756fd" />
<img width="1918" height="943" alt="20-duyuruEkranı" src="https://github.com/user-attachments/assets/deb80dda-4a32-459c-bf31-fb22f63f7b10" />
<img width="1919" height="944" alt="21-duyuruKüçükEkran" src="https://github.com/user-attachments/assets/924fa264-5a56-4f47-971a-741dcdc6664a" />

### 4. Apartman Sakini Paneli
Apartman sakini telefon numarası ve şifresiyle giriş yapar. Yönetici bir daireye ulaşamazsa, yöneticiyle iletişime geçmesi söylenir.
Giriş yaparken 2 ve daha fazla dairesi varsa, daire seçim ekranı çıkar.Dairesini seçip bilgilere ulaşabilir.
Gider belgelerini görebilir, apartman kasasını takip edebilir.Şeffaflık ön plandadır.

<img width="1919" height="944" alt="28-DaireSeçim ekranı" src="https://github.com/user-attachments/assets/41ea33c1-6c51-4bfd-9024-0226d47879ce" />
<img width="1919" height="947" alt="24-ApartmanSakin ekranı" src="https://github.com/user-attachments/assets/b86607ac-7aef-4c6e-8b72-b9137c18392d" />
<img width="1918" height="944" alt="25-OdemeIstekYollama" src="https://github.com/user-attachments/assets/2b478757-3483-46f4-9c33-0dbb6321d99d" />
<img width="1917" height="945" alt="26-Gider görüntüleme Apartman sakin" src="https://github.com/user-attachments/assets/d2a53235-11e8-4ec6-a638-46cdb9e7db55" />
<img width="1919" height="948" alt="27-GiderBelge Görüntüleme" src="https://github.com/user-attachments/assets/8fb59da2-49f0-4f92-a920-6f7f71a77e0b" />
<img width="1919" height="944" alt="29-ApartmanSakinDuyuru" src="https://github.com/user-attachments/assets/ddba901f-1769-4d8d-befd-96878ac7be1f" />


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

Backend çalışırken: `http://localhost:8080/swagger-ui/index.html`

<img width="1462" height="501" alt="30- apiler" src="https://github.com/user-attachments/assets/7303d40c-d7c1-45f2-9444-84ad4b72c999" />
<img width="1504" height="332" alt="31-apiler" src="https://github.com/user-attachments/assets/5370a49a-4e07-4c7a-b630-e61eeabf4be1" />
<img width="1482" height="780" alt="32-apiler" src="https://github.com/user-attachments/assets/77facb16-86a8-47eb-81f3-4ff73a9d4c6c" />
<img width="1470" height="174" alt="33-apiler" src="https://github.com/user-attachments/assets/7ccd4425-f0e4-4f92-9ae1-306d46906ffa" />


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
