import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../lib/auth-context';
import { auth, googleProvider } from '../lib/firebase';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile
} from 'firebase/auth';

// Mock Firebase Auth
jest.mock('firebase/auth');
jest.mock('../lib/firebase');

const mockSignInWithEmailAndPassword = signInWithEmailAndPassword as jest.MockedFunction<typeof signInWithEmailAndPassword>;
const mockCreateUserWithEmailAndPassword = createUserWithEmailAndPassword as jest.MockedFunction<typeof createUserWithEmailAndPassword>;
const mockSignInWithPopup = signInWithPopup as jest.MockedFunction<typeof signInWithPopup>;
const mockSignOut = signOut as jest.MockedFunction<typeof signOut>;
const mockUpdateProfile = updateProfile as jest.MockedFunction<typeof updateProfile>;

// Test component to access auth context
function TestComponent() {
  const { user, loading, error, signIn, signUp, signInWithGoogle, logout, clearError } = useAuth();
  
  return (
    <div>
      <div data-testid="user">{user ? user.email : 'No user'}</div>
      <div data-testid="loading">{loading ? 'Loading' : 'Not loading'}</div>
      <div data-testid="error">{error || 'No error'}</div>
      <button onClick={() => signIn('test@example.com', 'password')}>Sign In</button>
      <button onClick={() => signUp('test@example.com', 'password', 'Test User')}>Sign Up</button>
      <button onClick={signInWithGoogle}>Sign In with Google</button>
      <button onClick={logout}>Logout</button>
      <button onClick={clearError}>Clear Error</button>
    </div>
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('provides authentication context', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('user')).toHaveTextContent('No user');
    expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
    expect(screen.getByTestId('error')).toHaveTextContent('No error');
  });

  it('handles email/password sign in', async () => {
    const mockUser = { email: 'test@example.com', uid: '123' };
    mockSignInWithEmailAndPassword.mockResolvedValueOnce({
      user: mockUser,
    } as any);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
        auth,
        'test@example.com',
        'password'
      );
    });
  });

  it('handles email/password sign up', async () => {
    const mockUser = { email: 'test@example.com', uid: '123' };
    mockCreateUserWithEmailAndPassword.mockResolvedValueOnce({
      user: mockUser,
    } as any);
    mockUpdateProfile.mockResolvedValueOnce(undefined);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Sign Up'));

    await waitFor(() => {
      expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(
        auth,
        'test@example.com',
        'password'
      );
      expect(mockUpdateProfile).toHaveBeenCalledWith(mockUser, {
        displayName: 'Test User'
      });
    });
  });

  it('handles Google sign in', async () => {
    const mockUser = { email: 'test@gmail.com', uid: '456' };
    mockSignInWithPopup.mockResolvedValueOnce({
      user: mockUser,
    } as any);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Sign In with Google'));

    await waitFor(() => {
      expect(mockSignInWithPopup).toHaveBeenCalledWith(auth, googleProvider);
    });
  });

  it('handles logout', async () => {
    mockSignOut.mockResolvedValueOnce(undefined);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Logout'));

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledWith(auth);
    });
  });

  it('handles authentication errors', async () => {
    const authError = {
      code: 'auth/user-not-found',
      message: 'User not found'
    };
    mockSignInWithEmailAndPassword.mockRejectedValueOnce(authError);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent(
        'No account found with this email address.'
      );
    });
  });

  it('clears errors', async () => {
    const authError = {
      code: 'auth/user-not-found',
      message: 'User not found'
    };
    mockSignInWithEmailAndPassword.mockRejectedValueOnce(authError);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Trigger error
    fireEvent.click(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent(
        'No account found with this email address.'
      );
    });

    // Clear error
    fireEvent.click(screen.getByText('Clear Error'));

    expect(screen.getByTestId('error')).toHaveTextContent('No error');
  });

  it('handles popup closed by user error gracefully', async () => {
    const authError = {
      code: 'auth/popup-closed-by-user',
      message: 'Popup closed by user'
    };
    mockSignInWithPopup.mockRejectedValueOnce(authError);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Sign In with Google'));

    await waitFor(() => {
      // Should not set error for popup closed by user
      expect(screen.getByTestId('error')).toHaveTextContent('No error');
    });
  });

  it('maps Firebase error codes to user-friendly messages', async () => {
    const testCases = [
      { code: 'auth/wrong-password', expected: 'Incorrect password. Please try again.' },
      { code: 'auth/email-already-in-use', expected: 'An account with this email already exists.' },
      { code: 'auth/weak-password', expected: 'Password should be at least 6 characters long.' },
      { code: 'auth/invalid-email', expected: 'Please enter a valid email address.' },
      { code: 'auth/network-request-failed', expected: 'Network error. Please check your connection and try again.' },
      { code: 'auth/too-many-requests', expected: 'Too many failed attempts. Please try again later.' },
      { code: 'auth/unknown-error', expected: 'An error occurred during authentication. Please try again.' }
    ];

    for (const testCase of testCases) {
      const authError = {
        code: testCase.code,
        message: 'Firebase error'
      };
      mockSignInWithEmailAndPassword.mockRejectedValueOnce(authError);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      fireEvent.click(screen.getByText('Sign In'));

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent(testCase.expected);
      });

      // Clear for next test
      fireEvent.click(screen.getByText('Clear Error'));
    }
  });
});

describe('useAuth hook', () => {
  it('throws error when used outside AuthProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');

    consoleSpy.mockRestore();
  });
});