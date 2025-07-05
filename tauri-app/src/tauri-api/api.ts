export type TauriApiResponse<T> = {
  success: boolean,
  data?: T,
  error?: string, 
}