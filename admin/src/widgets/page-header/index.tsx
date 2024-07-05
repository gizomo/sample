import React from 'react';
import {bind} from 'helpful-decorators';
import AbstractWidget from 'widgets/abstract-widget';
import SearchInput from 'widgets/search-input';
import UserAvatar from 'widgets/user-avatar';
import styles from './styles.module.scss';

export default class PageHeader extends AbstractWidget {
  constructor(props: SomeObjectType) {
    super(props);

    this.connect(['user']);
  }

  @bind
  private onSearch(value: string): void {
    console.log('Search:', value);
    this.setState({searching: true});
    setTimeout(() => this.setState({searching: false}), 2000);
  }

  @bind
  private onClickAvatar(): void {
    console.log('profile pressed', this.props.history);
    // this.open(this.routes.PROFILE);
  }

  public render(): React.ReactNode {
    return (
      <div className={styles.root}>
        {!this.$stores.config.isEmpty && <img className={styles.logo} src={this.stores.config.logo} />}
        <SearchInput onSearch={this.onSearch} searching={this.state.searching} />
        {!this.$stores.user.isEmpty && (
          <UserAvatar user={this.stores.user} bordered={true} onClick={this.onClickAvatar} />
        )}
      </div>
    );
  }
}
