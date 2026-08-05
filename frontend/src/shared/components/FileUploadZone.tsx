import CloseIcon from '@mui/icons-material/Close'
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useId, useRef, useState } from 'react'

type FileUploadZoneProps = {
  label: string
  value: File | null
  onChange: (file: File | null) => void
  accept?: string
  error?: string
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// Bölüm 14.4 — projedeki İLK dosya yükleme UI'ı (`/careers/apply`'ın CV
// yüklemesi). Tıkla-seç + sürükle-bırak; seçili dosya adı/boyutu gösterilir,
// `Kaldır` ile temizlenir. Doğrulama (boş/enfekte dosya) BİLİNÇLİ OLARAK
// burada DEĞİL — çağıran form (`schema.ts` + backend 422) sorumlu, bu
// bileşen yalnızca seçim UI'ı.
export function FileUploadZone({ label, value, onChange, accept, error }: FileUploadZoneProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  function handleFiles(files: FileList | null) {
    onChange(files && files.length > 0 ? files[0] : null)
  }

  return (
    <Box>
      <Typography variant="body2" sx={{ mb: 0.5 }}>
        {label}
      </Typography>
      <Box
        component="label"
        htmlFor={inputId}
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragOver(true)
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(event) => {
          event.preventDefault()
          setIsDragOver(false)
          handleFiles(event.dataTransfer.files)
        }}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          p: 3,
          border: '2px dashed',
          borderColor: error ? 'error.main' : isDragOver ? 'primary.main' : 'divider',
          borderRadius: 2,
          cursor: 'pointer',
          textAlign: 'center',
          backgroundColor: isDragOver ? 'action.hover' : 'transparent',
        }}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept}
          aria-label={label}
          hidden
          onChange={(event) => handleFiles(event.target.files)}
        />
        {value ? (
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }} onClick={(event) => event.preventDefault()}>
            <Typography variant="body2">
              {value.name} ({formatFileSize(value.size)})
            </Typography>
            <IconButton
              size="small"
              aria-label="Dosyayı kaldır"
              onClick={() => {
                onChange(null)
                if (inputRef.current) {
                  inputRef.current.value = ''
                }
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        ) : (
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', color: 'text.secondary' }}>
            <UploadFileOutlinedIcon />
            <Typography variant="body2">Dosya seçmek için tıklayın veya sürükleyip bırakın</Typography>
          </Stack>
        )}
      </Box>
      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
          {error}
        </Typography>
      )}
    </Box>
  )
}
