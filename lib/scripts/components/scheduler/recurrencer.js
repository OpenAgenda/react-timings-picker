'use strict';

var React = require('react');
var DatePicker = require('../datepicker/datepicker');
var propTypes = require("../../utils/propTypes");

var Reccurencer = React.createClass({displayName: "Reccurencer",
  propTypes: {
    createRecurrence: React.PropTypes.func.isRequired,
    startDate: propTypes.date.isRequired,
    endDate: propTypes.date.isRequired,
    strings: propTypes.alli18n.isRequired,
  },
  createRecurrences: function () {
    this.props.createRecurrence(this.state.startDate, this.state.endDate);
  },
  onReccurenceStartChange: function(date){
    this.setState({ startDate: date });
  },
  onReccurenceEndChange: function(date){
    this.setState({ endDate: date });
  },
  toggleDatePickers: function () {
    this.setState({ createRecurrence: !this.state.createRecurrence });
  },
  componentWillReceiveProps: function (nextProps) {
    this.setState({
      startDate: nextProps.startDate, endDate: nextProps.endDate
    });
  },
  getInitialState: function () {
    return { createRecurrence: false, startDate: this.props.startDate, endDate: this.props.endDate };
  },
  render: function () {
    var result;
    var strings = this.props.strings;
    if (this.state.createRecurrence == true) {
      result = (React.createElement("div", null, 
        strings.duplicateTimingsAbove, " ", strings.from, 
        React.createElement(DatePicker, {selected: this.state.startDate, onChange: this.onReccurenceStartChange, weekdays: strings.weekdays.short, months: strings.months, dateFormat: this.props.dateFormat}), " ", strings.to, 
        React.createElement(DatePicker, {selected: this.state.endDate, onChange: this.onReccurenceEndChange, weekdays: strings.weekdays.short, months: strings.months, dateFormat: this.props.dateFormat}), 
        React.createElement("a", {className: "rc-ok-button", onClick: this.createRecurrences}, "OK")
      ));
    }
    else {
      result = (React.createElement("a", {onClick: this.toggleDatePickers}, strings.defineReccuringEvent));
    }

    return (
      React.createElement("div", null, 
        result
      )
      );
  }
});

module.exports = Reccurencer;