import { zodResolver } from '@hookform/resolvers/zod'
import AddIcon from '@mui/icons-material/Add'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'
import { useParams } from 'react-router-dom'
import { ApiError } from '../../../shared/api/ApiError'
import { EmptyState } from '../../../shared/components/EmptyState'
import { ErrorState } from '../../../shared/components/ErrorState'
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton'
import { PageHeader } from '../../../shared/components/PageHeader'
import { ResponsiveTable, type ResponsiveTableColumn } from '../../../shared/components/ResponsiveTable'
import { useToast } from '../../../shared/components/ToastProvider'
import { useMyEmployee } from '../../organization/api/useMyEmployee'
import { useClubEvents } from '../api/useClubEvents'
import { useClubs } from '../api/useClubs'
import { useCreateClubEvent } from '../api/useCreateClubEvent'
import { clubEventSchema, type ClubEventFormValues } from '../schema'
import type { ClubEvent } from '../types'

// US-08G.1.2: Kulüp etkinliği oluşturma — "Yeni Etkinlik" butonu YALNIZCA
// giriş yapan çalışan kulübün lideriyse GÖRÜNÜR (istemci tarafı YALNIZCA
// GÖRSEL bir kısayol — asıl yetki kontrolü backend'de `ClubEventService.create`'te,
// bkz. o dosyanın javadoc'u). `GET /api/clubs/{id}` ucu YOK — `SurveyAnswerPage`'deki
// AYNI "listeden `find` ile türet" kararı.
export function ClubDetailPage() {
  const { id } = useParams<{ id: string }>()
  const clubId = Number(id)
  const { showToast } = useToast()

  const { data: clubs, isPending: isClubsPending, isError: isClubsError, refetch: refetchClubs } = useClubs()
  const club = clubs?.find((item) => item.id === clubId)

  const { data: employee } = useMyEmployee()
  const isLeader = !!employee && !!club && club.leaderId === employee.id

  const { data: events, isPending: isEventsPending, isError: isEventsError, refetch: refetchEvents } =
    useClubEvents(clubId)
  const createEvent = useCreateClubEvent()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClubEventFormValues>({ resolver: zodResolver(clubEventSchema), defaultValues: { name: '', date: '' } })

  async function onSubmit(values: ClubEventFormValues) {
    if (!employee) {
      return
    }
    setFormError(null)
    try {
      await createEvent.mutateAsync({ clubId, employeeId: employee.id, name: values.name, date: values.date })
      showToast('Etkinlik oluşturuldu')
      setDialogOpen(false)
      reset({ name: '', date: '' })
    } catch (error) {
      setFormError(error instanceof ApiError ? error.detail : 'Beklenmeyen bir hata oluştu, tekrar deneyin.')
    }
  }

  if (isClubsPending) {
    return (
      <>
        <PageHeader title="Kulüp Detayı" />
        <LoadingSkeleton rows={4} />
      </>
    )
  }

  if (isClubsError) {
    return <ErrorState message="Kulüp yüklenemedi." onRetry={() => refetchClubs()} />
  }

  if (!club) {
    return (
      <>
        <PageHeader title="Kulüp Detayı" />
        <EmptyState message="Kulüp bulunamadı." />
      </>
    )
  }

  const columns: ResponsiveTableColumn<ClubEvent>[] = [
    { key: 'name', header: 'Etkinlik', primary: true, render: (row) => row.name },
    { key: 'date', header: 'Tarih', render: (row) => dayjs(row.date).format('DD.MM.YYYY') },
  ]

  return (
    <>
      <PageHeader
        title={club.name}
        action={isLeader ? { label: 'Yeni Etkinlik', icon: <AddIcon />, onClick: () => setDialogOpen(true) } : undefined}
      />
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {club.leaderId ? `Lider: #${club.leaderId}` : 'Lider atanmadı'}
      </Typography>

      {isEventsPending && <LoadingSkeleton rows={3} />}
      {isEventsError && <ErrorState message="Etkinlikler yüklenemedi." onRetry={() => refetchEvents()} />}
      {!isEventsPending && !isEventsError && events?.length === 0 && (
        <EmptyState message="Henüz bir etkinlik tanımlanmadı." />
      )}
      {!isEventsPending && !isEventsError && !!events?.length && (
        <ResponsiveTable columns={columns} rows={events} getRowKey={(row) => row.id} />
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Yeni Etkinlik</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 0.5 }}>
              {formError && <Alert severity="error">{formError}</Alert>}
              <TextField
                {...register('name')}
                label="Etkinlik Adı"
                autoFocus
                fullWidth
                error={!!errors.name}
                helperText={errors.name?.message}
              />
              <Controller
                control={control}
                name="date"
                render={({ field, fieldState }) => (
                  <DatePicker
                    label="Tarih"
                    value={field.value ? dayjs(field.value) : null}
                    onChange={(date) => field.onChange(date?.isValid() ? date.format('YYYY-MM-DD') : '')}
                    slotProps={{
                      textField: { fullWidth: true, error: !!fieldState.error, helperText: fieldState.error?.message },
                    }}
                  />
                )}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)} disabled={isSubmitting}>
              Vazgeç
            </Button>
            <Button type="submit" variant="contained" loading={isSubmitting}>
              Oluştur
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  )
}
