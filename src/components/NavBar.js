// src/components/NavBar.js
import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

function NavBar() {
  return (
    <AppBar position="static" sx={{ 
      background: 'linear-gradient(145deg, #1a237e, #0d47a1)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ 
          flexGrow: 1,
          fontWeight: 'bold',
          background: 'linear-gradient(45deg, #fff, #e3f2fd)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          PulsePoint
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/"
            sx={{
              '&:hover': {
                background: 'rgba(255,255,255,0.1)',
                transform: 'translateY(-1px)'
              }
            }}
          >
            Patient Dashboard
          </Button>
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/clinician"
            sx={{
              '&:hover': {
                background: 'rgba(255,255,255,0.1)',
                transform: 'translateY(-1px)'
              }
            }}
          >
            Clinician Dashboard
          </Button>
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/buddies"
            sx={{
              '&:hover': {
                background: 'rgba(255,255,255,0.1)',
                transform: 'translateY(-1px)'
              }
            }}
          >
            Accountability Buddies
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default NavBar;
