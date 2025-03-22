// src/components/ClinicianDashboard.js
import React, { useState, useEffect } from 'react';
import { Typography, Paper, Box, Button } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function ClinicianDashboard() {
  const [heartData, setHeartData] = useState([]);
  const [alert, setAlert] = useState(false);
  const patientName = "John Doe";

  // Simulate heart rate data similar to PatientDashboard.
  useEffect(() => {
    let data = [];
    const interval = setInterval(() => {
      const newRate = Math.floor(Math.random() * 80) + 60;
      data.push({ time: data.length + 1, bpm: newRate });
      setHeartData([...data]);
      setAlert(newRate > 120);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleAcknowledgeAlert = () => {
    alert("Alert acknowledged. Please contact the patient.");
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Clinician Dashboard
      </Typography>
      <Paper sx={{ padding: 2, marginBottom: 2 }}>
        <Typography variant="h6">Patient: {patientName}</Typography>
        <Typography variant="body1">
          Latest Heart Rate: {heartData.length > 0 ? heartData[heartData.length - 1].bpm : "Loading..."} BPM
        </Typography>
        {alert && (
          <Typography variant="body1" color="error">
            ALERT: Patient has a high heart rate!
          </Typography>
        )}
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={heartData}>
            <XAxis dataKey="time" label={{ value: 'Time (s)', position: 'insideBottomRight', offset: -5 }} />
            <YAxis label={{ value: 'BPM', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Line type="monotone" dataKey="bpm" stroke="#82ca9d" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Paper>
      {alert && (
        <Button variant="contained" color="error" onClick={handleAcknowledgeAlert}>
          Acknowledge Alert & Call Patient
        </Button>
      )}
    </Box>
  );
}

export default ClinicianDashboard;
