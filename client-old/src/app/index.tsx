import React from 'react';
import Providers from './providers';
import Routing from './router';
import './styles/index.scss';

export default Providers(
  (): JSX.Element => (
    <div className="app">
      <Routing />
    </div>
  )
);
