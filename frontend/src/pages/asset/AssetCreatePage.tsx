import React, { useState } from 'react';
import {
  Box, Typography, Paper, TextField, Button, MenuItem, Alert, CircularProgress,
  useMediaQuery, useTheme,
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { createAsset } from '../../api/asset';
import type { AssetCreateRequest } from '../../types/asset.types';
import { getUsers } from '../../api/user';
import type { User } from '../../types/auth.types';

const AssetCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { control, handleSubmit, formState: { errors } } = useForm<AssetCreateRequest>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const onSubmit = async (data: AssetCreateRequest) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await createAsset(data);
      setSuccess('자산이 등록되었습니다!');
      setTimeout(() => navigate('/assets'), 2000);
    } catch (err: any) {
      console.error('Failed to create asset:', err);
      setError(err.message || '자산 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Typography variant={isMobile ? 'h5' : 'h4'} gutterBottom>자산 등록</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Paper sx={{ p: { xs: 2, sm: 3 }, mt: 2, width: '100%' }}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%' }}>
          <Controller
            name="name"
            control={control}
            rules={{ required: '자산명은 필수입니다.' }}
            render={({ field }) => (
              <TextField {...field} label="자산명" fullWidth margin="normal"
                error={!!errors.name} helperText={errors.name?.message} required />
            )}
          />

          <Controller
            name="assetType"
            control={control}
            rules={{ required: '자산 유형은 필수입니다.' }}
            render={({ field }) => (
              <TextField {...field} select label="자산 유형" fullWidth margin="normal"
                error={!!errors.assetType} helperText={errors.assetType?.message} required>
                <MenuItem value="PC">PC (데스크톱)</MenuItem>
                <MenuItem value="LAPTOP">노트북</MenuItem>
                <MenuItem value="MONITOR">모니터</MenuItem>
                <MenuItem value="SERVER">서버</MenuItem>
                <MenuItem value="NETWORK">네트워크 장비</MenuItem>
                <MenuItem value="SOFTWARE">소프트웨어</MenuItem>
                <MenuItem value="LICENSE">라이선스</MenuItem>
                <MenuItem value="ETC">기타</MenuItem>
              </TextField>
            )}
          />

          <Controller
            name="manufacturer"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="제조사" fullWidth margin="normal" helperText="선택사항" />
            )}
          />

          <Controller
            name="model"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="모델명" fullWidth margin="normal" helperText="선택사항" />
            )}
          />

          <Controller
            name="serialNumber"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="시리얼 번호" fullWidth margin="normal" helperText="선택사항" />
            )}
          />

          <Controller
            name="location"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="위치" fullWidth margin="normal" helperText="선택사항" />
            )}
          />

          <Controller
            name="acquiredAt"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="취득일" type="date" fullWidth margin="normal"
                InputLabelProps={{ shrink: true }} helperText="선택사항 (미입력 시 오늘 날짜)" />
            )}
          />

          <Controller
            name="warrantyEndDate"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="보증 만료일" type="date" fullWidth margin="normal"
                InputLabelProps={{ shrink: true }} helperText="선택사항" />
            )}
          />

          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="비고" fullWidth margin="normal" multiline rows={3} helperText="선택사항" />
            )}
          />

          <Box sx={{
            display: 'flex',
            gap: 2,
            mt: 3,
            justifyContent: 'flex-end',
          }}>
            <Button
              type="button"
              variant="outlined"
              onClick={() => navigate('/assets')}
              startIcon={<ArrowBack />}
              size={isMobile ? 'small' : 'medium'}
            >
              목록으로
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <Save />}
            >
              {loading ? '등록 중...' : '등록'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default AssetCreatePage;
