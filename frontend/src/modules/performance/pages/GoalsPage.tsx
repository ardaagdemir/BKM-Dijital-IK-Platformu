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
import { useCreateGoal } from '../api/useCreateGoal'
import { useDeleteGoal } from '../api/useDeleteGoal'
import { useGoals } from '../api/useGoals'
import { useUpdateGoal } from '../api/useUpdateGoal'
import { GoalFormDialog } from '../components/GoalFormDialog'
import type { GoalFormValues } from '../schema'
import type { Goal } from '../types'

type DialogState = { mode: 'create' } | { mode: 'edit'; goal: Goal } | null

// US-06.1.1: Hedef referans listesi CRUD — `leave.LeaveTypesPage`'deki AYNI
// desen; tek fark, kabul kriterinin istediği CANLI ağırlık toplamı göstergesi
// (bkz. GoalFormDialog).
export function GoalsPage() {
  const { data: goals, isPending, isError, refetch } = useGoals()
  const createGoal = useCreateGoal()
  const updateGoal = useUpdateGoal()
  const deleteGoal = useDeleteGoal()
  const { showToast } = useToast()

  const [dialog, setDialog] = useState<DialogState>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Goal | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const totalWeight = useMemo(() => (goals ?? []).reduce((sum, goal) => sum + goal.weight, 0), [goals])
  const otherGoalsWeightTotal = useMemo(() => {
    if (dialog?.mode !== 'edit') {
      return totalWeight
    }
    return totalWeight - dialog.goal.weight
  }, [dialog, totalWeight])

  function openCreateDialog() {
    setFormError(null)
    setDialog({ mode: 'create' })
  }

  function openEditDialog(goal: Goal) {
    setFormError(null)
    setDialog({ mode: 'edit', goal })
  }

  async function handleSubmit(values: GoalFormValues) {
    setFormError(null)
    const request = { name: values.name, weight: Number(values.weight) }
    try {
      if (dialog?.mode === 'edit') {
        await updateGoal.mutateAsync({ id: dialog.goal.id, request })
        showToast('Hedef güncellendi')
      } else {
        await createGoal.mutateAsync(request)
        showToast('Hedef oluşturuldu')
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
      await deleteGoal.mutateAsync(deleteTarget.id)
      showToast('Hedef silindi')
      setDeleteTarget(null)
    } catch (error) {
      setDeleteError(error instanceof ApiError ? error.detail : 'Hedef silinemedi, tekrar deneyin.')
    }
  }

  const columns: ResponsiveTableColumn<Goal>[] = [
    { key: 'name', header: 'Ad', render: (row) => row.name, primary: true },
    { key: 'weight', header: 'Ağırlık', render: (row) => String(row.weight) },
  ]

  const submitting = createGoal.isPending || updateGoal.isPending

  return (
    <>
      <PageHeader title="Hedefler" action={{ label: 'Yeni Hedef', icon: <AddIcon />, onClick: openCreateDialog }} />

      {!!goals?.length && (
        <Typography variant="body2" color={totalWeight > 100 ? 'error' : 'text.secondary'} sx={{ mb: 2 }}>
          Toplam ağırlık: {totalWeight}/100
        </Typography>
      )}

      {isPending && <LoadingSkeleton rows={5} />}
      {isError && <ErrorState message="Hedefler yüklenemedi." onRetry={() => refetch()} />}
      {!isPending && !isError && goals?.length === 0 && (
        <EmptyState message="Henüz bir hedef tanımlanmadı." action={{ label: 'İlk Hedefi Oluştur', onClick: openCreateDialog }} />
      )}
      {!isPending && !isError && !!goals?.length && (
        <ResponsiveTable
          columns={columns}
          rows={goals}
          getRowKey={(row) => row.id}
          actions={(row) => (
            <>
              <IconButton size="small" aria-label={`${row.name} hedefini düzenle`} onClick={() => openEditDialog(row)}>
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                aria-label={`${row.name} hedefini sil`}
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

      <GoalFormDialog
        open={!!dialog}
        mode={dialog?.mode ?? 'create'}
        initialValues={dialog?.mode === 'edit' ? { name: dialog.goal.name, weight: String(dialog.goal.weight) } : undefined}
        otherGoalsWeightTotal={otherGoalsWeightTotal}
        submitting={submitting}
        errorMessage={formError}
        onSubmit={handleSubmit}
        onClose={() => setDialog(null)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Hedefi Sil"
        description={deleteTarget ? `"${deleteTarget.name}" hedefini silmek istediğinize emin misiniz?` : ''}
        loading={deleteGoal.isPending}
        errorMessage={deleteError}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  )
}
