import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import dayjs from 'dayjs'
import { useState } from 'react'
import { ApiError } from '../../../shared/api/ApiError'
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog'
import { EmptyState } from '../../../shared/components/EmptyState'
import { ErrorState } from '../../../shared/components/ErrorState'
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton'
import { PageHeader } from '../../../shared/components/PageHeader'
import { ResponsiveTable, type ResponsiveTableColumn } from '../../../shared/components/ResponsiveTable'
import { useToast } from '../../../shared/components/ToastProvider'
import { useAppointmentSlots } from '../api/useAppointmentSlots'
import { useCreateAppointmentSlot } from '../api/useCreateAppointmentSlot'
import { useCreateServiceOffering } from '../api/useCreateServiceOffering'
import { useDeleteServiceOffering } from '../api/useDeleteServiceOffering'
import { useServiceOfferings } from '../api/useServiceOfferings'
import { useUpdateServiceOffering } from '../api/useUpdateServiceOffering'
import { AppointmentSlotFormDialog } from '../components/AppointmentSlotFormDialog'
import { ServiceOfferingFormDialog } from '../components/ServiceOfferingFormDialog'
import type { AppointmentSlotFormValues, ServiceOfferingFormValues } from '../schema'
import type { AppointmentSlot, ServiceOffering } from '../types'

type ServiceDialogState = { mode: 'create' } | { mode: 'edit'; service: ServiceOffering } | null

function formatDateTime(iso: string): string {
  return dayjs(iso).format('DD.MM.YYYY HH:mm')
}

// US-08H.1.1: Hizmet tanımlama + slot tanımlama (çakışma engelleme) —
// roadmap'in TEK satırda birleştirdiği iki alt-akış ("hizmet+slot
// tanımlama") TEK sayfada, iki bölüm halinde sunuluyor: üstte hizmet CRUD
// (`organization.JobTitlesPage`'deki AYNI desen), altta SEÇİLİ hizmetin
// slotları + yeni slot ekleme.
export function ServiceOfferingsPage() {
  const { showToast } = useToast()
  const { data: services, isPending, isError, refetch } = useServiceOfferings()
  const createService = useCreateServiceOffering()
  const updateService = useUpdateServiceOffering()
  const deleteService = useDeleteServiceOffering()

  const [serviceDialog, setServiceDialog] = useState<ServiceDialogState>(null)
  const [serviceFormError, setServiceFormError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ServiceOffering | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const [selectedServiceId, setSelectedServiceId] = useState<number | ''>('')
  const {
    data: slots,
    isPending: isSlotsPending,
    isError: isSlotsError,
    refetch: refetchSlots,
  } = useAppointmentSlots(selectedServiceId === '' ? 0 : selectedServiceId)
  const createSlot = useCreateAppointmentSlot()
  const [slotDialogOpen, setSlotDialogOpen] = useState(false)
  const [slotFormError, setSlotFormError] = useState<string | null>(null)

  async function handleServiceSubmit(values: ServiceOfferingFormValues) {
    setServiceFormError(null)
    try {
      if (serviceDialog?.mode === 'edit') {
        await updateService.mutateAsync({ id: serviceDialog.service.id, name: values.name })
        showToast('Hizmet güncellendi')
      } else {
        await createService.mutateAsync(values.name)
        showToast('Hizmet oluşturuldu')
      }
      setServiceDialog(null)
    } catch (error) {
      setServiceFormError(error instanceof ApiError ? error.detail : 'Beklenmeyen bir hata oluştu, tekrar deneyin.')
    }
  }

  async function handleServiceDelete() {
    if (!deleteTarget) {
      return
    }
    setDeleteError(null)
    try {
      await deleteService.mutateAsync(deleteTarget.id)
      showToast('Hizmet silindi')
      setDeleteTarget(null)
    } catch (error) {
      setDeleteError(error instanceof ApiError ? error.detail : 'Hizmet silinemedi, tekrar deneyin.')
    }
  }

  async function handleSlotSubmit(values: AppointmentSlotFormValues) {
    if (selectedServiceId === '') {
      return
    }
    setSlotFormError(null)
    try {
      await createSlot.mutateAsync({
        serviceOfferingId: selectedServiceId,
        startTime: values.startTime,
        endTime: values.endTime,
      })
      showToast('Slot oluşturuldu')
      setSlotDialogOpen(false)
    } catch (error) {
      setSlotFormError(error instanceof ApiError ? error.detail : 'Beklenmeyen bir hata oluştu, tekrar deneyin.')
    }
  }

  const serviceColumns: ResponsiveTableColumn<ServiceOffering>[] = [
    { key: 'name', header: 'Ad', primary: true, render: (row) => row.name },
  ]

  const slotColumns: ResponsiveTableColumn<AppointmentSlot>[] = [
    { key: 'startTime', header: 'Başlangıç', primary: true, render: (row) => formatDateTime(row.startTime) },
    { key: 'endTime', header: 'Bitiş', render: (row) => formatDateTime(row.endTime) },
  ]

  const serviceSubmitting = createService.isPending || updateService.isPending

  return (
    <>
      <PageHeader title="Hizmet ve Slot Yönetimi" />

      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h2">
          Hizmetler
        </Typography>
        <Button
          startIcon={<AddIcon />}
          onClick={() => {
            setServiceFormError(null)
            setServiceDialog({ mode: 'create' })
          }}
        >
          Yeni Hizmet
        </Button>
      </Stack>

      {isPending && <LoadingSkeleton rows={3} />}
      {isError && <ErrorState message="Hizmetler yüklenemedi." onRetry={() => refetch()} />}
      {!isPending && !isError && services?.length === 0 && <EmptyState message="Henüz bir hizmet tanımlanmadı." />}
      {!isPending && !isError && !!services?.length && (
        <ResponsiveTable
          columns={serviceColumns}
          rows={services}
          getRowKey={(row) => row.id}
          actions={(row) => (
            <>
              <IconButton
                size="small"
                aria-label={`${row.name} hizmetini düzenle`}
                onClick={() => {
                  setServiceFormError(null)
                  setServiceDialog({ mode: 'edit', service: row })
                }}
              >
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                aria-label={`${row.name} hizmetini sil`}
                onClick={() => {
                  setDeleteError(null)
                  setDeleteTarget(row)
                }}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </>
          )}
        />
      )}

      <Typography variant="h6" component="h2" sx={{ mt: 5, mb: 2 }}>
        Randevu Slotları
      </Typography>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            select
            label="Hizmet"
            fullWidth
            value={selectedServiceId}
            onChange={(event) => setSelectedServiceId(event.target.value === '' ? '' : Number(event.target.value))}
          >
            {(services ?? []).map((service) => (
              <MenuItem key={service.id} value={service.id}>
                {service.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      {selectedServiceId === '' && <EmptyState message="Slotları görüntülemek için bir hizmet seçin." />}
      {selectedServiceId !== '' && (
        <>
          <Stack direction="row" sx={{ justifyContent: 'flex-end', mb: 2 }}>
            <Button startIcon={<AddIcon />} onClick={() => setSlotDialogOpen(true)}>
              Yeni Slot
            </Button>
          </Stack>
          {isSlotsPending && <LoadingSkeleton rows={3} />}
          {isSlotsError && <ErrorState message="Slotlar yüklenemedi." onRetry={() => refetchSlots()} />}
          {!isSlotsPending && !isSlotsError && slots?.length === 0 && (
            <EmptyState message="Bu hizmet için henüz bir slot tanımlanmadı." />
          )}
          {!isSlotsPending && !isSlotsError && !!slots?.length && (
            <ResponsiveTable columns={slotColumns} rows={slots} getRowKey={(row) => row.id} />
          )}
        </>
      )}

      <ServiceOfferingFormDialog
        open={!!serviceDialog}
        mode={serviceDialog?.mode ?? 'create'}
        initialName={serviceDialog?.mode === 'edit' ? serviceDialog.service.name : undefined}
        submitting={serviceSubmitting}
        errorMessage={serviceFormError}
        onSubmit={handleServiceSubmit}
        onClose={() => setServiceDialog(null)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Hizmeti Sil"
        description={deleteTarget ? `"${deleteTarget.name}" hizmetini silmek istediğinize emin misiniz?` : ''}
        loading={deleteService.isPending}
        errorMessage={deleteError}
        onConfirm={handleServiceDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <AppointmentSlotFormDialog
        open={slotDialogOpen}
        submitting={createSlot.isPending}
        errorMessage={slotFormError}
        onSubmit={handleSlotSubmit}
        onClose={() => setSlotDialogOpen(false)}
      />
    </>
  )
}
