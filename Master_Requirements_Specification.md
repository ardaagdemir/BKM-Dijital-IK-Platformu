# Dijital İnsan Kaynakları Yönetim Sistemi — Master Requirements Specification

**Hazırlayan:** İş Analizi / Yazılım Mimarisi / Teknik PY görevi kapsamında
**Kaynak Dokümanlar:**
- **[TŞ]** Teknik Şartname — `Dijital_I_K_Platformu_S_artname.docx`
- **[İŞ]** İdari Şartname — `20261121504_idari_sartname.doc` (İKN: 2026/1121504)
- **[ST]** Sözleşme Tasarısı — `20261121504_sozlesme_tasarisi.doc`

**İdare:** Bankalararası Kart Merkezi A.Ş. (BKM) Genel Müdürlüğü
**İhale Usulü:** 4734 sayılı Kanun kapsamında açık ihale, EKAP üzerinden e-teklif
**İhale Tarihi:** 05.08.2026, Saat 10:30

> **Notasyon:** Her gereksinim `[Kaynak — Madde/Bölüm]` referansı ile işaretlenmiştir. "**Varsayım**" etiketi, dokümanlarda açıkça yazılmayıp yorum yoluyla türetilen noktaları gösterir. Çelişkiler gizlenmemiş, ayrı bir bölümde (Bölüm 17) açıkça listelenmiştir.

---

## 1. Projenin Amacı ve Kapsamı

**Amaç [TŞ — İşin Tanımı]:** 4857 sayılı İş Kanunu ve ilgili mevzuat kapsamında, BKM bünyesindeki insan kaynakları süreçlerinin tamamının dijital ortamda, tek bir platform üzerinden uçtan uca yürütülmesini sağlayacak bir "Dijital İnsan Kaynakları Yönetim Sistemi" hizmetinin (yazılım + kurulum + bakım + destek) temin edilmesidir.

**Kapsam [İŞ — Madde 2.1(ç); TŞ — İşin Kapsamı]:**
- İdari Şartname'de iş "**1 Adet 13 Modülden oluşan İnsan Kaynakları Yönetim Sistemi Hizmet Alımı**" olarak tanımlanmıştır.
- Teknik Şartname'de ise **14 ayrı modül başlığı** altında fonksiyonel gereksinim tanımlanmıştır (bkz. Bölüm 3 ve Bölüm 17 — Çelişki #1).
- İş; yazılımın on-premise (BKM veri merkezinde) kurulumunu, tüm modüllerin geliştirilmesini/uyarlanmasını, entegrasyonlarını, eğitimlerini, 12 ay garanti+bakımını ve destek hizmetlerini kapsar.
- **İşin süresi [ST — Madde 9.1]:** İşe başlama tarihinden itibaren **180 takvim günü**. İşe başlama, sözleşme imzalandıktan sonraki **3 gün** içinde olacaktır [ST — Madde 10.2].
- **İşin yapılacağı yer:** Bankalararası Kart Merkezi A.Ş. Genel Merkez Ofisi, Beşiktaş/İstanbul [ST — Madde 10.1].
- Sözleşme türü **birim fiyat sözleşme** olarak tanımlanmıştır, ancak ekli "İş Kalemleri" listesinde tek satır (1 adet, "Dijital İK Yönetim Sistemi Hizmet Alımı") bulunmaktadır; asıl fiyatsal kırılım modül bazlı **yüzdesel dağılım** tablosuyla yapılmıştır [İŞ — EK; ST — Madde 6.1, Madde 12.1] (bkz. Bölüm 17 — Çelişki #7).
- Yasal çerçeve: 4734 sayılı Kamu İhale Kanunu, 4735 sayılı Kamu İhale Sözleşmeleri Kanunu, Hizmet İşleri Genel Şartnamesi, 4857 sayılı İş Kanunu, SGK mevzuatı, Gelir Vergisi Kanunu, KVKK (6698 sayılı Kanun).

---

## 2. Kullanıcı Tipleri ve Roller

| Rol | Tanım / Kaynak | Not |
|---|---|---|
| **Tam Yetkili İK Kullanıcısı** | 6 adet lisanslı kullanıcı [TŞ — Lisans ve Kullanım Hakları] | Tüm modüllerde tam yetki |
| **Yetkili İK Kullanıcısı** | 5 adet lisanslı kullanıcı [TŞ — Lisans ve Kullanım Hakları] | Kısıtlı İK yetkisi |
| **Çalışan (Self-servis)** | Genel kullanıcı kitlesi (300 toplam lisans içinde) [TŞ — Lisans ve Kullanım Hakları] | İzin, eğitim, harcırah, randevu, anket, öneri vb. modüllerde self-servis |
| **Yönetici (1., 2., ... N. Yönetici)** | Çok seviyeli onay hiyerarşisinde her modülde tekrar eder [TŞ — İzin/Eğitim/Performans/Harcırah/Disiplin bölümleri] | Onay zincirinde farklı seviyelerde yer alır |
| **Üst Yönetim / Genel Müdür** | Performans nihai not üzerinde ±%10 müdahale yetkisi vb. [TŞ — Performans Modülü] | En üst onay mercii |
| **Direktör** | "Birlikte Güzel Anlar" ödül programının dağıtım sorumlusu [TŞ — Teşekkür Kartı bölümü] | Ödül tahsis yetkisi |
| **İK İş Ortağı** | Ödül programı koordinasyon/takip rolü [TŞ — Teşekkür Kartı bölümü] | — |
| **Sistem Yöneticisi (Admin)** | Parametre/tanım yönetimi (hizmet, slot, izin türü, esnek alan vb.) [TŞ — çok modülde] | Admin yetkileri esnetilebilir olmalı |
| **Disiplin Kurulu Üyesi** | Ceza süreçlerinde karar mercii [TŞ — Uyarı/Ceza/Ödül Modülü] | — |
| **Denetim / Audit Rolü** | Disiplin modülünde ayrı yetki grubu [TŞ — Uyarı/Ceza/Ödül Modülü] | — |
| **Hizmet Sağlayıcı** (doktor, diyetisyen, koç vb.) | Randevu modülü [TŞ — Randevu Modülü] | Kendi takvimini görür, not ekler |
| **Kulüp Lideri** | Sosyal Kulüp modülü [TŞ — Sosyal Kulüp Modülü] | Etkinlik planlar, içerik paylaşır, katılım takip eder |
| **Aday (Candidate)** | İşe Alım modülü, harici kullanıcı [TŞ — İşe Alım Modülü] | Sınırlı, kimliksiz/harici erişim (CV, evrak yükleme) |
| **İK Yetkilisi / Teknik Mülakatçı / Yönetici / Komite Üyesi** | İşe Alım modülü rolleri [TŞ — İşe Alım Modülü] | Rol bazlı veri erişimi |
| **Farklı İşyeri Kategorisi Çalışanı** (örn. dış kaynak) | BKM çalışanlarından ayrı yetkilendirme/tanımlama modeli gerektirir [TŞ — Teknik Özellikleri] | **Kritik tasarım kısıtı** |
| **Kontrol Teşkilatı** (İdare tarafı, yazılım kullanıcısı değil) | Sözleşmenin denetimi [ST — Madde 18] | İdari/sözleşmesel rol, uygulama kullanıcısı değildir |

---

## 3. İstenen Tüm Fonksiyonel Modüller

> İdari Şartname "13 Modül" der [İŞ — Madde 2.1(ç)], fakat Teknik Şartname **14 ayrı modül bölümü** tanımlar. Ödeme tablosunda da yalnızca 13 modül yüzdelik pay almıştır — **Doküman Yönetimi/Görev Tanımları/Organizasyon Şeması modülünün ödeme/kabul planında yüzdesi yoktur.** Bu, Bölüm 17'de Çelişki #1 olarak ayrıca ele alınmıştır.

| # | Modül | Ödeme Payı [TŞ Madde 6 / ST Madde 12.1] | 90 Gün Kritik mi? |
|---|---|---|---|
| 1 | Özlük Modülü | %13 | **Evet (yıldızlı)** |
| 2 | İzin Yönetim Modülü | %7 | **Evet (yıldızlı)** |
| 3 | İşe Alım Süreci Modülü | %13 | **Evet (yıldızlı)** |
| 4 | Zaman Yönetimi Modülü (PDKS) | %10 | **Evet (yıldızlı)** |
| 5 | Performans Yönetim Modülü | %13 | **Evet (yıldızlı)** |
| 6 | Eğitim Yönetim Modülü (+ e-Eğitim, Etkinlik Katılım, Yolculuk Talebi) | %13 | Hayır (180 gün) |
| 7 | Harcırah/Seyahat/Avans ve Masraf Yönetimi Modülü | %7 | Hayır (180 gün) |
| 8 | Uyarı/Ceza/Ödül ve Disiplin Modülü (+ Teşekkür Kartı/Birlikte Güzel Anlar) | %6 | Hayır (180 gün) |
| 9 | Bordro ve Bordroya Hazırlık Modülü | %6 | Hayır (180 gün) |
| 10 | Anket Modülü (+ QR Kodlu İşlem Sistemi) | %3 | Hayır (180 gün) |
| 11 | Talep ve Fikir Modülü | %3 | Hayır (180 gün) |
| 12 | Sosyal Kulüp Modülü | %3 | Hayır (180 gün) |
| 13 | Randevu Modülü | %3 | Hayır (180 gün) |
| 14 | **Doküman Yönetimi — Görev Tanımları ve Organizasyon Şeması Modülü** | **Belirtilmemiş — GAP** | Belirtilmemiş |

Toplam belirtilen yüzdeler: %13+%7+%13+%10+%13+%13+%7+%6+%6+%3+%3+%3+%3 = **%100** (14. modül dahil edilmeden zaten %100'e ulaşıyor — bu da 14. modülün fiyatlandırma dışı kaldığını doğrular).

---

## 4. Her Modülün Fonksiyonel Gereksinimleri

Öncelik kısaltmaları: **K**=Kritik, **Y**=Yüksek, **O**=Orta, **D**=Düşük.

### 4.1 Genel Platform / Ortak Fonksiyonlar (FR-000 serisi)

| ID | Gereksinim | Kaynak | Öncelik |
|---|---|---|---|
| FR-001 | Sistem web tabanlı olmalı; son kullanıcı Windows makinesinde ekstra istemci kurulumu gerekmemelidir. | TŞ — Teknik Özellikleri | K |
| FR-002 | Uygulama batch process (toplu arka plan iş) içermemelidir; işlemler senkron/anlık olmalıdır. | TŞ — Teknik Özellikleri | Y |
| FR-003 | Kullanıcı bazında/rol bazında yetkilendirme; hazır roller (tam yetkili İK, yetkili İK, yönetici vb.) sağlanmalı. | TŞ — Güvenlik/Yetkilendirme/Roller | K |
| FR-004 | Kullanıcılar yalnızca yetkili oldukları modül/ekranları görebilmeli, diğerlerine erişememelidir. | TŞ — Güvenlik/Yetkilendirme/Roller | K |
| FR-005 | İşyeri kategorisi farklı (dış kaynak vb.) çalışanlar için BKM çalışanlarından ayrı bir yetkilendirme/tanımlama modeli bulunmalıdır. | TŞ — Güvenlik/Yetkilendirme/Roller | Y |
| FR-006 | Sisteme girilen tüm veriler, BKM talebi doğrultusunda JSON formatında dışa aktarılabilmelidir (veri taşınabilirliği / çıkış klozu). | TŞ — Lisans ve Kullanım Hakları | Y |
| FR-007 | Yazılımın lisans kullanım hakkı BKM'ye ait olacaktır. | TŞ — Lisans ve Kullanım Hakları | K (sözleşmesel) |
| FR-008 | Toplam 300 kullanıcı lisansı; 6 tam yetkili İK, 5 yetkili İK kullanıcısı tanımlı olmalıdır. | TŞ — Lisans ve Kullanım Hakları | K |
| FR-009 | Çok seviyeli (2'den fazla adım destekleyen) onay akışı motoru — tedarikçi tanımlama, banka hesap değişikliği, sözleşme onayı, ödeme onayı gibi kritik işlemler dahil, tüm modüllerde tekrar kullanılabilir olmalıdır. | TŞ — Teknik Özellikleri; İzin/Eğitim/Harcırah/Disiplin bölümleri | K |
| FR-010 | Bildirim motoru: e-posta bildirimleri (talep, onay, ret, hatırlatma) parametrik şablonlarla tüm modüllerde ortak kullanılabilmelidir. | TŞ — çoklu modül | Y |
| FR-011 | Raporlama motoru: filtreleme, Excel/PDF olarak dışa aktarma tüm modüllerde ortak olmalıdır. | TŞ — çoklu modül | Y |
| FR-012 | Doküman/dosya yükleme altyapısı (kimlik, evrak, savunma, ödül belgesi vb.) tüm modüllerde ortak bileşen olarak kullanılabilmelidir. | TŞ — çoklu modül | Y |
| FR-013 | Mobil cihazlar (iOS/Android) üzerinden erişim ve en azından tüm onay işlemlerinin yapılabilmesi. | TŞ — Teknik Özellikleri | K |
| FR-014 | Organizasyon yapısı (şirket/işyeri/bölüm/görev/unvan) tüm modüllerde ortak referans veri olarak kullanılmalıdır. | TŞ — Özlük Modülü | K |

### 4.2 İzin Yönetim Modülü (FR-100 — %7, **90 gün kritik**)

| ID | Gereksinim | Kaynak | Öncelik |
|---|---|---|---|
| FR-100 | Çalışan/personel grubu bazında farklı izin hak ediş süreleri; işe giriş tarihi ile izne esas tarihin ayrı alanlar olarak tutulması. | TŞ | K |
| FR-101 | Hizmet yılına bağlı otomatik izin hak edişi hesaplama (parametrik). | TŞ | K |
| FR-102 | İzin bakiyelerinin sistem tarafından otomatik takibi. | TŞ | K |
| FR-103 | Esnek sayıda izin türü tanımlama (yıllık, mazeret, evlilik, doğum, karne vb.). | TŞ | K |
| FR-104 | İzin türü bazında parametreler: min/maks kullanım süresi, cinsiyet/şirket/grup kısıtı, hizmet süresinden düşülüp düşülmeyeceği, resmi tatil/hafta sonu dahil edilip edilmeyeceği, saatlik izin girişi desteği (örn. yıllık 40 saat yüksek lisans izni). | TŞ | K |
| FR-105 | Resmi/dini bayramların yıl içi takvim tablosu olarak uygulama içinde gösterilmesi. | TŞ | O |
| FR-106 | Yıl içi izin kullanım hatırlatmaları. | TŞ | O |
| FR-107 | İK tarafından kriter bazlı toplu izin ataması (örn. "mayıs ayına kadar herkese 5 gün") ve çalışan tarafından güncelleme imkânı. | TŞ | Y |
| FR-108 | Çalışan izin talebini sistem ve mobil üzerinden oluşturabilmeli. | TŞ | K |
| FR-109 | Çalışan geçmiş/mevcut izin bilgilerini görüntüleyebilmeli. | TŞ | K |
| FR-110 | Yönetici bağlı çalışanların izin taleplerini görüntüleme/onaylama/reddetme. | TŞ | K |
| FR-111 | Çok seviyeli, dinamik onay yapılandırması (izin türüne göre birim yöneticisi veya İK nihai onayı); sistem 2'den fazla onay adımı (örn. 1., 2., 3. Yönetici, Genel Müdür) desteklemeli. | TŞ | K |
| FR-112 | Planlanan izinlerin kullanıldığında otomatik olarak gerçekleşen izne dönüştürülmesi. | TŞ | Y |
| FR-113 | İzin talebi/onay/ret/yaklaşan izin bildirimlerinin otomatik e-posta ile gönderilmesi. | TŞ | Y |
| FR-114 | İzin bilgilerinin bordro modülüne otomatik aktarımı ve buna göre işlenmesi. | TŞ | K |
| FR-115 | İzin hareketleri, bakiyeleri ve geçmiş kayıtların raporlanması (admin ve kullanıcı bazında, yetki seviyesine göre kısıtlı). | TŞ | Y |
| FR-116 | Yıllık kullanılan izinler için sistem tarafından "yıllık mutabakat formu" üretimi; ıslak imzalı halinin çalışan tarafından tarayıp yükleyebileceği doküman alanı. | TŞ | O |
| FR-117 | Her çalışan özelinde yüklenen/İK tarafından yüklenen soft belgelerin saklandığı, görüntülenebilir doküman alanı. | TŞ | O |

### 4.3 Eğitim Yönetim Modülü (FR-200 — %13, 180 gün)

| ID | Gereksinim | Kaynak | Öncelik |
|---|---|---|---|
| FR-200 | Katalog eğitim tanımlama (ad, açıklama, kategori, tür: sınıf içi/online/karma, süre, lokasyon, sağlayıcı iç/dış, eğitmen, maliyet/bütçe). | TŞ | Y |
| FR-201 | Çalışanın katalogdan eğitim talep edebilmesi; İK'nın atama yapabilmesi. | TŞ | Y |
| FR-202 | Eğitim detaylarını (nerede/ne zaman/tür/ücret/ulaşım/konaklama) çalışanın kendisinin doldurup yönetici+İK onayına sunduğu ayrı bir talep ekranı (4-5 kişilik onay zincirine kadar). | TŞ | Y |
| FR-203 | Yıllık/dönemsel eğitim planlama, sınıf oluşturma, bireysel/toplu katılımcı atama, kapasite limiti, katılım durumu takibi (katıldı/katılmadı/mazeretli). | TŞ | Y |
| FR-204 | Eğitim öncesi/sonrası değerlendirme anketleri oluşturma, atama, sonuç raporlama; etkinlik/memnuniyet ölçümü. | TŞ | O |
| FR-205 | Adam/saat otomatik hesaplama; belirli tutar üstü eğitimlerde taahhütname alınması ve sisteme yüklenmesi. | TŞ | Y |
| FR-206 | Bölüm/kişi/eğitim türü/dönem bazlı raporlar. | TŞ | Y |
| FR-207 | Çalışanın kendisine atanan eğitimleri portalde görüntülemesi + mail bilgilendirme. | TŞ | Y |
| FR-208 | Bireysel/yönetici adına toplu eğitim talebi; talep-onay-ret akışı: 1. yönetici + 2. yönetici onayı → İK onayı → üst yönetim onayı; belirli tutar üzerinde farklı onay akışı tanımlanabilmeli. | TŞ | Y |
| FR-209 | Tamamlanan/devam eden eğitimlerin İK ve çalışan tarafından görüntülenmesi ve takibi. | TŞ | Y |
| FR-210 | Eğitim tarihi yaklaşan katılımcılara otomatik e-posta; atama/güncelleme/iptal bildirimleri; özelleştirilebilir şablonlar. | TŞ | O |
| FR-211 | Raporlar: kişi bazlı geçmiş, bölüm bazlı katılım, maliyet/bütçe, adam/saat, anket sonuçları; filtrelenebilir, Excel/PDF dışa aktarılabilir. | TŞ | Y |
| FR-212 | Rol bazlı yetkilendirme (İK/yönetici/çalışan); KVKK ve veri güvenliği uyumu. | TŞ | K |
| FR-213 | **Etkinlik Katılım Talepleri** alt-ekranı: eğitim modülüyle aynı akış (etkinlik adı, zaman, yer, masraf, ulaşım/konaklama sorumluluğu) + eğitim/etkinlik seçici. | TŞ | O |
| FR-214 | **Yolculuk Talebi** alt-ekranı: aynı yapı iş seyahati girişlerinde de uygulanabilir olmalı; eğitim/yolculuk/etkinlik ekranlarına hızlı erişim. | TŞ | O |

### 4.4 Performans Yönetim Modülü (FR-300 — %13, **90 gün kritik**)

| ID | Gereksinim | Kaynak | Öncelik |
|---|---|---|---|
| FR-300 | Sınırsız sayıda hedef/yetkinlik tanımı; min/maks puan aralığı, ağırlık oranı, farklı değerlendirme kuralları parametrik. | TŞ | K |
| FR-301 | Hedef/yetkinliklerin pozisyon/unvan/organizasyon birimi/çalışan bazında farklılaştırılabilmesi. | TŞ | K |
| FR-302 | Esnek puanlama skalaları (100'lük, 5'lik, alt kırılımlı 5'lik ör. 7-8 alt kırılım). | TŞ | Y |
| FR-303 | 360 derece değerlendirme kabiliyeti. | TŞ | Y |
| FR-304 | Yetkinlik başına en az 4 davranış göstergesi; göstergelerden gelen puanların belirlenen oranla nihai yetkinlik notuna dönüştürülmesi (bkz. örnek puanlama tablosu — Davranış Göstergesi × Puan 1-4 arası 0.5 kademeli). | TŞ | K |
| FR-305 | Birim/unvan/bölüm bazlı yetkinlik ortalaması üst sınır kontrolü veya hedef notu ortalamasına bağlama yeteneği. | TŞ | O |
| FR-306 | Değerlendirme dönemleri: yıllık, dönem bazlı, aylık; geçmiş dönemlerle karşılaştırma. | TŞ | K |
| FR-307 | Değerlendirici tipleri: ast, üst, eş düzey; yönetici süreç başlamadan önce kimlerin değerlendirileceğini görebilmeli; değerlendirici ataması hiyerarşik veya İK tarafından manuel. | TŞ | K |
| FR-308 | Çalışan öz değerlendirmesi yapılabilmeli; öz değerlendirme puanı nihai nota doğrudan etki etmemeli. | TŞ | Y |
| FR-309 | Nihai not ağırlıklandırma: varsayılan Yetkinlik %40 / Hedef %50 / Anket %10 (dinamik ağırlıklandırılabilir); yönetici değerlendirmesi 1. yönetici %50 / 2. yönetici %50 (dinamik); yönetici değerlendirme anketi ek katkı payı (örn. %10) eklenebilmeli; sistem otomatik hesaplamalı. | TŞ | K |
| FR-310 | Genel Müdür'e nihai performans notu üzerinde **±%10** oranında yukarı/aşağı müdahale yetkisi; yetkilendirme kurallarıyla sınırlı, loglanan ve raporlanabilen bir işlem olmalı. | TŞ | K |
| FR-311 | Performans modülüyle bütünleşik Anket Modülü: çalışanların yöneticilerini anketle değerlendirmesi; anket sonucu tanımlı oranda performans notuna parametrik etki; anonim/isimli seçilebilir; yetkinlik kırılımına göre periyodik atama. | TŞ | Y |
| FR-312 | Raporlama: çalışan/ekip/departman/kurum geneli bazında; geçmiş dönemle karşılaştırmalı; tüm adımlar izlenebilir/denetlenebilir. | TŞ | K |

### 4.5 Özlük Modülü (FR-400 — %13, **90 gün kritik**)

| ID | Gereksinim | Kaynak | Öncelik |
|---|---|---|---|
| FR-400 | Her çalışan için tekil personel kartı; kişi özelinde otomatik oluşan CV (performans geçmişi, kimlik bilgileri, aldığı eğitimler dahil). | TŞ | K |
| FR-401 | Personel kartı alanları: kimlik/nüfus, iletişim/adres, öğrenim, yabancı dil, sertifika/belge, önceki iş deneyimi, adli sicil/askerlik/ehliyet/medeni durum, yakın bilgileri (eş/çocuk), zimmet bilgileri (çoklu kalem), ücret/terfi bilgileri, çalışandan alınan taahhütler (eğitim/sertifika/ek ödeme). | TŞ | K |
| FR-402 | Tüm alanlarda ekleme/güncelleme/görüntüleme yetkilendirme bazlı; İK içi admin yetkisi esnetilebilir (granüler yetki modeli). | TŞ | K |
| FR-403 | Barkodlu evraklardan okunan bilgilerin personel kartı ilgili alanlarına otomatik yansıtılması (OCR/barkod entegrasyonu). | TŞ | Y |
| FR-404 | Esnek organizasyon yapısı: Şirket / İşyeri / Bölüm-Departman / Görev / Unvan kırılımları; organizasyonel değişikliklerin (birim/unvan) tarihsel izlenebilirliği. | TŞ | K |
| FR-405 | Norm kadro tanımlama: birim/görev/unvan bazlı norm sayı, departman doluluk/boşluk izleme. | TŞ | K |
| FR-406 | Esnek (kullanıcı tanımlı) alan oluşturma: metin/sayı/tarih/seçimli veri tipleri; raporlama/filtrelemeye dahil edilebilme. | TŞ | Y |
| FR-407 | Tarihsel veri yönetimi: geçmişe dönük özlük bilgisi görüntüleme, geleceğe dönük planlı değişiklik (unvan/görev/organizasyon) tanımlama; kayıtlar silinmez, yalnızca yetkili kullanıcı görüntüler. | TŞ | K |
| FR-408 | Rol/yetki bazlı erişim; tüm değişiklikler loglanır ve denetlenebilir olmalı. | TŞ | K |
| FR-409 | Bordro/izin/performans/eğitim modülleriyle bütünleşik çalışma; raporlama, filtreleme, listeleme, Excel dışa aktarma. | TŞ | K |

### 4.6 Harcırah/Seyahat/Avans ve Masraf Yönetimi Modülü (FR-500 — %7, 180 gün)

| ID | Gereksinim | Kaynak | Öncelik |
|---|---|---|---|
| FR-500 | Seyahat talebi oluşturma: lokasyon, tarih aralığı, amaç, tahmini maliyet. | TŞ | Y |
| FR-501 | Girilen bilgilerle harcırah tutarının otomatik hesaplanması ve bütçe kalemiyle karşılaştırılması. | TŞ | Y |
| FR-502 | Uçtan uca süreç: seyahat talebi → harcırah hesap → masraf beyanı+belge yükleme → avans talep/mahsuplaşma → çok seviyeli onay → bütçe kontrolü → muhasebe entegrasyonu → raporlama/analitik. | TŞ | Y |
| FR-503 | Seyahat parametreleri: yurtiçi/yurtdışı, günlük harcırah tutarı, şehre göre limit, unvana göre farklı harcırah, konaklama üst limiti, ulaşım tipi (uçak/tren/otobüs/araç). | TŞ | Y |
| FR-504 | Masraf tipleri: konaklama, ulaşım, yemek, akaryakıt, otopark, temsil&ağırlama, ofis dışı sarf, eğitim giderleri. | TŞ | Y |
| FR-505 | Onay mekanizması: rol bazlı, çok seviyeli; tutar/departman/proje/seyahat türüne göre farklılaşabilir. Yönetici onayı → üst yönetim onayı (limit bazlı) → finans kontrol onayı → muhasebe aktarım onayı → tutar bazlı otomatik ek onay; ret durumunda açıklama zorunlu. | TŞ | Y |
| FR-506 | Bütçe kontrol: departman/proje bazlı yıllık bütçe, anlık karşılaştırma, bütçe aşımı uyarısı, onay öncesi bütçe kontrolü, gerçekleşen/kalan bütçe raporu. | TŞ | Y |
| FR-507 | Gider kalemleri ve nakdi ödemelerin bordro hazırlık ekranına yansıması. | TŞ | K (bordro entegrasyonu) |

### 4.7 Zaman Yönetimi Modülü — PDKS (FR-600 — %10, **90 gün kritik**)

| ID | Gereksinim | Kaynak | Öncelik |
|---|---|---|---|
| FR-600 | Çalışma modeli tanımlama: tam/yarı zamanlı, vardiyalı, esnek, hibrit; günlük/haftalık/aylık süre parametreleri; ara dinlenme süresi; fazla mesai üst limiti; departman/lokasyon/pozisyon bazlı atama; toplu atama/güncelleme. | TŞ | K |
| FR-601 | Vardiya tipi tanımlama: başlangıç/bitiş saati, ara dinlenme, gece vardiyası, resmi tatil parametreleri; döngüsel vardiya planlama (örn. 4 gün çalışma-2 gün izin); departman/ekip bazlı toplu atama; takvim görünümü; değişikliklerin loglanması. | TŞ | K |
| FR-602 | PDKS entegrasyonu: fiili giriş-çıkış verisi otomatik aktarım; planlanan vs fiili karşılaştırma; kartlı geçiş/biyometrik/mobil giriş sistem entegrasyonu; gerçek zamanlı veya periyodik aktarım; geç kalma/erken çıkış tespiti; eksik çalışma süresi hesaplama; veri aktarım hata uyarı mekanizması. | TŞ | K |
| FR-603 | Fazla mesai yönetimi: parametrik katsayı hesaplama, onay süreci, yalnızca onaylı kayıtların bordroya aktarımı; günlük oran, hafta sonu/resmi tatil katsayısı, gece zammı, serbest zaman alternatifi; fazla mesai girebilecek kişilerin İK tarafından yetkilendirilmesi. | TŞ | K |
| FR-604 | Otomatik puantaj üretimi: normal çalışma, fazla mesai, gece çalışması, resmi tatil çalışması, eksik gün/devamsızlık, ücretli/ücretsiz izin ayrımı; bordro sistemine entegre formatta aktarım. | TŞ | K |
| FR-605 | Ofisteki anlık çalışan sayısının dashboard olarak gösterilmesi (gerçek zamanlı). | TŞ | Y |

### 4.8 Anket Modülü (FR-700 — %3, 180 gün)

| ID | Gereksinim | Kaynak | Öncelik |
|---|---|---|---|
| FR-700 | İK tarafından anlık/planlı anket yayınlama; hedef kitle: tüm şirket/belirli departman/lokasyon. | TŞ | O |
| FR-701 | Katılım bilgisinin yalnızca İK yetkilileri tarafından görüntülenmesi. | TŞ | Y (gizlilik) |
| FR-702 | Sonuç ekranında seçenek bazlı yüzdesel oy dağılımı; yöneticinin kimin hangi seçeneğe oy verdiğini görebilmesi. | TŞ | O |
| FR-703 | Oylama sonrası anketin çalışan ana ekranından otomatik kaldırılması. | TŞ | O |
| FR-704 | Anonim anket seçeneği (opsiyonel, aktif edilebilir). | TŞ | D |
| FR-705 | Katılım oranı ve sonuçların grafiksel raporlanması. | TŞ | O |
| FR-706 | **QR Kodlu İşlem Sistemi:** çalışana özel QR kod ile temassız işlem (İK telefonundan çalışan QR'ını okutma veya tam tersi); işlemlerin otomatik, zaman damgalı kayıt altına alınması; kullanım alanları: etkinlik katılımı, eğitim devam takibi, teslim süreçleri. | TŞ | O |
| FR-707 | Ankete katılan her çalışanın oyu ve anket parametrelerinin sisteme düşmesi. | TŞ | O |

### 4.9 Talep ve Fikir Modülü (FR-800 — %3, 180 gün)

| ID | Gereksinim | Kaynak | Öncelik |
|---|---|---|---|
| FR-800 | Kategori seçimi, konu başlığı, açıklama, dosya/görsel ekleme, opsiyonel anonim gönderim. | TŞ | O |
| FR-801 | Kategori örnekleri: süreç iyileştirme, teknoloji/sistem geliştirme, çalışma ortamı, sosyal etkinlik önerisi, yan hak/İK uygulamaları, eğitim talebi, maliyet tasarrufu; "diğer" serbest kategori girişi. | TŞ | O |
| FR-802 | Talebin ilgili birime otomatik yönlendirilmesi; İK/ilgili yönetici incelemesi; durum akışı: Değerlendirmede → Onaylandı/Reddedildi → Uygulamaya Alındı → Tamamlandı; çalışan süreç takibi. | TŞ | Y |
| FR-803 | Ödül sistemi: teşekkür belgesi, küçük ödül, prim/hediye kartı, iç iletişimde duyuru. | TŞ | D |
| FR-804 | Aylık raporlama: gelen talep sayısı, hayata geçen fikir sayısı, en aktif departman, en çok öneri gelen kategori. | TŞ | O |

### 4.10 Sosyal Kulüp Modülü (FR-900 — %3, 180 gün)

| ID | Gereksinim | Kaynak | Öncelik |
|---|---|---|---|
| FR-900 | Kulüp görüntüleme ve katılım talebi oluşturma; üyelik başvurusu/ayrılma talebinin İK onayına tabi olması. | TŞ | O |
| FR-901 | Kulüp etkinlik takvimi görüntüleme, duyuru takibi, geçmiş etkinlik foto/içerik erişimi, gelecek dönem organizasyon bilgilendirmesi. | TŞ | D |
| FR-902 | Kulüp kategorileri (spor, koşu/trekking, fotoğrafçılık, gönüllülük, e-spor, müzik/sanat vb.) parametrik tanımlanabilir olmalı. | TŞ | D |
| FR-903 | Puan & rozet sistemi (**opsiyonel**): dijital rozet, küçük ödüller, "Yılın En Aktif Kulüp Üyesi" gibi unvanlar. | TŞ | D |
| FR-904 | Minimum katılımcı sayısına ulaşıldığında yeni kulüp kurma talebi; İK yöneticisi onayına düşme. | TŞ | D |
| FR-905 | Kulüp Lideri rolü: etkinlik planı oluşturma, içerik paylaşma, katılım listesi takibi. | TŞ | D |

### 4.11 Doküman Yönetimi — Görev Tanımları ve Organizasyon Şeması Modülü (FR-1000 — **ödeme payı belirsiz, bkz. Bölüm 17**)

| ID | Gereksinim | Kaynak | Öncelik |
|---|---|---|---|
| FR-1000 | Politika/prosedür/talimat/yönetmelik tanımlama, versiyonlama (v1, v2...), revizyon geçmişi, yürürlük/revizyon tarihi, doküman sahibi/sorumlu atama. | TŞ | Y |
| FR-1001 | Doküman yayım öncesi çok seviyeli onay akışı; revize dokümanda yeniden onay zorunluluğu; onay geçmişinin loglanması. | TŞ | Y |
| FR-1002 | Çalışan erişimi: rol/departman bazlı erişim, tüm çalışanlara açık alan, arama/filtreleme, "okudu/onayladı" kaydı (opsiyonel zorunlu okuma). | TŞ | Y |
| FR-1003 | Denetim: kim/hangi doküman/ne zaman eriştiği kaydı; güncel/arşiv ayrımı; süresi dolan doküman uyarı sistemi. | TŞ | Y |
| FR-1004 | Görev tanımı: unvan/departman bazlı oluşturma; görev-yetki-sorumluluk ayrıştırma; raporlama ilişkisi; yetkinlik/pozisyon gerekliliği alanı. | TŞ | Y |
| FR-1005 | Görev tanımı versiyonlama, güncelleme sonrası çalışan bilgilendirme, revizyon geçmişi görüntüleme. | TŞ | Y |
| FR-1006 | Çalışan kendi görev tanımını, yönetici alt ekip görev tanımlarını görüntüleyebilmeli; PDF/Word export. | TŞ | Y |
| FR-1007 | Görev tanımı yayım öncesi onay; güncelleme sonrası bildirim; çalışanın "okudum/kabul ettim" onayı. | TŞ | Y |
| FR-1008 | Organizasyon şeması: hiyerarşik, departman bazlı, pozisyon bazlı kadro planı, boş pozisyon görüntüleme. | TŞ | Y |
| FR-1009 | Dinamik/interaktif şema: çalışan üzerine tıklayınca detay, üst yönetici/bağlı ekip gösterimi, departman filtreleme. | TŞ | Y |
| FR-1010 | Özlük modülüyle entegrasyon: pozisyon/unvan değişikliğinde, işe giriş/çıkışta otomatik güncelleme. | TŞ | K (entegrasyon) |
| FR-1011 | Rol bazlı yetki: admin/İK düzenleme/yalnızca görüntüleme; log kaydı; KVKK uyumu. | TŞ | K |
| FR-1012 | Raporlar: güncel doküman listesi, revize doküman raporu, okunmamış doküman raporu, görev tanımı atama raporu, organizasyon değişiklik geçmişi, departman bazlı görev dağılımı. | TŞ | O |

### 4.12 Bordro ve Bordroya Hazırlık Modülü (FR-1100 — %6, 180 gün)

| ID | Gereksinim | Kaynak | Öncelik |
|---|---|---|---|
| FR-1100 | Bordro hesaplamaları Türkiye İş Kanunu, SGK mevzuatı, Gelir Vergisi Kanunu ve ilgili mevzuata uygun, parametrik ve mevzuat değişikliğine uyarlanabilir olmalı. | TŞ | K |
| FR-1101 | Hesaplamada kullanılacak veri alanları: TC Kimlik No, Sicil No, Ad Soyad, işe giriş/çıkış tarihi, SGK meslek kodu, SGK teşvik bilgisi, engellilik durumu, vergi indirimi, banka hesap bilgisi, organizasyon yapısı. | TŞ | K |
| FR-1102 | Parametrik ücret kalemleri: temel ücret, fazla mesai, hafta tatili, UBGT, prim, ikramiye, yemek/yol yardımı, avans, nafaka/icra/BES kesintileri, özel sağlık/hayat sigortası, diğer kesinti/ödemeler. | TŞ | K |
| FR-1103 | Veri konsolidasyonu: PDKS/puantaj, izin/devamsızlık, fazla mesai saatleri, düzenli ödemeler, ek ödemeler, kesintiler, BES katkı payı, tek seferlik düzeltme kalemleri, yan hak başlangıç/bitiş etkileri. | TŞ | K |
| FR-1104 | İşe giriş/ayrılış bildirgesi, Muhtasar ve Prim Hizmet Beyannamesi, Eksik Gün Bildirimleri, SGK Teşvik Yönetimi süreç desteği; SGK teşviklerinin çalışan bazında otomatik hesaplanması. | TŞ | K |
| FR-1105 | Yıllık izin ve ücretsiz izin kayıtlarının otomatik bordroya yansıması; hastalık raporlarının entegre çalışması; vardiyalı yapıların desteklenmesi. | TŞ | K |
| FR-1106 | Gelir vergisi matrahı, kümülatif matrah takibi, damga vergisi, asgari ücret istisnası, vergi dilim geçişlerinin otomatik hesaplanması. | TŞ | K |
| FR-1107 | Yan hak entegrasyonu: yemek kartı, yakacak yardımı, servis desteği, özel sağlık/hayat sigortası, işveren katkılı BES; çalışan/işveren katkı payı yönetimi; BES firmalarına aktarım dosyası oluşturma. | TŞ | Y |
| FR-1108 | Maaş ödeme dosyaları: çoklu banka desteği, IBAN doğrulama, toplu ödeme dosyası hazırlama. | TŞ | K |
| FR-1109 | Merkezi Bordro Hazırlık Ekranı: çalışan, sicil no, departman, unvan, çalışma tipi, PDKS toplam saat, fazla mesai saat, izin gün sayısı, eksik gün, ek ödeme/kesinti kalemleri, BES katkı bilgisi, uyarı/istisna durumu, onay durumu; departman/lokasyon/maliyet merkezi/hatalı kayıt/onay bekleyen filtreleri. | TŞ | K |
| FR-1110 | Bordro öncesi otomatik kontrol: izin-çalışma çakışması, onaysız fazla mesai uyarısı, eksik gün nedeni kontrolü, mükerrer ödeme kontrolü, limit aşımı uyarısı, BES oran/tutar tutarsızlık kontrolü; uyarıların renk kodlamayla işaretlenmesi. | TŞ | K |
| FR-1111 | Manuel müdahale: tek seferlik ödeme ekleme, kesinti tanımlama, açıklama girme, düzeltme kaydı oluşturma; tüm değişikliklerin loglanması, kullanıcı+zaman bilgisi, zorunlu gerekçe alanı. | TŞ | K |
| FR-1112 | Onay süreci: birim yöneticisi kontrolü → İK kontrolü → Finans/Bordro ön onayı; onaylanmamış kayıtlar aktarım dosyasına dahil edilmez. | TŞ | K |
| FR-1113 | Bordro sistemine aktarım: Excel/CSV/API/dosya bazlı/PDF; her bordro kalemi bordro koduyla eşleştirilebilir (mapping); aktarım tarihi/kullanıcı/sonuç kaydı. | TŞ | K |
| FR-1114 | Raporlar: bordro ön kontrol, ek ödeme, kesinti, fazla mesai maliyet, BES katkı, manuel müdahale log, ücret maliyeti, SGK işveren maliyeti, vergi, izin maliyet, organizasyon bazlı personel maliyeti raporları. | TŞ | Y |
| FR-1115 | Çalışan self-servis: bordro görüntüleme/indirme, bordro geçmişi, yıllık gelir vergisi özeti, maaş simülasyonu. | TŞ | Y |
| FR-1116 | Sisteme LDAP üzerinden giriş; **bordro modülüne özel çift doğrulama (2FA/MFA) zorunlu**; 5 dakika işlemsizlikte otomatik oturum sonlandırma. | TŞ | K (güvenlik) |
| FR-1117 | ERP, muhasebe sistemleri, bankalar, e-Devlet servisleri, puantaj sistemleri, yemek kartı firmaları, BES firmaları, özel sağlık sigortası firmaları ile API/web servis entegrasyonu. | TŞ | K |
| FR-1118 | Mevcut bordro sisteminden en az son **5 yıllık** geçmiş veri migrasyonu (kümülatif vergi matrahları, izin bakiyeleri, özlük dosyaları dahil, eksiksiz aktarım). | TŞ | K |

### 4.13 Randevu Modülü (FR-1200 — %3, 180 gün)

| ID | Gereksinim | Kaynak | Öncelik |
|---|---|---|---|
| FR-1200 | Hizmet türleri: işyeri hekimi, diyetisyen, psikolojik danışmanlık, eğitim/atölye, wellbeing uygulamaları, İK buluşmaları, ileride tanımlanacak diğer hizmetler (parametrik). | TŞ | O |
| FR-1201 | Hizmet tanımlama: ad, kategori, hizmet veren kişi, süre (15/30/45 dk vb.), günlük maks randevu sayısı, lokasyon (fiziksel/online), açıklama, iptal süresi (örn. 2 saat önce). | TŞ | O |
| FR-1202 | Slot yönetimi: gün/saat bazlı slot oluşturma, tekrarlı slot (örn. her Pazartesi 09-12), toplu oluşturma/silme/pasifleştirme, belirli tarihte slot iptali, çakışan slot engelleme, slot kapasitesi (1 veya grup seansı). | TŞ | O |
| FR-1203 | Çalışan self-servis: uygun hizmet/slot görüntüleme, randevu oluşturma, mevcut/geçmiş randevu görüntüleme, tanımlı süre içinde iptal; aynı saat diliminde ikinci rezervasyon engellenmesi. | TŞ | O |
| FR-1204 | Bildirimler: oluşturma e-postası, X saat kala hatırlatma, iptalde karşı tarafa bildirim, parametrik şablonlar. | TŞ | O |
| FR-1205 | Yetkilendirme: sistem yöneticisi/hizmet sağlayıcı/çalışan rolleri; hizmet sağlayıcı kendi takvimini görüp not ekleyebilmeli; İK yöneticisi tüm randevuları raporlayabilmeli. | TŞ | O |
| FR-1206 | Gizlilik/KVKK: sağlık/kişisel veriler gizlilik seviyesine göre yetkilendirilmeli; log kaydı (kim/ne zaman/hangi randevu). | TŞ | Y (KVKK) |
| FR-1207 | Raporlar: hizmet bazlı randevu sayısı, kullanıcı bazlı sayı, doluluk oranı, iptal oranı, tarih aralığı analiz; Excel/PDF. | TŞ | O |

### 4.14 Uyarı/Ceza/Ödül ve Disiplin Modülü (FR-1300 — %6, 180 gün)

| ID | Gereksinim | Kaynak | Öncelik |
|---|---|---|---|
| FR-1300 | Uyarı türleri: sözlü, yazılı, tekrar eden ihlallerde otomatik üst seviye uyarı. | TŞ | Y |
| FR-1301 | Uyarı kayıt alanları: tarih, veren kişi, sebep (kategori+serbest metin), olay tarihi, açıklama+ek belge, çalışan savunması (dosya dahil); uyarı geçerlilik süresi parametrik (3/6/12 ay); süresi dolan uyarı pasife alınır ve performans etkisi kaldırılabilir. | TŞ | Y |
| FR-1302 | Uyarıların performans değerlendirme, terfi/kariyer planlama, prim/bonus hesaplama, eğitim ihtiyacı belirleme süreçleriyle entegre çalışması. | TŞ | Y |
| FR-1303 | Ceza türleri: kınama, ücret kesintisi, geçici görev değişikliği, işten çıkarma; özelleştirilebilir ceza türleri. | TŞ | Y |
| FR-1304 | Ceza süreci: talep oluşturma → disiplin kuruluna sevk → kurul değerlendirme/karar → çok seviyeli onay → çalışana bildirim. | TŞ | Y |
| FR-1305 | Zorunlu alanlar: olay tarihi, ceza gerekçesi, ilgili politika/ihlal maddesi, karar tarihi, karar veren kurul üyeleri, çalışan savunması. | TŞ | Y |
| FR-1306 | Otomatik tetikleyiciler: aynı ihlalin tekrarında otomatik ceza önerisi; belirli sayıda uyarı sonrası otomatik disiplin süreci başlatma. | TŞ | O |
| FR-1307 | Disiplin kurulu yönetimi: üye tanımlama, toplantı planlama/davet, gündem oluşturma, kararların dijital kaydı, karar tutanağı oluşturma/arşivleme. | TŞ | Y |
| FR-1308 | Ödül türleri: takdir belgesi, prim/bonus, başarı ödülü, özel ödül (yönetici tanımlı); kayıt alanları: tarih, sebep, veren kişi, açıklama, ek doküman. | TŞ | O |
| FR-1309 | Performans/kariyer planlama/iç iletişim platformlarıyla entegrasyon. | TŞ | O |
| FR-1310 | Çok seviyeli onay, rol bazlı yetkilendirme, gerekçeli onay/ret, süre aşımında otomatik hatırlatma. | TŞ | Y |
| FR-1311 | Raporlama: çalışan bazlı disiplin geçmişi, departman bazlı uyarı/ceza dağılımı, en sık tekrarlanan ihlaller, ödül dağılım analizi, KPI/dashboard. | TŞ | O |
| FR-1312 | Bildirimler: uyarı/ceza bildirimi, kurul toplantı bildirimi, süresi dolacak uyarı bildirimi, onay bekleyen hatırlatma. | TŞ | O |
| FR-1313 | Entegrasyonlar: özlük, performans, bordro (ücret kesintisi), eğitim modülleri. | TŞ | Y |
| FR-1314 | Kritik kural: çalışan savunması alınmadan ceza süreci tamamlanamaz; geçmiş kayıtlar değiştirilemez, yalnızca revizyon eklenebilir. | TŞ | K (yasal/uyum) |
| FR-1315 | **Teşekkür Kartı / "Birlikte Güzel Anlar" Takdir ve Ödül Programı** (bu modülün alt bileşeni olup olmadığı belirsiz — bkz. Bölüm 17): direktör seviyesi yöneticiler tarafından yıl bazlı yürütülen ödül programı; her direktör kendi ekibinden 2, diğer ekiplerden 1 çalışanı ödüllendirir (ekip büyüklüğüne göre revize edilebilir); ödül "gift çeki" olarak özel e-posta kanalıyla iletilir. | TŞ | O |
| FR-1316 | Süreç: direktör aday girişi yapar → kontenjanı azalır → 2. yönetici onayı → İK/çalışan/yöneticiye otomatik e-posta. | TŞ | O |
| FR-1317 | Kontrol: İK tarafından izleme ve sistem kaydı; aynı çalışanın kısa sürede tekrar ödüllendirilmesinde denge kontrolü; adaletsizlik tespitinde İK müdahalesi. | TŞ | O |
| FR-1318 | Raporlama: ödül alan çalışanlar periyodik, ekip bazlı dağılım, yıllık etki analizi. | TŞ | D |

### 4.15 İşe Alım Süreci Modülü (FR-1400 — %13, **90 gün kritik**)

| ID | Gereksinim | Kaynak | Öncelik |
|---|---|---|---|
| FR-1400 | Web tabanlı, rol bazlı erişim; kurum takvim altyapısıyla (Outlook/Exchange) entegre veya kendi takvimini üretebilen yapı. | TŞ | K |
| FR-1401 | Aday profili oluşturma; CV yükleme veya manuel giriş; kişisel/eğitim/deneyim bilgileri, başvurulan pozisyon, başvuru kaynağı, değerlendirme notları. | TŞ | K |
| FR-1402 | İK tarafından aday profiline not ekleme, doküman ekleme, geçmiş mülakatları görüntüleme, süreç aşaması takibi. | TŞ | K |
| FR-1403 | Değerlendirme araçları atama: kişilik envanteri, genel yetenek, yabancı dil, teknik değerlendirme, vaka analizi; soru seti güncel soru havuzundan belirli döngüyle. | TŞ | Y |
| FR-1404 | Dinamik mülakat türleri (İK, teknik, üst yönetim mülakatı); her mülakat için tarih, katılımcılar, notlar, değerlendirme kriterleri, puanlama (dinamik alanlar); otomatik takvim planlama (iki tarafa). | TŞ | K |
| FR-1405 | "Komiteye Hazır" statüsü; komite üyeleri katılımıyla nihai (olumlu/olumsuz/yedek) değerlendirme. | TŞ | Y |
| FR-1406 | Rol bazlı yetkilendirme (İK yetkilisi, teknik mülakatçı, yönetici, komite üyesi); her kullanıcı yalnızca kendi yetki alanındaki bilgiyi görür/girer. | TŞ | K |
| FR-1407 | İşe alım talep süreci: norm kadroyla uyumlu çalışma (norm girilmemişse talep oluşturulamaz); birim yöneticisi talep → direktör onayı → İK'ya düşme → İK süreç başlatma. | TŞ | K |
| FR-1408 | İşe alım sonrası: işe alım kararı, teklif süreci, referans sorgusu (adayın bıraktığı referanslara otomatik mail), özlük/evrak süreci (evrak listesi gönderimi, aday online yükleme, potansiyel özlük dosyasına otomatik aktarım, sınırlı süreli aktif link, süre sonunda pasif, barkod sorgu yeteneği). | TŞ | K |
| FR-1409 | Raporlama: açık pozisyonlar, aday süreç durumu, mülakat/sınav sonuçları, işe alım oranları, departman bazlı raporlar; Excel/PDF. | TŞ | Y |
| FR-1410 | Akış bazlı süreç yönetimi: başvuru alındı → ön değerlendirme → sınav/teknik test → İK mülakatı → teknik mülakat → üst yönetim mülakatı → komite değerlendirmesi → teklif → işe alım/ret; her aşama için sorumlu kullanıcı, süre hedefi (SLA), otomatik bildirim. | TŞ | K |
| FR-1411 | Otomatik bildirim: aday ataması, mülakat planlama/hatırlatma, değerlendirme girilmemesi uyarısı. | TŞ | Y |
| FR-1412 | CV Parsing: ad-soyad, iletişim, eğitim, iş deneyimi, yetkinliklerin otomatik CV'den çekilmesi. | TŞ | O |
| FR-1413 | Yönetici dashboard: açık pozisyon sayısı, pozisyon başına aday sayısı, ortalama işe alım süresi, mülakat başarı oranı, kaynak bazlı aday performansı (LinkedIn, kariyer sitesi vb.). | TŞ | Y |
| FR-1414 | Doküman yönetimi: CV, sınav sonuçları, değerlendirme formları, referans kontrolleri, teklif mektupları saklanabilmeli. | TŞ | Y |
| FR-1415 | Tüm işlem/değişikliklerin loglanması ve geçmişe dönük izlenebilirliği. | TŞ | K |

---

## 5. Ortak Platform Gereksinimleri

| ID | Gereksinim | Kaynak | Öncelik |
|---|---|---|---|
| NFR-001 | Web tabanlı mimari; son kullanıcı tarafında ek istemci kurulumu gerektirmeyecek. | TŞ | K |
| NFR-002 | Uygulama batch process (toplu offline iş) mimarisi kullanmamalı — işlemler gerçek zamanlı/senkron olmalı. | TŞ | Y |
| NFR-003 | Esnek/parametrik alan tanımlama kabiliyeti tüm modüllerde tekrar eden bir mimari desen olarak sağlanmalı (izin türü, esnek özlük alanı, hizmet tanımı, kulüp kategorisi vb.). | TŞ | Y |
| NFR-004 | Çok seviyeli, dinamik, parametrik onay akışı motoru ortak bileşen olarak tasarlanmalı (izin, eğitim, harcırah, disiplin, işe alım, doküman onayı, ödül vb. modüllerde tekrar kullanılır). | TŞ | K |
| NFR-005 | Ürünün topoloji çizimi (uygulama/DB/network bileşenleri dahil) hazırlanmış ve paylaşılabilir olmalı. | TŞ | Y |
| NFR-006 | Kurumun mevcut teknoloji standartlarına (bkz. Bölüm 8) uyum sağlayamayan veya ek ücretli ürün/lisans/geliştirme/entegrasyon bağımlılığı yaratan çözümler değerlendirme dışı bırakılabilir. | TŞ | K (ihale riski) |
| NFR-007 | Rapor çıktıları (tüm modüllerde) filtrelenebilir, Excel/PDF formatında dışa aktarılabilir olmalı. | TŞ | Y |

---

## 6. Güvenlik Gereksinimleri

| ID | Gereksinim | Kaynak | Öncelik |
|---|---|---|---|
| SEC-001 | Uygulama–kullanıcı arası tüm veri iletişimi **TLS 1.2 veya üzeri** ile şifrelenmelidir. | TŞ | K |
| SEC-002 | Hassas veriler ve yedekler güçlü kriptografik yöntemlerle (**en az AES-256**) şifrelenerek saklanabilmelidir. | TŞ | K |
| SEC-003 | Çok faktörlü kimlik doğrulama (MFA) entegrasyonu desteklenmelidir. | TŞ | K |
| SEC-004 | Güvenli oturum sonlandırma (session timeout), eş zamanlı oturum sınırlaması, brute-force saldırılarına karşı hesap kilitleme mekanizmaları bulunmalıdır. | TŞ | K |
| SEC-005 | Rol bazlı yetkilendirme ve görevler ayrılığı (segregation of duties) prensiplerine uygun yetkilendirme. | TŞ | K |
| SEC-006 | İşten ayrılan/görevi değişen/yetkisi kaldırılan personelin erişimlerinin hızlı ve kontrollü sonlandırılması; hesapların merkezi olarak pasife alınması/yetkilerinin kaldırılması; ayrılan personel hesapları üzerinden yapılan işlemlerin geriye dönük izlenebilir/raporlanabilir olması. | TŞ | K |
| SEC-007 | Yüklenici, kendi erişim yetkisine sahip personelinin ayrılması/görev değişikliği/yetki iptali durumunda BKM'yi **gecikmeksizin** bilgilendirmeli ve erişimleri derhal kaldırmalıdır. | TŞ | K (sözleşmesel yükümlülük) |
| SEC-008 | Uygulama canlıya alınmadan önce bağımsız **zafiyet taraması ve sızma testi**nden geçirilmeli; sonuç raporları talep halinde BKM ile paylaşılmalı. | TŞ | K |
| SEC-009 | **OWASP Top 10** risklerine karşı koruma sağlayacak şekilde geliştirilmiş olmalı. | TŞ | K |
| SEC-010 | BKM tarafından veya üçüncü taraflarca yapılacak güvenlik değerlendirmesi/zafiyet taraması/sızma testlerine uygun olmalı (süreklilik). | TŞ | K |
| SEC-011 | Kritik işlemler (tedarikçi tanımlama, banka hesabı değişikliği, sözleşme onayı, ödeme onayı vb.) için çok seviyeli onay mekanizması tanımlanabilmeli. | TŞ | K |
| SEC-012 | Zafiyet giderme SLA: **Kritik/Yüksek seviye bulgular en geç 30 gün, Orta/Düşük seviye en geç 90 gün** içinde giderilmeli; kritik/yüksek bulgular giderilmeden ilgili bileşenler canlıya alınamaz. | TŞ | K |
| SEC-013 | Yüklenici firması ve verinin barındırılacağı veri merkezi **ISO/IEC 27001**, **ISO 27701**, (SaaS modeller için) **SOC 2 Type II** sertifikalarına sahip olmalıdır — İdari Şartname'de de teyit belgesi şartı olarak tekrarlanmıştır. | TŞ — Teknik Özellikleri; İŞ — Madde 7.3.3 | K |
| SEC-014 | Açık kaynak/3. parti kütüphanelerde bilinen CVE zafiyeti bulunmamalı; talep halinde SCA (Yazılım Bileşen Analizi) raporu sunulmalı. | TŞ | Y |
| SEC-015 | Yüklenici, yazılımda yetkisiz erişime imkân veren arka kapı/gizli erişim kodu/zararlı yazılım bulunmadığını **yazılı olarak taahhüt** etmelidir. | TŞ | K |
| SEC-016 | API entegrasyonları güvenli şekilde yapılmalı; gerekli bağlantı bilgileri paylaşıldıktan sonra en geç **10 iş günü** içinde tamamlanmalı. | TŞ | Y |
| SEC-017 | Kullanıcı işlemleri, yetki değişiklikleri, veri değişiklikleri, onay süreçleri ve kritik sistem işlemleri kayıt altına alınmalı; geriye dönük izlenebilirlik sağlanmalı. | TŞ | K |
| SEC-018 | Bordro modülüne özel: LDAP girişinin üzerine **çift doğrulama (2FA)** zorunlu; 5 dakika işlem yapılmazsa otomatik oturum sonlandırma/giriş ekranına yönlendirme. | TŞ | K |
| SEC-019 | Farklı işyeri kategorisindeki (dış kaynak vb.) çalışanların yetkilendirme/tanımlama modeli BKM çalışanlarından ayrı olmalı. | TŞ | Y |
| SEC-020 | Randevu modülünde sağlık/kişisel veriler gizlilik seviyesine göre yetkilendirilmeli; yalnızca yetkili kullanıcılar görebilmeli. | TŞ | Y |
| SEC-021 | Disiplin modülünde geçmiş kayıtlar değiştirilemez, yalnızca revizyon eklenebilir (veri bütünlüğü). | TŞ | K |
| SEC-022 | Yüklenici ile işe başlamadan önce **Gizlilik Anlaşması** imzalanacaktır. | İŞ — Madde 5.1(e), EK belge listesi | K |

---

## 7. Yetkilendirme ve Kimlik Doğrulama Gereksinimleri

| ID | Gereksinim | Kaynak | Öncelik |
|---|---|---|---|
| SEC-030 | Active Directory ve/veya LDAP entegrasyonu desteklenmeli. | TŞ | K |
| SEC-031 | SSO (Single Sign-On) entegrasyonu desteklenmeli (kurumun mevcut teknoloji listesinde yer alıyor). | TŞ | Y |
| SEC-032 | Rol bazlı erişim modeli: hazır roller (tam yetkili İK, yetkili İK, yönetici vb.) + modül/ekran bazlı kısıtlama. | TŞ | K |
| SEC-033 | Alan/kayıt düzeyinde yetkilendirme (İK admin yetkileri esnetilebilir; her yetki seviyesinde aynı esneklik). | TŞ | Y |
| SEC-034 | Modül bazında özel yetki grupları (ör. Randevu: sistem yöneticisi/hizmet sağlayıcı/çalışan; İşe Alım: İK yetkilisi/teknik mülakatçı/yönetici/komite üyesi; Disiplin: İK/yönetici/denetim/çalışan). | TŞ | Y |
| SEC-035 | Bordro modülü için LDAP + zorunlu 2. faktör kimlik doğrulama. | TŞ | K |

---

## 8. Entegrasyon Gereksinimleri

| ID | Gereksinim | Kaynak | Öncelik |
|---|---|---|---|
| INT-001 | Active Directory ve/veya LDAP/LDAPS entegrasyonu. | TŞ | K |
| INT-002 | SSO entegrasyonu. | TŞ | Y |
| INT-003 | Merkezi loglama platformları: **Splunk veya Humio (Falcon LogScale)** — audit, erişim, işlem ve hata logları aktarılabilir olmalı. | TŞ | K |
| INT-004 | Kurumsal teknoloji ekosistemiyle uyum/entegrasyon: **Kafka, Redis, RabbitMQ, API Gateway, Nginx, Apache HTTP Server, Apache Tomcat, Microsoft IIS, HAProxy, Kubernetes, OpenShift, Apache Flink, Dynatrace, Prometheus, Grafana**. | TŞ | K |
| INT-005 | PDKS (Personel Devam Kontrol Sistemleri) entegrasyonu — kartlı geçiş/biyometrik/mobil giriş. | TŞ | K |
| INT-006 | Bordro/ERP/Muhasebe sistemleri entegrasyonu (API/web servis). | TŞ | K |
| INT-007 | Banka entegrasyonu: maaş ödeme dosyaları, çoklu banka desteği, IBAN doğrulama. | TŞ | K |
| INT-008 | E-Devlet servisleri entegrasyonu (SGK bildirgeleri, Muhtasar ve Prim Hizmet Beyannamesi vb.). | TŞ | K |
| INT-009 | Yemek kartı firmaları entegrasyonu. | TŞ | Y |
| INT-010 | BES (Bireysel Emeklilik Sistemi) firmaları entegrasyonu — katkı payı aktarım dosyaları. | TŞ | Y |
| INT-011 | Özel sağlık sigortası firmaları entegrasyonu. | TŞ | Y |
| INT-012 | Kurum takvim altyapısı (Outlook/Exchange) entegrasyonu — işe alım mülakat planlama. | TŞ | Y |
| INT-013 | Mevcut bordro sisteminden geçmiş veri migrasyonu (en az 5 yıl, kümülatif vergi matrahı/izin bakiyesi/özlük dosyaları dahil). | TŞ | K |
| INT-014 | Genel API entegrasyon SLA'sı: bağlantı bilgisi paylaşımından itibaren en geç 10 iş günü içinde tamamlama. | TŞ | Y |
| INT-015 | VMware sanallaştırma platformu ile uyumlu çalışma (uygulama ve DB sunucuları). | TŞ | K |
| INT-016 | Merkezi kimlik yönetimi, izleme, alarm, log yönetimi ve operasyon süreçleriyle uyumlu çalışma (genel şart). | TŞ | K |

---

## 9. Loglama, İzleme ve Audit Gereksinimleri

| ID | Gereksinim | Kaynak | Öncelik |
|---|---|---|---|
| OPS-001 | Kullanıcı işlemleri, yetki değişiklikleri, veri değişiklikleri, onay süreçleri, kritik sistem işlemleri kayıt altına alınmalı, geriye dönük izlenebilir olmalı. | TŞ | K |
| OPS-002 | Log kayıtları merkezi log yönetim sistemine (Splunk/Humio) aktarılabilir olmalı ve yetkisiz değişikliklere karşı korunmalı (tamper-proof). | TŞ | K |
| OPS-003 | İşten ayrılan personel hesapları üzerinden yapılan işlemlerin geriye dönük izlenebilir/raporlanabilir olması. | TŞ | K |
| OPS-004 | Genel Müdür'ün performans notu üzerindeki ±%10 müdahalesi loglanmalı ve raporlanabilir olmalı. | TŞ | K |
| OPS-005 | Bordro modülünde manuel müdahalelerin (tek seferlik ödeme, kesinti, düzeltme) loglanması; kullanıcı+zaman bilgisi ve zorunlu gerekçe alanı. | TŞ | K |
| OPS-006 | Bordro aktarımı sonrası aktarım tarihi, aktaran kullanıcı, aktarım sonucu (başarılı/hatalı) kaydı. | TŞ | Y |
| OPS-007 | Doküman yönetimi modülünde "kim hangi dokümana ne zaman erişti" kaydı. | TŞ | Y |
| OPS-008 | Organizasyonel değişikliklerin (birim/unvan/yönetici değişikliği) tarihsel loglanması. | TŞ | Y |
| OPS-009 | Vardiya değişikliklerinin loglanması. | TŞ | Y |
| OPS-010 | Randevu modülünde kim/ne zaman/hangi randevuyu oluşturdu/iptal etti kaydı. | TŞ | Y |
| OPS-011 | Disiplin modülünde tüm işlemler için zaman damgası ve işlem geçmişi; geriye dönük kayıt değişikliklerinin audit trail'i. | TŞ | K |
| OPS-012 | İşe alım modülünde tüm işlem/değişikliklerin loglanması ve geçmişe dönük izlenebilirliği. | TŞ | K |
| OPS-013 | Ürün topoloji çiziminin (uygulama/DB/network) güncel tutulup paylaşılması operasyonel bir teslimat kalemi olarak izlenmeli. | TŞ | Y |

---

## 10. On-premise Kurulum ve Altyapı Gereksinimleri

| ID | Gereksinim | Kaynak | Öncelik |
|---|---|---|---|
| DEP-001 | Yazılım **on-premise** olmalı (BKM'nin kendi fiziksel sunucuları/veri merkezi/bünyesi). | TŞ | K |
| DEP-002 | Uygulama sunucu işletim sistemi **RHEL (Red Hat Enterprise Linux) veya Windows** olmalı. | TŞ | K |
| DEP-003 | Veritabanı sunucusu için **PostgreSQL öncelikli** kabul edilir; diğer lisanslı veritabanları ayrıca değerlendirilecek ve **kabul edilmeyebilecektir** (bkz. Bölüm 17 — Çelişki/Belirsizlik). | TŞ | K |
| DEP-004 | Uygulama ve DB sunucuları **VMware** platformunda çalışabilir olmalı. | TŞ | K |
| DEP-005 | Çözüm bileşenleri (OS, DB, uygulama sunucusu, 3. parti bileşenler) üretici desteği devam eden sürümlerde olmalı; EOL/EOS ürün kullanılamaz. | TŞ | K |
| DEP-006 | Orta katman logları (audit/erişim/işlem/hata) Splunk veya Humio'ya aktarılabilir olmalı. | TŞ | K |
| DEP-007 | Kurumsal teknoloji ekosistemiyle uyumluluk listesi (bkz. INT-004). | TŞ | K |
| DEP-008 | Ürün topoloji çizimi (uygulama/DB/network bileşenleri) hazırlanmalı, paylaşılabilir olmalı. | TŞ | Y |
| DEP-009 | Yüklenici tarafından sağlanan çözüm ve tüm bileşenler **BKM veri merkezinde** çalışabilir olmalı; firmanın SaaS'a özel geliştirdiği ek özellikler varsa, BKM onayıyla **ücretsiz** olarak BKM sunucularına da uyarlanmalı (bkz. Bölüm 17 — Çelişki #3: on-premise şartı ile SaaS referansı arasındaki gerilim). | TŞ | Y |
| DEP-010 | Uygulama server'ının barındırdığı standartlara (K8s/OpenShift, HAProxy, Nginx/Apache/Tomcat/IIS vb.) uyum sağlamayan veya ek bağımlılık yaratan çözümler ihale değerlendirmesinde dezavantajlı olabilir. | TŞ | K (ihale riski) |

---

## 11. Backup, Restore ve Felaket Kurtarma Gereksinimleri

| ID | Gereksinim | Kaynak | Öncelik |
|---|---|---|---|
| DEP-020 | Uygulama veri yedekleme, geri yükleme, iş sürekliliği ve felaket kurtarma süreçlerini desteklemeli. | TŞ | K |
| DEP-021 | Backup/Restore prosesleri tanımlanmış ve **çalışır** olmalı (fonksiyonel test edilebilir). | TŞ | K |
| DEP-022 | VMware'de konumlandırma durumunda **Snapshot Backup** alınabilmesi mümkün olmalı. | TŞ | Y |
| DEP-023 | Uygulama ve DB sunucusu için Olağanüstü Durum Merkezi (DR) çözümü **Aktif/Aktif veya Aktif/Pasif** yapıda gerçekleştirilebilir olmalı. | TŞ | K |
| DEP-024 | Veritabanı ve uygulama yedeklerinin periyodu, şifrelenmesi ve geri dönme (restore) testlerinin **RTO/RPO hedefleri belirtilerek** şartnamede yer alması gerektiği belirtilmiş — **ancak somut RTO/RPO değeri hiçbir dokümanda verilmemiştir** (bkz. Bölüm 17 — Çelişki/Eksiklik #4, Bölüm 18 — soru). | TŞ | K (GAP) |
| SEC-040 | Yedekler güçlü kriptografik yöntemlerle (en az AES-256) şifrelenmelidir. | TŞ | K |

---

## 12. Mobil Kullanım Gereksinimleri

| ID | Gereksinim | Kaynak | Öncelik |
|---|---|---|---|
| FR-1500 | Uygulama iOS/Android mobil platformlardan çalıştırılabilmeli. | TŞ | K |
| FR-1501 | **Tüm onay işlemleri** (izin, eğitim, harcırah, disiplin, ödül vb. çok seviyeli onaylar) mobil üzerinden yapılabilmeli. | TŞ | K |
| FR-1502 | Çalışanlar izin taleplerini mobil uygulama üzerinden oluşturabilmeli. | TŞ | K |
| FR-1503 | Native uygulama mı, mobil web/PWA mı olacağı dokümanlarda **açıkça belirtilmemiştir** — bkz. Bölüm 17 (Çelişki/Belirsizlik #9) ve Bölüm 18 (soru). | TŞ | — (netleştirilmeli) |
| NFR-010 | Son kullanıcı Windows makinesinde ek istemci kurulumuna ihtiyaç duyulmaması gereksinimi masaüstü içindir; mobil için ayrı bir dağıtım/kurulum modeli (App Store/Play Store veya MDM) **varsayım** olarak ele alınmalıdır. | **Varsayım** | O |

---

## 13. Performans, Kullanılabilirlik ve Ölçeklenebilirlik Gereksinimleri

| ID | Gereksinim | Kaynak | Öncelik |
|---|---|---|---|
| NFR-020 | Toplam 300 kullanıcı lisansını (6 tam yetkili + 5 yetkili İK + genel çalışan self-servis) sorunsuz destekleyecek ölçeklenebilirlik. | TŞ | K |
| NFR-021 | Web tabanlı, ek istemci gerektirmeyen, kesintisiz kullanılabilir mimari. | TŞ | K |
| NFR-022 | Zaman Yönetimi modülünde "anlık ofis çalışan sayısı" dashboard'unun gerçek zamanlı güncellenmesi. | TŞ | Y |
| NFR-023 | Modüllerin parametrik/esnek yapıda olması, kurumun değişen politika/organizasyon ihtiyaçlarına konfigürasyonla (kod değişikliği olmadan) uyum sağlaması. | TŞ | Y |
| NFR-024 | **Somut performans hedefleri** (eşzamanlı kullanıcı sayısı, sayfa yükleme/yanıt süresi, throughput, uptime/SLA yüzdesi) dokümanlarda **verilmemiştir** — yalnızca destek SLA'sı (2sa müdahale/4sa çözüm, bkz. Bölüm 14) mevcuttur. Bu bir **GAP**'tir; bkz. Bölüm 17 ve 18. | **Varsayım/GAP** | K (netleştirilmeli) |
| NFR-025 | Yüksek kullanılabilirlik, DR modeliyle (Aktif/Aktif veya Aktif/Pasif) desteklenmelidir (bkz. DEP-023). | TŞ | K |

---

## 14. Destek, Bakım, Garanti ve SLA Yükümlülükleri

| ID | Gereksinim | Kaynak | Öncelik |
|---|---|---|---|
| SLA-001 | Ürün **12 ay garantilidir** — kurulum işlemleriyle birlikte canlıya geçişin sorunsuz tamamlanmasından itibaren başlar. | TŞ — Teknik Özellikleri; ST — Madde 34.1 | K |
| SLA-002 | Tüm modüllerin tamamlanıp canlıya geçişinden itibaren **12 ay boyunca bakım bedelleri teklif fiyatına dahildir** (ayrıca ücretlendirilmez). | TŞ — Teknik Özellikleri; ST — Madde 33.1; İŞ — Madde 25.3.1 | K |
| SLA-003 | Garanti/bakım başlangıç tetikleyicisinin "her modülün kendi canlıya geçişi" mi yoksa "**tüm** modüllerin tamamlanması" mı olduğu farklı maddelerde farklı ima edilmiştir — bkz. Bölüm 17 (Çelişki/Belirsizlik #8). | TŞ; ST | K (netleştirilmeli) |
| SLA-004 | Sorun/arıza durumunda **2 saatte müdahale, 4 saatte çözüm** desteği verilebilmelidir. | TŞ — Teknik Özellikleri | K |
| SLA-005 | Yeni sürüm geçişleri (versiyon yükseltmeleri) yüklenici tarafından gerçekleştirilmelidir. | TŞ — Teknik Özellikleri | Y |
| SLA-006 | Kurulumlar sonrası her modül için İK ve gerekli görülen tüm ekiplere, yüklenici ile BKM'nin belirleyeceği yeterli sürede **eğitim** verilecektir. | TŞ; ST — Madde 33.1 | Y |
| SLA-007 | Zafiyet giderme SLA'sı: kritik/yüksek 30 gün, orta/düşük 90 gün (bkz. SEC-012). | TŞ | K |
| SLA-008 | API entegrasyon tamamlama SLA'sı: bilgi paylaşımından itibaren en geç 10 iş günü (bkz. INT-014). | TŞ | Y |
| SLA-009 | En avantajlı birinci ve ikinci teklif sahibi firmalardan, **programın en az 10 kurumsal firma/kurumda kullanıldığına dair referans** istenecektir (ihale aşaması niteliği kriteri). | İŞ — Madde 45 (diğer hususlar) | K (ihale uygunluk kriteri) |
| SLA-010 | Kesin/ek kesin teminatın yarısı iş kabulünden sonra, kalanı **garanti süresi (12 ay) dolduktan sonra** iade edilir. | ST — Madde 11.4.1 | K |
| SLA-011 | Alt yüklenici çalıştırılamaz — işin tamamı yüklenicinin kendisi tarafından yapılacaktır (kaynak/teslimat riski açısından önemli). | İŞ — Madde 18.1; ST — Madde 15.1 | K (risk) |

---

## 15. Teslim Tarihleri ve Kritik Modüller

| Kapsam | Süre | Modüller | Kaynak |
|---|---|---|---|
| **İlk 90 gün — Kritik (yıldızlı) modüller** | İşe başlamadan itibaren **90 takvim günü** | Özlük*, İzin*, İşe Alım*, Zaman Yönetimi (PDKS)*, Performans* (5 modül, toplam ödeme payı %56) | TŞ — Ödeme Koşulları; ST — Madde 16.1.2 tablo satır 1 |
| **Toplam 180 gün — Tüm modüller** | İşe başlamadan itibaren **180 takvim günü** | Kalan 8-9 modül: Eğitim, Harcırah/Seyahat/Masraf, Uyarı/Ceza/Ödül/Disiplin, Bordro, Anket, Talep ve Fikir, Sosyal Kulüp, Randevu (+ ödeme payı atanmamış Doküman Yönetimi modülü) | ST — Madde 9.1 |
| İşe başlama | Sözleşme imzalanmasından itibaren **3 gün** içinde | — | ST — Madde 10.2 |

**Modül teslim/ödeme mekanizması:** Her modül tamamlandıkça idareye teslim edilir → idare muayene/kabul yapar → ilgili modülün yüzdesel hakedişi ödenir [ST — Madde 12.1]. Muayene/kabul süreci, işin kabule elverişli teslim tarihinden itibaren **15 iş günü** içinde tamamlanır ve kesin hesap raporu çıkarılır [ST — Madde 20.3].

**Ceza rejimi (özet — detay Bölüm 17'de çelişkili olarak işaretlenmiştir):**
- Modül 90 günlük süreyi aşarsa: gecikilen her takvim günü için **ilgili modülün hakediş bedelinin %0,5'i** oranında gecikme cezası [TŞ].
- Gecikme 30 günü aşarsa: modülün toplam hakediş bedelinden ayrıca **%2 sabit ceza** kesintisi [TŞ].
- Kritik modülde gecikme 60 günü aşarsa **veya** toplam cezalar proje bedelinin **%20**'sine ulaşırsa: İdare tek taraflı, kusura dayalı fesih + kesin teminatın irat kaydı + zarar tazmini hakkı [TŞ].
- *(Sözleşme Tasarısı'ndaki tablo farklı oranlar öngörmektedir — bkz. Bölüm 17, Çelişki #2.)*

---

## 16. Kabul Kriterleri

1. **Modül bazlı kısmi kabul:** Sözleşmenin 12.1. maddesinde belirtilen modüller tamamlandıkça ayrı ayrı kabul yapılabilir [ST — Madde 20.1].
2. **Talep ve teslim:** İş/modül tamamlandığında yüklenici dilekçeyle idareye başvurur; masrafı yükleniciye ait olmak üzere, başvurunun idareye ulaşmasından itibaren **3 iş günü** içinde teslim alınır [ST — Madde 20.2].
3. **Muayene ve kabul:** "Hizmet Alımları Muayene ve Kabul Yönetmeliği" ve Hizmet İşleri Genel Şartnamesi hükümlerine göre, kabule elverişli teslim tarihinden itibaren **15 iş günü** içinde yapılır; kesin hesap raporu çıkarılır [ST — Madde 20.3].
4. **Garanti başlangıcı:** Kurulum + canlıya geçişin sorunsuz tamamlanmasından itibaren 12 ay garanti başlar [ST — Madde 20.3, Madde 34.1].
5. **Ödeme koşulu:** Kabul sonrası hakediş raporu yüklenici/vekili tarafından imzalandığı tarihten itibaren 30 gün içinde tahakkuk, devamında 30 gün içinde ödeme yapılır [ST — Madde 12.1.1].
6. **Referans şartı (ihale aşamasında, kabul öncesi bir ön-koşul):** En avantajlı 1. ve 2. teklif sahibinden en az 10 kurumsal referans istenir [İŞ — Madde 45].
7. **Kabul için zımni ön koşullar (teknik şartnameden türetilmiş, "Varsayım" işaretli):**
   - **Varsayım:** Kabul öncesi ilgili modülün, Bölüm 6-7'de tanımlanan güvenlik gereksinimlerini (TLS, RBAC, loglama vb.) sağladığının doğrulanması beklenir; dokümanlarda "modül kabul kriterleri" ile "güvenlik gereksinimleri" arasında açık bir bağlantı kurulmamıştır, bu nedenle UAT (Kullanıcı Kabul Testi) planına bu maddelerin dahil edilmesi önerilir.
   - **Varsayım:** Her modülün kabulünde ilgili entegrasyonların (bordro, LDAP/AD, Splunk/Humio vb.) da çalışır durumda olması beklenir; dokümanda modül bazında ayrı bir "entegrasyon kabul kriteri" tanımlanmamıştır.

---

## 17. Belirsiz, Çelişkili veya Teknik Olarak Riskli Maddeler

### Çelişki #1 — Modül Sayısı Uyuşmazlığı (13 vs 14)
İdari Şartname işi "**13 Modülden** oluşan" olarak tanımlar [İŞ — Madde 2.1(ç)] ve ödeme/ceza tablosu tam olarak 13 modül yüzdesi listeler (toplam %100) [TŞ — Ödeme Koşulları; ST — Madde 12.1]. Ancak Teknik Şartname **"Doküman Yönetimi — Görev Tanımları ve Organizasyon Şeması Modülü"** başlığı altında ayrı, kapsamlı bir fonksiyonel gereksinim seti tanımlar [TŞ]. Bu modülün ödeme tablosunda **hiçbir yüzdesi yoktur**. **Risk:** Bu modül geliştirilmesi zorunlu mu, zorunluysa hangi bedel/süre kapsamında teslim edilecek, hangi ödeme kalemine dahil sayılacak — belirsiz.

### Çelişki #2 — Gecikme Cezası Hesap Tabanı ve Oranı Uyuşmazlığı
- **Teknik Şartname:** 90 günlük süreyi aşan modül için, gecikilen her gün için **"yalnızca geciken o modüle ait hakediş bedelinin %0,5'i"** ceza uygulanır; 30 günü aşarsa modülün toplam hakedişinden ayrıca **%2** sabit kesinti.
- **Sözleşme Tasarısı Madde 16.1.2 (tablo):** Aynı ihlal için ceza oranı **"On Binde 5" (%0,05) — "İlk Sözleşme Bedeli Üzerinden"** (yani toplam sözleşme bedeli üzerinden, modül hakedişi değil) hesaplanacağı belirtilmiştir; ayrıca "Aykırılık Sayısı" sütununda bu ihlalin **5 kez** tekrarı ve toplamda **30 aykırılık**a ulaşılması halinde 4735 sayılı Kanun m.20(b) uyarınca protestosuz fesih öngörülmüştür — bu, teknik şartnamenin "60 gün gecikme = fesih" kuralından tamamen farklı bir mekanizmadır.
- **Sonuç:** Aynı ihlal için iki doküman **farklı ceza tabanı (modül hakedişi vs. toplam sözleşme bedeli) ve farklı oran (%0,5/gün vs %0,05/gün)** öngörmektedir. %13'lük bir modülde bu, ~0,065%/gün (TŞ) ile 0,05%/gün (ST) arasında yakın ama farklı; %3'lük küçük bir modülde ise 0,015%/gün (TŞ) ile 0,05%/gün (ST) arasında **>3 kat fark** yaratır. **Bu, sözleşme öncesi mutlaka netleştirilmesi gereken kritik bir çelişkidir — proje risk teminatı ve ceza maruziyeti doğrudan etkilenir.**

### Çelişki #3 — Fesih Eşiği Uyuşmazlığı (%20 vs %30)
- **Teknik Şartname:** Toplam kesilen cezaların proje bedelinin **%20**'sine ulaşması, fesih sebebidir.
- **Sözleşme Tasarısı Madde 16.1.4:** Toplam ceza tutarı **hiçbir durumda ilk sözleşme bedelinin %30'unu geçemez**; %30'a ulaşıldığında fesih uygulanır.
- **Sonuç:** İki farklı eşik (%20 / %30) aynı fesih senaryosu için tanımlanmıştır. Hangisinin bağlayıcı olacağı (İdari Şartname Madde 8.2'deki doküman öncelik sırasına göre Sözleşme Tasarısı, Teknik Şartname'den **önce** gelir — bu nedenle sözleşmedeki %30 muhtemelen esas alınacaktır, ancak açık çelişki idareye sorulmalıdır).

### Çelişki/Belirsizlik #4 — RTO/RPO Sayısal Hedefleri Eksik
Teknik Şartname, yedekleme periyodunun ve "geri dönme testlerinin RTO/RPO hedefleri belirtilerek" şartnamede yer alması gerektiğini söyler, ancak **hiçbir sayısal RTO/RPO değeri verilmemiştir**. Bu bir doküman içi kendine referans eksikliğidir (kural konmuş, değer atanmamış).

### Çelişki/Belirsizlik #5 — On-premise Şartı ile SaaS Referansı Arasında Gerilim
Teknik şartname "Yazılım On-premise olmalıdır" der, ancak aynı bölümde "Firmanın bulut hizmeti (SaaS) özelinde geliştirdiği ek bir özellik olması durumunda ilgili geliştirmeler BKM onayı doğrultusunda BKM sunucularına da uyarlanacaktır" ifadesi geçer. Bu, teklif verecek firmanın bir **SaaS ürününün de bulunabileceğini** varsayar — saf on-premise geliştirilmiş bir ürün için bu madde anlamsızdır. **Belirsizlik:** Şartname, hibrit (SaaS+on-prem) teklif verebilecek firmaları mı öngörüyor, yoksa yalnızca kalıp bir madde mi — netleştirilmeli.

### Çelişki/Belirsizlik #6 — Veritabanı Seçimi Belirsiz Değerlendirme Kriteri
"PostgreSQL öncelikli kabul edilebilecek olup, diğer lisanslı Databaseler ayrıca değerlendirilecek ve kabul edilmeyebilecektir" ifadesi, hangi kriterlere göre "değerlendirileceğini" ve "kabul edilmeyebileceğini" tanımlamaz — nesnel/şeffaf bir değerlendirme kriteri yoktur; ihale itirazına açık, belirsiz bir madde.

### Çelişki/Belirsizlik #7 — "Birim Fiyat Sözleşme" Tanımı ile Tek Kalem EK Listesi Arasında Uyumsuzluk
Sözleşme "birim fiyat sözleşme" olarak nitelenir ve "her bir iş kaleminin miktarı ile birim fiyatların çarpımı" esas alınacağı belirtilir [ST — Madde 6.1], ancak İdari Şartname EK'inde tek bir iş kalemi vardır ("1 Adet Dijital İK Yönetim Sistemi Hizmet Alımı") [İŞ — EK]. Modül bazlı yüzdesel dağılım ise ayrı bir tabloda (miktar/birim fiyat mantığı dışında) tanımlanmıştır. **Fiili olarak bu bir götürü bedel (lump-sum) + kilometre taşı bazlı (milestone) ödeme yapısıdır**, ancak "birim fiyat" terminolojisiyle adlandırılması kavramsal bir tutarsızlıktır.

### Çelişki/Belirsizlik #8 — Garanti/Bakım Başlangıç Tetikleyicisi Belirsiz
"Tüm modüllerin tamamlanıp canlıya geçiş işleminden itibaren 12 ay" ifadesi [TŞ; ST — Madde 33.1] ile "Kurulum işlemleri ile birlikte canlıya geçiş işlemlerinin sorunsuz tamamlanmasından itibaren ürün 12 ay boyunca garantilidir" ifadesi [ST — Madde 20.3, Madde 34.1] birlikte okunduğunda: 90 günde teslim edilen kritik modüller, 180. güne kadar geçen ~90 günlük süre boyunca "garantisiz" mi kalacak, yoksa her modül kendi canlıya geçişiyle mi garantiye girecek — açık değildir. Proje risk yönetimi ve kabul-ödeme akışı için netleştirilmesi şarttır.

### Çelişki/Belirsizlik #9 — Mobil Uygulamanın Niteliği Belirsiz
"Uygulamanın mobil cihazlar üzerinde IOS/Android platformlarından çalıştırılabilmesi" şartı, native uygulama mı, responsive mobil web mi, yoksa PWA mı olması gerektiğini belirtmez. App Store/Play Store dağıtımı, MDM entegrasyonu, offline kullanım gibi konular da tanımsızdır.

### Belirsizlik #10 — "Teşekkür Kartı / Birlikte Güzel Anlar" Programının Modül Bağı Belirsiz
Bu ödül programı, Uyarı/Ceza/Ödül ve Disiplin Modülü bölümünün hemen ardından yer almasına rağmen ayrı bir başlık altında tanımlanmıştır ve ödeme tablosunda ayrı bir kalem değildir. Disiplin modülünün %6'lık payına dahil mi, yoksa ayrı bir kapsam dışı geliştirme mi olduğu belirsizdir.

### Risk #11 — Alt Yüklenici Yasağı + Tek Yüklenici + 90/180 Günlük Agresif Takvim
İşin tamamının **tek bir yüklenici** tarafından, **alt yüklenici kullanılmadan** [İŞ — Madde 18.1; ST — Madde 15.1], 14 farklı fonksiyonel modülün (5'i 90 günde, kalanı 180 günde) geliştirilmesi/uyarlanması + AD/LDAP + SSO + Splunk/Humio + PDKS + ERP + Banka + BES + Sağlık Sigortası entegrasyonları + pentest + ISO 27001/27701/SOC2 sertifikasyonu ile birlikte teslim edilmesi **yüksek teslimat riski** taşır. Bu, teklif veren firmaların gerçekçi biçimde ne kadarının hazır/parametrik bir ürünle geldiğine bağlıdır; sıfırdan geliştirme senaryosunda takvim gerçekçi değildir.

### Risk #12 — Fiyat Farkı ve Avans Yasağı ile Sabit Fiyat + Alt Yüklenici Yasağının Birleşimi
Fiyat farkı verilmeyecek [ST — Madde 14.2], avans verilmeyecek [ST — Madde 13.1], alt yüklenici yasak — yüklenicinin proje süresince tüm nakit akışını kendi kaynaklarından finanse etmesi gerekir; bu, teklif fiyatlarını yapay şekilde şişirebilir veya küçük/yeni firmaları saf dışı bırakabilir (10 kurumsal referans şartıyla birleşince, fiilen yalnızca büyük/yerleşik firmaların teklif verebileceği bir yapı ortaya çıkar).

### Risk #13 — Performans/Ölçeklenebilirlik NFR'lerinin Sayısal Olarak Tanımlanmamış Olması
Yalnızca kullanıcı sayısı (300) ve destek SLA'sı (2sa/4sa) verilmiş; sayfa yanıt süresi, eşzamanlı kullanıcı, uptime yüzdesi gibi klasik NFR'ler yoktur. Bu, kabul testlerinde (UAT) "performans yeterli mi" sorusunun öznel kalmasına yol açar.

---

## 18. İdareye Sorulması Gereken Sorular

1. Teknik Şartname'de tanımlanan **"Doküman Yönetimi — Görev Tanımları ve Organizasyon Şeması"** modülü, sözleşme kapsamındaki 13 modülden biri midir? Öyleyse hangi mevcut yüzdesel paya dahildir; değilse ayrı bir bedel/süre mi öngörülmektedir? (Çelişki #1)
2. Gecikme cezası hesaplamasında **Teknik Şartname'deki "modül hakedişi üzerinden %0,5/gün + %2 ilave"** formülü mü, yoksa **Sözleşme Tasarısı Madde 16.1.2'deki "ilk sözleşme bedeli üzerinden on binde 5/gün"** formülü mü esas alınacaktır? (Çelişki #2)
3. Toplam ceza / fesih eşiği **%20** midir (Teknik Şartname) yoksa **%30** mudur (Sözleşme Tasarısı Madde 16.1.4)? (Çelişki #3)
4. Yedekleme ve felaket kurtarma için hedeflenen **somut RTO (Recovery Time Objective) ve RPO (Recovery Point Objective)** değerleri nedir? (Çelişki/Belirsizlik #4)
5. On-premise şartına rağmen bahsi geçen "SaaS'a özel geliştirilen ek özelliklerin BKM sunucusuna uyarlanması" maddesi hangi senaryo için öngörülmüştür? Teklif verecek firmaların hibrit (SaaS+on-prem) modelle gelmesi kabul edilebilir mi? (Çelişki/Belirsizlik #5)
6. PostgreSQL dışındaki veritabanları (ör. MS SQL Server, Oracle) hangi somut kriterlere göre değerlendirilecek ve hangi durumlarda reddedilecektir? (Çelişki/Belirsizlik #6)
7. Sözleşme "birim fiyat sözleşme" olarak tanımlanmasına rağmen EK'te tek iş kalemi bulunmaktadır — modül bazlı ödeme yüzdeleri, birim fiyat teklif cetveli mantığıyla nasıl ilişkilendirilecektir? (Çelişki/Belirsizlik #7)
8. 12 aylık garanti/bakım süresi, **her modülün kendi canlıya geçiş tarihinden itibaren mi**, yoksa **son (14./13.) modülün canlıya geçtiği tarihten itibaren tüm modüller için topluca mı** başlayacaktır? 90. günde teslim edilen kritik modüller, 180. güne kadar garantisiz mi kalacaktır? (Çelişki/Belirsizlik #8)
9. Mobil erişim için **native uygulama (App Store/Play Store)** mi yoksa **mobil web/PWA** mı beklenmektedir? Cihaz yönetimi (MDM) veya offline kullanım bir gereksinim midir? (Çelişki/Belirsizlik #9)
10. "Teşekkür Kartı / Birlikte Güzel Anlar" ödül programı, Uyarı/Ceza/Ödül ve Disiplin Modülü'nün (%6) bir alt bileşeni midir, yoksa ayrı bir kapsam maddesi midir? (Belirsizlik #10)
11. Eşzamanlı kullanıcı sayısı, beklenen sayfa yanıt süresi, sistem çalışma süresi (uptime) hedefi gibi somut performans/NFR hedefleri var mıdır? (Risk #13)
12. Norm kadro çalışması ve organizasyon şeması modülleri, İşe Alım modülünün "norm girilmemişse talep oluşturulamaz" kuralı ile aynı anda **90 günlük kritik teslim kapsamına** (İşe Alım* modülü) mi giriyor? Norm kadro fonksiyonu Özlük modülünün (90 gün) bir parçası olarak mı ele alınacak?
13. Veri merkezi/barındırma lokasyonu için coğrafi bir kısıt (yalnızca Türkiye sınırları içinde barındırma) var mıdır — BKM'nin finansal altyapı kuruluşu olması nedeniyle BDDK/başka düzenleyici kısıtlar geçerli midir?
14. "En az 10 kurumsal firma/kurum referansı" şartı yalnızca ihale sürecinde en avantajlı ilk iki teklife mi uygulanacaktır, yoksa sözleşme imzalanan yüklenicinin de proje süresince bu referansları güncel tutması mı beklenmektedir?
15. Kısmi kabul yapılan (90 günde teslim edilen) kritik modüllerin, sonraki modüllerin geliştirilmesi sırasında yapılacak platform/altyapı değişikliklerinden (ör. ortak onay motoru, ortak bildirim motoru güncellemeleri) etkilenmemesi nasıl garanti altına alınacaktır?

---

## 19. Gereksinim İzlenebilirlik Tablosu

> Aşağıdaki tablo, bu dokümanda tanımlanan tüm gereksinim kimliklerinin kaynak doküman/madde, modül ve teslim fazı (90 gün / 180 gün / Ortak) ile eşleştirmesini özetler. Öncelik değerleri ilgili bölümlerdeki detaylı tablolarda verilmiştir.

| ID Aralığı | Kapsam / Modül | Kaynak | Teslim Fazı |
|---|---|---|---|
| FR-000 – FR-014 | Genel Platform / Ortak Fonksiyonlar | TŞ | Ortak (tüm modüllerde) |
| FR-100 – FR-117 | İzin Yönetim Modülü | TŞ | **90 gün** |
| FR-200 – FR-214 | Eğitim Yönetim Modülü (+e-Eğitim, Etkinlik, Yolculuk) | TŞ | 180 gün |
| FR-300 – FR-312 | Performans Yönetim Modülü | TŞ | **90 gün** |
| FR-400 – FR-409 | Özlük Modülü | TŞ | **90 gün** |
| FR-500 – FR-507 | Harcırah/Seyahat/Avans ve Masraf Yönetimi Modülü | TŞ | 180 gün |
| FR-600 – FR-605 | Zaman Yönetimi Modülü (PDKS) | TŞ | **90 gün** |
| FR-700 – FR-707 | Anket Modülü (+QR) | TŞ | 180 gün |
| FR-800 – FR-804 | Talep ve Fikir Modülü | TŞ | 180 gün |
| FR-900 – FR-905 | Sosyal Kulüp Modülü | TŞ | 180 gün |
| FR-1000 – FR-1012 | Doküman Yönetimi/Görev Tanımları/Org Şeması Modülü | TŞ | **Belirsiz (bkz. Bölüm 17 #1)** |
| FR-1100 – FR-1118 | Bordro ve Bordroya Hazırlık Modülü | TŞ | 180 gün |
| FR-1200 – FR-1207 | Randevu Modülü | TŞ | 180 gün |
| FR-1300 – FR-1318 | Uyarı/Ceza/Ödül ve Disiplin Modülü (+Teşekkür Kartı) | TŞ | 180 gün |
| FR-1400 – FR-1415 | İşe Alım Süreci Modülü | TŞ | **90 gün** |
| FR-1500 – FR-1503 | Mobil Kullanım | TŞ | Ortak |
| NFR-001 – NFR-025 | Ortak Platform / Performans / Ölçeklenebilirlik | TŞ | Ortak |
| SEC-001 – SEC-040 | Güvenlik, Yetkilendirme, Kimlik Doğrulama | TŞ, İŞ | Ortak (kabule esas kritik) |
| INT-001 – INT-016 | Entegrasyonlar | TŞ | Ortak (modül bazlı devreye girer) |
| OPS-001 – OPS-013 | Loglama / İzleme / Audit | TŞ | Ortak |
| DEP-001 – DEP-024 | On-premise, Altyapı, Backup/DR | TŞ | Ortak (kurulum fazı) |
| SLA-001 – SLA-011 | Destek, Bakım, Garanti, SLA | TŞ, ST, İŞ | Proje sonrası + süreklilik |

---

## Go/No-Go Riskleri

| # | Risk | Etki | Go/No-Go Değerlendirmesi | Önerilen Aksiyon |
|---|---|---|---|---|
| 1 | Ceza formülü/tabanı ve fesih eşiği çelişkisi (Teknik Şartname %20/%0,5 vs Sözleşme %30/%0,05) çözülmeden sözleşme imzalanırsa, yüklenici ile İdare arasında hakediş/ceza anlaşmazlığı riski çok yüksek. | **Kritik** — mali/hukuki | **NO-GO** (netleşmeden ilerleme) | İhale öncesi zeyilname ile netleştirilmeli (bkz. İŞ Madde 14) |
| 2 | Doküman Yönetimi modülünün ödeme/teslim kapsamı dışında kalması, yüklenicinin bu modülü "kapsam dışı" sayıp teslim etmeme riski. | Yüksek — kapsam | Koşullu Go | Zeyilname ile modülün ödeme yüzdesi netleştirilmeli |
| 3 | 90 günlük süre içinde 5 kritik modülün (Özlük, İzin, İşe Alım, PDKS, Performans) — hepsi birbirine bağımlı organizasyon/özlük altyapısını paylaşan modüller — tek yüklenici tarafından, alt yüklenici olmadan teslimi gerçekçilik riski. | Yüksek — takvim | Koşullu Go | Teklif değerlendirmede referans/vaka analizi, demo/POC istenmesi önerilir |
| 4 | RTO/RPO ve performans NFR'lerinin sayısal olarak tanımsız olması, kabul testlerinde (UAT) objektif ölçüt eksikliği yaratır. | Orta — kabul süreci | Koşullu Go | Sözleşme öncesi ek teknik protokolle (RTO/RPO, yanıt süresi) tamamlanmalı |
| 5 | PostgreSQL dışı veritabanı tekliflerinin belirsiz kriterle reddedilebilme riski, ihaleye itiraz/rekabet kısıtlaması olasılığı. | Orta — ihale hukuku | Koşullu Go | Değerlendirme kriterleri objektif hale getirilmeli |
| 6 | Alt yüklenici yasağı + avans yasağı + fiyat farkı yasağı birleşimi, teklif havuzunu daraltabilir, tekliflerin yapay yüksek gelmesine yol açabilir. | Orta — ticari | Go (idare tercihi, ancak bilinçli) | Pazar araştırması ile teklif sayısı/rekabet düzeyi izlenmeli |
| 7 | Mobil uygulamanın native/web belirsizliği, teklif karşılaştırmasında elma-armut kıyaslaması riski yaratır. | Orta — değerlendirme | Koşullu Go | Netleştirilip teknik şartnameye eklenmeli |
| 8 | Garanti/bakım başlangıç tanımı belirsizliği, 90 günde teslim edilen modüllerin 90 gün "garantisiz" kalma ihtimali — üretim ortamında risk. | Yüksek — operasyonel | **NO-GO** (netleşmeden ilerleme) | Zeyilname ile "her modül kendi canlıya geçişiyle garantiye girer" şeklinde netleştirilmesi önerilir |
| 9 | ISO 27001/27701/SOC2 Type II sertifikasyon şartının hem yüklenici hem barındırma veri merkezi için istenmesi, on-premise BKM veri merkezinde barındırma ile "veri merkezi sertifikasyonu" beklentisi arasında olası çelişki (BKM'nin kendi veri merkezi mi sertifikalı olacak, yoksa yüklenicinin?). | Orta — uyum | Koşullu Go | Netleştirilmeli: sertifikasyon BKM veri merkezine mi, yüklenici kurumsal ortamına mı aittir? |

---

*Doküman sonu — Bu, yalnızca gereksinim analizi çıktısıdır. Teknoloji seçimi, mimari tasarım veya kod/iskelet üretimi bu aşamada yapılmamıştır.*
