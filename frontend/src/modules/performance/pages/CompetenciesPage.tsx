import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { useMemo, useState } from 'react'
import { ApiError } from '../../../shared/api/ApiError'
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog'
import { EmptyState } from '../../../shared/components/EmptyState'
import { ErrorState } from '../../../shared/components/ErrorState'
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton'
import { PageHeader } from '../../../shared/components/PageHeader'
import { ResponsiveTable, type ResponsiveTableColumn } from '../../../shared/components/ResponsiveTable'
import { useToast } from '../../../shared/components/ToastProvider'
import { useCompetencies } from '../api/useCompetencies'
import { useCreateCompetency } from '../api/useCreateCompetency'
import { useDeleteCompetency } from '../api/useDeleteCompetency'
import { useUpdateCompetency } from '../api/useUpdateCompetency'
import { CompetencyFormDialog } from '../components/CompetencyFormDialog'
import type { CompetencyFormValues } from '../schema'
import type { Competency } from '../types'

type DialogState = { mode: 'create' } | { mode: 'edit'; competency: Competency } | null

// US-06.1.1: Yetkinlik referans listesi CRUD — `GoalsPage`'deki AYNI desen.
export function CompetenciesPage() {
  const { data: competencies, isPending, isError, refetch } = useCompetencies()
  const createCompetency = useCreateCompetency()
  const updateCompetency = useUpdateCompetency()
  const deleteCompetency = useDeleteCompetency()
  const { showToast } = useToast()

  const [dialog, setDialog] = useState<DialogState>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Competency | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const totalWeight = useMemo(
    () => (competencies ?? []).reduce((sum, competency) => sum + competency.weight, 0),
    [competencies],
  )
  const otherCompetenciesWeightTotal = useMemo(() => {
    if (dialog?.mode !== 'edit') {
      return totalWeight
    }
    return totalWeight - dialog.competency.weight
  }, [dialog, totalWeight])

  function openCreateDialog() {
    setFormError(null)
    setDialog({ mode: 'create' })
  }

  function openEditDialog(competency: Competency) {
    setFormError(null)
    setDialog({ mode: 'edit', competency })
  }

  async function handleSubmit(values: CompetencyFormValues) {
    setFormError(null)
    const request = { name: values.name, weight: Number(values.weight) }
    try {
      if (dialog?.mode === 'edit') {
        await updateCompetency.mutateAsync({ id: dialog.competency.id, request })
        showToast('Yetkinlik güncellendi')
      } else {
        await createCompetency.mutateAsync(request)
        showToast('Yetkinlik oluşturuldu')
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
      await deleteCompetency.mutateAsync(deleteTarget.id)
      showToast('Yetkinlik silindi')
      setDeleteTarget(null)
    } catch (error) {
      setDeleteError(error instanceof ApiError ? error.detail : 'Yetkinlik silinemedi, tekrar deneyin.')
    }
  }

  const columns: ResponsiveTableColumn<Competency>[] = [
    { key: 'name', header: 'Ad', render: (row) => row.name, primary: true },
    { key: 'weight', header: 'Ağırlık', render: (row) => String(row.weight) },
  ]

  const submitting = createCompetency.isPending || updateCompetency.isPending

  return (
    <>
      <PageHeader title="Yetkinlikler" action={{ label: 'Yeni Yetkinlik', icon: <AddIcon />, onClick: openCreateDialog }} />

      {!!competencies?.length && (
        <Typography variant="body2" color={totalWeight > 100 ? 'error' : 'text.secondary'} sx={{ mb: 2 }}>
          Toplam ağırlık: {totalWeight}/100
        </Typography>
      )}

      {isPending && <LoadingSkeleton rows={5} />}
      {isError && <ErrorState message="Yetkinlikler yüklenemedi." onRetry={() => refetch()} />}
      {!isPending && !isError && competencies?.length === 0 && (
        <EmptyState
          message="Henüz bir yetkinlik tanımlanmadı."
          action={{ label: 'İlk Yetkinliği Oluştur', onClick: openCreateDialog }}
        />
      )}
      {!isPending && !isError && !!competencies?.length && (
        <ResponsiveTable
          columns={columns}
          rows={competencies}
          getRowKey={(row) => row.id}
          actions={(row) => (
            <>
              <IconButton size="small" aria-label={`${row.name} yetkinliğini düzenle`} onClick={() => openEditDialog(row)}>
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                aria-label={`${row.name} yetkinliğini sil`}
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

      <CompetencyFormDialog
        open={!!dialog}
        mode={dialog?.mode ?? 'create'}
        initialValues={
          dialog?.mode === 'edit' ? { name: dialog.competency.name, weight: String(dialog.competency.weight) } : undefined
        }
        otherCompetenciesWeightTotal={otherCompetenciesWeightTotal}
        submitting={submitting}
        errorMessage={formError}
        onSubmit={handleSubmit}
        onClose={() => setDialog(null)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Yetkinliği Sil"
        description={deleteTarget ? `"${deleteTarget.name}" yetkinliğini silmek istediğinize emin misiniz?` : ''}
        loading={deleteCompetency.isPending}
        errorMessage={deleteError}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  )
}
