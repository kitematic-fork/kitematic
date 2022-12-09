const electron = require('electron');

import { Menu } from '@electron/remote';


import os from 'os';
// ipcRenderer is used as we're in the process
const ipcRenderer = electron.ipcRenderer;

import React from 'react';
import ReactDOM from 'react-dom';
import Promise from 'bluebird';

import webUtil from './utils/WebUtil';
import hubUtil from './utils/HubUtil';
import util from './utils/Util';
import setupUtil from './utils/SetupUtil';
import docker from './utils/DockerUtil';
import hub from './utils/HubUtil';
import Router from 'react-router';
import routes from './routes';
import routerContainer from './router';
import repositoryActions from './actions/RepositoryActions';
import machine from './utils/DockerMachineUtil';
import MenuFactory from './menu/MenuFactory';

//console.log(localStorage.getItem('settings.ColorShema'));

Promise.config({cancellation: true});

hubUtil.init();

if (hubUtil.loggedin()) {
  repositoryActions.repos();
}

repositoryActions.recommended();

webUtil.addWindowSizeSaving();
webUtil.addLiveReload();
webUtil.disableGlobalBackspace();


var router = Router.create({
  routes: routes
});
router.run(Handler => ReactDOM.render(<Handler/>, document.body));
routerContainer.set(router);

console.log(localStorage.getItem('settings.colorshema'));


util.loadTheme(localStorage.getItem('settings.colorshema'))

setupUtil.setup().then(() => {
  Menu.setApplicationMenu(Menu.buildFromTemplate(MenuFactory.buildMenu(os.platform())));
  docker.init();
  if (!hub.prompted() && !hub.loggedin()) {
    router.transitionTo('login');
  } else {
    router.transitionTo('search');
  }
}).catch(err => {
  throw err;
});


ipcRenderer.on('application:quitting', () => {
  docker.detachEvent();
  if (localStorage.getItem('settings.closeVMOnQuit') === 'true') {
    machine.stop();
  }
});

window.onbeforeunload = function () {
  docker.detachEvent();
};
