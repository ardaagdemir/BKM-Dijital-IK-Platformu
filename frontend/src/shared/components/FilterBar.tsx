import SearchIcon from '@mui/icons-material/Search'
import Button from '@mui/material/Button'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'

type FilterBarProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
}

// Bölüm 9: "Modül listelerinde ortak filtre şeridi (arama + dropdown
// filtreler + 'Filtreleri Temizle')." — dropdown filtreler ilk kullanan
// modül GERÇEKTEN ihtiyaç duyana kadar EKLENMEDİ (YAGNI).
export function FilterBar({ value, onChange, placeholder = 'Ara', label = 'Ara' }: FilterBarProps) {
  return (
    <Stack direction="row" spacing={1} sx={{ mb: 2, alignItems: 'center' }}>
      <TextField
        size="small"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        fullWidth
        slotProps={{
          htmlInput: { 'aria-label': label },
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />
      {value && (
        <Button size="small" onClick={() => onChange('')}>
          Filtreleri Temizle
        </Button>
      )}
    </Stack>
  )
}
