// src/components/ClinicianDashboard.js
import React, { useState, useEffect } from 'react';
import { Typography, Paper, Box, Button, Fade, useTheme, CircularProgress, Snackbar, Alert } from '@mui/material';

function ClinicianDashboard() {
  const [heartRate, setHeartRate] = useState(70);
  const [alert, setAlert] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState(new Date().toLocaleTimeString());
  const [elevatedStartTime, setElevatedStartTime] = useState(null);
  const [notificationSent, setNotificationSent] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [timeScale] = useState(360); // 1 second = 6 minutes for demonstration
  const theme = useTheme();
  const patientName = "John Doe";

  // Mock function to receive notifications (in a real app, this would be a WebSocket or polling)
  const checkForNotifications = async () => {
    // In a real implementation, this would check your backend for new notifications
    console.log('Checking for notifications...');
  };

  // Simulate more realistic heart rate changes
  const getNextHeartRate = (currentRate) => {
    // Add small random variations (-2 to +2)
    const baseChange = Math.floor(Math.random() * 5) - 2;
    
    // Simulate withdrawal pattern after 3 "hours" (30 seconds in demo time)
    const simulatedHours = (Date.now() - new Date().setHours(0,0,0,0)) / (1000 * timeScale);
    if (simulatedHours % 3 < 1) { // During first "hour" of each 3-hour cycle
      return Math.min(140, currentRate + Math.abs(baseChange) + 2); // Tendency to increase
    }
    
    return Math.max(60, Math.min(140, currentRate + baseChange));
  };

  // Convert demo time to real time for display
  const formatDemoTime = (milliseconds) => {
    const demoHours = milliseconds / (1000 * timeScale);
    const hours = Math.floor(demoHours);
    const minutes = Math.floor((demoHours - hours) * 60);
    return `${hours}h ${minutes}m`;
  };

  // Simulate heart rate data and check for potential withdrawal symptoms
  useEffect(() => {
    const interval = setInterval(() => {
      const newRate = getNextHeartRate(heartRate);
      setHeartRate(newRate);
      setLastCheckTime(new Date().toLocaleTimeString());
      
      const isElevated = newRate > 120;
      setAlert(isElevated);

      // Track duration of elevated heart rate
      if (isElevated && !elevatedStartTime) {
        setElevatedStartTime(new Date());
        const notification = {
          id: Date.now(),
          type: 'warning',
          message: `${patientName}'s heart rate becoming elevated - monitoring for withdrawal symptoms`,
          timestamp: new Date().toLocaleString(),
          severity: 'warning'
        };
        setNotifications(prev => [...prev, notification]);
      } else if (!isElevated && elevatedStartTime) {
        const duration = formatDemoTime(new Date() - elevatedStartTime);
        const notification = {
          id: Date.now(),
          type: 'info',
          message: `${patientName}'s heart rate returned to normal after ${duration} of elevation`,
          timestamp: new Date().toLocaleString(),
          severity: 'info'
        };
        setNotifications(prev => [...prev, notification]);
        setElevatedStartTime(null);
        setNotificationSent(false);
      }

      // Check if heart rate has been elevated for 6 hours and notification hasn't been sent
      if (elevatedStartTime && !notificationSent) {
        const hoursElapsed = (new Date() - elevatedStartTime) / (1000 * timeScale);
        if (hoursElapsed >= 6) {
          setNotificationSent(true);
          const notification = {
            id: Date.now(),
            type: 'emergency',
            message: `URGENT: ${patientName}'s heart rate has been elevated for 6 hours - possible withdrawal symptoms`,
            timestamp: new Date().toLocaleString(),
            severity: 'error'
          };
          setNotifications(prev => [...prev, notification]);
          setSnackbarMessage(notification.message);
          setSnackbarOpen(true);
        } else if (hoursElapsed >= 4 && !notificationSent) {
          // Warning at 4 hours
          const notification = {
            id: Date.now(),
            type: 'warning',
            message: `Warning: ${patientName}'s heart rate has been elevated for 4 hours`,
            timestamp: new Date().toLocaleString(),
            severity: 'warning'
          };
          setNotifications(prev => [...prev, notification]);
        }
      }
    }, 1000); // Update every second (represents 6 minutes in demo time)
    return () => clearInterval(interval);
  }, [heartRate, elevatedStartTime, notificationSent, timeScale, patientName]);

  // Check for new notifications periodically
  useEffect(() => {
    const notificationInterval = setInterval(() => {
      checkForNotifications();
    }, 30000); // Check every 30 seconds
    return () => clearInterval(notificationInterval);
  }, []);

  // Handle medication confirmation from patient
  useEffect(() => {
    // This would normally be handled through WebSocket or polling
    const handleMedicationConfirmation = () => {
      const notification = {
        id: Date.now(),
        type: 'success',
        message: `${patientName} has confirmed taking their medication`,
        timestamp: new Date().toLocaleString(),
        severity: 'success'
      };
      setNotifications(prev => [...prev, notification]);
      // Reset monitoring state
      setElevatedStartTime(null);
      setNotificationSent(false);
      setAlert(false);
      setHeartRate(75);
    };
    // In a real app, this would be connected to a WebSocket or polling system
  }, [patientName]);

  const handleAcknowledgeAlert = async () => {
    const notification = {
      id: Date.now(),
      type: 'acknowledgment',
      message: `Alert acknowledged - contacting ${patientName}`,
      timestamp: new Date().toLocaleString(),
      severity: 'info'
    };
    setNotifications(prev => [...prev, notification]);
    setSnackbarMessage(`Alert acknowledged. Please contact ${patientName} immediately.`);
    setSnackbarOpen(true);
  };

  const getHeartRateStatus = () => {
    if (heartRate > 120) {
      const duration = elevatedStartTime ? formatDemoTime(new Date() - elevatedStartTime) : '0h 0m';
      return {
        message: `Patient's heart rate is elevated - possible withdrawal symptoms (${duration})`,
        color: '#FF4D4D',
        severity: "warning",
        icon: '⚠️'
      };
    } else if (heartRate > 100) {
      return {
        message: "Patient's heart rate is slightly elevated - monitor closely",
        color: '#FFB020',
        severity: "monitor",
        icon: '⚡'
      };
    } else {
      return {
        message: "Patient's heart rate is normal",
        color: '#4CAF50',
        severity: "normal",
        icon: '✅'
      };
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const status = getHeartRateStatus();

  return (
    <Box sx={{ 
      maxWidth: 1200, 
      margin: '0 auto', 
      p: { xs: 2, md: 4 },
      minHeight: '100vh',
      background: 'linear-gradient(145deg, #f8fafc, #f1f5f9)'
    }}>
      <Typography variant="h4" gutterBottom sx={{ 
        fontWeight: 800,
        background: 'linear-gradient(45deg, #1a365d, #2563eb)',
        backgroundClip: 'text',
        color: 'transparent',
        mb: 4,
        textAlign: { xs: 'center', md: 'left' }
      }}>
        Clinician Dashboard
      </Typography>

      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' } }}>
        <Fade in={true}>
          <Paper elevation={0} sx={{ 
            p: 4, 
            borderRadius: 4,
            background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
            border: '1px solid rgba(230, 232, 240, 0.5)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.03)',
            height: 'fit-content',
            backdropFilter: 'blur(20px)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #2563eb, #4CAF50)',
              opacity: 0.7
            }
          }}>
            <Box sx={{ 
              display: 'flex',
              alignItems: 'center',
              mb: 4,
              gap: 2
            }}>
              <Box 
                sx={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: '50%',
                  background: 'linear-gradient(45deg, #1a365d, #2563eb)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.5rem',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
                }}
              >
                👤
              </Box>
              <Typography variant="h5" sx={{ 
                fontWeight: 600,
                background: 'linear-gradient(45deg, #1a365d, #2563eb)',
                backgroundClip: 'text',
                color: 'transparent'
              }}>
                {patientName}
              </Typography>
            </Box>

            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              position: 'relative'
            }}>
              <Box sx={{ 
                position: 'relative',
                width: 180,
                height: 180,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3
              }}>
                <CircularProgress
                  variant="determinate"
                  value={100}
                  size={180}
                  thickness={3}
                  sx={{ color: 'rgba(0,0,0,0.05)', position: 'absolute' }}
                />
                <CircularProgress
                  variant="determinate"
                  value={(heartRate / 200) * 100}
                  size={180}
                  thickness={3}
                  sx={{ 
                    color: status.color,
                    position: 'absolute',
                    animation: alert ? 'pulse 1.5s ease-in-out infinite' : 'none',
                    '@keyframes pulse': {
                      '0%': { transform: 'scale(1)' },
                      '50%': { transform: 'scale(1.02)' },
                      '100%': { transform: 'scale(1)' }
                    }
                  }}
                />
                <Box sx={{ 
                  position: 'absolute', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  transform: 'scale(1.2)',
                  width: '100%',
                  height: '100%',
                  justifyContent: 'center'
                }}>
                  <Typography 
                    component="div" 
                    sx={{ 
                      fontSize: '3rem',
                      lineHeight: 1,
                      mb: 1,
                      color: status.color,
                      animation: alert ? 'beat 1s ease-in-out infinite' : 'none',
                      filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))',
                      '@keyframes beat': {
                        '0%': {
                          transform: 'scale(1)',
                          opacity: 0.9
                        },
                        '50%': {
                          transform: 'scale(1.1)',
                          opacity: 1
                        },
                        '100%': {
                          transform: 'scale(1)',
                          opacity: 0.9
                        }
                      }
                    }}
                  >
                    ❤️
                  </Typography>
                  <Typography variant="h3" sx={{ 
                    fontWeight: 'bold', 
                    color: status.color,
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    lineHeight: 1,
                    mb: 1
                  }}>
                    {heartRate}
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: '#64748b',
                    fontWeight: 'medium'
                  }}>
                    BPM
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                mb: 3,
                mt: 2,
                p: 2.5,
                borderRadius: 3,
                backgroundColor: `${status.color}10`,
                width: '100%',
                justifyContent: 'center',
                border: `1px solid ${status.color}20`,
                backdropFilter: 'blur(8px)'
              }}>
                <Typography 
                  sx={{ 
                    fontSize: '1.5rem',
                    lineHeight: 1,
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.05))'
                  }}
                >
                  {status.icon}
                </Typography>
                <Typography variant="body1" sx={{ 
                  color: status.color, 
                  fontWeight: 600,
                  flex: 1,
                  textAlign: 'center'
                }}>
                  {status.message}
                </Typography>
              </Box>

              <Typography variant="body2" sx={{ 
                color: '#64748b',
                textAlign: 'center',
                fontWeight: 'medium'
              }}>
                Last updated: {lastCheckTime}
              </Typography>

              {elevatedStartTime && (
                <Typography variant="body1" sx={{ 
                  color: '#FF4D4D',
                  mt: 2,
                  fontWeight: 'medium',
                  textAlign: 'center',
                  p: 1.5,
                  borderRadius: 2,
                  backgroundColor: 'rgba(255, 77, 77, 0.1)',
                  border: '1px solid rgba(255, 77, 77, 0.2)'
                }}>
                  ⏱️ Elevated for: {formatDemoTime(new Date() - elevatedStartTime)}
                </Typography>
              )}
            </Box>
          </Paper>
        </Fade>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {notifications.length > 0 && (
            <Fade in={true}>
              <Paper elevation={0} sx={{ 
                p: 4,
                borderRadius: 4,
                background: 'rgba(255, 77, 77, 0.05)',
                border: '1px solid rgba(255, 77, 77, 0.1)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.03)',
                backdropFilter: 'blur(20px)'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Typography sx={{ fontSize: '2rem' }}>🔔</Typography>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 700,
                    background: 'linear-gradient(45deg, #991b1b, #dc2626)',
                    backgroundClip: 'text',
                    color: 'transparent'
                  }}>
                    Recent Alerts
                  </Typography>
                </Box>
                <Box sx={{ 
                  maxHeight: 400, 
                  overflowY: 'auto',
                  pr: 1,
                  mr: -1,
                  '&::-webkit-scrollbar': {
                    width: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'transparent',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: 'rgba(255, 77, 77, 0.2)',
                    borderRadius: '4px',
                  },
                  '&::-webkit-scrollbar-thumb:hover': {
                    background: 'rgba(255, 77, 77, 0.3)',
                  }
                }}>
                  {notifications.map(notification => (
                    <Box key={notification.id} sx={{ 
                      p: 2.5, 
                      mb: 2, 
                      backgroundColor: 'white',
                      borderRadius: 3,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                      border: '1px solid rgba(230, 232, 240, 0.5)',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                      }
                    }}>
                      <Typography variant="caption" sx={{ 
                        color: '#64748b',
                        display: 'block',
                        mb: 1
                      }}>
                        {notification.timestamp}
                      </Typography>
                      <Typography variant="body2" sx={{
                        color: notification.severity === 'error' ? '#FF4D4D' :
                               notification.severity === 'warning' ? '#FFB020' :
                               notification.severity === 'success' ? '#4CAF50' : '#64748b',
                        fontWeight: 600
                      }}>
                        {notification.message}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Fade>
          )}

          {alert && (
            <Fade in={true}>
              <Button 
                variant="contained" 
                color="error" 
                onClick={handleAcknowledgeAlert}
                fullWidth
                sx={{ 
                  p: 2.5,
                  borderRadius: 3,
                  textTransform: 'none',
                  background: 'linear-gradient(45deg, #991b1b, #dc2626)',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.2)',
                  fontSize: '1.1rem',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(220, 38, 38, 0.3)',
                    background: 'linear-gradient(45deg, #b91c1c, #ef4444)'
                  }
                }}
              >
                🚨 Acknowledge Alert & Contact Patient
              </Button>
            </Fade>
          )}
        </Box>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity="info" 
          sx={{ 
            width: '100%',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            borderRadius: 3,
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ClinicianDashboard;

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
