import Chip from '@mui/material/Chip'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { EmptyState } from '../../../shared/components/EmptyState'
import { ErrorState } from '../../../shared/components/ErrorState'
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton'
import { PageHeader } from '../../../shared/components/PageHeader'
import { ResponsiveTable, type ResponsiveTableColumn } from '../../../shared/components/ResponsiveTable'
import { useUsers } from '../api/useUsers'
import type { UserSummary } from '../types'

function RoleChips({ roles }: { roles: string[] }) {
  if (roles.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        —
      </Typography>
    )
  }
  return (
    <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
      {roles.map((role) => (
        <Chip key={role} label={role} size="small" variant="outlined" />
      ))}
    </Stack>
  )
}

// Bölüm 14.1 (US-02.2.2) kapsam notu: roadmap yalnızca `/admin/users/:id/roles`
// rotasını tanımlıyor, bir ADMIN'in bu ID'ye NASIL ulaşacağını belirtmiyor —
// backend'de kullanıcıyı BULACAK bir uç da yoktu (bkz. `GET /api/auth/users`,
// bu bölümde eklenen backend ön-koşulu). 13.6→13.7'deki (EmployeesListPage→
// EmployeeDetailPage) AYNI liste→detay deseni burada da uygulanır — bu liste
// sayfası, detay rotasına ulaşmak için gereken GERÇEK/tıklanabilir giriş
// noktasıdır.
export function UsersListPage() {
  const navigate = useNavigate()
  const { data: users, isPending, isError, refetch } = useUsers()

  const columns: ResponsiveTableColumn<UserSummary>[] = [
    {
      key: 'fullName',
      header: 'Ad Soyad',
      primary: true,
      render: (row) => (
        <Link component={RouterLink} to={`/admin/users/${row.id}/roles`} underline="hover">
          {row.fullName || row.email}
        </Link>
      ),
    },
    { key: 'email', header: 'E-posta', render: (row) => row.email },
    { key: 'roles', header: 'Roller', render: (row) => <RoleChips roles={row.roles} /> },
  ]

  return (
    <>
      <PageHeader title="Kullanıcılar" />
      {isPending && <LoadingSkeleton rows={5} />}
      {isError && <ErrorState message="Kullanıcılar yüklenemedi." onRetry={() => refetch()} />}
      {!isPending && !isError && users?.length === 0 && <EmptyState message="Henüz kullanıcı yok." />}
      {!isPending && !isError && !!users?.length && (
        <ResponsiveTable
          columns={columns}
          rows={users}
          getRowKey={(row) => row.id}
          onRowClick={(row) => navigate(`/admin/users/${row.id}/roles`)}
        />
      )}
    </>
  )
}
