

var Scheduler = React.createClass({
	
	render: function () {
		var utils = new Utils();

		var times = [], startTime = this.props.startTime, endTime = this.props.endTime;
		
		var step = this.props.timeStep;
		for (startTime; startTime < endTime; startTime = utils.addMinutes(startTime, step)) {
			times.push(<div>{utils.formatTime(startTime)}</div>)
		}

		var days = [];
		startTime = this.props.startTime;
		var startDate = utils.setTime(this.props.startDate, startTime.getHours(), startTime.getMinutes(), 0, 0);
		for (var i = 0; i < 7/*7 days in a week*/; i++) {
			days.push(<Day key={i} day={startDate} timeCells={times.length} timeStep={step} />);
			startDate = utils.addDays(startDate, 1) /*set next day */
		}
		return (
			<div className="rc-scheduler">
				<div className="rc-timetable">
					<div className="rc-day-header"></div>
					<div className="rc-day-time">
						{times}
					</div>
				</div>
				<div className="rc-days">
					{days}
					<div id="rc-timings" className='rc-timings'></div>
				</div>
			</div>
			);
	}
});