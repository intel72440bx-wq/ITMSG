import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import { Engineering, Person, Business } from '@mui/icons-material';
import { getPartners } from '../../api/partner';
import { getUsers } from '../../api/user';
import { updatePartner } from '../../api/partner';
import type { Partner, PartnerListParams } from '../../types/partner.types';
import type { User } from '../../types/auth.types';
import type { PageResponse } from '../../types/common.types';

const PartnerPmManagementPage: React.FC = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [selectedPmId, setSelectedPmId] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // 파트너 목록 조회 (폐업되지 않은 파트너만)
      const partnerParams: PartnerListParams = {
        isActive: true,
        page: 0,
        size: 100, // 충분한 크기로 설정
      };
      const partnerResponse = await getPartners(partnerParams);
      setPartners(partnerResponse.content);

      // 사용자 목록 조회 (PM으로 지정할 수 있는 사용자들)
      const userResponse = await getUsers({
        page: 0,
        size: 1000, // 모든 사용자 조회
      });
      setUsers(userResponse.content);

    } catch (error) {
      console.error('Failed to fetch data:', error);
      setSnackbar({
        open: true,
        message: '데이터 로드에 실패했습니다.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignPm = (partner: Partner) => {
    setSelectedPartner(partner);
    setSelectedPmId(partner.pmId ? partner.pmId.toString() : '');
    setDialogOpen(true);
  };

  const handleSavePm = async () => {
    if (!selectedPartner) return;

    try {
      setUpdating(true);

      await updatePartner(selectedPartner.id, {
        pmId: selectedPmId === '' ? undefined : Number(selectedPmId),
      });

      // 로컬 상태 업데이트
      setPartners(prev => prev.map(p =>
        p.id === selectedPartner.id
          ? {
              ...p,
              pmId: selectedPmId === '' ? undefined : Number(selectedPmId),
              pmName: selectedPmId === ''
                ? undefined
                : users.find(u => selectedPmId !== '' && u.id === Number(selectedPmId))?.name
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
      setSelectedPmId('');

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
    setSelectedPmId('');
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          파트너 PM 관리
        </Typography>
        <Typography variant="body1" color="text.secondary">
          파트너별로 프로젝트 매니저(PM)를 설정하고 관리할 수 있습니다.
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>파트너 코드</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>파트너명</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>사업자등록번호</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>담당 매니저</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>프로젝트 매니저(PM)</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>작업</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {partners.map((partner) => (
                  <TableRow key={partner.id} hover>
                    <TableCell>
                      <Chip
                        label={partner.code}
                        variant="outlined"
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>
                      {partner.name}
                    </TableCell>
                    <TableCell color="text.secondary">
                      {partner.businessNumber}
                    </TableCell>
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
                      {partner.pmName ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Engineering sx={{ fontSize: 16, color: 'primary.main' }} />
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {partner.pmName}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          미지정
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Engineering />}
                        onClick={() => handleAssignPm(partner)}
                        sx={{ minWidth: 'auto' }}
                      >
                        PM 설정
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {partners.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Business sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                등록된 파트너가 없습니다.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* PM 설정 다이얼로그 */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
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

            <FormControl fullWidth>
              <InputLabel>프로젝트 매니저</InputLabel>
              <Select
                value={selectedPmId}
                label="프로젝트 매니저"
                onChange={(e) => setSelectedPmId(e.target.value)}
              >
                <MenuItem value="">
                  <em>미지정</em>
                </MenuItem>
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id.toString()}>
                    {user.name} ({user.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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

export default PartnerPmManagementPage;
