// src/components/PatientDashboard.js
import React, { useState, useEffect } from 'react';
import { Typography, Paper, Button, Box, Fade, useTheme, CircularProgress, Snackbar, Alert } from '@mui/material';

function PatientDashboard() {
  const [heartRate, setHeartRate] = useState(70);
  const [alert, setAlert] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState(new Date().toLocaleTimeString());
  const [elevatedStartTime, setElevatedStartTime] = useState(null);
  const [notificationSent, setNotificationSent] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [timeScale] = useState(360); // 1 second = 6 minutes for demonstration
  const theme = useTheme();

  // Function to send notification to backend (mock implementation)
  const sendNotification = async (message, severity = 'info') => {
    // In a real implementation, this would make an API call to your backend
    console.log('Sending notification:', message, 'Severity:', severity);
    // Mock API call
    return new Promise(resolve => setTimeout(resolve, 1000));
  };

  // Simulate more realistic heart rate changes
  const getNextHeartRate = (currentRate) => {
    // Demo cycle every 15 seconds
    const cycleTime = Math.floor(Date.now() / 1000) % 15;
    
    // Different phases of the demo
    switch(cycleTime) {
      case 0:
      case 1:
      case 2:
        // Normal heart rate (60-80)
        return 70 + Math.floor(Math.random() * 10);
      case 3:
      case 4:
      case 5:
        // Slightly elevated (100-110)
        return 105 + Math.floor(Math.random() * 5);
      case 6:
      case 7:
      case 8:
        // High heart rate (125-135)
        return 130 + Math.floor(Math.random() * 5);
      case 9:
      case 10:
      case 11:
        // Coming down (90-100)
        return 95 + Math.floor(Math.random() * 5);
      default:
        // Back to normal (70-80)
        return 75 + Math.floor(Math.random() * 5);
    }
  };

  // Convert demo time to real time for display
  const formatDemoTime = (milliseconds) => {
    // Speed up time display for demo
    const demoHours = (milliseconds / (1000 * timeScale)) * 10; // 10x faster for demo
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
        sendNotification("Heart rate becoming elevated - monitoring for withdrawal symptoms", "warning");
      } else if (!isElevated && elevatedStartTime) {
        const duration = formatDemoTime(new Date() - elevatedStartTime);
        sendNotification(`Heart rate returned to normal after ${duration} of elevation`);
        setElevatedStartTime(null);
        setNotificationSent(false);
      }

      // Check if heart rate has been elevated for 6 hours and notification hasn't been sent
      if (elevatedStartTime && !notificationSent) {
        const hoursElapsed = (new Date() - elevatedStartTime) / (1000 * timeScale);
        if (hoursElapsed >= 6) {
          // Send notification
          sendNotification(
            "ALERT: Heart rate has been elevated for 6 hours - possible withdrawal symptoms",
            "error"
          ).then(() => {
            setNotificationSent(true);
            setSnackbarMessage("Medical alert sent to your care provider - they will contact you soon");
            setSnackbarOpen(true);
          });
        } else if (hoursElapsed >= 4 && !notificationSent) {
          // Warning at 4 hours
          sendNotification(
            "Warning: Heart rate has been elevated for 4 hours",
            "warning"
          );
        }
      }
    }, 1000); // Update every second (represents 6 minutes in demo time)
    return () => clearInterval(interval);
  }, [heartRate, elevatedStartTime, notificationSent, timeScale]);

  const handleCheckIn = async () => {
    await sendNotification("URGENT: Patient requested immediate check-in", "error");
    setSnackbarMessage("Emergency check-in alert sent to your care provider!");
    setSnackbarOpen(true);
  };

  const handleTakeMedication = async () => {
    await sendNotification("Patient confirmed medication taken", "success");
    setSnackbarMessage("Medication confirmed as taken. Good job!");
    setSnackbarOpen(true);
    // Reset timers and alerts
    setElevatedStartTime(null);
    setNotificationSent(false);
    setAlert(false);
    // Set heart rate to a normal value
    setHeartRate(75);
  };

  const getHeartRateStatus = () => {
    if (heartRate > 120) {
      const duration = elevatedStartTime ? formatDemoTime(new Date() - elevatedStartTime) : '0h 0m';
      return {
        message: `Your heart rate is elevated - this could be a sign of withdrawal (${duration})`,
        color: '#FF4D4D',
        severity: "warning",
        icon: '⚠️'
      };
    } else if (heartRate > 100) {
      return {
        message: "Your heart rate is slightly elevated - please monitor your symptoms",
        color: '#FFB020',
        severity: "monitor",
        icon: '⚡'
      };
    } else {
      return {
        message: "Your heart rate is normal",
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
        Welcome Back
      </Typography>
      
      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
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
                  sx={{ color: theme.palette.grey[100], position: 'absolute' }}
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
                color: theme.palette.text.secondary,
                textAlign: 'center',
                fontWeight: 'medium'
              }}>
                Last updated: {lastCheckTime}
              </Typography>

              {elevatedStartTime && (
                <Typography variant="body1" sx={{ 
                  color: theme.palette.error.main,
                  mt: 2,
                  fontWeight: 'medium',
                  textAlign: 'center',
                  p: 1,
                  borderRadius: 1,
                  backgroundColor: theme.palette.error.light + '20'
                }}>
                  Elevated for: {formatDemoTime(new Date() - elevatedStartTime)}
                </Typography>
              )}
            </Box>
          </Paper>
        </Fade>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Fade in={true} style={{ transitionDelay: '100ms' }}>
            <Paper elevation={0} sx={{ 
              p: 4, 
              borderRadius: 4,
              background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
              border: '1px solid rgba(230, 232, 240, 0.5)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.03)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Typography sx={{ fontSize: '2rem' }}>💊</Typography>
                <Typography variant="h5" sx={{ 
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #1a365d, #2563eb)',
                  backgroundClip: 'text',
                  color: 'transparent'
                }}>
                  Medication Reminder
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ 
                mb: 3,
                color: '#475569',
                lineHeight: 1.6
              }}>
                It's time for your Suboxone dose. Please take your medication as prescribed.
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleTakeMedication}
                fullWidth
                sx={{ 
                  borderRadius: 3,
                  textTransform: 'none',
                  py: 1.8,
                  background: 'linear-gradient(45deg, #1a365d, #2563eb)',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(37, 99, 235, 0.3)',
                    background: 'linear-gradient(45deg, #1e40af, #3b82f6)'
                  }
                }}
              >
                Confirm Medication Taken ✓
              </Button>
            </Paper>
          </Fade>

          <Fade in={true} style={{ transitionDelay: '200ms' }}>
            <Paper elevation={0} sx={{ 
              p: 4,
              borderRadius: 4,
              background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
              border: '1px solid rgba(230, 232, 240, 0.5)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.03)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Typography sx={{ fontSize: '2rem' }}>🏥</Typography>
                <Typography variant="h5" sx={{ 
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #991b1b, #dc2626)',
                  backgroundClip: 'text',
                  color: 'transparent'
                }}>
                  Check-In
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ 
                mb: 3,
                color: '#475569',
                lineHeight: 1.6
              }}>
                If you feel unwell or experience withdrawal symptoms, please check in immediately.
              </Typography>
              <Button 
                variant="contained" 
                color="error" 
                onClick={handleCheckIn}
                fullWidth
                sx={{ 
                  borderRadius: 3,
                  textTransform: 'none',
                  py: 1.8,
                  background: 'linear-gradient(45deg, #991b1b, #dc2626)',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.2)',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(220, 38, 38, 0.3)',
                    background: 'linear-gradient(45deg, #b91c1c, #ef4444)'
                  }
                }}
              >
                Check-In Now 🚨
              </Button>
            </Paper>
          </Fade>
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

export default PatientDashboard;

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
