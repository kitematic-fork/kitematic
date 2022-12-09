import _ from 'underscore';
import React from 'react/addons';
import { clipboard } from 'electron';
import { dialog } from '@electron/remote';
import containerActions from '../actions/ContainerActions';
import rekcod from 'rekcod';

var ContainerSettingsGeneral = React.createClass({
  mixins: [React.addons.LinkedStateMixin],

  contextTypes: {
    router: React.PropTypes.func
  },

  getInitialState: function () {

    return {
      slugName: null,
      nameError: null,
      copiedId: false,
      copiedRunCmd: false
    };
  },

  handleNameChange: function (e) {
    var name = e.target.value;
    if (name === this.state.slugName) {
      return;
    }

    name = name.replace(/^\s+|\s+$/g, ''); // Trim
    name = name.toLowerCase();
    // Remove Accents
    let from = "àáäâèéëêìíïîòóöôùúüûñç·/,:;";
    let to   = "aaaaeeeeiiiioooouuuunc-----";
    for (var i=0, l=from.length ; i<l ; i++) {
      name = name.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }
    name = name.replace(/[^a-z0-9-_.\s]/g, '') // Remove invalid chars
      .replace(/\s+/g, '-') // Collapse whitespace and replace by -
      .replace(/-+/g, '-')  // Collapse dashes
      .replace(/_+/g, '_'); // Collapse underscores

    this.setState({
      slugName: name
    });
  },

  handleNameOnKeyUp: function (e) {
    if (e.keyCode === 13 && this.state.slugName) {
      this.handleSaveContainerName();
    }
  },

  handleCopyContainerId: function() {
    clipboard.writeText(this.props.container.Id);
 	this.setState({copiedId: true});
	setTimeout(() => this.setState({copiedId: false}), 5000);
  },

  handleCopyDockerRunCmd: function (cmd) {
	clipboard.writeText(cmd);
	this.setState({copiedRunCmd: true});
	setTimeout(() => this.setState({copiedRunCmd: false}), 5000);
  },

  handleSaveContainerName: function () {
    var newName = this.state.slugName;
    if (newName === this.props.container.Name) {
      return;
    }

    this.setState({
      slugName: null
    });

    if (this.props.containers[newName]) {
      this.setState({
        nameError: 'A container already exists with this name.'
      });
      return;
    }

    containerActions.rename(this.props.container.Name, newName);
    this.context.router.transitionTo('containerSettingsGeneral', {name: newName});
  },

  handleDeleteContainer: function () {
    dialog.showMessageBox({
      message: 'Are you sure you want to delete this container?',
      buttons: ['Delete', 'Cancel']
    }).then(({response}) => {
      if (response === 0) {
        containerActions.destroy(this.props.container.Name);
      }
    });
  },

  render: function () {
    if (!this.props.container) {
      return false;
    }

    const runCmd = rekcod.translate(this.props.container).command;

    let idCopiedToClipboard;
    let runCmdCopiedToClipboard;
    let willBeRenamedAs;
    let btnSaveName = (
      <a className="btn btn-action" onClick={this.handleSaveContainerName} disabled="disabled">Save</a>
    );

    if (this.state.slugName) {
      willBeRenamedAs = (
        <p>Will be renamed as: <strong>{this.state.slugName}</strong></p>
      );
      btnSaveName = (
        <a className="btn btn-action" onClick={this.handleSaveContainerName}>Save</a>
      );
    } else if (this.state.nameError) {
      willBeRenamedAs = (
        <p><strong>{this.state.nameError}</strong></p>
      );
    }

    if (this.state.copiedId) {
      idCopiedToClipboard = (
        <p className="fadeOut"><strong>Copied to Clipboard</strong></p>
      );
    }

	if (this.state.copiedRunCmd) {
	  runCmdCopiedToClipboard = (
		<p className="fadeOut"><strong>Copied to Clipboard</strong></p>
	  );
	}

    let containerInfo = (
      <div className="settings-section">
        <h3>Container Info</h3>
        <div className="container-info-row">
          <div className="label-id">ID</div>
          <input type="text" className="line disabled" defaultValue={this.props.container.Id} disabled></input>
          <a className="btn btn-action btn-copy" onClick={this.handleCopyContainerId}>Copy</a>
          {idCopiedToClipboard}
        </div>
        <div className="container-info-row">
          <div className="label-name">NAME</div>
          <input id="input-container-name" type="text" className="line" placeholder="Container Name" defaultValue={this.props.container.Name} onChange={this.handleNameChange} onKeyUp={this.handleNameOnKeyUp}></input>
          {btnSaveName}
          {willBeRenamedAs}
        </div>
		<div className="container-info-row">
		  <div className="label-id">COMMAND</div>
		  <textarea rows="8" className="line disabled" disabled>{runCmd}</textarea>
		  <a className="btn btn-action btn-copy" onClick={() => this.handleCopyDockerRunCmd(runCmd)}>Copy</a>
		  {runCmdCopiedToClipboard}
		</div>
      </div>
    );


    return (
      <div className="settings-panel">
        {containerInfo}
        <div className="settings-section">
          <a className="btn btn-action" onClick={this.handleDeleteContainer}>Delete</a>
        </div>
      </div>
    );
  }
});

module.exports = ContainerSettingsGeneral;
