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
        console.log('Fetching companies and partners...');
        const [companiesRes, partnersRes, usersRes] = await Promise.allSettled([
          getCompanies(),
          getPartnersForCompanySelection(),
          getUsers()
        ]);

        if (companiesRes.status === 'fulfilled') {
          setCompanies(companiesRes.value || []);
        }
        if (partnersRes.status === 'fulfilled') {
          setPartners(partnersRes.value || []);
        }
        if (usersRes.status === 'fulfilled') {
          setUsers(usersRes.value.content || []);
        }

        console.log('Initial data loaded successfully');
      } catch (err) {
        console.error('Failed to fetch initial data:', err);
      }
    };

    fetchInitialData();
  }, []);

  // 회사 선택 시 PM 목록 필터링
  useEffect(() => {
    if (formData.companyId) {
      const selectedCompanyId = parseInt(formData.companyId);
      const isPartnerSelected = partners.some(partner => partner.id === selectedCompanyId);

      if (isPartnerSelected) {
        setFilteredUsers(users);
      } else {
        const filtered = users.filter(user => user.companyId === selectedCompanyId);
        setFilteredUsers(filtered);
      }
    } else {
      setFilteredUsers(users);
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
            label="회사"
            fullWidth
            margin="normal"
            value={formData.companyId}
            onChange={(e) => handleInputChange('companyId', e.target.value)}
            helperText="선택하지 않으면 현재 로그인한 사용자의 소속 회사로 등록됩니다."
          >
            <MenuItem value="">
              <em>기본 회사 사용</em>
            </MenuItem>
            {companies.map((company) => (
              <MenuItem key={`company-${company.id}`} value={company.id}>
                {company.name}
              </MenuItem>
            ))}
            {partners.map((partner) => (
              <MenuItem key={`partner-${partner.id}`} value={partner.id}>
                [파트너] {partner.name}
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
            {filteredUsers.map((user) => (
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
              startIcon={<Cancel />}
              onClick={() => navigate('/projects')}
              disabled={loading}
            >
              취소
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
