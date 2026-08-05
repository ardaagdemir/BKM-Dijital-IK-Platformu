import { zodResolver } from '@hookform/resolvers/zod'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { ApiError } from '../../../shared/api/ApiError'
import { EmptyState } from '../../../shared/components/EmptyState'
import { ErrorState } from '../../../shared/components/ErrorState'
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton'
import { PageHeader } from '../../../shared/components/PageHeader'
import { ResponsiveTable, type ResponsiveTableColumn } from '../../../shared/components/ResponsiveTable'
import { StatusChip } from '../../../shared/components/StatusChip'
import { useToast } from '../../../shared/components/ToastProvider'
import { useMyEmployee } from '../../organization/api/useMyEmployee'
import { useCreateSuggestion } from '../api/useCreateSuggestion'
import { useSuggestionCategories } from '../api/useSuggestionCategories'
import { useSuggestions } from '../api/useSuggestions'
import { suggestionSchema, type SuggestionFormValues } from '../schema'
import { SUGGESTION_STATUS_LABELS } from '../statusLabels'
import type { Suggestion } from '../types'

// US-08F.1.1: Talep/fikir gönderme + "kendi taleplerim + durum" — roadmap'in
// ayrı `/suggestions/new` + `/suggestions` route'ları, `training.MyTrainingsPage`'deki
// AYNI "talep formu + kendi listem TEK sayfada" birleşimiyle karşılanıyor.
export function MySuggestionsPage() {
  const { showToast } = useToast()
  const {
    data: employee,
    isPending: isEmployeePending,
    isError: isEmployeeError,
    error: employeeError,
  } = useMyEmployee()
  const employeeMissing = isEmployeeError && employeeError instanceof ApiError && employeeError.status === 404

  const { data: categories, isPending: isCategoriesPending } = useSuggestionCategories()
  const categoryNameById = useMemo(() => new Map((categories ?? []).map((c) => [c.id, c.name])), [categories])

  const { data: suggestions, isPending: isSuggestionsPending, isError: isSuggestionsError, refetch } = useSuggestions(
    employee?.id,
  )
  const createSuggestion = useCreateSuggestion()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SuggestionFormValues>({
    resolver: zodResolver(suggestionSchema),
    defaultValues: { categoryId: '', description: '', anonymous: false },
  })

  if (isEmployeePending || isCategoriesPending) {
    return (
      <>
        <PageHeader title="Taleplerim" />
        <LoadingSkeleton rows={4} />
      </>
    )
  }

  if (employeeMissing) {
    return (
      <>
        <PageHeader title="Taleplerim" />
        <EmptyState message="Sisteme bağlı bir çalışan kaydınız bulunamadı." />
      </>
    )
  }

  if (isEmployeeError || !employee) {
    return <ErrorState message="Çalışan bilgileri yüklenemedi." onRetry={() => window.location.reload()} />
  }

  async function onSubmit(values: SuggestionFormValues) {
    setSubmitError(null)
    try {
      await createSuggestion.mutateAsync({
        categoryId: Number(values.categoryId),
        description: values.description,
        employeeId: values.anonymous ? null : employee!.id,
        anonymous: values.anonymous,
      })
      showToast('Talep gönderildi')
      reset({ categoryId: '', description: '', anonymous: false })
    } catch (error) {
      setSubmitError(error instanceof ApiError ? error.detail : 'Beklenmeyen bir hata oluştu, tekrar deneyin.')
    }
  }

  const columns: ResponsiveTableColumn<Suggestion>[] = [
    { key: 'category', header: 'Kategori', primary: true, render: (row) => categoryNameById.get(row.categoryId) ?? '—' },
    { key: 'description', header: 'Açıklama', render: (row) => row.description },
    { key: 'status', header: 'Durum', render: (row) => <StatusChip {...SUGGESTION_STATUS_LABELS[row.status]} /> },
  ]

  return (
    <>
      <PageHeader title="Taleplerim" />
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
          Yeni Talep / Fikir
        </Typography>
        {!categories?.length && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Henüz bir kategori tanımlanmadı, İK ile iletişime geçin.
          </Alert>
        )}
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Stack spacing={2}>
            {submitError && <Alert severity="error">{submitError}</Alert>}
            <Controller
              control={control}
              name="categoryId"
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Kategori"
                  fullWidth
                  disabled={!categories?.length}
                  error={!!errors.categoryId}
                  helperText={errors.categoryId?.message}
                >
                  {(categories ?? []).map((category) => (
                    <MenuItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <TextField
              {...register('description')}
              label="Açıklama"
              fullWidth
              multiline
              rows={3}
              error={!!errors.description}
              helperText={errors.description?.message}
            />
            <FormControlLabel control={<Checkbox {...register('anonymous')} />} label="Anonim gönder" />
            <Button type="submit" variant="contained" loading={isSubmitting} sx={{ alignSelf: 'flex-start' }}>
              Gönder
            </Button>
          </Stack>
        </form>
      </Paper>

      {isSuggestionsPending && <LoadingSkeleton rows={3} />}
      {isSuggestionsError && <ErrorState message="Taleplerim yüklenemedi." onRetry={() => refetch()} />}
      {!isSuggestionsPending && !isSuggestionsError && suggestions?.length === 0 && (
        <EmptyState message="Henüz bir talebiniz yok." />
      )}
      {!isSuggestionsPending && !isSuggestionsError && !!suggestions?.length && (
        <ResponsiveTable columns={columns} rows={suggestions} getRowKey={(row) => row.id} />
      )}
    </>
  )
}
