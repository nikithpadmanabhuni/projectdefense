/**
 * onboarding.js
 * Form validation, pre-filling, and storage logic for the profile setup page.
 */

import { saveProfile, getProfile, clearProfile } from './storage.js';

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('onboarding-form');
  const clearBtn = document.getElementById('clear-profile-btn');
  const statusMessage = document.getElementById('form-status-message');

  if (!form) return;

  // Pre-fill existing profile if available
  const existingProfile = getProfile();
  if (existingProfile) {
    prefillForm(existingProfile);
    if (clearBtn) {
      clearBtn.classList.remove('hidden');
    }
  }

  // Handle form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearAllErrors();

    const data = getFormData();
    const errors = validateFormData(data);

    if (Object.keys(errors).length > 0) {
      renderInlineErrors(errors);
      showStatus('Please fix the highlighted errors above.', 'error');
      return;
    }

    const saved = saveProfile(data);
    if (saved) {
      showStatus('Profile saved successfully! Redirecting to dashboard...', 'success');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 700);
    } else {
      showStatus('Could not save profile. Check browser storage permissions.', 'error');
    }
  });

  // Handle clear profile button
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      const confirmed = window.confirm('Are you sure you want to delete your saved profile? This cannot be undone.');
      if (confirmed) {
        clearProfile();
        form.reset();
        clearBtn.classList.add('hidden');
        showStatus('Profile cleared.', 'success');
      }
    });
  }

  function getFormData() {
    const nameEl = document.getElementById('fullName');
    const collegeEl = document.getElementById('college');
    const branchEl = document.getElementById('branch');
    const yearEl = document.getElementById('year');
    const roleEl = document.getElementById('targetRole');
    const projectsEl = document.getElementById('projectCount');
    const langEl = document.getElementById('mainLanguage');
    const internshipChecked = document.querySelector('input[name="internship"]:checked');

    return {
      fullName: nameEl ? nameEl.value.trim() : '',
      college: collegeEl ? collegeEl.value.trim() : '',
      branch: branchEl ? branchEl.value : '',
      year: yearEl ? yearEl.value : '',
      targetRole: roleEl ? roleEl.value : '',
      projectCount: projectsEl ? parseInt(projectsEl.value, 10) : NaN,
      internship: internshipChecked ? internshipChecked.value : '',
      mainLanguage: langEl ? langEl.value : ''
    };
  }

  function validateFormData(data) {
    const errors = {};

    // Full name: required, 2-60 chars
    if (!data.fullName) {
      errors.fullName = 'Full name is required.';
    } else if (data.fullName.length < 2 || data.fullName.length > 60) {
      errors.fullName = 'Full name must be between 2 and 60 characters.';
    }

    // Branch
    const validBranches = ['CSE', 'IT', 'ECE', 'Other'];
    if (!validBranches.includes(data.branch)) {
      errors.branch = 'Please select a valid branch.';
    }

    // Year
    const validYears = ['2nd Year', '3rd Year', '4th Year'];
    if (!validYears.includes(data.year)) {
      errors.year = 'Please select your current year.';
    }

    // Target Role
    const validRoles = ['Web Developer', 'Mobile Developer (Flutter/Android)', 'Backend Developer', 'Data/AI', 'Not sure yet'];
    if (!validRoles.includes(data.targetRole)) {
      errors.targetRole = 'Please select a target role.';
    }

    // Project Count: number 0-50
    if (isNaN(data.projectCount) || data.projectCount < 0 || data.projectCount > 50) {
      errors.projectCount = 'Enter a valid number of projects between 0 and 50.';
    }

    // Internship: required radio
    if (!data.internship || !['Yes', 'No'].includes(data.internship)) {
      errors.internship = 'Please specify whether you completed an internship.';
    }

    // Main Language
    const validLangs = ['Java', 'Python', 'C++', 'C', 'JavaScript', 'Dart', 'Other'];
    if (!validLangs.includes(data.mainLanguage)) {
      errors.mainLanguage = 'Please select your main coding language.';
    }

    return errors;
  }

  function renderInlineErrors(errors) {
    for (const [fieldId, errorMsg] of Object.entries(errors)) {
      const errorEl = document.getElementById(`error-${fieldId}`);
      const inputEl = document.getElementById(fieldId);

      if (errorEl) {
        errorEl.textContent = errorMsg;
        errorEl.classList.remove('hidden');
      }

      if (inputEl) {
        inputEl.classList.add('border-red-500');
        inputEl.setAttribute('aria-invalid', 'true');
      }
    }

    // Focus the first invalid element for accessibility
    const firstInvalidKey = Object.keys(errors)[0];
    const firstInvalidEl = document.getElementById(firstInvalidKey);
    if (firstInvalidEl) {
      firstInvalidEl.focus();
    }
  }

  function clearAllErrors() {
    const errorContainers = document.querySelectorAll('.inline-error');
    errorContainers.forEach((el) => {
      el.textContent = '';
      el.classList.add('hidden');
    });

    const inputs = form.querySelectorAll('input, select');
    inputs.forEach((input) => {
      input.classList.remove('border-red-500');
      input.removeAttribute('aria-invalid');
    });

    if (statusMessage) {
      statusMessage.textContent = '';
      statusMessage.className = 'hidden';
    }
  }

  function prefillForm(profile) {
    if (profile.fullName) document.getElementById('fullName').value = profile.fullName;
    if (profile.college) document.getElementById('college').value = profile.college;
    if (profile.branch) document.getElementById('branch').value = profile.branch;
    if (profile.year) document.getElementById('year').value = profile.year;
    if (profile.targetRole) document.getElementById('targetRole').value = profile.targetRole;
    if (typeof profile.projectCount === 'number') document.getElementById('projectCount').value = profile.projectCount;
    if (profile.mainLanguage) document.getElementById('mainLanguage').value = profile.mainLanguage;

    if (profile.internship === 'Yes') {
      const r = document.getElementById('internship-yes');
      if (r) r.checked = true;
    } else if (profile.internship === 'No') {
      const r = document.getElementById('internship-no');
      if (r) r.checked = true;
    }
  }

  function showStatus(text, type) {
    if (!statusMessage) return;
    statusMessage.textContent = text;
    statusMessage.className = `p-3 rounded-lg text-xs font-medium block ${
      type === 'success'
        ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
        : 'bg-red-950/40 text-red-300 border border-red-500/30'
    }`;
  }
});
}
