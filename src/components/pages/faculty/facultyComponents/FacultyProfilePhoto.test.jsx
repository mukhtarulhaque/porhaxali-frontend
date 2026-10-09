import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import FacultyProfilePhoto from './FacultyProfilePhoto';
import {
  confirmProfilePhotoUpload,
  getProfilePhotoViewUrl,
  requestProfilePhotoUpload,
  uploadFileToR2,
} from '../../../../api/InstructorApplication';
import { MAX_INSTRUCTOR_FILE_SIZE_BYTES } from '../instructorApplicationConfig';

vi.mock('../../../../api/InstructorApplication', () => ({
  confirmProfilePhotoUpload: vi.fn(),
  getProfilePhotoViewUrl: vi.fn(),
  requestProfilePhotoUpload: vi.fn(),
  uploadFileToR2: vi.fn(),
}));

const noPhotoApplication = { profilePhotoPresent: false, applicationStatus: 'DRAFT' };
const savedPhotoApplication = {
  profilePhotoPresent: true,
  profilePhotoOriginalFileName: 'saved.jpg',
  applicationStatus: 'DRAFT',
};

const makeFile = (name = 'portrait.jpg', type = 'image/jpeg', size = 1024) => {
  const file = new File(['photo'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

function Harness({ application = noPhotoApplication, initialPreview = null, onRefresh = vi.fn() }) {
  const [preview, setPreview] = useState(initialPreview);
  return (
    <FacultyProfilePhoto
      application={application}
      isEditable
      photoPreview={preview}
      setPhotoPreview={setPreview}
      onRefresh={onRefresh}
    />
  );
}

const choosePhoto = (file = makeFile(), application = noPhotoApplication) => {
  render(<Harness application={application} />);
  fireEvent.change(screen.getByLabelText(application.profilePhotoPresent
    ? 'Choose a replacement profile photo'
    : 'Choose a profile photo'), { target: { files: [file] } });
  return file;
};

describe('FacultyProfilePhoto', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: vi.fn(() => 'blob:local-preview'),
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: vi.fn(),
    });
    requestProfilePhotoUpload.mockResolvedValue({
      uploadIntentId: 'intent-1',
      uploadUrl: 'https://storage.example.test/signed-put',
      requiredHeaders: { 'Content-Type': ['image/jpeg'] },
    });
    uploadFileToR2.mockResolvedValue();
    confirmProfilePhotoUpload.mockResolvedValue({ profilePhotoPresent: true });
    getProfilePhotoViewUrl.mockResolvedValue({
      url: 'https://storage.example.test/saved-photo',
      expiresAt: '2026-10-09T12:00:00Z',
    });
  });

  it('shows the empty circular-avatar state and backend-derived constraints', () => {
    render(<Harness />);

    expect(screen.getByText('Add your profile photo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Upload Photo' })).toBeInTheDocument();
    expect(screen.getByText(/JPEG or PNG .* Maximum file size: 2 MB/)).toBeInTheDocument();
    expect(screen.getByText(/public faculty profile/i)).toBeInTheDocument();
  });

  it('loads and renders an existing photo through the backend view-url method', async () => {
    render(<Harness application={savedPhotoApplication} />);

    expect(await screen.findByAltText('Saved faculty profile')).toHaveAttribute(
      'src',
      'https://storage.example.test/saved-photo',
    );
    expect(getProfilePhotoViewUrl).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Change Photo' })).toBeInTheDocument();
  });

  it('previews a valid selection without uploading and can cancel it', () => {
    choosePhoto();

    expect(screen.getByAltText('Selected profile photo preview')).toHaveAttribute('src', 'blob:local-preview');
    expect(screen.getByRole('button', { name: 'Save Photo' })).toBeInTheDocument();
    expect(requestProfilePhotoUpload).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByAltText('Selected profile photo preview')).not.toBeInTheDocument();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:local-preview');
  });

  it.each([
    [makeFile('portrait.gif', 'image/gif'), 'Choose a JPEG or PNG image.'],
    [makeFile('large.png', 'image/png', MAX_INSTRUCTOR_FILE_SIZE_BYTES + 1), 'Photo size must not exceed 2 MB.'],
    [makeFile('empty.png', 'image/png', 0), 'The selected photo is empty.'],
  ])('rejects an invalid selection before requesting an upload intent', (file, message) => {
    choosePhoto(file);

    expect(screen.getByRole('alert')).toHaveTextContent(message);
    expect(requestProfilePhotoUpload).not.toHaveBeenCalled();
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });

  it('runs authorize, raw upload, confirmation, refresh, and retrieval in order', async () => {
    const order = [];
    const onRefresh = vi.fn(async () => { order.push('refresh'); });
    requestProfilePhotoUpload.mockImplementation(async () => {
      order.push('authorize');
      return {
        uploadIntentId: 'intent-1',
        uploadUrl: 'https://storage.example.test/signed-put',
        requiredHeaders: { 'Content-Type': ['image/jpeg'] },
      };
    });
    uploadFileToR2.mockImplementation(async () => { order.push('put'); });
    confirmProfilePhotoUpload.mockImplementation(async () => { order.push('confirm'); });
    getProfilePhotoViewUrl.mockImplementation(async () => {
      order.push('retrieve');
      return { url: 'https://storage.example.test/new-photo' };
    });
    const file = makeFile();

    render(<Harness onRefresh={onRefresh} />);
    fireEvent.change(screen.getByLabelText('Choose a profile photo'), { target: { files: [file] } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Photo' }));

    expect(await screen.findByText('Profile photo saved successfully.')).toBeInTheDocument();
    expect(order).toEqual(['authorize', 'put', 'confirm', 'refresh', 'retrieve']);
    expect(requestProfilePhotoUpload).toHaveBeenCalledWith({
      originalFileName: 'portrait.jpg',
      contentType: 'image/jpeg',
      fileSize: 1024,
    });
    expect(requestProfilePhotoUpload.mock.calls[0][0]).not.toHaveProperty('bucket');
    expect(uploadFileToR2).toHaveBeenCalledWith(
      'https://storage.example.test/signed-put',
      file,
      { 'Content-Type': ['image/jpeg'] },
    );
    expect(confirmProfilePhotoUpload).toHaveBeenCalledWith('intent-1');
    expect(screen.getByAltText('Saved faculty profile')).toHaveAttribute(
      'src',
      'https://storage.example.test/new-photo',
    );
  });

  it('does not confirm after a failed PUT and retry requests a fresh upload intent', async () => {
    uploadFileToR2.mockRejectedValueOnce(new Error('Storage upload failed with status 403'));
    choosePhoto();

    fireEvent.click(screen.getByRole('button', { name: 'Save Photo' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/upload link expired/i);
    expect(confirmProfilePhotoUpload).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Retry Upload' }));
    expect(await screen.findByText('Profile photo saved successfully.')).toBeInTheDocument();
    expect(requestProfilePhotoUpload).toHaveBeenCalledTimes(2);
    expect(confirmProfilePhotoUpload).toHaveBeenCalledTimes(1);
  });

  it('keeps the saved photo visible when replacement confirmation fails', async () => {
    confirmProfilePhotoUpload.mockRejectedValue({ response: { data: { message: 'Confirmation failed.' } } });
    render(<Harness application={savedPhotoApplication} />);
    await screen.findByAltText('Saved faculty profile');

    fireEvent.change(screen.getByLabelText('Choose a replacement profile photo'), {
      target: { files: [makeFile('replacement.png', 'image/png')] },
    });
    expect(screen.getByAltText('Selected profile photo preview')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Save Photo' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Confirmation failed.');
    expect(screen.getByAltText('Saved faculty profile')).toHaveAttribute(
      'src',
      'https://storage.example.test/saved-photo',
    );
  });

  it('keeps confirmation success distinct from a subsequent display failure', async () => {
    getProfilePhotoViewUrl.mockRejectedValue(new Error('network'));
    choosePhoto();
    fireEvent.click(screen.getByRole('button', { name: 'Save Photo' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/photo was saved, but it could not be displayed/i);
    expect(confirmProfilePhotoUpload).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: 'Retry Upload' })).not.toBeInTheDocument();
  });

  it('announces progress and disables repeated actions while an upload is pending', async () => {
    let resolveIntent;
    requestProfilePhotoUpload.mockReturnValue(new Promise((resolve) => { resolveIntent = resolve; }));
    choosePhoto();
    fireEvent.click(screen.getByRole('button', { name: 'Save Photo' }));

    expect(screen.getByRole('progressbar', { name: 'Profile photo upload progress' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();

    resolveIntent({
      uploadIntentId: 'intent-1',
      uploadUrl: 'https://storage.example.test/signed-put',
      requiredHeaders: {},
    });
    await waitFor(() => expect(confirmProfilePhotoUpload).toHaveBeenCalled());
  });
});
