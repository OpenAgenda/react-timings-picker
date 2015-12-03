"use strict";

var React = require("react");
var utils = require("../../utils/utils");
var propTypes = require("../../utils/propTypes");
var Week = require("./week");
var onClickOutside = require("react-onclickoutside");
require("date-format-lite");

var Calendar = React.createClass({displayName: "Calendar",
  mixins: [onClickOutside],
  handleClickOutside: function () {
    this.props.hideCalendar();
  },
  propTypes: {
    weekdays: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
    months: propTypes.monthNames,
    locale: React.PropTypes.string,
    dateFormat: React.PropTypes.string.isRequired,
    selected: propTypes.date.isRequired,
    onSelect: React.PropTypes.func.isRequired,
    hideCalendar: React.PropTypes.func.isRequired,
    excludeDates: React.PropTypes.array,
    weekStart: React.PropTypes.number.isRequired
  },
  getDefaultProps: function () {
    return {
      locale: "en-US",
    }
  },

  getInitialState: function () {
    return {
      month: utils.clone(this.props.selected),
      selected: utils.clone(this.props.selected)
    };
  },

  changeMonth: function(value){
    var month = this.state.month;
    month = utils.addMonths(month, value);
    this.setState({ month: month });
  },
  select: function (day) {
    this.props.onSelect(day.date);
  },

  render: function () {
    return (
      React.createElement("div", {className: "rc-dp-calendar"}, 
        React.createElement("div", {className: "rc-dp-header"}, 
          React.createElement("div", {className: "rc-icon-wrapper left", onClick: this.changeMonth.bind(null,-1)}, React.createElement("span", {className: "rc-icon rc-icon-left-arrow"})), 
          this.renderMonthLabel(), 
          React.createElement("div", {className: "rc-icon-wrapper right", onClick: this.changeMonth.bind(null,1)}, React.createElement("span", {className: "rc-icon rc-icon-right-arrow"}))
        ), 
        this.renderDayNames(), 
        this.renderWeeks()
      )
      );
  },

  renderWeeks: function () {
    var weeks = [],
      done = false,
      count = 0;

    var date = utils.startOf(this.state.month, "month");

    while (date.getDay() != this.props.weekStart) {
      date = utils.addDays(date, -1);
    }

    var monthIndex = date.getMonth();
    while (!done) {
      weeks.push(React.createElement(Week, {key: date.toString(), onTimeUpdate: utils.clone(date), month: this.state.month, 
               select: this.select, selected: this.state.selected, date: utils.clone(date)}));
      date = utils.addDays(date, 7);
      done = count++ > 2 && monthIndex !== date.getMonth();
      monthIndex = date.getMonth();
    }
    return weeks;
  },

  renderMonthLabel: function () {
    return React.createElement("span", null, this.formatWithCustomMonth())
  },
  formatWithCustomMonth: function () {
    var fullMonth = "MMMM", shortMonth = "MMM",
      targetSignature, targetMonths,
      format = this.props.dateFormat,
      date = this.state.month;
    var index = format.indexOf(fullMonth);
    if (index < 0) {
      index = format.indexOf(shortMonth);
      if (index < 0)
        return date.format(format);
      targetSignature = shortMonth;
      targetMonths = this.props.months.short;
    }
    else {
      targetSignature = fullMonth;
      targetMonths = this.props.months.full;
    }

    var firstPart = format.substr(0, index),
      lastPart = format.substr(index + targetSignature.length, format.length);

    return (firstPart !== "" ? date.format(firstPart) : "") + targetMonths[date.getMonth()] + (lastPart !== "" ? date.format(lastPart) : "");
  },

  renderDayNames: function () {
    var weekdays = this.props.weekdays.slice(0),
      days = [];
    weekdays = weekdays.concat(weekdays.splice(0, this.props.weekStart));

    for (var i = 0; i < 7/*days in a week*/; i++) {
      days.push(React.createElement("span", {key: weekdays[i], className: "rc-dp-day"}, weekdays[i]));
    }
    return (
      React.createElement("div", {className: "rc-dp-week rc-dp-names"}, 
        days
      )
      );
  }
});

module.exports = Calendar;