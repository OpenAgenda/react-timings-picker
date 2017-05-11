"use strict";

var React = require("react");
var createReactClass = require( 'create-react-class' );
var PropTypes = require( 'prop-types' );
var Popover = require("./popover");
var Calendar = require("./calendar");
var DateInput = require("./date-input");
var propTypes = require("../../utils/propTypes");
var isEqual = require("lodash/lang/isEqual");
require("date-format-lite");

var DatePicker = createReactClass({
  displayName: "DatePicker",
  propTypes: {
    weekdays: PropTypes.arrayOf(PropTypes.string),
    months: propTypes.monthNames.isRequired,
    locale: PropTypes.string,
    dateFormatCalendar: PropTypes.string,
    popoverAttachment: PropTypes.string,
    popoverTargetAttachment: PropTypes.string,
    popoverTargetOffset: PropTypes.string,
    weekStart: PropTypes.number,
    onChange: PropTypes.func.isRequired,
    selected: propTypes.date,
    excludeDates: PropTypes.array,
    isClearable: PropTypes.bool,
    isDatePickerActive: PropTypes.bool,
  },
  getDefaultProps: function () {
    return {
      weekdays: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
      locale: "en-US",
      dateFormatCalendar: "MMMM, YYYY",
      weekStart: 1,
      excludeDates: [],
      isClearable: false
    };
  },
  getInitialState: function () {
    return {
      focus: false,
      virtualFocus: false,
      selected: this.props.selected,
	  disabled: false,
    }
  },
  componentWillReceiveProps: function (nextProps) {
    this.setState({
      selected: nextProps.selected,
      disabled: !nextProps.isDatePickerActive,
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
    var activeDays = this.props.activeDays ? this.props.activeDays : [];

    if (this.state.focus) {
      return (
        <Popover attachment={this.props.popoverAttachment}
              targetAttachment={this.props.popoverTargetAttachment}
              targetOffset={this.props.popoverTargetOffset}>
          <Calendar weekdays={this.props.weekdays}
              months={this.props.months}
              locale={this.props.locale}
              dateFormat={this.props.dateFormatCalendar}
              selected={this.state.selected}
              onSelect={this.handleSelect}
              hideCalendar={this.hideCalendar}
              excludeDates={this.props.excludeDates}
			  activeDays={activeDays}
              weekStart={this.props.weekStart} />
        </Popover>
        )
    }
  },
  render: function () {
    var clearButton = null;
    if ( this.props.isClearable && this.state.selected != null ) {
      clearButton = (
        <button className="rc-icon rc-icon-close" onClick={this.clearSelected}></button>
      );
  }

    return (
      <div className="rc-datepicker rc-dp-container">
        <DateInput name={this.props.name}
            date={this.state.selected}
            dateFormat={this.props.dateFormatInput}
            focus={this.state.focus}
            onFocus={this.handleFocus}
            onBlur={this.handleBlur}
            handleClick={this.onInputClick}
            hideCalendar={this.hideCalendar}
            placeholderText={this.props.placeholderText}
            disabled={this.state.disabled}
            className={this.props.className}
            readOnly={this.props.readOnly}
            required={this.props.required}
		    isDatePickerActive={this.props.isDatePickerActive} />
        {clearButton}
        {this.state.disabled ? null : this.renderCalendar()}
      </div>
      );
  },
});

module.exports = DatePicker;