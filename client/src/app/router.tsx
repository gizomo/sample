import {Suspense} from 'react';
import {Switch, Route, Redirect, BrowserRouter, withRouter} from 'react-router-dom';
import Spin from 'shared/ui/spin';
import {pagesRoutes, Routes, RouteType} from 'pages';

export type RouterType = () => JSX.Element;

export const router =
  (component: () => React.ReactNode): RouterType =>
  (): JSX.Element =>
    (
      <BrowserRouter>
        <Suspense fallback={<Spin />}>{component()}</Suspense>
      </BrowserRouter>
    );

export default (): JSX.Element => (
  <Switch>
    {pagesRoutes.map(
      ({path, page}: RouteType): JSX.Element => (
        <Route key={path} path={path} component={withRouter(page)} exact />
      )
    )}
    <Redirect to={Routes.PAGE_404} />
  </Switch>
);
