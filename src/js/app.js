import React from 'react';
import ReactDOM from 'react-dom';
import Framework7 from 'framework7/framework7-lite.esm.bundle.js';
import Framework7React from 'framework7-react';
import utils from "utils";
import 'framework7/css/framework7.bundle.css';
import App from '../components/app.jsx';
import { configure } from "mobx";
import {Provider} from 'mobx-react';
import store from 'store';
import intl from 'react-intl-universal';
import enLocale from '../locales/en-US';
import cnLocale from '../locales/zh-CN';

import '../css/icons.css';
import '../css/app.scss';

if (process.env.MODE != 'prod') {
  const eruda = require('../../node_modules/eruda/eruda.js');
  eruda.init();
}


utils.setRootFontSizeFromClient();
Framework7.use(Framework7React)

function initLang() {
  const locales = {
    "en-US": enLocale,
    "zh-CN": cnLocale,
  };
  const lang = utils.getLStorage('MOON_H5_LANG');
  if (!lang) {
    if (navigator.language === 'zh-CN') {
      utils.setLStorage('MOON_H5_LANG', 'zh-CN');
      intl.init({ currentLocale: 'zh-CN', locales, });
    } else {
      utils.setLStorage('MOON_H5_LANG', 'en-US');
      intl.init({ currentLocale: 'en-US', locales, });
    }
  } else {
    intl.init({ currentLocale: lang, locales, });
  }
}

configure({ enforceActions: "observed", });
initLang();

ReactDOM.render(
  <Provider {...store}>
    <App />
  </Provider>,
  document.getElementById('app'),
);
