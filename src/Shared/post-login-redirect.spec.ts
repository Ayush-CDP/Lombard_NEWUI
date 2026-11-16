import {
  clearPostLoginRedirect,
  consumePostLoginRedirect,
  isSafeInternalPath,
  savePostLoginRedirect,
} from './post-login-redirect';

describe('post-login redirect', () => {
  beforeEach(() => sessionStorage.clear());
  afterEach(() => sessionStorage.clear());

  it('accepts internal app paths', () => {
    expect(isSafeInternalPath('/approval?id=abc-123')).toBeTrue();
    expect(isSafeInternalPath('/dashboard/group-membership')).toBeTrue();
  });

  it('rejects open-redirect and unsafe values', () => {
    for (const bad of [
      'https://evil.com',
      '//evil.com/path',
      '/\\evil.com',
      '/approval?next=javascript:alert(1)',
      'approval?id=1',
      '/ approval',
      '/approval\n',
      '',
      null,
      undefined,
      42,
    ]) {
      expect(isSafeInternalPath(bad as any)).withContext(String(bad)).toBeFalse();
    }
  });

  it('rejects targets that would loop back to login or root', () => {
    expect(isSafeInternalPath('/login')).toBeFalse();
    expect(isSafeInternalPath('/login?x=1')).toBeFalse();
    expect(isSafeInternalPath('/')).toBeFalse();
  });

  it('save + consume returns the URL once', () => {
    savePostLoginRedirect('/approval?id=42');
    expect(consumePostLoginRedirect()).toBe('/approval?id=42');
    expect(consumePostLoginRedirect()).toBeNull();
  });

  it('does not save unsafe URLs', () => {
    savePostLoginRedirect('//evil.com');
    expect(sessionStorage.getItem('postLoginRedirect')).toBeNull();
  });

  it('ignores a tampered stored value', () => {
    sessionStorage.setItem('postLoginRedirect', 'https://evil.com');
    expect(consumePostLoginRedirect()).toBeNull();
    expect(sessionStorage.getItem('postLoginRedirect')).toBeNull();
  });

  it('clear removes the value', () => {
    savePostLoginRedirect('/approval?id=1');
    clearPostLoginRedirect();
    expect(consumePostLoginRedirect()).toBeNull();
  });
});
