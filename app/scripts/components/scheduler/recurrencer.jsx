'use strict';

var React = require('react');
var DatePicker = require('../datepicker/datepicker');
var propTypes = require("../../utils/propTypes");

var Reccurencer = React.createClass({
  propTypes: {

    createRecurrence: React.PropTypes.func.isRequired,
    startDate: propTypes.date.isRequired,
    endDate: propTypes.date.isRequired,
    strings: propTypes.alli18n.isRequired,

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
      strings = this.props.strings;

    if ( this.state.createRecurrence == true ) {

      result = (
        <div>
          {strings.duplicateTimingsAbove} {strings.to}
          <DatePicker selected={this.state.endDate} onChange={this.onReccurenceEndChange} weekdays={strings.weekdays.short} months={strings.months} dateFormat={this.props.dateFormat} activeDays={this.props.activeDays}/>
          <a className="rc-ok-button" onClick={this.createRecurrences}>OK</a>
        </div>
      );

    }
    else {

      result = (<a onClick={this.toggleDatePickers}>{strings.defineReccuringEvent}</a>);

    }

    return (

      <div>
        {result}
      </div>

      );
  }
});

module.exports = Reccurencer;