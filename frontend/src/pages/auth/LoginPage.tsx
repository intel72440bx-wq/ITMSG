import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Link,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { login } from '../../api/auth';
import type { LoginRequest } from '../../types/auth.types';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('로그인 시도:', formData.email);
      const response = await login(formData);
      console.log('로그인 성공:', response);
      setAuth(response.user, response.accessToken, response.refreshToken);

      // 로그인 성공 후 대시보드로 이동하며 위치 초기화
      navigate('/dashboard');

      // 약간의 지연 후 페이지 상단으로 스크롤 및 레이아웃 재조정
      setTimeout(() => {
        window.scrollTo(0, 0);
        // 브라우저 리플로우 강제 실행으로 레이아웃 재조정
        document.body.style.display = 'none';
        document.body.offsetHeight; // 리플로우 트리거
        document.body.style.display = '';
      }, 100);
    } catch (err: any) {
      console.error('로그인 실패:', err);
      console.error('에러 상세:', err.response?.data || err.message);

      // 더 자세한 오류 메시지 표시
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.status === 401) {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      } else if (err.response?.status === 403) {
        setError('접근이 거부되었습니다.');
      } else if (err.response?.status === 500) {
        setError('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      } else if (!navigator.onLine) {
        setError('네트워크 연결을 확인해주세요.');
      } else {
        setError('로그인에 실패했습니다. 잠시 후 다시 시도해주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
      }}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          width: '100%',
          maxWidth: 450,
          mx: 2,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom align="center">
          ITMSG
        </Typography>
        <Typography variant="subtitle1" gutterBottom align="center" color="text.secondary">
          IT Management System GCDC
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label="이메일"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            margin="normal"
            autoFocus
            autoComplete="email"
          />

          <TextField
            fullWidth
            label="비밀번호"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            margin="normal"
            autoComplete="current-password"
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mt: 3 }}
          >
            {loading ? <CircularProgress size={24} /> : '로그인'}
          </Button>
        </Box>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate('/register')}
            sx={{ cursor: 'pointer' }}
          >
            계정이 없으신가요? 회원가입
          </Link>
          <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
            비밀번호를 잊으셨나요? 관리자에게 문의하세요.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginPage;
