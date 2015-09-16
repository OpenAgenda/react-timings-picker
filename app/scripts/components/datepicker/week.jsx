"use strict";

var React = require("react");
var utils = require("../../utils");
require("date-format-lite");

var Week = React.createClass({
	displayName: "Week",
	propTypes: {
		date: React.PropTypes.object.isRequired,
		month: React.PropTypes.object.isRequired,
		selected: React.PropTypes.object.isRequired
	},

	render: function () {
		return (
			<div className="rc-dp-week">
				{this.renderWeeks()}
			</div>
			)
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
			days.push(<span key={day.date.toString()} className={className} onClick={this.props.select.bind(null, day)}>{day.number}</span>);
			date = utils.addDays(date, 1);
		}
		return days;
	}
});

module.exports = Week;
