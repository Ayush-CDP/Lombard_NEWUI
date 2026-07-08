import { Injectable } from '@angular/core';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

@Injectable({
  providedIn: 'root',
})
export class ValidationService {

  validateDLName(dlName: string | null | undefined): ValidationResult {
    const errors: string[] = [];

    if (!dlName || !dlName.trim()) {
      errors.push('DL Name is required.');
    } else if (dlName.trim().length < 3) {
      errors.push('DL Name must be at least 3 characters.');
    }

    return { isValid: errors.length === 0, errors };
  }


  validateUserEmail(email: string | null | undefined): ValidationResult {
    const errors: string[] = [];

    if (!email || !email.trim()) {
      errors.push('User Email is required.');
    } else {
      const emailRegex =
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

      if (!emailRegex.test(email.trim())) {
        errors.push('Invalid email format.');
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  validateRights(rights: any): ValidationResult {
    const errors: string[] = [];

    if (!rights) {
      errors.push('Rights data is missing.');
      return { isValid: false, errors };
    }

    if (!rights.dlName) {
      errors.push('Rights response missing DL Name.');
    }

    if (!rights.dlOwner) {
      errors.push('Rights response missing DL Owner.');
    }

    return { isValid: errors.length === 0, errors };
  }

  
  validateModifyRights(
    dlName: string,
    userEmail: string,
    rights: any
  ): ValidationResult {
    const errors: string[] = [];

    const dlCheck = this.validateDLName(dlName);
    if (!dlCheck.isValid) errors.push(...dlCheck.errors);

    const emailCheck = this.validateUserEmail(userEmail);
    if (!emailCheck.isValid) errors.push(...emailCheck.errors);

    const rightsCheck = this.validateRights(rights);
    if (!rightsCheck.isValid) errors.push(...rightsCheck.errors);

    return { isValid: errors.length === 0, errors };
  }
}
