import { Injectable } from '@angular/core';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/** Same limits the API enforces. */
export const DL_NAME_MAX = 256;
// " “ ” „ ` $ and control characters.
const DL_NAME_FORBIDDEN = /["“”„`$\u0000-\u001F\u007F]/;
const ID_PATTERN = /^[A-Za-z0-9._-]{1,64}$/;
export const SOURCES = ['OnPrem', 'Cloud'] as const;
export const ACTIONS = ['Add', 'Remove'] as const;

@Injectable({
  providedIn: 'root',
})
export class ValidationService {

  /**
   * DL name. Mirrors the API: required, at most 256 characters, and no
   * quotes (" “ ” „), backtick, $ or control characters.
   */
  validateDLName(dlName: string | null | undefined): ValidationResult {
    const errors: string[] = [];
    const name = String(dlName ?? '').trim();

    if (!name) {
      errors.push('DL Name is required.');
    } else if (name.length < 3) {
      errors.push('DL Name must be at least 3 characters.');
    } else if (name.length > DL_NAME_MAX) {
      errors.push(`DL Name must be at most ${DL_NAME_MAX} characters.`);
    } else if (DL_NAME_FORBIDDEN.test(name)) {
      errors.push('DL name contains invalid characters.');
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

  /**
   * Comma-separated employee / NT IDs. Mirrors the API rule:
   * each ID is 1-64 letters, digits, '.', '_' or '-'.
   */
  validateIdList(value: string | null | undefined, label = 'ID'): ValidationResult {
    const errors: string[] = [];
    const ids = String(value ?? '')
      .split(',')
      .map((x) => x.trim())
      .filter((x) => x.length > 0);

    if (ids.length === 0) {
      errors.push(`Please enter at least one ${label}.`);
    } else if (!ids.every((id) => ID_PATTERN.test(id))) {
      errors.push(`One or more ${label}s are invalid. Use 1-64 letters, digits, '.', '_' or '-' per ID.`);
    }

    return { isValid: errors.length === 0, errors };
  }

  /** Source must be OnPrem or Cloud (always sent to the API). */
  validateSource(source: unknown): ValidationResult {
    return (SOURCES as readonly unknown[]).includes(source)
      ? { isValid: true, errors: [] }
      : { isValid: false, errors: ['Invalid source value. Allowed: OnPrem, Cloud.'] };
  }

  /** Source must be OnPrem or Cloud; Action must be Add or Remove. */
  validateSourceAndAction(source: unknown, action: unknown): ValidationResult {
    const errors: string[] = [];
    errors.push(...this.validateSource(source).errors);
    if (!(ACTIONS as readonly unknown[]).includes(action)) {
      errors.push("Action must be either 'Add' or 'Remove'.");
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
