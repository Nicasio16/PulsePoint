# PulsePoint - Patient Monitoring System

PulsePoint is a real-time patient monitoring system designed to help healthcare providers and patients track vital signs and medication adherence during substance use recovery. The system provides immediate feedback on heart rate patterns and facilitates communication between patients and their support network.

## Features

### Patient Dashboard
- Real-time heart rate monitoring with visual indicators
- Medication adherence tracking
- Crisis support network access
- Emergency contact integration
- Visual alerts for elevated heart rates
- Time-based monitoring for withdrawal symptoms

### Clinician Dashboard
- Real-time patient monitoring
- Alert system for elevated vital signs
- Medication adherence tracking
- Support network management
- Historical data visualization

### Accountability Buddy System
- Partner monitoring capabilities
- Check-in system
- Alert notifications
- Support network integration

## Technology Stack

- React.js
- Material-UI (MUI)
- Papa Parse (CSV data handling)
- Local Storage (for demo purposes)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/pulsepoint.git
```

2. Navigate to the project directory:
```bash
cd pulsepoint
```

3. Install dependencies:
```bash
npm install
```

4. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Project Structure

```
pulsepoint/
├── public/
│   └── data/
│       └── heart_rate_data.csv
├── src/
│   ├── components/
│   │   ├── PatientDashboard.js
│   │   ├── ClinicianDashboard.js
│   │   ├── AccountabilityBuddy.js
│   │   └── NavBar.js
│   ├── App.js
│   └── index.js
└── package.json
```

## Usage

### Patient View
1. Access the patient dashboard at the root URL
2. Monitor real-time heart rate data
3. Confirm medication intake
4. Access support network when needed

### Clinician View
1. Navigate to `/clinician`
2. Monitor patient vital signs
3. Review medication adherence
4. Respond to alerts

### Accountability Buddy View
1. Navigate to `/buddies`
2. Monitor partner's status
3. Send check-in requests
4. Respond to alerts

## Demo Mode

The application includes a demo mode where time is accelerated for testing purposes:
- 1 second = 6 minutes in demo time
- Heart rate data is simulated using CSV data
- Alerts and notifications are triggered based on simulated conditions

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Acknowledgments

- Material-UI for the component library
- Papa Parse for CSV parsing
- React Router for navigation
- The healthcare providers and patients who provided feedback during development
