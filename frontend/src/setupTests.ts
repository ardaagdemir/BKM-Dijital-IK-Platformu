// SIRALAMA ÖNEMLİ: `./setupFileGlobals` `globalThis.File`/`Blob`'u `undici`
// import EDİLMEDEN ÖNCE düzeltir — `undici`, KENDİ modülü yüklenirken
// `globalThis.File`'ı BİR KEZ okuyup içsel webidl tip kontrolüne SABİTLİYOR;
// bu satır SONRA gelseydi undici hâlâ jsdom'un (yanlış) File'ını görürdü.
import './setupFileGlobals'
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { FormData, Headers, Request, Response, fetch } from 'undici'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { server } from '../test/msw/server'

// Bölüm 14.4: jsdom'un kendi File/FormData/Blob uygulaması, Node'un (undici
// tabanlı) `fetch`'iyle AYNI gerçeklikten (realm) GELMEZ. `multipart/form-data`
// gövdeli istekler (`apiClient.postMultipart`) bu uyumsuzluk yüzünden
// `fetch()` çağrısında SESSİZCE ASILI KALIYORDU (JSON istekleri etkilenmiyor
// — onlar gövde serileştirmesi için FormData KULLANMIYOR). Çözüm: fetch +
// FormData + ilişkili tipleri AYNI undici uygulamasından TUTARLI bir set
// olarak global'e YAZMAK (`File`/`Blob` zaten `./setupFileGlobals`'ta
// düzeltildi — undici@8 `File`'ı dışa AKTARMIYOR).
Object.assign(globalThis, { fetch, FormData, Headers, Request, Response })

// jsdom, window.matchMedia'yı UYGULAMAZ — MUI'nin useMediaQuery'si (bkz.
// AppShell.tsx breakpoint mantığı) bunsuz çağrıldığında patlar.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })
}

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  server.resetHandlers()
  window.localStorage.clear()
  cleanup()
})
afterAll(() => server.close())
