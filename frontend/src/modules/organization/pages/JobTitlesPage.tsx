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
import { useCreateJobTitle } from '../api/useCreateJobTitle'
import { useDeleteJobTitle } from '../api/useDeleteJobTitle'
import { useJobTitles } from '../api/useJobTitles'
import { useUpdateJobTitle } from '../api/useUpdateJobTitle'
import { JobTitleFormDialog } from '../components/JobTitleFormDialog'
import type { JobTitleFormValues } from '../schema'
import type { JobTitle } from '../types'

type DialogState = { mode: 'create' } | { mode: 'edit'; jobTitle: JobTitle } | null

export function JobTitlesPage() {
  const { data: jobTitles, isPending, isError, refetch } = useJobTitles()
  const createJobTitle = useCreateJobTitle()
  const updateJobTitle = useUpdateJobTitle()
  const deleteJobTitle = useDeleteJobTitle()
  const { showToast } = useToast()

  const [search, setSearch] = useState('')
  const [dialog, setDialog] = useState<DialogState>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<JobTitle | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (!jobTitles) {
      return []
    }
    const term = search.trim().toLocaleLowerCase('tr')
    if (!term) {
      return jobTitles
    }
    return jobTitles.filter((jobTitle) => jobTitle.name.toLocaleLowerCase('tr').includes(term))
  }, [jobTitles, search])

  function openCreateDialog() {
    setFormError(null)
    setDialog({ mode: 'create' })
  }

  function openEditDialog(jobTitle: JobTitle) {
    setFormError(null)
    setDialog({ mode: 'edit', jobTitle })
  }

  async function handleSubmit(values: JobTitleFormValues) {
    setFormError(null)
    try {
      if (dialog?.mode === 'edit') {
        await updateJobTitle.mutateAsync({ id: dialog.jobTitle.id, request: values })
        showToast('Unvan güncellendi')
      } else {
        await createJobTitle.mutateAsync(values)
        showToast('Unvan oluşturuldu')
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
      await deleteJobTitle.mutateAsync(deleteTarget.id)
      showToast('Unvan silindi')
      setDeleteTarget(null)
    } catch (error) {
      // Backend, kullanımda olan bir unvan silinmeye çalışılırsa TEMİZ bir
      // 409 DÖNMÜYOR (bkz. JobTitleService.delete — bilinen backend kısıtı);
      // bu yüzden burada backend'in vermediği bir "kullanımda" mesajı İCAT
      // EDİLMEZ, apiClient'ın genel hata metni gösterilir.
      setDeleteError(error instanceof ApiError ? error.detail : 'Unvan silinemedi, tekrar deneyin.')
    }
  }

  const columns: ResponsiveTableColumn<JobTitle>[] = [
    { key: 'name', header: 'Ad', render: (row) => row.name, primary: true },
  ]

  const submitting = createJobTitle.isPending || updateJobTitle.isPending

  return (
    <>
      <PageHeader title="Unvanlar" action={{ label: 'Yeni Unvan', icon: <AddIcon />, onClick: openCreateDialog }} />

      {!!jobTitles?.length && (
        <FilterBar value={search} onChange={setSearch} placeholder="Unvan ara" label="Unvan ara" />
      )}

      {isPending && <LoadingSkeleton rows={5} />}
      {isError && <ErrorState message="Unvanlar yüklenemedi." onRetry={() => refetch()} />}
      {!isPending && !isError && jobTitles?.length === 0 && (
        <EmptyState
          message="Henüz bir unvan tanımlanmadı."
          action={{ label: 'İlk Unvanı Oluştur', onClick: openCreateDialog }}
        />
      )}
      {!isPending && !isError && !!jobTitles?.length && (
        <ResponsiveTable
          columns={columns}
          rows={filtered}
          getRowKey={(row) => row.id}
          actions={(row) => (
            <>
              <IconButton
                size="small"
                aria-label={`${row.name} unvanını düzenle`}
                onClick={() => openEditDialog(row)}
              >
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                aria-label={`${row.name} unvanını sil`}
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

      <JobTitleFormDialog
        open={!!dialog}
        mode={dialog?.mode ?? 'create'}
        initialName={dialog?.mode === 'edit' ? dialog.jobTitle.name : undefined}
        submitting={submitting}
        errorMessage={formError}
        onSubmit={handleSubmit}
        onClose={() => setDialog(null)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Unvanı Sil"
        description={deleteTarget ? `"${deleteTarget.name}" unvanını silmek istediğinize emin misiniz?` : ''}
        loading={deleteJobTitle.isPending}
        errorMessage={deleteError}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  )
}
