import $ from 'jquery';
import React from 'react/addons';
import Router from 'react-router';
import {shell} from 'electron';
import containerActions from '../actions/ContainerActions';
import imageActions from '../actions/ImageActions';
import containerStore from '../stores/ContainerStore';
import tagStore from '../stores/TagStore';
import tagActions from '../actions/TagActions';
import networkStore from '../stores/NetworkStore';
import numeral from 'numeral';
import ReactDOM from 'react-dom';
import accountStore from '../stores/AccountStore';

var ImageCard = React.createClass({
  mixins: [Router.Navigation],
  getInitialState: function () {
    return {
      tags: this.props.tags || [],
      chosenTag: this.props.chosenTag || 'latest',
      defaultNetwork: this.props.defaultNetwork || 'bridge',
      networks: networkStore.all(),
      searchTag: '',
      username: accountStore.getState().username,
      verified: accountStore.getState().verified
    };
  },
  componentDidMount: function () {
    tagStore.listen(this.updateTags);
    networkStore.listen(this.updateNetworks);
  },
  componentWillUnmount: function () {
    tagStore.unlisten(this.updateTags);
    networkStore.unlisten(this.updateNetworks);
  },
  updateTags: function () {
    let repo = this.props.image.namespace + '/' + this.props.image.name;
    let state = tagStore.getState();
    if (this.state.tags.length && !state.tags[repo]) {
      $(ReactDOM.findDOMNode(this)).find('.tag-overlay').fadeOut(300);
    }
    this.setState({
      loading: tagStore.getState().loading[repo] || false,
      tags: tagStore.getState().tags[repo] || []
    });
  },
  updateNetworks: function () {
    this.setState({
      networks: networkStore.all()
    });
  },
  handleTagClick: function (tag) {
    this.setState({
      chosenTag: tag
    });
    var $tagOverlay = $(ReactDOM.findDOMNode(this)).find('.tag-overlay');
    $tagOverlay.fadeOut(300);
  },
  handleNetworkClick: function (network) {
    this.setState({
      defaultNetwork: network
    });
    var $networkOverlay = $(ReactDOM.findDOMNode(this)).find('.network-overlay');
    $networkOverlay.fadeOut(300);
  },
  handleClick: function () {
    let name = containerStore.generateName(this.props.image.name);
    let localImage = this.props.image.is_local || false;
    let repo = (this.props.image.namespace === 'library' || this.props.image.namespace === 'local') ? this.props.image.name : this.props.image.namespace + '/' + this.props.image.name;

    containerActions.run(name, repo, this.state.chosenTag, this.state.defaultNetwork, localImage);
    this.transitionTo('containerHome', {name});
  },
  handleMenuOverlayClick: function () {
    let $menuOverlay = $(ReactDOM.findDOMNode(this)).find('.menu-overlay');
    $menuOverlay.fadeIn(300);
  },
  handleCloseMenuOverlay: function () {
    var $menuOverlay = $(ReactDOM.findDOMNode(this)).find('.menu-overlay');
    $menuOverlay.fadeOut(300);
  },
  handleTagOverlayClick: function () {
    let $tagOverlay = $(ReactDOM.findDOMNode(this)).find('.tag-overlay');
    $tagOverlay.fadeIn(300);
    let localImage = this.props.image.is_local || false;
    if (localImage) {
      tagActions.localTags(this.props.image.namespace + '/' + this.props.image.name, this.props.tags);
    } else {
      tagActions.tags(this.props.image.namespace + '/' + this.props.image.name);
    }
    this.focusSearchTagInput();
  },
  handleCloseTagOverlay: function () {
    let $menuOverlay = $(ReactDOM.findDOMNode(this)).find('.menu-overlay');
    $menuOverlay.hide();
    var $tagOverlay = $(ReactDOM.findDOMNode(this)).find('.tag-overlay');
    $tagOverlay.fadeOut(300);
  },
  handleNetworkOverlayClick: function () {
    let $networkOverlay = $(ReactDOM.findDOMNode(this)).find('.network-overlay');
    $networkOverlay.fadeIn(300);
  },
  handleCloseNetworkOverlay: function () {
    let $menuOverlay = $(ReactDOM.findDOMNode(this)).find('.menu-overlay');
    $menuOverlay.hide();
    var $networkOverlay = $(ReactDOM.findDOMNode(this)).find('.network-overlay');
    $networkOverlay.fadeOut(300);
  },
  handleDeleteImgClick: function (image) {
    if (this.state.chosenTag && !this.props.image.inUse) {
      imageActions.destroy(image.RepoTags[0].split(':')[0] + ':' + this.state.chosenTag);
    }
  },
  handlePushImgClick: function (image) {
    if (this.state.chosenTag) {
      imageActions.push(image.RepoTags[0].split(':')[0] + ':' + this.state.chosenTag);
    }
  },
  handleRepoClick: function () {
    var repoUri = 'https://hub.docker.com/';
    if (this.props.image.namespace === 'library') {
      repoUri = repoUri + '_/' + this.props.image.name;
    } else {
      repoUri = repoUri + 'r/' + this.props.image.namespace + '/' + this.props.image.name;
    }
    shell.openExternal(repoUri);
  },
  searchTag: function(event) {
    this.setState({ searchTag: event.target.value });
  },

  focusSearchTagInput: function() {
    this.refs.searchTagInput.focus();
  },

  handleLoginClick: function () {
    this.transitionTo('login');
  },

  render: function() {
    var name;
    if (this.props.image.namespace === 'library') {
      name = (
        <div>
          <div className="namespace official">official</div>
          <span className="repo">{this.props.image.name}</span>
        </div>
      );
    } else {
      name = (
        <div>
          <div className="namespace">{this.props.image.namespace}</div>
          <span className="repo">{this.props.image.name}</span>
        </div>
      );
    }
    var description;
    if (this.props.image.description) {
      description = this.props.image.description;
    } else if (this.props.image.short_description) {
      description = this.props.image.short_description;
    } else {
      description = 'No description.';
    }
    var logoStyle = {
      backgroundColor: this.props.image.gradient_start
    };
    var imgsrc;
    if (this.props.image.img) {
      imgsrc = `https://kitematic-fork.github.io/recommended/${this.props.image.img}`;
    } else {
      imgsrc = 'https://kitematic-fork.github.io/recommended/kitematic_html.png';
    }
    var tags;
    if (this.state.loading) {
      tags = <img className="items-loading" src="loading.png"/>;
    } else if (this.state.tags.length === 0) {
      tags = <div className="no-items">No Tags</div>;
    } else {
      var tagDisplay = this.state.tags.filter(tag => (tag && tag.name || tag || '').includes(this.state.searchTag)).map((tag) => {
        let t = '';
        if (tag.name) {
          t = tag.name;
        } else {
          t = tag;
        }
        let key = t;
        if (typeof key === 'undefined') {
          key = this.props.image.name;
        }
        if (t === this.state.chosenTag) {
          return <div className="item active" key={key} onClick={this.handleTagClick.bind(this, t)}>{t}</div>;
        } else {
          return <div className="item" key={key} onClick={this.handleTagClick.bind(this, t)}>{t}</div>;
        }
      });
      tags = (
        <div className="item-list tag-list">
          {tagDisplay}
        </div>
      );
    }

    let networkDisplay = this.state.networks.map((network) => {
      let networkName = network.Name;
      if (networkName === this.state.defaultNetwork) {
        return <div className="item active" key={networkName} onClick={this.handleNetworkClick.bind(this, networkName)}>{networkName}</div>;
      } else {
        return <div className="item" key={networkName} onClick={this.handleNetworkClick.bind(this, networkName)}>{networkName}</div>;
      }
    });
    let networks = (
      <div className="item-list network-list">
        {networkDisplay}
      </div>
    );

    var badge = null;
    if (this.props.image.namespace === 'library') {
      badge = (
        <span className="icon icon-badge-official"></span>
      );
    } else if (this.props.image.is_private) {
      badge = (
        <span className="icon icon-badge-private"></span>
      );
    }

    let create, overlay;
    if (this.props.image.is_local) {
      create = (
        <div className="actions">
          <div className="favorites">
            <span className="icon icon-tag"> {this.state.chosenTag}</span>
            <span className="text"></span>
          </div>
          <div className="more-menu" onClick={this.handleMenuOverlayClick}>
            <span className="icon icon-more"></span>
          </div>
          <div className="action" onClick={this.handleClick}>
            CREATE
          </div>
        </div>
      );
      overlay = (
        <div className="overlay menu-overlay">
          <div className="menu-item" onClick={this.handleTagOverlayClick.bind(this, this.props.image.name)}>
            <span className="icon icon-tag"></span><span className="text">SELECTED TAG: <span className="selected-item">{this.state.chosenTag}</span></span>
          </div>
          
          {
            !this.props.image.inUse ?          
            <div className="remove" onClick={this.handleDeleteImgClick.bind(this, this.props.image)}>
              <span className="btn btn-delete btn-action has-icon btn-hollow" disabled={this.props.image.inUse ? 'disabled' : null}>
                <span className="icon icon-delete"></span>
                Delete Tag
                </span>
            </div> : <p className="small">To delete, remove all containers<br/>using the image</p> 
          }
          
          {this.state.username && this.state.verified ?
          <div className="remove" onClick={this.handlePushImgClick.bind(this, this.props.image)}>
            <span className="btn btn-delete btn-action has-icon btn-hollow">
              <span className="icon icon-upload"></span>
              Push Image
              </span>
          </div> : <p className="small">To push, <a onClick={this.handleLoginClick}>login</a> to your account</p>  }

          
          <div className="close-overlay">
            <a className="btn btn-action circular" onClick={this.handleCloseMenuOverlay}><span className="icon icon-delete"></span></a>
          </div>
        </div>
      );
    } else {
      let favCount = (this.props.image.star_count < 1000) ? numeral(this.props.image.star_count).value() : numeral(this.props.image.star_count).format('0.0a').toUpperCase();
      let pullCount = (this.props.image.pull_count < 1000) ? numeral(this.props.image.pull_count).value() : numeral(this.props.image.pull_count).format('0a').toUpperCase();
      create = (
        <div className="actions">
          <div className="favorites">
            <span className="icon icon-favorite"></span>
            <span className="text">{favCount}</span>
            <span className="icon icon-download"></span>
            <span className="text">{pullCount}</span>
          </div>
          <div className="more-menu" onClick={this.handleMenuOverlayClick}>
            <span className="icon icon-more"></span>
          </div>
          <div className="action" onClick={this.handleClick}>
            CREATE
          </div>
        </div>
      );

      overlay = (
          <div className="overlay menu-overlay">
            <div className="menu-item" onClick={this.handleTagOverlayClick.bind(this, this.props.image.name)}>
              <span className="icon icon-tag"></span><span className="text">SELECTED TAG: <span className="selected-item">{this.state.chosenTag}</span></span>
            </div>
            <div className="menu-item" onClick={this.handleNetworkOverlayClick.bind(this, this.props.image.name)}>
              <span className="icon icon-link"></span><span className="text">DEFAULT NETWORK: <span className="selected-item">{this.state.defaultNetwork}</span></span>
            </div>
            <div className="menu-item" onClick={this.handleRepoClick}>
              <span className="icon icon-open-external"></span><span className="text">VIEW ON DOCKER HUB</span>
            </div>
            <div className="close-overlay">
              <a className="btn btn-action circular" onClick={this.handleCloseMenuOverlay}><span className="icon icon-delete"></span></a>
            </div>
          </div>
      );
    }

    let searchTagInputStyle = { outline: 'none', width: 'calc(100% - 30px)' };

    return (
      <div className="image-item">
        {overlay}
        <div className="overlay item-overlay tag-overlay">
          <p>
            <input
              ref="searchTagInput"
              style={searchTagInputStyle}
              type="text"
              placeholder="Filter image tag."
              onChange={this.searchTag}
            />
          </p>
          {tags}
          <div className="close-overlay" onClick={this.handleCloseTagOverlay}>
            <a className="btn btn-action circular"><span className="icon icon-delete"></span></a>
          </div>
        </div>
        <div className="overlay item-overlay network-overlay">
          <p>Please select an default network.</p>
          {networks}
          <div className="close-overlay" onClick={this.handleCloseNetworkOverlay}>
            <a className="btn btn-action circular"><span className="icon icon-delete"></span></a>
          </div>
        </div>
        <div className="logo" style={logoStyle}>
          <img src={imgsrc}/>
        </div>
        <div className="card">
          <div className="info">
            <div className="badges">
              {badge}
            </div>
            <div className="name">
              {name}
            </div>
            <div className="description">
              {description}
            </div>
          </div>
          {create}
        </div>
      </div>
    );
  }
});

module.exports = ImageCard;
