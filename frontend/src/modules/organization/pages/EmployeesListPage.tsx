import AddIcon from '@mui/icons-material/Add'
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom'
import { ApiError } from '../../../shared/api/ApiError'
import { EmptyState } from '../../../shared/components/EmptyState'
import { ErrorState } from '../../../shared/components/ErrorState'
import { FilterBar } from '../../../shared/components/FilterBar'
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton'
import { Pagination } from '../../../shared/components/Pagination'
import { PageHeader } from '../../../shared/components/PageHeader'
import { ResponsiveTable, type ResponsiveTableColumn } from '../../../shared/components/ResponsiveTable'
import { useToast } from '../../../shared/components/ToastProvider'
import { useDebouncedValue } from '../../../shared/hooks/useDebouncedValue'
import { downloadBlob } from '../../../shared/utils/downloadBlob'
import * as organizationApi from '../api/organizationApi'
import { useEmployees } from '../api/useEmployees'
import { useJobTitles } from '../api/useJobTitles'
import { useUnits } from '../api/useUnits'
import {
  DEFAULT_EMPLOYEE_LIST_FILTERS,
  buildEmployeeListSearchParams,
  parseEmployeeListFilters,
  type EmployeeListFilters,
} from '../employeeListParams'
import type { Employee } from '../types'
import { buildUnitTree, flattenTreeForSelect } from '../utils/buildUnitTree'

export function EmployeesListPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = parseEmployeeListFilters(searchParams)

  const [nameInput, setNameInput] = useState(filters.name)
  const debouncedName = useDebouncedValue(nameInput, 400)
  const isFirstRender = useRef(true)

  const { data: units } = useUnits()
  const { data: jobTitles } = useJobTitles()

  const unitSelectOptions = useMemo(
    () => flattenTreeForSelect(buildUnitTree(units ?? [])),
    [units],
  )
  const unitNameById = useMemo(() => new Map((units ?? []).map((unit) => [unit.id, unit.name])), [units])
  const jobTitleNameById = useMemo(
    () => new Map((jobTitles ?? []).map((jobTitle) => [jobTitle.id, jobTitle.name])),
    [jobTitles],
  )

  function commitFilters(partial: Partial<Omit<EmployeeListFilters, 'page'>>) {
    setSearchParams(buildEmployeeListSearchParams({ ...filters, ...partial, page: 0 }), { replace: true })
  }

  // Bölüm 13.6: "İsim arama (debounced text input)" — yazarken her tuş
  // vuruşunda URL/API tetiklenmez, 400ms sessizlikten SONRA commit edilir.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    commitFilters({ name: debouncedName })
    // commitFilters her render'da yeniden oluşur (memoize edilmez); onu deps'e
    // eklemek debounce'u anlamsızlaştırır (her render'da tetiklenir).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedName])

  function setPage(page: number) {
    setSearchParams(buildEmployeeListSearchParams({ ...filters, page }), { replace: true })
  }

  function clearAllFilters() {
    setNameInput('')
    setSearchParams(buildEmployeeListSearchParams(DEFAULT_EMPLOYEE_LIST_FILTERS), { replace: true })
  }

  const queryParams = {
    name: filters.name || undefined,
    organizationUnitId: filters.organizationUnitId ? Number(filters.organizationUnitId) : undefined,
    jobTitleId: filters.jobTitleId ? Number(filters.jobTitleId) : undefined,
    page: filters.page,
  }

  const { data, isPending, isError, refetch, isPlaceholderData } = useEmployees(queryParams)
  const hasActiveFilters = !!filters.name || !!filters.organizationUnitId || !!filters.jobTitleId

  const [exportMenuAnchor, setExportMenuAnchor] = useState<HTMLElement | null>(null)
  const [exporting, setExporting] = useState(false)

  async function handleExport(format: 'csv' | 'xlsx') {
    setExportMenuAnchor(null)
    setExporting(true)
    try {
      const blob = await organizationApi.exportEmployees({ ...queryParams, format })
      downloadBlob(blob, `calisanlar.${format}`)
    } catch (error) {
      showToast(error instanceof ApiError ? error.detail : 'Dışa aktarma başarısız oldu, tekrar deneyin.', 'error')
    } finally {
      setExporting(false)
    }
  }

  const columns: ResponsiveTableColumn<Employee>[] = [
    {
      key: 'name',
      header: 'Ad Soyad',
      primary: true,
      render: (row) => (
        <Link component={RouterLink} to={`/organization/employees/${row.id}`} underline="hover">
          {row.firstName} {row.lastName}
        </Link>
      ),
    },
    { key: 'nationalId', header: 'TC Kimlik No', render: (row) => row.nationalId },
    {
      key: 'unit',
      header: 'Birim',
      render: (row) => (row.organizationUnitId ? (unitNameById.get(row.organizationUnitId) ?? '—') : '—'),
    },
    {
      key: 'jobTitle',
      header: 'Unvan',
      render: (row) => (row.jobTitleId ? (jobTitleNameById.get(row.jobTitleId) ?? '—') : '—'),
    },
    { key: 'hireDate', header: 'İşe Giriş Tarihi', render: (row) => row.hireDate },
  ]

  return (
    <>
      <PageHeader
        title="Çalışanlar"
        action={{ label: 'Yeni Çalışan', icon: <AddIcon />, onClick: () => navigate('/organization/employees/new') }}
      />

      <Stack direction="row" sx={{ justifyContent: 'flex-end', mb: 2 }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<DownloadOutlinedIcon />}
          loading={exporting}
          aria-haspopup="true"
          onClick={(event) => setExportMenuAnchor(event.currentTarget)}
        >
          Dışa Aktar
        </Button>
        <Menu anchorEl={exportMenuAnchor} open={!!exportMenuAnchor} onClose={() => setExportMenuAnchor(null)}>
          <MenuItem onClick={() => handleExport('csv')}>CSV olarak indir</MenuItem>
          <MenuItem onClick={() => handleExport('xlsx')}>Excel (XLSX) olarak indir</MenuItem>
        </Menu>
      </Stack>

      <FilterBar
        value={nameInput}
        onChange={setNameInput}
        placeholder="İsim ara"
        label="İsim ara"
        onClearAll={clearAllFilters}
        selects={[
          {
            label: 'Birim',
            value: filters.organizationUnitId,
            options: unitSelectOptions.map((unit) => ({
              value: String(unit.id),
              label: `${'—'.repeat(unit.depth)} ${unit.name}`.trim(),
            })),
            onChange: (value) => commitFilters({ organizationUnitId: value }),
          },
          {
            label: 'Unvan',
            value: filters.jobTitleId,
            options: (jobTitles ?? []).map((jobTitle) => ({ value: String(jobTitle.id), label: jobTitle.name })),
            onChange: (value) => commitFilters({ jobTitleId: value }),
          },
        ]}
      />

      {isPending && <LoadingSkeleton rows={5} />}
      {isError && <ErrorState message="Çalışanlar yüklenemedi." onRetry={() => refetch()} />}
      {!isPending && !isError && data?.content.length === 0 && hasActiveFilters && (
        <EmptyState
          message="Bu filtrelere uygun çalışan bulunamadı."
          action={{ label: 'Filtreleri Temizle', onClick: clearAllFilters }}
        />
      )}
      {!isPending && !isError && data?.content.length === 0 && !hasActiveFilters && (
        <EmptyState
          message="Henüz çalışan kaydı yok."
          action={{ label: 'İlk Çalışanı Oluştur', onClick: () => navigate('/organization/employees/new') }}
        />
      )}
      {!isPending && !isError && !!data?.content.length && (
        <>
          <Box sx={{ opacity: isPlaceholderData ? 0.5 : 1, transition: 'opacity 0.15s' }}>
            <ResponsiveTable
              columns={columns}
              rows={data.content}
              getRowKey={(row) => row.id}
              onRowClick={(row) => navigate(`/organization/employees/${row.id}`)}
            />
          </Box>
          <Pagination
            page={data.page.number}
            totalPages={data.page.totalPages}
            totalElements={data.page.totalElements}
            onChange={setPage}
          />
        </>
      )}
    </>
  )
}
