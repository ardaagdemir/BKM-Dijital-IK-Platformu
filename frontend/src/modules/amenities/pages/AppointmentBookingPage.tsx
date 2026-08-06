import { zodResolver } from '@hookform/resolvers/zod'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { ApiError } from '../../../shared/api/ApiError'
import { EmptyState } from '../../../shared/components/EmptyState'
import { ErrorState } from '../../../shared/components/ErrorState'
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton'
import { PageHeader } from '../../../shared/components/PageHeader'
import { ResponsiveTable, type ResponsiveTableColumn } from '../../../shared/components/ResponsiveTable'
import { useToast } from '../../../shared/components/ToastProvider'
import { useMyEmployee } from '../../organization/api/useMyEmployee'
import { useAllAppointmentSlots } from '../api/useAllAppointmentSlots'
import { useAppointmentSlots } from '../api/useAppointmentSlots'
import { useAppointments } from '../api/useAppointments'
import { useBookAppointment } from '../api/useBookAppointment'
import { useServiceOfferings } from '../api/useServiceOfferings'
import { appointmentBookingSchema, type AppointmentBookingFormValues } from '../schema'
import type { Appointment } from '../types'

function formatDateTime(iso: string): string {
  return dayjs(iso).format('DD.MM.YYYY HH:mm')
}

// US-08H.1.2: Uygun slota randevu alma — "uygun" ön-filtresi YAPILMAZ
// (hangi slotların BAŞKALARINCA doldurulduğunu döndürecek bir uç yok);
// tüm slotlar listelenir, backend'in "Bu slot zaten dolu."/"Aynı saat
// diliminde başka bir randevunuz var." kontrolleri submit anında
// güvenilir tek kaynak olarak kullanılır (`AppointmentSlotFormDialog`'daki
// AYNI karar).
export function AppointmentBookingPage() {
  const { showToast } = useToast()
  const {
    data: employee,
    isPending: isEmployeePending,
    isError: isEmployeeError,
    error: employeeError,
  } = useMyEmployee()
  const employeeMissing = isEmployeeError && employeeError instanceof ApiError && employeeError.status === 404

  const { data: services, isPending: isServicesPending } = useServiceOfferings()
  const { slots: allSlots } = useAllAppointmentSlots(services ?? [])
  const slotById = useMemo(() => new Map(allSlots.map((slot) => [slot.id, slot])), [allSlots])
  const serviceNameById = useMemo(() => new Map((services ?? []).map((s) => [s.id, s.name])), [services])

  const {
    data: appointments,
    isPending: isAppointmentsPending,
    isError: isAppointmentsError,
    refetch,
  } = useAppointments(employee?.id ?? 0)
  const bookAppointment = useBookAppointment()
  const [bookingError, setBookingError] = useState<string | null>(null)

  const [selectedServiceId, setSelectedServiceId] = useState<number | ''>('')
  const { data: availableSlots } = useAppointmentSlots(selectedServiceId === '' ? 0 : selectedServiceId)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AppointmentBookingFormValues>({
    resolver: zodResolver(appointmentBookingSchema),
    defaultValues: { slotId: '' },
  })

  if (isEmployeePending || isServicesPending) {
    return (
      <>
        <PageHeader title="Randevu Al" />
        <LoadingSkeleton rows={4} />
      </>
    )
  }

  if (employeeMissing) {
    return (
      <>
        <PageHeader title="Randevu Al" />
        <EmptyState message="Sisteme bağlı bir çalışan kaydınız bulunamadı." />
      </>
    )
  }

  if (isEmployeeError || !employee) {
    return <ErrorState message="Çalışan bilgileri yüklenemedi." onRetry={() => window.location.reload()} />
  }

  async function onSubmit(values: AppointmentBookingFormValues) {
    setBookingError(null)
    try {
      await bookAppointment.mutateAsync({ slotId: Number(values.slotId), employeeId: employee!.id })
      showToast('Randevu oluşturuldu')
      reset({ slotId: '' })
      setSelectedServiceId('')
    } catch (error) {
      setBookingError(error instanceof ApiError ? error.detail : 'Beklenmeyen bir hata oluştu, tekrar deneyin.')
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
      <PageHeader title="Randevu Al" />
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
          Yeni Randevu
        </Typography>
        <Stack spacing={2}>
          {bookingError && <Alert severity="error">{bookingError}</Alert>}
          <TextField
            select
            label="Hizmet"
            fullWidth
            value={selectedServiceId}
            onChange={(event) => {
              setSelectedServiceId(event.target.value === '' ? '' : Number(event.target.value))
              reset({ slotId: '' })
            }}
          >
            {(services ?? []).map((service) => (
              <MenuItem key={service.id} value={service.id}>
                {service.name}
              </MenuItem>
            ))}
          </TextField>

          {selectedServiceId !== '' && (
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Controller
                  control={control}
                  name="slotId"
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Slot"
                      fullWidth
                      error={!!errors.slotId}
                      helperText={errors.slotId?.message}
                    >
                      {(availableSlots ?? []).map((slot) => (
                        <MenuItem key={slot.id} value={String(slot.id)}>
                          {formatDateTime(slot.startTime)} – {formatDateTime(slot.endTime)}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
                <Button type="submit" variant="contained" loading={isSubmitting} sx={{ minWidth: 160 }}>
                  Randevu Al
                </Button>
              </Stack>
            </form>
          )}
        </Stack>
      </Paper>

      {isAppointmentsPending && <LoadingSkeleton rows={3} />}
      {isAppointmentsError && <ErrorState message="Randevularım yüklenemedi." onRetry={() => refetch()} />}
      {!isAppointmentsPending && !isAppointmentsError && appointments?.length === 0 && (
        <EmptyState message="Henüz bir randevunuz yok." />
      )}
      {!isAppointmentsPending && !isAppointmentsError && !!appointments?.length && (
        <ResponsiveTable columns={columns} rows={appointments} getRowKey={(row) => row.id} />
      )}
    </>
  )
}
