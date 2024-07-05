import React from 'react';
import AbstractWidget from 'widgets/abstract-widget';
import {Avatar} from 'antd';
import {UserOutlined} from '@ant-design/icons';
import styles from './styles.module.scss';
import User from 'entities/user/model';
import {bind} from 'helpful-decorators';

type UserAvatarProps = {
  user: User;
  bordered?: boolean;
  onClick?: (user: User) => void;
};

export default class UserAvatar extends AbstractWidget<UserAvatarProps> {
  @bind
  private onClick(): void {
    if (this.props.onClick) {
      this.props.onClick(this.props.user);
    }
  }

  public render(): React.ReactNode {
    return (
      <Avatar
        className={this.props.bordered ? styles.bordered : styles.avatar}
        size={56}
        icon={<UserOutlined />}
        alt={this.props.user.username}
        onClick={this.onClick}
      />
    );
  }
}
