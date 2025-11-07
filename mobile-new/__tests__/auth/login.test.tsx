import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { LoginScreen } from '../../src/app/(auth)/login';
import { renderWithProviders } from '../test-utils';

jest.mock('../../src/services/supabase/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
    },
  },
}));

describe('LoginScreen', () => {
  it('renders login form correctly', () => {
    const { getByText, getByPlaceholderText } = renderWithProviders(<LoginScreen />);
    
    expect(getByText('Welcome Back')).toBeTruthy();
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText('Login')).toBeTruthy();
  });

  it('handles login submission', async () => {
    const { getByPlaceholderText, getByText } = renderWithProviders(<LoginScreen />);
    
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    
    fireEvent.press(getByText('Login'));
    
    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });
});