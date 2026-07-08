export interface AccountUnlockRequestDTO {
    DLOwner : string;
    DLName : string;
    EmployeeId : string;
    Unlock : boolean;
}


export interface AccountUnlockStatus {
  employeeId: string;
  isLocked: boolean;
  accountStatus: string;     // Enabled / Disabled
  accountExpiry: string;     // Date or "Never"
  passwordStatus: string;    // Expiry date or "Password Expired"
  info: string;              // AD info attribute
  message?: string;          // optional (only if backend sends it)
}


export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}
