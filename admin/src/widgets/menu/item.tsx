import React from 'react';
import AbstractWidget from 'widgets/abstract-widget';
import styles from './styles.module.scss';

type MenuItemProps = {
  label: string;
  index: number;
  active?: boolean;
  onClick?: (...args: any[]) => any;
};

export default class MenuItem extends AbstractWidget<MenuItemProps> {
  public render(): React.ReactNode {
    return (
      <div
        key={this.props.index}
        className={this.props.active ? styles.menuItemActive : styles.menuItem}
        onClick={this.props.onClick}>
        <p>{this.props.label}</p>
      </div>
    );
  }
}
