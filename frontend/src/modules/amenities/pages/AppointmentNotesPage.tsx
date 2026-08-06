import { zodResolver } from '@hookform/resolvers/zod'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined'
import { ApiError } from '../../../shared/api/ApiError'
import { EmployeeAutocomplete } from '../../../shared/components/EmployeeAutocomplete'
import { EmptyState } from '../../../shared/components/EmptyState'
import { ErrorState } from '../../../shared/components/ErrorState'
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton'
import { PageHeader } from '../../../shared/components/PageHeader'
import { ResponsiveTable, type ResponsiveTableColumn } from '../../../shared/components/ResponsiveTable'
import { useToast } from '../../../shared/components/ToastProvider'
import type { Employee } from '../../organization/types'
import { useAllAppointmentSlots } from '../api/useAllAppointmentSlots'
import { useAppointmentNote } from '../api/useAppointmentNote'
import { useAppointments } from '../api/useAppointments'
import { useServiceOfferings } from '../api/useServiceOfferings'
import { useUpdateAppointmentNote } from '../api/useUpdateAppointmentNote'
import { appointmentNoteSchema, type AppointmentNoteFormValues } from '../schema'
import type { Appointment } from '../types'

function formatDateTime(iso: string): string {
  return dayjs(iso).format('DD.MM.YYYY HH:mm')
}

// US-08H.1.3 (SEC-020): Randevu notu — sağlık verisi, `GET .../note`
// backend'de yalnızca ADMIN/IK'ya açık (bkz. AppointmentNoteController'ın
// `@PreAuthorize`'ı). Bu ekran o rol kısıtına AYNI şekilde frontend'de
// UYUYOR; hangi çalışanın randevusuna bakılacağı bilinmediğinden
// (ADMIN/IK için TÜM randevuları listeleyen bir uç YOK), `EmployeeAutocomplete`
// ile ÖNCE çalışan seçilir (`attendance.AttendanceRecordsPage`'deki AYNI desen).
export function AppointmentNotesPage() {
  const { showToast } = useToast()
  const [employee, setEmployee] = useState<Employee | null>(null)
  const { data: appointments, isPending, isError, refetch } = useAppointments(employee?.id ?? 0)
  const { data: services } = useServiceOfferings()
  const { slots } = useAllAppointmentSlots(services ?? [])
  const slotById = useMemo(() => new Map(slots.map((slot) => [slot.id, slot])), [slots])
  const serviceNameById = useMemo(() => new Map((services ?? []).map((s) => [s.id, s.name])), [services])

  const [noteTarget, setNoteTarget] = useState<Appointment | null>(null)
  const { data: note, isPending: isNotePending } = useAppointmentNote(noteTarget?.id ?? null)
  const updateNote = useUpdateAppointmentNote()
  const [noteError, setNoteError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<AppointmentNoteFormValues>({ resolver: zodResolver(appointmentNoteSchema), defaultValues: { note: '' } })

  useEffect(() => {
    if (noteTarget && !isNotePending) {
      reset({ note: note?.note ?? '' })
    }
  }, [noteTarget, isNotePending, note, reset])

  async function onSubmit(values: AppointmentNoteFormValues) {
    if (!noteTarget) {
      return
    }
    setNoteError(null)
    try {
      await updateNote.mutateAsync({ appointmentId: noteTarget.id, note: values.note })
      showToast('Not kaydedildi')
      setNoteTarget(null)
    } catch (error) {
      setNoteError(error instanceof ApiError ? error.detail : 'Beklenmeyen bir hata oluştu, tekrar deneyin.')
    }
  }

  const columns: ResponsiveTableColumn<Appointment>[] = [
    {
      key: 'service',
      header: 'Hizmet',
      primary: true,
      render: (row) => {
        const slot = slotById.get(row.slotId)
        return slot ? (serviceNameById.get(slot.serviceOfferingId) ?? '—') : '—'
      },
    },
    {
      key: 'time',
      header: 'Zaman',
      render: (row) => {
        const slot = slotById.get(row.slotId)
        return slot ? `${formatDateTime(slot.startTime)} – ${formatDateTime(slot.endTime)}` : '—'
      },
    },
  ]

  return (
    <>
      <PageHeader title="Randevu Notları" />

      <Grid container sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <EmployeeAutocomplete label="Çalışan" value={employee} onChange={setEmployee} />
        </Grid>
      </Grid>

      {!employee && <EmptyState message="Randevuları görüntülemek için bir çalışan seçin." />}
      {employee && isPending && <LoadingSkeleton rows={3} />}
      {employee && isError && <ErrorState message="Randevular yüklenemedi." onRetry={() => refetch()} />}
      {employee && !isPending && !isError && appointments?.length === 0 && (
        <EmptyState message="Bu çalışanın henüz bir randevusu yok." />
      )}
      {employee && !isPending && !isError && !!appointments?.length && (
        <ResponsiveTable
          columns={columns}
          rows={appointments}
          getRowKey={(row) => row.id}
          actions={(row) => (
            <IconButton
              size="small"
              aria-label="Randevu notunu düzenle"
              onClick={() => {
                setNoteError(null)
                setNoteTarget(row)
              }}
            >
              <EditNoteOutlinedIcon fontSize="small" />
            </IconButton>
          )}
        />
      )}

      <Dialog open={!!noteTarget} onClose={() => setNoteTarget(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Randevu Notu</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 0.5 }}>
              {noteError && <Alert severity="error">{noteError}</Alert>}
              {isNotePending ? (
                <LoadingSkeleton rows={2} />
              ) : (
                <TextField {...register('note')} label="Not" fullWidth multiline rows={4} autoFocus />
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setNoteTarget(null)} disabled={isSubmitting}>
              Vazgeç
            </Button>
            <Button type="submit" variant="contained" loading={isSubmitting} disabled={isNotePending}>
              Kaydet
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  )
}
