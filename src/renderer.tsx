import React from 'react';
import {render} from 'react-dom';
import {App} from './app/app';

/*
 * The Electron renderer process entry point
 */
render (
    <App />,
    document.getElementById('root'),
);
