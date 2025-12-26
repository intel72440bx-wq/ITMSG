package com.itmsg.domain.partner.entity;

import com.itmsg.domain.user.entity.User;
import com.itmsg.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

/**
 * 파트너 Entity
 */
@Entity
@Table(name = "partners")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Partner extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 20)
    private String businessNumber;

    @Column(length = 50)
    private String ceoName;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isClosed = false;

    @Column
    private LocalDate closedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    private User manager;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "partner_pms",
        joinColumns = @JoinColumn(name = "partner_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    @Builder.Default
    private Set<User> pms = new HashSet<>();

    /**
     * 파트너 수정
     */
    public void updatePartner(String name, String ceoName, User manager, Set<User> pms, Boolean isClosed) {
        this.name = name;
        this.ceoName = ceoName;
        this.manager = manager;
        if (pms != null) {
            this.pms.clear();
            this.pms.addAll(pms);
        }

        // isClosed 상태가 변경되는 경우 처리
        if (isClosed != null && !isClosed.equals(this.isClosed)) {
            if (isClosed) {
                close();
            } else {
                reopen();
            }
        }
    }

    /**
     * PM 추가
     */
    public void addPm(User pm) {
        this.pms.add(pm);
    }

    /**
     * PM 제거
     */
    public void removePm(User pm) {
        this.pms.remove(pm);
    }

    /**
     * PM 설정
     */
    public void setPms(Set<User> pms) {
        this.pms.clear();
        if (pms != null) {
            this.pms.addAll(pms);
        }
    }

    /**
     * 파트너 폐업 처리
     */
    public void close() {
        this.isClosed = true;
        this.closedAt = LocalDate.now();
    }

    /**
     * 파트너 재개업 처리
     */
    public void reopen() {
        this.isClosed = false;
        this.closedAt = null;
    }
}
