import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, TextField, Button, Alert,
  useMediaQuery, useTheme, FormControlLabel, Switch,
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { getPartner, updatePartner } from '../../api/partner';
import type { Partner, PartnerUpdateRequest } from '../../types/partner.types';

const PartnerEditPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { id } = useParams<{ id: string }>();
  const { control, handleSubmit, setValue, formState: { errors } } = useForm<PartnerUpdateRequest>();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (id) {
      fetchPartner(Number(id));
    }
  }, [id]);

  const fetchPartner = async (partnerId: number) => {
    try {
      setFetchLoading(true);
      const data = await getPartner(partnerId);
      setPartner(data);

      // 폼에 데이터 채우기
      setValue('name', data.name);
      setValue('businessNumber', data.businessNumber);
      setValue('ceoName', data.ceoName || '');
      setValue('managerId', data.managerId || undefined);
      setValue('isActive', !data.isClosed); // isClosed의 반대로 설정
    } catch (err: any) {
      console.error('Failed to fetch partner:', err);
      setError(err.message || '파트너 정보를 불러오는데 실패했습니다.');
    } finally {
      setFetchLoading(false);
    }
  };

  const onSubmit = async (data: PartnerUpdateRequest) => {
    if (!partner) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // 프론트엔드의 isActive를 백엔드의 isClosed로 변환
      const transformedData = {
        name: data.name,
        businessNumber: data.businessNumber,
        ceoName: data.ceoName,
        managerId: data.managerId,
        isClosed: !data.isActive // isActive가 true면 isClosed는 false
      };
      await updatePartner(partner.id, transformedData);
      setSuccess('파트너가 수정되었습니다!');
      setTimeout(() => navigate(`/partners/${partner.id}`), 2000);
    } catch (err: any) {
      console.error('Failed to update partner:', err);
      setError(err.message || '파트너 수정에 실패했습니다.');
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

  if (error && !partner) {
    return (
      <Box>
        <Alert severity="error">{error}</Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/partners')}
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
        파트너 수정 - {partner?.name}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Paper sx={{ p: { xs: 2, sm: 3 }, mt: 2, width: '100%' }}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%' }}>
          <Controller
            name="name"
            control={control}
            rules={{ required: '파트너명은 필수입니다.' }}
            render={({ field }) => (
              <TextField {...field} label="파트너명" fullWidth margin="normal"
                error={!!errors.name} helperText={errors.name?.message} required />
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
              <TextField {...field} label="사업자등록번호" fullWidth margin="normal"
                error={!!errors.businessNumber} helperText={errors.businessNumber?.message || '10-12자리 숫자'}
                required placeholder="1234567890" />
            )}
          />

          <Controller
            name="ceoName"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="대표자명" fullWidth margin="normal" helperText="선택사항" />
            )}
          />

          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Switch {...field} checked={field.value || false} />}
                label={field.value ? "활성 상태" : "비활성 상태"}
                sx={{ mt: 2 }}
              />
            )}
          />

          <Box sx={{ display: 'flex', gap: 2, mt: 3, flexDirection: isMobile ? 'column' : 'row' }}>
            <Button type="button" variant="outlined" onClick={() => navigate(`/partners/${id}`)}
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

export default PartnerEditPage;
