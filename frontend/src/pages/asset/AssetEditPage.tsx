import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, TextField, Button, MenuItem, Alert,
  useMediaQuery, useTheme,
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { getAsset, updateAsset } from '../../api/asset';
import type { Asset, AssetUpdateRequest } from '../../types/asset.types';

const AssetEditPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { id } = useParams<{ id: string }>();
  const { control, handleSubmit, setValue, formState: { errors } } = useForm<AssetUpdateRequest>();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (id) {
      fetchAsset(Number(id));
    }
  }, [id]);

  const fetchAsset = async (assetId: number) => {
    try {
      setFetchLoading(true);
      const data = await getAsset(assetId);
      setAsset(data);

      // 폼에 데이터 채우기
      setValue('name', data.name);
      setValue('assetType', data.assetType);
      setValue('manufacturer', data.manufacturer || '');
      setValue('model', data.model || '');
      setValue('serialNumber', data.serialNumber || '');
      setValue('location', data.location || '');
      setValue('acquiredAt', data.acquiredAt ? data.acquiredAt.split('T')[0] : '');
      setValue('warrantyEndDate', data.warrantyEndDate ? data.warrantyEndDate.split('T')[0] : '');
      setValue('status', data.status);
      setValue('managerId', data.managerId || undefined);
      setValue('notes', data.notes || '');
    } catch (err: any) {
      console.error('Failed to fetch asset:', err);
      setError(err.message || '자산 정보를 불러오는데 실패했습니다.');
    } finally {
      setFetchLoading(false);
    }
  };

  const onSubmit = async (data: AssetUpdateRequest) => {
    if (!asset) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('Updating asset with data:', data);
      const response = await updateAsset(asset.id, data);
      console.log('Asset update response:', response);
      setSuccess('자산이 수정되었습니다!');
      setTimeout(() => navigate(`/assets/${asset.id}`), 2000);
    } catch (err: any) {
      console.error('Failed to update asset:', err);
      console.error('Error details:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        config: err.config
      });
      setError(err.message || '자산 수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Typography>로딩 중...</Typography>
      </Box>
    );
  }

  if (error && !asset) {
    return (
      <Box>
        <Alert severity="error">{error}</Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/assets')}
          sx={{ mt: 2 }}
        >
          목록으로
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Typography variant={isMobile ? 'h5' : 'h4'} gutterBottom>
        자산 수정 - {asset?.name}
      </Typography>

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
                InputLabelProps={{ shrink: true }} helperText="선택사항" />
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
            name="status"
            control={control}
            render={({ field }) => (
              <TextField {...field} select label="상태" fullWidth margin="normal">
                <MenuItem value="AVAILABLE">사용가능</MenuItem>
                <MenuItem value="IN_USE">사용중</MenuItem>
                <MenuItem value="MAINTENANCE">유지보수</MenuItem>
                <MenuItem value="RETIRED">폐기</MenuItem>
              </TextField>
            )}
          />

          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="비고" fullWidth margin="normal" multiline rows={3} helperText="선택사항" />
            )}
          />

          <Box sx={{ display: 'flex', gap: 2, mt: 3, flexDirection: isMobile ? 'column' : 'row' }}>
            <Button type="button" variant="outlined" onClick={() => navigate(`/assets/${id}`)}
              fullWidth={isMobile} startIcon={!isMobile && <ArrowBack />}>취소</Button>
            <Button type="submit" variant="contained" disabled={loading}
              fullWidth={isMobile} startIcon={!isMobile && <Save />}>
              {loading ? '수정 중...' : '수정'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default AssetEditPage;
