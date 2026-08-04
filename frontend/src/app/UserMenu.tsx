import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useState, type MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../modules/auth/AuthProvider'

function initialsOf(fullName: string): string {
  const parts = fullName.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : ''
  return (first + last).toUpperCase()
}

export function UserMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  if (!user) {
    return null
  }

  async function handleLogout() {
    setAnchorEl(null)
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <>
      <IconButton
        onClick={(event: MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget)}
        size="large"
        aria-label="Kullanıcı menüsü"
        aria-haspopup="true"
      >
        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.875rem' }}>
          {initialsOf(user.fullName || user.email)}
        </Avatar>
      </IconButton>
      <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
        <Box sx={{ px: 2, py: 1, minWidth: 220 }}>
          <Typography variant="subtitle2" noWrap>
            {user.fullName}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {user.email}
          </Typography>
          <Stack direction="row" spacing={0.5} sx={{ mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
            {user.roles.map((role) => (
              <Chip key={role} label={role} size="small" variant="outlined" />
            ))}
          </Stack>
        </Box>
        <Divider />
        <MenuItem disabled>
          <ListItemIcon>
            <PersonOutlineOutlinedIcon fontSize="small" />
          </ListItemIcon>
          Profilim
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutOutlinedIcon fontSize="small" />
          </ListItemIcon>
          Çıkış Yap
        </MenuItem>
      </Menu>
    </>
  )
}
