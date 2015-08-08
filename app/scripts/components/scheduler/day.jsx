var Day = React.createClass({
	clickTime: function(date){
		return console.log(date);
	},
	render: function () {
		var utils = new Utils();

		var weekday = new Array(7);
		weekday[0] = { full: "Sunday", short: "Sun" };
		weekday[1] = { full: "Monday", short: "Mon" };
		weekday[2] = { full: "Tuesday", short: "Tue" };
		weekday[3] = { full: "Wednesday", short: "Wed" };
		weekday[4] = { full: "Thursday", short: "Thu" };
		weekday[5] = { full: "Friday", short: "Fri" };
		weekday[6] = { full: "Saturday", short: "Sat" };
		var names = weekday[this.props.day.getDay()];

		var timeCells = [];
		var date = this.props.day;
		for (var i = 0; i < this.props.timeCells; i++) {
			timeCells.push(<div onClick={this.clickTime.bind(null,date)}></div>);
			date = utils.addMinutes(date, this.props.timeStep);
		}

		return (
			<div className="rc-day ">
				<div className="rc-day-header big">{names.full}</div>
				<div className="rc-day-header small">{names.short}</div>
				<div className="rc-day-time">
					{timeCells}
				</div>
			</div>
			);
	}
});