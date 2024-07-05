import React from 'react';
import {bind} from 'helpful-decorators';
import AbstractPage, {PropsPageType} from 'pages/abstract-page';
import Menu from 'widgets/menu';
import MenuItem from 'widgets/menu/item';
import PageHeader from 'widgets/page-header';
import Spin from 'shared/ui/spin';
import styles from './styles.module.scss';
import {Layout} from 'antd';

type HomeMenuItem = {
  active?: boolean;
  label: string;
  onClick: () => void;
};

export default class Home extends AbstractPage {
  private menu: HomeMenuItem[] = [
    {label: 'Home', onClick: () => console.log('Clicked on "Home" menuItem'), active: true},
    {label: 'About', onClick: () => console.log('Clicked on "About" menuItem')},
  ];

  constructor(props: PropsPageType) {
    super(props);

    this.connect([{storeName: 'user', onFailed: () => this.openAndReset(this.routes.LOGIN)}]);
  }

  @bind
  private renderMenuItem(item: HomeMenuItem, index: number): React.ReactNode {
    return <MenuItem index={index} label={item.label} active={item.active} onClick={item.onClick} />;
  }

  public render(): React.ReactNode {
    if (this.$stores.user.isEmpty) {
      return (
        <Layout className={styles.empty}>
          <Spin />
        </Layout>
      );
    }

    return (
      <Layout className={styles.root}>
        <PageHeader />
        <Menu items={this.menu} renderItem={this.renderMenuItem} />
      </Layout>
    );
  }
}
