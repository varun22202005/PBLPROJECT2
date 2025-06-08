// Color palette for the app
const Colors = {
  // Primary colors
  primary: {
    lighter: '#E3F2FD',
    light: '#90CAF9',
    main: '#2196F3',
    dark: '#1976D2',
    darker: '#0D47A1',
  },
  
  // Activity type colors
  activity: {
    running: {
      light: '#FFAB91',
      main: '#FF5722', // Orange
      dark: '#D84315',
    },
    cycling: {
      light: '#90CAF9',
      main: '#2196F3', // Blue
      dark: '#1565C0',
    },
    walking: {
      light: '#A5D6A7',
      main: '#4CAF50', // Green
      dark: '#2E7D32',
    },
  },
  
  // Status colors
  status: {
    success: {
      light: '#A5D6A7',
      main: '#4CAF50',
      dark: '#2E7D32',
    },
    warning: {
      light: '#FFE082',
      main: '#FFC107',
      dark: '#FFA000',
    },
    error: {
      light: '#EF9A9A',
      main: '#F44336',
      dark: '#C62828',
    },
  },
  
  // Grayscale
  grey: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  
  // Basic colors
  black: '#000000',
  white: '#FFFFFF',
  transparent: 'transparent',
  
  // Chart colors for data visualization
  chart: [
    '#2196F3', // Blue
    '#4CAF50', // Green
    '#FF5722', // Orange
    '#9C27B0', // Purple
    '#FFC107', // Amber
    '#00BCD4', // Cyan
  ],
};

export default Colors;