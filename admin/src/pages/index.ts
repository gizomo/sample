import Home from './home';
import Login from './login';
import Page404 from './404';
import Profile from './profile';
import Users from './users';

export enum RoutePath {
  HOME = '/',
  LOGIN = '/login',
  PROFILE = '/profile',
  USERS = '/users',
  PAGE_404 = '/404',
}

export const pagesRoutes = [
  {
    path: RoutePath.HOME,
    page: Home,
  },
  {
    path: RoutePath.LOGIN,
    page: Login,
  },
  {
    path: RoutePath.PROFILE,
    page: Profile,
  },
  {
    path: RoutePath.USERS,
    page: Users,
  },
  {
    path: RoutePath.PAGE_404,
    page: Page404,
  },
] as const;
