import React from 'react';
import AbstractPage from 'pages/abstract-page';

export default class Page404 extends AbstractPage {
  public render(): React.ReactNode {
    return (
      <div>
        <p>Page doesn`t exist.</p>
      </div>
    );
  }
}
