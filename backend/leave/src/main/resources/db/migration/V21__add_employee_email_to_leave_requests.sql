-- US-04.3.1: Onay/ret e-postasının gönderileceği adres. İsteğe bağlı — leave
-- modülü organization'a bağımlı olmadığından çalışanın e-postasını kendisi
-- okuyamıyor; çağıran taraf (talebi OLUŞTURURKEN) isterse sağlar. Karar
-- (decide) sırasında bu bilgiye tekrar ihtiyaç duyulacağı için (talep
-- oluşturma ile karar farklı HTTP istekleri, muhtemelen gün/hafta arayla)
-- her seferinde parametre olarak istemekten farklı olarak burada KALICI
-- olarak saklanıyor (bkz. LeaveRequest javadoc'u).

ALTER TABLE leave_requests
    ADD COLUMN employee_email VARCHAR(255);
