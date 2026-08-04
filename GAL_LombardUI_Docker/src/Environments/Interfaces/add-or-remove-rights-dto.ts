export interface AddOrRemoveRightsDTO {
    DLName : string;
    DLOwner : string;
    Action : string;
    Rights : string;
    Source: 'OnPrem' | 'Cloud';
    SendMailAccess?: 'Allow' | 'Deny';
    GroupOwnershipChange?: 'Allow' | 'Deny';
}
