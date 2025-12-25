// 파트너 관련 타입 정의

export interface Partner {
  id: number;
  code?: string;
  name: string;
  businessNumber: string;
  ceoName?: string;
  isClosed?: boolean;
  closedAt?: string;
  managerId?: number;
  managerName?: string;
  pmId?: number;
  pmName?: string;
  createdAt: string;
  createdBy?: string;
  updatedAt: string;
  updatedBy?: string;
}

export interface PartnerCreateRequest {
  name: string;
  businessNumber: string;
  ceoName?: string;
  address?: string;
  contactPerson?: string;
  phoneNumber?: string;
  email?: string;
  managerId?: number;
  pmId?: number;
}

export interface PartnerUpdateRequest {
  name?: string;
  businessNumber?: string;
  ceoName?: string;
  managerId?: number;
  pmId?: number;
  isActive?: boolean;
}

export interface PartnerListParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  isActive?: boolean;
  search?: string;
}
