var utils = require('../../utils');

var React = require('react');
var Select = require('react-select');

var Header = React.createClass({
	render: function () {
		var startDay = this.props.startDate.getDate();
		var endDay = utils.addDays(this.props.startDate, 7 /*days in a week*/).getDate();

		var goAnotherWeek = this.props.goAnotherWeek, goAnotherMonth = this.props.goAnotherMonth,
			goAnotherYear = this.props.goAnotherYear;

		var monthes = [
			{ value: 0, label: "January" },
			{ value: 1, label: "February" },
			{ value: 2, label: "March" },
			{ value: 3, label: "April" },
			{ value: 4, label: "May" },
			{ value: 5, label: "June" },
			{ value: 6, label: "July" },
			{ value: 7, label: "August" },
			{ value: 8, label: "September" },
			{ value: 9, label: "October" },
			{ value: 10, label: "November" },
			{ value: 11, label: "December" },
		];
		var years = [];
		var currentYear = new Date().getFullYear();
		for (var i = currentYear; i < currentYear + 5; i++) {
			years.push({value: i, label: i.toString()});
		}
		return (
			<div className="rc-header">
				<div className="rc-arrows">
					<div className="rc-icon rc-icon-left-arrow" onClick={goAnotherWeek.bind(null,false)} ></div>
					<div className="rc-icon rc-icon-right-arrow" onClick={goAnotherWeek.bind(null,true)}></div>
				</div>
				<div className="rc-date">{startDay}-{endDay}</div>
				<div className="rc-options">
					<div className="rc-month">
						<Select options={monthes} value={this.props.startDate.getMonth()} onChange={this.props.goAnotherMonth}
							searchable={false} clearable={false}/>
					</div>
					<div className="rc-years">
						<Select options={years} value={currentYear} onChange={this.props.goAnotherYear} clearable={false} allowCreate={true}/>
					</div>
				</div>
			</div>
			);
	}
});

module.exports = Header;