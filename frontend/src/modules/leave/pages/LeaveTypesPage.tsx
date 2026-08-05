import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import IconButton from '@mui/material/IconButton'
import { useMemo, useState } from 'react'
import { ApiError } from '../../../shared/api/ApiError'
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog'
import { EmptyState } from '../../../shared/components/EmptyState'
import { ErrorState } from '../../../shared/components/ErrorState'
import { FilterBar } from '../../../shared/components/FilterBar'
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton'
import { PageHeader } from '../../../shared/components/PageHeader'
import { ResponsiveTable, type ResponsiveTableColumn } from '../../../shared/components/ResponsiveTable'
import { useToast } from '../../../shared/components/ToastProvider'
import { useCreateLeaveType } from '../api/useCreateLeaveType'
import { useDeleteLeaveType } from '../api/useDeleteLeaveType'
import { useLeaveTypes } from '../api/useLeaveTypes'
import { useUpdateLeaveType } from '../api/useUpdateLeaveType'
import { LeaveTypeFormDialog } from '../components/LeaveTypeFormDialog'
import type { LeaveTypeFormValues } from '../schema'
import type { LeaveType } from '../types'

type DialogState = { mode: 'create' } | { mode: 'edit'; leaveType: LeaveType } | null

// `organization.JobTitlesPage`'deki AYNI desen (US-04.1.1: "izin türleri
// referans listesi", JobTitle ile aynı CRUD şekli — bkz. LeaveTypeService).
export function LeaveTypesPage() {
  const { data: leaveTypes, isPending, isError, refetch } = useLeaveTypes()
  const createLeaveType = useCreateLeaveType()
  const updateLeaveType = useUpdateLeaveType()
  const deleteLeaveType = useDeleteLeaveType()
  const { showToast } = useToast()

  const [search, setSearch] = useState('')
  const [dialog, setDialog] = useState<DialogState>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<LeaveType | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (!leaveTypes) {
      return []
    }
    const term = search.trim().toLocaleLowerCase('tr')
    if (!term) {
      return leaveTypes
    }
    return leaveTypes.filter(
      (leaveType) =>
        leaveType.name.toLocaleLowerCase('tr').includes(term) || leaveType.code.toLocaleLowerCase('tr').includes(term),
    )
  }, [leaveTypes, search])

  function openCreateDialog() {
    setFormError(null)
    setDialog({ mode: 'create' })
  }

  function openEditDialog(leaveType: LeaveType) {
    setFormError(null)
    setDialog({ mode: 'edit', leaveType })
  }

  async function handleSubmit(values: LeaveTypeFormValues) {
    setFormError(null)
    try {
      if (dialog?.mode === 'edit') {
        await updateLeaveType.mutateAsync({ id: dialog.leaveType.id, request: values })
        showToast('İzin türü güncellendi')
      } else {
        await createLeaveType.mutateAsync(values)
        showToast('İzin türü oluşturuldu')
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
      await deleteLeaveType.mutateAsync(deleteTarget.id)
      showToast('İzin türü silindi')
      setDeleteTarget(null)
    } catch (error) {
      setDeleteError(error instanceof ApiError ? error.detail : 'İzin türü silinemedi, tekrar deneyin.')
    }
  }

  const columns: ResponsiveTableColumn<LeaveType>[] = [
    { key: 'name', header: 'Ad', render: (row) => row.name, primary: true },
    { key: 'code', header: 'Kod', render: (row) => row.code },
  ]

  const submitting = createLeaveType.isPending || updateLeaveType.isPending

  return (
    <>
      <PageHeader title="İzin Türleri" action={{ label: 'Yeni İzin Türü', icon: <AddIcon />, onClick: openCreateDialog }} />

      {!!leaveTypes?.length && (
        <FilterBar value={search} onChange={setSearch} placeholder="İzin türü ara" label="İzin türü ara" />
      )}

      {isPending && <LoadingSkeleton rows={5} />}
      {isError && <ErrorState message="İzin türleri yüklenemedi." onRetry={() => refetch()} />}
      {!isPending && !isError && leaveTypes?.length === 0 && (
        <EmptyState
          message="Henüz bir izin türü tanımlanmadı."
          action={{ label: 'İlk İzin Türünü Oluştur', onClick: openCreateDialog }}
        />
      )}
      {!isPending && !isError && !!leaveTypes?.length && (
        <ResponsiveTable
          columns={columns}
          rows={filtered}
          getRowKey={(row) => row.id}
          actions={(row) => (
            <>
              <IconButton
                size="small"
                aria-label={`${row.name} izin türünü düzenle`}
                onClick={() => openEditDialog(row)}
              >
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                aria-label={`${row.name} izin türünü sil`}
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

      <LeaveTypeFormDialog
        open={!!dialog}
        mode={dialog?.mode ?? 'create'}
        initialValues={dialog?.mode === 'edit' ? dialog.leaveType : undefined}
        submitting={submitting}
        errorMessage={formError}
        onSubmit={handleSubmit}
        onClose={() => setDialog(null)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="İzin Türünü Sil"
        description={deleteTarget ? `"${deleteTarget.name}" izin türünü silmek istediğinize emin misiniz?` : ''}
        loading={deleteLeaveType.isPending}
        errorMessage={deleteError}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  )
}
