import React from 'react';
import Api from 'shared/api';

export default abstract class AbstractWidget extends React.Component {
  protected get $api(): typeof Api {
    return Api;
  }
}
