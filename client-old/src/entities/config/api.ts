import Api from 'shared/api';
import ApiResponse from 'shared/api/response';

export function getConfig(): Promise<ApiResponse> {
  return Api.client.get('config');
}
