import apiClient from '../utils/api';
import type { Partner, PartnerCreateRequest, PartnerUpdateRequest, PartnerListParams } from '../types/partner.types';
import type { PageResponse } from '../types/common.types';
import type { Project } from '../types/project.types';

export const getPartners = async (params: PartnerListParams): Promise<PageResponse<Partner>> => {
  const response = await apiClient.get<PageResponse<Partner>>('/partners', { params });
  return response.data;
};

export const getPartner = async (id: number): Promise<Partner> => {
  const response = await apiClient.get<Partner>(`/partners/${id}`);
  return response.data;
};

export const createPartner = async (data: PartnerCreateRequest): Promise<Partner> => {
  const response = await apiClient.post<Partner>('/partners', data);
  return response.data;
};

export const updatePartner = async (id: number, data: PartnerUpdateRequest): Promise<Partner> => {
  const response = await apiClient.put<Partner>(`/partners/${id}`, data);
  return response.data;
};

export const deletePartner = async (id: number): Promise<void> => {
  await apiClient.delete(`/partners/${id}`);
};

export const getPartnerManagerProjects = async (
  partnerId: number,
  params?: { page?: number; size?: number }
): Promise<PageResponse<Project>> => {
  const response = await apiClient.get<PageResponse<Project>>(`/partners/${partnerId}/projects`, { params });
  return response.data;
};
