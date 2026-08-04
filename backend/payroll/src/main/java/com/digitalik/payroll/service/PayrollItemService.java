package com.digitalik.payroll.service;

import com.digitalik.payroll.entity.PayrollItem;
import com.digitalik.payroll.exception.PayrollItemNotFoundException;
import com.digitalik.payroll.repository.PayrollItemRepository;
import java.util.List;
import org.springframework.stereotype.Service;

/** US-08D.1.1: Ücret kalemi referans listesi için CRUD — {@code organization.JobTitleService}'teki AYNI desen. */
@Service
public class PayrollItemService {

    private final PayrollItemRepository payrollItemRepository;

    public PayrollItemService(PayrollItemRepository payrollItemRepository) {
        this.payrollItemRepository = payrollItemRepository;
    }

    public PayrollItem create(String name, String type) {
        assertValid(name, type);
        return payrollItemRepository.save(new PayrollItem(name, type));
    }

    public List<PayrollItem> getAll() {
        return payrollItemRepository.findAll();
    }

    public PayrollItem update(Long id, String name, String type) {
        assertValid(name, type);
        PayrollItem payrollItem = payrollItemRepository.findById(id).orElseThrow(PayrollItemNotFoundException::new);
        payrollItem.update(name, type);
        return payrollItemRepository.save(payrollItem);
    }

    public void delete(Long id) {
        if (!payrollItemRepository.existsById(id)) {
            throw new PayrollItemNotFoundException();
        }
        payrollItemRepository.deleteById(id);
    }

    private void assertValid(String name, String type) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Kalem adı boş olamaz.");
        }
        if (type == null || type.isBlank()) {
            throw new IllegalArgumentException("Kalem türü boş olamaz.");
        }
    }
}
