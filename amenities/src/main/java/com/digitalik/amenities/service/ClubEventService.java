package com.digitalik.amenities.service;

import com.digitalik.amenities.entity.Club;
import com.digitalik.amenities.entity.ClubEvent;
import com.digitalik.amenities.exception.ClubNotFoundException;
import com.digitalik.amenities.exception.NotClubLeaderException;
import com.digitalik.amenities.repository.ClubEventRepository;
import com.digitalik.amenities.repository.ClubRepository;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;

/**
 * US-08G.1.2: Kulüp etkinliği oluşturma. Kabul kriteri: "Etkinlik yalnızca
 * lider tarafından oluşturulabilir."
 */
@Service
public class ClubEventService {

    private final ClubEventRepository clubEventRepository;
    private final ClubRepository clubRepository;

    public ClubEventService(ClubEventRepository clubEventRepository, ClubRepository clubRepository) {
        this.clubEventRepository = clubEventRepository;
        this.clubRepository = clubRepository;
    }

    /**
     * {@code requestingEmployeeId}, kulübün {@link Club#getLeaderId()}'i
     * ile eşleşmiyorsa (lider hiç atanmamışsa dahil — bu durumda kimse
     * eşleşmez) {@link NotClubLeaderException} (403) fırlatılır — kabul
     * kriterinin "yalnızca lider tarafından oluşturulabilir" şartının
     * doğrudan uygulanması.
     */
    public ClubEvent create(Long clubId, Long requestingEmployeeId, String name, LocalDate date) {
        if (clubId == null) {
            throw new IllegalArgumentException("Kulüp boş olamaz.");
        }
        Club club = clubRepository.findById(clubId).orElseThrow(ClubNotFoundException::new);

        if (requestingEmployeeId == null
                || club.getLeaderId() == null
                || !club.getLeaderId().equals(requestingEmployeeId)) {
            throw new NotClubLeaderException();
        }

        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Etkinlik adı boş olamaz.");
        }
        if (date == null) {
            throw new IllegalArgumentException("Tarih boş olamaz.");
        }

        return clubEventRepository.save(new ClubEvent(clubId, name, date));
    }

    public List<ClubEvent> listByClub(Long clubId) {
        if (clubId == null) {
            throw new IllegalArgumentException("Kulüp boş olamaz.");
        }
        return clubEventRepository.findByClubIdOrderByDateAsc(clubId);
    }
}
