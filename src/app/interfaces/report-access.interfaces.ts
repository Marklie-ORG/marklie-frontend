export interface RequestReportAccessPayload {
  name: string;
  email: string;
  message?: string;
}

export interface RequestReportAccessResponse {
  message: string;
}
