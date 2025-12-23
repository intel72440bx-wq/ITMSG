package com.itmsg.domain.partner.controller;

import com.itmsg.domain.partner.dto.PartnerRequest;
import com.itmsg.domain.partner.dto.PartnerResponse;
import com.itmsg.domain.partner.service.PartnerService;
import com.itmsg.domain.project.dto.ProjectResponse;
import com.itmsg.domain.project.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/partners")
@RequiredArgsConstructor
@Tag(name = "Partner", description = "파트너 관리 API")
public class PartnerController {
    
    private final PartnerService partnerService;
    private final ProjectService projectService;
    
    @PostMapping
    @Operation(summary = "파트너 등록", description = "새로운 파트너를 등록합니다.")
    public ResponseEntity<PartnerResponse> createPartner(@Valid @RequestBody PartnerRequest request) {
        PartnerResponse response = partnerService.createPartner(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "파트너 조회", description = "파트너 ID로 상세 정보를 조회합니다.")
    public ResponseEntity<PartnerResponse> getPartner(@PathVariable Long id) {
        PartnerResponse response = partnerService.getPartner(id);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/code/{code}")
    @Operation(summary = "파트너 코드로 조회", description = "파트너 코드로 상세 정보를 조회합니다.")
    public ResponseEntity<PartnerResponse> getPartnerByCode(@PathVariable String code) {
        PartnerResponse response = partnerService.getPartnerByCode(code);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping
    @Operation(summary = "파트너 목록 조회", description = "파트너 목록을 페이징하여 조회합니다.")
    public ResponseEntity<Page<PartnerResponse>> getPartners(
            @Parameter(description = "파트너명") @RequestParam(required = false) String name,
            @Parameter(description = "폐업 여부") @RequestParam(required = false) Boolean isClosed,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<PartnerResponse> response = partnerService.getPartners(name, isClosed, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/for-company-selection")
    @Operation(summary = "회사 선택용 파트너 목록 조회", description = "프로젝트 등록 시 회사 선택에 사용할 파트너 목록을 조회합니다.")
    public ResponseEntity<List<PartnerResponse>> getPartnersForCompanySelection() {
        List<PartnerResponse> response = partnerService.getPartnersForCompanySelection();
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "파트너 수정", description = "파트너 정보를 수정합니다.")
    public ResponseEntity<PartnerResponse> updatePartner(
            @PathVariable Long id,
            @Valid @RequestBody PartnerRequest request) {
        PartnerResponse response = partnerService.updatePartner(id, request);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/{id}/close")
    @Operation(summary = "파트너 폐업", description = "파트너를 폐업 처리합니다.")
    public ResponseEntity<PartnerResponse> closePartner(@PathVariable Long id) {
        PartnerResponse response = partnerService.closePartner(id);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/{id}/reopen")
    @Operation(summary = "파트너 재개업", description = "파트너를 재개업 처리합니다.")
    public ResponseEntity<PartnerResponse> reopenPartner(@PathVariable Long id) {
        PartnerResponse response = partnerService.reopenPartner(id);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "파트너 삭제", description = "파트너를 삭제합니다 (Soft Delete).")
    public ResponseEntity<Void> deletePartner(@PathVariable Long id) {
        partnerService.deletePartner(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/projects")
    @Operation(summary = "파트너 담당자 PM 프로젝트 조회",
               description = "파트너의 담당자가 PM으로 있는 프로젝트들을 조회합니다.")
    public ResponseEntity<Page<ProjectResponse>> getPartnerManagerProjects(
            @PathVariable Long id,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<ProjectResponse> response = projectService.getProjectsByPartnerManager(id, pageable);
        return ResponseEntity.ok(response);
    }
}
