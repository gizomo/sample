import React from 'react';
import {bind} from 'helpful-decorators';
import AbstractPage, {PropsPageType} from 'pages/abstract-page';
import Menu from 'widgets/menu';
import MenuItem from 'widgets/menu/item';
import PageHeader from 'widgets/page-header';
import Spin from 'shared/ui/spin';
import styles from './styles.module.scss';
import {Layout, Typography, Descriptions} from 'antd';

type ProfileMenuItem = {
  label: string;
  active?: boolean;
  onClick?: () => void;
};

export default class Profile extends AbstractPage {
  private menu: ProfileMenuItem[] = [
    {label: 'Profile', active: true},
    {label: 'Users', onClick: this.onClickUsers},
    {label: 'Logout', onClick: this.onClickLogout},
  ];

  constructor(props: PropsPageType) {
    super(props);

    this.connect([{storeName: 'user', onFailed: () => this.openAndReset(this.routes.LOGIN)}]);
  }

  @bind
  private onClickUsers(): void {
    this.open(this.routes.USERS);
  }

  @bind
  private onClickLogout(): void {
    this.$stores.user.logout().then(() => this.openAndReset(this.routes.LOGIN));
  }

  @bind
  private renderMenuItem(item: ProfileMenuItem, index: number): React.ReactNode {
    return <MenuItem index={index} label={item.label} active={item.active} onClick={item.onClick} />;
  }

  private renderUserInfo(): React.ReactNode {
    return (
      <Descriptions
        className={styles.description}
        title={
          <Typography.Title className={styles.descriptionTitle} level={2}>
            {this.stores.user.username?.toUpperCase()}
          </Typography.Title>
        }>
        <Descriptions.Item className={styles.descriptionLabel} label="First name">
          {this.stores.user.firstName}
        </Descriptions.Item>
        <Descriptions.Item className={styles.descriptionLabel} label="Last Name">
          {this.stores.user.lastName}
        </Descriptions.Item>
        <Descriptions.Item className={styles.descriptionLabel} label="E-mail">
          {this.stores.user.email}
        </Descriptions.Item>
        <Descriptions.Item className={styles.descriptionLabel} label="Phone">
          {this.stores.user.phone}
        </Descriptions.Item>
        <Descriptions.Item className={styles.descriptionLabel} label="Birth date">
          {this.stores.user.birthDate?.getDateDMY()}
        </Descriptions.Item>
        <Descriptions.Item className={styles.descriptionLabel} label="Balance">
          {this.stores.user.balanceFormatted}
        </Descriptions.Item>
      </Descriptions>
    );
  }

  public render(): React.ReactNode {
    return (
      <Layout className={styles.root}>
        <PageHeader />
        <Menu items={this.menu} renderItem={this.renderMenuItem} />
        {this.$stores.user.isEmpty ? <Spin /> : this.renderUserInfo()}
      </Layout>
    );
  }
}
