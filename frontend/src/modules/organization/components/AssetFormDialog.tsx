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
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { employeeAssetSchema, type EmployeeAssetFormValues } from '../schema'

type AssetFormDialogProps = {
  open: boolean
  submitting: boolean
  errorMessage: string | null
  onSubmit: (values: EmployeeAssetFormValues) => void
  onClose: () => void
}

export function AssetFormDialog({ open, submitting, errorMessage, onSubmit, onClose }: AssetFormDialogProps) {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmployeeAssetFormValues>({
    resolver: zodResolver(employeeAssetSchema),
    defaultValues: { itemName: '', deliveredAt: '' },
  })

  useEffect(() => {
    if (open) {
      reset({ itemName: '', deliveredAt: '' })
    }
  }, [open, reset])

  return (
    <Dialog open={open} onClose={onClose} fullScreen={fullScreen} maxWidth="xs" fullWidth>
      <DialogTitle>Yeni Zimmet</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 0.5 }}>
            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
            <TextField
              {...register('itemName')}
              label="Zimmet Kalemi"
              autoFocus
              fullWidth
              error={!!errors.itemName}
              helperText={errors.itemName?.message}
            />
            <Controller
              control={control}
              name="deliveredAt"
              render={({ field, fieldState }) => (
                <DatePicker
                  label="Teslim Tarihi"
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(date) => field.onChange(date?.isValid() ? date.format('YYYY-MM-DD') : '')}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!fieldState.error,
                      helperText: fieldState.error?.message,
                    },
                  }}
                />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={submitting}>
            Vazgeç
          </Button>
          <Button type="submit" variant="contained" loading={submitting}>
            Ekle
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
