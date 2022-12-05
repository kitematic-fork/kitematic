/**
 * Created by thofl on 3/26/2016.
 */
import _ from 'underscore';
import electron from 'electron';
const remote = electron.remote;
import { shell } from 'electron';

class WindowsMenuBuilder{
    build(menuContainer){
        //Add exit to file 
        menuContainer.pushSubMenu({
            label: 'File', subItem: {
                label: 'Exit',
                accelerator: 'CmdOrCtrl+W',
                click: function () {
                    remote.getCurrentWindow().close();
                }
            }
        });

        return menuContainer;
    }
}
module.exports = WindowsMenuBuilder;