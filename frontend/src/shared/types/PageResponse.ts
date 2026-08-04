// Spring Boot 3.3.5'in Pageable serileştirme biçimiyle BİREBİR eşleşir —
// totalElements/totalPages KÖKTE DEĞİL, iç içe `page` nesnesinde (bkz.
// organization.EmployeeController — GET /employees, canlı testlerle
// doğrulanmış gerçek yanıt şekli).
export type PageResponse<T> = {
  content: T[]
  page: {
    size: number
    number: number
    totalElements: number
    totalPages: number
  }
}
