"use strict";

var React = require("react");
var utils = require("../../utils/utils");
var propTypes = require("../../utils/propTypes");
require("date-format-lite");

var Week = React.createClass({
  displayName: "Week",
  propTypes: {
    date: propTypes.date.isRequired,
    month: propTypes.date.isRequired,
    selected: propTypes.date.isRequired
  },

  render: function () {
    return (
      <div className="rc-dp-week">
        {this.renderWeeks()}
      </div>
      )
  },

  getAdditionalClassName: function (day) {
	var inactiveClassName = 'rc-dp-inactiveDay',
		len = this.props.activeDays.length,
		i = 0;

    this.isActiveDay = false;
	for(i; i<len; i++) {
	  if(utils.isSameDay( this.props.activeDays[i], day )) {
		  this.isActiveDay = true;
		  return '';
	  }
	}
	return ' ' + inactiveClassName;
  },

  renderWeeks: function () {
    var days = [],
      date = this.props.date,
      month = this.props.month,
      selected = this.props.selected;

    for (var i = 0; i < 7/*days in a week*/; i++) {
      var day = {
        name: date.format("dd").substring(0, 1),
        number: date.getDate(),
        isCurrentMonth: date.getMonth() === month.getMonth(),
        isToday: date.toDateString() === new Date().toDateString(),
        date: date
      };
      var isSameDate = date.toDateString() === selected.toDateString();
      var className = "rc-dp-day" + (day.isToday ? " today" : "") + (day.isCurrentMonth ? "" : " different-month") + (isSameDate ? " selected" : "")
      days.push(<span key={day.date.toString()} className={className + this.getAdditionalClassName(day.date)} onClick={this.props.select.bind(null, day, this.isActiveDay)}>{day.number}</span>);
      date = utils.addDays(date, 1);
    }
    return days;
  }
});

module.exports = Week;
