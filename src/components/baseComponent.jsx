import React from 'react';
import api from 'services';

export class BaseReact extends React.Component {
  $api = api;
}