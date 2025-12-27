import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Chip, CircularProgress, Alert, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, Snackbar, useMediaQuery, useTheme, IconButton, Autocomplete, TextField } from '@mui/material';
import { Add, Engineering, Person, Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getPartners, updatePartner } from '../../api/partner';
import { getUsers } from '../../api/user';
import type { Partner } from '../../types/partner.types';
import type { User } from '../../types/auth.types';

const PartnerListPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [partners, setPartners] = useState<Partner[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [selectedPmId, setSelectedPmId] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => { fetchData(); }, [page, rowsPerPage]);

  const fetchData = async () => {
    setLoading(true); setError('');
    try {
      // 파트너 목록 조회
      const partnerResponse = await getPartners({ page, size: rowsPerPage });
      setPartners(partnerResponse.content);
      setTotalElements(partnerResponse.totalElements);

      // 사용자 목록 조회 (PM 설정용)
      const userResponse = await getUsers({
        page: 0,
        size: 1000, // 모든 사용자 조회
      });
      setUsers(userResponse.content);
    } catch (err: any) {
      console.error('Failed to fetch data:', err);
      setError(err.message || '데이터 로드에 실패했습니다.');
    } finally { setLoading(false); }
  };

  const handleAssignPm = (partner: Partner) => {
    setSelectedPartner(partner);
    setSelectedPmId(partner.pmIds ? partner.pmIds.map(id => id.toString()) : []);
    setDialogOpen(true);
  };

  const handleSavePm = async () => {
    if (!selectedPartner) return;

    try {
      setUpdating(true);

      await updatePartner(selectedPartner.id, {
        name: selectedPartner.name,
        businessNumber: selectedPartner.businessNumber,
        pmIds: selectedPmId.length === 0 ? undefined : selectedPmId.map(id => Number(id)),
      });

      // 로컬 상태 업데이트
      const selectedPmUsers = selectedPmId.length > 0
        ? users.filter(u => selectedPmId.includes(u.id.toString()))
        : [];

      setPartners(prev => prev.map(p =>
        p.id === selectedPartner.id
          ? {
              ...p,
              pmIds: selectedPmId.length === 0 ? undefined : selectedPmId.map(id => Number(id)),
              pmNames: selectedPmUsers.map(u => u.name)
            }
          : p
      ));

      setSnackbar({
        open: true,
        message: 'PM이 성공적으로 설정되었습니다.',
        severity: 'success',
      });

      setDialogOpen(false);
      setSelectedPartner(null);
      setSelectedPmId([]);

    } catch (error) {
      console.error('Failed to update PM:', error);
      setSnackbar({
        open: true,
        message: 'PM 설정에 실패했습니다.',
        severity: 'error',
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedPartner(null);
    setSelectedPmId([]);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleRemovePm = (userId: string) => {
    setSelectedPmId(prev => prev.filter(id => id !== userId));
  };

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
        <Typography variant={isMobile ? 'h5' : 'h4'}>파트너 관리</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/partners/new')}
          size={isMobile ? 'small' : 'medium'}
        >
          {isMobile ? '파트너 등록' : '파트너 등록'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* 모바일: 카드 뷰 */}
      {isMobile ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
          {loading ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <CircularProgress size={24} />
              <Typography sx={{ mt: 1 }}>로딩 중...</Typography>
            </Paper>
          ) : partners.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography>데이터가 없습니다.</Typography>
            </Paper>
          ) : (
            partners.map((partner) => (
              <Card
                key={partner.id}
                sx={{ cursor: 'pointer', width: '100%' }}
                onClick={() => navigate(`/partners/${partner.id}`)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                    <Typography variant="h6" component="div" sx={{ flex: 1, mr: 1 }}>
                      {partner.name}
                    </Typography>
                    <Chip
                      label={partner.isClosed ? '폐업' : '활성'}
                      color={partner.isClosed ? 'error' : 'success'}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    사업자번호: {partner.businessNumber}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    대표: {partner.ceoName || '-'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    담당자: {partner.managerName || '-'}
                  </Typography>
                </CardContent>
              </Card>
            ))
          )}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <TablePagination
              component="div"
              count={totalElements}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              labelRowsPerPage="페이지당:"
            />
          </Box>
        </Box>
      ) : (
        /* 데스크탑: 테이블 뷰 */
        <TableContainer component={Paper} sx={{ width: '100%' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>파트너명</TableCell>
                <TableCell>사업자번호</TableCell>
                <TableCell>대표</TableCell>
                <TableCell>담당자</TableCell>
                <TableCell>프로젝트 매니저</TableCell>
                <TableCell>상태</TableCell>
                <TableCell>등록일</TableCell>
                <TableCell>작업</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <CircularProgress size={24} />
                    <Typography sx={{ mt: 1 }}>로딩 중...</Typography>
                  </TableCell>
                </TableRow>
              ) : partners.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Typography>데이터가 없습니다.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                partners.map((partner) => (
                  <TableRow
                    key={partner.id}
                    hover
                    onClick={() => navigate(`/partners/${partner.id}`)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>{partner.id}</TableCell>
                    <TableCell>{partner.name}</TableCell>
                    <TableCell>{partner.businessNumber}</TableCell>
                    <TableCell>{partner.ceoName || '-'}</TableCell>
                    <TableCell>
                      {partner.managerName ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Person sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {partner.managerName}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          미지정
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {partner.pmNames && partner.pmNames.length > 0 ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Engineering sx={{ fontSize: 16, color: 'primary.main' }} />
                          <Box>
                            {partner.pmNames.map((name, index) => (
                              <Typography key={index} variant="body2" sx={{ fontWeight: 500 }}>
                                {name}{index < partner.pmNames!.length - 1 ? ', ' : ''}
                              </Typography>
                            ))}
                          </Box>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          미지정
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={partner.isClosed ? '폐업' : '활성'}
                        color={partner.isClosed ? 'error' : 'success'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{new Date(partner.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Engineering />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAssignPm(partner);
                        }}
                        sx={{ minWidth: 'auto' }}
                      >
                        PM 설정
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={totalElements}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage="페이지당 행 수:"
          />
        </TableContainer>
      )}

      {/* PM 설정 다이얼로그 */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Engineering />
            PM 설정 - {selectedPartner?.name}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              이 파트너의 프로젝트를 담당할 프로젝트 매니저를 선택하세요.
            </Typography>

            {/* PM 입력 필드 */}
            <Autocomplete
              fullWidth
              options={users.filter(user => !selectedPmId.includes(user.id.toString()))}
              getOptionLabel={(user) => `${user.name} (${user.email})`}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="프로젝트 매니저 추가"
                  placeholder="이름이나 이메일을 입력하세요"
                  helperText="프로젝트 매니저의 이름이나 이메일을 입력하여 선택하세요"
                />
              )}
              onChange={(_, selectedUser) => {
                if (selectedUser && !selectedPmId.includes(selectedUser.id.toString())) {
                  setSelectedPmId(prev => [...prev, selectedUser.id.toString()]);
                }
              }}
              renderOption={(props, user) => (
                <Box component="li" {...props} key={user.id}>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {user.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user.email}
                    </Typography>
                  </Box>
                </Box>
              )}
              sx={{ mb: 3 }}
            />

            {/* 등록된 PM 그리드 */}
            {selectedPmId.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  등록된 프로젝트 매니저
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>이름</TableCell>
                        <TableCell>이메일</TableCell>
                        <TableCell align="center" width={80}>작업</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedPmId.map((userId) => {
                        const user = users.find(u => u.id.toString() === userId);
                        return user ? (
                          <TableRow key={userId}>
                            <TableCell>{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell align="center">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleRemovePm(userId)}
                                sx={{ '&:hover': { backgroundColor: 'error.light', color: 'white' } }}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ) : null;
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {selectedPmId.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                <Engineering sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                <Typography>등록된 프로젝트 매니저가 없습니다.</Typography>
                <Typography variant="body2">위에서 프로젝트 매니저를 선택하여 추가하세요.</Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={updating}>
            취소
          </Button>
          <Button
            onClick={handleSavePm}
            variant="contained"
            disabled={updating}
            startIcon={updating ? <CircularProgress size={16} /> : <Engineering />}
          >
            {updating ? '저장 중...' : '저장'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 스낵바 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PartnerListPage;
