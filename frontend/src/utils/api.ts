import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';
import type { ApiError } from '../types/common.types';

// API Base URL
// 프로덕션: Nginx 프록시를 통해 /api로 요청
// 개발: 환경변수가 있으면 사용, 없으면 상대 경로
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Axios 인스턴스 생성
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor - JWT 토큰 추가
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[API Client] 토큰을 헤더에 추가했습니다:', token.substring(0, 20) + '...');
    } else {
      console.log('[API Client] 토큰이 없거나 헤더가 없습니다');
    }
    return config;
  },
  (error) => {
    console.error('[API Client] Request Interceptor 오류:', error);
    return Promise.reject(error);
  }
);

// Response Interceptor - 에러 처리
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;



    // 임시로 테스트를 위해 인증 에러 시 리다이렉트 비활성화
    // 401 또는 403 에러 (인증 실패 / 권한 없음) - 토큰 갱신 시도
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = response.data;
          localStorage.setItem('accessToken', accessToken);

          // 원래 요청 재시도
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        } else {
          // refreshToken이 없으면 로그아웃 (임시로 비활성화)
          console.warn('토큰 없음 - 인증 우회 모드로 진행');
          // localStorage.removeItem('accessToken');
          // localStorage.removeItem('refreshToken');
          // window.location.href = '/login';
        }
      } catch (refreshError) {
        // 토큰 갱신 실패 - 로그아웃 처리 (임시로 비활성화)
        console.warn('토큰 갱신 실패 - 인증 우회 모드로 진행:', refreshError);
        // localStorage.removeItem('accessToken');
        // localStorage.removeItem('refreshToken');
        // window.location.href = '/login';
        // return Promise.reject(refreshError);
      }
    }

    // API 에러 응답 처리 (인증 에러는 하지 않음)
    if (error.response?.status !== 401 && error.response?.status !== 403) {
      const apiError: ApiError = error.response?.data || {
        code: 'UNKNOWN_ERROR',
        message: '알 수 없는 오류가 발생했습니다.',
        timestamp: new Date().toISOString(),
      };
      return Promise.reject(apiError);
    }

    // 인증 에러는 무시하고 계속 진행 (임시 테스트용)
    return Promise.resolve({
      data: null,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: originalRequest,
    });
  }
);

export default apiClient;
