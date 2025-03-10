import React from 'react';
import AbstractPage, {PageProps} from 'pages/abstract-page';

export default class Page404 extends AbstractPage {
  constructor(props: PageProps) {
    super(props);
  }

  public render(): React.ReactNode {
    return (
      <div>
        <p>Page doesn`t exist.</p>
      </div>
    );
  }
}
