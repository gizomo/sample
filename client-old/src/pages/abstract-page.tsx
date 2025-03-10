import React, {PropsWithChildren} from 'react';
import {RouteComponentProps} from 'react-router';
import {Stores} from 'entities/index';
import {Routes} from './index';
import {getRoute} from 'shared/lib/helpers';

export type PageParams = {[key: string]: string};
export type PageState = SomeObjectType;
export type PageProps = RouteComponentProps<PageParams> & PropsWithChildren;

export default abstract class AbstractPage extends React.Component<PageProps, PageState> {
  protected constructor(props: PageProps) {
    super(props);

    this.state = {};
  }

  protected get params(): PageParams {
    return this.props.match.params;
  }

  protected get stores(): typeof Stores {
    return Stores;
  }

  protected routeTo(route: string, params?: SomeObjectType): string {
    return getRoute(route, params);
  }

  public open(path: Routes): void {
    this.props.history.push(path);
  }

  public replace(path: Routes): void {
    this.props.history.replace(path);
  }

  public openAndReset(path: Routes): void {
    this.props.history.go(-this.props.history.length);
    this.open(path);
  }

  public goBack(): void {
    this.props.history.goBack();
  }
}
