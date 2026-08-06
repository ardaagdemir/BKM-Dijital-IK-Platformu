import AddIcon from '@mui/icons-material/Add'
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useMemo, useState } from 'react'
import { ApiError } from '../../../shared/api/ApiError'
import { AccordionList, type AccordionListColumn } from '../../../shared/components/AccordionList'
import { EmptyState } from '../../../shared/components/EmptyState'
import { ErrorState } from '../../../shared/components/ErrorState'
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton'
import { PageHeader } from '../../../shared/components/PageHeader'
import { StatusChip } from '../../../shared/components/StatusChip'
import { useToast } from '../../../shared/components/ToastProvider'
import { downloadBlob } from '../../../shared/utils/downloadBlob'
import * as organizationApi from '../api/organizationApi'
import { usePolicyDocuments } from '../api/usePolicyDocuments'
import { useUploadPolicyDocument } from '../api/useUploadPolicyDocument'
import { PolicyDocumentFormDialog } from '../components/PolicyDocumentFormDialog'
import { groupPolicyDocumentVersions, type PolicyDocumentGroup } from '../policyDocumentVersions'
import type { PolicyDocument } from '../types'

const STATUS_LABELS = {
  ACTIVE: { label: 'Güncel', color: 'success' as const },
  ARCHIVED: { label: 'Arşivlendi', color: 'default' as const },
}

type DialogState = { mode: 'create' } | { mode: 'new-version'; group: PolicyDocumentGroup } | null

// US-08I.1.1: Politika dokümanı yükleme/versiyonlama — roadmap'in kendi
// notu: "versiyon geçmişi AccordionList" (`discipline.DisciplinaryCaseDetailPage`'deki
// AYNI bileşen, AYNI "tüm versiyonlar TEK listede, ACTIVE/ARCHIVED
// StatusChip'iyle ayırt edilir" deseni — yalnızca BURADA doküman ailesi
// başına AYRI bir AccordionList render edilir, TEK bir dokümanın DEĞİL
// birden çok dokümanın versiyonları söz konusu olduğundan).
export function PolicyDocumentsPage() {
  const { showToast } = useToast()
  const { data: documents, isPending, isError, refetch } = usePolicyDocuments()
  const groups = useMemo(() => groupPolicyDocumentVersions(documents ?? []), [documents])

  const upload = useUploadPolicyDocument()
  const [dialog, setDialog] = useState<DialogState>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  async function handleSubmit(values: { title?: string; file: File }) {
    setFormError(null)
    try {
      await upload.mutateAsync({
        title: values.title,
        previousVersionId: dialog?.mode === 'new-version' ? dialog.group.current.id : undefined,
        file: values.file,
      })
      showToast(dialog?.mode === 'new-version' ? 'Yeni versiyon yüklendi' : 'Doküman yüklendi')
      setDialog(null)
    } catch (error) {
      setFormError(error instanceof ApiError ? error.detail : 'Beklenmeyen bir hata oluştu, tekrar deneyin.')
    }
  }

  async function handleDownload(document: PolicyDocument) {
    setDownloadError(null)
    try {
      const blob = await organizationApi.downloadPolicyDocument(document.id)
      downloadBlob(blob, document.fileName)
    } catch (error) {
      setDownloadError(error instanceof ApiError ? error.detail : 'Belge indirilemedi, tekrar deneyin.')
    }
  }

  const columns: AccordionListColumn<PolicyDocument>[] = [
    { key: 'version', header: 'Versiyon', render: (row) => `v${row.version}` },
    { key: 'fileName', header: 'Dosya', render: (row) => row.fileName },
    { key: 'status', header: 'Durum', render: (row) => <StatusChip {...STATUS_LABELS[row.status]} /> },
    {
      key: 'download',
      header: '',
      render: (row) => (
        <IconButton size="small" aria-label={`${row.fileName} dosyasını indir`} onClick={() => handleDownload(row)}>
          <DownloadOutlinedIcon fontSize="small" />
        </IconButton>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Politika Dokümanları"
        action={{ label: 'Yeni Doküman', icon: <AddIcon />, onClick: () => setDialog({ mode: 'create' }) }}
      />
      {downloadError && <ErrorState message={downloadError} onRetry={() => setDownloadError(null)} />}

      {isPending && <LoadingSkeleton rows={4} />}
      {isError && <ErrorState message="Dokümanlar yüklenemedi." onRetry={() => refetch()} />}
      {!isPending && !isError && groups.length === 0 && <EmptyState message="Henüz bir doküman yüklenmedi." />}

      <Stack spacing={3}>
        {groups.map((group) => (
          <Paper key={group.rootId} sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="h2">
                {group.current.title}
              </Typography>
              <Button size="small" onClick={() => setDialog({ mode: 'new-version', group })}>
                Yeni Versiyon Yükle
              </Button>
            </Stack>
            <AccordionList
              columns={columns}
              rows={[group.current, ...group.history]}
              getRowKey={(row) => row.id}
              renderSummary={(row) => `v${row.version} · ${STATUS_LABELS[row.status].label}`}
              renderDetail={(row) => (
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">{row.fileName}</Typography>
                  <Button size="small" onClick={() => handleDownload(row)}>
                    İndir
                  </Button>
                </Stack>
              )}
            />
          </Paper>
        ))}
      </Stack>

      <PolicyDocumentFormDialog
        open={!!dialog}
        mode={dialog?.mode ?? 'create'}
        submitting={upload.isPending}
        errorMessage={formError}
        onSubmit={handleSubmit}
        onClose={() => setDialog(null)}
      />
    </>
  )
}
