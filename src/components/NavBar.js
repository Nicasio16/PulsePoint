// src/components/NavBar.js
import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

function NavBar() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          PulsePoint
        </Typography>
        <Button color="inherit" component={RouterLink} to="/">
          Patient View
        </Button>
        <Button color="inherit" component={RouterLink} to="/clinician">
          Clinician View
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export default NavBar;
