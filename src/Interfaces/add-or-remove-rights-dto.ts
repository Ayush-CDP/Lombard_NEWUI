export interface AddOrRemoveRightsDTO {
    dlName: string;
    dlOwner: string;
    action: 'Add' | 'Remove';
    /** Comma-separated ID(s); each must match [A-Za-z0-9._-]. */
    rights: string;
    source: 'OnPrem' | 'Cloud';
    sendMailAccess?: 'Allow' | 'Deny';
    groupOwnershipChange?: 'Allow' | 'Deny';
    requestorId?: string;
    requestorName?: string;
}
