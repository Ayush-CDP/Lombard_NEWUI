export interface AddOrRemoveDLMembershipDTO {
    DLName : string;
    DLOwner : string;
    Action : string;
    EmpIds : string;
    Source: 'OnPrem' | 'Cloud';
}


