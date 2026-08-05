import { zodResolver } from '@hookform/resolvers/zod'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import { useTheme } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { suggestionCategorySchema, type SuggestionCategoryFormValues } from '../schema'

type SuggestionCategoryFormDialogProps = {
  open: boolean
  mode: 'create' | 'edit'
  initialName?: string
  submitting: boolean
  errorMessage: string | null
  onSubmit: (values: SuggestionCategoryFormValues) => void
  onClose: () => void
}

// `organization.JobTitleFormDialog`'daki AYNI desen.
export function SuggestionCategoryFormDialog({
  open,
  mode,
  initialName,
  submitting,
  errorMessage,
  onSubmit,
  onClose,
}: SuggestionCategoryFormDialogProps) {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SuggestionCategoryFormValues>({
    resolver: zodResolver(suggestionCategorySchema),
    defaultValues: { name: initialName ?? '' },
  })

  useEffect(() => {
    if (open) {
      reset({ name: initialName ?? '' })
    }
  }, [open, initialName, reset])

  return (
    <Dialog open={open} onClose={onClose} fullScreen={fullScreen} maxWidth="xs" fullWidth>
      <DialogTitle>{mode === 'create' ? 'Yeni Kategori' : 'Kategoriyi Düzenle'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent>
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}
          <TextField
            {...register('name')}
            label="Kategori Adı"
            autoFocus
            fullWidth
            error={!!errors.name}
            helperText={errors.name?.message}
          />
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
