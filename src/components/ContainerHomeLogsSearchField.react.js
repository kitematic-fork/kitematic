import React from 'react/addons';
import logActions from '../actions/LogActions';

module.exports = React.createClass({

  getInitialState: function () {
    return {
      searchText: undefined,
      previousSearchText: undefined,
    };
  },

  focus: function() {
    this.refs.searchField.focus();
  },

  handleKeyDown: function (event) {

    //enter
    if (event.keyCode == 13) {

      this.searchText = document.getElementById('logSearchField').value.trim();

      if (this.searchText && this.searchText.length && this.searchText.length > 3) {
        if (this.searchText != this.previousSearchText) {
          this.previousSearchText = this.searchText;
          logActions.search(this.searchText);
        } else {
          event.preventDefault();
        }
      } else if(this.previousSearchText) {
        this.previousSearchText = this.searchText;
        logActions.search('');
        event.preventDefault();
      }
    } else if(event.keyCode != 27) { //escape
      event.stopPropagation();
    }
  },

  componentDidMount: function () {
    document.getElementById('logSearchField').addEventListener('keydown', this.handleKeyDown);
    this.focus();
  },

  componentWillUnmount: function () {
    logActions.search.defer('');
    document.getElementById('logSearchField').removeEventListener('keydown', this.handleKeyDown);
  },


  render: function () {
    return (
      <div className="logs-search-field">
        <div className="logs-search-text">
          <div className="logs-search-prompt">find:</div>
          <input type="search" id='logSearchField' ref="searchField" className="logs-search-query" />
        </div>
      </div>
    );
  }
});
