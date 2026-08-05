import { zodResolver } from '@hookform/resolvers/zod'
import AddIcon from '@mui/icons-material/Add'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { ApiError } from '../../../shared/api/ApiError'
import { EmptyState } from '../../../shared/components/EmptyState'
import { ErrorState } from '../../../shared/components/ErrorState'
import { FileUploadZone } from '../../../shared/components/FileUploadZone'
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton'
import { PageHeader } from '../../../shared/components/PageHeader'
import { ResponsiveTable, type ResponsiveTableColumn } from '../../../shared/components/ResponsiveTable'
import { StatusChip } from '../../../shared/components/StatusChip'
import { useToast } from '../../../shared/components/ToastProvider'
import { downloadBlob } from '../../../shared/utils/downloadBlob'
import { useAuth } from '../../auth/AuthProvider'
import * as travelApi from '../api/travelApi'
import { useCreateExpenseItem } from '../api/useCreateExpenseItem'
import { useDecideExpenseItem } from '../api/useDecideExpenseItem'
import { useExpenseItems } from '../api/useExpenseItems'
import { expenseItemSchema, expenseRejectionReasonSchema, type ExpenseItemFormValues, type ExpenseRejectionReasonFormValues } from '../schema'
import { EXPENSE_ITEM_STATUS_LABELS } from '../statusLabels'
import type { ExpenseItem } from '../types'

// US-08B.1.2/US-08B.1.3: Masraf kalemi ekleme (belge yükleme) + onay —
// `recruitment.CareersApplyPage`'deki AYNI multipart form deseni (`FileUploadZone`,
// 422 enfekte dosya senaryosu) + `leave`'deki AYNI "talep→onay" ret-gerekçesi
// deseni, TEK sayfada (masraf kalemleri her zaman BİR seyahat talebi
// bağlamında görüntülenir).
export function TravelRequestDetailPage() {
  const { id } = useParams<{ id: string }>()
  const travelRequestId = Number(id)
  const { user } = useAuth()
  const canDecide = !!user?.roles.some((role) => role === 'ADMIN' || role === 'IK' || role === 'YONETICI')
  const { showToast } = useToast()

  const { data: expenseItems, isPending, isError, refetch } = useExpenseItems(travelRequestId)
  const createExpenseItem = useCreateExpenseItem()
  const decideExpenseItem = useDecideExpenseItem()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [rejectTarget, setRejectTarget] = useState<ExpenseItem | null>(null)
  const [rejectError, setRejectError] = useState<string | null>(null)

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseItemFormValues>({ resolver: zodResolver(expenseItemSchema) })

  const {
    register: registerReject,
    handleSubmit: handleRejectSubmit,
    reset: resetReject,
    formState: { errors: rejectErrors, isSubmitting: isRejectSubmitting },
  } = useForm<ExpenseRejectionReasonFormValues>({
    resolver: zodResolver(expenseRejectionReasonSchema),
    defaultValues: { rejectionReason: '' },
  })

  async function onSubmit(values: ExpenseItemFormValues) {
    setCreateError(null)
    try {
      await createExpenseItem.mutateAsync({ travelRequestId, amount: values.amount, document: values.document })
      showToast('Masraf kalemi eklendi')
      setDialogOpen(false)
      reset()
    } catch (error) {
      setCreateError(error instanceof ApiError ? error.detail : 'Beklenmeyen bir hata oluştu, tekrar deneyin.')
    }
  }

  async function handleDownload(item: ExpenseItem) {
    setDownloadError(null)
    try {
      const blob = await travelApi.downloadExpenseItemDocument(travelRequestId, item.id)
      downloadBlob(blob, item.documentFileName)
    } catch (error) {
      setDownloadError(error instanceof ApiError ? error.detail : 'Belge indirilemedi, tekrar deneyin.')
    }
  }

  async function handleApprove(item: ExpenseItem) {
    setActionError(null)
    try {
      await decideExpenseItem.mutateAsync({
        travelRequestId,
        id: item.id,
        request: { decision: 'APPROVED', rejectionReason: null },
      })
      showToast('Masraf kalemi onaylandı')
    } catch (error) {
      setActionError(error instanceof ApiError ? error.detail : 'İşlem başarısız, tekrar deneyin.')
    }
  }

  async function onRejectSubmit(values: ExpenseRejectionReasonFormValues) {
    if (!rejectTarget) {
      return
    }
    setRejectError(null)
    try {
      await decideExpenseItem.mutateAsync({
        travelRequestId,
        id: rejectTarget.id,
        request: { decision: 'REJECTED', rejectionReason: values.rejectionReason },
      })
      showToast('Masraf kalemi reddedildi')
      setRejectTarget(null)
    } catch (error) {
      setRejectError(error instanceof ApiError ? error.detail : 'İşlem başarısız, tekrar deneyin.')
    }
  }

  const columns: ResponsiveTableColumn<ExpenseItem>[] = [
    {
      key: 'amount',
      header: 'Tutar',
      primary: true,
      render: (row) => row.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
    },
    {
      key: 'document',
      header: 'Belge',
      render: (row) => (
        <Button size="small" onClick={() => handleDownload(row)}>
          {row.documentFileName}
        </Button>
      ),
    },
    { key: 'status', header: 'Durum', render: (row) => <StatusChip {...EXPENSE_ITEM_STATUS_LABELS[row.status]} /> },
  ]

  return (
    <>
      <PageHeader
        title={`Seyahat Talebi #${travelRequestId}`}
        action={{ label: 'Masraf Ekle', icon: <AddIcon />, onClick: () => setDialogOpen(true) }}
      />

      {downloadError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setDownloadError(null)}>
          {downloadError}
        </Alert>
      )}
      {actionError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setActionError(null)}>
          {actionError}
        </Alert>
      )}

      {isPending && <LoadingSkeleton rows={4} />}
      {isError && <ErrorState message="Masraf kalemleri yüklenemedi." onRetry={() => refetch()} />}
      {!isPending && !isError && expenseItems?.length === 0 && (
        <EmptyState message="Henüz bir masraf kalemi eklenmedi." action={{ label: 'İlk Masraf Kalemini Ekle', onClick: () => setDialogOpen(true) }} />
      )}
      {!isPending && !isError && !!expenseItems?.length && (
        <ResponsiveTable
          columns={columns}
          rows={expenseItems}
          getRowKey={(row) => row.id}
          actions={(row) =>
            canDecide && row.status === 'PENDING' ? (
              <Stack direction="row" spacing={1}>
                <Button size="small" variant="contained" loading={decideExpenseItem.isPending} onClick={() => handleApprove(row)}>
                  Onayla
                </Button>
                <Button
                  size="small"
                  color="error"
                  onClick={() => {
                    setRejectError(null)
                    resetReject({ rejectionReason: '' })
                    setRejectTarget(row)
                  }}
                >
                  Reddet
                </Button>
              </Stack>
            ) : null
          }
        />
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Masraf Kalemi Ekle</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 0.5 }}>
              {createError && <Alert severity="error">{createError}</Alert>}
              <TextField
                {...register('amount')}
                type="number"
                label="Tutar"
                autoFocus
                fullWidth
                error={!!errors.amount}
                helperText={errors.amount?.message}
              />
              <Controller
                control={control}
                name="document"
                render={({ field }) => (
                  <FileUploadZone label="Belge" value={field.value ?? null} onChange={field.onChange} error={errors.document?.message} />
                )}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)} disabled={isSubmitting}>
              Vazgeç
            </Button>
            <Button type="submit" variant="contained" loading={isSubmitting}>
              Ekle
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={!!rejectTarget} onClose={() => setRejectTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Masraf Kalemini Reddet</DialogTitle>
        <form onSubmit={handleRejectSubmit(onRejectSubmit)} noValidate>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 0.5 }}>
              {rejectError && <Alert severity="error">{rejectError}</Alert>}
              <DialogContentText>{rejectTarget?.documentFileName}</DialogContentText>
              <TextField
                {...registerReject('rejectionReason')}
                label="Ret Gerekçesi"
                autoFocus
                fullWidth
                multiline
                rows={2}
                error={!!rejectErrors.rejectionReason}
                helperText={rejectErrors.rejectionReason?.message}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRejectTarget(null)} disabled={isRejectSubmitting}>
              Vazgeç
            </Button>
            <Button type="submit" color="error" variant="contained" loading={isRejectSubmitting}>
              Reddet
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  )
}
