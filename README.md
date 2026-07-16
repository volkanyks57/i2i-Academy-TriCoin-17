# i2i-Academy-TriCoin-17
# TriCoin

TriCoin, gerçek zamanlı kripto para verilerini işleyen, kullanıcıların simülasyon ortamında alım-satım yapabildiği ve Google Gemini destekli yapay zekâ analizleri sunan uçtan uca bir borsa platformudur.

Backend: **Spring Boot** · Frontend: **React (Vite)** · Veritabanı: **PostgreSQL** · Önbellek/Session: **Redis** · Yapay Zekâ: **Google Gemini**

---

## İçindekiler

- [Mimari Genel Bakış](#mimari-genel-bakış)
- [Özellikler](#özellikler)
- [Teknoloji Yığını](#teknoloji-yığını)
- [Proje Yapısı](#proje-yapısı)
- [Kurulum](#kurulum)
- [API Dokümantasyonu](#api-dokümantasyonu)
- [Mimari Kararlar](#mimari-kararlar)
- [Ekip](#ekip)

---

## Mimari Genel Bakış

```
┌─────────────┐        ┌──────────────────┐        ┌─────────────┐
│   Frontend  │◄──────►│   Spring Boot     │◄──────►│ PostgreSQL  │
│ (React/Vite)│  REST  │   Core (Backend)  │        │ (kalıcı veri)│
└─────────────┘        └─────────┬─────────┘        └─────────────┘
                                  │
                        ┌─────────┴─────────┐
                        │                   │
                  ┌─────▼─────┐      ┌──────▼──────┐
                  │   Redis   │      │Google Gemini│
                  │(session + │      │   (LLM)     │
                  │ anlık fiyat)│    └─────────────┘
                  └───────────┘
                        ▲
                        │
                  ┌─────┴──────┐
                  │  Binance   │
                  │  REST API  │
                  │ (fiyat kaynağı) │
                  └────────────┘
```

- **PostgreSQL**, tüm kalıcı veriyi (kullanıcılar, bakiyeler, işlemler, fiyat geçmişi) tutan tek doğruluk kaynağıdır (source of truth).
- **Redis**, yalnızca kısa ömürlü verileri tutar: oturum (session) token'ları ve anlık piyasa fiyatları. Hiçbir zaman şifre veya kalıcı veri içermez.
- **Binance REST API**'sinden 15 saniyede bir gerçek piyasa fiyatları çekilir, hem Redis'e (anlık gösterim için) hem PostgreSQL'e (geçmiş/grafik için) yazılır. Binance'e erişilemezse sistem otomatik olarak dahili bir **Ticker Engine** simülasyonuna geçer, kesinti yaşanmaz.
- **Google Gemini**, kullanıcının portföyü ve işlem geçmişiyle zenginleştirilmiş dinamik bir prompt alarak kişiselleştirilmiş piyasa yorumları üretir.

---

## Özellikler

### 🔐 Kimlik Doğrulama
- Kayıt / giriş, bcrypt ile şifre hash'leme
- JWT tabanlı stateless kimlik doğrulama
- Redis'te oturum takibi (token geçerliliği + oturum aktifliği birlikte kontrol edilir)
- Kayıt sırasında otomatik, rastgele başlangıç bakiyesi atanması

### 📈 Piyasa Verisi
- Binance'ten gerçek zamanlı fiyat çekimi (20 coin), 15 saniyede bir güncelleme
- Binance erişilemezse otomatik Ticker Engine (simülasyon) fallback'i
- Coin başına saatlik fiyat geçmişi (grafik için)
- 24 saatlik değişim yüzdesi

### 💱 Alım-Satım (Trading)
- **30 saniyelik fiyat rezervasyonu**: kullanıcı bir işlem başlatırken gösterilen fiyat 30 saniye boyunca kilitlenir, süre dolarsa işlem reddedilir ve yeni bir fiyat teklifi istenir
- ACID uyumlu, transactional işlem yürütme (bakiye/varlık güncellemeleri ya hep birlikte başarılı olur ya da tamamen geri alınır)
- Yetersiz bakiye / yetersiz varlık gibi senaryolarda anlaşılır hata mesajları
- İşlem geçmişi ve özet istatistikler (toplam işlem, alım/satım sayısı, toplam hacim)

### 🤖 AI Insights
- Google Gemini entegrasyonu, kullanıcının güncel bakiyesi/portföyü/son işlemleriyle dinamik prompt oluşturma
- LLM erişilemezse (kota, zaman aşımı, geçici kesinti) sistemi çökertmeyen, düzgün hata yönetimi
- Sohbet arayüzünde yazıyor animasyonu (typing indicator)

### 🎨 Kullanıcı Arayüzü
- Açık/koyu tema desteği (tüm sayfalarda tutarlı)
- Fiyat güncellendiğinde görsel "flash" animasyonu
- Profil menüsü: portföy dağılımını gösteren pasta grafik
- Hesap ayarları: şifre değiştirme, profil fotoğrafı yükleme
- Türkçeleştirilmiş, kullanıcı dostu hata bildirimleri (toast)

---

## Teknoloji Yığını

| Katman | Teknoloji |
|---|---|
| Backend | Java 17+, Spring Boot, Spring Security, Spring Data JPA |
| Kimlik Doğrulama | JWT (jjwt), BCrypt |
| Veritabanı | PostgreSQL 16 |
| Önbellek / Session | Redis 7 |
| Yapay Zekâ | Google Gemini API |
| Frontend | React 18, Vite |
| Grafikler | Recharts |
| HTTP İstemcisi | Axios |
| API Dokümantasyonu | springdoc-openapi (Swagger UI) |
| Konteynerleştirme | Docker, Docker Compose |

---

## Proje Yapısı

```
i2i-Academy-TriCoin-17/
├── core/                   # Spring Boot backend
│   ├── src/main/java/com/tricoin/core/
│   │   ├── auth/           # Kimlik doğrulama, JWT, session yönetimi
│   │   ├── market/         # Binance entegrasyonu, fiyat geçmişi, scheduler
│   │   ├── trading/        # Alım-satım, fiyat rezervasyonu, işlem geçmişi
│   │   ├── ai/              # Gemini entegrasyonu, prompt oluşturma
│   │   ├── config/         # Genel yapılandırmalar (statik dosya servis, vb.)
│   │   └── common/         # Ortak yapılandırmalar (Redis, RestTemplate)
│   └── .env.example
├── web-app/                # React (Vite) frontend
│   └── src/
│       ├── pages/          # Login, Register, Dashboard, History, Settings
│       ├── components/     # Header, TradeModal, AiInsights, ProfileMenu
│       └── services/       # API istemcisi (axios)
├── docker/
│   ├── docker-compose.yml  # PostgreSQL + Redis
│   ├── init.sql            # Veritabanı şeması
│   └── .env.example
└── README.md
```

---

## Kurulum

### Ön Koşullar
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Java 17+](https://adoptium.net/) ve Maven (proje içindeki `mvnw` wrapper kullanılabilir, ayrıca kurmanıza gerek yok)
- [Node.js 18+](https://nodejs.org/) ve npm
- Ücretsiz bir [Google Gemini API key](https://aistudio.google.com/apikey)

### 1. Repoyu klonlayın

```bash
git clone https://github.com/volkanyks57/i2i-Academy-TriCoin-17.git
cd i2i-Academy-TriCoin-17
```

### 2. Ortam değişkenlerini ayarlayın

```bash
cp docker/.env.example docker/.env
cp core/.env.example core/.env
```

`core/.env` dosyasını açıp `GEMINI_API_KEY` değerini kendi Gemini key'inizle doldurun. Diğer değerler (veritabanı kullanıcı adı/şifresi, JWT secret) yerel geliştirme için hazır, değiştirmenize gerek yok.

### 3. PostgreSQL ve Redis'i başlatın

```bash
cd docker
docker-compose up -d
```

Bu komut, veritabanı şemasını (`init.sql`) otomatik olarak oluşturur ve verinin kalıcı olması için Docker volume'leri kullanır.

Container'ların sağlıklı çalıştığını doğrulayın:

```bash
docker ps
```

`tricoin-postgres` ve `tricoin-redis` için `healthy` durumu görmelisiniz.

### 4. Backend'i başlatın

`core/.env` dosyasındaki değerleri ortam değişkeni olarak tanımlayıp (IDE'nizin çalıştırma ayarlarından ya da terminalden) uygulamayı başlatın:

```bash
cd ../core
./mvnw spring-boot:run
```

Terminalde `Started CoreApplication` mesajını gördüğünüzde backend `http://localhost:8080` adresinde çalışıyor demektir.

### 5. Frontend'i başlatın

Yeni bir terminalde:

```bash
cd web-app
npm install
npm run dev
```

Terminalde çıkan adresi (genellikle `http://localhost:5173`) tarayıcınızda açın.

### 6. Sağlık kontrolü

- Backend: [http://localhost:8080/api/health](http://localhost:8080/api/health) → `{"status":"UP"}` dönmeli
- Swagger UI: [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)

---

## API Dokümantasyonu

Tüm API endpoint'leri, backend çalışırken Swagger UI üzerinden interaktif olarak incelenebilir ve test edilebilir:

**[http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)**

Korumalı endpoint'leri test etmek için:
1. `POST /api/auth/register` ile bir hesap oluşturun
2. `POST /api/auth/login` ile giriş yapıp dönen JWT token'ı kopyalayın
3. Sayfanın sağ üstündeki **Authorize** butonuna tıklayıp token'ı yapıştırın
4. Artık `trade`, `ai`, `user` gibi korumalı endpoint'leri deneyebilirsiniz

### Ana Endpoint Grupları

| Grup | Açıklama |
|---|---|
| `POST /api/auth/register`, `/login` | Kayıt ve giriş |
| `GET /api/market/prices`, `/history/{symbol}` | Anlık fiyatlar ve geçmiş |
| `GET /api/trade/quote/{symbol}` | 30 saniyelik fiyat rezervasyonu alma |
| `POST /api/trade/execute` | Al/sat işlemi yürütme |
| `GET /api/trade/history` | İşlem geçmişi |
| `POST /api/ai/query` | Yapay zekâya soru sorma |
| `POST /api/user/change-password` | Şifre değiştirme |
| `POST /api/user/avatar` | Profil fotoğrafı yükleme |

---

## Mimari Kararlar

**Neden Binance REST API (WebSocket değil)?**
Sistem, Binance'in REST API'sinden 15 saniyede bir fiyat çeker. Bu, dış bağımlılığı azaltır, test etmeyi kolaylaştırır ve sistemin ihtiyaç duyduğu güncelleme sıklığı (15 saniye) için WebSocket'in getirdiği ek karmaşıklığa (bağlantı yönetimi, yeniden bağlanma mantığı) gerek bırakmaz.

**Neden hem Binance hem Ticker Engine?**
Binance birincil veri kaynağıdır. Erişilemez olduğunda (ağ sorunu, API kesintisi) sistem otomatik olarak dahili bir simülasyon motoruna (Ticker Engine) geçer, böylece uygulama hiçbir zaman veri kaynağı yokluğu yüzünden çökmez veya boş kalmaz.

**Neden Redis'te sadece anlık veri var?**
Redis, düşük gecikmeli okuma/yazma için tasarlanmış bir bellek-içi veri deposu, kalıcılık garantisi PostgreSQL kadar güçlü değildir. Bu nedenle Redis yalnızca "kaybedilse de yeniden üretilebilir" veriler (anlık fiyat, oturum token'ı, fiyat rezervasyonu) için kullanılır. Kullanıcı verileri, bakiyeler ve işlem geçmişi gibi asla kaybedilmemesi gereken veriler yalnızca PostgreSQL'de tutulur.

**Fiyat rezervasyonu neden gerekli?**
Gerçek borsalarda kullanıcı bir işlem onaylarken gördüğü fiyatla işlemin gerçekleştiği fiyat arasında fark olabilir. Bunu önlemek için kullanıcı bir işlem başlattığında güncel fiyat 30 saniyeliğine Redis'te kilitlenir; işlem bu süre içinde onaylanırsa kilitli fiyat kullanılır, süre dolarsa işlem reddedilip yeni bir teklif istenir.
## Lisans

Bu proje eğitim amaçlı geliştirilmiştir.
