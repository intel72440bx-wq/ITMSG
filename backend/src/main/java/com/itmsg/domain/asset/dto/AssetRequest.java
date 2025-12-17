package com.itmsg.domain.asset.dto;

import com.itmsg.domain.asset.entity.AssetType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;

import java.time.LocalDate;

@Builder
public record AssetRequest(
        @NotNull(message = "자산명은 필수입니다.")
        @Size(max = 100, message = "자산명은 100자를 초과할 수 없습니다.")
        String name,

        @NotNull(message = "자산 유형은 필수입니다.")
        AssetType assetType,

        @Size(max = 100, message = "모델명은 100자를 초과할 수 없습니다.")
        String model,

        @Size(max = 100, message = "제조사는 100자를 초과할 수 없습니다.")
        String manufacturer,

        @Size(max = 100, message = "시리얼 번호는 100자를 초과할 수 없습니다.")
        String serialNumber,

        @Size(max = 100, message = "위치는 100자를 초과할 수 없습니다.")
        String location,

        // acquiredAt는 선택사항 (없으면 오늘 날짜 사용)
        LocalDate acquiredAt,

        LocalDate warrantyEndDate,

        Long managerId,

        @Size(max = 500, message = "비고는 500자를 초과할 수 없습니다.")
        String notes
) {}
