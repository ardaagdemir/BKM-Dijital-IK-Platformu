import SearchIcon from '@mui/icons-material/Search'
import Button from '@mui/material/Button'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'

export type FilterBarSelect = {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}

type FilterBarProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  // Bölüm 13.6: "dropdown filtreler" — Bölüm 9'un "ilk gerçek ihtiyaçta
  // eklenir" notuyla, bu modülün İLK gerçek kullanımında eklendi.
  selects?: FilterBarSelect[]
  // Belirtilmezse arama alanı tek başına temizlenir (eski davranış,
  // geriye dönük uyumluluk için); belirtilirse TÜM filtreler (arama +
  // dropdown'lar) tek tıkla temizlenir.
  onClearAll?: () => void
}

// Bölüm 9: "Modül listelerinde ortak filtre şeridi (arama + dropdown
// filtreler + 'Filtreleri Temizle')."
export function FilterBar({
  value,
  onChange,
  placeholder = 'Ara',
  label = 'Ara',
  selects,
  onClearAll,
}: FilterBarProps) {
  const hasActiveFilters = !!value || (selects?.some((select) => select.value) ?? false)

  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={1}
      sx={{ mb: 2, alignItems: { xs: 'stretch', md: 'center' } }}
    >
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
      {selects?.map((select) => (
        <TextField
          key={select.label}
          select
          size="small"
          label={select.label}
          value={select.value}
          onChange={(event) => select.onChange(event.target.value)}
          fullWidth
          sx={{ minWidth: { md: 200 } }}
        >
          <MenuItem value="">Tümü</MenuItem>
          {select.options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      ))}
      {hasActiveFilters && (
        <Button size="small" onClick={onClearAll ?? (() => onChange(''))} sx={{ flexShrink: 0 }}>
          Filtreleri Temizle
        </Button>
      )}
    </Stack>
  )
}
