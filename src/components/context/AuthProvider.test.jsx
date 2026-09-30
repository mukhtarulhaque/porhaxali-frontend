import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import UseAuth from '../Hooks/UseAuth';
import { AuthProvider } from './AuthProvider';

const AuthState = () => {
  const { auth } = UseAuth();
  return <div>{auth.userRole}</div>;
};

describe('AuthProvider persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('restores the admin role from localStorage after provider initialization', () => {
    localStorage.setItem('porhaxaliAuth', JSON.stringify({
      accessToken: 'admin-access-token',
      userEmail: 'admin@example.com',
      userRole: 'ADMIN',
    }));

    render(
      <AuthProvider>
        <AuthState />
      </AuthProvider>,
    );

    expect(screen.getByText('ADMIN')).toBeInTheDocument();
  });
});
