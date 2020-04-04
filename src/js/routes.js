
// import HomePage from '../pages/home.jsx';
// import AboutPage from '../pages/about.jsx';
import FormPage from '../pages/form.jsx';
import CatalogPage from '../pages/catalog.jsx';
import ProductPage from '../pages/product.jsx';
import SettingsPage from '../pages/settings.jsx';

import DynamicRoutePage from '../pages/dynamic-route.jsx';
import RequestAndLoad from '../pages/request-and-load.jsx';
import NotFoundPage from '../pages/404.jsx';

var routes = [
  {
    path: '/',
    async(routeTo, routeFrom, resolve, reject) {
      const reactComponent = () => import(/* webpackChunkName: 'home-page' */'../pages/Home/index.jsx');
      reactComponent().then(rc => {
        resolve({component: rc.default});
      });
    },
  },
  {
    path: '/login',
    async(routeTo, routeFrom, resolve, reject) {
      const reactComponent = () => import(/* webpackChunkName: 'login-page' */'../pages/Login/index.jsx');
      reactComponent().then(rc => {
        resolve({component: rc.default});
      });
    },
  },
  {
    path: '/market',
    async(routeTo, routeFrom, resolve, reject) {
      const reactComponent = () => import(/* webpackChunkName: 'market-page' */'../pages/Market/index.jsx');
      reactComponent().then(rc => {
        resolve({component: rc.default});
      });
    },
  },
  {
    path: '/market/manage-self-select',
    async(routeTo, routeFrom, resolve, reject) {
      const reactComponent = () => import(/* webpackChunkName: 'manage-self-select-page' */'../pages/Market/ManageSelfSelect.jsx');
      reactComponent().then(rc => {
        resolve({component: rc.default});
      });
    },
  },
  {
    path: '/market/symbol_type',
    async(routeTo, routeFrom, resolve, reject) {
      const reactComponent = () => import(/* webpackChunkName: 'symbol-type-list-page' */'../pages/Market/SymbolTypeList.jsx');
      reactComponent().then(rc => {
        resolve({component: rc.default});
      });
    },
  },
  {
    path: '/market/symbol_type/:symbol_type_name/symbol',
    async(routeTo, routeFrom, resolve, reject) {
      const reactComponent = () => import(/* webpackChunkName: 'symbol-list-page' */'../pages/Market/SymbolList.jsx');
      reactComponent().then(rc => {
        resolve({component: rc.default});
      });
    },
  },
  {
    path: '/market/symbol/:id',
    async(routeTo, routeFrom, resolve, reject) {
      const reactComponent = () => import(/* webpackChunkName: 'symbol-page' */'../pages/Market/SymbolDetail.jsx');
      reactComponent().then(rc => {
        resolve({component: rc.default});
      });
    },
  },
  {
    path: '/chart/:id',
    options: {
      history: true,
    },
    asyncComponent: () => import(/* webpackChunkName: 'chart-page' */ '../pages/Chart/index.jsx'),
  },
  {
    path: '/trade/',
    async(routeTo, routeFrom, resolve, reject) {
      const reactComponent = () => import(/* webpackChunkName: 'trade-page' */'../pages/Trade/index.jsx');
      reactComponent().then(rc => {
        resolve({component: rc.default});
      });
    },
  },
  {
    path: '/products/',
    asyncComponent: () => import(/* webpackChunkName: 'trade-products-page' */ '../pages/TradeProducts/index.jsx'),
  },
  {
    path: '/trade/:id/',
    asyncComponent: () => import(/* webpackChunkName: 'trade-detail-page' */ '../pages/TradeDetail/index.jsx'),
  },
  {
    path: '/history/',
    async(routeTo, routeFrom, resolve, reject) {
      const reactComponent = () => import(/* webpackChunkName: 'history-page' */'../pages/History/index.jsx');
      reactComponent().then(rc => {
        resolve({component: rc.default});
      });
    },
  },
  {
    path: '/settings/',
    async(routeTo, routeFrom, resolve, reject) {
      const reactComponent = () => import(/* webpackChunkName: 'settings-page' */'../pages/Settings/index.jsx');
      reactComponent().then(rc => {
        resolve({component: rc.default});
      });
    },
  },
  {
    path: '/form/',
    component: FormPage,
  },
  {
    path: '/catalog/',
    component: CatalogPage,
  },
  {
    path: '/product/:id/',
    component: ProductPage,
  },
  {
    path: '/dynamic-route/blog/:blogId/post/:postId/',
    component: DynamicRoutePage,
  },
  {
    path: '/request-and-load/user/:userId/',
    async: function (routeTo, routeFrom, resolve, reject) {
      // Router instance
      var router = this;

      // App instance
      var app = router.app;

      // Show Preloader
      app.preloader.show();

      // User ID from request
      var userId = routeTo.params.userId;

      // Simulate Ajax Request
      setTimeout(function () {
        // We got user data from request
        var user = {
          firstName: 'Vladimir',
          lastName: 'Kharlampidi',
          about: 'Hello, i am creator of Framework7! Hope you like it!',
          links: [
            {
              title: 'Framework7 Website',
              url: 'http://framework7.io',
            },
            {
              title: 'Framework7 Forum',
              url: 'http://forum.framework7.io',
            },
          ]
        };
        // Hide Preloader
        app.preloader.hide();

        // Resolve route to load page
        resolve(
          {
            component: RequestAndLoad,
          },
          {
            context: {
              user: user,
            }
          }
        );
      }, 1000);
    },
  },
  {
    path: '(.*)',
    component: NotFoundPage,
  },
];

export default routes;
