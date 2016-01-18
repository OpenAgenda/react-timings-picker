"use strict";

var React = require("react");
var Popover = require("./popover");
var Calendar = require("./calendar");
var DateInput = require("./date-input");
var propTypes = require("../../utils/propTypes");
var isEqual = require("lodash/lang/isEqual");
require("date-format-lite");

var DatePicker = React.createClass({
  displayName: "DatePicker",
  propTypes: {
    weekdays: React.PropTypes.arrayOf(React.PropTypes.string),
    months: propTypes.monthNames.isRequired,
    locale: React.PropTypes.string,
    dateFormatCalendar: React.PropTypes.string,
    popoverAttachment: React.PropTypes.string,
    popoverTargetAttachment: React.PropTypes.string,
    popoverTargetOffset: React.PropTypes.string,
    weekStart: React.PropTypes.number,
    onChange: React.PropTypes.func.isRequired,
    selected: propTypes.date,
    excludeDates: React.PropTypes.array,
    isClearable: React.PropTypes.bool
  },
  getDefaultProps: function () {
    return {
      weekdays: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
      locale: "en-US",
      dateFormatCalendar: "MMMM, YYYY",
      disabled: false,
      weekStart: 1,
      excludeDates: [],
      isClearable: false
    };
  },
  getInitialState: function () {
    return {
      focus: false,
      virtualFocus: false,
      selected: this.props.selected
    }
  },
  componentWillReceiveProps: function (nextProps) {
    this.setState({
      selected: nextProps.selected
    });
  },
  shouldComponentUpdate: function (nextProps, nextState) {
    return !(isEqual(nextProps, this.props) && isEqual(nextState, this.state));
  },

  getValue: function () {
    return this.state.selected;
  },

  clearSelected: function () {
    if (this.state.selected === null) return; //Due to issues with IE onchange events sometimes this gets noisy, so skip if we've already cleared

    this.setState({
      selected: null
    }, function () {
      this.props.onChange(null);
    }.bind(this));
  },

  handleFocus: function () {
    this.setState({
      focus: true
    });
  },
  handleBlur: function () {
    this.setState({ virtualFocus: false }, function () {
      setTimeout(function () {
        if (!this.state.virtualFocus && typeof this.props.onBlur === "function") {
          this.props.onBlur(this.state.selected);
          this.hideCalendar();
        }
      }.bind(this), 200);
    }.bind(this));
  },
  hideCalendar: function () {
    setTimeout(function () {
      this.setState({ focus: false });
    }.bind(this), 0);
  },
  handleSelect: function (date) {
    this.setSelected(date);

    setTimeout(function () {
      this.hideCalendar();
    }.bind(this), 200);
  },
  setSelected: function (date) {
    this.setState({
      selected: date,
      virtualFocus: true
    }, function () {
      this.props.onChange(this.state.selected);
    }.bind(this));
  },
  onInputClick: function () {
    this.setState({
      focus: true,
      virtualFocus: true
    });
  },

  renderCalendar: function () {
    if (this.state.focus) {
      return (
        React.createElement(Popover, {attachment: this.props.popoverAttachment, 
              targetAttachment: this.props.popoverTargetAttachment, 
              targetOffset: this.props.popoverTargetOffset}, 
          React.createElement(Calendar, {weekdays: this.props.weekdays, 
              months: this.props.months, 
              locale: this.props.locale, 
              dateFormat: this.props.dateFormatCalendar, 
              selected: this.state.selected, 
              onSelect: this.handleSelect, 
              hideCalendar: this.hideCalendar, 
              excludeDates: this.props.excludeDates, 
			  activeDays: this.props.activeDays, 
              weekStart: this.props.weekStart})
        )
        )
    }
  },
  render: function () {
    var clearButton = null;
    if ( this.props.isClearable && this.state.selected != null ) {
      clearButton = (
        React.createElement("button", {className: "rc-icon rc-icon-close", onClick: this.clearSelected})
      );
  }

    return (
      React.createElement("div", {className: "rc-datepicker rc-dp-container"}, 
        React.createElement(DateInput, {name: this.props.name, 
            date: this.state.selected, 
            dateFormat: this.props.dateFormatInput, 
            focus: this.state.focus, 
            onFocus: this.handleFocus, 
            onBlur: this.handleBlur, 
            handleClick: this.onInputClick, 
            hideCalendar: this.hideCalendar, 
            placeholderText: this.props.placeholderText, 
            disabled: this.props.disabled, 
            className: this.props.className, 
            readOnly: this.props.readOnly, 
            required: this.props.required}), 
        clearButton, 
        this.props.disabled ? null : this.renderCalendar()
      )
      );
  },
});

module.exports = DatePicker;