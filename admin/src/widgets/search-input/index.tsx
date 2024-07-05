import React from 'react';
import AbstractWidget from 'widgets/abstract-widget';
import {Input} from 'antd';
import {SearchOutlined, LoadingOutlined} from '@ant-design/icons';
import {bind} from 'helpful-decorators';

export type SearchPropsType = {
  onSearch?: (value: string) => void;
  searching?: boolean;
};

export default class SearchInput extends AbstractWidget<SearchPropsType> {
  private value: string = '';

  private styles: React.CSSProperties = {
    display: 'flex',
    height: '3.5rem',
    maxWidth: '20vw',
    paddingLeft: '1rem',
    paddingRight: '1rem',
    alignItems: 'center',
    borderRadius: '1rem',
    color: 'var(--color-primary)',
    backgroundColor: 'var(--color-light)',
  };

  private iconStyles: React.CSSProperties = {
    fontSize: '1.25rem',
    color: 'var(--color-primary)',
  };

  private loadingStyles: React.CSSProperties = {
    fontSize: '1.25rem',
    color: 'var(--color-inactive)',
  };

  @bind
  private onChange({target: {value}}: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void {
    this.value = value;
  }

  @bind
  private onPressEnter(): void {
    if (this.props.onSearch) {
      this.props.onSearch(this.value);
    }
  }

  public render(): React.ReactNode {
    return (
      <Input
        style={this.styles}
        placeholder="Search"
        size="large"
        suffix={
          this.props.searching ? (
            <LoadingOutlined style={this.loadingStyles} />
          ) : (
            <SearchOutlined style={this.iconStyles} onClick={this.onPressEnter} />
          )
        }
        bordered={false}
        onChange={this.onChange}
        onPressEnter={this.onPressEnter}
      />
    );
  }
}
