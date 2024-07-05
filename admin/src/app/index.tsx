import React from 'react';
import {compose} from 'lodash/fp';
import Routing, {routerProvider} from './router';
import './styles/index.scss';

export type ContextProviderType = (component: () => React.ReactNode) => () => React.ReactNode;

const providers = compose(routerProvider);

export default providers(
  (): React.ReactNode => (
    <div className="app">
      <Routing />
    </div>
  )
);
