export interface AccountUnlockRequestDTO {
    DLOwner : string;
    DLName : string;
    EmployeeId : string;
    Unlock : boolean;
}


export interface AccountUnlockStatus {
  employeeId: string;
  isLocked: boolean;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}
