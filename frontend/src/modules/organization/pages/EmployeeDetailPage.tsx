import { zodResolver } from '@hookform/resolvers/zod'
import AddIcon from '@mui/icons-material/Add'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../../../shared/api/ApiError'
import { AccordionList, type AccordionListColumn } from '../../../shared/components/AccordionList'
import { DetailField } from '../../../shared/components/DetailField'
import { EmptyState } from '../../../shared/components/EmptyState'
import { ErrorState } from '../../../shared/components/ErrorState'
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton'
import { PageHeader } from '../../../shared/components/PageHeader'
import { ResponsiveTable, type ResponsiveTableColumn } from '../../../shared/components/ResponsiveTable'
import { useToast } from '../../../shared/components/ToastProvider'
import { useAuth } from '../../auth/AuthProvider'
import { formatAssignmentEndDate } from '../assignmentHistory'
import { useAssignEmployee } from '../api/useAssignEmployee'
import { useAssignmentHistory } from '../api/useAssignmentHistory'
import { useCreateEmployeeAsset } from '../api/useCreateEmployeeAsset'
import { useEmployee } from '../api/useEmployee'
import { useEmployeeAssets } from '../api/useEmployeeAssets'
import { useEmployeeProfile } from '../api/useEmployeeProfile'
import { useJobTitles } from '../api/useJobTitles'
import { useReturnEmployeeAsset } from '../api/useReturnEmployeeAsset'
import { useSaveEmployeeProfile } from '../api/useSaveEmployeeProfile'
import { useUnits } from '../api/useUnits'
import { useUpdateEmployee } from '../api/useUpdateEmployee'
import { AssetFormDialog } from '../components/AssetFormDialog'
import { ReturnAssetDialog } from '../components/ReturnAssetDialog'
import { canEditEmployee } from '../employeeAccess'
import {
  FIELD_ERROR_MESSAGES,
  assignmentSchema,
  employeeProfileSchema,
  employeeSchema,
  type AssignmentFormValues,
  type EmployeeAssetFormValues,
  type EmployeeFormValues,
  type EmployeeProfileFormValues,
} from '../schema'
import type {
  Employee,
  EmployeeAsset,
  EmployeeAssignmentHistoryEntry,
  EmployeeProfile,
  JobTitle,
  OrganizationUnit,
} from '../types'
import { buildUnitTree, flattenTreeForSelect } from '../utils/buildUnitTree'

function GeneralInfoSection({ employee, canEdit }: { employee: Employee; canEdit: boolean }) {
  const { showToast } = useToast()
  const updateEmployee = useUpdateEmployee()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      firstName: employee.firstName,
      lastName: employee.lastName,
      nationalId: employee.nationalId,
      hireDate: employee.hireDate,
      email: employee.email,
    },
  })

  async function onSubmit(values: EmployeeFormValues) {
    setSubmitError(null)
    try {
      const updated = await updateEmployee.mutateAsync({ id: employee.id, request: values })
      showToast('Çalışan bilgileri güncellendi')
      reset({
        firstName: updated.firstName,
        lastName: updated.lastName,
        nationalId: updated.nationalId,
        hireDate: updated.hireDate,
        email: updated.email,
      })
    } catch (error) {
      if (error instanceof ApiError) {
        setSubmitError(error.detail)
        const field = FIELD_ERROR_MESSAGES[error.detail]
        if (field) {
          setError(field, { type: 'server', message: error.detail })
        }
      } else {
        setSubmitError('Beklenmeyen bir hata oluştu, tekrar deneyin.')
      }
    }
  }

  if (!canEdit) {
    return (
      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Genel Bilgiler
        </Typography>
        <Stack spacing={2.5}>
          <DetailField label="Ad" value={employee.firstName} />
          <DetailField label="Soyad" value={employee.lastName} />
          <DetailField label="TC Kimlik No" value={employee.nationalId} />
          <DetailField label="İşe Giriş Tarihi" value={employee.hireDate} />
          <DetailField label="E-posta" value={employee.email} />
        </Stack>
      </Paper>
    )
  }

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h6" component="h2" gutterBottom>
        Genel Bilgiler
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Grid container spacing={2.5}>
          {submitError && (
            <Grid size={12}>
              <Alert severity="error">{submitError}</Alert>
            </Grid>
          )}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              {...register('firstName')}
              label="Ad"
              fullWidth
              error={!!errors.firstName}
              helperText={errors.firstName?.message}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              {...register('lastName')}
              label="Soyad"
              fullWidth
              error={!!errors.lastName}
              helperText={errors.lastName?.message}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              {...register('nationalId')}
              label="TC Kimlik No"
              fullWidth
              error={!!errors.nationalId}
              helperText={errors.nationalId?.message}
              slotProps={{ htmlInput: { inputMode: 'numeric', maxLength: 11 } }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              control={control}
              name="hireDate"
              render={({ field, fieldState }) => (
                <DatePicker
                  label="İşe Giriş Tarihi"
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(date) => field.onChange(date?.isValid() ? date.format('YYYY-MM-DD') : '')}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!fieldState.error,
                      helperText: fieldState.error?.message,
                    },
                  }}
                />
              )}
            />
          </Grid>
          <Grid size={12}>
            <TextField
              {...register('email')}
              label="E-posta"
              type="email"
              fullWidth
              error={!!errors.email}
              helperText={errors.email?.message}
            />
          </Grid>
          <Grid size={12}>
            <Button type="submit" variant="contained" loading={isSubmitting} sx={{ minWidth: 160 }}>
              Kaydet
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  )
}

type AssignmentSectionProps = {
  employee: Employee
  canEdit: boolean
  units: OrganizationUnit[] | undefined
  jobTitles: JobTitle[] | undefined
}

function AssignmentSection({ employee, canEdit, units, jobTitles }: AssignmentSectionProps) {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const assignEmployee = useAssignEmployee()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const unitSelectOptions = useMemo(() => flattenTreeForSelect(buildUnitTree(units ?? [])), [units])
  const unitNameById = useMemo(() => new Map((units ?? []).map((unit) => [unit.id, unit.name])), [units])
  const jobTitleNameById = useMemo(
    () => new Map((jobTitles ?? []).map((jobTitle) => [jobTitle.id, jobTitle.name])),
    [jobTitles],
  )

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      organizationUnitId: employee.organizationUnitId ? String(employee.organizationUnitId) : '',
      jobTitleId: employee.jobTitleId ? String(employee.jobTitleId) : '',
    },
  })

  // Atama başarıyla kaydedildiğinde `useEmployee` sorgusu invalidate edilir,
  // GÜNCEL employee prop'u buraya akar — form varsayılanları YENİDEN
  // senkronlanır (bkz. roadmap: "atama sonrası ANINDA güncellenir").
  useEffect(() => {
    reset({
      organizationUnitId: employee.organizationUnitId ? String(employee.organizationUnitId) : '',
      jobTitleId: employee.jobTitleId ? String(employee.jobTitleId) : '',
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employee.organizationUnitId, employee.jobTitleId])

  async function onSubmit(values: AssignmentFormValues) {
    setSubmitError(null)
    try {
      await assignEmployee.mutateAsync({
        id: employee.id,
        request: { organizationUnitId: Number(values.organizationUnitId), jobTitleId: Number(values.jobTitleId) },
      })
      showToast('Atama güncellendi')
    } catch (error) {
      setSubmitError(error instanceof ApiError ? error.detail : 'Beklenmeyen bir hata oluştu, tekrar deneyin.')
    }
  }

  if (!canEdit) {
    return (
      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Atama
        </Typography>
        <Stack spacing={2.5}>
          <DetailField
            label="Birim"
            value={employee.organizationUnitId ? (unitNameById.get(employee.organizationUnitId) ?? '—') : 'Atanmadı'}
          />
          <DetailField
            label="Unvan"
            value={employee.jobTitleId ? (jobTitleNameById.get(employee.jobTitleId) ?? '—') : 'Atanmadı'}
          />
        </Stack>
      </Paper>
    )
  }

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h6" component="h2" gutterBottom>
        Atama
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Grid container spacing={2.5}>
          {submitError && (
            <Grid size={12}>
              <Alert severity="error">{submitError}</Alert>
            </Grid>
          )}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              control={control}
              name="organizationUnitId"
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Birim"
                  fullWidth
                  error={!!errors.organizationUnitId}
                  helperText={errors.organizationUnitId?.message}
                >
                  {unitSelectOptions.map((unit) => (
                    <MenuItem key={unit.id} value={String(unit.id)}>
                      {`${'—'.repeat(unit.depth)} ${unit.name}`.trim()}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              control={control}
              name="jobTitleId"
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Unvan"
                  fullWidth
                  error={!!errors.jobTitleId}
                  helperText={errors.jobTitleId?.message}
                >
                  {(jobTitles ?? []).map((jobTitle) => (
                    <MenuItem key={jobTitle.id} value={String(jobTitle.id)}>
                      {jobTitle.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>
          <Grid size={12}>
            <Stack direction="row" spacing={1.5}>
              <Button type="submit" variant="contained" loading={isSubmitting} sx={{ minWidth: 160 }}>
                Kaydet
              </Button>
              {/* Bölüm 14.6 (US-07.1.2): `attendance` `organization`'a bağımlı
                  DEĞİL, bu yüzden AYRI bir route/sayfa (bkz. WorkModelAssignmentPage'in
                  KENDİ dosyasındaki gerekçe) — buradan yalnızca bir bağlantı. */}
              <Button variant="outlined" onClick={() => navigate(`/attendance/employees/${employee.id}/work-model`)}>
                Çalışma Modelini Yönet
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </form>
    </Paper>
  )
}

function profileToFormValues(profile: EmployeeProfile | undefined): EmployeeProfileFormValues {
  return {
    birthDate: profile?.birthDate ?? '',
    birthPlace: profile?.birthPlace ?? '',
    gender: profile?.gender ?? '',
    city: profile?.city ?? '',
    district: profile?.district ?? '',
    addressLine: profile?.addressLine ?? '',
    educationLevel: profile?.educationLevel ?? '',
    schoolName: profile?.schoolName ?? '',
    graduationYear: profile?.graduationYear ? String(profile.graduationYear) : '',
    foreignLanguage: profile?.foreignLanguage ?? '',
    languageLevel: profile?.languageLevel ?? '',
  }
}

// Bölüm 14.2 (US-03.3.1): "Genişletilmiş Özlük" — GET, profil hiç
// kaydedilmemişse 404 döner (bkz. useEmployeeProfile) — bu HATA değil, "boş
// form"/"henüz girilmedi" durumu olarak ele alınır.
function ExtendedProfileSection({ employeeId, canEdit }: { employeeId: number; canEdit: boolean }) {
  const { showToast } = useToast()
  const { data: profile, isPending, isError, error, refetch } = useEmployeeProfile(employeeId)
  const saveProfile = useSaveEmployeeProfile()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const profileMissing = isError && error instanceof ApiError && error.status === 404
  const loadFailed = isError && !profileMissing

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeProfileFormValues>({
    resolver: zodResolver(employeeProfileSchema),
    defaultValues: profileToFormValues(undefined),
  })

  useEffect(() => {
    if (profile) {
      reset(profileToFormValues(profile))
    } else if (profileMissing) {
      reset(profileToFormValues(undefined))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, profileMissing])

  if (isPending) {
    return <LoadingSkeleton rows={4} />
  }

  if (loadFailed) {
    return <ErrorState message="Özlük bilgileri yüklenemedi." onRetry={() => refetch()} />
  }

  async function onSubmit(values: EmployeeProfileFormValues) {
    setSubmitError(null)
    try {
      const saved = await saveProfile.mutateAsync({
        id: employeeId,
        request: {
          birthDate: values.birthDate || null,
          birthPlace: values.birthPlace || null,
          gender: values.gender || null,
          city: values.city || null,
          district: values.district || null,
          addressLine: values.addressLine || null,
          educationLevel: values.educationLevel || null,
          schoolName: values.schoolName || null,
          graduationYear: values.graduationYear ? Number(values.graduationYear) : null,
          foreignLanguage: values.foreignLanguage || null,
          languageLevel: values.languageLevel || null,
        },
      })
      showToast('Özlük bilgileri güncellendi')
      reset(profileToFormValues(saved))
    } catch (error) {
      setSubmitError(error instanceof ApiError ? error.detail : 'Beklenmeyen bir hata oluştu, tekrar deneyin.')
    }
  }

  if (!canEdit) {
    if (profileMissing) {
      return (
        <Paper sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h6" component="h2" gutterBottom>
            Genişletilmiş Özlük
          </Typography>
          <Typography color="text.secondary">Henüz özlük bilgisi girilmedi.</Typography>
        </Paper>
      )
    }
    return (
      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Genişletilmiş Özlük
        </Typography>
        <Stack spacing={2.5}>
          <DetailField label="Doğum Tarihi" value={profile?.birthDate ?? '—'} />
          <DetailField label="Doğum Yeri" value={profile?.birthPlace ?? '—'} />
          <DetailField label="Cinsiyet" value={profile?.gender ?? '—'} />
          <DetailField label="Şehir" value={profile?.city ?? '—'} />
          <DetailField label="İlçe" value={profile?.district ?? '—'} />
          <DetailField label="Adres" value={profile?.addressLine ?? '—'} />
          <DetailField label="Öğrenim Düzeyi" value={profile?.educationLevel ?? '—'} />
          <DetailField label="Okul" value={profile?.schoolName ?? '—'} />
          <DetailField label="Mezuniyet Yılı" value={profile?.graduationYear ? String(profile.graduationYear) : '—'} />
          <DetailField label="Yabancı Dil" value={profile?.foreignLanguage ?? '—'} />
          <DetailField label="Dil Seviyesi" value={profile?.languageLevel ?? '—'} />
        </Stack>
      </Paper>
    )
  }

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h6" component="h2" gutterBottom>
        Genişletilmiş Özlük
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Grid container spacing={2.5}>
          {submitError && (
            <Grid size={12}>
              <Alert severity="error">{submitError}</Alert>
            </Grid>
          )}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              control={control}
              name="birthDate"
              render={({ field, fieldState }) => (
                <DatePicker
                  label="Doğum Tarihi"
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(date) => field.onChange(date?.isValid() ? date.format('YYYY-MM-DD') : '')}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!fieldState.error,
                      helperText: fieldState.error?.message,
                    },
                  }}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField {...register('birthPlace')} label="Doğum Yeri" fullWidth />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField {...register('gender')} label="Cinsiyet" fullWidth />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField {...register('city')} label="Şehir" fullWidth />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField {...register('district')} label="İlçe" fullWidth />
          </Grid>
          <Grid size={12}>
            <TextField {...register('addressLine')} label="Adres" fullWidth multiline rows={2} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField {...register('educationLevel')} label="Öğrenim Düzeyi" fullWidth />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField {...register('schoolName')} label="Okul" fullWidth />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              {...register('graduationYear')}
              label="Mezuniyet Yılı"
              fullWidth
              error={!!errors.graduationYear}
              helperText={errors.graduationYear?.message}
              slotProps={{ htmlInput: { inputMode: 'numeric', maxLength: 4 } }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField {...register('foreignLanguage')} label="Yabancı Dil" fullWidth />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField {...register('languageLevel')} label="Dil Seviyesi" fullWidth />
          </Grid>
          <Grid size={12}>
            <Button type="submit" variant="contained" loading={isSubmitting} sx={{ minWidth: 160 }}>
              Kaydet
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  )
}

// Bölüm 14.2 (US-03.3.2): "Zimmetler" — yalnızca ADMIN/IK'ya gösterilir
// (kaydın sahibi bile göremez, roadmap'in kendi rol tablosu) — bu yüzden
// `canEdit` prop'u ALINMAZ, sekme zaten yalnızca canEdit=true iken render
// edilir (bkz. EmployeeDetailPage'in sekme filtrelemesi).
function AssetsSection({ employeeId }: { employeeId: number }) {
  const { showToast } = useToast()
  const { data: assets, isPending, isError, refetch } = useEmployeeAssets(employeeId)
  const createAsset = useCreateEmployeeAsset()
  const returnAsset = useReturnEmployeeAsset()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [returnTarget, setReturnTarget] = useState<EmployeeAsset | null>(null)
  const [returnedAt, setReturnedAt] = useState('')
  const [returnError, setReturnError] = useState<string | null>(null)

  async function handleCreateSubmit(values: EmployeeAssetFormValues) {
    setCreateError(null)
    try {
      await createAsset.mutateAsync({ employeeId, request: values })
      showToast('Zimmet eklendi')
      setDialogOpen(false)
    } catch (error) {
      setCreateError(error instanceof ApiError ? error.detail : 'Zimmet eklenemedi, tekrar deneyin.')
    }
  }

  async function handleReturnConfirm() {
    if (!returnTarget || !returnedAt) {
      return
    }
    setReturnError(null)
    try {
      await returnAsset.mutateAsync({ employeeId, assetId: returnTarget.id, request: { returnedAt } })
      showToast('Zimmet iade alındı')
      setReturnTarget(null)
    } catch (error) {
      setReturnError(error instanceof ApiError ? error.detail : 'İade işlemi başarısız, tekrar deneyin.')
    }
  }

  const columns: ResponsiveTableColumn<EmployeeAsset>[] = [
    { key: 'itemName', header: 'Zimmet', primary: true, render: (row) => row.itemName },
    { key: 'deliveredAt', header: 'Teslim Tarihi', render: (row) => row.deliveredAt },
    { key: 'returnedAt', header: 'İade Tarihi', render: (row) => row.returnedAt ?? '—' },
  ]

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 } }}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h2">
          Zimmetler
        </Typography>
        <Button
          size="small"
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => {
            setCreateError(null)
            setDialogOpen(true)
          }}
        >
          Yeni Zimmet
        </Button>
      </Stack>

      {isPending && <LoadingSkeleton rows={3} />}
      {isError && <ErrorState message="Zimmetler yüklenemedi." onRetry={() => refetch()} />}
      {!isPending && !isError && assets?.length === 0 && <EmptyState message="Henüz zimmet kaydı yok." />}
      {!isPending && !isError && !!assets?.length && (
        <ResponsiveTable
          columns={columns}
          rows={assets}
          getRowKey={(row) => row.id}
          actions={(row) =>
            row.returnedAt ? null : (
              <Button
                size="small"
                onClick={() => {
                  setReturnError(null)
                  setReturnedAt(dayjs().format('YYYY-MM-DD'))
                  setReturnTarget(row)
                }}
              >
                İade Al
              </Button>
            )
          }
        />
      )}

      <AssetFormDialog
        open={dialogOpen}
        submitting={createAsset.isPending}
        errorMessage={createError}
        onSubmit={handleCreateSubmit}
        onClose={() => setDialogOpen(false)}
      />

      <ReturnAssetDialog
        open={!!returnTarget}
        itemName={returnTarget?.itemName ?? ''}
        returnedAt={returnedAt}
        onReturnedAtChange={setReturnedAt}
        submitting={returnAsset.isPending}
        errorMessage={returnError}
        onConfirm={handleReturnConfirm}
        onCancel={() => setReturnTarget(null)}
      />
    </Paper>
  )
}

type AssignmentHistorySectionProps = {
  employeeId: number
  units: OrganizationUnit[] | undefined
  jobTitles: JobTitle[] | undefined
}

// Bölüm 14.2 (US-03.4.1): "Atama Geçmişi" — salt-okunur, yalnızca ADMIN/IK
// (bkz. AssetsSection'daki AYNI not); `AccordionList` (13.8'de inşa edildi)
// bu bölümün İKİNCİ gerçek kullanımı.
function AssignmentHistorySection({ employeeId, units, jobTitles }: AssignmentHistorySectionProps) {
  const { data: history, isPending, isError, refetch } = useAssignmentHistory(employeeId)
  const unitNameById = useMemo(() => new Map((units ?? []).map((unit) => [unit.id, unit.name])), [units])
  const jobTitleNameById = useMemo(
    () => new Map((jobTitles ?? []).map((jobTitle) => [jobTitle.id, jobTitle.name])),
    [jobTitles],
  )

  const columns: AccordionListColumn<EmployeeAssignmentHistoryEntry>[] = [
    { key: 'unit', header: 'Birim', render: (row) => unitNameById.get(row.organizationUnitId) ?? '—' },
    { key: 'jobTitle', header: 'Unvan', render: (row) => jobTitleNameById.get(row.jobTitleId) ?? '—' },
    { key: 'startDate', header: 'Başlangıç', render: (row) => row.startDate },
    { key: 'endDate', header: 'Bitiş', render: (row) => formatAssignmentEndDate(row.endDate) },
  ]

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h6" component="h2" gutterBottom>
        Atama Geçmişi
      </Typography>
      {isPending && <LoadingSkeleton rows={3} />}
      {isError && <ErrorState message="Atama geçmişi yüklenemedi." onRetry={() => refetch()} />}
      {!isPending && !isError && history?.length === 0 && <EmptyState message="Henüz atama geçmişi yok." />}
      {!isPending && !isError && !!history?.length && (
        <AccordionList
          columns={columns}
          rows={history}
          getRowKey={(row) => row.id}
          renderSummary={(row) => (
            <Typography variant="body2">
              {row.startDate} – {formatAssignmentEndDate(row.endDate)} · {unitNameById.get(row.organizationUnitId) ?? '—'}{' '}
              · {jobTitleNameById.get(row.jobTitleId) ?? '—'}
            </Typography>
          )}
          renderDetail={(row) => (
            <Stack spacing={0.5}>
              <Typography variant="body2">Birim: {unitNameById.get(row.organizationUnitId) ?? '—'}</Typography>
              <Typography variant="body2">Unvan: {jobTitleNameById.get(row.jobTitleId) ?? '—'}</Typography>
              <Typography variant="body2">Başlangıç: {row.startDate}</Typography>
              <Typography variant="body2">Bitiş: {formatAssignmentEndDate(row.endDate)}</Typography>
            </Stack>
          )}
        />
      )}
    </Paper>
  )
}

const TAB_GENEL = 0
const TAB_OZLUK = 1
const TAB_ZIMMETLER = 2
const TAB_ATAMA_GECMISI = 3

export function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const employeeId = Number(id)
  const isValidId = Number.isFinite(employeeId)
  const { data: employee, isPending, isError, error, refetch } = useEmployee(employeeId)
  const { data: units } = useUnits()
  const { data: jobTitles } = useJobTitles()
  const [activeTab, setActiveTab] = useState(TAB_GENEL)

  const notFound = !isValidId || (isError && error instanceof ApiError && error.status === 404)
  const forbidden = isError && error instanceof ApiError && error.status === 403
  const canEdit = canEditEmployee(user?.roles ?? [])

  if (notFound) {
    return (
      <Stack spacing={2} sx={{ py: 8, alignItems: 'center', textAlign: 'center' }}>
        <Typography variant="h5" component="h1">
          Çalışan bulunamadı
        </Typography>
        <Button variant="outlined" onClick={() => navigate(-1)}>
          Geri Dön
        </Button>
      </Stack>
    )
  }

  // Bölüm 13.7 Rol bazlı erişim: `GET /employees/{id}`, ADMIN/IK DIŞINDA
  // yalnızca kaydın SAHİBİNİ (isSelf) kabul eder — başka bir çalışanın
  // kaydına erişim backend'de 403 ile reddedilir (bkz.
  // organization.EmployeeAccessGuard). Bu tam sayfa durum, o reddi 404'ten
  // AYRI, anlaşılır bir mesajla gösterir.
  if (forbidden) {
    return (
      <Stack spacing={2} sx={{ py: 8, alignItems: 'center', textAlign: 'center' }}>
        <Typography variant="h5" component="h1">
          Bu kayda erişim yetkiniz yok
        </Typography>
        <Button variant="outlined" onClick={() => navigate(-1)}>
          Geri Dön
        </Button>
      </Stack>
    )
  }

  if (isPending) {
    return (
      <>
        <PageHeader title="Çalışan" />
        <LoadingSkeleton rows={5} />
      </>
    )
  }

  if (isError) {
    return <ErrorState message="Çalışan yüklenemedi." onRetry={() => refetch()} />
  }

  // Bölüm 14.2: "Zimmetler"/"Atama Geçmişi" roadmap'in kendi rol
  // tablosunda yalnızca ADMIN/IK — kaydın sahibi bile GÖRMEZ (Genişletilmiş
  // Özlük'ten FARKLI, o self için de GÖRÜNTÜLENEBİLİR salt-okunur). Bu
  // yüzden bu iki sekme canEdit=false iken Tabs'tan TAMAMEN çıkarılır —
  // aktif sekme zaten yalnızca görünür bir Tab'a tıklanarak değişebildiği
  // için ayrı bir "clamp" mantığına gerek yok.
  return (
    <>
      <PageHeader title={`${employee.firstName} ${employee.lastName}`} />
      <Tabs
        value={activeTab}
        onChange={(_event, value: number) => setActiveTab(value)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Genel Bilgiler" value={TAB_GENEL} />
        <Tab label="Genişletilmiş Özlük" value={TAB_OZLUK} />
        {canEdit && <Tab label="Zimmetler" value={TAB_ZIMMETLER} />}
        {canEdit && <Tab label="Atama Geçmişi" value={TAB_ATAMA_GECMISI} />}
      </Tabs>

      <Stack spacing={3} sx={{ maxWidth: 720 }}>
        {activeTab === TAB_GENEL && (
          <>
            <GeneralInfoSection employee={employee} canEdit={canEdit} />
            <AssignmentSection employee={employee} canEdit={canEdit} units={units} jobTitles={jobTitles} />
          </>
        )}
        {activeTab === TAB_OZLUK && <ExtendedProfileSection employeeId={employee.id} canEdit={canEdit} />}
        {canEdit && activeTab === TAB_ZIMMETLER && <AssetsSection employeeId={employee.id} />}
        {canEdit && activeTab === TAB_ATAMA_GECMISI && (
          <AssignmentHistorySection employeeId={employee.id} units={units} jobTitles={jobTitles} />
        )}
      </Stack>
    </>
  )
}
