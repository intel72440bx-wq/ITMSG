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
import { getAsset, deleteAsset } from '../../api/asset';
import { useAuthStore } from '../../store/authStore';
import type { Asset } from '../../types/asset.types';

const AssetDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const isSystemAdmin = user?.roles?.some(role => role === 'ROLE_SYSTEM_ADMIN' || role === 'SYSTEM_ADMIN') || false;

  useEffect(() => {
    if (id) {
      fetchAsset(Number(id));
    }
  }, [id]);

  const fetchAsset = async (assetId: number) => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching asset detail for ID:', assetId);
      const data = await getAsset(assetId);
      console.log('Asset detail API response:', data);
      setAsset(data);
    } catch (err: any) {
      console.error('Failed to fetch asset:', err);
      console.error('Error details:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        config: err.config
      });
      setError(err.message || '자산 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!asset || !window.confirm('정말 이 자산을 삭제하시겠습니까?')) {
      return;
    }

    try {
      setDeleting(true);
      await deleteAsset(asset.id);
      alert('자산이 삭제되었습니다.');
      navigate('/assets');
    } catch (err: any) {
      console.error('Failed to delete asset:', err);
      setError(err.message || '자산 삭제에 실패했습니다.');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusColor = (status: string) => ({
    'AVAILABLE': 'success',
    'IN_USE': 'primary',
    'MAINTENANCE': 'warning',
    'RETIRED': 'default'
  } as any)[status] || 'default';

  const getStatusLabel = (status: string) => ({
    'AVAILABLE': '사용가능',
    'IN_USE': '사용중',
    'MAINTENANCE': '유지보수',
    'RETIRED': '폐기'
  } as any)[status] || status;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !asset) {
    return (
      <Box>
        <Alert severity="error">{error || '자산을 찾을 수 없습니다.'}</Alert>
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
          onClick={() => navigate('/assets')}
          size={isMobile ? 'small' : 'medium'}
        >
          목록으로
        </Button>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={isMobile ? null : <Edit />}
            onClick={() => navigate(`/assets/${asset.id}/edit`)}
            size={isMobile ? 'small' : 'medium'}
          >
            수정
          </Button>
          {isSystemAdmin && (
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
          )}
        </Box>
      </Box>

      <Paper sx={{ p: { xs: 2, sm: 3 }, width: '100%' }}>
        <Typography variant={isMobile ? 'h5' : 'h4'} gutterBottom>
          {asset.name}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
          <Chip
            label={getStatusLabel(asset.status)}
            color={getStatusColor(asset.status)}
          />
          <Chip
            label={asset.assetType}
            color="default"
          />
          <Chip
            label={`자산번호: ${asset.assetNumber}`}
            color="secondary"
            variant="outlined"
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              자산 유형
            </Typography>
            <Typography variant="body1" gutterBottom>
              {asset.assetType}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              제조사
            </Typography>
            <Typography variant="body1" gutterBottom>
              {asset.manufacturer || '-'}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              모델명
            </Typography>
            <Typography variant="body1" gutterBottom>
              {asset.model || '-'}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              시리얼 번호
            </Typography>
            <Typography variant="body1" gutterBottom>
              {asset.serialNumber || '-'}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              위치
            </Typography>
            <Typography variant="body1" gutterBottom>
              {asset.location || '-'}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              담당자
            </Typography>
            <Typography variant="body1" gutterBottom>
              {asset.managerName || '-'}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              취득일
            </Typography>
            <Typography variant="body1" gutterBottom>
              {asset.acquiredAt ? new Date(asset.acquiredAt).toLocaleDateString() : '-'}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              보증 만료일
            </Typography>
            <Typography variant="body1" gutterBottom>
              {asset.warrantyEndDate ? new Date(asset.warrantyEndDate).toLocaleDateString() : '-'}
            </Typography>
          </Box>

          <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              비고
            </Typography>
            <Typography variant="body1" gutterBottom>
              {asset.notes || '-'}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              생성일
            </Typography>
            <Typography variant="body1" gutterBottom>
              {new Date(asset.createdAt).toLocaleString()}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              수정일
            </Typography>
            <Typography variant="body1" gutterBottom>
              {new Date(asset.updatedAt).toLocaleString()}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default AssetDetailPage;
