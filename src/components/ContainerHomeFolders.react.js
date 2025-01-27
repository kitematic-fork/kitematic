import _ from 'underscore';
import React from 'react/addons';
import path from 'path';
import {shell} from 'electron';
import util from '../utils/Util';
import containerActions from '../actions/ContainerActions';

import { dialog } from '@electron/remote';

import mkdirp from 'mkdirp';

var ContainerHomeFolder = React.createClass({
  contextTypes: {
    router: React.PropTypes.func
  },
  handleClickFolder: function (source, destination) {

    if (source.indexOf(util.windowsToLinuxPath(util.home())) === -1) {
      dialog.showMessageBox({
        message: `Enable all volumes to edit files? This may not work with all database containers.`,
        buttons: ['Enable Volumes', 'Cancel']
      }).then(({response}) => {
        if (response === 0) {
          var mounts = _.clone(this.props.container.Mounts);
          var newSource = path.join(util.home(), util.documents(), 'Kitematic', this.props.container.Name, destination);

          mounts.forEach(m => {
            if (m.Destination === destination) {
              m.Source = util.windowsToLinuxPath(newSource);
              m.Driver = null;
            }
          });

          mkdirp(newSource, function (err) {
            console.error(err);
            if (!err) {
              shell.showItemInFolder(newSource);
            }
          });

          let binds = mounts.map(m => {
            return m.Source + ':' + m.Destination;
          });

          let hostConfig = _.extend(this.props.container.HostConfig, {Binds: binds});

          containerActions.update(this.props.container.Name, {Mounts: mounts, HostConfig: hostConfig});
        }
      });
    } else {
      let path = util.isWindows() ? util.linuxToWindowsPath(source) : source;
      shell.showItemInFolder(path);
    }
  },
  handleClickChangeFolders: function () {
    this.context.router.transitionTo('containerSettingsVolumes', {name: this.context.router.getCurrentParams().name});
  },
  render: function () {
    if (!this.props.container) {
      return false;
    }

    var folders = _.map(this.props.container.Mounts, (m, i) => {
      let destination = m.Destination;
      let source = m.Source;
      return (
        <div key={i} className="folder" onClick={this.handleClickFolder.bind(this, source, destination)}>
          <img src="folder.png" />
          <div className="text">{destination}</div>
        </div>
      );
    });

    return (
      <div className="folders wrapper">
        <div className="widget">
          <div className="top-bar">
            <div className="text">Volumes</div>
            <div className="action" onClick={this.handleClickChangeFolders}>
              <span className="icon icon-preferences"></span>
            </div>
          </div>
          <div className="folders-list">
            {folders}
          </div>
        </div>
      </div>
    );
  }
});

module.exports = ContainerHomeFolder;
