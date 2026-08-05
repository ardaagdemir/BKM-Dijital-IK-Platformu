import { Blob, File } from 'node:buffer'

// Bölüm 14.4: `undici`, KENDİ modülü yüklenirken `globalThis.File`'ı BİR
// KEZ okuyup içsel webidl tip kontrolüne SABİTLİYOR (bkz. `setupTests.ts`'teki
// ayrıntılı not) — bu yüzden global override, `undici`'nin import EDİLMESİNDEN
// ÖNCE, AYRI bir modülde gerçekleşmeli (ESM'in sıralı side-effect
// değerlendirmesine güvenerek). Bu dosya YALNIZCA bunun için var.
Object.assign(globalThis, { Blob, File })
