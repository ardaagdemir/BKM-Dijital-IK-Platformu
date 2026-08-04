# Dijital İnsan Kaynakları Platformu — Frontend Uygulama Günlüğü

**Amaç:** `05-frontend-roadmap.md`'deki her bölüm tamamlandığında, ne eklendiğinin/değiştiğinin kısa bir kaydı. Bu doküman bir plan değil, **geçmişe dönük bir günlüktür** — tamamlanan iş bittikçe buraya yeni bir bölüm eklenir. Backend tarafının `04-implementation-log.md`'siyle AYNI disiplin ve format izlenir.

**Format:** Her bölüm için Bölüm numarası, kısa özet, tasarım kararları, değişen/eklenen dosyalar, çalıştırma komutları ve canlı (Docker) doğrulama. Bölümler **roadmap sırasına göre** sıralıdır ve şimdiye kadar TAM OLARAK o sırayla tamamlandı (13.1 → 13.2 → 13.3 → 13.4 → 13.5), sapma yok.

**Not (commit durumu):** Bu günlüğün yazıldığı an itibarıyla, aşağıdaki TÜM bölümler tek bir çalışma alanında (working tree) tamamlanmış ama HENÜZ commit edilmemiş durumda — backend'deki "her görev kendi commit'i" disiplininin aksine, kullanıcı henüz commit talimatı vermedi. `git status` bu günlüğün yazıldığı an: `auth/SecurityConfig.java` ve `bootstrap/application.yml` değişiklikleri (13.1'in CORS düzeltmesi) + `frontend/` altında geniş bir değişiklik seti, hepsi staged olmayan (unstaged/untracked) durumda.

---

## 13.1 — Login

**Özet:** `/login` ekranı — e-posta/parola formu, `AuthProvider`/`useAuth`, merkezi `apiClient` (401 interceptor'lı), token `localStorage`'da. Roadmap'in "önce backend API doğrula" ilkesi gereği önce gerçek `POST /api/auth/login` davranışı incelendi.

**Tasarım kararları:**
- **Backend'de CORS yapılandırması HİÇ YOKTU** — `auth.SecurityConfig`'de `.cors(...)` çağrısı yoktu, tarayıcıdan hiçbir origin `/api/auth/**`'e erişemiyordu. Bu, roadmap'in kendi Blokerler tablosunda dahi NOT EDİLMEMİŞ, bu oturumda keşfedilen yeni bir bulgu. Minimal bir `CorsConfigurationSource` eklendi (`app.cors.allowed-origins`, varsayılan: Vite dev 5173, Vite preview 4173, docker-compose frontend 3000) — `SecurityConfig` constructor'ına `@Value` ile enjekte edildi, `LoginAttemptService`'teki AYNI inline-default deseni izlendi (test context'lerinde ayrıca tanımlamaya gerek KALMASIN diye).
- **`apiClient`, axios yerine ince bir `fetch` sarmalayıcısı** — backend'in tek tip `ProblemDetail` formatı zaten tutarlı olduğundan ek bağımlılık gereksiz (roadmap Bölüm 6.1'in kendi gerekçesi).
- **401 interceptor TEK bir yerde** (`apiClient.ts`) — login isteğinin KENDİSİ hariç, herhangi bir 401 token'ı temizler + `/login?expired=1`'e yönlendirir; `AuthProvider`'ın mount-time oturum doğrulaması da AYNI yolu kullanır (ayrı bir "session expired" kodu YAZILMADI).
- **Token `localStorage`'da — BİLİNÇLİ, geçici bir teknik borç** (roadmap Bölüm 5.2'nin kendi notu): backend `Set-Cookie`/`httpOnly` desteklemiyor, refresh token yok; hedef çözüm backend değişikliği gerektirir, bu bölümün kapsamı DEĞİL.
- **Üç ortam sorunu keşfedilip çözüldü** (uygulama koduyla İLGİSİZ, test/derleme altyapısı sorunları):
  1. Node 22+'nin yerleşik global `localStorage`'ı (webstorage API) jsdom'unkini GÖLGELİYORDU — `NODE_OPTIONS=--no-experimental-webstorage` ile test script'ine eklendi (`cross-env` üzerinden, Windows uyumluluğu için).
  2. `jsdom@29.1.1`, Vitest'in beklediği peer aralığının (`^27.4.0`) dışındaydı — bu da `window.localStorage`'ın boş bir stub dönmesine yol açıyordu; `jsdom@27.4.0`'a indirildi.
  3. Docker'da backend container'ı, CORS değişikliğimden ÖNCE build edilmiş ESKİ bir image kullanıyordu (`docker compose up -d` var olan image'ı yeniden build ETMİYOR) — `docker compose build backend` ile açıkça yeniden build edildi.

**Değişen/eklenen dosyalar:**
- `auth/src/main/java/com/digitalik/auth/security/SecurityConfig.java` — `corsConfigurationSource()` bean'i, `.cors(...)` filter zincirine eklendi
- `bootstrap/src/main/resources/application.yml` — `app.cors.allowed-origins`
- `frontend/.env` — `VITE_API_BASE_URL=http://localhost:8080`
- `frontend/src/vite-env.d.ts` — `ImportMetaEnv` tip augmentasyonu
- `frontend/src/shared/types/ProblemDetail.ts`, `shared/api/ApiError.ts`, `shared/api/apiClient.ts` (yeni)
- `frontend/src/modules/auth/{types,schema}.ts`, `api/authApi.ts`, `AuthProvider.tsx`, `ProtectedRoute.tsx`, `pages/LoginPage.tsx` (yeni)
- `frontend/src/App.tsx` — `Providers` + `RouterProvider` sarmalayıcısına dönüştürüldü; `App.test.tsx` güncellendi (artık oturumsuz ziyaretçi için login ekranını doğruluyor)
- `frontend/src/setupTests.ts` — MSW server lifecycle + `localStorage.clear()`/`cleanup()`
- `frontend/vite.config.ts` — `test.exclude`'a `test/e2e/**` eklendi (Playwright dosyalarının Vitest'e karışmaması için)
- `frontend/package.json` — `react-router-dom`, `@tanstack/react-query`, `react-hook-form`, `zod`, `@hookform/resolvers`, dev: `msw`, `@playwright/test`, `@axe-core/playwright`, `@testing-library/user-event`, `cross-env`, `jsdom@27.4.0`
- `frontend/playwright.config.ts` (yeni) — 4 proje (chromium/webkit × desktop/mobile), `webServer: npm run build && npm run preview`
- `frontend/test/msw/{server.ts,handlers/auth.ts}` (yeni)
- `frontend/test/e2e/login.spec.ts` (yeni)
- `frontend/.gitignore` — Playwright çıktı klasörleri (`test-results/`, `playwright-report/`) eklendi

**Çalıştırma komutları:**
```bash
cd frontend
npm run test       # Vitest — 8 test, 0 hata
npm run build       # tsc -b && vite build
npx playwright test # 16 test (4 proje × 4 senaryo), 0 hata
```

**Canlı doğrulama:** `docker compose up -d postgres mailpit clamav backend` sonrası `docker compose build backend` ile CORS değişikliği içeren image yeniden build edildi. `curl` ile hem basit istekte hem preflight'ta (`OPTIONS`) `Access-Control-Allow-Origin` header'ının doğru döndüğü doğrulandı. `mvn -pl auth -am test` → 21/21 auth testi hâlâ yeşil (CORS değişikliği regresyon YARATMADI). Playwright E2E gerçek backend'e karşı: doğru/yanlış bilgiyle giriş, oturumsuz erişimde `/login`'e yönlendirme, `axe-core` erişilebilirlik taraması — tümü 4 projede (masaüstü/mobil × Chromium/WebKit) yeşil.

---

## 13.2 — Ana Layout (AppShell)

**Özet:** TopBar + Sidebar/BottomNav + içerik alanından oluşan, TÜM korumalı sayfaları saran ortak çerçeve. Kullanıcının açık talimatı: "Sade, modern, kurumsal görünüm — varsayılan MUI'yi olduğu gibi bırakma, tasarım kararlarını `theme.ts`'te merkezi yönet."

**Tasarım kararları:**
- **`theme.ts`'te tam bir tasarım sistemi** — özel palet (koyu lacivert `#1E3A5F` primary, açık gri-mavi arka plan `#F4F6F9`), sistem fontu yığını, `shape.borderRadius: 10`, `MuiButton`/`MuiAppBar`/`MuiDrawer`/`MuiListItemButton`/`MuiBottomNavigation` component override'ları. Login ekranı (13.1'den) bu temayı otomatik miras aldı — HİÇBİR component dosyası değişmeden.
- **AppShell, `router.tsx`'te bir layout route** (`<Outlet/>` sarar) — sayfa geçişlerinde KENDİSİ yeniden mount edilmez.
- **Masaüstü/tablet/mobil TAM responsive mekanik**: `lg`/`xl`'de kalıcı daraltılabilir sidebar (`localStorage`'a yazılan tercih), `md`'de her zaman icon-rail + tıklamayla açılan GEÇİCİ genişleme overlay'i (içeriği İTMEZ, `variant="temporary"` bir Drawer), `xs`/`sm`'de hamburger → tam ekran Drawer + sabit BottomNavigation.
- **İki gerçek hata bulundu ve düzeltildi** (kullanıcı isteği olmadan, kendi doğrulama sürecimde):
  1. `axe-core` taraması: `<ul>` (List) doğrudan `<a>` (Link) çocuğu içeriyordu — `ListItemButton`'ı `<ListItem disablePadding>` ile sarmalayarak düzeltildi.
  2. Sabit (`position: fixed`) TopBar, aynı `y=0`'da başlayan kalıcı Sidebar'ın marka başlığını görsel olarak ÖRTÜYORDU — marka kimliği TopBar'a taşındı, Sidebar artık `top: TOPBAR_HEIGHT` ile TopBar'ın ALTINDAN başlıyor.
- **`AuthProvider` genişletildi**: `GET /api/auth/me` (fullName + roles) tek çağrıda hem token geçerliliğini doğruluyor hem TopBar/UserMenu'nün ihtiyaç duyduğu profili getiriyor — `GET /api/auth/session`'ın yerini aldı.
- **`ProtectedRoute`, `AppShellSkeleton` gösterir** (genel bir `CircularProgress` yerine) — "çerçeve daha yüklenmeden içerik yanıp sönmesin" kabul kriteri.

**Değişen/eklenen dosyalar:**
- `frontend/src/app/theme.ts` — tam yeniden yazıldı (özel palet/tipografi/component override'ları)
- `frontend/src/app/{AppShell,AppShellSkeleton,TopBar,Sidebar,TabletExpandOverlay,NavDrawer,BottomNav,NavList,UserMenu,BrandHeader,FullHeightBox,layout.constants,providers,router}.tsx` (yeni/genişletildi)
- `frontend/src/app/HomePlaceholder.tsx` — sadeleştirildi (marka artık AppShell'de)
- `frontend/src/modules/auth/{types,api/authApi,AuthProvider,ProtectedRoute}.ts(x)` — `ProfileResponse`/`getProfile` eklendi
- `frontend/test/msw/handlers/auth.ts` — `meAdmin`/`meCalisan`/`meUnauthorized`/`logoutSuccess` handler'ları eklendi
- `frontend/src/app/AppShell.test.tsx` (yeni) — rol bazlı menü + kullanıcı bilgisi testleri
- `frontend/test/e2e/appshell.spec.ts` (yeni)
- `frontend/index.html` — `viewport-fit=cover` (Bölüm 3 safe-area gereksinimi)

**Çalıştırma komutları:**
```bash
cd frontend
npm run test         # 15 test, 0 hata
npx playwright test  # 36 test (+4 skip, viewport-bağımlı), 0 hata
```

**Canlı doğrulama:** Docker backend'e karşı Playwright: giriş sonrası TÜM sayfalarda aynı çerçeve, kullanıcı menüsü ad/e-posta/rol gösterimi, çıkış sonrası oturumun GERÇEKTEN temizlendiği (korumalı sayfaya tekrar gitmeye çalışınca `/login`'e döndüğü), masaüstü sidebar daraltma tercihinin sayfa yenilemede kalıcı olduğu, mobil hamburger+BottomNav, `axe-core` taraması — tümü yeşil. Ayrıca Playwright ile manuel ekran görüntüleri alınarak masaüstü/daraltılmış/kullanıcı-menüsü/mobil görünümler görsel olarak da doğrulandı.

---

## 13.3 — Responsive Menü

**Özet:** 13.2'nin responsive MEKANİĞİ üzerine, roadmap'in açıkça istediği mimari: menü, route tanımlarının KENDİSİNDEN otomatik türetilir — "elle iki kez yazılmaz."

**Tasarım kararları:**
- **`navigation.tsx`, route + menü verisinin TEK kaynağı** — her route, `handle: { title, nav? }` taşıyor; `router.tsx` artık `appRoutes`'u DOĞRUDAN `children` olarak tüketiyor, `navigationItems` bu listeden otomatik türetiliyor (`HomePlaceholder`'ın kendisi bile artık yalnızca `navigation.tsx`'te import ediliyor, `router.tsx`'te DEĞİL).
- **Aktif öğe vurgusu**: hem `NavList` (sidebar/drawer/overlay) hem `BottomNav`'daki aktif öğeler `aria-current="page"` taşıyor — 13.2'nin GÖRSEL vurgusu (`.Mui-selected` teması) artık ekran okuyucular için de doğru işaretli.
- **Responsive mekanik zaten 13.2'de tam kapsamlıydı** — bu bölümde yalnızca roadmap'in açıkça istediği test katmanı eklendi: `useMediaQuery` MOCK'lanarak breakpoint dallanması izole test edildi (`vi.mock('@mui/material/useMediaQuery')`), menü tıklamasının doğru route'a gittiği + `aria-current`'ın taşındığı entegrasyon testiyle doğrulandı.
- **Test yazarken öğrenilen MUI/jsdom davranışı**: MUI Modal, açıkken arka plan kardeşlerine GEÇİCİ `aria-hidden="true"` uygular (erişilebilirlik için doğru davranış) — bu, testte "arka plandaki buton artık `getByRole` ile bulunamıyor" şeklinde İLK bir "hata" gibi göründü, sonradan `.MuiBackdrop-root`'un `visibility` durumunu `toBeVisible()` ile kontrol ederek doğru şekilde test edildi.

**Değişen/eklenen dosyalar:**
- `frontend/src/app/navigation.tsx` — `appRoutes` (route+nav birleşik TEK kaynak), `RouteHandle` tipi
- `frontend/src/app/router.tsx` — `appRoutes`'u doğrudan tüketecek şekilde sadeleştirildi
- `frontend/src/app/NavList.tsx` — `aria-current` eklendi
- `frontend/src/app/BottomNav.tsx` — `aria-current` eklendi
- `frontend/src/app/AppShell.breakpoint.test.tsx`, `AppShell.navigation.test.tsx` (yeni)
- `frontend/test/e2e/appshell.spec.ts` — "13.3 — aktif öğe vurgusu" bloğu eklendi

**Çalıştırma komutları:**
```bash
cd frontend
npm run test         # 18 test, 0 hata
npx playwright test  # 40 test (+8 skip), 0 hata
```

**Canlı doğrulama:** Docker backend'e karşı: masaüstü sidebar'daki VE mobil alt gezinmedeki aktif öğenin `aria-current="page"` taşıdığı doğrulandı.

---

## 13.4 — Organizasyon Listeleme ve Düzenleme

**Özet:** Organizasyon Birimleri (ağaç, yalnızca oluşturma+listeleme — backend'de düzenleme/silme ucu YOK) + Unvanlar (tam CRUD), "TEK bir Organizasyon bölümü altında İKİ sekme" olarak. Önce backend gerçekten teyit edildi: `OrganizationUnitController`'da yalnızca `POST`/`GET` var (roadmap'in kendi notuyla uyumlu), `JobTitleController`'da tam CRUD var; validasyon mesajları backend servis kodundan BİREBİR alındı.

**Tasarım kararları:**
- **Birim ağacı TAMAMEN client-side inşa edilir** (`buildUnitTree`) — backend düz liste döner (`{id, name, parentId}`), ağaca dönüştürme frontend'in sorumluluğu. Döngüsel referans ve kendine-referans durumları, sonsuz döngüye/render çökmesine yol açmadan KÖK olarak ele alınır (unit test'lerle kanıtlandı).
- **Masaüstü/tablet: `@mui/x-tree-view`'in `SimpleTreeView`'i; mobil: recursive `Accordion`** (Bölüm 2.3 istisnası — ağaç yapısı "kart"a dönüşmeye uygun değil). Arama, eşleşen düğümleri VURGULAR ve üst zincirlerini OTOMATİK GENİŞLETİR (tree yapısını BUDAMAZ).
- **Bölüm 9'da (roadmap) ÖNCEDEN listelenen paylaşılan component'ler** (`ResponsiveTable`, `EmptyState`, `ErrorState`, `LoadingSkeleton`, `ConfirmDialog`, `FilterBar`, `PageHeader`, `Toast`) bu bölümde İLK GERÇEK ihtiyaçta inşa edildi — roadmap'in kendisi bunları "ikinci modülde tekrarlanacağı önceden belli" olarak işaretlediğinden, ilk kullanımda doğrudan `shared/`'a yazıldılar (genel YAGNI kuralının BİLİNÇLİ bir istisnası, roadmap'in kendi Bölüm 9 notuyla gerekçeli).
- **`ProtectedRoute`'a `roles` desteği eklendi** — Bölüm 5.2'de ZATEN spesifiye edilmiş ama 13.1/13.2/13.3 hiçbiri ihtiyaç duymadığı için ERTELENMİŞTİ; `/organization/*` artık gerçekten `ADMIN`/`IK`'ya kısıtlı (`/403` sayfasıyla).
- **Backend'in gerçek kısıtları frontend'e DÜRÜSTÇE yansıtıldı**: unvan silme backend'de "kullanımda" kontrolü YAPMIYOR (FK ihlali olursa 500 dönebilir) — frontend var OLMAYAN bir "kullanımda" mesajı UYDURMADI, yalnızca genel hata banner'ı gösteriyor.
- **Test yazarken keşfedilen gerçek MUI davranışı**: `ResponsiveTable`/`UnitTreeDesktop`/`UnitTreeAccordion`, masaüstü VE mobil sürümlerini AYNI ANDA render eder (yalnızca CSS `display` ile ayrışır — jsdom bunu değerlendirmez, gerçek tarayıcıda da Playwright'ın `getByText` sorgusu görünürlüğe göre FİLTRELEMEZ) — testler `role="table"`/`role="tree"`'ye SCOPE edilerek (yalnızca masaüstü sürümde bu rol var) düzeltildi.

**Değişen/eklenen dosyalar:**
- `frontend/src/modules/auth/ProtectedRoute.tsx` — `roles` prop'u; `frontend/src/app/Forbidden.tsx` (yeni)
- `frontend/src/shared/components/{ToastProvider,PageHeader,EmptyState,ErrorState,LoadingSkeleton,ConfirmDialog,FilterBar,ResponsiveTable}.tsx` (yeni)
- `frontend/src/shared/api/apiClient.ts` — `put`/`delete` metotları eklendi
- `frontend/src/modules/organization/{types,schema,queryKeys}.ts`, `api/organizationApi.ts`, `api/use{Units,CreateUnit,JobTitles,CreateJobTitle,UpdateJobTitle,DeleteJobTitle}.ts` (yeni)
- `frontend/src/modules/organization/utils/buildUnitTree.ts` (+test)
- `frontend/src/modules/organization/components/{CreateUnitDialog,JobTitleFormDialog,UnitTreeDesktop,UnitTreeAccordion}.tsx`, `pages/{UnitsPage,JobTitlesPage,OrganizationLayout}.tsx` (yeni)
- `frontend/src/app/navigation.tsx` — `/organization` (rol kısıtlı) + `units`/`job-titles` alt route'ları
- `frontend/package.json` — `@mui/x-tree-view`
- `frontend/test/msw/handlers/organization.ts` (yeni, durum taşıyan CRUD fabrikası)
- `frontend/test/e2e/organization.spec.ts` (yeni)

**Çalıştırma komutları:**
```bash
cd frontend
npm run test         # 31 test, 0 hata
npx playwright test  # 46 test (+10 skip), 0 hata
```

**Canlı doğrulama:** Docker backend'e karşı: kök birim + alt birim oluşturma → ağaçta doğru DOM İÇERMESİYLE (child treeitem, root'un KENDİ alt ağacında) girinti kanıtlandı; unvan oluşturma+silme. Ayrıca Playwright ile manuel ekran görüntüleriyle masaüstü ağaç/daraltılmış/tablet rail+overlay görünümleri görsel olarak doğrulandı.

---

## 13.5 — Çalışan Oluşturma

**Özet:** `/organization/employees/new` — temel bilgi formu (Ad/Soyad/TC Kimlik No/İşe Giriş Tarihi/E-posta), başarılıysa `/organization/employees/:id` detay sayfasına yönlendirir. Önce backend'in gerçek `EmployeeController` davranışı teyit edildi; ÖNEMLİ bir düzeltme bulundu: `GET /{id}` üzerinde önceki bölümlerde varsayılmayan bir `@PreAuthorize("hasAnyRole('ADMIN','IK') or isSelf")` var (13.5'in kendi rol kapsamıyla zaten uyumlu, ek işlem gerekmedi).

**Tasarım kararları:**
- **TC Kimlik No kontrol basamağı algoritması backend'den (`EmployeeService.isValidNationalId`) BİREBİR alınıp Zod'da tekrarlandı** — backend'in kendi test sabitleriyle (`10000000146`, `12345678950`, `11111111110`) doğrulandı.
- **Detay sayfası BİLİNÇLİ OLARAK minimal ve salt-okunur** — tam sekmeli düzenleme/atama görünümü Bölüm 13.7'nin kapsamı; burada yalnızca "oluşturma sonrası detaya yönlendirme, girilen bilgiler orada görünür" kabul kriterini karşılayan 5 alanlık bir görünüm var.
- **Çalışan LİSTESİ (13.6) YOK** — "+ Yeni Çalışan" girişinin gerçek/tıklanabilir bir yerde durabilmesi için `HomePlaceholder`'daki AYNI desenle minimal bir "Çalışanlar" sekmesi eklendi (yalnızca `PageHeader` + aksiyon butonu, liste/filtre/sayfalama YOK).
- **Backend'in TEK-alanlı hata mesajı, bilinen/sabit metinlerle alan-özel gösterime çevrildi** (Bölüm 8'in "MÜMKÜNSE" notu) — `"Ad boş olamaz."` → `firstName` gibi sabit bir eşleştirme tablosuyla, banner HER ZAMAN gösterilmeye devam ediyor.
- **`@mui/x-date-pickers` + `dayjs` (tr locale)** ilk kez kuruldu, `app/providers.tsx`'e `LocalizationProvider` olarak eklendi — ileriki modüller de (izin, PDKS vb.) kullanacak paylaşılan altyapı.
- **Test/E2E yazarken keşfedilen gerçek MUI X davranışı**: segmentli tarih alanı `fill()` ile ÇALIŞMIYOR — her segment (gün/ay/yıl) AYRI odaklanıp yazılmalı; dokunmatik (mobil) projelerde MUI otomatik olarak `MobileDatePicker`'a geçiyor ve gün seçiminden sonra `DesktopDatePicker`'dan FARKLI olarak ayrı bir "OK" onay tıklaması gerektiriyor — E2E'de takvim-tıklama yaklaşımına geçilerek HER İKİ varyantta da güvenilir hale getirildi.

**Değişen/eklenen dosyalar:**
- `frontend/src/app/providers.tsx` — `LocalizationProvider` (`AdapterDayjs`, `adapterLocale="tr"`)
- `frontend/src/modules/organization/types.ts` — `Employee`, `CreateEmployeeRequest`
- `frontend/src/modules/organization/schema.ts` — `isValidNationalId`, `employeeSchema` (+test)
- `frontend/src/modules/organization/api/organizationApi.ts` — `createEmployee`, `getEmployee`; `api/use{CreateEmployee,Employee}.ts` (yeni)
- `frontend/src/modules/organization/queryKeys.ts` — `employees` anahtarları
- `frontend/src/modules/organization/pages/{EmployeeCreatePage,EmployeeDetailPage,EmployeesPlaceholderPage}.tsx` (yeni, +`EmployeeCreatePage.test.tsx`)
- `frontend/src/modules/organization/pages/OrganizationLayout.tsx` — "Çalışanlar" üçüncü sekme
- `frontend/src/app/navigation.tsx` — `employees`, `employees/new`, `employees/:id` alt route'ları
- `frontend/package.json` — `@mui/x-date-pickers`, `dayjs`
- `frontend/test/e2e/helpers.ts` (yeni) — `login`/`goToOrganization`/`generateValidNationalId`, `organization.spec.ts`'ten ORTAK modüle çıkarıldı (13.4+13.5 İKİNCİ gerçek kullanım)
- `frontend/test/e2e/employee.spec.ts` (yeni); `organization.spec.ts` — helper'ları `helpers.ts`'ten import edecek şekilde güncellendi

**Çalıştırma komutları:**
```bash
cd frontend
npm run test         # 44 test, 0 hata
npm run build        # tsc -b && vite build
npx playwright test  # 54 test (+10 skip), 0 hata
```

**Canlı doğrulama:** Docker backend'e karşı: geçerli bilgilerle çalışan oluşturma → detay sayfasına yönlendirme → girilen TÜM bilgilerin (ad, soyad, TC No, e-posta) orada göründüğü; mükerrer TC Kimlik No ile ikinci deneme → form üstü banner (`"Bu TC Kimlik No ile kayıtlı bir çalışan zaten var."`) — tümü masaüstü+mobil × Chromium+WebKit'te (4 proje) yeşil. Ayrıca Playwright ile manuel ekran görüntüleriyle boş form/dolu form/detay sayfası görsel olarak da doğrulandı.

---

## 13.6 — Çalışan Listeleme

**Özet:** `/organization/employees` — 13.5'te YER TUTUCU olarak bırakılan `EmployeesPlaceholderPage` yerine gerçek, filtrelenebilir, sayfalanmış bir liste. Önce backend'in gerçek `GET /api/organization/employees` (arama: `name`/`organizationUnitId`/`jobTitleId`, `Pageable`, varsayılan `size=20`, `sort=id`) ve `GET /api/organization/employees/export` (`format=csv|xlsx`, CSV `nationalId` alanını BİLİNÇLİ OLARAK dışlıyor) davranışı `EmployeeController`/`EmployeeControllerTest` üzerinden teyit edildi. ÖNEMLİ bulgu: Spring Data'nın bu sürümdeki `Page` JSON şekli DÜZ (`{content, totalElements, ...}`) DEĞİL, İÇ İÇE (`{content:[...], page:{size,number,totalElements,totalPages}}`) — roadmap dokümanının ima ettiğinin AKSİNE, gerçek test assertion'larından doğrulandı.

**Tasarım kararları:**
- **Filtre state'i URL query string'i ile senkron** (`?name=&organizationUnitId=&jobTitleId=&page=`) — sayfa yenilendiğinde/geri-ileri gidildiğinde kaybolmaz; varsayılan değerler URL'e YAZILMAZ (temiz URL).
- **İsim araması debounced (400ms)** — her tuş vuruşunda değil, yazma durduktan sonra URL/API tetiklenir; `useDebouncedValue` (yeni, paylaşılan) ilk gerçek ihtiyaçta oluşturuldu.
- **Birim/Unvan dropdown filtreleri** — `FilterBar`'a geriye-dönük-uyumlu şekilde opsiyonel `selects` prop'u eklendi (var olan 2 çağrı yeri etkilenmedi).
- **Yetkilendirilmiş dosya indirme** (`apiClient.getBlob` + `URL.createObjectURL` + geçici `<a>` tıklaması) — düz bir `<a href>` Bearer token'ı taşıyamayacağından; CSV/XLSX seçimi bir `Menu` ile sunulur.
- **`ResponsiveTable`'a `onRowClick`** eklendi (satıra/karta tıklayınca detay sayfasına gider) — mevcut 2 çağrı yeri (`onRowClick` vermeyen) etkilenmedi.
- **Boş durum İKİ farklı mesaj**: hiç filtre yokken "Henüz çalışan kaydı yok." (Yeni Çalışan CTA'sı ile), filtre uygulanmışken "Bu filtrelere uygun çalışan bulunamadı." (Filtreleri Temizle CTA'sı ile).

**Değişen/eklenen dosyalar:**
- `frontend/src/shared/api/apiClient.ts` — `performFetch` ortak yardımcıya çıkarıldı; `requestBlob`/`apiClient.getBlob` eklendi
- `frontend/src/shared/types/PageResponse.ts`, `frontend/src/shared/hooks/useDebouncedValue.ts`, `frontend/src/shared/utils/downloadBlob.ts` (yeni)
- `frontend/src/shared/components/Pagination.tsx` (yeni) — 0-indexli backend sayfasını 1-indexli MUI `Pagination`'a çevirir
- `frontend/src/shared/components/FilterBar.tsx` — opsiyonel `selects`/`onClearAll`; `frontend/src/shared/components/ResponsiveTable.tsx` — opsiyonel `onRowClick`
- `frontend/src/modules/organization/{types,queryKeys}.ts` — `EmployeeSearchParams`, `employees.list` anahtarı
- `frontend/src/modules/organization/api/organizationApi.ts` — `searchEmployees`, `exportEmployees`; `api/useEmployees.ts` (yeni)
- `frontend/src/modules/organization/employeeListParams.ts` (yeni, +test) — URL query string ↔ filtre state saf dönüşüm fonksiyonları
- `frontend/src/modules/organization/pages/EmployeesListPage.tsx` (yeni, +test) — `EmployeesPlaceholderPage.tsx` SİLİNDİ (tamamen yerini aldı)
- `frontend/src/app/navigation.tsx` — `employees` route'u `EmployeesListPage`'e işaret eder
- `frontend/test/msw/handlers/organization.ts` — `createOrganizationHandlers`'a opsiyonel 3. parametre (`initialEmployees`) + `GET /employees`, `GET /employees/export` handler'ları (var olan 2 çağrı yeri etkilenmedi)
- `frontend/test/e2e/employee.spec.ts` — "Çalışan Listeleme (13.6)" bloğu: 13.5 ile zincirlenmiş oluştur→isimle bul senaryosu, filtre daraltma, CSV indirme (`page.waitForEvent('download')`)

**Çalıştırma komutları:**
```bash
cd frontend
npm run test         # 55 test, 0 hata
npx tsc -b            # temiz
npm run lint          # temiz (2 önceden var olan, ilgisiz uyarı hariç)
npx playwright test  # 58 test (+10 skip), 0 hata
```

**Canlı doğrulama:** Docker backend'e karşı: 13.5'ten zincirlenmiş senaryoda çalışan oluşturulup isimle filtrelenerek listede bulundu; var olmayan bir isimle filtrelenince "Bu filtrelere uygun çalışan bulunamadı." göründü; CSV "Dışa Aktar" butonu gerçek bir `calisanlar.csv` dosyası indirdi (Playwright `download` event'i ile doğrulandı) — tümü masaüstü+mobil × Chromium+WebKit'te (4 proje) yeşil. Not: paylaşılan test veritabanında çalışan sayısı 20'yi (varsayılan sayfa boyutu) aştığında yeni kayıtlar filtresiz ilk sayfada GÖRÜNMEYEBİLİR (id'ye göre sıralı sayfalama, beklenen davranış) — bu yüzden E2E senaryosu doğrudan isim filtresi üzerinden doğrulama yapıyor.

---

## Genel durum (13.1–13.6 sonrası)

Toplam: **55 Vitest testi** (unit + entegrasyon), **58 Playwright E2E testi** (+10 viewport-bağımlı skip), tamamı gerçek Docker backend'ine karşı yeşil. `npm run build` ve `npm run lint` her bölüm sonunda temiz. Sıradaki bölüm: **13.7** (henüz başlanmadı — kullanıcı onayı bekleniyor).
