# Dijital İnsan Kaynakları Platformu — Uygulama Günlüğü

**Amaç:** `03-product-roadmap.md`'deki her User Story tamamlandığında, ne eklendiğinin/değiştiğinin kısa bir kaydı. Bu doküman bir plan değil, **geçmişe dönük bir günlüktür** — tamamlanan iş bittikçe buraya yeni bir bölüm eklenir.

**Format:** Her görev için Story ID, kısa özet, değişen/eklenen dosyalar, çalıştırma komutları ve (varsa) dikkat çekici kararlar/notlar. Bölümler **görev numarasına göre sıralıdır**, tamamlanma kronolojisine göre değil — bazı görevler roadmap sırasının dışında (ör. US-01.3.1, US-01.1.3/01.1.4'ten önce) tamamlanmış olabilir; bu tür sapmalar ilgili bölümün notunda ayrıca belirtilir.

---

## US-01.1.1 — Backend iskeleti (Spring Boot, modüler paket yapısı)

**Özet:** Java/Spring Boot backend projesi sıfırdan kuruldu; modül sınırlarını ileride yansıtacak paket yapısına (`core` vb.) baştan ayrıldı.

**Değişen/eklenen dosyalar:**
- `pom.xml` — Maven proje tanımı (Spring Boot 3.3.5 parent, Java 21, `spring-boot-starter-web` + `spring-boot-starter-test`)
- `src/main/java/com/digitalik/DijitalIkPlatformuApplication.java` — uygulama giriş noktası *(not: bu dosya o an `com.bkm.dijitalik` altındaydı; US-01.3.1'de `com.digitalik`'e taşındı — bkz. o bölümdeki not)*
- `src/main/java/com/digitalik/core/package-info.java` — `core` paketinin amacını belgeleyen paket dokümantasyonu
- `src/main/resources/application.yml` — minimal uygulama adı yapılandırması
- `src/test/java/com/digitalik/DijitalIkPlatformuApplicationTests.java` — Spring context yükleme smoke testi
- `.gitignore` — `target/`, IDE ve OS dosyaları

**Çalıştırma komutları:**
```bash
mvn test            # context-load testi
mvn spring-boot:run  # http://localhost:8080
```

**Doğrulama:** `mvn test` → 1 test, 0 hata; `mvn spring-boot:run` ile Tomcat port 8080'de başarıyla ayağa kalktı (manuel doğrulandı, sonra durduruldu).

---

## US-01.1.2 — Frontend iskeleti (React + TypeScript)

**Özet:** Vite tabanlı React + TypeScript projesi `frontend/` altında kuruldu; component kütüphanesi olarak MUI seçildi; test altyapısı (Vitest + React Testing Library) eklendi.

**Değişen/eklenen dosyalar** (`frontend/`):
- `package.json` — Vite + React 19 + TypeScript; `@mui/material`, `@emotion/react`, `@emotion/styled`; dev bağımlılık: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`; `test` script'i
- `src/App.tsx` — MUI `Container`/`Typography`/`CssBaseline` ile boş ana sayfa ("Dijital İK Platformu" başlığı); Vite demo içeriği kaldırıldı
- `src/index.css` — Vite demo stilleri temizlendi, minimal reset bırakıldı
- `src/setupTests.ts` — `@testing-library/jest-dom` matcher kurulumu
- `src/App.test.tsx` — ana sayfa başlığının render edildiğini doğrulayan test
- `vite.config.ts` — `vitest/config` ile test (jsdom ortamı) yapılandırması
- `index.html` — dil `tr`, başlık "Dijital İK Platformu"
- Kaldırılanlar: `src/App.css`, `src/assets/*` (react/vite logoları, hero görseli), `public/icons.svg`

**Çalıştırma komutları:**
```bash
cd frontend
npm test        # Vitest — 1 test, 0 hata
npm run build   # tsc -b && vite build
npm run dev     # http://localhost:5173
```

**Doğrulama:** `npm test` ve `npm run build` başarılı; dev server manuel başlatılıp ana sayfanın servis edildiği doğrulandı, sonra durduruldu.

---

## US-01.1.3 — PostgreSQL bağlantısı ve Flyway migration

**Özet:** Geçici H2 çalışma zamanı bağımlılığı kaldırıldı; backend artık ortam değişkenlerinden okunan bir PostgreSQL bağlantısı kullanıyor ve şema Flyway migration'ları ile yönetiliyor. `@DataJpaTest` slice testleri (hız için) ayrı bir test-only H2 yapılandırmasıyla çalışmaya devam ediyor.

**Not (görev sırası):** Bu görev, roadmap'teki numaralandırmanın aksine US-01.2.1/01.2.2/01.3.1'den **sonra** tamamlandı (kullanıcı isteğiyle önce diğer görevler yapıldı). Bu nedenle aşağıdaki listede geçen `AuditLogEntry`, `BaseEntity` gibi sınıflar bu görevden önce zaten mevcuttu; burada yalnızca onların PostgreSQL/Flyway'e taşınması anlatılıyor.

**Bağlam:** Bu görev başladığında ne yerel bir PostgreSQL ne de bir Docker imajı vardı; Docker Desktop kurulu ama kapalıydı. Docker Desktop başlatılıp gerçek bir PostgreSQL konteynerine karşı migration canlı doğrulandı (aşağıya bkz.).

**Değişen/eklenen dosyalar:**
- `pom.xml` — `com.h2database:h2` çalışma zamanı (`runtime`) kapsamından **test** kapsamına taşındı (artık geçici değil, kalıcı olarak yalnızca hızlı slice testleri için); `org.postgresql:postgresql` (runtime), `org.flywaydb:flyway-core`, `org.flywaydb:flyway-database-postgresql` eklendi
- `src/main/resources/db/migration/V1__create_audit_log.sql` — ilk Flyway migration'ı; US-01.3.1'de eklenen `AuditLogEntry`'nin şemasını (`audit_log` tablosu) oluşturur
- `src/main/resources/application.yml` — `spring.datasource.*` ortam değişkenlerinden okunur (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, yerel geliştirme için varsayılanlarla); `spring.jpa.hibernate.ddl-auto: validate` (şema artık Hibernate tarafından değil Flyway tarafından yönetiliyor)
- `src/test/resources/application.yml` — **yeni:** test classpath'inde `spring.flyway.enabled=false` ve `ddl-auto: create-drop`; `@DataJpaTest` testleri (ör. `BaseEntityAuditingTest`, `AuditLogEntityListenerTest`) böylece PostgreSQL'e ihtiyaç duymadan, önceki davranışlarıyla (bellek içi H2, Hibernate auto-schema) çalışmaya devam ediyor

**Canlı doğrulama:** Docker Desktop başlatılıp `docker compose up` ile gerçek bir PostgreSQL 16 konteynerine bağlanıldı; backend logunda migration'ın uygulandığı görüldü ("Migrating schema "public" to version "1 - create audit log"" → "Successfully applied 1 migration"), ardından `psql` ile `audit_log` ve `flyway_schema_history` tablolarının oluştuğu doğrulandı. (Detaylı komutlar US-01.1.4 bölümündedir — iki görev birlikte doğrulandı.)

**Çalıştırma komutları:**
```bash
mvn test   # H2 ile, PostgreSQL gerekmez — 7 test, 0 hata
```

---

## US-01.1.4 — Docker Compose (backend + frontend + PostgreSQL)

**Özet:** `docker compose up` ile backend, frontend ve PostgreSQL'in tek komutla ayağa kalktığı bir yapı kuruldu.

**Değişen/eklenen dosyalar:**
- `Dockerfile` (repo kökü) — backend için çok aşamalı build (Maven + Eclipse Temurin JRE 21)
- `frontend/Dockerfile` — frontend için çok aşamalı build (Node + Nginx, statik dosya servisi)
- `.dockerignore`, `frontend/.dockerignore` — build bağlamını küçültmek için
- `docker-compose.yml` (repo kökü) — üç servis:
  - `postgres` (postgres:16-alpine, healthcheck ile) — host'a **5433** portundan açılır (bkz. not)
  - `backend` — `DB_HOST=postgres` vb. ortam değişkenleriyle, `postgres` sağlıklı olduktan sonra başlar, host **8080**
  - `frontend` — Nginx ile statik servis, host **3000**

**Not (port çakışması):** Bu makinede 5432 portu, projeyle ilgisi olmayan yerel bir PostgreSQL 16 kurulumu (`/Library/PostgreSQL/16`) tarafından zaten kullanılıyordu. `docker-compose.yml`'deki `postgres` servisinin host port eşlemesi bu nedenle `5433:5432` yapıldı; konteynerler arası iletişim (backend → postgres) Docker'ın iç ağı üzerinden standart 5432 portuyla devam ediyor, yalnızca host'tan dışarıya açılan port değişti.

**Canlı doğrulama:**
```bash
docker compose up --build -d
docker compose ps   # üç servis de "Up" / postgres "healthy"
curl -i http://localhost:3000/    # 200, MUI tabanlı ana sayfa HTML'i
curl -i http://localhost:8080/    # 404 ama application/problem+json formatında (US-01.2.2 doğrulandı)
docker compose logs backend       # Flyway migration'ının PostgreSQL'e uygulandığı görüldü
docker compose exec postgres psql -U dijitalik -d dijitalik -c "\dt"   # audit_log + flyway_schema_history tabloları
docker compose down               # doğrulama sonrası durduruldu (veri hacmi korunuyor)
```

Tüm adımlar başarıyla doğrulandı; her üç konteyner de sağlıklı şekilde ayağa kalktı ve tarayıcıdan erişilebilir durumdaydı.

**Çalıştırma komutları:**
```bash
docker compose up --build   # ilk çalıştırma / Dockerfile değişikliği sonrası
docker compose up           # sonraki çalıştırmalar
docker compose down         # durdurma (veri hacmi korunur)
docker compose down -v      # durdurma + veri hacmini sil
```

---

## US-01.2.1 — Ortak taban entity alanları

**Özet:** Tüm varlıkların miras alacağı `BaseEntity` (id, createdAt, updatedAt, createdBy, updatedBy) ve bu alanları otomatik dolduran Spring Data JPA auditing yapılandırması eklendi.

**Değişen/eklenen dosyalar:**
- `pom.xml` — `spring-boot-starter-data-jpa` eklendi; geçici `h2` (runtime) bağımlılığı eklendi *(US-01.1.3'te PostgreSQL bağlanınca kaldırılacak — bkz. o bölümdeki not)*
- `src/main/java/com/digitalik/core/BaseEntity.java` — `@MappedSuperclass`; id + audit alanları
- `src/main/java/com/digitalik/core/JpaAuditingConfig.java` — `@EnableJpaAuditing`; auditor şimdilik sabit `"system"` döner
- `src/test/java/com/digitalik/core/SampleEntity.java`, `SampleEntityRepository.java` — yalnızca test amaçlı fixture
- `src/test/java/com/digitalik/core/BaseEntityAuditingTest.java` — oluşturma/güncelleme sırasında audit alanlarının doğru doldurulduğunu doğrular

**Not (bağımlılık sapması):** Roadmap'e göre bu görev US-01.1.3'e (PostgreSQL+Flyway) bağımlıydı; bu henüz kurulmadığı için geçici olarak H2 (bellek içi) veritabanı kullanıldı. `BaseEntity`/auditing kodu, gerçek PostgreSQL bağlanınca (US-01.1.3) değişmeden kaldı.

**Çalıştırma komutları:**
```bash
mvn test   # BaseEntityAuditingTest dahil
```

---

## US-01.2.2 — Tutarlı hata/response formatı

**Özet:** Tüm API hatalarının RFC 7807 `ProblemDetail` formatında dönmesini sağlayan merkezi bir exception handler eklendi.

**Değişen/eklenen dosyalar:**
- `src/main/java/com/digitalik/exception/GlobalExceptionHandler.java` — `IllegalArgumentException` (400) ve genel `Exception` (500) için `ProblemDetail` yanıtı
- `src/main/resources/application.yml` — `spring.mvc.problemdetails.enabled=true` (Spring'in kendi ürettiği hataları da aynı formata çevirir), `spring.jpa.open-in-view=false` (JPA eklenmesiyle gelen uyarıyı gidermek için)
- `src/test/java/com/digitalik/exception/ThrowingTestController.java` — test amaçlı, hata fırlatan controller
- `src/test/java/com/digitalik/exception/GlobalExceptionHandlerTest.java` — 400 ve 500 hatalarının `application/problem+json` formatında döndüğünü doğrular

**Çalıştırma komutları:**
```bash
mvn test   # GlobalExceptionHandlerTest dahil
```

---

## US-01.3.1 — Minimal `audit_log` tablosu ve kaydı

**Özet:** Bir kaydın kim tarafından, ne zaman, hangi işlemle (oluşturma/güncelleme) değiştirildiğini tutan basit, salt-ekleme bir `audit_log` tablosu ve otomatik kayıt mekanizması eklendi.

**Ön adım — paket mutabakatı:** Bu görev başlamadan önce, IDE üzerinden yapılan bir yeniden adlandırma (`com.bkm.dijitalik` → `com.digitalik`, `core.web.GlobalExceptionHandler` → `exception.GlobalExceptionHandler`) yalnızca `src/main`'i kapsamış, `src/test` ve o sırada eklenmekte olan `audit` paketi eski/silinmiş sınıflara işaret ediyordu. Tüm test dosyaları (`DijitalIkPlatformuApplicationTests`, `BaseEntityAuditingTest`, `SampleEntity`, `SampleEntityRepository`, `GlobalExceptionHandlerTest`, `ThrowingTestController`) `com.digitalik.*` altına taşınıp güncellendi; bu, US-01.1.1/01.1.2/01.2.1/01.2.2 bölümlerindeki dosya yollarının bu günlükte güncel (`com.digitalik`) haliyle listelenmesinin sebebidir.

**Değişen/eklenen dosyalar:**
- `src/main/java/com/digitalik/core/audit/AuditOperation.java` — `CREATE`/`UPDATE` enum'u
- `src/main/java/com/digitalik/core/audit/AuditLogEntry.java` — `audit_log` tablosu (varlık türü, varlık id, işlem tipi, kullanıcı, zaman); `BaseEntity`'den bağımsız (döngü oluşmasın diye)
- `src/main/java/com/digitalik/core/audit/AuditLogRepository.java`
- `src/main/java/com/digitalik/core/audit/AuditLogEntityListener.java` — `BaseEntity`'ye `@PostPersist`/`@PostUpdate` ile bağlı; her create/update işleminde `audit_log`'a bir satır yazar
- `src/main/java/com/digitalik/core/audit/AuditLogContextHolder.java` — bean erişim yardımcı sınıfı (bkz. not)
- `src/main/java/com/digitalik/core/BaseEntity.java` — `@EntityListeners`'a `AuditLogEntityListener` eklendi
- `src/test/java/com/digitalik/core/AuditLogEntityListenerTest.java` — oluşturmanın 1, güncellemenin ayrı bir 2. satır yarattığını doğrular

**Not (teknik karar):** İlk denemede `AuditLogEntityListener` içine `@Autowired` ile `AuditLogRepository`/`AuditorAware` enjekte edilmeye çalışıldı; Hibernate'in `@EntityListeners` sınıflarını no-arg constructor ile örneklemesi nedeniyle bu enjeksiyon bu ortamda çalışmadı (testler `NullPointerException` ile yakaladı). Bunun yerine `AuditLogContextHolder` (`ApplicationContextAware`) üzerinden, ihtiyaç anında `ApplicationContext.getBean(...)` ile bean alma yöntemine geçildi.

**Çalıştırma komutları:**
```bash
mvn test            # 7 test, 0 hata (tüm birikmiş testler)
mvn spring-boot:run  # tek ana sınıfla başarıyla ayağa kalkıyor
```

---

## US-02.1.1 — E-posta/parola ile giriş

**Özet:** `POST /api/auth/login` uç noktası eklendi; doğru bilgiyle 200 + kullanıcı bilgisi, yanlış bilgiyle `ProblemDetail` formatında 401 döner.

**Kapsam kararı:** Parola hashleme (roadmap'te ayrı story olan US-02.1.2) baştan uygulandı — parolayı düz metin saklayan, sonradan hashlenecek bir ara adım yazmak gereksiz ve güvensiz olurdu. `spring-boot-starter-security` yerine yalnızca `spring-security-crypto` eklendi; bu, tüm uç noktaları otomatik olarak kimlik doğrulama arkasına almadan yalnızca `PasswordEncoder`/`BCrypt` sağlar — erişim kısıtlama US-02.2.3'te ayrı olarak ele alınacak. Oturum/token (US-02.1.3) bu story'nin kapsamı dışında; `LoginResponse` şimdilik yalnızca kullanıcı id + e-posta döner.

**Kullanıcı oluşturma story'si roadmap'te yok:** Girişi test edebilmek için `V3__seed_admin_user.sql` ile tek bir bootstrap kullanıcısı eklendi (`admin@dijitalik.local` / `ChangeMe123!`, yalnızca yerel/geliştirme amaçlı). Gerçek bir kullanıcı yönetim ekranı ileride ayrı bir story olarak ele alınmalı.

**Değişen/eklenen dosyalar:**
- `pom.xml` — `spring-security-crypto` eklendi
- `src/main/java/com/digitalik/auth/User.java` — `BaseEntity`'yi miras alan kullanıcı hesabı (email, passwordHash)
- `src/main/java/com/digitalik/auth/UserRepository.java` — `findByEmail`
- `src/main/java/com/digitalik/auth/PasswordEncoderConfig.java` — `BCryptPasswordEncoder` bean'i
- `src/main/java/com/digitalik/auth/AuthService.java` — e-posta ile kullanıcı bulma + parola doğrulama
- `src/main/java/com/digitalik/auth/AuthController.java` — `POST /api/auth/login`
- `src/main/java/com/digitalik/auth/LoginRequest.java`, `LoginResponse.java` — istek/yanıt DTO'ları (record)
- `src/main/java/com/digitalik/auth/InvalidCredentialsException.java` — e-posta/parola ayrımı yapmayan, kullanıcı numaralandırmaya karşı genel hata mesajı
- `src/main/java/com/digitalik/exception/GlobalExceptionHandler.java` — `InvalidCredentialsException` → 401 `ProblemDetail` eşlemesi eklendi
- `src/main/resources/db/migration/V2__create_users.sql` — `users` tablosu
- `src/main/resources/db/migration/V3__seed_admin_user.sql` — bootstrap kullanıcı (bkz. not)
- `src/test/java/com/digitalik/auth/AuthControllerTest.java` — doğru bilgiyle 200, yanlış parolayla 401 (problem+json, anlaşılır mesaj), olmayan kullanıcıyla 401 senaryolarını doğrular

**Canlı doğrulama:** `docker compose up --build -d` ile gerçek PostgreSQL'e karşı çalıştırıldı; log'da "Migrating schema "public" to version "2 - create users"" ve "3 - seed admin user" görüldü (önceki V1'in üzerine artımlı olarak uygulandı). `curl` ile bootstrap kullanıcısıyla giriş 200 (`{"userId":1,"email":"admin@dijitalik.local"}`), yanlış parolayla 401 (`{"title":"Kimlik doğrulama başarısız", ...}`) doğrulandı. Sonra `docker compose down` ile durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # AuthControllerTest dahil, 10 test, 0 hata
```

---

## Yapısal karar — Gerçek Maven multi-module'e geçiş

**Bu bir US değil, projenin paket/modül yapısını kalıcı olarak değiştiren bir mimari karardır.** İlk denemem (tek Maven modülü içinde `internal` alt paket kuralı + Spring Modulith'in `ApplicationModules.verify()` testiyle doğrulama) kullanıcı tarafından yetersiz bulundu: bu yaklaşım sınırı yalnızca bir *testin* koruduğu, hâlâ tek bir derleme birimidir — test silinir veya atlanırsa sınır sessizce delinebilir. Bunun yerine **gerçek Maven multi-module** yapısına geçildi: her modül ayrı `pom.xml`/jar; bir modül, bağımlılık olarak tanımlamadığı bir modülün sınıflarına **derleme hatası almadan** erişemez.

**Nihai yapı:**
```
dijital-ik-platformu/  (parent pom, packaging=pom)
├── core/    (BaseEntity, audit/, exception/GlobalExceptionHandler — hiçbir modüle bağımlı değil)
├── auth/    (User, AuthService, AuthController, ... — yalnızca core'a bağımlı)
└── app/     (DijitalIkPlatformuApplication, application.yml, spring-boot-maven-plugin — core+auth'a bağımlı, çalıştırılabilir jar'ı üretir)
```
**Kural (bundan sonra korunacak):** Yalnızca gerçek iş modülleri (`auth`, ileride `organization`, `leave`, `recruitment`, ...) birer Maven modülüdür ve yalnızca `core`'a bağımlı olmalıdır. `core`, `exception`, `audit` gibi ortak/platform yapıları kendi başlarına modül değildir — hepsi `core` modülünün içindedir. Yeni bir iş modülü eklerken: `<module-adı>/pom.xml` (core'a bağımlı) + `app/pom.xml`'e tek bir `<dependency>` satırı yeterlidir.

**Değişen/taşınan dosyalar:**
- Kök `pom.xml` → `packaging=pom` + `<modules>core, auth, app</modules>` (Spring Modulith bağımlılıkları kaldırıldı — artık gereksiz, Maven'in kendi jar sınırı daha güçlüsünü sağlıyor)
- `core/pom.xml` (yeni) — `com.digitalik.core.*` (BaseEntity, JpaAuditingConfig, `audit/`, `exception/GlobalExceptionHandler`) + ilgili testler + `V1__create_audit_log.sql`
- `auth/pom.xml` (yeni) — `com.digitalik.auth.*` (User, AuthService, AuthController, AuthExceptionHandler, ... — `internal` alt paketi düzleştirildi, artık gerek yok) + `AuthControllerTest` + `V2__create_users.sql`, `V3__seed_admin_user.sql`
- `app/pom.xml` (yeni) — `DijitalIkPlatformuApplication`, `application.yml`, `DijitalIkPlatformuApplicationTests`, spring-boot-maven-plugin (`mainClass` açıkça belirtildi)
- `core/src/test/java/.../CoreTestApplication.java`, `auth/src/test/java/.../AuthTestApplication.java` (yeni) — her modülün `app` modülüne ihtiyaç duymadan tek başına test edilebilmesi için minimal `@SpringBootApplication` başlangıç sınıfları
- `Dockerfile` — çok modüllü build'i yansıtacak şekilde güncellendi (tüm `pom.xml`'ler önce, sonra `core/auth/app` kaynak kodları; nihai jar `app/target/*.jar`'dan alınır)
- `docs/02-solution-architecture.md` — ADR-002 ve ilgili bölümler Spring Modulith yerine gerçek Maven multi-module'ü yansıtacak şekilde güncellendi
- Kaldırılanlar: `src/test/java/com/digitalik/ModularityTests.java` (Spring Modulith doğrulama testi, artık gereksiz)

**Teknik not (AuthTestApplication):** `@SpringBootApplication(scanBasePackages=...)` yalnızca `@Component`/`@Configuration` taramasını genişletir; JPA entity/repository taraması ayrı bir mekanizmadır ve bunu otomatik takip etmez — bu yüzden `AuthTestApplication`'a ayrıca `@EntityScan`/`@EnableJpaRepositories(basePackages = {"com.digitalik.auth", "com.digitalik.core"})` eklendi (testler önce `NoSuchBeanDefinitionException` ile bunu yakaladı).

**Canlı doğrulama:** `mvn test` → core (6 test), auth (3 test), app (1 test), toplam 10, hepsi yeşil. `docker compose up --build -d` ile (Dockerfile güncellemesi dahil) tam yığın yeniden derlendi; hem mevcut hem **sıfırdan silinen** (`docker compose down -v`) veritabanı hacmiyle test edildi — her ikisinde de `core`'un V1 ve `auth`'un V2/V3 migration'ları doğru sırada uygulandı ("Migrating schema... 1 - create audit log" → "2 - create users" → "3 - seed admin user"), gerçek giriş uçtan uca çalıştı (200, `{"userId":1,"email":"admin@dijitalik.local"}`), sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test                        # tüm reactor: core, auth, bootstrap
mvn -pl core test               # yalnızca core modülünü test et
mvn -pl auth test               # yalnızca auth modülünü test et
docker compose up --build -d    # tam yığın (postgres+backend+frontend)
```

---

## Yapısal karar (düzeltme) — `app` → `bootstrap` yeniden adlandırma + modül içi katman paketleme

**Yukarıdaki "Yapısal karar" bölümünün küçük bir düzeltmesi.** Kullanıcı iki geri bildirimde bulundu:

1. **"`app` diye bir modüle gerek yok, ana sınıf ana projede olmalı."** Bunu denedim: kök `pom.xml`'i hem aggregator (`<modules>`) hem de `packaging=jar` yapmaya çalıştım — Maven bunu **sert bir kuralla reddetti**: "Aggregator projects require 'pom' as packaging." Yani kök proje aynı anda hem tüm modülleri toplayan aggregator hem de kod içeren çalıştırılabilir bir jar olamaz. Kullanıcıya bu kısıtı açıkladım; ince bir çalıştırma modülünü korumayı ama "app" yerine anlamlı bir isim (**`bootstrap`**) vermeyi seçti. `app/` → `bootstrap/` olarak yeniden adlandırıldı (`DijitalIkPlatformuApplication`, `application.yml`, spring-boot-maven-plugin); `Dockerfile` ve `core/pom.xml`'deki bir yorum buna göre güncellendi.

2. **"Modüllerin içi de doğru paketlenmeli — entity'ler entity paketinde, repository'ler repository paketinde olmalı."** `core` ve `auth` modülleri düz (feature-flat) paketlemeden **katman bazlı** paketlemeye geçirildi:

```
core/src/main/java/com/digitalik/core/
├── entity/      (BaseEntity, AuditLogEntry, AuditOperation)
├── repository/  (AuditLogRepository)
├── config/      (JpaAuditingConfig)
├── listener/    (AuditLogEntityListener, AuditLogContextHolder)
└── exception/   (GlobalExceptionHandler)

auth/src/main/java/com/digitalik/auth/
├── entity/      (User)
├── repository/  (UserRepository)
├── service/     (AuthService)
├── controller/  (AuthController)
├── dto/         (LoginRequest, LoginResponse)
├── exception/   (InvalidCredentialsException, AuthExceptionHandler)
└── config/      (PasswordEncoderConfig)
```

Test kaynakları da aynı katman kuralını izleyecek şekilde taşındı (ör. `SampleEntity` → `core` testinde `entity/`, `SampleEntityRepository` → `repository/`, `ThrowingTestController`/`AuthControllerTest` → `controller/`); bunun için önceden package-private olan bazı test fixture sınıfları (`SampleEntity`, `SampleEntityRepository`, `ThrowingTestController`) `public` yapıldı, çünkü artık farklı paketlerden referans ediliyorlar.

**Bundan sonra korunacak kural (güncellendi):** Yeni bir iş modülü eklerken, o modülün içi de bu katman yapısını (`entity/`, `repository/`, `service/`, `controller/`, `dto/`, `exception/`, gerekirse `config/`) izlemelidir.

**Doğrulama:** `mvn test` → core (6), auth (3), bootstrap (1) = 10 test, hepsi yeşil.

---

## US-02.1.3 — Oturum/token ve çıkış

**Özet:** Giriş sonrası bir oturum (`Session`) oluşturuluyor; `GET /api/auth/session` token'ı doğrulayıp oturum bilgisini döner, `POST /api/auth/logout` oturumu geçersiz kılar (soft-invalidate, `revokedAt`).

**Tasarım kararları:**
- Token, `SecureRandom` ile üretilen 256 bit'lik URL-safe Base64 bir opak string (JWT değil — henüz stateless doğrulama ihtiyacı yok, DB'de saklanan bir oturum kaydı bu aşama için yeterli ve daha basit).
- Süre (TTL) `app.session.ttl-minutes` ile yapılandırılabilir (varsayılan 30 dk), `bootstrap/application.yml`'de açıkça tanımlı.
- Çıkış, fiziksel silme değil `revokedAt` ile "soft-invalidate" — hem geçmiş oturumların izini korur hem de `BaseEntity`'nin `@PostUpdate` audit mekanizmasıyla uyumlu çalışır (silme audit_log'a yansımıyor, güncelleme yansıyor).
- `GET /session` ve `POST /logout`, henüz genel bir kimlik doğrulama filtresi/interceptor'ı olmadığı için `Authorization: Bearer <token>` başlığını kendileri okuyup doğruluyor — tüm uç noktaları koruma altına alma (US-02.2.3) ayrı bir story.

**Değişen/eklenen dosyalar:**
- `auth/src/main/java/com/digitalik/auth/entity/Session.java` — `BaseEntity`'den türer; token, userId, expiresAt, revokedAt
- `auth/src/main/java/com/digitalik/auth/repository/SessionRepository.java`
- `auth/src/main/java/com/digitalik/auth/service/SessionService.java` — token üretimi, doğrulama, geçersiz kılma
- `auth/src/main/java/com/digitalik/auth/service/AuthService.java` — `login` artık oturum oluşturuyor; `getSession`/`logout` eklendi
- `auth/src/main/java/com/digitalik/auth/controller/AuthController.java` — `GET /session`, `POST /logout` eklendi
- `auth/src/main/java/com/digitalik/auth/dto/LoginResponse.java` — `token`, `expiresAt` alanları eklendi; `SessionResponse.java` (yeni)
- `auth/src/main/java/com/digitalik/auth/exception/InvalidSessionException.java` (yeni)
- `auth/src/main/resources/db/migration/V4__create_sessions.sql` — `sessions` tablosu
- `bootstrap/src/main/resources/application.yml` — `app.session.ttl-minutes: 30`
- `auth/src/test/java/com/digitalik/auth/controller/AuthControllerTest.java` — geçerli/geçersiz/süresi dolmuş token ve çıkış sonrası geçersizlik senaryoları eklendi (8 test)

**Kritik hata — canlıda bulundu ve düzeltildi:** `mvn test` tamamen yeşildi ama Docker Compose ile gerçek ortamda `logout` sonrası `session` sorgusu (ve hatta yanlış parolayla giriş) beklenen 401 yerine **500** dönüyordu. Kök neden: Spring, eşit önceliğe (`@Order` verilmemiş, ikisi de varsayılan `LOWEST_PRECEDENCE`) sahip birden fazla `@RestControllerAdvice` arasında seçimi *tarama/kayıt sırasına* göre yapıyor — bir advice eşleşme bulduğunda diğerlerine bakmıyor. Tek modüllü/flat classpath'te (Maven reactor test ortamı) `auth`'un advice'ı `core`'unkinden önce taranıyordu (testler bu yüzden hep yeşildi); ama gerçek paketlenmiş uygulamada (`core`/`auth` `BOOT-INF/lib/` altında ayrı nested jar'lar) sıra tersine döndü ve platform geneli `GlobalExceptionHandler`'ın genel `Exception.class` yakalayıcısı, modül-özel `AuthExceptionHandler`'ın 401 eşlemelerinin ÖNÜNE geçti — tüm modül-özel istisnalar sessizce 500'e düşüyordu. **Ders:** Bu sınıfta bir hata sınıfı var — paketlenmiş (nested-jar) çalışma zamanı davranışı, Maven reactor test classpath'inden (flat) farklı olabiliyor; `mvn test` yeşil olması tek başına yeterli kanıt değil, Docker uçtan uca doğrulama (zaten bu projede uygulanan pratik) bu tür sınıfları yakalamak için gerekli.

**Düzeltme:** `AuthExceptionHandler`'a `@Order(Ordered.HIGHEST_PRECEDENCE)`, `GlobalExceptionHandler`'a açıkça `@Order(Ordered.LOWEST_PRECEDENCE)` eklendi (ikisi de değer olarak varsayılanla aynı olsa bile artık açık ve deterministik). Her iki sınıfın javadoc'una, bundan sonra eklenecek her modül-özel `@RestControllerAdvice`'ın da `@Order(HIGHEST_PRECEDENCE)` taşıması gerektiği not edildi.

**Ayrıca düzeltildi:** `GlobalExceptionHandler.handleUnexpected` daha önce beklenmeyen hataları hiç loglamıyordu (sessizce yutuyordu) — bu, hatanın teşhisini zorlaştırdı. Artık `log.error("Beklenmeyen hata", ex)` ile loglanıyor.

**Canlı doğrulama (düzeltme sonrası):** `docker compose up --build -d` ile sırayla: yanlış parola → 401 "Kimlik doğrulama başarısız"; doğru giriş → 200 + token; geçerli token ile `/session` → 200; `/logout` → 204; `/logout` sonrası `/session` → 401 "Oturum geçersiz". Hepsi doğru, sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (6), auth (8), bootstrap (1) = 15 test, 0 hata
```

---

## US-02.1.4 — Başarısız girişlerde hesap kilitleme

**Özet:** Art arda 5 başarısız giriş denemesinden sonra hesap 15 dakikalığına kilitleniyor (ikisi de yapılandırılabilir); kilitliyken doğru parola bile reddediliyor; başarılı bir giriş sayaci sıfırlıyor.

**Değişen/eklenen dosyalar:**
- `auth/src/main/java/com/digitalik/auth/entity/User.java` — `failedLoginAttempts`, `lockedUntil` alanları + `isLocked()`/`incrementFailedAttempts()`/`lock()`/`resetLockout()`
- `auth/src/main/java/com/digitalik/auth/service/LoginAttemptService.java` (yeni) — kilitleme politikası: `assertNotLocked`, `recordFailure`, `recordSuccess`
- `auth/src/main/java/com/digitalik/auth/service/AuthService.java` — `login` akışına kilit kontrolü ve başarısız/başarılı deneme kaydı eklendi
- `auth/src/main/java/com/digitalik/auth/exception/AccountLockedException.java` (yeni) — `InvalidCredentialsException`'ın aksine bilinçli olarak bilgilendirici (ne zaman açılacağını söyler)
- `auth/src/main/java/com/digitalik/auth/exception/AuthExceptionHandler.java` — `AccountLockedException` → 423 Locked eşlemesi (`lockedUntil` alanıyla)
- `auth/src/main/resources/db/migration/V5__add_account_lockout_fields.sql` — `users` tablosuna `failed_login_attempts`, `locked_until` kolonları
- `bootstrap/src/main/resources/application.yml` — `app.security.max-failed-attempts: 5`, `app.security.lockout-duration-minutes: 15`
- `auth/src/test/java/com/digitalik/auth/controller/AuthControllerTest.java` — kilitlenme, kilitliyken doğru parolayla da giriş yapılamaması, başarılı girişin sayacı sıfırlaması senaryoları (3 yeni test, toplam 11)

**Tasarım notu:** Kilitlenmeye neden olan TAM O denemede kullanıcıya `InvalidCredentialsException` yerine doğrudan `AccountLockedException` dönülüyor (yani "hesabınız artık kilitlendi" bilgisi anında veriliyor, bir sonraki denemeye kadar beklenmiyor) — `AuthService.login` bunu `recordFailure` sonrası `assertNotLocked`'ı tekrar çağırarak sağlıyor.

**Canlı doğrulama:** `docker compose up --build -d` (temiz veri hacmiyle) → V5 migration'ı diğer dördünün üzerine sırayla uygulandı. 5 art arda yanlış parola denemesi: ilk 4'ü 401, 5.'si 423 "Hesap kilitli" (+ `lockedUntil` alanı) döndü; kilitliyken DOĞRU parolayla deneme de 423 döndü. Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (6), auth (11), bootstrap (1) = 18 test, 0 hata
```

---

## US-02.2.1 — Başlangıç rollerini tanımlama

**Özet:** `Role` varlığı ve dört başlangıç rolü (ADMIN, IK, YONETICI, CALISAN) Flyway seed migration'ı ile uygulama başlarken hazır geliyor.

**Değişen/eklenen dosyalar:**
- `auth/src/main/java/com/digitalik/auth/entity/Role.java` — `BaseEntity`'den türer; `code` alanı + rol kodları için statik sabitler (`Role.ADMIN` vb., US-02.2.2'de magic string yerine kullanılacak)
- `auth/src/main/java/com/digitalik/auth/repository/RoleRepository.java` — `findByCode`
- `auth/src/main/resources/db/migration/V6__create_roles.sql` — `roles` tablosu + 4 rolün seed INSERT'i
- `auth/src/test/java/com/digitalik/auth/repository/RoleRepositoryTest.java` (yeni `repository` test paketi) — `Role` eşlemesinin/`findByCode`'un doğruluğunu test eder

**Test kapsamı notu:** V6'daki asıl seed satırları (4 rol) test ortamında doğrulanmadı — Flyway, testlerde `src/test/resources/application.yml` ile devre dışı (H2 + `ddl-auto=create-drop` kullanılıyor, V2'deki admin kullanıcı seed'i için de aynı durum geçerliydi). Bu nedenle `RoleRepositoryTest` yalnızca entity/repository eşlemesini test eder; seed data'nın varlığı canlı Docker doğrulamasında kontrol edildi (aşağıya bkz.) — bu proje boyunca izlenen tutarlı bir desen.

**Canlı doğrulama:** `docker compose up --build -d` (temiz veri hacmiyle) → log'da "Migrating schema... 6 - create roles" görüldü; `psql` ile `roles` tablosu sorgulandı, 4 satır da (`ADMIN, IK, YONETICI, CALISAN`) doğru şekilde mevcuttu. Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (6), auth (12), bootstrap (1) = 19 test, 0 hata
```

---

## US-02.2.2 — Kullanıcıya rol atama/kaldırma

**Özet:** `POST /api/auth/users/{userId}/roles`, `DELETE /api/auth/users/{userId}/roles/{roleCode}` ve `GET /api/auth/users/{userId}/roles` ile bir kullanıcıya rol atanıp kaldırılabiliyor.

**Tasarım kararları:**
- `UserRole` (`user_roles` tablosu), `Session` ile aynı gerekçeyle fiziksel silme yerine `revokedAt` ile "soft-invalidate" kullanıyor — rol geçmişi korunur, kaldırma işlemi audit_log'a (UPDATE) yansır.
- Aynı rol tekrar atanırsa (zaten aktifse) yeni kayıt oluşturulmaz (idempotent); atanmamış bir rolü kaldırma isteği de no-op'tur (idempotent DELETE, REST konvansiyonuna uygun).
- Roller herhangi bir token/session'a gömülmüyor — her istek DB'den taze okunuyor, bu yüzden "değişiklik bir sonraki istekte etkilidir" kabul kriteri ek bir önbellek geçersiz kılma adımı gerektirmeden otomatik sağlanıyor.
- Bootstrap admin kullanıcısına (V3) ADMIN rolü otomatik atandı (V8) — mantıksal olarak zaten öyle olması gerekiyordu.
- Bu uç noktalar şimdilik korumasız (US-02.2.3, genel erişim kısıtlaması, henüz yapılmadı).

**Değişen/eklenen dosyalar:**
- `auth/src/main/java/com/digitalik/auth/entity/UserRole.java`, `repository/UserRoleRepository.java`
- `auth/src/main/java/com/digitalik/auth/service/UserRoleService.java` — atama/kaldırma/listeleme, kullanıcı/rol yokluğu kontrolü
- `auth/src/main/java/com/digitalik/auth/controller/UserRoleController.java` — `GET`/`POST`/`DELETE /api/auth/users/{userId}/roles(...)`
- `auth/src/main/java/com/digitalik/auth/dto/AssignRoleRequest.java`, `RoleResponse.java`
- `auth/src/main/java/com/digitalik/auth/exception/UserNotFoundException.java`, `RoleNotFoundException.java` — `AuthExceptionHandler`'a 404 eşlemeleri eklendi
- `auth/src/main/resources/db/migration/V7__create_user_roles.sql`, `V8__assign_admin_role_to_seed_user.sql`
- `auth/src/test/java/com/digitalik/auth/controller/UserRoleControllerTest.java` (yeni, 6 test)

**Canlı doğrulama:** `docker compose up --build -d` (temiz veri hacmiyle) → V7/V8 sırayla uygulandı; `GET /api/auth/users/1/roles` bootstrap admin için otomatik `[{"code":"ADMIN"}]` döndü; yeni rol atama/kaldırma ve olmayan rol için 404 senaryoları uçtan uca doğrulandı. Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (6), auth (18), bootstrap (1) = 25 test, 0 hata
```

---

## US-02.2.3 — Yetkisiz erişimin engellenmesi + US-02.2.4 — Kendi profil bilgilerini görme

**Özet:** Uygulamaya gerçek bir kimlik doğrulama/yetkilendirme katmanı (Spring Security) eklendi: geçerli bir Bearer token'ı olmayan hiçbir istek (`/api/auth/login` hariç) artık işlenmiyor (401); rol atama/kaldırma yalnızca ADMIN rolüne sahip kullanıcılara açık (403 diğerlerine). Ayrıca giriş yapan kullanıcının kendi profilini (ad, e-posta, roller) görebileceği `GET /api/auth/me` eklendi.

**Tasarım kararları:**
- Bu ana kadar token doğrulaması her controller metodunda elle (`Authorization` başlığını ayrıştırarak) yapılıyordu — bu hem tekrar edici hem de "genel erişim kısıtlaması" (US-02.2.3) gibi bir kesişen ilgiyi (cross-cutting concern) merkezi yönetmiyordu. Bu yüzden `spring-boot-starter-security` tanıtıldı — bilinçli olarak yalnızca `auth` modülünün `pom.xml`'ine eklendi, `core`'a eklenmedi; aksi halde `core`'un kendi (`@WebMvcTest` gibi) testleri istemsizce Spring Security'nin varsayılan davranışının arkasına düşerdi.
- Var olan token/session mekanizması (opak, DB'de saklanan `Session.token`) korundu — Spring Security'nin kendi `UserDetailsService`/form-login akışına GEÇİLMEDİ. Bunun yerine özel bir `TokenAuthenticationFilter` (`OncePerRequestFilter`) yazıldı: `Authorization: Bearer <token>` başlığını okur, `SessionService.validate` ile doğrular, kullanıcının güncel rollerini DB'den okuyup `AuthenticatedUser` (özel principal `record`) + `ROLE_*` yetkileriyle `SecurityContextHolder`'a yazar. Token geçersiz/süresi dolmuş/yoksa istek anonim olarak devam eder — reddetme kararı filtrede değil, `SecurityConfig`'in `authorizeHttpRequests` kuralında (`anyRequest().authenticated()`) veriliyor; bu da 401 mesajının tek bir yerden (custom `AuthenticationEntryPoint`) tutarlı `ProblemDetail` olarak dönmesini sağlıyor.
- `AuthController`'daki elle `extractToken`/`BEARER_PREFIX` mantığı tamamen kaldırıldı; `/session`, `/logout`, `/me` artık `@AuthenticationPrincipal AuthenticatedUser principal` ile doğrudan doğrulanmış kullanıcıyı alıyor.
- Rol atama/kaldırma (`UserRoleController.assignRole`/`removeRole`) `@PreAuthorize("hasRole('ADMIN')")` ile korundu (`@EnableMethodSecurity`). Listeleme (`GET`) şimdilik yalnızca "kimlik doğrulanmış olma" gerektiriyor — "yalnızca kendi rollerini görme" gibi daha ince bir kısıtlama, ihtiyaç netleşmeden eklenmedi (YAGNI).
- **Beklenmeyen davranış / öğrenilen ders:** `@PreAuthorize` reddi (`AuthorizationDeniedException`) bir controller metodu ÇAĞRISI SIRASINDA (AOP proxy içinde) fırlatılıyor; bu, `SecurityConfig`'teki özel `AccessDeniedHandler`'a hiç ulaşmıyor — çünkü DispatcherServlet, handler çağrısı sırasında oluşan istisnaları kendi `HandlerExceptionResolver` zinciriyle (yani `@RestControllerAdvice`'lar üzerinden) çözüyor ve çözülen istisna filtre zincirine (dolayısıyla Security'nin `ExceptionTranslationFilter`'ına) hiç geri dönmüyor. İlk denemede bu istisna `core`'un genel `Exception.class` yakalayıcısına düşüp yanlışlıkla 500 dönüyordu. Çözüm: `AuthExceptionHandler`'a (zaten `@Order(HIGHEST_PRECEDENCE)` olan, yalnızca bu modülün controller'larına uygulanan advice) `AuthorizationDeniedException` → 403 eşlemesi eklendi. `AccessDeniedHandler` sadece filtre zincirinde (handler'a ulaşmadan önce) reddedilen isteklerde devreye giriyor artık.
- `User` varlığına profilde gösterilecek `fullName` alanı eklendi (V9 migration'ı); bootstrap admin kullanıcısına "Sistem Yöneticisi" değeri seed edildi.

**Değişen/eklenen dosyalar:**
- `auth/pom.xml` — `spring-security-crypto` yerine `spring-boot-starter-security`
- `auth/src/main/java/com/digitalik/auth/security/AuthenticatedUser.java` (yeni) — principal `record`
- `auth/src/main/java/com/digitalik/auth/security/TokenAuthenticationFilter.java` (yeni)
- `auth/src/main/java/com/digitalik/auth/security/SecurityConfig.java` (yeni) — `SecurityFilterChain`, özel 401/403 `ProblemDetail` handler'ları, `/api/auth/login` `permitAll`, geri kalan her şey `authenticated()`
- `auth/src/main/java/com/digitalik/auth/entity/User.java` — `fullName` alanı + `fullName` parametreli ek constructor
- `auth/src/main/resources/db/migration/V9__add_full_name_to_users.sql`
- `auth/src/main/java/com/digitalik/auth/dto/ProfileResponse.java` (yeni)
- `auth/src/main/java/com/digitalik/auth/service/AuthService.java` — `UserRoleService` bağımlılığı + `getProfile(Long userId)`
- `auth/src/main/java/com/digitalik/auth/controller/AuthController.java` — elle token ayrıştırma kaldırıldı, `@AuthenticationPrincipal` kullanımına geçildi, yeni `GET /me`
- `auth/src/main/java/com/digitalik/auth/controller/UserRoleController.java` — `assignRole`/`removeRole`'a `@PreAuthorize("hasRole('ADMIN')")`
- `auth/src/main/java/com/digitalik/auth/exception/AuthExceptionHandler.java` — `AuthorizationDeniedException` → 403 eşlemesi
- `auth/src/test/java/com/digitalik/auth/controller/AuthControllerTest.java` — `gecersizTokenIleOturumSorgulananamaz` testindeki başlık beklentisi yeni merkezi 401 mesajına ("Kimlik doğrulama gerekli") güncellendi; `/me` için 2 yeni test (profil görüntüleme, tokensız 401)
- `auth/src/test/java/com/digitalik/auth/controller/UserRoleControllerTest.java` — tüm testler artık geçerli bir ADMIN token'ı gönderiyor (yeni `adminTokenIleGirisYap()` yardımcı metodu: ADMIN rolüyle kullanıcı oluşturup giriş yapar); tokensız istek için 401 ve ADMIN olmayan kullanıcı için 403 senaryolarını kapsayan 2 yeni test

**Canlı doğrulama:** `docker compose down -v && docker compose up --build -d` → V9 migration'ı diğer sekizinin üzerine uygulandı. `POST /api/auth/login` hâlâ açık; token olmadan `GET /api/auth/me` → 401; admin token'ıyla `GET /api/auth/me` → `{"userId":1,"email":"admin@dijitalik.local","fullName":"Sistem Yöneticisi","roles":["ADMIN"]}`; token olmadan ve geçersiz token ile rol listeleme/atama → 401; ADMIN rolüyle rol atama → 204 (ardından `GET .../roles` güncellenmiş listeyi döndürdü); veritabanına doğrudan eklenen, rolü olmayan bir test kullanıcısının token'ıyla rol atama denemesi → 403 `{"title":"Erişim reddedildi", ...}`, aynı kullanıcı kendi `/me` profilini sorunsuz görebildi. Test verisi temizlendi, sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (6), auth (22), bootstrap (1) = 29 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

## US-03.1.1 — Organizasyon birimi hiyerarşisi

**Özet:** `POST /api/organization/units` ile Şirket/İşyeri/Bölüm gibi organizasyon birimleri oluşturuluyor; her birim isteğe bağlı bir üst birime (`parentId`) bağlanarak ağaç yapısı kuruluyor. `GET /api/organization/units` tüm birimleri düz liste (id + parentId) olarak döndürüyor.

**Tasarım kararları:**
- Bu, projedeki ilk **gerçek iş modülü**dür (Bölüm 2'deki `auth`'tan sonra) — bu yüzden kurulan Maven çok-modül mimarisi (bkz. `docs/02-solution-architecture.md` ADR-002) ilk kez "yeni bir modül eklendiğinde ne olur" sorusuna cevap verdi: yeni `organization/pom.xml` (yalnızca `core`'a bağımlı), kök `pom.xml`'e bir `<module>` satırı, `bootstrap/pom.xml`'e bir `<dependency>` satırı, ve `Dockerfile`'a modülün `pom.xml`/`src`'ini kopyalayan iki satır. Kod tarafında hiçbir mevcut dosya değişmedi — mimarinin amaçlandığı gibi çalıştığı doğrulandı.
- `OrganizationUnit.parentId`, projedeki diğer ilişkiler (`Session.userId`, `UserRole.roleId` vb.) ile aynı konvansiyonla düz bir `Long` — JPA `@ManyToOne` kullanılmadı.
- Şirket/İşyeri/Bölüm arasında **tip ayrımı bilinçli olarak eklenmedi**: kabul kriteri yalnızca "bir birim başka bir birimin altına eklenebilir" (genel ağaç yapısı) istiyor; "Bölüm yalnızca İşyeri altına eklenebilir" gibi tip bazlı kurallar ihtiyaç netleşmeden eklenmedi (YAGNI, roadmap Bölüm 3.3'teki gibi). Bir sonraki story olan US-03.1.2 (Görev/Unvan listesi) bu birimlerden bağımsız ayrı bir referans listesi olduğundan bu kararı etkilemiyor.
- Bu uçlara özel bir rol kısıtlaması (`@PreAuthorize`) eklenmedi — roadmap'te bu story'nin bağımlılığı US-02.2.2 (rol atama), US-02.2.3 (yetkisiz erişimin engellenmesi) değil; dolayısıyla yalnızca `auth.security.SecurityConfig`'teki platform geneli "her istek kimlik doğrulaması gerektirir" kuralı geçerli. Bu kural modül-bağımsız (SecurityConfig tüm uygulamaya tek bir filtre zinciri olarak uygulanıyor) olduğundan `organization` modülünün kendi `pom.xml`'ine Spring Security eklenmesine gerek kalmadı — yalnızca Docker canlı doğrulamasıyla test edilebildi (organization modülünün kendi `mvn test`'i, `auth`'a bağımlı olmadığı için bu kısıtlamayı göremiyor; bu, projenin baştan beri izlediği "cross-cutting güvenlik kuralları yalnızca uçtan uca doğrulanır" deseniyle tutarlı).
- Geçersiz istek (boş `name`) için ayrı bir modül-özel istisna/handler yazılmadı — `IllegalArgumentException` zaten `core.GlobalExceptionHandler` tarafından 400 "Geçersiz istek" olarak eşleniyor; bu gerçekten platform geneli, hiçbir modüle özel olmayan bir kural.
- `OrganizationExceptionHandler` yine de `@Order(HIGHEST_PRECEDENCE)` taşıyor (US-02.2.3'teki canlı hatadan çıkarılan dersin her yeni modülde tekrarlanan zorunlu adımı).

**Değişen/eklenen dosyalar:**
- `pom.xml` — `<module>organization</module>`
- `bootstrap/pom.xml` — `organization` bağımlılığı
- `Dockerfile` — `organization/pom.xml` ve `organization/src` kopyalama adımları
- `organization/pom.xml` (yeni modül, yalnızca `core`'a bağımlı)
- `organization/src/main/java/com/digitalik/organization/entity/OrganizationUnit.java`
- `organization/src/main/java/com/digitalik/organization/repository/OrganizationUnitRepository.java`
- `organization/src/main/java/com/digitalik/organization/service/OrganizationUnitService.java`
- `organization/src/main/java/com/digitalik/organization/controller/OrganizationUnitController.java`
- `organization/src/main/java/com/digitalik/organization/dto/CreateOrganizationUnitRequest.java`, `OrganizationUnitResponse.java`
- `organization/src/main/java/com/digitalik/organization/exception/OrganizationUnitNotFoundException.java`, `OrganizationExceptionHandler.java`
- `organization/src/main/resources/db/migration/V10__create_organization_units.sql`
- `organization/src/test/java/com/digitalik/organization/OrganizationTestApplication.java` (yeni modül test bootstrap sınıfı, bkz. `auth.AuthTestApplication`)
- `organization/src/test/java/com/digitalik/organization/controller/OrganizationUnitControllerTest.java` (yeni, 4 test)

**Canlı doğrulama:** `docker compose down -v && docker compose up --build -d` (Dockerfile ilk denemede `organization/pom.xml` kopyalanmadığı için reactor hata verdi — düzeltildi) → V10 migration'ı diğer dokuzunun üzerine uygulandı. Token olmadan birim oluşturma → 401; admin token ile 3 seviyeli bir ağaç (Şirket → İşyeri → Bölüm) oluşturuldu ve `GET /api/organization/units` doğru `parentId` zincirini döndürdü; olmayan üst birime alt birim eklenemez → 404 "Birim bulunamadı"; boş isimli birim → 400 "Geçersiz istek". Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (6), auth (22), organization (4), bootstrap (1) = 33 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

## US-03.1.2 — Görev/Unvan referans listesi

**Özet:** `organization` modülüne, birimlerden bağımsız bir "Unvan" (Görev) referans listesi CRUD'u eklendi: `POST/GET/PUT/DELETE /api/organization/job-titles`.

**Tasarım kararları:**
- `JobTitle`, `OrganizationUnit`'e hiçbir referans içermez (kabul kriteri: "birimlerden bağımsız bir referans listesidir") — bu iki entity arasında kasıtlı olarak hiçbir ilişki kurulmadı.
- Yeni exception türü (`JobTitleNotFoundException`) için ayrı bir `@RestControllerAdvice` sınıfı AÇILMADI; mevcut `OrganizationExceptionHandler`'a yeni bir `@ExceptionHandler` metodu eklendi — çünkü `basePackageClasses = OrganizationUnitController.class`, o sınıfla AYNI PAKETTEKİ (`com.digitalik.organization.controller`) tüm controller'lara zaten uygulanıyor. Modül başına bir advice sınıfı yeterli; controller başına bir tane açmak gereksiz tekrar olurdu.
- Silme işlemi fiziksel `DELETE` (hard delete) — `Role`/`Session`/`UserRole`'daki "soft-invalidate" (`revokedAt`) deseni burada BİLİNÇLİ OLARAK uygulanmadı: o desen, geçmişin korunması gereken atama/oturum kayıtları için gerekliydi; burada silinen bir unvanın geçmişte "var olduğu" bilgisinin korunmasını gerektiren bir kabul kriteri yok ve henüz hiçbir çalışan kaydı bu unvanlara referans vermiyor (US-03.2.2 bekliyor). İhtiyaç ortaya çıkarsa (ör. bir unvana atanmış çalışan varken silme denemesi) o zaman ele alınacak (YAGNI).
- Ad benzersizliği (unique constraint) zorunlu kılınmadı — tıpkı `OrganizationUnit.name` gibi, kabul kriterinde bu yönde bir gereklilik yok.
- Rol kısıtlaması yine eklenmedi; gerekçe US-03.1.1'dekiyle aynı (bkz. bir önceki bölüm).

**Değişen/eklenen dosyalar:**
- `organization/src/main/java/com/digitalik/organization/entity/JobTitle.java`
- `organization/src/main/java/com/digitalik/organization/repository/JobTitleRepository.java`
- `organization/src/main/java/com/digitalik/organization/service/JobTitleService.java`
- `organization/src/main/java/com/digitalik/organization/controller/JobTitleController.java`
- `organization/src/main/java/com/digitalik/organization/dto/JobTitleRequest.java`, `JobTitleResponse.java`
- `organization/src/main/java/com/digitalik/organization/exception/JobTitleNotFoundException.java`
- `organization/src/main/java/com/digitalik/organization/exception/OrganizationExceptionHandler.java` — `JobTitleNotFoundException` → 404 eşlemesi eklendi
- `organization/src/main/resources/db/migration/V11__create_job_titles.sql`
- `organization/src/test/java/com/digitalik/organization/controller/JobTitleControllerTest.java` (yeni, 7 test)

**Canlı doğrulama:** `docker compose down -v && docker compose up --build -d` → V11 migration'ı diğer onunun üzerine uygulandı. Token olmadan oluşturma → 401; admin token ile iki unvan oluşturuldu, listelendi, biri güncellendi (PUT → 200, güncel ad), biri silindi (DELETE → 204, listeden düştü); olmayan id için güncelleme/silme → 404 "Unvan bulunamadı"; boş isim → 400 "Geçersiz istek". Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (6), auth (22), organization (11), bootstrap (1) = 40 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

## US-03.2.1 — Çalışan temel kaydı oluşturma

**Özet:** `POST /api/organization/employees` ile bir çalışan için temel bilgilerle (ad, soyad, TC Kimlik No, işe giriş tarihi, e-posta) kayıt oluşturuluyor. Zorunlu alanlar ve TC Kimlik No'nun resmi kontrol basamağı algoritması doğrulanıyor; aynı TC No ile ikinci kayıt engelleniyor.

**Tasarım kararları:**
- `Employee`, organizasyon birimi/unvan bilgisi TAŞIMAZ — kabul kriterine göre bu atama ayrı bir story'dir (US-03.2.2: "atama sonradan yapılabilir"). Roadmap'in dikey dilim/vertical-slice ilkesine uygun olarak yalnızca bu story'nin kabul kriterinde açıkça istenen alanlar eklendi.
- TC Kimlik No için gerçek resmi kontrol basamağı algoritması uygulandı (11 hane, ilk hane ≠ 0, 10. ve 11. hanelerin kontrol formülü) — bu, "format kontrolünden geçer" kabul kriterinin doğrudan gereği, spekülatif bir genelleme değil. Algoritma şimdilik `EmployeeService` içinde `private` bir metot; ikinci bir kullanım yeri çıkarsa (ör. başvuru/aday kaydı) ayrı bir sınıfa çıkarılabilir.
- TC No alanına DB seviyesinde `UNIQUE` kısıtı + servis seviyesinde açık kontrol eklendi (`DuplicateNationalIdException` → 409 Conflict) — aynı kimlikle iki çalışan kaydı, kabul kriterinde adı geçmese de veri bütünlüğü açısından önlenmesi gereken bariz bir hata senaryosu olduğundan eklendi.
- "İletişim" alanı olarak yalnızca `email` seçildi (telefon eklenmedi) — roadmap'in Feature 03.3'teki YAGNI notuyla tutarlı: ikinci bir somut ihtiyaç (ör. SMS bildirimi) çıkınca genişletilir.
- US-03.2.4'ün kabul kriteri ("çalışan oluşturma/güncelleme audit kaydına düşer") **ek kod gerektirmeden** karşılandı — `Employee`, `BaseEntity`'yi miras aldığından US-01.3.1'deki `AuditLogEntityListener` otomatik çalışıyor; Docker doğrulamasında `audit_log` tablosunda `entity_type='Employee', operation='CREATE'` kaydı görüldü (aşağıya bkz.).
- Bu uca da özel bir rol kısıtlaması eklenmedi; gerekçe US-03.1.1/03.1.2'dekiyle aynı (yalnızca platform geneli "kimlik doğrulaması gerekir" kuralı geçerli).

**Değişen/eklenen dosyalar:**
- `organization/src/main/java/com/digitalik/organization/entity/Employee.java`
- `organization/src/main/java/com/digitalik/organization/repository/EmployeeRepository.java`
- `organization/src/main/java/com/digitalik/organization/service/EmployeeService.java` — zorunlu alan + TC No format doğrulaması
- `organization/src/main/java/com/digitalik/organization/controller/EmployeeController.java`
- `organization/src/main/java/com/digitalik/organization/dto/CreateEmployeeRequest.java`, `EmployeeResponse.java`
- `organization/src/main/java/com/digitalik/organization/exception/DuplicateNationalIdException.java`
- `organization/src/main/java/com/digitalik/organization/exception/OrganizationExceptionHandler.java` — `DuplicateNationalIdException` → 409 eşlemesi eklendi
- `organization/src/main/resources/db/migration/V12__create_employees.sql`
- `organization/src/test/java/com/digitalik/organization/controller/EmployeeControllerTest.java` (yeni, 6 test)

**Canlı doğrulama:** `docker compose down -v && docker compose up --build -d` → V12 migration'ı diğer on birinin üzerine uygulandı. Token olmadan oluşturma → 401; geçerli bilgilerle (TC No `10000000146` — resmi algoritmayı geçen, yaygın kullanılan bir test formatı, gerçek bir kimliğe ait değil) kayıt → 201; geçersiz TC No (checksum hatası) → 400 "TC Kimlik No geçersiz."; aynı TC No ile ikinci kayıt → 409 "Çalışan zaten kayıtlı"; boş ad → 400. `psql` ile `audit_log` tablosunda `entity_type='Employee', operation='CREATE', entity_id=1` kaydı doğrulandı. Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (6), auth (22), organization (17), bootstrap (1) = 46 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

## US-03.2.2 — Çalışanı organizasyon birimine ve unvana atama

**Özet:** `PUT /api/organization/employees/{id}/assignment` ile bir çalışan bir organizasyon birimi + unvanla ilişkilendiriliyor; aynı uç nokta tekrar çağrılarak atama sonradan değiştirilebiliyor.

**Tasarım kararları:**
- `Employee.organizationUnitId`/`jobTitleId`, diğer düz yabancı anahtarlarla (bkz. `OrganizationUnit.parentId`) aynı konvansiyonu izler ve yalnızca GÜNCEL atamayı tutar — geçmiş DEĞİL. US-03.4.1'in kabul kriteri ("unvan/birim değişikliği geçmişini görme... eski atama kapatılır, yeni atama açılır") burada kasıtlı olarak kurulmadı; bu story'nin kabul kriteri ("atama sonradan değiştirilebilir") yalnızca üzerine yazma (overwrite) gerektiriyor. Geçmiş izleme ihtiyacı geldiğinde ayrı bir tablo olarak eklenecek (YAGNI) — mevcut `employees` şeması bunu engellemiyor.
- Atama; hem çalışanın hem birimin hem de unvanın var olduğu doğrulandıktan sonra yapılıyor (üç ayrı 404: "Çalışan bulunamadı", "Birim bulunamadı", "Unvan bulunamadı") — `OrganizationUnitRepository`/`JobTitleRepository` zaten aynı modülde olduğundan yeni bir bağımlılık gerekmedi.
- **Yan düzeltme:** `OrganizationUnitNotFoundException`'ın mesajı "Üst birim bulunamadı." idi (yalnızca US-03.1.1'in "olmayan üst birime alt birim ekleme" senaryosu için yazılmıştı); bu istisna şimdi `EmployeeService.assign`'de de (üst birim bağlamı olmadan) fırlatıldığından mesaj yanıltıcı hale geliyordu. Genel "Birim bulunamadı." olarak düzeltildi — hiçbir test bu `detail` metnini assert etmiyordu (yalnızca `title` kontrol ediliyordu), bu yüzden mevcut testler etkilenmedi.

**Değişen/eklenen dosyalar:**
- `organization/src/main/java/com/digitalik/organization/entity/Employee.java` — `organizationUnitId`, `jobTitleId`, `assign(...)` metodu
- `organization/src/main/java/com/digitalik/organization/service/EmployeeService.java` — `assign(...)` metodu (çalışan/birim/unvan varlık kontrolü)
- `organization/src/main/java/com/digitalik/organization/controller/EmployeeController.java` — `PUT /{id}/assignment`
- `organization/src/main/java/com/digitalik/organization/dto/AssignEmployeeRequest.java` (yeni), `EmployeeResponse.java` (`organizationUnitId`/`jobTitleId` eklendi)
- `organization/src/main/java/com/digitalik/organization/exception/EmployeeNotFoundException.java` (yeni)
- `organization/src/main/java/com/digitalik/organization/exception/OrganizationUnitNotFoundException.java` — mesaj düzeltmesi ("Üst birim bulunamadı." → "Birim bulunamadı.")
- `organization/src/main/java/com/digitalik/organization/exception/OrganizationExceptionHandler.java` — `EmployeeNotFoundException` → 404 eşlemesi eklendi
- `organization/src/main/resources/db/migration/V13__add_assignment_to_employees.sql`
- `organization/src/test/java/com/digitalik/organization/controller/EmployeeControllerTest.java` — 5 yeni test (atama, atama değişikliği, 3× 404)

**Canlı doğrulama:** `docker compose down -v && docker compose up --build -d` → V13 migration'ı diğer on ikisinin üzerine uygulandı. Bir çalışan bir birim+unvana atandı (`organizationUnitId`/`jobTitleId` cevapta doğru göründü); ikinci bir birim+unvan oluşturulup aynı çalışana tekrar atama yapıldığında atamanın değiştiği doğrulandı; olmayan çalışan/birim id'leriyle 404 senaryoları doğrulandı. Mesaj düzeltmesinden sonra `docker compose up --build -d` ile backend yeniden derlenip "Birim bulunamadı" mesajının artık doğru döndüğü ayrıca doğrulandı. Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (6), auth (22), organization (22), bootstrap (1) = 51 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

## US-03.2.3 — Çalışanları listeleme, filtreleme, sayfalama

**Özet:** `GET /api/organization/employees`, isteğe bağlı `name` (ad/soyad içinde arar), `organizationUnitId`, `jobTitleId` filtreleriyle ve standart `page`/`size`/`sort` parametreleriyle sayfalanmış çalışan listesi döndürüyor.

**Tasarım kararları:**
- Filtreler Spring Data JPA `Specification`larıyla (`EmployeeSpecifications`) uygulandı — her filtre parametresi verilmemişse `null` `Specification` döner, `Specification.where(...).and(...)` zinciri null'ları otomatik "kısıtlama yok" olarak ele alır (Spring Data'nın standart/belgelenmiş davranışı). Bu, N farklı filtre kombinasyonu için ayrı ayrı türetilmiş repository metodu (`findByFirstNameContainingAndOrganizationUnitId...` vb.) yazmaktan kaçınmanın standart yoludur — erken bir soyutlama değil, doğrudan "temel filtrelerle çalışır" kabul kriterinin gerektirdiği kombinasyon esnekliği.
- Sayfalama, controller metoduna `Pageable pageable` parametresi eklenerek Spring Boot'un otomatik `page`/`size`/`sort` query-param çözümlemesinden (zaten `spring-boot-starter-web` + `spring-data-jpa` ile hazır gelir) yararlanıldı; ek bir DTO/parametre ayrıştırma kodu yazılmadı. Varsayılan sayfa boyutu 20, varsayılan sıralama `id` (`@PageableDefault`) — sıralama belirtilmezse deterministik olmayan sayfalama sonucu almamak için.
- **Yan iyileştirme:** İlk denemede `Page<EmployeeResponse>` doğrudan controller'dan döndürüldüğünde Spring Data bir UYARI verdi: "Serializing PageImpl instances as-is is not supported... JSON yapısının kararlılığı garanti edilmez" ve framework'ün kendi önerdiği `PagedModel` (DTO) moduna geçilmesini tavsiye etti. Bu, spekülatif bir genelleme değil — framework'ün, zaten inşa ettiğimiz sayfalama özelliğinin doğru/stabil halini kurma tavsiyesiydi, bu yüzden uygulandı: `core/config/WebConfig.java` (yeni) → `@EnableSpringDataWebSupport(pageSerializationMode = VIA_DTO)`. Bu, `core`'a eklendi çünkü platform genelinde geçerli bir web-katmanı yapılandırmasıdır (tıpkı `JpaAuditingConfig` gibi). Sonuç JSON yapısı `{"content": [...], "page": {"size", "number", "totalElements", "totalPages"}}` şeklinde sabitlendi.
- Rol kısıtlaması yine eklenmedi (bu modüldeki diğer uçlarla tutarlı); yalnızca platform geneli "kimlik doğrulaması gerekir" kuralı geçerli.

**Değişen/eklenen dosyalar:**
- `organization/src/main/java/com/digitalik/organization/repository/EmployeeRepository.java` — `JpaSpecificationExecutor<Employee>` eklendi
- `organization/src/main/java/com/digitalik/organization/repository/EmployeeSpecifications.java` (yeni)
- `organization/src/main/java/com/digitalik/organization/service/EmployeeService.java` — `search(...)` metodu
- `organization/src/main/java/com/digitalik/organization/controller/EmployeeController.java` — `GET` (filtre + sayfalama)
- `core/src/main/java/com/digitalik/core/config/WebConfig.java` (yeni) — `PagedModel` (VIA_DTO) global yapılandırması
- `organization/src/test/java/com/digitalik/organization/controller/EmployeeControllerTest.java` — 4 yeni test (sayfalama, isim/birim/unvan filtreleri) + yardımcı metotların parametreli hale getirilmesi

**Canlı doğrulama:** `docker compose down -v && docker compose up --build -d` → yeni migration yok, mevcut 13 migration sorunsuz uygulandı. 3 çalışan oluşturuldu; `?size=2&page=0` → 2 kayıt + `page.totalElements=3, page.totalPages=2`; `?name=mehmet` → yalnızca eşleşen kayıt; birim/unvana atanan çalışan `?organizationUnitId=...` ve `?jobTitleId=...` ile doğru şekilde filtrelendi; token olmadan istek → 401. Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (6), auth (22), organization (26), bootstrap (1) = 55 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

## US-03.2.5 — Çalışan detayını görüntüleme ve temel bilgilerini güncelleme

**Özet:** `GET /api/organization/employees/{id}` çalışan detayını (güncelleme formunu doldurmak için) döndürüyor; `PUT /api/organization/employees/{id}` aynı temel bilgileri (ad-soyad, TC No, işe giriş tarihi, e-posta) günceller.

**Tasarım kararları:**
- `PUT` isteğinin gövdesi, US-03.2.1'in `CreateEmployeeRequest`'i ile birebir aynı alanlara sahip olduğundan AYRI bir `UpdateEmployeeRequest` DTO'su AÇILMADI — aynı kayıt tekrar kullanıldı. Bu, projede zaten `JobTitleRequest`'in hem oluşturma hem güncellemede kullanılmasıyla kurulmuş bir konvansiyon.
- Güncellemede de US-03.2.1'deki AYNI iş kuralları (zorunlu alan kontrolü, TC No format doğrulaması) uygulanıyor — `EmployeeService` içinde ortak doğrulama `assertBasicFieldsValid(...)` adıyla ayıklanıp `create`/`update` arasında paylaşıldı.
- TC No çakışma kontrolü güncellemede İNCE bir farkla ele alındı: `existsByNationalIdAndIdNot(nationalId, id)` — çalışanın KENDİ mevcut TC No'suyla (değişmeden) güncellenmesi yanlışlıkla "çakışma" sayılmamalı; yeni repository metodu bunu sağlıyor. Testte açıkça doğrulandı (`degismeyenTcNoIleGuncellemeCakismaSayilmaz`).
- "Kaydetme audit'e düşer" kabul kriteri, US-03.2.1'de olduğu gibi EK KOD GEREKMEDEN karşılandı — `Employee`, `BaseEntity`'yi miras aldığından güncelleme de `AuditLogEntityListener`'ın `@PostUpdate` callback'ini otomatik tetikliyor; Docker doğrulamasında `audit_log` tablosunda `entity_type='Employee', operation='UPDATE'` kaydı görüldü.
- Organizasyon birimi/unvan ataması (`organizationUnitId`/`jobTitleId`) bu güncelleme ucunun KAPSAMI DIŞINDA bırakıldı — o zaten ayrı `PUT .../assignment` ucuna (US-03.2.2) sahip; iki farklı kaygıyı (temel bilgiler vs. atama) aynı endpoint'te karıştırmamak için.

**Değişen/eklenen dosyalar:**
- `organization/src/main/java/com/digitalik/organization/entity/Employee.java` — `update(...)` metodu
- `organization/src/main/java/com/digitalik/organization/repository/EmployeeRepository.java` — `existsByNationalIdAndIdNot(...)`
- `organization/src/main/java/com/digitalik/organization/service/EmployeeService.java` — `getById(...)`, `update(...)`, ortak `assertBasicFieldsValid(...)`
- `organization/src/main/java/com/digitalik/organization/controller/EmployeeController.java` — `GET /{id}`, `PUT /{id}`
- `organization/src/test/java/com/digitalik/organization/controller/EmployeeControllerTest.java` — 7 yeni test (detay görüntüleme, güncelleme, kendi TC No'suyla çakışma sayılmaması, başka çalışanın TC No'suyla çakışma, geçersiz TC No, olmayan çalışan)

**Canlı doğrulama:** `docker compose down -v && docker compose up --build -d` → yeni migration yok. Token olmadan detay görüntüleme → 401; oluşturulan çalışanın detayı görüntülendi; olmayan id → 404; temel bilgiler güncellendi (ad, soyad, işe giriş tarihi, e-posta) ve cevapta doğru göründü; geçersiz TC No ile güncelleme → 400. `psql` ile `audit_log` tablosunda hem `CREATE` hem `UPDATE` kaydı (`entity_type='Employee'`) doğrulandı. Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (6), auth (22), organization (33), bootstrap (1) = 62 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

## US-03.2.6 — Çalışan self-servis: yalnızca kendi kaydını görüntüleme

**Özet:** `GET /api/organization/employees/{id}` artık kayıt bazlı yetkilendirmeye tabi: ADMIN/IK rolündeki kullanıcılar herhangi bir çalışanı görebilir; diğer roller (CALISAN, YONETICI, ...) yalnızca e-postası giriş yapan kullanıcının e-postasıyla eşleşen kaydı görebilir, aksi halde 403 döner. Bu, roadmap'in belirttiği gibi projedeki **alan/kayıt bazlı yetkinin ilk somut örneği**.

**Mimari sorun ve çözümü:** `organization` modülü yalnızca `core`'a bağımlı (bkz. US-03.1.1'deki mimari kural) — `auth` modülündeki `AuthenticatedUser` (giriş yapan kullanıcının userId/roller bilgisini taşıyan principal) türüne derleme zamanında erişemiyor. İki seçenek değerlendirildi: (a) `organization`'ı `auth`'a bağımlı yapmak — mimari kuralı bozar; (b) yalnızca jenerik Spring Security API'sini (`Authentication`/`GrantedAuthority`) kullanmak. (b) seçildi:
- `organization/pom.xml`'e **yalnızca** `spring-security-core` eklendi (auth'taki tam `spring-boot-starter-security` DEĞİL — bu modülün kendi test ortamında Spring Security'nin varsayılan davranışının arkasına istemsizce düşmemesi için, `auth`'un kendi pom'undaki aynı gerekçeyle).
- `auth.security.AuthenticatedUser`, `org.springframework.security.core.AuthenticatedPrincipal` arayüzünü uygulayacak şekilde genişletildi (`getName()` → e-posta döner). Bu, `Authentication.getName()`'in (hangi modülden çağrılırsa çağrılsın, `AbstractAuthenticationToken.getName()` principal `AuthenticatedPrincipal` ise onu kullanır) artık ham `record.toString()` yerine e-postayı dönmesini sağlıyor — `organization` modülü böylece `AuthenticatedUser` türünü hiç bilmeden, yalnızca `Authentication.getName()` ile kullanıcının e-postasına erişebiliyor.
- Yeni `organization/security/EmployeeAccessGuard` bean'i: `isSelf(Long employeeId, Authentication authentication)` — çalışanı bulur, e-postasını `authentication.getName()` ile karşılaştırır.
- `EmployeeController.getById`: `@PreAuthorize("hasAnyRole('ADMIN', 'IK') or @employeeAccessGuard.isSelf(#id, authentication)")` — `UserRoleController`'daki `hasRole(...)` deseniyle aynı (literal rol string'i, `Role.*` sabiti değil — `organization` bunlara da erişemiyor).

**Kimlik eşleştirmesi neden e-posta:** `Employee` ile `auth.User` arasında bugüne kadar hiçbir bağ yoktu (ne `userId` alanı ne de başka bir FK). Projede henüz bir "kullanıcı hesabı oluşturma" akışı/story'si de yok (yalnızca tek bir bootstrap admin var, V3 migration'ıyla seed edilmiş). Daha güçlü bir bağ (`Employee.userId` gibi düz bir FK, projedeki diğer ilişkilerle aynı konvansiyon) yeni bir migration + bu alanın NE ZAMAN/NASIL doldurulacağına dair henüz var olmayan bir akış gerektirirdi — bu story'nin kapsamının önemli ölçüde ötesine geçer. Bu yüzden geçici olarak `User.email == Employee.email` eşleşmesi kullanıldı (YAGNI); bu ikisi arasında bir tutarlılık garantisi yok, ama bu story'nin kabul kriterini karşılamak için yeterli. İkinci bir somut ihtiyaç (ör. e-posta değişebilirliğinin sorun yaratması, gerçek bir kullanıcı-provisioning akışı) çıktığında `Employee.userId` gibi daha güçlü bir bağa geçilir.

**Kapsam dışı bırakılan (bilinçli):** `GET /api/organization/employees` (US-03.2.3'teki liste/filtre ucu) bu story'de KISITLANMADI — kabul kriteri yalnızca "kendi temel bilgilerimi görüntülemek" (tekil kayıt/detay) diyor. Bu, CALISAN rolündeki bir kullanıcının, `/{id}` engellense de, liste ucundan (ör. isim filtresiyle) diğer çalışanların temel bilgilerine erişebileceği anlamına geliyor — bilinen, kayıtlı bir boşluk. Roadmap'in genel YAGNI ilkesiyle tutarlı olarak burada genişletilmedi; gerçek ihtiyaç (ör. bir sonraki self-servis story'si) netleştiğinde ele alınmalı.

**Değişen/eklenen dosyalar:**
- `organization/pom.xml` — `spring-security-core` (yalnızca core, starter değil) eklendi
- `auth/src/main/java/com/digitalik/auth/security/AuthenticatedUser.java` — `AuthenticatedPrincipal` uygulaması (`getName()` → email)
- `organization/src/main/java/com/digitalik/organization/security/EmployeeAccessGuard.java` (yeni)
- `organization/src/main/java/com/digitalik/organization/controller/EmployeeController.java` — `getById`'a `@PreAuthorize`
- `organization/src/main/java/com/digitalik/organization/exception/OrganizationExceptionHandler.java` — `AuthorizationDeniedException` → 403 eşlemesi (US-02.2.3'teki `@Order`/advice-sırası dersinin bu modülde de tekrarı — gerekli, aksi halde 500'e düşer)
- `organization/src/test/java/com/digitalik/organization/security/EmployeeAccessGuardTest.java` (yeni, 4 test) — yalnızca `isSelf`'in e-posta eşleştirme mantığını doğrudan doğrular; gerçek 403 uygulaması organization'ın kendi test ortamında doğrulanamıyor (bkz. US-03.1.1'deki aynı gerekçe — `organization`'ın izole testleri `auth`'a bağımlı olmadığından `@EnableMethodSecurity` orada etkin değil)

**Canlı doğrulama:** `docker compose down -v && docker compose up -d` (temiz veri hacmiyle) → mevcut 13 migration sorunsuz uygulandı (bu story yeni migration gerektirmedi). Admin token ile iki çalışan oluşturuldu (Selin id=1, Kaan id=2). `psql` ile doğrudan `users` tablosuna, e-postası Selin'in çalışan kaydıyla eşleşen bir test kullanıcısı eklendi (admin'le aynı bcrypt hash'i kopyalanarak, aynı şifreyle giriş yapılabilir hale getirildi — US-02.2.3'teki "veritabanına doğrudan eklenen test kullanıcısı" deseniyle tutarlı), admin token ile CALISAN rolü atandı. Sonuçlar: Selin (CALISAN) kendi kaydını (id=1) görüntüledi → 200; Kaan'ın kaydını (id=2) görüntülemeye çalıştı → 403 "Erişim reddedildi"; token olmadan istek → 401 (değişmedi); admin (ADMIN rolü) Kaan'ın kaydını görüntüledi → 200; Selin'e ayrıca IK rolü atanıp tekrar giriş yapıldığında Kaan'ın kaydını görüntüleyebildiği doğrulandı → 200. Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (6), auth (22), organization (37), bootstrap (1) = 66 test, 0 hata
docker compose down -v
docker compose up -d
docker compose down
```

---

## US-03.3.1 — Genişletilmiş özlük bilgileri (kimlik/adres/öğrenim/yabancı dil)

**Özet:** `Employee`'nin temel kaydından AYRI, isteğe bağlı bir "genişletilmiş özlük" formu eklendi: `PUT /api/organization/employees/{id}/profile` (yoksa oluşturur, varsa günceller — upsert) ve `GET /api/organization/employees/{id}/profile`. Kapsam, roadmap'in bu story için açıkça belirttiği dört kategoriyle sınırlı: kimlik (doğum tarihi/yeri, cinsiyet), adres (il/ilçe/açık adres), öğrenim (öğrenim durumu, okul, mezuniyet yılı), yabancı dil (dil, seviye). FR-401'in listelediği diğer kalemler (sertifika, iş deneyimi, adli sicil/askerlik/medeni durum, yakın bilgileri) roadmap'in US-03.3.1 satırında YOK — o yalnızca "ilham kaynağı" (bkz. doküman başı); dahil edilmedi.

**Tasarım kararları:**
- Yeni bir `EmployeeProfile` varlığı (1:1, `employeeId` düz yabancı anahtarıyla, DB'de `UNIQUE`) — `Employee`'ye alan eklemek yerine AYRI bir tablo tercih edildi, çünkü kabul kriteri açıkça "ayrı bir sekme/form" diyor ve bu, US-03.2.1'de kurulan "yalnızca o story'nin istediği alanlar" disiplinini korur (temel bilgiler ile genişletilmiş bilgiler karışmaz).
- Öğrenim/yabancı dil BİLİNÇLİ OLARAK çoklu-kayıt (liste) değil düz alanlar — kabul kriteri tek bir form/sekme tanımlıyor (çoğul değil). Bir kişinin birden fazla öğrenim/dil kaydı ihtiyacı netleşirse ayrı bir story'de ele alınacak (YAGNI, Feature 03.3'ün kendi YAGNI notuyla tutarlı).
- Tüm alanlar nullable — zorunlu alan yok; İK bu bilgileri kademeli doldurabilir (US-03.2.1'in ZORUNLU temel alanlarının aksine, kasıtlı bir fark).
- **Tek, idempotent `PUT` ucu** (ayrı `POST`/`PUT` değil) — "eklenir ve güncellenebilir" kabul kriterini, `EmployeeService.assign`'daki (US-03.2.2) aynı upsert deseniyle karşılıyor: kayıt yoksa oluşturulur, varsa güncellenir.
- `GET /{id}/profile`, US-03.2.6'da kurulan AYNI `EmployeeAccessGuard` ile korunuyor (ADMIN/IK ya da kaydın sahibi) — doğum tarihi/ev adresi gibi kişisel veri, `GET /{id}`'deki temel bilgilerden (TC No dahil) daha az hassas değil; az önce kurulan mekanizmayı burada UYGULAMAMAK tutarsız ve gereksiz bir güvenlik boşluğu olurdu. `PUT /{id}/profile` ise bilinçli olarak KISITLANMADI — mevcut `PUT /{id}` (temel bilgi güncelleme, US-03.2.5) ile aynı emsal korunuyor: bu modüldeki hiçbir yazma ucu şu ana kadar rol kısıtlaması taşımıyor, yalnızca okuma/self-view ucu (US-03.2.6'nın kendisi) kısıtlandı.
- `EmployeeProfile`, `BaseEntity`'den türediği için audit_log kaydı (CREATE/UPDATE) ek kod gerekmeden otomatik oluşuyor (US-03.2.1/03.2.5'teki aynı bedava kazanım) — Docker doğrulamasında `entity_type='EmployeeProfile'` için hem CREATE hem UPDATE satırı görüldü.

**Değişen/eklenen dosyalar:**
- `organization/src/main/resources/db/migration/V14__create_employee_profiles.sql`
- `organization/src/main/java/com/digitalik/organization/entity/EmployeeProfile.java`
- `organization/src/main/java/com/digitalik/organization/repository/EmployeeProfileRepository.java`
- `organization/src/main/java/com/digitalik/organization/service/EmployeeProfileService.java`
- `organization/src/main/java/com/digitalik/organization/dto/EmployeeProfileRequest.java`, `EmployeeProfileResponse.java`
- `organization/src/main/java/com/digitalik/organization/exception/EmployeeProfileNotFoundException.java`
- `organization/src/main/java/com/digitalik/organization/exception/OrganizationExceptionHandler.java` — `EmployeeProfileNotFoundException` → 404 eşlemesi
- `organization/src/main/java/com/digitalik/organization/controller/EmployeeController.java` — `PUT`/`GET /{id}/profile`
- `organization/src/test/java/com/digitalik/organization/controller/EmployeeControllerTest.java` — 4 yeni test (oluşturma+görüntüleme, upsert-güncelleme, olmayan çalışan → 404, henüz oluşturulmamış profil → 404)

**Canlı doğrulama:** `docker compose down -v && docker compose up --build -d` (temiz veri hacmiyle) → V14 migration'ı diğer on üçünün üzerine uygulandı. Admin token ile iki çalışan oluşturuldu; profil oluşturulmadan `GET /1/profile` → 404 "Özlük bilgisi bulunamadı"; `PUT /1/profile` → 200 (kayıt oluşturuldu); tekrar `PUT` farklı değerlerle → 200 (aynı kayıt güncellendi, ikinci satır oluşmadı); olmayan çalışana `PUT /999999/profile` → 404 "Çalışan bulunamadı". `psql` ile `audit_log`'da `EmployeeProfile` için CREATE+UPDATE satırları doğrulandı. Ayrıca US-03.2.6'daki test deseni tekrarlanarak: doğrudan DB'ye eklenen, CALISAN rolüne sahip ve e-postası bir çalışanla eşleşen test kullanıcısı kendi profilini görüntüledi → 200; başka bir çalışanın profilini görüntülemeye çalıştı → 403 "Erişim reddedildi". Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (6), auth (22), organization (41), bootstrap (1) = 70 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

## US-03.3.2 — Çalışana ait zimmet kayıtları (çoklu kalem, teslim/iade tarihi)

**Özet:** Yeni bir `EmployeeAsset` kaynağı ile bir çalışana birden fazla zimmet kalemi (dizüstü bilgisayar, telefon, ...) teslim edilip iade edilebiliyor: `POST /api/organization/employees/{employeeId}/assets` (teslim), `GET /api/organization/employees/{employeeId}/assets` (liste, en yeni teslim tarihi önce), `PUT /api/organization/employees/{employeeId}/assets/{assetId}/return` (iade).

**Tasarım kararları:**
- `EmployeeProfile`'ın (US-03.3.1, 1:1) AKSİNE `employeeId` burada UNIQUE DEĞİL — kabul kriteri açıkça "çoklu kayıt" istiyor.
- Fiziksel silme yok; iade, `returnedAt` alanının doldurulmasıyla (soft: kayıt kalır, yalnızca durumu değişir) temsil ediliyor — teslim/iade GEÇMİŞİNİN korunması kabul kriterinin ("teslim/iade tarihi izlenir") doğrudan gereği. `Role`/`Session`/`UserRole`'daki `revokedAt` deseniyle aynı fikir, farklı isimle (`returnedAt` alan adı olarak daha açıklayıcı).
- Basit iş kuralı doğrulamaları eklendi (kabul kriterinin ima ettiği, spekülatif olmayan sağlamlık kontrolleri): aynı kalem iki kez iade edilemez (400), iade tarihi teslim tarihinden önce olamaz (400). Bunlar TC No format kontrolü gibi diğer "bariz hatalı veri" kontrolleriyle aynı gerekçeyle eklendi.
- **Ayrı bir `EmployeeAssetController`'a çıkarıldı** — `EmployeeProfile`'ın (1:1, tek `PUT`/`GET` çifti) aksine burada liste + tekil iade işlemi olan, gerçek ÇOKLU-kayıt bir alt kaynak var; bu, aynı zamanda `EmployeeController`'ın (zaten 5 story'nin uçlarını taşıyan) daha fazla büyümesini önlüyor. `OrganizationExceptionHandler`'ın `basePackageClasses`'ı (`OrganizationUnitController` ile aynı PAKET) bu yeni controller'ı da otomatik kapsıyor, ek advice gerekmedi.
- Rol kısıtlaması (`EmployeeAccessGuard`) BİLİNÇLİ OLARAK eklenmedi — zimmet, US-03.3.1'deki kimlik/adres gibi kişisel/hassas veri değil, bir envanter kaydı; bu modüldeki çoğu yazma/listeleme ucuyla (temel bilgi oluşturma/güncelleme, atama) aynı emsal korundu.

**Değişen/eklenen dosyalar:**
- `organization/src/main/resources/db/migration/V15__create_employee_assets.sql`
- `organization/src/main/java/com/digitalik/organization/entity/EmployeeAsset.java`
- `organization/src/main/java/com/digitalik/organization/repository/EmployeeAssetRepository.java`
- `organization/src/main/java/com/digitalik/organization/service/EmployeeAssetService.java`
- `organization/src/main/java/com/digitalik/organization/dto/CreateEmployeeAssetRequest.java`, `ReturnEmployeeAssetRequest.java`, `EmployeeAssetResponse.java`
- `organization/src/main/java/com/digitalik/organization/exception/EmployeeAssetNotFoundException.java`
- `organization/src/main/java/com/digitalik/organization/exception/OrganizationExceptionHandler.java` — `EmployeeAssetNotFoundException` → 404 eşlemesi
- `organization/src/main/java/com/digitalik/organization/controller/EmployeeAssetController.java` (yeni)
- `organization/src/test/java/com/digitalik/organization/controller/EmployeeAssetControllerTest.java` (yeni, 8 test)

**Canlı doğrulama:** `docker compose down -v && docker compose up --build -d` (temiz veri hacmiyle) → V15 migration'ı diğer on dördünün üzerine uygulandı. Admin token ile bir çalışana iki zimmet kalemi (dizüstü bilgisayar, telefon) teslim edildi; liste iki kaydı da döndürdü; dizüstü bilgisayar iade edildi (`returnedAt` doldu) → 200; aynı kalem tekrar iade edilmeye çalışıldı → 400 "Bu zimmet kalemi zaten iade edilmiş"; olmayan zimmet id'sine iade → 404 "Zimmet kaydı bulunamadı"; olmayan çalışana teslim → 404 "Çalışan bulunamadı"; token olmadan istek → 401. `psql` ile `audit_log`'da iki `CREATE` + bir `UPDATE` (`entity_type='EmployeeAsset'`) kaydı doğrulandı. Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (6), auth (22), organization (49), bootstrap (1) = 78 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

## US-03.3.3 — Ücret/terfi geçmişi

**Özet:** Yeni bir `EmployeeSalaryRecord` kaynağı ile çalışanın ücret/terfi geçmişine kayıt eklenebiliyor: `POST /api/organization/employees/{employeeId}/salary-records` (yeni kayıt), `GET /api/organization/employees/{employeeId}/salary-records` (geçmiş, en yeni yürürlük tarihi önce). Her kayıt: tutar, yürürlük tarihi, isteğe bağlı bir sebep/açıklama (ör. "İşe giriş", "Terfi", "Yıllık zam").

**Tasarım kararları:**
- **Salt-ekleme (append-only), DEĞİŞMEZ kayıt** — kabul kriteri "yeni kayıt eskisini silmez" diyor; `EmployeeSalaryRecord`'da bilinçli olarak güncelleme/silme metodu YOK (ne entity'de ne serviste). Bu, `EmployeeAsset`'teki (US-03.3.2) "iade" gibi bir durum-değişikliği kavramından farklı — burada hiçbir kayıt hiçbir zaman değişmiyor.
- `amount` için `BigDecimal`/`NUMERIC(12,2)` — para tutarı için `float`/`double` kullanılmadı (yuvarlama hatası riski).
- Basit doğrulama: tutar sıfırdan büyük olmalı, yürürlük tarihi zorunlu — TC No/temel alan kontrolleriyle aynı gerekçe (bariz hatalı veriyi engelle).
- Yine ayrı bir `EmployeeSalaryRecordController` (bkz. US-03.3.2'deki aynı gerekçe: gerçek çoklu-kayıt alt kaynak, `EmployeeController`'ı büyütmemek).
- **Rol kısıtlaması BİLİNÇLİ OLARAK eklenmedi.** Roadmap, ücretin "yalnızca yetkili roller" tarafından görülmesini AYRI bir sonraki story olarak (`US-03.3.4`, `SEC-033`, bağımlılığı tam olarak bu story) tanımlıyor — iki adımlı bu ilerleme roadmap'in kendi tasarımı, erken/spekülatif bir kısıtlama eklenmedi. **Bir sonraki story bu ucu (`GET .../salary-records`) US-03.2.6'daki `EmployeeAccessGuard` benzeri bir mekanizmayla kısıtlamalı.**

**Değişen/eklenen dosyalar:**
- `organization/src/main/resources/db/migration/V16__create_employee_salary_records.sql`
- `organization/src/main/java/com/digitalik/organization/entity/EmployeeSalaryRecord.java`
- `organization/src/main/java/com/digitalik/organization/repository/EmployeeSalaryRecordRepository.java`
- `organization/src/main/java/com/digitalik/organization/service/EmployeeSalaryRecordService.java`
- `organization/src/main/java/com/digitalik/organization/dto/CreateSalaryRecordRequest.java`, `SalaryRecordResponse.java`
- `organization/src/main/java/com/digitalik/organization/controller/EmployeeSalaryRecordController.java` (yeni) — `EmployeeNotFoundException` zaten `OrganizationExceptionHandler`'da eşlenmiş olduğundan yeni bir exception/eşleme gerekmedi
- `organization/src/test/java/com/digitalik/organization/controller/EmployeeSalaryRecordControllerTest.java` (yeni, 6 test)

**Canlı doğrulama:** `docker compose down -v && docker compose up --build -d` (temiz veri hacmiyle) → V16 migration'ı diğer on beşinin üzerine uygulandı. Admin token ile bir çalışana iki ücret kaydı eklendi (İşe giriş: 45000, Terfi: 55000); `GET` geçmişi en yeni önce (Terfi, sonra İşe giriş) doğru sırayla döndürdü; tutar=0 → 400 "Ücret sıfırdan büyük olmalıdır"; olmayan çalışana kayıt → 404 "Çalışan bulunamadı"; token olmadan istek → 401. `psql` ile `audit_log`'da iki `CREATE` (`entity_type='EmployeeSalaryRecord'`) kaydı doğrulandı. Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (6), auth (22), organization (55), bootstrap (1) = 84 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

## US-03.3.4 — Ücret alanının yalnızca yetkili rollere açık olması

**Özet:** `GET /api/organization/employees/{employeeId}/salary-records`, US-03.3.3'te bilinçli olarak kısıtlamasız bırakılan uç, artık yalnızca ADMIN/IK rolüne açık: `@PreAuthorize("hasAnyRole('ADMIN', 'IK')")`.

**Tasarım kararları:**
- Kabul kriterinin sunduğu iki seçenekten ("göremez/maskeli görür") BİRİNCİSİ seçildi: TAM engelleme (403). Kısmi alan maskeleme (ör. tutarı gizleyip tarihi göstermek), projenin hiçbir yerinde kullanılmayan yeni bir kavram getirirdi; `@PreAuthorize` ile engelleme ise US-03.2.6'da zaten kurulmuş, kanıtlanmış bir desen.
- **US-03.2.6/US-03.3.1'in AKSİNE kaydın sahibi için bir istisna YOK.** O iki story "kendi kaydını görüntüleme" isteğiydi (self-servis); bu story açıkça "yalnızca yetkili roller" diyor, çalışanın kendi ücretini görmesinden bahsetmiyor. Bu yüzden `EmployeeAccessGuard` KULLANILMADI — salt `hasAnyRole('ADMIN','IK')` yeterli. Canlı doğrulamada bu bilinçli olarak test edildi: e-postası çalışan kaydıyla eşleşen CALISAN rollü bir test kullanıcısı KENDİ ücret geçmişini bile göremedi (403) — tıpkı roadmap'in istediği gibi.
- `POST` (yeni kayıt ekleme) kasıtlı olarak KISITLANMADI — kabul kriteri yalnızca "görebilmesini" (görüntüleme) konu ediyor; bu modüldeki diğer yazma uçlarıyla aynı emsal korundu. Canlı doğrulamada CALISAN+IK rolüne sahip bir kullanıcının `POST` ile kayıt ekleyebildiği (201) doğrulandı.
- Yeni bir exception/DB migration gerekmedi — `AuthorizationDeniedException` → 403 eşlemesi (US-03.2.6'da `OrganizationExceptionHandler`'a eklenmişti) tüm `com.digitalik.organization.controller` paketini (`basePackageClasses`) zaten kapsıyor.

**Değişen dosyalar:**
- `organization/src/main/java/com/digitalik/organization/controller/EmployeeSalaryRecordController.java` — `list`'e `@PreAuthorize("hasAnyRole('ADMIN', 'IK')")`

**Canlı doğrulama:** `docker compose up --build -d` (mevcut veri hacmiyle, US-03.3.3'ten kalan çalışan+2 ücret kaydı) → admin token ile `GET .../salary-records` → 200 (2 kayıt). `psql` ile doğrudan eklenen, e-postası bu çalışanla eşleşen ve yalnızca CALISAN rolüne sahip bir test kullanıcısı → `GET` → 403 "Erişim reddedildi" (KENDİ kaydı olmasına rağmen — beklenen davranış, bu story'de self-view istisnası yok). Aynı kullanıcıya ayrıca IK rolü atanıp tekrar giriş yapıldığında → `GET` → 200 (2 kayıt). Aynı kullanıcı (CALISAN+IK) `POST` ile yeni bir ücret kaydı ekleyebildi → 201 (POST'un kısıtlanmadığı doğrulandı). Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (6), auth (22), organization (55), bootstrap (1) = 84 test, 0 hata (yeni test gerekmedi — @PreAuthorize'ın enforcement'ı organization'ın izole test ortamında görünmüyor, bkz. US-03.2.6'daki aynı not)
docker compose up --build -d
docker compose down
```

---

## US-03.4.1 — Unvan/birim değişikliği geçmişi

**Özet:** Yeni bir `EmployeeAssignmentHistory` kaynağı, US-03.2.2'deki (`PUT .../assignment`) atama değişikliğinin YAN ETKİSİ olarak otomatik oluşuyor: her atama değiştiğinde önceki AÇIK geçmiş kaydı bugünün tarihiyle kapatılır, yeni bir kayıt (bitiş tarihi olmadan) açılır. `GET /api/organization/employees/{employeeId}/assignment-history` bu geçmişi (en yeni önce) listeler.

**Tasarım kararları:**
- `EmployeeService.assign` GENİŞLETİLDİ (yeni bir yere taşınmadı) — atama değişikliği ve geçmiş kaydı AYNI işlemin (mantıksal olarak tek bir "atama değiştir" eylemi) parçası; `EmployeeAssignmentHistoryRepository` yeni bir constructor bağımlılığı olarak eklendi. `Employee.organizationUnitId`/`jobTitleId` (US-03.2.2'nin "GÜNCEL" alanları) DEĞİŞMEDEN korundu — geçmiş buna EK, yerine geçen bir mekanizma değil (roadmap'in US-03.2.2 notundaki "geçmiş izleme ihtiyacı geldiğinde ayrı bir tablo olarak eklenecek" planı tam olarak burada gerçekleşti).
- Kabul kriterindeki "tam etkin-tarihli mimari henüz kurulmaz" notuyla tutarlı: `startDate` her zaman `LocalDate.now()` (değişikliğin YAPILDIĞI an) — gelecek tarihli planlama desteklenmiyor, proje genelinde zaten kullanılmayan bir `Clock` soyutlaması da eklenmedi (bkz. `Instant.now()`'ın `SessionService`/`LoginAttemptService`'te doğrudan kullanımıyla aynı konvansiyon).
- Kayıtlar hiçbir zaman güncellenmiyor/silinmiyor — yalnızca `close(endDate)` ile kapatılıyor + yeni kayıt ekleniyor (salt-ekleme, US-03.3.3'teki `EmployeeSalaryRecord` deseniyle akraba, ama orada hiç kapatma yok, burada AÇIK/KAPALI durumu var, `EmployeeAsset`'in "iade" deseniyle daha yakın).
- Okuma tarafı (`GET`) yine ayrı bir `EmployeeAssignmentHistoryController`/`Service`'e çıkarıldı — YAZMA (`assign`) ile aynı yerde değil, çünkü yazma zaten `EmployeeService.assign`'in doğal bir parçası; okuma ise bağımsız bir alt kaynak listeleme işlemi (US-03.3.2/03.3.3'teki aynı ayrım).
- **Canlıda bulunan, düzeltilen sıralama hatası:** `findByEmployeeIdOrderByStartDateDesc`, aynı gün içinde birden fazla değişiklik olduğunda (ki bu, tek oturumda yapılan testlerde HER ZAMAN gerçekleşir — `startDate` her ikisi için de bugün) DETERMİNİSTİK bir sıra garanti etmiyordu; `mvn test` bunu yakaladı (`$[0]` bazen ilk bazen ikinci kaydı döndürüyordu). `id DESC` ikincil sıralama anahtarı olarak eklendi (`findByEmployeeIdOrderByStartDateDescIdDesc`) — büyük id, daha sonra oluşturulan kaydı garanti eder.
- Rol kısıtlaması eklenmedi — kabul kriteri bundan bahsetmiyor, modüldeki çoğu okuma ucuyla aynı emsal.

**Değişen/eklenen dosyalar:**
- `organization/src/main/resources/db/migration/V17__create_employee_assignment_history.sql`
- `organization/src/main/java/com/digitalik/organization/entity/EmployeeAssignmentHistory.java`
- `organization/src/main/java/com/digitalik/organization/repository/EmployeeAssignmentHistoryRepository.java`
- `organization/src/main/java/com/digitalik/organization/service/EmployeeService.java` — `assign`, yeni `EmployeeAssignmentHistoryRepository` bağımlılığıyla geçmiş kaydı da yönetecek şekilde genişletildi
- `organization/src/main/java/com/digitalik/organization/service/EmployeeAssignmentHistoryService.java` (yeni, salt okuma)
- `organization/src/main/java/com/digitalik/organization/dto/EmployeeAssignmentHistoryResponse.java`
- `organization/src/main/java/com/digitalik/organization/controller/EmployeeAssignmentHistoryController.java` (yeni)
- `organization/src/test/java/com/digitalik/organization/controller/EmployeeAssignmentHistoryControllerTest.java` (yeni, 4 test)

**Canlı doğrulama:** `docker compose down -v && docker compose up --build -d` (temiz veri hacmiyle) → V17 migration'ı diğer on altısının üzerine uygulandı. Admin token ile bir çalışan + iki birim + iki unvan oluşturuldu. İlk atama → geçmişte 1 açık kayıt (`endDate: null`). İkinci (değişen) atama → geçmişte 2 kayıt: yeni açık kayıt en başta, ilk kayıt `endDate` doldurulmuş olarak kapatılmış; `Employee`'nin GÜNCEL alanları da doğru şekilde ikinci atamayı yansıttı. Olmayan çalışana istek → 404 "Çalışan bulunamadı"; token olmadan istek → 401. `psql` ile `audit_log`'da `EmployeeAssignmentHistory` için 2 `CREATE` + 1 `UPDATE` (kapatma işlemi) kaydı doğrulandı. Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (6), auth (22), organization (59), bootstrap (1) = 88 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

## US-04.1.1 — İzin türleri tanımlama (Bölüm 4'ün ilk story'si — yeni `leave` modülü)

**Özet:** Roadmap'in Bölüm 4'üne (İzin Yönetimi) geçişle birlikte, projedeki üçüncü gerçek iş modülü olan `leave` kuruldu. `POST/GET/PUT/DELETE /api/leave/types` ile izin türleri (Yıllık İzin/YILLIK, Mazeret İzni/MAZERET gibi) tanımlanıp yönetiliyor — henüz genel bir parametrik çerçeve değil, sabit `name`/`code` alanlı basit bir referans listesi (kabul kriteri).

**Modül bootstrap'ı (US-03.1.1'deki "ilk iş modülü" adımlarının üçüncü tekrarı):** Kök `pom.xml`'e `<module>leave</module>`, `leave/pom.xml` (yalnızca `core`'a bağımlı, `organization/pom.xml` ile birebir aynı şablon), `bootstrap/pom.xml`'e tek bir `<dependency>` satırı, `Dockerfile`'a `leave/pom.xml`+`leave/src` kopyalama adımları. Mimarinin ("yeni modül eklemek yalnızca birkaç satırlık bağlama işlemi") üçüncü kez sorunsuz doğrulanması — hiçbir mevcut modül dosyası değişmedi.

**Tasarım kararları:**
- Modül içi katmanlama (`entity/repository/service/controller/dto/exception`) ve `@Order(HIGHEST_PRECEDENCE)` taşıyan modül-özel `LeaveExceptionHandler` — US-02.1.3/US-03.1.1'de kurulan zorunlu kalıpların birebir tekrarı.
- `LeaveType`, `organization.JobTitle` ile aynı CRUD desenini (create/list/update/delete) izliyor — kabul kriteri yalnızca "oluşturulur" diyor ama roadmap'in "basit referans listesi" tanımı JobTitle'la aynı kategoride; tutarlılık için aynı CRUD kapsamı uygulandı.
- `JobTitle`'ın (yalnızca `name`, benzersizlik yok) AKSİNE `code` alanı eklendi ve DB+servis seviyesinde BENZERSİZ kılındı — kabul kriteri açıkça "tür adı/KODU" diyor ve bu kod, ileriki story'lerin (ör. US-04.1.2'nin hak ediş hesaplaması) türü programatik olarak referans alması için gerekli; `organization.Employee`'deki `existsByNationalIdAndIdNot` deseniyle aynı yaklaşımla güncellemede "kendi koduyla çakışma" engellendi.
- Rol kısıtlaması eklenmedi — `organization` modülündeki çoğu ucun gerekçesiyle aynı: kabul kriteri bundan bahsetmiyor, roadmap bağımlılığı (US-03.1.1) bir yetki story'si değil.

**Değişen/eklenen dosyalar:**
- `pom.xml` — `<module>leave</module>`
- `bootstrap/pom.xml` — `leave` bağımlılığı
- `Dockerfile` — `leave/pom.xml`, `leave/src` kopyalama adımları
- `leave/pom.xml` (yeni modül)
- `leave/src/main/resources/db/migration/V18__create_leave_types.sql` (global migration sırası — `organization`'ın son migration'ı V17'den devam)
- `leave/src/main/java/com/digitalik/leave/entity/LeaveType.java`
- `leave/src/main/java/com/digitalik/leave/repository/LeaveTypeRepository.java`
- `leave/src/main/java/com/digitalik/leave/service/LeaveTypeService.java`
- `leave/src/main/java/com/digitalik/leave/controller/LeaveTypeController.java`
- `leave/src/main/java/com/digitalik/leave/dto/LeaveTypeRequest.java`, `LeaveTypeResponse.java`
- `leave/src/main/java/com/digitalik/leave/exception/LeaveTypeNotFoundException.java`, `DuplicateLeaveTypeCodeException.java`, `LeaveExceptionHandler.java`
- `leave/src/test/java/com/digitalik/leave/LeaveTestApplication.java` (yeni modül test bootstrap sınıfı, bkz. `organization.OrganizationTestApplication`)
- `leave/src/test/java/com/digitalik/leave/controller/LeaveTypeControllerTest.java` (yeni, 11 test)

**Canlı doğrulama:** `docker compose down -v && docker compose up --build -d` (temiz veri hacmiyle) → Dockerfile'ın `leave` modülünü doğru kopyaladığı ve V18 migration'ının diğer on yedisinin üzerine sorunsuz uygulandığı doğrulandı. Token olmadan oluşturma → 401; admin token ile "Yıllık İzin"/YILLIK ve "Mazeret İzni"/MAZERET oluşturuldu, listelendi; aynı kodla ikinci kayıt → 409 "İzin türü zaten kayıtlı"; boş isim → 400; güncelleme (PUT) → 200; silme (DELETE) → 204, listeden düştü. `psql` ile `audit_log`'da `entity_type='LeaveType'` için 2 CREATE + 1 UPDATE kaydı doğrulandı (silme, projenin geri kalanıyla tutarlı olarak audit_log'a yansımıyor — `@PostRemove` dinlenmiyor). Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (6), auth (22), organization (59), leave (11), bootstrap (1) = 99 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

## US-04.1.2 — Hizmet yılına göre yıllık izin hak edişi hesaplama

**Özet:** `GET /api/leave/entitlement?hireDate=...&asOfDate=...` (asOfDate isteğe bağlı, verilmezse bugün), işe giriş tarihinden hesaplanan hizmet yılına göre yıllık izin hak edişini (gün) döner. Kademe tablosu, İş Kanunu m.53'teki GERÇEK, istatüsel kademelerle aynı: 1 yıldan az → 0, 1-5 yıl (5 dahil) → 14, 5-15 yıl → 20, 15 yıl ve üzeri → 26.

**Tasarım kararları:**
- **Saf hesaplama ucu — hiçbir kayıt okumuyor/yazmıyor.** `leave` modülü `organization`'a bağımlı DEĞİL (mimari kural), bu yüzden `hireDate` bir `Employee`'den OKUNMUYOR — çağıran taraf parametre olarak sağlıyor. Bu, US-03.2.6'daki cross-module kısıtın (auth verisine organization'dan erişememe) burada tam simetrik bir tekrarı; çözüm de benzer: veriyi taşıyan tarafa bağımlı olmak yerine, ihtiyaç duyulan değeri arayüz üzerinden parametre olarak almak.
- Kademe tablosu VERİTABANI TABLOSU değil, kod içinde SABİT — `LeaveType`'ın aksine (İK tarafından yönetilen bir referans listesi), bu saf bir hesaplama kuralı; Feature 04.1'in kendi YAGNI ilkesiyle ("henüz genel parametrik çerçeve değil") tutarlı, HR'ın bunu ekrandan değiştirmesi ihtiyacı netleşirse DB tablosuna taşınabilir.
- 18 yaş altı/50 yaş üstü asgari 20 gün istisnası (İş Kanunu m.53) BİLİNÇLİ OLARAK uygulanmadı — doğum tarihi gerektirir (`EmployeeProfile.birthDate`, US-03.3.1), bu alan İSTEĞE BAĞLIDIR (her çalışan için var olacağı garanti edilemez) ve story'nin Requirement ID'si (FR-101) yalnızca hizmet yılını konu ediyor; yaş/cinsiyet/grup kısıtları FR-104'e ait, roadmap'te henüz bir story'si yok.
- **Canlıda bulunan, düzeltilen hata:** `hireDate` başta `@RequestParam` (varsayılan `required=true`) idi; eksik parametride Spring'in `MissingServletRequestParameterException`'ı, projede bu türe özel hiçbir handler olmadığından `core.GlobalExceptionHandler`'ın genel `Exception.class` yakalayıcısına düşüp YANLIŞLIKLA 500 dönüyordu (`mvn test` bunu yakaladı). Çözüm: parametre `required=false` yapıldı, boşluk `LeaveEntitlementService` içinde elle doğrulanıyor — bu, projenin zaten izlediği "doğrulamayı framework'e değil servise bırak" konvansiyonuyla (ör. `EmployeeService`'teki elle `IllegalArgumentException`'lar) tutarlı. `GlobalExceptionHandler`'ın framework istisnalarını da doğru durum koduyla eşlemesi AYRI bir platform iyileştirmesi — bu story'nin kapsamı dışında bırakıldı, gözlemlendiği haliyle not edildi.

**Değişen/eklenen dosyalar:**
- `leave/src/main/java/com/digitalik/leave/service/LeaveEntitlementService.java` (yeni, repository bağımlılığı yok)
- `leave/src/main/java/com/digitalik/leave/controller/LeaveEntitlementController.java` (yeni)
- `leave/src/main/java/com/digitalik/leave/dto/LeaveEntitlementResponse.java` (yeni)
- `leave/src/test/java/com/digitalik/leave/controller/LeaveEntitlementControllerTest.java` (yeni, 8 test — her kademe sınırı + eksik/geçersiz tarih senaryoları)

**Canlı doğrulama:** Yeni migration gerekmedi (saf hesaplama, kalıcı veri yok). Token olmadan istek → 401; 1 yıldan az hizmet → 0 gün; 6 yıl → 20 gün; 16 yıl → 26 gün; `asOfDate` verilmeden bugünün tarihiyle hesaplandığı doğrulandı; `hireDate` eksik → 400 "İşe giriş tarihi boş olamaz"; işe giriş tarihi hesaplama tarihinden sonra → 400. Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (6), auth (22), organization (59), leave (19), bootstrap (1) = 107 test, 0 hata
docker compose up --build -d
docker compose down
```

---

## US-04.1.3 — İzin bakiyesinin otomatik takibi

**Özet:** `GET /api/leave/balance?hireDate=...&asOfDate=...`, kabul kriterindeki formülü (`bakiye = hak ediş - kullanılan - onay bekleyen`) hesaplayıp döner. `entitlementDays`, US-04.1.2'deki `LeaveEntitlementService` ile (tekrar yazılmadan) hesaplanıyor; `usedDays`/`pendingDays` şu an için `0`.

**Kritik tasarım kararı — kalıcı bir "bakiye" tablosu KASITLI OLARAK eklenmedi:** Bu story'nin roadmap'teki bağımlılığı yalnızca US-04.1.2; Bölüm 4.2'nin (İzin Talebi ve Onay) HİÇBİR story'si henüz yapılmadı — yani "kullanılan"/"onay bekleyen" günlerin geleceği bir KAYNAK (izin talebi kaydı) sistemde yok. Bunun için şimdiden ayrı bir `LeaveBalance` tablosu + "sayaç artırma" uçları açmak, hiçbir kod tarafından hiçbir zaman çağrılmayan, "yarım kalmış" bir persistence katmanı olurdu. Bunun yerine bakiye HER SORGUDA taze hesaplanıyor: `usedDays`/`pendingDays` şu an sabit `0` — bu bir placeholder DEĞİL, sistemin o anki GERÇEK durumu (henüz hiç izin talebi yok). Bölüm 4.2'de `LeaveRequest` (talep+durum) kaydı eklendiğinde, bu iki alan o kayıtlar üzerinden toplanan GERÇEK bir sorguya dönüşecek — kayıt tutma ihtiyacı o an, o story ile birlikte netleşecek (YAGNI). Kabul kriterindeki "her işlemde güncellenir" ifadesi bu tasarımda otomatik sağlanıyor: hiçbir değer önbelleğe alınmadığından, her sorgu zaten anlık gerçek durumu yansıtıyor.
- `LeaveBalanceService`, `LeaveEntitlementService`'i (composition ile) çağırıyor — hesaplama mantığı tekrar yazılmadı.
- `leaveTypeId` parametresi YOK — hem 04.1.2 hem bu story, roadmap'in "İzin Türleri ve Bakiye" alt bölümündeki İş Kanunu tabanlı hesaplamanın (spesifik olarak yıllık izin hak edişi) doğal devamı; farklı izin türleri için farklı bakiye kuralları ihtiyacı netleşirse ayrı ele alınacak.
- `hireDate` yine `required=false` + serviste elle doğrulama — US-04.1.2'de keşfedilen `MissingServletRequestParameterException`/500 hatasını tekrarlamamak için.

**Değişen/eklenen dosyalar:**
- `leave/src/main/java/com/digitalik/leave/service/LeaveBalanceService.java` (yeni, persistence yok)
- `leave/src/main/java/com/digitalik/leave/controller/LeaveBalanceController.java` (yeni)
- `leave/src/main/java/com/digitalik/leave/dto/LeaveBalanceResponse.java` (yeni)
- `leave/src/test/java/com/digitalik/leave/controller/LeaveBalanceControllerTest.java` (yeni, 3 test)

**Canlı doğrulama:** Yeni migration gerekmedi. Token olmadan istek → 401; 6 yıl hizmet → bakiye = hak ediş = 20 (kullanılan/bekleyen 0 olduğundan); `hireDate` eksik → 400 "İşe giriş tarihi boş olamaz"; `asOfDate` verilmeden bugünün tarihiyle hesaplandığı doğrulandı. Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (6), auth (22), organization (59), leave (22), bootstrap (1) = 110 test, 0 hata
docker compose up --build -d
docker compose down
```

---

## US-04.2.1 — İzin talebi oluşturma (Bölüm 4.2'nin ilk story'si — talep→onay akışının başlangıcı)

**Özet:** `POST /api/leave/requests` (gövde: `employeeId`, `leaveTypeId`, `startDate`, `endDate`; isteğe bağlı `hireDate` query param) ile bir izin talebi `PENDING` durumuyla oluşturuluyor. Yetersiz bakiyede (hireDate sağlanmışsa) yanıtta bir `balanceWarning` metni dönüyor — kabul kriteri gereği talep YİNE DE oluşturuluyor, engellenmiyor.

**Tasarım kararları:**
- **`hireDate`, request gövdesinde DEĞİL, isteğe bağlı bir query param.** Bakiye kontrolü için gerekli ama izin talebinin kendisinin bir alanı değil (US-04.1.2/04.1.3'teki aynı "çağıran taraf sağlar" deseni — `leave` modülü `organization`'a bağımlı olmadığından çalışanın işe giriş tarihini kendi başına okuyamıyor). Sağlanmazsa bakiye kontrolü atlanıyor, talep yine de normal oluşturuluyor — bu, kabul kriterinin "engellemeyebilir" ifadesiyle zaten tutarlı bir esneklik.
- `LeaveRequest.employeeId`'ye DB seviyesinde bir FK (`REFERENCES employees`) BİLİNÇLİ OLARAK eklenmedi — V19 migration'ındaki ayrıntılı not: `leave`'in `organization`'a Java seviyesinde hiçbir görünürlüğü yok; aynı fiziksel şema kullanılıyor olması modüller arası örtük bir FK bağımlılığı için gerekçe değil, bu Maven'in zorladığı derleme zamanı sınırını veritabanı seviyesinde sessizce delerdi. `leaveTypeId` ise AYNI modül içi bir referans olduğundan normal şekilde `REFERENCES leave_types(id)`.
- `status` alanı `LeaveRequestStatus` enum'ıyla (`PENDING/APPROVED/REJECTED`, İngilizce — `AuditOperation`'daki konvansiyonla tutarlı) baştan modellendi; onay/ret alanları (karar veren, gerekçe, karar tarihi) BİLİNÇLİ OLARAK eklenmedi — bunlar US-04.2.2'nin kendi kapsamı, o story ile birlikte eklenecek.
- `requestedDays` (kapsayıcı gün sayısı, `endDate - startDate + 1`) hafta sonu/resmi tatil hariç TUTMUYOR — roadmap'in FR-104'e bıraktığı ayrı bir parametre; bu story'nin kapsamında değil.
- Çalışan/izin türü VAR MI kontrolü asimetrik: `leaveTypeId` AYNI modülde olduğundan `LeaveTypeRepository.existsById` ile doğrulanıp 404 döndürülüyor; `employeeId` İSE doğrulanamıyor (leave, Employee'ye erişemiyor) — bu, mimari kararın kabul edilen, dokümante edilmiş bir sonucu.

**Değişen/eklenen dosyalar:**
- `leave/src/main/resources/db/migration/V19__create_leave_requests.sql`
- `leave/src/main/java/com/digitalik/leave/entity/LeaveRequest.java`, `LeaveRequestStatus.java`
- `leave/src/main/java/com/digitalik/leave/repository/LeaveRequestRepository.java`
- `leave/src/main/java/com/digitalik/leave/service/LeaveRequestService.java` — `LeaveTypeRepository` (varlık kontrolü) ve `LeaveBalanceService`'e (US-04.1.3, bakiye uyarısı için) bağımlı
- `leave/src/main/java/com/digitalik/leave/dto/CreateLeaveRequestRequest.java`, `LeaveRequestResponse.java`
- `leave/src/main/java/com/digitalik/leave/controller/LeaveRequestController.java`
- `leave/src/test/java/com/digitalik/leave/controller/LeaveRequestControllerTest.java` (yeni, 6 test)

**Canlı doğrulama:** `docker compose down -v && docker compose up --build -d` (temiz veri hacmiyle) → V19 migration'ı diğer on sekizinin üzerine uygulandı. Token olmadan istek → 401; `hireDate` olmadan normal talep → 201, `PENDING`, `balanceWarning: null`; `hireDate` ile (bakiyeyi aşan bir talep) → 201 (ENGELLENMEDİ) + `balanceWarning: "Bakiye yetersiz: kalan 14 gün, talep edilen 25 gün."`; olmayan izin türü → 404; bitiş < başlangıç → 400. `psql` ile `leave_requests` tablosunda iki `PENDING` kayıt ve `audit_log`'da 2 `CREATE` (`entity_type='LeaveRequest'`) doğrulandı. Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (6), auth (22), organization (59), leave (28), bootstrap (1) = 116 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

## US-04.2.2 — İzin talebini onaylama/reddetme (projedeki ilk gerçek onay adımı)

**Özet:** `PUT /api/leave/requests/{id}/decision` (gövde: `decision` = `"APPROVED"`/`"REJECTED"`, ret için `rejectionReason` zorunlu) ile bir `PENDING` talep karara bağlanıyor. "Yönetici yalnızca kendi ekibinin taleplerini görür/onaylar" kabul kriteri, `@PreAuthorize` + yeni bir `LeaveRequestAccessGuard` ile uygulanıyor.

**Mimari çatal — kullanıcıyla birlikte karara bağlandı:** Bu story'nin kabul kriteri "kendi ekibi" kısıtlaması istiyor, ama (a) projede hiçbir yerde "kim kimin yöneticisi/hangi çalışan hangi ekipte" bilgisi yok, (b) `leave` modülü mimari kural gereği `organization`'a bağımlı değil, yani `Employee.organizationUnitId` gibi bilgilere erişemiyor. Kullanıcıya üç seçenek sunuldu: (1) istemci taraflı ekip listesi — çağıran taraf "ekibim" iddia ettiği `employeeId` listesini parametre olarak sağlar, `leave` yalnızca rol + bu listede olup olmadığını kontrol eder; (2) `leave`'i `organization`'a bağımlı yapmak (mimari kuralı ilk kez kırar); (3) ekip kısıtını bu story'de atlamak. **Kullanıcı (1)'i seçti.** Uygulama:
- `PUT .../decision?teamEmployeeIds=3,7,9` — çağıran, "ekibim" dediği employeeId listesini query param olarak sağlıyor (bu bilgiyi zaten `organization`'ın kendi `GET /api/organization/employees?organizationUnitId=...` ucundan alması gerekiyor — o çağrı `leave`'in dışında, frontend/orkestrasyon katmanında yapılıyor).
- `LeaveRequestAccessGuard.isTeamMember(leaveRequestId, teamEmployeeIds)`: talebin `employeeId`'sinin bu listede olup olmadığını kontrol eder.
- `@PreAuthorize("hasAnyRole('ADMIN', 'IK') or (hasRole('YONETICI') and @leaveRequestAccessGuard.isTeamMember(#id, #teamEmployeeIds))")` — ADMIN/IK her talebi karara bağlayabilir (US-03.2.6/US-04.1.2'deki aynı "üst rol" emsali); YONETICI yalnızca sağladığı listede talebin sahibi varsa.
- **Bilinen, kabul edilmiş güven sınırı:** `teamEmployeeIds` tamamen İSTEMCİ TARAFLI iddia — `leave`, "bu liste gerçekten bu yöneticinin ekibi mi" sorusunu sunucu tarafında doğrulayamıyor (organization verisine erişimi yok). Rol kontrolü (yalnızca YONETICI/ADMIN/IK) en azından yetkisiz bir CALISAN'ın bunu kullanmasını engelliyor, ama kötü niyetli/hatalı bir istemci teorik olarak yanlış bir ekip listesi gönderebilir. Bu, kullanıcıyla birlikte, mimari kuralı korumak için bilinçli olarak kabul edilen bir sınırlama — `LeaveRequestAccessGuard`'ın javadoc'unda ayrıntılı belgelendi.
- `leave/pom.xml`'e `spring-security-core` eklendi (organization'ın US-03.2.6'daki aynı seçimi: tam starter değil, yalnızca jenerik rol/yetki API'si).

**Diğer tasarım kararları:**
- `LeaveRequest.approve()`/`reject(reason)` — yalnızca `PENDING` bir talep karara bağlanabilir (`Bu talep zaten karara bağlanmış` — 400); `REJECTED` için `rejectionReason` boşsa 400.
- "Karar veren"/"karar tarihi" alanları eklenmedi — `BaseEntity`'nin `updatedBy`/`updatedAt` + audit_log'dan bedavaya geliyor.
- `decision` alanı request body'de düz `String` (enum tipi DEĞİL) — Jackson'ın geçersiz bir enum string'inde fırlattığı `HttpMessageNotReadableException`'ın, US-04.1.2'de keşfedilen aynı "framework istisnası → yanlışlıkla 500" tuzağına düşmesini önlemek için; ayrıştırma/doğrulama elle yapılıp `IllegalArgumentException` (400) fırlatılıyor.

**Değişen/eklenen dosyalar:**
- `leave/pom.xml` — `spring-security-core`
- `leave/src/main/resources/db/migration/V20__add_rejection_reason_to_leave_requests.sql`
- `leave/src/main/java/com/digitalik/leave/entity/LeaveRequest.java` — `rejectionReason`, `approve()`, `reject(...)`
- `leave/src/main/java/com/digitalik/leave/exception/LeaveRequestNotFoundException.java` (yeni)
- `leave/src/main/java/com/digitalik/leave/exception/LeaveExceptionHandler.java` — `LeaveRequestNotFoundException` → 404, `AuthorizationDeniedException` → 403 eşlemeleri
- `leave/src/main/java/com/digitalik/leave/security/LeaveRequestAccessGuard.java` (yeni)
- `leave/src/main/java/com/digitalik/leave/service/LeaveRequestService.java` — `decide(...)` metodu
- `leave/src/main/java/com/digitalik/leave/dto/LeaveRequestDecisionRequest.java` (yeni); `LeaveRequestResponse.java` — `rejectionReason` eklendi
- `leave/src/main/java/com/digitalik/leave/controller/LeaveRequestController.java` — `PUT /{id}/decision`
- `leave/src/test/java/com/digitalik/leave/security/LeaveRequestAccessGuardTest.java` (yeni, 4 test)
- `leave/src/test/java/com/digitalik/leave/controller/LeaveRequestControllerTest.java` — 6 yeni test (onay, gerekçeli ret, gerekçesiz ret→400, tekrar karar→400, geçersiz karar değeri→400, olmayan talep→404)

**Canlı doğrulama:** `docker compose down -v && docker compose up --build -d` (temiz veri hacmiyle) → V20 migration'ı diğer on dokuzunun üzerine uygulandı. ADMIN token'ı, `teamEmployeeIds` listesinde OLMASA BİLE talebi onaylayabildi (bypass) → 200; YONETICI rolündeki bir test kullanıcısı, hedef `employeeId` kendi sağladığı `teamEmployeeIds` listesinde YOKKEN → 403; AYNI kullanıcı listeye hedef `employeeId`'yi ekleyip tekrar denediğinde → 200; yalnızca CALISAN rolündeki bir kullanıcı, `teamEmployeeIds` hedefi içerse bile → 403 (rol yetersiz); gerekçeli ret → 200 + `rejectionReason` doğru döndü; gerekçesiz ret → 400 "Ret gerekçesi zorunludur." `psql` ile `leave_requests` tablosunda doğru durumlar ve `audit_log`'da her karar için bir `UPDATE` kaydı doğrulandı. Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (6), auth (22), organization (59), leave (38), bootstrap (1) = 126 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

## US-04.2.3 — Onaylanan izni bakiyeden düşme

**Özet:** `LeaveBalanceService`'teki "kullanılan"/"onay bekleyen" alanları, US-04.1.3'te sabit `0` bırakılmıştı ("Bölüm 4.2'de LeaveRequest kaydı eklendiğinde... gerçek bir sorguya dönüşecek" notuyla). Bu story tam olarak o an: `GET /api/leave/balance` artık `employeeId`'ye göre GERÇEK bir toplam hesaplıyor — "kullanılan" = o çalışanın `APPROVED` taleplerinin gün toplamı, "onay bekleyen" = `PENDING` taleplerinin gün toplamı, `REJECTED` hiçbirine dahil değil.

**Hiçbir kalıcı "bakiye" tablosu YİNE eklenmedi** — US-04.1.3'teki tasarım kararı aynen korundu: bakiye hâlâ her sorguda `LeaveRequest` kayıtlarından TAZE hesaplanıyor. Kabul kriterindeki "onay anında güncellenir" ifadesi, `LeaveRequestService.decide()`'a HİÇBİR EK KOD YAZILMADAN otomatik sağlandı — bir talep `APPROVED` olduğu an, bir sonraki bakiye sorgusu bunu zaten yansıtıyor (önbelleğe alınan hiçbir değer yok).

**Canlı doğrulamada bulunan, düzeltilen bir mantık hatası:** `LeaveRequestService.create()`, yeni talebi ÖNCE veritabanına kaydedip SONRA bakiye uyarısını hesaplıyordu. `usedDays`/`pendingDays` artık gerçek sorgular olduğundan, bu sıra YENİ OLUŞTURULAN talebin kendisini de "onay bekleyen" toplamına dahil ediyordu — kalan bakiye kendi büyüklüğü kadar yapay olarak azalıp HER talepte (gerçekten yetersiz olmasa bile) yanlış uyarı tetikliyordu. Düzeltme: talep önce bellekte oluşturulup (`getRequestedDays()` için, henüz kaydedilmeden) uyarı SADECE mevcut (bu talep hariç) kayıtlarla hesaplanıyor, kayıt EN SON yapılıyor. Canlı doğrulamada bu senaryo özellikle test edildi (bkz. aşağı) — sıra düzeltmesi olmasaydı her talep yanlışlıkla "yetersiz bakiye" uyarısı gösterirdi.
- `LeaveRequest.getRequestedDays()` entity metodu eklendi — gün hesaplaması artık üç yerde (oluşturma, karar yanıtı, bakiye toplamı) tekrar yazılmak yerine tek bir yerden kullanılıyor.
- `LeaveBalanceService`/`LeaveBalanceController`, artık zorunlu (ama yine `required=false` + elle doğrulanan, US-04.1.2'deki 500 tuzağını tekrarlamamak için) bir `employeeId` parametresi alıyor — bakiye artık gerçekten çalışana özel.

**Değişen dosyalar:**
- `leave/src/main/java/com/digitalik/leave/entity/LeaveRequest.java` — `getRequestedDays()`
- `leave/src/main/java/com/digitalik/leave/repository/LeaveRequestRepository.java` — `findByEmployeeIdAndStatus(...)`
- `leave/src/main/java/com/digitalik/leave/service/LeaveBalanceService.java` — gerçek toplam sorguları
- `leave/src/main/java/com/digitalik/leave/service/LeaveRequestService.java` — `create()`'in kayıt/hesaplama sırası düzeltildi, `employeeId` `LeaveBalanceService`'e iletiliyor
- `leave/src/main/java/com/digitalik/leave/controller/LeaveBalanceController.java`, `LeaveRequestController.java` — `employeeId` parametresi/aktarımı
- `leave/src/main/java/com/digitalik/leave/dto/LeaveBalanceResponse.java` — `employeeId` eklendi
- `leave/src/test/java/com/digitalik/leave/controller/LeaveBalanceControllerTest.java` — yeniden yazıldı (7 test: onaylanan düşer, bekleyen ayrı sayılır, reddedilen etkilemez, employeeId/hireDate eksikse 400)

**Canlı doğrulama:** Yeni migration gerekmedi. Boş bakiye = hak ediş (20); 5 günlük PENDING talep → bakiye 15; 5 günlük talep APPROVED edilince → kullanılan 5 + bekleyen 5, bakiye 10; 3 günlük talep REJECTED edilince → bakiye DEĞİŞMEDİ (hâlâ 10) — reddedilenin etkisiz olduğu doğrulandı. **Sıra düzeltmesi özel olarak test edildi:** kalan bakiye 10 iken 8 günlük yeni bir talep oluşturuldu → uyarı GELMEDİ (10 ≥ 8, kendi talebi çift sayılmadı); bakiye ardından doğru şekilde 20-5-13=2'ye düştü; son olarak kalan 2 gün iken 5 gün talep edildi → uyarı GELDİ ("kalan 2 gün, talep edilen 5 gün") ama talep yine de 201 ile oluşturuldu (engellenmedi). Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (6), auth (22), organization (59), leave (42), bootstrap (1) = 130 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

## US-04.2.4 — Çalışanın geçmiş/mevcut izin taleplerini görüntülemesi (Feature 04.2 tamamlandı)

**Özet:** `GET /api/leave/requests?employeeId=...` ile bir çalışanın tüm izin talepleri (en yeni önce, durumlarıyla — `PENDING`/`APPROVED`/`REJECTED`) listeleniyor.

**Tasarım kararları:**
- **Rol/self-view kısıtlaması BİLİNÇLİ OLARAK eklenmedi** — US-03.2.6'nın ("Çalışan yalnızca kendi kaydını görür") aksine, bu story'nin kabul kriteri "yalnızca kendi listesini görür" DEMİYOR, yalnızca "geçmiş/mevcut ... görüntülemek" diyor. Ayrıca teknik olarak da mümkün değil: `leave` modülünün giriş yapan kullanıcının hangi `employeeId`'ye karşılık geldiğini doğrulayacak hiçbir verisi yok (bkz. US-04.2.2'deki aynı kısıt). Bu, kabul kriterinin gerçekten istemediği bir kısıtlamayı icat etmemek + zaten uygulanamayacak bir kontrolü sahte şekilde eklememek anlamına geliyor.
- `findByEmployeeIdOrderByStartDateDescIdDesc` — `id` ikincil sıralama anahtarı, US-03.4.1'de (`EmployeeAssignmentHistoryRepository`) canlıda bulunan "aynı gün birden fazla kayıt olduğunda `ORDER BY startDate DESC` deterministik değil" hatasını BU SEFER PROAKTİF OLARAK (test yazılmadan önce) önledi — aynı dersin ikinci kez tekrarlanması.
- `LeaveRequest.getRequestedDays()` artık üçüncü kez (liste yanıtında) kullanılıyor; `decide()` yanıtındaki eski `ChronoUnit` tekrarı da bu entity metoduna geçirilerek temizlendi.

**Değişen/eklenen dosyalar:**
- `leave/src/main/java/com/digitalik/leave/repository/LeaveRequestRepository.java` — `findByEmployeeIdOrderByStartDateDescIdDesc(...)`
- `leave/src/main/java/com/digitalik/leave/service/LeaveRequestService.java` — `listByEmployee(...)`
- `leave/src/main/java/com/digitalik/leave/controller/LeaveRequestController.java` — `GET` ucu; `decide()`'daki `ChronoUnit` tekrarı `getRequestedDays()`'e geçirildi
- `leave/src/test/java/com/digitalik/leave/controller/LeaveRequestControllerTest.java` — 4 yeni test (durumlarla listeleme + sıralama, başka çalışanın taleplerini içermeme, boş liste, `employeeId` eksik → 400)

**Canlı doğrulama:** Token olmadan istek → 401; `employeeId` eksik → 400 "Çalışan boş olamaz"; hiç talebi olmayan çalışan → boş liste `[]`; bir PENDING + bir APPROVED talep oluşturulup listelendiğinde en yeni (Eylül) önce, en eski (Ağustos) sonra, doğru `status` değerleriyle döndü; başka bir `employeeId` için liste boş kaldı (talepler karışmadı). Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (6), auth (22), organization (59), leave (46), bootstrap (1) = 134 test, 0 hata
docker compose up --build -d
docker compose down
```

---

## US-04.3.1 — İzin talebi onay/ret e-postası (Bölüm 4 — İzin Yönetimi tamamlandı)

**Özet:** Bir izin talebi onaylandığında/reddedildiğinde, `LeaveRequestService.decide()` artık `LeaveNotificationService` üzerinden SMTP ile sabit metinli bir bildirim e-postası gönderiyor — roadmap Bölüm 4.3'ün YAGNI notuyla ("genel bir bildirim motoru kurulmaz; yalnızca izin modülüne özel, tek şablonlu bir e-posta gönderimi") tam örtüşen, minimal bir uygulama.

**Tasarım kararları:**
- **`employeeEmail`, US-04.1.2'deki `hireDate`'in AKSİNE KALICI olarak saklanıyor** (yeni `leave_requests.employee_email` kolonu, V21). Fark: `hireDate` yalnızca O AN (oluşturma sırasında) kullanılıp atılıyordu; e-posta ise çok DAHA SONRA, ayrı bir HTTP isteğinde (`decide`, muhtemelen gün/hafta sonra) tekrar gerekiyor — bu yüzden geçici bir parametre değil, entity'nin bir alanı. Yine de aynı temel prensip korundu: `leave` modülü `organization`'a bağımlı olmadığından çalışanın e-postasını kendisi okuyamıyor, çağıran taraf (talebi OLUŞTURURKEN) isteğe bağlı olarak sağlıyor.
- E-posta adresi sağlanmazsa bildirim SESSİZCE atlanır (hata fırlatılmaz) — bildirim, temel akışın (onay/ret) bir ön koşulu değil, isteğe bağlı bir yan etki.
- **SMTP hataları karara YAYILMAZ** — `LeaveNotificationService.sendDecisionNotification`, `MailException`'ı yakalayıp loglar; geçici bir e-posta sunucusu sorunu, zaten veritabanına işlenmiş bir onay/ret kararını başarısız bir HTTP yanıtına çevirmemeli. Bu davranış hem birim testinde (mock `JavaMailSender` ile) hem `mvn test`'in kendisinde (gerçek `JavaMailSenderImpl`, yerel SMTP sunucusu olmadığından bağlantı hatası → log satırı, ama test YEŞİL) doğrulandı.
- **Yerel/test SMTP yakalayıcı:** `docker-compose.yml`'e `axllent/mailpit` eklendi (SMTP :1025, web/REST API :8025) — gerçek e-posta göndermeden canlı doğrulama yapabilmek için. Üretimde `MAIL_HOST`/`MAIL_PORT`/`MAIL_FROM_ADDRESS` ortam değişkenleri gerçek bir SMTP sağlayıcısına işaret edecek; mailpit yalnızca compose dosyasında, uygulama kodunda hiçbir mailpit-özel bilgi yok.
- `bootstrap`'ın kendi test context'i (`DijitalIkPlatformuApplicationTests`, tüm modülleri toplar) ve `leave`'in izole test context'i, her ikisi de `spring.mail.host`/`app.mail.from-address` ayarlarını test `application.yml`'lerine ihtiyaç duydu — aksi halde `JavaMailSender` bean'i (Spring Boot'un `spring.mail.host` koşullu autoconfig'i) hiç oluşmayıp context yüklenemezdi.

**Değişen/eklenen dosyalar:**
- `leave/pom.xml` — `spring-boot-starter-mail`
- `leave/src/main/resources/db/migration/V21__add_employee_email_to_leave_requests.sql`
- `leave/src/main/java/com/digitalik/leave/entity/LeaveRequest.java` — `employeeEmail` alanı + 5 parametreli constructor (4 parametreli eski constructor, `null` e-postayla ona yönlendiriyor — geriye dönük uyumlu)
- `leave/src/main/java/com/digitalik/leave/service/LeaveNotificationService.java` (yeni)
- `leave/src/main/java/com/digitalik/leave/service/LeaveRequestService.java` — `create`'e `employeeEmail` parametresi, `decide`'a karar sonrası bildirim çağrısı
- `leave/src/main/java/com/digitalik/leave/controller/LeaveRequestController.java` — `create`'e `employeeEmail` query param
- `leave/src/main/java/com/digitalik/leave/dto/LeaveRequestResponse.java` — `employeeEmail` eklendi
- `bootstrap/src/main/resources/application.yml` — `spring.mail.host/port` (env-driven), `app.mail.from-address`
- `bootstrap/src/test/resources/application.yml`, `leave/src/test/resources/application.yml` (yeni) — izole test context'lerinde `JavaMailSender` bean'inin oluşabilmesi için
- `docker-compose.yml` — `mailpit` servisi + backend `MAIL_HOST`/`MAIL_PORT` ortam değişkenleri
- `leave/src/test/java/com/digitalik/leave/service/LeaveNotificationServiceTest.java` (yeni, 4 test — mock `JavaMailSender`)
- `leave/src/test/java/com/digitalik/leave/controller/LeaveRequestControllerTest.java` — 2 yeni test (e-posta sağlanınca yanıtlarda görünür kalması, sağlanmazsa null olması)

**Canlı doğrulama (gerçek SMTP teslimatıyla):** `docker compose down -v && docker compose up --build -d` → mailpit "healthy", V21 migration'ı diğer yirmisinin üzerine uygulandı. `employeeEmail=ahmet@dijitalik.local` ile talep oluşturulup ONAYLANDIĞINDA, Mailpit'in REST API'sinde (`GET :8025/api/v1/messages`) gerçek bir e-posta göründü: konu "İzin Talebiniz Onaylandı", içerik doğru tarih aralığıyla "ONAYLANMIŞTIR" metni. İkinci bir talep REDDEDİLDİĞİNDE ikinci bir e-posta (konu "İzin Talebiniz Reddedildi", gövdede gerekçe dahil) göründü. E-postasız oluşturulan üçüncü bir talep onaylandığında HİÇBİR yeni mesaj oluşmadı (toplam hâlâ 2). Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (6), auth (22), organization (59), leave (52), bootstrap (1) = 140 test, 0 hata
docker compose down -v
docker compose up --build -d
# canlı: http://localhost:8025 (Mailpit web arayüzü)
docker compose down
```

---

## US-05.1.1 — Norm kadro tanımlama (Bölüm 5'in ilk story'si — yeni `recruitment` modülü)

**Özet:** Roadmap'in Bölüm 5'ine (İşe Alım) geçişle birlikte, projedeki dördüncü gerçek iş modülü olan `recruitment` kuruldu. `PUT /api/recruitment/staffing-norms` ile bir organizasyon birimi + unvan için norm kadro sayısı tanımlanıyor (upsert: (birim, unvan) çifti için kayıt yoksa oluşturulur, varsa güncellenir); `GET` tüm kayıtları listeler.

**Modül bootstrap'ı (dördüncü tekrar):** Kök `pom.xml`'e `<module>recruitment</module>`, `recruitment/pom.xml` (yalnızca `core`'a bağımlı, `leave/pom.xml` ile aynı şablon), `bootstrap/pom.xml`'e tek satır, `Dockerfile`'a kopyalama adımları. Mimarinin dördüncü kez sorunsuz doğrulanması.

**Tasarım kararları:**
- **Upsert semantiği** (`organization.EmployeeProfileService`, US-03.3.1'deki aynı desen) — doğal anahtar (birim+unvan) zaten benzersiz bir kaydı belirlediğinden ayrı `POST`/`PUT .../{id}` ikilisine gerek yok; DB'de `UNIQUE (organization_unit_id, job_title_id)` kısıtı bu davranışı garanti ediyor.
- `organizationUnitId`/`jobTitleId`'ye DB seviyesinde FK BİLİNÇLİ OLARAK eklenmedi — `recruitment`'ın `organization`'a Java seviyesinde hiçbir görünürlüğü yok (mimari kural); `leave`'in V19 migration'ındaki (`leave_requests.employee_id`) aynı gerekçe, dördüncü tekrarı.
- `normCount` sıfır olabilir (negatif olamaz) — "bu birim+unvan için şu an norm yok/kapalı" durumunu temsil edebilir; kabul kriteri bir alt sınır belirtmiyor, sıfırı yasaklamak keyfi olurdu.
- Rol kısıtlaması eklenmedi — kabul kriteri bundan bahsetmiyor, `organization.JobTitleController`'daki aynı emsal.
- Henüz modül-özel bir exception/handler YOK — upsert deseni hiçbir "bulunamadı" senaryosu üretmiyor (PUT her zaman ya oluşturur ya günceller); bu ihtiyaç gerçek bir 404/409 senaryosu ortaya çıktığında (muhtemelen bir sonraki `recruitment` story'sinde) eklenecek (YAGNI, `organization`/`leave`'in ilk story'lerinden farklı — onlarda ilk gündende gerçek bir "bulunamadı" senaryosu vardı).

**Değişen/eklenen dosyalar:**
- `pom.xml` — `<module>recruitment</module>`
- `bootstrap/pom.xml` — `recruitment` bağımlılığı
- `Dockerfile` — `recruitment/pom.xml`, `recruitment/src` kopyalama adımları
- `recruitment/pom.xml` (yeni modül)
- `recruitment/src/main/resources/db/migration/V22__create_staffing_norms.sql`
- `recruitment/src/main/java/com/digitalik/recruitment/entity/StaffingNorm.java`
- `recruitment/src/main/java/com/digitalik/recruitment/repository/StaffingNormRepository.java`
- `recruitment/src/main/java/com/digitalik/recruitment/service/StaffingNormService.java`
- `recruitment/src/main/java/com/digitalik/recruitment/controller/StaffingNormController.java`
- `recruitment/src/main/java/com/digitalik/recruitment/dto/StaffingNormRequest.java`, `StaffingNormResponse.java`
- `recruitment/src/test/java/com/digitalik/recruitment/RecruitmentTestApplication.java` (yeni modül test bootstrap sınıfı)
- `recruitment/src/test/java/com/digitalik/recruitment/controller/StaffingNormControllerTest.java` (yeni, 6 test)

**Canlı doğrulama:** `docker compose down -v && docker compose up --build -d` (temiz veri hacmiyle; ilk denemede geçici bir Maven artifact indirme hatası nedeniyle build başarısız oldu, ikinci denemede sorunsuz tamamlandı) → V22 migration'ı diğer yirmi birinin üzerine uygulandı. Token olmadan istek → 401; birim=1/unvan=1 için norm=5 tanımlandı; farklı unvan (2) için ayrı bir kayıt (id=2) açıldı; liste 2 kayıt döndürdü; AYNI birim+unvan (1,1) tekrar çağrıldığında normCount=10'a GÜNCELLENDİ (id DEĞİŞMEDİ, hâlâ 1) — upsert doğrulandı; negatif norm sayısı → 400. `psql` ile `audit_log`'da 2 CREATE + 1 UPDATE (`entity_type='StaffingNorm'`) kaydı doğrulandı. Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (6), auth (22), organization (59), leave (52), recruitment (6), bootstrap (1) = 146 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

## US-05.2.1 — Aday başvurusu (CV yükleme, kimlik doğrulamasız erişim)

**Özet:** `POST /api/recruitment/candidates/applications` (`multipart/form-data`) ile bir aday, giriş yapmadan (kimlik doğrulaması gerektirmeden) temel bilgileri + CV dosyasıyla başvuru oluşturuyor — projedeki **ilk herkese açık yazma ucu**.

**Tasarım kararları:**
- `auth.SecurityConfig`'e (US-02.2.3'ten beri tüm uygulamanın tek merkezi güvenlik yapılandırması) yeni bir `permitAll()` kuralı eklendi — `recruitment` modülünün kendisi Spring Security'ye hiç bağımlı değil, kural merkezi kalmaya devam ediyor.
- CV, ayrı bir dosya depolama servisi kurulmadan doğrudan veritabanında (`bytea`) tutuluyor — roadmap Bölüm 9.7'nin ("birden fazla modülde tekrarlanınca genelleştir") ilk kullanım yeri, henüz genelleştirme eşiği yok.
- Herkese açık, kimliksiz bir yazma ucu olduğundan `spring.servlet.multipart.max-file-size/max-request-size: 10MB` eklendi — kaba bir kötüye kullanım/DoS önlemi.
- Tüm `@RequestParam`/`@RequestPart` alanları yine `required = false` + serviste elle doğrulama — US-04.1.2'de keşfedilen "eksik zorunlu parametre → framework istisnası → yanlışlıkla 500" tuzağını (bu kez `MissingServletRequestPartException` için de) tekrarlamamak için.
- `position` alan adı BİLİNÇLİ OLARAK `applied_position`/`appliedPosition` olarak seçildi — `POSITION`, SQL'de ayrılmış bir anahtar kelime (`POSITION(... IN ...)` fonksiyonu); riski baştan ortadan kaldırmak için.

**Canlıda bulunan, düzeltilen bir hata (Hibernate/PostgreSQL uyuşmazlığı):** `Candidate.cvData` başta `@Lob byte[]` idi. Hibernate 6, PostgreSQL'de `@Lob byte[]`'i VARSAYILAN olarak büyük nesne (Large Object, `oid` sütun tipi) mekanizmasına eşliyor — ama V23 migration'ı düz bir `bytea` sütunu oluşturuyordu. `mvn test` (H2 kullanıyor, bu ayrımı yapmıyor) tamamen yeşildi, ama Docker'da gerçek PostgreSQL'e karşı uygulama HİÇ AÇILMADI: "Schema-validation: wrong column type encountered in column [cv_data]... found [bytea], but expecting [oid]". Bu, projenin daha önce de (US-02.1.3) karşılaştığı "`mvn test` yeşil olması tek başına yeterli kanıt değil" dersinin bir tekrarı. Düzeltme: `@Lob` yerine `@JdbcTypeCode(SqlTypes.VARBINARY)` (Hibernate'e sütunu açıkça `bytea` olarak eşlemesini söylüyor).

**Değişen/eklenen dosyalar:**
- `recruitment/src/main/resources/db/migration/V23__create_candidates.sql`
- `recruitment/src/main/java/com/digitalik/recruitment/entity/Candidate.java`
- `recruitment/src/main/java/com/digitalik/recruitment/repository/CandidateRepository.java`
- `recruitment/src/main/java/com/digitalik/recruitment/service/CandidateService.java`
- `recruitment/src/main/java/com/digitalik/recruitment/dto/CandidateResponse.java`
- `recruitment/src/main/java/com/digitalik/recruitment/controller/CandidateController.java`
- `auth/src/main/java/com/digitalik/auth/security/SecurityConfig.java` — yeni `permitAll()` kuralı
- `bootstrap/src/main/resources/application.yml` — `spring.servlet.multipart.max-file-size/max-request-size`
- `recruitment/src/test/java/com/digitalik/recruitment/controller/CandidateControllerTest.java` (yeni, 5 test)

**Canlı doğrulama:** `docker compose down -v && docker compose up --build -d` (temiz veri hacmiyle; entity düzeltmesinden SONRA) → V23 migration'ı diğer yirmi ikisinin üzerine uygulandı, uygulama sorunsuz başladı. Token OLMADAN (`curl -F ...`) başvuru → 201, tüm alanlar doğru döndü; CV'siz başvuru → 400 "CV dosyası boş olamaz"; DİĞER korumalı uçlar (ör. `GET /api/organization/employees`) hâlâ token istiyor → 401 (SecurityConfig değişikliğinin yan etkisi/regresyon olmadığı doğrulandı). `psql` ile `candidates` tablosunda CV'nin doğru boyutta (`length(cv_data)`) kaydedildiği ve `audit_log`'da `entity_type='Candidate'` için bir `CREATE` kaydı doğrulandı. Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (6), auth (22), organization (59), leave (52), recruitment (11), bootstrap (1) = 151 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

## US-05.2.2 — Aday profiline not ekleme ve süreç aşaması değiştirme

**Özet:** `PUT /api/recruitment/candidates/{id}/stage` ile aday süreç aşaması (`APPLICATION/INTERVIEW/OFFER/HIRED/REJECTED`) güncelleniyor; `POST/GET /api/recruitment/candidates/{id}/notes` ile aday profiline not ekleniyor/listeleniyor (çoklu kayıt, salt-ekleme).

**Tasarım kararları:**
- `Candidate.stage`, US-05.2.1'de oluşturulan kayıtlar için migration'da (`ALTER TABLE ... ADD COLUMN stage ... DEFAULT 'APPLICATION'`, sonra `DROP DEFAULT`) geriye dönük dolduruldu — mevcut adaylar otomatik olarak "başvuru" aşamasında başlıyor.
- `CandidateNote`, `organization.EmployeeAsset`'teki aynı desen: çoklu kayıt, salt-ekleme (güncelleme/silme metodu yok), ayrı bir `CandidateNoteController` (`CandidateController`'ın büyümesini önlemek için).
- `CandidateNote.candidateId`, `leave.LeaveRequest.employeeId`'nin AKSİNE gerçek bir DB FK'ye sahip (`REFERENCES candidates(id)`) — `Candidate` AYNI modülde (`recruitment`) olduğundan cross-module kısıt burada geçerli değil; bu ayrım entity javadoc'unda özellikle vurgulandı, karıştırılmasın diye.
- Aşama geçişleri arasında bir durum makinesi (ör. "HIRED'dan geri dönülemez") kurulmadı — kabul kriteri yalnızca "güncellenebilir" diyor (YAGNI).
- **Bu, `recruitment` modülünün İLK gerçek "bulunamadı" senaryosu** — US-05.1.1'in upsert deseni hiç 404 üretmediğinden o story'de `RecruitmentExceptionHandler` yoktu; bu story ile birlikte (`@Order(HIGHEST_PRECEDENCE)` dahil, US-02.1.3'teki zorunlu desen) eklendi.
- Rol kısıtlaması eklenmedi ("İK kullanıcısı olarak" ifadesi roadmap'in çoğu "aktör" ibaresi gibi bir persona, kabul kriterinin kendisi bir yetki kısıtından bahsetmiyor) — modüldeki diğer uçlarla tutarlı emsal.

**Değişen/eklenen dosyalar:**
- `recruitment/src/main/resources/db/migration/V24__add_stage_and_notes_to_candidates.sql`
- `recruitment/src/main/java/com/digitalik/recruitment/entity/CandidateStage.java`, `CandidateNote.java`
- `recruitment/src/main/java/com/digitalik/recruitment/entity/Candidate.java` — `stage` alanı, `changeStage(...)`
- `recruitment/src/main/java/com/digitalik/recruitment/repository/CandidateNoteRepository.java`
- `recruitment/src/main/java/com/digitalik/recruitment/exception/CandidateNotFoundException.java`, `RecruitmentExceptionHandler.java` (yeni modülün ilk exception handler'ı)
- `recruitment/src/main/java/com/digitalik/recruitment/service/CandidateService.java` — `changeStage(...)`; `CandidateNoteService.java` (yeni)
- `recruitment/src/main/java/com/digitalik/recruitment/dto/CandidateStageRequest.java`, `CandidateNoteRequest.java`, `CandidateNoteResponse.java`; `CandidateResponse.java` — `stage` eklendi
- `recruitment/src/main/java/com/digitalik/recruitment/controller/CandidateController.java` — `PUT /{id}/stage`; `CandidateNoteController.java` (yeni)
- `recruitment/src/test/java/com/digitalik/recruitment/controller/CandidateControllerTest.java` — 3 yeni test; `CandidateNoteControllerTest.java` (yeni, 4 test)

**Canlı doğrulama:** `docker compose down -v && docker compose up --build -d` (temiz veri hacmiyle) → V24 migration'ı diğer yirmi üçünün üzerine uygulandı. Başvuru oluşturuldu (`stage: APPLICATION`); aşama `INTERVIEW`'a güncellendi → 200; iki not eklendi → `GET` en yeni önce (id DESC) iki notu doğru sırayla döndürdü; geçersiz aşama değeri → 400; olmayan aday → 404 "Aday bulunamadı". `psql` ile `audit_log`'da `Candidate` için 1 CREATE + 1 UPDATE, `CandidateNote` için 2 CREATE kaydı doğrulandı. Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (6), auth (22), organization (59), leave (52), recruitment (18), bootstrap (1) = 158 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

## US-05.3.1 — İşe alım talebi oluşturma (norm kadro kontrolüyle)

**Özet:** `POST /api/recruitment/hiring-requests` (gövde: `organizationUnitId`, `jobTitleId`) ile bir işe alım talebi `PENDING` durumuyla oluşturuluyor — AMA yalnızca o (birim, unvan) çifti için US-05.1.1'de bir `StaffingNorm` tanımlıysa. Norm yoksa talep GERÇEKTEN reddediliyor (404) — kabul kriterindeki "engellenir" ifadesi tam anlamıyla uygulanıyor.

**Kritik fark — US-04.2.1'in "uyarı gösterir (engellemeyebilir)" deseninin AKSİNE:** `leave.LeaveRequestService`'teki bakiye kontrolü yetersiz bakiyede talebi ENGELLEMİYORDU, yalnızca uyarı ekliyordu. Bu story'de kabul kriteri açıkça "engellenir" diyor — bu yüzden norm kontrolü burada GERÇEK bir ön koşul (400/404 ile reddediyor), bir uyarı değil. İki farklı story'nin bilinçli olarak farklı katılık seviyeleri seçtiği, dikkatle ayırt edilmesi gereken bir nüans.
- `HiringRequest`, `leave.LeaveRequest`'teki (US-04.2.1) aynı deseni izliyor: `status` alanı baştan var (`PENDING/APPROVED/REJECTED`), çünkü roadmap'in bir SONRAKİ story'si (US-05.3.2) zaten onay/ret akışını ekleyecek — bu, US-04.2.1→04.2.2 geçişinde de aynı şekilde önceden kurulmuştu.
- `organizationUnitId`/`jobTitleId`'ye yine DB seviyesinde FK yok — `staffing_norms`'daki (V22) aynı, artık üçüncü kez tekrarlanan gerekçe.
- Onay/ret ve listeleme bu story'nin kapsamında DEĞİL — roadmap bağımlılığı yalnızca US-05.1.1, US-05.3.2 henüz yapılmadı (YAGNI).

**Değişen/eklenen dosyalar:**
- `recruitment/src/main/resources/db/migration/V25__create_hiring_requests.sql`
- `recruitment/src/main/java/com/digitalik/recruitment/entity/HiringRequest.java`, `HiringRequestStatus.java`
- `recruitment/src/main/java/com/digitalik/recruitment/repository/HiringRequestRepository.java`
- `recruitment/src/main/java/com/digitalik/recruitment/exception/StaffingNormNotFoundException.java`
- `recruitment/src/main/java/com/digitalik/recruitment/exception/RecruitmentExceptionHandler.java` — `StaffingNormNotFoundException` → 404 eşlemesi
- `recruitment/src/main/java/com/digitalik/recruitment/service/HiringRequestService.java`
- `recruitment/src/main/java/com/digitalik/recruitment/dto/CreateHiringRequestRequest.java`, `HiringRequestResponse.java`
- `recruitment/src/main/java/com/digitalik/recruitment/controller/HiringRequestController.java`
- `recruitment/src/test/java/com/digitalik/recruitment/controller/HiringRequestControllerTest.java` (yeni, 4 test)

**Canlı doğrulama:** `docker compose down -v && docker compose up --build -d` (temiz veri hacmiyle) → V25 migration'ı diğer yirmi dördünün üzerine uygulandı. Norm tanımlanmadan talep → 404 "Norm kadro bulunamadı" (ENGELLENDİ); norm (birim=1, unvan=1, normCount=3) tanımlandıktan SONRA aynı birim+unvan için talep → 201, `PENDING`; farklı bir unvan (normu olmayan) için talep → yine 404; token olmadan istek → 401. `psql` ile `audit_log`'da `entity_type='HiringRequest'` için 1 `CREATE` kaydı doğrulandı. Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (6), auth (22), organization (59), leave (52), recruitment (22), bootstrap (1) = 162 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

## US-05.3.2 — İşe alım talebinin yönetici→İK onay adımından geçmesi (Bölüm 5.3 tamamlandı)

**Özet:** `HiringRequestStatus`'a ara bir durum (`MANAGER_APPROVED`) eklendi: `PENDING` → (yönetici) → `MANAGER_APPROVED` → (İK) → `APPROVED`; `REJECTED` her iki aşamada da gerçekleşebilir. `PUT /{id}/manager-decision` ve `PUT /{id}/hr-decision` iki ayrı uç.

**Roadmap'in açık talimatı — AYNI KOD DEĞİL:** Bölüm 5.3'ün notu ("İşe Alım'daki onay adımı, İzin modülündeki mekanizmayla aynı kod değil, benzer desende ayrı bir uygulama") gereği, `leave.LeaveRequestAccessGuard`/`LeaveExceptionHandler`'daki hiçbir sınıf import edilmedi ya da miras alınmadı — `recruitment` kendi `HiringRequestAccessGuard`'ını, kendi `RecruitmentExceptionHandler` eşlemesini, kendi `HiringRequestService` durum geçişlerini yazdı. Yalnızca DESEN (rol bazlı + istemci taraflı ekip listesi kontrolü, `@Order(HIGHEST_PRECEDENCE)` zorunluluğu) tekrarlandı — bu, roadmap'in kendi "Genelleştirme tetikleyicisi" notunun ("İzin ve İşe Alım aynı deseni İKİ KEZ, bağımsız kodla uygulamış olacak — Onay Motoru'nu (Bölüm 9.2) değerlendirmek için doğru zaman, henüz ZORUNLU değil") tam olarak öngördüğü an. Bölüm 9.2 şu an için değerlendirilmedi (henüz üçüncü bir kullanım yok), yalnızca bu tetikleyicinin gerçekleştiği not edildi.
- **İki aşama, İKİ FARKLI yetkilendirme modeli:** `manager-decision`, US-04.2.2'deki AYNI güven-sınırı kararıyla (istemci taraflı `teamOrganizationUnitIds` listesi — `leave`'deki `teamEmployeeIds`'in birebir karşılığı, ama `employeeId` yerine doğrudan `organizationUnitId` üzerinden, çünkü `HiringRequest` zaten birimi doğrudan taşıyor, bir çalışan kaydı üzerinden dolaylı çözümlemeye gerek yok) YONETICI rolünü kısıtlıyor; `hr-decision` İSE ekip kısıtı OLMADAN yalnızca ADMIN/IK rolünü istiyor — İK organizasyon geneli karar verir, belirli bir birime bağlı değildir (leave'de bu ayrım yoktu, tek aşamalı onayın tamamı aynı kısıtı paylaşıyordu).
- Durum geçiş doğrulaması: `hr-decision`, talep hâlâ `PENDING` iken çağrılırsa "Bu talep henüz yönetici onayından geçmedi" (400) — `MANAGER_APPROVED` dışındaki her durumda (zaten `APPROVED`/`REJECTED` olsa da) net bir hata veriyor.
- Ret gerekçesi eklenmedi (US-04.2.2'nin aksine) — bu story'nin kabul kriteri bunu istemiyor.

**Değişen/eklenen dosyalar:**
- `recruitment/pom.xml` — `spring-security-core`
- `recruitment/src/main/java/com/digitalik/recruitment/entity/HiringRequestStatus.java` — `MANAGER_APPROVED` eklendi
- `recruitment/src/main/java/com/digitalik/recruitment/entity/HiringRequest.java` — `approveByManager()`, `rejectByManager()`, `approveByHr()`, `rejectByHr()`
- `recruitment/src/main/java/com/digitalik/recruitment/exception/HiringRequestNotFoundException.java` (yeni)
- `recruitment/src/main/java/com/digitalik/recruitment/exception/RecruitmentExceptionHandler.java` — `HiringRequestNotFoundException` → 404, `AuthorizationDeniedException` → 403 eşlemeleri
- `recruitment/src/main/java/com/digitalik/recruitment/security/HiringRequestAccessGuard.java` (yeni)
- `recruitment/src/main/java/com/digitalik/recruitment/service/HiringRequestService.java` — `managerDecide(...)`, `hrDecide(...)`
- `recruitment/src/main/java/com/digitalik/recruitment/dto/HiringRequestDecisionRequest.java` (yeni)
- `recruitment/src/main/java/com/digitalik/recruitment/controller/HiringRequestController.java` — `PUT /{id}/manager-decision`, `PUT /{id}/hr-decision`
- `recruitment/src/test/java/com/digitalik/recruitment/security/HiringRequestAccessGuardTest.java` (yeni, 4 test)
- `recruitment/src/test/java/com/digitalik/recruitment/controller/HiringRequestControllerTest.java` — 5 yeni test

**Canlı doğrulama:** Yeni migration gerekmedi (`status` kolonu zaten VARCHAR). Norm tanımlanıp bir talep oluşturuldu (`organizationUnitId=10`); İK, talep hâlâ `PENDING` iken `hr-decision` denedi → 400 "Bu talep henüz yönetici onayından geçmedi"; YONETICI rolündeki bir test kullanıcısı, `teamOrganizationUnitIds` listesinde `10` OLMADAN → 403; `10`'u İÇEREN listeyle → 200, `MANAGER_APPROVED`; ardından İK onayladı → 200, `APPROVED`. `psql` ile `audit_log`'da her karar için ayrı bir `UPDATE` kaydı doğrulandı. Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (6), auth (22), organization (59), leave (52), recruitment (31), bootstrap (1) = 171 test, 0 hata
docker compose up --build -d
docker compose down
```

---

## US-05.4.1 — Aday mülakat kaydı (tarih/katılımcı/sonuç)

**Özet:** `POST/GET /api/recruitment/candidates/{candidateId}/interviews` ile bir adaya mülakat kaydı (tarih/katılımcı/sonuç) eklenip listeleniyor — çoklu kayıt, salt-ekleme.

**Tasarım kararları:**
- `Interview`, `CandidateNote`'daki (US-05.2.2) aynı desen: çoklu kayıt, gerçek DB FK'si (`candidates` AYNI modülde), ayrı bir controller (`CandidateController`'ı büyütmemek için).
- `participants`/`result` BİLİNÇLİ OLARAK düz metin — projede henüz mülakatçı için bir kullanıcı/çalışan referans mekanizması yok, kabul kriteri de yapılandırılmış bir puanlama istemiyor (YAGNI).
- `findByCandidateIdOrderByInterviewDateDescIdDesc` — `id` ikincil sıralama anahtarı BAŞTAN eklendi (US-03.4.1'de canlıda bulunan aynı sınıf hatanın üçüncü kez proaktif olarak önlenmesi).
- Rol kısıtlaması eklenmedi — kabul kriteri bundan bahsetmiyor.

**Değişen/eklenen dosyalar:**
- `recruitment/src/main/resources/db/migration/V26__create_interviews.sql`
- `recruitment/src/main/java/com/digitalik/recruitment/entity/Interview.java`
- `recruitment/src/main/java/com/digitalik/recruitment/repository/InterviewRepository.java`
- `recruitment/src/main/java/com/digitalik/recruitment/service/InterviewService.java`
- `recruitment/src/main/java/com/digitalik/recruitment/dto/CreateInterviewRequest.java`, `InterviewResponse.java`
- `recruitment/src/main/java/com/digitalik/recruitment/controller/InterviewController.java`
- `recruitment/src/test/java/com/digitalik/recruitment/controller/InterviewControllerTest.java` (yeni, 5 test)

**Canlı doğrulama:** `docker compose down -v && docker compose up --build -d` (temiz veri hacmiyle) → V26 migration'ı diğer yirmi beşinin üzerine uygulandı. Bir adaya iki mülakat kaydı eklendi; `GET` en yeni (17 Ağustos) önce, sonra (10 Ağustos) doğru sırayla döndürdü; tarih olmadan → 400 "Mülakat tarihi boş olamaz"; olmayan aday → 404 "Aday bulunamadı". `psql` ile `audit_log`'da `entity_type='Interview'` için 2 `CREATE` kaydı doğrulandı. Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (6), auth (22), organization (59), leave (52), recruitment (36), bootstrap (1) = 176 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

## US-05.4.2 — Adayı çalışan kaydına dönüştürme (Bölüm 5 — İşe Alım tamamlandı)

**Özet:** `POST /api/recruitment/candidates/{id}/convert-to-employee` ile aday "dönüştürüldü" olarak işaretlenir (`convertedAt` doldurulur, `stage` → `HIRED`) ve `EmployeeDraftResponse` (firstName/lastName/email) döner. Kabul kriteri ZATEN açıkça "manuel tetiklemeli, tam otomatik senkron değil" diyor — bu uç `organization.Employee` tablosunda GERÇEK bir kayıt OLUŞTURMAZ; İK kullanıcısı bu taslak veriyle `POST /api/organization/employees`'i AYRICA, kendisi çağırır (`nationalId`/`hireDate` gibi adayda bulunmayan alanları elle tamamlayarak).

**Kabul kriterinin kendisi mimari kısıtı doğruluyor:** Bu, projede ("manuel tetiklemeli, tam otomatik senkron değil") kabul kriterinin AÇIKÇA İSTEDİĞİ davranışın, `recruitment`'ın `organization`'a bağımlı olmaması mimari kuralıyla TAM ÖRTÜŞTÜĞÜ nadir bir an — genellikle bu kısıt bir "bilinen sınırlama" olarak dokümante ediliyordu (bkz. US-04.2.2/US-05.3.2'deki güven-sınırı notları), burada ise story'nin kendisi zaten bu tasarımı istiyor. Ek bir orkestrasyon/senkron mekanizması kurulmadı.
- `Candidate.convertToEmployee()`, aynı zamanda `stage`'i `HIRED`'a geçiriyor — mantıksal olarak tutarlı bir yan etki (dönüştürülen bir aday zaten işe alınmış demektir), ayrı bir "önce HIRED'a geçir, sonra dönüştür" iki adımlı akış zorunlu kılınmadı (YAGNI).
- İkinci kez dönüştürme denemesi engellendi (`isConverted()` kontrolü, 400) — idempotency/yanlışlıkla tekrar tetikleme koruması.
- `EmployeeDraftResponse`, `organization.CreateEmployeeRequest`'in bir alt kümesini (yalnızca adaydan türetilebilen alanlar) yansıtan, `recruitment` modülüne YEREL bir DTO — organization'daki gerçek DTO import edilmedi (cross-module bağımlılık kurulmadı), küçük bir şekil tekrarı kabul edilen bir bedel.

**Değişen/eklenen dosyalar:**
- `recruitment/src/main/resources/db/migration/V27__add_converted_at_to_candidates.sql`
- `recruitment/src/main/java/com/digitalik/recruitment/entity/Candidate.java` — `convertedAt`, `isConverted()`, `convertToEmployee()`
- `recruitment/src/main/java/com/digitalik/recruitment/service/CandidateService.java` — `convertToEmployee(...)`
- `recruitment/src/main/java/com/digitalik/recruitment/dto/EmployeeDraftResponse.java` (yeni)
- `recruitment/src/main/java/com/digitalik/recruitment/controller/CandidateController.java` — `POST /{id}/convert-to-employee`
- `recruitment/src/test/java/com/digitalik/recruitment/controller/CandidateControllerTest.java` — 3 yeni test

**Canlı doğrulama:** `docker compose down -v && docker compose up --build -d` (temiz veri hacmiyle) → V27 migration'ı diğer yirmi altısının üzerine uygulandı. Bir başvuru oluşturulup dönüştürüldü → 200, taslak (ad/soyad/e-posta) doğru döndü; tekrar dönüştürme denemesi → 400 "Bu aday zaten bir çalışan kaydına dönüştürülmüş"; olmayan aday → 404; token olmadan istek → 401 (bu uç herkese açık DEĞİL, yalnızca `/applications` öyle — regresyon yok). `psql` ile `candidates.stage='HIRED'` ve `converted_at` dolu olduğu doğrulandı. **Tam döngü doğrulandı:** taslak veriyle GERÇEKTEN `POST /api/organization/employees` çağrıldı → 201, gerçek bir çalışan kaydı oluştu — "manuel tetiklemeli" akışın uçtan uca çalıştığı kanıtlandı. `audit_log`'da `Candidate` için 1 CREATE + 1 UPDATE (dönüştürme) kaydı doğrulandı. Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (6), auth (22), organization (59), leave (52), recruitment (39), bootstrap (1) = 179 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

## US-06.1.1 — Hedef/yetkinlik tanımlama (Bölüm 6 — Performans başladı, altıncı iş modülü: `performance`)

**Özet:** Roadmap'in Bölüm 6'sına (Performans) geçişle birlikte, projedeki altıncı gerçek iş modülü olan `performance` kuruldu. `POST/GET/PUT/DELETE /api/performance/goals` ve aynı şekilde `/api/performance/competencies` ile hedef/yetkinlik (ad, ağırlık) tanımlanıyor. Kabul kriteri: "Ağırlık toplamı validasyona tabidir" — bir tür (hedef VEYA yetkinlik) içindeki TÜM kayıtların ağırlık toplamı 100'ü geçemez.

**Modül bootstrap'ı (beşinci tekrar):** Kök `pom.xml`'e `<module>performance</module>`, `performance/pom.xml` (yalnızca `core`'a bağımlı), `bootstrap/pom.xml`'e tek satır, `Dockerfile`'a kopyalama adımları.

**Tasarım kararları:**
- **`Goal` ve `Competency`, BİLİNÇLİ OLARAK ayrı entity/tablo** — aynı şekle (ad, ağırlık) sahip olsalar da, tek bir "tür" alanlı ortak tabloya BİRLEŞTİRİLMEDİ. Bu, `organization.OrganizationUnit`/`JobTitle`'ın (roadmap Bölüm 3.1) da AYNI ŞEKİLDE ayrı tutulmasıyla tutarlı bir proje konvansiyonu — yapısal benzerlik, kavramsal ayrılığı ortadan kaldırmıyor.
- **Ağırlık toplamı doğrulaması İKİ AYRI HAVUZ**: hedeflerin toplamı kendi içinde ≤100, yetkinliklerin toplamı KENDİ İÇİNDE ayrı ve bağımsız ≤100 — ikisi birbirini etkilemiyor (canlı doğrulamada özellikle test edildi). Bu, master-requirements'taki FR-309'un ("yönetici değerlendirmesi Yetkinlik %40 / Hedef %50 / Anket %10" gibi ayrı üst-seviye kategoriler) ima ettiği modelle tutarlı — ilham kaynağı olarak.
- Doğrulama DB seviyesinde bir CHECK kısıtı DEĞİL (tek bir satır kendi başına toplamı bilemez), servis seviyesinde: `create`/`update` her çağrıldığında TÜM mevcut kayıtlar (güncellemede kendisi HARİÇ — `existsByNationalIdAndIdNot` desenindeki gibi) toplanıp yeni değerle karşılaştırılıyor.
- Tekil ağırlık için de basit bir aralık kontrolü (1-100) eklendi — kabul kriterinin dolaylı, bariz bir gereği (0 veya negatif bir ağırlık ya da 100'den büyük tekil bir değer anlamsız).
- Tam CRUD (create/list/update/delete) — `organization.JobTitleController`'daki ("basit referans listesi") aynı kapsam emsali.
- Rol kısıtlaması eklenmedi — kabul kriteri bundan bahsetmiyor.

**Değişen/eklenen dosyalar:**
- `pom.xml` — `<module>performance</module>`
- `bootstrap/pom.xml` — `performance` bağımlılığı
- `Dockerfile` — `performance/pom.xml`, `performance/src` kopyalama adımları
- `performance/pom.xml` (yeni modül)
- `performance/src/main/resources/db/migration/V28__create_goals_and_competencies.sql`
- `performance/src/main/java/com/digitalik/performance/entity/Goal.java`, `Competency.java`
- `performance/src/main/java/com/digitalik/performance/repository/GoalRepository.java`, `CompetencyRepository.java`
- `performance/src/main/java/com/digitalik/performance/exception/GoalNotFoundException.java`, `CompetencyNotFoundException.java`, `PerformanceExceptionHandler.java`
- `performance/src/main/java/com/digitalik/performance/service/GoalService.java`, `CompetencyService.java`
- `performance/src/main/java/com/digitalik/performance/dto/GoalRequest.java`, `GoalResponse.java`, `CompetencyRequest.java`, `CompetencyResponse.java`
- `performance/src/main/java/com/digitalik/performance/controller/GoalController.java`, `CompetencyController.java`
- `performance/src/test/java/com/digitalik/performance/PerformanceTestApplication.java` (yeni modül test bootstrap sınıfı)
- `performance/src/test/java/com/digitalik/performance/controller/GoalControllerTest.java` (yeni, 9 test), `CompetencyControllerTest.java` (yeni, 5 test)

**Canlı doğrulama:** `docker compose down -v && docker compose up --build -d` (temiz veri hacmiyle) → V28 migration'ı diğer yirmi yedisinin üzerine uygulandı. Token olmadan istek → 401; 40+30 ağırlıklı iki hedef oluşturuldu (toplam 70); 40 daha eklemeye çalışıldığında → 400 "Hedeflerin ağırlık toplamı 100'ü geçemez (mevcut toplam: 70, eklenmek istenen: 40)"; TAM 30 eklendiğinde (toplam tam 100) → 201 (sınırda izin verildiği doğrulandı); ayrıca 90 ağırlıklı bir YETKİNLİK eklendi → 201 (hedeflerin 100'e ulaşmış olması yetkinlik havuzunu ETKİLEMEDİ — iki ayrı havuz doğrulandı). `psql` ile `audit_log`'da 3 `Goal` + 1 `Competency` CREATE kaydı doğrulandı. Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (6), auth (22), organization (59), leave (52), recruitment (39), performance (14), bootstrap (1) = 193 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

## US-06.1.2 — Puanlama skalası tanımlama (Feature 06.1 tamamlandı)

**Özet:** `PUT/GET /api/performance/rating-scale` ile sistem genelinde TEK bir puanlama skalası (ör. 1-5) tanımlanıp görüntüleniyor.

**Tasarım kararları:**
- `RatingScale`, `Goal`/`Competency`'nin (US-06.1.1) AKSİNE bir referans LİSTESİ değil, TEKİL bir yapılandırma kaydı — kabul kriterinin "puanlama skalasını tanımlamak" (tekil) ifadesiyle tutarlı. `PUT` upsert semantiğinde (`organization.EmployeeProfileService`'teki, US-03.3.1'deki aynı desen): kayıt yoksa oluşturulur, varsa (tek satır her zaman) güncellenir — ayrı `POST`/`PUT .../{id}` ikilisine gerek yok.
- Kabul kriterindeki "Skala değerlendirme formunda kullanılır" ifadesi İLERİYE DÖNÜK bir gerekçe — değerlendirme formu (Feature 06.2) henüz kurulmadı; bu story yalnızca skalanın TANIMLANMASINI kapsıyor, gerçek kullanım Feature 06.2'de gelecek.
- Basit doğrulama: alt sınır ≥1, üst sınır > alt sınır — kabul kriterinin dolaylı, bariz bir gereği.
- Rol kısıtlaması eklenmedi — kabul kriteri bundan bahsetmiyor.

**Değişen/eklenen dosyalar:**
- `performance/src/main/resources/db/migration/V29__create_rating_scale.sql`
- `performance/src/main/java/com/digitalik/performance/entity/RatingScale.java`
- `performance/src/main/java/com/digitalik/performance/repository/RatingScaleRepository.java`
- `performance/src/main/java/com/digitalik/performance/exception/RatingScaleNotFoundException.java`
- `performance/src/main/java/com/digitalik/performance/exception/PerformanceExceptionHandler.java` — `RatingScaleNotFoundException` → 404 eşlemesi
- `performance/src/main/java/com/digitalik/performance/service/RatingScaleService.java`
- `performance/src/main/java/com/digitalik/performance/dto/RatingScaleRequest.java`, `RatingScaleResponse.java`
- `performance/src/main/java/com/digitalik/performance/controller/RatingScaleController.java`
- `performance/src/test/java/com/digitalik/performance/controller/RatingScaleControllerTest.java` (yeni, 5 test)

**Canlı doğrulama:** V29 migration'ı diğer yirmi sekizinin üzerine uygulandı (mevcut veri hacmiyle). Tanımlanmadan `GET` → 404 "Puanlama skalası henüz tanımlanmamış"; `PUT` (1-5) → 200, `id=1`; tekrar `PUT` (1-10) → AYNI `id=1` güncellendi (yeni satır açılmadı — tekillik doğrulandı); geçersiz aralık (min==max) → 400; token olmadan istek → 401. `psql` ile `audit_log`'da 1 `CREATE` + 1 `UPDATE` (`entity_type='RatingScale'`) kaydı doğrulandı. Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (6), auth (22), organization (59), leave (52), recruitment (39), performance (19), bootstrap (1) = 198 test, 0 hata
docker compose up --build -d
docker compose down
```

---

## US-06.2.1 — Öz değerlendirme (Feature 06.2 başladı)

**Özet:** `GET /api/performance/self-assessments/form` — kabul kriterinin ("Form, tanımlı hedef/yetkinlik setini gösterir") AÇIKÇA istediği bileşen: mevcut hedef/yetkinlik listelerini ve puanlama skalasını TEK bir yanıtta birleştiriyor. `POST /api/performance/self-assessments` — çalışan, bu setten seçtiği kalemlere skalanın sınırları içinde puan vererek öz değerlendirmesini gönderiyor.

**Tasarım kararları:**
- `SelfAssessment` (üst kayıt) + `SelfAssessmentScore` (çoklu, her biri tek bir hedef/yetkinlik için puan) — `organization.EmployeeAsset`'teki aynı "üst kayıt + çoklu alt kayıt" deseni. Bir çalışanın birden fazla öz değerlendirmesi olabilir (dönemsel döngüler), tekillik kısıtı yok.
- `SelfAssessmentScore.itemId`, `itemType`'a (GOAL/COMPETENCY) göre FARKLI iki tabloya işaret edebildiğinden TEK bir DB FK ile kısıtlanamıyor — referans bütünlüğü (belirtilen hedef/yetkinliğin GERÇEKTEN var olması) servis seviyesinde doğrulanıyor.
- **Eksiksiz gönderim ZORUNLU KILINMADI** — kabul kriteri yalnızca "Form, tanımlı hedef/yetkinlik setini gösterir" diyor, TÜM kalemlerin puanlanması şart koşulmuyor (YAGNI); yalnızca gönderilen HER puanın gerçekten var olan bir kaleme ve skala sınırlarına uyduğu doğrulanıyor.
- `GET /form`, `GoalService`/`CompetencyService`/`RatingScaleService`'i doğrudan controller seviyesinde birleştiren salt-okuma bir kompozisyon — bu üç servisin kendi sorumluluğu tekrar edilmedi, yalnızca sonuçları TEK bir yanıtta toplandı.
- Skala tanımlanmadan (US-06.1.2) hem form görüntülenemiyor hem de gönderim yapılamıyor (`RatingScaleNotFoundException` doğal olarak yayılıyor, 404) — mantıksal bir ön koşul (skala olmadan puan verilemez), ayrıca kod yazılmadı.
- Rol kısıtlaması eklenmedi — kabul kriteri bundan bahsetmiyor.

**Değişen/eklenen dosyalar:**
- `performance/src/main/resources/db/migration/V30__create_self_assessments.sql`
- `performance/src/main/java/com/digitalik/performance/entity/AssessmentItemType.java`, `SelfAssessment.java`, `SelfAssessmentScore.java`
- `performance/src/main/java/com/digitalik/performance/repository/SelfAssessmentRepository.java`, `SelfAssessmentScoreRepository.java`
- `performance/src/main/java/com/digitalik/performance/service/SelfAssessmentService.java`
- `performance/src/main/java/com/digitalik/performance/dto/SelfAssessmentFormResponse.java`, `SelfAssessmentScoreRequest.java`, `SubmitSelfAssessmentRequest.java`, `SelfAssessmentScoreResponse.java`, `SelfAssessmentResponse.java`
- `performance/src/main/java/com/digitalik/performance/controller/SelfAssessmentController.java`
- `performance/src/test/java/com/digitalik/performance/controller/SelfAssessmentControllerTest.java` (yeni, 7 test)

**Canlı doğrulama:** V30 migration'ı diğer yirmi dokuzunun üzerine uygulandı. Skala tanımlanmadan form → 404; skala (1-5) + bir hedef + bir yetkinlik tanımlandıktan sonra form doğru veriyi döndürdü; öz değerlendirme (GOAL=4, COMPETENCY=5) gönderildi → 201, iki puan da doğru kaydedildi; skala dışı puan (6) → 400 "Puan 1 ile 5 arasında olmalıdır"; olmayan hedef id'si → 400 "Belirtilen GOAL bulunamadı"; token olmadan istek → 401. `psql` ile `audit_log`'da `SelfAssessment` için 1 CREATE + `SelfAssessmentScore` için 2 CREATE kaydı doğrulandı. Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (6), auth (22), organization (59), leave (52), recruitment (39), performance (26), bootstrap (1) = 205 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

## US-06.2.2 — Yönetici değerlendirmesi

**Özet:** `POST /api/performance/manager-assessments` — bir yönetici, bağlı bir çalışan için hedef/yetkinlik kalemlerine puan verir. Kabul kriteri: "Yönetici yalnızca kendi ekibini değerlendirebilir."

**Tasarım kararları:**
- `ManagerAssessment`/`ManagerAssessmentScore`, `SelfAssessment`/`SelfAssessmentScore`'un (US-06.2.1) AYNI şekli ama BİLİNÇLİ OLARAK AYRI tabloları/entity'leri — "öz değerlendirme" ve "yönetici değerlendirmesi" farklı kavramlar; projenin baştan beri sürdürdüğü "aynı kod değil, benzer desende ayrı uygulama" konvansiyonu (bkz. `Goal`/`Competency`, `leave`/`recruitment`'ın ayrı onay adımları). `AssessmentItemType` enum'u ise saf bir veri sözlüğü olduğundan (GOAL/COMPETENCY) AYNEN yeniden kullanıldı, kopyalanmadı.
- **"Yalnızca kendi ekibini" kısıtı**, `organization.TeamController`'daki (US-04.2.2) ve `leave`'teki (US-05.3.2) AYNI "istemci taraflı ekip listesi" desenini kullanıyor: çağıran, `teamEmployeeIds` sorgu parametresiyle kendi ekibinin id listesini sağlıyor; modüller arası Java bağımlılığı olmadığından `performance` modülü kendi başına "bu yöneticinin ekibi kim" sorusunu cevaplayamıyor — güven sınırı yine kod içinde açıkça belirtildi.
- **Sadeleştirme:** `LeaveRequestAccessGuard`/`HiringRequestAccessGuard`'ın aksine burada ayrı bir guard `@Component` YAZILMADI. O ikisinde kontrol, VAR OLAN bir kaydın (izin talebi/işe alım talebi) repository'den aranmasını gerektiriyordu. Burada ise kontrol edilecek `employeeId` doğrudan istek gövdesinde (`SubmitManagerAssessmentRequest.employeeId()`) mevcut — bu yüzden `@PreAuthorize` doğrudan `#request.employeeId()` üzerinde inline SpEL ile çalışıyor: `hasAnyRole('ADMIN','IK') or (hasRole('YONETICI') and #teamEmployeeIds != null and #teamEmployeeIds.contains(#request.employeeId()))`. Gereksiz bir wrapper sınıf yazılmadı.
- `performance/pom.xml`'e `spring-security-core` eklendi — `organization`/`leave`/`recruitment`'taki aynı gerekçe: `@PreAuthorize`/`hasRole` kullanabilmek için tam `spring-boot-starter-security` DEĞİL, yalnızca çekirdek kütüphane; asıl `@EnableMethodSecurity`/filtre zinciri merkezi olarak `auth.SecurityConfig`'te kalıyor.
- `PerformanceExceptionHandler`'a `AuthorizationDeniedException` → 403 eşlemesi eklendi (`leave.LeaveExceptionHandler`'daki, US-04.2.2'deki aynı ders: `@Order(Ordered.HIGHEST_PRECEDENCE)` olmadan/eşleme olmadan bu modülün kendi advice'ı reddi yakalamazsa `GlobalExceptionHandler`'ın genel yakalayıcısına düşüp 500 döner).
- Puan doğrulama mantığı (skala sınırları, kalem varlığı) `SelfAssessmentService`'ten BİREBİR mirror edildi — aynı kısıtlar geçerli (en az bir puan, geçerli `itemType`, var olan kalem, skala aralığı).

**Değişen/eklenen dosyalar:**
- `performance/pom.xml` — `spring-security-core` eklendi
- `performance/src/main/resources/db/migration/V31__create_manager_assessments.sql`
- `performance/src/main/java/com/digitalik/performance/entity/ManagerAssessment.java`, `ManagerAssessmentScore.java`
- `performance/src/main/java/com/digitalik/performance/repository/ManagerAssessmentRepository.java`, `ManagerAssessmentScoreRepository.java`
- `performance/src/main/java/com/digitalik/performance/service/ManagerAssessmentService.java`
- `performance/src/main/java/com/digitalik/performance/dto/SubmitManagerAssessmentRequest.java`, `ManagerAssessmentResponse.java`
- `performance/src/main/java/com/digitalik/performance/controller/ManagerAssessmentController.java`
- `performance/src/main/java/com/digitalik/performance/exception/PerformanceExceptionHandler.java` — `AuthorizationDeniedException` → 403 eşlemesi
- `performance/src/test/java/com/digitalik/performance/controller/ManagerAssessmentControllerTest.java` (yeni, 5 test — `@PreAuthorize` bu izole modül test bağlamında uygulanmıyor, `leave`/`organization`'daki aynı sınırlama; yalnızca Docker üzerinden canlı doğrulandı)

**Canlı doğrulama:** V31 migration'ı diğer otuzunun üzerine uygulandı. `psql` ile doğrudan eklenen bir YONETICI ve bir CALISAN test kullanıcısı, ADMIN token'ıyla `POST /api/auth/users/{id}/roles` ile rollendirildi. Skala (1-5) ve bir hedef ADMIN olarak tanımlandı. Sonra: ADMIN, `teamEmployeeIds` olmadan gönderim → 201 (rol bypass'ı doğrulandı); YONETICI, kendi ekibindeki bir çalışan için (`teamEmployeeIds=20,21`, `employeeId=20`) → 201; YONETICI, ekibi DIŞINDAKİ bir çalışan için (`employeeId=99`) → 403 "Bu işlemi yapmaya yetkiniz yok."; YONETICI, `teamEmployeeIds` HİÇ verilmeden → 403; CALISAN, `teamEmployeeIds` verilse bile → 403; token olmadan istek → 401. `psql` ile `audit_log`'da başarılı iki gönderim için `ManagerAssessment`/`ManagerAssessmentScore` CREATE kayıtları doğrulandı (reddedilen istekler için hiçbir kayıt oluşmadı). Test verisi temizlendi, sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (6), auth (22), organization (59), leave (52), recruitment (39), performance (31), bootstrap (1) = 210 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

## US-06.2.3 — Nihai not hesaplama

**Özet:** `GET /api/performance/manager-assessments/{id}/final-score` — bir yönetici değerlendirmesinin hedef ve yetkinlik puanlarından, parametrik kategori ağırlıklarıyla basit ağırlıklı bir nihai not hesaplar. `PUT/GET /api/performance/assessment-weight-config` — Hedef %/Yetkinlik % ağırlıklarını tanımlama/görüntüleme.

**Tasarım kararları:**
- İki aşamalı ağırlıklandırma: önce her KATEGORİ (GOAL/COMPETENCY) içinde, puanlanan kalemlerin KENDİ ağırlıklarıyla (US-06.1.1'deki `Goal`/`Competency.weight`) ağırlıklı ortalaması alınıyor; sonra bu iki kategori-skoru, `AssessmentWeightConfig`'teki PARAMETRİK kategori ağırlıklarıyla (kabul kriterinin "ağırlıklar parametrik" ifadesi) birleştiriliyor. İki farklı ağırlık kavramı (kalem-içi vs. kategori-arası) zaten VAR OLAN veriden türetildiği için yeni bir kavram icat edilmedi.
- `AssessmentWeightConfig`, `RatingScale`'daki (US-06.1.2) AYNI "sistem genelinde tek yapılandırma kaydı, `PUT` upsert" deseni — V32 migration'ı, servis seviyesinde find-or-create.
- Ağırlıkların toplamının TAM 100 olması zorunlu kılındı (`Goal`/`Competency`'nin kendi içindeki "≤100" kuralının AKSİNE) — burada iki kategori TÜM notu oluşturduğundan, toplamın 100'den farklı olması nihai notu anlamsız kılar.
- **"Sonuç izlenebilir" kabul kriteri**, yanıtta yalnızca `finalScore` değil, ara sonuçların TAMAMI (`goalScore`, `competencyScore`, kullanılan `goalWeight`/`competencyWeight`) döndürülerek karşılandı — hesaba nasıl varıldığı görülebiliyor, ayrıca bir "hesaplama geçmişi" tablosu YAZILMADI (YAGNI): sonuç, mevcut puanlar/ağırlıklarla HER ZAMAN yeniden hesaplanabilir/doğrulanabilir, bu da onu zaten izlenebilir kılıyor.
- Bir kategoride (örn. yalnızca hedefler puanlanmış, yetkinlik hiç puanlanmamış) hiç puan yoksa o kategori SIFIR sayılmıyor, tamamen DIŞLANIYOR ve kalan kategorinin ağırlığıyla normalize ediliyor — aksi halde eksik bir kategori notu haksız yere düşürürdü.
- FR-309'daki tam zenginlik (1./2. yönetici ayrı ağırlıkları, anket katkısı, GM ±%10 müdahalesi) BİLİNÇLİ OLARAK kapsam dışı bırakıldı — roadmap'in bu story için yazdığı kabul kriteri yalnızca "basit ağırlıklı" bir hesap istiyor; ileriye dönük FR zenginliği ayrı story'lere (roadmap'te henüz yok) bırakıldı.
- Rol kısıtlaması eklenmedi — kabul kriteri bundan bahsetmiyor.

**Değişen/eklenen dosyalar:**
- `performance/src/main/resources/db/migration/V32__create_assessment_weight_config.sql`
- `performance/src/main/java/com/digitalik/performance/entity/AssessmentWeightConfig.java`
- `performance/src/main/java/com/digitalik/performance/repository/AssessmentWeightConfigRepository.java`
- `performance/src/main/java/com/digitalik/performance/exception/AssessmentWeightConfigNotFoundException.java`, `ManagerAssessmentNotFoundException.java`
- `performance/src/main/java/com/digitalik/performance/service/AssessmentWeightConfigService.java`, `FinalScoreService.java`
- `performance/src/main/java/com/digitalik/performance/dto/AssessmentWeightConfigRequest.java`, `AssessmentWeightConfigResponse.java`, `FinalScoreResponse.java`
- `performance/src/main/java/com/digitalik/performance/controller/AssessmentWeightConfigController.java`
- `performance/src/main/java/com/digitalik/performance/controller/ManagerAssessmentController.java` — `GET /{id}/final-score` eklendi
- `performance/src/main/java/com/digitalik/performance/exception/PerformanceExceptionHandler.java` — `AssessmentWeightConfigNotFoundException`/`ManagerAssessmentNotFoundException` → 404 eşlemeleri
- `performance/src/test/java/com/digitalik/performance/controller/AssessmentWeightConfigControllerTest.java` (yeni, 3 test), `FinalScoreControllerTest.java` (yeni, 4 test)

**Canlı doğrulama:** V32 migration'ı diğer otuz birinin üzerine uygulandı. Skala (1-5) + iki hedef (ağırlık 60/40) + bir yetkinlik (ağırlık 100) tanımlandı; bir yönetici değerlendirmesi (GOAL=4/GOAL=2/COMPETENCY=5) gönderildi. Ağırlıklandırma TANIMLANMADAN final-score → 404 "Ağırlıklandırma bulunamadı"; Hedef %50/Yetkinlik %50 tanımlandıktan sonra final-score → 200, `goalScore=3.2` ((4×60+2×40)/100), `competencyScore=5.0`, `finalScore=4.1` ((3.2×50+5.0×50)/100) — elle hesaplananla BİREBİR eşleşti. Yalnızca hedef puanlanmış AYRI bir değerlendirmede `competencyScore=null`, `finalScore=goalScore` doğrulandı (eksik kategori dışlanıyor). Olmayan bir `managerAssessmentId` → 404 "Yönetici değerlendirmesi bulunamadı"; toplamı 100 olmayan ağırlık (`70/50`) → 400, VE `audit_log`'da bu reddedilen deneme için hiçbir kayıt oluşmadığı doğrulandı (yalnızca 1 `CREATE`); token olmadan istek → 401. Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (6), auth (22), organization (59), leave (52), recruitment (39), performance (38), bootstrap (1) = 217 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

## US-06.3.1 — Geçmiş değerlendirme sonuçları (Feature 06.3 başladı)

**Özet:** `GET /api/performance/manager-assessments?employeeId={id}` — bir çalışanın geçmiş yönetici değerlendirmelerini, dönem bazlı (en yeniden en eskiye) listeler. Her satır, o dönemin nihai notunu (US-06.2.3) da içerir.

**Tasarım kararları:**
- `ManagerAssessment`'e V33 ile yeni bir `period` alanı eklendi (serbest metin, ör. "2026-Q1") — var olan tabloya `ADD COLUMN ... NOT NULL DEFAULT` + `DROP DEFAULT` deseniyle (recruitment'ın `candidates.stage` kolonundaki, V24'teki AYNI yaklaşım) geriye dönük dolduruldu. Format servis seviyesinde ZORUNLU KILINMADI (yalnızca boş olamaz) — FR-306'daki "yıllık, dönem bazlı, aylık" esnekliğine, ekstra bir enum/parse mantığı icat etmeden uyum sağlıyor.
- **"Sonuç" kelimesinin karşılığı:** Kabul kriteri yalnızca "dönem bazlı liste" diyor ama story metni "geçmiş değerlendirme SONUÇLARIMI görmek istiyorum" — dependency zinciri de US-06.2.3'ü (nihai not hesaplama) işaret ediyor. Bu yüzden liste yalnızca meta veri değil, her kalem için hesaplanmış `finalScore`'u da döndürüyor.
- Ağırlıklandırma (`AssessmentWeightConfig`) TANIMLANMAMIŞSA liste bir bütün olarak 404'e DÜŞMÜYOR — yalnızca ilgili kalemin `finalScore`'u `null` bırakılıyor (`AssessmentWeightConfigNotFoundException` controller'da yakalanıp yutuluyor). Gerekçe: bir listeleme uç noktasının, sistem genelinde henüz yapılandırılmamış bir ayardan dolayı TAMAMEN başarısız olması kullanıcı deneyimi açısından yanlış — `US-06.2.3`'ün kendi `GET .../final-score` uç noktası zaten bu durumu 404 ile açıkça bildiriyor.
- `findByEmployeeIdOrderByPeriodDescIdDesc` — `id DESC` ikincil sıralama, projenin tarih/zaman damgası sıralamalarındaki standart konvansiyonu (US-03.4.1'deki ders): aynı dönemde birden fazla kayıt olursa belirlilik sağlanıyor.
- `employeeId`, US-04.1.2'deki dersle AYNI şekilde `required = false` + servis seviyesinde `IllegalArgumentException` — eksik parametrede 500 yerine 400 dönmesi için.
- Farklı bir çalışanın kayıtları listede GÖRÜNMÜYOR (sorgu doğrudan `employeeId`'ye göre filtreleniyor) — ancak "yalnızca kendi sonuçlarını görebilir" ownership kısıtı (`@PreAuthorize`) BİLİNÇLİ OLARAK eklenmedi, çünkü kabul kriteri (US-06.2.2'deki "yalnızca kendi ekibini" ifadesinin AKSİNE) bundan bahsetmiyor.
- `SubmitManagerAssessmentRequest`/`ManagerAssessmentResponse` DTO'ları `period` alanı için genişletildi — henüz gerçek bir tüketici (frontend) olmadığından geriye dönük uyumluluk kaygısı gözetilmedi, DTO doğrudan değiştirildi.

**Değişen/eklenen dosyalar:**
- `performance/src/main/resources/db/migration/V33__add_period_to_manager_assessments.sql`
- `performance/src/main/java/com/digitalik/performance/entity/ManagerAssessment.java` — `period` alanı
- `performance/src/main/java/com/digitalik/performance/repository/ManagerAssessmentRepository.java` — `findByEmployeeIdOrderByPeriodDescIdDesc`
- `performance/src/main/java/com/digitalik/performance/service/ManagerAssessmentService.java` — `submit(...)` imzası `period` parametresiyle genişledi, yeni `getByEmployeeId(...)`
- `performance/src/main/java/com/digitalik/performance/dto/SubmitManagerAssessmentRequest.java`, `ManagerAssessmentResponse.java` — `period` eklendi; yeni `ManagerAssessmentSummaryResponse.java`
- `performance/src/main/java/com/digitalik/performance/controller/ManagerAssessmentController.java` — `GET` (liste) eklendi
- `performance/src/test/java/com/digitalik/performance/controller/ManagerAssessmentControllerTest.java` — mevcut testler `period` alanına uyarlandı, yeni bir boş-dönem testi eklendi
- `performance/src/test/java/com/digitalik/performance/controller/ManagerAssessmentListControllerTest.java` (yeni, 5 test)
- `performance/src/test/java/com/digitalik/performance/controller/FinalScoreControllerTest.java` — yardımcı metot `period` alanına uyarlandı

**Canlı doğrulama:** V33 migration'ı diğer otuz ikisinin üzerine uygulandı. Aynı çalışan (id=50) için iki farklı dönemde ("2025-Q4" puan=3, "2026-Q1" puan=4) ve başka bir çalışan (id=51) için bir değerlendirme gönderildi. Ağırlıklandırma TANIMLANMADAN liste → 200, iki kayıt da `finalScore=null`; Hedef %100/Yetkinlik %0 tanımlandıktan sonra AYNI liste → `finalScore` sırasıyla 4.0/3.0 doğru hesaplandı; liste `period DESC` sıralı ("2026-Q1" önce) ve yalnızca id=50'nin kayıtlarını içeriyor (id=51 sızmadı); `employeeId` olmadan istek → 400 "Çalışan boş olamaz."; hiç değerlendirmesi olmayan bir `employeeId` → 200, boş dizi; boş (`"  "`) `period` ile gönderim → 400 "Dönem boş olamaz."; token olmadan istek → 401. `psql` ile `audit_log`'da yalnızca 3 başarılı gönderim için `ManagerAssessment` CREATE kaydı doğrulandı (reddedilen boş-dönem denemesi için kayıt oluşmadı). Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (6), auth (22), organization (59), leave (52), recruitment (39), performance (44), bootstrap (1) = 223 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

# Bölüm 7 — PDKS ve Zaman Yönetimi

## US-07.1.1 — Çalışma modeli tanımlama (`attendance` modülü açıldı)

**Özet:** `POST/GET/PUT/DELETE /api/attendance/work-models` — temel çalışma modellerini (ör. "Tam Zamanlı", "Vardiyalı") tanımlama/listeleme/güncelleme/silme. Bölüm 7'nin (PDKS ve Zaman Yönetimi) ilk story'si — yeni bir Maven modülü (`attendance`) açıldı.

**Tasarım kararları:**
- Yeni `attendance` modülü, `organization`/`leave`/`recruitment`/`performance`'daki AYNI kuralla kuruldu: yalnızca `core`'a bağımlı, kök `pom.xml`'e ve `bootstrap/pom.xml`'e birer `<module>`/`<dependency>` satırı eklendi. Global Flyway sıralaması korunarak ilk migration'ı V34 (performance'ın V33'ünün üzerine).
- `WorkModel(name)`, `organization.JobTitle`'daki (US-03.1.2) BİREBİR AYNI "bağımsız, tekil referans listesi" deseni — kabul kriteri yalnızca "çalışana atanabilir bir referans kayıttır" diyor, ek bir `type`/saat alanı İSTEMİYOR; parantez içindeki "tam zamanlı, vardiyalı" birer ÖRNEK isim, ayrı bir alan değil (bkz. `JobTitle`'da "Yazılım Mühendisi" gibi örneklerin de yalnızca isim olması).
- Kabul kriterindeki "çalışana atanabilir" ifadesi İLERİYE DÖNÜK bir gerekçe — atamanın kendisi (US-07.1.2, bir sonraki story) henüz kapsam dışı; bu story yalnızca modelin TANIMLANMASINI kapsıyor (`performance.RatingScale`'deki, US-06.1.2'deki aynı "ileriye dönük gerekçe" emsali).
- `spring-security-core` HENÜZ eklenmedi — bu ilk story'de hiçbir `@PreAuthorize` ihtiyacı yok (kabul kriteri rol kısıtlamasından bahsetmiyor); diğer modüllerde de bu bağımlılık yalnızca gerçekten gerektiğinde (ilk `@PreAuthorize` kullanımında) eklendi, YAGNI.
- Rol kısıtlaması eklenmedi — kabul kriteri bundan bahsetmiyor.

**Hata ve düzeltme (Docker'da yakalandı, `mvn test`'te YAKALANAMADI):** İlk `docker compose up --build -d` denemesi, `Dockerfile`'ın `COPY .../pom.xml`/`COPY .../src` adımlarının her modülü TEK TEK, isim isim listelemesi nedeniyle "Child module /build/attendance ... does not exist" hatasıyla başarısız oldu — yeni modül kök `pom.xml`'e eklenmişti ama `Dockerfile`'a unutulmuştu. `mvn test` bunu YAKALAYAMADI çünkü o doğrudan reactor üzerinde çalışıyor, Docker'ın kendi COPY listesini kullanmıyor. **Fix:** `Dockerfile`'a hem bağımlılık-cache hem kaynak-kod COPY aşamalarına `attendance` satırları eklendi. Bu, yeni bir modül açıldığında Docker doğrulamasının neden `mvn test`'ten BAĞIMSIZ, ayrıca zorunlu bir adım olduğunun somut bir örneği.

**Değişen/eklenen dosyalar:**
- `pom.xml` — `<module>attendance</module>`
- `bootstrap/pom.xml` — `attendance` bağımlılığı
- `Dockerfile` — `attendance` COPY satırları (bkz. yukarıdaki hata notu)
- `attendance/pom.xml` (yeni modül)
- `attendance/src/main/resources/db/migration/V34__create_work_models.sql`
- `attendance/src/main/java/com/digitalik/attendance/entity/WorkModel.java`
- `attendance/src/main/java/com/digitalik/attendance/repository/WorkModelRepository.java`
- `attendance/src/main/java/com/digitalik/attendance/exception/WorkModelNotFoundException.java`, `AttendanceExceptionHandler.java`
- `attendance/src/main/java/com/digitalik/attendance/service/WorkModelService.java`
- `attendance/src/main/java/com/digitalik/attendance/dto/WorkModelRequest.java`, `WorkModelResponse.java`
- `attendance/src/main/java/com/digitalik/attendance/controller/WorkModelController.java`
- `attendance/src/test/java/com/digitalik/attendance/AttendanceTestApplication.java`
- `attendance/src/test/java/com/digitalik/attendance/controller/WorkModelControllerTest.java` (yeni, 7 test)

**Canlı doğrulama:** `Dockerfile` düzeltildikten sonra `docker compose up --build -d` başarıyla tamamlandı; log'da "Migrating schema "public" to version "34 - create work models"" görüldü. "Tam Zamanlı" ve "Vardiyalı" oluşturuldu (201, 201); liste 2 kayıt döndürdü; güncelleme başarılı (200); olmayan id güncelleme → 404 "Çalışma modeli bulunamadı"; boş isim → 400 "Çalışma modeli adı boş olamaz."; silme → 204; token olmadan istek → 401. `psql` ile `audit_log`'da `WorkModel` için 2 CREATE + 1 UPDATE kaydı doğrulandı. Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (6), auth (22), organization (59), leave (52), recruitment (39), performance (44), attendance (7), bootstrap (1) = 230 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

## US-07.1.2 — Çalışma modeli atama

**Özet:** `PUT/GET /api/attendance/employees/{employeeId}/work-model-assignment` — bir çalışana çalışma modeli atama/görüntüleme. Kabul kriteri: "Atama çalışan kaydına bağlanır."

**Tasarım kararları:**
- `WorkModelAssignment`, `organization.EmployeeProfile`'daki (V14) AYNI "`employee_id` üzerinde upsert, en fazla bir güncel satır" deseni — `PUT` her zaman upsert, ayrı `POST` yok.
- `employeeId`, `organization.Employee`'ye DB seviyesinde bir FK İLE değil düz bir `Long` olarak tutuluyor — `attendance`, `organization`'a bağımlı olmadığından (modüller arası Java bağımlılığı yok kuralı) çalışanın GERÇEKTEN var olup olmadığı burada DOĞRULANAMIYOR; bu, `leave`/`performance`'taki `employeeId` alanlarıyla AYNI, kod içinde açıkça belgelenen güven sınırı. `workModelId` ise AYNI modül (`attendance`) içindeki `WorkModel`'e normal bir DB FK'siyle bağlı VE servis seviyesinde varlığı doğrulanıyor (`WorkModelNotFoundException`).
- Ayrı bir `WorkModelAssignmentController` açıldı (`organization.EmployeeController`'daki `/{id}/profile` alt-kaynağının AKSİNE) — çünkü `Employee`'nin kendisi `organization` modülünde, `attendance`'ın ona ait bir controller'ı olamaz; atama kaynağı bunun yerine `attendance`'ın kendi taban yolunda (`/api/attendance/employees/{employeeId}/...`) yaşıyor.
- Rol kısıtlaması eklenmedi — kabul kriteri bundan bahsetmiyor.

**Değişen/eklenen dosyalar:**
- `attendance/src/main/resources/db/migration/V35__create_work_model_assignments.sql`
- `attendance/src/main/java/com/digitalik/attendance/entity/WorkModelAssignment.java`
- `attendance/src/main/java/com/digitalik/attendance/repository/WorkModelAssignmentRepository.java`
- `attendance/src/main/java/com/digitalik/attendance/exception/WorkModelAssignmentNotFoundException.java`
- `attendance/src/main/java/com/digitalik/attendance/exception/AttendanceExceptionHandler.java` — `WorkModelAssignmentNotFoundException` → 404 eşlemesi
- `attendance/src/main/java/com/digitalik/attendance/service/WorkModelAssignmentService.java`
- `attendance/src/main/java/com/digitalik/attendance/dto/AssignWorkModelRequest.java`, `WorkModelAssignmentResponse.java`
- `attendance/src/main/java/com/digitalik/attendance/controller/WorkModelAssignmentController.java`
- `attendance/src/test/java/com/digitalik/attendance/controller/WorkModelAssignmentControllerTest.java` (yeni, 4 test)

**Canlı doğrulama:** V35 migration'ı V34'ün üzerine uygulandı (Dockerfile'a bu kez yeni bir COPY satırı gerekmedi — modül zaten US-07.1.1'de tanıtılmıştı). İki çalışma modeli ("Tam Zamanlı", "Vardiyalı") oluşturuldu. Atama yapmadan görüntüleme → 404 "Çalışma modeli ataması bulunamadı"; atama (Tam Zamanlı) → 200; görüntüleme → 200, doğru veri; tekrar atama (Vardiyalı) → 200, güncellendi; `psql` ile `work_model_assignments` tablosunda TEK bir satır olduğu (id=1, `work_model_id` 1'den 2'ye güncellenmiş) doğrulandı — upsert semantiği bekleneni verdi; olmayan bir `workModelId` ile atama → 404 "Çalışma modeli bulunamadı"; token olmadan istek → 401. `audit_log`'da `WorkModelAssignment` için 1 CREATE + 1 UPDATE kaydı doğrulandı. Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (6), auth (22), organization (59), leave (52), recruitment (39), performance (44), attendance (11), bootstrap (1) = 234 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

## US-07.2.1 — PDKS'ten fiili giriş-çıkış verisi (Feature 07.2 başladı — ilk dış sistem entegrasyonu)

**Özet:** `POST/GET /api/attendance/attendance-records` — PDKS'ten (Personel Devam Kontrol Sistemi) gelen fiili giriş-çıkış verisini toplu içe aktarma (`POST`) ve çalışan bazlı geri okuma (`GET`). Kabul kriteri: "Test ortamında örnek veri başarıyla okunur/kaydedilir."

**Tasarım kararları:**
- Roadmap'in Feature 07.2 başlığındaki YAGNI notu birebir uygulandı: genel bir "adaptör çerçevesi"/vendor-bağımsız arayüz KURULMADI. `Dijital İK Platformu` bir ihale projesi olmadığından ve gerçek bir PDKS vendor'u tanımlı olmadığından, en gerçekçi ve test edilebilir yaklaşım: PDKS'in periyodik olarak veri İTTİĞİ (push) bir toplu-içe-aktarma REST ucu. Gerçek bir vendor ortaya çıktığında (roadmap'in "İkinci bir dış sistem" notu, Bölüm 9.8) bu uç, o vendor'un formatına özel bir adaptörle SARILABİLİR — şimdiden soyutlama kurulmadı.
- `AttendanceRecord.employeeId`, `work_model_assignments`'taki (US-07.1.2) AYNI gerekçeyle FK'siz düz bir `Long` — modüller arası bağımlılık yok kuralı.
- `checkOutAt` NULLABLE — bir çalışan henüz çıkış yapmamışsa (gün ortasında aktarılan PDKS verisi) yalnızca giriş bilgisi mevcut olabilir; bu gerçekçi bir PDKS senaryosu, ekstra bir "durum" alanı icat edilmeden `null` ile temsil edildi.
- Basit tutarlılık kontrolü: `checkOutAt` doluysa `checkInAt`'ten ÖNCE olamaz — kabul kriterinin dolaylı, bariz bir gereği; daha karmaşık bir doğrulama (ör. örtüşen kayıtlar, gelecek tarih) kabul kriteri istemediğinden EKLENMEDİ.
- `GET .../attendance-records?employeeId=X`, kabul kriterinin "okunur" kısmını doğrulamak için eklendi — yalnızca "kaydedilir" (POST) yeterli olsaydı verinin gerçekten kalıcı olduğu API üzerinden gösterilemezdi. `id DESC` ikincil sıralama (US-03.4.1'deki ders) uygulandı.
- Rol kısıtlaması eklenmedi — kabul kriteri bundan bahsetmiyor.

**Değişen/eklenen dosyalar:**
- `attendance/src/main/resources/db/migration/V36__create_attendance_records.sql`
- `attendance/src/main/java/com/digitalik/attendance/entity/AttendanceRecord.java`
- `attendance/src/main/java/com/digitalik/attendance/repository/AttendanceRecordRepository.java`
- `attendance/src/main/java/com/digitalik/attendance/service/AttendanceRecordService.java`
- `attendance/src/main/java/com/digitalik/attendance/dto/AttendanceRecordRequest.java`, `AttendanceRecordResponse.java`, `ImportAttendanceRecordsRequest.java`
- `attendance/src/main/java/com/digitalik/attendance/controller/AttendanceRecordController.java`
- `attendance/src/test/java/com/digitalik/attendance/controller/AttendanceRecordControllerTest.java` (yeni, 7 test)

**Canlı doğrulama:** V36 migration'ı V35'in üzerine uygulandı. Örnek bir toplu veri (iki çalışan, biri tam bir giriş-çıkış çifti, diğeri yalnızca giriş) `POST` ile gönderildi → 201, ikisi de doğru kaydedildi ve zaman dilimi dönüşümü (`+03:00` → UTC `Z`) doğru çalıştı; `GET ?employeeId=40` → kaydedilen giriş-çıkış çiftini geri döndürdü (kabul kriterinin "okunur" kısmı doğrulandı); `GET ?employeeId=41` → `checkOutAt: null` doğru döndü; boş liste ile `POST` → 400 "En az bir kayıt gönderilmelidir."; çıkışı girişten önce olan bir kayıt → 400 "Çıkış zamanı, giriş zamanından önce olamaz."; `employeeId` olmadan `GET` → 400 "Çalışan boş olamaz."; hiç kaydı olmayan bir çalışan → 200, boş liste; token olmadan istek → 401. `psql` ile `audit_log`'da 2 `CREATE` kaydı doğrulandı. Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (6), auth (22), organization (59), leave (52), recruitment (39), performance (44), attendance (18), bootstrap (1) = 241 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

## US-07.2.2 — Planlanan vardiya ile fiili giriş-çıkış karşılaştırması

**Özet:** `GET /api/attendance/attendance-records/deviations?employeeId={id}` — çalışanın atanmış çalışma modelindeki planlanan vardiya saatleriyle fiili giriş-çıkış kayıtlarını karşılaştırıp geç kalma/erken çıkış sapmasını (dakika cinsinden) otomatik hesaplar ve listeler.

**Tasarım kararları:**
- `WorkModel`'e V37 ile `plannedStartTime`/`plannedEndTime` (`LocalTime`) eklendi — US-07.1.1'de BİLİNÇLİ OLARAK eklenmemişti ("yalnızca modelin tanımlanmasını kapsıyor" notu), ama bu story bu veriye GERÇEKTEN ihtiyaç duyuyor; var olan kayıtlar tipik mesai saatleriyle (09:00-18:00) geriye dönük dolduruldu (`ADD COLUMN ... DEFAULT` + `DROP DEFAULT` deseni, V24/V33'teki aynı emsal).
- Sapma HİÇBİR YERDE KALICI OLARAK SAKLANMIYOR — `performance.FinalScoreService`'teki (US-06.2.3) AYNI "her seferinde güncel veriden yeniden hesapla" deseni: atama veya kayıt değişirse sonuç otomatik güncel kalır, ayrı bir "sapma" tablosu/senkronizasyon sorunu YOK.
- `earlyDepartureMinutes`, çıkış kaydı henüz yoksa (`checkOutAt == null`) `null` — henüz hesaplanamayan bir sapmayı `0` göstermek yanıltıcı olurdu.
- Basitleştirme: gece vardiyası (bitiş saati, başlangıçtan "ertesi gün") kapsam dışı bırakıldı — kabul kriteri bundan bahsetmiyor; `WorkModelService` planlanan bitişin başlangıçtan SONRA olmasını zorunlu kılıyor.
- Rol kısıtlaması eklenmedi — kabul kriteri bundan bahsetmiyor.

**Hata ve düzeltme (`mvn test` YAKALADI — Docker'a gerek kalmadan):** İlk yazımda sapma hesabı `OffsetDateTime.toLocalTime()` kullanıyordu — bu, saklanan offset'i OLDUĞU GİBİ kabul ediyor. Ancak JPA/JDBC katmanı (H2'de de, gerçek PostgreSQL'de de) bir `OffsetDateTime`'ı geri okurken offset'i normalize edebiliyor (ör. `+03:00` olarak kaydedilen bir zaman, geri okunurken `Z`/UTC offset'iyle döner) — aynı ANI temsil eder ama `toLocalTime()` farklı bir saat-of-day döndürür. Bu, testte 09:20 girişin "geç değil" (0 dk), 18:10 çıkışın ise "170 dakika erken" gibi YANLIŞ sonuçlar üretti — `mvn test` (H2) bunu DOĞRUDAN yakaladı, Docker'a gerek kalmadı. **Fix:** `toLocalTime()` yerine `atZoneSameInstant(ZoneId.of("Europe/Istanbul")).toLocalTime()` — ANI SABİT bir dilime çevirip oradan yerel saati alıyor, hangi offset'le geri döndüğünden BAĞIMSIZ doğru sonuç veriyor. Gerçek PostgreSQL'e karşı Docker doğrulamasında da (bkz. aşağı) aynı düzeltmenin doğru çalıştığı teyit edildi.

**Değişen/eklenen dosyalar:**
- `attendance/src/main/resources/db/migration/V37__add_planned_shift_to_work_models.sql`
- `attendance/src/main/java/com/digitalik/attendance/entity/WorkModel.java` — `plannedStartTime`/`plannedEndTime` eklendi
- `attendance/src/main/java/com/digitalik/attendance/service/WorkModelService.java` — `create`/`update` imzaları genişledi, bitiş>başlangıç doğrulaması
- `attendance/src/main/java/com/digitalik/attendance/dto/WorkModelRequest.java`, `WorkModelResponse.java` — genişletildi
- `attendance/src/main/java/com/digitalik/attendance/controller/WorkModelController.java` — güncellendi
- `attendance/src/main/java/com/digitalik/attendance/service/AttendanceDeviationService.java` (yeni)
- `attendance/src/main/java/com/digitalik/attendance/dto/AttendanceDeviationResponse.java` (yeni)
- `attendance/src/main/java/com/digitalik/attendance/controller/AttendanceRecordController.java` — `GET .../deviations` eklendi
- `attendance/src/test/java/com/digitalik/attendance/controller/WorkModelControllerTest.java`, `WorkModelAssignmentControllerTest.java` — `plannedStartTime`/`plannedEndTime` alanlarına uyarlandı, yeni bir bitiş<başlangıç testi eklendi
- `attendance/src/test/java/com/digitalik/attendance/controller/AttendanceDeviationControllerTest.java` (yeni, 5 test)

**Canlı doğrulama:** V37 migration'ı V36'nın üzerine uygulandı. "Tam Zamanlı" modeli (09:00-18:00) tanımlandı, çalışan (id=60) atandı; örnek veri (09:20 giriş, 17:45 çıkış — `+03:00`) içe aktarıldı (kayıtlar gerçek PostgreSQL'de UTC'ye normalize edilerek saklandı: `06:20Z`/`14:45Z`). Sapma uç noktası → 200, `lateMinutes=20`, `earlyDepartureMinutes=15` — ELLE HESAPLANANLA BİREBİR eşleşti (timezone düzeltmesinin gerçek PostgreSQL'e karşı da doğru çalıştığı teyit edildi); atama yapılmamış bir çalışan → 404 "Çalışma modeli ataması bulunamadı"; `employeeId` olmadan → 400 "Çalışan boş olamaz."; token olmadan istek → 401. Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (6), auth (22), organization (59), leave (52), recruitment (39), performance (44), attendance (24), bootstrap (1) = 247 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

## US-07.3.1 — Aylık puantaj (Bölüm 7 tamamlandı)

**Özet:** `GET /api/attendance/timesheet?employeeId={id}&year={yıl}&month={ay}&leaveDates={...}` — bir ayın her günü için PDKS verisi (fiili çalışma süresi) ile planlanan vardiya süresini karşılaştırıp NORMAL/EKSIK/FAZLA_MESAI/IZINLI olarak sınıflandıran aylık puantaj.

**Tasarım kararları:**
- **Modüller arası veri birleşimi:** Kabul kriteri "Puantaj, PDKS verisi + izin verisinden hesaplanır" diyor; izin verisi `leave` modülünde, `attendance` ise `leave`'e bağımlı DEĞİL (modüller arası Java bağımlılığı yok kuralı). `organization.TeamController`'daki (US-04.2.2) AYNI "istemci taraflı liste" desenle çözüldü: onaylı izin günleri, çağıran tarafından (`leaveDates` sorgu parametresi) sağlanıyor — frontend kendi `/api/leave/leave-requests` sorgusundan bu listeyi elde edip buraya iletecek.
- Her gün İKİ AŞAMADA sınıflandırılıyor: önce `leaveDates` içindeyse `IZINLI` (izin, PDKS verisine bakılmaksızın önceliklidir); değilse o güne ait (yalnızca ÇIKIŞI OLAN) `AttendanceRecord`'ların toplam süresi planlanan süreyle (`WorkModel.plannedEndTime - plannedStartTime`) karşılaştırılıyor: eşitse `NORMAL`, azsa `EKSIK`, fazlaysa `FAZLA_MESAI`. Hiç kaydı olmayan bir gün, doğal olarak `EKSIK` (0 dk çalışılmış) sayılıyor — ayrı bir "DEVAMSIZ" durumu İCAT EDİLMEDİ, kabul kriteri yalnızca üç kategoriden (normal/eksik/fazla mesai) bahsediyor.
- Hafta sonu/resmi tatil/çalışma günü ayrımı YAPILMADI — `WorkModel`'in yalnızca saat bilgisi var, "hangi günler çalışılır" bilgisi yok; bu, roadmap'in henüz yazılmamış FR-601 (vardiya tipi, resmi tatil parametreleri) zenginliğine ait, kabul kriteri bunu istemiyor.
- Sonuç HİÇBİR YERDE KALICI SAKLANMIYOR — `FinalScoreService` (performance, US-06.2.3) ve `AttendanceDeviationService`'teki (US-07.2.2) AYNI "her seferinde güncel veriden yeniden hesapla" deseni.
- **Kod tekrarını önleme:** US-07.2.2'de öğrenilen "DB'den geri okunan `OffsetDateTime`'ın offset'i normalize edilebilir" dersi burada da (gün gruplaması için `toLocalDate()` yerine `atZoneSameInstant`) geçerli olduğundan, sabit dilim `AttendanceZone` adında paylaşılan bir sınıfa çıkarıldı — iki serviste bağımsız bir sabitin birbirinden SESSİZCE sapması riskini önlemek için (bkz. hafızaya kaydedilen ders).
- Rol kısıtlaması eklenmedi — kabul kriteri bundan bahsetmiyor.

**Değişen/eklenen dosyalar:**
- `attendance/src/main/java/com/digitalik/attendance/service/AttendanceZone.java` (yeni, paylaşılan sabit) — `AttendanceDeviationService` bu sınıfı kullanacak şekilde refactor edildi (davranış DEĞİŞMEDİ)
- `attendance/src/main/java/com/digitalik/attendance/service/TimesheetService.java` (yeni)
- `attendance/src/main/java/com/digitalik/attendance/dto/TimesheetDayResponse.java`, `TimesheetResponse.java` (yeni)
- `attendance/src/main/java/com/digitalik/attendance/controller/TimesheetController.java` (yeni)
- `attendance/src/test/java/com/digitalik/attendance/controller/TimesheetControllerTest.java` (yeni, 4 test)

**Canlı doğrulama:** Yeni migration yok (sonuç hesaplanır, saklanmaz). "Tam Zamanlı" modeli (09:00-17:00, 480 dk) tanımlandı, çalışan (id=80) atandı; üç örnek PDKS kaydı (05'i tam 480 dk, 06'sı 240 dk, 07'si 660 dk) içe aktarıldı. `GET .../timesheet?employeeId=80&year=2026&month=8&leaveDates=2026-08-08` → 200; Ağustos'un TÜM 31 günü döndü; 1-4. günler (kayıt yok) → `EKSIK`, 0 dk; 5. gün → `NORMAL`, 480 dk; 6. gün → `EKSIK`, 240 dk; 7. gün → `FAZLA_MESAI`, 660 dk; 8. gün (`leaveDates`'te) → `IZINLI`, `workedMinutes` yok — ELLE HESAPLANANLA BİREBİR eşleşti, gerçek PostgreSQL'e karşı doğrulandı. Atanmamış çalışan → 404 "Çalışma modeli ataması bulunamadı"; `employeeId` olmadan → 400 "Çalışan boş olamaz."; geçersiz ay (13) → 400 "Ay 1 ile 12 arasında olmalıdır."; token olmadan istek → 401. Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (6), auth (22), organization (59), leave (52), recruitment (39), performance (44), attendance (28), bootstrap (1) = 251 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

# Bölüm 8 — Diğer Modüller

> Roadmap notu: bu bölümdeki epic'ler birbirinden büyük ölçüde bağımsız; aralarında zorunlu bir sıra yok. EPIC-08A'dan (Eğitim Yönetimi), roadmap dokümanındaki sıralamayı takip ederek başlandı.

## US-08A.1.1 — Eğitim kataloğu tanımlama (`training` modülü açıldı)

**Özet:** `POST/GET/PUT/DELETE /api/training/trainings` — eğitim kataloğu (ad, tür, süre, sağlayıcı) CRUD. EPIC-08A'nın (Eğitim Yönetimi) ilk story'si — yeni bir Maven modülü (`training`) açıldı.

**Tasarım kararları:**
- Yeni `training` modülü, `attendance`'taki (US-07.1.1) AYNI kuralla kuruldu: yalnızca `core`'a bağımlı, kök `pom.xml`/`bootstrap/pom.xml`'e birer satır, `Dockerfile`'a HEM bağımlılık HEM kaynak-kod COPY satırları eklendi (US-07.1.1'de öğrenilen ders bu kez PROAKTİF uygulandı — Docker build ilk denemede başarılı oldu, o zamanki hata TEKRARLANMADI). İlk migration'ı V38 (attendance'ın V37'sinin üzerine).
- `Training(name, type, durationHours, provider)` — `attendance.WorkModel`/`organization.JobTitle`'daki AYNI bağımsız, tekil referans listesi deseni; ancak kabul kriterinin AÇIKÇA istediği dört alan (ad, tür, süre, sağlayıcı) tutuldu. `type` bilinçli olarak SERBEST METİN — kabul kriteri sabit bir tür kümesi tanımlamıyor, bir enum icat etmek yanlış bir varsayım olurdu.
- `durationHours` (saat cinsinden tam sayı, >0 doğrulaması) — "süre" ifadesinin en basit, en yaygın yorumu; gün/dakika gibi alternatif birimler kabul kriteri tarafından İSTENMEDİĞİNDEN eklenmedi.
- Rol kısıtlaması eklenmedi — kabul kriteri bundan bahsetmiyor.

**Değişen/eklenen dosyalar:**
- `pom.xml` — `<module>training</module>`
- `bootstrap/pom.xml` — `training` bağımlılığı
- `Dockerfile` — `training` COPY satırları
- `training/pom.xml` (yeni modül)
- `training/src/main/resources/db/migration/V38__create_trainings.sql`
- `training/src/main/java/com/digitalik/training/entity/Training.java`
- `training/src/main/java/com/digitalik/training/repository/TrainingRepository.java`
- `training/src/main/java/com/digitalik/training/exception/TrainingNotFoundException.java`, `TrainingExceptionHandler.java`
- `training/src/main/java/com/digitalik/training/service/TrainingService.java`
- `training/src/main/java/com/digitalik/training/dto/TrainingRequest.java`, `TrainingResponse.java`
- `training/src/main/java/com/digitalik/training/controller/TrainingController.java`
- `training/src/test/java/com/digitalik/training/TrainingTestApplication.java`
- `training/src/test/java/com/digitalik/training/controller/TrainingControllerTest.java` (yeni, 8 test)

**Canlı doğrulama:** `docker compose up --build -d` İLK DENEMEDE başarıyla tamamlandı (Dockerfile düzeltmesi proaktif uygulandı); log'da "Migrating schema "public" to version "38 - create trainings"" görüldü. Eğitim oluşturuldu (201); liste 1 kayıt döndürdü; güncelleme başarılı (200); olmayan id güncelleme → 404 "Eğitim bulunamadı"; boş isim → 400 "Eğitim adı boş olamaz."; sıfır süre → 400 "Süre (saat) sıfırdan büyük olmalıdır."; silme → 204; token olmadan istek → 401. `psql` ile `audit_log`'da `Training` için 1 CREATE + 1 UPDATE kaydı doğrulandı. Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (6), auth (22), organization (59), leave (52), recruitment (39), performance (44), attendance (28), training (8), bootstrap (1) = 259 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

## US-08A.1.2 — Eğitim talebi ve onayı

**Özet:** `POST /api/training/enrollments` (talep oluşturma) + `PUT /{id}/decision` (onay/ret) + `GET ?employeeId=...` (listeleme) — çalışan katalogdan eğitim talep eder, yönetici onaylar/reddeder. Kabul kriteri: "Talep, yöneticiye onaya gider."

**Tasarım kararları:**
- Roadmap'in kabul kriterindeki yönlendirme birebir izlendi: Bölüm 9.2'deki merkezi Onay Motoru henüz kurulmadığından, `leave.LeaveRequest`'teki (US-04.2.1/US-04.2.2) "talep→onay" deseni AYNEN tekrar kullanıldı — `TrainingEnrollment` (PENDING/APPROVED/REJECTED), karar sonrası durum değişmez, ret gerekçesi zorunlu. İzin'e özel zenginlik (bakiye uyarısı, e-posta bildirimi) BİLİNÇLİ OLARAK taşınmadı — kabul kriteri bunları istemiyor.
- "Yöneticiye onaya gider" → "yönetici yalnızca kendi ekibinin taleplerini onaylar" kısıtı, `leave`/`performance`'taki (US-04.2.2/US-06.2.2) AYNI "istemci taraflı ekip listesi" desenini kullanıyor: `TrainingEnrollmentAccessGuard`, `LeaveRequestAccessGuard`'ın BİREBİR kopyası — `training` modülü `organization`'a bağımlı olmadığından sunucu tarafında gerçek ekip doğrulaması yapılamıyor.
- `training/pom.xml`'e bu story ile birlikte `spring-security-core` eklendi (modülün İLK `@PreAuthorize` kullanımı) — `organization`/`leave`/`recruitment`/`performance`'taki aynı "yalnızca gerçekten gerekince ekle" gerekçesi.
- `TrainingEnrollmentRepository.findByEmployeeIdOrderByIdDesc` — `LeaveRequest`'in aksine (orada `startDate` gibi anlamlı bir tarih alanı sıralama için kullanılıyordu) burada böyle bir alan yok; `id DESC` tek başına zaten belirli (deterministic) olduğundan ekstra bir ikincil anahtara gerek kalmadı.
- Rol kısıtlaması yalnızca `decision` ucuna eklendi; oluşturma ve listeleme uçlarına eklenmedi — kabul kriteri yalnızca ONAY adımının yöneticiye gitmesinden bahsediyor.

**Değişen/eklenen dosyalar:**
- `training/pom.xml` — `spring-security-core` eklendi
- `training/src/main/resources/db/migration/V39__create_training_enrollments.sql`
- `training/src/main/java/com/digitalik/training/entity/TrainingEnrollmentStatus.java`, `TrainingEnrollment.java`
- `training/src/main/java/com/digitalik/training/repository/TrainingEnrollmentRepository.java`
- `training/src/main/java/com/digitalik/training/exception/TrainingEnrollmentNotFoundException.java`
- `training/src/main/java/com/digitalik/training/exception/TrainingExceptionHandler.java` — `TrainingEnrollmentNotFoundException`/`AuthorizationDeniedException` → 404/403 eşlemeleri
- `training/src/main/java/com/digitalik/training/security/TrainingEnrollmentAccessGuard.java`
- `training/src/main/java/com/digitalik/training/service/TrainingEnrollmentService.java`
- `training/src/main/java/com/digitalik/training/dto/CreateTrainingEnrollmentRequest.java`, `TrainingEnrollmentDecisionRequest.java`, `TrainingEnrollmentResponse.java`
- `training/src/main/java/com/digitalik/training/controller/TrainingEnrollmentController.java`
- `training/src/test/java/com/digitalik/training/controller/TrainingEnrollmentControllerTest.java` (yeni, 8 test — `@PreAuthorize` bu izole modül test bağlamında uygulanmıyor, `leave`/`performance`'taki aynı sınırlama; yalnızca Docker üzerinden canlı doğrulandı)

**Canlı doğrulama:** V39 migration'ı V38'in üzerine uygulandı. `psql` ile doğrudan eklenen bir YONETICI ve bir CALISAN test kullanıcısı rollendirildi. Bir eğitim kataloğa eklendi; CALISAN, `employeeId=90` için talep oluşturdu (201, `PENDING`). YONETICI, kendi ekibindeki bu talebi (`teamEmployeeIds=90,91`) onayladı → 200, `APPROVED`; YONETICI, ekibi DIŞINDAKİ bir talebi (`employeeId=95`) onaylamaya çalıştı → 403; CALISAN karar vermeye çalıştı → 403; ADMIN bypass ile gerekçesiz RET → 400 "Ret gerekçesi zorunludur."; gerekçeli RET → 200, `REJECTED`; token olmadan istek → 401; `GET ?employeeId=90` → doğru kaydı döndürdü. `psql` ile `audit_log`'da iki başarılı karar için `TrainingEnrollment` CREATE+UPDATE çiftleri doğrulandı. Test verisi temizlendi, sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (6), auth (22), organization (59), leave (52), recruitment (39), performance (44), attendance (28), training (16), bootstrap (1) = 267 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

## US-08A.1.3 — Tamamlanan eğitimler raporu (EPIC-08A tamamlandı)

**Özet:** `PUT /api/training/enrollments/{id}/complete` — onaylanmış bir eğitim talebini tamamlanma tarihiyle "tamamlandı" olarak işaretler. `GET /api/training/enrollments/completed?employeeId={id}` — kabul kriterinin ("çalışan+eğitim+tarih gösterir") istediği raporu döner.

**Tasarım kararları:**
- **"Onaylandı" ile "tamamlandı" kavramsal olarak ayrıştırıldı:** US-08A.1.2'deki `APPROVED` durumu yalnızca katılım İZNİ anlamına geliyordu; bu story'nin "tamamlanan eğitimler" ifadesi GERÇEKTEN katılım sağlandığını gerektiriyor. Bu yüzden `TrainingEnrollmentStatus`'a dördüncü bir durum (`COMPLETED`) eklendi, yalnızca `APPROVED`'dan geçilebilir; `PENDING`/`REJECTED` bir talep doğrudan tamamlanamaz.
- `completedDate`, V33/V37'deki "geriye dönük varsayılan değerle doldurma" deseninin BİLİNÇLİ OLARAK AKSİNE, DEFAULT'suz nullable eklendi — var olan PENDING/APPROVED/REJECTED kayıtlar için "tamamlanma tarihi" kavramı YOK (bilinmiyor değil, henüz yok), sahte bir tarih atamak yanlış olurdu.
- **`employeeId` bu raporda İSTEĞE BAĞLI** — mevcut `GET /enrollments?employeeId=...`'nin (US-08A.1.2, zorunlu) AKSİNE. Gerekçe: o uç bir çalışanın KENDİ talep geçmişiydi (zorunlu filtre mantıklı); bu story ise "İK kullanıcısı olarak... çalışan bazında görmek" diyen bir RAPOR — kabul kriterindeki "çalışan bazında" ifadesi, listedeki her satırın çalışan bilgisi TAŞIMASI anlamına geliyor, tek bir çalışana zorunlu filtrelemeye değil; İK'nın genel bir döküm istemesi de doğal.
- Rapor yanıtı yalnızca `trainingId` değil `trainingName` de içeriyor (`TrainingRepository`'den okunuyor) — kabul kriterinin "eğitim" ifadesi bir id değil, okunabilir bir isim beklentisi.
- Rol kısıtlaması eklenmedi (ne tamamlama işaretlemede ne de raporda) — kabul kriteri bundan bahsetmiyor.

**Değişen/eklenen dosyalar:**
- `training/src/main/resources/db/migration/V40__add_completed_date_to_training_enrollments.sql`
- `training/src/main/java/com/digitalik/training/entity/TrainingEnrollmentStatus.java` — `COMPLETED` eklendi
- `training/src/main/java/com/digitalik/training/entity/TrainingEnrollment.java` — `completedDate`, `complete(...)`
- `training/src/main/java/com/digitalik/training/repository/TrainingEnrollmentRepository.java` — `findByStatusOrderBy...`/`findByStatusAndEmployeeIdOrderBy...`
- `training/src/main/java/com/digitalik/training/service/TrainingEnrollmentService.java` — `complete(...)`, `listCompleted(...)`
- `training/src/main/java/com/digitalik/training/dto/CompleteTrainingEnrollmentRequest.java`, `CompletedTrainingResponse.java` (yeni); `TrainingEnrollmentResponse.java` — `completedDate` eklendi
- `training/src/main/java/com/digitalik/training/controller/TrainingEnrollmentController.java` — `PUT /{id}/complete`, `GET /completed` eklendi
- `training/src/test/java/com/digitalik/training/controller/CompletedTrainingControllerTest.java` (yeni, 6 test)

**Canlı doğrulama:** V40 migration'ı V39'un üzerine uygulandı. Bir eğitim + talep oluşturuldu. Onaylanmadan tamamlama denemesi → 400 "Yalnızca onaylanmış bir talep tamamlandı olarak işaretlenebilir."; onaylandıktan sonra tamamlama (`completedDate=2026-08-10`) → 200, `status=COMPLETED`; rapor (`employeeId=100`) → çalışan+eğitim ADI+tarih doğru döndü; `employeeId` OLMADAN aynı rapor → tüm çalışanları kapsayan AYNI sonuç (tek kayıt olduğundan aynı çıktı, filtre davranışı ayrıca birim testlerinde doğrulandı); olmayan talep tamamlama → 404 "Eğitim talebi bulunamadı"; token olmadan istek → 401. `psql` ile `audit_log`'da 1 CREATE + 2 UPDATE (onay + tamamlama) kaydı doğrulandı — reddedilen erken tamamlama denemesi için kayıt oluşmadı. Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (6), auth (22), organization (59), leave (52), recruitment (39), performance (44), attendance (28), training (22), bootstrap (1) = 273 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

## US-08B.1.1 — Seyahat talebi oluşturma (`travel` modülü açıldı)

**Özet:** `POST/GET /api/travel/requests` — seyahat talebi (lokasyon, tarih aralığı, amaç) oluşturma/listeleme. EPIC-08B'nin (Harcırah/Seyahat/Masraf) ilk story'si — yeni bir Maven modülü (`travel`) açıldı.

**Tasarım kararları:**
- Yeni `travel` modülü, `attendance`/`training`'teki AYNI kuralla kuruldu: yalnızca `core`'a bağımlı, kök `pom.xml`/`bootstrap/pom.xml`'e birer satır, `Dockerfile`'a HEM bağımlılık HEM kaynak-kod COPY satırları PROAKTİF eklendi (Docker build ilk denemede başarılı oldu). İlk migration'ı V41 (training'in V40'ının üzerine).
- **Roadmap story metni FR-500'ün tam zenginliğini KASITLI OLARAK taşımadı:** FR-500 "tahmini maliyet" de istiyor, ama roadmap'in bu story için yazdığı kabul kriteri yalnızca "lokasyon, tarih, amaç" — üç alan. Bu projenin baştan beri sürdürdüğü "roadmap'in basitleştirilmiş kabul kriterini uygula, tam FR zenginliğini SONRAKİ/ayrı bir story'ye bırak" konvansiyonuna (bkz. US-06.2.3'teki, US-07.3.1'deki aynı karar) uyuldu.
- **Onay akışı YOK:** Kabul kriteri yalnızca "Form kaydedilir" diyor; `leave.LeaveRequest`/`training.TrainingEnrollment`'ın AKSİNE burada PENDING/APPROVED gibi bir durum alanı yok — roadmap'in ayrı bir story'si (US-08B.1.3) yalnızca MASRAF beyanı için onay tanımlıyor, seyahat talebinin kendisi için değil.
- `TravelRequest.employeeId`, diğer tüm modüllerdeki (`leave`/`performance`/`attendance`/`training`) AYNI modüller-arası güven sınırı gerekçesiyle FK'siz düz bir `Long`.
- `GET ?employeeId=...` — kabul kriteri "kaydedilir" derken kaydın gerçekten kalıcı olduğunu doğrulayabilmek (ve ilerideki story'lerin bu veriyi okuyabilmesi) için eklendi; `leave`'teki gibi `id DESC` ikincil sıralamayla (US-03.4.1'deki ders).
- Bu story'de özel bir `NotFoundException`/`ExceptionHandler` AÇILMADI — yalnızca oluşturma/listeleme var, "olmayan bir kayıt" senaryosu henüz yok; ilk gerçek ihtiyaç ortaya çıktığında (muhtemelen US-08B.1.3'te) eklenecek.
- Rol kısıtlaması eklenmedi — kabul kriteri bundan bahsetmiyor.

**Değişen/eklenen dosyalar:**
- `pom.xml` — `<module>travel</module>`
- `bootstrap/pom.xml` — `travel` bağımlılığı
- `Dockerfile` — `travel` COPY satırları
- `travel/pom.xml` (yeni modül)
- `travel/src/main/resources/db/migration/V41__create_travel_requests.sql`
- `travel/src/main/java/com/digitalik/travel/entity/TravelRequest.java`
- `travel/src/main/java/com/digitalik/travel/repository/TravelRequestRepository.java`
- `travel/src/main/java/com/digitalik/travel/service/TravelRequestService.java`
- `travel/src/main/java/com/digitalik/travel/dto/CreateTravelRequestRequest.java`, `TravelRequestResponse.java`
- `travel/src/main/java/com/digitalik/travel/controller/TravelRequestController.java`
- `travel/src/test/java/com/digitalik/travel/TravelTestApplication.java`
- `travel/src/test/java/com/digitalik/travel/controller/TravelRequestControllerTest.java` (yeni, 7 test)

**Canlı doğrulama:** `docker compose up --build -d` İLK DENEMEDE başarıyla tamamlandı; log'da "Migrating schema "public" to version "41 - create travel requests"" görüldü. Seyahat talebi oluşturuldu (201, tüm alanlar doğru); `GET ?employeeId=30` → kaydı geri okudu; boş lokasyon → 400 "Lokasyon boş olamaz."; bitiş başlangıçtan önce → 400; `employeeId` olmadan liste → 400 "Çalışan boş olamaz."; token olmadan istek → 401. `psql` ile `audit_log`'da `TravelRequest` için 1 CREATE kaydı doğrulandı. Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (6), auth (22), organization (59), leave (52), recruitment (39), performance (44), attendance (28), training (22), travel (7), bootstrap (1) = 280 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

## US-08B.1.2 — Masraf kalemi beyanı (belge yükleme)

**Özet:** `POST /api/travel/requests/{travelRequestId}/expense-items` (multipart) — bir seyahat talebine bağlı masraf kalemini tutar + belge (makbuz/fatura) ile kaydeder. `GET` aynı yoldan kalemleri listeler.

**Tasarım kararları:**
- **`recruitment.Candidate.cvData`'daki (V23) canlıda yaşanan hata PROAKTİF olarak tekrarlanmadı:** `ExpenseItem.documentData`, baştan `@Lob` DEĞİL `@JdbcTypeCode(SqlTypes.VARBINARY)` ile yazıldı — Hibernate'in bunu PostgreSQL'in `oid` mekanizmasına eşlemesini önlemek için. Docker'da gerçek PostgreSQL'e karşı ilk denemede şema doğrulaması hatasız geçti (bkz. canlı doğrulama).
- Multipart yükleme, `recruitment.CandidateController`'daki (US-05.2.1) AYNI desen: belge ayrı bir `multipart/form-data` parçası (`document`), tüm parametreler `required = false` + servis seviyesinde elle doğrulama (US-04.1.2'deki ders).
- **FR-504'ün masraf tipi zenginliği (konaklama/ulaşım/yemek/...) BİLİNÇLİ OLARAK taşınmadı** — roadmap story metni yalnızca "tutar+belge" istiyor, bir "tür" alanından bahsetmiyor (US-08A.1.1'in "ad, tür, süre, sağlayıcı" gibi AÇIKÇA dört alan istediği durumun AKSİNE).
- `amount`, `organization.EmployeeSalaryRecord`'daki AYNI `BigDecimal`/`NUMERIC(12,2)` deseni — para birimi değerleri için `double` KULLANILMADI (yuvarlama hatası riski).
- `ExpenseItemResponse`, `documentData`'yı (ham bayt dizisini) DÖNDÜRMÜYOR — yalnızca dosya adı/içerik türü; `recruitment.CandidateResponse`'un `cvData`'yı döndürmediği AYNI desen (büyük ikili veri, gövdede tekrar gönderilmez).
- Bu story ile birlikte `travel` modülünün İLK `NotFoundException`/`@RestControllerAdvice`'ı (`TravelRequestNotFoundException`/`TravelExceptionHandler`) açıldı — US-08B.1.1'de gerek yoktu (yalnızca oluşturma/listeleme), bu story'de olmayan bir seyahat talebine kalem eklenmeye çalışılması senaryosu ortaya çıktı.
- Rol kısıtlaması eklenmedi — kabul kriteri bundan bahsetmiyor.

**Değişen/eklenen dosyalar:**
- `travel/src/main/resources/db/migration/V42__create_expense_items.sql`
- `travel/src/main/java/com/digitalik/travel/entity/ExpenseItem.java`
- `travel/src/main/java/com/digitalik/travel/repository/ExpenseItemRepository.java`
- `travel/src/main/java/com/digitalik/travel/exception/TravelRequestNotFoundException.java`, `TravelExceptionHandler.java` (yeni)
- `travel/src/main/java/com/digitalik/travel/service/ExpenseItemService.java`
- `travel/src/main/java/com/digitalik/travel/dto/ExpenseItemResponse.java`
- `travel/src/main/java/com/digitalik/travel/controller/ExpenseItemController.java`
- `travel/src/test/java/com/digitalik/travel/controller/ExpenseItemControllerTest.java` (yeni, 6 test)

**Canlı doğrulama:** V42 migration'ı V41'in üzerine uygulandı; log'da şema doğrulama hatası OLMADI (VARBINARY düzeltmesi ilk denemede doğru çalıştı). Bir seyahat talebi oluşturuldu; gerçek bir dosya (`fatura.pdf`, 19 bayt) `multipart/form-data` ile masraf kalemi olarak yüklendi → 201, tutar/dosya adı/içerik türü doğru döndü; `GET` ile geri okundu; belgesiz kalem → 400 "Belge boş olamaz."; sıfır tutar → 400 "Tutar sıfırdan büyük olmalıdır."; olmayan seyahat talebi için kalem → 404 "Seyahat talebi bulunamadı"; token olmadan istek → 401. `psql` ile `expense_items` tablosunda `document_data`'nın GERÇEKTEN 19 bayt olarak (yüklenen dosyayla birebir) saklandığı doğrulandı; `audit_log`'da 1 CREATE kaydı görüldü. Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (6), auth (22), organization (59), leave (52), recruitment (39), performance (44), attendance (28), training (22), travel (13), bootstrap (1) = 286 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

## US-08B.1.3 — Masraf kalemi onayı (EPIC-08B tamamlandı)

**Özet:** `PUT /api/travel/requests/{travelRequestId}/expense-items/{id}/decision` — bir masraf kalemini onaylar/reddeder. Kabul kriteri: "Basit onay adımı; ret gerekçesi zorunlu."

**Tasarım kararları:**
- `ExpenseItem`'e V43 ile `status`/`rejectionReason` eklendi — `leave.LeaveRequest`/`training.TrainingEnrollment`'teki (V19/V39) AYNI "talep→onay" deseninin ÜÇÜNCÜ tekrarı: `PENDING` ile oluşturulur, yalnızca `PENDING` bir kalem karara bağlanabilir, `REJECTED` için gerekçe zorunlu. Var olan (US-08B.1.2'de oluşturulmuş) kayıtlar `PENDING` olarak geriye dönük dolduruldu.
- **Rol kısıtlaması BİLİNÇLİ OLARAK eklenmedi** — `leave`/`training`'in onay uçlarının (US-04.2.2/US-08A.1.2) AKSİNE, bu story'nin kabul kriteri ("Basit onay adımı; ret gerekçesi zorunlu") "yalnızca kendi ekibi" gibi bir kayıt bazlı kısıttan bahsetmiyor — yalnızca story'nin persona satırı ("Yönetici olarak...") bunu ima ediyor, ama kabul kriterinin KENDİSİ bir yetkilendirme kuralı tanımlamıyor. Bu projenin tutarlı "yalnızca kabul kriterinin AÇIKÇA istediğini uygula" prensibiyle, önceki iki onay akışından FARKLI bir karar verildi — kör kopyalama yerine.
- `travel` modülünün İKİNCİ `NotFoundException`'ı (`ExpenseItemNotFoundException`) `TravelExceptionHandler`'a eklendi.
- Onay/ret uç noktası, VAR OLAN `ExpenseItemController`'ın nested yoluna (`/{travelRequestId}/expense-items/{id}/decision`) eklendi — `leave`/`training`'in düz (flat) `/{id}/decision` yollarının AKSİNE, çünkü bu controller zaten `travelRequestId`+`id` ile nested; tutarlılık için aynı desen korundu (`travelRequestId`, karar mantığında ayrıca doğrulanmıyor, yalnızca yol tutarlılığı için).

**Değişen/eklenen dosyalar:**
- `travel/src/main/resources/db/migration/V43__add_status_to_expense_items.sql`
- `travel/src/main/java/com/digitalik/travel/entity/ExpenseItemStatus.java` (yeni)
- `travel/src/main/java/com/digitalik/travel/entity/ExpenseItem.java` — `status`/`rejectionReason`, `approve()`/`reject(...)`
- `travel/src/main/java/com/digitalik/travel/exception/ExpenseItemNotFoundException.java` (yeni)
- `travel/src/main/java/com/digitalik/travel/exception/TravelExceptionHandler.java` — `ExpenseItemNotFoundException` → 404 eşlemesi
- `travel/src/main/java/com/digitalik/travel/service/ExpenseItemService.java` — `decide(...)`
- `travel/src/main/java/com/digitalik/travel/dto/ExpenseItemDecisionRequest.java` (yeni); `ExpenseItemResponse.java` — `status`/`rejectionReason` eklendi
- `travel/src/main/java/com/digitalik/travel/controller/ExpenseItemController.java` — `PUT /{id}/decision` eklendi
- `travel/src/test/java/com/digitalik/travel/controller/ExpenseItemDecisionControllerTest.java` (yeni, 5 test)

**Canlı doğrulama:** V43 migration'ı V42'nin üzerine uygulandı. Bir seyahat talebi + masraf kalemi oluşturuldu. Gerekçesiz RET → 400 "Ret gerekçesi zorunludur."; ONAY → 200, `status=APPROVED`; aynı kaleme tekrar karar → 400 "Bu kalem zaten karara bağlanmış."; olmayan bir kalem → 404 "Masraf kalemi bulunamadı"; token olmadan istek → 401. `psql` ile `audit_log`'da 1 CREATE + 1 UPDATE kaydı doğrulandı (reddedilen erken/tekrar denemeler için kayıt oluşmadı). Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (6), auth (22), organization (59), leave (52), recruitment (39), performance (44), attendance (28), training (22), travel (18), bootstrap (1) = 291 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

## US-08C.1.1 — Uyarı kaydı oluşturma (`discipline` modülü açıldı)

**Özet:** `POST/GET /api/discipline/warnings` — uyarı kaydı (tarih, sebep, açıklama) oluşturma/listeleme. EPIC-08C'nin (Uyarı/Ceza/Ödül ve Disiplin) ilk story'si — yeni bir Maven modülü (`discipline`) açıldı.

**Tasarım kararları:**
- Yeni `discipline` modülü, `travel`/`training`'teki AYNI kuralla kuruldu: yalnızca `core`'a bağımlı, kök `pom.xml`/`bootstrap/pom.xml`'e birer satır, `Dockerfile`'a HEM bağımlılık HEM kaynak-kod COPY satırları PROAKTİF eklendi (Docker build ilk denemede başarılı oldu). İlk migration'ı V44 (travel'ın V43'ünün üzerine).
- **Roadmap story metni FR-1301'in tam zenginliğini KASITLI OLARAK taşımadı:** FR-1301 "veren kişi, kategori+serbest metin, ek belge, çalışan savunması, geçerlilik süresi (3/6/12 ay)" gibi çok daha zengin alanlar istiyor, ama roadmap'in bu story için yazdığı kabul kriteri yalnızca "tarih, sebep, açıklama" — üç alan + çalışana bağlanma. Bu projenin baştan beri sürdürdüğü "roadmap'in basitleştirilmiş kabul kriterini uygula" konvansiyonuna (bkz. US-08B.1.1/US-08B.1.2'deki aynı karar) uyuldu.
- `Warning`, `travel.TravelRequest`'teki (US-08B.1.1) AYNI minimal desen — onay akışı YOK (kabul kriteri bundan bahsetmiyor; FR-1304'teki "ceza süreci" ayrı, çok daha zengin bir story/epic konusu — bu story yalnızca UYARI, ceza değil).
- `employeeId`, diğer tüm modüllerdeki AYNI modüller-arası güven sınırı gerekçesiyle FK'siz düz bir `Long`.
- Rol kısıtlaması eklenmedi — kabul kriteri bundan bahsetmiyor.

**Değişen/eklenen dosyalar:**
- `pom.xml` — `<module>discipline</module>`
- `bootstrap/pom.xml` — `discipline` bağımlılığı
- `Dockerfile` — `discipline` COPY satırları
- `discipline/pom.xml` (yeni modül)
- `discipline/src/main/resources/db/migration/V44__create_warnings.sql`
- `discipline/src/main/java/com/digitalik/discipline/entity/Warning.java`
- `discipline/src/main/java/com/digitalik/discipline/repository/WarningRepository.java`
- `discipline/src/main/java/com/digitalik/discipline/service/WarningService.java`
- `discipline/src/main/java/com/digitalik/discipline/dto/CreateWarningRequest.java`, `WarningResponse.java`
- `discipline/src/main/java/com/digitalik/discipline/controller/WarningController.java`
- `discipline/src/test/java/com/digitalik/discipline/DisciplineTestApplication.java`
- `discipline/src/test/java/com/digitalik/discipline/controller/WarningControllerTest.java` (yeni, 7 test)

**Canlı doğrulama:** `docker compose up --build -d` İLK DENEMEDE başarıyla tamamlandı; log'da "Migrating schema "public" to version "44 - create warnings"" görüldü. Uyarı kaydı oluşturuldu (201, tüm alanlar doğru, çalışana bağlı); `GET ?employeeId=70` → kaydı geri okudu; boş sebep → 400 "Sebep boş olamaz."; `employeeId` olmadan liste → 400 "Çalışan boş olamaz."; token olmadan istek → 401. `psql` ile `audit_log`'da `Warning` için 1 CREATE kaydı doğrulandı. Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (6), auth (22), organization (59), leave (52), recruitment (39), performance (44), attendance (28), training (22), travel (18), discipline (7), bootstrap (1) = 298 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

## US-08C.1.2 — Ceza sürecini kaydetme (savunma alınmadan kapanmama kuralı)

**Özet:** `POST /api/discipline/cases` (ceza süreci açma) + `PUT /{id}/defense` (çalışan savunmasını kaydetme) + `PUT /{id}/close` (süreci kapatma) + `GET ?employeeId=...` (listeleme). Kabul kriteri: "Savunma alanı boşken süreç tamamlanamaz." (FR-1314'teki "kritik kural").

**Tasarım kararları:**
- **FR-1304'ün tam zenginliği (talep→disiplin kuruluna sevk→kurul değerlendirme/karar→çok seviyeli onay→bildirim) BİLİNÇLİ OLARAK taşınmadı** — roadmap'in bu story için yazdığı kabul kriteri yalnızca "ceza sürecini kaydetmek" ve "savunma alınmadan süreç kapanmamalı" diyor. Bu projenin `US-08A.1.1`'den beri sürdürdüğü "roadmap'in basitleştirilmiş kabul kriterini uygula, tam FR zenginliğini SONRAKİ/ayrı bir story'ye bırak" konvansiyonuna uyuldu.
- `DisciplinaryCase`, `leave.LeaveRequest`/`training.TrainingEnrollment`'teki "talep→onay" deseninden BİLİNÇLİ OLARAK FARKLI bir durum makinesi kullanıyor (`OPEN`/`CLOSED`, `APPROVED`/`REJECTED` DEĞİL) — çünkü buradaki kabul kriteri bir onay/ret kararı değil, bir sürecin ne zaman "kapanabileceğini" (savunma şartı) tanımlıyor.
- `defense` (savunma) alanı entity'de NULLABLE — süreç açıldığında henüz alınmamış olabilir; asıl kural doğrulaması yalnızca `close()` çağrısında (`DisciplinaryCaseService.close`): savunma boşsa 400, süreç zaten `CLOSED` ise ayrıca 400 (`training.TrainingEnrollmentService.decide`'daki AYNI "yalnızca açık/bekleyen bir kayıt işlem görebilir" deseni).
- Savunma, `recordDefense(...)` ile süreç `OPEN` olduğu sürece herhangi bir anda (ve tekrar) kaydedilebilir — kabul kriteri "ne zaman" alınacağını değil, yalnızca "kapanmadan önce alınmış olması" gerektiğini şart koşuyor.
- Bu story ile birlikte `discipline` modülünün İLK `NotFoundException`/`@RestControllerAdvice`'ı (`DisciplinaryCaseNotFoundException`/`DisciplineExceptionHandler`, `@Order(HIGHEST_PRECEDENCE)`) açıldı — US-08C.1.1'de (yalnızca oluşturma/listeleme) gerek yoktu (`travel`'daki US-08B.1.2 ile AYNI tetikleyici).
- Rol kısıtlaması eklenmedi (ne oluşturmada ne savunma kaydında ne kapatmada) — kabul kriteri bundan bahsetmiyor (`travel.ExpenseItem`'in onay ucundaki (US-08B.1.3) AYNI "yalnızca kabul kriterinin AÇIKÇA istediğini uygula" kararı).

**Değişen/eklenen dosyalar:**
- `discipline/src/main/resources/db/migration/V45__create_disciplinary_cases.sql`
- `discipline/src/main/java/com/digitalik/discipline/entity/DisciplinaryCaseStatus.java` (yeni), `DisciplinaryCase.java` (yeni)
- `discipline/src/main/java/com/digitalik/discipline/repository/DisciplinaryCaseRepository.java`
- `discipline/src/main/java/com/digitalik/discipline/exception/DisciplinaryCaseNotFoundException.java`, `DisciplineExceptionHandler.java` (yeni)
- `discipline/src/main/java/com/digitalik/discipline/service/DisciplinaryCaseService.java`
- `discipline/src/main/java/com/digitalik/discipline/dto/CreateDisciplinaryCaseRequest.java`, `RecordDefenseRequest.java`, `DisciplinaryCaseResponse.java`
- `discipline/src/main/java/com/digitalik/discipline/controller/DisciplinaryCaseController.java`
- `discipline/src/test/java/com/digitalik/discipline/controller/DisciplinaryCaseControllerTest.java` (yeni, 9 test)

**Canlı doğrulama:** `docker compose down -v` + `docker compose up --build -d` (temiz veri hacmiyle) → log'da "Migrating schema "public" to version "45 - create disciplinary cases"" görüldü, "Successfully applied 45 migrations". Admin ile giriş yapılıp token alındı. Süreç açıldı (201, `status=OPEN`, `defense=null`); savunma OLMADAN kapatma → 400 "Savunma alınmadan ceza süreci tamamlanamaz."; savunma kaydedildi (200, `defense` doldu, `status` hâlâ `OPEN`); kapatma → 200, `status=CLOSED`; tekrar kapatma → 400 "Bu süreç zaten kapatılmış."; `GET ?employeeId=80` → doğru kaydı döndürdü; olmayan bir sürece savunma ekleme → 404 "Ceza süreci bulunamadı."; token olmadan istek → 401. `psql` ile `audit_log`'da ilk süreç için 1 CREATE + 2 UPDATE (savunma + kapatma) kaydı doğrulandı; ikinci (yalnızca açılıp reddedilen kapatma denemesiyle biten) süreç için yalnızca 1 CREATE vardı — reddedilen kapatma denemesi kayıt oluşturmadı. Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (6), auth (22), organization (59), leave (52), recruitment (39), performance (44), attendance (28), training (22), travel (18), discipline (16), bootstrap (1) = 307 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

## US-08C.1.3 — Disiplin kayıtları değiştirilemez, yalnızca revizyon eklenebilir (SEC-021)

**Özet:** `DisciplinaryCase` (US-08C.1.2), var olan bir satırı `UPDATE` ile mutasyona uğratan modelden, her değişiklikte (savunma kaydı, kapatma) önceki durumu miras alan YENİ bir satır (revizyon) EKLEYEN bir modele dönüştürüldü. Kabul kriteri: "Var olan kayıt güncellenemez; yeni revizyon eklenir." (SEC-021: "Disiplin modülünde geçmiş kayıtlar değiştirilemez, yalnızca revizyon eklenebilir (veri bütünlüğü).")

**Kapsam kararı:** Roadmap'in kabul kriteri "disiplin kayıtları" diyor ama bu story'nin AÇIKÇA bağımlı olduğu tek story US-08C.1.2 (`Warning`/US-08C.1.1 DEĞİL). `Warning`'in zaten hiçbir güncelleme ucu yok (yalnızca oluşturma/listeleme) — "değiştirilemez" olma özelliği orada zaten no-op. Asıl anlamlı hedef `DisciplinaryCase`: `recordDefense`/`close` (US-08C.1.2) VAR OLAN satırı gerçekten `UPDATE` ediyordu, SEC-021'i ihlal eden tam olarak buydu. Bu nedenle kapsam yalnızca `DisciplinaryCase`'e uygulandı.

**Tasarım kararları — revizyon modeli:**
- `DisciplinaryCase`'e `caseId` (nullable `Long`) eklendi (V46, self-referencing FK). `caseId IS NULL` → bu satır sürecin İLK (kök) revizyonu, kendi id'si "süreç id"si. `caseId` DOLU → işaret ettiği id kök revizyonun id'si. Bu, kendi id'sini bilmeden (insert öncesi) bir satırın "kendi kökü olduğunu" ifade etmesini sağlıyor — kök satırın SONRADAN `caseId=kendi id'si` ile güncellenmesi gerekmiyor (ki bu da bir UPDATE, yani tam da önlenmek istenen şey olurdu).
- Entity'nin `recordDefense(...)`/`close()` INSTANCE metodları (US-08C.1.2, `this`'i mutasyona uğratıyordu) KALDIRILDI; yerine `previous`'u DEĞİŞTİRMEDEN yeni bir örnek üreten statik fabrikalar (`open`, `reviseWithDefense`, `reviseAsClosed`) eklendi. `DisciplinaryCaseService` artık hiçbir zaman fetch edilmiş bir örneği mutasyona uğratıp tekrar `save` etmiyor — her zaman `save(YeniRevizyon)` (INSERT).
- **Dış sözleşme DEĞİŞMEDİ:** `DisciplinaryCaseController.toResponse`, satırın kendi `id`'si yerine `rootCaseId()` döndürüyor — istemci `POST /cases`'ten aldığı id'yi sürecin ömrü boyunca (`/defense`, `/close` çağrılarında) DEĞİŞMEDEN kullanmaya devam ediyor; API yüzeyinde hiçbir kırılma yok. US-08C.1.2'nin 9 testi, hiçbir değişiklik gerekmeden aynen geçmeye devam etti.
- `GET ?employeeId=...`, repository'den TÜM revizyonları çekip (`findRevisionsByRootId` DEĞİL, mevcut `findByEmployeeIdOrderByIdDesc`), kök sürece göre bellek içinde gruplanıp yalnızca en GÜNCEL revizyon dönecek şekilde güncellendi (`DisciplinaryCaseService.listByEmployee`) — dışarıya hâlâ "her süreç tek satır" görünümü korunuyor.
- Yeni bir repository sorgusu (`findRevisionsByRootId`) eklendi: verilen kök id için TÜM revizyonları en yeni önce döner; `latestRevision(caseId)` bunun ilk elemanını alır.

**Değişen/eklenen dosyalar:**
- `discipline/src/main/resources/db/migration/V46__add_case_id_to_disciplinary_cases.sql`
- `discipline/src/main/java/com/digitalik/discipline/entity/DisciplinaryCase.java` — `caseId` alanı, `recordDefense()`/`close()` instance metodları kaldırıldı, `open`/`reviseWithDefense`/`reviseAsClosed`/`rootCaseId()` eklendi
- `discipline/src/main/java/com/digitalik/discipline/repository/DisciplinaryCaseRepository.java` — `findRevisionsByRootId(...)` eklendi
- `discipline/src/main/java/com/digitalik/discipline/service/DisciplinaryCaseService.java` — mutasyon yerine revizyon-insert deseni; `listByEmployee` kök sürece göre gruplama eklendi
- `discipline/src/main/java/com/digitalik/discipline/controller/DisciplinaryCaseController.java` — `toResponse` artık `rootCaseId()` döndürüyor
- `discipline/src/test/java/com/digitalik/discipline/controller/DisciplinaryCaseControllerTest.java` — `kayitlarGuncellenmezYeniRevizyonEklenir` testi eklendi (yeni, repository'yi doğrudan sorgulayıp her adımda satır SAYISININ arttığını VE kök satırın hiç değişmediğini kanıtlıyor)

**Canlı doğrulama:** `docker compose down -v` + `docker compose up --build -d` → log'da "Migrating schema "public" to version "46 - add case id to disciplinary cases"", "Successfully applied 46 migrations". Süreç açıldı (`id=1`); savunma kaydedildi; kapatıldı — HER ÜÇ yanıt da AYNI `id=1`'i gösterdi (dış sözleşme değişmedi). `psql` ile `disciplinary_cases` tablosunda GERÇEKTEN 3 fiziksel satır olduğu doğrulandı (`id=1, case_id=NULL, OPEN, defense=NULL` — kök; `id=2, case_id=1, OPEN, defense=dolu`; `id=3, case_id=1, CLOSED, defense=dolu`); kök satır (`id=1`) sorgulandığında hâlâ `OPEN`/`defense=NULL` olduğu, yani HİÇ değişmediği doğrulandı. `audit_log`'da bu süreç için yalnızca 3 `CREATE` kaydı vardı, `UPDATE` YOKTU — SEC-021'in "değiştirilemez" şartı veritabanı seviyesinde kanıtlandı. Ayrıca: savunmasız kapatma → 400; zaten kapalı bir süreci tekrar kapatma → 400; olmayan süreç → 404 (hepsi US-08C.1.2'deki davranışla birebir aynı). Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (6), auth (22), organization (59), leave (52), recruitment (39), performance (44), attendance (28), training (22), travel (18), discipline (17), bootstrap (1) = 308 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

## US-08C.1.4 — Ödül kaydı oluşturma (EPIC-08C tamamlandı)

**Özet:** `POST/GET /api/discipline/awards` — ödül kaydı (takdir belgesi, prim vb.) oluşturma/listeleme. Kabul kriteri: "Kayıt çalışana bağlanır." Bu story ile EPIC-08C (Uyarı/Ceza/Ödül ve Disiplin) tamamlandı.

**Tasarım kararları:**
- **FR-1308'in tam zenginliği (ödül türleri enum'u, veren kişi, ek doküman) BİLİNÇLİ OLARAK taşınmadı** — roadmap'in bu story için yazdığı kabul kriteri yalnızca "Kayıt çalışana bağlanır." `Award`, `Warning`'deki (US-08C.1.1) AYNI minimal desen — bu story'nin roadmap bağımlılığı da (US-03.2.1) `Warning`/`DisciplinaryCase` DEĞİL doğrudan çalışan kaydı; EPIC-08C içindeki diğer story'lerden BAĞIMSIZ olduğunu doğruluyor.
- `type` alanı SERBEST METİN — story metnindeki "(takdir belgesi, prim vb.)" ifadesi sabit bir tür kümesi değil, örnek değerler; `training.Training.type`'daki (US-08A.1.1) AYNI gerekçeyle bir enum icat edilmedi.
- Onay akışı YOK, `NotFoundException`/update ucu YOK — kabul kriteri yalnızca oluşturma+bağlanma istiyor (`Warning`'deki AYNI kapsam kararı); `DisciplinaryCase`'deki (US-08C.1.2/1.3) revizyon modeli BURADA GEREKMİYOR çünkü `Award`'ın hiç güncelleme ucu yok — SEC-021'in "değiştirilemez" şartı zaten no-op olarak sağlanıyor.
- Rol kısıtlaması eklenmedi — kabul kriteri bundan bahsetmiyor.

**Değişen/eklenen dosyalar:**
- `discipline/src/main/resources/db/migration/V47__create_awards.sql`
- `discipline/src/main/java/com/digitalik/discipline/entity/Award.java`
- `discipline/src/main/java/com/digitalik/discipline/repository/AwardRepository.java`
- `discipline/src/main/java/com/digitalik/discipline/service/AwardService.java`
- `discipline/src/main/java/com/digitalik/discipline/dto/CreateAwardRequest.java`, `AwardResponse.java`
- `discipline/src/main/java/com/digitalik/discipline/controller/AwardController.java`
- `discipline/src/test/java/com/digitalik/discipline/controller/AwardControllerTest.java` (yeni, 7 test)

**Canlı doğrulama:** `docker compose down -v` + `docker compose up --build -d` → log'da "Migrating schema "public" to version "47 - create awards"", "Successfully applied 47 migrations". Ödül oluşturuldu (201, tüm alanlar doğru, çalışana bağlı); `GET ?employeeId=70` → kaydı geri okudu; boş tür → 400 "Ödül türü boş olamaz."; token olmadan istek → 401. `psql` ile `audit_log`'da `Award` için 1 CREATE kaydı doğrulandı. Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (6), auth (22), organization (59), leave (52), recruitment (39), performance (44), attendance (28), training (22), travel (18), discipline (24), bootstrap (1) = 315 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

# Bölüm 8E — Anket

> Roadmap notu: EPIC-08D (Bordro), kendi bölümündeki notta "diğer modüllerden SONRA ele alınması doğaldır" dediğinden bilinçli olarak atlandı; roadmap sırası izlenerek EPIC-08E'ye (Anket) geçildi.

## US-08E.1.1 — Basit anket oluşturma (`survey` modülü açıldı)

**Özet:** `POST/GET /api/surveys` — soru + seçenek listesiyle anket oluşturma/listeleme. EPIC-08E'nin (Anket) ilk story'si — yeni bir Maven modülü (`survey`) açıldı.

**Tasarım kararları:**
- Yeni `survey` modülü, `discipline`/`travel`'daki AYNI kuralla kuruldu: yalnızca `core`'a bağımlı, kök `pom.xml`/`bootstrap/pom.xml`'e birer satır, `Dockerfile`'a HEM bağımlılık HEM kaynak-kod COPY satırları PROAKTİF eklendi (Docker build ilk denemede başarılı oldu, US-07.1.1'deki ders tekrar uygulandı). İlk migration'ı V48 (awards'ın V47'sinin üzerine).
- `Survey` (soru) + `SurveyOption` (seçenek, `surveyId` ile bağlı) — `performance.Goal`/`Competency`'nin (V28) AYNI gerekçesiyle, birlikte tanıtılan iki sıkı bağlı tablo TEK migration'da oluşturuldu. `SurveyOption.surveyId`, `training.TrainingEnrollment.trainingId`'deki AYNI ayrımla AYNI modül içi bir varlığa bağlandığından `employeeId` gibi alanlardan FARKLI olarak normal bir DB FK ile tutuluyor.
- **FR-700'ün zenginliği (hedef kitle: departman/lokasyon, anlık/planlı yayınlama) BİLİNÇLİ OLARAK taşınmadı** — kabul kriteri yalnızca "Soru+seçenek listesiyle anket oluşturulur" diyor. Ayrı bir taslak/yayın durumu da YOK — roadmap'in "oluşturup yayınlamak" ifadesi kabul kriterinde bir durum ayrımı istemediğinden, oluşturma tek adımda "yayınlanmış" kabul ediliyor.
- **En az iki seçenek zorunlu tutuldu** — kabul kriteri bunu açıkça yazmasa da, "seçenek listesi" ifadesi ve bir anketin/oylamanın doğası gereği tek seçenekli bir anket anlamsız; bu proje boyunca benzer örtük-ama-bariz doğrulamalar (ör. US-08A.1.2'deki ret gerekçesi zorunluluğu) aynı gerekçeyle uygulandı.
- `GET /surveys` TÜM anketleri döner (henüz filtre yok) — kabul kriteri bundan bahsetmiyor; `GET /{id}` (tekil) EKLENMEDİ — cevap verme (US-08E.1.2) ihtiyacı ortaya çıktığında eklenecek (YAGNI).
- Rol kısıtlaması eklenmedi — kabul kriteri bundan bahsetmiyor.

**Değişen/eklenen dosyalar:**
- `pom.xml` — `<module>survey</module>`
- `bootstrap/pom.xml` — `survey` bağımlılığı
- `Dockerfile` — `survey` COPY satırları
- `survey/pom.xml` (yeni modül)
- `survey/src/main/resources/db/migration/V48__create_surveys.sql`
- `survey/src/main/java/com/digitalik/survey/entity/Survey.java`, `SurveyOption.java`
- `survey/src/main/java/com/digitalik/survey/repository/SurveyRepository.java`, `SurveyOptionRepository.java`
- `survey/src/main/java/com/digitalik/survey/service/SurveyService.java`
- `survey/src/main/java/com/digitalik/survey/dto/CreateSurveyRequest.java`, `SurveyOptionResponse.java`, `SurveyResponse.java`
- `survey/src/main/java/com/digitalik/survey/controller/SurveyController.java`
- `survey/src/test/java/com/digitalik/survey/SurveyTestApplication.java`
- `survey/src/test/java/com/digitalik/survey/controller/SurveyControllerTest.java` (yeni, 6 test)

**Canlı doğrulama:** `docker compose down -v` + `docker compose up --build -d` İLK DENEMEDE başarıyla tamamlandı; log'da "Migrating schema "public" to version "48 - create surveys"", "Successfully applied 48 migrations". Anket oluşturuldu (201, 3 seçenekle, her seçeneğin kendi id'si döndü); `GET /surveys` → aynı anketi seçenekleriyle geri okudu; boş soru → 400 "Soru boş olamaz."; tek seçenek → 400 "En az iki seçenek gereklidir."; token olmadan istek → 401. `psql` ile `surveys`/`survey_options` tablolarında satırların doğru (1 anket + 3 seçenek, `survey_id` doğru) olduğu ve `audit_log`'da `Survey` için 1, `SurveyOption` için 3 `CREATE` kaydı olduğu doğrulandı. Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (6), auth (22), organization (59), leave (52), recruitment (39), performance (44), attendance (28), training (22), travel (18), discipline (24), survey (6), bootstrap (1) = 321 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

## US-08E.1.2 — Ankete yanıt verme (anonim seçenek)

**Özet:** `POST /api/surveys/{surveyId}/answers` — çalışan bir ankete yanıt verir. Kabul kriteri: "Yanıt kaydedilir; anonim seçeneği varsa kullanıcı bilgisi tutulmaz." (FR-704).

**Tasarım kararları:**
- **`Survey`'e geriye dönük `anonymous` bayrağı eklendi (V49, `recruitment`'taki V24'teki AYNI ALTER+DROP DEFAULT deseni):** Kabul kriteri "anonim seçeneği varsa" diyor — bu, FR-700'ün "anonim anket seçeneği (opsiyonel, aktif edilebilir)" (FR-704) ifadesiyle birebir örtüşüyor; yani anonimlik ANKET oluşturulurken İK tarafından işaretlenen bir özellik, yanıt anında çalışanın seçtiği bir şey DEĞİL. US-08E.1.1'in kabul kriteri bunu istemediğinden o story'de eklenmemişti; bu story'nin AÇIKÇA gerektirdiği an geldi.
- **`SurveyAnswer.employeeId` NULLABLE ve anonim ankette BİLİNÇLİ OLARAK hiç yazılmıyor:** `SurveyAnswerService.submit`, istemci `employeeId` gönderse BİLE (`survey.isAnonymous()` ise) bunu YOK SAYIP `null` kaydediyor — kabul kriterinin "tutulmaz" ifadesi isteğin reddi değil, VERİNİN kalıcı olarak yazılmaması anlamına geliyor. Canlı doğrulamada `psql` ile bu satırın GERÇEKTEN `employee_id IS NULL` olduğu kanıtlandı (uygulama seviyesinde maskeleme değil, DB seviyesinde yokluk).
- Anonim OLMAYAN bir ankette `employeeId` ZORUNLU — yanıtın kime ait olduğu bilinmeli (ör. ilerideki "yöneticinin kimin hangi seçeneğe oy verdiğini görebilmesi" FR-702 gibi ihtiyaçlar için).
- `survey`'in İLK `NotFoundException`/`@RestControllerAdvice`'ı (`SurveyNotFoundException`, `SurveyOptionNotFoundException`, `SurveyExceptionHandler`, `@Order(HIGHEST_PRECEDENCE)`) bu story ile açıldı — US-08E.1.1'de (yalnızca oluşturma/listeleme) gerek yoktu.
- Seçenek GERÇEKTEN var ama BAŞKA bir ankete aitse — bu bir "bulunamadı" değil bir doğrulama hatası (400 "Seçenek bu ankete ait değil."), `SurveyOptionNotFoundException` (404, seçenek hiç yok) ile KARIŞTIRILMADI.
- Tekrar oy verme kısıtı (bir çalışan bir ankete yalnızca bir kez yanıt verebilir) BİLİNÇLİ OLARAK eklenmedi — kabul kriteri bundan bahsetmiyor; ayrıca anonim bir ankette bu pratikte uygulanamaz da (kimin daha önce oy verdiği bilinmiyor) — bu ikisi arasındaki tutarsızlık, kısıtı eklememe kararını daha da destekliyor.
- Rol kısıtlaması eklenmedi — kabul kriteri bundan bahsetmiyor.

**Değişen/eklenen dosyalar:**
- `survey/src/main/resources/db/migration/V49__add_anonymous_to_surveys_and_create_survey_answers.sql`
- `survey/src/main/java/com/digitalik/survey/entity/Survey.java` — `anonymous` alanı eklendi
- `survey/src/main/java/com/digitalik/survey/entity/SurveyAnswer.java` (yeni)
- `survey/src/main/java/com/digitalik/survey/repository/SurveyAnswerRepository.java` (yeni)
- `survey/src/main/java/com/digitalik/survey/exception/SurveyNotFoundException.java`, `SurveyOptionNotFoundException.java`, `SurveyExceptionHandler.java` (yeni)
- `survey/src/main/java/com/digitalik/survey/service/SurveyService.java` — `create` artık `anonymous` parametresi alıyor
- `survey/src/main/java/com/digitalik/survey/service/SurveyAnswerService.java` (yeni)
- `survey/src/main/java/com/digitalik/survey/dto/CreateSurveyRequest.java`, `SurveyResponse.java` — `anonymous` alanı eklendi; `SubmitSurveyAnswerRequest.java`, `SurveyAnswerResponse.java` (yeni)
- `survey/src/main/java/com/digitalik/survey/controller/SurveyController.java` — `anonymous` alanı işleniyor; `SurveyAnswerController.java` (yeni)
- `survey/src/test/java/com/digitalik/survey/controller/SurveyControllerTest.java` — `CreateSurveyRequest` çağrıları güncellendi; `SurveyAnswerControllerTest.java` (yeni, 7 test)

**Canlı doğrulama:** `docker compose down -v` + `docker compose up --build -d` → log'da "Migrating schema "public" to version "49 - add anonymous to surveys and create survey answers"", "Successfully applied 49 migrations". Anonim OLMAYAN ankete `employeeId=42` ile yanıt → 201, `employeeId=42` döndü; `employeeId` olmadan aynı ankete yanıt → 400 "Çalışan boş olamaz."; anonim ankete `employeeId=42` GÖNDERİLEREK yanıt → 201 ama yanıtta `employeeId=null`; `psql` ile `survey_answers` tablosu sorgulandı — anonim ankete ait satırda `employee_id` GERÇEKTEN `NULL`, diğerinde `42` olduğu doğrulandı; olmayan anket → 404 "Anket bulunamadı."; olmayan seçenek → 404 "Seçenek bulunamadı."; başka anketin seçeneğiyle yanıt → 400 "Seçenek bu ankete ait değil."; `audit_log`'da `Survey` (2), `SurveyOption` (4), `SurveyAnswer` (2) için doğru `CREATE` sayıları görüldü. Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (6), auth (22), organization (59), leave (52), recruitment (39), performance (44), attendance (28), training (22), travel (18), discipline (24), survey (13), bootstrap (1) = 328 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

## US-08E.1.3 — Anket sonuçlarını yüzdesel dağılımla görüntüleme (EPIC-08E tamamlandı)

**Özet:** `GET /api/surveys/{id}/results` — bir anketin seçenek bazlı oy sayısı ve yüzdesel dağılımını döner. Kabul kriteri: "Sonuç ekranı seçenek bazlı yüzde gösterir." Bu story ile EPIC-08E (Anket) tamamlandı.

**Tasarım kararları:**
- **FR-702'nin "yöneticinin kimin hangi seçeneğe oy verdiğini görebilmesi" zenginliği BİLİNÇLİ OLARAK taşınmadı** — kabul kriteri yalnızca "seçenek bazlı yüzde" istiyor; ayrıca bu, anonim bir ankette PRENSİP OLARAK mümkün değil (US-08E.1.2'de `employeeId` hiç kaydedilmiyor) — kısmi bir uygulama (yalnızca anonim olmayan anketlerde kimlik gösterme) kabul kriterinin istemediği bir asimetri yaratırdı.
- **FR-705'in "grafiksel raporlama" kısmı KAPSAM DIŞI** — bu proje şimdiye kadar yalnızca backend/API story'leri teslim etti (frontend henüz yok); "grafik" bir sunum katmanı kaygısı, API'nin görevi ham sayıları (oy sayısı + yüzde) doğru döndürmek.
- **Yeni bir migration YOK** — sonuçlar, var olan `survey_answers`/`survey_options` verisinden İSTEK ANINDA hesaplanıyor (bellek içi gruplama, `SurveyAnswerService.getResults`); ayrı bir "sonuç" tablosu/önbelleği kurmak bu ölçekte gereksiz bir genelleştirme olurdu.
- **Hiç yanıt yokken (toplam 0) bölme hatası yerine tüm seçenekler %0 döner** — kabul kriteri boş anket senaryosundan bahsetmiyor ama bu, `ArithmeticException`/`NaN` gibi bir çökmeye karşı bariz, güvenli bir varsayılan.
- Yüzdeler bir ondalık basamağa yuvarlanıyor (`Math.round(value * 10.0) / 10.0`) — ham `double` bölmesinin ürettiği (ör. `33.333333...`) çirkin/faydasız hassasiyet yerine.
- Sonuç uç noktası `SurveyController`'a (ayrı bir controller yerine) eklendi — kaynak zaten "anket" (`/api/surveys/{id}/...`), `training`'deki `TrainingEnrollmentController.listCompleted`'ın kendi controller'ına eklenmesiyle AYNI karar.
- Rol kısıtlaması eklenmedi — kabul kriteri bundan bahsetmiyor.

**Değişen/eklenen dosyalar:**
- `survey/src/main/java/com/digitalik/survey/repository/SurveyAnswerRepository.java` — `findBySurveyId(...)` eklendi
- `survey/src/main/java/com/digitalik/survey/service/SurveyAnswerService.java` — `getResults(...)`, `OptionResult`/`SurveyResults` record'ları eklendi
- `survey/src/main/java/com/digitalik/survey/dto/SurveyOptionResultResponse.java`, `SurveyResultResponse.java` (yeni)
- `survey/src/main/java/com/digitalik/survey/controller/SurveyController.java` — `GET /{id}/results` eklendi, `SurveyAnswerService` bağımlılığı eklendi
- `survey/src/test/java/com/digitalik/survey/controller/SurveyResultControllerTest.java` (yeni, 3 test)

**Canlı doğrulama:** `docker compose down -v` + `docker compose up --build -d` (V49'da kaldı — bu story yeni migration eklemiyor). 3 seçenekli bir anket oluşturuldu; yanıtsızken sonuç → tüm seçenekler `voteCount=0`/`percentage=0.0`; 6 oy (3+3+0 dağılımla) verildikten sonra sonuç → `totalResponses=6`, ilk iki seçenek `voteCount=3`/`percentage=50.0`, üçüncü `voteCount=0`/`percentage=0.0`; olmayan anket → 404 "Anket bulunamadı."; token olmadan istek → 401. Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (6), auth (22), organization (59), leave (52), recruitment (39), performance (44), attendance (28), training (22), travel (18), discipline (24), survey (16), bootstrap (1) = 331 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

# Bölüm 8F — Talep ve Fikir

## US-08F.1.1 — Kategori seçip talep/fikir gönderme (`suggestion` modülü açıldı)

**Özet:** `POST/GET/PUT/DELETE /api/suggestions/categories` (kategori CRUD) + `POST/GET /api/suggestions` (talep/fikir gönderme/listeleme). EPIC-08F'nin (Talep ve Fikir) ilk story'si — yeni bir Maven modülü (`suggestion`) açıldı.

**Tasarım kararları:**
- Yeni `suggestion` modülü, `survey`/`discipline`'daki AYNI kuralla kuruldu: yalnızca `core`'a bağımlı, kök `pom.xml`/`bootstrap/pom.xml`'e birer satır, `Dockerfile`'a HEM bağımlılık HEM kaynak-kod COPY satırları PROAKTİF eklendi (Docker build ilk denemede başarılı oldu). İlk migration'ı V50 (survey'in V49'unun üzerine); `suggestion_categories`+`suggestions` tabloları `performance`/`survey`'deki (V28/V48) AYNI gerekçeyle (birlikte tanıtılan sıkı bağlı iki tablo) TEK migration'da oluşturuldu.
- **`SuggestionCategory`, `organization.JobTitle`'daki AYNI minimal referans listesi deseni** (yalnızca `name`, tam CRUD: create/list/update/delete) — kabul kriteri AÇIKÇA "Kategori basit bir referans listesidir" diyor. **FR-801'in örnek kategorileri (süreç iyileştirme, teknoloji/sistem geliştirme, ...) seed data olarak taşınmadı** — `auth.Role`'ün (US-02.2.1, kabul kriteri "hazır gelir" diyordu) AKSİNE, bu story'nin kabul kriteri seed'den bahsetmiyor; kategoriler API üzerinden İK tarafından eklenecek.
- **`Suggestion.employeeId` NULLABLE, ayrı bir `anonymous` sütunu YOK** — FR-800'ün "opsiyonel anonim gönderim" ihtiyacı, `survey.SurveyAnswer`'daki (US-08E.1.2) AYNI gerekçeyle çözüldü: istemci `anonymous=true` gönderdiğinde `SuggestionService.create`, `employeeId` VERİLMİŞ OLSA BİLE bunu `null` olarak kaydediyor. **Kritik fark:** Survey'de anonimlik ANKET seviyesinde (HR tarafından, tüm yanıtlara uygulanan) sabitken, burada anonimlik HER GÖNDERİM için çalışanın kendi seçimi (FR-800: "opsiyonel anonim gönderim") — bu yüzden `Survey.anonymous` gibi kalıcı bir bayrak yerine, yalnızca istek anında değerlendirilen bir parametre.
- **Bu story'de HENÜZ bir `status` sütunu YOK** — `travel.ExpenseItem`'in (US-08B.1.2→US-08B.1.3) AYNI deseni: durum, yalnızca durum GÜNCELLEME ihtiyacı (US-08F.1.2) ortaya çıktığında ayrı bir `ALTER` migration'la eklenecek.
- `GET /api/suggestions`, `employeeId` ZORUNLU parametresiyle çalışır (`Warning`'deki AYNI desen) — anonim gönderilen talepler bu sorguda görünmez (employeeId yok); bu, kabul kriterinin doğal bir sonucu, ayrı bir kısıtlama değil.
- `suggestion` modülünün İLK `NotFoundException`'ı yalnızca `SuggestionCategoryNotFoundException` (kategori referans bütünlüğü için gerekli); `SuggestionNotFoundException` bu story'de EKLENMEDİ — henüz bir talebi id ile bulan bir uç yok, US-08F.1.2'de (durum güncelleme) eklenecek.
- Rol kısıtlaması eklenmedi — kabul kriteri bundan bahsetmiyor.

**Değişen/eklenen dosyalar:**
- `pom.xml` — `<module>suggestion</module>`
- `bootstrap/pom.xml` — `suggestion` bağımlılığı
- `Dockerfile` — `suggestion` COPY satırları
- `suggestion/pom.xml` (yeni modül)
- `suggestion/src/main/resources/db/migration/V50__create_suggestion_categories_and_suggestions.sql`
- `suggestion/src/main/java/com/digitalik/suggestion/entity/SuggestionCategory.java`, `Suggestion.java`
- `suggestion/src/main/java/com/digitalik/suggestion/repository/SuggestionCategoryRepository.java`, `SuggestionRepository.java`
- `suggestion/src/main/java/com/digitalik/suggestion/exception/SuggestionCategoryNotFoundException.java`, `SuggestionExceptionHandler.java`
- `suggestion/src/main/java/com/digitalik/suggestion/service/SuggestionCategoryService.java`, `SuggestionService.java`
- `suggestion/src/main/java/com/digitalik/suggestion/dto/SuggestionCategoryRequest.java`, `SuggestionCategoryResponse.java`, `CreateSuggestionRequest.java`, `SuggestionResponse.java`
- `suggestion/src/main/java/com/digitalik/suggestion/controller/SuggestionCategoryController.java`, `SuggestionController.java`
- `suggestion/src/test/java/com/digitalik/suggestion/SuggestionTestApplication.java`
- `suggestion/src/test/java/com/digitalik/suggestion/controller/SuggestionCategoryControllerTest.java` (yeni, 5 test), `SuggestionControllerTest.java` (yeni, 7 test)

**Canlı doğrulama:** `docker compose down -v` + `docker compose up --build -d` İLK DENEMEDE başarıyla tamamlandı; log'da "Migrating schema "public" to version "50 - create suggestion categories and suggestions"", "Successfully applied 50 migrations". Kategori oluşturuldu (201); anonim OLMAYAN talep (`employeeId=60`) → 201, `employeeId=60` döndü; anonim talep (`employeeId=60` GÖNDERİLEREK) → 201 ama yanıtta `employeeId=null`; `GET ?employeeId=60` → yalnızca anonim OLMAYAN kaydı döndürdü; olmayan kategori → 404 "Kategori bulunamadı."; anonim olmayan gönderimde `employeeId` eksikse → 400 "Çalışan boş olamaz."; `psql` ile `suggestions` tablosunda anonim kaydın `employee_id` sütununun GERÇEKTEN `NULL` olduğu doğrulandı; `audit_log`'da `Suggestion` (2), `SuggestionCategory` (1) için doğru `CREATE` sayıları görüldü. Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (6), auth (22), organization (59), leave (52), recruitment (39), performance (44), attendance (28), training (22), travel (18), discipline (24), survey (16), suggestion (12), bootstrap (1) = 343 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

## US-08F.1.2 — Talep durumunu güncelleme (EPIC-08F tamamlandı)

**Özet:** `PUT /api/suggestions/{id}/status` — bir talebin durumunu (PENDING/APPROVED/COMPLETED, roadmap'in Değerlendirmede/Onaylandı/Tamamlandı'sı) günceller. `GET /api/suggestions`'ın `employeeId` parametresi artık İSTEĞE BAĞLI — verilmezse İK'nın güncelleyecek talebi bulabilmesi için TÜM talepler (anonim dahil) döner. Bu story ile EPIC-08F (Talep ve Fikir) tamamlandı.

**Tasarım kararları:**
- **`status` sütunu, `travel.ExpenseItem`'daki (US-08B.1.2→US-08B.1.3) AYNI ALTER+DROP DEFAULT deseniyle SONRADAN eklendi (V51)** — US-08F.1.1'de henüz bir güncelleme ihtiyacı yoktu; var olan kayıtlar `PENDING` olarak geriye dönük dolduruldu.
- **`SuggestionStatus`, roadmap kabul kriterinin AÇIKÇA listelediği ÜÇ değerle sınırlı** (`PENDING`/`APPROVED`/`COMPLETED`) — FR-802'nin dört aşamalı akışı ("Değerlendirmede → Onaylandı/Reddedildi → Uygulamaya Alındı → Tamamlandı") BİLİNÇLİ OLARAK taşınmadı; bu projenin baştan beri sürdürdüğü "roadmap'in basitleştirilmiş kabul kriterini uygula" konvansiyonu.
- **Durum geçiş kısıtlaması eklenmedi** — `training.TrainingEnrollmentService.decide`/`travel.ExpenseItemService.decide`'ın (US-08A.1.2/US-08B.1.3) AKSİNE, kabul kriteri burada bir "yalnızca bekleyen bir kayıt karara bağlanabilir" kuralından bahsetmiyor; yalnızca "durumu güncellemek istiyorum" diyor. Herhangi bir durumdan herhangi bir duruma serbestçe geçilebilir — kör kopyalama yerine kabul kriterinin gerçekten söylediğine bakma kararı (`travel.ExpenseItem`'in onay ucundaki (US-08B.1.3) AYNI ayrım gerekçesi).
- **"Durum değişikliği çalışana görünür" için EK bir mekanizma eklenmedi** — `auth.UserRoleService`'teki (US-02.2.2) AYNI gerekçe: roller/durumlar herhangi bir token/önbelleğe gömülmüyor, her `GET` isteği veriyi DB'den taze okuyor; bu nedenle görünürlük otomatik sağlanıyor.
- **`GET /api/suggestions`'ın `employeeId` parametresi US-08F.1.1'de ZORUNLUYKEN bu story'de İSTEĞE BAĞLI yapıldı** — İK'nın durum güncelleyeceği talebi (özellikle anonim olanları, ki `employeeId` ile filtrelenemezler) bulabilmesi için TÜM taleplere erişebilmesi gerekiyor; bu, US-08F.1.1'in kısıtını GEVŞETEN, kabul kriterinin doğal bir sonucu.
- `suggestion` modülüne `SuggestionNotFoundException` eklendi (`SuggestionExceptionHandler`'a ikinci eşleme) — US-08F.1.1'de (yalnızca oluşturma/listeleme) gerek yoktu.
- Rol kısıtlaması eklenmedi — kabul kriteri bundan bahsetmiyor.

**Değişen/eklenen dosyalar:**
- `suggestion/src/main/resources/db/migration/V51__add_status_to_suggestions.sql`
- `suggestion/src/main/java/com/digitalik/suggestion/entity/SuggestionStatus.java` (yeni)
- `suggestion/src/main/java/com/digitalik/suggestion/entity/Suggestion.java` — `status` alanı, `updateStatus(...)` eklendi
- `suggestion/src/main/java/com/digitalik/suggestion/exception/SuggestionNotFoundException.java` (yeni); `SuggestionExceptionHandler.java` — eşleme eklendi
- `suggestion/src/main/java/com/digitalik/suggestion/repository/SuggestionRepository.java` — `findAllByOrderByIdDesc()` eklendi
- `suggestion/src/main/java/com/digitalik/suggestion/service/SuggestionService.java` — `listByEmployee` → `list` (İK için `employeeId` opsiyonel); `updateStatus(...)` eklendi
- `suggestion/src/main/java/com/digitalik/suggestion/dto/SuggestionResponse.java` — `status` eklendi; `UpdateSuggestionStatusRequest.java` (yeni)
- `suggestion/src/main/java/com/digitalik/suggestion/controller/SuggestionController.java` — `PUT /{id}/status` eklendi
- `suggestion/src/test/java/com/digitalik/suggestion/controller/SuggestionControllerTest.java` — `employeeIdOlmadanListelemeReddedilirVe400Doner` → `employeeIdOlmadanListelemeTumTalepleriDoner` (davranış değişikliği); `SuggestionStatusControllerTest.java` (yeni, 4 test)

**Canlı doğrulama:** `docker compose down -v` + `docker compose up --build -d` → log'da "Migrating schema "public" to version "51 - add status to suggestions"", "Successfully applied 51 migrations". Talep oluşturuldu (`status=PENDING`); `PUT .../status` (`APPROVED`) → 200, `status=APPROVED`; çalışanın kendi `GET ?employeeId=60` listesinde GÜNCEL durum (`APPROVED`) göründü; `COMPLETED`'a güncelleme → 200; geçersiz durum (`REJECTED`) → 400 "Durum yalnızca PENDING, APPROVED veya COMPLETED olabilir."; olmayan talep → 404 "Talep bulunamadı."; `employeeId` OLMADAN `GET /api/suggestions` → İK görünümü, tüm talebi (güncel durumuyla) döndürdü. `psql` ile `audit_log`'da 1 CREATE + 2 UPDATE (iki durum değişikliği) kaydı doğrulandı. Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (6), auth (22), organization (59), leave (52), recruitment (39), performance (44), attendance (28), training (22), travel (18), discipline (24), survey (16), suggestion (16), bootstrap (1) = 347 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

# Bölüm 8G — Sosyal Kulüp

## US-08G.1.1 — Kulüpleri görüntüleme ve üyelik talebi oluşturma (`club` modülü açıldı)

**Özet:** `POST/GET/PUT/DELETE /api/clubs` (kulüp CRUD) + `POST/GET /api/clubs/membership-requests` + `PUT /{id}/decision` (üyelik talebi oluşturma/listeleme/karara bağlama). EPIC-08G'nin (Sosyal Kulüp) ilk story'si — yeni bir Maven modülü (`club`) açıldı.

**Tasarım kararları:**
- Yeni `club` modülü, `suggestion`/`survey`'deki AYNI kuralla kuruldu: yalnızca `core`'a bağımlı, kök `pom.xml`/`bootstrap/pom.xml`'e birer satır, `Dockerfile`'a HEM bağımlılık HEM kaynak-kod COPY satırları PROAKTİF eklendi (Docker build ilk denemede başarılı oldu). İlk migration'ı V52 (suggestion'ın V51'inin üzerine); `clubs`+`club_membership_requests` tabloları `performance`/`survey`/`suggestion`'daki (V28/V48/V50) AYNI gerekçeyle (birlikte tanıtılan sıkı bağlı iki tablo) TEK migration'da oluşturuldu.
- **Bu story İKİ kavramı bir arada kapsıyor:** (1) `Club` — `organization.JobTitle`'daki AYNI minimal referans listesi (tam CRUD); roadmap'te ayrı bir "kulüp tanımlama" story'si OLMADIĞINDAN, kabul kriterinin gerektirdiği "kulüpleri görüntülemek" için önce bir yerde tanımlanmaları gerekiyordu. (2) `ClubMembershipRequest` — `leave.LeaveRequest`/`training.TrainingEnrollmentService`'teki (US-04.2.1/US-04.2.2, US-08A.1.2) AYNI "talep→onay" deseninin tekrar kullanımı: `PENDING` ile oluşturulur, `APPROVED`/`REJECTED` ile karara bağlanır, ret gerekçesi zorunlu. **Bu, `training.TrainingEnrollment`'ın (US-08A.1.2) AYNI önceliyle** — roadmap TEK bir US numarasında hem "talep oluşturma" hem "İK onayına gitme" istediğinden, decision uç noktası da AYNI story'de (ayrı bir US-08G.1.1.b beklemeden) uygulandı.
- **Onaylayan İK'dır, Kulüp Lideri DEĞİL** — roadmap kabul kriteri "Talep İK onayına gider" diyor; "Kulüp Lideri" rolü ancak SONRAKİ story'de (US-08G.1.2, yalnızca etkinlik oluşturma yetkisiyle) ortaya çıkıyor. Bu yüzden `leave`/`performance`'taki "yalnızca kendi ekibi" rol/erişim kısıtı BURADA UYGULANMADI — `travel.ExpenseItemService.decide`'daki (US-08B.1.3) AYNI "kabul kriteri istemiyorsa ekleme" kararı.
- FR-902'nin parametrik kulüp kategorileri (spor, fotoğrafçılık, ...) ve FR-901/903/904'ün etkinlik takvimi/rozet sistemi/otomatik kulüp kurma zenginliği BİLİNÇLİ OLARAK taşınmadı — hepsi "D" (deferred) öncelikli ve roadmap'in bu story için yazdığı kabul kriteri bunlardan hiçbirinden bahsetmiyor.
- `GET /api/clubs/membership-requests`, `employeeId` İSTEĞE BAĞLI olacak şekilde BAŞTAN tasarlandı (`suggestion.SuggestionService`'in US-08F.1.2'de SONRADAN gevşetilen kısıtının AKSİNE) — bu story zaten decision uç noktasını içerdiğinden, İK'nın karara bağlayacağı talebi bulabilmesi için TÜM taleplere erişim ihtiyacı baştan biliniyordu.
- Rol kısıtlaması eklenmedi — kabul kriteri bundan bahsetmiyor.

**Değişen/eklenen dosyalar:**
- `pom.xml` — `<module>club</module>`
- `bootstrap/pom.xml` — `club` bağımlılığı
- `Dockerfile` — `club` COPY satırları
- `club/pom.xml` (yeni modül)
- `club/src/main/resources/db/migration/V52__create_clubs_and_club_membership_requests.sql`
- `club/src/main/java/com/digitalik/club/entity/Club.java`, `ClubMembershipRequestStatus.java`, `ClubMembershipRequest.java`
- `club/src/main/java/com/digitalik/club/repository/ClubRepository.java`, `ClubMembershipRequestRepository.java`
- `club/src/main/java/com/digitalik/club/exception/ClubNotFoundException.java`, `ClubMembershipRequestNotFoundException.java`, `ClubExceptionHandler.java`
- `club/src/main/java/com/digitalik/club/service/ClubService.java`, `ClubMembershipRequestService.java`
- `club/src/main/java/com/digitalik/club/dto/ClubRequest.java`, `ClubResponse.java`, `CreateClubMembershipRequestRequest.java`, `ClubMembershipDecisionRequest.java`, `ClubMembershipRequestResponse.java`
- `club/src/main/java/com/digitalik/club/controller/ClubController.java`, `ClubMembershipRequestController.java`
- `club/src/test/java/com/digitalik/club/ClubTestApplication.java`
- `club/src/test/java/com/digitalik/club/controller/ClubControllerTest.java` (yeni, 5 test), `ClubMembershipRequestControllerTest.java` (yeni, 9 test)

**Canlı doğrulama:** `docker compose down -v` + `docker compose up --build -d` İLK DENEMEDE başarıyla tamamlandı; log'da "Migrating schema "public" to version "52 - create clubs and club membership requests"", "Successfully applied 52 migrations". Kulüp oluşturuldu (201) ve listelendi; üyelik talebi oluşturuldu (201, `PENDING`); İK onayı → 200, `APPROVED`; onaylanmış talebi tekrar karara bağlama → 400 "Bu talep zaten karara bağlanmış."; gerekçesiz RET → 400 "Ret gerekçesi zorunludur."; çalışanın kendi `GET ?employeeId=90` listesi → yalnızca kendi talebini (güncel durumuyla) gösterdi; `employeeId` OLMADAN `GET` → İK görünümü, TÜM talepleri (2 kayıt) döndürdü; olmayan kulüple talep → 404 "Kulüp bulunamadı."; token olmadan istek → 401. `psql` ile `audit_log`'da `Club` (1 CREATE), `ClubMembershipRequest` (2 CREATE + 1 UPDATE) doğru kayıtları görüldü. Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (6), auth (22), organization (59), leave (52), recruitment (39), performance (44), attendance (28), training (22), travel (18), discipline (24), survey (16), suggestion (16), club (14), bootstrap (1) = 361 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

## US-08G.1.2 — Kulüp Lideri olarak etkinlik oluşturma (EPIC-08G tamamlandı)

**Özet:** `POST/GET /api/clubs/events` — bir kulübe etkinlik ekleme/listeleme. Kabul kriteri: "Etkinlik yalnızca lider tarafından oluşturulabilir." Bu story ile EPIC-08G (Sosyal Kulüp) tamamlandı.

**Tasarım kararları:**
- **`Club.leaderId`, `travel.ExpenseItem.status`'daki (US-08B.1.2→US-08B.1.3) AYNI "SONRADAN ALTER ile ekle" deseniyle eklendi (V53)** — US-08G.1.1'de henüz bir "lider" kavramı yoktu; bu story'nin AÇIKÇA gerektirdiği an eklendi. NULLABLE — bir kulübün lideri henüz atanmamış olabilir; bu durumda kimse (İK dahil) etkinlik oluşturamaz (bkz. aşağıdaki kritik karar).
- **"Kulüp Lideri" bir Spring Security ROLÜ DEĞİL, kulübe özel bir ATAMA** — `auth.Role`'de seed edilen dört rolden (ADMIN/IK/YONETICI/CALISAN) biri değil; bir kişi bir kulüp için lider, başka bir kulüp için sıradan üye olabilir. Bu nedenle yetki kontrolü `@PreAuthorize`/`hasRole(...)` yerine `ClubEventService.create` içinde DOĞRUDAN veri karşılaştırmasıyla yapılıyor: isteği yapan `employeeId`, ilgili `Club.leaderId` ile eşleşmiyorsa (lider hiç atanmamışsa DAHİL — o zaman hiç kimse eşleşmez) `NotClubLeaderException` (403) fırlatılır. `leave`/`training`'deki `@PreAuthorize` + `AccessGuard` deseni (rol bazlı + kayıt bazlı KOMBİNASYONU) burada uygulanamadı çünkü ortada bir ROL yok, yalnızca ham bir çalışan-kulüp eşleşmesi var.
- `Club`'a `leaderId` eklenmesiyle birlikte `ClubService.create`/`update` ve `ClubController`'daki `ClubRequest`/`ClubResponse` de güncellendi — kulüp oluşturulurken/güncellenirken lider atanabiliyor/değiştirilebiliyor (roadmap'te ayrı bir "lider atama" story'si YOK; bu, US-08G.1.1'in Club CRUD'unun doğal bir uzantısı).
- FR-905'in "içerik paylaşma / katılım listesi takibi" zenginliği BİLİNÇLİ OLARAK taşınmadı — roadmap bu story için yalnızca "etkinlik oluşturmak" istiyor.
- `club` modülünün İKİNCİ `NotFoundException`'ı değil, YENİ bir hata sınıfı türü (`NotClubLeaderException`, 403 Forbidden) eklendi — ilk kez bir "bulunamadı" değil bir "yetkisiz" senaryosu ortaya çıktı.

**Değişen/eklenen dosyalar:**
- `club/src/main/resources/db/migration/V53__add_leader_id_to_clubs_and_create_club_events.sql`
- `club/src/main/java/com/digitalik/club/entity/Club.java` — `leaderId` alanı, `assignLeader(...)` eklendi; `ClubEvent.java` (yeni)
- `club/src/main/java/com/digitalik/club/exception/NotClubLeaderException.java` (yeni); `ClubExceptionHandler.java` — eşleme eklendi
- `club/src/main/java/com/digitalik/club/repository/ClubEventRepository.java` (yeni)
- `club/src/main/java/com/digitalik/club/service/ClubService.java` — `create`/`update` artık `leaderId` alıyor; `ClubEventService.java` (yeni)
- `club/src/main/java/com/digitalik/club/dto/ClubRequest.java`, `ClubResponse.java` — `leaderId` eklendi; `CreateClubEventRequest.java`, `ClubEventResponse.java` (yeni)
- `club/src/main/java/com/digitalik/club/controller/ClubController.java` — `leaderId` işleniyor; `ClubEventController.java` (yeni)
- `club/src/test/java/com/digitalik/club/controller/ClubControllerTest.java` — `ClubRequest` çağrıları güncellendi; `ClubMembershipRequestControllerTest.java` — helper güncellendi; `ClubEventControllerTest.java` (yeni, 6 test)

**Canlı doğrulama:** `docker compose down -v` + `docker compose up --build -d` → log'da "Migrating schema "public" to version "53 - add leader id to clubs and create club events"", "Successfully applied 53 migrations". Lideri (`100`) atanmış bir kulüp oluşturuldu; lider olarak etkinlik oluşturma → 201; lider OLMAYAN bir çalışan (`101`) olarak deneme → 403 "Yalnızca kulüp lideri etkinlik oluşturabilir."; lideri HİÇ atanmamış bir kulüpte HERHANGİ bir çalışan (`102`) olarak deneme → yine 403 (hiç kimse eşleşmiyor); `GET ?clubId=...` → oluşturulan etkinliği doğru döndürdü; olmayan kulüp → 404 "Kulüp bulunamadı."; `psql` ile `audit_log`'da `Club` (2 CREATE), `ClubEvent` (1 CREATE, yalnızca başarılı deneme için) doğru kayıtları görüldü. Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (6), auth (22), organization (59), leave (52), recruitment (39), performance (44), attendance (28), training (22), travel (18), discipline (24), survey (16), suggestion (16), club (20), bootstrap (1) = 367 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

# Bölüm 8H — Randevu

## US-08H.1.1 — Hizmet ve slot tanımlama; slot çakışması engelleme (`appointment` modülü açıldı)

**Özet:** `POST/GET/PUT/DELETE /api/appointments/services` (hizmet CRUD) + `POST/GET /api/appointments/slots` (slot oluşturma/listeleme). EPIC-08H'nin (Randevu) ilk story'si — yeni bir Maven modülü (`appointment`) açıldı.

**Tasarım kararları:**
- Yeni `appointment` modülü, `club`/`suggestion`'daki AYNI kuralla kuruldu: yalnızca `core`'a bağımlı, kök `pom.xml`/`bootstrap/pom.xml`'e birer satır, `Dockerfile`'a HEM bağımlılık HEM kaynak-kod COPY satırları PROAKTİF eklendi (Docker build ilk denemede başarılı oldu). İlk migration'ı V54 (club'ın V53'ünün üzerine); `service_offerings`+`appointment_slots` tabloları `performance`/`survey`/`suggestion`/`club`'daki (V28/V48/V50/V52) AYNI gerekçeyle (birlikte tanıtılan sıkı bağlı iki tablo) TEK migration'da oluşturuldu.
- **Entity adı bilinçli olarak `Service` DEĞİL, `ServiceOffering`** — Spring'in `@Service` anotasyonuyla aynı isim çakışması/karışıklığı yaratırdı (bu modülün kendi servis sınıfları da `@Service` kullanıyor); `organization.JobTitle`'daki AYNI minimal referans listesi deseni (yalnızca `name`, tam CRUD). FR-1201'in zengin alanları (kategori, hizmet veren kişi, süre, günlük maks randevu sayısı, lokasyon, açıklama, iptal süresi) BİLİNÇLİ OLARAK taşınmadı — kabul kriteri yalnızca "hizmet ... tanımlamak" diyor.
- **`AppointmentSlot.startTime`/`endTime`, `attendance.AttendanceRecord`'daki (US-07.2.1) AYNI `OffsetDateTime` deseni** — saat bazlı çakışma karşılaştırması için zaman dilimi farkında kesin an gerekli.
- **Çakışma kontrolü DB seviyesinde bir CHECK/EXCLUDE kısıtı İLE değil, servis seviyesinde uygulanıyor** (`AppointmentSlotRepository.findOverlapping`, klasik `mevcut.start < yeni.end AND mevcut.end > yeni.start` koşulu) — PostgreSQL'in `EXCLUDE` kısıtı bu proje genelinde hiç kullanılmayan yeni bir kavram getirirdi; `performance.Goal`'daki ("ağırlık toplamı" kuralı da DB seviyesinde değil) AYNI YAGNI gerekçesi. Aralık YARI AÇIK `[start, end)` kabul edildi — tam olarak bir slotun bitişinde başlayan bir sonraki slot ÇAKIŞMA SAYILMIYOR (canlı doğrulamada ayrıca test edildi).
- **Çakışma yalnızca AYNI hizmet içinde kontrol ediliyor** — farklı hizmetlerin aynı saatteki slotları birbiriyle asla çakışmaz (iki farklı hekim aynı saatte farklı hastalara bakabilir); kabul kriterinin "Slot çakışması engellenir" ifadesi doğal olarak "aynı hizmetin kendi slotları arasında" anlamına geliyor.
- `appointment` modülünün İLK `NotFoundException`'ı yalnızca `ServiceOfferingNotFoundException` — `AppointmentSlotNotFoundException` bu story'de EKLENMEDİ, henüz bir slotu id ile bulan bir uç yok (US-08H.1.2'de, randevu alma slotu referans aldığında eklenecek).
- Rol kısıtlaması eklenmedi — kabul kriteri bundan bahsetmiyor.

**Değişen/eklenen dosyalar:**
- `pom.xml` — `<module>appointment</module>`
- `bootstrap/pom.xml` — `appointment` bağımlılığı
- `Dockerfile` — `appointment` COPY satırları
- `appointment/pom.xml` (yeni modül)
- `appointment/src/main/resources/db/migration/V54__create_service_offerings_and_appointment_slots.sql`
- `appointment/src/main/java/com/digitalik/appointment/entity/ServiceOffering.java`, `AppointmentSlot.java`
- `appointment/src/main/java/com/digitalik/appointment/repository/ServiceOfferingRepository.java`, `AppointmentSlotRepository.java`
- `appointment/src/main/java/com/digitalik/appointment/exception/ServiceOfferingNotFoundException.java`, `AppointmentExceptionHandler.java`
- `appointment/src/main/java/com/digitalik/appointment/service/ServiceOfferingService.java`, `AppointmentSlotService.java`
- `appointment/src/main/java/com/digitalik/appointment/dto/ServiceOfferingRequest.java`, `ServiceOfferingResponse.java`, `CreateAppointmentSlotRequest.java`, `AppointmentSlotResponse.java`
- `appointment/src/main/java/com/digitalik/appointment/controller/ServiceOfferingController.java`, `AppointmentSlotController.java`
- `appointment/src/test/java/com/digitalik/appointment/AppointmentTestApplication.java`
- `appointment/src/test/java/com/digitalik/appointment/controller/ServiceOfferingControllerTest.java` (yeni, 5 test), `AppointmentSlotControllerTest.java` (yeni, 6 test)

**Canlı doğrulama:** `docker compose down -v` + `docker compose up --build -d` İLK DENEMEDE başarıyla tamamlandı; log'da "Migrating schema "public" to version "54 - create service offerings and appointment slots"", "Successfully applied 54 migrations". Hizmet oluşturuldu; 09:00-09:30 slotu oluşturuldu (201); kesişen 09:15-09:45 slotu → 400 "Bu zaman aralığında çakışan bir slot zaten var."; tam olarak bitişte başlayan 09:30-10:00 slotu → 201 (kabul edildi, kesişme yok); `GET` her iki slotu da doğru döndürdü; olmayan hizmetle slot → 404 "Hizmet bulunamadı." `psql` ile `audit_log`'da `ServiceOffering` (1 CREATE), `AppointmentSlot` (2 CREATE) doğru kayıtları görüldü. Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (6), auth (22), organization (59), leave (52), recruitment (39), performance (44), attendance (28), training (22), travel (18), discipline (24), survey (16), suggestion (16), club (20), appointment (11), bootstrap (1) = 378 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

## US-08H.1.2 — Uygun slota randevu alma

**Özet:** `POST/GET /api/appointments` — çalışan bir slota randevu alır/kendi randevularını görüntüler. Kabul kriteri: "Aynı saatte ikinci randevu engellenir."

**Tasarım kararları:**
- **`AppointmentService.book` İKİ bağımsız kontrol uyguluyor:** (1) slot zaten rezerve edilmişse reddedilir (varsayılan kapasite=1 — FR-1202'nin "grup seansı" zenginliği taşınmadı); (2) çalışanın VAR OLAN randevularından biri bu slotun zaman aralığıyla kesişiyorsa reddedilir — bu, kabul kriterinin KENDİSİ ("Aynı saatte ikinci randevu engellenir"), FARKLI hizmetlerin slotları arasında bile geçerli (bir çalışan aynı anda hem diyetisyene hem psikoloğa randevu alamaz). Canlı doğrulamada İKİSİ de ayrı ayrı test edildi.
- **Çakışma kontrolü, `AppointmentSlot`'taki (US-08H.1.1) JPQL/cross-entity JOIN YERİNE basit bir Java döngüsüyle uygulandı** — çalışanın randevularının slot'ları tek tek `findById` ile çekilip karşılaştırılıyor. Bu proje boyunca hiçbir yerde gerçek bir JPA `@ManyToOne` ilişkisi veya iki farklı entity arasında theta-join JPQL sorgusu kullanılmadı (tüm çapraz referanslar düz `Long` id + servis seviyesinde ayrı sorgular); tutarlılık için AYNI desen korundu (`training.TrainingEnrollmentService.listCompleted`'daki `findById` döngüsüyle AYNI stil).
- `appointment` modülüne `AppointmentSlotNotFoundException` eklendi (`AppointmentExceptionHandler`'a ikinci eşleme) — US-08H.1.1'de (slot id ile aranan bir uç yoktu) gerek yoktu.
- FR-1203'ün "tanımlı süre içinde iptal" zenginliği BİLİNÇLİ OLARAK taşınmadı — kabul kriteri yalnızca "randevu almak" ve "ikinci randevu engellenmesi" istiyor.
- Rol kısıtlaması eklenmedi — kabul kriteri bundan bahsetmiyor.

**Değişen/eklenen dosyalar:**
- `appointment/src/main/resources/db/migration/V55__create_appointments.sql`
- `appointment/src/main/java/com/digitalik/appointment/entity/Appointment.java` (yeni)
- `appointment/src/main/java/com/digitalik/appointment/exception/AppointmentSlotNotFoundException.java` (yeni); `AppointmentExceptionHandler.java` — eşleme eklendi
- `appointment/src/main/java/com/digitalik/appointment/repository/AppointmentRepository.java` (yeni)
- `appointment/src/main/java/com/digitalik/appointment/service/AppointmentService.java` (yeni)
- `appointment/src/main/java/com/digitalik/appointment/dto/BookAppointmentRequest.java`, `AppointmentResponse.java` (yeni)
- `appointment/src/main/java/com/digitalik/appointment/controller/AppointmentController.java` (yeni)
- `appointment/src/test/java/com/digitalik/appointment/controller/AppointmentControllerTest.java` (yeni, 7 test)

**Canlı doğrulama:** `docker compose down -v` + `docker compose up --build -d` → log'da "Migrating schema "public" to version "55 - create appointments"", "Successfully applied 55 migrations". Çalışan 70, İşyeri Hekimi'nin 09:00-09:30 slotuna randevu aldı (201); başka bir çalışan (71) AYNI slota randevu almaya çalıştı → 400 "Bu slot zaten dolu."; çalışan 70, FARKLI bir hizmetin (Diyetisyen) KESİŞEN (09:15-09:45) bir slotuna randevu almaya çalıştı → 400 "Aynı saat diliminde başka bir randevunuz var."; `GET ?employeeId=70` → yalnızca kendi randevusunu döndürdü; olmayan slot → 404 "Slot bulunamadı." `psql` ile `audit_log`'da `Appointment` için 1 CREATE (yalnızca başarılı rezervasyon) kaydı doğrulandı. Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (6), auth (22), organization (59), leave (52), recruitment (39), performance (44), attendance (28), training (22), travel (18), discipline (24), survey (16), suggestion (16), club (20), appointment (18), bootstrap (1) = 385 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

## US-08H.1.3 — Randevu notları yalnızca yetkili kişiler görebilir (SEC-020, EPIC-08H tamamlandı)

**Özet:** `PUT /api/appointments/{id}/note` (not ekleme/güncelleme, kısıtsız) + `GET /api/appointments/{id}/note` (yalnızca ADMIN/IK, `@PreAuthorize`) — randevu notu, sağlık verisi içerebileceğinden ayrı, korumalı bir alt kaynak. Bu story ile EPIC-08H (Randevu) tamamlandı.

**Tasarım kararları:**
- **`organization.EmployeeSalaryRecordController`'daki (US-03.3.3/US-03.3.4) AYNI desen birebir tekrarlandı:** Hassas alan (`note`), normal `AppointmentResponse`'a HİÇ karışmıyor — ayrı bir `AppointmentNoteController` alt kaynağı (`/api/appointments/{id}/note`). Kabul kriterinin sunduğu iki seçenekten ("göremez/maskeli görür") BİRİNCİSİ seçildi: TAM engelleme (`@PreAuthorize("hasAnyRole('ADMIN', 'IK')")`), kısmi alan maskeleme değil — bu proje genelinde hassas-alan kısıtlaması için zaten kanıtlanmış, tek kullanılan desen.
- **Kaydın SAHİBİ (randevuyu alan çalışan) için bir istisna YOK** — `EmployeeSalaryRecordController`'daki (US-03.3.4) AYNI karar: kabul kriteri "yalnızca yetkili kişiler" diyor, self-view değil; bu nedenle bir "AccessGuard" bean'i KULLANILMADI, salt `hasAnyRole('ADMIN','IK')` yeterli. "Hizmet Sağlayıcı" (FR-1205'te not ekleyebilen rol) `auth.Role`'de seed edilen dört rolden biri DEĞİL (`club.Club.leaderId`'deki (US-08G.1.2) AYNI gözlem) — bu yüzden görüntüleme yetkisi de bu role değil, yalnızca ADMIN/IK'ya tanındı.
- **`PUT` (not ekleme/güncelleme) BİLİNÇLİ OLARAK kısıtlanmadı** — `EmployeeSalaryRecordController`'daki (US-03.3.4) AYNI gerekçe: kabul kriteri yalnızca GÖRÜNTÜLEMEDEN bahsediyor; bu modüldeki diğer yazma uçlarıyla aynı emsal korundu.
- **`appointment` modülünün İLK `@PreAuthorize` kullanımı** — `spring-security-core` (yalnızca core, `auth`'un tam `spring-boot-starter-security` DEĞİL) eklendi; `@EnableMethodSecurity` zaten `auth` modülünün `SecurityConfig`'inde etkin (tüm uygulama TEK bir Spring context). `AuthorizationDeniedException` → 403 eşlemesi eklenmezse platform geneli `GlobalExceptionHandler`'ın `Exception.class` yakalayıcısına düşüp 500 döneceği için `AppointmentExceptionHandler`'a eklendi (US-02.1.3/US-03.2.6'daki AYNI ders).
- **Yeni bir `AppointmentNotFoundException` eklendi** — bu, ilk kez bir randevuyu KENDİ id'siyle bulan bir uç (`note` alt kaynağı).
- **Test kapsamı notu:** `@PreAuthorize`'ın gerçek 403 uygulaması, `organization`'daki US-03.2.6/US-03.3.4'te olduğu gibi modülün izole test ortamında (`AppointmentTestApplication`, `@EnableMethodSecurity` etkin değil) doğrulanamıyor; yalnızca not ekleme + bulunamadı senaryoları birim testleriyle, rol kısıtlaması ise CANLI Docker doğrulamasıyla kontrol edildi.

**Değişen/eklenen dosyalar:**
- `appointment/pom.xml` — `spring-security-core` eklendi
- `appointment/src/main/resources/db/migration/V56__add_note_to_appointments.sql`
- `appointment/src/main/java/com/digitalik/appointment/entity/Appointment.java` — `note` alanı, `setNote(...)` eklendi
- `appointment/src/main/java/com/digitalik/appointment/exception/AppointmentNotFoundException.java` (yeni); `AppointmentExceptionHandler.java` — `AppointmentNotFoundException`/`AuthorizationDeniedException` eşlemeleri eklendi
- `appointment/src/main/java/com/digitalik/appointment/service/AppointmentService.java` — `updateNote(...)`, `getById(...)` eklendi
- `appointment/src/main/java/com/digitalik/appointment/dto/UpdateAppointmentNoteRequest.java`, `AppointmentNoteResponse.java` (yeni)
- `appointment/src/main/java/com/digitalik/appointment/controller/AppointmentNoteController.java` (yeni)
- `appointment/src/test/java/com/digitalik/appointment/controller/AppointmentNoteControllerTest.java` (yeni, 2 test)

**Canlı doğrulama:** `docker compose down -v` + `docker compose up --build -d` → log'da "Migrating schema "public" to version "56 - add note to appointments"", "Successfully applied 56 migrations". Randevuya not eklendi (kısıtsız `PUT`, 200); ADMIN token ile not görüntülendi → 200. `psql` ile doğrudan eklenen, admin'in bcrypt hash'i kopyalanan ve yalnızca CALISAN rolü atanan bir test kullanıcısı (`organization.US-03.2.6`'daki AYNI desen) → `GET .../note` → 403 "Erişim reddedildi"; aynı kullanıcıya ayrıca IK rolü atanıp tekrar giriş yapıldığında → 200 (notu doğru gösterdi). Olmayan randevunun notu → 404 "Randevu bulunamadı."; token olmadan istek → 401. Normal `GET /api/appointments` yanıtının `note` alanını HİÇ İÇERMEDİĞİ ayrıca doğrulandı. `psql` ile `audit_log`'da `Appointment` için 1 CREATE + 1 UPDATE (not ekleme) kaydı görüldü. Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (6), auth (22), organization (59), leave (52), recruitment (39), performance (44), attendance (28), training (22), travel (18), discipline (24), survey (16), suggestion (16), club (20), appointment (20), bootstrap (1) = 387 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

# Bölüm 8I — Doküman Yönetimi, Görev Tanımları ve Organizasyon Şeması

## US-08I.1.1 — Politika dokümanı yükleme ve versiyonlama (`document` modülü açıldı)

**Özet:** `POST /api/documents` (multipart dosya yükleme/versiyonlama) + `GET /api/documents` (listeleme). EPIC-08I'nin (Doküman Yönetimi/Görev Tanımları/Organizasyon Şeması) ilk story'si — yeni bir Maven modülü (`document`) açıldı.

**Tasarım kararları:**
- Yeni `document` modülü, `appointment`/`club`'daki AYNI kuralla kuruldu: yalnızca `core`'a bağımlı, kök `pom.xml`/`bootstrap/pom.xml`'e birer satır, `Dockerfile`'a HEM bağımlılık HEM kaynak-kod COPY satırları eklendi. İlk migration'ı V57 (appointment'ın V56'sının üzerine).
- **`documentData`, `recruitment.Candidate.cvData`'daki (V23) canlıda yaşanan hatadan PROAKTİF ders alınarak baştan `@Lob` DEĞİL `@JdbcTypeCode(SqlTypes.VARBINARY)` ile yazıldı** — Hibernate'in bunu PostgreSQL'in `oid` mekanizmasına eşlemesini önlemek için; Docker'da gerçek PostgreSQL'e karşı ilk denemede şema doğrulama hatası OLMADI (canlı doğrulamada dosya boyutları `psql` ile ayrıca teyit edildi).
- **Versiyonlama, `previousVersionId` self-referencing alanıyla uygulandı** — `discipline.DisciplinaryCase.caseId`'deki (US-08C.1.3) BENZER fikir (NULL = ilk versiyon, dolu = bir önceki versiyonun id'si), ama DisciplinaryCase'in AKSİNE eski satır GERÇEKTEN `UPDATE` ediliyor (`status: ACTIVE→ARCHIVED`) — kabul kriterinin "arşivler" ifadesi, SEC-021 tipi bir değiştirilemezlik şartı DEĞİL, sıradan bir durum geçişi.
- **Yeni versiyon, önceki versiyonun BAŞLIĞINI miras alır** — istemcinin yeni versiyon yüklerken gönderdiği (varsa) başlık YOK SAYILIR; bu, bir dokümanın versiyonları arasında başlık kaymasını (tutarsızlığını) önler. Yalnızca İLK versiyon (v1) için başlık istemciden ZORUNLU alınır.
- **Yalnızca `ACTIVE` bir versiyon üzerinden yeni versiyon yüklenebilir** — zaten arşivlenmiş bir versiyondan "dallanmayı" (branching) önlemek için; canlı doğrulamada bu senaryo (v1 arşivlendikten sonra ÜZERİNDEN tekrar v3 yüklemeye çalışma) ayrıca test edildi → 400.
- Multipart yükleme, `recruitment.CandidateController`'daki (US-05.2.1) AYNI desen: dosya ayrı bir `multipart/form-data` parçası (`file`), tüm parametreler `required = false` + servis seviyesinde elle doğrulama (US-04.1.2'deki ders).
- FR-1001'in "çok seviyeli onay akışı" ve FR-1002/1003'ün erişim/denetim zenginliği BİLİNÇLİ OLARAK taşınmadı — kabul kriteri yalnızca "yükleyip versiyonlamak" istiyor.
- Rol kısıtlaması eklenmedi — kabul kriteri bundan bahsetmiyor.

**Değişen/eklenen dosyalar:**
- `pom.xml` — `<module>document</module>`
- `bootstrap/pom.xml` — `document` bağımlılığı
- `Dockerfile` — `document` COPY satırları
- `document/pom.xml` (yeni modül)
- `document/src/main/resources/db/migration/V57__create_policy_documents.sql`
- `document/src/main/java/com/digitalik/document/entity/PolicyDocumentStatus.java`, `PolicyDocument.java`
- `document/src/main/java/com/digitalik/document/repository/PolicyDocumentRepository.java`
- `document/src/main/java/com/digitalik/document/exception/PolicyDocumentNotFoundException.java`, `DocumentExceptionHandler.java`
- `document/src/main/java/com/digitalik/document/service/PolicyDocumentService.java`
- `document/src/main/java/com/digitalik/document/dto/PolicyDocumentResponse.java`
- `document/src/main/java/com/digitalik/document/controller/PolicyDocumentController.java`
- `document/src/test/java/com/digitalik/document/DocumentTestApplication.java`
- `document/src/test/java/com/digitalik/document/controller/PolicyDocumentControllerTest.java` (yeni, 6 test)

**Canlı doğrulama:** `docker compose down -v` + `docker compose up --build -d` İLK DENEMEDE başarıyla tamamlandı (VARBINARY düzeltmesi proaktif olarak doğru çalıştı); log'da "Migrating schema "public" to version "57 - create policy documents"", "Successfully applied 57 migrations". Gerçek bir dosya (`policy-v1.txt`, 11 bayt) "İzin Politikası" başlığıyla v1 olarak yüklendi (201); AYNI başlığı miras alan v2 (`policy-v2.txt`, 26 bayt, `previousVersionId=1`) yüklendi (201) → v1 OTOMATİK olarak `ARCHIVED`'a döndü; `GET` listesi her iki versiyonu da doğru durumlarıyla döndürdü; arşivlenmiş v1 üzerinden v3 yüklemeye çalışma → 400 "Yalnızca güncel (aktif) bir versiyon üzerinden yeni versiyon yüklenebilir."; `psql` ile `document_data` sütununun GERÇEKTEN doğru bayt uzunluklarında (11/26) saklandığı doğrulandı; `audit_log`'da 2 CREATE + 1 UPDATE (arşivleme) kaydı görüldü. Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (6), auth (22), organization (59), leave (52), recruitment (39), performance (44), attendance (28), training (22), travel (18), discipline (24), survey (16), suggestion (16), club (20), appointment (20), document (6), bootstrap (1) = 393 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

## US-08I.1.2 — Unvan bazlı görev tanımı

**Özet:** `POST/GET /api/documents/job-descriptions` — bir unvana bağlı görev tanımı yazma/listeleme. Kabul kriteri: "Görev tanımı unvana bağlanır."

**Tasarım kararları:**
- **`JobDescription.jobTitleId`, `organization.JobTitle`'a diğer tüm modüllerdeki AYNI modüller-arası güven sınırı gerekçesiyle FK'siz düz bir `Long`** — `document` modülü `organization`'a bağımlı değil (yalnızca core'a bağımlı mimari kuralı); referans bütünlüğü (unvan gerçekten var mı) doğrulanmıyor, tıpkı diğer modüllerdeki `employeeId` referansları gibi.
- **FR-1004'ün "görev-yetki-sorumluluk ayrıştırma, raporlama ilişkisi, yetkinlik/pozisyon gerekliliği" zenginliği ve FR-1005'in versiyonlama/bildirim zenginliği BİLİNÇLİ OLARAK taşınmadı** — kabul kriteri yalnızca "unvana bağlanan" bir görev tanımı istiyor; `content` tek bir serbest metin alanı (`training.Training`'in "tür" alanı gibi zengin bir yapı YOK, çünkü kabul kriteri bunu istemiyor).
- **`GET`'in `jobTitleId` parametresi ZORUNLU** (`Warning`'deki AYNI desen) — `suggestion`'daki (US-08F.1.2) SONRADAN gevşetilen kısıttan FARKLI olarak, burada henüz bir "İK'nın tüm görev tanımlarını görmesi" ihtiyacı YOK (roadmap'te ayrı bir story da yok); bu ihtiyaç netleşirse SONRADAN gevşetilir.
- Rol kısıtlaması eklenmedi — kabul kriteri bundan bahsetmiyor.

**Değişen/eklenen dosyalar:**
- `document/src/main/resources/db/migration/V58__create_job_descriptions.sql`
- `document/src/main/java/com/digitalik/document/entity/JobDescription.java`
- `document/src/main/java/com/digitalik/document/repository/JobDescriptionRepository.java`
- `document/src/main/java/com/digitalik/document/service/JobDescriptionService.java`
- `document/src/main/java/com/digitalik/document/dto/CreateJobDescriptionRequest.java`, `JobDescriptionResponse.java`
- `document/src/main/java/com/digitalik/document/controller/JobDescriptionController.java`
- `document/src/test/java/com/digitalik/document/controller/JobDescriptionControllerTest.java` (yeni, 6 test)

**Canlı doğrulama:** `docker compose down -v` + `docker compose up --build -d` → log'da "Migrating schema "public" to version "58 - create job descriptions"", "Successfully applied 58 migrations". Görev tanımı oluşturuldu (201, unvana bağlı); `GET ?jobTitleId=1` → kaydı geri okudu; boş içerik → 400 "Görev tanımı boş olamaz."; `jobTitleId` olmadan liste → 400 "Unvan boş olamaz."; token olmadan istek → 401. `psql` ile `audit_log`'da `JobDescription` için 1 CREATE kaydı doğrulandı. Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (6), auth (22), organization (59), leave (52), recruitment (39), performance (44), attendance (28), training (22), travel (18), discipline (24), survey (16), suggestion (16), club (20), appointment (20), document (12), bootstrap (1) = 399 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

## US-08I.1.3 — Organizasyon şemasını görsel olarak görüntüleme (EPIC-08I ve Bölüm 8 tamamlandı)

**Özet:** `GET /api/organization/chart` — organizasyon birimlerini, çalışanları ve unvanlarını hiyerarşik bir JSON ağacı olarak döner. Kabul kriteri: "Şema, Bölüm 3'teki organizasyon/atama verisinden türetilir." Bu story ile EPIC-08I (ve roadmap'in Bölüm 8'i — "Diğer Modüller") tamamlandı.

**Tasarım kararları:**
- **Yeni bir modül/migration AÇILMADI — bu özellik `organization` modülünün İÇİNDE, salt okunur bir kompozisyon olarak eklendi.** Diğer tüm EPIC-08 story'lerinin AKSİNE (her biri yeni bir Maven modülü açtı), bu story kabul kriterinin kendisinin AÇIKÇA söylediği gibi ("Bölüm 3'teki ... veriden türetilir") kendi verisini ÜRETMİYOR, yalnızca `organization`'ın zaten var olan `OrganizationUnit`/`Employee`/`JobTitle` verisini bir ağaca dönüştürüyor — ayrı bir modül açmak, var olmayan bir veri sahipliğini simüle eden gereksiz bir soyutlama olurdu.
- **`OrganizationChartService`, ağacı İSTEK ANINDA bellek içinde kurar** — `findAll()` ile tüm birimler/çalışanlar/unvanlar çekilip `parentId`/`organizationUnitId`/`jobTitleId` üzerinden Java `Map`/`groupingBy` ile gruplanıyor; DB seviyesinde özyinelemeli bir CTE (`WITH RECURSIVE`) KULLANILMADI — bu projenin ölçeğinde (birkaç yüz birim/çalışan) gereksiz bir karmaşıklık olurdu, ayrıca bu proje boyunca hiçbir yerde ham SQL/CTE kullanılmadı (tutarlılık).
- **Atanmamış (`organizationUnitId`/`jobTitleId` NULL) çalışanlar şemada HİÇ GÖRÜNMEZ** — kabul kriteri "boş pozisyon görüntüleme" (FR-1008) gibi bir boşluk senaryosundan bahsetmiyor; canlı doğrulamada bu davranış AYRICA test edildi (atanmamış bir çalışan oluşturuldu, şemada hiçbir yerde çıkmadığı doğrulandı).
- FR-1009'un "dinamik/interaktif şema, çalışan üzerine tıklayınca detay" zenginliği KAPSAM DIŞI — bu, bir SUNUM/frontend kaygısı; API'nin görevi doğru, iç içe geçmiş veriyi döndürmek. "Görsel" kelimesi burada JSON ağaç yapısı anlamına geliyor (roadmap'in henüz bir frontend'i yok).
- Rol kısıtlaması eklenmedi — kabul kriteri bundan bahsetmiyor.

**Değişen/eklenen dosyalar:**
- `organization/src/main/java/com/digitalik/organization/dto/OrganizationChartEmployeeResponse.java`, `OrganizationChartNodeResponse.java` (yeni)
- `organization/src/main/java/com/digitalik/organization/service/OrganizationChartService.java` (yeni)
- `organization/src/main/java/com/digitalik/organization/controller/OrganizationChartController.java` (yeni)
- `organization/src/test/java/com/digitalik/organization/controller/OrganizationChartControllerTest.java` (yeni, 2 test)

**Canlı doğrulama:** `docker compose down -v` + `docker compose up --build -d` (yeni migration YOK, V58'de kaldı) → "BKM" şirketi + "Yazılım Geliştirme" bölümü (BKM'nin altında) + "Yazılım Mühendisi" unvanı oluşturuldu; Ada Lovelace bu bölüme/unvana atandı; ikinci, ATANMAMIŞ bir çalışan da oluşturuldu. `GET /api/organization/chart` → doğru iç içe ağaç: BKM (kök) → çocuğu Yazılım Geliştirme → içinde Ada (unvanıyla birlikte); atanmamış çalışan HİÇBİR YERDE görünmedi; token olmadan istek → 401. Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (6), auth (22), organization (61), leave (52), recruitment (39), performance (44), attendance (28), training (22), travel (18), discipline (24), survey (16), suggestion (16), club (20), appointment (20), document (12), bootstrap (1) = 401 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

# Yapısal karar — Bölüm 9.2 (Merkezi Onay Motoru) kısmi sadeleştirmesi

**Bu bir US değil, kullanıcıyla birlikte değerlendirilen bir mimari karardır.** Bölüm 8'in (Diğer Modüller) tamamlanmasının ardından, roadmap'in Bölüm 9.2'sindeki ("Merkezi Onay Motoru") genelleştirme tetikleyicisi ("Bölüm 4, Bölüm 5 ve en az bir Bölüm 8 modülü, onay kodlarını gerçekten tekrar ettiğinde") birlikte denetlendi.

**Denetim bulgusu:** `leave.LeaveRequest` (Bölüm 4), `training.TrainingEnrollment` (Bölüm 8A), `travel.ExpenseItem` (Bölüm 8B), `club.ClubMembershipRequest` (Bölüm 8G) — dördü de BİREBİR AYNI şekle sahipti: `PENDING` varsayılan durum, `decide(id, decision, rejectionReason)` metodu (a) kararın yalnızca APPROVED/REJECTED olabileceğini, (b) yalnızca PENDING bir kaydın karara bağlanabileceğini, (c) RET için gerekçenin zorunlu olduğunu doğruluyor. `recruitment.HiringRequest` (Bölüm 5) ise KASITLI OLARAK farklı (iki aşamalı `managerDecide`/`hrDecide`, gerekçe zorunluluğu yok) — roadmap'in kendi notu ve önceki günlük girişleri bunu açıkça "aynı kod değil" olarak işaretlemişti. Yani tetikleyicinin harfi harfine istediği "Bölüm 4 + Bölüm 5 + Bölüm 8, AYNI kodu tekrarlıyor" şartı TAM sağlanmıyor (Bölüm 5 bu dört kopyanın soy zincirinde yok); ama Bölüm 4 + Bölüm 8 arasında GERÇEK, dört kopyalık bir tekrar var.

**Karar:** Roadmap'in Bölüm 9.2'de tarif ettiği TAM kapsamlı motoru (yapılandırılabilir çok seviyeli zincirler, kod yazmadan tanımlama — US-09.2.2) KURMA — bu, mevcut tekrarın haklı çıkaracağından daha büyük bir soyutlama olurdu ve `recruitment.HiringRequest`'in iki aşamalı şeklini hâlâ kapsamazdı. Bunun yerine **KISMİ bir sadeleştirme**: yalnızca dört modülde GERÇEKTEN birebir tekrarlanan üç doğrulama kontrolü `core`'a taşındı; her modülün kendi entity/repository/exception/controller yapısı, `decide()` sonrası yan etkileri (ör. `leave`'in bildirim gönderimi) DEĞİŞMEDEN korundu.

**Tasarım kararları:**
- `core.approval.ApprovalStatus` (arayüz: `isPending()`/`isApproved()`/`isRejected()`) + `core.approval.ApprovalDecisionValidator` (durumsuz, statik `validate(currentStatus, decision, rejectionReason, alreadyDecidedMessage)` metodu) eklendi. Dört modülün status enum'u (`LeaveRequestStatus`, `TrainingEnrollmentStatus`, `ExpenseItemStatus`, `ClubMembershipRequestStatus`) artık `ApprovalStatus`'u uyguluyor.
- **"Zaten karara bağlanmış" mesajı BİLİNÇLİ OLARAK parametre, sabit değil** — üç modül ("talep") ile `travel.ExpenseItemService` ("kalem") FARKLI bir isim kullanıyordu; davranış/API sözleşmesini DEĞİŞTİRMEMEK için bu metin farkı KORUNDU (tek bir "doğru" metne standardize edilmedi). Diğer iki mesaj ("Karar yalnızca APPROVED veya REJECTED olabilir.", "Ret gerekçesi zorunludur.") dört modülde de zaten birebir aynıydı, bu yüzden sabit olarak `ApprovalDecisionValidator`'ın içine yazıldı.
- **`training.TrainingEnrollmentStatus`'un dördüncü değeri (`COMPLETED`) sorun yaratmadı** — `isPending()`/`isApproved()`/`isRejected()`'in üçü de `COMPLETED` için `false` döner; bu, zaten `decide()`'ın (yalnızca PENDING/APPROVED/REJECTED ile ilgilenen) kapsamı dışında.
- **Yalnızca üç `if` kontrolü taşındı, TÜM `decide()` akışı DEĞİL** — `findById`/`NotFoundException`, hangi entity'nin `approve()`/`reject()` çağrılacağı, `save`, ve karar SONRASI yan etkiler (ör. `LeaveRequestService.decide`'daki bildirim gönderimi) hâlâ her modülün kendi sorumluluğunda. Bu, roadmap'in Bölüm 9.2'de tarif ettiği tam motora erken geçiş olmaktan kaçınan, bilinçli bir kapsam sınırlaması.
- **Hiçbir DB migration'ı gerekmedi** — bu saf bir Java/kod refaktörü, hiçbir tablo/sütun değişmedi.
- **Davranış/API sözleşmesi SIFIR değişti** — dört modülün de mevcut testleri (52+22+18+20 = değişmeden), TEK SATIR güncellenmeden yeşil kaldı; bu, refaktörün gerçekten "yalnızca ortak olanı taşıma" olduğunun, gizli bir davranış değişikliği İÇERMEDİĞİNİN kanıtı.

**Değişen/eklenen dosyalar:**
- `core/src/main/java/com/digitalik/core/approval/ApprovalStatus.java`, `ApprovalDecisionValidator.java` (yeni)
- `core/src/test/java/com/digitalik/core/approval/ApprovalDecisionValidatorTest.java` (yeni, 5 test — Spring context'i olmadan, saf JUnit, çünkü doğrulayıcı durumsuz)
- `leave/src/main/java/com/digitalik/leave/entity/LeaveRequestStatus.java` — `ApprovalStatus` uygulandı; `service/LeaveRequestService.java` — `decide()` içindeki 3 kontrol `ApprovalDecisionValidator.validate(...)` çağrısına indirgendi
- `training/src/main/java/com/digitalik/training/entity/TrainingEnrollmentStatus.java`, `service/TrainingEnrollmentService.java` — aynı değişiklik
- `travel/src/main/java/com/digitalik/travel/entity/ExpenseItemStatus.java`, `service/ExpenseItemService.java` — aynı değişiklik ("kalem" mesajı korunarak)
- `club/src/main/java/com/digitalik/club/entity/ClubMembershipRequestStatus.java`, `service/ClubMembershipRequestService.java` — aynı değişiklik

**Canlı doğrulama:** `docker compose down -v` + `docker compose up --build -d` → yeni migration YOK, V58'de kaldı; uygulama sorunsuz başladı (bu refaktör `core`'u değiştirdiği için TÜM modülleri etkileme riski taşıyordu). Dört modülün `decide()` uçları TEK TEK, uçtan uca, refaktör ÖNCESİYLE birebir aynı mesajlarla test edildi: **Leave** — geçersiz karar → "Karar yalnızca APPROVED veya REJECTED olabilir."; gerekçesiz ret → "Ret gerekçesi zorunludur."; onay → 200; tekrar karar → "Bu talep zaten karara bağlanmış." **Training** — aynı üç senaryo, aynı "talep" metniyle. **Travel/ExpenseItem** — aynı üç senaryo, ama "Bu **kalem** zaten karara bağlanmış." (farklı domain kelimesi korundu). **Club** — gerekçesiz ret → "Ret gerekçesi zorunludur." Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (11), auth (22), organization (61), leave (52), recruitment (39), performance (44), attendance (28), training (22), travel (18), discipline (24), survey (16), suggestion (16), club (20), appointment (20), document (12), bootstrap (1) = 406 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

# Bölüm 8D — Bordro ve Bordroya Hazırlık

> Roadmap notu: Bu modül İzin/PDKS/Harcırah/Disiplin'den onaylanmış veriyi okuyan bir tüketici olduğundan, roadmap sırasının aksine (Bölüm 8'in başında değil) bilinçli olarak SONA bırakıldı — Bölüm 8'in geri kalanı (8A/8B/8C/8E/8F/8G/8H/8I) tamamlandıktan sonra ele alındı.

## US-08D.1.1 — Temel ücret kalemlerini tanımlama (`payroll` modülü açıldı)

**Özet:** `POST/GET/PUT/DELETE /api/payroll/items` — temel ücret kalemleri (maaş, kesinti) tanımlama. EPIC-08D'nin (Bordro) ilk story'si — yeni bir Maven modülü (`payroll`) açıldı.

**Tasarım kararları:**
- Yeni `payroll` modülü, `document`/`appointment`'daki AYNI kuralla kuruldu: yalnızca `core`'a bağımlı, kök `pom.xml`/`bootstrap/pom.xml`'e birer satır, `Dockerfile`'a HEM bağımlılık HEM kaynak-kod COPY satırları eklendi. İlk migration'ı V59 (document'in V58'inin üzerine).
- `PayrollItem`, `organization.JobTitle`'daki AYNI minimal referans listesi deseni (tam CRUD: create/list/update/delete) — kabul kriteri AÇIKÇA "Kalem tanımı basit bir referans listesidir" diyor.
- **FR-1102'nin sabit, zengin ücret kalemi listesi (temel ücret, fazla mesai, hafta tatili, UBGT, prim, ikramiye, yemek/yol yardımı, avans, nafaka/icra/BES kesintileri, ...) BİLİNÇLİ OLARAK bir enum'a DÖNÜŞTÜRÜLMEDİ** — `type` SERBEST METİN, `training.Training.type`'daki (US-08A.1.1) AYNI gerekçe: roadmap story metnindeki "(maaş, kesinti)" örnek değerlerdir, sabit bir tür kümesi istemiyor.
- Bu story, henüz herhangi bir HESAPLAMA/tutar kavramı İÇERMİYOR — yalnızca kalemlerin isim+tür olarak TANIMLANMASI. FR-1101/1106'nın gerçek bordro hesaplama motoru (SGK, gelir vergisi, kümülatif matrah) roadmap'in kendi notunda zaten kapsam dışı bırakılmış (Bölüm 9.8'e ertelenen "tam vergi hesaplama motoru").
- Rol kısıtlaması eklenmedi — kabul kriteri bundan bahsetmiyor.

**Değişen/eklenen dosyalar:**
- `pom.xml` — `<module>payroll</module>`
- `bootstrap/pom.xml` — `payroll` bağımlılığı
- `Dockerfile` — `payroll` COPY satırları
- `payroll/pom.xml` (yeni modül)
- `payroll/src/main/resources/db/migration/V59__create_payroll_items.sql`
- `payroll/src/main/java/com/digitalik/payroll/entity/PayrollItem.java`
- `payroll/src/main/java/com/digitalik/payroll/repository/PayrollItemRepository.java`
- `payroll/src/main/java/com/digitalik/payroll/exception/PayrollItemNotFoundException.java`, `PayrollExceptionHandler.java`
- `payroll/src/main/java/com/digitalik/payroll/service/PayrollItemService.java`
- `payroll/src/main/java/com/digitalik/payroll/dto/PayrollItemRequest.java`, `PayrollItemResponse.java`
- `payroll/src/main/java/com/digitalik/payroll/controller/PayrollItemController.java`
- `payroll/src/test/java/com/digitalik/payroll/PayrollTestApplication.java`
- `payroll/src/test/java/com/digitalik/payroll/controller/PayrollItemControllerTest.java` (yeni, 6 test)

**Canlı doğrulama:** `docker compose down -v` + `docker compose up --build -d` İLK DENEMEDE başarıyla tamamlandı; log'da "Migrating schema "public" to version "59 - create payroll items"", "Successfully applied 59 migrations". Ücret kalemi oluşturuldu (201, "Temel Ücret"/"Maaş"); `GET` listesi doğru döndü; boş ad → 400 "Kalem adı boş olamaz."; token olmadan istek → 401. `psql` ile `audit_log`'da `PayrollItem` için 1 CREATE kaydı doğrulandı. Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (11), auth (22), organization (61), leave (52), recruitment (39), performance (44), attendance (28), training (22), travel (18), discipline (24), survey (16), suggestion (16), club (20), appointment (20), document (12), payroll (6), bootstrap (1) = 412 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

## US-08D.1.2 — Onaylanmış izin/PDKS/masraf verisini tek ekranda görme (mimari istisna)

**Özet:** `GET /api/payroll/consolidation?employeeId=&year=&month=` — bir çalışanın onaylanmış izin taleplerini, aylık puantajını ve onaylanmış masraf kalemlerini TEK bir yanıtta birleştirir. Kabul kriteri: "Ekran, ilgili modüllerden yalnızca onaylanmış kayıtları okur."

**Mimari karar (kullanıcıyla birlikte değerlendirildi):** Bu story, `payroll`'ın `leave.LeaveRequest`/`attendance` (puantaj)/`travel.ExpenseItem` kayıtlarını GERÇEKTEN okumasını gerektiriyordu — 16 modül boyunca hiç bozulmayan "yalnızca core'a bağımlı" kuralının ötesinde bir ihtiyaç (önceki tüm modüller arası paylaşım yalnızca `employeeId` düzeyindeydi). Üç seçenek sunuldu: (a) `payroll`'a leave/attendance/travel'a GERÇEK Maven bağımlılığı ekleme, (b) modüller arası HTTP/internal API çağrısı, (c) aggregation'ı backend'de değil frontend kompozisyonunda çözme. **Kullanıcı (a)'yı seçti** — roadmap'in kendi notu ("Bu modül... onaylanmış veriyi okuyan bir tüketicidir") bu istisnayı zaten öngörüyordu.

**Tasarım kararları:**
- `payroll/pom.xml`'e `leave`+`attendance`+`travel` bağımlılığı eklendi — **TEK YÖNLÜ** (yalnızca `payroll` bağımlı olur, üç modülün hiçbiri `payroll`'u bilmiyor/bilmeyecek). Bu, projenin "gerçek Maven multi-module" mimari kararının (bkz. o karar) bir İSTİSNASI değil, GENİŞLETİLMESİ — modüller hâlâ birbirini test/yayın zamanında BAĞIMSIZ derleyebiliyor, yalnızca `payroll` (ve onunla birlikte `bootstrap`) üç modülün jar'ına ihtiyaç duyuyor.
- **`PayrollConsolidationService`, `attendance.TimesheetService.calculate`'i DOĞRUDAN Java çağrısıyla kullanıyor** — US-07.3.1'de `attendance`/`leave` arasında henüz gerçek bağımlılık YOKKEN kurulan "istemci taraflı `leaveDates` listesi" geçici çözümünün (bkz. o story'deki not: "`ikinci bir gerçek tüketici çıktığında" ima edilen ihtiyaç) TAM OLARAK beklenen SONRAKİ adımı: `payroll` artık HEM `leave`'in onaylı taleplerini HEM `attendance`'ın puantaj hesaplayıcısını gerçekten görebildiğinden, onaylı izin günlerini KENDİSİ hesaplayıp `TimesheetService`'e geçiyor — `TimesheetService`'in kendisi hiç değişmedi (hâlâ `leave`'i bilmiyor, parametre olarak `leaveDates` alıyor).
- **Çalışana henüz çalışma modeli atanmamışsa (`WorkModelAssignmentNotFoundException`) puantaj kısmı BOŞ liste döner, HATA fırlatılmıyor** — bu, ekranın geri kalanını (onaylı izin/masraf) engelleyen bir durum değil, yalnızca henüz mevcut olmayan bir veri parçası; canlı doğrulamada ayrıca test edildi.
- **`attendance.dto.TimesheetDayResponse` DOĞRUDAN yeniden kullanıldı** (kopya bir DTO icat edilmedi) — artık gerçek bir bağımlılık olduğundan bu, gereksiz bir soyutlama olurdu; `ApprovedLeaveResponse`/`ApprovedExpenseItemResponse` ise `payroll`'a özel, yalnızca gösterime uygun (belge baytları/gereksiz alanlar olmadan) minimal DTO'lar.
- **`PayrollTestApplication`'ın tarama kapsamı `leave`/`attendance`/`travel`'ı da içerecek şekilde genişletildi** — izole modül testinin, artık gerçek bağımlılık olan bu paketlerin repository/servis bean'lerini bulabilmesi için. `payroll/src/test/resources/application.yml`'e `leave`'in transitive `spring-boot-starter-mail` bağımlılığının gerektirdiği `spring.mail.host`/`app.mail.from-address` ayarları eklendi (`leave`'in KENDİ test kaynağındaki (US-04.3.1) BİREBİR aynı ayar).
- FR-1103'ün "fazla mesai saatleri, düzenli/ek ödemeler, BES katkı payı" gibi tutar/hesaplama zenginliği BİLİNÇLİ OLARAK taşınmadı — bu ekran yalnızca ham, onaylı KAYITLARI gösteriyor, herhangi bir TUTAR hesaplamıyor (kabul kriteri "yalnızca onaylanmış kayıtları okur" diyor, hesaplama istemiyor).
- Rol kısıtlaması eklenmedi — kabul kriteri bundan bahsetmiyor.

**Değişen/eklenen dosyalar:**
- `payroll/pom.xml` — `leave`/`attendance`/`travel` bağımlılıkları eklendi (gerekçe pom içinde belgelendi)
- `payroll/src/main/java/com/digitalik/payroll/service/PayrollConsolidationService.java` (yeni)
- `payroll/src/main/java/com/digitalik/payroll/dto/ApprovedLeaveResponse.java`, `ApprovedExpenseItemResponse.java`, `PayrollConsolidationResponse.java` (yeni)
- `payroll/src/main/java/com/digitalik/payroll/controller/PayrollConsolidationController.java` (yeni)
- `payroll/src/test/java/com/digitalik/payroll/PayrollTestApplication.java` — tarama kapsamı genişletildi
- `payroll/src/test/resources/application.yml` (yeni) — mail ayarları
- `payroll/src/test/java/com/digitalik/payroll/controller/PayrollConsolidationControllerTest.java` (yeni, 4 test — leave/attendance/travel'ın GERÇEK uçlarını uçtan uca kullanarak)

**Canlı doğrulama:** `docker compose down -v` + `docker compose up --build -d` İLK DENEMEDE başarıyla tamamlandı (yeni migration YOK, V59'da kaldı). Tam senaryo: çalışan (300) için 10-11 Ağustos onaylı izin talebi, 5 Ağustos'ta 540 dk çalışma (480 dk planlanana karşı, FAZLA_MESAI), 300 TL onaylı + 50 TL PENDING (karara bağlanmamış) masraf kalemi oluşturuldu. `GET /api/payroll/consolidation?employeeId=300&year=2026&month=8` → onaylı izin talebi (2 gün) doğru döndü; 31 günlük puantajda 10-11 Ağustos `IZINLI`, 5 Ağustos `FAZLA_MESAI` (540/480 dk) doğru hesaplandı; yalnızca ONAYLI masraf kalemi (300.00) göründü, PENDING olan (50.00) HİÇ görünmedi. Çalışma modeli atanmamış bir çalışan (999999) için → 200, tüm alanlar boş (hata değil). `employeeId` olmadan → 400 "Çalışan boş olamaz."; token olmadan istek → 401. Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (11), auth (22), organization (61), leave (52), recruitment (39), performance (44), attendance (28), training (22), travel (18), discipline (24), survey (16), suggestion (16), club (20), appointment (20), document (12), payroll (10), bootstrap (1) = 416 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

## US-08D.1.3 — Bordro verisini Excel/CSV olarak dışa aktarma

**Özet:** `GET /api/payroll/consolidation/export?employeeId=&year=&month=` — US-08D.1.2'nin konsolide verisini dış bordro sistemine aktarılabilir bir CSV dosyası olarak döner (`Content-Disposition: attachment`). Kabul kriteri: "Dosya, dış bordro sistemine aktarılabilir formatta üretilir."

**Tasarım kararları:**
- **CSV seçildi, Excel (ör. Apache POI) DEĞİL** — FR-1113'ün "Excel/CSV/API/dosya bazlı/PDF" zenginliğinin en basit üyesi; CSV hiçbir yeni kütüphane bağımlılığı gerektirmiyor ve zaten evrensel olarak "dış sisteme aktarılabilir" kabul edilir; kabul kriteri belirli bir format istemiyor.
- **Sütunlar BİLİNÇLİ OLARAK ham/sayısal tutuldu** (`kayit_turu,tarih,aciklama,deger,birim`) — "540 dk" gibi birleşik metin yerine `540` + `dakika` ayrı sütunlarda, dış sistemin alanı doğrudan sayısal olarak işleyebilmesi için. Metin alanları (`aciklama`) CSV virgülüyle çakışmayacak şekilde BİLİNÇLİ OLARAK virgülsüz kuruldu (ör. "Onayli izin (bitis: ...)" — parantez var, virgül yok) — CSV alan-tırnaklama (quoting) mantığı İCAT EDİLMEDİ, bu ölçekte gereksiz bir karmaşıklık olurdu.
- **`PayrollExportService`, US-08D.1.2'nin `PayrollConsolidationService.consolidate(...)`'ini DOĞRUDAN çağırıyor** — yeni bir veri okuma/onay mantığı YOK, yalnızca AYNI konsolide veriyi CSV'ye düzleştiriyor (flatten); bu, kabul kriterinin "US-08D.1.2'ye bağımlılık" ilişkisinin doğal bir sonucu.
- Endpoint, AYRI bir controller yerine VAR OLAN `PayrollConsolidationController`'a eklendi — aynı temel kaynağın (`/api/payroll/consolidation`) bir alt-yolu (`/export`), `training.TrainingEnrollmentController`'a `listCompleted`'ın eklenmesiyle AYNI karar.
- Rol kısıtlaması eklenmedi — kabul kriteri bundan bahsetmiyor.

**Değişen/eklenen dosyalar:**
- `payroll/src/main/java/com/digitalik/payroll/service/PayrollExportService.java` (yeni)
- `payroll/src/main/java/com/digitalik/payroll/controller/PayrollConsolidationController.java` — `GET /export` eklendi
- `payroll/src/test/java/com/digitalik/payroll/controller/PayrollConsolidationControllerTest.java` — 2 yeni test (CSV satır içeriği + `Content-Disposition` header'ı)

**Canlı doğrulama:** `docker compose down -v` + `docker compose up --build -d` (yeni migration YOK, V59'da kaldı). Onaylı izin (15 Ağustos, 1 gün) + PDKS kaydı (5 Ağustos, 480 dk, NORMAL) + onaylı masraf kalemi (175.50 TL) oluşturuldu. `GET .../export?employeeId=400&year=2026&month=8` → `curl` ile GERÇEK bir dosya indirildi: `Content-Disposition: attachment; filename="bordro-400-2026-8.csv"`, `Content-Type: text/csv;charset=UTF-8`; dosya içeriği doğrulandı — başlık satırı doğru, `IZIN,2026-08-15,...,1,gun` satırı, 31 `PUANTAJ` satırı (5 Ağustos `NORMAL`/480, 15 Ağustos `IZINLI`, diğerleri `EKSIK`/0), `MASRAF,,Seyahat talebi #1,175.50,TL` satırı doğru sırayla ve doğru değerlerle üretildi. Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (11), auth (22), organization (61), leave (52), recruitment (39), performance (44), attendance (28), training (22), travel (18), discipline (24), survey (16), suggestion (16), club (20), appointment (20), document (12), payroll (12), bootstrap (1) = 418 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

## US-08D.1.4 — Bordro modülüne özel ek doğrulama adımı (2FA)

**Özet:** "Bordro kullanıcısı olarak, modüle girişte ek bir doğrulama adımı (2FA) istiyorum." Kabul kriteri: "Bordro ekranına girişte ikinci faktör istenir" (FR-1116). `POST /api/auth/payroll-access/request` (mevcut oturuma 5 dakika geçerli, e-posta ile gönderilen 6 haneli kod tanımlar) + `POST /api/auth/payroll-access/verify` (kodu doğrular, oturumu "step-up doğrulanmış" işaretler); `/api/payroll/**` altındaki TÜM uçlar artık step-up doğrulanmamış oturumlar için 403 döner. Bu story ile **EPIC-08D (Bordro) tamamlandı**.

**Tasarım kararları:**
- **Mekanizma bilinçli olarak BASİT** — roadmap'in kendi notu, US-09.1.3'ün bunu gerçek LDAP+MFA/TOTP ile DEĞİŞTİRECEĞİNİ zaten söylüyor; burada yeni bir kimlik doğrulama katmanı/kütüphanesi (TOTP, authenticator app) icat edilmedi, VAR OLAN `Session` varlığına üç nullable alan (`step_up_code`, `step_up_code_expires_at`, `step_up_verified_at`) eklenerek AYNI oturumun "adım yükseltilmiş" durumu izlendi — yeni bir oturum/token türü YOK.
- **Zorlama (`enforcement`), `payroll` modülünde DEĞİL, `auth`'ta yaşıyor** — Spring Security filtre zincirinin (`SecurityConfig`) merkezi olarak tek bir modülde kurulu olması nedeniyle (`recruitment`'ın `permitAll()` kuralının da AYNI gerekçeyle `auth`'ta tanımlı olması gibi, bkz. US-05.2.1). Yeni `PayrollStepUpFilter` (`OncePerRequestFilter`, `TokenAuthenticationFilter`'daki AYNI desenle `@Component` DEĞİL, `SecurityConfig` içinde elle örnekleniyor), yalnızca `/api/payroll/` ön ekiyle başlayan istekleri yakalar — `payroll` modülünün kendisi `auth`'a hiç bağımlı olmadı, bağımlılık YÖNÜ değişmedi.
- **`StepUpNotificationService`, `leave.LeaveNotificationService`'teki (US-04.3.1) BİREBİR aynı deseni** izliyor — constructor injection `JavaMailSender` + `@Value("${app.mail.from-address}")`, `MailException` yutulup loglanıyor (SMTP hatası birincil iş mantığını asla bloklamamalı). `auth/pom.xml`'e bu nedenle İLK KEZ `spring-boot-starter-mail` eklendi (daha önce `auth`'un mail bağımlılığı yoktu).
- **Kod TTL'si (5 dakika) `app.session.step-up-code-ttl-minutes` ile yapılandırılabilir** — `app.session.ttl-minutes`'daki (oturum süresi) AYNI desen, ayrı bir config sınıfı icat edilmedi.
- **Kimliği doğrulanmamış istekler `PayrollStepUpFilter`'da HİÇ ele alınmıyor** — filtre yalnızca `Authentication.getPrincipal()` bir `AuthenticatedUser` İSE devreye giriyor; aksi halde zincirin geri kalanına devrediyor, böylece var olan `anyRequest().authenticated()` kuralı standart 401'i üretmeye devam ediyor (401 ile step-up 403'ünün karışmaması bilinçli).
- **Yan bulgu — platform geneli bir kusur düzeltildi:** Bu story'nin testi yazılırken, `core.exception.GlobalExceptionHandler`'ın kendi `Exception.class` genel yakalayıcısının, Spring'in `NoResourceFoundException`'ını (var olmayan bir yola GET isteği) YAKALAYIP 500'e çevirdiği ortaya çıktı — sınıfın kendi javadoc'unun iddia ettiği ("`problemdetails.enabled=true`, Spring'in kendi 404/405'lerini de aynı formata çevirir") davranışın SESSİZCE bozulduğu, hiçbir modülün şimdiye kadar bir GET isteğiyle var olmayan bir yola gerçekten dokunmadığı için fark edilmemiş bir hataydı. `NoResourceFoundException` için özel bir `@ExceptionHandler` eklenerek (kendi 404 gövdesi olduğu gibi döndürülüyor) düzeltildi — TÜM modülleri etkileyen, geriye dönük bir düzeltme.
- Rol kısıtlaması eklenmedi — kabul kriteri bundan bahsetmiyor; bu, `payroll` uçlarına erişimin KENDİSİNİ değil, erişimin İKİNCİ FAKTÖRÜNÜ ele alan bir story.

**Değişen/eklenen dosyalar:**
- `auth/src/main/resources/db/migration/V60__add_step_up_fields_to_sessions.sql` (yeni)
- `auth/src/main/java/com/digitalik/auth/entity/Session.java` — step-up alan/metotları eklendi
- `auth/src/main/java/com/digitalik/auth/service/SessionService.java` — `requestStepUp`/`verifyStepUp` eklendi
- `auth/src/main/java/com/digitalik/auth/service/StepUpNotificationService.java` (yeni)
- `auth/src/main/java/com/digitalik/auth/service/AuthService.java` — `requestPayrollAccess`/`verifyPayrollAccess` eklendi
- `auth/src/main/java/com/digitalik/auth/dto/VerifyPayrollAccessRequest.java` (yeni)
- `auth/src/main/java/com/digitalik/auth/controller/AuthController.java` — `POST /payroll-access/request`, `POST /payroll-access/verify` eklendi
- `auth/src/main/java/com/digitalik/auth/security/PayrollStepUpFilter.java` (yeni)
- `auth/src/main/java/com/digitalik/auth/security/SecurityConfig.java` — yeni filtre `TokenAuthenticationFilter`'dan sonra kaydedildi
- `auth/pom.xml` — `spring-boot-starter-mail` eklendi
- `auth/src/test/resources/application.yml` (yeni) — mail ayarları
- `bootstrap/src/main/resources/application.yml` — `app.session.step-up-code-ttl-minutes: 5`
- `core/src/main/java/com/digitalik/core/exception/GlobalExceptionHandler.java` — `NoResourceFoundException` → doğru 404 düzeltmesi
- `auth/src/test/java/com/digitalik/auth/service/StepUpNotificationServiceTest.java` (yeni, 2 test)
- `auth/src/test/java/com/digitalik/auth/controller/AuthControllerTest.java` — 5 yeni test (step-up ile 403→204→artık-403-değil akışı, yanlış kod, kod istenmeden doğrulama, süresi dolmuş kod, kimliksiz istekte standart 401)

**Canlı doğrulama:** `docker compose down -v` + `docker compose up --build -d` İLK DENEMEDE başarıyla tamamlandı; log'da "Migrating schema "public" to version "60 - add step up fields to sessions"", "Successfully applied 60 migrations". Seed admin kullanıcısıyla (`admin@dijitalik.local`) giriş yapıldı; step-up doğrulanmadan `GET /api/payroll/items` → 403 "Ek doğrulama gerekli"; `POST /payroll-access/request` → 204; Mailpit'te "Bordro Modülü Doğrulama Kodu" e-postası bulundu, kod (`970735`) okundu; yanlış kodla (`000000`) doğrulama → 400 "Doğrulama kodu hatalı."; doğru kodla doğrulama → 204; ardından `GET /api/payroll/items` → 200, `[]` (artık 403 DEĞİL); token olmadan istek → standart 401 (step-up 403'ü değil). Ayrıca `GlobalExceptionHandler` düzeltmesi doğrulandı: kimliği doğrulanmış bir kullanıcı için var olmayan bir yola (`/api/nonexistent-path`) istek artık 500 değil, doğru 404 "No static resource ..." döndürüyor. Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (11), auth (29), organization (61), leave (52), recruitment (39), performance (44), attendance (28), training (22), travel (18), discipline (24), survey (16), suggestion (16), club (20), appointment (20), document (12), payroll (12), bootstrap (1) = 425 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

**EPIC-08D (Bordro) TAMAMLANDI.** Bölüm 1-8 roadmap akışının tamamı bu story ile tamamlanmış oldu — Bölüm 9 (Kurumsal Entegrasyonlar ve Altyapı) kasıtlı olarak tetikleyici-gated kaldı (bkz. Bölüm 9 kararı: "hiçbir feature'ı ilgili tetikleyici koşul gerçekleşmeden ele alınmaz").

---

## Yapısal karar — `survey` + `suggestion` → `feedback` modül birleştirmesi

**Özet:** Backend'in tamamı (Bölüm 1-8) bittikten sonra yapılan genel sağlık taramasında 17 Maven modülünün fazla geldiği değerlendirildi. `survey` (EPIC-08E, Anket) ve `suggestion` (EPIC-08F, Talep ve Fikir) modülleri — ikisi de küçük (16'şar test), aralarında hiç kod paylaşımı/bağımlılığı yok ama ikisi de kavramsal olarak AYNI kategoride ("çalışan sesi" mekanizması) — tek bir `feedback` modülünde birleştirildi.

**Tasarım kararları:**
- **Sadece bu ikisi birleştirildi, başka hiçbir modül DOKUNULMADI** — `leave`/`attendance`/`travel`/`payroll` gibi ZATEN gerçek bir Java bağımlılık zincirine sahip modüller BİLİNÇLİ OLARAK ayrı bırakıldı (birleşme, var olan tek-yönlü bağımlılık sınırını bozardı); `club`/`appointment`/`document` gibi diğer küçük modüller için de kullanıcıya aday olarak sunuldu ama yalnızca `survey`+`suggestion` için onay verildi.
- **Paket yapısı DÜZLEŞTİRİLDİ, alt-domain'e göre ayrılmadı** — `com.digitalik.feedback.{entity,repository,service,controller,dto,exception}` katmanlarının HER BİRİNDE hem anket hem talep/fikir sınıfları birlikte yaşıyor (ör. `entity` paketinde hem `Survey` hem `Suggestion`) — `organization` modülünün ZATEN aynı şekilde (Employee/JobTitle/OrganizationUnit/...) tek katman paketlerinde birden çok alt-kavramı barındırmasıyla AYNI, projede yerleşik desen. Sınıf adları arasında (Survey* / Suggestion*) hiç çakışma olmadığından bu düzleştirme sorunsuz.
- **İki ayrı `@RestControllerAdvice` (`SurveyExceptionHandler` + `SuggestionExceptionHandler`), TEK bir `FeedbackExceptionHandler`'da birleştirildi** — `@Order(HIGHEST_PRECEDENCE)` kuralı (US-02.1.3 dersi) korunarak; `basePackageClasses`, `com.digitalik.feedback.controller` paketindeki TÜM controller'lara (4 tanesi) uygulanıyor. İki test application (`SurveyTestApplication`+`SuggestionTestApplication`) de TEK bir `FeedbackTestApplication`'a birleştirildi.
- **Flyway migration NUMARALARI DEĞİŞTİRİLMEDİ** (V48-V51 aynen taşındı, dosya içerikleri hiç dokunulmadı) — tablo adları (`surveys`, `survey_options`, `survey_answers`, `suggestion_categories`, `suggestions`) da AYNI kaldığından bu SALT BİR JAVA/MAVEN REFACTOR'ÜDÜR, şemada hiçbir değişiklik yok; canlı doğrulamada `ddl-auto: validate`'in hatasız geçmesi bunu doğruluyor.
- Test sınıfları (6 tanesi) BİREBİR aynı kaldı, yalnızca paket/import satırları güncellendi — hiçbir test assertion'ı değişmedi (davranış sıfır fark).

**Değişen/eklenen/silinen dosyalar:**
- `survey/`, `suggestion/` (tüm modüller) SİLİNDİ
- `feedback/` (yeni modül) — `pom.xml`, tüm `entity`/`repository`/`service`/`controller`/`dto` sınıfları (paket adı güncellenerek taşındı), `FeedbackExceptionHandler.java` (yeni, iki eski handler'ın birleşimi), 4 migration dosyası (V48-V51, değişmeden taşındı), `FeedbackTestApplication.java` (yeni), 6 test sınıfı (paket adı güncellenerek taşındı)
- `pom.xml` — `<module>survey</module>`+`<module>suggestion</module>` → `<module>feedback</module>`
- `bootstrap/pom.xml` — aynı birleşme
- `Dockerfile` — `survey`/`suggestion` COPY satırları → tek `feedback` COPY satırı

**Canlı doğrulama:** `docker compose down -v` + `docker compose up --build -d` İLK DENEMEDE başarıyla tamamlandı; log'da hâlâ "Successfully applied 60 migrations" (YENİ migration YOK, beklenen) ve Hibernate `ddl-auto: validate`'in hatasız geçmesi — entity/tablo eşlemesinin taşımadan etkilenmediğinin kanıtı. `POST /api/surveys` (201), `POST /api/suggestions/categories` (201), `POST /api/suggestions` (201) hepsi başarıyla çalıştı; `GET /api/surveys/999999/results` → 404 "Anket bulunamadı" ve olmayan kategoriyle `POST /api/suggestions` → 404 "Kategori bulunamadı" — birleşen `FeedbackExceptionHandler`'ın HER İKİ eski eşlemeyi de doğru şekilde koruduğu doğrulandı. Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (11), auth (29), organization (61), leave (52), recruitment (39), performance (44), attendance (28), training (22), travel (18), discipline (24), feedback (32), club (20), appointment (20), document (12), payroll (12), bootstrap (1) = 425 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

## Yapısal karar — `club` + `appointment` → `amenities` modül birleştirmesi

**Özet:** `survey`+`suggestion` → `feedback` birleştirmesinin AYNI gerekçesiyle: `club` (EPIC-08G, Sosyal Kulüp) ve `appointment` (EPIC-08H, Randevu) — ikisi de küçük (20'şer test), aralarında hiç kod paylaşımı/bağımlılığı yok ama ikisi de kavramsal olarak AYNI kategoride (opsiyonel/self-servis çalışan olanağı) — tek bir `amenities` modülünde birleştirildi.

**Tasarım kararları:**
- **Paket yapısı, `feedback`'teki AYNI desenle DÜZLEŞTİRİLDİ** — `com.digitalik.amenities.{entity,repository,service,controller,dto,exception}` katmanlarının HER BİRİNDE hem kulüp hem randevu sınıfları birlikte yaşıyor. Sınıf adları arasında (Club*/ClubEvent* / Appointment*/ServiceOffering*) hiç çakışma olmadığından sorunsuz.
- **İki ayrı `@RestControllerAdvice` (`ClubExceptionHandler` + `AppointmentExceptionHandler`), TEK bir `AmenitiesExceptionHandler`'da birleştirildi** — `@Order(HIGHEST_PRECEDENCE)` korunarak, ayrıca `AppointmentExceptionHandler`'ın `AuthorizationDeniedException` → 403 eşlemesi de (US-08H.1.3, `AppointmentNoteController`'ın `@PreAuthorize`'ı için) AYNEN taşındı — bu eşleme olmadan merge sonrası `@PreAuthorize` reddi yanlışlıkla 500'e düşerdi (US-02.1.3/US-03.2.6 dersinin AYNISI). İki test application da TEK `AmenitiesTestApplication`'a birleşti.
- **`spring-security-core` bağımlılığı `amenities/pom.xml`'e taşındı** (eskiden yalnızca `appointment/pom.xml`'deydi) — merge edilen modülde `AppointmentNoteController`'ın `@PreAuthorize`'ı hâlâ var, `club` tarafının buna ihtiyacı yok ama bağımlılık modül genelinde tek.
- **Flyway migration NUMARALARI DEĞİŞTİRİLMEDİ** (V52-V56 aynen taşındı) — tablo adları da AYNI kaldığından SALT bir Java/Maven refactor'üdür; canlı doğrulamada `ddl-auto: validate`'in hatasız geçmesi bunu doğruluyor.
- Test sınıfları (10 tanesi) BİREBİR aynı kaldı, yalnızca paket/import satırları güncellendi.

**Değişen/eklenen/silinen dosyalar:**
- `club/`, `appointment/` (tüm modüller) SİLİNDİ
- `amenities/` (yeni modül) — `pom.xml`, tüm sınıflar (paket adı güncellenerek taşındı), `AmenitiesExceptionHandler.java` (yeni, iki eski handler'ın birleşimi), 5 migration dosyası (V52-V56, değişmeden taşındı), `AmenitiesTestApplication.java` (yeni), 10 test sınıfı (paket adı güncellenerek taşındı)
- `pom.xml`, `bootstrap/pom.xml`, `Dockerfile` — `club`+`appointment` → tek `amenities` girdisi

**Canlı doğrulama:** `docker compose down -v` + `docker compose up --build -d` İLK DENEMEDE başarıyla tamamlandı; "Successfully applied 60 migrations" (YENİ migration YOK, beklenen), Hibernate `ddl-auto: validate` hatasız. Kulüp oluşturuldu, LİDER olarak (`employeeId`=`leaderId`) etkinlik oluşturma → 201; LİDER OLMAYAN bir çalışanla aynı istek → 403 "Yalnızca kulüp lideri etkinlik oluşturabilir." (birleşen handler'daki `NotClubLeaderException` eşlemesi doğrulandı). Hizmet+slot+randevu oluşturuldu (hepsi 201); randevu notu ADMIN token'ıyla okundu → 200 (birleşen handler'daki `AuthorizationDeniedException` eşlemesinin gerekli olduğu `@PreAuthorize`'lı uç, 500'e düşmeden çalıştı). Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (11), auth (29), organization (61), leave (52), recruitment (39), performance (44), attendance (28), training (22), travel (18), discipline (24), feedback (32), amenities (40), document (12), payroll (12), bootstrap (1) = 425 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

## Yapısal karar — `document` → `organization` modül birleştirmesi

**Özet:** `feedback`/`amenities` birleştirmeleriyle AYNI genel sağlık taraması kararının devamı: `document` (EPIC-08I, Doküman Yönetimi ve Görev Tanımları) — yalnızca 12 test, 2 controller — `organization`'a birleştirildi. Önceki iki birleşmeden FARKLI olarak bu bir "iki küçük modül → yeni modül" değil, **"küçük modül → var olan büyük modül"** birleşmesi: `JobDescription`, kavramsal olarak zaten `organization.JobTitle`'ın bir uzantısı (bir unvana bağlı görev tanımı) olduğundan, YENİ bir modül açmak yerine doğrudan `organization`'ın kendi paket yapısına katıldı.

**Tasarım kararları:**
- **Modül adı `organization` olarak KALDI, yeniden adlandırılmadı** — `document`'in iki küçük controller'ı `organization`'ın ZATEN var olan 7 controller'ının yanına eklendi; `organization`'ın kendi kimliği/kapsamı bundan etkilenmedi.
- **`DocumentExceptionHandler`, AYRI bir sınıf olarak KALMADI** — tek `@ExceptionHandler(PolicyDocumentNotFoundException.class)` metodu doğrudan VAR OLAN `OrganizationExceptionHandler`'a eklendi (yeni bir `AmenitiesExceptionHandler`-tarzı birleşim sınıfı YOK, çünkü `organization`'ın zaten kendi merkezi advice'ı var). `DocumentTestApplication` da tamamen SİLİNDİ — `OrganizationTestApplication` zaten `com.digitalik.organization` paketinin TAMAMINI tarıyor.
- **`document/pom.xml`'in hiçbir bağımlılığı `organization/pom.xml`'e TAŞINMADI** — `document`'in ihtiyaçları (core + test) zaten `organization`'ın bağımlılıklarının bir ALT KÜMESİYDİ, `organization`'ın kendisi ayrıca `spring-security-core`'a da sahip (document'in hiç ihtiyacı olmayan).
- **Flyway migration NUMARALARI DEĞİŞTİRİLMEDİ** (V57-V58, `organization`'ın KENDİ V10-V17 aralığının YANINA, aynı `db/migration` klasörüne taşındı) — Flyway migration'ları hangi modülün kaynak klasöründe olduğuna bakmaz, TÜM modüllerin classpath'teki `db/migration` dosyalarını birlikte, sürüm numarasına göre sıralar; bu nedenle V10-17 ile V57-58'in AYNI modülde birlikte yaşaması şema açısından hiçbir fark yaratmaz.
- Test sınıfları (2 tanesi) BİREBİR aynı kaldı, yalnızca paket/import satırları güncellendi.

**Değişen/eklenen/silinen dosyalar:**
- `document/` (tüm modül) SİLİNDİ
- `organization/` içine eklendi: `PolicyDocument`/`PolicyDocumentStatus`/`JobDescription` (entity), `PolicyDocumentRepository`/`JobDescriptionRepository`, `PolicyDocumentService`/`JobDescriptionService`, `PolicyDocumentController`/`JobDescriptionController`, ilgili DTO'lar, `PolicyDocumentNotFoundException`, 2 migration dosyası (V57-V58, değişmeden taşındı), 2 test sınıfı (paket adı güncellenerek taşındı)
- `organization/src/main/java/com/digitalik/organization/exception/OrganizationExceptionHandler.java` — `PolicyDocumentNotFoundException` eşlemesi eklendi
- `organization/pom.xml` — açıklama güncellendi (bağımlılık değişikliği YOK)
- `pom.xml`, `bootstrap/pom.xml`, `Dockerfile` — `document` girdisi tamamen kaldırıldı (yeni bir girdi eklenmedi, `organization`'ın zaten var olanı yeterli)

**Canlı doğrulama:** `docker compose down -v` + `docker compose up --build -d` İLK DENEMEDE başarıyla tamamlandı; "Successfully applied 60 migrations" (YENİ migration YOK, beklenen), Hibernate `ddl-auto: validate` hatasız. `POST /api/organization/job-titles` (201) → `POST /api/documents/job-descriptions` (201, `jobTitleId` doğru bağlandı); `POST /api/documents` (multipart, 201, `version=1`); `GET /api/documents` (200, doğru liste); olmayan `previousVersionId` ile yeni versiyon yükleme → 404 "Doküman bulunamadı" (birleşen `OrganizationExceptionHandler`'daki yeni eşleme doğrulandı). Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (11), auth (29), organization (73), leave (52), recruitment (39), performance (44), attendance (28), training (22), travel (18), discipline (24), feedback (32), amenities (40), payroll (12), bootstrap (1) = 425 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

**Modül birleştirme turu tamamlandı: 17 → 14 modül** (`survey`+`suggestion`→`feedback`, `club`+`appointment`→`amenities`, `document`→`organization`). Toplam test sayısı (425) ve tüm davranışlar DEĞİŞMEDEN korundu — bu üç birleşme SALT yapısal/organizasyonel refactor'lerdi, roadmap'in kapsadığı hiçbir kabul kriterine dokunmadı.

---

## Bölüm 9 başlıyor — Kurumsal Entegrasyonlar ve Altyapı

Bölüm 1-8 tamamlandıktan sonra Bölüm 9'un (EPIC-09, 19 User Story) kapsamı kullanıcıyla netleştirildi: gerçek bir kurumsal servis satın alınmasını gerektiren maddeler (AD/LDAP, SSO, gerçek e-Devlet/SGK entegrasyonu, mevcut bordro sisteminden veri taşıma) atlanıyor; kullanıcı onaylamadığı için audit log immutability (kısıtlı DB rolü) ve CI/CD SAST/SCA da atlanıyor. Geri kalan 10 madde (TOTP MFA, onay zinciri motoru, merkezi bildirim, merkezi export, dinamik özel alan çerçevesi, genel dosya saklama, ClamAV virüs tarama, banka ödeme dosyası, hassas alan şifreleme, zamanlanmış DB yedeği) uygulanacak. Ayrıntılı kapsam/tasarım kararları `/Users/ardag/.claude/plans/zesty-sleeping-reef.md`'de. Yeni bir `platform` modülü (yalnızca `core`'a bağımlı) açılacak — onay motoru, dinamik alan çerçevesi, dosya saklama ve virüs tarama gibi "iş mantığı içeren ama tek bir business modülüne ait olmayan" yetenekleri barındıracak (4 ayrı küçük modül yerine, geçen turda düzelttiğimiz "çok modül" sorununu tekrarlamamak için).

## US-09.3.1 — Merkezi bildirim/şablon altyapısı

**Özet:** `leave.LeaveNotificationService` (US-04.3.1) ve `auth.StepUpNotificationService` (US-08D.1.4) — projedeki TEK iki e-posta gönderim implementasyonu — artık `core.notification` paketindeki ortak bir mekanizmaya delege ediyor. Kabul kriteri: "Şablonlar versiyonlanabilir; mevcut bildirimler bozulmadan taşınır."

**Tasarım kararları:**
- **Ağır bir template engine (Thymeleaf/FreeMarker) BİLİNÇLİ OLARAK kullanılmadı** — toplamda yalnızca 3 şablon (leave-decision-approved/rejected, step-up-code) olduğundan, basit `{{alan}}` yer-tutucu değişimi (`String.replace` döngüsü) yeterli; tam bir motor bu ölçekte aşırı mühendislik olurdu.
- **Şablonlar dosya olarak** (`core/src/main/resources/notification-templates/*.txt`) tutuluyor — kabul kriterinin "versiyonlanabilir" şartı, git'in kendisiyle karşılanıyor; bir admin ekranından düzenlenebilir DB-tabanlı versiyonlama İSTENMEDİ (ne böyle bir ekran var, ne de kabul kriteri bunu açıkça istiyor).
- **`LeaveNotificationService`/`StepUpNotificationService` SİLİNMEDİ, İNCE SARMALAYICIYA dönüştürüldü** — public API'leri (`sendDecisionNotification`/`sendStepUpCode`) ve çağıranları (`LeaveRequestService`/`AuthService`) HİÇ değişmedi; yalnızca mesaj metnini artık Java string literal yerine `core.notification.EmailNotificationService`'e delege ediyorlar. Bu, kabul kriterinin "mevcut bildirimler bozulmadan taşınır" şartının doğrudan karşılanması.
- **`core`, projedeki İLK mail bağımlılığını kazandı** (`spring-boot-starter-mail`) — saf SMTP gönderim ALTYAPISI olduğundan (iş mantığı İÇERMEDİĞİNDEN) core'un kendi ADR'sine ("yalnızca paylaşılan altyapı") aykırı değil; `core.approval.ApprovalStatus`'un core'da yaşamasıyla AYNI gerekçe.
- **Yan etki — projedeki HER modülün izole test bağlamı artık mail config gerektiriyor:** `core.notification.EmailNotificationService`, `core`'a bağımlı OLAN HER modülün `<Modül>TestApplication`'ı tarafından component-scan ile taranıyor (hepsi `com.digitalik.core`'u tarıyor) ve bir `JavaMailSender` bean'i bekliyor; Spring Boot'un mail auto-configuration'ı ise yalnızca `spring.mail.host` tanımlıysa bu bean'i oluşturuyor. Bu nedenle daha önce hiç mail'e ihtiyacı olmayan 9 modülün (`organization`, `recruitment`, `performance`, `attendance`, `training`, `travel`, `discipline`, `feedback`, `amenities`) HER BİRİNE `leave`/`auth`'un ZATEN sahip olduğu AYNI test-only `spring.mail.host`/`app.mail.from-address` ayarı eklendi — beklenmeyen ama zararsız bir kapsam genişlemesi, canlı davranışı etkilemiyor (yalnızca test bağlamı bean çözümlemesi).
- **Test stratejisi değişikliği:** `LeaveNotificationServiceTest`/`StepUpNotificationServiceTest`, artık somut `EmailNotificationService` sınıfını MOCK'LAMIYOR — bu ortamda Mockito'nun somut sınıf mock'lamasını (`net.bytebuddy` inline mock maker) desteklemeyen bir **Java 24/ByteBuddy sürüm uyumsuzluğuna** takılıyor ("Java 24 (68) is not supported... officially supports Java 23"). Bunun yerine GERÇEK bir `EmailNotificationService` (mock `JavaMailSender` + gerçek `NotificationTemplateService` ile) kullanılıyor — hem bu ortam sorununu aşıyor hem de daha güçlü bir doğrulama sağlıyor (gerçek render edilmiş metin kontrol ediliyor, yalnızca mock çağrısı değil). SMTP-hatası-yutma testi artık yalnızca `core.notification.EmailNotificationServiceTest`'te (tek merkezi yerde) var, iki modülde tekrar edilmiyor.

**Değişen/eklenen dosyalar:**
- `core/pom.xml` — `spring-boot-starter-mail` eklendi
- `core/src/main/java/com/digitalik/core/notification/NotificationTemplateService.java`, `EmailNotificationService.java` (yeni)
- `core/src/main/resources/notification-templates/leave-decision-approved.txt`, `leave-decision-rejected.txt`, `step-up-code.txt` (yeni)
- `leave/src/main/java/com/digitalik/leave/service/LeaveNotificationService.java`, `auth/src/main/java/com/digitalik/auth/service/StepUpNotificationService.java` — ince sarmalayıcıya dönüştürüldü
- `leave/src/test/.../LeaveNotificationServiceTest.java`, `auth/src/test/.../StepUpNotificationServiceTest.java` — gerçek `EmailNotificationService` kullanacak şekilde yeniden yazıldı
- `core/src/test/java/com/digitalik/core/notification/NotificationTemplateServiceTest.java`, `EmailNotificationServiceTest.java` (yeni, 4+3 test)
- `organization/src/test/resources/application.yml` (+8 diğer modül) — mail test config (yeni)

**Canlı doğrulama:** `docker compose down -v` + `docker compose up --build -d` İLK DENEMEDE başarıyla tamamlandı (yeni migration YOK). İzin talebi oluşturulup onaylandı → Mailpit'te "İzin Talebiniz Onaylandı" e-postası, gövdesi `{{donem}}` yer tutucusunun doğru değerle (2026-09-01 - 2026-09-03) değiştirildiğini doğruladı; bordro erişim kodu istendi → Mailpit'te "Bordro Modülü Doğrulama Kodu" e-postası göründü. Her iki e-posta da eskisiyle BİREBİR aynı metni üretti (şablon dosyalarının Türkçe metinleri, orijinal Java string literal'larının birebir kopyası). Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (18), auth (28), organization (73), leave (51), recruitment (39), performance (44), attendance (28), training (22), travel (18), discipline (24), feedback (32), amenities (40), payroll (12), bootstrap (1) = 430 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

## US-09.4.1 — Merkezi filtre + dışa aktarma bileşeni

**Özet:** `core.export` paketi (`CsvExporter` + `ExcelExporter`) — `payroll.PayrollExportService`'teki (US-08D.1.3) hand-rolled CSV üretiminin genelleştirilmiş hali. Kabul kriteri: "Bileşen, en az iki modülde (ör. Çalışan listesi, İzin geçmişi) yeniden kullanılır." Roadmap'in KENDİ örneği birebir uygulandı: `organization` (yeni `GET /api/organization/employees/export`) ve `leave` (yeni `GET /api/leave/requests/export`), ARTI `payroll`'un mevcut export'u da bu bileşeni kullanacak şekilde refactor edildi (3. tüketici).

**Tasarım kararları:**
- **Filtreleme (`Specification<T>`) GENELLEŞTİRİLMEDİ, yalnızca CSV/Excel YAZMA kısmı merkezi** — `Specification` modül-özel `Root<T>` tipleri gerektirdiğinden gerçek bir genelleme mümkün değil/anlamsız; `organization.EmployeeSpecifications` deseni olduğu gibi kalıyor, yalnızca sonucun dosyaya dönüştürülmesi `core.export`'a taşındı.
- **`CsvExporter`, `PayrollExportService`'in AKSİNE RFC 4180 tırnaklama uyguluyor** (virgül/tırnak/satır sonu içeren alanlar çift tırnağa alınır) — o servis kapalı, tek kullanımlık, kontrollü bir veri kümesi için bilinçli olarak tırnaklama YAPMIYORDU; bu bileşen artık projenin GENEL aracı olduğundan (isim/adres/açıklama gibi rastgele metin taşıyabilir) bu ek sağlamlık gerekli.
- **Gerçek Excel (Apache POI, XLSX) eklendi** — CSV'nin yanında ikinci bir format olarak; `poi-ooxml` ücretsiz/açık kaynak bir Maven bağımlılığı, harici bir servis DEĞİL.
- **`organization` export'unda `nationalId` (TC Kimlik No) BİLİNÇLİ OLARAK sütunlara DAHİL EDİLMEDİ** — toplu indirilebilir bir kanaldan hassas kimlik verisini gereksiz yere yaymamak için (US-09.9.1'in şifreleyeceği alanlardan biri).
- **`PayrollExportService`'in refactor'ü dış davranışı DEĞİŞTİRMEDİ** — üç heterojen kayıt türü (izin/puantaj/masraf) ortak `String[]` satır temsiline düzleştirilip `CsvExporter.export(...)`'a veriliyor; mevcut 12 payroll testi (satır formatı, `Content-Disposition` header'ı dahil) HİÇ DEĞİŞTİRİLMEDEN geçti — canlı doğrulamada header satırının ("kayit_turu,tarih,aciklama,deger,birim") eskisiyle birebir aynı olduğu ayrıca teyit edildi.

**Değişen/eklenen dosyalar:**
- `core/pom.xml` — `org.apache.poi:poi-ooxml` eklendi
- `core/src/main/java/com/digitalik/core/export/CsvExporter.java`, `ExcelExporter.java` (yeni)
- `core/src/test/java/com/digitalik/core/export/CsvExporterTest.java` (4 test), `ExcelExporterTest.java` (1 test)
- `organization/src/main/java/com/digitalik/organization/service/EmployeeExportService.java` (yeni); `EmployeeController.java` — `GET /export` eklendi; `EmployeeControllerTest.java` — 2 yeni test
- `leave/src/main/java/com/digitalik/leave/service/LeaveRequestExportService.java` (yeni); `LeaveRequestController.java` — `GET /export` eklendi; `LeaveRequestControllerTest.java` — 2 yeni test
- `payroll/src/main/java/com/digitalik/payroll/service/PayrollExportService.java` — `core.export.CsvExporter` kullanacak şekilde refactor edildi (endpoint/test değişmedi)

**Canlı doğrulama:** `docker compose down -v` + `docker compose up --build -d` İLK DENEMEDE başarıyla tamamlandı (yeni migration YOK). Çalışan oluşturulup `GET /api/organization/employees/export` → gerçek, doğru başlıklı bir CSV; `?format=xlsx` → `file` komutunun "Microsoft OOXML" olarak tanıdığı, gerçekten açılabilir bir XLSX dosyası (3464 bayt) indirildi. İzin talebi oluşturulup `GET /api/leave/requests/export?employeeId=1` → doğru CSV. Bordro step-up 2FA akışı tamamlanıp `GET /api/payroll/consolidation/export` → başlık satırı ("kayit_turu,tarih,aciklama,deger,birim") eskisiyle BİREBİR aynı doğrulandı. Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (23), auth (28), organization (75), leave (53), recruitment (39), performance (44), attendance (28), training (22), travel (18), discipline (24), feedback (32), amenities (40), payroll (12), bootstrap (1) = 439 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

## US-09.9.1 — Hassas alanların şifrelenmesi

**Özet:** `core.security.EncryptedStringConverter`/`EncryptedBigDecimalConverter` (AES-GCM) — `organization.Employee.nationalId` (TC No) ve `organization.EmployeeSalaryRecord.amount` (ücret) artık DB'de şifreli saklanıyor. Kabul kriteri: "Sütun seviyesi şifreleme uygulanır."

**Tasarım kararları:**
- **Standart RASTGELE-IV AES-GCM DEĞİL, DETERMİNİSTİK AES-GCM kullanıldı** (IV, rastgele değil, açık metin + anahtardan HMAC-SHA256 ile türetiliyor) — bu BİLİNÇLİ ve ZORUNLU bir karar: `Employee.nationalId` üzerinde hem bir DB seviyesi `UNIQUE` kısıtı HEM de `existsByNationalId`/`existsByNationalIdAndIdNot` eşitlik sorguları VAR. Standart rastgele-IV şemada aynı açık metin her seferinde FARKLI bir şifreli metin üretir — bu hem UNIQUE kısıtını hem eşitlik sorgularını sessizce anlamsız hale getirirdi (iki farklı çalışan aynı TC No ile kaydedilebilirdi). **Bilinen ödünleşim:** deterministik şifreleme, aynı açık metne sahip iki satırın şifreli halinin de aynı olacağını ima eder — bu, eşitlik sorgusu/UNIQUE kısıtı ihtiyacı olan bir alan için endüstride kabul edilen, bilinçli bir ödünleşimdir ("deterministic AEAD" deseni) ve javadoc'ta açıkça belgelendi.
- **`EncryptedBigDecimalConverter`, kendi AES-GCM mantığını TEKRARLAMIYOR** — `EncryptedStringConverter`'a delege ediyor (metne çevirip şifreler, çözüp geri `BigDecimal`'e çevirir) — DRY.
- **`amount` ŞİFRELENDİ (roadmap'in üçü de istediği TC No/IBAN/ücret listesine sadık kalındı)** — kod tabanında bu alanı DB seviyesinde toplayan/filtreleyen bir SQL sorgusu YOK (`payroll.PayrollConsolidationService` kayıtları tek tek okuyor, SUM/WHERE kullanmıyor), bu yüzden şifrelemenin gelecekteki bir agregasyon ihtiyacıyla çatışma riski yok.
- **Dönüştürücüler `@Component` olarak Spring bean'i** — Hibernate'in Spring Boot entegrasyonu `@Converter` sınıflarını Spring container'ından çözüyor, `@Value("${app.security.encryption-key}")` constructor injection'ı mümkün kılıyor.
- **Yan etki — `core.notification`'daki AYNI cascade tekrarlandı:** `EncryptedStringConverter`/`EncryptedBigDecimalConverter`, `core`'a bağımlı OLAN HER modülün izole test bağlamına component-scan ile dahil oluyor ve `app.security.encryption-key` bekliyor — bu nedenle mail config'e ek olarak AYNI 12 modülün (+ `bootstrap`'ın KENDİ, `src/main/resources/application.yml`'i test classpath'inde TAMAMEN EZEN `src/test/resources/application.yml`'i) test kaynaklarına bir test-only şifreleme anahtarı eklendi.
- **Sütun tipleri genişletildi** (`national_id VARCHAR(11)` → `VARCHAR(255)`, `amount NUMERIC(12,2)` → `VARCHAR(255)`) — şifreli (Base64: IV+ciphertext+GCM tag) değer, ham TC No/tutardan çok daha uzun. Projede henüz gerçek üretim verisi olmadığından (yalnızca seed/test verisi) basit bir tip değişikliği yeterli, karmaşık bir veri-dönüştürme migrasyonu GEREKMEDİ.

**Değişen/eklenen dosyalar:**
- `core/src/main/java/com/digitalik/core/security/EncryptedStringConverter.java`, `EncryptedBigDecimalConverter.java` (yeni)
- `core/src/test/java/com/digitalik/core/security/EncryptedStringConverterTest.java` (4 test), `EncryptedBigDecimalConverterTest.java` (3 test)
- `organization/src/main/resources/db/migration/V61__widen_national_id_and_amount_for_encryption.sql` (yeni)
- `organization/src/main/java/com/digitalik/organization/entity/Employee.java`, `EmployeeSalaryRecord.java` — `@Convert` eklendi
- `bootstrap/src/main/resources/application.yml`, `bootstrap/src/test/resources/application.yml` — `app.security.encryption-key` eklendi
- 12 modülün (`auth`, `leave`, `organization`, `recruitment`, `performance`, `attendance`, `training`, `travel`, `discipline`, `feedback`, `amenities`, `payroll`) `src/test/resources/application.yml`'i — test-only şifreleme anahtarı eklendi

**Canlı doğrulama:** `docker compose down -v` + `docker compose up --build -d` İLK DENEMEDE başarıyla tamamlandı; V61 uygulandı, Hibernate `ddl-auto: validate` hatasız (genişletilmiş VARCHAR(255) kolonları entity eşlemesiyle uyumlu). Çalışan oluşturuldu (TC No: `10000000146`) → `GET /api/organization/employees/{id}` doğru şekilde DÜZ METİN TC No döndürdü (API round-trip doğru); `psql` ile DOĞRUDAN `employees.national_id` sorgulandığında değerin Base64 şifreli metin olduğu (`1zXVb6bjyUIubnzadHZV/94X1Z1rbwMfhW8OT5qkiMTk+LzbnagW`) doğrulandı — düz metin DEĞİL. Aynı doğrulama `employee_salary_records.amount` için de yapıldı. **Kritik test:** AYNI TC No ile İKİNCİ bir çalışan oluşturulmaya çalışıldı → 409 "Bu TC Kimlik No ile kayıtlı bir çalışan zaten var." (deterministik şifrelemenin UNIQUE kısıtını/eşitlik sorgusunu koruduğunun canlı kanıtı). Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (30), auth (28), organization (75), leave (53), recruitment (39), performance (44), attendance (28), training (22), travel (18), discipline (24), feedback (32), amenities (40), payroll (12), bootstrap (1) = 446 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

## Yeni `platform` modülü + US-09.7.1 — Genel dosya saklama servisi

**Özet:** Bölüm 9'daki birkaç madde (onay motoru, dinamik alan çerçevesi, dosya saklama, virüs tarama) `core`'a girmeyecek kadar iş mantığı içeriyor ama tek bir business modülüne de ait değil — bunlar için `platform` adında TEK bir yeni modül açıldı (yalnızca `core`'a bağımlı; 4 ayrı küçük modül açıp "17→14 modül" konsolidasyonunu tekrar bozmamak için). İlk içeriği: `platform.file.FileStorageService` (US-09.7.1). Kabul kriteri: "Servis, meta veri + ikili içeriği ayrı katmanlarda tutar; mevcut modüller buna taşınır."

**Tasarım kararları:**
- **3 mevcut blob implementasyonundan (`organization.PolicyDocument`, `recruitment.Candidate.cvData`, `travel.ExpenseItem`) YALNIZCA `travel.ExpenseItem` bu servise TAŞINDI** — `PolicyDocument`'ın kendi versiyonlama mantığı ve `Candidate.cvData`'nın mevcut, test edilmiş multipart akışı bu genellemeye zorla sığdırılırsa gereksiz regresyon riski yaratırdı; `ExpenseItem` üçü içinde en basit/en az test riskli olanıydı. Bu, genellemenin GERÇEKTEN çalıştığını kanıtlayan somut bir örnek — PolicyDocument/Candidate BİLİNÇLİ OLARAK olduğu gibi bırakıldı (virüs tarama, US-09.7.2'de, yine de o ikisinin akışlarına AYRICA doğrudan entegre edilecek).
- **`travel`, `platform`'a YENİ bir tek-yönlü bağımlılık kazandı** — `payroll`'un `leave`/`attendance`/`travel`'a olan MEVCUT istisnasının AYNI deseninin bir örneği daha (bkz. `platform/pom.xml`'deki gerekçe).
- **`ExpenseItem.documentFileName`/`documentContentType`/`documentData` (3 alan) → tek bir `storedFileId` (GERÇEK bir DB FK, `stored_files(id)`'e)** — diğer modüller-arası `employeeId` gibi FK'siz referanslardan BİLİNÇLİ OLARAK FARKLI: `StoredFile` gerçekten `platform`'un sahipliğinde ve `travel` ona gerçek bir Maven bağımlılığıyla bağlı, bu yüzden gerçek bir FK anlamlı.
- **Dış API/JSON sözleşmesi HİÇ DEĞİŞMEDİ** — `ExpenseItemResponse` hâlâ `documentFileName`/`documentContentType` alanlarını taşıyor; `ExpenseItemController.toResponse` artık `ExpenseItemService.getDocument(storedFileId)` ile `StoredFile`'ı ayrıca okuyup bu alanları ORADAN dolduruyor. Mevcut 6 `ExpenseItemControllerTest` testi HİÇ DEĞİŞTİRİLMEDEN geçti — regresyon yok.
- **Migration sıralaması ÖNEMLİ:** `platform`'un `V62__create_stored_files.sql`'i, `travel`'ın `stored_file_id` FK'sini ekleyen `V63`'ünden ÖNCE gelmeli — Flyway migration'ları HANGİ modülün kaynak klasöründe olduğuna bakmaksızın TÜM modüllerin classpath'teki dosyalarını sürüm numarasına göre sıralı uyguladığından, bu sıralama numaralandırmayla garanti edildi.

**Değişen/eklenen dosyalar:**
- `platform/` (yeni modül) — `pom.xml`, `PlatformTestApplication.java`, test `application.yml` (mail+şifreleme cascade config)
- `platform/src/main/resources/db/migration/V62__create_stored_files.sql` (yeni)
- `platform/src/main/java/com/digitalik/platform/file/StoredFile.java`, `StoredFileRepository.java`, `StoredFileNotFoundException.java`, `FileStorageService.java` (yeni)
- `platform/src/test/java/com/digitalik/platform/file/FileStorageServiceTest.java` (yeni, 4 test)
- `pom.xml`, `bootstrap/pom.xml`, `Dockerfile` — `platform` girdisi eklendi
- `travel/pom.xml` — `platform` bağımlılığı eklendi
- `travel/src/main/resources/db/migration/V63__migrate_expense_item_documents_to_stored_files.sql` (yeni)
- `travel/src/main/java/com/digitalik/travel/entity/ExpenseItem.java` — 3 alan → `storedFileId`
- `travel/src/main/java/com/digitalik/travel/service/ExpenseItemService.java`, `controller/ExpenseItemController.java`, `exception/TravelExceptionHandler.java` — `FileStorageService` entegrasyonu
- `travel/src/test/java/com/digitalik/travel/TravelTestApplication.java`, `payroll/src/test/java/com/digitalik/payroll/PayrollTestApplication.java` — tarama kapsamına `com.digitalik.platform` eklendi

**Canlı doğrulama:** `docker compose down -v` + `docker compose up --build -d` İLK DENEMEDE başarıyla tamamlandı; "Migrating schema "public" to version "62 - create stored files"", "...63 - migrate expense item documents to stored files"", "Successfully applied 63 migrations". Seyahat talebi + belgeli masraf kalemi oluşturuldu (multipart, 201) → yanıt `documentFileName`/`documentContentType`'ı doğru gösterdi; `GET` listesi de aynı şekilde doğru. `psql` ile DOĞRUDAN kontrol: `expense_items` tablosunda artık `document_*` kolonları YOK, yalnızca `stored_file_id` (gerçek FK, `expense_items_stored_file_id_fkey`); `stored_files` tablosunda dosya gerçekten ayrı bir satır olarak (doğru `file_name`/`content_type`/20 baytlık içerik) duruyor. Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (30), platform (4), auth (28), organization (75), leave (53), recruitment (39), performance (44), attendance (28), training (22), travel (18), discipline (24), feedback (32), amenities (40), payroll (12), bootstrap (1) = 450 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

## US-09.7.2 — Virüs tarama (ClamAV)

**Özet:** `platform.file.VirusScanService` (+ gerçek implementasyonu `ClamAvVirusScanService`) — yüklenen TÜM dosyalar (politika dokümanı, aday CV'si, masraf belgesi) kaydedilmeden ÖNCE ClamAV ile taranıyor. Kabul kriteri: "Tarama servisi entegre edilir."

**Tasarım kararları:**
- **Herhangi bir üçüncü parti istemci kütüphanesi KULLANILMADI** — ClamAV'ın `clamd` daemon'ının "INSTREAM" TCP protokolü (4 bayt big-endian uzunluk öneki + veri parçası, sıfır-uzunluklu parça ile sonlandırma) yeterince basit olduğundan doğrudan `java.net.Socket` ile uygulandı; ekstra bağımlılık gerekmedi.
- **`VirusScanService.isInfected(byte[]): boolean`** — bilinçli olarak BASİT bir imza (bir `ScanResult` record'u DEĞİL) seçildi: bu, Mockito'nun stub'lanmamış `boolean` metotlar için varsayılan `false` dönmesi sayesinde, test ortamlarında `@MockBean`/stub bean'lerin HİÇBİR açık stub'lama olmadan "enfekte değil" davranmasını sağlıyor.
- **İki entegrasyon noktası, US-09.7.1'in taşıma kararıyla TUTARLI:** (1) `platform.file.FileStorageService.store(...)` İÇİNDE (yalnızca `travel.ExpenseItem` bunu kullanıyor) — enfekte dosya HİÇ persist edilmiyor; (2) `organization.PolicyDocumentService`/`recruitment.CandidateService`'in kendi yükleme akışlarına DOĞRUDAN çağrı (bu ikisi `FileStorageService`'e taşınmadığından). Tarama, dosya saklama kararından BAĞIMSIZ olarak PROJEDEKİ TÜM yükleme noktalarını kapsıyor.
- **Test ortamında GERÇEK ClamAV YOK** — her `<Modül>TestApplication`'a (`platform`, `travel`, `payroll`, `organization`, `recruitment`) `@Primary` bir stub `VirusScanService` bean'i (`data -> false`) eklendi. **Öğrenilen ders:** Spring, `@Primary` olmayan bean'leri de (component-scan ile bulunan gerçek `ClamAvVirusScanService` dahil) singleton context başlatılırken EAGER olarak inşa ediyor — bu yüzden `app.clamav.host`/`port`'un test config'inde de (dummy değerlerle) var olması GEREKTİ, yoksa `@Value` çözümlenemediğinden bean inşası (ve dolayısıyla TÜM context) başarısız oluyordu.
- **`docker-compose.yml`'e `clamav` servisi eklendi** — resmi `clamav/clamav:stable` imajı yalnızca `amd64` için yayınlanıyor (Apple Silicon/arm64 YOK); daha az bakımlı bir topluluk imajı yerine `platform: linux/amd64` ile Docker Desktop'ın Rosetta/QEMU emülasyonu tercih edildi. `backend`, mailpit'teki AYNI desenle yalnızca servisin BAŞLAMASINI bekliyor (`service_started`), sağlıklı olmasını DEĞİL.
- **Bu story'nin TESTİ sırasında GERÇEK bir bug bulundu ve düzeltildi:** `travel.TravelExceptionHandler`'a `InfectedFileException` eşlemesi eklenmeyi UNUTULMUŞTU (yalnızca `StoredFileNotFoundException` eklenmişti) — canlı EICAR testinde `travel` ucu 422 yerine 500 döndü; `organization`/`recruitment` uçları doğru çalışıyordu. Düzeltildi ve HER ÜÇ ucun da testi eklendi (`@MockBean VirusScanService` + `isInfected` → `true` stub'lanarak) — bu regresyon bir daha sessizce geri gelemez.

**Değişen/eklenen dosyalar:**
- `platform/src/main/java/com/digitalik/platform/file/VirusScanService.java`, `ClamAvVirusScanService.java`, `InfectedFileException.java` (yeni)
- `platform/src/main/java/com/digitalik/platform/file/FileStorageService.java` — tarama entegrasyonu
- `platform/src/test/java/com/digitalik/platform/PlatformTestApplication.java`, `travel/.../TravelTestApplication.java`, `payroll/.../PayrollTestApplication.java`, `organization/.../OrganizationTestApplication.java`, `recruitment/.../RecruitmentTestApplication.java` — `@Primary` stub `VirusScanService` bean'i
- `organization/pom.xml`, `recruitment/pom.xml` — `platform` bağımlılığı eklendi
- `organization/.../service/PolicyDocumentService.java`, `recruitment/.../service/CandidateService.java` — doğrudan tarama entegrasyonu
- `organization/.../exception/OrganizationExceptionHandler.java`, `recruitment/.../exception/RecruitmentExceptionHandler.java`, `travel/.../exception/TravelExceptionHandler.java` — `InfectedFileException` → 422 eşlemesi
- `bootstrap/src/main/resources/application.yml`, `bootstrap/src/test/resources/application.yml` — `app.clamav.host`/`port`
- 13 modülün test kaynaklarına dummy `app.clamav.host`/`port` config'i eklendi (cascade)
- `docker-compose.yml` — `clamav` servisi (+ `platform: linux/amd64`)
- `travel/.../controller/ExpenseItemControllerTest.java`, `organization/.../controller/PolicyDocumentControllerTest.java`, `recruitment/.../controller/CandidateControllerTest.java` — enfekte dosya reddi testi (3 yeni test)

**Canlı doğrulama:** `docker compose down -v` + `docker compose up --build -d` İLK DENEMEDE başarıyla tamamlandı (bu Mac'te ClamAV'ın virüs veritabanı imaja GÖMÜLÜ geldiğinden, freshclam indirmesi beklenenden HIZLI oldu — ~30 saniyede "healthy"). `docker exec` ile ClamAV'a doğrudan EICAR test dizesi verildi → "Eicar-Test-Signature FOUND" (ClamAV'ın kendisi doğru çalışıyor, sanity check). Sonra uygulamanın GERÇEK üç yükleme ucundan EICAR yüklendi: `POST /api/travel/requests/{id}/expense-items` → 422 "Dosyada virüs/kötü amaçlı içerik tespit edildi." (TravelExceptionHandler düzeltmesinden SONRA); `POST /api/documents` → AYNI 422; `POST /api/recruitment/candidates/applications` (kimliksiz uç) → AYNI 422. TEMİZ bir dosya ise normal şekilde kabul edildi (201). `psql` ile DOĞRUDAN kontrol: `stored_files`/`expense_items`/`policy_documents`/`candidates` tablolarının HİÇBİRİNDE enfekte içerik/orphan kayıt YOK — yalnızca temiz yükleme persist edildi. Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (30), platform (4), auth (28), organization (76), leave (53), recruitment (40), performance (44), attendance (28), training (22), travel (19), discipline (24), feedback (32), amenities (40), payroll (12), bootstrap (1) = 453 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

## US-09.2.1/US-09.2.2 — Onay zinciri motoru + recruitment migrasyonu

**Özet:** `platform.approval` paketi (`ApprovalChainDefinition`/`ApprovalChainStepDefinition`/`ApprovalChainInstance` + `ApprovalChainService` + admin CRUD API) — `recruitment.HiringRequest`'in GERÇEK 2 aşamalı (yönetici → İK) onay akışı buraya taşındı. Kabul kriterleri: "Motor, mevcut modüllerin davranışını bozmadan devreye alınır (kademeli geçiş)" (US-09.2.1) ve "Sistem yöneticisi olarak, yeni bir onay zincirini kod yazmadan tanımlamak istiyorum" (US-09.2.2). Bu, planın EN YÜKSEK regresyon riskli maddesiydi.

**Tasarım kararları:**
- **Mevcut 4 tek-adımlı modül (`leave`, `training`, `travel`, `amenities` — `core.approval.ApprovalStatus`/`ApprovalDecisionValidator` üzerinde) DOKUNULMADI** — zaten çalışıyorlar; yalnızca `recruitment.HiringRequest`'in GERÇEK 2 aşamalı akışı motora taşındı (roadmap'in "mevcut modüllerin... bir sonraki benzer ihtiyaç" tetikleyicisine uyan tek gerçek aday).
- **`HiringRequestService`'in KENDİ ön-doğrulama kontrolleri ve Türkçe hata mesajları ("Bu talep zaten yönetici kararına bağlanmış." vb.) BİLİNÇLİ OLARAK KORUNDU** — motora yalnızca ön-kontroller GEÇTİKTEN SONRA, gerçek durum geçişini kaydetmesi için delege ediliyor. Bu, "dış davranış hiç değişmedi" garantisini sağlıyor; motorun KENDİ savunma amaçlı istisnaları (`"Bu onay zinciri zaten sonuçlanmış."` vb.) normal akışta hiç tetiklenmiyor.
- **İKİ AŞAMALI KAYIT deseni:** `ApprovalChainInstance.subjectId`, `HiringRequest`'in kendi id'sini tutuyor — ama bu id, zincir örneği kaydedilmeden ÖNCE bilinmiyor (klasik "dairesel id referansı" sorunu). Çözüm: `subjectId` NULLABLE yapıldı, `start()` önce `null` ile kaydediyor, `HiringRequest` GERÇEK id'siyle kaydedildikten SONRA `ApprovalChainService.assignSubject(...)` ile geriye dönük dolduruluyor.
- **`HiringRequest.approvalChainInstanceId`, diğer modüller-arası `employeeId` gibi FK'siz referanslardan BİLİNÇLİ OLARAK FARKLI** — GERÇEK bir DB FK (`approval_chain_instances(id)`'e) — çünkü `recruitment` artık `platform`'a (`payroll`'un `leave`/`attendance`/`travel`'a olan AYNI tek-yönlü istisna deseniyle) GERÇEK bir Maven bağımlılığıyla bağlı.
- **US-09.2.2'nin "ekrandan yapılandırılır" kabul kriteri, yalnızca bir REST API (`POST/GET/PUT /api/platform/approval-chains`) olarak karşılandı** — hiçbir modülde henüz bir admin ekranı yok; bu, projenin Bölüm 1-8 boyunca izlediği "önce backend API, ekran sonra" deseniyle tutarlı. Uçlar `hasRole('ADMIN')` ile korunuyor.
- **`platform`'un İLK controller'ı/`@RestControllerAdvice`'ı** (`ApprovalChainDefinitionController`/`ApprovalExceptionHandler`) — `@Order(HIGHEST_PRECEDENCE)` ilk kez burada uygulandı.
- **Öğrenilen ders (tekrar):** Flyway seed migration'ı (V65, "hiring-request" zincirini seed ediyor), izole modül testlerinde (Hibernate şema otomatik üretimi kullanıyorlar, Flyway'i DEĞİL) GÖRÜNMÜYOR — `platform`'un KENDİ testleri her testte kendi geçici zincirini oluşturarak, `recruitment`'ın testleri ise `RecruitmentTestApplication`'a eklenen bir `CommandLineRunner` ile "hiring-request"i V65 ile BİREBİR aynı şekilde programatik olarak seed ederek bunu aştı.

**Değişen/eklenen dosyalar:**
- `platform/src/main/resources/db/migration/V64__create_approval_chain_tables.sql`, `V65__seed_hiring_request_approval_chain.sql` (yeni)
- `platform/src/main/java/com/digitalik/platform/approval/{ApprovalChainDefinition,ApprovalChainStepDefinition,ApprovalChainInstance,ApprovalChainInstanceStatus}.java` (entity'ler, yeni)
- `platform/src/main/java/com/digitalik/platform/approval/{*Repository,*NotFoundException}.java` (yeni)
- `platform/src/main/java/com/digitalik/platform/approval/ApprovalChainService.java` (motor), `ApprovalChainDefinitionService.java` (admin CRUD), `ApprovalChainDefinitionController.java`, `ApprovalExceptionHandler.java` (yeni)
- `platform/src/main/java/com/digitalik/platform/approval/dto/*.java` (4 DTO, yeni)
- `platform/src/test/java/com/digitalik/platform/approval/ApprovalChainServiceTest.java` (7 test), `ApprovalChainDefinitionControllerTest.java` (5 test) (yeni)
- `recruitment/src/main/resources/db/migration/V66__add_approval_chain_instance_id_to_hiring_requests.sql` (yeni)
- `recruitment/src/main/java/com/digitalik/recruitment/entity/HiringRequest.java` — `approvalChainInstanceId` alanı eklendi
- `recruitment/src/main/java/com/digitalik/recruitment/service/HiringRequestService.java` — `ApprovalChainService` entegrasyonu
- `recruitment/src/test/java/com/digitalik/recruitment/RecruitmentTestApplication.java` — "hiring-request" zincirini seed eden `CommandLineRunner`
- `recruitment/src/test/java/com/digitalik/recruitment/security/HiringRequestAccessGuardTest.java` — güncellenmiş `HiringRequest` constructor çağrıları (davranış DEĞİŞMEDİ)

**Canlı doğrulama:** `docker compose down -v` + `docker compose up --build -d` İLK DENEMEDE başarıyla tamamlandı; V64/V65/V66 uygulandı ("Successfully applied 66 migrations"), Hibernate `ddl-auto: validate` hatasız. Norm kadro tanımlanıp işe alım talebi oluşturuldu → `approval_chain_instances`'ta `subject_type='HiringRequest', subject_id=1` (İKİ AŞAMALI kayıt deseni doğru çalıştı — `assignSubject` geriye dönük doldurdu), `current_step_order=1, status=IN_PROGRESS`. Yönetici onayladı → API yanıtı `status: MANAGER_APPROVED` (DEĞİŞMEDİ), `psql` ile zincir örneği `current_step_order=2, status=IN_PROGRESS` (motor GERÇEKTEN ilerledi). İK onayladı → API `status: APPROVED`, zincir `status=APPROVED` — İKİ sistem TAM SENKRON. İKİNCİ bir talep oluşturulup yönetici REDDETTİ → API `status: REJECTED`, zincir `status=REJECTED`; AYNI talebe TEKRAR karar verilmeye çalışıldı → 400 "Bu talep zaten yönetici kararına bağlanmış." (ESKİSİYLE BİREBİR AYNI mesaj — dış davranış hiç değişmedi). Admin API: `GET /api/platform/approval-chains` → seed edilen "hiring-request" (2 adım) doğru göründü; `POST` ile YENİ, 3 adımlı bir zincir (`YONETICI→IK→ADMIN`) KOD YAZMADAN, yalnızca REST çağrısıyla tanımlandı (US-09.2.2'nin kabul kriterinin doğrudan kanıtı). Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn test   # core (30), platform (16), auth (28), organization (76), leave (53), recruitment (40), performance (44), attendance (28), training (22), travel (19), discipline (24), feedback (32), amenities (40), payroll (12), bootstrap (1) = 465 test, 0 hata
docker compose down -v
docker compose up --build -d
docker compose down
```

---

## Bölüm 9 — Ara durum notu (checkpoint)

Aşağıdaki liste, `zesty-sleeping-reef` planındaki 10 maddenin şu ana kadarki durumunu özetliyor — her tamamlanan madde için ayrıntılı gerekçe/dosya listesi zaten kendi başlığı altında yukarıda mevcut; bu not yalnızca üst düzey bir ilerleme fotoğrafı.

**Tamamlanan (9/10):**
1. ✅ **C — US-09.3.1** Merkezi bildirim/şablon servisi (`core.notification`, commit `83e96f3`)
2. ✅ **D — US-09.4.1** Merkezi CSV/Excel dışa aktarma bileşeni (`core.export`, commit `0564c8c`)
3. ✅ **I — US-09.9.1** Hassas alanların şifrelenmesi — TC No + ücret (`core.security.Encrypted*Converter`, commit `7dc226d`)
4. ✅ **`platform` modülü iskeleti** (boş pom + test app, commit `8102037`)
5. ✅ **F — US-09.7.1** Genel dosya saklama servisi (`platform.file.FileStorageService`, `travel.ExpenseItem` üzerinde kanıtlandı, commit `128d6fa`)
6. ✅ **G — US-09.7.2** ClamAV virüs tarama (3 yükleme noktasının tamamı, commit `96b51fc`)
7. ✅ **B — US-09.2.1/US-09.2.2** Onay zinciri motoru + `recruitment.HiringRequest` migrasyonu (commit `70f7817`)
8. ✅ **E — US-09.5.1** Dinamik/parametrik özel alan çerçevesi (`platform.customfield`, `organization.Employee` üzerinde kanıtlandı)
9. ✅ **H — US-09.8.1** Banka ödeme dosyası (`payroll.BankPaymentFileService`, `Employee.iban` + mod-97 `core.validation.IbanValidator`, `payroll`→`organization` yeni bağımlılık)

**Kalan (2/10, plandaki sıraya göre):**
10. ⏳ **A — US-09.1.3** TOTP tabanlı MFA — mevcut e-posta step-up akışına ALTERNATİF (silinmiyor), `dev.samstevens.totp` kütüphanesi, sır `auth.User`'da. Bağımsız/izole, herhangi bir sırada yapılabilir.
11. ⏳ **J — US-09.10.2** Zamanlanmış veritabanı yedeği — `prodrigestivill/postgres-backup-local` Docker servisi + canlı al→sıfırla→geri-yükle doğrulaması. Tamamen bağımsız, planın son maddesi.

**Kapsam dışı (roadmap gerekçesiyle, değişmedi):** US-09.1.1 (AD/LDAP), US-09.1.2 (SSO/OIDC/SAML), US-09.6.1 (audit immutability — kullanıcı onaylamadı), US-09.6.2 (merkezi log sistemi), US-09.8.2 (SGK/e-Devlet), US-09.8.3 (eski bordro taşıma), US-09.9.2 (CI SAST/SCA — kullanıcı onaylamadı). US-09.10.1 (Docker imajı) zaten tamamlanmıştı, ek iş gerekmedi.

---

## US-09.5.1 — Dinamik/parametrik özel alan çerçevesi

**Özet:** `platform.customfield` paketi — kabul kriteri: "Sistem yöneticisi olarak, kod değişikliği olmadan yeni bir alan tanımlamak istiyorum. Alan tipi (metin/sayı/tarih/seçim) parametrik tanımlanır ve ilgili formda görünür." Herhangi bir modülün varlığına (`entityType` + `entityId` üzerinden), o varlığın kendi şemasında olmayan bir alanı, kod yazmadan ekleyebilen jenerik bir EAV-lite (Entity-Attribute-Value) çerçevesi. `organization.Employee` üzerinde kanıtlandı (roadmap'in kendi örneği, FR-406).

**Tasarım kararları:**
- **`entityType` (String) + `entityId` (Long) üzerinden çalışıyor, `Employee`'ye FK YOK** — projede zaten her yerde kullanılan FK'siz modüller-arası güven sınırı deseninin AYNISI (`employeeId` gibi): `platform` hangi modülün hangi varlığına değer yazdığını bilmiyor, çağıran modül biliyor.
- **Tip fark etmeksizin TEK bir `field_value` String kolonu** (seyrek nullable kolonlar yerine) — okuma/yazma anında `CustomFieldDefinition.fieldType`'a göre yorumlanıp doğrulanıyor (NUMBER → `Double.parseDouble`, DATE → ISO `LocalDate.parse`, SELECT → virgülle ayrılmış `selectOptions` listesinde arama, TEXT → doğrulamasız). **Öğrenilen ders:** kolon adı `field_value` olmak ZORUNDA — `value`, hem H2 hem PostgreSQL'de ayrılmış (reserved) bir kelime; ilk denemede `value` kullanıldı, izole testlerde H2 syntax hatasıyla YAKALANDI, PostgreSQL'e hiç ulaşmadan düzeltildi.
- **`CustomFieldDefinitionService` (admin CRUD) ile `CustomFieldValueService` (değer okuma/yazma) AYRI sorumluluklar** — hangi alanların TANIMLI olduğu ile belirli bir kaydın DEĞERLERİ birbirinden bağımsız; `organization.EmployeeCustomFieldService` yalnızca ikinciyi `entityType="Employee"` ile sarmalıyor.
- **US-09.5.1'in "formda görünür" kabul kriteri**, hiçbir modülde henüz bir admin ekranı olmadığından, `GET .../custom-fields` ucunun bir formun render edebileceği HER ŞEYİ (alan adı/tipi/seçenekler/zorunluluk) döndürmesiyle karşılandı — Bölüm 1-8'in "önce backend API, ekran sonra" deseniyle tutarlı.
- **`platform.customfield`, `platform.approval`'ın KENDİ `@RestControllerAdvice`'ına (`ApprovalExceptionHandler`) İHTİYAÇ DUYMUYOR** — onun `basePackageClasses` kapsamı yalnızca `approval` paketini kapsıyor; kardeş paket `customfield` için AYRI, minimal bir `CustomFieldExceptionHandler` (yalnızca `AuthorizationDeniedException`→403) eklendi — `@Order(HIGHEST_PRECEDENCE)` yine zorunlu.
- **`organization`'ın `PUT .../custom-fields` ucu, `EmployeeController`'ın diğer PUT uçlarıyla TUTARLI olarak rol kısıtlaması OLMADAN bırakıldı**; `GET` ise `getProfile`'daki AYNI `EmployeeAccessGuard` ile korunuyor (kişisel veri).

**Değişen/eklenen dosyalar:**
- `platform/src/main/resources/db/migration/V67__create_custom_field_tables.sql` (yeni) — `custom_field_definitions`, `custom_field_values`
- `platform/src/main/java/com/digitalik/platform/customfield/{CustomFieldType,CustomFieldDefinition,CustomFieldValue}.java` (yeni)
- `platform/src/main/java/com/digitalik/platform/customfield/{*Repository,CustomFieldDefinitionService,CustomFieldValueService,CustomFieldDefinitionController,CustomFieldExceptionHandler}.java` (yeni)
- `platform/src/main/java/com/digitalik/platform/customfield/dto/*.java` (3 DTO, yeni)
- `platform/src/test/java/com/digitalik/platform/customfield/{CustomFieldValueServiceTest,CustomFieldDefinitionControllerTest}.java` (8+4 test, yeni)
- `organization/src/main/java/com/digitalik/organization/service/EmployeeCustomFieldService.java`, `controller/EmployeeCustomFieldController.java` (yeni)
- `organization/src/test/java/com/digitalik/organization/controller/EmployeeCustomFieldControllerTest.java` (4 test, yeni)

**Canlı doğrulama:** `docker compose down -v` + `docker compose up --build -d` İLK DENEMEDE tamamlandı; V67 uygulandı ("Successfully applied 67 migrations"). Admin token ile: `GET /api/platform/custom-fields?entityType=Employee` → `[]` (henüz tanımsız); token OLMADAN aynı istek → 401. `POST` ile SELECT tipi "seviye" (A1-C2) ve TEXT tipi "notlar" alanları KOD YAZMADAN tanımlandı. Yeni bir çalışan oluşturulup `GET /api/organization/employees/{id}/custom-fields` → iki tanımlı alan, `value: null`. Geçersiz seçim değeri ("Z9") ile `PUT` → 400 "seviye geçerli bir seçenek değil."; geçerli değerlerle (`seviye: B2`, `notlar: ...`) `PUT` → 200, tekrar `GET` ile DEĞERLERİN KALICI olduğu doğrulandı (upsert çalıştı). Olmayan çalışan (999999) için `GET` → 404 "Çalışan bulunamadı." Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn -pl platform,organization -am test   # organization 76→80 (+4), platform +12 (customfield)
mvn test   # tam reactor, BUILD SUCCESS, sıfır regresyon
docker compose down -v
docker compose up --build -d
docker compose down
```

---

## US-09.8.1 — Banka ödeme dosyası

**Özet:** `payroll.BankPaymentFileService` — kabul kriteri: "Sistem, onaylanmış bordro verisinden banka ödeme dosyası üretir." `GET /api/payroll/bank-payment-file?year=&month=`, her çalışanın IBAN'ı ve o dönemde geçerli ücretiyle `calisan_id,iban,tutar,aciklama` sütunlu bir CSV üretir. Gerçek bir banka XML standardı (ISO 20022 vb.) YOK — `PayrollExportService`'teki AYNI "basit CSV" hassasiyeti korundu.

**Tasarım kararları:**
- **`iban`, `organization.EmployeeSalaryRecord`'a DEĞİL `organization.Employee`'ye eklendi** — plandaki ilk taslağın aksine: IBAN, çalışanın GÜNCEL/tekil banka hesabıdır, `EmployeeSalaryRecord`'un salt-ekleme/değişmez (append-only/immutable) geçmiş semantiğine (bkz. o entity'nin javadoc'u) uymaz; bir banka hesabı değişikliğini "yeni bir ücret olayı" gibi modellemek yanlış olurdu. Ayrı bir uç (`PUT /{id}/iban`), temel bilgi güncellemesinden (`PUT /{id}`) BİLİNÇLİ OLARAK AYRI tutuldu — banka hesabı değişikliği ile ad/TC No güncellemesi ayrı kaygılar.
- **`iban`, US-09.9.1'in ÖNCEDEN VERDİĞİ SÖZE sadık kalınarak ANINDA şifrelendi** (`EncryptedStringConverter`) — o story'nin log girdisi "roadmap'in üçü de istediği TC No/IBAN/ücret" diyordu; IBAN alanı o an henüz yoktu, burada eklenirken şifrelemesi de birlikte geldi.
- **`core.validation.IbanValidator`** — ISO 13616 mod-97 kontrol basamağı, saf algoritma (harici SWIFT/banka çağrısı YOK) — `BigInteger` ile hesaplanıyor (26+ haneli sayılar `long`'a sığmaz). `core.approval.ApprovalStatus`'la AYNI gerekçeyle `core`'da (iş mantığı içermeyen genel amaçlı yardımcı).
- **`payroll`, `organization`'a YENİ tek-yönlü bağımlılık kazandı** — `leave`/`attendance`/`travel`'a olan mevcut istisnanın (US-08D.1.2) AYNI, kullanıcıyla önceden kararlaştırılan deseni; `payroll/pom.xml`'in açıklaması bunu yansıtacak şekilde güncellendi.
- **Her çalışan için, dönemin SON gününe kadar yürürlüğe girmiş EN SON `EmployeeSalaryRecord` kullanılır** (`effectiveDate <= YearMonth.atEndOfMonth()`) — "o dönemde geçerli olan ücret" semantiği; sonraki bir zam/ücret değişikliği yanlışlıkla geçmiş bir döneme sızmaz (canlıda doğrulandı — bkz. aşağıda).
- **IBAN'ı OLMAYAN veya o döneme kadar hiç ücret kaydı OLMAYAN çalışanlar dosyaya DAHİL EDİLMEZ** (sessizce atlanır, hata FIRLATILMAZ) — ödenecek bir hesap/tutar yoksa satır üretmenin anlamı yok; roadmap'in "basit CSV" felsefesiyle tutarlı.
- **`/api/payroll/bank-payment-file`, `auth.PayrollStepUpFilter`'ın (US-08D.1.4) 2FA gereksinimine EK KOD OLMADAN otomatik dahil oldu** — filtre `/api/payroll/**` önekini sabit kodluyor; canlıda doğrulandı (aşağıya bkz.).
- **Rol kısıtlaması eklenmedi** — `PayrollConsolidationController`'daki AYNI gerekçe (kabul kriteri bundan bahsetmiyor).

**Değişen/eklenen dosyalar:**
- `core/src/main/java/com/digitalik/core/validation/IbanValidator.java` (yeni); `core/src/test/java/com/digitalik/core/validation/IbanValidatorTest.java` (5 test)
- `organization/src/main/resources/db/migration/V68__add_iban_to_employees.sql` (yeni)
- `organization/src/main/java/com/digitalik/organization/entity/Employee.java` — `iban` alanı (`@Convert(EncryptedStringConverter)`), `updateIban`
- `organization/src/main/java/com/digitalik/organization/service/EmployeeService.java` — `updateIban(id, iban)`
- `organization/src/main/java/com/digitalik/organization/dto/UpdateIbanRequest.java` (yeni); `EmployeeResponse.java` — `iban` alanı eklendi
- `organization/src/main/java/com/digitalik/organization/controller/EmployeeController.java` — `PUT /{id}/iban`
- `organization/src/test/java/com/digitalik/organization/controller/EmployeeControllerTest.java` — 2 yeni test
- `payroll/pom.xml` — `organization` bağımlılığı; `payroll/src/test/java/com/digitalik/payroll/PayrollTestApplication.java` — tarama kapsamına `com.digitalik.organization` eklendi
- `payroll/src/main/java/com/digitalik/payroll/service/BankPaymentFileService.java`, `controller/BankPaymentFileController.java` (yeni)
- `payroll/src/test/java/com/digitalik/payroll/controller/BankPaymentFileControllerTest.java` (3 test, yeni)

**Canlı doğrulama:** `docker compose down -v` + `docker compose up --build -d` İLK DENEMEDE tamamlandı; V68 uygulandı ("Successfully applied 68 migrations"). **2FA entegrasyonu:** step-up doğrulanmamış bir oturumla `GET /api/payroll/bank-payment-file` → 403 "Bu modüle erişim için ek doğrulama (2FA) gereklidir." (US-08D.1.4'ün filtresi hiçbir yeni kod olmadan otomatik uygulandı); mailpit üzerinden kod alınıp `POST /api/auth/payroll-access/verify` ile doğrulandıktan SONRA aynı uç → 200. Çalışan oluşturulup IBAN atandı, ücret kaydı eklendi (42000.00) → `GET .../bank-payment-file?year=2026&month=1` → `1,TR330006100519786457841326,42000.00,2026-01 bordro ödemesi` doğru satırı üretti. Geçersiz kontrol basamaklı bir IBAN (`TR000000000000000000000000`) ile `PUT .../iban` → 400 "IBAN geçersiz." **Şifreleme doğrulaması:** `psql` ile DOĞRUDAN `employees.iban` sorgulandığında Base64 şifreli metin (`WnQGX8jQH7WnfkK55IafBFC5lpHaWDsBgESQVKWTROwl2maPlkfh0+W+OHeKLLQ91+AeoJKw`) görüldü — düz metin DEĞİL. Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn -pl core,organization,payroll -am test
mvn test   # tam reactor, BUILD SUCCESS, sıfır regresyon
docker compose down -v
docker compose up --build -d
docker compose down
```

---

## US-09.1.3 — TOTP tabanlı MFA

**Özet:** `auth.service.TotpService` + `User.totpSecret/totpEnabled` — kabul kriteri: "TOTP kaydı yapılabilir; onaylı kod ile bordro erişimi yükseltilebilir." Mevcut e-posta step-up akışına (US-08D.1.4) EK bir ALTERNATİF doğrulama yolu — e-posta kodu akışı hiç DEĞİŞMEDİ/SİLİNMEDİ, TOTP yeni bir seçenek olarak eklendi. Roadmap'in AD/LDAP/SSO'ya (US-09.1.1/09.1.2) resmi bağımlılığı BİLİNÇLİ OLARAK görmezden gelinip, bağımsız/self-hosted olarak yapıldı (kullanıcıyla AskUserQuestion ile mutabık kalınan kapsam kararı).

**Tasarım kararları:**
- **`dev.samstevens.totp:totp:1.7.1`** — RFC 6238, Google Authenticator/Authy uyumlu, küçük/bağımsız/MIT lisanslı. Yalnızca `SecretGenerator`/`CodeVerifier` (HMAC/zaman-penceresi mantığı) kullanıldı; QR GÖRSELİ üretimi (kütüphanenin zxing'e dayanan kısmı) BİLİNÇLİ OLARAK kullanılmadı — `otpauth://` URI'si (`TotpService.buildOtpAuthUri`) elle üretiliyor, projenin "önce backend API, ekran sonra" deseniyle tutarlı (henüz hiçbir modülde admin/kullanıcı ekranı yok; ilerideki bir frontend bu URI'den kendi QR'ını üretebilir).
- **Sır (`totpSecret`), `Session`'da DEĞİL `auth.entity.User`'da** — `Session.stepUpCode`'un AKSİNE kalıcı olmalı: oturum logout'ta silinir, ama TOTP kaydı KALICI olmalı (bir kullanıcı authenticator uygulamasına telefonuna EKLEDİĞİ sırrı, her girişte yeniden kaydetmek zorunda kalmamalı).
- **İki aşamalı durum: `totpEnabled=false` + `totpSecret != null` = "kayıt BAŞLATILDI ama henüz DOĞRULANMADI"** — `User.enrollTotp(secret)` yalnızca sırrı kaydeder, `User.confirmTotp()` (İLK kod başarıyla doğrulandığında) `totpEnabled=true` yapar. Bu ayrım, kullanıcının authenticator'a EKLEMEDEN (ör. QR'ı hiç okutmadan) TOTP'yi "aktif" saymasını ENGELLER.
- **`SessionService.markStepUpVerified(token)` (yeni, kod PARAMETRESİ YOK)** — `verifyStepUp(token, code)`'un (e-posta yolu, `Session.stepUpCode` alanlarını kontrol eder) AKSİNE, TOTP kodunun doğruluğu `AuthService` tarafından ÖNCEDEN kontrol edilmiş olduğundan bu metot yalnızca oturumu "yükseltir" — iki yol da AYNI `Session.markStepUpVerified()`'a çıkar, `auth.security.PayrollStepUpFilter` HİÇ DEĞİŞMEDİ (yalnızca `session.isStepUpVerified()`'a bakıyor, HANGİ yöntemle doğrulandığını umursamıyor) — kabul kriterinin ("mevcut mekanizmayı bozmadan") doğrudan kanıtı.
- **`POST /api/auth/mfa/enroll`, `POST /api/auth/mfa/enroll/confirm`, `POST /api/auth/payroll-access/verify-totp`** — üçü de `@AuthenticationPrincipal AuthenticatedUser`'dan token/userId alıyor, `AuthController`'ın diğer uçlarıyla AYNI desen.

**Değişen/eklenen dosyalar:**
- `auth/pom.xml` — `dev.samstevens.totp:totp:1.7.1` bağımlılığı
- `auth/src/main/resources/db/migration/V69__add_totp_fields_to_users.sql` (yeni)
- `auth/src/main/java/com/digitalik/auth/entity/User.java` — `totpSecret`/`totpEnabled`/`totpEnrolledAt`, `enrollTotp`/`confirmTotp`
- `auth/src/main/java/com/digitalik/auth/service/TotpService.java` (yeni)
- `auth/src/main/java/com/digitalik/auth/service/SessionService.java` — `markStepUpVerified(token)` (yeni)
- `auth/src/main/java/com/digitalik/auth/service/AuthService.java` — `enrollMfa`, `confirmMfaEnrollment`, `verifyPayrollAccessTotp`
- `auth/src/main/java/com/digitalik/auth/dto/MfaEnrollResponse.java`, `ConfirmMfaRequest.java` (yeni)
- `auth/src/main/java/com/digitalik/auth/controller/AuthController.java` — 3 yeni uç
- `auth/src/test/java/com/digitalik/auth/service/TotpServiceTest.java` (6 test, yeni)
- `auth/src/test/java/com/digitalik/auth/controller/AuthControllerTest.java` — 3 yeni test (kayıt+onay+bordro erişimi, yanlış kod, kayıtsız erişim denemesi)

**Canlı doğrulama:** `docker compose down -v` + `docker compose up --build -d` İLK DENEMEDE tamamlandı; V69 uygulandı ("Successfully applied 69 migrations"). `POST /api/auth/mfa/enroll` → sır + `otpauth://totp/...` URI'si döndü; yanlış kodla (`000000`) `POST .../enroll/confirm` → 400 "Doğrulama kodu hatalı."; sırdan RFC 6238 ile hesaplanan GÜNCEL kodla (elle yazılmış bir Python TOTP üreticisiyle — gerçek bir authenticator uygulamasının yapacağı AYNI hesaplama) → 204, `psql` ile `users.totp_enabled=t` doğrulandı. **2FA alternatif-yol kanıtı:** step-up doğrulanmamış oturumla `GET /api/payroll/bank-payment-file` → 403; e-posta kodu akışına HİÇ DOKUNMADAN, doğrudan `POST /api/auth/payroll-access/verify-totp` (güncel TOTP koduyla) → 204; aynı uç → 200 (ERİŞİM YÜKSELTİLDİ). Sonra durduruldu.

**Çalıştırma komutları:**
```bash
mvn -pl auth -am test
mvn test   # tam reactor, BUILD SUCCESS, sıfır regresyon
docker compose down -v
docker compose up --build -d
docker compose down
```

---

## US-09.10.2 — Zamanlanmış veritabanı yedeği

**Özet:** `docker-compose.yml`'e yeni `postgres-backup` servisi (`prodrigestivill/postgres-backup-local:16-alpine`) — kabul kriteri: "Sistem, veritabanının düzenli aralıklarla yedeklenmesini sağlar." Sıfırdan script yazmak yerine bu iş için özel yapılmış, ücretsiz/açık kaynak, self-hosted bir Docker imajı kullanıldı — bulut depolama/ücretli bir servis YOK.

**Tasarım kararları:**
- **`SCHEDULE: "@daily"`** — go-cron formatı, her gün 02:00 UTC'de otomatik yedek alır; `BACKUP_KEEP_DAYS=7`/`WEEKS=4`/`MONTHS=6` ile basit bir retention politikası (imajın kendi go-cron zamanlayıcısı, ek bir cron kurulumu GEREKMİYOR).
- **`postgres_backups`, `postgres_data`'dan AYRI bir Docker volume** — yedekler, üzerine yazıldığı asıl veri diskinden fiziksel olarak bağımsız (aynı diskin bozulması ikisini birden götürmesin diye bilinçli ayrım — gerçek bir üretim ortamında bu ayrıca uzak bir depolamaya senkronize edilir, ama bu proje kapsamında yerel bir volume yeterli).
- **`depends_on: postgres (service_healthy)`** — `mailpit`/`clamav`'daki `service_started` deseninden BİLİNÇLİ OLARAK farklı: yedekleme servisinin `pg_dump` çalıştırabilmesi için Postgres'in GERÇEKTEN hazır (yalnızca başlamış değil) olması gerekiyor.
- **Manuel tetikleme, imajın KENDİ script'leriyle** (`/backup.sh`, `/restore.sh`) — projeye özel bir yedekleme/geri yükleme kodu YAZILMADI, kanıtlanmış, bakımlı bir araç kullanıldı (canlı doğrulamada ikisi de gerçekten çalıştırıldı, aşağıya bkz.).

**Değişen dosyalar:**
- `docker-compose.yml` — `postgres-backup` servisi + `postgres_backups` volume'ü (yeni)

**Canlı doğrulama (bu projenin köklü "her story Docker'da canlı doğrulanır" disiplinine uygun, GERÇEK bir yedek al→sıfırla→geri yükle döngüsü):**
1. `docker compose down -v` + `docker compose up --build -d` İLK DENEMEDE tamamlandı; `postgres-backup` konteyneri "new cron: @daily" ile başladı.
2. Bir çalışan oluşturuldu (`id=1`, "Yedek Testi").
3. `docker exec ... /backup.sh` → "SQL backup created successfully"; `/backups/last/dijitalik-latest.sql.gz` dosyası GERÇEKTEN oluştu (13867 bayt).
4. **Gerçek veri kaybı simülasyonu:** `dijitalik` veritabanı `psql` ile DOĞRUDAN `DROP DATABASE` + boş `CREATE DATABASE` edildi (yalnızca bir tablo silmek değil, TÜM şemanın kaybı) — `\dt` ile "Did not find any relations" doğrulandı (gerçekten boş).
5. **Geri yükleme:** `gunzip -c .../dijitalik-latest.sql.gz | psql -h postgres -U dijitalik -d dijitalik` → tüm tablolar/veri yeniden oluşturuldu.
6. **Kanıt:** `psql` ile DOĞRUDAN `SELECT * FROM employees` → `id=1, "Yedek Testi"` GERİ GELDİ; AYRICA yedekten ÖNCE alınmış bir oturum token'ıyla `GET /api/organization/employees/1` → 200, AYNI çalışan verisi (backend'in kendisi HİÇBİR ŞEY yeniden oluşturmadı — `sessions` tablosu da dahil TÜM veri yedekten geldi, oturum token'ı bile hâlâ geçerliydi).
7. Sonra durduruldu.

**Çalıştırma komutları:**
```bash
docker compose down -v
docker compose up --build -d
docker exec bkm-dijital-ik-platformu-postgres-backup-1 /backup.sh
docker exec bkm-dijital-ik-platformu-postgres-1 psql -U dijitalik -d postgres -c "DROP DATABASE dijitalik;"
docker exec bkm-dijital-ik-platformu-postgres-1 psql -U dijitalik -d postgres -c "CREATE DATABASE dijitalik OWNER dijitalik;"
docker exec bkm-dijital-ik-platformu-postgres-backup-1 sh -c \
  "gunzip -c /backups/last/dijitalik-latest.sql.gz | PGPASSWORD=dijitalik psql -h postgres -U dijitalik -d dijitalik"
docker compose down
```

---

## Bölüm 9 tamamlandı — Kurumsal Entegrasyonlar ve Altyapı

Plandaki 10 maddenin (C, D, I, platform modülü iskeleti, F, G, B, E, H, A, J) TAMAMI bitti — Bölüm 9, kullanıcının "gerçek kurumsal servis/satın alma gerektirenleri atla, mimariyi güçlendiren her şeyi yap" talimatı doğrultusunda tamamlandı. Kapsam dışı bırakılanlar (roadmap gerekçesiyle veya kullanıcı onayıyla): US-09.1.1 (AD/LDAP), US-09.1.2 (SSO/OIDC/SAML), US-09.6.1 (audit immutability), US-09.6.2 (merkezi log sistemi), US-09.8.2 (SGK/e-Devlet), US-09.8.3 (eski bordro taşıma), US-09.9.2 (CI SAST/SCA). US-09.10.1 (Docker imajı) zaten tamamlanmıştı.

Her madde ayrı commit'le, `mvn test` (modül + tam reactor) ve canlı Docker doğrulamasıyla teslim edildi — toplamda platform modülü sıfırdan açıldı (14→15 modül), 4 modül (`organization`, `recruitment`, `travel`, `payroll`) ona veya birbirine yeni tek-yönlü Maven bağımlılıkları kazandı, ve roadmap'in geri kalan bölümlerinde (1-8) tekrarlanan gerçek ihtiyaçlar (bildirim, dışa aktarma, dosya saklama, onay akışı) genelleştirildi.

---

## Proje yapısı — backend `backend/` altına taşındı

**Özet:** Bir User Story değil, yapısal bir düzenleme: tüm Maven modülleri (`core`, `platform`, `auth`, `organization`, `leave`, `recruitment`, `performance`, `attendance`, `training`, `travel`, `discipline`, `feedback`, `amenities`, `payroll`, `bootstrap`) + kök `pom.xml` + `Dockerfile` + `.dockerignore`, repo köküne dağılmış haldeyken `backend/` altına taşındı — `frontend/`'in zaten sahip olduğu izolasyonun AYNISI backend için de kuruldu (kullanıcı isteği: "proje çok dağınık gözüküyor, backend'i de frontend gibi kendi klasöründe yapabilir miyiz").

**Değişen/eklenen dosyalar:**
- 15 Maven modülü + `pom.xml` + `Dockerfile` + `.dockerignore` → `git mv` ile `backend/` altına taşındı (geçmiş korunarak)
- `docker-compose.yml` — `backend.build.context: .` → `./backend`
- `backend/Dockerfile` — İÇERİK DEĞİŞMEDİ (COPY yolları zaten build context'e göre relative, context modülle birlikte taşındığından ayrı bir düzeltme GEREKMEDİ)
- `backend/.dockerignore` — artık yalnızca `backend/` bağlamına ait olduğundan sadeleştirildi (`frontend/`, `docs/`, `.claude/`, `.git/` satırları kaldırıldı — bunlar zaten yeni build context'in DIŞINDA)
- Kök `.gitignore` — değişiklik GEREKMEDİ (`target/` gibi desenler baştan `/` olmadığından her derinlikte eşleşiyor)

**Canlı doğrulama:** `mvn clean` (eski `target/` dizinleri temizlendi) → `backend/`'den `mvn test` → **tüm 15 modül + aggregator BUILD SUCCESS, sıfır regresyon**. `docker compose build backend` (yeni context `./backend`) → aynı image hash'i üretti (içerik byte-birebir taşındığının kanıtı, layer cache tam isabet). `docker compose up -d` → tüm servisler (postgres, backend, frontend, mailpit, clamav, postgres-backup) sağlıklı ayağa kalktı; `curl` ile `POST /api/auth/login` → 200, `GET http://localhost:3000/` → 200. Frontend'in tam Playwright E2E paketi (`npx playwright test`, 64 test) yeniden konumlandırılmış backend container'ına karşı çalıştırıldı → **54 geçti, 10 viewport-bağımlı skip, 0 hata**. Sonra `docker compose down`.

**Çalıştırma komutları:**
```bash
cd backend
mvn test    # tam reactor
docker compose build backend   # repo kökünden
docker compose up -d
docker compose down
```
