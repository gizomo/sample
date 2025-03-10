import {ComponentType} from 'react';
import Home from './home';
import Page404 from './404';

export type RouteType = {
  path: string;
  page: ComponentType<any>;
};

export enum Routes {
  HOME = '/',
  PAGE_404 = '/404',
}

export const pagesRoutes: RouteType[] = [
  {
    path: Routes.HOME,
    page: Home,
  },
  {
    path: Routes.PAGE_404,
    page: Page404,
  },
];
