import CloseIcon from '@mui/icons-material/Close'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../../../shared/api/ApiError'
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog'
import { ErrorState } from '../../../shared/components/ErrorState'
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton'
import { PageHeader } from '../../../shared/components/PageHeader'
import { useToast } from '../../../shared/components/ToastProvider'
import { useAssignRole } from '../api/useAssignRole'
import { useRemoveRole } from '../api/useRemoveRole'
import { useUsers } from '../api/useUsers'
import { KNOWN_ROLES } from '../roles'

// Bölüm 14.1 (US-02.2.2): "Kullanıcıya rol atanır/kaldırılır." — kullanıcı
// bilgisi + roller AYNI `GET /api/auth/users` sorgusundan (UsersListPage'le
// PAYLAŞILAN query, bkz. useUsers) türetilir; ayrı bir
// `GET /{userId}/roles` çağrısına GEREK YOK (backend zaten rolleri her
// kullanıcı satırına GÖMEREK döndürüyor).
export function UserRolesPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const userId = Number(id)
  const isValidId = Number.isFinite(userId)

  const { data: users, isPending, isError, refetch } = useUsers()
  const assignRole = useAssignRole()
  const removeRole = useRemoveRole()

  const [roleToAdd, setRoleToAdd] = useState('')
  const [addRoleError, setAddRoleError] = useState<string | null>(null)
  const [roleToRemove, setRoleToRemove] = useState<string | null>(null)
  const [removeRoleError, setRemoveRoleError] = useState<string | null>(null)

  const user = users?.find((candidate) => candidate.id === userId)
  const notFound = !isValidId || (!isPending && !isError && !user)

  if (notFound) {
    return (
      <Stack spacing={2} sx={{ py: 8, alignItems: 'center', textAlign: 'center' }}>
        <Typography variant="h5" component="h1">
          Kullanıcı bulunamadı
        </Typography>
        <Button variant="outlined" onClick={() => navigate('/admin/users')}>
          Geri Dön
        </Button>
      </Stack>
    )
  }

  if (isPending) {
    return (
      <>
        <PageHeader title="Rol Yönetimi" />
        <LoadingSkeleton rows={4} />
      </>
    )
  }

  if (isError || !user) {
    return <ErrorState message="Kullanıcı bilgileri yüklenemedi." onRetry={() => refetch()} />
  }

  const availableRolesToAdd = KNOWN_ROLES.filter((role) => !user.roles.includes(role))

  async function handleAddRole() {
    if (!roleToAdd) {
      return
    }
    setAddRoleError(null)
    try {
      await assignRole.mutateAsync({ userId, roleCode: roleToAdd })
      showToast('Rol eklendi')
      setRoleToAdd('')
    } catch (error) {
      setAddRoleError(error instanceof ApiError ? error.detail : 'Rol eklenemedi, tekrar deneyin.')
    }
  }

  async function handleRemoveConfirmed() {
    if (!roleToRemove) {
      return
    }
    setRemoveRoleError(null)
    try {
      await removeRole.mutateAsync({ userId, roleCode: roleToRemove })
      showToast('Rol kaldırıldı')
      setRoleToRemove(null)
    } catch (error) {
      setRemoveRoleError(error instanceof ApiError ? error.detail : 'Rol kaldırılamadı, tekrar deneyin.')
    }
  }

  return (
    <>
      <PageHeader title={user.fullName || user.email} />
      <Paper sx={{ p: { xs: 2, sm: 3 }, maxWidth: 480 }}>
        <Stack spacing={2.5}>
          <Typography variant="body2" color="text.secondary">
            {user.email}
          </Typography>

          <Stack spacing={1}>
            <Typography variant="subtitle2">Roller</Typography>
            <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
              {user.roles.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  Henüz rol atanmadı.
                </Typography>
              )}
              {user.roles.map((role) => (
                <Stack key={role} direction="row" spacing={0} sx={{ alignItems: 'center' }}>
                  <Chip label={role} size="small" />
                  <IconButton
                    size="small"
                    aria-label={`${role} rolünü kaldır`}
                    onClick={() => {
                      setRemoveRoleError(null)
                      setRoleToRemove(role)
                    }}
                  >
                    <CloseIcon fontSize="inherit" />
                  </IconButton>
                </Stack>
              ))}
            </Stack>
          </Stack>

          {addRoleError && (
            <Typography variant="body2" color="error">
              {addRoleError}
            </Typography>
          )}
          {!!availableRolesToAdd.length && (
            <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
              <TextField
                select
                size="small"
                label="Rol Ekle"
                value={roleToAdd}
                onChange={(event) => setRoleToAdd(event.target.value)}
                sx={{ minWidth: 160 }}
              >
                {availableRolesToAdd.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                ))}
              </TextField>
              <Button
                variant="contained"
                size="small"
                disabled={!roleToAdd}
                loading={assignRole.isPending}
                onClick={handleAddRole}
                sx={{ mt: 0.25 }}
              >
                Ekle
              </Button>
            </Stack>
          )}
        </Stack>
      </Paper>

      <ConfirmDialog
        open={!!roleToRemove}
        title="Rolü Kaldır"
        description={roleToRemove ? `"${roleToRemove}" rolünü kaldırmak istediğinize emin misiniz?` : ''}
        confirmLabel="Kaldır"
        loading={removeRole.isPending}
        errorMessage={removeRoleError}
        onConfirm={handleRemoveConfirmed}
        onCancel={() => setRoleToRemove(null)}
      />
    </>
  )
}
