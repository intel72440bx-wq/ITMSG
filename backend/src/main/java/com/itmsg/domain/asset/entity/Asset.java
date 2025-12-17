package com.itmsg.domain.asset.entity;

import com.itmsg.domain.user.entity.User;
import com.itmsg.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

/**
 * 자산 Entity
 */
@Entity
@Table(name = "assets")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Asset extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String assetNumber;

    @Column(nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private AssetType assetType;

    @Column(length = 100)
    private String model;

    @Column(length = 100)
    private String manufacturer;

    @Column(length = 100)
    private String serialNumber;

    @Column(length = 100)
    private String location;

    @Column(nullable = false)
    private LocalDate acquiredAt;

    @Column
    private LocalDate warrantyEndDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private AssetStatus status = AssetStatus.AVAILABLE;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isExpired = false;

    @Column
    private LocalDate expiredAt;

    @Column(length = 500)
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    private User manager;

    /**
     * 자산 수정
     */
    public void updateAsset(String name, AssetType assetType, String model, String manufacturer,
                           String serialNumber, String location, LocalDate acquiredAt,
                           LocalDate warrantyEndDate, String notes, User manager) {
        this.name = name;
        this.assetType = assetType;
        this.model = model;
        this.manufacturer = manufacturer;
        this.serialNumber = serialNumber;
        this.location = location;
        if (acquiredAt != null) {
            this.acquiredAt = acquiredAt;
        }
        this.warrantyEndDate = warrantyEndDate;
        this.notes = notes;
        this.manager = manager;
    }

    /**
     * 자산 폐기 처리
     */
    public void expire() {
        this.isExpired = true;
        this.expiredAt = LocalDate.now();
    }

    /**
     * 자산 복원 처리
     */
    public void restore() {
        this.isExpired = false;
        this.expiredAt = null;
    }
}
