import _ from 'underscore';
import React from 'react/addons';
import ContainerUtil from '../utils/ContainerUtil';
import containerActions from '../actions/ContainerActions';
import util from '../utils/Util';

var ContainerSettingsGeneral = React.createClass({
  mixins: [React.addons.LinkedStateMixin],

  contextTypes: {
    router: React.PropTypes.func
  },

  getInitialState: function () {
    let env = ContainerUtil.env(this.props.container) || [];
    env.push(['', '']);

    env = _.map(env, e => {
      return [util.randomId(), e[0], e[1]];
    });

    return {
      env: env
    };
  },

  handleSaveEnvVars: function () {
    let list = [];
    _.each(this.state.env, kvp => {
      let [, key, value] = kvp;
      if ((key && key.length) || (value && value.length)) {
        list.push(key + '=' + value);
      }
    });
    containerActions.update(this.props.container.Name, {Env: list});
  },

  handleChangeEnvKey: function (index, event) {
    let env = _.map(this.state.env, _.clone);
    env[index][1] = event.target.value;
    this.setState({
      env: env
    });
  },

  handleChangeEnvVal: function (index, event) {
    let env = _.map(this.state.env, _.clone);
    env[index][2] = event.target.value;
    this.setState({
      env: env
    });
  },

  handleAddEnvVar: function () {
    let env = _.map(this.state.env, _.clone);
    env.push([util.randomId(), '', '']);
    this.setState({
      env: env
    });
  },

  handleRemoveEnvVar: function (index) {
    let env = _.map(this.state.env, _.clone);
    env.splice(index, 1);

    if (env.length === 0) {
      env.push([util.randomId(), '', '']);
    }

    this.setState({
      env: env
    });

  },

  render: function () {
    if (!this.props.container) {
      return false;
    }


    let vars = _.map(this.state.env, (kvp, index) => {
      let [id, key, val] = kvp;
      let icon;
      if (index === this.state.env.length - 1) {
        icon = <a onClick={this.handleAddEnvVar} className="only-icon btn btn-positive small"><span className="icon icon-add"></span></a>;
      } else {
        icon = <a onClick={this.handleRemoveEnvVar.bind(this, index)} className="only-icon btn btn-action small"><span className="icon icon-delete"></span></a>;
      }

      return (
        <div key={id} className="keyval-row">
          <input type="text" className="key line" defaultValue={key} onChange={this.handleChangeEnvKey.bind(this, index)}></input>
          <input type="text" className="val line" defaultValue={val} onChange={this.handleChangeEnvVal.bind(this, index)}></input>
          {icon}
        </div>
      );
    });

    return (
      <div className="settings-panel">
        <div className="settings-section">
          <h3>Environment Variables</h3>
          <div className="env-vars-labels">
            <div className="label-key">KEY</div>
            <div className="label-val">VALUE</div>
          </div>
          <div className="env-vars">
            {vars}
          </div>
          <a className="btn btn-action" disabled={this.props.container.State.Updating} onClick={this.handleSaveEnvVars}>Save</a>
        </div>
      </div>
    );
  }
});

module.exports = ContainerSettingsGeneral;
