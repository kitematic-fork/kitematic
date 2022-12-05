/**
 * Created by thofl on 3/26/2016.
 */
import electron from 'electron';
const remote = electron.remote;
import router from './../router';
import metrics from './../utils/MetricsUtil';
import machine from './../utils/DockerMachineUtil';
import docker from './../utils/DockerUtil';
import { shell } from 'electron';


class MenuContainer {
    constructor() {
        this._baseMenu = [
            {
                label: 'File',
                submenu: [
                    {
                        label: 'New Container',
                        accelerator: 'CmdOrCtrl+N',
                        enabled: !!docker.host,
                        click: function () {
                            metrics.track('Opened new container', {
                                from: 'menu'
                            });
                            router.get().transitionTo('search');
                        }
                    },
                    {
                        label: 'Preferences',
                        accelerator: 'CmdOrCtrl+,',
                        enabled: !!docker.host,
                        click: function () {
                            metrics.track('Opened Preferences', {
                                from: 'menu'
                            });
                            router.get().transitionTo('preferences');
                        }
                    }
                ]
            },
            {
                label: 'View',
                submenu: [
                    {
                        label: 'Relaunch Kitematic',
                        accelerator: 'CmdOrCtrl+r',
                        click: function () { remote.getCurrentWindow().reload(); }
                    },
                    {
                        label: 'Command Line Terminal',
                        accelerator: 'CmdOrCtrl+Shift+T',
                        enabled: !!docker.host,
                        click: function () {
                            metrics.track('Opened Terminal', {
                                from: 'menu'
                            });
                            machine.dockerTerminal();
                        }
                    },
                    {
                        label: 'Developer Tools',
                        accelerator: 'Alt+CmdOrCtrl+I',
                        click: function () { remote.getCurrentWindow().toggleDevTools(); }
                    }
                ]
            },
            {
                label: 'Help',
                submenu: [
                    {
                        label: 'Online Documentation',
                        click: function () {
                            metrics.track('Opened Issue Reporter', {
                                from: 'menu'
                            });
                            shell.openExternal('https://kitematic-fork.github.io/docs/')
                        }
                    },
                    {
                        label: 'Report Issue or Suggest Feedback',
                        click: function () {
                            metrics.track('Opened Issue Reporter', {
                                from: 'menu'
                            });
                            shell.openExternal('https://github.com/kitematic-fork/kitematic/issues/new');
                        }
                    },
                    {
                        label: 'About',
                        enabled: !!docker.host,
                        click: function () {
                            metrics.track('Opened About', {
                                from: 'menu'
                            });
                            router.get().transitionTo('about');
                        }
                    }
                ]
            }
        ];
    };
    pushMenu(menu) {
        this._baseMenu.push(menu);
    };

    pushSubMenu({ label, subItem }) {

        let menu = this.findMenu(label);
        menu.submenu.push(subItem);
    };
    findMenu(label) {
        return this._baseMenu.find(function (menuItem) {
            return menuItem.label === label;
        });
    };
    removeMenu(menuItem) {
        console.log(this);
        this._baseMenu.splice(this._baseMenu.indexOf(menuItem), 1)
    };
    static separator() {
        return {
            type: 'separator'
        };
    };

    getMenu() {
        return this._baseMenu;
    };
}



module.exports = MenuContainer;