import { zodResolver } from '@hookform/resolvers/zod'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { ApiError } from '../../../shared/api/ApiError'
import { FileUploadZone } from '../../../shared/components/FileUploadZone'
import { useApplyAsCandidate } from '../api/useApplyAsCandidate'
import { candidateApplicationSchema, type CandidateApplicationFormValues } from '../schema'

// `auth.LoginPage`'deki AYNI iskelet (bkz. o dosyadaki 100vh/100dvh notu) —
// bu sayfa da `AppShell` DIŞINDA, kimlik doğrulaması GEREKTİRMEYEN kendi
// minimal düzenine sahip (bkz. `app/router.tsx`'teki `/login` ile AYNI
// üst-seviye kardeş route).
const CareersApplyPageRoot = styled('div')`
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`

// US-05.2.1: Aday başvuru formu — projedeki İLK kimliksiz/genel-erişimli
// yazma akışı (bkz. backend `CandidateController` javadoc'u). Enfekte CV
// (US-09.7.2, 422) ve boş/geçersiz alanlar (400) AYRI mesajlarla gösterilir.
export function CareersApplyPage() {
  const applyAsCandidate = useApplyAsCandidate()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CandidateApplicationFormValues>({
    resolver: zodResolver(candidateApplicationSchema),
  })

  async function onSubmit(values: CandidateApplicationFormValues) {
    setSubmitError(null)
    try {
      await applyAsCandidate.mutateAsync(values)
      setSubmitted(true)
    } catch (error) {
      setSubmitError(error instanceof ApiError ? error.detail : 'Beklenmeyen bir hata oluştu, tekrar deneyin.')
    }
  }

  if (submitted) {
    return (
      <CareersApplyPageRoot>
        <Paper elevation={2} sx={{ width: '100%', maxWidth: 480, p: 4, textAlign: 'center' }}>
          <Typography variant="h5" component="h1" sx={{ mb: 2 }}>
            Başvurunuz Alındı
          </Typography>
          <Typography variant="body1">
            Başvurunuz için teşekkür ederiz. İK ekibimiz başvurunuzu inceleyip sizinle iletişime geçecektir.
          </Typography>
        </Paper>
      </CareersApplyPageRoot>
    )
  }

  return (
    <CareersApplyPageRoot>
      <Paper component="form" onSubmit={handleSubmit(onSubmit)} noValidate elevation={2} sx={{ width: '100%', maxWidth: 480, p: 4 }}>
        <Stack spacing={3}>
          <Typography variant="h5" component="h1" sx={{ textAlign: 'center' }}>
            Açık Pozisyona Başvur
          </Typography>

          {submitError && <Alert severity="error">{submitError}</Alert>}

          <TextField
            {...register('firstName')}
            label="Ad"
            fullWidth
            error={!!errors.firstName}
            helperText={errors.firstName?.message}
          />
          <TextField
            {...register('lastName')}
            label="Soyad"
            fullWidth
            error={!!errors.lastName}
            helperText={errors.lastName?.message}
          />
          <TextField
            {...register('email')}
            label="E-posta"
            type="email"
            fullWidth
            error={!!errors.email}
            helperText={errors.email?.message}
          />
          <TextField
            {...register('appliedPosition')}
            label="Başvurulan Pozisyon"
            fullWidth
            error={!!errors.appliedPosition}
            helperText={errors.appliedPosition?.message}
          />
          <Controller
            control={control}
            name="cv"
            render={({ field }) => (
              <FileUploadZone
                label="CV Dosyası"
                value={field.value ?? null}
                onChange={field.onChange}
                error={errors.cv?.message}
              />
            )}
          />

          <Button type="submit" variant="contained" size="large" fullWidth loading={isSubmitting}>
            Başvuruyu Gönder
          </Button>
        </Stack>
      </Paper>
    </CareersApplyPageRoot>
  )
}
