import {RouteComponentProps} from 'react-router';
import {RoutePath} from './index';
import AbstractComponent from 'widgets/abstract-component';

export type PropsPageType = RouteComponentProps<SomeObjectType>;

export default abstract class AbstractPage extends AbstractComponent<PropsPageType> {
  protected get params(): SomeObjectType {
    return this.props.match.params;
  }

  public routes: typeof RoutePath = RoutePath;

  public open(path: RoutePath): void {
    this.props.history.push(path);
  }

  public replace(path: RoutePath): void {
    this.props.history.replace(path);
  }

  public openAndReset(path: RoutePath): void {
    this.props.history.go(-this.props.history.length);
    this.open(path);
  }

  protected goBack(): void {
    this.props.history.goBack();
  }
}
