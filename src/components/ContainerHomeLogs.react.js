import $ from 'jquery';
import React from 'react/addons';
import containerActions from '../actions/ContainerActions';
import Convert from 'ansi-to-html';
import * as fs from 'fs';
import { clipboard , shell } from 'electron';
import logActions from '../actions/LogActions';
import logStore from '../stores/LogStore';
import ContainerHomeLogsSearchField from './ContainerHomeLogsSearchField.react';

import { dialog } from '@electron/remote';


let escape = function (html) {
  var text = document.createTextNode(html);
  var div = document.createElement('div');
  div.appendChild(text);
  return div.innerHTML;
};

var FontSelect = React.createClass({
  
  getFontSizes: function(start, end){
    let options = [];
    for(let i = start; i<=end; i++){
      options.push(<option key={i} value={i}>{i+' px'}</option>);
    }
    return options;
  },

  render: function(){
    return (
      <select className='logs-font-size__select' value={this.props.fontSize} onChange={this.props.onChange}>
        <option disabled="true" >Font size</option>
        {this.getFontSizes(10, 30)}
      </select>
    );
  }
});

let convert = new Convert();
let prevBottom = 0;

module.exports = React.createClass({
  getInitialState: function(){
    return {
      fontSize: localStorage.getItem('settings.logsFontSize') || 10,
      follow: true,
      lineNum: 0,
      currentHighlighted: 1,
      searchText: '',
      searchFieldVisible: false
    };
  },
  onFontChange: function(event){
    let $target = event.target;
    this.setState((prevState)=>({
      fontSize: $target.value,
      follow: prevState.follow
    }));
    localStorage.setItem("settings.logsFontSize", $target.value);
  },

  scrollHighlightIntoView: function() {
    const node = $('.logs').get()[0];
    const $highlight = $('.highlight');

    if (this.state.searchText && $highlight.length > 0) {
      const topBarHeight = 40;
      const searchFieldHeight = 20;

      const min = node.scrollTop + topBarHeight;
      const max = node.scrollTop + node.clientHeight - searchFieldHeight;
      const pos = $highlight.get()[0].offsetTop;

      if (pos < min) {
        node.scrollTop = pos - topBarHeight;
      } else if (pos > max) {
        node.scrollTop = pos - node.clientHeight + searchFieldHeight;
      }
    } else {
      
      if(this.state.follow) {
        node.scrollTop = node.scrollHeight;
      }
    }
  },

  componentDidUpdate: function () {
    if (this.props.container.Logs && this.props.container.Logs.length != this.state.lineNum) {
        this.setState({lineNum: this.props.container.Logs.length});   
    }

    this.scrollHighlightIntoView();
  },

  componentWillReceiveProps: function (nextProps) {
    if (this.props.container && nextProps.container && this.props.container.Name !== nextProps.container.Name) {
      containerActions.active(nextProps.container.Name);
    }
  },

  componentDidMount: function () {
    containerActions.active(this.props.container.Name);
    document.addEventListener('keydown', this.handleKeyDown);
    logStore.listen(this.update);
  },

  componentWillUnmount: function () {
    containerActions.active(null);
    document.removeEventListener('keydown', this.handleKeyDown);
    logStore.unlisten(this.update);
  },
  
  toggleFollow: function () {
    this.setState((prevState)=>({
      fontSize: prevState.fontsize,
      follow: !prevState.follow
    }));
  },

  update: function(store) {
    this.setState(store);
  },

  handleKeyDown: function(event) {
    // cmd or ctrl + F
    if ((event.metaKey || event.ctrlKey) && event.keyCode == 70) {
      this.state.searchFieldVisible ? this.refs.searchField.focus() : logActions.toggleSearchField(true);
    }

    // esc
    if (event.keyCode == 27 && this.state.searchFieldVisible) {
      logActions.highlight(1);
      logActions.toggleSearchField(false);
    }

    // Enter
    if (event.keyCode == 13) {
      const $marks = $('mark');
      const nextHighlightPositionCand = this.state.currentHighlighted + (event.shiftKey ? -1 : 1);
      const nextHighlightPosition = (nextHighlightPositionCand < 1 ? $marks.length : (nextHighlightPositionCand > $marks.length ? 1 : nextHighlightPositionCand));
      logActions.highlight(nextHighlightPosition);
    }
  },

  escapeAndHighlightLogs: function() {

    this.state.searchText = this.state.searchText || '';

    var logs = this.props.container.Logs;

    if(this.state.searchText) {
      const highlight = (line) => line.replace(RegExp(this.state.searchText, 'i') || null, '<mark>$&</mark>');
      const markRegExp = RegExp(`((?!<mark)[\\s\\S]*?(<mark)){${this.state.currentHighlighted}}`);
  
      const highlightedLog = this.props.container.Logs.map((l, idx) => highlight(escape(l.substr(l.indexOf(' ')+1))).replace(/ /g, '&nbsp;<wbr>')).join('\n');
      logs = highlightedLog.replace(markRegExp, "$& class='highlight'").split('\n');
    }


    return (
      logs.map((l, idx) => <div key={`${this.props.container.Name}-${idx}`} dangerouslySetInnerHTML={{__html: convert.toHtml(l)}}></div>)
    );
  },

  render: function () {
    let _logs = '';

    let hasLogs = !!this.props.container.Logs;

    if(hasLogs) {
      this.props.container.Logs.map((l, index) => {
        _logs = _logs.concat((l.substr(l.indexOf(' ')+1)).replace(/\[\d+m/g,'').concat('\n'));
      });
    }
  
    const logs = hasLogs ? this.escapeAndHighlightLogs() : ['0 No logs for this container.'];

    const searchField = this.state.searchFieldVisible ? <ContainerHomeLogsSearchField ref="searchField"></ContainerHomeLogsSearchField> : '';
    let copyLogs = (event) => {
      clipboard.writeText(_logs);

      let btn = event.target;
      btn.innerHTML = 'Copied !';
      btn.style.color = '#FFF';
      setTimeout(()=>{
        btn.style.color = 'inherit'
        btn.innerHTML = 'Copy';
      }, 1000);
    };

    let saveLogs = (event) => {
      //create default filename with timestamp
      let path = `${this.props.container.Name} ${new Date().toISOString().replace(/T/, '_').replace(/\..+/, '').replace(/:/g,'-')}.txt`;
      dialog.showSaveDialog({
        defaultPath: path
      }).then(({filePath}) => {
        if (!filePath) return;
        fs.writeFile(filePath, _logs, (err) => {
          if(!err){
            shell.showItemInFolder(filePath);
          }else{
            dialog.showErrorBox('Oops! an error occured', err.message);
          }
        });
      });
    };

    return (
      <div className="mini-logs wrapper">
        <div className="widget">
          <div className="top-bar">
            <div className="text">Container Logs</div>
            <div>
              <label className="follow-logs__label">
                Follow&nbsp;
                <input type="checkbox" onChange={ this.toggleFollow } checked={ this.state.follow }></input>
              </label>
              <button className="save-logs__btn" onClick={saveLogs}>
                <i className="icon icon-download"></i>
              </button>
              <FontSelect fontSize={this.state.fontSize} onChange={this.onFontChange} />
              <button className="copy-logs__btn" onClick={copyLogs}>Copy</button>
            </div>
          </div>
          <div className="logs" style={{fontSize:this.state.fontSize+'px'}}>
            {logs}
          </div>
          {searchField}
        </div>
      </div>
    );
  }
});
