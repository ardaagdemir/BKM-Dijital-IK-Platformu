package com.digitalik.amenities.service;

import com.digitalik.amenities.entity.Club;
import com.digitalik.amenities.exception.ClubNotFoundException;
import com.digitalik.amenities.repository.ClubRepository;
import java.util.List;
import org.springframework.stereotype.Service;

/** US-08G.1.1: Kulüp referans listesi için CRUD — {@code organization.JobTitleService}'teki AYNI desen. */
@Service
public class ClubService {

    private final ClubRepository clubRepository;

    public ClubService(ClubRepository clubRepository) {
        this.clubRepository = clubRepository;
    }

    public Club create(String name, Long leaderId) {
        assertNotBlank(name);
        return clubRepository.save(new Club(name, leaderId));
    }

    public List<Club> getAll() {
        return clubRepository.findAll();
    }

    /** US-08G.1.2: {@code leaderId}, kulübün lideri atanırken/değiştirilirken de bu uçtan güncellenir. */
    public Club update(Long id, String name, Long leaderId) {
        assertNotBlank(name);
        Club club = clubRepository.findById(id).orElseThrow(ClubNotFoundException::new);
        club.rename(name);
        club.assignLeader(leaderId);
        return clubRepository.save(club);
    }

    public void delete(Long id) {
        if (!clubRepository.existsById(id)) {
            throw new ClubNotFoundException();
        }
        clubRepository.deleteById(id);
    }

    private void assertNotBlank(String name) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Kulüp adı boş olamaz.");
        }
    }
}
