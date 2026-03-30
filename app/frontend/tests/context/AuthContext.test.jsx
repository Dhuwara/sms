import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { AuthProvider, useAuth } from '../../src/context/AuthContext';

// Mock the API module
vi.mock('../../src/utils/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const api = (await import('../../src/utils/api')).default;

// Test component that uses AuthContext
const TestConsumer = () => {
  const { user, loading, login, logout } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {user ? (
        <>
          <span data-testid="user-name">{user.name}</span>
          <span data-testid="user-role">{user.role}</span>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <>
          <span data-testid="no-user">Not logged in</span>
          <button onClick={() => login({ email: 'test@test.com', password: 'pass' })}>
            Login
          </button>
        </>
      )}
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading state initially', async () => {
    // Make the API call hang
    api.get.mockReturnValue(new Promise(() => {}));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should show user data when /auth/me succeeds', async () => {
    api.get.mockResolvedValueOnce({
      data: { name: 'Admin User', role: 'admin', email: 'admin@test.com' },
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user-name')).toHaveTextContent('Admin User');
      expect(screen.getByTestId('user-role')).toHaveTextContent('admin');
    });
  });

  it('should show "Not logged in" when /auth/me fails', async () => {
    api.get.mockRejectedValueOnce(new Error('Unauthorized'));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('no-user')).toBeInTheDocument();
    });
  });

  it('should login and update user state', async () => {
    // Initial check — not logged in
    api.get.mockRejectedValueOnce(new Error('Unauthorized'));

    // Login response
    api.post.mockResolvedValueOnce({
      data: { name: 'Staff User', role: 'staff', email: 'staff@test.com' },
    });

    const user = userEvent.setup();

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('no-user')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByTestId('user-name')).toHaveTextContent('Staff User');
    });

    expect(api.post).toHaveBeenCalledWith('/api/auth/login', {
      email: 'test@test.com',
      password: 'pass',
    });
  });

  it('should logout and clear user state', async () => {
    // Start logged in
    api.get.mockResolvedValueOnce({
      data: { name: 'Admin User', role: 'admin' },
    });

    // Logout response
    api.post.mockResolvedValueOnce({ success: true });

    const user = userEvent.setup();

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user-name')).toHaveTextContent('Admin User');
    });

    await user.click(screen.getByText('Logout'));

    await waitFor(() => {
      expect(screen.getByTestId('no-user')).toBeInTheDocument();
    });

    expect(api.post).toHaveBeenCalledWith('/api/auth/logout');
  });
});
