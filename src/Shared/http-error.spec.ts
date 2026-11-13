import { getApiErrorMessage } from './http-error';

describe('getApiErrorMessage', () => {
  it('reads message from the { success, message, data } envelope', () => {
    const err = { status: 400, error: { success: false, message: 'Requestor ID is missing or invalid.', data: null } };
    expect(getApiErrorMessage(err, 'x')).toBe('Requestor ID is missing or invalid.');
  });

  it('returns a plain-text body as is', () => {
    expect(getApiErrorMessage({ error: '500 Server Error' }, 'x')).toBe('500 Server Error');
  });

  it('parses a JSON envelope delivered as text (responseType: text)', () => {
    const err = { error: JSON.stringify({ success: false, message: "Action must be either 'Add' or 'Remove'." }) };
    expect(getApiErrorMessage(err, 'x')).toBe("Action must be either 'Add' or 'Remove'.");
  });

  it('joins ASP.NET model-validation errors', () => {
    const err = { error: { title: 'One or more validation errors occurred.', errors: { EmpIds: ['a'], Source: ['b'] } } };
    expect(getApiErrorMessage(err, 'x')).toBe('a | b');
  });

  it('uses the fallback when there is no usable body', () => {
    expect(getApiErrorMessage({ status: 0, error: null }, 'Operation failed.')).toBe('Operation failed.');
    expect(getApiErrorMessage({ error: '   ' }, 'Operation failed.')).toBe('Operation failed.');
    expect(getApiErrorMessage(undefined, 'Operation failed.')).toBe('Operation failed.');
  });
});
