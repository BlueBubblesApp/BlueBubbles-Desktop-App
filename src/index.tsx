import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import TitleBar from './components/TitleBar/TitleBar';
import ViewContainer from './components/ViewContainer/ViewContainer';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
  <React.StrictMode>
    <TitleBar />
    <ViewContainer />
  </React.StrictMode>,
  document.getElementsByTagName("BODY")[0]
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();