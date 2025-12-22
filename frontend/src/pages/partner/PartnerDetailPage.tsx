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
  Tabs,
  Tab,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowBack, Edit, Delete } from '@mui/icons-material';
import { getPartner, deletePartner, getPartnerManagerProjects } from '../../api/partner';
import { useAuthStore } from '../../store/authStore';
import type { Partner } from '../../types/partner.types';
import type { Project } from '../../types/project.types';

const PartnerDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);

  const isSystemAdmin = user?.roles?.some(role => role === 'ROLE_SYSTEM_ADMIN' || role === 'SYSTEM_ADMIN') || false;

  useEffect(() => {
    if (id) {
      fetchPartner(Number(id));
    }
  }, [id]);

  const fetchPartner = async (partnerId: number) => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching partner detail for ID:', partnerId);
      const data = await getPartner(partnerId);
      console.log('Partner detail API response:', data);
      setPartner(data);
    } catch (err: any) {
      console.error('Failed to fetch partner:', err);
      console.error('Error details:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        config: err.config
      });
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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    if (newValue === 1 && projects.length === 0) {
      fetchPartnerProjects();
    }
  };

  const fetchPartnerProjects = async () => {
    if (!partner) return;

    try {
      setProjectsLoading(true);
      const response = await getPartnerManagerProjects(partner.id);
      setProjects(response.content);
    } catch (err: any) {
      console.error('Failed to fetch partner projects:', err);
    } finally {
      setProjectsLoading(false);
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
          {partner.name}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
          <Chip
            label={partner.isClosed ? '폐업' : '활성'}
            color={partner.isClosed ? 'error' : 'success'}
          />
          <Chip
            label={partner.code || '코드 없음'}
            color="default"
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="partner tabs">
            <Tab label="기본 정보" />
            <Tab label="담당 프로젝트" />
          </Tabs>
        </Box>

        {tabValue === 0 && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3, mt: 3 }}>
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

            <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                상태 정보
              </Typography>
              <Paper
                variant="outlined"
                sx={{ p: 2, bgcolor: 'grey.50' }}
              >
                <Typography variant="body1">
                  현재 상태: {partner.isClosed ? '폐업' : '활성'}
                  {partner.isClosed && partner.closedAt && (
                    <><br />폐업일: {new Date(partner.closedAt).toLocaleDateString()}</>
                  )}
                </Typography>
              </Paper>
            </Box>

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
        )}

        {tabValue === 1 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              담당 프로젝트 목록
            </Typography>
            {projectsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : projects.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                담당자가 PM인 프로젝트가 없습니다.
              </Typography>
            ) : (
              <Box sx={{ display: 'grid', gap: 2 }}>
                {projects.map((project) => (
                  <Paper key={project.id} variant="outlined" sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {project.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          코드: {project.code} | 유형: {project.projectType} | 상태: {project.status}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          회사: {project.companyName} | 시작일: {new Date(project.startDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => navigate(`/projects/${project.id}`)}
                      >
                        상세보기
                      </Button>
                    </Box>
                  </Paper>
                ))}
              </Box>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default PartnerDetailPage;
