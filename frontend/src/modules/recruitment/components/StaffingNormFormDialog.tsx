import { zodResolver } from '@hookform/resolvers/zod'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import type { JobTitle, OrganizationUnit } from '../../organization/types'
import { staffingNormSchema, type StaffingNormFormValues } from '../schema'

type StaffingNormFormDialogProps = {
  open: boolean
  mode: 'create' | 'edit'
  initialValues?: StaffingNormFormValues
  units: OrganizationUnit[]
  jobTitles: JobTitle[]
  submitting: boolean
  errorMessage: string | null
  onSubmit: (values: StaffingNormFormValues) => void
  onClose: () => void
}

const EMPTY_VALUES: StaffingNormFormValues = { organizationUnitId: '', jobTitleId: '', normCount: '' }

// `leave.LeaveTypeFormDialog`'daki AYNI iskelet — tek fark: PUT upsert
// semantiği (bkz. StaffingNormService.setNorm) nedeniyle "düzenle" modunda
// birim/unvan çifti KİLİTLİ (yalnızca normCount değiştirilebilir) — çiftin
// KENDİSİ, güncellenen kaydı BELİRLEYEN doğal anahtar.
export function StaffingNormFormDialog({
  open,
  mode,
  initialValues,
  units,
  jobTitles,
  submitting,
  errorMessage,
  onSubmit,
  onClose,
}: StaffingNormFormDialogProps) {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StaffingNormFormValues>({
    resolver: zodResolver(staffingNormSchema),
    defaultValues: initialValues ?? EMPTY_VALUES,
  })

  useEffect(() => {
    if (open) {
      reset(initialValues ?? EMPTY_VALUES)
    }
  }, [open, initialValues, reset])

  return (
    <Dialog open={open} onClose={onClose} fullScreen={fullScreen} maxWidth="xs" fullWidth>
      <DialogTitle>{mode === 'create' ? 'Yeni Norm Kadro' : 'Norm Kadroyu Güncelle'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 0.5 }}>
            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
            <Controller
              control={control}
              name="organizationUnitId"
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Organizasyon Birimi"
                  fullWidth
                  disabled={mode === 'edit'}
                  error={!!errors.organizationUnitId}
                  helperText={errors.organizationUnitId?.message}
                >
                  {units.map((unit) => (
                    <MenuItem key={unit.id} value={String(unit.id)}>
                      {unit.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              control={control}
              name="jobTitleId"
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Unvan"
                  fullWidth
                  disabled={mode === 'edit'}
                  error={!!errors.jobTitleId}
                  helperText={errors.jobTitleId?.message}
                >
                  {jobTitles.map((jobTitle) => (
                    <MenuItem key={jobTitle.id} value={String(jobTitle.id)}>
                      {jobTitle.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <TextField
              {...register('normCount')}
              type="number"
              label="Norm Kadro Sayısı"
              fullWidth
              error={!!errors.normCount}
              helperText={errors.normCount?.message}
            />
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
