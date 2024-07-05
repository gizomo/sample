import Api from 'shared/api';

export function getConfig(): Promise<any> {
  return Api.get('config-admin').then(response => response.getData());
}
