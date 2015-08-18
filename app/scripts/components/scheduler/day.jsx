var Day = React.createClass({
	clickTime: function (date, event) {
		var utils = new Utils();
		var timingStep = this.props.timingStep;

		var nativeEvent = event.nativeEvent;
		var y = nativeEvent.offsetY;
		var timeStep = this.props.timeStep;
		var minutes = (timeStep * y) / event.currentTarget.clientHeight;
		var startMinutes = utils.floor(minutes, timingStep);

		var newTimingStart = utils.addMinutes(date, startMinutes);
		var newTimingEnd = utils.addMinutes(newTimingStart, this.props.defaultTimigDuration);

		if (this.props.dayStartTime <= newTimingStart && this.props.dayEndTime >= newTimingEnd) {
			this.props.addTiming({ start: newTimingStart, end: newTimingEnd });
		}
	},
	onEventMouseDown: function (timing, e) {
		this.props.onEventMouseDown(timing, e);
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
		var names = weekday[this.props.dayStartTime.getDay()];

		var timeCells = [];
		var date = this.props.dayStartTime;
		for (var i = 0; i < this.props.timeCells; i++) {
			timeCells.push(<div className="day-cell" onClick={this.clickTime.bind(null,date)}></div>);
			date = utils.addMinutes(date, this.props.timeStep);
		}

		var timingsComponents = [];

		var startDate = this.props.dayStartTime;

		var timings = this.props.timings;
		var timingStep = this.props.timingStep;
		for (var i = 0; i < timings.length; i++) {
			var timing = timings[i];
			var timingStart = timing.start, timingEnd = timing.end;

			var startMinutesDifference = utils.round(utils.minutesDifference(startDate, timingStart), timingStep);
			timingStart.setMinutes(utils.addMinutes(startDate, startMinutesDifference).getMinutes());
			var endMinutesDifference = utils.round(utils.minutesDifference(startDate, timingEnd), timingStep);
			timingEnd.setMinutes(utils.addMinutes(startDate, endMinutesDifference).getMinutes());
			timingsComponents.push(<Timing startTime={timingStart} endTime={timingEnd} 
										allMinutes={this.props.allMinutes} timing={timing} remove={this.props.removeTiming}
										startMinutesDifference={startMinutesDifference} endMinutesDifference={endMinutesDifference}
										onEventMouseDown={this.onEventMouseDown.bind(null,timing)}/>);
	}

		return (
			<div className="rc-day ">
				<div className="rc-day-header big">{names.full}</div>
				<div className="rc-day-header small">{names.short}</div>
				<div className="rc-day-time" data-date={this.props.dayStartTime.toDateString()}>
					{timeCells}
					{timingsComponents}
				</div>
			</div>
			);
	}
});