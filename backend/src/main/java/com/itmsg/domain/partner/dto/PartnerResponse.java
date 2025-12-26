package com.itmsg.domain.partner.dto;

import com.itmsg.domain.partner.entity.Partner;
import com.itmsg.domain.user.entity.User;
import lombok.Builder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Builder
public record PartnerResponse(
        Long id,
        String code,
        String name,
        String businessNumber,
        String ceoName,
        Boolean isClosed,
        LocalDate closedAt,
        Long managerId,
        String managerName,
        List<Long> pmIds,
        List<String> pmNames,
        LocalDateTime createdAt,
        String createdBy,
        LocalDateTime updatedAt,
        String updatedBy
) {
    public static PartnerResponse from(Partner partner) {
        Set<User> pms = partner.getPms();
        List<Long> pmIds = pms.stream().map(User::getId).collect(Collectors.toList());
        List<String> pmNames = pms.stream().map(User::getName).collect(Collectors.toList());

        return PartnerResponse.builder()
                .id(partner.getId())
                .code(partner.getCode())
                .name(partner.getName())
                .businessNumber(partner.getBusinessNumber())
                .ceoName(partner.getCeoName())
                .isClosed(partner.getIsClosed())
                .closedAt(partner.getClosedAt())
                .managerId(partner.getManager() != null ? partner.getManager().getId() : null)
                .managerName(partner.getManager() != null ? partner.getManager().getName() : null)
                .pmIds(pmIds)
                .pmNames(pmNames)
                .createdAt(partner.getCreatedAt())
                .createdBy(partner.getCreatedBy())
                .updatedAt(partner.getUpdatedAt())
                .updatedBy(partner.getUpdatedBy())
                .build();
    }
}
