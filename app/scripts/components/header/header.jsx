var utils = require('../../utils');

var React = require('react');

var Header = React.createClass({
	render: function () {
		var startDay = this.props.startDate.getDate();
		var endDay = utils.addDays(this.props.startDate, 7 /*days in a week*/).getDate();

		var goAnotherWeek = this.props.goAnotherWeek;
		return (
			<div className="rc-header">
				<div className="rc-arrows">
					<div className="rc-icon rc-icon-left-arrow" onClick={goAnotherWeek.bind(null,false)} ></div>
					<div className="rc-icon rc-icon-right-arrow" onClick={goAnotherWeek.bind(null,true)}></div>
				</div>
				<div className="rc-date">{startDay}-{endDay}</div>
				<div className="rc-options">
					<div className="rc-month">
						<select>
							<option>June</option>
							<option>July</option>
							<option>August</option>
							<option>September</option>
						</select>
					</div>
					<div className="rc-years">
						<select>
							<option>2015</option>
							<option>2016</option>
							<option>2017</option>
							<option>2018</option>
						</select>
					</div>
				</div>
			</div>
			);
	}
});

module.exports = Header;