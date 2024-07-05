import React from 'react';
import {bind} from 'helpful-decorators';
import AbstractPage, {PropsPageType} from 'pages/abstract-page';
import Menu from 'widgets/menu';
import MenuItem from 'widgets/menu/item';
import PageHeader from 'widgets/page-header';
import SearchInput from 'widgets/search-input';
import Spin from 'shared/ui/spin';
import UserAvatar from 'widgets/user-avatar';
import styles from './styles.module.scss';
import {Layout, Table, Tag, Pagination} from 'antd';
import {ColumnsType} from 'antd/es/table';
import {PagesBuffer} from 'shared/lib/pages-buffer';
import User from 'entities/user/model';

type ProfileMenuItem = {
  label: string;
  active?: boolean;
  onClick?: () => void;
};

interface DataType {
  key: string;
  name: string;
  age: number;
  address: string;
  tags: string[];
}

export default class Users extends AbstractPage {
  private menu: ProfileMenuItem[] = [
    {label: 'Profile', onClick: this.onClickProfile},
    {label: 'Users', active: true},
    {label: 'Logout', onClick: this.onClickLogout},
  ];

  private pageSize: number = 10;
  private users!: PagesBuffer<User>;

  constructor(props: PropsPageType) {
    super(props);

    this.connect([{storeName: 'user', onFailed: () => this.openAndReset(this.routes.LOGIN)}]).then(() => {
      this.users = this.$stores.user.getUsersBuffer(this.stores.user.getBufferKey(), 1, this.pageSize);

      if (!this.users.isInitialized) {
        this.users.loadNextPage().then(() => this.updateUsers(this.users.items));
      } else {
        this.onPageChange(1);
      }
    });
  }

  @bind
  private onClickProfile(): void {
    this.open(this.routes.PROFILE);
  }

  @bind
  private onClickLogout(): void {
    this.$stores.user.logout().then(() => this.openAndReset(this.routes.LOGIN));
  }

  @bind
  private renderMenuItem(item: ProfileMenuItem, index: number): React.ReactNode {
    return <MenuItem index={index} label={item.label} active={item.active} onClick={item.onClick} />;
  }

  private renderTable(): any {
    const columns: ColumnsType<DataType> = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        render: text => <a>{text}</a>,
      },
      {
        title: 'Age',
        dataIndex: 'age',
        key: 'age',
      },
      {
        title: 'Address',
        dataIndex: 'address',
        key: 'address',
      },
      {
        title: 'Tags',
        key: 'tags',
        dataIndex: 'tags',
        render: (_, {tags}) => (
          <>
            {tags.map(tag => {
              let color = tag.length > 5 ? 'geekblue' : 'green';
              if (tag === 'inactive') {
                color = 'volcano';
              }
              return (
                <Tag color={color} key={tag}>
                  {tag.toUpperCase()}
                </Tag>
              );
            })}
          </>
        ),
      },
    ];

    if (this.state.data) {
      return [
        <Table
          key={'table'}
          style={{padding: '2rem'}}
          columns={columns}
          dataSource={this.state.data}
          pagination={false}
        />,
        <Pagination defaultCurrent={1} total={this.users.getTotal()} onChange={this.onPageChange} />,
      ];
    }

    return <Spin />;
  }

  @bind
  private onPageChange(page: number): void {
    this.users.loadPage(page).then(() => {
      const start = page > 1 ? page * this.pageSize - this.pageSize : 0;
      const users = this.users.items.slice(start, start + this.pageSize);
      this.updateUsers(users);
    });
  }

  private updateUsers(users: User[]): void {
    this.setState({
      data: users.map((user, index) => ({
        key: index,
        name: user.usernameFormatted,
        age: user.age,
        address: user.email,
        tags: [user.isActive ? 'active' : user.isBanned ? 'banned' : 'inactive'],
      })),
    });
  }

  public render(): React.ReactNode {
    return (
      <Layout className={styles.root}>
        <PageHeader />
        <Menu items={this.menu} renderItem={this.renderMenuItem} />
        {this.renderTable()}
      </Layout>
    );
  }
}
