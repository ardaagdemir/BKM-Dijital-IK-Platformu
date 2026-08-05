import { zodResolver } from '@hookform/resolvers/zod'
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControlLabel from '@mui/material/FormControlLabel'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useEffect } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { surveySchema, type SurveyFormValues } from '../schema'

type SurveyFormDialogProps = {
  open: boolean
  submitting: boolean
  errorMessage: string | null
  onSubmit: (values: SurveyFormValues) => void
  onClose: () => void
}

const EMPTY_VALUES: SurveyFormValues = {
  question: '',
  options: [{ text: '' }, { text: '' }],
  anonymous: false,
}

// US-08E.1.1: Anket oluşturma — soru + dinamik seçenek listesi (en az iki).
// Codebase'de İLK `useFieldArray` kullanımı (bkz. schema.ts'teki `options`
// dizisi) — anket seçenek sayısı sabit DEĞİL, gerçek bir dinamik liste
// ihtiyacı bunu gerektirdi.
export function SurveyFormDialog({ open, submitting, errorMessage, onSubmit, onClose }: SurveyFormDialogProps) {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SurveyFormValues>({ resolver: zodResolver(surveySchema), defaultValues: EMPTY_VALUES })

  const { fields, append, remove } = useFieldArray({ control, name: 'options' })

  useEffect(() => {
    if (open) {
      reset(EMPTY_VALUES)
    }
  }, [open, reset])

  return (
    <Dialog open={open} onClose={onClose} fullScreen={fullScreen} maxWidth="sm" fullWidth>
      <DialogTitle>Yeni Anket</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 0.5 }}>
            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
            <TextField
              {...register('question')}
              label="Soru"
              autoFocus
              fullWidth
              multiline
              rows={2}
              error={!!errors.question}
              helperText={errors.question?.message}
            />

            <Typography variant="subtitle2">Seçenekler</Typography>
            {fields.map((field, index) => (
              <Stack key={field.id} direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                <TextField
                  {...register(`options.${index}.text` as const)}
                  label={`Seçenek ${index + 1}`}
                  fullWidth
                  error={!!errors.options?.[index]?.text}
                  helperText={errors.options?.[index]?.text?.message}
                />
                <IconButton
                  aria-label={`${index + 1}. seçeneği kaldır`}
                  onClick={() => remove(index)}
                  disabled={fields.length <= 2}
                  sx={{ mt: 1 }}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Stack>
            ))}
            {errors.options?.root?.message && <Alert severity="error">{errors.options.root.message}</Alert>}
            <Button startIcon={<AddIcon />} onClick={() => append({ text: '' })} sx={{ alignSelf: 'flex-start' }}>
              Seçenek Ekle
            </Button>

            <FormControlLabel control={<Checkbox {...register('anonymous')} />} label="Anonim anket" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={submitting}>
            Vazgeç
          </Button>
          <Button type="submit" variant="contained" loading={submitting}>
            Oluştur
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
