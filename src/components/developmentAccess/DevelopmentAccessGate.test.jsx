import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    getDevelopmentAccessStatus,
    requestDevelopmentAccessOtp,
    verifyDevelopmentAccessOtp,
} from '../../api/DevelopmentAccess';
import DevelopmentAccessProvider from '../context/DevelopmentAccessProvider';
import DevelopmentAccessGate from './DevelopmentAccessGate';

vi.mock('../../api/DevelopmentAccess', () => ({
    getDevelopmentAccessStatus: vi.fn(),
    logoutDevelopmentAccess: vi.fn(),
    requestDevelopmentAccessOtp: vi.fn(),
    verifyDevelopmentAccessOtp: vi.fn(),
}));

const renderGate = () => render(
    <DevelopmentAccessProvider>
        <DevelopmentAccessGate>
            <div>Existing Porhaxali application</div>
        </DevelopmentAccessGate>
    </DevelopmentAccessProvider>,
);

const reachOtpStage = async () => {
    getDevelopmentAccessStatus.mockResolvedValueOnce(false);
    requestDevelopmentAccessOtp.mockResolvedValueOnce({ data: { success: true } });
    renderGate();
    const emailInput = await screen.findByLabelText('Email Address');
    fireEvent.change(emailInput, { target: { value: 'preview@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await screen.findByText('Verification Code');
};

describe('DevelopmentAccessGate', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('does not render the existing application while status is pending', () => {
        getDevelopmentAccessStatus.mockReturnValue(new Promise(() => {}));

        renderGate();

        expect(screen.getByLabelText('Checking development access')).toBeInTheDocument();
        expect(screen.queryByText('Existing Porhaxali application')).not.toBeInTheDocument();
    });

    it('renders the access page when the browser is unauthorized', async () => {
        getDevelopmentAccessStatus.mockResolvedValue(false);

        renderGate();

        expect(await screen.findByText('Website Under Development')).toBeInTheDocument();
        expect(screen.queryByText('Existing Porhaxali application')).not.toBeInTheDocument();
    });

    it('renders the existing application for an already authorized session', async () => {
        getDevelopmentAccessStatus.mockResolvedValue(true);

        renderGate();

        expect(await screen.findByText('Existing Porhaxali application')).toBeInTheDocument();
        expect(screen.queryByText('Website Under Development')).not.toBeInTheDocument();
    });

    it('fails closed when the startup status request fails', async () => {
        getDevelopmentAccessStatus.mockRejectedValue(new Error('network unavailable'));

        renderGate();

        expect(await screen.findByText('Unable to verify development access.')).toBeInTheDocument();
        expect(screen.queryByText('Existing Porhaxali application')).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument();
    });

    it('validates email locally and transitions to the OTP stage after a successful request', async () => {
        getDevelopmentAccessStatus.mockResolvedValue(false);
        requestDevelopmentAccessOtp.mockResolvedValue({ data: { success: true } });
        renderGate();
        const emailInput = await screen.findByLabelText('Email Address');

        fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
        fireEvent.blur(emailInput);
        expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
        expect(requestDevelopmentAccessOtp).not.toHaveBeenCalled();

        fireEvent.change(emailInput, { target: { value: 'preview@example.com' } });
        fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

        await screen.findByText('Verification Code');
        expect(requestDevelopmentAccessOtp).toHaveBeenCalledWith('preview@example.com');
        expect(screen.queryByLabelText('Email Address')).not.toBeInTheDocument();
        expect(screen.getAllByLabelText(/Verification code digit/)).toHaveLength(6);
    });

    it('verifies six pasted digits, rechecks status, and reveals the application', async () => {
        await reachOtpStage();
        verifyDevelopmentAccessOtp.mockResolvedValueOnce({ data: { success: true } });
        getDevelopmentAccessStatus.mockResolvedValueOnce(true);

        fireEvent.paste(screen.getByLabelText('Verification code digit 1'), {
            clipboardData: { getData: () => '123456' },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Verify' }));

        await waitFor(() => expect(verifyDevelopmentAccessOtp).toHaveBeenCalledWith('123456'));
        expect(getDevelopmentAccessStatus).toHaveBeenCalledTimes(2);
        expect(await screen.findByText('Existing Porhaxali application')).toBeInTheDocument();
    });

    it('shows backend OTP errors and remains on the OTP stage', async () => {
        await reachOtpStage();
        verifyDevelopmentAccessOtp.mockRejectedValueOnce({
            response: { data: { message: 'Invalid OTP. You have 2 attempts left' } },
        });

        fireEvent.paste(screen.getByLabelText('Verification code digit 1'), {
            clipboardData: { getData: () => '000000' },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Verify' }));

        expect(await screen.findByRole('alert')).toHaveTextContent('Invalid OTP. You have 2 attempts left');
        expect(screen.getByText('Verification Code')).toBeInTheDocument();
        expect(screen.queryByText('Existing Porhaxali application')).not.toBeInTheDocument();
    });
});
