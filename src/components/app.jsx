import React from 'react';
import { App, View } from 'framework7-react';
import routes from '../js/routes';
import './index.scss';

export default class extends React.Component {
  constructor() {
    super();

    this.state = {
      f7params: {
        name: 'moon-h5-f7',
        theme: 'auto',
        touch: {
          tapHold: true,
          tapHoldDelay: 300,
        },
        // App root data
        data: function () {
          return {
            products: [
              {
                id: '1',
                title: 'Apple iPhone 8',
                description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nisi tempora similique reiciendis, error nesciunt vero, blanditiis pariatur dolor, minima sed sapiente rerum, dolorem corrupti hic modi praesentium unde saepe perspiciatis.'
              },
              {
                id: '2',
                title: 'Apple iPhone 8 Plus',
                description: 'Velit odit autem modi saepe ratione totam minus, aperiam, labore quia provident temporibus quasi est ut aliquid blanditiis beatae suscipit odio vel! Nostrum porro sunt sint eveniet maiores, dolorem itaque!'
              },
              {
                id: '3',
                title: 'Apple iPhone X',
                description: 'Expedita sequi perferendis quod illum pariatur aliquam, alias laboriosam! Vero blanditiis placeat, mollitia necessitatibus reprehenderit. Labore dolores amet quos, accusamus earum asperiores officiis assumenda optio architecto quia neque, quae eum.'
              },
            ]
          };
        },
        routes: routes,
      },
    }
  }

  componentDidMount() {
    this.$f7ready((f7) => {
        f7.on('connection', (isOnline) => {
          if (!isOnline) {
            f7.toast.show({
              text: '请检查设备当前网络连接状况~',
              position: 'center',
              closeTimeout: 2000,
            });
          }
        })
    });
  }

  render() {
    return (
      <App params={ this.state.f7params } >
        <View main url="/" />
      </App>
    )
  }
}
