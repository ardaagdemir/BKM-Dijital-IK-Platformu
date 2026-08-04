import { zodResolver } from '@hookform/resolvers/zod'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { ApiError } from '../../../shared/api/ApiError'
import { useAuth } from '../AuthProvider'
import { loginSchema, type LoginFormValues } from '../schema'

// Bölüm 3: 100vh ÖNCE (eski tarayıcı fallback), 100dvh SONRA (destekleniyorsa
// kazanır) — sx nesnesi yerine styled() template literal'i kullanılır, aksi
// halde JS nesnesindeki tekrar eden anahtar CSS kademelemesini KORUYAMAZ.
const LoginPageRoot = styled('div')`
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`

export function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    resetField,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const sessionExpired = searchParams.get('expired') === '1'

  async function onSubmit(values: LoginFormValues) {
    setSubmitError(null)
    try {
      await login(values.email, values.password)
      navigate('/', { replace: true })
    } catch (error) {
      setSubmitError(
        error instanceof ApiError ? error.detail : 'Beklenmeyen bir hata oluştu, tekrar deneyin.',
      )
      resetField('password')
    }
  }

  return (
    <LoginPageRoot>
      <Paper
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        elevation={2}
        sx={{ width: '100%', maxWidth: 400, p: 4 }}
      >
        <Stack spacing={3}>
          <Typography variant="h5" component="h1" sx={{ textAlign: 'center' }}>
            Dijital İK Platformu
          </Typography>

          {sessionExpired && !submitError && (
            <Alert severity="info">Oturumunuz sona erdi, tekrar giriş yapın.</Alert>
          )}

          {submitError && <Alert severity="error">{submitError}</Alert>}

          <TextField
            {...register('email')}
            label="E-posta"
            type="email"
            autoComplete="username"
            fullWidth
            error={!!errors.email}
            helperText={errors.email?.message}
            slotProps={{ htmlInput: { 'aria-label': 'E-posta' } }}
          />

          <TextField
            {...register('password')}
            label="Parola"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            fullWidth
            error={!!errors.password}
            helperText={errors.password?.message}
            slotProps={{
              htmlInput: { 'aria-label': 'Parola' },
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? 'Parolayı gizle' : 'Parolayı göster'}
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                    >
                      {showPassword ? '🙈' : '👁'}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <Button type="submit" variant="contained" size="large" fullWidth loading={isSubmitting}>
            Giriş Yap
          </Button>
        </Stack>
      </Paper>
    </LoginPageRoot>
  )
}
