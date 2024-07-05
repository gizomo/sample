import React from 'react';
import {bind} from 'helpful-decorators';
import AbstractPage from 'pages/abstract-page';
import {Alert, Button, Form, Input, Layout, Space, Typography} from 'antd';
import styles from './styles.module.scss';

export default class Login extends AbstractPage {
  @bind
  private onFinish(values: SomeObjectType): void {
    this.$stores.user.login(values.email, values.password).then(
      () => this.open(this.routes.HOME),
      () => this.setState({error: 'User is not found'})
    );
  }

  @bind
  private onErrorClose(): void {
    this.setState({error: undefined});
  }

  // @bind
  // private onFailed(): void {}

  public render(): React.ReactNode {
    return (
      <Layout className={styles.root}>
        <div className={styles.form}>
          <Typography.Title level={2}>Login</Typography.Title>

          <Space direction="vertical">
            {this.state.error && <Alert message={this.state.error} type="error" closable onClose={this.onErrorClose} />}

            <Form
              name="login"
              labelCol={{span: 8}}
              wrapperCol={{span: 16}}
              initialValues={{remember: true}}
              onFinish={this.onFinish}
              // onFinishFailed={this.onFailed}
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
                  Sign in
                </Button>
              </Form.Item>
            </Form>
          </Space>
        </div>
      </Layout>
    );
  }
}
