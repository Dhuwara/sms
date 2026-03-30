import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../../src/pages/Auth/Login';

// Mock useAuth
const mockLogin = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../../src/context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderLogin = () => {
  return render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  );
};

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render login form with correct elements', () => {
    renderLogin();

    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@school.com')).toBeInTheDocument();
    // Password placeholder is bullet chars
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('should render login type toggle buttons', () => {
    renderLogin();

    expect(screen.getByText('Student')).toBeInTheDocument();
    expect(screen.getByText('Staff/Admin/Parent')).toBeInTheDocument();
  });

  it('should switch to student login type and show roll number input', async () => {
    const user = userEvent.setup();
    renderLogin();

    const studentBtn = screen.getByText('Student');
    await user.click(studentBtn);

    // Should show roll number placeholder instead of email
    expect(screen.getByPlaceholderText('STU2026001')).toBeInTheDocument();
  });

  it('should have password field as type=password by default', () => {
    renderLogin();
    const passwordInput = screen.getByLabelText('Password');
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('should call login with email credentials on submit', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce({ role: 'admin' });

    renderLogin();

    const emailInput = screen.getByPlaceholderText('you@school.com');
    const passwordInput = screen.getByLabelText('Password');

    await user.type(emailInput, 'admin@test.com');
    await user.type(passwordInput, 'Admin@123');
    await user.click(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'admin@test.com',
        password: 'Admin@123',
      });
    });
  });

  it('should call login with rollNumber for student login', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce({ role: 'student' });

    renderLogin();

    // Switch to student login
    await user.click(screen.getByText('Student'));

    const rollInput = screen.getByPlaceholderText('STU2026001');
    const passwordInput = screen.getByLabelText('Password');

    await user.type(rollInput, 'STU2026002');
    await user.type(passwordInput, 'Student@123');
    await user.click(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        rollNumber: 'STU2026002',
        password: 'Student@123',
      });
    });
  });

  it('should navigate to /dashboard on admin login', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce({ role: 'admin' });

    renderLogin();

    await user.type(screen.getByPlaceholderText('you@school.com'), 'admin@test.com');
    await user.type(screen.getByLabelText('Password'), 'Admin@123');
    await user.click(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });
  });

  it('should navigate to /staff/profile on staff login', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce({ role: 'staff' });

    renderLogin();

    await user.type(screen.getByPlaceholderText('you@school.com'), 'staff@test.com');
    await user.type(screen.getByLabelText('Password'), 'Staff@123');
    await user.click(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/staff/profile', { replace: true });
    });
  });

  it('should navigate to /student/profile on student login', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce({ role: 'student' });

    renderLogin();

    await user.click(screen.getByText('Student'));
    await user.type(screen.getByPlaceholderText('STU2026001'), 'STU2026002');
    await user.type(screen.getByLabelText('Password'), 'Student@123');
    await user.click(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/student/profile', { replace: true });
    });
  });

  it('should navigate to /parent/profile on parent login', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce({ role: 'parent' });

    renderLogin();

    await user.type(screen.getByPlaceholderText('you@school.com'), 'parent@test.com');
    await user.type(screen.getByLabelText('Password'), 'Parent@123');
    await user.click(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/parent/profile', { replace: true });
    });
  });

  it('should show error toast on login failure', async () => {
    const user = userEvent.setup();
    const { toast } = await import('sonner');
    mockLogin.mockRejectedValueOnce({
      response: { data: { message: 'Invalid credentials' } },
    });

    renderLogin();

    await user.type(screen.getByPlaceholderText('you@school.com'), 'wrong@test.com');
    await user.type(screen.getByLabelText('Password'), 'wrongpass');
    await user.click(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid credentials');
    });
  });

  it('should show "Forgot password?" link', () => {
    renderLogin();
    expect(screen.getByText('Forgot password?')).toBeInTheDocument();
  });

  it('should show "Back to Home" link', () => {
    renderLogin();
    expect(screen.getByText('← Back to Home')).toBeInTheDocument();
  });

  it('should disable submit button while loading', async () => {
    const user = userEvent.setup();
    // Make login hang
    mockLogin.mockReturnValue(new Promise(() => {}));

    renderLogin();

    await user.type(screen.getByPlaceholderText('you@school.com'), 'admin@test.com');
    await user.type(screen.getByLabelText('Password'), 'Admin@123');
    await user.click(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(screen.getByText('Please wait...')).toBeInTheDocument();
    });
  });
});
