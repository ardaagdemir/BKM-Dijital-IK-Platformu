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
import { useCreateWorkModel } from '../api/useCreateWorkModel'
import { useDeleteWorkModel } from '../api/useDeleteWorkModel'
import { useUpdateWorkModel } from '../api/useUpdateWorkModel'
import { useWorkModels } from '../api/useWorkModels'
import { WorkModelFormDialog } from '../components/WorkModelFormDialog'
import type { WorkModelFormValues } from '../schema'
import type { WorkModel } from '../types'

type DialogState = { mode: 'create' } | { mode: 'edit'; workModel: WorkModel } | null

// US-07.1.1: Çalışma modeli referans listesi CRUD — `leave.LeaveTypesPage`'deki AYNI desen.
export function WorkModelsPage() {
  const { data: workModels, isPending, isError, refetch } = useWorkModels()
  const createWorkModel = useCreateWorkModel()
  const updateWorkModel = useUpdateWorkModel()
  const deleteWorkModel = useDeleteWorkModel()
  const { showToast } = useToast()

  const [dialog, setDialog] = useState<DialogState>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<WorkModel | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  function openCreateDialog() {
    setFormError(null)
    setDialog({ mode: 'create' })
  }

  function openEditDialog(workModel: WorkModel) {
    setFormError(null)
    setDialog({ mode: 'edit', workModel })
  }

  async function handleSubmit(values: WorkModelFormValues) {
    setFormError(null)
    try {
      if (dialog?.mode === 'edit') {
        await updateWorkModel.mutateAsync({ id: dialog.workModel.id, request: values })
        showToast('Çalışma modeli güncellendi')
      } else {
        await createWorkModel.mutateAsync(values)
        showToast('Çalışma modeli oluşturuldu')
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
      await deleteWorkModel.mutateAsync(deleteTarget.id)
      showToast('Çalışma modeli silindi')
      setDeleteTarget(null)
    } catch (error) {
      setDeleteError(error instanceof ApiError ? error.detail : 'Çalışma modeli silinemedi, tekrar deneyin.')
    }
  }

  const columns: ResponsiveTableColumn<WorkModel>[] = [
    { key: 'name', header: 'Ad', render: (row) => row.name, primary: true },
    { key: 'plannedStartTime', header: 'Başlangıç', render: (row) => row.plannedStartTime.slice(0, 5) },
    { key: 'plannedEndTime', header: 'Bitiş', render: (row) => row.plannedEndTime.slice(0, 5) },
  ]

  const submitting = createWorkModel.isPending || updateWorkModel.isPending

  return (
    <>
      <PageHeader
        title="Çalışma Modelleri"
        action={{ label: 'Yeni Çalışma Modeli', icon: <AddIcon />, onClick: openCreateDialog }}
      />

      {isPending && <LoadingSkeleton rows={5} />}
      {isError && <ErrorState message="Çalışma modelleri yüklenemedi." onRetry={() => refetch()} />}
      {!isPending && !isError && workModels?.length === 0 && (
        <EmptyState
          message="Henüz bir çalışma modeli tanımlanmadı."
          action={{ label: 'İlk Çalışma Modelini Oluştur', onClick: openCreateDialog }}
        />
      )}
      {!isPending && !isError && !!workModels?.length && (
        <ResponsiveTable
          columns={columns}
          rows={workModels}
          getRowKey={(row) => row.id}
          actions={(row) => (
            <>
              <IconButton
                size="small"
                aria-label={`${row.name} çalışma modelini düzenle`}
                onClick={() => openEditDialog(row)}
              >
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                aria-label={`${row.name} çalışma modelini sil`}
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

      <WorkModelFormDialog
        open={!!dialog}
        mode={dialog?.mode ?? 'create'}
        initialValues={
          dialog?.mode === 'edit'
            ? {
                name: dialog.workModel.name,
                plannedStartTime: dialog.workModel.plannedStartTime.slice(0, 5),
                plannedEndTime: dialog.workModel.plannedEndTime.slice(0, 5),
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
        title="Çalışma Modelini Sil"
        description={deleteTarget ? `"${deleteTarget.name}" çalışma modelini silmek istediğinize emin misiniz?` : ''}
        loading={deleteWorkModel.isPending}
        errorMessage={deleteError}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  )
}
