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
