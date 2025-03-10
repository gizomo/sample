import React from 'react';
import AbstractPage, {PageProps} from 'pages/abstract-page';
import {Button, Form, Input, Layout, Typography} from 'antd';
import Spin from 'shared/ui/spin';
import {bind} from 'helpful-decorators';
import styles from './styles.module.scss';
import User from 'entities/user/store';

export default class Home extends AbstractPage {
  constructor(props: PageProps) {
    super(props);
  }

  @bind
  private onFinish(values: SomeObjectType): void {
    User.login(values.email, values.password);
  }

  @bind
  private onFailed(): void {}

  public render(): React.ReactNode {
    return (
      <Layout className={styles.root}>
        <div className={styles.form}>
          <Typography.Title level={2}>Login</Typography.Title>

          <Form
            name="login"
            labelCol={{span: 8}}
            wrapperCol={{span: 16}}
            initialValues={{remember: true}}
            onFinish={this.onFinish}
            onFinishFailed={this.onFailed}
            autoComplete="off">
            <Form.Item label="E-mail" name="email" rules={[{required: true, message: 'Please input your e-mail!'}]}>
              <Input />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[{required: true, message: 'Please input your password!'}]}>
              <Input.Password />
            </Form.Item>

            <Form.Item wrapperCol={{offset: 8, span: 16}}>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Layout>
    );
  }
}
