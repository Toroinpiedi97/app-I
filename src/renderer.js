"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const React = require('react');
const ReactDOM = require('react-dom/client');
const App = require('./App').default;
require('./index.css');
ReactDOM.createRoot(document.getElementById('root')).render((0, jsx_runtime_1.jsx)(React.StrictMode, { children: (0, jsx_runtime_1.jsx)(App, {}) }));
