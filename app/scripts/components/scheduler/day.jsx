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
	onResizerMouseDown: function (timing, e) {
		if (!this.state.utils.hasClass(e.target, 'rc-event-resizer')) {
			return;
		}
		var nearestOffsetTop = this.getNearestOffsetTop(e.target.parentNode);
		var nearestTiming = this.getNearestTiming(timing);
		var maxTime = nearestTiming == undefined ? this.state.utils.addMinutes(this.props.dayStartTime, this.props.timeStep * this.props.timeCells) : nearestTiming.start;
		this.props.onResizerMouseDown(timing, maxTime, nearestOffsetTop, e);
	},
	getNearestTiming: function (timing) {
		return this.props.timings.filter(function (t) {
			return t.start > timing.start;
		}).sort(function (t1, t2) {
			return t1.start > t2.start ? 1 :
					t1.start < t2.start ? -1 : 0;
		})[0];

	},
	getNearestOffsetTop: function (target) {
		var parent = target.parentNode;
		var children = parent.querySelectorAll('.rc-event');

		var nearestOffsetTop = parent.clientHeight, nearestEvent;
		for (var i = 0; i < children.length; i++) {
			var offTop = children[i].offsetTop;
			if (offTop > target.offsetTop && offTop < nearestOffsetTop) {
				nearestOffsetTop = offTop;
				nearestEvent = children[i];
			}
		}

		return nearestOffsetTop;
	},
	getInitialState: function () {
		return { utils: new Utils() };
	},
	render: function () {
		var utils = this.state.utils;

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
										onEventMouseDown={this.onEventMouseDown.bind(null,timing)} onResizerMouseDown={this.onResizerMouseDown.bind(null,timing)}/>);
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