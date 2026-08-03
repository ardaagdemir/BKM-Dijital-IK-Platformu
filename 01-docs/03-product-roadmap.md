# Dijital İnsan Kaynakları Platformu — Ürün Yol Haritası (Backlog)

**Girdi:** `01-master-requirements.md` (teknik şartnameden türetilmiş FR/NFR/SEC/INT/OPS kimlikleri, artık sözleşme değil **ilham kaynağı** olarak kullanılır), `02-solution-architecture.md` (modül/bileşen kavramları — faz/takvim içerikleri bu dokümanda geçersizdir).
**Proje niteliği:** Bu artık bir ihale teslim projesi değil. Tek geliştirici tarafından, yapay zekâ desteğiyle geliştirilecek, teknik şartnameden ilham alan uzun vadeli bir İK ürünüdür. Kod, veritabanı şeması veya API sözleşmesi bu dokümanda üretilmemiştir.

---

## 0. Yaklaşım ve İlkeler

### 0.1 Ne değişti?

Önceki backlog (`03-product-backlog.md`), 180 günlük bir ihale teslimatını, sabit ekip/efor varsayımlarını ve "önce platform, sonra modül" sırasını esas alıyordu. Bu doküman onun yerini alır ve şu ilkelerle yeniden kurulmuştur:

- **Gün/sprint/faz yok.** Hiçbir bölümde 90/180 gün, sprint tarihi veya takvim referansı bulunmaz.
- **Kişi-gün/ekip hesabı yok.** Efor tahmini yapılmaz; tek geliştirici + AI çiftinin hızı zaten değişkendir ve önceden tahmin edilebilir değildir.
- **Hakediş/ihale önceliği yok.** Modül sırası, sözleşme ödeme yüzdesine değil, **ürünün gerçek anlamda çalışır hale gelme sırasına** göredir.
- **Dikey dilim (vertical slice) önceliği.** Her bölüm, uçtan uca çalışan, gerçek bir kullanıcı akışını tamamlayan küçük parçalara bölünmüştür. Bir özelliğin "arkasındaki" genel altyapı, yalnızca o özellik gerçekten var olduktan sonra genelleştirilir.
- **Erken genelleştirme yasak (YAGNI).** Workflow/onay motoru, dinamik form çerçevesi, merkezi raporlama ve entegrasyon altyapısı gibi "platform" kavramları **Bölüm 9'a** ertelenmiştir. İlk ihtiyaç ortaya çıktığında (ör. izin onayı) o ihtiyaca **özel, küçük** bir çözüm yazılır; ikinci/üçüncü benzer ihtiyaç gerçekten ortaya çıkınca genelleştirme değerlendirilir. Her bölümde bu tetikleyici noktalar ayrıca not edilmiştir.

### 0.2 Bölüm sırası ve mantığı

| # | Bölüm | Neden bu sırada? |
|---|---|---|
| 1 | Proje Temeli | Hiçbir özellik bir iskelet/veritabanı/derleme hattı olmadan yazılamaz |
| 2 | Kullanıcı Girişi ve Yetkilendirme | Her ekran bir oturum gerektirir |
| 3 | Organizasyon ve Çalışan Yönetimi | Tüm İK verisinin çekirdek referansı; ilk gerçek dikey dilim burada tamamlanır |
| 4 | İzin Yönetimi | En basit uçtan uca iş süreci; ilk kez bir onay adımı gerektirir |
| 5 | İşe Alım | Norm kadro + aday süreci; ikinci onay ihtiyacı burada belirginleşir |
| 6 | Performans | Organizasyon ve çalışan verisine bağımlı, göreli olarak izole bir süreç |
| 7 | PDKS ve Zaman Yönetimi | İlk dış sistem entegrasyon ihtiyacı burada ortaya çıkar |
| 8 | Diğer Modüller | Düşük karşılıklı bağımlılığa sahip, birbirinden bağımsız geliştirilebilecek modüller |
| 9 | Kurumsal Entegrasyonlar ve Altyapı | Genelleştirme — yalnızca gerçek ihtiyaç birikince ele alınır |

### 0.3 İlk çalışır hedef (MVP dikey dilimi)

> **Kullanıcı giriş yapar → çalışan oluşturur → organizasyon birimine atar → çalışanı listeler → audit kaydı oluşur.**

Bu akış, Bölüm 1 (temel), Bölüm 2 (giriş) ve Bölüm 3'ün (organizasyon + çalışan) ilk story'lerinin toplamıdır. Aşağıdaki story'ler tamamlandığında bu hedef karşılanmış olur: `US-01.1.1 – US-01.1.4`, `US-01.3.1`, `US-02.1.1 – US-02.1.3`, `US-03.1.1 – US-03.1.2`, `US-03.2.1 – US-03.2.4`. Bu, projede yazılacak **ilk** kod olmalıdır; başka hiçbir özellik bundan önce ele alınmamalıdır.

### 0.4 Notasyon

- **Epic:** Bölümün kendisi veya bölüm içindeki büyük iş alanı (`EPIC-0X`).
- **Feature:** Epic altında, tek başına anlamlı bir alt yetenek (`EPIC-0X.Y`).
- **User Story:** Küçük, bağımsız yürütülebilir, tek oturuşta tamamlanabilecek iş parçası (`US-0X.Y.Z`).
- **Requirement ID:** `01-master-requirements.md`'deki FR/NFR/SEC/INT/OPS kimliğine izlenebilirlik içindir — artık sözleşmesel yükümlülük değil, tasarım referansıdır.

---

## 1. Proje Temeli

**Amaç:** Herhangi bir özelliğin yazılabilmesi için gereken minimum iskelet. Burada hiçbir iş kuralı yoktur — yalnızca "çalışan boş bir uygulama".
**Bağımlılık:** Yok.

### EPIC-01 — Proje Temeli

#### Feature 01.1 — Uygulama İskeleti

| ID | User Story | Kabul Kriterleri | Bağımlılık | Requirement ID |
|---|---|---|---|---|
| US-01.1.1 | Geliştirici olarak, backend için modüler paket yapısına sahip bir Spring Boot projesi başlatmak istiyorum. | Proje derlenir ve çalışır; paket yapısı ileride modül sınırlarını yansıtacak şekilde (ör. `hr.core`, `hr.employee`) baştan ayrılmıştır; henüz modül-arası sınır zorlaması (ArchUnit vb.) kurulmamıştır — ihtiyaç doğunca eklenir. | Yok | NFR-001 |
| US-01.1.2 | Geliştirici olarak, frontend için React + TypeScript projesi başlatmak istiyorum. | Proje derlenir, boş bir ana sayfa açılır; component kütüphanesi seçilmiştir (ör. MUI/Ant Design). | Yok | FR-001 |
| US-01.1.3 | Geliştirici olarak, PostgreSQL'e bağlanan ve Flyway ile migration çalıştıran bir backend istiyorum. | İlk migration (boş şema) başarıyla uygulanır; bağlantı bilgisi ortam değişkeninden okunur. | US-01.1.1 | DEP-003 |
| US-01.1.4 | Geliştirici olarak, Docker Compose ile backend+frontend+PostgreSQL'i tek komutla ayağa kaldırmak istiyorum. | `docker compose up` sonrası uygulama tarayıcıdan erişilebilir durumdadır. | US-01.1.1, US-01.1.2, US-01.1.3 | DEP-001, DEP-004 |

#### Feature 01.2 — Temel Konvansiyonlar

| ID | User Story | Kabul Kriterleri | Bağımlılık | Requirement ID |
|---|---|---|---|---|
| US-01.2.1 | Geliştirici olarak, tüm varlıklar için ortak taban alanlar (id, oluşturulma/güncellenme zamanı, oluşturan/güncelleyen kullanıcı) istiyorum. | Yeni bir varlık bu taban sınıfı miras aldığında alanlar otomatik doldurulur. | US-01.1.3 | — |
| US-01.2.2 | Geliştirici olarak, tutarlı bir hata/response formatı (ör. RFC 7807 ProblemDetail) istiyorum. | API hataları tek bir standart JSON yapısıyla döner; frontend bu yapıyı tek bir yerde işler. | US-01.1.1 | — |

#### Feature 01.3 — Minimal Audit Kaydı

> **Not (YAGNI):** Bu, Bölüm 9'daki "Merkezi Audit ve Uyum Logu" ile **aynı şey değildir**. Burada yalnızca ilk hedef akışının ("çalışan oluştur → audit kaydı oluşur") gerektirdiği kadar basit bir kayıt mekanizması kurulur. Değişmezlik garantisi, hash-zinciri, Splunk/Humio aktarımı gibi kurumsal gereksinimler gerçek ihtiyaç (çok modüllü, denetime tabi bir ürün) belirginleştiğinde Bölüm 9'da ele alınır.

| ID | User Story | Kabul Kriterleri | Bağımlılık | Requirement ID |
|---|---|---|---|---|
| US-01.3.1 | Geliştirici olarak, bir kaydın kim tarafından, ne zaman, hangi işlemle (oluşturma/güncelleme) değiştirildiğini basit bir `audit_log` tablosunda tutmak istiyorum. | Create/update işlemlerinde tablo, kullanıcı+zaman+varlık türü+varlık id+işlem tipi ile bir satır alır; henüz önce/sonra değer diff'i veya merkezi arayüz yoktur. | US-01.2.1 | OPS-001 |

---

## 2. Kullanıcı Girişi ve Yetkilendirme

**Amaç:** Bir kullanıcının sisteme girip, yalnızca yetkili olduğu ekranları/işlemleri yapabilmesi. Kurumsal AD/LDAP/SSO/MFA entegrasyonu burada **yoktur** — bkz. Bölüm 9.1; ilk sürüm yerel (uygulama içi) kullanıcı ve basit rol modeliyle çalışır.
**Bağımlılık:** Bölüm 1.

### EPIC-02 — Kullanıcı Girişi ve Yetkilendirme

#### Feature 02.1 — Basit Kullanıcı Girişi

| ID | User Story | Kabul Kriterleri | Bağımlılık | Requirement ID |
|---|---|---|---|---|
| US-02.1.1 | Kullanıcı olarak, e-posta ve parolamla giriş yapmak istiyorum. | Doğru bilgiyle giriş başarılı; yanlış bilgiyle anlaşılır hata döner. | US-01.1.1, US-01.1.3 | SEC-004 |
| US-02.1.2 | Sistem olarak, parolaları geri döndürülemez şekilde (hash) saklamak istiyorum. | Veritabanında düz metin parola bulunmaz. | US-02.1.1 | SEC-002 |
| US-02.1.3 | Kullanıcı olarak, giriş yaptıktan sonra oturumumun (token/session) korunmasını ve çıkış yapabilmemi istiyorum. | Token/session süresi dolunca yeniden giriş istenir; çıkış işlemi oturumu geçersiz kılar. | US-02.1.1 | SEC-004 |
| US-02.1.4 | Sistem olarak, art arda başarısız giriş denemelerinde geçici kilitleme uygulamak istiyorum. | N başarısız denemeden sonra hesap kısa süreliğine kilitlenir. | US-02.1.1 | SEC-004 |

#### Feature 02.2 — Temel Rol ve Yetkilendirme

| ID | User Story | Kabul Kriterleri | Bağımlılık | Requirement ID |
|---|---|---|---|---|
| US-02.2.1 | Sistem yöneticisi olarak, başlangıç rollerini (Admin, İK, Yönetici, Çalışan) tanımlamak istiyorum. | Roller uygulama başlarken (seed data) hazır gelir. | US-02.1.1 | FR-003 |
| US-02.2.2 | Sistem yöneticisi olarak, bir kullanıcıya rol atamak istiyorum. | Kullanıcıya rol atanır/kaldırılır; değişiklik bir sonraki istekte etkilidir. | US-02.2.1 | FR-003 |
| US-02.2.3 | Sistem olarak, yetkisiz bir kullanıcının korumalı ekran/API'ye erişememesini istiyorum. | Yetkisiz istek reddedilir (403); yetkisiz menü öğesi arayüzde gösterilmez. | US-02.2.2 | FR-004 |
| US-02.2.4 | Kullanıcı olarak, kendi temel profil bilgilerimi (ad, e-posta, rol) görmek istiyorum. | Profil ekranı giriş yapan kullanıcının bilgilerini gösterir. | US-02.1.1 | — |

> **Genelleştirme tetikleyicisi:** Alan/kayıt düzeyinde yetkilendirme (ör. "yönetici yalnızca kendi ekibini görür"), organizasyon verisi Bölüm 3'te var olmadan anlamsızdır — bu nedenle burada değil, Bölüm 3.2'de ilk somut ihtiyaçla birlikte ele alınır. AD/LDAP/SSO/MFA, kurum içi gerçek kullanıcı senkronu ihtiyacı doğduğunda Bölüm 9.1'e taşınır.

---

## 3. Organizasyon ve Çalışan Yönetimi

**Amaç:** Şirket/birim/unvan hiyerarşisi ve personel kartı — platformdaki her modülün referans aldığı çekirdek veri. **İlk çalışır hedef bu bölümün ilk iki feature'ıyla tamamlanır.**
**Bağımlılık:** Bölüm 1, Bölüm 2.

### EPIC-03 — Organizasyon ve Çalışan Yönetimi

#### Feature 03.1 — Organizasyon Yapısı

| ID | User Story | Kabul Kriterleri | Bağımlılık | Requirement ID |
|---|---|---|---|---|
| US-03.1.1 | İK kullanıcısı olarak, Şirket/İşyeri/Bölüm hiyerarşisini oluşturmak istiyorum. | Birim ağaç yapıda tanımlanır; bir birim başka bir birimin altına eklenebilir. | US-02.2.2 | FR-014 |
| US-03.1.2 | İK kullanıcısı olarak, Görev/Unvan listesini tanımlamak istiyorum. | Unvan CRUD ekranından yönetilir; birimlerden bağımsız bir referans listesidir. | US-03.1.1 | FR-014 |

#### Feature 03.2 — Çalışan (Personel) Kaydı

| ID | User Story | Kabul Kriterleri | Bağımlılık | Requirement ID |
|---|---|---|---|---|
| US-03.2.1 | İK kullanıcısı olarak, yeni bir çalışan için temel bilgilerle (ad-soyad, TC No, işe giriş tarihi, iletişim) kayıt oluşturmak istiyorum. | Zorunlu alanlar doğrulanır; TC No format kontrolünden geçer; kayıt oluşturulur. | US-01.3.1, US-02.2.2 | FR-400, FR-401 |
| US-03.2.2 | İK kullanıcısı olarak, oluşturduğum çalışanı bir organizasyon birimine ve unvana atamak istiyorum. | Çalışan kaydı bir birim+unvan ile ilişkilendirilir; atama sonradan değiştirilebilir. | US-03.1.1, US-03.1.2, US-03.2.1 | FR-404 |
| US-03.2.3 | İK kullanıcısı olarak, çalışanları listelemek ve isim/birim/unvana göre filtrelemek istiyorum. | Liste ekranı temel filtrelerle çalışır; sayfalama desteklenir. | US-03.2.2 | FR-409 |
| US-03.2.4 | Sistem olarak, çalışan oluşturma/güncelleme işleminin audit kaydına düşmesini istiyorum. | `US-01.3.1`'deki minimal audit mekanizması bu işlemler için tetiklenir. | US-01.3.1, US-03.2.1 | OPS-001 |
| US-03.2.5 | İK kullanıcısı olarak, bir çalışanın detayını görüntüleyip temel bilgilerini güncellemek istiyorum. | Güncelleme formu mevcut verileri gösterir; kaydetme audit'e düşer. | US-03.2.1 | FR-401, FR-402, FR-408 |
| US-03.2.6 | Çalışan olarak, kendi temel bilgilerimi görüntülemek istiyorum (self-servis). | Çalışan yalnızca kendi kaydını görür; İK dışı roller başka çalışanı göremez (alan/kayıt bazlı yetkinin ilk somut örneği). | US-03.2.1, US-02.2.3 | FR-402 |

#### Feature 03.3 — Genişletilmiş Özlük Bilgileri

> **Not (YAGNI):** Bu feature, temel akış (03.1-03.2) çalışır hale geldikten **sonra**, gerçek ihtiyaç ortaya çıktıkça parça parça eklenir. Baştan tüm alanları tasarlamaya çalışmak yerine, her story bağımsız teslim edilebilir.

| ID | User Story | Kabul Kriterleri | Bağımlılık | Requirement ID |
|---|---|---|---|---|
| US-03.3.1 | İK kullanıcısı olarak, kimlik/adres/öğrenim/yabancı dil bilgilerini çalışan kartına eklemek istiyorum. | Bu bilgiler ayrı bir sekme/form olarak eklenir ve güncellenebilir. | US-03.2.1 | FR-401 |
| US-03.3.2 | İK kullanıcısı olarak, çalışana ait zimmet kayıtlarını (birden fazla kalem) tutmak istiyorum. | Zimmet listesi çoklu kayıt destekler; teslim/iade tarihi izlenir. | US-03.2.1 | FR-401 |
| US-03.3.3 | İK kullanıcısı olarak, ücret/terfi geçmişini kaydetmek istiyorum. | Yeni kayıt eskisini silmez; geçmiş liste olarak görüntülenir. | US-03.2.1 | FR-401 |
| US-03.3.4 | İK kullanıcısı olarak, ücret gibi hassas bir alanı yalnızca yetkili rollerin görebilmesini istiyorum. | Yetkisiz rol alanı göremez/maskeli görür. | US-03.3.3, US-02.2.3 | SEC-033 |

> **Genelleştirme tetikleyicisi:** "Kullanıcı tanımlı esnek alan" ihtiyacı (FR-406) burada henüz **genel bir çerçeve olarak kurulmaz**. İlk somut istek geldiğinde (ör. "yabancı dil seviyesi" gibi tek bir alan), doğrudan tabloya bir sütun/basit bir ek-alan tablosu olarak eklenir. Bu ihtiyaç iki veya daha fazla modülde (ör. hem Özlük hem Randevu hizmet tanımında) tekrar ederse, Bölüm 9.5'teki Dinamik Form Çerçevesi değerlendirilir.

#### Feature 03.4 — Tarihsel Değişiklik Takibi

| ID | User Story | Kabul Kriterleri | Bağımlılık | Requirement ID |
|---|---|---|---|---|
| US-03.4.1 | İK kullanıcısı olarak, bir çalışanın unvan/birim değişikliği geçmişini görmek istiyorum. | Değişiklik anında eski atama kapatılır (bitiş tarihi), yeni atama açılır; geçmiş liste olarak görüntülenir. Tam "etkin-tarihli" (gelecek tarihli planlama) mimarisi henüz kurulmaz — yalnızca geçmişe dönük kayıt tutulur. | US-03.2.2 | FR-407 |

---

## 4. İzin Yönetimi

**Amaç:** En basit uçtan uca İK süreci; talep→onay→bakiye güncelleme akışı. **Bu bölüm, projede ilk kez bir "onay adımı" gerektirir.**
**Bağımlılık:** Bölüm 3.

### EPIC-04 — İzin Yönetimi

#### Feature 04.1 — İzin Türleri ve Bakiye

| ID | User Story | Kabul Kriterleri | Bağımlılık | Requirement ID |
|---|---|---|---|---|
| US-04.1.1 | İK kullanıcısı olarak, izin türlerini (yıllık, mazeret vb.) tanımlamak istiyorum. | Tür adı/kodu ile basit bir tanım listesi oluşturulur (henüz genel parametrik çerçeve değil — sabit alan setiyle bir tablo). | US-03.1.1 | FR-103 |
| US-04.1.2 | Sistem olarak, çalışanın hizmet yılına göre yıllık izin hak edişini hesaplamak istiyorum. | Hak ediş, işe giriş tarihinden hesaplanan kıdeme göre basit bir kademe tablosuyla belirlenir. | US-04.1.1, US-03.2.1 | FR-101 |
| US-04.1.3 | Sistem olarak, izin bakiyesini otomatik takip etmek istiyorum. | Bakiye = hak ediş - kullanılan - onay bekleyen; her işlemde güncellenir. | US-04.1.2 | FR-102 |

#### Feature 04.2 — İzin Talebi ve Onay

> **Not (YAGNI):** Onay adımı burada **izin modülüne özel, basit** bir mekanizma olarak yazılır (tek/çift seviyeli, sabit kod). Genel bir "Onay Motoru" soyutlaması bu aşamada kurulmaz.

| ID | User Story | Kabul Kriterleri | Bağımlılık | Requirement ID |
|---|---|---|---|---|
| US-04.2.1 | Çalışan olarak, izin talebi oluşturmak istiyorum (tür, tarih aralığı). | Form; yetersiz bakiyede uyarı gösterir (engellemeyebilir). | US-04.1.3 | FR-108 |
| US-04.2.2 | Yönetici olarak, bağlı çalışanın izin talebini onaylamak/reddetmek istiyorum. | Yönetici yalnızca kendi ekibinin taleplerini görür; ret gerekçesi zorunlu. | US-04.2.1, US-03.2.2 | FR-110 |
| US-04.2.3 | Sistem olarak, onaylanan izni bakiyeden düşmek istiyorum. | Onay anında bakiye güncellenir. | US-04.2.2 | FR-102 |
| US-04.2.4 | Çalışan olarak, geçmiş/mevcut izin taleplerimi ve durumlarını görüntülemek istiyorum. | Liste; durum (bekliyor/onaylı/reddedildi) ile gösterilir. | US-04.2.1 | FR-109 |

#### Feature 04.3 — Bildirim (Minimal)

> **Not (YAGNI):** Genel bir bildirim motoru kurulmaz; yalnızca izin modülüne özel, tek şablonlu bir e-posta gönderimi yazılır.

| ID | User Story | Kabul Kriterleri | Bağımlılık | Requirement ID |
|---|---|---|---|---|
| US-04.3.1 | Çalışan olarak, izin talebim onaylandığında/reddedildiğinde e-posta almak istiyorum. | SMTP üzerinden basit, sabit metinli bir e-posta gönderilir. | US-04.2.2 | FR-113 |

> **Genelleştirme tetikleyicisi:** İzin'deki onay adımı, İşe Alım (Bölüm 5) veya bir sonraki modülde **ikinci kez, benzer biçimde** ihtiyaç haline geldiğinde, iki uygulamanın ortak noktaları çıkarılarak Bölüm 9.2'deki Onay Motoru değerlendirilir. Tek kullanım için soyutlama kurulmaz.

---

## 5. İşe Alım

**Amaç:** Norm kadro kontrollü açık pozisyon → aday → mülakat → işe alım süreci; ikinci onay ihtiyacı burada belirginleşir.
**Bağımlılık:** Bölüm 3.

### EPIC-05 — İşe Alım

#### Feature 05.1 — Norm Kadro

> **Not (YAGNI):** Norm kadro, Bölüm 3'te değil burada tanıtılır — çünkü gerçek ihtiyaç (işe alım talebinin normla sınırlanması) ilk kez burada ortaya çıkar.

| ID | User Story | Kabul Kriterleri | Bağımlılık | Requirement ID |
|---|---|---|---|---|
| US-05.1.1 | İK kullanıcısı olarak, birim/unvan bazlı norm kadro sayısı tanımlamak istiyorum. | Norm kadro birim+unvan için sayısal olarak tanımlanır. | US-03.1.1, US-03.1.2 | FR-405 |

#### Feature 05.2 — Aday ve Başvuru

| ID | User Story | Kabul Kriterleri | Bağımlılık | Requirement ID |
|---|---|---|---|---|
| US-05.2.1 | Aday olarak, harici bir sayfadan başvuru yapıp CV yüklemek istiyorum. | Başvuru formu temel bilgileri (ad-soyad, iletişim, pozisyon) + CV dosyası alır; giriş yapmış İK kullanıcısından bağımsız bir erişimdir. | US-01.1.1 | FR-1401 |
| US-05.2.2 | İK kullanıcısı olarak, aday profiline not eklemek ve süreç aşamasını değiştirmek istiyorum. | Not ekleme; aşama (başvuru/mülakat/teklif/işe alım/ret) güncellenebilir. | US-05.2.1, US-02.2.2 | FR-1402 |

#### Feature 05.3 — İşe Alım Talebi ve Onay

| ID | User Story | Kabul Kriterleri | Bağımlılık | Requirement ID |
|---|---|---|---|---|
| US-05.3.1 | Birim yöneticisi olarak, norm kadroya uygun bir işe alım talebi oluşturmak istiyorum; norm yoksa talep oluşturamamalıyım. | Talep formu norm kadro kontrolü yapar; norm yoksa engellenir. | US-05.1.1 | FR-1407 |
| US-05.3.2 | Sistem olarak, işe alım talebinin yönetici→İK onay adımından geçmesini istiyorum. | Basit, işe-alıma-özel bir onay adımı (İzin modülündeki mekanizmayla **aynı kod değil**, benzer desende ayrı bir uygulama). | US-05.3.1, US-04.2.2 (desen referansı) | FR-1407 |

> **Genelleştirme tetikleyicisi:** Bu noktada İzin (Bölüm 4.2) ve İşe Alım (Bölüm 5.3) aynı "talep→onay→durum güncelle" desenini **iki kez, bağımsız kodla** uygulamış olacaktır. Bu, Onay Motoru soyutlamasını (Bölüm 9.2) değerlendirmek için doğru zamandır — henüz zorunlu değildir, yalnızca değerlendirme eşiğidir.

#### Feature 05.4 — Mülakat ve İşe Alım Sonrası

| ID | User Story | Kabul Kriterleri | Bağımlılık | Requirement ID |
|---|---|---|---|---|
| US-05.4.1 | İK kullanıcısı olarak, adaya mülakat tarihi/katılımcı/sonuç kaydetmek istiyorum. | Mülakat kaydı adayla ilişkilendirilir. | US-05.2.2 | FR-1404 |
| US-05.4.2 | İK kullanıcısı olarak, işe alınan adayı bir çalışan kaydına dönüştürmek istiyorum. | Aday bilgileri Bölüm 3.2'deki çalışan oluşturma akışına aktarılır (manuel tetiklemeli, tam otomatik senkron değil). | US-05.4.1, US-03.2.1 | FR-1408 |

---

## 6. Performans

**Amaç:** Hedef/yetkinlik tanımlı, göreli olarak izole bir değerlendirme süreci.
**Bağımlılık:** Bölüm 3.

### EPIC-06 — Performans

#### Feature 06.1 — Hedef ve Yetkinlik Tanımlama

| ID | User Story | Kabul Kriterleri | Bağımlılık | Requirement ID |
|---|---|---|---|---|
| US-06.1.1 | İK kullanıcısı olarak, hedef/yetkinlik tanımlamak istiyorum (ad, ağırlık). | Ağırlık toplamı validasyona tabidir. | US-03.1.1 | FR-300 |
| US-06.1.2 | İK kullanıcısı olarak, puanlama skalasını (ör. 1-5) tanımlamak istiyorum. | Skala değerlendirme formunda kullanılır. | US-06.1.1 | FR-302 |

#### Feature 06.2 — Değerlendirme Süreci

| ID | User Story | Kabul Kriterleri | Bağımlılık | Requirement ID |
|---|---|---|---|---|
| US-06.2.1 | Çalışan olarak, öz değerlendirme yapmak istiyorum. | Form, tanımlı hedef/yetkinlik setini gösterir. | US-06.1.2, US-03.2.1 | FR-308 |
| US-06.2.2 | Yönetici olarak, bağlı çalışanı değerlendirmek istiyorum. | Yönetici yalnızca kendi ekibini değerlendirebilir. | US-06.2.1, US-03.2.2 | FR-307 |
| US-06.2.3 | Sistem olarak, yetkinlik ve hedef puanlarından basit ağırlıklı bir nihai not hesaplamak istiyorum. | Ağırlıklar parametrik; sonuç izlenebilir. | US-06.2.2 | FR-309 |

#### Feature 06.3 — Görüntüleme ve Geçmiş

| ID | User Story | Kabul Kriterleri | Bağımlılık | Requirement ID |
|---|---|---|---|---|
| US-06.3.1 | Çalışan olarak, geçmiş değerlendirme sonuçlarımı görmek istiyorum. | Dönem bazlı liste görüntülenir. | US-06.2.3 | FR-306 |

---

## 7. PDKS ve Zaman Yönetimi

**Amaç:** Vardiya tanımı ve dış PDKS sisteminden gelen giriş-çıkış verisiyle puantaj. **İlk dış sistem entegrasyon ihtiyacı burada ortaya çıkar.**
**Bağımlılık:** Bölüm 3.

### EPIC-07 — PDKS ve Zaman Yönetimi

#### Feature 07.1 — Çalışma Modeli ve Vardiya

| ID | User Story | Kabul Kriterleri | Bağımlılık | Requirement ID |
|---|---|---|---|---|
| US-07.1.1 | İK kullanıcısı olarak, temel çalışma modellerini (tam zamanlı, vardiyalı) tanımlamak istiyorum. | Model, çalışana atanabilir bir referans kayıttır. | US-03.1.1 | FR-600 |
| US-07.1.2 | İK kullanıcısı olarak, çalışana bir çalışma modeli/vardiya atamak istiyorum. | Atama çalışan kaydına bağlanır. | US-07.1.1, US-03.2.1 | FR-600 |

#### Feature 07.2 — PDKS Entegrasyonu

> **Not (YAGNI):** Bu, projenin ilk dış sistem bağlantısıdır. Genel bir "adaptör çerçevesi" kurmak yerine, doğrudan PDKS vendor'una özel, tek amaçlı bir entegrasyon yazılır. İkinci bir dış sistem (ör. Bordro'nun banka/e-Devlet entegrasyonu, Bölüm 8) ihtiyacı ortaya çıktığında, iki uygulamanın ortak noktası varsa Bölüm 9.8'deki genel entegrasyon katmanı değerlendirilir.

| ID | User Story | Kabul Kriterleri | Bağımlılık | Requirement ID |
|---|---|---|---|---|
| US-07.2.1 | Sistem olarak, PDKS'ten fiili giriş-çıkış verisini almak istiyorum. | Test ortamında örnek veri başarıyla okunur/kaydedilir. | US-07.1.2 | FR-602, INT-005 |
| US-07.2.2 | İK kullanıcısı olarak, planlanan vardiya ile fiili giriş-çıkışı karşılaştırıp geç kalma/erken çıkışı görmek istiyorum. | Sapma otomatik hesaplanır ve listelenir. | US-07.2.1 | FR-602 |

#### Feature 07.3 — Puantaj

| ID | User Story | Kabul Kriterleri | Bağımlılık | Requirement ID |
|---|---|---|---|---|
| US-07.3.1 | İK kullanıcısı olarak, aylık puantajı (normal/eksik/fazla mesai günleri) görmek istiyorum. | Puantaj, PDKS verisi + izin verisinden (Bölüm 4) hesaplanır. | US-07.2.2, US-04.2.3 | FR-604 |

---

## 8. Diğer Modüller

**Amaç:** Birbirinden büyük ölçüde bağımsız, düşük karşılıklı bağımlılığa sahip modüller. Bölüm 1-7 çalışır hale geldikten sonra, hangisi önce ele alınacaksa (kullanıcı ihtiyacına göre) doğrudan başlanabilir; aralarında zorunlu bir sıra yoktur.
**Bağımlılık:** Bölüm 3 (tüm modüller çalışan kaydına referans verir).

### EPIC-08A — Eğitim Yönetimi

| ID | User Story | Kabul Kriterleri | Bağımlılık | Requirement ID |
|---|---|---|---|---|
| US-08A.1.1 | İK kullanıcısı olarak, katalogda eğitim tanımlamak istiyorum (ad, tür, süre, sağlayıcı). | Katalog CRUD ekranından yönetilir. | US-03.1.1 | FR-200 |
| US-08A.1.2 | Çalışan olarak, katalogdan eğitim talep etmek istiyorum. | Talep, yöneticiye onaya gider (Bölüm 4/5'teki basit onay deseninin tekrar kullanımı ya da bu noktada olgunlaşmışsa Onay Motoru — bkz. Bölüm 9.2 tetikleyicisi). | US-08A.1.1, US-03.2.1 | FR-201 |
| US-08A.1.3 | İK kullanıcısı olarak, tamamlanan eğitimleri çalışan bazında görmek istiyorum. | Liste; çalışan+eğitim+tarih gösterir. | US-08A.1.2 | FR-209 |

### EPIC-08B — Harcırah/Seyahat/Masraf

| ID | User Story | Kabul Kriterleri | Bağımlılık | Requirement ID |
|---|---|---|---|---|
| US-08B.1.1 | Çalışan olarak, seyahat talebi oluşturmak istiyorum (lokasyon, tarih, amaç). | Form kaydedilir. | US-03.2.1 | FR-500 |
| US-08B.1.2 | Çalışan olarak, masraf kalemlerini belge ile beyan etmek istiyorum. | Her kalem tutar+belge ile kaydedilir. | US-08B.1.1 | FR-502, FR-504 |
| US-08B.1.3 | Yönetici olarak, masraf beyanını onaylamak istiyorum. | Basit onay adımı; ret gerekçesi zorunlu. | US-08B.1.2 | FR-505 |

### EPIC-08C — Uyarı/Ceza/Ödül ve Disiplin

| ID | User Story | Kabul Kriterleri | Bağımlılık | Requirement ID |
|---|---|---|---|---|
| US-08C.1.1 | İK kullanıcısı olarak, uyarı kaydı oluşturmak istiyorum (tarih, sebep, açıklama). | Kayıt çalışana bağlanır. | US-03.2.1 | FR-1300, FR-1301 |
| US-08C.1.2 | İK kullanıcısı olarak, ceza sürecini kaydetmek istiyorum; çalışan savunması alınmadan süreç kapanmamalı. | Savunma alanı boşken süreç tamamlanamaz. | US-08C.1.1 | FR-1304, FR-1314 |
| US-08C.1.3 | Sistem olarak, disiplin kayıtlarının değiştirilemez, yalnızca revizyon eklenebilir olmasını istiyorum. | Var olan kayıt güncellenemez; yeni revizyon eklenir. | US-08C.1.2 | SEC-021 |
| US-08C.1.4 | Yönetici olarak, ödül kaydı (takdir belgesi, prim vb.) oluşturmak istiyorum. | Kayıt çalışana bağlanır. | US-03.2.1 | FR-1308 |

### EPIC-08D — Bordro ve Bordroya Hazırlık

> **Not:** Bu modül, İzin/PDKS/Harcırah/Disiplin'den **onaylanmış veriyi okuyan** bir tüketicidir; kendi iş verisini üretmez. Bu nedenle diğer modüllerden **sonra** ele alınması doğaldır.

| ID | User Story | Kabul Kriterleri | Bağımlılık | Requirement ID |
|---|---|---|---|---|
| US-08D.1.1 | Bordro kullanıcısı olarak, temel ücret kalemlerini (maaş, kesinti) tanımlamak istiyorum. | Kalem tanımı basit bir referans listesidir. | US-03.2.1 | FR-1102 |
| US-08D.1.2 | Bordro kullanıcısı olarak, onaylanmış izin/PDKS/masraf verisini tek ekranda görmek istiyorum. | Ekran, ilgili modüllerden yalnızca onaylanmış kayıtları okur. | US-04.2.3, US-07.3.1, US-08B.1.3 | FR-1103, FR-1109 |
| US-08D.1.3 | Bordro kullanıcısı olarak, hazırlanan bordro verisini Excel/CSV olarak dışa aktarmak istiyorum. | Dosya, dış bordro sistemine aktarılabilir formatta üretilir. | US-08D.1.2 | FR-1113 |
| US-08D.1.4 | Bordro kullanıcısı olarak, modüle girişte ek bir doğrulama adımı (2FA) istiyorum. | Bordro ekranına girişte ikinci faktör istenir. | US-02.1.1 | FR-1116 |

> **Ertelenen kapsam:** SGK/e-Devlet/banka/BES/sağlık sigortası entegrasyonları, 5 yıllık geçmiş veri migrasyonu ve tam vergi hesaplama motoru, gerçek ihtiyaç (canlı kullanım) netleşmeden bu aşamada ele alınmaz — Bölüm 9.8'e bırakılmıştır.

### EPIC-08E — Anket

| ID | User Story | Kabul Kriterleri | Bağımlılık | Requirement ID |
|---|---|---|---|---|
| US-08E.1.1 | İK kullanıcısı olarak, basit bir anket oluşturup yayınlamak istiyorum. | Soru+seçenek listesiyle anket oluşturulur. | US-03.2.1 | FR-700 |
| US-08E.1.2 | Çalışan olarak, ankete yanıt vermek istiyorum. | Yanıt kaydedilir; anonim seçeneği varsa kullanıcı bilgisi tutulmaz. | US-08E.1.1 | FR-704 |
| US-08E.1.3 | İK kullanıcısı olarak, anket sonuçlarını yüzdesel dağılımla görmek istiyorum. | Sonuç ekranı seçenek bazlı yüzde gösterir. | US-08E.1.2 | FR-702, FR-705 |

### EPIC-08F — Talep ve Fikir

| ID | User Story | Kabul Kriterleri | Bağımlılık | Requirement ID |
|---|---|---|---|---|
| US-08F.1.1 | Çalışan olarak, kategori seçip bir talep/fikir göndermek istiyorum. | Kategori basit bir referans listesidir; anonim seçeneği desteklenir. | US-03.2.1 | FR-800, FR-801 |
| US-08F.1.2 | İK kullanıcısı olarak, talebin durumunu (Değerlendirmede/Onaylandı/Tamamlandı) güncellemek istiyorum. | Durum değişikliği çalışana görünür. | US-08F.1.1 | FR-802 |

### EPIC-08G — Sosyal Kulüp

| ID | User Story | Kabul Kriterleri | Bağımlılık | Requirement ID |
|---|---|---|---|---|
| US-08G.1.1 | Çalışan olarak, kulüpleri görüntüleyip üyelik talebi oluşturmak istiyorum. | Talep İK onayına gider. | US-03.2.1 | FR-900 |
| US-08G.1.2 | Kulüp Lideri olarak, etkinlik oluşturmak istiyorum. | Etkinlik yalnızca lider tarafından oluşturulabilir. | US-08G.1.1 | FR-905 |

### EPIC-08H — Randevu

| ID | User Story | Kabul Kriterleri | Bağımlılık | Requirement ID |
|---|---|---|---|---|
| US-08H.1.1 | Sistem yöneticisi olarak, hizmet ve uygun saat slotlarını tanımlamak istiyorum. | Slot çakışması engellenir. | US-03.1.1 | FR-1200, FR-1202 |
| US-08H.1.2 | Çalışan olarak, uygun bir slota randevu almak istiyorum. | Aynı saatte ikinci randevu engellenir. | US-08H.1.1, US-03.2.1 | FR-1203 |
| US-08H.1.3 | Sistem olarak, sağlık verisi içeren randevu notlarını yalnızca yetkili kişilerin görmesini istiyorum. | Yetkisiz kullanıcı notu göremez. | US-08H.1.2, US-02.2.3 | SEC-020 |

### EPIC-08I — Doküman Yönetimi, Görev Tanımları ve Organizasyon Şeması

| ID | User Story | Kabul Kriterleri | Bağımlılık | Requirement ID |
|---|---|---|---|---|
| US-08I.1.1 | İK kullanıcısı olarak, bir politika dokümanı yükleyip versiyonlamak istiyorum. | Yeni versiyon eskisini arşivler. | US-03.2.1 | FR-1000 |
| US-08I.1.2 | İK kullanıcısı olarak, unvan bazlı görev tanımı yazmak istiyorum. | Görev tanımı unvana bağlanır. | US-03.1.2 | FR-1004 |
| US-08I.1.3 | Çalışan olarak, organizasyon şemasını görsel olarak görüntülemek istiyorum. | Şema, Bölüm 3'teki organizasyon/atama verisinden türetilir. | US-03.2.2 | FR-1008 |

---

## 9. Kurumsal Entegrasyonlar ve Altyapı

**Amaç:** Bölüm 1-8'de **birden fazla modülde tekrar eden** ihtiyaçların genelleştirilmesi. Bu bölümdeki hiçbir feature, ilgili tetikleyici koşul gerçekleşmeden ele alınmaz — burada listelenmeleri "yapılacak" anlamına gelmez, "gerçek ihtiyaç birikince buraya bakılır" anlamına gelir.
**Bağımlılık:** Değişken; her feature kendi tetikleyicisinde belirtilmiştir.

### EPIC-09 — Kurumsal Entegrasyonlar ve Altyapı

#### Feature 09.1 — Kimlik ve Erişim Genişletmesi (AD/LDAP, SSO, MFA)

> **Tetikleyici:** Ürün gerçek bir kurumsal ortamda, birden fazla gerçek kullanıcıyla ve merkezi kullanıcı yönetimi ihtiyacıyla kullanılmaya başlandığında.

| ID | User Story | Kabul Kriterleri | Bağımlılık | Requirement ID |
|---|---|---|---|---|
| US-09.1.1 | Sistem yöneticisi olarak, kullanıcıların AD/LDAP üzerinden doğrulanmasını istiyorum. | Bölüm 2'deki yerel giriş, AD doğrulamasıyla değiştirilir/tamamlanır. | EPIC-02 | SEC-030, INT-001 |
| US-09.1.2 | Kullanıcı olarak, kurumsal SSO ile tek oturum açmak istiyorum. | OIDC/SAML akışıyla giriş yapılır. | US-09.1.1 | SEC-031, INT-002 |
| US-09.1.3 | Bordro kullanıcısı olarak, Bölüm 8D'deki basit 2FA'nın kurumsal bir MFA çözümüyle değiştirilmesini istiyorum. | TOTP/kurumsal MFA sağlayıcısı entegre edilir. | US-08D.1.4, US-09.1.2 | SEC-018, FR-1116 |

#### Feature 09.2 — Merkezi Onay Motoru

> **Tetikleyici:** Bölüm 4 (İzin), Bölüm 5 (İşe Alım) ve en az bir Bölüm 8 modülü, birbirinden bağımsız yazılmış onay kodlarını gerçekten **tekrar ettiğinde** ve bu tekrar bakım yükü yarattığında.

| ID | User Story | Kabul Kriterleri | Bağımlılık | Requirement ID |
|---|---|---|---|---|
| US-09.2.1 | Geliştirici olarak, mevcut modüllerdeki (İzin, İşe Alım, ...) onay kodlarını ortak, parametrik bir onay motoruna taşımak istiyorum. | Motor, mevcut modüllerin davranışını bozmadan devreye alınır (kademeli geçiş). | EPIC-04, EPIC-05 | FR-009, NFR-004 |
| US-09.2.2 | Sistem yöneticisi olarak, yeni bir onay zincirini kod yazmadan tanımlamak istiyorum. | Zincir adım sayısı/onaylayıcı rolü ekrandan yapılandırılır. | US-09.2.1 | FR-009 |

#### Feature 09.3 — Merkezi Bildirim Altyapısı

> **Tetikleyici:** Üç veya daha fazla modülde birbirinden bağımsız e-posta gönderim kodu tekrarlandığında.

| ID | User Story | Kabul Kriterleri | Bağımlılık | Requirement ID |
|---|---|---|---|---|
| US-09.3.1 | Geliştirici olarak, dağınık e-posta gönderim kodlarını ortak bir şablon motoruna taşımak istiyorum. | Şablonlar versiyonlanabilir; mevcut bildirimler bozulmadan taşınır. | EPIC-04 (Feature 04.3) | FR-010 |

#### Feature 09.4 — Merkezi Raporlama ve Dışa Aktarma

> **Tetikleyici:** Birden fazla modülde benzer filtre/Excel dışa aktarma kodu tekrarlandığında.

| ID | User Story | Kabul Kriterleri | Bağımlılık | Requirement ID |
|---|---|---|---|---|
| US-09.4.1 | Geliştirici olarak, ortak bir filtre+Excel dışa aktarma bileşeni istiyorum. | Bileşen, en az iki modülde (ör. Çalışan listesi, İzin geçmişi) yeniden kullanılır. | EPIC-03, EPIC-04 | NFR-007 |

#### Feature 09.5 — Dinamik/Parametrik Form Çerçevesi

> **Tetikleyici:** Bölüm 3.3'te not edildiği gibi, ikinci/üçüncü bir modülde "kullanıcı tanımlı alan" ihtiyacı gerçekten tekrar ettiğinde.

| ID | User Story | Kabul Kriterleri | Bağımlılık | Requirement ID |
|---|---|---|---|---|
| US-09.5.1 | Sistem yöneticisi olarak, kod değişikliği olmadan yeni bir alan tanımlamak istiyorum. | Alan tipi (metin/sayı/tarih/seçim) parametrik tanımlanır ve ilgili formda görünür. | EPIC-03 (Feature 03.3) | NFR-003, FR-406 |

#### Feature 09.6 — Merkezi Audit ve Uyum Logu

> **Tetikleyici:** Bölüm 1.3'teki minimal audit kaydı, denetlenebilirlik/değişmezlik/merkezi izleme ihtiyacı (ör. dış denetim, KVKK talebi) gerçek hale geldiğinde genişletilir.

| ID | User Story | Kabul Kriterleri | Bağımlılık | Requirement ID |
|---|---|---|---|---|
| US-09.6.1 | Denetim rolü olarak, audit kayıtlarının değiştirilemez olmasını istiyorum. | Uygulama rolünün UPDATE/DELETE yetkisi olmadığı garanti edilir. | US-01.3.1 | SEC-021 |
| US-09.6.2 | Operasyon ekibi olarak, logların merkezi bir log sistemine aktarılmasını istiyorum. | Yapılandırılmış log formatı + aktarım kurulur. | US-09.6.1 | INT-003, OPS-002 |

#### Feature 09.7 — Dosya/Doküman Yönetimi Genellemesi

> **Tetikleyici:** Birden fazla modülde (Özlük, İşe Alım, Disiplin, Doküman Yönetimi) dosya yükleme kodu tekrarlandığında.

| ID | User Story | Kabul Kriterleri | Bağımlılık | Requirement ID |
|---|---|---|---|---|
| US-09.7.1 | Geliştirici olarak, ortak bir dosya yükleme/depolama servisi istiyorum. | Servis, meta veri + ikili içeriği ayrı katmanlarda tutar; mevcut modüller buna taşınır. | EPIC-03, EPIC-05, EPIC-08I | FR-012 |
| US-09.7.2 | Güvenlik yöneticisi olarak, yüklenen dosyaların virüs taramasından geçmesini istiyorum. | Tarama servisi entegre edilir. | US-09.7.1 | SEC-002 |

#### Feature 09.8 — Dış Sistem Entegrasyonları (Banka, e-Devlet, BES, Sağlık, Yemek Kartı, ERP)

> **Tetikleyici:** Bordro modülü (8D) gerçek, canlı bir bordro sürecine bağlanma ihtiyacı doğurduğunda.

| ID | User Story | Kabul Kriterleri | Bağımlılık | Requirement ID |
|---|---|---|---|---|
| US-09.8.1 | Bordro kullanıcısı olarak, banka ödeme dosyası oluşturmak istiyorum. | IBAN doğrulamalı, banka formatında dosya üretilir. | EPIC-08D | FR-1108, INT-007 |
| US-09.8.2 | Bordro kullanıcısı olarak, SGK/e-Devlet bildirimlerini desteklemek istiyorum. | İlgili beyanname formatı üretilir. | US-09.8.1 | INT-008 |
| US-09.8.3 | Proje sahibi olarak, mevcut bordro sisteminden geçmiş veriyi taşımak istiyorum. | Migrasyon, mutabakat raporuyla doğrulanır. | US-09.8.1 | FR-1118 |

#### Feature 09.9 — Güvenlik Sertleştirme

> **Tetikleyici:** Ürün gerçek kullanıcı verisiyle canlıya alınmadan önce.

| ID | User Story | Kabul Kriterleri | Bağımlılık | Requirement ID |
|---|---|---|---|---|
| US-09.9.1 | Güvenlik yöneticisi olarak, hassas alanların (TC No, IBAN, ücret) şifreli saklanmasını istiyorum. | Sütun seviyesi şifreleme uygulanır. | EPIC-03, EPIC-08D | SEC-002 |
| US-09.9.2 | Proje sahibi olarak, canlıya almadan önce temel bir güvenlik taraması yapmak istiyorum. | Bağımlılık (SCA) ve statik kod (SAST) taraması CI'a eklenir. | Tüm modüller | SEC-009, SEC-014 |

#### Feature 09.10 — Dağıtım ve Operasyon

> **Tetikleyici:** Ürün, geliştiricinin kendi makinesi dışında (ör. bir sunucu, bulut ortamı) çalıştırılmaya başlandığında.

| ID | User Story | Kabul Kriterleri | Bağımlılık | Requirement ID |
|---|---|---|---|---|
| US-09.10.1 | Proje sahibi olarak, uygulamayı Docker imajı olarak dağıtmak istiyorum. | İmaj build edilir ve bir ortamda çalıştırılabilir. | US-01.1.4 | DEP-001 |
| US-09.10.2 | Proje sahibi olarak, düzenli veritabanı yedeği almak istiyorum. | Yedekleme zamanlanmış olarak çalışır ve geri yükleme test edilmiştir. | US-09.10.1 | DEP-020, DEP-021 |

---

## 10. Kapanış Notu

Bu doküman bir **yol haritası**dır, sabit bir plan değil. Bölüm sırası önerilen çalışma sırasını gösterir; ancak her Feature bağımsız olarak, ihtiyaç doğduğunda öne alınabilir veya ertelenebilir — tek koşul, bağımlılık sütununda belirtilen story'lerin tamamlanmış olmasıdır. Bölüm 9'daki genelleştirme kararları, ilgili tetikleyici koşullar gerçekleşmeden alınmamalıdır; erken genelleştirme, tek geliştiricinin en kısıtlı kaynağı olan zamanı, henüz var olmayan esneklik ihtiyaçlarına harcamak anlamına gelir.

*Doküman sonu — Bu, yalnızca bir ürün yol haritasıdır. Kod, veritabanı şeması veya API sözleşmesi bu aşamada üretilmemiştir.*

