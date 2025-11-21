import { StyleSheet } from 'react-native';

// Color palette
export const colors = {
  primary: {
    50: '#EEF1FB',
    100: '#D4DBF3',
    500: '#3C4EB0',
    600: '#2F3E8E',
    800: '#1F2961',
  },
  accent: {
    50: '#FEF9ED',
    100: '#FCF0D1',
    500: '#F2C76E',
    600: '#E9B43D',
    800: '#C89420',
  },
  secondary: {
    50: '#F0FFFC',
    100: '#D4FFF3',
    500: '#7FFFD4',
    600: '#4DFFC4',
  },
  gray: {
    50: '#FDFDFD',
    100: '#f3f4f6',
    500: '#6b7280',
    600: '#4b5563',
    700: '#666666',
    800: '#2C2C2C',
  },
  green: {
    500: '#22c55e',
    600: '#16a34a',
  },
  red: {
    500: '#ef4444',
    600: '#dc2626',
  },
  white: '#ffffff',
  black: '#000000',
};

// Common styles
export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
    padding: 16,
  },
  card: {
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 18,
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  // Text styles
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary[500],
  },
  subheading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.gray[800],
  },
  body: {
    fontSize: 16,
    color: colors.gray[700],
  },
  caption: {
    fontSize: 12,
    color: colors.gray[500],
  },
  // Stat boxes
  statBox: {
    padding: 20,
    borderRadius: 18,
    width: '48%',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  statBoxPrimary: {
    backgroundColor: colors.primary[500],
  },
  statBoxSecondary: {
    backgroundColor: colors.secondary[100],
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statNumberPrimary: {
    color: colors.white,
  },
  statNumberSecondary: {
    color: colors.primary[800],
  },
  statLabel: {
    fontSize: 14,
  },
  statLabelPrimary: {
    color: colors.accent[100],
  },
  statLabelSecondary: {
    color: colors.primary[600],
  },
});
