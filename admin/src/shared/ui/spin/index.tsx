import React from 'react';
import {LoadingOutlined} from '@ant-design/icons';
import {Spin} from 'antd';
import './styles.scss';

export default () => <Spin delay={200} className="overlay" size="large" indicator={<LoadingOutlined />} />;
