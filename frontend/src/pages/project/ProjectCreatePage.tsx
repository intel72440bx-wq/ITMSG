import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  MenuItem,
  Alert,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { createProject, getCompanies, getPartnersForCompanySelection } from '../../api/project';
import { getUsers, type User } from '../../api/user';
import type { ProjectRequest, Company, ProjectType } from '../../types/project.types';
import type { Partner } from '../../types/partner.types';

interface ProjectFormData {
  code: string;
  name: string;
  projectType: ProjectType;
  startDate: string;
  endDate?: string;
  companyId?: number;
  description?: string;
  budget?: string;
  pmId?: number;
}

const ProjectCreatePage: React.FC = () => {
  console.log('ProjectCreatePage rendering...');
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // 안전한 날짜 생성 함수
  const getDefaultStartDate = (): string => {
    try {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (e) {
      console.error('Failed to generate default start date:', e);
      return '';
    }
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ProjectFormData>({
    defaultValues: {
      code: '',
      name: '',
      description: '',
      projectType: 'SI' as ProjectType,
      startDate: getDefaultStartDate(),
      endDate: '',
      companyId: undefined,
      pmId: undefined,
      budget: '',
    },
  });

  const selectedCompanyId = watch('companyId');

  useEffect(() => {
    const fetchInitialData = async () => {
      setDataLoading(true);
      try {
        console.log('Fetching initial data...');
        await Promise.allSettled([
          fetchCompanies(),
          fetchPartners(),
          fetchUsers()
        ]);
        console.log('Initial data fetching completed');
      } catch (err: any) {
        console.error('Failed to fetch initial data:', err);
        // 개별 API 실패는 각 함수에서 처리하므로 여기서는 추가 처리 불필요
      } finally {
        setDataLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // 회사 선택 시 PM 목록 필터링
  useEffect(() => {
    if (selectedCompanyId) {
      // 파트너 ID인지 회사 ID인지 확인 (파트너는 partners 배열에 있음)
      const isPartnerSelected = (partners || []).some(partner => partner && partner.id === selectedCompanyId);

      if (isPartnerSelected) {
        // 파트너 선택 시 모든 사용자 표시 (또는 파트너 담당자 등으로 필터링 가능)
        setFilteredUsers(users || []);
      } else {
        // 회사 선택 시 해당 회사의 사용자만 필터링
        const filtered = (users || []).filter(user => user && user.companyId === selectedCompanyId);
        setFilteredUsers(filtered);
      }
    } else {
      // 회사 선택 안함 시 모든 사용자 표시
      setFilteredUsers(users || []);
    }
  }, [selectedCompanyId, users, partners]);

  const fetchCompanies = async () => {
    try {
      console.log('Fetching companies...');
      const companies = await getCompanies();
      setCompanies(companies || []);
      console.log('Companies fetched:', companies?.length || 0);
    } catch (err: any) {
      console.error('Failed to fetch companies:', err);
      setCompanies([]); // API 실패 시 빈 배열로 설정
      // 에러를 throw하지 않고 처리하여 Promise.allSettled가 계속 진행되도록 함
    }
  };

  const fetchPartners = async () => {
    try {
      console.log('Fetching partners...');
      const partners = await getPartnersForCompanySelection();
      setPartners(partners || []);
      console.log('Partners fetched:', partners?.length || 0);
    } catch (err: any) {
      console.error('Failed to fetch partners:', err);
      setPartners([]); // API 실패 시 빈 배열로 설정
    }
  };

  const fetchUsers = async () => {
    try {
      console.log('Fetching users...');
      const response = await getUsers();
      setUsers(response.content || []);
      console.log('Users fetched:', response.content?.length || 0);
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
      setUsers([]); // API 실패 시 빈 배열로 설정
    }
  };

  const onSubmit = async (data: ProjectFormData) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const requestData: ProjectRequest = {
        ...data,
        budget: data.budget ? parseFloat(data.budget) : undefined,
      };

      await createProject(requestData);
      setSuccess('프로젝트가 성공적으로 등록되었습니다.');

      // 2초 후 목록으로 이동
      setTimeout(() => {
        navigate('/projects');
      }, 2000);
    } catch (err: any) {
      console.error('Failed to create project:', err);
      setError(err.response?.data?.message || '프로젝트 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 데이터 로딩 중일 때는 로딩 화면 표시
  if (dataLoading) {
    return (
      <Box sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px'
      }}>
        <CircularProgress size={60} sx={{ mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          데이터를 불러오는 중...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Typography variant={isMobile ? 'h5' : 'h4'} gutterBottom>
        프로젝트 등록
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Paper sx={{ p: { xs: 2, sm: 3 }, mt: 2, width: '100%' }}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%' }}>
          <Controller
            name="code"
            control={control}
            rules={{ required: '프로젝트 코드는 필수입니다.' }}
            render={({ field }) => (
              <TextField
                {...field}
                label="프로젝트 코드"
                fullWidth
                margin="normal"
                error={!!errors.code}
                helperText={errors.code?.message}
                required
              />
            )}
          />

          <Controller
            name="name"
            control={control}
            rules={{ required: '프로젝트명은 필수입니다.' }}
            render={({ field }) => (
              <TextField
                {...field}
                label="프로젝트명"
                fullWidth
                margin="normal"
                error={!!errors.name}
                helperText={errors.name?.message}
                required
              />
            )}
          />

          <Controller
            name="projectType"
            control={control}
            rules={{ required: '프로젝트 유형은 필수입니다.' }}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="프로젝트 유형"
                fullWidth
                margin="normal"
                error={!!errors.projectType}
                helperText={errors.projectType?.message}
                required
              >
                <MenuItem value="SI">SI (시스템 통합)</MenuItem>
                <MenuItem value="SM">SM (시스템 유지보수)</MenuItem>
              </TextField>
            )}
          />

          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="프로젝트 설명"
                fullWidth
                margin="normal"
                multiline
                rows={4}
              />
            )}
          />

          <Controller
            name="startDate"
            control={control}
            rules={{ required: '시작일은 필수입니다.' }}
            render={({ field }) => (
              <TextField
                {...field}
                label="시작일"
                type="date"
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
                error={!!errors.startDate}
                helperText={errors.startDate?.message}
                required
              />
            )}
          />

          <Controller
            name="endDate"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="종료일(예정)"
                type="date"
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            )}
          />

          <Controller
            name="companyId"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="회사"
                fullWidth
                margin="normal"
                helperText="선택하지 않으면 현재 로그인한 사용자의 소속 회사로 등록됩니다."
              >
                <MenuItem value="">
                  <em>기본 회사 사용</em>
                </MenuItem>
                {(companies || []).filter(company => company && company.id).map((company) => (
                  <MenuItem key={`company-${company.id}`} value={company.id}>
                    {company.name}
                  </MenuItem>
                ))}
                {(partners || []).filter(partner => partner && partner.id).map((partner) => (
                  <MenuItem key={`partner-${partner.id}`} value={partner.id}>
                    [파트너] {partner.name}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          <Controller
            name="budget"
            control={control}
            rules={{
              min: { value: 0, message: '예산은 0 이상이어야 합니다.' }
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="예산 (원)"
                type="number"
                fullWidth
                margin="normal"
                InputProps={{ inputProps: { min: 0 } }}
                helperText="프로젝트 예산을 입력하세요 (선택사항)"
              />
            )}
          />

          <Controller
            name="pmId"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="프로젝트 매니저 (PM)"
                fullWidth
                margin="normal"
                helperText="프로젝트를 담당할 매니저를 선택하세요 (선택사항)"
              >
                <MenuItem value="">
                  <em>선택 안함</em>
                </MenuItem>
                {(filteredUsers || []).filter(user => user && user.id).map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          <Box sx={{
            display: 'flex', 
            gap: 2, 
            mt: 3, 
            justifyContent: 'flex-end',
            flexDirection: { xs: 'column', sm: 'row' },
          }}>
            <Button
              variant="outlined"
              startIcon={isMobile ? null : <Cancel />}
              onClick={() => navigate('/projects')}
              disabled={loading}
              fullWidth={isMobile}
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : (isMobile ? null : <Save />)}
              disabled={loading}
              fullWidth={isMobile}
            >
              {loading ? '저장 중...' : '저장'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default ProjectCreatePage;
