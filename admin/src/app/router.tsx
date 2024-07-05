import {Suspense} from 'react';
import {Switch, Route, Redirect, BrowserRouter, withRouter} from 'react-router-dom';
import Spin from 'shared/ui/spin';
import {pagesRoutes, RoutePath} from 'pages';
import {ContextProviderType} from 'app';

export const routerProvider: ContextProviderType = component => () =>
  (
    <BrowserRouter>
      <Suspense fallback={<Spin />}>{component()}</Suspense>
    </BrowserRouter>
  );

export default (): JSX.Element => (
  <Switch>
    {pagesRoutes.map(
      ({path, page}): JSX.Element => (
        <Route key={path} path={path} component={withRouter(page)} exact />
      )
    )}
    <Redirect to={RoutePath.PAGE_404} />
  </Switch>
);
