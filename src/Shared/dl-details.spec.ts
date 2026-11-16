import { extractDlDetails } from './dl-details';

describe('extractDlDetails', () => {
  const owner = 'AKASH GOWDA /EXT/IT/ICICILOMBARD/BLR (ILOM35124)';

  it('reads the GroupMembership envelope { success, data }', () => {
    expect(extractDlDetails({ success: true, message: null, data: { dlName: 'TEST-DL-CRUD-', dlOwner: owner } }))
      .toEqual({ dlName: 'TEST-DL-CRUD-', dlOwner: owner });
  });

  it('reads the RightsManagement bare object (no envelope)', () => {
    expect(extractDlDetails({ dlName: 'TEST-DL-CRUD-', dlOwner: owner, action: null, empIds: null }))
      .toEqual({ dlName: 'TEST-DL-CRUD-', dlOwner: owner });
  });

  it('accepts PascalCase keys', () => {
    expect(extractDlDetails({ Data: { DLName: 'X-DL', DLOwner: 'Owner' } })).toEqual({ dlName: 'X-DL', dlOwner: 'Owner' });
  });

  it('keeps an empty owner as "" so the UI can show a placeholder', () => {
    expect(extractDlDetails({ dlName: 'X-DL', dlOwner: null })).toEqual({ dlName: 'X-DL', dlOwner: '' });
  });

  it('returns null when there is no DL name', () => {
    expect(extractDlDetails(null)).toBeNull();
    expect(extractDlDetails({ success: true, data: null })).toBeNull();
    expect(extractDlDetails({ success: false, message: 'x' })).toBeNull();
    expect(extractDlDetails({ dlName: '  ' })).toBeNull();
  });
});
