// Import React and ReactDOM
import React from 'react';
import ReactDOM from 'react-dom';
import { configure } from "mobx";
// Import Framework7
import Framework7 from 'framework7/framework7-lite.esm.bundle.js';

// Import Framework7-React Plugin
import Framework7React from 'framework7-react';
import utils from "utils";
import {Provider} from 'mobx-react';
import store from 'store';
// Import Framework7 Styles
import 'framework7/css/framework7.bundle.css';

// Import Icons and App Custom Styles
import '../css/icons.css';
import '../css/app.scss';

// Import App Component
import App from '../components/app.jsx';

utils.setRootFontSizeFromClient();
// Init F7 Vue Plugin
Framework7.use(Framework7React)

configure({ enforceActions: "observed", });

// Mount React App
ReactDOM.render(
  <Provider {...store}>
    <App />
  </Provider>,
  document.getElementById('app'),
);
