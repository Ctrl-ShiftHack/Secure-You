import { render, fireEvent } from '@testing-library/react-native';
import { AuthProvider } from '../src/features/auth/AuthContext';

export const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <AuthProvider>
      {ui}
    </AuthProvider>
  );
};