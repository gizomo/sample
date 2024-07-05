import React from 'react';
import AbstractWidget from 'widgets/abstract-widget';
import styles from './styles.module.scss';

type MenuProps<Item> = {
  items: Item[];
  renderItem: (item: Item, index: number, array: Item[]) => React.ReactNode;
};

export default class Menu<Item = unknown> extends AbstractWidget<MenuProps<Item>> {
  private renderItems(): React.ReactNode[] {
    return this.props.items.map(this.props.renderItem);
  }

  public render(): React.ReactNode {
    return <div className={styles.menu}>{this.renderItems()}</div>;
  }
}
