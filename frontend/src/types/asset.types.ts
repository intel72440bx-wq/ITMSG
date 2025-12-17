// 자산 관리 관련 타입 정의

export interface Asset {
  id: number;
  assetNumber: string;
  name: string;
  assetType: 'PC' | 'LAPTOP' | 'MONITOR' | 'SERVER' | 'NETWORK' | 'SOFTWARE' | 'LICENSE' | 'ETC';
  model?: string;
  manufacturer?: string;
  serialNumber?: string;
  location?: string;
  acquiredAt?: string;
  warrantyEndDate?: string;
  status: string;
  isExpired?: boolean;
  expiredAt?: string;
  notes?: string;
  managerId?: number;
  managerName?: string;
  createdAt: string;
  createdBy?: string;
  updatedAt: string;
  updatedBy?: string;
}

export interface AssetCreateRequest {
  name: string;
  assetType: 'PC' | 'LAPTOP' | 'MONITOR' | 'SERVER' | 'NETWORK' | 'SOFTWARE' | 'LICENSE' | 'ETC';
  model?: string;
  manufacturer?: string;
  serialNumber?: string;
  location?: string;
  acquiredAt?: string;
  warrantyEndDate?: string;
  managerId?: number;
  notes?: string;
}

export interface AssetUpdateRequest {
  name?: string;
  assetType?: 'PC' | 'LAPTOP' | 'MONITOR' | 'SERVER' | 'NETWORK' | 'SOFTWARE' | 'LICENSE' | 'ETC';
  model?: string;
  manufacturer?: string;
  serialNumber?: string;
  location?: string;
  acquiredAt?: string;
  warrantyEndDate?: string;
  status?: string;
  managerId?: number;
  notes?: string;
}

export interface AssetListParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: string;
  assetType?: string;
  search?: string;
}
