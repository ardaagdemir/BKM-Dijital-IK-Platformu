import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import * as organizationApi from '../../modules/organization/api/organizationApi'
import type { Employee } from '../../modules/organization/types'

type EmployeeAutocompleteProps = {
  label: string
  value: Employee | null
  onChange: (employee: Employee | null) => void
}

function employeeLabel(employee: Employee): string {
  return `${employee.firstName} ${employee.lastName}`
}

// Bölüm 9: "modül listelerinde ortak filtre" (bkz. FilterBar) İLE AYNI
// "3. gerçek ihtiyaçta paylaşılan hale getir" kuralı — Bölüm 14.6'da AYNI
// "organizasyon genelinde bir çalışan seç" ihtiyacı ÜÇ ekranda (kayıtlar,
// sapmalar, puantaj) tekrarlandığından buraya taşındı. `TeamAssessmentsPage`/
// `LeaveApprovalsPage`'deki düz `TextField select` İLE KARIŞTIRILMAMALI —
// oradaki liste zaten KÜÇÜK (tek bir ekip), burada TÜM organizasyon söz
// konusu olduğundan sunucu taraflı arama (debounce'lu) gerekiyor.
export function EmployeeAutocomplete({ label, value, onChange }: EmployeeAutocompleteProps) {
  const [inputValue, setInputValue] = useState('')
  const [debouncedInput, setDebouncedInput] = useState('')

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedInput(inputValue), 300)
    return () => clearTimeout(timeout)
  }, [inputValue])

  const { data, isFetching } = useQuery({
    queryKey: ['shared', 'employeeAutocomplete', debouncedInput],
    queryFn: () => organizationApi.searchEmployees({ name: debouncedInput || undefined, page: 0, size: 20 }),
  })

  return (
    <Autocomplete
      options={data?.content ?? []}
      value={value}
      onChange={(_, selected) => onChange(selected)}
      inputValue={inputValue}
      onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
      getOptionLabel={employeeLabel}
      isOptionEqualToValue={(option, selected) => option.id === selected.id}
      loading={isFetching}
      renderInput={(params) => <TextField {...params} label={label} />}
    />
  )
}
