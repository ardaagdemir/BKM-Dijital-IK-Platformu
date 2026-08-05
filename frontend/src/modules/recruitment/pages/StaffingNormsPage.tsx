import AddIcon from '@mui/icons-material/Add'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import IconButton from '@mui/material/IconButton'
import { useMemo, useState } from 'react'
import { ApiError } from '../../../shared/api/ApiError'
import { EmptyState } from '../../../shared/components/EmptyState'
import { ErrorState } from '../../../shared/components/ErrorState'
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton'
import { PageHeader } from '../../../shared/components/PageHeader'
import { ResponsiveTable, type ResponsiveTableColumn } from '../../../shared/components/ResponsiveTable'
import { useToast } from '../../../shared/components/ToastProvider'
import { useJobTitles } from '../../organization/api/useJobTitles'
import { useUnits } from '../../organization/api/useUnits'
import { StaffingNormFormDialog } from '../components/StaffingNormFormDialog'
import { useSetStaffingNorm } from '../api/useSetStaffingNorm'
import { useStaffingNorms } from '../api/useStaffingNorms'
import type { StaffingNormFormValues } from '../schema'
import type { StaffingNorm } from '../types'

type DialogState = { mode: 'create' } | { mode: 'edit'; staffingNorm: StaffingNorm } | null

// US-05.1.1: Norm kadro tanımlama — `PUT` upsert semantiği (bkz.
// `StaffingNormService`), bu yüzden `leave.LeaveTypesPage`'in AKSİNE bir
// `DELETE` yok — yalnızca oluştur/güncelle.
export function StaffingNormsPage() {
  const { data: staffingNorms, isPending, isError, refetch } = useStaffingNorms()
  const { data: units } = useUnits()
  const { data: jobTitles } = useJobTitles()
  const setStaffingNorm = useSetStaffingNorm()
  const { showToast } = useToast()

  const [dialog, setDialog] = useState<DialogState>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const unitNameById = useMemo(() => new Map((units ?? []).map((unit) => [unit.id, unit.name])), [units])
  const jobTitleNameById = useMemo(
    () => new Map((jobTitles ?? []).map((jobTitle) => [jobTitle.id, jobTitle.name])),
    [jobTitles],
  )

  function openCreateDialog() {
    setFormError(null)
    setDialog({ mode: 'create' })
  }

  function openEditDialog(staffingNorm: StaffingNorm) {
    setFormError(null)
    setDialog({ mode: 'edit', staffingNorm })
  }

  async function handleSubmit(values: StaffingNormFormValues) {
    setFormError(null)
    try {
      await setStaffingNorm.mutateAsync({
        organizationUnitId: Number(values.organizationUnitId),
        jobTitleId: Number(values.jobTitleId),
        normCount: Number(values.normCount),
      })
      showToast(dialog?.mode === 'edit' ? 'Norm kadro güncellendi' : 'Norm kadro oluşturuldu')
      setDialog(null)
    } catch (error) {
      setFormError(error instanceof ApiError ? error.detail : 'Beklenmeyen bir hata oluştu, tekrar deneyin.')
    }
  }

  const columns: ResponsiveTableColumn<StaffingNorm>[] = [
    {
      key: 'organizationUnit',
      header: 'Organizasyon Birimi',
      render: (row) => unitNameById.get(row.organizationUnitId) ?? `#${row.organizationUnitId}`,
      primary: true,
    },
    {
      key: 'jobTitle',
      header: 'Unvan',
      render: (row) => jobTitleNameById.get(row.jobTitleId) ?? `#${row.jobTitleId}`,
    },
    { key: 'normCount', header: 'Norm Kadro Sayısı', render: (row) => String(row.normCount) },
  ]

  return (
    <>
      <PageHeader
        title="Norm Kadrolar"
        action={{ label: 'Yeni Norm Kadro', icon: <AddIcon />, onClick: openCreateDialog }}
      />

      {isPending && <LoadingSkeleton rows={5} />}
      {isError && <ErrorState message="Norm kadrolar yüklenemedi." onRetry={() => refetch()} />}
      {!isPending && !isError && staffingNorms?.length === 0 && (
        <EmptyState
          message="Henüz bir norm kadro tanımlanmadı."
          action={{ label: 'İlk Norm Kadroyu Oluştur', onClick: openCreateDialog }}
        />
      )}
      {!isPending && !isError && !!staffingNorms?.length && (
        <ResponsiveTable
          columns={columns}
          rows={staffingNorms}
          getRowKey={(row) => row.id}
          actions={(row) => {
            const unitName = unitNameById.get(row.organizationUnitId) ?? `#${row.organizationUnitId}`
            const jobTitleName = jobTitleNameById.get(row.jobTitleId) ?? `#${row.jobTitleId}`
            return (
              <IconButton
                size="small"
                aria-label={`${unitName} / ${jobTitleName} norm kadrosunu düzenle`}
                onClick={() => openEditDialog(row)}
              >
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            )
          }}
        />
      )}

      <StaffingNormFormDialog
        open={!!dialog}
        mode={dialog?.mode ?? 'create'}
        initialValues={
          dialog?.mode === 'edit'
            ? {
                organizationUnitId: String(dialog.staffingNorm.organizationUnitId),
                jobTitleId: String(dialog.staffingNorm.jobTitleId),
                normCount: String(dialog.staffingNorm.normCount),
              }
            : undefined
        }
        units={units ?? []}
        jobTitles={jobTitles ?? []}
        submitting={setStaffingNorm.isPending}
        errorMessage={formError}
        onSubmit={handleSubmit}
        onClose={() => setDialog(null)}
      />
    </>
  )
}
