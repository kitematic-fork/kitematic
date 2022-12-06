import React from 'react/addons';
import utils from '../utils/Util';
import Router from 'react-router';
var packages;

try {
  packages = utils.packagejson();
} catch (err) {
  packages = {};
}

var Preferences = React.createClass({
  mixins: [Router.Navigation],
  getInitialState: function () {
    return {};
  },
  handleGoBackClick: function () {
    this.goBack();
  },
  render: function () {
    return (
      <div className="preferences">
        <div className="about-content">
          <a onClick={this.handleGoBackClick}>Go Back</a>
          <div className="items">
            <div className="item">
              <img src="cartoon-kitematic.png"/>
              <h4>Docker {packages.name}</h4>
              <p>{packages.version}</p>
            </div>
          </div>
          <h3>Kitematic is built with:</h3>
          <div className="items">
            <div className="item">
              <img src="cartoon-docker.png"/>
              <h4>Docker Engine</h4>
            </div>
            <div className="item">
              <img src="cartoon-docker-machine.png"/>
              <h4>Docker Machine</h4>
              <p>{packages["docker-machine-version"]}</p>
            </div>
          </div>
          <h3>Third-Party Software</h3>
          <div className="items">
            <div className="item">
              <h4>VirtualBox</h4>
              <p>{packages["virtualbox-version"]}</p>
            </div>
          </div>
          <div className="items">
            <div className="item">
              <h4>Electron</h4>
              <p>{process.versions.electron}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = Preferences;
