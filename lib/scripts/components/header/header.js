var utils = require('../../utils/utils');
var propTypes = require("../../utils/propTypes");

var React = require('react');
var Select = require('react-select');

var Header = React.createClass({displayName: "Header",
	propTypes: {
		startDate: propTypes.date.isRequired,
		goAnotherWeek: React.PropTypes.func.isRequired,
		goAnotherMonth: React.PropTypes.func.isRequired,
		goAnotherYear: React.PropTypes.func.isRequired,
		months: React.PropTypes.arrayOf(React.PropTypes.string).isRequired
	},
	render: function () {
		var startDay = this.props.startDate.getDate();
		var endDay = utils.addDays(this.props.startDate, 7 /*days in a week*/).getDate();

		var goAnotherWeek = this.props.goAnotherWeek, goAnotherMonth = this.props.goAnotherMonth,
			goAnotherYear = this.props.goAnotherYear;
		var months = [];
		for (var i = 0; i < this.props.months.length; i++) {
			months.push({ value: i, label: this.props.months[i] });
		}
		var years = [];
		var currentYear = new Date().getFullYear();
		for (var i = currentYear; i < currentYear + 5; i++) {
			years.push({value: i, label: i.toString()});
		}
		return (
			React.createElement("div", {className: "rc-header"}, 
				React.createElement("div", {className: "rc-week"}, 
					React.createElement("div", {className: "rc-icon-wrapper"}, React.createElement("span", {className: "rc-icon rc-icon-left-arrow", onClick: goAnotherWeek.bind(null,false)})), 
					React.createElement("span", {className: "rc-date"}, startDay, "-", endDay), 
					React.createElement("div", {className: "rc-icon-wrapper"}, React.createElement("span", {className: "rc-icon rc-icon-right-arrow", onClick: goAnotherWeek.bind(null,true)}))
				), 
				React.createElement("div", {className: "rc-options"}, 
					React.createElement("div", {className: "rc-month"}, 
						React.createElement(Select, {options: months, value: this.props.startDate.getMonth(), onChange: this.props.goAnotherMonth, 
							searchable: false, clearable: false})
					), 
					React.createElement("div", {className: "rc-years"}, 
						React.createElement(Select, {options: years, value: currentYear, onChange: this.props.goAnotherYear, clearable: false, allowCreate: true})
					)
				)
			)
			);
	}
});

module.exports = Header;