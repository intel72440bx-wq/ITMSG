import React, { useEffect, useState } from 'react';
import {
  Paper,
  Typography,
  Card,
  CardContent,
  Box,
  CircularProgress,
  Alert,
  Button,
  Chip,
  Avatar,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  FolderOpen,
  Description,
  Assignment,
  CheckCircle,
  Add,
  TrendingUp,
  Schedule,
  Warning,
  Notifications,
  PlayArrow,
  AccessTime,
  Person,
  Business,
  Timeline,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import apiClient from '../../utils/api';

interface StatCard {
  title: string;
  value: number;
  subtitle?: string;
  icon: React.ReactElement;
  color: string;
  trend?: number;
}

interface RecentActivity {
  id: string;
  type: 'project' | 'sr' | 'spec' | 'approval';
  title: string;
  description: string;
  time: string;
  status?: string;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<StatCard[]>([
    {
      title: '활성 프로젝트',
      value: 0,
      subtitle: '진행 중',
      icon: <FolderOpen sx={{ fontSize: 32 }} />,
      color: '#1976d2',
      trend: 12,
    },
    {
      title: 'SR 요청',
      value: 0,
      subtitle: '이번 달',
      icon: <Description sx={{ fontSize: 32 }} />,
      color: '#2e7d32',
      trend: 8,
    },
    {
      title: '승인 대기',
      value: 0,
      subtitle: '처리 필요',
      icon: <CheckCircle sx={{ fontSize: 32 }} />,
      color: '#ed6c02',
      trend: -3,
    },
    {
      title: '완료율',
      value: 87,
      subtitle: '이번 분기',
      icon: <TrendingUp sx={{ fontSize: 32 }} />,
      color: '#7b1fa2',
      trend: 15,
    },
  ]);

  const [recentActivities] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'sr',
      title: 'SR-2024-001',
      description: '사용자 인증 시스템 개선 요청',
      time: '2시간 전',
      status: '승인 대기',
    },
    {
      id: '2',
      type: 'project',
      title: '모바일 앱 개발',
      description: '프로젝트 시작됨',
      time: '4시간 전',
      status: '진행 중',
    },
    {
      id: '3',
      type: 'spec',
      title: 'API 명세서 v2.1',
      description: '검토 완료',
      time: '1일 전',
      status: '완료',
    },
  ]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // 병렬로 API 호출
      const [projectsRes, srsRes] = await Promise.all([
        apiClient.get('/projects', { params: { page: 0, size: 1 } }),
        apiClient.get('/srs', { params: { page: 0, size: 1 } }),
      ]);

      // 통계 업데이트
      setStats([
        {
          title: '활성 프로젝트',
          value: projectsRes.data.totalElements || 0,
          subtitle: '진행 중',
          icon: <FolderOpen sx={{ fontSize: 32 }} />,
          color: '#1976d2',
          trend: 12,
        },
        {
          title: 'SR 요청',
          value: srsRes.data.totalElements || 0,
          subtitle: '이번 달',
          icon: <Description sx={{ fontSize: 32 }} />,
          color: '#2e7d32',
          trend: 8,
        },
        {
          title: '승인 대기',
          value: 3,
          subtitle: '처리 필요',
          icon: <CheckCircle sx={{ fontSize: 32 }} />,
          color: '#ed6c02',
          trend: -3,
        },
        {
          title: '완료율',
          value: 87,
          subtitle: '이번 분기',
          icon: <TrendingUp sx={{ fontSize: 32 }} />,
          color: '#7b1fa2',
          trend: 15,
        },
      ]);
    } catch (err: any) {
      console.error('Failed to fetch dashboard data:', err);
      setError('대시보드 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'sr': return <Description sx={{ fontSize: 20 }} />;
      case 'project': return <FolderOpen sx={{ fontSize: 20 }} />;
      case 'spec': return <Assignment sx={{ fontSize: 20 }} />;
      case 'approval': return <CheckCircle sx={{ fontSize: 20 }} />;
      default: return <Timeline sx={{ fontSize: 20 }} />;
    }
  };

  const getStatusColor = (status?: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (status) {
      case '완료': return 'success';
      case '진행 중': return 'primary';
      case '승인 대기': return 'warning';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      {/* 웰컴 헤더 섹션 */}
      <Box sx={{
        mb: 4,
        p: 3,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 3,
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: '200px',
          height: '200px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          transform: 'translate(50%, -50%)',
        }
      }}>
        <Box sx={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2
        }}>
          {/* 왼쪽: ITMS 텍스트 */}
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              ITMS 대시보드
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, mb: 2 }}>
              안녕하세요! 오늘도 효율적인 IT 서비스 관리를 위해 노력하세요.
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {new Date().toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
              })}
            </Typography>
          </Box>

          {/* 오른쪽: 사용자 정보 */}
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginLeft: 'auto' }}>
              <Box sx={{ textAlign: 'right', mr: 2 }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {user.name}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  {user.companyName}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 48, height: 48 }}>
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
            </Box>
          )}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* 통계 카드 섹션 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'text.primary' }}>
          주요 지표
        </Typography>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 3,
        }}>
          {stats.map((stat) => (
            <Box key={stat.title} sx={{ minWidth: 0 }}>
              <Card sx={{
                height: '100%',
                background: `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}08 100%)`,
                border: `1px solid ${stat.color}20`,
                borderRadius: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 25px ${stat.color}20`,
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{
                      color: stat.color,
                      opacity: 0.8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      width: '100%'
                    }}>
                      {stat.icon}
                    </Box>
                    {stat.trend && (
                      <Chip
                        size="small"
                        label={`${stat.trend > 0 ? '+' : ''}${stat.trend}%`}
                        sx={{
                          backgroundColor: stat.trend > 0 ? '#e8f5e8' : '#ffebee',
                          color: stat.trend > 0 ? '#2e7d32' : '#d32f2f',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                        }}
                      />
                    )}
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
                    {stat.value.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                    {stat.title}
                  </Typography>
                  {stat.subtitle && (
                    <Typography variant="caption" sx={{ color: 'text.secondary', opacity: 0.7 }}>
                      {stat.subtitle}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Box>

      {/* 메인 콘텐츠 그리드 */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
        gap: 3,
      }}>
        {/* 최근 활동 */}
        <Box sx={{ minWidth: 0 }}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  최근 활동
                </Typography>
                <Button
                  size="small"
                  endIcon={<PlayArrow />}
                  sx={{ textTransform: 'none' }}
                  onClick={() => navigate('/projects')}
                >
                  전체보기
                </Button>
              </Box>

              <List sx={{ p: 0 }}>
                {recentActivities.map((activity, index) => (
                  <React.Fragment key={activity.id}>
                    <ListItem sx={{ px: 0, py: 2 }}>
                      <ListItemAvatar>
                        <Avatar sx={{
                          bgcolor: activity.type === 'sr' ? '#e3f2fd' :
                                   activity.type === 'project' ? '#e8f5e8' :
                                   activity.type === 'spec' ? '#fff3e0' : '#fce4ec',
                          color: activity.type === 'sr' ? '#1976d2' :
                                 activity.type === 'project' ? '#2e7d32' :
                                 activity.type === 'spec' ? '#ed6c02' : '#c2185b',
                        }}>
                          {getActivityIcon(activity.type)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {activity.title}
                            </Typography>
                            {activity.status && (
                              <Chip
                                size="small"
                                label={activity.status}
                                color={getStatusColor(activity.status)}
                                variant="outlined"
                                sx={{ fontSize: '0.7rem', height: '20px' }}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Typography variant="body2" color="text.secondary">
                              {activity.description}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                              {activity.time}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < recentActivities.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>

        {/* 우측 사이드바 */}
        <Box sx={{ minWidth: 0 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* 빠른 액션 */}
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  빠른 액션
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={() => navigate('/srs/create')}
                    sx={{
                      justifyContent: 'flex-start',
                      textTransform: 'none',
                      borderRadius: 2,
                      py: 1.5,
                    }}
                  >
                    SR 요청 생성
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<FolderOpen />}
                    onClick={() => navigate('/projects/create')}
                    sx={{
                      justifyContent: 'flex-start',
                      textTransform: 'none',
                      borderRadius: 2,
                      py: 1.5,
                    }}
                  >
                    새 프로젝트
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Person />}
                    onClick={() => navigate('/users/create')}
                    sx={{
                      justifyContent: 'flex-start',
                      textTransform: 'none',
                      borderRadius: 2,
                      py: 1.5,
                    }}
                  >
                    사용자 등록
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* 시스템 상태 */}
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  시스템 상태
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">서버 상태</Typography>
                      <Chip size="small" label="정상" color="success" sx={{ fontSize: '0.7rem' }} />
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={100}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#4caf50',
                        },
                        backgroundColor: 'rgba(76, 175, 80, 0.2)',
                      }}
                    />
                  </Box>

                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">데이터베이스</Typography>
                      <Chip size="small" label="정상" color="success" sx={{ fontSize: '0.7rem' }} />
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={100}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#4caf50',
                        },
                        backgroundColor: 'rgba(76, 175, 80, 0.2)',
                      }}
                    />
                  </Box>

                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">API 응답시간</Typography>
                      <Typography variant="caption" color="text.secondary">245ms</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={85} color="primary" sx={{ height: 6, borderRadius: 3 }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* 알림 */}
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Notifications sx={{ mr: 1, color: 'warning.main' as const }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    알림
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{
                    p: 2,
                    bgcolor: 'warning.light',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'warning.main',
                  }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: 'warning.dark' }}>
                      3건의 승인이 대기 중입니다
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'warning.dark', opacity: 0.8 }}>
                      2시간 전
                    </Typography>
                  </Box>

                  <Box sx={{
                    p: 2,
                    bgcolor: 'info.light',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'info.main',
                  }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: 'info.dark' }}>
                      시스템 점검이 예정되어 있습니다
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'info.dark', opacity: 0.8 }}>
                      내일 02:00
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardPage;
