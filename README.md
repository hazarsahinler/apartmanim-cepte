# 🏢 Apartmanım Cepte

Modern apartman ve site yönetimi için geliştirilmiş full-stack web uygulaması. **Modüler Monolith** mimari yaklaşımıyla tasarlanmış, ölçeklenebilir backend altyapısı.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://apartmanimcepte.me)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-6db33f?logo=springboot)](https://spring.io/projects/spring-boot)
[![Hibernate](https://img.shields.io/badge/Hibernate-ORM-59666c?logo=hibernate)](https://hibernate.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ed?logo=docker)](https://www.docker.com/)
[![React](https://img.shields.io/badge/React-18.x-61dafb?logo=react)](https://reactjs.org/)

---

## 📋 İçindekiler

- [Mimari Yaklaşım](#-mimari-yaklaşım)
- [Özellikler](#-özellikler)
- [Teknoloji Stack](#-teknoloji-stack)
- [Backend Mimarisi](#-backend-mimarisi)
- [Kurulum](#-kurulum)
- [Proje Yapısı](#-proje-yapısı)

---

## 🏛 Mimari Yaklaşım

### Modüler Monolith Nedir?

Bu proje, **Modüler Monolith** mimari deseni kullanılarak geliştirilmiştir. Microservice'lerin karmaşıklığından kaçınırken, monolitik yapının getirdiği sıkı bağımlılık problemlerini çözen bir orta yol yaklaşımıdır.

```
┌─────────────────────────────────────────────────────────────────┐
│                     APARTMANIM CEPTE API                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   AUTH      │  │    SITE     │  │  DUYURU     │             │
│  │   MODULE    │  │   MODULE    │  │  MODULE     │             │
│  ├─────────────┤  ├─────────────┤  ├─────────────┤             │
│  │ Controller  │  │ Controller  │  │ Controller  │             │
│  │ Service     │  │ Service     │  │ Service     │             │
│  │ Repository  │  │ Repository  │  │ Repository  │             │
│  │ Entity      │  │ Entity      │  │ Entity      │             │
│  │ DTO         │  │ DTO         │  │ DTO         │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   BLOK      │  │   DAIRE     │  │  FINANS     │             │
│  │   MODULE    │  │   MODULE    │  │  MODULE     │             │
│  ├─────────────┤  ├─────────────┤  ├─────────────┤             │
│  │ Controller  │  │ Controller  │  │ Controller  │             │
│  │ Service     │  │ Service     │  │ Service     │             │
│  │ Repository  │  │ Repository  │  │ Repository  │             │
│  │ Entity      │  │ Entity      │  │ Entity      │             │
│  │ DTO         │  │ DTO         │  │ DTO         │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                    SHARED / COMMON LAYER                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ Security │  │Exception │  │  Config  │  │  Utils   │        │
│  │  (JWT)   │  │ Handler  │  │          │  │          │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
├─────────────────────────────────────────────────────────────────┤
│                      PERSISTENCE LAYER                          │
│                    Hibernate ORM + PostgreSQL                   │
└─────────────────────────────────────────────────────────────────┘
```

### Neden Modüler Monolith?

| Avantaj | Açıklama |
|---------|----------|
| **Düşük Karmaşıklık** | Microservice'lerin getirdiği network latency, distributed transaction gibi problemler yok |
| **Kolay Deployment** | Tek bir artifact deploy edilir |
| **Modül Bağımsızlığı** | Her modül kendi sorumluluğuna sahip, değişiklikler izole |
| **Refactoring Kolaylığı** | İleride microservice'e geçiş yapılabilir |
| **Shared Database** | Transaction yönetimi basit, ACID garantisi |
| **IDE Desteği** | Tek projede tüm kod, kolay navigasyon ve refactoring |

---

## ✨ Özellikler

### 👤 Kullanıcı (Sakin) Özellikleri
- 🔐 Güvenli JWT tabanlı kimlik doğrulama
- 🏠 Daire bilgilerini görüntüleme
- 💰 Aidat ve borç takibi
- 📢 Site duyurularını görüntüleme
- 📊 Kişisel dashboard

### 👨‍💼 Yönetici Özellikleri
- 🏗️ Site ve blok yönetimi (CRUD)
- 🏠 Daire yönetimi (CRUD)
- 👥 Sakin atama ve yönetimi
- 📢 Duyuru oluşturma ve yönetimi
- 💰 Aidat tanımlama ve takibi
- 💸 Gider kayıt ve yönetimi
- 💳 Ödeme istekleri oluşturma
- 📊 Yönetici dashboard

### 🛠️ Teknik Özellikler
- 🏛️ Modüler Monolith mimari
- 🔒 Spring Security + JWT authentication
- 📦 Hibernate ORM ile veritabanı yönetimi
- 🐳 Docker containerization
- ⚡ GitHub Actions CI/CD
- 📱 Responsive frontend
- 🌙 Dark/Light tema desteği

---

## 🛠 Teknoloji Stack

### Backend (Core)

| Teknoloji | Versiyon | Kullanım Amacı |
|-----------|----------|----------------|
| **Java** | 17 LTS | Ana programlama dili |
| **Spring Boot** | 3.x | Application framework |
| **Spring Security** | 6.x | Authentication & Authorization |
| **Spring Data JPA** | 3.x | Repository abstraction |
| **Hibernate ORM** | 6.x | Object-Relational Mapping |
| **PostgreSQL** | 15 | İlişkisel veritabanı |
| **JWT (jjwt)** | 0.11.x | Token-based authentication |
| **Maven** | 3.9+ | Dependency management & build |
| **Lombok** | 1.18.x | Boilerplate code reduction |
| **MapStruct** | 1.5.x | DTO-Entity mapping |

### DevOps & Infrastructure

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
| Tailwind CSS | Styling |
| Axios | HTTP client |
| React Router | Routing |

---

## 🏗 Backend Mimarisi

### Katmanlı Yapı (Layered Architecture)

Her modül aşağıdaki katmanlardan oluşur:

```
Module/
├── controller/          # REST API endpoints
│   └── XxxController.java
├── service/
│   ├── XxxService.java          # Interface
│   └── impl/
│       └── XxxServiceImpl.java  # Implementation
├── repository/          # Data access layer
│   └── XxxRepository.java
├── entity/              # JPA entities
│   └── Xxx.java
└── dto/                 # Data transfer objects
    ├── XxxRequest.java
    └── XxxResponse.java
```

### Entity İlişkileri

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    Site     │ 1───N │    Blok     │ 1───N │   Daire     │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id          │       │ id          │       │ id          │
│ ad          │       │ ad          │       │ daireNo     │
│ adres       │       │ katSayisi   │       │ kat         │
│ il          │       │ site_id(FK) │       │ sakinAdi    │
│ ilce        │       └─────────────┘       │ blok_id(FK) │
│ yoneticiId  │                             │ borcDurumu  │
└─────────────┘                             └─────────────┘
       │                                           │
       │ 1                                         │ 1
       │                                           │
       N                                           N
┌─────────────┐                             ┌─────────────┐
│   Duyuru    │                             │   Alacak    │
├─────────────┤                             ├─────────────┤
│ id          │                             │ id          │
│ baslik      │                             │ tutar       │
│ icerik      │                             │ aciklama    │
│ tarih       │                             │ vadeTarihi  │
│ site_id(FK) │                             │ daire_id(FK)│
└─────────────┘                             │ odendi      │
                                            └─────────────┘
```

### Security Mimarisi

```
                    ┌─────────────────┐
                    │   HTTP Request  │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  CORS Filter    │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ JWT Auth Filter │──── Token Validation
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ Security Context│──── User Principal
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
    ┌─────────▼─────┐ ┌─────▼─────┐ ┌─────▼─────┐
    │  /api/auth/** │ │/api/admin │ │ /api/user │
    │   permitAll   │ │ROLE_ADMIN │ │ ROLE_USER │
    └───────────────┘ └───────────┘ └───────────┘
```

### Hibernate ORM Kullanımı

```java
// Entity örneği
@Entity
@Table(name = "daireler")
@Getter @Setter
@NoArgsConstructor
public class Daire {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String daireNo;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "blok_id", nullable = false)
    private Blok blok;
    
    @OneToMany(mappedBy = "daire", cascade = CascadeType.ALL)
    private List<Alacak> alacaklar = new ArrayList<>();
}

// Repository örneği
@Repository
public interface DaireRepository extends JpaRepository<Daire, Long> {
    
    List<Daire> findByBlokId(Long blokId);
    
    @Query("SELECT d FROM Daire d WHERE d.blok.site.id = :siteId")
    List<Daire> findBySiteId(@Param("siteId") Long siteId);
    
    Optional<Daire> findByBlokIdAndDaireNo(Long blokId, String daireNo);
}
```

---

## 🚀 Kurulum

### Gereksinimler

- Java 17+
- Maven 3.9+
- PostgreSQL 15+
- Node.js 18+ (frontend için)
- Docker & Docker Compose (opsiyonel)

### 🐳 Docker ile Kurulum (Önerilen)

```bash
# Repo'yu klonla
git clone https://github.com/hazarsahinler/apartmanim-cepte.git
cd apartmanim-cepte

# Docker ile başlat
docker-compose up -d
```

Container'lar:
| Container | Port | Açıklama |
|-----------|------|----------|
| apartman-frontend | 3000 | React + Nginx |
| apartman-backend | 8080 | Spring Boot API |
| apartman-db | 5432 | PostgreSQL |

### 💻 Manuel Kurulum

#### Backend

```bash
cd backend

# application.properties veya application.yml düzenle
# Veritabanı bağlantı bilgilerini ayarla

# Build
./mvnw clean package -DskipTests

# Çalıştır
./mvnw spring-boot:run

# veya JAR ile
java -jar target/apartmanim-cepte-*.jar
```

#### Frontend

```bash
cd frontend
npm install
npm start          # Development
npm run build      # Production build
```

### ⚙️ Konfigürasyon

`application.yml` örneği:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/apartmanim
    username: ${DB_USER}
    password: ${DB_PASS}
  
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true

jwt:
  secret: ${JWT_SECRET}
  expiration: 86400000  # 24 saat

server:
  port: 8080
```

---

## 📁 Proje Yapısı

```
apartmanim-cepte/
│
├── backend/                          # 🎯 Spring Boot API (Modüler Monolith)
│   ├── src/main/java/com/apartmanim/
│   │   │
│   │   ├── auth/                     # 🔐 Authentication Modülü
│   │   │   ├── controller/
│   │   │   │   └── AuthController.java
│   │   │   ├── service/
│   │   │   │   ├── AuthService.java
│   │   │   │   └── impl/AuthServiceImpl.java
│   │   │   ├── entity/
│   │   │   │   └── User.java
│   │   │   └── dto/
│   │   │       ├── LoginRequest.java
│   │   │       └── RegisterRequest.java
│   │   │
│   │   ├── site/                     # 🏢 Site Yönetimi Modülü
│   │   │   ├── controller/
│   │   │   ├── service/
│   │   │   ├── repository/
│   │   │   ├── entity/
│   │   │   └── dto/
│   │   │
│   │   ├── blok/                     # 🏗️ Blok Yönetimi Modülü
│   │   │   ├── controller/
│   │   │   ├── service/
│   │   │   ├── repository/
│   │   │   ├── entity/
│   │   │   └── dto/
│   │   │
│   │   ├── daire/                    # 🏠 Daire Yönetimi Modülü
│   │   │   ├── controller/
│   │   │   ├── service/
│   │   │   ├── repository/
│   │   │   ├── entity/
│   │   │   └── dto/
│   │   │
│   │   ├── duyuru/                   # 📢 Duyuru Modülü
│   │   │   ├── controller/
│   │   │   ├── service/
│   │   │   ├── repository/
│   │   │   ├── entity/
│   │   │   └── dto/
│   │   │
│   │   ├── finans/                   # 💰 Finansal İşlemler Modülü
│   │   │   ├── controller/
│   │   │   │   ├── GiderController.java
│   │   │   │   ├── AlacakController.java
│   │   │   │   └── OdemeIstekController.java
│   │   │   ├── service/
│   │   │   ├── repository/
│   │   │   ├── entity/
│   │   │   │   ├── Gider.java
│   │   │   │   ├── Alacak.java
│   │   │   │   └── OdemeIstek.java
│   │   │   └── dto/
│   │   │
│   │   └── common/                   # 🔧 Shared/Common Layer
│   │       ├── config/
│   │       │   ├── SecurityConfig.java
│   │       │   ├── CorsConfig.java
│   │       │   └── JwtConfig.java
│   │       ├── security/
│   │       │   ├── JwtTokenProvider.java
│   │       │   ├── JwtAuthFilter.java
│   │       │   └── UserDetailsServiceImpl.java
│   │       ├── exception/
│   │       │   ├── GlobalExceptionHandler.java
│   │       │   ├── ResourceNotFoundException.java
│   │       │   └── UnauthorizedException.java
│   │       └── util/
│   │
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   └── application-prod.yml
│   │
│   └── pom.xml
│
├── frontend/                         # React Uygulaması
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── contexts/
│   └── package.json
│
├── .github/workflows/                # CI/CD
│   └── deploy-frontend.yml
│
├── docker-compose.yml
├── Dockerfile
└── README.md
```

---

## 📊 Veritabanı Şeması

```sql
-- Ana tablolar
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    ad VARCHAR(100),
    soyad VARCHAR(100),
    telefon VARCHAR(20),
    rol VARCHAR(20) NOT NULL,  -- ROLE_ADMIN, ROLE_USER
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE siteler (
    id BIGSERIAL PRIMARY KEY,
    ad VARCHAR(255) NOT NULL,
    adres TEXT,
    il VARCHAR(100),
    ilce VARCHAR(100),
    yonetici_id BIGINT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bloklar (
    id BIGSERIAL PRIMARY KEY,
    ad VARCHAR(50) NOT NULL,
    kat_sayisi INT,
    site_id BIGINT REFERENCES siteler(id) ON DELETE CASCADE
);

CREATE TABLE daireler (
    id BIGSERIAL PRIMARY KEY,
    daire_no VARCHAR(20) NOT NULL,
    kat INT,
    metrekare DECIMAL(10,2),
    sakin_id BIGINT REFERENCES users(id),
    blok_id BIGINT REFERENCES bloklar(id) ON DELETE CASCADE
);

CREATE TABLE duyurular (
    id BIGSERIAL PRIMARY KEY,
    baslik VARCHAR(255) NOT NULL,
    icerik TEXT,
    tarih TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    site_id BIGINT REFERENCES siteler(id) ON DELETE CASCADE
);

CREATE TABLE alacaklar (
    id BIGSERIAL PRIMARY KEY,
    tutar DECIMAL(10,2) NOT NULL,
    aciklama VARCHAR(255),
    vade_tarihi DATE,
    odendi BOOLEAN DEFAULT FALSE,
    daire_id BIGINT REFERENCES daireler(id) ON DELETE CASCADE
);

CREATE TABLE giderler (
    id BIGSERIAL PRIMARY KEY,
    tutar DECIMAL(10,2) NOT NULL,
    aciklama VARCHAR(255),
    kategori VARCHAR(100),
    tarih DATE,
    site_id BIGINT REFERENCES siteler(id) ON DELETE CASCADE
);
```

---

## 👨‍💻 Geliştirici

**Hazar Şahinler** - Backend Developer

[![GitHub](https://img.shields.io/badge/GitHub-hazarsahinler-181717?logo=github)](https://github.com/hazarsahinler)

---

<p align="center">
  ⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!
</p>
