import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowBack, Edit, Delete } from '@mui/icons-material';
import { getPartner, deletePartner } from '../../api/partner';
import type { Partner } from '../../types/partner.types';

const PartnerDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { id } = useParams<{ id: string }>();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPartner(Number(id));
    }
  }, [id]);

  const fetchPartner = async (partnerId: number) => {
    try {
      setLoading(true);
      setError('');
      const data = await getPartner(partnerId);
      setPartner(data);
    } catch (err: any) {
      console.error('Failed to fetch partner:', err);
      setError(err.message || '파트너 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!partner || !window.confirm('정말 이 파트너를 삭제하시겠습니까?')) {
      return;
    }

    try {
      setDeleting(true);
      await deletePartner(partner.id);
      alert('파트너가 삭제되었습니다.');
      navigate('/partners');
    } catch (err: any) {
      console.error('Failed to delete partner:', err);
      setError(err.message || '파트너 삭제에 실패했습니다.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !partner) {
    return (
      <Box>
        <Alert severity="error">{error || '파트너를 찾을 수 없습니다.'}</Alert>
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
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        mb: 3,
        flexWrap: 'wrap',
        gap: 1,
        width: '100%',
      }}>
        <Button
          startIcon={isMobile ? null : <ArrowBack />}
          onClick={() => navigate('/partners')}
          size={isMobile ? 'small' : 'medium'}
        >
          목록으로
        </Button>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={isMobile ? null : <Edit />}
            onClick={() => navigate(`/partners/${partner.id}/edit`)}
            size={isMobile ? 'small' : 'medium'}
          >
            수정
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={isMobile ? null : <Delete />}
            onClick={handleDelete}
            disabled={deleting}
            size={isMobile ? 'small' : 'medium'}
          >
            {deleting ? '삭제 중...' : '삭제'}
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: { xs: 2, sm: 3 }, width: '100%' }}>
        <Typography variant={isMobile ? 'h5' : 'h4'} gutterBottom>
          {partner.name}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
          <Chip
            label={partner.isClosed ? '폐업' : '활성'}
            color={partner.isClosed ? 'error' : 'success'}
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              사업자번호
            </Typography>
            <Typography variant="body1" gutterBottom>
              {partner.businessNumber}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              대표자
            </Typography>
            <Typography variant="body1" gutterBottom>
              {partner.ceoName || '-'}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              담당자
            </Typography>
            <Typography variant="body1" gutterBottom>
              {partner.managerName || '-'}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              코드
            </Typography>
            <Typography variant="body1" gutterBottom>
              {partner.code || '-'}
            </Typography>
          </Box>

          {/* 백엔드에서 지원하지 않는 필드들은 주석 처리 또는 제거 */}
          {/* TODO: 백엔드 API 확장 시 아래 필드들 활성화 */}
          {/*
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              연락처 담당자
            </Typography>
            <Typography variant="body1" gutterBottom>
              {partner.contactPerson || '-'}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              전화번호
            </Typography>
            <Typography variant="body1" gutterBottom>
              {partner.phoneNumber || '-'}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              이메일
            </Typography>
            <Typography variant="body1" gutterBottom>
              {partner.email || '-'}
            </Typography>
          </Box>

          <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              주소
            </Typography>
            <Paper
              variant="outlined"
              sx={{ p: 2, bgcolor: 'grey.50' }}
            >
              <Typography variant="body1">{partner.address || '-'}</Typography>
            </Paper>
          </Box>
          */}

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              생성일
            </Typography>
            <Typography variant="body1" gutterBottom>
              {new Date(partner.createdAt).toLocaleString()}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              수정일
            </Typography>
            <Typography variant="body1" gutterBottom>
              {new Date(partner.updatedAt).toLocaleString()}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default PartnerDetailPage;
