export const getPhotoError = (photo) => {
    if (!photo) {
      return 'Profile photograph is required. Please upload or snap a photo.';
    }
    return '';
  };
export const getAddressError = (value) => {
    if (!value || !value.trim()) {
      return 'Residential address is required.';
    }
    if (value.trim().length < 10) {
      return 'Address must be at least 10 characters long.';
    }
    return '';
  };
export const getDobError = (value) => {
    if (!value) {
      return 'Date of birth is required.';
    }
  
    const selectedDate = new Date(value);
    const today = new Date();
  
    if (isNaN(selectedDate.getTime())) {
      return 'Please select a valid date.';
    }
  
    if (selectedDate > today) {
      return 'Date of birth cannot be in the future.';
    }
  
    // Teacher eligibility check: Minimum 18 years old
    const minAgeDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    if (selectedDate > minAgeDate) {
      return 'Faculty member must be at least 18 years of age.';
    }
    return '';
};
export const getGenderError = (value) => {
    if (!value || value.trim() === '') {
      return 'Please select a gender.';
    }
    return '';
};
export const getQualificationError = (value) => {
    if (!value || !value.trim()) {
      return 'Highest qualification is required.';
    }
    if (value.trim().length < 2) {
      return 'Qualification must be at least 2 characters.';
    }
    return '';
}; 
export const getDepartmentError = (value) => {
    if (!value || !value.trim()) {
      return 'Department is required.';
    }
    if (value.trim().length < 2) {
      return 'Department name must be at least 2 characters.';
    }
    return '';
}; 
export const getDesignationError = (value) => {
    if (!value || !value.trim()) {
      return 'Designation is required.';
    }
    const trimmed = value.trim();
    if (trimmed.length < 2) {
      return 'Designation must be at least 2 characters long.';
    }
    if (trimmed.length > 80) {
      return 'Designation cannot exceed 80 characters.';
    }
    if (!/[a-zA-Z]/.test(trimmed)) {
      return 'Please enter a valid designation title.';
    }
    return '';
};
export const getExperienceYearsError = (value) => {
    // Convert number to string if needed and handle empty checks
    const strVal = String(value ?? '').trim();
    if (!strVal) {
      return 'Experience is required.';
    }
    // 1. Must contain ONLY digits (0-9)
    if (!/^\d+$/.test(strVal)) {
      return 'Please enter only numbers.';
    }
    // 2. Realistic range check (e.g., 0 to 60 years)
    const years = parseInt(strVal, 10);
    if (years < 0 || years > 60) {
      return 'Experience must be between 0 and 60 years.';
    }
    return '';
};
export const getBiodataError = (value) => {
    if (!value || !value.trim()) {
      return 'Short Bio is required.';
    }
    const trimmed = value.trim();
    if (trimmed.length < 15) {
      return 'Short Bio must be at least 15 characters long.';
    }
    if (trimmed.length > 200) {
      return 'Short Bio cannot exceed 200 characters.';
    }
    if (!/[a-zA-Z]/.test(trimmed)) {
      return 'Please enter a valid short bio title.';
    }
    return '';
};