package com.digitalik.attendance.dto;

import java.time.LocalDate;

/** {@code status}: {@code NORMAL}, {@code EKSIK}, {@code FAZLA_MESAI} veya {@code IZINLI}. */
public record TimesheetDayResponse(LocalDate date, String status, Integer workedMinutes, Integer plannedMinutes) {
}
