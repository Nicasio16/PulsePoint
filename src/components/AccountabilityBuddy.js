import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Paper, 
  Box, 
  Fade,
  CircularProgress,
  useTheme,
  Grid,
  Button,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  Checkbox
} from '@mui/material';
import { PersonAdd as PersonAddIcon, Delete as DeleteIcon } from '@mui/icons-material';

function AccountabilityBuddy() {
  const theme = useTheme();
  const [partners, setPartners] = useState([
    {
      id: 1,
      name: "John Smith",
      phone: "+1 (555) 123-4567",
      heartRate: 75,
      elevatedStartTime: null,
      requiresCheckIn: false,
      lastCheckTime: null,
      recentActivity: [],
      notifications: []
    }
  ]);
  const [timeScale] = useState(360); // 1 second = 6 minutes for demonstration
  const [simulatedTime, setSimulatedTime] = useState(new Date());
  const [openDialog, setOpenDialog] = useState(false);
  const [newPartner, setNewPartner] = useState({ name: '', phone: '' });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [confirmingPartnerId, setConfirmingPartnerId] = useState(null);
  const [tookMedicine, setTookMedicine] = useState(false);
  const [alertingPartnerId, setAlertingPartnerId] = useState(null);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);

  // Update simulated time and heart rates using randomizer
  useEffect(() => {
    const interval = setInterval(() => {
      setSimulatedTime(prev => new Date(prev.getTime() + (1000 * timeScale)));
      
      setPartners(prevPartners => 
        prevPartners.map(partner => {
          // Generate random heart rate between 60-140
          const nextRate = Math.floor(Math.random() * (140 - 60 + 1)) + 60;
          let newElevatedStartTime = partner.elevatedStartTime;
          let newRequiresCheckIn = partner.requiresCheckIn;
          
          // Start counting 6 hours when heart rate first becomes elevated
          if (nextRate > 120 && !partner.elevatedStartTime && !partner.requiresCheckIn) {
            newElevatedStartTime = new Date();
          }
          
          // Check if 6 hours have passed since elevation started
          if (newElevatedStartTime) {
            const elevatedDuration = (new Date() - newElevatedStartTime) / (1000 * timeScale) * 10;
            if (elevatedDuration >= 6) {
              newRequiresCheckIn = true;
            }
          }
          
          // Keep elevated start time and check-in requirement until medicine is taken
          if (partner.requiresCheckIn) {
            newRequiresCheckIn = true;
            newElevatedStartTime = partner.elevatedStartTime;
          }
          
          return {
            ...partner,
            heartRate: nextRate,
            elevatedStartTime: newElevatedStartTime,
            requiresCheckIn: newRequiresCheckIn
          };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [timeScale]);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDemoTime = (milliseconds) => {
    const demoHours = (milliseconds / (1000 * timeScale)) * 10;
    const hours = Math.floor(demoHours);
    const minutes = Math.floor((demoHours - hours) * 60);
    return `${hours}h ${minutes}m`;
  };

  const getHeartRateStatus = (heartRate) => {
    if (heartRate > 120) {
      return {
        message: "⚠️ Elevated Heart Rate",
        color: "#ef4444",
        icon: "⚠️"
      };
    } else if (heartRate > 100) {
      return {
        message: "⚡ Slightly Elevated",
        color: "#f59e0b",
        icon: "⚡"
      };
    } else {
      return {
        message: "✅ Normal Heart Rate",
        color: "#22c55e",
        icon: "✅"
      };
    }
  };

  const handleAddPartner = () => {
    if (!newPartner.name || !newPartner.phone) {
      setSnackbarMessage('⚠️ Please fill in all fields');
      setSnackbarOpen(true);
      return;
    }

    const partner = {
      id: partners.length + 1,
      name: newPartner.name,
      phone: newPartner.phone,
      heartRate: 75,
      elevatedStartTime: null,
      lastCheckIn: null,
      requiresCheckIn: false,
      notifications: [],
      recentActivity: []
    };

    setPartners(prev => [...prev, partner]);
    setOpenDialog(false);
    setNewPartner({ name: '', phone: '' });
    setSnackbarMessage('✅ Accountability partner added successfully');
    setSnackbarOpen(true);
  };

  const handleDeletePartner = (partnerId) => {
    setPartners(prev => prev.filter(p => p.id !== partnerId));
    setSnackbarMessage('✅ Partner removed from monitoring');
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const initiateCheckIn = (partnerId) => {
    setConfirmingPartnerId(partnerId);
    setTookMedicine(false);
    setOpenConfirmDialog(true);
  };

  const confirmCheckIn = () => {
    if (!tookMedicine) {
      setSnackbarMessage('⚠️ Please confirm that you have taken your medicine');
      setSnackbarOpen(true);
      return;
    }

    setPartners(prev => prev.map(partner => {
      if (partner.id === confirmingPartnerId) {
        return {
          ...partner,
          lastCheckIn: new Date(),
          elevatedStartTime: null,
          requiresCheckIn: false,
          notifications: [
            {
              id: Date.now(),
              message: "Check-in completed: Medicine taken and heart rate monitored",
              time: new Date().toLocaleString(),
              read: false
            },
            ...partner.notifications
          ],
          recentActivity: [
            {
              type: 'check-in',
              message: "Check-in completed: Medicine taken and heart rate monitored",
              time: new Date().toLocaleString()
            },
            ...partner.recentActivity
          ]
        };
      }
      return partner;
    }));
    setSnackbarMessage('✅ Check-in recorded successfully');
    setSnackbarOpen(true);
    setOpenConfirmDialog(false);
  };

  const handleAlertClick = (partnerId) => {
    setAlertingPartnerId(partnerId);
    setAlertDialogOpen(true);
  };

  const handleAlertConfirm = () => {
    if (!alertingPartnerId) return;

    const partner = partners.find(p => p.id === alertingPartnerId);
    if (!partner) return;

    const currentTime = new Date().toLocaleTimeString();
    const newActivity = {
      type: 'alert',
      message: alertMessage || 'Medical alert sent',
      time: currentTime
    };

    setPartners(prevPartners => 
      prevPartners.map(p => 
        p.id === alertingPartnerId
          ? {
              ...p,
              recentActivity: [newActivity, ...p.recentActivity].slice(0, 5)
            }
          : p
      )
    );

    setAlertDialogOpen(false);
    setAlertingPartnerId(null);
    setAlertMessage('');
  };

  const handleAlertCancel = () => {
    setAlertDialogOpen(false);
    setAlertingPartnerId(null);
    setAlertMessage('');
  };

  return (
    <Box sx={{ 
      maxWidth: 1400, 
      margin: '0 auto', 
      p: { xs: 2, md: 4 },
      minHeight: '100vh',
      background: 'linear-gradient(145deg, #f8fafc, #f1f5f9)'
    }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 4
      }}>
        <Typography variant="h4" sx={{ 
          fontWeight: 800,
          background: 'linear-gradient(45deg, #1a365d, #2563eb)',
          backgroundClip: 'text',
          color: 'transparent'
        }}>
          Accountability Partner Dashboard
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => setOpenDialog(true)}
          startIcon={<PersonAddIcon />}
          sx={{ 
            borderRadius: 3,
            textTransform: 'none',
            py: 1.5,
            px: 3,
            background: 'linear-gradient(45deg, #1a365d, #2563eb)',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
            '&:hover': {
              background: 'linear-gradient(45deg, #1e40af, #3b82f6)',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(37, 99, 235, 0.3)'
            }
          }}
        >
          Add New Partner
        </Button>
      </Box>

      <Grid container spacing={3}>
        {partners.map((partner) => {
          const status = getHeartRateStatus(partner.heartRate);
          const elevatedDuration = partner.elevatedStartTime ? (new Date() - partner.elevatedStartTime) / (1000 * timeScale) * 10 : 0;

          return (
            <Grid item xs={12} md={6} lg={4} key={partner.id}>
              <Fade in={true}>
                <Paper elevation={0} sx={{ 
                  p: 4, 
                  borderRadius: 4,
                  background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
                  border: '1px solid rgba(230, 232, 240, 0.5)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.03)',
                  height: '100%',
                  position: 'relative'
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3 
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography sx={{ fontSize: '2rem' }}>👤</Typography>
                      <Box>
                        <Typography variant="h5" sx={{ 
                          fontWeight: 700,
                          background: 'linear-gradient(45deg, #1a365d, #2563eb)',
                          backgroundClip: 'text',
                          color: 'transparent'
                        }}>
                          {partner.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {partner.phone}
                        </Typography>
                      </Box>
                    </Box>
                    <Tooltip title="Remove partner">
                      <IconButton 
                        onClick={() => handleDeletePartner(partner.id)}
                        sx={{ 
                          color: '#ef4444',
                          '&:hover': {
                            backgroundColor: '#fee2e2'
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    gap: 2
                  }}>
                    <Box sx={{ 
                      position: 'relative', 
                      display: 'inline-flex',
                      mb: 2
                    }}>
                      <CircularProgress
                        variant="determinate"
                        value={Math.min(100, (partner.heartRate - 60) * 2)}
                        size={180}
                        thickness={4}
                        sx={{
                          color: status.color,
                          '& .MuiCircularProgress-circle': {
                            strokeLinecap: 'round',
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
                            fontSize: '2.5rem',
                            lineHeight: 1,
                            mb: 1,
                            color: status.color,
                            animation: partner.elevatedStartTime ? 'beat 1s ease-in-out infinite' : 'none',
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
                          {partner.heartRate}
                        </Typography>
                        <Typography variant="body1" sx={{ 
                          color: '#64748b',
                          fontWeight: 'medium'
                        }}>
                          BPM
                        </Typography>
                      </Box>
                    </Box>

                    <Typography variant="body2" sx={{ 
                      color: theme.palette.text.secondary,
                      textAlign: 'center',
                      fontWeight: 'medium'
                    }}>
                      Last updated: {formatTime(simulatedTime)}
                    </Typography>

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

                    {partner.requiresCheckIn && (
                      <Box sx={{ 
                        mt: 2,
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: theme.palette.error.light + '10',
                        border: `1px solid ${theme.palette.error.light}20`,
                        width: '100%'
                      }}>
                        <Typography variant="body1" sx={{ 
                          color: theme.palette.error.main,
                          fontWeight: 'medium',
                          textAlign: 'center',
                          mb: 2
                        }}>
                          Time since elevation: {formatDemoTime(new Date() - partner.elevatedStartTime)}
                        </Typography>
                        
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={() => initiateCheckIn(partner.id)}
                          sx={{
                            background: theme.palette.error.main,
                            color: '#fff',
                            textTransform: 'none',
                            borderRadius: 2,
                            py: 1,
                            '&:hover': {
                              background: theme.palette.error.dark,
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)'
                            }
                          }}
                        >
                          Check In Now
                        </Button>
                      </Box>
                    )}

                    {partner.notifications.length > 0 && (
                      <Box sx={{ 
                        mt: 2, 
                        p: 2, 
                        borderRadius: 2,
                        backgroundColor: '#f0f9ff',
                        border: '1px solid #e0f2fe',
                        width: '100%'
                      }}>
                        <Typography variant="subtitle2" sx={{ 
                          fontWeight: 600,
                          color: '#1a365d',
                          mb: 2
                        }}>
                          Recent Activity
                        </Typography>
                        {partner.notifications.slice(0, 2).map((notification) => (
                          <Box 
                            key={notification.id}
                            sx={{ 
                              mb: 1,
                              p: 1,
                              borderRadius: 1,
                              backgroundColor: notification.read ? 'transparent' : '#fff',
                              border: '1px solid #e0f2fe'
                            }}
                          >
                            <Typography variant="body2" sx={{ color: '#1a365d' }}>
                              {notification.message}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748b' }}>
                              {notification.time}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}

                    <Box sx={{ 
                      display: 'flex', 
                      gap: 2,
                      mt: 3
                    }}>
                      {partner.requiresCheckIn && (
                        <Button 
                          variant="contained" 
                          color="primary" 
                          onClick={() => initiateCheckIn(partner.id)}
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
                          Check In Now ✓
                        </Button>
                      )}
                      <Button 
                        variant="outlined" 
                        color="error" 
                        onClick={() => handleAlertClick(partner.id)}
                        sx={{ 
                          borderRadius: 3,
                          textTransform: 'none',
                          py: 1.8,
                          borderColor: '#dc2626',
                          color: '#dc2626',
                          '&:hover': {
                            borderColor: '#b91c1c',
                            backgroundColor: '#fee2e2',
                            transform: 'translateY(-2px)'
                          }
                        }}
                      >
                        Alert 🚨
                      </Button>
                    </Box>
                  </Box>
                </Paper>
              </Fade>
            </Grid>
          );
        })}
      </Grid>

      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 2
          }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 700,
          background: 'linear-gradient(45deg, #1a365d, #2563eb)',
          backgroundClip: 'text',
          color: 'transparent'
        }}>
          Add New Accountability Partner
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Partner Name"
              value={newPartner.name}
              onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
            <TextField
              label="Phone Number"
              value={newPartner.phone}
              onChange={(e) => setNewPartner({ ...newPartner, phone: e.target.value })}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button 
            onClick={() => setOpenDialog(false)}
            sx={{ 
              color: '#64748b',
              textTransform: 'none'
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAddPartner}
            variant="contained"
            sx={{ 
              background: 'linear-gradient(45deg, #1a365d, #2563eb)',
              textTransform: 'none',
              borderRadius: 2,
              '&:hover': {
                background: 'linear-gradient(45deg, #1e40af, #3b82f6)'
              }
            }}
          >
            Add Partner
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={openConfirmDialog} 
        onClose={() => setOpenConfirmDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 2
          }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 700,
          color: theme.palette.error.main
        }}>
          Confirm Check-In
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography>
              Please confirm that you have:
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              cursor: 'pointer',
              p: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: tookMedicine ? theme.palette.success.main : theme.palette.grey[300],
              bgcolor: tookMedicine ? theme.palette.success.light + '10' : 'transparent',
              onClick: () => setTookMedicine(!tookMedicine)
            }}>
              <Checkbox
                checked={tookMedicine}
                onChange={(e) => setTookMedicine(e.target.checked)}
                color="success"
              />
              <Typography>
                Taken your prescribed medicine
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button 
            onClick={() => setOpenConfirmDialog(false)}
            sx={{ 
              color: '#64748b',
              textTransform: 'none'
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmCheckIn}
            variant="contained"
            disabled={!tookMedicine}
            sx={{ 
              background: theme.palette.success.main,
              textTransform: 'none',
              borderRadius: 2,
              '&:hover': {
                background: theme.palette.success.dark
              }
            }}
          >
            Confirm Check-In
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={alertDialogOpen} 
        onClose={handleAlertCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Send Alert to Partner</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Alert Message"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={alertMessage}
            onChange={(e) => setAlertMessage(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAlertCancel}>Cancel</Button>
          <Button 
            onClick={handleAlertConfirm} 
            variant="contained"
            color="error"
            sx={{ 
              background: 'linear-gradient(45deg, #991b1b, #dc2626)',
              '&:hover': {
                background: 'linear-gradient(45deg, #b91c1c, #ef4444)'
              }
            }}
          >
            Send Alert
          </Button>
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

export default AccountabilityBuddy; 