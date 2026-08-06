import { zodResolver } from '@hookform/resolvers/zod'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { EmployeeAutocomplete } from '../../../shared/components/EmployeeAutocomplete'
import * as organizationApi from '../../organization/api/organizationApi'
import { organizationKeys } from '../../organization/queryKeys'
import type { Employee } from '../../organization/types'
import { clubSchema, type ClubFormValues } from '../schema'

type ClubFormDialogProps = {
  open: boolean
  mode: 'create' | 'edit'
  initialValues?: { name: string; leaderId: number | null }
  submitting: boolean
  errorMessage: string | null
  onSubmit: (values: { name: string; leaderId: number | null }) => void
  onClose: () => void
}

// `organization.JobTitleFormDialog`'daki AYNI iskelet + `leaderId` alanı.
// `leaderId` RHF DIŞINDA yönetilir (bkz. schema.ts'teki not); düzenleme
// modunda mevcut lideri İSİMLE göstermek için `organizationApi.getEmployee`
// ile TEK seferlik bir ön-yükleme yapılır (`EmployeeAutocomplete` yalnızca
// isimle arama yapabilir, id'den geriye çözemez).
export function ClubFormDialog({
  open,
  mode,
  initialValues,
  submitting,
  errorMessage,
  onSubmit,
  onClose,
}: ClubFormDialogProps) {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const [leader, setLeader] = useState<Employee | null>(null)

  const { data: initialLeader } = useQuery({
    queryKey: organizationKeys.employees.detail(initialValues?.leaderId ?? 0),
    queryFn: () => organizationApi.getEmployee(initialValues!.leaderId!),
    enabled: open && !!initialValues?.leaderId,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClubFormValues>({ resolver: zodResolver(clubSchema), defaultValues: { name: initialValues?.name ?? '' } })

  useEffect(() => {
    if (open) {
      reset({ name: initialValues?.name ?? '' })
      setLeader(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialValues, reset])

  // Ayrı bir efekt: `initialLeader` sorgusu dialog AÇILDIKTAN SONRA
  // (asenkron) çözülür — yukarıdaki efektle BİRLEŞTİRİLİRSE, kullanıcı
  // `name` alanını değiştirirken sorgu tamamlandığında formu SIFIRLAR.
  useEffect(() => {
    if (open && initialLeader) {
      setLeader(initialLeader)
    }
  }, [open, initialLeader])

  function handleFormSubmit(values: ClubFormValues) {
    onSubmit({ name: values.name, leaderId: leader?.id ?? null })
  }

  return (
    <Dialog open={open} onClose={onClose} fullScreen={fullScreen} maxWidth="xs" fullWidth>
      <DialogTitle>{mode === 'create' ? 'Yeni Kulüp' : 'Kulübü Düzenle'}</DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 0.5 }}>
            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
            <TextField
              {...register('name')}
              label="Kulüp Adı"
              autoFocus
              fullWidth
              error={!!errors.name}
              helperText={errors.name?.message}
            />
            <EmployeeAutocomplete label="Kulüp Lideri" value={leader} onChange={setLeader} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={submitting}>
            Vazgeç
          </Button>
          <Button type="submit" variant="contained" loading={submitting}>
            {mode === 'create' ? 'Oluştur' : 'Kaydet'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
