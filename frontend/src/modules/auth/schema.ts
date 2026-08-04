import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().min(1, 'E-posta zorunludur.').email('Geçerli bir e-posta adresi girin.'),
  password: z.string().min(1, 'Parola zorunludur.'),
})

export type LoginFormValues = z.infer<typeof loginSchema>
