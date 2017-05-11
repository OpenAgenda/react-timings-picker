'use strict';

var React = require('react');
var createReactClass = require( 'create-react-class' );
var PropTypes = require( 'prop-types' );
var DatePicker = require('../datepicker/datepicker');
var propTypes = require("../../utils/propTypes");

var Reccurencer = createReactClass({
  propTypes: {

    createRecurrence: PropTypes.func.isRequired,
    startDate: propTypes.date.isRequired,
    endDate: propTypes.date.isRequired,
    strings: propTypes.alli18n.isRequired,
    isDatePickerActive: PropTypes.bool,
  },
  createRecurrences: function () {

    this.props.createRecurrence(this.props.startDate, this.state.endDate);

  },
  onReccurenceEndChange: function (date) {

    this.setState({ endDate: date });

  },
  toggleDatePickers: function () {

    this.setState({ createRecurrence: !this.state.createRecurrence });

  },
  componentWillReceiveProps: function (nextProps) {

    this.setState({
      endDate: nextProps.endDate
    });

  },
  getInitialState: function () {

    return { createRecurrence: false, endDate: this.props.endDate };

  },
  render: function () {

    var result,
      strings = this.props.strings,
	  activeDays = this.props.activeDays ? this.props.activeDays : [];

    if ( this.state.createRecurrence == true ) {

      result = (
        React.createElement("div", null, 
          strings.duplicateTimingsAbove, " ", strings.to, 
          React.createElement(DatePicker, {selected: this.state.endDate, onChange: this.onReccurenceEndChange, weekdays: strings.weekdays.short, months: strings.months, dateFormat: this.props.dateFormat, activeDays: activeDays, weekStart: this.props.weekStartDay, isDatePickerActive: this.props.isDatePickerActive}), 
          React.createElement("a", {className: "rc-ok-button", onClick: this.createRecurrences}, "OK")
        )
      );

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