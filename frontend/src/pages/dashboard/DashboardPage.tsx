import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Menu,
  MenuItem,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  Pagination,
  CircularProgress,
  Alert,
  Button,
  Chip,
  Avatar,
  LinearProgress,
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
  Person,
  Business,
  Timeline,
  AccountCircle,
  Logout,
  Lock,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { logout } from '../../api/auth';
import { getDashboardStats, getAllRecentActivities, getRecentActivities } from '../../api/dashboard';
import type { DashboardStats, RecentActivity, RecentActivitiesPage } from '../../api/dashboard';

interface StatCard {
  title: string;
  value: number;
  subtitle?: string;
  icon: React.ReactElement;
  color: string;
  trend?: number;
}

interface RecentActivityItem {
  id: string;
  type: 'project' | 'sr' | 'spec' | 'approval';
  title: string;
  description: string;
  time: string;
  status?: string;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [activitiesPage, setActivitiesPage] = useState<RecentActivitiesPage | null>(null);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [recentActivitiesLoading, setRecentActivitiesLoading] = useState(false);
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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (expanded) {
      fetchActivities();
    }
  }, [expanded, page]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      setRecentActivitiesLoading(true);

      // 백엔드 API에서 대시보드 통계 데이터 가져오기
      const dashboardStats = await getDashboardStats();

      setStats([
        {
          title: '활성 프로젝트',
          value: dashboardStats.activeProjects,
          subtitle: '진행 중',
          icon: <FolderOpen sx={{ fontSize: 32 }} />,
          color: '#1976d2',
          trend: dashboardStats.activeProjectsTrend,
        },
        {
          title: 'SR 요청',
          value: dashboardStats.srRequestsThisMonth,
          subtitle: '이번 달',
          icon: <Description sx={{ fontSize: 32 }} />,
          color: '#2e7d32',
          trend: dashboardStats.srRequestsTrend,
        },
        {
          title: '승인 대기',
          value: dashboardStats.pendingApprovals,
          subtitle: '처리 필요',
          icon: <CheckCircle sx={{ fontSize: 32 }} />,
          color: '#ed6c02',
          trend: dashboardStats.pendingApprovalsTrend,
        },
        {
          title: '완료율',
          value: Math.round(dashboardStats.completionRate),
          subtitle: '이번 분기',
          icon: <TrendingUp sx={{ fontSize: 32 }} />,
          color: '#7b1fa2',
          trend: dashboardStats.completionRateTrend,
        },
      ]);

      // 최근 활동 데이터 가져오기 (축소된 상태용)
      const recentActivitiesData = await getRecentActivities(5); // 5개 항목 가져오기
      setRecentActivities(recentActivitiesData);

      console.log('대시보드 데이터 로드 완료');
    } catch (err: any) {
      console.error('Failed to fetch dashboard data:', err);
      // API 호출 실패 시 더미 데이터로 표시
      setStats([
        {
          title: '활성 프로젝트',
          value: 0,
          subtitle: '진행 중',
          icon: <FolderOpen sx={{ fontSize: 32 }} />,
          color: '#1976d2',
          trend: 0,
        },
        {
          title: 'SR 요청',
          value: 0,
          subtitle: '이번 달',
          icon: <Description sx={{ fontSize: 32 }} />,
          color: '#2e7d32',
          trend: 0,
        },
        {
          title: '승인 대기',
          value: 0,
          subtitle: '처리 필요',
          icon: <CheckCircle sx={{ fontSize: 32 }} />,
          color: '#ed6c02',
          trend: 0,
        },
        {
          title: '완료율',
          value: 0,
          subtitle: '이번 분기',
          icon: <TrendingUp sx={{ fontSize: 32 }} />,
          color: '#7b1fa2',
          trend: 0,
        },
      ]);
      setRecentActivities([]); // 최근 활동도 빈 배열로 초기화
      setError('대시보드 데이터를 불러오는데 실패했습니다. 기본 데이터를 표시합니다.');
    } finally {
      setLoading(false);
      setRecentActivitiesLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      setActivitiesLoading(true);
      const data = await getAllRecentActivities(page, size);
      setActivitiesPage(data);
    } catch (err: any) {
      console.error('Failed to fetch activities:', err);
    } finally {
      setActivitiesLoading(false);
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
      case '완료':
      case 'APPROVED': return 'success';
      case '진행 중':
      case 'PENDING': return 'primary';
      case '승인 대기':
      case '요청됨': return 'warning';
      case 'REJECTED': return 'error';
      case 'CANCELLED': return 'default';
      default: return 'default';
    }
  };

  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value - 1);
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
      navigate('/login');
    }
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{
      width: '100%',
      height: '100vh',
      overflow: 'auto',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* 웰컴 헤더 섹션 */}
      <Box sx={{
        mb: 4,
        p: 3,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 3,
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
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
          gap: 1.5
        }}>
          {/* 왼쪽: ITMS 텍스트 */}
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.75, fontSize: '1.75rem' }}>
              ITMSG 대시보드
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, mb: 1.5, fontSize: '0.95rem' }}>
              안녕하세요! 오늘도 효율적인 IT 서비스 관리를 위해 노력하세요.
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.8rem' }}>
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
              <IconButton
                onClick={handleMenu}
                sx={{
                  p: 0.5,
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 48, height: 48 }}>
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </Avatar>
              </IconButton>
            </Box>
          )}

          {/* 사용자 메뉴 */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 200,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              },
            }}
          >
            <MenuItem onClick={() => { handleClose(); navigate('/profile'); }}>
              <Person sx={{ mr: 1, fontSize: 20 }} /> 내 프로필
            </MenuItem>
            <MenuItem onClick={() => { handleClose(); navigate('/change-password'); }}>
              <Lock sx={{ mr: 1, fontSize: 20 }} /> 비밀번호 변경
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 1, fontSize: 20 }} /> 로그아웃
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, mx: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* 통계 카드 섹션 */}
      <Box sx={{ mb: 3, mx: 3, flexShrink: 0 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
          주요 지표
        </Typography>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 2,
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
        mx: 3,
        flex: 1,
        minHeight: 0,
      }}>
        {/* 최근 활동 */}
        <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <Card sx={{
            borderRadius: 3,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            maxHeight: expanded ? 'none' : '400px',
            overflow: expanded ? 'visible' : 'hidden',
          }}>
            <CardContent sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                  최근 활동
                </Typography>
                <Button
                  size="small"
                  endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
                  sx={{ textTransform: 'none', fontSize: '0.8rem' }}
                  onClick={toggleExpanded}
                >
                  {expanded ? '접기' : '펼쳐보기'}
                </Button>
              </Box>

              {!expanded ? (
                // 축소된 상태: 리스트 형태
                recentActivitiesLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : recentActivities.length > 0 ? (
                  <List sx={{ p: 0, flex: 1 }}>
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
                                  {formatDateTime(activity.createdAt)}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                        {index < recentActivities.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ textAlign: 'center', p: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      최근 활동이 없습니다.
                    </Typography>
                  </Box>
                )
              ) : (
                // 확장된 상태: 그리드 형태
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {activitiesLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : activitiesPage && activitiesPage.content.length > 0 ? (
                    <>
                      <TableContainer sx={{ flex: 1 }}>
                        <Table stickyHeader size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem', py: 1 }}>활동</TableCell>
                              <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem', py: 1 }}>제목</TableCell>
                              <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem', py: 1 }}>설명</TableCell>
                              <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem', py: 1 }}>상태</TableCell>
                              <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem', py: 1 }}>사용자</TableCell>
                              <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem', py: 1 }}>시간</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {activitiesPage.content.map((activity) => (
                              <TableRow key={activity.id} hover>
                                <TableCell sx={{ py: 1 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Avatar sx={{
                                      bgcolor: activity.type === 'sr' ? '#e3f2fd' :
                                               activity.type === 'project' ? '#e8f5e8' :
                                               activity.type === 'approval' ? '#fff3e0' : '#fce4ec',
                                      color: activity.type === 'sr' ? '#1976d2' :
                                             activity.type === 'project' ? '#2e7d32' :
                                             activity.type === 'approval' ? '#ed6c02' : '#c2185b',
                                      width: 24,
                                      height: 24
                                    }}>
                                      {getActivityIcon(activity.type)}
                                    </Avatar>
                                    <Typography variant="caption">
                                      {activity.type === 'sr' ? 'SR' :
                                       activity.type === 'project' ? '프로젝트' :
                                       activity.type === 'approval' ? '승인' : activity.type}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell sx={{ py: 1, fontWeight: 500, fontSize: '0.875rem' }}>
                                  {activity.title}
                                </TableCell>
                                <TableCell sx={{ py: 1, maxWidth: 200 }}>
                                  <Typography variant="body2" sx={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    fontSize: '0.75rem'
                                  }}>
                                    {activity.description}
                                  </Typography>
                                </TableCell>
                                <TableCell sx={{ py: 1 }}>
                                  <Chip
                                    label={activity.status}
                                    color={getStatusColor(activity.status)}
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontSize: '0.7rem', height: '20px' }}
                                  />
                                </TableCell>
                                <TableCell sx={{ py: 1, fontSize: '0.875rem' }}>
                                  {activity.userName}
                                </TableCell>
                                <TableCell sx={{ py: 1, color: 'text.secondary', fontSize: '0.75rem' }}>
                                  {formatDateTime(activity.createdAt)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>

                      {/* 페이징 */}
                      {activitiesPage.totalPages > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 1, borderTop: 1, borderColor: 'divider' }}>
                          <Pagination
                            count={activitiesPage.totalPages}
                            page={activitiesPage.number + 1}
                            onChange={handlePageChange}
                            color="primary"
                            size="small"
                          />
                        </Box>
                      )}
                    </>
                  ) : (
                    <Box sx={{ textAlign: 'center', p: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        최근 활동이 없습니다.
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* 우측 사이드바 */}
        <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            maxHeight: '400px',
            overflow: 'auto'
          }}>
            {/* 빠른 액션 */}
            <Card sx={{ borderRadius: 3, flexShrink: 0 }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5, fontSize: '1.1rem' }}>
                  빠른 액션
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={() => navigate('/srs/new')}
                    sx={{
                      justifyContent: 'flex-start',
                      textTransform: 'none',
                      borderRadius: 2,
                      py: 1.25,
                      fontSize: '0.85rem',
                    }}
                  >
                    SR 요청 생성
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<FolderOpen />}
                    onClick={() => navigate('/projects/new')}
                    sx={{
                      justifyContent: 'flex-start',
                      textTransform: 'none',
                      borderRadius: 2,
                      py: 1.25,
                      fontSize: '0.85rem',
                    }}
                  >
                    새 프로젝트
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Person />}
                    onClick={() => navigate('/users/new')}
                    sx={{
                      justifyContent: 'flex-start',
                      textTransform: 'none',
                      borderRadius: 2,
                      py: 1.25,
                      fontSize: '0.85rem',
                    }}
                  >
                    사용자 등록
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* 시스템 상태 */}
            <Card sx={{ borderRadius: 3, flexShrink: 0 }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5, fontSize: '1.1rem' }}>
                  시스템 상태
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>서버 상태</Typography>
                      <Chip size="small" label="정상" color="success" sx={{ fontSize: '0.65rem', height: '18px' }} />
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={100}
                      sx={{
                        height: 5,
                        borderRadius: 2.5,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#4caf50',
                        },
                        backgroundColor: 'rgba(76, 175, 80, 0.2)',
                      }}
                    />
                  </Box>

                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>데이터베이스</Typography>
                      <Chip size="small" label="정상" color="success" sx={{ fontSize: '0.65rem', height: '18px' }} />
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={100}
                      sx={{
                        height: 5,
                        borderRadius: 2.5,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#4caf50',
                        },
                        backgroundColor: 'rgba(76, 175, 80, 0.2)',
                      }}
                    />
                  </Box>

                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>API 응답시간</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>245ms</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={85} color="primary" sx={{ height: 5, borderRadius: 2.5 }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* 알림 */}
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                  <Notifications sx={{ mr: 1, color: 'warning.main' as const, fontSize: '1.2rem' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                    알림
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                  <Box sx={{
                    p: 1.5,
                    bgcolor: 'warning.light',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'warning.main',
                  }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: 'warning.dark', fontSize: '0.85rem' }}>
                      3건의 승인이 대기 중입니다
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'warning.dark', opacity: 0.8, fontSize: '0.75rem' }}>
                      2시간 전
                    </Typography>
                  </Box>

                  <Box sx={{
                    p: 1.5,
                    bgcolor: 'info.light',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'info.main',
                  }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: 'info.dark', fontSize: '0.85rem' }}>
                      시스템 점검이 예정되어 있습니다
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'info.dark', opacity: 0.8, fontSize: '0.75rem' }}>
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
