import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Box,
  Typography,
} from '@mui/material';
import {
  Dashboard,
  FolderOpen,
  Description,
  Assignment,
  CheckCircle,
  BugReport,
  Rocket,
  Warning,
  Business,
  Computer,
  People,
  Engineering,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const DRAWER_WIDTH = 240;

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  isMobile: boolean;
}

const menuItems = [
  { text: '대시보드', icon: <Dashboard />, path: '/dashboard' },
  { text: '프로젝트', icon: <FolderOpen />, path: '/projects' },
  { text: 'SR 관리', icon: <Description />, path: '/srs' },
  { text: 'SPEC 관리', icon: <Assignment />, path: '/specs' },
  { text: '승인 관리', icon: <CheckCircle />, path: '/approvals' },
  { text: '이슈 관리', icon: <BugReport />, path: '/issues' },
  { text: '릴리즈', icon: <Rocket />, path: '/releases' },
  { text: '장애 관리', icon: <Warning />, path: '/incidents' },
  { text: '파트너', icon: <Business />, path: '/partners' },
  { text: '자산 관리', icon: <Computer />, path: '/assets' },
  { text: '사용자 관리', icon: <People />, path: '/users' },
];

const Sidebar: React.FC<SidebarProps> = ({ open, onClose, isMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const isAdmin = user?.roles?.includes('ADMIN') || false;
  const isSystemAdmin = user?.roles?.some(role => role === 'ROLE_SYSTEM_ADMIN' || role === 'SYSTEM_ADMIN') || false;

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  const drawerContent = (
    <>
      <Toolbar sx={{ px: 3, py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              fontWeight: 800,
              fontSize: '1.5rem',
              letterSpacing: '-0.025em',
              background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
            }}
          >
            ITMSG
          </Typography>
        </Box>
      </Toolbar>
      <Divider sx={{ borderColor: 'rgba(30, 64, 175, 0.12)', borderWidth: '1px' }} />

      {/* 메뉴 그룹: 주요 업무 */}
      <Box sx={{ px: 2, py: 1 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          주요 업무
        </Typography>
      </Box>

      <List sx={{ px: 1, pb: 2 }}>
        {menuItems.slice(0, 5).map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigate(item.path)}
              sx={{
                borderRadius: 2,
                mx: 0.5,
                px: 2,
                py: 1.5,
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  boxShadow: '0 2px 8px rgba(25, 118, 210, 0.25)',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
                '&:hover': {
                  backgroundColor: location.pathname === item.path ? 'primary.dark' : 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: location.pathname === item.path ? 'white' : 'text.secondary',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: '0.95rem',
                  fontWeight: location.pathname === item.path ? 600 : 500,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ borderColor: 'rgba(0, 0, 0, 0.08)' }} />

      {/* 메뉴 그룹: 시스템 관리 */}
      <Box sx={{ px: 2, py: 1 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          시스템 관리
        </Typography>
      </Box>

      <List sx={{ px: 1, pb: 2 }}>
        {menuItems.slice(5).map((item) => {
          // 사용자 관리 메뉴는 SYSTEM_ADMIN 권한이 있는 경우에만 표시
          if (item.path === '/users' && !isSystemAdmin) {
            return null;
          }

          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => handleNavigate(item.path)}
                sx={{
                  borderRadius: 2,
                  mx: 0.5,
                  px: 2,
                  py: 1.5,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    boxShadow: '0 2px 8px rgba(25, 118, 210, 0.25)',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                  '&:hover': {
                    backgroundColor: location.pathname === item.path ? 'primary.dark' : 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: location.pathname === item.path ? 'white' : 'text.secondary',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.95rem',
                    fontWeight: location.pathname === item.path ? 600 : 500,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </>
  );

  return (
    <>
      {/* Mobile Drawer (Temporary) */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={open}
          onClose={onClose}
          ModalProps={{
            keepMounted: true, // Better mobile performance
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        /* Desktop Drawer (Permanent) */
        <Drawer
          variant="permanent"
          open={open}
          sx={{
            display: { xs: 'none', md: 'block' },
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
};

export default Sidebar;
