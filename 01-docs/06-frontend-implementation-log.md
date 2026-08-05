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

## 13.7 — Çalışan Detayı

**Özet:** `/organization/employees/:id` — 13.5'ten kalan minimal salt-okunur sayfa, gerçek bir görüntüleme/düzenleme/atama sayfasına dönüştürüldü. Backend araştırması ÖNEMLİ bir bulgu çıkardı: `EmployeeController`'daki `PUT /{id}`, `PUT /{id}/assignment`, `PUT /{id}/iban`, `PUT /{id}/profile` uçlarının HİÇBİRİNDE `@PreAuthorize` YOK (yalnızca `GET /{id}` ve `GET /{id}/profile`, `hasAnyRole('ADMIN','IK') or @employeeAccessGuard.isSelf(...)` ile korunuyor) — bu, controller'ın kendi javadoc'unda bilinçli/kabul edilmiş bir kısıt olarak belgelenmiş (mevcut emsalle tutarlı). `EmployeeAccessGuard.isSelf`, `Employee.email`'i `Authentication.getName()` (oturum sahibinin e-postası) ile karşılaştırıyor — `Employee`'de bir `userId` alanı YOK, eşleştirme TAMAMEN e-posta üzerinden.

**Kapsam kararı:** Roadmap "sekmeli düzen (Tabs)" öngörse de ilk kapsamda YALNIZCA "Genel Bilgiler + Atama" sekmesi var (Genişletilmiş Özlük/Zimmetler/Ücret Geçmişi+IBAN/Atama Geçmişi/Özel Alanlar → Bölüm 14). Tek sekme için `Tabs` bileşeni render etmek yapay olacağından, bu bölüm gerçek bir 2. sekme eklenene kadar Tabs OLMADAN iki karttan (Genel Bilgiler, Atama) oluşan bir düzen kullanır.

**Tasarım kararları:**
- **Rol bazlı erişim, TAMAMEN backend'e devredilir** — frontend kendi "isSelf" mantığını TEKRARLAMAZ (`isOwnEmployeeRecord` gibi bir fonksiyon YOK): `GET /{id}` başarılıysa (200) sayfa render edilir (self VEYA admin/ik farkı gözetmeksizin), 403 dönerse "Bu kayda erişim yetkiniz yok" tam sayfa durumu gösterilir. Tek frontend-taraflı karar `canEditEmployee(roles)` — DÜZENLEME/ATAMA, kaydın sahibi olsa dahi, yalnızca ADMIN/IK'ya açık (roadmap'in kendi notu).
- **`/organization` route yapısı yeniden düzenlendi**: üst seviye artık yalnızca "oturum açmış olma" gerektiriyor (`ProtectedRoute` rolsüz); `units`/`job-titles`/`employees` (liste)/`employees/new` ayrı ayrı `roles={['ADMIN','IK']}` ile sarmalandı; `employees/:id` KASITLI olarak kısıtlanmadı (self-servis kabul kriteri). `OrganizationLayout`'un sekme çubuğu (Birimler/Unvanlar/Çalışanlar), ADMIN/IK olmayan bir kullanıcı için TAMAMEN gizlenir (aksi halde tıklandığında 403'e düşen sekmeler gösterilirdi).
- **Genel Bilgiler + Atama, İKİ AYRI form/mutasyon** — backend'de de ayrı uçlar (`PUT /{id}` ve `PUT /{id}/assignment`); atama başarıyla kaydedilince `invalidateQueries` ile `useEmployee` yeniden çekilir, Atama formunun varsayılanları `useEffect` ile YENİDEN senkronlanır (roadmap: "atama sonrası ANINDA güncellenir").
- **`FIELD_ERROR_MESSAGES`, `schema.ts`'e taşındı** (13.5'in `EmployeeCreatePage.tsx`'inden çıkarılıp PAYLAŞILAN hale getirildi) — hem oluşturma hem güncelleme formu AYNI backend mesaj↔alan eşleştirmesini kullanır.
- **CALISAN kendi kaydını görüntülerken salt-okunur** — `canEdit=false` olduğunda form yerine düz `DetailField`'lar (13.5'in orijinal görünümüyle AYNI desen) render edilir.

**Değişen/eklenen dosyalar:**
- `frontend/src/modules/organization/types.ts` — `AssignEmployeeRequest`; `api/organizationApi.ts` — `updateEmployee`, `assignEmployee`
- `frontend/src/modules/organization/schema.ts` — `assignmentSchema`/`AssignmentFormValues`, paylaşılan `FIELD_ERROR_MESSAGES` (taşındı)
- `frontend/src/modules/organization/employeeAccess.ts` (yeni, +test) — `canEditEmployee(roles)` saf fonksiyonu
- `frontend/src/modules/organization/api/{useUpdateEmployee,useAssignEmployee}.ts` (yeni)
- `frontend/src/modules/organization/pages/EmployeeDetailPage.tsx` (yeniden yazıldı, +test) — `GeneralInfoSection`/`AssignmentSection` alt bileşenleri, rol bazlı görünüm/düzenleme, 403/404 tam sayfa durumları
- `frontend/src/modules/organization/pages/EmployeeCreatePage.tsx` — yerel `FIELD_ERROR_MESSAGES` kaldırıldı, `schema.ts`'ten import edilir
- `frontend/src/app/navigation.tsx` — `/organization` alt route'ları TEK TEK `ProtectedRoute roles={['ADMIN','IK']}` ile sarmalandı (`employees/:id` HARİÇ)
- `frontend/src/modules/organization/pages/OrganizationLayout.tsx` — sekme çubuğu ADMIN/IK olmayan kullanıcı için gizlenir
- `frontend/test/msw/handlers/organization.ts` — `GET/PUT /employees/:id`, `PUT /employees/:id/assignment` handler'ları eklendi
- `frontend/test/e2e/employee.spec.ts` — "Çalışan Detayı (13.7)" bloğu; 13.5'in ilk testi `getByText(nationalId/email)` yerine `toHaveValue(...)` kullanacak şekilde güncellendi (ADMIN için sayfa artık düzenlenebilir form, düz metin DEĞİL)

**Test/E2E'de keşfedilen gerçek davranışlar:**
- MUI `Select` menüsü paylaşılan test veritabanında biriken kayıtlarla uzadıkça, fare tıklamalı seçim kaydırma/kapanış animasyonu yüzünden KARARSIZLAŞIYOR — bunun yerine odaklanınca popup HİÇ açmadan çalışan klavye "type-ahead" davranışı (gerçek bir `<select>`'teki gibi) kullanıldı.
- `ToastProvider`'ın Snackbar'ı sayfanın ALT-ORTASINDA sabit konumda render ediliyor ve 4sn görünür kalıyor — art arda iki aksiyon (çalışan oluşturma → hemen atama kaydetme) arasında ÖNCEKİ toast hâlâ görünürken sonraki butona tıklanırsa toast'ın üstüne biner ve tıklamayı yutar; E2E'de bir sonraki adıma geçmeden önce önceki toast'ın kapanması beklenir.

**Çalıştırma komutları:**
```bash
cd frontend
npm run test         # 66 test, 0 hata
npx tsc -b            # temiz
npm run lint          # temiz (2 önceden var olan, ilgisiz uyarı hariç)
npm run build         # temiz
npx playwright test  # 62 test (+10 skip), 0 hata — 2 ardışık tam çalıştırmada kararlı
```

**Canlı doğrulama:** Docker backend'e karşı: 13.5→13.7 zincirlenmiş senaryoda bir birim + bir unvan oluşturulup, yeni çalışan oluşturulup detayına gidildi; Genel Bilgiler formunun girilen bilgilerle ÖNCEDEN dolu geldiği doğrulandı; birime + unvana atandı → "Atama güncellendi" toast'ı ve sayfa YENİLENDİĞİNDE (`page.reload()`) atamanın KALICI olduğu (Select'lerin sunucudan gelen değerlerle dolu geldiği) doğrulandı — tümü masaüstü+mobil × Chromium+WebKit'te (4 proje) yeşil.

---

## 13.8 — Audit Kayıtları

**Özet:** `/audit` — roadmap bu bölümü "backend kısıtı — bu ekran ŞU AN geliştirilemez" notuyla BLOKLU işaretlemişti: `audit_log` tablosunun YAZMA tarafı vardı ama listeleyen bir uç yoktu. Kullanıcının "frontend yazarken backend eksikliklerini de giderebilirsin" iznini kullanarak önce backend'e `GET /api/core/audit-log` eklendi (ayrıntı: `04-implementation-log.md`'deki "AuditLogController" bölümü — yalnızca ADMIN, filtreler: entityType/performedBy/from/to), SONRA bu sayfa o ucun üzerine kuruldu.

**Tasarım kararları:**
- **Yeni paylaşılan `AccordionList` bileşeni** (`shared/components/AccordionList.tsx`) — Bölüm 9'un bileşen tablosunda ÖNCEDEN onaylanmış ("Detaylı, uzun kayıtlar için genişleyen liste"), ilk gerçek ihtiyacında (13.8) inşa edildi. `ResponsiveTable`'dan FARKLI: masaüstünde AYNI tablo, ama mobilde kart yerine her satır bir `Accordion` — başlık (özet) her zaman görünür, detay tıklanınca açılır (Bölüm 2.3'teki "detaylı kayıt" istisnası).
- **Filtre şeridi `FilterBar`'ı GENİŞLETMEDİ, sayfaya ÖZGÜ inşa edildi** — 4 farklı filtre türü (metin arama, dropdown, İKİ tarih seçici) `FilterBar`'ın `value/selects` şeklini zorlardı; date-range'in İLK gerçek ihtiyacı olduğundan, paylaşılan bileşeni erken genişletmek yerine (YAGNI) sayfada bağımsız bir `Stack` kullanıldı.
- **Varlık türü dropdown'u statik bir liste** (`entityTypes.ts`, backend'in `BaseEntity` alt sınıflarının TAM listesi — `AuditLogEntityListener`'ın `entity.getClass().getSimpleName()` ile yazdığı DEĞERLERLE birebir) — backend bunu döndüren bir uç SUNMUYOR.
- **Tarih aralığı validasyonu client-side** (`isValidDateRange`) — geçersizken (bitiş < başlangıç) sorgu HİÇ tetiklenmez (`useAuditLog`'un `enabled` parametresi), yerine bir `Alert` gösterilir.
- **Alan bazlı değişiklik diff'i (önce/sonra) KASITLI OLARAK YOK** — backend `AuditLogEntry`'de bu veri yok (roadmap'in kendi notu, Bölüm 9.6'nın genişletmesini bekliyor); accordion detayı bunun yerine mevcut 5 alanı okunaklı biçimde tekrarlar + bir not gösterir.

**Değişen/eklenen dosyalar:**
- `frontend/src/shared/components/AccordionList.tsx` (yeni)
- `frontend/src/modules/audit/{types,entityTypes,queryKeys,auditListParams}.ts` (yeni, +`auditListParams.test.ts`)
- `frontend/src/modules/audit/api/{auditApi,useAuditLog}.ts` (yeni)
- `frontend/src/modules/audit/pages/AuditLogPage.tsx` (yeni, +test)
- `frontend/src/app/navigation.tsx` — `/audit` route'u (`roles={['ADMIN']}`, nav girişi)
- `frontend/test/msw/handlers/audit.ts` (yeni)
- `frontend/test/e2e/audit.spec.ts` (yeni); `test/e2e/helpers.ts` — `goToAudit` eklendi

**Test/E2E'de keşfedilen gerçek davranışlar:**
- `AccordionList`'in masaüstü (tablo) ve mobil (accordion) DOM yapıları TAMAMEN farklı (ayrı hücreler vs. tek birleşik başlık metni) — E2E'de `role='row'` masaüstünde çalışır ama mobilde HİÇ yok (accordion'da `role='row'` YOK); test `isMobile` fixture'ına göre iki AYRI eşleşme stratejisi kullanır.

**Çalıştırma komutları:**
```bash
cd frontend
npm run test         # 83 test, 0 hata
npx tsc -b            # temiz
npm run lint          # temiz (2 önceden var olan, ilgisiz uyarı hariç)
npm run build         # temiz
npx playwright test  # 66 test (+10 skip), 0 hata — 2 ardışık tam çalıştırmada kararlı
```

**Canlı doğrulama:** Docker backend'e karşı (yeniden derlenmiş, audit-log ucunu içeren imajla): çalışan oluşturulup `/audit` sayfasına gidildi, "Varlık Türü" filtresi "Employee" seçilince yeni oluşturulan çalışanın "Oluşturma" satırının listede (en üstte, performedAt DESC sıralı sayesinde) göründüğü doğrulandı — masaüstü+mobil × Chromium+WebKit'te (4 proje) yeşil.

---

## 14.1 — Kullanıcı Girişi ve Yetkilendirme (Bölüm 2'nin kalanı): Profil + Kullanıcı-Rol Yönetimi

**Özet:** `/profile` (US-02.2.4, herkes kendi bilgisini görür) ve kullanıcı-rol yönetimi (US-02.2.2). Roadmap yalnızca `/admin/users/:id/roles` rotasını tanımlıyordu ama bir ADMIN'in bu ID'ye NASIL ulaşacağını belirtmiyordu — backend araştırması bunun gerçek bir boşluk olduğunu doğruladı: `UserRoleController` yalnızca ZATEN bilinen bir `userId` üzerinde çalışıyordu, kullanıcıyı BULACAK bir uç yoktu. Kullanıcının "frontend yazarken backend eksikliklerini de giderebilirsin" izniyle (audit'teki AYNI desen) önce backend'e `GET /api/auth/users` eklendi (ayrıntı: `04-implementation-log.md`), SONRA bu ucun üzerine `/admin/users` (liste) → `/admin/users/:id/roles` (detay/yönetim) ikilisi kuruldu — 13.6→13.7'deki (EmployeesListPage→EmployeeDetailPage) AYNI liste→detay deseni.

**Tasarım kararları:**
- **`DetailField`, `EmployeeDetailPage.tsx`'ten `shared/components/`'a taşındı** — ProfilePage'in AYNI ihtiyacıyla (salt-okunur etiket+değer çifti) 2. gerçek kullanımına ulaşınca paylaşılan hale getirildi (Bölüm 9'un "ilk gerçek tekrarında oluşturulur" kuralı).
- **`ProfilePage` ekstra bir API çağrısı YAPMAZ** — `useAuth().user` zaten giriş/oturum-doğrulama sırasında `GET /api/auth/me` ile dolu; salt-okunur kart doğrudan bundan render edilir.
- **`UserRolesPage`, ayrı bir `GET /{userId}/roles` çağrısı YAPMAZ** — `GET /api/auth/users` ZATEN her kullanıcı satırına rolleri gömerek döndürüyor; `UsersListPage` ile AYNI `useUsers()` sorgusu paylaşılır, ilgili kullanıcı `id`'ye göre bulunur.
- **Rol kaldırma, `Chip`'in `onDelete`'i yerine ayrı bir `IconButton aria-label="{rol} rolünü kaldır"` kullanır** — MUI `Chip.onDelete`'in render ettiği ikon erişilebilir bir `role`/isim TAŞIMIYOR (test/E2E'de bulunamaz), JobTitlesPage'in (13.4) düzenle/sil `IconButton` deseniyle tutarlı, bilinçli bir sapma.
- **Rol kodları statik** (`roles.ts`, backend'in `Role.java`'sındaki AYNI 4 sabit) — bunları listeleyen bir uç YOK (audit'in `entityTypes.ts`'teki AYNI gerekçe).

**Değişen/eklenen dosyalar:**
- `frontend/src/shared/components/DetailField.tsx` (yeni, `EmployeeDetailPage.tsx`'ten taşındı)
- `frontend/src/modules/auth/types.ts` — `UserSummary`, `AssignRoleRequest`; `api/authApi.ts` — `listUsers`, `assignRole`, `removeRole`
- `frontend/src/modules/auth/{queryKeys,roles}.ts` (yeni)
- `frontend/src/modules/auth/api/{useUsers,useAssignRole,useRemoveRole}.ts` (yeni)
- `frontend/src/modules/auth/pages/{ProfilePage,UsersListPage,UserRolesPage}.tsx` (yeni, +test her biri)
- `frontend/src/app/UserMenu.tsx` — "Profilim" artık `/profile`'a yönlendiriyor (13.1'den kalan disabled placeholder aktifleşti)
- `frontend/src/app/navigation.tsx` — `/profile` (nav YOK), `/admin/users` (ADMIN, nav: "Kullanıcılar"), `/admin/users/:id/roles` (ADMIN, nav YOK)
- `frontend/test/msw/handlers/auth.ts` — `createUserManagementHandlers` (yeni, stateful fabrika)
- `frontend/test/e2e/users.spec.ts` (yeni)

**Test/E2E'de keşfedilen gerçek davranışlar:**
- Playwright'ın `strict mode` ihlali (bir locator'ın BİRDEN FAZLA elemana çözülmesi), "bulunamadı" durumunun aksine RETRY EDİLMEZ — route geçişi sırasında eski sayfanın DOM'u YENİ sayfayla bir an ÇAKIŞSA bile bu ANLIK durum bile kalıcı bir hata olarak raporlanır. Çözüm: önce TEKİL bir eleman (ör. sayfaya özgü `<h1>` başlığı) beklenir, eski içeriğin TAMAMEN kaybolduğundan emin olunduktan SONRA çakışan/tekrar eden metne bakılır.
- **Sistemde tek kullanıcı var** (seed admin — kullanıcı OLUŞTURMA API'si backend'de YOK) — bu yüzden rol ekleme/kaldırma round-trip E2E senaryosu TÜM Playwright projelerinde (chromium/webkit × desktop/mobile) paralel çalıştırılırsa AYNI kullanıcı kaydı üzerinde YARIŞA girer (bir proje rol eklerken diğeri "zaten atanmış" durumunu görüp dropdown'da bulamaz). Mutasyon içeren senaryo bu yüzden YALNIZCA `chromium-desktop` projesinde çalıştırılır (`test.skip` ile diğerlerinde atlanır); salt-okunur "rolleri görüntüleme" senaryosu TÜM projelerde çalışır. ADMIN rolünün KENDİSİ hiçbir zaman kaldırılmaz (paylaşılan test veritabanında diğer TÜM testlerin erişimini kilitler) — bunun yerine zararsız bir rol (IK) eklenip AYNI testte temizlenir.

**Çalıştırma komutları:**
```bash
cd frontend
npm run test         # 91 test, 0 hata
npx tsc -b            # temiz
npm run lint          # temiz (2 önceden var olan, ilgisiz uyarı hariç)
npm run build         # temiz
npx playwright test  # 75 test (+13 skip: 10 viewport-bağımlı + 3 tek-proje sınırlaması), 0 hata — 2 ardışık tam çalıştırmada kararlı
```

**Canlı doğrulama:** Docker backend'e karşı (yeniden derlenmiş, `GET /api/auth/users` ucunu içeren imajla): `admin@dijitalik.local` ile giriş → Profilim → doğru ad/e-posta/rol; Kullanıcılar listesinden admin'e tıklanıp rol yönetimi sayfasına gidildi → IK rolü eklenip "Rol eklendi" toast'ı + listede göründüğü, ardından kaldırılıp "Rol kaldırıldı" toast'ı + listeden kaybolduğu doğrulandı (ADMIN rolü değişmeden) — masaüstü+mobil × Chromium+WebKit'te (4 proje, mutasyon senaryosu yalnızca chromium-desktop'ta) yeşil.

---

## 14.2 — Genişletilmiş Özlük, Zimmetler, Atama Geçmişi

**Özet:** 13.7'nin `EmployeeDetailPage`'ine üç yeni sekme: Genişletilmiş Özlük (US-03.3.1, upsert), Zimmetler (US-03.3.2, çoklu kayıt + teslim/iade), Atama Geçmişi (US-03.4.1, salt-okunur kronolojik liste). Backend araştırması bu kez BOŞLUK BULAMADI — 13.7'de `EmployeeAssignmentHistory`/`EmployeeAsset`/`EmployeeProfile` altyapısının tamamı zaten vardı, yalnızca frontend'in kullanmadığı üç REST ucu (`GET/PUT .../profile`, `POST/GET/PUT .../assets(/…/return)`, `GET .../assignment-history`) bekliyordu — saf frontend işi, backend'e HİÇ dokunulmadı.

**Tasarım kararları:**
- **`EmployeeDetailPage`'e artık gerçek bir `Tabs` bileşeni eklendi** — 13.7'nin "tek sekme için Tabs yapay olur" kararı, gerçek bir 2./3./4. sekme eklenince (bu bölüm) doğal sonucuna ulaştı. Mevcut 5 testi KIRMAMAK için "Genel Bilgiler" + "Atama", roadmap'in tablosunda AYRI satırlar olsalar da, TEK "Genel Bilgiler" sekmesinde BİRLİKTE kaldı (ikisi zaten aynı anda görünürdü, ayırmak gereksiz churn olurdu).
- **"Zimmetler"/"Atama Geçmişi" sekmeleri `canEdit=false` iken Tabs'tan TAMAMEN çıkarılır** (roadmap'in kendi rol tablosu: yalnızca ADMIN/IK, kaydın sahibi bile GÖRMEZ) — "Genişletilmiş Özlük"ten FARKLI (o, self için de salt-okunur GÖRÜNÜR, Profil ile AYNI "görüntüleme: +sahibi" deseni).
- **Özlük formu profil hiç kaydedilmemişken 404 alır** (`useEmployeeProfile`, `retry:false`) — bu HATA olarak değil "boş form/henüz girilmedi" durumu olarak ele alınır; PUT gerçek bir UPSERT.
- **`DetailField` (14.1'de paylaşılan hale getirildi) ve `AccordionList` (13.8'de inşa edildi) burada TEKRAR kullanıldı** — her ikisi de ikinci gerçek kullanımlarına ulaştı, yeni bir bileşen İCAT EDİLMEDİ.
- **Zimmet diyalogları (`AssetFormDialog`, `ReturnAssetDialog`) `JobTitleFormDialog`/`CreateUnitDialog` konvansiyonunu izleyen AYRI bileşen dosyaları** — sayfa dosyasının şişmesini sınırlar.

**Değişen/eklenen dosyalar:**
- `frontend/src/modules/organization/types.ts` — `EmployeeProfile(Request)`, `EmployeeAsset`, `Create/ReturnEmployeeAssetRequest`, `EmployeeAssignmentHistoryEntry`
- `frontend/src/modules/organization/api/organizationApi.ts` — 6 yeni fonksiyon; `queryKeys.ts` — `profile/assets/assignmentHistory` anahtarları
- `frontend/src/modules/organization/api/{useEmployeeProfile,useSaveEmployeeProfile,useEmployeeAssets,useCreateEmployeeAsset,useReturnEmployeeAsset,useAssignmentHistory}.ts` (yeni)
- `frontend/src/modules/organization/schema.ts` — `employeeProfileSchema` (TÜM alanlar opsiyonel, backend'de zorunlu değil), `employeeAssetSchema`/`returnAssetSchema` (backend mesajlarıyla BİREBİR)
- `frontend/src/modules/organization/assignmentHistory.ts` (yeni, +test) — `formatAssignmentEndDate` (null → "Halen Aktif")
- `frontend/src/modules/organization/components/{AssetFormDialog,ReturnAssetDialog}.tsx` (yeni)
- `frontend/src/modules/organization/pages/EmployeeDetailPage.tsx` — Tabs eklendi, 3 yeni section (`ExtendedProfileSection`, `AssetsSection`, `AssignmentHistorySection`); +9 yeni test (toplam 14)
- `frontend/test/msw/handlers/organization.ts` — profil/zimmet/atama-geçmişi handler'ları (opsiyonel 4./5. parametre, geriye dönük uyumlu)
- `frontend/test/e2e/employeeExtras.spec.ts` (yeni)

**Test/E2E'de keşfedilen gerçek davranışlar:**
- **`force: true`, GERÇEK piksel-düzeyinde örtüşmeyi ÇÖZMEZ** — yalnızca Playwright'ın KENDİ ön-kontrollerini (actionability) atlar, tarayıcının click event'i asıl DAĞITIRKEN yaptığı hit-test'i DEĞİL; bir eleman GERÇEKTEN başka bir eleman tarafından kaplanıyorsa (dar viewport'ta `DialogContent`'in `DialogActions`'ı örtmesi gibi), force'lu bir fare tıklaması yine YANLIŞ elemana gidebilir. Çözüm: `.focus()` + `page.keyboard.press('Enter')` — klavye etkinleştirmesi koordinat/örtüşmeden TAMAMEN bağımsızdır.
- Bir sonraki etkileşim sayfanın ÜST kısmındaysa (ör. sekme değiştirme), alt-ortadaki toast'ın kapanmasını BEKLEMEYE gerek YOK (13.7'nin aksine, orada sonraki hedef ALT'taydı) — gereksiz `toBeHidden()` bekleşmeleri kaldırıldı.

**Çalıştırma komutları:**
```bash
cd frontend
npm run test         # 97 test, 0 hata
npx tsc -b            # temiz
npm run lint          # temiz (2 önceden var olan, ilgisiz uyarı hariç)
npm run build         # temiz
npx playwright test  # 79 test (+13 skip), 0 hata — 2 ardışık tam çalıştırmada kararlı
```

**Canlı doğrulama:** Vitest/Playwright test paketlerinin kendisi (Docker backend'e karşı) — backend değişmediğinden ayrı bir Docker yeniden derlemesi/curl doğrulaması GEREKMEDİ; E2E zaten canlı backend'e karşı çalışıyor (çalışan oluştur → özlük kaydet+kalıcılığını doğrula → birime/unvana ata → zimmet ekle+iade al → atama geçmişinde "Halen Aktif" gördüğünü doğrula) — masaüstü+mobil × Chromium+WebKit'te (4 proje) yeşil.

---

## 14.3 — İzin Yönetimi

**Özet:** Yeni `leave` modülü — 5 ekran: izin türü CRUD (`/leave/types`, ADMIN/IK), kendi bakiyem (`/leave/balance`), yeni talep formu (`/leave/requests/new`, bakiye yetersizse UYARIR ama ENGELLEMEZ), kendi taleplerim (`/leave/requests`, durum filtresi + ADMIN/IK için CSV/Excel export), yönetici onayları (`/leave/approvals`, roadmap'in literal rol tablosuna göre yalnızca YONETICI). Backend araştırması TEK ama TEMEL bir boşluk buldu: giriş yapan kullanıcının KENDİ `employeeId`'sini çözecek hiçbir yol yoktu.

**Tasarım kararları:**
- **Backend'de `GET /api/organization/employees/me` eklendi** (bkz. `04-implementation-log.md`'deki AYRI giriş) — `Employee`/`User` arasında FK YOK, tek bağlantı e-posta eşleşmesi (13.7'nin `EmployeeAccessGuard.isSelf`'iyle AYNI desen). Bu uç, hem CALISAN'a yönelik 3 ekranın (bakiye/yeni talep/taleplerim) HEM DE yönetici onay ekranının kendi `organizationUnitId`'sini çözmesi için ortak bir temel oldu — tek bir boşluk, dört ayrı ihtiyacı çözdü.
- **`leave` modülü, `organization`'a BAĞIMLI DEĞİL** (backend mimarisinin modül izolasyonu kuralı) — her uç ham `employeeId` alır; yönetici kararları için ÇAĞRINAN taraf `teamEmployeeIds` listesini kendisi sağlar, `LeaveRequestAccessGuard.isTeamMember` bunu doğrular (leave/organization.TeamController/training/performance/recruitment.HiringRequestController'da zaten kullanılan, daha önce onaylanmış AYNI güven-sınırı deseni).
- **"Ekibimin bekleyen talepleri" için backend'de toplu bir uç YOK** — istemci tarafında 3 adımlı bir zincir kuruldu: `/employees/me` ile kendi `organizationUnitId`'mi çöz → `searchEmployees({organizationUnitId})` ile birim üyelerini listele → her üye için `useQueries` ile PARALEL `GET /api/leave/requests?employeeId=` çağrısı, PENDING olanlar istemcide filtrelenir. Bilinçli bir N+1 — tipik ekip büyüklüğünde (birkaç-onlarca kişi) kabul edilebilir, YAGNI gereği ayrı bir backend toplu-uç YAZILMADI.
- **`/leave/approvals`, roadmap'in rol tablosuna göre YALNIZCA `YONETICI`'ye açık** — backend aslında ADMIN/IK'yı da yetkilendirirdi ama frontend bilinçli olarak daha kısıtlayıcı; bunun sonucu: tek seed hesabımız (ADMIN) bu ekrana E2E'de ERİŞEMEZ (13.7'deki CALISAN self-view kısıtıyla AYNI durum) — mitigasyon: kapsamlı MSW-mocklu entegrasyon testleri (`LeaveApprovalsPage.test.tsx`, YONETICI rolünü inline `http.get('/api/auth/me', …)` override'ıyla simüle eder).
- **Zod şema mesajları backend kaynağından BİREBİR alındı** (roadmap'in paraphrase'ine GÜVENİLMEDİ) — roadmap `reason` diyordu, backend'in gerçek alanı `rejectionReason`; roadmap talep oluşturmanın `hireDate`/`employeeEmail` query parametrelerini HİÇ belirtmemişti.
- **Paylaşılan `StatusChip` bileşeni** (Bölüm 9'da önceden onaylanmış, ilk gerçek kullanımı) — durum→{etiket,renk} eşlemesi bilinçli olarak TÜKETEN modülde (`leave/statusLabels.ts`) tutuldu, bileşenin kendisine GÖMÜLMEDİ.

**Değişen/eklenen dosyalar (backend):**
- `organization/src/main/java/com/digitalik/organization/repository/EmployeeRepository.java` — `findByEmailIgnoreCase`
- `organization/src/main/java/com/digitalik/organization/service/EmployeeService.java` — `getByEmail`
- `organization/src/main/java/com/digitalik/organization/controller/EmployeeController.java` — `GET /api/organization/employees/me`
- `organization/src/test/java/com/digitalik/organization/service/EmployeeServiceTest.java` (yeni)

**Değişen/eklenen dosyalar (frontend):**
- `frontend/src/shared/components/StatusChip.tsx` (yeni)
- `frontend/src/modules/organization/api/{organizationApi.ts,useMyEmployee.ts,queryKeys.ts}` — `getMyEmployee`/`useMyEmployee`
- `frontend/src/modules/leave/` (yeni modül) — `types.ts`, `statusLabels.ts`, `schema.ts`, `format.ts` (+test), `api/{leaveApi,queryKeys,useLeaveTypes,useCreateLeaveType,useUpdateLeaveType,useDeleteLeaveType,useLeaveBalance,useCreateLeaveRequest,useLeaveRequests,useDecideLeaveRequest}.ts`, `components/{LeaveTypeFormDialog,RejectLeaveRequestDialog}.tsx`, `pages/{LeaveTypesPage,LeaveBalancePage,LeaveRequestFormPage,LeaveRequestsPage,LeaveApprovalsPage}.tsx` (+her biri için test)
- `frontend/src/app/navigation.tsx` — 5 yeni rota (`/leave/types`, `/leave/balance`, `/leave/requests`, `/leave/requests/new`, `/leave/approvals`)
- `frontend/test/msw/handlers/{organization.ts,leave.ts}` — `/employees/me` handler'ı (`/employees/:id`'DEN ÖNCE kayıtlı, path-shadowing'i önlemek için) + tam stateful `createLeaveHandlers` fabrikası
- `frontend/test/e2e/leave.spec.ts` (yeni)

**Test/E2E'de keşfedilen gerçek davranışlar:**
- **`ResponsiveTable`'ın masaüstü tablo + mobil kart AYNI ANDA render etme deseni** (13.4/14.2'de zaten bilinen) `LeaveTypesPage.test.tsx`'te tekrar yakalandı: validasyon-hatası senaryosu için tabloda MEVCUT bir kayıt varken metin araması İKİ eşleşme veriyordu — çözüm, JobTitlesPage.test.tsx'teki AYNI ÖNCEDEN kanıtlanmış desen: liste sorgularını `within(table)`'a scope etmek VE validasyon testinde sıfır kayıtla başlamak (belirsizliği tamamen ORTADAN KALDIRMAK, scope etmeye bile gerek kalmadan).
- **Seed admin hesabının çalışan kaydı 1 yıldan kısa kıdemli** (`hireDate=2026-01-15`, `asOfDate=2026-08-05`) → `entitlementDays=0` — bu, roadmap'in istediği "bakiye yetersiz uyarısı" E2E senaryosunu ayrıca sıfır-bakiyeli bir çalışan kurgulamaya GEREK KALMADAN doğal olarak sağladı.
- **Gerçek bir backend boşluğu keşfedildi ama BU BÖLÜMÜN KAPSAMINDA BIRAKILMADI**: `LeaveTypeService.delete`, referans veren bir `LeaveRequest` varken FK ihlaliyle çıplak bir 500 döner (curl ile manuel doğrulama sırasında bulundu). Bu, LEAVE'E ÖZGÜ değil — `organization.JobTitleService.delete`'te de AYNI desen (in-use kontrolü YOK) zaten mevcut, önceki bir bölümde kabul edilmiş; bu yüzden 14.3'ün TANITTIĞI bir sorun değil, kod tabanı genelinde önceden var olan bir gevşeklik. E2E testi bu durumu DOĞAL OLARAK tetiklemeyecek şekilde tasarlandı (silinen izin türüne HİÇ talep bağlanmadı).

**Çalıştırma komutları:**
```bash
cd frontend
npm run test         # 113 test, 0 hata
npx tsc -b            # temiz
npm run lint          # temiz (2 önceden var olan, ilgisiz uyarı hariç)
npm run build         # temiz
npx playwright test  # 87 test (+13 skip), 0 hata — 2 ardışık tam çalıştırmada kararlı
```

**Canlı doğrulama:** `mvn -pl organization -am test` (2/2 yeni test) + `mvn test` (tam paket, regresyon YOK) → `docker compose build backend && docker compose up -d backend` → curl ile `/employees/me` (404 kayıt yokken, 200 sonra) VE tam bir talep-oluşturma/bakiye-uyarısı akışı elle doğrulandı (bu sırada `LeaveTypeService.delete` boşluğu bulundu, yukarıda not edildi). E2E paketi zaten canlı backend'e karşı çalışıyor — izin türü oluştur/sil + talep oluştur/bakiye-uyarısı-banner'ı, masaüstü+mobil × Chromium+WebKit'te (4 proje) yeşil.

---

## 14.4 — İşe Alım

**Not (test politikası değişikliği):** Bu bölümden itibaren Playwright E2E testleri YAZILMIYOR — kullanıcının açık kararı: ekran testlerini kendisi elle yapacak, yalnızca backend/frontend unit+entegrasyon testleri (JUnit, Vitest) yazılmaya devam ediliyor. 13.1–14.3'teki E2E paketi (87 test) DEĞİŞMEDEN kalıyor, yalnızca YENİ bölümler için artık büyütülmüyor.

**Özet:** Yeni `recruitment` modülü — 6 ekran: norm kadro tanımlama (`/recruitment/staffing-norms`, upsert), aday başvuru formu (`/careers/apply`, kimliksiz/herkese açık, CV yükleme), aday listesi+detayı (`/recruitment/candidates`(`/:id`), aşama değiştirme + not + mülakat kaydı + çalışana dönüştürme), işe alım talebi oluşturma (`/recruitment/hiring-requests/new`, norm yoksa 404 ile ENGELLENİR), iki aşamalı onay ekranı (`/recruitment/hiring-requests`, TEK ekran roadmap'in "YONETICI 1. adım, İK 2. adım" rol tablosuna göre İKİ farklı görünüm seçer). Backend araştırması İKİ boşluk buldu: `CandidateController` ve `HiringRequestController`'ın İKİSİNDE de HİÇBİR okuma (`GET`) ucu yoktu — yalnızca yazma uçları vardı.

**Tasarım kararları:**
- **`GET /api/recruitment/candidates`, `GET /{id}`, `GET /{id}/cv` eklendi** — roadmap'in bu ekranlar için rol tablosu (ADMIN, IK) AÇIK olduğundan, `applications`/`stage`/`convert-to-employee`'nin AKSİNE (kabul kriterleri rol belirtmiyor, `@PreAuthorize` YOK) bu YENİ uçlara `@PreAuthorize("hasAnyRole('ADMIN','IK')")` eklendi — PII/CV içeren yeni bir okuma ucu, `core.AuditLogController`'daki AYNI "hassas veri → açıkça kısıtla" gerekçesi. `CV indirme` ucu roadmap'te AÇIKÇA istenmedi ama "aday detayı" ekranının pratik anlamı için (CV'siz bir aday incelemesi eksik kalırdı) dar kapsamlı bir ek olarak eklendi.
- **`GET /api/recruitment/hiring-requests` eklendi** — `leave.LeaveRequestController#list`'teki AYNI desen (rol kısıtı YOK, ekranın kendisi zaten hem YONETICI hem İK/ADMIN'e açık) ama `leave`'den FARKLI olarak filtre parametresi (`organizationUnitId`) OPSİYONEL: verilmezse TÜM talepler (İK'nın organizasyon geneli görünümü için), verilirse o birimle sınırlı (YONETICI'nin kendi birimi için) — `leave.listByEmployee`'nin AKSİNE (`employeeId` HER ZAMAN zorunlu), çünkü İK'nın gerçekten "tüm organizasyon" görmesi GEREKİYOR.
- **`HiringRequestsPage` TEK route, roldeğerine göre İKİ AYRI görünüm seçer** (`HrQueue`/`ManagerQueue`) — roadmap'in rol tablosu AYNI ekran için iki rolü listelediğinden (`leave/approvals`'ın TEK rol/TEK görünümünden BİLİNÇLİ OLARAK farklı); roadmap'in "PENDING/MANAGER_APPROVED/APPROVED/REJECTED durumlarını StatusChip ile gösterir" kriteri gereği HER İKİ görünüm de TÜM geçmişi listeler (yalnızca aksiyon alınabilir satırlar DEĞİL), yalnızca kendi aşamasındaki satırlarda Onayla/Reddet düğmesi gösterilir.
- **Aday→çalışan dönüşümünde `organization.EmployeeCreatePage` küçük bir prefill özelliği kazandı** (`location.state`'ten `firstName`/`lastName`/`email` okur) — backend'in `EmployeeDraftResponse`'unun "İK AYRICA `POST /employees`'i çağırmalı" notuna karşılık: dönüşüm sonrası kullanıcı doğrudan (taslak bilgilerle önceden doldurulmuş) çalışan formuna yönlendirilir, `nationalId`/`hireDate` elle tamamlanır.
- **`FileUploadZone` (yeni paylaşılan bileşen)** — projenin İLK dosya yükleme UI'ı, tıkla-seç + sürükle-bırak, Bölüm 9'un "ilk gerçek ihtiyaçta eklenir" kuralına uyar.
- **Kritik test-altyapısı keşfi: multipart (`FormData`+`File`) `fetch` istekleri Vitest'in jsdom ortamında SESSİZCE ASILI KALIYORDU** — kök neden ve çözüm `setupFileGlobals.ts`/`setupTests.ts`'te ayrıntılı belgelendi (bkz. aşağıdaki "Test'te keşfedilen gerçek davranışlar").

**Değişen/eklenen dosyalar (backend):**
- `recruitment/src/main/java/com/digitalik/recruitment/repository/{CandidateRepository,HiringRequestRepository}.java` — `findAllByOrderByIdDesc`/`findByOrganizationUnitIdOrderByIdDesc`
- `recruitment/src/main/java/com/digitalik/recruitment/service/{CandidateService,HiringRequestService}.java` — `getAll`/`getById`
- `recruitment/src/main/java/com/digitalik/recruitment/controller/CandidateController.java` — `GET`, `GET /{id}`, `GET /{id}/cv`
- `recruitment/src/main/java/com/digitalik/recruitment/controller/HiringRequestController.java` — `GET`
- `recruitment/src/main/java/com/digitalik/recruitment/dto/CandidateResponse.java` — `converted` alanı eklendi
- `recruitment/src/test/java/com/digitalik/recruitment/controller/{CandidateControllerTest,HiringRequestControllerTest}.java` — +11 yeni test

**Değişen/eklenen dosyalar (frontend):**
- `frontend/src/shared/api/apiClient.ts` — `postMultipart`
- `frontend/src/shared/components/FileUploadZone.tsx` (yeni)
- `frontend/src/setupFileGlobals.ts` (yeni) + `frontend/src/setupTests.ts` — multipart/fetch test-altyapısı düzeltmesi
- `frontend/src/modules/organization/pages/EmployeeCreatePage.tsx` — `location.state` prefill desteği
- `frontend/src/modules/recruitment/` (yeni modül) — `types.ts`, `statusLabels.ts`, `schema.ts`, `api/{recruitmentApi,queryKeys,useStaffingNorms,useSetStaffingNorm,useApplyAsCandidate,useCandidates,useCandidate,useChangeCandidateStage,useConvertCandidateToEmployee,useCandidateNotes,useAddCandidateNote,useInterviews,useCreateInterview,useCreateHiringRequest,useHiringRequests,useManagerDecideHiringRequest,useHrDecideHiringRequest}.ts`, `components/{StaffingNormFormDialog,CandidateNoteFormDialog,InterviewFormDialog}.tsx`, `pages/{StaffingNormsPage,CareersApplyPage,CandidatesPage,CandidateDetailPage,HiringRequestFormPage,HiringRequestsPage}.tsx` (+her biri için test)
- `frontend/src/app/router.tsx` — `/careers/apply` (AppShell/ProtectedRoute DIŞINDA, `/login` ile AYNI seviye kardeş)
- `frontend/src/app/navigation.tsx` — 5 yeni korumalı rota
- `frontend/test/msw/handlers/{auth.ts,recruitment.ts}` — `meYonetici` (leave/approvals'taki inline override'ın 2. ihtiyaçta paylaşılan hali) + tam stateful `createRecruitmentHandlers` fabrikası

**Test'te keşfedilen gerçek davranışlar:**
- **jsdom + undici (Node fetch) uyumsuzluğu — multipart `fetch()` SESSİZCE ASILI KALIYOR.** jsdom kendi `File`/`FormData`/`Blob`'unu sağlar; bunlar Node'un fetch'inin (undici) beklediği gerçeklikten (realm) FARKLI. Bu, `apiClient.postMultipart` çağrılarını (yalnızca `/careers/apply`) `await fetch(...)` adımında HİÇBİR HATA VERMEDEN sonsuza kadar ASKIDA bıraktı (JSON istekleri etkilenmedi — onlar `FormData` KULLANMIYOR). Daha da inceliği: `undici`, KENDİ modülü YÜKLENİRKEN `globalThis.File`'ı BİR KEZ okuyup içsel webidl tip kontrolüne SABİTLİYOR — yani `globalThis.File`'ı `import ... from 'undici'` SATIRINDAN SONRA düzeltmek YETERSİZ (ESM import'ları her zaman modülün geri kalanından ÖNCE değerlendirilir). Çözüm: AYRI bir `setupFileGlobals.ts` modülü `node:buffer`'ın `File`/`Blob`'unu `globalThis`'e yazar VE `setupTests.ts`'te `undici`'den YAPILAN import'tan ÖNCE import edilir (ESM'in kardeş import'ları KAYNAK SIRASINA göre değerlendirmesine güvenerek); `undici`'nin kendisi `fetch`/`FormData`/`Headers`/`Request`/`Response` için kullanılır (`File`'ı KENDİSİ dışa aktarmıyor).
- **`ResponsiveTable`'ın masaüstü tablo + mobil kart AYNI ANDA render etme deseni** (13.4'ten beri bilinen) `CandidateDetailPage.test.tsx`'in not/mülakat listelerinde TEKRAR yakalandı — AYNI `within(table)` scope deseniyle çözüldü.
- **MUI `Stack`'e `alignItems` DOĞRUDAN prop olarak DEĞİL, `sx={{alignItems:...}}` İÇİNDE verilmeli** — `FileUploadZone`'un ilk taslağı doğrudan prop kullanınca "React does not recognize the alignItems prop" konsol uyarısı üretti; kod tabanındaki TÜM diğer `Stack` kullanımları zaten `sx` içinde veriyordu, düzeltilip desene uyduruldu.
- **`z.instanceof(File, {message})` — global `File` referansı test ortamında DEĞİŞKEN olduğundan KIRILGAN**: `setupFileGlobals.ts` düzeltmesi TAMAMLANMADAN önce bu şema geçici olarak `undefined instanceof undefined` gibi bir duruma düşüp "Right-hand side of instanceof is not an object" fırlattı — yukarıdaki fetch düzeltmesiyle BİRLİKTE çözüldü, ayrı bir iş GEREKMEDİ.

**Çalıştırma komutları:**
```bash
cd backend
mvn -pl recruitment -am test   # +11 yeni test, 0 hata
mvn test                        # tam reactor, sıfır regresyon
docker compose build backend && docker compose up -d backend

cd frontend
npm run test         # 135 test, 0 hata
npx tsc -b            # temiz
npm run lint          # temiz (2 önceden var olan, ilgisiz uyarı hariç)
npm run build         # temiz
docker compose build frontend && docker compose up -d frontend
```

**Canlı doğrulama:** Docker backend'e karşı curl ile tam uçtan uca doğrulandı: aday başvurusu (multipart, CV) → `GET /candidates` listede görünüyor → `GET /candidates/{id}` detay doğru → `GET /candidates/{id}/cv` indirilen baytlar YÜKLENENLERLE BİREBİR aynı (`diff` ile doğrulandı) → kimliksiz istek 401. Norm kadro tanımlama → işe alım talebi oluşturma → `GET /hiring-requests` (filtresiz TÜMÜ, `organizationUnitId` filtresiyle SINIRLI) — ikisi de doğru. `docker compose build frontend && up -d frontend` sonrası `/careers/apply` ve `/` rotaları `curl` ile 200 döndü (SPA routing çalışıyor). Ekran testleri artık kullanıcı tarafından elle yapılacak (bkz. yukarıdaki test politikası notu).

---

## 14.5 — Performans

**Özet:** Yeni `performance` modülü — 6 ekran: hedef/yetkinlik tanımlama (`/performance/goals`, `/performance/competencies`, ağırlık toplamı için CANLI göstergeli), puanlama skalası + nihai not ağırlıklandırması (`/performance/rating-scale`, tek sayfada iki bölüm), öz değerlendirme (`/performance/self-assessment`), ekip değerlendirmesi (`/performance/team-assessments`, YONETICI), geçmiş sonuçlar + nihai not ayrıntısı (`/performance/results/:employeeId`, + kısa yol olarak `/performance/results/me`). **Backend araştırması bu kez BOŞLUK BULAMADI** — 14.2'den beri ilk kez: `performance` modülü zaten TAM bir CRUD/onay/hesaplama zincirine sahipti (Goal/Competency ağırlık-toplamı doğrulaması, upsert'lü RatingScale/AssessmentWeightConfig, Self/ManagerAssessment gönderim+listeleme, FinalScoreService'in ağırlıklı ortalama hesabı), saf frontend işi — backend'e HİÇ dokunulmadı.

**Tasarım kararları:**
- **`AssessmentWeightConfig` (US-06.2.3, "ağırlıklar parametrik") roadmap'in 14.5 rota tablosunda AYRI bir satır olarak YOK** ama kabul kriterinde AÇIKÇA isteniyor ve backend'de zaten bir `AssessmentWeightConfigController` var — kendi rotası İCAT EDİLMEDİ, `/performance/rating-scale` sayfasına İKİNCİ bir bölüm (Paper) olarak eklendi (her ikisi de "sistem geneli tekil ayar, `PUT` upsert, ADMIN/IK" — AYNI kategori).
- **`GoalsPage`/`CompetenciesPage`'in form diyaloğunda CANLI ağırlık toplamı göstergesi** (roadmap'in "form içi canlı toplam göstergesi" kabul kriteri) — `react-hook-form`'un `watch()`'ı ile, DÜZENLENEN kalemin KENDİ ağırlığı toplamdan HARİÇ tutulup yazılan değer ANINDA eklenir; bu yalnızca bir ÖNİZLEME, gerçek 100 sınırı doğrulaması backend'de kalır (istemci TEKRARLAMAZ, `GoalService`'in mevcut-toplama bağlı kontrolü BURADA yeniden üretilemez).
- **`/performance/results/:employeeId`, `leave`/`recruitment`'taki self-servis sayfalardan (`/leave/balance` vb.) FARKLI olarak id'yi URL'DE taşır** (roadmap'in rotası böyle tanımlı) — çalışanın KENDİ sonuçlarına ulaşması için `/performance/results/me` adında küçük bir yönlendirme sayfası eklendi (`useMyEmployee` ile kendi id'sini çözüp `Navigate` eder); YONETICI'nin ekip üyesi sonuçlarına ulaşması ise `TeamAssessmentsPage`'in gönderim-sonrası yönlendirmesiyle sağlanır — roadmap'te AÇIKÇA istenmeyen ama "herkes kendi sonucunu görebilmeli" kabul kriterinin PRATİK bir giriş noktası ihtiyacından doğan, dar kapsamlı bir ek.
- **`/performance/results/:employeeId` rotasında rol kısıtı YOK** — backend'in KENDİSİ bu uçlarda (`GET .../manager-assessments`, `GET .../final-score`) `@PreAuthorize` uygulamıyor (kabul kriterleri rol belirtmiyor); frontend de GÖRSEL bir kısıt EKLEMEDİ, roadmap'in "Herkes (kendi) / YONETICI (ekibi)" ifadesi zaten erişimin KİMİN HANGİ id'YE GİTTİĞİNE bağlı olduğunu, rotanın kendisine değil, ima ediyor.
- **`organization.EmployeeCreatePage`'teki 14.4 prefill deseninin TERSİ**: burada YENİ bir sayfa (`MyPerformanceResultsRedirect`) eklendi, mevcut bir sayfa GENİŞLETİLMEDİ — çünkü sonuç sayfası zaten parametrik (`:employeeId`), yalnızca "kendi id'ni bul ve oraya git" KISA YOLU eksikti.

**Değişen/eklenen dosyalar (yalnızca frontend — backend'e dokunulmadı):**
- `frontend/src/modules/performance/` (yeni modül) — `types.ts`, `schema.ts`, `api/{performanceApi,queryKeys,useGoals,useCreateGoal,useUpdateGoal,useDeleteGoal,useCompetencies,useCreateCompetency,useUpdateCompetency,useDeleteCompetency,useRatingScale,useSetRatingScale,useAssessmentWeightConfig,useSetAssessmentWeightConfig,useSelfAssessmentForm,useSubmitSelfAssessment,useSubmitManagerAssessment,useManagerAssessments,useFinalScore}.ts`, `components/{GoalFormDialog,CompetencyFormDialog}.tsx`, `pages/{PerformanceSettingsLayout,GoalsPage,CompetenciesPage,RatingScaleSettingsPage,SelfAssessmentPage,TeamAssessmentsPage,PerformanceResultsPage,MyPerformanceResultsRedirect}.tsx` (+her biri için test)
- `frontend/src/app/navigation.tsx` — 1 nested layout route (`/performance` → goals/competencies/rating-scale sekmeleri) + 3 düz rota (`self-assessment`, `team-assessments`, `results/me`, `results/:employeeId`)
- `frontend/test/msw/handlers/performance.ts` (yeni) — tam stateful `createPerformanceHandlers` fabrikası (goals/competencies/rating-scale/weight-config/self-assessments/manager-assessments/final-score, backend'in KENDİ ağırlıklı ortalama formülünü taklit eder)

**Test'te keşfedilen gerçek davranışlar:**
- **CANLI toplam göstergesi testlerinde metin ÇAKIŞMASI** — düzenleme diyaloğu AÇIKKEN, liste ÜSTÜNDEKİ toplam göstergesi (ör. "Toplam ağırlık: 40/100") ile diyalog İÇİNDEKİ ÖNİZLEME (ön-dolu değerle AYNI sayıya sahip olabilir) AYNI metni üretebiliyor — `LeaveTypesPage`'teki `ResponsiveTable` dual-render'ından FARKLI bir kaynaktan gelen ama AYNI çözümü (belirsizlik anında `getAllByText` + uzunluk sayımı) gerektiren bir belirsizlik.
- **`useQuery`'nin `isPending` durumu, testte İKİ AYRI sorgu için AYRI AYRI beklenmeli** — `RatingScaleSettingsPage`'in iki bağımsız bölümü (skala + ağırlıklandırma) kendi sorgularını KENDİ yüklüyor; bir alanın `findBy*` ile beklenmesi DİĞER alanın da yüklendiği anlamına GELMEZ (senkron `getBy*` ile ikinci alana erişmeye çalışmak `null` değerle başarısız oldu).

**Çalıştırma komutları:**
```bash
cd frontend
npm run test         # 154 test, 0 hata
npx tsc -b            # temiz
npm run lint          # temiz (2 önceden var olan, ilgisiz uyarı hariç)
npm run build         # temiz
docker compose build frontend && docker compose up -d frontend
```

**Canlı doğrulama:** Docker backend'e karşı curl ile tam uçtan uca doğrulandı: hedef+yetkinlik oluşturma → puanlama skalası (1-5) + ağırlıklandırma (%60 hedef/%40 yetkinlik) tanımlama → öz değerlendirme gönderimi → yönetici değerlendirmesi gönderimi → `GET /manager-assessments?employeeId=` listede `finalScore=4.4` doğru hesaplanmış → `GET .../final-score` ayrıntısı (`goalScore=4.0`, `competencyScore=5.0`) backend'in AYNI formülüyle EŞLEŞİYOR. Backend HİÇ değişmediğinden ayrı bir `mvn test`/Docker backend yeniden derlemesi GEREKMEDİ.

---

## 14.6 — PDKS ve Zaman Yönetimi

**Özet:** Yeni `attendance` modülü — 5 ekran: çalışma modeli/vardiya CRUD (`/attendance/work-models`), çalışana model atama (`/attendance/employees/:id/work-model`, `organization.EmployeeDetailPage`'den bir bağlantıyla ulaşılır), fiili giriş-çıkış kayıtları (`/attendance/records`, YALNIZCA GÖRÜNTÜLEME), planlanan-vs-fiili sapma listesi (`/attendance/deviations`), aylık puantaj (`/attendance/timesheet`, ADMIN/IK herkesi görür + CALISAN kendi puantajını görür). **Backend araştırması yine BOŞLUK BULAMADI** (14.5'ten sonra ikinci kez) — `attendance` modülü zaten tam bir zincire sahipti (ağırlık/saat doğrulaması, upsert'lü atama, PDKS-toplu-alım ucu, sapma/puantaj hesaplama servisleri, `Europe/Istanbul` sabit dilimiyle `OffsetDateTime→LocalTime` dönüşümü). Backend'e hiç dokunulmadı.

**Tasarım kararları:**
- **`EmployeeAutocomplete` (yeni paylaşılan bileşen)** — "organizasyon genelinde bir çalışan seç" ihtiyacı bu bölümde ÜÇ ekranda (kayıtlar, sapmalar, puantajın ADMIN görünümü) tekrarlandığından `shared/components`'e taşındı (Bölüm 9'un "3. gerçek ihtiyaçta paylaşılan hale getir" kuralı) — `leave`/`performance`'taki DÜZ `TextField select` tabanlı ekip seçicilerinden BİLİNÇLİ OLARAK FARKLI: oradaki liste zaten küçük (tek ekip), burada TÜM organizasyon söz konusu olduğundan MUI `Autocomplete` + debounce'lu sunucu taraflı arama kullanıldı.
- **`TimesheetPage` TEK route, role göre İKİ AYRI görünüm seçer** (`HiringRequestsPage`/14.4'teki AYNI desen) — ADMIN/IK `EmployeeAutocomplete` ile HERHANGİ bir çalışanı seçer, CALISAN'a hiç seçici GÖSTERİLMEZ, `useMyEmployee` ile KENDİ id'si çözülür.
- **`leaveDates` kompozisyonu frontend'de** (`expandLeaveDates.ts`, +birim test) — backend'in `TimesheetService`'i `leave` modülüne Java bağımlılığı OLMADIĞINDAN (`organization.TeamController`'daki AYNI güven-sınırı deseni) onaylı izin günlerini PARAMETRE olarak bekliyor; frontend `leaveApi.listLeaveRequests(employeeId)`'den `APPROVED` olanları filtreleyip başlangıç-bitiş aralığını GÜNLÜK tarihlere açarak backend'e geri gönderiyor.
- **`organization.EmployeeCreatePage`'teki 14.4 prefill deseni GİBİ, mevcut bir sayfa (`EmployeeDetailPage`) KÜÇÜK bir eklemeyle genişletildi** — "Atama" bölümüne "Çalışma Modelini Yönet" düğmesi eklendi (yalnızca `canEdit=true`, Zimmetler/Atama Geçmişi sekmeleriyle AYNI görünürlük kuralı) — `attendance`'ın kendi route'una (`/attendance/employees/:id/work-model`) yönlendirir; `attendance` `organization`'a bağımlı OLMADIĞINDAN sayfaların KENDİSİ ayrı kalır, yalnızca BİR bağlantı eklendi.

**Değişen/eklenen dosyalar (yalnızca frontend — backend'e dokunulmadı):**
- `frontend/src/shared/components/EmployeeAutocomplete.tsx` (yeni)
- `frontend/src/modules/attendance/` (yeni modül) — `types.ts`, `schema.ts`, `statusLabels.ts`, `expandLeaveDates.ts` (+test), `api/{attendanceApi,queryKeys,useWorkModels,useCreateWorkModel,useUpdateWorkModel,useDeleteWorkModel,useWorkModelAssignment,useAssignWorkModel,useAttendanceRecords,useAttendanceDeviations,useTimesheet}.ts`, `components/WorkModelFormDialog.tsx`, `pages/{WorkModelsPage,WorkModelAssignmentPage,AttendanceRecordsPage,AttendanceDeviationsPage,TimesheetPage}.tsx` (+her biri için test)
- `frontend/src/modules/organization/pages/EmployeeDetailPage.tsx` — "Atama" bölümüne "Çalışma Modelini Yönet" düğmesi
- `frontend/src/app/navigation.tsx` — 5 yeni korumalı rota
- `frontend/test/msw/handlers/attendance.ts` (yeni) — tam stateful `createAttendanceHandlers` fabrikası

**Test'te keşfedilen gerçek davranışlar:**
- **MUI `Autocomplete` AÇIKKEN, `getByLabelText` İKİ eşleşme buluyor** — açılan `<ul role="listbox">`, `aria-labelledby` ile AYNI etiket kimliğine referans veriyor (`<label for>` İLE AYNI accessible name), bu yüzden `getByLabelText` hem input'u HEM DE listbox'ı eşleştiriyor. Çözüm: `getByRole('combobox', { name: ... })` — yalnızca input'u hedefler, `leave`/`recruitment`'taki DÜZ `TextField select`'lerde bu sorun YOKTU (onlarda `getByLabelText` TEK eşleşme buluyordu, çünkü o `Select`'in açılan menüsü `aria-labelledby` KULLANMIYOR).
- **HTML `type="time"` input'ları `userEvent.type()` ile SORUNSUZ çalışıyor** (jsdom'da özel bir segment-bazlı etkileşim GEREKMİYOR, `type="date"`/`DatePicker`'daki (13.5/14.3) segment-bazlı `keyboard()` deseninden FARKLI) — düz `"09:00"` string'i yazmak yeterli.

**Çalıştırma komutları:**
```bash
cd frontend
npm run test         # 169 test, 0 hata
npx tsc -b            # temiz
npm run lint          # temiz (2 önceden var olan, ilgisiz uyarı hariç)
npm run build         # temiz
docker compose build frontend && docker compose up -d frontend
```

**Canlı doğrulama:** Docker backend'e karşı curl ile tam uçtan uca doğrulandı: çalışma modeli oluşturma (09:00–18:00) → çalışana atama → PDKS toplu-alım ucuyla bir kayıt (giriş 09:20, çıkış 17:45 yerel saat) İTME → `GET /attendance-records` doğru döndü → `GET .../deviations` (`lateMinutes=20`, `earlyDepartureMinutes=15`) `Europe/Istanbul` dönüşümüyle DOĞRU hesaplanmış → `GET /timesheet?year=2026&month=8` günlük durumları (`EKSIK`, çıkışsız/az çalışılan günler için) doğru üretti. Backend HİÇ değişmediğinden ayrı bir `mvn test`/Docker backend yeniden derlemesi GEREKMEDİ.

---

## 14.7 (8A) — Eğitim Yönetimi

**Özet:** Yeni `training` modülü — roadmap'in KISA tablosu (`/training/catalog`, `/training/my-trainings`) DÖRT ekrana genişletildi: eğitim kataloğu CRUD (`/training/catalog`), talep oluşturma + kendi taleplerim (`/training/my-trainings`, TEK ekran — roadmap'in kendi tanımı zaten böyle), yönetici onayları (`/training/approvals`, roadmap'in kısa tablosunda AYRI satır yok ama US-08A.1.2'nin "yöneticiye onaya gider" kabul kriteri bunu GEREKTİRİYOR), tamamlanan eğitimler raporu + tamamlama işaretleme (`/training/completed`, US-08A.1.3). **Backend araştırması yine BOŞLUK BULAMADI** (14.5/14.6'dan sonra üçüncü kez) — `training` modülü `leave`'deki (US-04.2.1/04.2.2) "talep→onay" desenini BİREBİR tekrar kullanıyor (`ApprovalDecisionValidator` artık `leave`/`training`/`travel`/`club` arasında PAYLAŞILAN ortak doğrulama — bu, 8B/8G'nin de AYNI deseni izleyeceğinin ERKEN bir işareti). Backend'e hiç dokunulmadı.

**Tasarım kararları:**
- **Roadmap'in KISA tablosu "8A-8I birer paragrafla özetlenmiştir" dediğinden, gerçek ekran sayısı roadmap satır sayısından FAZLA** — tıpkı 14.3/14.4'te (leave/recruitment) roadmap'in kısa satırlarının gerçek ihtiyaca göre genişletilmesi gibi, burada da `/training/approvals` (US-08A.1.2'nin "onaya gider" kısmı için, `leave/approvals`'daki AYNI YONETICI-only kısıt) EKLENDİ.
- **`/training/completed`'de "tamamlanmayı bekleyenler" (APPROVED) listesi ORGANİZASYON GENELİ DEĞİL, `EmployeeAutocomplete` ile TEK seferde BİR çalışan seçilerek görüntülenir** — backend'in `GET /enrollments` ucu (`leave.listByEmployee`'deki AYNI kısıt) `employeeId` OLMADAN çağrılamıyor (`TrainingEnrollmentService#listByEmployee` null'da fırlatıyor), bu yüzden org geneli bir "tüm APPROVED talepler" sorgusu YOK. Bunun ALTINDAKİ "Tamamlanan Eğitimler Raporu" ise `GET .../completed`'in GERÇEKTEN opsiyonel `employeeId`'siyle (US-08A.1.3'ün kendi kabul kriterine BİREBİR uyan tasarım) org geneli listelenir — İKİ FARKLI sorgu davranışının frontend'e YANSIMASI.
- **`RejectEnrollmentDialog`, `leave.RejectLeaveRequestDialog`'un NEREDEYSE BİREBİR kopyası** — `ApprovalDecisionValidator`'ın backend'de PAYLAŞILAN olmasının frontend karşılığı; ayrı bir paylaşılan bileşene ÇIKARILMADI (henüz yalnızca 2. kullanım, Bölüm 9'un "3. gerçek ihtiyaçta" eşiği karşılanmadı — `EmployeeAutocomplete`'in AKSİNE, bkz. 14.6).

**Değişen/eklenen dosyalar (yalnızca frontend — backend'e dokunulmadı):**
- `frontend/src/modules/training/` (yeni modül) — `types.ts`, `statusLabels.ts`, `schema.ts`, `api/{trainingApi,queryKeys,useTrainings,useCreateTraining,useUpdateTraining,useDeleteTraining,useEnrollments,useCreateEnrollment,useDecideEnrollment,useCompleteEnrollment,useCompletedTrainings}.ts`, `components/{TrainingFormDialog,RejectEnrollmentDialog}.tsx`, `pages/{TrainingCatalogPage,MyTrainingsPage,TrainingApprovalsPage,TrainingCompletedPage}.tsx` (+her biri için test)
- `frontend/src/app/navigation.tsx` — 4 yeni korumalı rota
- `frontend/test/msw/handlers/training.ts` (yeni) — tam stateful `createTrainingHandlers` fabrikası

**Çalıştırma komutları:**
```bash
cd frontend
npm run test         # 178 test, 0 hata
npx tsc -b            # temiz
npm run lint          # temiz (2 önceden var olan, ilgisiz uyarı hariç)
npm run build         # temiz
docker compose build frontend && docker compose up -d frontend
```

**Canlı doğrulama:** Docker backend'e karşı curl ile tam uçtan uca doğrulandı: eğitim oluşturma → talep oluşturma (PENDING) → onaylama (APPROVED) → tamamlama işaretleme (COMPLETED, tarih ile) → `GET /completed` raporunda çalışan+eğitim+tarih DOĞRU göründü. Backend HİÇ değişmediğinden ayrı bir `mvn test`/Docker backend yeniden derlemesi GEREKMEDİ.

---

## 14.7 (8B) — Harcırah/Seyahat/Masraf

**Özet:** Yeni `travel` modülü — roadmap'in KISA tablosu (3 satır: seyahat talebi, masraf kalemi ekleme, masraf onayı) İKİ ekrana toplandı: seyahat taleplerim + oluşturma (`/travel/requests`), talep detayı + masraf kalemi ekleme + onay (`/travel/requests/:id`, masraf kalemleri her zaman BİR talep bağlamında görüntülendiğinden roadmap'in son iki satırı DOĞAL OLARAK aynı sayfada birleşiyor). **Backend araştırması BİR boşluk buldu** (14.5/14.6/8A'daki "boşluk yok" serisinden sonra) — `ExpenseItemController`'da yüklenen belgeyi İNDİRECEK hiçbir uç yoktu, yalnızca meta veri (`documentFileName`/`documentContentType`) dönüyordu; `GET /{id}/document` eklendi (bkz. `04-implementation-log.md`).

**Tasarım kararları:**
- **`/travel/requests`, `attendance.TimesheetPage`'deki (14.6) AYNI "kendim + ADMIN/IK/YONETICI için EmployeeAutocomplete ile başkasını gözlemleme" desenini kullanır** — ama farkla: "başkasını gözlemleme" YALNIZCA GÖRÜNTÜLEME amaçlı, talep oluşturma HER ZAMAN kendi adına (backend'in `employeeId`'yi doğrulamadığı bir uçta başkası adına talep oluşturma YETKİSİ istemli olarak frontend'de de AÇILMADI).
- **Masraf onayı (`decide`) rolü backend'de HİÇ kısıtlı değil** (`ExpenseItemController` javadoc'u: "kabul kriteri yalnızca kendi ekibi gibi bir kayıt bazlı kısıt istemedi") — roadmap'in rol tablosu yine de YONETICI diyor, bu yüzden Onayla/Reddet düğmeleri frontend'de ADMIN/IK/YONETICI'ye GÖRSEL olarak kısıtlandı (`leave`'deki teamEmployeeIds trust-boundary'sinin AKSİNE, burada hiçbir ekip doğrulaması YOK — backend zaten istemedi).
- **Belge indirme, `recruitment.CandidateDetailPage`'deki (14.4) AYNI "buton + `downloadBlob`" deseni** — ayrı bir önizleme/görüntüleyici İCAT EDİLMEDİ, tarayıcının kendi indirme akışı kullanıldı.

**Değişen/eklenen dosyalar (backend):**
- `backend/travel/src/main/java/com/digitalik/travel/controller/ExpenseItemController.java` — `GET /{id}/document`
- `backend/travel/src/main/java/com/digitalik/travel/service/ExpenseItemService.java` — `get(Long id)`
- `backend/travel/src/test/java/com/digitalik/travel/controller/ExpenseItemControllerTest.java` — +2 yeni test

**Değişen/eklenen dosyalar (frontend):**
- `frontend/src/modules/travel/` (yeni modül) — `types.ts`, `statusLabels.ts`, `schema.ts`, `api/{travelApi,queryKeys,useTravelRequests,useCreateTravelRequest,useExpenseItems,useCreateExpenseItem,useDecideExpenseItem}.ts`, `pages/{TravelRequestsPage,TravelRequestDetailPage}.tsx` (+her biri için test)
- `frontend/src/app/navigation.tsx` — 2 yeni korumalı rota
- `frontend/test/msw/handlers/travel.ts` (yeni) — tam stateful `createTravelHandlers` fabrikası

**Çalıştırma komutları:**
```bash
cd backend
mvn -pl travel -am test   # +2 yeni test dahil, 9/9 yeşil
mvn test                   # tam reactor, sıfır regresyon
docker compose build backend && docker compose up -d backend

cd frontend
npm run test         # 185 test, 0 hata
npx tsc -b            # temiz
npm run lint          # temiz (2 önceden var olan, ilgisiz uyarı hariç)
npm run build         # temiz
docker compose build frontend && docker compose up -d frontend
```

**Canlı doğrulama:** Docker backend'e karşı curl ile tam uçtan uca doğrulandı: seyahat talebi oluşturma → masraf kalemi ekleme (multipart, gerçek bir PDF baytıyla) → `GET .../document` indirilen baytlar `diff` ile YÜKLENENLERLE BİREBİR eşleşiyor → onaylama (APPROVED) doğru çalıştı.

---

## 14.7 (8C) — Uyarı/Ceza/Ödül ve Disiplin

**Özet:** Yeni `discipline` modülü — üç bağımsız akış, üç ekrana ayrıldı: uyarı kaydı (`/discipline/warnings`), ceza süreci listeleme+oluşturma+detay (`/discipline/cases`, `/discipline/cases/:id`), ödül kaydı (`/discipline/awards`). Backend araştırması BİR boşluk buldu — `DisciplinaryCaseController`'da bir sürecin TÜM revizyonlarını (savunma/kapatma geçmişi) döndürecek hiçbir uç yoktu, yalnızca güncel durum okunabiliyordu; `findRevisionsByRootId` zaten `latestRevision()` içinde İÇSEL olarak kullanılıyordu ama hiç DIŞARI açılmamıştı. `GET /{id}/revisions` eklendi (bkz. `04-implementation-log.md`).

**Tasarım kararları:**
- **`DisciplinaryCase` revizyon/immutability deseni (SEC-021)**: satırlar HİÇBİR ZAMAN güncellenmiyor, yalnızca yeni revizyon satırları INSERT ediliyor; `caseId` alanı kök kayıt için `null`, diğer tüm revizyonlarda kökün id'sine işaret ediyor. `DisciplinaryCaseDetailPage`'in "güncel durum"u ayrı bir "son revizyonu getir" ucu İCAT EDİLMEDEN, `revisions[0]`'dan türetildi — hem gerçek backend hem MSW mock'u revizyonları YENİDEN-ESKİYE döndürüyor.
- **"Kapat" butonu `disabled={!canClose}`**, roadmap'in birebir kabul kriterine göre: `canClose = current.status === 'OPEN' && !!current.defense?.trim()` — savunma alanı boşken kapatma backend'de zaten 400 döndürüyor, frontend bunu ÖNCEDEN engelliyor.
- **Revizyon geçmişi görünümü**, 13.8'de `AccordionList` için YAZILAN ama o zaman kullanılmayan "disiplin geçmişi" öngörüsünü (component'in kendi docstring'i) İLK KEZ gerçekleştiriyor — yeni bir liste component'i İCAT EDİLMEDİ.
- **Yeni DTO (`DisciplinaryCaseRevisionResponse`)** mevcut `DisciplinaryCaseResponse`'un YENİDEN KULLANILMASI yerine tercih edildi — revizyon listesi `id`/`reason`/`defense`/`status`/`createdAt` dışında hiçbir alan istemiyor, gereksiz alan taşımaktan kaçınıldı.

**Değişen/eklenen dosyalar (backend):**
- `backend/discipline/src/main/java/com/digitalik/discipline/dto/DisciplinaryCaseRevisionResponse.java` (yeni)
- `backend/discipline/src/main/java/com/digitalik/discipline/service/DisciplinaryCaseService.java` — `getRevisions(Long caseId)`
- `backend/discipline/src/main/java/com/digitalik/discipline/controller/DisciplinaryCaseController.java` — `GET /{id}/revisions`
- `backend/discipline/src/test/java/com/digitalik/discipline/controller/DisciplinaryCaseControllerTest.java` — +2 yeni test

**Değişen/eklenen dosyalar (frontend):**
- `frontend/src/shared/components/EmployeeAutocomplete.tsx` — 3. gerçek ihtiyaçtan sonra ORTAK component'e taşındı (attendance modülünden bu yana)
- `frontend/src/modules/discipline/` (yeni modül) — `types.ts`, `statusLabels.ts`, `schema.ts`, `queryKeys.ts`, `api/{disciplineApi,useWarnings,useCreateWarning,useDisciplinaryCases,useCreateDisciplinaryCase,useDisciplinaryCaseRevisions,useRecordDefense,useCloseDisciplinaryCase,useAwards,useCreateAward}.ts`, `pages/{WarningsPage,DisciplinaryCasesPage,DisciplinaryCaseDetailPage,AwardsPage}.tsx` (+her biri için test)
- `frontend/src/app/navigation.tsx` — 4 yeni korumalı rota
- `frontend/test/msw/handlers/discipline.ts` (yeni) — `createDisciplineHandlers(initialWarnings, initialCases, initialAwards)` fabrikası

**Çalıştırma komutları:**
```bash
cd backend
mvn -pl discipline -am test   # +2 yeni test dahil, 12/12 yeşil
mvn test                       # tam reactor, sıfır regresyon
docker compose build backend && docker compose up -d backend

cd frontend
npm run test         # 192 test, 0 hata
npx tsc -b            # temiz
npm run lint          # temiz (2 önceden var olan, ilgisiz uyarı hariç)
npm run build         # temiz
docker compose build frontend && docker compose up -d frontend
```

**Canlı doğrulama:** Docker backend'e karşı curl ile tam uçtan uca doğrulandı: ceza süreci açma → savunma OLMADAN kapatma denemesi 400 döndürüyor (iş kuralı doğru) → savunma kaydetme → kapatma başarılı → `GET .../revisions` 3 revizyonu YENİDEN-ESKİYE doğru sırada döndürüyor.

---

## 14.7 (8E+8F) — Anket + Talep ve Fikir

**Özet:** Backend'de her ikisi de AYNI `feedback` modülünde (aynı paket, tek `FeedbackExceptionHandler`) yaşadığından, frontend'de de TEK bir `feedback` modülünde birlikte geliştirildi. Backend araştırması **hiçbir boşluk bulmadı** (14.5/14.6/8A'daki "boşluk yok" serisine dönüş) — `SurveyController`/`SurveyAnswerController`/`SuggestionController`/`SuggestionCategoryController` roadmap'in istediği tüm uçları ZATEN sunuyordu.

**Tasarım kararları:**
- **6 ekrana bölündü** (roadmap'in listelediği 6 API satırına karşılık): `/surveys` (liste+oluşturma, `travel.TravelRequestsPage`'deki AYNI "ayrı `/new` route'u İCAT ETMEME" kararı), `/surveys/:id/answer`, `/surveys/:id/results`, `/suggestions` (liste+oluşturma, `training.MyTrainingsPage`'deki AYNI birleştirme), `/suggestions/manage`, `/suggestions/categories`.
- **`/surveys` HERKESE (oturumlu) açık** — `GET /api/surveys` backend'de rol kısıtlı DEĞİL (`SurveyController` javadoc'u: "kabul kriteri bundan bahsetmiyor"); yalnızca "Yeni Anket" oluşturma ve "Sonuçlar" linki ADMIN/IK'ya GÖRSEL olarak kısıtlandı, "Yanıtla" aksiyonu HERKESTE.
- **`GET /api/surveys/{id}` ucu YOK** (yalnızca liste + sonuç uçları var) — `SurveyAnswerPage`, `DisciplinaryCaseDetailPage`'in `revisions[0]`'dan güncel durumu türetmesindeki AYNI kararla, tek anketi `useSurveys()` listesinden `find` ile türetir; gereksiz bir "tekil anket getir" ucu İCAT EDİLMEDİ.
- **`/suggestions/categories` roadmap'in KENDİSİ bir route olarak itemize ETMEDİ** ama `POST /suggestions`'ın beklediği `categoryId`'nin bir yerde YÖNETİLMESİ gerektiğinden, `organization.JobTitlesPage`'deki AYNI "ayrı, sade CRUD ekranı" deseni (embedded bir panel yerine) tercih edildi — `SuggestionCategoryController` zaten TAM CRUD sunuyordu.
- **Anket seçenek listesi** için codebase'de İLK `useFieldArray` kullanımı (`SurveyFormDialog`) — sabit sayıda alan yerine gerçek bir dinamik liste ihtiyacı.
- **"Grafik/çubuk gösterim" (US-08E.1.3)**, yeni bir grafik kütüphanesi EKLENMEDEN (`package.json`'da hiçbiri yok) MUI `LinearProgress` çubuklarıyla karşılandı.

**Değişen/eklenen dosyalar (backend):** YOK (boşluk bulunamadı).

**Değişen/eklenen dosyalar (frontend):**
- `frontend/src/modules/feedback/` (yeni modül) — `types.ts`, `schema.ts`, `statusLabels.ts`, `queryKeys.ts`, `api/{feedbackApi,useSurveys,useCreateSurvey,useSubmitSurveyAnswer,useSurveyResults,useSuggestionCategories,useCreateSuggestionCategory,useUpdateSuggestionCategory,useDeleteSuggestionCategory,useSuggestions,useCreateSuggestion,useUpdateSuggestionStatus}.ts`, `components/{SurveyFormDialog,SuggestionCategoryFormDialog}.tsx`, `pages/{SurveysPage,SurveyAnswerPage,SurveyResultsPage,MySuggestionsPage,SuggestionsManagePage,SuggestionCategoriesPage}.tsx` (+her biri için test)
- `frontend/src/app/navigation.tsx` — 6 yeni korumalı rota
- `frontend/test/msw/handlers/feedback.ts` (yeni) — tam stateful `createFeedbackHandlers` fabrikası

**Çalıştırma komutları:**
```bash
cd frontend
npm run test         # 206 test, 0 hata
npx tsc -b            # temiz
npm run lint          # temiz (2 önceden var olan, ilgisiz uyarı hariç)
npm run build         # temiz
docker compose build frontend && docker compose up -d frontend   # backend değişmediği için YALNIZCA frontend
```

**Canlı doğrulama:** Docker backend'e karşı curl ile tam uçtan uca doğrulandı: anket oluşturma (2 seçenek, anonim) → yanıt gönderme (`employeeId: null`) → `GET .../results` %100/%0 doğru dağılımı döndürdü; kategori oluşturma → anonim talep gönderme (`employeeId: null`) → `GET /suggestions` (parametresiz) anonim talebi DE listeledi → durum güncelleme (`PENDING` → `COMPLETED`) doğru çalıştı.

---

## Genel durum (13.1–13.8 + 14.1–14.6 + 14.7/8A-8C+8E-8F sonrası)

Toplam: **206 Vitest testi** (unit + entegrasyon), **87 Playwright E2E testi** (+13 skip — 13.1–14.3'ten, artık büyütülmüyor). `npm run build` ve `npm run lint` her bölüm sonunda temiz. Bölüm 13'ün TAMAMI (13.1–13.8) + Bölüm 14.1–14.6 + 14.7'nin 5/9 alt-modülü (8A, 8B, 8C, 8E, 8F) tamamlandı. Sıradaki bölüm: **14.7'nin kalan 3 alt-modülünden biri (8G, 8H, 8I — 8D Bölüm 14.8'e ertelendi)**, roadmap sırasına göre 8G ile devam ediliyor.
