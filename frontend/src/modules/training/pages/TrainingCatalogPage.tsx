import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import IconButton from '@mui/material/IconButton'
import { useState } from 'react'
import { ApiError } from '../../../shared/api/ApiError'
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog'
import { EmptyState } from '../../../shared/components/EmptyState'
import { ErrorState } from '../../../shared/components/ErrorState'
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton'
import { PageHeader } from '../../../shared/components/PageHeader'
import { ResponsiveTable, type ResponsiveTableColumn } from '../../../shared/components/ResponsiveTable'
import { useToast } from '../../../shared/components/ToastProvider'
import { useCreateTraining } from '../api/useCreateTraining'
import { useDeleteTraining } from '../api/useDeleteTraining'
import { useTrainings } from '../api/useTrainings'
import { useUpdateTraining } from '../api/useUpdateTraining'
import { TrainingFormDialog } from '../components/TrainingFormDialog'
import type { TrainingFormValues } from '../schema'
import type { Training } from '../types'

type DialogState = { mode: 'create' } | { mode: 'edit'; training: Training } | null

// US-08A.1.1: Eğitim kataloğu CRUD — `attendance.WorkModelsPage`'deki AYNI desen.
export function TrainingCatalogPage() {
  const { data: trainings, isPending, isError, refetch } = useTrainings()
  const createTraining = useCreateTraining()
  const updateTraining = useUpdateTraining()
  const deleteTraining = useDeleteTraining()
  const { showToast } = useToast()

  const [dialog, setDialog] = useState<DialogState>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Training | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  function openCreateDialog() {
    setFormError(null)
    setDialog({ mode: 'create' })
  }

  function openEditDialog(training: Training) {
    setFormError(null)
    setDialog({ mode: 'edit', training })
  }

  async function handleSubmit(values: TrainingFormValues) {
    setFormError(null)
    const request = { name: values.name, type: values.type, durationHours: Number(values.durationHours), provider: values.provider }
    try {
      if (dialog?.mode === 'edit') {
        await updateTraining.mutateAsync({ id: dialog.training.id, request })
        showToast('Eğitim güncellendi')
      } else {
        await createTraining.mutateAsync(request)
        showToast('Eğitim oluşturuldu')
      }
      setDialog(null)
    } catch (error) {
      setFormError(error instanceof ApiError ? error.detail : 'Beklenmeyen bir hata oluştu, tekrar deneyin.')
    }
  }

  async function handleDelete() {
    if (!deleteTarget) {
      return
    }
    setDeleteError(null)
    try {
      await deleteTraining.mutateAsync(deleteTarget.id)
      showToast('Eğitim silindi')
      setDeleteTarget(null)
    } catch (error) {
      setDeleteError(error instanceof ApiError ? error.detail : 'Eğitim silinemedi, tekrar deneyin.')
    }
  }

  const columns: ResponsiveTableColumn<Training>[] = [
    { key: 'name', header: 'Ad', render: (row) => row.name, primary: true },
    { key: 'type', header: 'Tür', render: (row) => row.type },
    { key: 'durationHours', header: 'Süre (Saat)', render: (row) => String(row.durationHours) },
    { key: 'provider', header: 'Sağlayıcı', render: (row) => row.provider },
  ]

  const submitting = createTraining.isPending || updateTraining.isPending

  return (
    <>
      <PageHeader title="Eğitim Kataloğu" action={{ label: 'Yeni Eğitim', icon: <AddIcon />, onClick: openCreateDialog }} />

      {isPending && <LoadingSkeleton rows={5} />}
      {isError && <ErrorState message="Eğitimler yüklenemedi." onRetry={() => refetch()} />}
      {!isPending && !isError && trainings?.length === 0 && (
        <EmptyState message="Henüz bir eğitim tanımlanmadı." action={{ label: 'İlk Eğitimi Oluştur', onClick: openCreateDialog }} />
      )}
      {!isPending && !isError && !!trainings?.length && (
        <ResponsiveTable
          columns={columns}
          rows={trainings}
          getRowKey={(row) => row.id}
          actions={(row) => (
            <>
              <IconButton size="small" aria-label={`${row.name} eğitimini düzenle`} onClick={() => openEditDialog(row)}>
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                aria-label={`${row.name} eğitimini sil`}
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

      <TrainingFormDialog
        open={!!dialog}
        mode={dialog?.mode ?? 'create'}
        initialValues={
          dialog?.mode === 'edit'
            ? {
                name: dialog.training.name,
                type: dialog.training.type,
                durationHours: String(dialog.training.durationHours),
                provider: dialog.training.provider,
              }
            : undefined
        }
        submitting={submitting}
        errorMessage={formError}
        onSubmit={handleSubmit}
        onClose={() => setDialog(null)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Eğitimi Sil"
        description={deleteTarget ? `"${deleteTarget.name}" eğitimini silmek istediğinize emin misiniz?` : ''}
        loading={deleteTraining.isPending}
        errorMessage={deleteError}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  )
}
