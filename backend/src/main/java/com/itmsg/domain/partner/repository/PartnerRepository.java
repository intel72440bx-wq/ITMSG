package com.itmsg.domain.partner.repository;

import com.itmsg.domain.partner.entity.Partner;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Partner Repository
 */
@Repository
public interface PartnerRepository extends JpaRepository<Partner, Long> {
    
    Optional<Partner> findByCode(String code);

    boolean existsByCode(String code);
    
    @Query("SELECT p FROM Partner p " +
           "WHERE (:name IS NULL OR p.name LIKE %:name%) " +
           "AND (:isClosed IS NULL OR p.isClosed = :isClosed) " +
           "AND p.deletedAt IS NULL")
    Page<Partner> search(@Param("name") String name,
                        @Param("isClosed") Boolean isClosed,
                        Pageable pageable);

    // 회사 선택용 파트너 목록 조회 (폐업되지 않은 파트너, 이름순 정렬)
    List<Partner> findByIsClosedFalseOrderByNameAsc();
}
