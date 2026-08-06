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
import { useClubs } from '../api/useClubs'
import { useCreateClub } from '../api/useCreateClub'
import { useDeleteClub } from '../api/useDeleteClub'
import { useUpdateClub } from '../api/useUpdateClub'
import { ClubFormDialog } from '../components/ClubFormDialog'
import type { Club } from '../types'

type DialogState = { mode: 'create' } | { mode: 'edit'; club: Club } | null

// US-08G.1.1: Kulüp referans listesi CRUD (+ lider ataması) —
// `organization.JobTitlesPage`'deki AYNI desen; roadmap'in KENDİSİ ayrı
// bir route olarak İTEMİZE ETMEDİ ama `ClubController` TAM CRUD sunduğundan
// ve kulüplerin/liderlerin bir yerde TANIMLANMASI gerektiğinden eklendi
// (`feedback.SuggestionCategoriesPage`'deki AYNI karar).
export function ClubsManagePage() {
  const { data: clubs, isPending, isError, refetch } = useClubs()
  const createClub = useCreateClub()
  const updateClub = useUpdateClub()
  const deleteClub = useDeleteClub()
  const { showToast } = useToast()

  const [dialog, setDialog] = useState<DialogState>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Club | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  function openCreateDialog() {
    setFormError(null)
    setDialog({ mode: 'create' })
  }

  function openEditDialog(club: Club) {
    setFormError(null)
    setDialog({ mode: 'edit', club })
  }

  async function handleSubmit(values: { name: string; leaderId: number | null }) {
    setFormError(null)
    try {
      if (dialog?.mode === 'edit') {
        await updateClub.mutateAsync({ id: dialog.club.id, request: values })
        showToast('Kulüp güncellendi')
      } else {
        await createClub.mutateAsync(values)
        showToast('Kulüp oluşturuldu')
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
      await deleteClub.mutateAsync(deleteTarget.id)
      showToast('Kulüp silindi')
      setDeleteTarget(null)
    } catch (error) {
      setDeleteError(error instanceof ApiError ? error.detail : 'Kulüp silinemedi, tekrar deneyin.')
    }
  }

  const columns: ResponsiveTableColumn<Club>[] = [
    { key: 'name', header: 'Ad', primary: true, render: (row) => row.name },
    { key: 'leader', header: 'Lider', render: (row) => (row.leaderId ? `#${row.leaderId}` : '—') },
  ]

  const submitting = createClub.isPending || updateClub.isPending

  return (
    <>
      <PageHeader title="Kulüp Yönetimi" action={{ label: 'Yeni Kulüp', icon: <AddIcon />, onClick: openCreateDialog }} />

      {isPending && <LoadingSkeleton rows={4} />}
      {isError && <ErrorState message="Kulüpler yüklenemedi." onRetry={() => refetch()} />}
      {!isPending && !isError && clubs?.length === 0 && (
        <EmptyState message="Henüz bir kulüp tanımlanmadı." action={{ label: 'İlk Kulübü Oluştur', onClick: openCreateDialog }} />
      )}
      {!isPending && !isError && !!clubs?.length && (
        <ResponsiveTable
          columns={columns}
          rows={clubs}
          getRowKey={(row) => row.id}
          actions={(row) => (
            <>
              <IconButton size="small" aria-label={`${row.name} kulübünü düzenle`} onClick={() => openEditDialog(row)}>
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                aria-label={`${row.name} kulübünü sil`}
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

      <ClubFormDialog
        open={!!dialog}
        mode={dialog?.mode ?? 'create'}
        initialValues={dialog?.mode === 'edit' ? { name: dialog.club.name, leaderId: dialog.club.leaderId } : undefined}
        submitting={submitting}
        errorMessage={formError}
        onSubmit={handleSubmit}
        onClose={() => setDialog(null)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Kulübü Sil"
        description={deleteTarget ? `"${deleteTarget.name}" kulübünü silmek istediğinize emin misiniz?` : ''}
        loading={deleteClub.isPending}
        errorMessage={deleteError}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  )
}
