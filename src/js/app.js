import React from 'react';
import ReactDOM from 'react-dom';
import Framework7 from 'framework7/framework7-lite.esm.bundle.js';
import Framework7React from 'framework7-react';
import utils from "utils";
import 'framework7/css/framework7.bundle.css';
import '../css/icons.css';
import '../css/app.scss';
import App from '../components/app.jsx';

utils.setRootFontSizeFromClient();
Framework7.use(Framework7React)

configure({ enforceActions: "observed", });

// Mount React App
ReactDOM.render(
  <Provider {...store}>
    <App />
  </Provider>,
  document.getElementById('app'),
);
