var Day = React.createClass({
	clickTime: function (date, event) {
		var dayNode = this.getDOMNode().querySelector('.rc-day-time');
		if (dayNode.hasAttribute('creating')) {
			dayNode.removeAttribute('creating');
			return;
		}

		var doc = document.documentElement;
		var top = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);

		var utils = this.state.utils;
		var timingStep = this.props.timingStep;

		var y = top + event.clientY - utils.pageOffset(event.target).top;
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
		var nearestOffsetTop = this.getMaxDragY(e.target.parentNode.offsetTop);
		var nearestTiming = this.getNearestNextTiming(timing);
		var maxTime = nearestTiming == undefined ? this.state.utils.addMinutes(this.props.dayStartTime, this.props.timeStep * this.props.timeCells) : nearestTiming.start;
		this.props.onResizerMouseDown(timing, maxTime, nearestOffsetTop, e);
	},
	onDayMouseDown: function (e) {
		if (!this.state.utils.hasClass(e.target.parentNode, 'rc-day-time')) {
			return;
		}
		var doc = document.documentElement;
		var top = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);

		var utils = this.state.utils, dayNode = e.target.parentNode, userActionValues = {};
		userActionValues.parent = dayNode;

		userActionValues.dragStep = dayNode.clientHeight * this.props.timingStep / this.props.allMinutes;

		userActionValues.initialY = utils.floor(top + e.clientY, userActionValues.dragStep);

		var y = userActionValues.initialTop = utils.floor(userActionValues.initialY - utils.pageOffset(dayNode).top, userActionValues.dragStep);
		startMinutes = utils.addMinutes(this.props.dayStartTime,
			this.props.allMinutes * y / dayNode.clientHeight);


		var nearestTiming = this.getNearestNextTiming({ start: startMinutes });
		userActionValues.maxTime = nearestTiming == undefined ? this.state.utils.addMinutes(this.props.dayStartTime, this.props.timeStep * this.props.timeCells) : nearestTiming.start;
		nearestTiming = this.getNearestPrevTiming({ start: startMinutes });
		userActionValues.minTime = nearestTiming == undefined ? this.props.dayStartTime : nearestTiming.end;

		userActionValues.minDragY = this.getMinDragY(y);
		userActionValues.maxDragY = this.getMaxDragY(y);

		var event = document.createElement('DIV');
		event.className = 'rc-event';
		event.style.height = 0 + 'px';
		event.style.top = y + 'px';

		event.innerHTML = React.renderToStaticMarkup(
				<div className="rc-time">
					<span className="start">{utils.formatTime(startMinutes)}</span> - <span className="end">{utils.formatTime(startMinutes)}</span>
				</div>
			)

		dayNode.appendChild(event);
		userActionValues.target = event;
		userActionValues.initialHeight = 0;
		userActionValues.startMinutes = startMinutes;

		this.props.onDayMouseDown(userActionValues, e);
	},
	getNearestNextTiming: function (timing) {
		return this.props.timings.filter(function (t) {
			return t.start > timing.start;
		}).sort(function (t1, t2) {
			return t1.start > t2.start ? 1 :
					t1.start < t2.start ? -1 : 0;
		})[0];

	},
	getNearestPrevTiming: function (timing) {
		return this.props.timings.filter(function (t) {
			return t.start < timing.start;
		}).sort(function (t1, t2) {
			return t1.start > t2.start ? -1 :
					t1.start < t2.start ? 1 : 0;
		})[0];

	},
	getMaxDragY: function (currentTop) {
		var el = this.getDOMNode().querySelector('.rc-day-time');
		var children = el.querySelectorAll('.rc-event');

		var nearestOffsetTop = el.clientHeight, nearestEvent = el;
		for (var i = 0; i < children.length; i++) {
			var offTop = children[i].offsetTop;
			if (offTop > currentTop && offTop < nearestOffsetTop) {
				nearestOffsetTop = offTop;
				nearestEvent = children[i];
			}
		}

		return nearestEvent == el ? this.state.utils.pageOffset(el).top + el.clientHeight
			: this.state.utils.pageOffset(nearestEvent).top;
	},
	getMinDragY: function (currentTop) {
		var el = this.getDOMNode().querySelector('.rc-day-time');
		var children = el.querySelectorAll('.rc-event');

		var nearestOffsetTop = 0, nearestEvent = el;
		for (var i = 0; i < children.length; i++) {
			var offTop = children[i].offsetTop;
			if (offTop < currentTop && offTop > nearestOffsetTop) {
				nearestOffsetTop = offTop;
				nearestEvent = children[i];
			}
		}

		return nearestEvent == el ? this.state.utils.pageOffset(el).top
			: this.state.utils.pageOffset(nearestEvent).top + nearestEvent.clientHeight;
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
			timeCells.push(<div key={utils.formatTime(date)} className="day-cell" onClick={this.clickTime.bind(null,date)}></div>);
			date = utils.addMinutes(date, this.props.timeStep);
		}

		var timingsComponents = [];

		var startDate = this.props.dayStartTime;

		var timings = this.props.timings;
		var timingStep = this.props.timingStep;
		for (var i = 0; i < timings.length; i++) {
			var timing = timings[i];

			timingsComponents.push(<Timing key={timing[this.props.timingsIdProperty]}
										allMinutes={this.props.allMinutes} timing={timing} remove={this.props.removeTiming}
										startMinutesDifference={utils.round(utils.minutesDifference(startDate,timing.start),timingStep)} 
										endMinutesDifference={utils.round(utils.minutesDifference(startDate,timing.end),timingStep)}
										onEventMouseDown={this.onEventMouseDown.bind(null,timing)} onResizerMouseDown={this.onResizerMouseDown.bind(null,timing)}/>);
	}

		return (
			<div className="rc-day" onMouseDown={this.onDayMouseDown}>
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