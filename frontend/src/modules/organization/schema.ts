import { z } from 'zod'

// Bölüm 8: "zod şemaları backend hata mesajlarıyla BİREBİR aynı Türkçe
// metni kullanır" — bkz. OrganizationUnitService/JobTitleService.
export const unitSchema = z.object({
  name: z.string().min(1, 'Birim adı boş olamaz.'),
  parentId: z.number().nullable(),
})

export type UnitFormValues = z.infer<typeof unitSchema>

export const jobTitleSchema = z.object({
  name: z.string().min(1, 'Unvan adı boş olamaz.'),
})

export type JobTitleFormValues = z.infer<typeof jobTitleSchema>

// Backend'in EmployeeService.isValidNationalId'siyle BİREBİR AYNI algoritma
// (bkz. organization/EmployeeService.java) — submit ÖNCESİ anında geri
// bildirim için; backend YİNE DE nihai doğrulayıcıdır (bkz. Bölüm 13.5).
export function isValidNationalId(value: string): boolean {
  if (!/^\d{11}$/.test(value) || value[0] === '0') {
    return false
  }
  const digits = value.split('').map(Number)
  const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8]
  const evenSum = digits[1] + digits[3] + digits[5] + digits[7]
  const expectedTenth = (((oddSum * 7 - evenSum) % 10) + 10) % 10
  if (expectedTenth !== digits[9]) {
    return false
  }
  const firstTenSum = digits.slice(0, 10).reduce((sum, digit) => sum + digit, 0)
  const expectedEleventh = firstTenSum % 10
  return expectedEleventh === digits[10]
}

export const employeeSchema = z.object({
  firstName: z.string().min(1, 'Ad boş olamaz.'),
  lastName: z.string().min(1, 'Soyad boş olamaz.'),
  nationalId: z
    .string()
    .min(1, 'TC Kimlik No geçersiz.')
    .refine(isValidNationalId, { message: 'TC Kimlik No geçersiz.' }),
  hireDate: z.string().min(1, 'İşe giriş tarihi boş olamaz.'),
  email: z.string().min(1, 'E-posta boş olamaz.').email('Geçerli bir e-posta adresi girin.'),
})

export type EmployeeFormValues = z.infer<typeof employeeSchema>

// Bölüm 8: backend'in TEK-alanlı hata kısıtı — ProblemDetail.detail hangi
// ALANLA ilgili olduğunu belirtmez. Backend'in SABİT/bilinen mesaj
// metinleriyle BİREBİR eşleştirme MÜMKÜN olduğundan burada kullanılır;
// eşleşme yoksa yalnızca banner gösterilir (GARANTİ olan budur). 13.5
// (oluşturma) ve 13.7 (güncelleme) AYNI tabloyu paylaşır.
export const FIELD_ERROR_MESSAGES: Partial<Record<string, keyof EmployeeFormValues>> = {
  'Ad boş olamaz.': 'firstName',
  'Soyad boş olamaz.': 'lastName',
  'E-posta boş olamaz.': 'email',
  'İşe giriş tarihi boş olamaz.': 'hireDate',
  'TC Kimlik No geçersiz.': 'nationalId',
}

// Bölüm 13.7 — backend'in EmployeeService.assign'ıyla AYNI kural: her iki
// alan da zorunlu (bkz. "Organizasyon birimi boş olamaz."/"Unvan boş
// olamaz." — IllegalArgumentException, 400). Değerler <Select> ile uyumlu
// olması için string tutulur, submit'te Number()'a çevrilir.
export const assignmentSchema = z.object({
  organizationUnitId: z.string().min(1, 'Organizasyon birimi boş olamaz.'),
  jobTitleId: z.string().min(1, 'Unvan boş olamaz.'),
})

export type AssignmentFormValues = z.infer<typeof assignmentSchema>

// Bölüm 14.2 (US-03.3.1) — backend'de TÜM alanlar nullable (bkz.
// EmployeeProfileRequest) — bu yüzden hiçbiri `.min(1)` ile ZORUNLU
// kılınmaz; yalnızca DOLDURULMUŞSA biçim kontrolü yapılır (ör.
// graduationYear 4 haneli olmalı). Form değerleri her zaman string tutulur
// (DatePicker/TextField ile uyumlu), submit'te backend tipine çevrilir.
export const employeeProfileSchema = z.object({
  birthDate: z.string(),
  birthPlace: z.string(),
  gender: z.string(),
  city: z.string(),
  district: z.string(),
  addressLine: z.string(),
  educationLevel: z.string(),
  schoolName: z.string(),
  graduationYear: z.string().refine((value) => value === '' || /^\d{4}$/.test(value), {
    message: 'Geçerli bir yıl girin (4 haneli).',
  }),
  foreignLanguage: z.string(),
  languageLevel: z.string(),
})

export type EmployeeProfileFormValues = z.infer<typeof employeeProfileSchema>

// Bölüm 14.2 (US-03.3.2) — backend'in EmployeeAssetService.deliver'ıyla
// BİREBİR aynı mesajlar (bkz. "Zimmet kalemi adı boş olamaz."/"Teslim
// tarihi boş olamaz.").
export const employeeAssetSchema = z.object({
  itemName: z.string().min(1, 'Zimmet kalemi adı boş olamaz.'),
  deliveredAt: z.string().min(1, 'Teslim tarihi boş olamaz.'),
})

export type EmployeeAssetFormValues = z.infer<typeof employeeAssetSchema>

// Backend'in EmployeeAssetService.markReturned'ıyla BİREBİR AYNI mesaj.
export const returnAssetSchema = z.object({
  returnedAt: z.string().min(1, 'İade tarihi boş olamaz.'),
})

export type ReturnAssetFormValues = z.infer<typeof returnAssetSchema>
