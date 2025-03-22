// src/components/PatientDashboard.js
import React, { useState, useEffect } from 'react';
import { Typography, Paper, Button, Box } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function PatientDashboard() {
  const [heartRate, setHeartRate] = useState(70);
  const [heartData, setHeartData] = useState([]);
  const [alert, setAlert] = useState(false);

  // Simulate heart rate data from a hypothetical watch every 2 seconds.
  useEffect(() => {
    const interval = setInterval(() => {
      // Generate a random heart rate between 60 and 140 BPM.
      const newRate = Math.floor(Math.random() * 80) + 60;
      setHeartRate(newRate);
      setHeartData((prev) => [...prev, { time: prev.length + 1, bpm: newRate }]);
      // Trigger an alert if the heart rate exceeds 120 BPM.
      setAlert(newRate > 120);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleCheckIn = () => {
    alert("Check-in alert sent to your care provider!");
  };

  const handleTakeMedication = () => {
    alert("Medication confirmed as taken. Good job!");
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome, Patient
      </Typography>
      <Paper sx={{ padding: 2, marginBottom: 2 }}>
        <Typography variant="h6">Current Heart Rate: {heartRate} BPM</Typography>
        {alert && (
          <Typography variant="body1" color="error">
            Alert: Your heart rate is high!
          </Typography>
        )}
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={heartData}>
            <XAxis dataKey="time" label={{ value: 'Time (s)', position: 'insideBottomRight', offset: -5 }} />
            <YAxis label={{ value: 'BPM', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Line type="monotone" dataKey="bpm" stroke="#8884d8" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Paper>
      <Paper sx={{ padding: 2, marginBottom: 2 }}>
        <Typography variant="h6">Medication Reminder</Typography>
        <Typography variant="body1">
          It's time for your Suboxone dose. Please take your medication as prescribed.
        </Typography>
        <Button variant="contained" color="primary" onClick={handleTakeMedication} sx={{ marginTop: 1 }}>
          Confirm Medication Taken
        </Button>
      </Paper>
      <Paper sx={{ padding: 2 }}>
        <Typography variant="h6">Check-In</Typography>
        <Typography variant="body1">
          If you feel unwell, please check in to notify your care provider.
        </Typography>
        <Button variant="contained" color="secondary" onClick={handleCheckIn} sx={{ marginTop: 1 }}>
          Check-In Now
        </Button>
      </Paper>
    </Box>
  );
}

export default PatientDashboard;
