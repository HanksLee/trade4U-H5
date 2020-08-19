import React from 'react';
import api from 'services';
import { message } from 'antd';

export class BaseReact extends React.Component {
  $api = api;
  $msg = message;
}