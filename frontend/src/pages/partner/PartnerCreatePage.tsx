import React, { useState } from 'react';
import {
  Box, Typography, Paper, TextField, Button, Alert, CircularProgress,
  useMediaQuery, useTheme,
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { createPartner } from '../../api/partner';
import type { PartnerCreateRequest } from '../../types/partner.types';

const PartnerCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { control, handleSubmit, formState: { errors } } = useForm<PartnerCreateRequest>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const onSubmit = async (data: PartnerCreateRequest) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await createPartner(data);
      setSuccess('파트너가 등록되었습니다!');
      setTimeout(() => navigate('/partners'), 2000);
    } catch (err: any) {
      console.error('Failed to create partner:', err);
      setError(err.message || '파트너 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Typography variant={isMobile ? 'h5' : 'h4'} gutterBottom>
        새 파트너 등록
      </Typography>

      <Paper sx={{ p: { xs: 2, sm: 3 }, mt: 3, width: '100%' }}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%' }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Controller
              name="name"
              control={control}
              rules={{ required: '파트너명은 필수입니다.' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="파트너명"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  required
                  placeholder="파트너명을 입력하세요"
                />
              )}
            />

            <Controller
              name="businessNumber"
              control={control}
              rules={{
                required: '사업자등록번호는 필수입니다.',
                pattern: {
                  value: /^\d{10,12}$/,
                  message: '사업자등록번호는 10-12자리 숫자여야 합니다.'
                }
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="사업자등록번호"
                  error={!!errors.businessNumber}
                  helperText={errors.businessNumber?.message || '10-12자리 숫자'}
                  required
                  placeholder="1234567890"
                />
              )}
            />

            <Controller
              name="ceoName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="대표자명"
                  helperText="선택사항"
                />
              )}
            />
          </Box>

          <Box sx={{
            mt: 3,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 2,
            flexDirection: { xs: 'column', sm: 'row' },
          }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/partners')}
              disabled={loading}
              fullWidth={isMobile}
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              fullWidth={isMobile}
            >
              {loading ? <CircularProgress size={24} /> : '등록'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default PartnerCreatePage;
