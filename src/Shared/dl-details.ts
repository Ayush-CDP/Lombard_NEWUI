export interface DlDetails {
  dlName: string;
  dlOwner: string;
}

/**
 * Reads DL details from a "get DL" API response, whatever its shape:
 *  - GroupMembership:  { success, message, data: { dlName, dlOwner, ... } }
 *  - RightsManagement: { dlName, dlOwner, ... }   (no envelope)
 * PascalCase keys (DLName / DLOwner) are accepted too.
 * Returns null when the response carries no DL name.
 */
export function extractDlDetails(res: any): DlDetails | null {
  if (!res || typeof res !== 'object') {
    return null;
  }
  const hasEnvelope = 'data' in res || 'Data' in res;
  const body = hasEnvelope ? (res.data ?? res.Data) : res;
  if (!body || typeof body !== 'object') {
    return null;
  }

  const dlName = String(body.dlName ?? body.DLName ?? body.dlname ?? '').trim();
  if (!dlName) {
    return null;
  }
  const dlOwner = String(body.dlOwner ?? body.DLOwner ?? body.dlowner ?? '').trim();
  return { dlName, dlOwner };
}

/** Shown in the DL Owner cell when the API returns no owner. */
export const NO_OWNER_TEXT = 'No owner assigned';
