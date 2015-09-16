var utils = require('../../utils');

var React = require('react');
var Select = require('react-select');

var Header = React.createClass({
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
			<div className="rc-header">
				<div className="rc-week">
					<div className="rc-icon-wrapper"><span className="rc-icon rc-icon-left-arrow" onClick={goAnotherWeek.bind(null,false)}></span></div>
					<span className="rc-date">{startDay}-{endDay}</span>
					<div className="rc-icon-wrapper"><span className="rc-icon rc-icon-right-arrow" onClick={goAnotherWeek.bind(null,true)}></span></div>
				</div>
				<div className="rc-options">
					<div className="rc-month">
						<Select options={months} value={this.props.startDate.getMonth()} onChange={this.props.goAnotherMonth}
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