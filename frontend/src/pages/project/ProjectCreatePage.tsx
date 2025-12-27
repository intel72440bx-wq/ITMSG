import React, { useState, useEffect, useCallback } from 'react';
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
import { Save, ArrowBack } from '@mui/icons-material';
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
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  // 기본 폼 데이터
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    projectType: 'SI' as ProjectType,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    description: '',
    budget: '',
    companyId: '',
    pmId: '',
  });

  // 데이터 로딩
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        console.log('Fetching companies, partners, and users for project creation...');

        const [companiesRes, partnersRes, usersRes] = await Promise.allSettled([
          getCompanies(),
          getPartnersForCompanySelection(),
          getUsers()
        ]);

        // 회사 데이터 처리
        if (companiesRes.status === 'fulfilled') {
          const companiesData = companiesRes.value;
          const companiesArray = Array.isArray(companiesData) ? companiesData : [];
          setCompanies(companiesArray);
          console.log('Companies loaded:', companiesArray.length);
        } else {
          console.error('Failed to load companies:', companiesRes.reason);
          setCompanies([]);
        }

        // 파트너 데이터 처리
        if (partnersRes.status === 'fulfilled') {
          const partnersData = partnersRes.value;
          const partnersArray = Array.isArray(partnersData) ? partnersData : [];
          setPartners(partnersArray);
          console.log('Partners loaded:', partnersArray.length);
          if (partnersArray.length > 0) {
            console.log('Sample partner:', partnersArray[0]);
          }
        } else {
          console.error('Failed to load partners:', partnersRes.reason);
          setPartners([]);
        }

        // 사용자 데이터 처리
        if (usersRes.status === 'fulfilled') {
          const usersData = usersRes.value?.content;
          const usersArray = Array.isArray(usersData) ? usersData : [];
          setUsers(usersArray);
          console.log('Users loaded:', usersArray.length);
        } else {
          console.error('Failed to load users:', usersRes.reason);
          setUsers([]);
        }

        console.log('All initial data loading completed');
      } catch (err) {
        console.error('Unexpected error during data loading:', err);
      }
    };

    fetchInitialData();
  }, []);

  // 회사/파트너 선택 시 PM 목록 필터링 및 자동 설정
  useEffect(() => {
    if (formData.companyId && Array.isArray(users) && Array.isArray(partners)) {
      const selectedCompanyId = parseInt(formData.companyId);
      const selectedPartner = partners.find(partner => partner && partner.id === selectedCompanyId);

      if (selectedPartner) {
        // 파트너 선택 시 해당 파트너의 PM들을 자동으로 설정
        if (selectedPartner.pmIds && selectedPartner.pmIds.length > 0) {
          // 첫 번째 PM을 자동 선택
          setFormData(prev => ({
            ...prev,
            pmId: selectedPartner.pmIds![0].toString()
          }));
        }

        // PM 목록은 모든 사용자로 설정 (파트너의 PM들도 포함)
        setFilteredUsers(users);
      } else {
        // 회사 선택 시 해당 회사의 사용자들만 필터링
        const filtered = users.filter(user => user && user.companyId === selectedCompanyId);
        setFilteredUsers(filtered);
      }
    } else {
      setFilteredUsers(Array.isArray(users) ? users : []);
    }
  }, [formData.companyId, users, partners]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.code.trim()) {
      return '프로젝트 코드를 입력해주세요.';
    }
    if (!formData.name.trim()) {
      return '프로젝트명을 입력해주세요.';
    }
    if (!formData.startDate) {
      return '시작일을 선택해주세요.';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const requestData: ProjectRequest = {
        ...formData,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        companyId: formData.companyId ? parseInt(formData.companyId) : undefined,
        pmId: formData.pmId ? parseInt(formData.pmId) : undefined,
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

  return (
    <Box sx={{ width: '100%', height: '100%', p: 3 }}>
      <Typography variant="h4" gutterBottom>
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

      <Paper sx={{ p: 3, mt: 2 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="프로젝트 코드"
            fullWidth
            margin="normal"
            value={formData.code}
            onChange={(e) => handleInputChange('code', e.target.value)}
            required
          />

          <TextField
            label="프로젝트명"
            fullWidth
            margin="normal"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
          />

          <TextField
            select
            label="프로젝트 유형"
            fullWidth
            margin="normal"
            value={formData.projectType}
            onChange={(e) => handleInputChange('projectType', e.target.value)}
            required
          >
            <MenuItem value="SI">SI (시스템 통합)</MenuItem>
            <MenuItem value="SM">SM (시스템 유지보수)</MenuItem>
          </TextField>

          <TextField
            label="프로젝트 설명"
            fullWidth
            margin="normal"
            multiline
            rows={4}
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
          />

          <TextField
            label="시작일"
            type="date"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={formData.startDate}
            onChange={(e) => handleInputChange('startDate', e.target.value)}
            required
          />

          <TextField
            label="종료일(예정)"
            type="date"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={formData.endDate}
            onChange={(e) => handleInputChange('endDate', e.target.value)}
          />

          <TextField
            select
            label="회사/파트너"
            fullWidth
            margin="normal"
            value={formData.companyId}
            onChange={(e) => handleInputChange('companyId', e.target.value)}
            helperText="프로젝트를 수행할 회사 또는 파트너를 선택하세요."
          >
            <MenuItem value="">
              <em>선택 안함</em>
            </MenuItem>
            {Array.isArray(companies) && companies.map((company) => (
              <MenuItem key={`company-${company.id}`} value={company.id}>
                🏢 {company.name}
              </MenuItem>
            ))}
            {Array.isArray(partners) && partners.map((partner) => (
              <MenuItem key={`partner-${partner.id}`} value={partner.id}>
                🤝 {partner.name}
                {partner.ceoName && ` (${partner.ceoName})`}
                {partner.managerName && ` - 담당: ${partner.managerName}`}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="프로젝트 매니저 (PM)"
            fullWidth
            margin="normal"
            value={formData.pmId}
            onChange={(e) => handleInputChange('pmId', e.target.value)}
            helperText="프로젝트를 담당할 매니저를 선택하세요 (선택사항)"
          >
            <MenuItem value="">
              <em>선택 안함</em>
            </MenuItem>
            {Array.isArray(filteredUsers) && filteredUsers.map((user) => (
              <MenuItem key={user.id} value={user.id}>
                {user.name} ({user.email})
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="예산 (원)"
            type="number"
            fullWidth
            margin="normal"
            value={formData.budget}
            onChange={(e) => handleInputChange('budget', e.target.value)}
            helperText="프로젝트 예산을 입력하세요 (선택사항)"
          />

          <Box sx={{
            display: 'flex',
            gap: 2,
            mt: 3,
            justifyContent: 'flex-end',
          }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/projects')}
              startIcon={<ArrowBack />}
              size={isMobile ? 'small' : 'medium'}
            >
              목록으로
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <Save />}
              disabled={loading}
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
