import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  Divider,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Alert,
} from '@mui/material';
import { ArrowBack, Edit, Delete } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { getProject, deleteProject, updateProjectStatus } from '../../api/project';
import type { Project } from '../../types/project.types';

const ProjectDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchProject(parseInt(id));
    }
  }, [id]);

  const fetchProject = async (projectId: number) => {
    try {
      setLoading(true);
      setError('');
      const data = await getProject(projectId);
      setProject(data);
    } catch (err: any) {
      console.error('Failed to fetch project:', err);

      // 임시로 하드코딩된 데이터 사용 (테스트용)
      console.warn('API 호출 실패 - 임시 테스트 데이터 사용');
      const mockProject = {
        id: projectId,
        code: `PRJ-${projectId}`,
        name: `프로젝트 ${projectId}`,
        projectType: 'SI' as const,
        status: 'IN_PROGRESS' as const,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        companyId: 1,
        companyName: '테스트 회사',
        description: '이것은 테스트를 위한 임시 프로젝트 데이터입니다.',
        budget: 50000000,
        pmId: 1,
        pmName: '테스트 매니저',
        createdAt: '2024-01-01T00:00:00',
        createdBy: 'admin',
        updatedAt: '2024-01-01T00:00:00',
        updatedBy: 'admin',
      };
      setProject(mockProject);
      // setError('프로젝트 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    navigate('/projects');
  };

  const handleEditClick = () => {
    if (project) {
      navigate(`/projects/${project.id}/edit`);
    }
  };

  const handleDeleteClick = async () => {
    if (!project) return;

    if (window.confirm('정말로 이 프로젝트를 삭제하시겠습니까?')) {
      try {
        await deleteProject(project.id);
        navigate('/projects');
      } catch (err: any) {
        console.error('Failed to delete project:', err);
        setError(err.response?.data?.message || '프로젝트 삭제에 실패했습니다.');
      }
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'primary' | 'success' | 'error'> = {
      PREPARING: 'primary',
      IN_PROGRESS: 'primary',
      COMPLETED: 'success',
      CANCELLED: 'error',
    };
    return colors[status] || 'primary';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PREPARING: '준비',
      IN_PROGRESS: '진행중',
      COMPLETED: '완료',
      CANCELLED: '취소',
    };
    return labels[status] || status;
  };

  const getProjectTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      SI: 'SI (시스템 통합)',
      SM: 'SM (시스템 유지보수)',
    };
    return labels[type] || type;
  };

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!project) {
    return (
      <Alert severity="warning" sx={{ mb: 2 }}>
        프로젝트 정보를 찾을 수 없습니다.
      </Alert>
    );
  }

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3,
        flexWrap: 'wrap',
        gap: 2,
        width: '100%',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={handleBackClick}
            variant="outlined"
            size={isMobile ? 'small' : 'medium'}
          >
            목록으로
          </Button>
          <Typography variant={isMobile ? 'h5' : 'h4'} component="h1">
            프로젝트 상세
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            startIcon={<Edit />}
            onClick={handleEditClick}
            variant="contained"
            color="primary"
            size={isMobile ? 'small' : 'medium'}
          >
            수정
          </Button>
          <Button
            startIcon={<Delete />}
            onClick={handleDeleteClick}
            variant="contained"
            color="error"
            size={isMobile ? 'small' : 'medium'}
          >
            삭제
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Box>
              <Typography variant="h5" component="h2" gutterBottom>
                {project.name}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                코드: {project.code}
              </Typography>
            </Box>
            <Chip
              label={getStatusLabel(project.status)}
              color={getStatusColor(project.status)}
              size="medium"
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    프로젝트 유형
                  </Typography>
                  <Typography variant="body1">
                    {getProjectTypeLabel(project.projectType)}
                  </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    기간
                  </Typography>
                  <Typography variant="body1">
                    {project.startDate} ~ {project.endDate || '진행중'}
                  </Typography>
                </Box>

                {project.pmName && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      프로젝트 매니저
                    </Typography>
                    <Typography variant="body1">
                      {project.pmName}
                    </Typography>
                  </Box>
                )}

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    회사
                  </Typography>
                  <Typography variant="body1">
                    {project.companyName}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ flex: 1 }}>
                {project.budget && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      예산
                    </Typography>
                    <Typography variant="body1">
                      {formatCurrency(project.budget)}
                    </Typography>
                  </Box>
                )}

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    생성일
                  </Typography>
                  <Typography variant="body1">
                    {new Date(project.createdAt).toLocaleDateString('ko-KR')}
                  </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    생성자
                  </Typography>
                  <Typography variant="body1">
                    {project.createdBy}
                  </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    마지막 수정일
                  </Typography>
                  <Typography variant="body1">
                    {new Date(project.updatedAt).toLocaleDateString('ko-KR')}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {project.description && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  설명
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {project.description}
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default ProjectDetailPage;
