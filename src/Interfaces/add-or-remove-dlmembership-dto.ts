export interface AddOrRemoveDLMembershipDTO {
    dlName: string;
    dlOwner: string;
    action: 'Add' | 'Remove';
    empIds: string;
    source: 'OnPrem' | 'Cloud';
    sendMailAccess?: string | null;
    groupOwnershipChange?: string | null;
    requestorId?: string;
    requestorName?: string;
}
