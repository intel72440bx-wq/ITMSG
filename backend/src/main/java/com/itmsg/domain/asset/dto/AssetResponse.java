package com.itmsg.domain.asset.dto;

import com.itmsg.domain.asset.entity.Asset;
import com.itmsg.domain.asset.entity.AssetType;
import lombok.Builder;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Builder
public record AssetResponse(
        Long id,
        String assetNumber,
        String name,
        AssetType assetType,
        String model,
        String manufacturer,
        String serialNumber,
        String location,
        LocalDate acquiredAt,
        LocalDate warrantyEndDate,
        String status,
        Boolean isExpired,
        LocalDate expiredAt,
        String notes,
        Long managerId,
        String managerName,
        LocalDateTime createdAt,
        String createdBy,
        LocalDateTime updatedAt,
        String updatedBy
) {
    public static AssetResponse from(Asset asset) {
        return AssetResponse.builder()
                .id(asset.getId())
                .assetNumber(asset.getAssetNumber())
                .name(asset.getName())
                .assetType(asset.getAssetType())
                .model(asset.getModel())
                .manufacturer(asset.getManufacturer())
                .serialNumber(asset.getSerialNumber())
                .location(asset.getLocation())
                .acquiredAt(asset.getAcquiredAt())
                .warrantyEndDate(asset.getWarrantyEndDate())
                .status(asset.getStatus().name())
                .isExpired(asset.getIsExpired())
                .expiredAt(asset.getExpiredAt())
                .notes(asset.getNotes())
                .managerId(asset.getManager() != null ? asset.getManager().getId() : null)
                .managerName(asset.getManager() != null ? asset.getManager().getName() : null)
                .createdAt(asset.getCreatedAt())
                .createdBy(asset.getCreatedBy())
                .updatedAt(asset.getUpdatedAt())
                .updatedBy(asset.getUpdatedBy())
                .build();
    }
}
