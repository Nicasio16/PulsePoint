// src/components/PatientDashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Typography, 
  Paper, 
  Button, 
  Box, 
  Fade, 
  useTheme, 
  CircularProgress, 
  Snackbar, 
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import Papa from 'papaparse';

function PatientDashboard() {
  const [heartRate, setHeartRate] = useState(75);
  const [alert, setAlert] = useState(null);
  const [elevatedStartTime, setElevatedStartTime] = useState(null);
  const [notificationSent, setNotificationSent] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [timeScale] = useState(360); // 1 second = 6 minutes for demonstration
  const [simulatedTime, setSimulatedTime] = useState(new Date());
  const [accountabilityBuddy, setAccountabilityBuddy] = useState({
    name: "John Smith",
    phone: "+1 (555) 123-4567"
  });
  const [heartRateData, setHeartRateData] = useState([]);
  const [currentDataIndex, setCurrentDataIndex] = useState(0);
  const [supportDialogOpen, setSupportDialogOpen] = useState(false);
  const theme = useTheme();

  // Convert demo time to real time for display
  const formatDemoTime = useCallback((milliseconds) => {
    // Convert milliseconds to hours and minutes, accounting for timeScale
    const scaledMilliseconds = milliseconds * timeScale;
    const totalMinutes = Math.floor(scaledMilliseconds / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  }, [timeScale]);

  const handleTakeMedication = () => {
    setSnackbarMessage('✅ Medication taken successfully');
    setSnackbarOpen(true);
    
    // Add notification to ClinicianDashboard
    const notification = {
      id: Date.now(),
      type: 'success',
      message: 'Patient has confirmed taking their medication',
      timestamp: new Date().toLocaleString(),
      severity: 'success'
    };
    
    // In a real app, this would be sent to a backend API
    // For now, we'll use localStorage to simulate communication between components
    const existingNotifications = JSON.parse(localStorage.getItem('clinicianNotifications') || '[]');
    localStorage.setItem('clinicianNotifications', JSON.stringify([notification, ...existingNotifications]));
  };

  // Function to send notification to backend (mock implementation)
  const sendNotification = async (message, severity = 'info') => {
    // In a real implementation, this would make an API call to your backend
    console.log('Sending notification:', message, 'Severity:', severity);
    // Mock API call
    return new Promise(resolve => setTimeout(resolve, 1000));
  };

  // Load CSV data
  useEffect(() => {
    fetch('/data/heart_rate_data.csv')
      .then(response => response.text())
      .then(csvText => {
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            console.log('CSV Data loaded:', results.data[0]);
            setHeartRateData(results.data);
          },
          error: (error) => {
            console.error('Error parsing CSV:', error);
            setSnackbarMessage('Error loading heart rate data');
            setSnackbarOpen(true);
          }
        });
      })
      .catch(error => {
        console.error('Error fetching CSV:', error);
        setSnackbarMessage('Error loading heart rate data');
        setSnackbarOpen(true);
      });
  }, []);

  // Update simulated time and heart rates using CSV data
  useEffect(() => {
    if (!heartRateData.length) return;

    const interval = setInterval(() => {
      setSimulatedTime(prev => new Date(prev.getTime() + (1000 * timeScale)));
      
      setCurrentDataIndex(prevIndex => {
        const nextIndex = (prevIndex + 1) % heartRateData.length;
        const currentData = heartRateData[nextIndex];
        
        // Round the heart rate to the nearest whole number
        const nextRate = Math.round(currentData.heart_rate_bpm);
        setHeartRate(nextRate);
        
        const isElevated = nextRate > 120;
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

        // Check if heart rate has been elevated for 6 hours
        if (elevatedStartTime && !notificationSent) {
          const hoursElapsed = (new Date() - elevatedStartTime) / (1000 * 60 * 60 * timeScale);
          if (hoursElapsed >= 6) {
            sendNotification(
              `ALERT: Heart rate elevated for 6 hours\nCurrent heart rate: ${nextRate} BPM`,
              "error"
            ).then(() => {
              setNotificationSent(true);
              setSnackbarMessage('⚠️ Alert sent to healthcare provider');
              setSnackbarOpen(true);
            });
          }
        }
        
        return nextIndex;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeScale, heartRateData, elevatedStartTime, notificationSent, formatDemoTime]);

  // Format time for display
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleSupportClick = () => {
    setSupportDialogOpen(true);
  };

  const handleSupportClose = () => {
    setSupportDialogOpen(false);
  };

  const handleEmergencyCall = () => {
    window.location.href = 'tel:911';
  };

  const handleBuddyCall = () => {
    window.location.href = `tel:${accountabilityBuddy.phone.replace(/\D/g, '')}`;
  };

  const handleHealthcareCall = () => {
    // This would be replaced with actual healthcare provider number
    window.location.href = 'tel:+1-555-0123';
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
                Last updated: {formatTime(simulatedTime)}
              </Typography>

              {elevatedStartTime && (
                <Box sx={{ 
                  mt: 2,
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: theme.palette.error.light + '10',
                  border: `1px solid ${theme.palette.error.light}20`
                }}>
                  <Typography variant="body1" sx={{ 
                    color: theme.palette.error.main,
                    fontWeight: 'medium',
                    textAlign: 'center',
                    mb: 1
                  }}>
                    Elevated for: {formatDemoTime(new Date() - elevatedStartTime)}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: theme.palette.text.secondary,
                    textAlign: 'center'
                  }}>
                    Time until 6-hour mark: {formatDemoTime((6 * 60 * 60 * 1000 * timeScale) - (new Date() - elevatedStartTime))}
                  </Typography>
                </Box>
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
                  Crisis Support
                </Typography>
              </Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" sx={{ 
                  color: '#475569',
                  lineHeight: 1.6,
                  mb: 2
                }}>
                  {elevatedStartTime ? 
                    `Your heart rate has been elevated for ${formatDemoTime(new Date() - elevatedStartTime)}. Contact your support network if you need assistance.` :
                    'Your support network is here to help. Reach out if you need assistance with withdrawal symptoms or other concerns.'
                  }
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <span>👤 Accountability Buddy:</span>
                  <span style={{ fontWeight: 600 }}>{accountabilityBuddy.name}</span>
                </Typography>
                {accountabilityBuddy.lastNotified && (
                  <Typography variant="body2" sx={{ 
                    color: '#64748b',
                    mt: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <span>🕒 Last notified:</span>
                    <span>{accountabilityBuddy.lastNotified}</span>
                  </Typography>
                )}
              </Box>
              <Box sx={{ 
                display: 'flex', 
                gap: 2,
                mt: 3
              }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleSupportClick}
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
                  Support Network 🤝
                </Button>
              </Box>
            </Paper>
          </Fade>
        </Box>
      </Box>

      {/* Support Network Dialog */}
      <Dialog 
        open={supportDialogOpen} 
        onClose={handleSupportClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Support Network</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Button
              variant="contained"
              color="error"
              onClick={handleEmergencyCall}
              fullWidth
              sx={{ 
                py: 2,
                background: 'linear-gradient(45deg, #991b1b, #dc2626)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #b91c1c, #ef4444)'
                }
              }}
            >
              Emergency Services (911) 🚨
            </Button>
            
            <Button
              variant="contained"
              color="primary"
              onClick={handleBuddyCall}
              fullWidth
              sx={{ py: 2 }}
            >
              Call Accountability Buddy 📞
            </Button>
            
            <Button
              variant="contained"
              color="primary"
              onClick={handleHealthcareCall}
              fullWidth
              sx={{ py: 2 }}
            >
              Call Healthcare Provider 👨‍⚕️
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSupportClose}>Close</Button>
        </DialogActions>
      </Dialog>

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


