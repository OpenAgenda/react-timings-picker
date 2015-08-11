

var Scheduler = React.createClass({
	addTiming: function (targetTiming) {
		var timings = this.state.timings;
		if (!(this.props.startTime <= targetTiming.start) && !(this.props.endTime >= targetTiming.end)) {
			return;
		}

		for (var i = 0; i < timings.length; i++) {
			var t = timings[i]
			if (!(t.start >= targetTiming.end) && !(t.end <= targetTiming.start)) {
				return;
			}
		}

		timings.push(targetTiming);
		this.setState({ timings: timings });

		this.props.timingsChangeCallback.call(this, timings, targetTiming, "Add timing");
	},
	getInitialState: function(){
		var timings = this.props.timings.map(function (t) {
			return { start: new Date(t.start), end: new Date(t.end) };
		});
		return { timings: timings };
	},
	render: function () {
		var utils = new Utils();

		var times = [], startTime = this.props.startTime, endTime = this.props.endTime;
		
		var step = this.props.timeStep;
		for (startTime; startTime < endTime; startTime = utils.addMinutes(startTime, step)) {
			times.push(<div>{utils.formatTime(startTime)}</div>)
		}

		var timings = this.state.timings;

		var days = [];
		startTime = this.props.startTime;
		var dayStartTime = utils.setTime(this.props.startDate, startTime.getHours(), startTime.getMinutes(), 0, 0);
		var dayEndTime = utils.addMinutes(dayStartTime, this.props.allMinutes);
		for (var i = 0; i < 7/*7 days in a week*/; i++) {

			var currentDayTimings = timings.filter(function (t) {
				return t.start >= dayStartTime && t.end <= dayEndTime;
			});

			days.push(<Day key={i} dayStartTime={dayStartTime} dayEndTime={dayEndTime} timeCells={times.length} timeStep={step} timings={currentDayTimings} 
						timingStep={this.props.timingStep} allMinutes={this.props.allMinutes} defaultTimigDuration={this.props.defaultTimigDuration} 
						addTiming={this.addTiming}/>);
			dayStartTime = utils.addDays(dayStartTime, 1) /*set next day */
			dayEndTime = utils.addDays(dayEndTime, 1);
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
				</div>
			</div>
			);
	}
});