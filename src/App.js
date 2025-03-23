// src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Container, Box } from '@mui/material';
import NavBar from './components/NavBar';
import PatientDashboard from './components/PatientDashboard';
import ClinicianDashboard from './components/ClinicianDashboard';
import AccountabilityBuddy from './components/AccountabilityBuddy';

function App() {
  return (
    <>
      <NavBar />
      <Container sx={{ marginTop: 4 }}>
        <Box>
          <Routes>
            <Route path="/" element={<PatientDashboard />} />
            <Route path="/clinician" element={<ClinicianDashboard />} />
            <Route path="/buddies" element={<AccountabilityBuddy />} />
          </Routes>
        </Box>
      </Container>
    </>
  );
}

export default App;

