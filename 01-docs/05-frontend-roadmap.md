# Dijital İnsan Kaynakları Platformu — Frontend Yol Haritası

**Girdi:** `03-product-roadmap.md` (bu doküman, sıradaki bölümün numarası hariç, **DEĞİŞTİRİLMEMİŞTİR** — burada üretilen her ekran, o dokümandaki User Story'lere `US-0X.Y.Z` kimlikleriyle izlenebilir), `04-implementation-log.md` (backend'de GERÇEKTEN var olan REST API'lerin tek doğru kaynağı — bu doküman, API varlığını doğrulamadan hiçbir ekranı "hazır" saymaz).
**Proje niteliği:** `03-product-roadmap.md`'nin 0.1 bölümündeki ilkeler (gün/sprint yok, erken genelleştirme yasak, dikey dilim önceliği) frontend için de geçerlidir. Bu bir **plan**dır; hiçbir React component'i, route dosyası veya CSS kuralı bu dokümanda üretilmemiştir.

---

## 0. Amaç, Kapsam ve İlkeler

### 0.1 Amaç

Backend'in `03-product-roadmap.md`'de tanımlı ~90 User Story'sinin her biri, gerçek kullanıcının dokunduğu bir ekrana dönüşmeden "bitmiş" sayılmaz. Bu doküman:

1. Her Feature için **frontend'e özgü** bir dikey dilim tanımlar: kullanıcı akışı, route/ekran, form/tablo/filtre/validasyon, durum yönetimi (loading/empty/error/success), responsive davranış, rol bazlı erişim, kullanılacak REST API, test kapsamı, kabul kriterleri.
2. Tüm modüllerin ortak kullanacağı **frontend altyapısını** (klasör yapısı, tasarım sistemi, auth, API client, server-state, form altyapısı, erişilebilirlik, tarayıcı matrisi, test stratejisi) tek yerde tanımlar — her modül bunu sıfırdan icat etmez.
3. **İlk geliştirme kapsamını** (Login, Ana Layout, Responsive Menü, Organizasyon, Çalışan CRUD, Audit) tam ayrıntıyla planlar; gerisini `03-product-roadmap.md`'nin KENDİ bölüm sırasına sadık kalarak, aynı "gerçek ihtiyaç ortaya çıkmadan genelleştirme yok" disipliniyle daha özet planlar.

### 0.2 Teknoloji ve Hedef Ortamlar

- **React 19 + TypeScript + Vite** — `frontend/` altında zaten iskele halinde mevcut (`US-01.1.2` tamamlandı).
- **MUI (Material UI) v6+** — `@mui/material` zaten bağımlılıklarda; component kütüphanesi seçimi (`US-01.1.2`'nin kabul kriteri) bu şekilde karşılanmış sayılır. Seçim gerekçesi: yerleşik `xs/sm/md/lg/xl` breakpoint sistemi (bu doküman Bölüm 3'teki responsive yaklaşımla birebir örtüşüyor), olgun erişilebilirlik desteği, geniş TypeScript tip kapsamı.
- **Responsive web** (native mobil uygulama DEĞİL) — hedef ortamlar: iOS Safari, Android Chrome, macOS Safari/Chrome, Windows Edge/Chrome (ayrıntılı matris: Bölüm 12).
- **Kod bu dokümanda YOK** — yalnızca teknoloji/kütüphane adları, klasör isimleri, component/hook isimleri (isimlendirme sözleşmesi olarak) geçer.

### 0.3 İlkeler (backend'deki `0.1`'in frontend karşılığı)

- **Gün/sprint/efor tahmini yok.**
- **Dikey dilim önceliği** — bir ekran, arkasındaki TÜM alt senaryoları (ör. dışa aktarma, gelişmiş filtre) baştan içermek zorunda değil; `03-product-roadmap.md`'deki story sınırları frontend'de de korunur.
- **Erken genelleştirme yasak (YAGNI).** Ortak bir "form generator", "tablo generator" veya "workflow UI motoru" bu dokümanda İCAT EDİLMEZ. `ResponsiveTable`, `FormField` gibi paylaşılan component'ler yalnızca gerçekten ≥2 modülde AYNI ihtiyaç ortaya çıktığında (bkz. Bölüm 10) ortak bileşene taşınır; ilk kullanım modülüne özel yazılır.
- **Backend gerçekliğine sadakat.** Bir ekran, karşılığı olan REST API canlıda çalışmadan "planlanabilir" olarak işaretlenmez ama "geliştirilebilir" olarak işaretlenmez. `04-implementation-log.md`'ye göre backend'de eksik olan tek bir uç bile bu dokümanda AÇIKÇA not edilir (bkz. `13.8 Audit Kayıtları` ve `0.5 Frontend Blokerleri`).

### 0.4 Notasyon

- **FE-Ekran:** Bir route'a karşılık gelen, kullanıcının gördüğü tek bir sayfa.
- Her Feature/ekran, karşılık geldiği backend `US-0X.Y.Z` kimliğine referans verir — paralel bir kimlik sistemi İCAT EDİLMEDİ, doğrudan `03-product-roadmap.md`'nin kimlikleri kullanılıyor.
- **Roller:** `ADMIN`, `IK`, `YONETICI`, `CALISAN` (backend seed rolleri, `US-02.2.1`) + bazı modüllere özel roller (ör. `KULUP_LIDERI`, `DENETIM`) — ilgili bölümde ayrıca belirtilir.

### 0.5 Frontend Blokerleri (Backend Eksikleri ve Doğrulanmamış Yetkilendirmeler)

> Bu tablo, dokümanın geri kalanında dağınık olarak not edilen TÜM backend eksikliklerini/belirsizliklerini TEK yerde toplar — her satır, ilgili ekranın kendi bölümündeki AYNI notun özetidir, çelişki durumunda o bölümdeki ayrıntılı not GEÇERLİDİR. Yeni bir bölüm eklendikçe (Bölüm 14 genişledikçe) bu tablo da güncellenir.

| # | Alan / Ekran | Eksik veya belirsiz backend davranışı | Durum | Etkilenen bölüm |
|---|---|---|---|---|
| 1 | Audit Kayıtları | Audit log'u listeleyen HİÇBİR REST endpoint yok (`AuditLogRepository` yalnızca `findByEntityTypeAndEntityId` sunuyor, genel/filtrelenebilir bir `GET` ucu yok). | 🚫 **BLOKLU** — ekran geliştirilemez | 13.8 |
| 2 | Organizasyon Birimi — Düzenleme/Silme | `OrganizationUnitController`'da yalnızca `POST /` ve `GET /` var; `PUT`/`DELETE` yok. | 🚫 **BLOKLU** (kısmi — yalnızca düzenleme/silme; oluşturma+listeleme AÇIK) | 13.4 |
| 3 | Organizasyon Birimi/Unvan/Çalışan — yazma uçları | `POST /units`, `POST/PUT/DELETE /job-titles`, `POST/PUT /employees`, `PUT /employees/{id}/assignment` uçlarında `@PreAuthorize` YOK — herhangi bir oturumlu kullanıcı (rolü ne olursa olsun) çağırabilir. Frontend yalnızca GÖRSEL olarak `ADMIN`/`IK`'ya gösterir, gerçek bir yetkilendirme sınırı DEĞİLDİR. | ⚠️ Bloklayıcı değil — güvenlik açığı olarak backend'e ayrıca bildirilmeli | 13.4, 13.5, 13.7 |
| 4 | Çalışan Listeleme/Dışa Aktarma | `GET /employees` ve `GET /employees/export` üzerinde rol kısıtı YOK. | ⚠️ Bloklayıcı değil — yalnızca frontend UX filtresiyle sınırlanıyor, backend sınırı yok | 13.6 |
| 5 | Kulüp Etkinliği Oluşturma | `POST /api/clubs/events`'in yalnızca `KULUP_LIDERI` rolüne kısıtlı olduğu backend kodunda TEYİT EDİLMEDİ (roadmap kabul kriterinden çıkarım). | ❓ Doğrulama gerekli (geliştirme başında backend'den teyit edilecek) | 14.7 (8G) |
| 6 | Randevu Notu — Yetkili Rol | "Yalnızca yetkili kişiler görebilir" (`US-08H.1.3`) kriterindeki rolün TAM ADI backend kodunda netleştirilmedi. | ❓ Doğrulama gerekli | 14.7 (8H) |
| 7 | Auth — Token Saklama Modeli | Backend yalnızca opak bearer token döndürüyor (`Set-Cookie`/`HttpOnly` cookie YOK, CSRF koruması YOK). Frontend bu nedenle `localStorage`'ı GEÇİCİ çözüm olarak kullanıyor (bkz. `5.2`). | ⚠️ Bloklayıcı değil — bilinen teknik borç, hedef çözüm backend değişikliği gerektirir | 5.2 |

---

## 1. Modül Bazlı Frontend Klasör Yapısı

Backend'in "her modül kendi paketinde, `core`'a bağımlı" mimarisiyle AYNI mantık frontend'e taşınıyor: her backend modülüne (organization, leave, recruitment, ...) karşılık gelen BİR frontend modülü klasörü. Bu, backend'de zaten kanıtlanmış bir sınır çizme deseninin tekrarı — sıfırdan bir frontend mimarisi icat edilmiyor.

```
frontend/src/
├── app/                        # Uygulama iskeleti — routing, providers, layout shell
│   ├── router.tsx              # Route tanımları (createBrowserRouter), rol bazlı guard'lar
│   ├── providers.tsx           # QueryClientProvider, ThemeProvider, AuthProvider sarmalayıcı
│   ├── AppShell.tsx            # Ana layout: TopBar + Sidebar/BottomNav + içerik alanı
│   └── theme.ts                # MUI tema (renk paleti, breakpoint override, tipografi)
│
├── modules/
│   ├── auth/                   # Login, session, MFA/step-up
│   ├── organization/           # Birim, unvan, çalışan, organizasyon şeması, doküman
│   ├── leave/
│   ├── recruitment/
│   ├── performance/
│   ├── attendance/
│   ├── training/
│   ├── travel/
│   ├── discipline/
│   ├── feedback/               # anket + talep/fikir (backend `feedback` modülüyle birebir)
│   ├── amenities/               # kulüp + randevu (backend `amenities` modülüyle birebir)
│   ├── payroll/
│   ├── platform-admin/         # onay zinciri tanımı + özel alan tanımı admin ekranları
│   └── audit/                  # backend ucu YOK — bkz. 14.8, iskelet olarak ayrılmış
│
├── shared/
│   ├── components/             # Tasarım sistemi — bkz. Bölüm 9
│   ├── hooks/                  # useAuth, useMediaQuery sarmalayıcıları, useDebounce vb.
│   ├── api/                    # apiClient, ApiError, ortak query-key yardımcıları
│   ├── forms/                  # Ortak form alan wrapper'ları
│   ├── utils/                  # tarih/para formatlama, TC No/IBAN gösterim maskesi
│   └── types/                  # ProblemDetail, PageResponse<T> gibi backend-ortak tipler
│
├── test/
│   ├── msw/                    # Mock Service Worker handler'ları (modül bazlı)
│   └── e2e/                    # Playwright test dosyaları (bkz. Bölüm 13)
│
└── styles/                     # Global CSS, safe-area/viewport ayarları
```

**Her modül klasörünün kendi içi (ör. `modules/organization/`):**

```
organization/
├── api/            # useEmployees(), useCreateEmployee() gibi React Query hook'ları
├── components/     # Modüle özel, paylaşılmayan bileşenler (ör. EmployeeSalaryHistoryTable)
├── pages/          # Route'a bağlanan sayfa bileşenleri (ör. EmployeeListPage.tsx)
├── routes.tsx      # Bu modülün route tanımları + rol guard meta'sı
└── types.ts        # Backend DTO'larıyla birebir eşleşen TypeScript tipleri
```

**Kural:** Bir modül başka bir modülün `api/`/`components/` klasörüne DOĞRUDAN import ATMAZ — yalnızca `shared/` üzerinden paylaşım yapılır. Bu, backend'in "yalnızca core'a bağımlı, modüller birbirine bağımlı değil" kuralının frontend karşılığıdır (backend'deki onaylı istisnalar — payroll→leave/attendance/travel/organization gibi — frontend'de KARŞILIĞI YOK; her modül sayfası yalnızca KENDİ backend API'sini çağırır, `payroll` sayfası `organization`'ın API hook'unu import etmez, kendi DTO'suyla çalışır).

---

## 2. Responsive Tasarım ve Breakpoint Yaklaşımı

### 2.1 Breakpoint tablosu (MUI varsayılanları, projede AYNEN kullanılacak — özel bir breakpoint sistemi icat edilmiyor)

| Breakpoint | Genişlik | Hedef cihaz |
|---|---|---|
| `xs` | 0–599px | Telefon (dikey) |
| `sm` | 600–899px | Telefon (yatay) / küçük tablet (dikey) |
| `md` | 900–1199px | Tablet (yatay) / küçük dizüstü |
| `lg` | 1200–1535px | Masaüstü |
| `xl` | 1536px+ | Geniş masaüstü |

### 2.2 Üç tasarım hedefi

- **Mobil (`xs`, `sm`):** Tek sütun, alt navigasyon (bottom nav) + hamburger drawer, kartlı/accordion liste görünümü, tam genişlik form alanları.
- **Tablet (`md`):** İki sütunlu form/detay düzenleri mümkün, sidebar icon-rail (daraltılmış, 72px) olarak sabit, DOKUNMA/TIKLAMA ile geçici genişler (hover'a BAĞIMLI DEĞİLDİR — dokunmatik tabletlerde `hover` state'i hiç tetiklenmeyebilir; tıklama/dokunma birincil, tek etkileşim yoludur, fare kullanan tablet kullanıcıları için hover yalnızca EK bir görsel ipucu olarak, davranışı DEĞİŞTİRMEDEN eklenebilir).
- **Masaüstü (`lg`, `xl`):** Sabit açık sidebar (240px), çok sütunlu tablo görünümü, yan-yana form+önizleme düzenleri mümkün.

### 2.3 Tablo → kart/accordion dönüşüm kuralı

`03-product-roadmap.md`'deki HİÇBİR feature "masaüstü tablosunu mobilde sıkıştırma" istemiyor — bunun yerine:

- **Kural:** Bir tablo `md` altında (yani `xs`/`sm`'de) satır başına **>4 görünür sütun** gerektiriyorsa VEYA herhangi bir sütun yatay scroll'a zorluyorsa, tablo `xs`/`sm`'de otomatik olarak **kart listesine** dönüşür: her satır bir `Card`, birincil alan (ör. ad-soyad) başlık, ikincil alanlar (ör. birim/unvan) alt satırlar, aksiyonlar (görüntüle/düzenle) kart altında buton grubu olarak.
- **İstisna — uzun/detaylı kayıtlar (ör. audit log, disiplin geçmişi):** Kart yerine **accordion liste** — başlık satırı (tarih + özet) her zaman görünür, detay (kim/ne/eski-yeni değer) tıklanınca açılır. Bu, tek ekranda çok satır taraması gereken ama her satırın çok alanı olan durumlar için tercih edilir.
- **`md` (tablet):** Sıkıştırılmış tablo (daha az sütun, ikincil alanlar bir "⋮" menüsünde) TERCİH EDİLİR — kart dönüşümü yalnızca `xs`/`sm` için zorunlu.
- Bu davranış, `shared/components/ResponsiveTable` adlı TEK bir paylaşılan component'te kapsüllenir (bkz. Bölüm 9) — her modül kendi tablo/kart geçiş mantığını YENİDEN YAZMAZ.

### 2.4 Genel mobil-öncelik kuralları

- CSS mobile-first yazılır (varsayılan stil `xs`, üst breakpoint'lerde override).
- Form alanları `xs`/`sm`'de tam genişlik (`fullWidth`), `md`+'de MUI `Grid` ile 2 sütuna kadar yan yana.
- Modal/Dialog'lar `xs`'de tam ekran (`fullScreen`), `sm`+'de ortalanmış kutu.

---

## 3. Dokunmatik Kullanım ve iOS Safe-Area

- **Minimum dokunma hedefi:** 44×44px (Apple HIG / WCAG 2.5.5) — tüm buton, ikon-buton, liste satırı, sekme bu boyutun altına düşmez; MUI'nin `size="large"` varyantı dokunmatik context'lerde varsayılan.
- **`viewport` meta etiketi:** `width=device-width, initial-scale=1, viewport-fit=cover` — `viewport-fit=cover`, iOS'ta içeriğin çentik/home-indicator alanına kadar uzanabilmesini (ve `env()` ile güvenli boşluk bırakılabilmesini) sağlar.
- **`env(safe-area-inset-*)` kullanımı:** Üst `AppBar`, alt `BottomNavigation` ve tam ekran modal'ların padding'i bu CSS ortam değişkenleriyle hesaplanır — iPhone'da çentik/Dynamic Island ve alt home-indicator çubuğunun içerikle çakışmaması için.
- **Tap highlight/touch-action:** Varsayılan mavi dokunma vurgusu (`-webkit-tap-highlight-color`) kaldırılıp MUI'nin kendi `ripple` efektiyle değiştirilir; yatay kaydırmalı bileşenlerde (ör. sekme çubuğu) `touch-action: pan-x` ile dikey sayfa kaydırmasıyla çakışma önlenir.
- **`100dvh`/`100vh` fallback (iOS Safari):** iOS Safari'de adres çubuğu kaydırmayla daralıp genişlediğinden, `100vh` TEK BAŞINA tam-yükseklik hesaplamaları için GÜVENİLMEZ (adres çubuğu açıkken içerik kesilir/boşluk kalır). `AppShell`'in ve tam ekran modal/drawer'ların yükseklik hesaplaması ÖNCE `100vh` (eski tarayıcı fallback'i), SONRA `100dvh` (dynamic viewport height — desteklendiğinde ikincisi kazanır, CSS'in "aynı özelliğin ikinci deklarasyonu öncekini ezer" davranışıyla, ayrı bir `@supports` sorgusu GEREKMEZ) olarak TANIMLANIR.
- **Mobil sanal klavye:** Bir form alanına odaklanılıp klavye açıldığında, `window.visualViewport` API'si dinlenerek görünür alan yüksekliği takip edilir — sabit-konumlu (`position: fixed`) alt öğeler (BottomNavigation, sabit CTA butonları) klavye AÇIKKEN klavyenin ÜSTÜNDE asılı kalıp içeriği KAPATMASIN diye ya klavye açıkken GİZLENİR ya da `visualViewport` yüksekliğine göre yeniden konumlandırılır; odaklanılan alan otomatik olarak görünür alana kaydırılır (`scrollIntoView`).
- **Scroll lock (modal/drawer açıkken arka plan kaydırmasının engellenmesi):** iOS Safari'de yalnızca `body { overflow: hidden }` YETERSİZDİR — dokunmatik kaydırma arka planda YİNE DE "sızabilir". Bu nedenle modal/drawer açıldığında: (1) `body`/`html`'e scroll kilidi uygulanır, (2) mevcut scroll pozisyonu SAKLANIR ve kapanışta GERİ YÜKLENİR (pozisyon sıfırlanmasın diye), (3) arka plan içeriğinde `touch-action: none` ile dokunmatik kaydırma bloklanır.
- **Sabit alt menünün İÇERİK boşluğu:** `BottomNavigation` `position: fixed` olduğundan, ALTINDAKİ kaydırılabilir içerik alanı EN AZ `BottomNavigation` yüksekliği + `env(safe-area-inset-bottom)` kadar `padding-bottom` alır — aksi halde bir listenin SON öğesi veya sayfa altındaki bir CTA butonu menünün ARKASINDA/altında kalıp tıklanamaz hale gelir. Bu kural `AppShell`'in içerik sarmalayıcısında TEK bir yerde uygulanır, her sayfa kendi padding'ini AYRI AYRI hesaplamaz.
- **Kapsam dışı bırakılanlar (YAGNI — ilk sürümde YOK):** Swipe-to-delete/action jestleri, pull-to-refresh, native haptic feedback — bunlar bir PWA/native sarmalayıcı ihtiyacı doğurmadan, yalnızca "responsive web" hedefiyle gereksiz karmaşıklık. İkinci bir gerçek ihtiyaç (ör. kullanıcı geri bildirimi) doğarsa değerlendirilir.

---

## 4. Navigasyon: Mobil Menü ve Masaüstü Sidebar

### 4.1 Masaüstü (`lg`/`xl`)

Sabit, sürekli açık sol `Sidebar` (240px) — modül gruplarına göre (İK, İzin, İşe Alım, Performans, PDKS, Diğer Modüller, Bordro, Yönetim) daraltılabilir bölümler (`Accordion`/`Collapse`). Kullanıcı sidebar'ı manuel daraltıp yalnızca ikon bırakabilir (tercih `localStorage`'a yazılır).

### 4.2 Tablet (`md`)

Sidebar varsayılan olarak **icon-rail** (yalnızca ikonlar, 72px) — üzerine tıklanınca geçici olarak genişleyip modül adlarını gösterir, dışarı tıklanınca tekrar daralır (overlay değil, içerik alanını itmez).

### 4.3 Mobil (`xs`/`sm`)

- **Üstte `AppBar`:** Sol hamburger ikonu + sayfa başlığı + sağda kullanıcı avatarı (profil/çıkış menüsü).
- **Alt `BottomNavigation`:** En sık kullanılan 4 hedef — *Ana Sayfa*, *Çalışanlar*, *İzinlerim*, *Diğer* (son öğe tam menüyü açan bir drawer'a bağlanır).
- **Hamburger → tam ekran `Drawer`:** Tüm modül grupları accordion halinde listelenir; her modül grubunun altında yalnızca kullanıcının ROLÜNE göre görünür alt öğeler.

### 4.4 Rol bazlı menü filtresi

Her route tanımı (`modules/*/routes.tsx`) bir `roles: string[]` meta alanı taşır. `AppShell`, menü ağacını oluştururken oturum açan kullanıcının `roles` listesiyle KESİŞMEYEN öğeleri render ETMEZ (backend'in `US-02.2.3` kabul kriteri — "yetkisiz menü öğesi arayüzde gösterilmez" — burada karşılanır). Bu, yalnızca GÖRSEL bir filtre; gerçek yetkilendirme HER ZAMAN backend'de (`@PreAuthorize`) uygulanır — frontend menü filtresi yalnızca UX'tir, güvenlik sınırı DEĞİLDİR.

### 4.5 Breadcrumb

Masaüstü/tablette `AppBar` altında ikinci bir şerit olarak (ör. "Organizasyon / Çalışanlar / Ahmet Yılmaz"); mobilde yer kaplamaması için YOK — yerine `AppBar`'da geri oku.

---

## 5. Authentication ve Session Yönetimi

### 5.1 Backend gerçeği (API client tasarımını belirleyen kısıtlar)

- Token, JWT DEĞİL — `POST /api/auth/login` opak bir bearer token döner (`Session.token`), TTL'i vardır (`app.session.ttl-minutes`), **refresh token mekanizması YOK**.
- Süresi dolan/geçersiz token → herhangi bir istekte 401.
- Bordro modülü (`/api/payroll/**`) ek olarak "step-up" (2FA) gerektirir — doğrulanmamış oturumla 403 (e-posta kodu YA DA TOTP ile yükseltilebilir, bkz. `US-08D.1.4`/`US-09.1.3`).

### 5.2 Tasarım

> ## ⚠️ Bilinen Teknik Borç — Token Saklama
>
> Token, `localStorage`'da saklanır. Bu **GEÇİCİ, bilinçli bir teknik borçtur** — nihai/hedef çözüm DEĞİLDİR:
> - **Neden şimdilik `localStorage`:** Backend yalnızca opak bir bearer token döndürüyor (`POST /api/auth/login` yanıt gövdesinde `token` alanı), `Set-Cookie` YOK, refresh token mekanizması YOK. `localStorage`, sayfa yenilemesinde oturumun hayatta kalması için backend'in MEVCUT davranışıyla çalışan TEK pratik seçenek.
> - **Risk:** `localStorage`'a JavaScript ile erişilebildiğinden, bir XSS açığı token'ı doğrudan sızdırabilir (`httpOnly` cookie'nin engellediği tam olarak bu senaryo).
> - **Hedef çözüm:** Backend, `POST /api/auth/login`'de token'ı yanıt GÖVDESİNDE döndürmek yerine `Set-Cookie: token=...; HttpOnly; Secure; SameSite=Strict` (veya `Lax`, çapraz-site yönlendirme senaryosuna göre) header'ıyla göndersin; frontend token'ı HİÇ GÖRMESİN/SAKLAMASIN, tarayıcı her isteğe cookie'yi otomatik ekleyip `apiClient`'ın `Authorization` header enjeksiyonuna gerek KALMASIN. Bu, `SameSite`'ın CSRF'e karşı temel korumayı sağlamasının yanında, state-değiştiren (POST/PUT/DELETE) isteklerde ayrıca bir CSRF token deseni (ör. double-submit cookie) gerektirebilir — kesin tasarım, backend değişikliğiyle BİRLİKTE netleştirilir.
> - **Kapsam:** Bu değişiklik backend'de `AuthController`/`SessionService`'te bir değişiklik GEREKTİRİR — bu doküman o değişikliği YAPMAZ/İSTEMEZ, yalnızca frontend'in BUGÜNKÜ mimarisinin bu borcu taşıdığını ve ne zaman/nasıl kapatılacağını KAYIT ALTINA alır (bkz. `0.5 Frontend Blokerleri`, satır 7).

- Token, yukarıdaki borç kabul edilerek `localStorage`'da saklanır (backend'de refresh mekanizması olmadığından, sayfa yenilemede oturumun hayatta kalması için tek pratik seçenek; ek bir ARA ÖNLEM olarak CSP sıkılaştırması önerilir ama bu dokümanın kapsamı DEĞİLDİR).
- Uygulama açılışında (`AuthProvider` mount): `localStorage`'da token varsa `GET /api/auth/session` ile doğrulanır; geçersizse token temizlenir ve `/login`'e yönlendirilir.
- `useAuth()` hook'u: `{ user, roles, token, isAuthenticated, login(), logout() }`.
- **`ProtectedRoute`** component'i: `roles` prop'u ile route'u sarmalar; giriş yoksa `/login`'e, rol uyuşmuyorsa `/403` (yetkisiz) sayfasına yönlendirir.
- **Global 401 yakalama:** `apiClient`'ta merkezi bir interceptor — herhangi bir istek 401 dönerse (login isteğinin kendisi HARİÇ) oturum temizlenir, kullanıcı `/login?expired=1`'e yönlendirilir, "Oturumunuz sona erdi, tekrar giriş yapın" mesajı gösterilir.
- **Step-up (2FA) akışı:** `/api/payroll/**` çağıran herhangi bir React Query mutation/query 403 dönerse (ve `title === "Ek doğrulama gerekli"` ise), global bir `StepUpModal` açılır — kullanıcı e-posta kodu (`POST /api/auth/payroll-access/request` + `verify`) VEYA (kullanıcının `totpEnabled`'ı varsa) TOTP kodu (`POST /api/auth/payroll-access/verify-totp`) ile doğrulama yapar; başarılı olursa modal kapanır ve ORİJİNAL istek otomatik tekrarlanır.

---

## 6. API Client ve Hata Yönetimi

### 6.1 `shared/api/apiClient`

İnce bir `fetch` sarmalayıcısı (axios gibi ek bir bağımlılık GEREKMİYOR — backend'in tek, tutarlı `ProblemDetail` (RFC 7807) hata formatı zaten `core.exception.GlobalExceptionHandler`'dan geliyor, bu basitliği hand-roll etmek yeterli):

- Base URL ortam değişkeninden (`VITE_API_BASE_URL`).
- Her istekte `Authorization: Bearer <token>` header'ı (varsa) otomatik eklenir.
- Yanıt `ok` değilse gövde `ProblemDetail` (`{type, title, status, detail, instance}`) olarak parse edilip bir `ApiError` (status, title, detail alanlarıyla) fırlatılır.
- `multipart/form-data` gerektiren uçlar (CV yükleme, masraf belgesi, politika dokümanı) için ayrı bir `uploadClient` (Content-Type header'ı elle set EDİLMEZ, tarayıcı boundary'yi kendisi ekler).

### 6.2 Global hata eşlemesi

| HTTP durumu | Davranış |
|---|---|
| 400 | `ApiError.detail` metni, formun üstünde bir uyarı banner'ında gösterilir (backend alan-bazlı hata döndürmüyor — yalnızca TEK bir `detail` string; bu nedenle frontend'de alan-altı hata mesajı YOK, genel banner var — bu kısıt Bölüm 8'de tekrar not edilir). |
| 401 | Global oturum temizleme + `/login`'e yönlendirme (bkz. 5.2). |
| 403 (genel) | "Bu işlem için yetkiniz yok" boş/hata durumu — sayfa render edilmeye devam eder ama ilgili aksiyon gizlenir/disabled olur. |
| 403 (step-up) | `StepUpModal` tetiklenir (bkz. 5.2). |
| 404 | Sayfa seviyesinde `EmptyState`/`ErrorState` ("Kayıt bulunamadı"). |
| 409 | Çakışma mesajı (ör. "Bu TC Kimlik No ile kayıtlı bir çalışan zaten var") — form banner'ı. |
| 422 | Dosya yükleme bağlamında ("Dosya reddedildi" — enfekte dosya, `US-09.7.2`) özel bir uyarı. |
| 5xx | Genel "Beklenmeyen bir hata oluştu, tekrar deneyin" + yeniden dene butonu. |
| Ağ hatası (`TypeError: Failed to fetch`) | `navigator.onLine` kontrolüyle "İnternet bağlantınızı kontrol edin" banner'ı (global, sayfa üstü, kalıcı — bağlantı geri gelince otomatik kaybolur). |

---

## 7. Server-State Yönetimi

- **TanStack Query (React Query) v5** — her modülün `api/` klasöründe `useXxx` adlı `useQuery`/`useMutation` hook'ları; `queryKey` fabrikaları modül bazında (`organizationKeys.employees.list(filters)` gibi) tanımlanır, çakışma önlenir.
- **Cache invalidation:** Her `useMutation`'ın `onSuccess`'i, ilgili `queryKey`'leri `invalidateQueries` ile geçersiz kılar (ör. çalışan güncellemesi → hem `employees.detail(id)` hem `employees.list(*)` invalidate edilir).
- **Sayfalama:** Backend `Pageable` (`page`, `size`, `sort`) kullanıyor (`GET /api/organization/employees?page=&size=&sort=`) — React Query'nin `placeholderData: keepPreviousData` (v5) seçeneğiyle sayfa geçişlerinde yanıp sönme önlenir.
- **Optimistic update:** İlk kapsamda YOK (YAGNI) — geri alınması karmaşık işlemler (onay/red gibi) için gereksiz risk; yalnızca `invalidateQueries` sonrası gerçek veriyle güncelleme.
- **Stale time:** Modül bazında farklılaştırılır — referans listeleri (izin türü, birim, unvan) `staleTime: 5dk`+ (nadiren değişir), kişisel/anlık veri (bildirim, bakiye) `staleTime: 0`.

---

## 8. Form Altyapısı

- **React Hook Form + Zod** — şema tabanlı validasyon, backend'in kendi validasyon kurallarıyla (ör. TC No format kontrolü, IBAN mod-97, zorunlu alanlar) senkron Türkçe mesajlar (`zod` şemaları backend hata mesajlarıyla BİREBİR aynı Türkçe metni kullanır, kullanıcı aynı hatayı iki farklı ifadeyle görmesin diye).
- **Backend'in TEK-alanlı hata kısıtı:** `ProblemDetail.detail` yalnızca TEK bir string döner (ör. "TC Kimlik No geçersiz."), hangi ALANLA ilgili olduğunu backend belirtmiyor. Frontend, formun üstünde genel bir banner gösterir; MÜMKÜNSE (mesaj metninden alan adı çıkarılabiliyorsa, ör. "seviye geçerli bir seçenek değil." → `seviye` alanı) basit bir metin-eşleştirmeyle ilgili alanın altına da kırmızı vurgu eklenir — ama bu GARANTİ değildir, banner HER ZAMAN gösterilir.
- **Ortak form alan wrapper'ları** (`shared/forms/`): `FormTextField`, `FormSelect`, `FormDatePicker`, `FormNumberField`, `FormFileUpload`, `FormCheckbox` — React Hook Form `Controller`'ını MUI bileşenleriyle birleştiren ince sarmalayıcılar; her biri hata mesajını otomatik `helperText`/`error` prop'una bağlar.
- **Çok adımlı (wizard) formlar:** İlk kapsamda YOK — hiçbir `03-product-roadmap.md` story'si bunu gerektirmiyor (en karmaşık form, ~12 alanlı "genişletilmiş özlük bilgileri" formu, TEK adımda, sekmeli düzenle yönetilir).
- **Taslak kaydetme (autosave):** İlk kapsamda YOK (YAGNI).

---

## 9. Ortak Component / Design System

`shared/components/` altında, MUI temel alınarak inşa edilen, birden fazla modülde GERÇEKTEN tekrar eden ihtiyaçlar için (backend'in `03-product-roadmap.md` 0.1'deki "erken genelleştirme yasak" ilkesinin frontend'e uygulanmış hali — bu liste, sıfırdan bir component kütüphanesi değil, gerçekten ≥2 modülde tekrarlanacağı roadmap'ten ÖNCEDEN belli olan asgari settir):

| Component | Amaç |
|---|---|
| `AppShell` | TopBar + Sidebar/BottomNav + içerik alanı (bkz. Bölüm 4) |
| `ResponsiveTable` | Masaüstünde tablo, `xs`/`sm`'de kart listesi (bkz. 2.3) |
| `AccordionList` | Detaylı, uzun kayıtlar için genişleyen liste (ör. audit, disiplin geçmişi) |
| `FilterBar` | Modül listelerinde ortak filtre şeridi (arama + dropdown filtreler + "Filtreleri Temizle") |
| `EmptyState` | İkon + mesaj + (varsa) "Yeni Oluştur" CTA — veri yokken |
| `ErrorState` | Mesaj + "Tekrar Dene" butonu — istek başarısız olduğunda |
| `LoadingSkeleton` | Gerçek layout'u taklit eden placeholder (spinner yerine tercih — algılanan performans için) |
| `ConfirmDialog` | Geri alınamaz aksiyonlar (silme, reddetme) için onay modalı |
| `Toast` (Snackbar) | Başarı/hata bildirimleri (ör. "Çalışan oluşturuldu") |
| `StatusChip` | Durum rozetleri (Bekliyor/Onaylı/Reddedildi vb.) — renk kodlaması modül bazında tutarlı |
| `RoleGuard` | Sayfa içi, belirli bir bölümü role göre gizleyen/gösteren sarmalayıcı (menü dışı kullanım için) |
| `PageHeader` | Sayfa başlığı + breadcrumb + birincil aksiyon butonu (ör. "+ Yeni Çalışan") |
| `Pagination` | Backend `Pageable` ile uyumlu sayfalama kontrolü |
| `FileUploadZone` | Sürükle-bırak + dosya seçici, ilerleme çubuğu, 422 (enfekte dosya) hatasını özel gösterir |

**Kural:** Bu liste SABİT değil ama SIFIR-ile-BAŞLAR mantığıyla büyür — yeni bir paylaşılan component, YALNIZCA ikinci bir modül aynı ihtiyacı duyduğunda buraya taşınır; ilk kullanım her zaman modülün kendi `components/` klasöründe yazılır (backend'deki AYNI YAGNI disiplini).

---

## 10. Accessibility (Erişilebilirlik)

- **Hedef:** WCAG 2.1 AA.
- **Klavye navigasyonu:** Tüm interaktif öğeler `Tab` ile ulaşılabilir; modal/drawer açıldığında odak içine hapsedilir (`focus trap`), kapandığında odak açan öğeye geri döner.
- **ARIA:** Form alanları `aria-describedby` ile hata mesajına bağlanır; `ResponsiveTable`'ın kart görünümüne geçişinde ekran okuyucuya `aria-live` bölgesiyle bağlam kaybı önlenir (tablo→kart geçişi görsel, semantik yapı korunur).
- **Renk kontrastı:** MUI tema paleti (Bölüm 1'deki `theme.ts`) WCAG AA kontrast oranlarına (metin 4.5:1, büyük metin 3:1) göre doğrulanır.
- **Odak görünürlüğü:** `:focus-visible` ile yalnızca klavye kullanıcılarına görünen belirgin bir odak halkası (fare tıklamasında gösterilmez).
- **Form hataları:** Yalnızca renkle DEĞİL, ikon + metinle de belirtilir (renk körlüğü için).
- **Dokunma hedefi:** Bölüm 3'teki 44×44px kuralı erişilebilirlik gereksinimiyle örtüşür (WCAG 2.5.5).

---

## 11. Tarayıcı Uyumluluk Test Matrisi

| Tarayıcı | Platform | Minimum sürüm | Test yöntemi |
|---|---|---|---|
| Safari | iOS (iPhone/iPad) | Son 2 major sürüm | Playwright WebKit (mobil viewport emülasyonu) + periyodik gerçek cihaz kontrolü |
| Chrome | Android | Son 2 major sürüm | Playwright Chromium (mobil viewport/user-agent emülasyonu) + periyodik gerçek cihaz kontrolü |
| Safari | macOS | Son 2 major sürüm | Playwright WebKit |
| Chrome | macOS / Windows | Son 2 major sürüm | Playwright Chromium |
| Edge | Windows | Son 2 major sürüm | Playwright Chromium (`channel: "msedge"`) |

**Strateji:** Tek geliştiricili bir proje için gerçek cihaz laboratuvarı (BrowserStack vb.) SÜREKLİ bir CI adımı olarak KURULMAZ (YAGNI — maliyet/karmaşıklık, bu aşamada gerçek ihtiyacı aşıyor); bunun yerine:

- **Her PR/commit'te otomatik:** Playwright'ın Chromium + WebKit motorları (Firefox hedeflenmiyor — roadmap'in hedef listesinde yok), masaüstü + mobil viewport (`iPhone 14`, `Pixel 7` gibi Playwright'ın hazır cihaz profilleri) kombinasyonlarıyla kritik akış testleri (bkz. Bölüm 13).
- **Periyodik (ör. her Bölüm tamamlandığında) manuel kontrol listesi:** Gerçek bir iPhone (Safari), gerçek bir Android telefon (Chrome) ve macOS/Windows masaüstünde İLK GELİŞTİRME KAPSAMI (Bölüm 13) akışlarının elle gezilmesi — safe-area, dokunma hedefi, klavye açılma davranışı gibi emülasyonun tam yakalayamadığı gerçek-cihaz detayları için.

### 11.1 Build Hedefleme ve CSS Uyumluluğu

Tarayıcı matrisinin (yukarıdaki tablo) yalnızca TEST tarafı değil, BUILD tarafı da tanımlı olmalı — aksi halde derleme aracı hangi tarayıcıları hedeflediğini VARSAYIMLA belirler, bu da matrisle SESSİZCE tutarsız olabilir.

- **`browserslist` yapılandırması:** `frontend/package.json`'a (veya ayrı bir `.browserslistrc`'ye) yukarıdaki matrisin BİREBİR karşılığı olan bir hedef kümesi tanımlanır (kavramsal olarak: "son 2 iOS Safari, son 2 Android Chrome, son 2 Safari, son 2 Chrome, son 2 Edge sürümü" — Firefox hedeflenmediğinden dahil EDİLMEZ). Bu TEK yapılandırma, aşağıdaki Autoprefixer VE (varsa) Babel/SWC transpilasyon hedeflerinin ORTAK kaynağıdır — iki ayrı yerde iki farklı tarayıcı listesi TANIMLANMAZ.
- **Vite `build.target`:** Vite'ın varsayılan derleme hedefi (native ES modülleri destekleyen "evergreen" tarayıcılar) `browserslist` listesindeki EN ESKİ hedeflenen sürümle uyumlu olacak şekilde AÇIKÇA ayarlanır (varsayılana bırakılmaz) — hedef matrisin "son 2 sürüm" kapsamı zaten modern ES2020+ desteği olan tarayıcılar olduğundan, `@vitejs/plugin-legacy` (eski tarayıcı transpile/polyfill katmanı) GEREKMEZ; yalnızca ihtiyaç doğarsa (ör. çok eski bir kurumsal Safari sürümü desteklenmek zorunda kalırsa) değerlendirilir (YAGNI).
- **Autoprefixer (PostCSS eklentisi):** AYNI `browserslist` yapılandırmasını okuyarak, Safari'nin (özellikle iOS Safari'nin) hâlâ önek gerektirdiği CSS özelliklerine (ör. `backdrop-filter`, bazı flexbox/grid edge-case'leri, `mask`) otomatik `-webkit-` öneki ekler — bu öneklerin HİÇBİRİ elle yazılmaz, build sürecinin bir parçasıdır.
- **Kural:** `browserslist` hedefi DEĞİŞTİĞİNDE (ör. bir tarayıcının minimum desteklenen sürümü yükseltildiğinde), Bölüm 11'in TEPESİNDEKİ test matrisi tablosu da AYNI anda güncellenir — ikisi birbirinden BAĞIMSIZ SÜRÜKLENMEZ.

---

## 12. Test Stratejisi

### 12.1 Piramit

- **Çok sayıda birim (unit) test** — saf fonksiyonlar (tarih/para formatlayıcılar, Zod şemaları, `ApiError` ayrıştırma) ve tek başına component'ler (bkz. Bölüm 9 listesi).
- **Orta sayıda entegrasyon testi** — bir sayfanın (ör. `EmployeeListPage`) MSW (Mock Service Worker) ile mock'lanmış API'ye karşı uçtan uca render+etkileşim testi (gerçek backend'e ihtiyaç YOK).
- **Az ama kritik E2E testi** — gerçek (Docker Compose'da ayağa kalkan) backend'e karşı, yalnızca "İlk çalışır hedef" ve ödeme/onay gibi yüksek riskli akışlar.

### 12.2 Araçlar

| Katman | Araç |
|---|---|
| Unit | Vitest + React Testing Library (zaten `frontend/package.json`'da mevcut) |
| Entegrasyon | Vitest + React Testing Library + MSW (`test/msw/` handler'ları modül bazında) |
| E2E | **Playwright** (yeni bağımlılık — Bölüm 13) |

### 12.3 Playwright ile E2E test yaklaşımı

- **Konum:** `frontend/test/e2e/*.spec.ts`, `playwright.config.ts` proje kökünde (`frontend/`).
- **Ortam:** Gerçek backend + PostgreSQL, mevcut `docker-compose.yml` ile ayağa kaldırılır (proje zaten bu disiplini backend için kullanıyor — `mvn test` sonrası `docker compose up` — E2E de AYNI disiplini frontend'e taşır); her test dosyası kendi test verisini (ör. `test.beforeEach`'te API ile bir çalışan oluşturma) kendisi hazırlar, paylaşılan sabit seed veriye GÜVENMEZ.
- **Projeler (Playwright `projects` config):** `chromium-desktop`, `webkit-desktop`, `chromium-mobile` (Pixel 7 profili), `webkit-mobile` (iPhone 14 profili) — Bölüm 11'deki matrisin CI karşılığı.
- **Kapsam (ilk sürüm):** Yalnızca Bölüm 13'teki 8 akış + her yeni Feature'ın KENDİ "kabul kriterleri" bölümünde belirtilen tek bir "mutlu yol" (happy path) senaryosu — E2E, HER validasyon/hata durumunu KAPSAMAZ (bunlar unit/entegrasyon seviyesinde test edilir); E2E'nin amacı gerçek tarayıcı+gerçek backend ENTEGRASYONUNUN çalıştığını kanıtlamaktır.
- **Görsel/erişilebilirlik denetimi:** Her E2E senaryosunun sonunda, ilgili sayfada `@axe-core/playwright` ile otomatik bir erişilebilirlik taraması (kritik/ciddi ihlal varsa test kırmızı) — Bölüm 10'daki hedefin otomatik kanıtı.
- **Bulaşıcı/flaky test önlemi:** Testler birbirinden BAĞIMSIZ veri kullanır (paylaşılan admin oturumu HARİÇ — login her testte tekrar tekrar YAPILMAZ, tek bir `storageState` fixture'ı ile oturum bir kez açılıp tüm testler arasında paylaşılır, backend'in `US-02.1.3`'teki oturum TTL'i test suite süresinden UZUN tutulur).

---

## 13. İlk Geliştirme Kapsamı — Detaylı Plan

Bu bölümdeki 8 madde, kullanıcının talep ettiği 9 boyutun TAMAMIYLA planlanmıştır. Genel/tekrar eden davranışlar (loading/error state'lerinin GÖRÜNÜMÜ, apiClient hata eşlemesi vb.) Bölüm 5-10'a referans verilir, burada yalnızca O EKRANA ÖZGÜ detaylar tekrar yazılır.

### 13.1 Login

**Kullanıcı akışı:** Kullanıcı e-posta/parola girer → başarılıysa token alınır ve `AuthProvider`'a yazılır → varsayılan ana sayfaya (`/`) yönlendirilir. Başarısızsa hata mesajı gösterilir, form temizlenmez (yalnızca parola alanı temizlenir).

**Route/Ekran:** `/login` (tek ekran, `xs`'den `xl`'e AYNI tek-sütun düzen — login formu geniş ekranda yatay olarak GENİŞLEMEZ, ortalanmış sabit genişlikli bir kart kalır).

**Form:**
| Alan | Tip | Validasyon |
|---|---|---|
| E-posta | text | Zorunlu, e-posta formatı |
| Parola | password (göster/gizle ikonlu) | Zorunlu |

Tablo/filtre YOK.

**Durumlar:**
- *Loading:* Gönder butonu spinner'a döner, disabled.
- *Empty:* Uygulanmaz.
- *Error:* `401` → "E-posta veya parola hatalı." form üstü banner; `423`/kilit senaryosu (`US-02.1.4`) → "Hesabınız çok sayıda başarısız denemeden dolayı geçici olarak kilitlendi." (backend `AccountLockedException` mesajı doğrudan gösterilir).
- *Success:* Toast YOK — doğrudan yönlendirme yeterli (login sonrası "başarılı" mesajı UX gürültüsü).

**Responsive:** `xs`: tam ekran, logo üstte küçük, form ortada. `sm+`: ortalanmış 400px genişlikte kart, arka plan (opsiyonel marka görseli) — ilk sürümde düz renk arka plan yeterli (YAGNI).

**Rol bazlı erişim:** Girişsiz herkese açık (tek route'un `roles` meta'sı yok).

**REST API:** `POST /api/auth/login` `{email, password}` → `{userId, email, token, expiresAt}`.

**Testler:**
- *Unit:* Zod login şeması (boş alan, geçersiz e-posta formatı reddi).
- *Entegrasyon:* MSW ile 200/401/423 senaryoları — doğru mesajın render edildiği.
- *E2E:* Gerçek backend'e karşı doğru bilgiyle giriş → ana sayfaya yönlendirme; yanlış bilgiyle hata mesajı görünürlüğü.

**Kabul kriterleri (US-02.1.1/02.1.3/02.1.4 karşılığı):** Doğru bilgiyle giriş başarılı ve token saklanır; yanlış bilgiyle anlaşılır hata gösterilir; art arda başarısız denemede kilit mesajı gösterilir; token TTL dolunca (herhangi bir sonraki API çağrısında) otomatik `/login`'e yönlendirme + "oturum sona erdi" mesajı.

---

### 13.2 Ana Layout (AppShell)

**Kullanıcı akışı:** Giriş yapan HER kullanıcı, tüm korumalı sayfalarda AYNI çerçeveyi (üst bar + menü + içerik alanı) görür; sayfa geçişlerinde çerçeve YENİDEN RENDER edilmez, yalnızca içerik alanı değişir.

**Route/Ekran:** Route değil — `<ProtectedRoute>` içindeki TÜM route'ları saran layout bileşeni (`app/AppShell.tsx`). İçerik alanı `<Outlet />` (React Router).

**Bileşenler:**
- `TopBar`: Sol hamburger (yalnızca `xs`/`sm`), sayfa başlığı, sağda kullanıcı avatarı → tıklanınca menü (Profilim, Çıkış Yap).
- `Sidebar`/`BottomNav`: bkz. Bölüm 4 ve 13.3.
- İçerik alanı: `max-width` ile `xl`'de aşırı genişlememesi için sınırlanır (1600px), ortalanır.

Form/tablo/filtre YOK (bu bir layout kabuğu).

**Durumlar:**
- *Loading:* İlk açılışta `useAuth()` session doğrulaması sürerken tüm ekran bir `LoadingSkeleton` (AppShell'in kendi iskeleti) gösterir — çerçeve daha yüklenmeden içerik yanıp sönmesin diye.
- *Error:* Session doğrulama 401 dönerse → `/login`'e yönlendirme (bkz. 5.2), AppShell HİÇ render edilmez.

**Responsive:** Bölüm 2.2 ve 4'teki üç düzenin (mobil/tablet/masaüstü) birleşimidir — bu ekranın KENDİSİ responsive davranışın referans noktasıdır.

**Rol bazlı erişim:** `TopBar`/menü, oturum açmış her rolü kabul eder; menü İÇERİĞİ role göre filtrelenir (bkz. 4.4).

**REST API:** `GET /api/auth/session` (açılışta doğrulama), `GET /api/auth/me` (kullanıcı adı/rolleri `TopBar`'da göstermek için), `POST /api/auth/logout`.

**Testler:**
- *Unit:* Rol filtresi fonksiyonu (verilen roller kümesine göre doğru menü öğelerinin döndüğü).
- *Entegrasyon:* Farklı rollerle (`ADMIN`, `CALISAN`) render edilince menü farklılığı.
- *E2E:* Giriş sonrası AppShell'in göründüğü, çıkış yapınca `/login`'e dönüldüğü.

**Kabul kriterleri:** Her korumalı sayfa AYNI çerçeve içinde açılır; kullanıcı bilgisi/rolü doğru gösterilir; çıkış işlemi oturumu tamamen temizler (`US-02.1.3`).

---

### 13.3 Responsive Menü

**Kullanıcı akışı:** Kullanıcı, ekran boyutuna göre FARKLI ama TUTARLI bir gezinme deneyimiyle modüller arası geçiş yapar; hangi modülde/sayfada olduğunu her zaman görsel olarak bilir (aktif öğe vurgusu).

**Route/Ekran:** Route değil — `Sidebar`/`BottomNav`/`Drawer` bileşenleri (AppShell'in parçası, bkz. 13.2).

**"Form/tablo" karşılığı — Menü veri yapısı:** Statik bir `menuConfig` (kod DEĞİL, planlama düzeyinde bir liste): her modül grubu → `{ label, icon, roles, children: [{label, path, roles}] }`. Bu liste, Bölüm 14.teki HER modülün route'larıyla BİREBİR eşleşir (yeni bir modül route'u eklendiğinde menüye de eklenir — ayrı bir bakım yükü OLUŞTURMAMASI için route tanımının kendisinden (`routes.tsx`) otomatik türetilmesi hedeflenir, elle iki kez yazılmaz).

**Durumlar:**
- *Loading/Error:* Uygulanmaz (menü, client-side statik veri + kullanıcı rolüne bağlı, API çağrısı gerektirmez).
- *Empty:* Kullanıcının HİÇBİR rolüyle eşleşen menü öğesi yoksa (teorik olarak imkansız — her kullanıcı en az `CALISAN` rolüyle "Profilim"i görür) boş bir mesaj YERİNE en azından Profilim/Çıkış her zaman görünür kalır.

**Responsive (bu ekranın asıl konusu):**
| Genişlik | Davranış |
|---|---|
| `xs`/`sm` | Üst hamburger → tam ekran `Drawer` (accordion gruplu) + alt `BottomNavigation` (4 sabit kısayol) |
| `md` | Sol icon-rail sidebar (72px), DOKUNMA/TIKLAMA ile geçici genişleme (birincil davranış; hover yalnızca fare kullanan tabletlerde EK ipucu, dokunmatik cihazlarda tıklama TEK BAŞINA yeterli) |
| `lg`/`xl` | Sol sabit sidebar (240px), kullanıcı manuel daraltabilir (tercih `localStorage`) |

**Rol bazlı erişim:** Bölüm 4.4'teki filtre kuralı burada UYGULANIR (bu ekranın çekirdek işlevi).

**REST API:** Yok (menü tamamen client-side, `useAuth()`'un zaten yüklediği rol bilgisine dayanır).

**Testler:**
- *Unit:* `xs`/`md`/`lg` breakpoint'lerinde doğru navigasyon bileşeninin (Drawer/icon-rail/sabit sidebar) seçildiği (mock `useMediaQuery`).
- *Entegrasyon:* Menü öğesine tıklayınca doğru route'a gidildiği, aktif öğenin vurgulandığı.
- *E2E:* Playwright'ın mobil viewport profiliyle (`iPhone 14`) alt navigasyonun görünür olduğu; masaüstü viewport'ta sabit sidebar'ın görünür olduğu (görsel/yapısal fark, Bölüm 11'deki matrisin doğrudan kanıtı).

**Kabul kriterleri:** Aynı kullanıcı, `xs`'den `xl`'e HER breakpoint'te TÜM yetkili modüllere 3 dokunma/tıklamadan fazla olmadan ulaşabilir; aktif sayfa menüde her zaman vurgulanır; yetkisiz öğe HİÇBİR breakpoint'te görünmez.

---

### 13.4 Organizasyon Listeleme ve Düzenleme (⚠️ kısmi bloklu — bkz. aşağıda)

> **Kapsam notu:** `03-product-roadmap.md`'nin Feature 03.1'i İKİ ayrı kaynağı kapsıyor: **Organizasyon Birimleri** (`US-03.1.1`, ağaç yapı) ve **Unvanlar** (`US-03.1.2`, düz liste). İkisi de burada TEK bir "Organizasyon" bölümü altında, İKİ sekme/route olarak planlanıyor.

**Kullanıcı akışı (Birimler):** İK kullanıcısı birim ağacını görür → "+ Yeni Birim" ile bir üst birim seçip alt birim ekler → ağaçtaki bir birime tıklayınca adını düzenleyebilir (backend'de `PUT` ile birim güncelleme ucu YOK — bu nedenle ilk sürümde yalnızca EKLEME + GÖRÜNTÜLEME var, düzenleme/silme backend'e endpoint eklenene kadar YOK, bkz. aşağıdaki "Backend kısıtı" notu).

**Kullanıcı akışı (Unvanlar):** İK kullanıcısı düz bir unvan listesi görür → yeni unvan ekler, mevcut birini düzenler veya siler.

> ## 🚫 BLOKLU — Birim Düzenleme/Silme
>
> `organization.OrganizationUnitController`'da yalnızca `POST /` (oluştur) ve `GET /` (listele) var — `PUT`/`DELETE` YOK (bkz. `0.5 Frontend Blokerleri`, satır 2). Bu nedenle "Organizasyon listeleme ve düzenleme" ekranının BİRİM tarafı, ilk sürümde yalnızca **listeleme + yeni birim ekleme**yi kapsar; **birim DÜZENLEME/SİLME ekranı/butonu GELİŞTİRİLEMEZ** — backend'e `PUT /api/organization/units/{id}` ve `DELETE /api/organization/units/{id}` uçları eklenene kadar bloklu kalır. **Unvan** tarafında (`JobTitleController`) `PUT`/`DELETE` zaten VAR — o taraf tam CRUD'dur, BLOKE DEĞİLDİR.

**Route/Ekranlar:**
- `/organization/units` — Birim ağacı + "Yeni Birim" formu (yan panel/modal).
- `/organization/job-titles` — Unvan listesi + CRUD.

**Form:**
*Yeni Birim:* `{ name (zorunlu, text), parentId (opsiyonel, ağaçtan birim seçici — kök birim için boş) }`.
*Unvan (oluştur/düzenle):* `{ name (zorunlu, text) }`.

**Tablo/Liste:**
- Birimler: **tablo DEĞİL**, iç içe geçmiş ağaç görünümü (`TreeView` — MUI'nin `SimpleTreeView`'i) — masaüstünde/tablette YATAY girintili ağaç, mobilde AYNI ağaç ama her düğüm `AccordionList` deseniyle (bkz. 2.3 istisnası — ağaç yapısı zaten "kart"a dönüşmeye uygun değil, accordion doğru dönüşüm).
- Unvanlar: `ResponsiveTable` (masaüstü tablo → mobil kart, bkz. 2.3), sütunlar: Ad, Aksiyonlar (Düzenle/Sil).

**Filtre:** Birim ağacında bir arama kutusu (isimde metin araması, eşleşen düğümler + üst zincirleri vurgulanır/genişletilir). Unvan listesinde `FilterBar` ile isim araması.

**Validasyon:** Birim/unvan adı boş bırakılamaz (backend `IllegalArgumentException` mesajlarıyla senkron: "Ad boş olamaz." gibi — gerçek backend mesajları kullanılacak, roadmap'te varsayım kurulmuyor, geliştirme anında ilgili DTO/servisten TEYİT edilecek).

**Durumlar:**
- *Loading:* Ağaç/liste `LoadingSkeleton` (satır/düğüm placeholder'ları).
- *Empty:* Hiç birim yoksa "Henüz bir organizasyon birimi tanımlanmadı" + "İlk Birimi Oluştur" CTA (`EmptyState`).
- *Error:* `ErrorState` + tekrar dene.
- *Success:* Oluşturma/güncelleme sonrası `Toast` ("Birim oluşturuldu" / "Unvan güncellendi").

**Responsive:** Ağaç görünümü `xs`'de accordion'a döner (yukarıda belirtildi); unvan tablosu `xs`/`sm`'de kart listesine döner (Bölüm 2.3 kuralı — 2 sütunlu bir tablo olduğundan >4 sütun kuralına takılmaz ama tutarlılık için AYNI `ResponsiveTable` component'i kullanılır, davranışı otomatik "basit liste" moduna düşer).

**Rol bazlı erişim:** Görüntüleme: `ADMIN`, `IK`. Oluşturma/düzenleme: `ADMIN`, `IK` (backend'de bu uçlarda `@PreAuthorize` YOK — yani teknik olarak herhangi bir oturumlu kullanıcı çağırabilir; frontend YİNE DE menüde/butonlarda yalnızca `ADMIN`/`IK`'ya gösterir, UX tutarlılığı için — gerçek yetkilendirme sınırı bu ekranlarda henüz backend'de YOK, bu bir bilinen kısıt olarak not edilir).

**REST API:**
- `POST /api/organization/units` `{name, parentId}` → `OrganizationUnitResponse`
- `GET /api/organization/units` → düz liste (frontend'de `parentId`'ye göre ağaca client-side dönüştürülür — backend zaten ağaç DÖNDÜRMÜYOR, düz liste döndürüyor, bu ağaca çevirme mantığı `organization/utils/buildUnitTree.ts`'te planlanır)
- `POST /api/organization/job-titles` `{name}`, `GET /`, `PUT /{id}` `{name}`, `DELETE /{id}`

**Testler:**
- *Unit:* Düz liste → ağaç dönüştürme fonksiyonu (`buildUnitTree`) — döngüsel referans, çoklu kök, boş liste durumları.
- *Entegrasyon:* Yeni birim ekleme formunun doğru `parentId` ile submit ettiği; unvan CRUD akışı.
- *E2E:* Yeni bir kök birim + altına bir alt birim oluşturma → ağaçta doğru girintide göründüğünün doğrulanması; bir unvan oluşturup silme.

**Kabul kriterleri (US-03.1.1/03.1.2 karşılığı):** Birim ağaç yapıda oluşturulur, bir birim başka birimin altına eklenebilir; unvan CRUD ekranından tam olarak yönetilir (ekle/listele/düzenle/sil). **Birim düzenleme/silme kabul kriteri, `PUT`/`DELETE` uçları backend'e eklenene kadar KARŞILANAMAZ** (🚫 BLOKLU, bkz. yukarıdaki not ve `0.5 Frontend Blokerleri`).

---

### 13.5 Çalışan Oluşturma

**Kullanıcı akışı:** İK kullanıcısı "+ Yeni Çalışan" butonuna basar → temel bilgi formunu doldurur → kaydeder → başarılıysa yeni çalışanın DETAY sayfasına yönlendirilir (organizasyon birimi/unvan ataması bu ekranda DEĞİL, detay sayfasında ayrı bir adımda yapılır — backend'de `POST /employees` yalnızca temel bilgi alır, atama AYRI bir `PUT /{id}/assignment` ucudur, `US-03.2.1` ve `US-03.2.2` bilinçli olarak backend'de de iki ayrı story).

**Route/Ekran:** `/organization/employees/new`.

**Form:**
| Alan | Tip | Validasyon |
|---|---|---|
| Ad | text | Zorunlu |
| Soyad | text | Zorunlu |
| TC Kimlik No | text (11 hane, sayısal input) | Zorunlu, format: 11 hane, ilk hane ≠ 0, resmi kontrol basamağı algoritması (backend `isValidNationalId` ile AYNI algoritma frontend'de de Zod şeması içinde TEKRARLANIR — kullanıcıya submit ÖNCESİ anında geri bildirim için; backend YİNE DE nihai doğrulayıcıdır) |
| İşe Giriş Tarihi | date picker | Zorunlu |
| E-posta | text | Zorunlu, e-posta formatı |

**Tablo/filtre:** Yok (tekil oluşturma formu).

**Durumlar:**
- *Loading:* Submit sırasında buton spinner + disabled.
- *Error:* `400` (geçersiz TC No) → alan altı hata (mesaj metninden "TC Kimlik No" çıkarılabildiği için alan-özel gösterim MÜMKÜN, bkz. 8); `409` (mükerrer TC No) → form üstü banner "Bu TC Kimlik No ile kayıtlı bir çalışan zaten var."
- *Success:* `Toast` ("Çalışan oluşturuldu") + detay sayfasına yönlendirme.

**Responsive:** `xs`: tek sütun, tam genişlik alanlar. `md+`: 2 sütunlu `Grid` (Ad/Soyad yan yana, TC No/İşe Giriş Tarihi yan yana, E-posta tek satır).

**Rol bazlı erişim:** `ADMIN`, `IK` (menüde yalnızca bu roller "+ Yeni Çalışan" görür; backend'de bu uçta da `@PreAuthorize` YOK — 13.4'teki AYNI bilinen kısıt burada da geçerli).

**REST API:** `POST /api/organization/employees` `{firstName, lastName, nationalId, hireDate, email}` → `EmployeeResponse`.

**Testler:**
- *Unit:* TC Kimlik No Zod validasyon şeması (geçerli/geçersiz kontrol basamağı örnekleri — backend testindeki AYNI `10000000146` gibi bilinen geçerli örnekler kullanılır).
- *Entegrasyon:* Form submit → API çağrısı doğru gövdeyle yapılıyor mu; 409 senaryosunda banner doğru gösteriliyor mu.
- *E2E:* Geçerli bilgilerle çalışan oluşturma → detay sayfasına yönlendiğinin ve girilen bilgilerin orada göründüğünün doğrulanması (Bölüm 14'ün "ilk çalışır hedef" akışının doğrudan kanıtı).

**Kabul kriterleri (US-03.2.1 karşılığı):** Zorunlu alanlar doğrulanır; TC No format kontrolünden geçer; kayıt oluşturulur ve kullanıcı sonucu (yeni çalışan detayını) hemen görür.

---

### 13.6 Çalışan Listeleme

**Kullanıcı akışı:** İK kullanıcısı tüm çalışanları sayfalanmış bir listede görür → isim/birim/unvana göre filtreler → bir satıra tıklayınca detay sayfasına gider → (yetkiliyse) listeyi CSV/Excel olarak indirir.

**Route/Ekran:** `/organization/employees`.

**Tablo (masaüstü) → Kart (mobil):**
| Sütun (masaüstü) | Kart alanı (mobil) |
|---|---|
| Ad Soyad | Başlık |
| TC Kimlik No | İkincil satır |
| Birim | Alt bilgi rozeti |
| Unvan | Alt bilgi rozeti |
| İşe Giriş Tarihi | Alt bilgi |
| Aksiyon (Görüntüle) | Kart tamamı tıklanabilir |

6 alan (Ad Soyad birleşik sayılırsa 5 görünür sütun) — Bölüm 2.3'teki ">4 sütun" eşiğini geçtiği için `xs`/`sm`'de OTOMATİK kart görünümüne geçer.

**Filtre (`FilterBar`):** İsim arama (debounced text input), Birim (dropdown, `GET /api/organization/units`'ten doldurulur), Unvan (dropdown, `GET /api/organization/job-titles`'ten doldurulur). "Filtreleri Temizle" butonu.

**Sayfalama:** Backend `Pageable` (`page`, `size=20` varsayılan, `sort=id`) — `Pagination` component'i sayfa numarası + toplam kayıt sayısını gösterir.

**Durumlar:**
- *Loading:* İlk yüklemede `LoadingSkeleton` (5 satır/kart placeholder); filtre değişince mevcut veri SOLUK gösterilirken arka planda yenilenir (`keepPreviousData`, ani boşluk/yanıp sönme olmasın diye).
- *Empty:* Hiç çalışan yoksa (filtre YOKKEN) "Henüz çalışan kaydı yok" + "İlk Çalışanı Oluştur" CTA; filtre SONUCU boşsa "Bu filtrelere uygun çalışan bulunamadı" + "Filtreleri Temizle" CTA (iki farklı boş durum mesajı — kullanıcı neden boş gördüğünü ayırt edebilsin diye).
- *Error:* `ErrorState`.
- *Success:* Liste normal render.

**Responsive:** Yukarıda tablo/kart geçişi ayrıntılandırıldı; filtre şeridi `xs`'de dikey yığılmış (her filtre tam genişlik), `md+`'de yatay sıra.

**Rol bazlı erişim:** Listeleme: backend'de `GET /employees` üzerinde ROL KISITI YOK (`03-product-roadmap.md`'nin US-03.2.3 kabul kriterinde de rol belirtilmiyor) — ama frontend menüsünde yalnızca `ADMIN`/`IK`'ya gösterilir (Çalışan self-servis kendi kaydını `US-03.2.6` ile AYRI bir ekrandan — "Profilim" — görür, genel listeye erişemez UX olarak). Dışa aktarma: aynı roller.

**REST API:** `GET /api/organization/employees?name=&organizationUnitId=&jobTitleId=&page=&size=&sort=` → `Page<EmployeeResponse>`; `GET /api/organization/employees/export?...&format=csv|xlsx` (dışa aktarma butonu, mevcut filtrelerle).

**Testler:**
- *Unit:* Filtre state'inin URL query string'ine senkron olması (ör. `?name=ahmet&organizationUnitId=3`) — sayfa yenilendiğinde filtrenin kaybolmaması.
- *Entegrasyon:* MSW ile boş liste, dolu liste, filtre uygulanmış liste senaryoları; `ResponsiveTable`'ın `xs` viewport'ta kart moduna geçtiğinin doğrulanması.
- *E2E:* Bir çalışan oluşturup listede göründüğünün doğrulanması (13.5 ile zincirlenmiş senaryo); isimle filtreleyip sonucun daraldığının kontrolü; CSV indirme butonunun bir dosya indirdiğinin (Playwright `download` event'i) doğrulanması.

**Kabul kriterleri (US-03.2.3 karşılığı):** Liste ekranı temel filtrelerle çalışır; sayfalama desteklenir; `xs`/`sm`'de tablo yerine kart görünümü kullanılır (bu doküman kapsamındaki EK bir kabul kriteri — kullanıcının açık talebi).

---

### 13.7 Çalışan Detay

**Kullanıcı akışı:** Kullanıcı listeden veya oluşturma sonrası bir çalışanın detayına gelir → temel bilgileri, organizasyon atamasını görür → (yetkiliyse) temel bilgileri düzenler, birim/unvan ataması yapar/değiştirir, IBAN girer, genişletilmiş özlük bilgilerini (sekme) yönetir, ücret geçmişini (yetkiliyse) görür, özel alanları (varsa tanımlıysa) doldurur, zimmet kayıtlarını yönetir.

> **Kapsam notu:** Bu, `03-product-roadmap.md`'nin TEK bir story'si DEĞİL — `US-03.2.2` (atama), `US-03.2.5` (görüntüle/güncelle), `US-03.2.6` (self-servis), `US-03.3.1-4` (genişletilmiş özlük), `US-03.4.1` (atama geçmişi), `US-09.5.1` (özel alanlar), `US-09.8.1` (IBAN) — TÜMÜNÜN buluştuğu tek bir sayfa. İlk geliştirme kapsamında yalnızca ALT SATIRDA "✅ ilk kapsamda" işaretli sekmeler yapılır; diğerleri Bölüm 14.te kendi bölümlerinde ayrıca planlanmıştır ve bu sayfaya SONRADAN sekme olarak eklenir.

**Route/Ekran:** `/organization/employees/:id` — sekmeli düzen (`Tabs`):

| Sekme | İlk kapsamda mı? | İlgili story |
|---|---|---|
| Genel Bilgiler + Atama | ✅ | US-03.2.5, US-03.2.2 |
| Genişletilmiş Özlük | ⏳ (Bölüm 14.2) | US-03.3.1 |
| Zimmetler | ⏳ (Bölüm 14.2) | US-03.3.2 |
| Ücret Geçmişi + IBAN | ⏳ (Bölüm 14.8) | US-03.3.3/4, US-09.8.1 |
| Atama Geçmişi | ⏳ (Bölüm 14.2) | US-03.4.1 |
| Özel Alanlar | ⏳ (Bölüm 14.8) | US-09.5.1 |

**Form (Genel Bilgiler):** `13.5`'teki AYNI 5 alan (düzenleme modu, mevcut değerlerle önceden doldurulmuş).
**Form (Atama):** `{ organizationUnitId (dropdown, zorunlu), jobTitleId (dropdown, zorunlu) }`.

**Tablo/liste:** Bu sekmede yok (tekil kayıt görünümü); "Atama Geçmişi" sekmesi (ilerideki) bir `AccordionList` olacak.

**Durumlar:**
- *Loading:* Sayfa açılışında `LoadingSkeleton` (form alanları placeholder).
- *Empty:* Uygulanmaz (bir `id` ile geldiğinden kayıt ya vardır ya 404).
- *Error:* `404` → tam sayfa "Çalışan bulunamadı" (`ErrorState` varyantı, geri dön butonuyla).
- *Success:* Her kaydetmede `Toast`; atama yapılınca "Genel Bilgiler" sekmesindeki atama özeti ANINDA güncellenir (`invalidateQueries`).

**Responsive:** `xs`: sekmeler yatay kaydırmalı (`scrollable` `Tabs` variant), form tek sütun. `md+`: sekmeler sabit sırayla görünür, form 2 sütun.

**Rol bazlı erişim:**
- Görüntüleme (Genel Bilgiler): `ADMIN`, `IK` **veya** kaydın SAHİBİ (backend `EmployeeAccessGuard.isSelf`, `US-03.2.6`) — kendi kaydına bakan bir `CALISAN`, AYNI sayfayı SALT-OKUNUR (düzenleme butonları gizli) görür.
- Düzenleme/Atama: yalnızca `ADMIN`, `IK`.
- Ücret Geçmişi sekmesi: yalnızca `ADMIN`, `IK` (backend `@PreAuthorize("hasAnyRole('ADMIN','IK')")`, `US-03.3.4`) — SAHİBİ bile GÖREMEZ, sekme kendisine hiç GÖSTERİLMEZ.

**REST API:**
- `GET /api/organization/employees/{id}`
- `PUT /api/organization/employees/{id}` (temel bilgi güncelleme)
- `PUT /api/organization/employees/{id}/assignment` `{organizationUnitId, jobTitleId}`
- (dropdown'lar için) `GET /api/organization/units`, `GET /api/organization/job-titles`

**Testler:**
- *Unit:* Rol bazlı buton/sekme görünürlük mantığı (`ADMIN` vs `CALISAN`-kendi-kaydı vs `CALISAN`-başka-kayıt senaryoları).
- *Entegrasyon:* Formun mevcut veriyle önceden dolduğunun, kaydetmenin doğru PUT'u tetiklediğinin doğrulanması.
- *E2E:* 13.5'te oluşturulan çalışanın detayına gidip bilgilerin doğru göründüğünün, bir birime atandığının, atama sonrası "Genel Bilgiler"de değişikliğin göründüğünün doğrulanması (Bölüm 14'ün ana E2E senaryosunun ikinci yarısı).

**Kabul kriterleri (US-03.2.2/03.2.5/03.2.6 karşılığı):** Güncelleme formu mevcut verileri gösterir; atama sonradan değiştirilebilir; çalışan yalnızca kendi kaydını (self-servis, salt-okunur) görebilir, İK dışı roller başka çalışanın kaydını GÖREMEZ.

---

### 13.8 Audit Kayıtları

> ## ⚠️ Backend kısıtı — bu ekran ŞU AN geliştirilemez
>
> `04-implementation-log.md` ve doğrudan kod taraması doğruluyor: backend'de `core.entity.AuditLogEntry` / `core.repository.AuditLogRepository` VAR (her create/update işleminde otomatik satır yazılıyor, `US-01.3.1`), ama bunu **listeleyen/okuyan HİÇBİR REST endpoint YOK**. Bu, `03-product-roadmap.md`'nin KENDİ notuyla (Feature 01.3 üstündeki "Not (YAGNI)") tutarlı: audit, şu ana kadar yalnızca YAZMA amaçlı, "merkezi görüntüleme arayüzü" kabul kriteri bilinçli olarak Bölüm 9.6'ya (`US-09.6.1/09.6.2`, henüz tetiklenmedi) ertelenmiş durumda.
>
> **Bu roadmap'in tutumu:** Kullanıcının "ilk kapsam" isteğini yok saymak yerine, ekranı TASARLIYORUZ ama önünde net bir backend ön-koşulu koyuyoruz — aşağıdaki plan, önerilen backend ucu teslim edilir edilmez KOD YAZMAYA hazır durumda olacak şekilde hazırlanmıştır.

**Önerilen backend ön-koşulu (bu dokümanın kapsamı DIŞINDA, yalnızca frontend'in ihtiyacı netleştirmesi için not edilir):** `core` modülüne `GET /api/core/audit-log?entityType=&entityId=&performedBy=&from=&to=&page=` gibi, `ADMIN`/`DENETIM` rolüne kısıtlı, sayfalanmış bir okuma ucu. `AuditLogRepository`'de zaten `findByEntityTypeAndEntityId` var — genel bir listeleme+filtre metodu eklenmesi yeterli olur.

**Kullanıcı akışı (backend hazır olduğunda):** Denetim/Admin rolündeki kullanıcı, tüm audit kayıtlarını görür → varlık türü/kullanıcı/tarih aralığına göre filtreler → bir kayda tıklayınca (varsa) detayını (önce/sonra alan farkı — backend'de ŞU AN yok, `US-09.6.1`'in genişletmesi beklenir) görür.

**Route/Ekran:** `/audit` (yalnızca `ADMIN` — ileride `DENETIM` rolü eklenirse ona da).

**Liste (masaüstü tablo → mobil `AccordionList`, 2.3'teki "detaylı kayıt" istisnası):** Sütunlar: Tarih/Saat, Kullanıcı, Varlık Türü, Varlık ID, İşlem (Oluşturma/Güncelleme). Mobilde her satır accordion başlığı ("14:32 · Ahmet Yılmaz · Employee #12 · Güncelleme"), açılınca (backend genişletilirse) alan bazlı değişiklik detayı.

**Filtre:** Varlık türü (dropdown — backend'deki bilinen entity type'ların statik listesi: Employee, LeaveRequest, HiringRequest, ...), Kullanıcı (arama), Tarih aralığı (başlangıç/bitiş date picker).

**Validasyon:** Tarih aralığında bitiş, başlangıçtan önce olamaz (client-side).

**Durumlar:** Bölüm 9'daki genel `LoadingSkeleton`/`EmptyState` ("Bu kriterlere uygun audit kaydı yok")/`ErrorState` deseni AYNEN uygulanır — bu ekrana özgü ek bir durum yok.

**Responsive:** Filtre şeridi `xs`'de dikey yığılmış; liste `xs`'de accordion, `md+`'de tablo.

**Rol bazlı erişim:** Yalnızca `ADMIN` (backend ucu teslim edildiğinde kesin rol kısıtı backend'in kendi `@PreAuthorize`'ıyla belirlenecek — bu, şimdiden VARSAYILAN bir tahmin).

**REST API:** Yukarıdaki ÖNERİLEN uç (henüz YOK) — `GET /api/core/audit-log?...`.

**Testler (backend hazır olduğunda):**
- *Unit:* Tarih aralığı validasyonu.
- *Entegrasyon:* MSW ile filtre kombinasyonlarının doğru query string'e dönüştüğü.
- *E2E:* Bir çalışan oluşturup (13.5) audit listesinde YENİ bir "Employee/Oluşturma" satırının göründüğünün doğrulanması.

**Kabul kriterleri:** Backend ucu teslim edilene kadar bu Feature **"Bloklu"** statüsündedir; teslim edildiğinde kabul kriteri — audit kayıtları filtrelenebilir şekilde listelenir; yalnızca yetkili rol erişebilir.

---

## 14. Modül Bazlı Frontend Yol Haritası (Bölüm 3.3 – Bölüm 9)

Bu bölüm, `03-product-roadmap.md`'nin KENDİ bölüm sırasını (3'ün geri kalanı → 4 → 5 → 6 → 7 → 8A-8I → 9) izler. Bölüm 14'ten farklı olarak her Feature, 9 boyutu KISA, tablo/madde formatında ele alır — genel davranışlar (loading/empty/error state GÖRÜNÜMÜ, responsive tablo→kart kuralı, apiClient hata eşlemesi, form altyapısı) HER SEFERİNDE tekrar yazılmaz, Bölüm 5-10'a referans verilir; yalnızca O FEATURE'A ÖZGÜ sapmalar belirtilir.

### 14.1 Bölüm 2 (kalan) — Kullanıcı Girişi ve Yetkilendirme

| Feature | Ekran/Route | API | Roller | Test odağı | Kabul kriteri |
|---|---|---|---|---|---|
| 02.2 Profil (`US-02.2.4`) | `/profile` — kendi ad/e-posta/rol bilgisi, salt-okunur kart | `GET /api/auth/me` | Herkes (oturumlu) | E2E: giriş sonrası profil bilgisinin doğru göründüğü | Profil ekranı giriş yapan kullanıcının bilgilerini gösterir |
| 02.2 Kullanıcı-Rol Yönetimi (`US-02.2.2`) | `/admin/users/:id/roles` — kullanıcıya rol ata/kaldır | `GET/POST/DELETE /api/auth/users/{userId}/roles` | `ADMIN` | Entegrasyon: rol ekle/kaldır sonrası listenin güncellendiği | Kullanıcıya rol atanır/kaldırılır |

> **Not:** `US-02.2.1` (başlangıç rolleri seed data) ve `US-02.1.2` (parola hash) frontend ekranı GEREKTİRMEZ — backend seed/güvenlik konusu.

### 14.2 Bölüm 3.3 – 3.4 — Genişletilmiş Özlük ve Tarihsel Değişiklik

Bu ikisi, `13.7 Çalışan Detay`'daki sekmelere karşılık gelir (bkz. o bölümdeki tablo).

| Sekme | Kullanıcı akışı | Form | API | Roller | Test | Kabul kriteri |
|---|---|---|---|---|---|---|
| Genişletilmiş Özlük (`US-03.3.1`) | Kimlik/adres/öğrenim/yabancı dil bilgisi girilir/güncellenir | ~12 alanlı tek form (doğum tarihi, doğum yeri, cinsiyet, şehir/ilçe/adres, öğrenim düzeyi, okul, mezuniyet yılı, yabancı dil, seviye) | `GET/PUT /api/organization/employees/{id}/profile` | `ADMIN`, `IK` (görüntüleme: + kaydın sahibi) | Entegrasyon: upsert (yoksa oluştur/varsa güncelle) davranışı | Bilgiler ayrı bir sekme olarak eklenir ve güncellenebilir |
| Zimmetler (`US-03.3.2`) | Çoklu zimmet kaydı (teslim/iade) | `{itemName, deliveredAt}` ekleme + `{returnedAt}` iade formu | `POST/GET .../assets`, `PUT .../assets/{assetId}/return` | `ADMIN`, `IK` | E2E: zimmet ekleyip iade etme | Zimmet listesi çoklu kayıt destekler; teslim/iade tarihi izlenir |
| Atama Geçmişi (`US-03.4.1`) | Salt-okunur, kronolojik liste (`AccordionList`) | Yok | `GET .../assignment-history` | `ADMIN`, `IK` | Unit: tarih sıralama | Değişiklik anında eski atama kapanır, yeni atama açılır; geçmiş liste olarak görüntülenir |

> **Not (Ücret Geçmişi + IBAN):** `US-03.3.3/4` ve `US-09.8.1` birbirine bağımlı (IBAN, ücret ödeme dosyasının GİRDİSİ) — bu doküman ikisini birlikte Bölüm 14.8de (Bordro) planlıyor, mantıksal bağlamları orada daha bütünlüklü.

### 14.3 Bölüm 4 — İzin Yönetimi

**Kullanıcı akışı:** Çalışan izin türü+tarih aralığı seçip talep oluşturur (bakiye yetersizse UYARI gösterilir, ENGELLENMEZ — `US-04.2.1`'in kendine özgü kabul kriteri) → yönetici kendi ekibinin taleplerini onaylar/reddeder (ret gerekçesi zorunlu) → onaylanan izin bakiyeden düşer → çalışan e-posta bildirimi alır (backend tarafı, frontend'in bir karşılığı YOK).

| Ekran/Route | Roller | API | Test odağı |
|---|---|---|---|
| `/leave/types` — izin türü CRUD | `ADMIN`, `IK` | `POST/GET/PUT/DELETE /api/leave/types` | Entegrasyon: CRUD |
| `/leave/balance` — kendi bakiyem (kart görünümü, hak ediş/kullanılan/bekleyen/kalan) | Herkes (kendi verisi) | `GET /api/leave/balance` | Unit: bakiye hesap görünümü formatlama |
| `/leave/requests/new` — yeni talep formu | `CALISAN`+ | `POST /api/leave/requests` `{employeeId, leaveTypeId, startDate, endDate}` | E2E: talep oluşturma, bakiye yetersizse uyarı banner'ı (ENGELLEMEDEN submit edilebildiği) |
| `/leave/requests` — kendi taleplerim (durum: Bekliyor/Onaylı/Reddedildi `StatusChip`) | `CALISAN`+ | `GET /api/leave/requests?employeeId=` | Entegrasyon: durum filtreleme |
| `/leave/approvals` — ekibimin bekleyen talepleri + onay/red formu (ret gerekçesi zorunlu alan) | `YONETICI` | `PUT /api/leave/requests/{id}/decision` `{decision, reason}` | E2E: onayla → bakiyenin düştüğünün doğrulanması; reddet → gerekçe zorunluluğunun doğrulanması |
| Dışa aktarma (izin geçmişi CSV/Excel) | `ADMIN`, `IK` | `GET /api/leave/requests/export` | Entegrasyon: indirme tetikleme |

**Responsive:** Talep listesi `03-product-roadmap.md` "İlk çalışır hedef" kapsamı dışında ama AYNI `ResponsiveTable` deseni kullanılır (4 sütun: Tür, Tarih Aralığı, Gün Sayısı, Durum — sınırda, `xs`'de yine de karta döner çünkü "Durum" `StatusChip`'i satır içinde okunması güçleşir).

**Kabul kriterleri:** `US-04.1.1–3`, `US-04.2.1–4` — bkz. `03-product-roadmap.md` ilgili satırlar; frontend karşılığı yukarıdaki tabloda özetlenmiştir.

### 14.4 Bölüm 5 — İşe Alım

| Ekran/Route | Kullanıcı akışı | API | Roller | Test odağı |
|---|---|---|---|---|
| `/recruitment/staffing-norms` | Birim/unvan bazlı norm kadro sayısı tanımlama | `PUT/GET /api/recruitment/staffing-norms` | `ADMIN`, `IK` | Entegrasyon |
| `/careers/apply` (giriş GEREKTİRMEZ — herkese açık, `AppShell` DIŞINDA, kendi minimal genel layout'u) | Aday CV yükler + temel bilgi | `POST /api/recruitment/candidates/applications` (multipart) | Girişsiz (public) | E2E: dosya yükleme (`FileUploadZone`), 422 (enfekte dosya, `US-09.7.2`) senaryosu |
| `/recruitment/candidates` + `/recruitment/candidates/:id` | Aday listesi + detay (not ekleme, aşama değiştirme) | `PUT .../{id}/stage`, `POST/GET .../notes`, `POST/GET .../interviews` | `ADMIN`, `IK` | Entegrasyon: aşama `StatusChip` geçişleri |
| `/recruitment/hiring-requests/new` | Norm kadroya uygun işe alım talebi (normsuz ENGELLENİR) | `POST /api/recruitment/hiring-requests` | `YONETICI` | E2E: norm YOKSA 404/hata mesajının gösterildiği |
| `/recruitment/hiring-requests` | Yönetici→İK iki aşamalı onay (backend `platform.approval` motoruyla çalışıyor, frontend'e YANSIMAZ — ekran, `PENDING/MANAGER_APPROVED/APPROVED/REJECTED` durumlarını `StatusChip` ile gösterir) | `PUT .../{id}/manager-decision`, `PUT .../{id}/hr-decision` | `YONETICI` (1. adım), `IK` (2. adım) | E2E: iki aşamalı onay akışının UÇTAN UCA (13.5'teki gibi) doğrulanması |
| Aday → çalışan dönüşümü | `POST .../{id}/convert-to-employee` butonu (aday detay sayfasında) | aynı uç | `ADMIN`, `IK` | E2E: dönüşüm sonrası `organization/employees` listesinde yeni kaydın göründüğü |

**Kabul kriterleri:** `US-05.1.1`, `US-05.2.1–2`, `US-05.3.1–2`, `US-05.4.1–2`.

### 14.5 Bölüm 6 — Performans

| Ekran/Route | Kullanıcı akışı | API | Roller |
|---|---|---|---|
| `/performance/goals`, `/performance/competencies` | Hedef/yetkinlik tanımlama (ağırlık toplamı validasyonu — form içi canlı toplam göstergesi) | `POST/GET/PUT/DELETE` | `ADMIN`, `IK` |
| `/performance/rating-scale` | Puanlama skalası (1-5 vb.) tanımlama | `PUT/GET /api/performance/rating-scale` | `ADMIN`, `IK` |
| `/performance/self-assessment` | Öz değerlendirme formu | `GET .../form`, `POST /api/performance/self-assessments` | Herkes (kendi verisi) |
| `/performance/team-assessments` | Yönetici, ekibini değerlendirir | `POST/GET /api/performance/manager-assessments` | `YONETICI` |
| `/performance/results/:employeeId` | Geçmiş sonuçlar (dönem bazlı liste) + nihai puan | `GET .../{id}/final-score` | Herkes (kendi) / `YONETICI` (ekibi) |

**Test odağı:** Ağırlık toplamının 100'ü aşmaması validasyonu (unit); yönetici yalnızca kendi ekibini değerlendirebildiğinin frontend'de de (menü/erişim) yansıtıldığı (entegrasyon).

**Kabul kriterleri:** `US-06.1.1–2`, `US-06.2.1–3`, `US-06.3.1`.

### 14.6 Bölüm 7 — PDKS ve Zaman Yönetimi

| Ekran/Route | Kullanıcı akışı | API | Roller |
|---|---|---|---|
| `/attendance/work-models` | Çalışma modeli/vardiya tanımlama | `POST/GET/PUT/DELETE /api/attendance/work-models` | `ADMIN`, `IK` |
| `/attendance/employees/:id/work-model` | Çalışana model/vardiya atama | `PUT/GET .../work-model-assignment` | `ADMIN`, `IK` |
| `/attendance/records` | Fiili giriş-çıkış kayıtları (dış PDKS'ten — bu ekran YALNIZCA GÖRÜNTÜLER, veri girişi PDKS entegrasyonundan gelir) | `GET /api/attendance/attendance-records` | `ADMIN`, `IK` |
| `/attendance/deviations` | Planlanan vardiya vs. fiili sapma (geç kalma/erken çıkış) listesi | `GET /api/attendance/attendance-records/deviations` | `ADMIN`, `IK` |
| `/attendance/timesheet` | Aylık puantaj (normal/eksik/fazla mesai) | `GET /api/attendance/timesheet` | `ADMIN`, `IK` (+ kendi puantajı: `CALISAN`) |

**Kabul kriterleri:** `US-07.1.1–2`, `US-07.2.1–2`, `US-07.3.1`.

### 14.7 Bölüm 8A – 8I — Diğer Modüller

Bu 9 modül birbirinden BAĞIMSIZ (backend'deki AYNI ilke) — hangisinin önce yapılacağı, kullanıcı ihtiyacına göre serbestçe seçilebilir. Her biri KISA tabloyla özetlenmiştir.

**8A — Eğitim Yönetimi**
| Ekran | API | Roller |
|---|---|---|
| `/training/catalog` (CRUD) | `POST/GET/PUT/DELETE /api/training/trainings` | `ADMIN`, `IK` |
| `/training/my-trainings` (talep + tamamlananlar) | `POST/PUT .../enrollments`, `GET .../completed` | `CALISAN`+ |

**8B — Harcırah/Seyahat/Masraf**
| Ekran | API | Roller |
|---|---|---|
| `/travel/requests/new` + liste | `POST/GET /api/travel/requests` | `CALISAN`+ |
| Masraf kalemi ekleme (belge yükleme, `FileUploadZone`, 422 enfekte dosya senaryosu) | `POST .../expense-items` (multipart) | `CALISAN`+ |
| Masraf onayı | `PUT .../expense-items/{id}/decision` | `YONETICI` |

**8C — Uyarı/Ceza/Ödül ve Disiplin**
| Ekran | API | Roller |
|---|---|---|
| `/discipline/warnings` (oluştur/liste) | `POST/GET /api/discipline/warnings` | `ADMIN`, `IK` |
| `/discipline/cases/:id` — savunma alanı ZORUNLU (savunma boşken "Kapat" butonu DISABLED) | `POST /api/discipline/cases`, `PUT .../defense`, `PUT .../close` | `ADMIN`, `IK` |
| `/discipline/awards` | `POST/GET /api/discipline/awards` | `YONETICI`, `ADMIN`, `IK` |

> **Not (revizyon/değişmezlik, `US-08C.1.3`):** Disiplin kaydı GÜNCELLENEMEZ, yalnızca revizyon EKLENİR — frontend'de "Düzenle" butonu YOK, yalnızca "Yeni Revizyon Ekle" (mevcut kayıt `AccordionList` ile geçmiş revizyonları gösterir).

**8D — Bordro ve Bordroya Hazırlık** → bkz. Bölüm 14.8 (ayrı, daha büyük bölüm — Bölüm 9'daki tamamlayıcılarıyla birlikte).

**8E — Anket**
| Ekran | API | Roller |
|---|---|---|
| `/surveys/new`, `/surveys` (yönetim) | `POST/GET /api/surveys` | `ADMIN`, `IK` |
| `/surveys/:id/answer` (anonim seçenekli) | `POST /api/surveys/{surveyId}/answers` | `CALISAN`+ |
| `/surveys/:id/results` (yüzdesel dağılım — grafik/çubuk gösterim) | `GET /api/surveys/{id}/results` | `ADMIN`, `IK` |

**8F — Talep ve Fikir**
| Ekran | API | Roller |
|---|---|---|
| `/suggestions/new` (kategori seçimi, anonim seçeneği) | `POST /api/suggestions` | `CALISAN`+ |
| `/suggestions` (kendi taleplerim + durum) | `GET /api/suggestions` | `CALISAN`+ |
| `/suggestions/manage` (durum güncelleme) | `PUT /api/suggestions/{id}/status` | `ADMIN`, `IK` |

**8G — Sosyal Kulüp**
| Ekran | API | Roller |
|---|---|---|
| `/clubs` (görüntüle + üyelik talebi) | `GET/POST /api/clubs`, `.../membership-requests` | `CALISAN`+ |
| `/clubs/:id/events/new` | `POST /api/clubs/events` | `KULUP_LIDERI` (yalnızca kulüp lideri — backend rol kontrolü teyit edilecek) |

**8H — Randevu**
| Ekran | API | Roller |
|---|---|---|
| `/appointments/services` (hizmet+slot tanımlama, çakışma engelleme validasyonu) | `POST/GET /api/appointments/services`, `.../slots` | `ADMIN` |
| `/appointments/book` (uygun slota randevu, aynı saatte ikinci randevu engellenir) | `POST/GET /api/appointments` | `CALISAN`+ |
| Randevu notu (sağlık verisi — yalnızca yetkili görür) | `PUT/GET .../{id}/note` | Backend'in tanımladığı özel yetkili rol |

**8I — Doküman, Görev Tanımı, Organizasyon Şeması**
| Ekran | API | Roller |
|---|---|---|
| `/documents/policies` (yükle + versiyonla — yeni versiyon eskisini arşivler, versiyon geçmişi `AccordionList`) | `POST` (multipart) `/api/documents`, `GET /` | `ADMIN`, `IK` |
| `/documents/job-descriptions` (unvan bazlı görev tanımı) | `POST/GET /api/documents/job-descriptions` | `ADMIN`, `IK` |
| `/organization/chart` (görsel organizasyon şeması — ağaç/organigram görselleştirme, `OrganizationChartController`'ın iç içe `children` yapısından render edilir) | `GET /api/organization/chart` | Herkes (oturumlu) |

### 14.8 Bölüm 9 — Kurumsal Entegrasyonlar ve Altyapı

> **Önemli fark:** `03-product-roadmap.md`'nin Bölüm 9'u "tetikleyici gerçekleşmeden ele alınmaz" diyor — ama `04-implementation-log.md`'ye göre backend, bu oturumda Bölüm 9'un **10/10 maddesini fiilen tamamladı** (yalnızca AD/LDAP, SSO, audit-immutability, merkezi log, SGK/e-Devlet, eski-sistem-migrasyonu, CI-SAST kullanıcı onayıyla/roadmap gerekçesiyle atlandı). Bu nedenle Bölüm 9'un frontend karşılığı, roadmap'in "henüz beklemede" tonundan FARKLI olarak — **backend hazır, yalnızca ekran eksik** statüsündedir.

| Feature | Ekran/Route | API | Roller | Not |
|---|---|---|---|---|
| 09.1.3 TOTP MFA | `/settings/mfa` — QR/sır ile kayıt, kod ile onay; login sonrası step-up modalında (bkz. 5.2) TOTP seçeneği | `POST /api/auth/mfa/enroll`, `POST .../enroll/confirm`, `POST /api/auth/payroll-access/verify-totp` | Herkes (kendi hesabı) | E-posta step-up (`US-08D.1.4`) ile AYNI StepUpModal'da alternatif sekme olarak sunulur |
| 09.2 Onay Zinciri Admin | `/admin/approval-chains` — zincir adım sayısı/rol tanımlama (kod yazmadan) | `POST/GET/PUT /api/platform/approval-chains` | `ADMIN` | İşe Alım (14.4) onay akışının ARKASINDAKİ motor — bu ekran yalnızca TANIM içindir |
| 09.3 Bildirim | Ekran GEREKTİRMEZ (backend-only altyapı, `core.notification`) | — | — | — |
| 09.4 Dışa Aktarma | Ekran GEREKTİRMEZ — mevcut liste ekranlarındaki "Dışa Aktar" butonları (14.3, 13.6) bu altyapıyı ZATEN kullanıyor | — | — | — |
| 09.5 Özel Alan Çerçevesi | `/admin/custom-fields` — varlık tipi (ör. "Employee") için alan tanımlama (metin/sayı/tarih/seçim); değerler `13.7 Çalışan Detay`'ın "Özel Alanlar" sekmesinde | `POST/GET /api/platform/custom-fields`, `GET/PUT /api/organization/employees/{id}/custom-fields` | Tanım: `ADMIN`. Değer: `ADMIN`, `IK` | Alan tipi `SELECT` ise seçenekler dinamik `Select` olarak render edilir |
| 09.7 Dosya Saklama + Virüs Tarama | Ekran GEREKTİRMEZ (backend-only — mevcut `FileUploadZone` component'i, 422 hata eşlemesiyle ZATEN kapsıyor, bkz. 6.2) | — | — | — |
| 09.8.1 Banka Ödeme Dosyası | `/payroll/bank-payment-file` — yıl/ay seçip CSV indirme | `GET /api/payroll/bank-payment-file?year=&month=` | `ADMIN`, `IK` (+ step-up 2FA, `/api/payroll/**`) | IBAN girişi (`13.7`'nin ileride eklenecek sekmesi) ÖN KOŞUL |
| 09.9.1 Şifreleme | Ekran GEREKTİRMEZ (backend-only, DB seviyesi) — TC No/IBAN/ücret alanları frontend'de NORMAL metin gibi gösterilir/girilir, şifreleme backend'de şeffaf | — | — | — |
| 09.10 Dağıtım/Yedek | Ekran GEREKTİRMEZ (operasyonel, backend/DevOps konusu) | — | — | — |

**Ücret Geçmişi + IBAN (13.7'nin tamamlayıcısı, `US-03.3.3/4` + `US-09.8.1`):**

| Ekran | Kullanıcı akışı | Form | API | Roller |
|---|---|---|---|---|
| Çalışan Detay → "Ücret Geçmişi" sekmesi | Yeni ücret kaydı eklenir (eskisi SİLİNMEZ, liste olarak kalır); IBAN girilir | `{amount, effectiveDate, reason}` + ayrı `{iban}` formu (IBAN formatı canlı doğrulanır — mod-97, backend'deki AYNI algoritma frontend Zod şemasında tekrarlanır) | `POST/GET .../salary-records`, `PUT .../iban` | Yalnızca `ADMIN`, `IK` (sekmenin KENDİSİ bu rollere kısıtlı, kaydın sahibi bile göremez — `US-03.3.4`) |

---

## 15. Kapanış Notu

Bu doküman, `03-product-roadmap.md`'nin frontend karşılığıdır ve AYNI disiplinle okunmalıdır: bölüm/feature sırası ÖNERİDİR, zorunlu bir takvim DEĞİLDİR; Bölüm 9.daki (burada 14.8) ekranlar backend hazır olduğu için ÖNCELİKLENDİRİLEBİLİR ama bu doküman onları zorunlu KILMAZ. `13. İlk Geliştirme Kapsamı` (Login → Ana Layout → Responsive Menü → Organizasyon → Çalışan CRUD → Audit), kullanıcının açıkça talep ettiği BAŞLANGIÇ noktasıdır ve `03-product-roadmap.md`'nin kendi "İlk çalışır hedef" (Bölüm 0.3) tanımıyla BİREBİR örtüşür — bu doküman o hedefe frontend'i EKLEMİŞ olur.

İki madde TAM BLOKLU — **Audit Kayıtları (13.8)** ve **Organizasyon Birimi Düzenleme/Silme (13.4)** — backend'e ilgili uçlar eklenmeden geliştirilemez; bu doküman o uçları İCAT ETMEMİŞ, yalnızca İHTİYACI netleştirmiştir (tam liste: `0.5 Frontend Blokerleri`). `03-product-roadmap.md` ve `04-implementation-log.md` DEĞİŞTİRİLMEMİŞTİR.

*Doküman sonu — Bu, yalnızca bir frontend yol haritasıdır. Kod, component implementasyonu veya route dosyası bu aşamada üretilmemiştir.*
