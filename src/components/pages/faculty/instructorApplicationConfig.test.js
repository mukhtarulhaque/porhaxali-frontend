import { describe, expect, it } from 'vitest';
import { getTeachingExperienceDescriptionError } from './facultyComponents/Validator';
import { getInstructorSubmissionIssue } from './instructorApplicationConfig';

const requiredTypes = [
  { code: 'IDENTITY_PROOF', label: 'Identity Proof' },
  { code: 'EDUCATIONAL_CERTIFICATE', label: 'Educational Certificate' },
];

const readyApplication = {
  applicantName: 'Asha Das',
  applicantEmail: 'asha@example.com',
  phoneNumber: '+91 99999 88888',
  dateOfBirth: '1994-05-12',
  address: 'Guwahati, Assam',
  teachingExperienceYears: 0,
  teachingExperienceDescription: 'Tutored secondary mathematics.',
  bio: 'Patient and practical educator.',
  qualifications: [{ qualificationName: 'B.Ed.' }],
  subjects: [{ subjectId: 4, subjectStatus: 'ACTIVE' }],
  profilePhotoPresent: true,
  documents: [
    {
      documentType: 'IDENTITY_PROOF',
      originalFileName: 'identity.pdf',
      mimeType: 'application/pdf',
      fileSize: 1024,
      verificationStatus: 'PENDING',
    },
    {
      documentType: 'EDUCATIONAL_CERTIFICATE',
      originalFileName: 'degree.pdf',
      mimeType: 'application/pdf',
      fileSize: 2048,
      verificationStatus: 'PENDING',
    },
  ],
};

describe('instructor application submission readiness', () => {
  it('treats the backend-required teaching description as mandatory', () => {
    expect(getTeachingExperienceDescriptionError('')).toBe('Teaching experience description is required.');
    expect(getTeachingExperienceDescriptionError('  ')).toBe('Teaching experience description is required.');
    expect(getTeachingExperienceDescriptionError('Classroom teaching')).toBe('');
  });

  it('accepts a complete application, including zero years of experience', () => {
    expect(getInstructorSubmissionIssue(readyApplication, requiredTypes)).toBeNull();
  });

  it.each([
    [{ phoneNumber: '' }, 1, /phone number/i],
    [{ teachingExperienceDescription: '' }, 2, /teaching experience description/i],
    [{ qualifications: [] }, 2, /qualification/i],
    [{ subjects: [] }, 2, /subject/i],
    [{ subjects: [{ subjectId: 4, subjectStatus: 'INACTIVE' }] }, 2, /inactive subjects/i],
    [{ profilePhotoPresent: false }, 1, /profile photograph/i],
    [{ documents: readyApplication.documents.slice(0, 1) }, 3, /Educational Certificate/i],
  ])('identifies incomplete server state before POST submit', (change, step, message) => {
    const issue = getInstructorSubmissionIssue({ ...readyApplication, ...change }, requiredTypes);

    expect(issue.step).toBe(step);
    expect(issue.message).toMatch(message);
  });

  it('requires a rejected document to be replaced', () => {
    const issue = getInstructorSubmissionIssue({
      ...readyApplication,
      documents: readyApplication.documents.map((document) => document.documentType === 'IDENTITY_PROOF'
        ? { ...document, verificationStatus: 'REJECTED' }
        : document),
    }, requiredTypes);

    expect(issue).toEqual({
      step: 3,
      message: 'Replace the rejected Identity Proof before submitting.',
    });
  });
});
