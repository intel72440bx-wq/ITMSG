import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  IconButton,
  CircularProgress,
  Alert,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Button,
  Breadcrumbs,
  Link as MuiLink,
} from '@mui/material';
import {
  FolderOpen,
  Description,
  CheckCircle,
  Timeline,
  ArrowBack,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { getAllRecentActivities, RecentActivity, RecentActivitiesPage } from '../../api/dashboard';

const RecentActivitiesPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activitiesPage, setActivitiesPage] = useState<RecentActivitiesPage | null>(null);
  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [typeFilter, setTypeFilter] = useState<string>('');

  useEffect(() => {
    fetchActivities();
  }, [page, typeFilter]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAllRecentActivities(page, size, typeFilter || undefined);
      setActivitiesPage(data);
    } catch (err: any) {
      console.error('Failed to fetch activities:', err);
      setError('최근 활동 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'sr': return <Description sx={{ fontSize: 20 }} />;
      case 'project': return <FolderOpen sx={{ fontSize: 20 }} />;
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

  const handleTypeFilterChange = (event: SelectChangeEvent) => {
    setTypeFilter(event.target.value);
    setPage(0); // 필터 변경 시 첫 페이지로 이동
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'sr': return 'SR 요청';
      case 'project': return '프로젝트';
      case 'approval': return '승인';
      default: return type;
    }
  };

  if (loading && !activitiesPage) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* 헤더 */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <MuiLink component={Link} to="/dashboard" underline="hover" color="inherit">
            대시보드
          </MuiLink>
          <Typography color="text.primary">최근 활동</Typography>
        </Breadcrumbs>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            최근 활동 전체보기
          </Typography>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/dashboard')}
          >
            대시보드로 돌아가기
          </Button>
        </Box>

        {/* 필터 */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>활동 타입</InputLabel>
            <Select
              value={typeFilter}
              label="활동 타입"
              onChange={handleTypeFilterChange}
            >
              <MenuItem value="">전체</MenuItem>
              <MenuItem value="sr">SR 요청</MenuItem>
              <MenuItem value="project">프로젝트</MenuItem>
              <MenuItem value="approval">승인</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* 활동 목록 */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : activitiesPage && activitiesPage.content.length > 0 ? (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>활동</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>제목</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>설명</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>상태</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>사용자</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>시간</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activitiesPage.content.map((activity) => (
                      <TableRow key={activity.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{
                              bgcolor: activity.type === 'sr' ? '#e3f2fd' :
                                       activity.type === 'project' ? '#e8f5e8' :
                                       activity.type === 'approval' ? '#fff3e0' : '#fce4ec',
                              color: activity.type === 'sr' ? '#1976d2' :
                                     activity.type === 'project' ? '#2e7d32' :
                                     activity.type === 'approval' ? '#ed6c02' : '#c2185b',
                              width: 32,
                              height: 32
                            }}>
                              {getActivityIcon(activity.type)}
                            </Avatar>
                            <Chip
                              label={getTypeLabel(activity.type)}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>
                          {activity.title}
                        </TableCell>
                        <TableCell sx={{ maxWidth: 300 }}>
                          <Typography variant="body2" sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {activity.description}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={activity.status}
                            color={getStatusColor(activity.status)}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          {activity.userName}
                        </TableCell>
                        <TableCell sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                          {formatDateTime(activity.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* 페이징 */}
              {activitiesPage.totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <Pagination
                    count={activitiesPage.totalPages}
                    page={activitiesPage.number + 1}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                  />
                </Box>
              )}
            </>
          ) : (
            <Box sx={{ textAlign: 'center', p: 4 }}>
              <Typography variant="h6" color="text.secondary">
                최근 활동이 없습니다.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* 요약 정보 */}
      {activitiesPage && (
        <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="body2" color="text.secondary">
            총 {activitiesPage.totalElements}개 항목
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {activitiesPage.number + 1} / {activitiesPage.totalPages} 페이지
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default RecentActivitiesPage;
