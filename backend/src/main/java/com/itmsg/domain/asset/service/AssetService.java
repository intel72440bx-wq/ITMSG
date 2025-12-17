package com.itmsg.domain.asset.service;

import com.itmsg.domain.asset.dto.AssetRequest;
import com.itmsg.domain.asset.dto.AssetResponse;
import com.itmsg.domain.asset.entity.Asset;
import com.itmsg.domain.asset.entity.AssetType;
import com.itmsg.domain.asset.repository.AssetRepository;
import com.itmsg.domain.user.repository.UserRepository;
import com.itmsg.global.common.service.NumberingService;
import com.itmsg.global.exception.BusinessException;
import com.itmsg.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class AssetService {
    
    private final AssetRepository assetRepository;
    private final UserRepository userRepository;
    private final NumberingService numberingService;
    
    @Transactional
    public AssetResponse createAsset(AssetRequest request) {
        String assetNumber = numberingService.generateAssetNumber();

        var assetBuilder = Asset.builder()
                .assetNumber(assetNumber)
                .name(request.name())
                .assetType(request.assetType())
                .model(request.model())
                .manufacturer(request.manufacturer())
                .serialNumber(request.serialNumber())
                .location(request.location())
                .acquiredAt(request.acquiredAt() != null ? request.acquiredAt() : LocalDate.now())
                .warrantyEndDate(request.warrantyEndDate())
                .notes(request.notes());

        if (request.managerId() != null) {
            var manager = userRepository.findById(request.managerId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
            assetBuilder.manager(manager);
        }

        Asset asset = assetBuilder.build();
        Asset savedAsset = assetRepository.save(asset);

        log.info("자산 생성 완료: {}", savedAsset.getAssetNumber());
        return AssetResponse.from(savedAsset);
    }
    
    public AssetResponse getAsset(Long id) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ASSET_NOT_FOUND));
        return AssetResponse.from(asset);
    }
    
    public AssetResponse getAssetByNumber(String assetNumber) {
        Asset asset = assetRepository.findByAssetNumber(assetNumber)
                .orElseThrow(() -> new BusinessException(ErrorCode.ASSET_NOT_FOUND));
        return AssetResponse.from(asset);
    }
    
    public Page<AssetResponse> getAssets(AssetType assetType, Boolean isExpired, Long managerId, Pageable pageable) {
        return assetRepository.search(assetType, isExpired, managerId, pageable)
                .map(AssetResponse::from);
    }
    
    @Transactional
    public AssetResponse updateAsset(Long id, AssetRequest request) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ASSET_NOT_FOUND));

        var manager = request.managerId() != null
                ? userRepository.findById(request.managerId())
                        .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND))
                : null;

        asset.updateAsset(request, manager);

        log.info("자산 수정 완료: {}", asset.getAssetNumber());
        return AssetResponse.from(asset);
    }
    
    @Transactional
    public AssetResponse expireAsset(Long id) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ASSET_NOT_FOUND));
        
        asset.expire();
        
        log.info("자산 폐기 처리: {}", asset.getAssetNumber());
        return AssetResponse.from(asset);
    }
    
    @Transactional
    public AssetResponse restoreAsset(Long id) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ASSET_NOT_FOUND));
        
        asset.restore();
        
        log.info("자산 복원 처리: {}", asset.getAssetNumber());
        return AssetResponse.from(asset);
    }
    
    @Transactional
    public void deleteAsset(Long id) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ASSET_NOT_FOUND));
        
        asset.delete();
        
        log.info("자산 삭제 완료: {}", asset.getAssetNumber());
    }
}
