import React, { useState } from 'react';
import { Box, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

const MainLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleDrawerClose = () => {
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        width: '100vw',
        overflow: 'hidden',
        backgroundColor: '#f8fafc', // ITMS 시스템 배경색
      }}
    >
      <Header onMenuClick={handleDrawerToggle} />
      <Sidebar
        open={isMobile ? mobileOpen : true}
        onClose={handleDrawerClose}
        isMobile={isMobile}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 3, sm: 4, md: 5 },
          pt: { xs: 11, sm: 12 }, // 헤더 높이만큼 상단 패딩 추가
          width: '100%',
          minHeight: '100vh',
          maxHeight: '100vh',
          overflow: 'auto',
          backgroundColor: '#f8fafc',
          transition: 'padding 0.3s ease',
        }}
      >
        <Box
          sx={{
            width: '100%',
            height: '100%',
            maxWidth: '1400px', // ITMS 시스템 최대 너비 제한
            mx: 'auto',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
