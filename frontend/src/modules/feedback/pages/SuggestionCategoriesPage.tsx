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
import { useCreateSuggestionCategory } from '../api/useCreateSuggestionCategory'
import { useDeleteSuggestionCategory } from '../api/useDeleteSuggestionCategory'
import { useSuggestionCategories } from '../api/useSuggestionCategories'
import { useUpdateSuggestionCategory } from '../api/useUpdateSuggestionCategory'
import { SuggestionCategoryFormDialog } from '../components/SuggestionCategoryFormDialog'
import type { SuggestionCategoryFormValues } from '../schema'
import type { SuggestionCategory } from '../types'

type DialogState = { mode: 'create' } | { mode: 'edit'; category: SuggestionCategory } | null

// US-08F.1.1: "Kategori basit bir referans listesidir" — roadmap'in KENDİSİ
// bir route olarak İTEMİZE ETMEDİ ama `POST /suggestions` bir `categoryId`
// beklediğinden bu liste bir yerde YÖNETİLMELİDİR; `organization.JobTitlesPage`'deki
// AYNI "ayrı, sade CRUD ekranı" deseni tercih edildi (embedded bir panel
// yerine — JobTitle örneğindeki gibi kendi route'una sahip).
export function SuggestionCategoriesPage() {
  const { data: categories, isPending, isError, refetch } = useSuggestionCategories()
  const createCategory = useCreateSuggestionCategory()
  const updateCategory = useUpdateSuggestionCategory()
  const deleteCategory = useDeleteSuggestionCategory()
  const { showToast } = useToast()

  const [dialog, setDialog] = useState<DialogState>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SuggestionCategory | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  function openCreateDialog() {
    setFormError(null)
    setDialog({ mode: 'create' })
  }

  function openEditDialog(category: SuggestionCategory) {
    setFormError(null)
    setDialog({ mode: 'edit', category })
  }

  async function handleSubmit(values: SuggestionCategoryFormValues) {
    setFormError(null)
    try {
      if (dialog?.mode === 'edit') {
        await updateCategory.mutateAsync({ id: dialog.category.id, name: values.name })
        showToast('Kategori güncellendi')
      } else {
        await createCategory.mutateAsync(values.name)
        showToast('Kategori oluşturuldu')
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
      await deleteCategory.mutateAsync(deleteTarget.id)
      showToast('Kategori silindi')
      setDeleteTarget(null)
    } catch (error) {
      setDeleteError(error instanceof ApiError ? error.detail : 'Kategori silinemedi, tekrar deneyin.')
    }
  }

  const columns: ResponsiveTableColumn<SuggestionCategory>[] = [
    { key: 'name', header: 'Ad', primary: true, render: (row) => row.name },
  ]

  const submitting = createCategory.isPending || updateCategory.isPending

  return (
    <>
      <PageHeader title="Talep Kategorileri" action={{ label: 'Yeni Kategori', icon: <AddIcon />, onClick: openCreateDialog }} />

      {isPending && <LoadingSkeleton rows={4} />}
      {isError && <ErrorState message="Kategoriler yüklenemedi." onRetry={() => refetch()} />}
      {!isPending && !isError && categories?.length === 0 && (
        <EmptyState message="Henüz bir kategori tanımlanmadı." action={{ label: 'İlk Kategoriyi Oluştur', onClick: openCreateDialog }} />
      )}
      {!isPending && !isError && !!categories?.length && (
        <ResponsiveTable
          columns={columns}
          rows={categories}
          getRowKey={(row) => row.id}
          actions={(row) => (
            <>
              <IconButton size="small" aria-label={`${row.name} kategorisini düzenle`} onClick={() => openEditDialog(row)}>
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                aria-label={`${row.name} kategorisini sil`}
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

      <SuggestionCategoryFormDialog
        open={!!dialog}
        mode={dialog?.mode ?? 'create'}
        initialName={dialog?.mode === 'edit' ? dialog.category.name : undefined}
        submitting={submitting}
        errorMessage={formError}
        onSubmit={handleSubmit}
        onClose={() => setDialog(null)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Kategoriyi Sil"
        description={deleteTarget ? `"${deleteTarget.name}" kategorisini silmek istediğinize emin misiniz?` : ''}
        loading={deleteCategory.isPending}
        errorMessage={deleteError}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  )
}
