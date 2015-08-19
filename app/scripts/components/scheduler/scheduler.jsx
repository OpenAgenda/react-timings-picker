var Scheduler = React.createClass({
	onSchedulerMouseUp: function(e){
		e.stopPropagation();

		var target = this.state.userActionValues.target;
		if (!target || this.state.utils.hasClass(target, 'rc-icon-close')) {
			return;
		}
		var actionTiming = this.state.actionTiming, utils = this.state.utils, parent = target.parentNode;
		var day = new Date(parent.getAttribute('data-date')), startTime = utils.parseTime(target.querySelector('span.start').innerText),
			endTime = utils.parseTime(target.querySelector('span.end').innerText);
		
		if (this.state.userActionValues.isDrag == true) {
			var t = this.getNewTimingsTime(day, startTime, endTime);

			actionTiming.start = t.start;
			actionTiming.end = t.end;

			parent.removeChild(target);
		}
		if (this.state.userActionValues.isResize == true) {
			actionTiming.end = this.getEndTimingTime(day, actionTiming.start, endTime);
		}

		this.setState({ userActionValues: this.getDefaultUserActionValues(), actionTiming: undefined, forceUpdate: true });
		calendar.removeEventListener('mousemove', this.eventDragMouseMove);
		calendar.removeEventListener('mousemove', this.eventResizeMouseMove);

		this.props.changeTiming(actionTiming);
	},
	isOverlap: function (start, end) {
		var timingsIdProperty = this.state.timingsIdProperty,
			actionTimingId = this.state.actionTiming[timingsIdProperty];
		var timings = this.props.timings;
		for (var i = 0; i < timings.length; i++) {
			var t = timings[i];
			if (t[timingsIdProperty] == actionTimingId) continue; 
			
			if (!(t.start >= end) && !(t.end <= start)) return true;
		}
		return false;
	},
	getNewTimingsTime: function (day, prevStart, prevEnd) {
		var start = this.getStartTimingTime(day, prevStart), end = this.getEndTimingTime(day, start, prevEnd);
		return { start: start, end: end };
	},
	getStartTimingTime: function (day, prevStart) {
		var startTime = this.props.startTime;
		var start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), prevStart.getHours(), prevStart.getMinutes(), 0, 0);
		return start.getHours() == startTime.getHours()
			? start.getMinutes() < startTime.getMinutes() ? this.state.utils.addDays(start, 1) : start
			: start.getHours() < startTime.getHours() ? this.state.utils.addDays(start, 1) : start;
	},
	getEndTimingTime: function (day, start, prevEnd) {
		var end = new Date(day.getFullYear(), day.getMonth(), day.getDate(), prevEnd.getHours(), prevEnd.getMinutes(), 0, 0);
		return end <= start ? this.state.utils.addDays(end, 1 /*one day*/) : end;
	},
	eventDragMouseMove: function (e) {
		var userActionValues = this.state.userActionValues, utils = this.state.utils, actionTiming = this.state.actionTiming;
		var parent = e.target.parentNode;
		var y = utils.round(e.clientY - userActionValues.initialY, userActionValues.dragStep);
		var newValue = userActionValues.initialY + y;

		var minDiff = (y / userActionValues.dragStep) * this.props.timingStep;
		var timingDuration = utils.minutesDifference(this.state.actionTiming.start, this.state.actionTiming.end);

		var top, start, end;

		if (!utils.hasClass(parent, 'rc-day-time')) {
			return;
		}

		if (newValue > userActionValues.maxDragY) {
			top = parent.clientHeight - userActionValues.target.clientHeight;
			start = utils.addMinutes(this.props.endTime, timingDuration * (-1));
			end = this.props.endTime;
		}
		else if (newValue < userActionValues.minDragY) {
			top = 0;
			start = this.props.startTime;
			end = utils.addMinutes(this.props.startTime, timingDuration);
		}
		else {
			top = userActionValues.initialTop + y;
			start = utils.addMinutes(actionTiming.start, minDiff);
			end = utils.addMinutes(actionTiming.end, minDiff);
		}

		var t = this.getNewTimingsTime(new Date(parent.getAttribute('data-date')), start, end);

		if (this.isOverlap(t.start, t.end) == true) {
			return;
		}
		else {
			this.setTimingValues(top, undefined, t.start, t.end);

			if (utils.hasClass(parent, 'rc-day-time')) {
				parent.appendChild(userActionValues.target);
			}
		}
	},
	onEventMouseDown: function (timing, e) {
		if (!this.state.utils.hasClass(e.target, 'rc-event')) {
			return;
		}
		var target = e.target.cloneNode(true);
		e.target.style.display = 'none';
		target.setAttribute('data-reactid','');

		var parent = e.target.parentNode;
		parent.appendChild(target);

		var dragStep = parent.clientHeight * this.props.timingStep / this.props.allMinutes,
			initialY = e.clientY, minDragY = initialY - target.offsetTop,
			maxDragY = minDragY + parent.clientHeight - target.clientHeight,
			initialTop = parseInt(target.style.top.replace('px'));

		this.setState({
			userActionValues: {
				target: target, initialY: initialY, minDragY: minDragY,
				maxDragY: maxDragY, initialTop: initialTop, dragStep: dragStep,
				isDrag: true, isResize: false,
			},
			actionTiming: timing,
		});

		e.stopPropagation();

		calendar.addEventListener('mousemove', this.eventDragMouseMove);
	},
	eventResizeMouseMove: function (e) {
		var userActionValues = this.state.userActionValues, utils = this.state.utils, actionTiming = this.state.actionTiming;
		var y = utils.round(e.clientY - userActionValues.initialY, userActionValues.dragStep);
		var newValue = userActionValues.initialY + y;

		var minDiff = (y / userActionValues.dragStep) * this.props.timingStep;

		var height, start, end;

		if (newValue >= userActionValues.maxDragY) {
			height = userActionValues.nearestOffsetTop - userActionValues.target.offsetTop;
			end = userActionValues.maxTime;
		}
		else if (newValue < userActionValues.minDragY) {
			height = userActionValues.dragStep;
			end = utils.addMinutes(this.props.startTime, this.props.timingStep);
		}
		else {
			height = userActionValues.initialHeight + y;
			end = utils.addMinutes(actionTiming.end, minDiff);
		}
		if (this.isOverlap(actionTiming.start, end) == true) {
			return;
		}
		else {
			userActionValues.target.style.height = height + 'px';
			this.setTimingValues(undefined, height, actionTiming.start, end);
		}
	},
	onResizerMouseDown: function (timing, maxTime, nearestOffsetTop, e) {
		if (!this.state.utils.hasClass(e.target, 'rc-event-resizer')) {
			return;
		}

		var target = e.target.parentNode, parent = target.parentNode, initialY = e.clientY,
			dragStep = parent.clientHeight * this.props.timingStep / this.props.allMinutes,
			minDragY = initialY - (target.clientHeight - e.target.clientHeight),
			maxDragY = initialY + nearestOffsetTop - target.offsetTop - target.clientHeight,
			initialHeight = target.clientHeight;

		this.setState({
			userActionValues: {
				target: target, parent: parent, initialY: initialY, minDragY: minDragY,
				maxDragY: maxDragY, initialHeight: initialHeight, dragStep: dragStep,
				nearestOffsetTop: nearestOffsetTop, maxTime: maxTime,
				isResize: true, isDrag: false,
			},
			actionTiming: timing,
		});

		calendar.addEventListener('mousemove', this.eventResizeMouseMove);
	},
	setTimingValues: function (top, height, startTime, endTime) {
		var userActionValues = this.state.userActionValues, utils = this.state.utils;
		
		userActionValues.target.style.top = top != undefined ? top + 'px' : userActionValues.target.style.top;
		userActionValues.target.style.height = height != undefined ? height + 'px' : userActionValues.target.style.height;
		userActionValues.target.querySelector('span.start').innerHTML = utils.formatTime(startTime);
		userActionValues.target.querySelector('span.end').innerHTML = utils.formatTime(endTime);
	},
	getDefaultUserActionValues: function(){
		return {
			target: undefined, initialY: 0, minDragY: 0, maxDragY: 0, initialTop: 0, initialHeight: 0,
			nearestOffsetTop: 0, maxTime: undefined,
			isDrag: false, isResize: false,
		};
	},
	getInitialState: function () {
		var timingsIdProperty = "_rc_id";

		return {
			userActionValues: this.getDefaultUserActionValues(),
			utils: new Utils(), forceUpdate: null, timingsIdProperty: timingsIdProperty,
		};
	},
	shouldComponentUpdate: function (nextProps, nextState) {
		if (nextState.forceUpdate == true) {
			nextState.forceUpdate = null;
			return true;
		}
		var prevActionValues = this.state.userActionValues, nextActionValues = nextState.userActionValues;
		if (prevActionValues.target != nextActionValues.target ||
			prevActionValues.initialY != nextActionValues.initialY || prevActionValues.minDragY != nextActionValues.minDragY ||
			prevActionValues.maxDragY != nextActionValues.maxDragY || prevActionValues.initialTop != nextActionValues.initialTop) {
			return false;
		}
		return true;
	},
	render: function () {
		var utils = this.state.utils;

		var times = [], startTime = this.props.startTime, endTime = this.props.endTime;
		
		var step = this.props.timeStep;
		for (startTime; startTime < endTime; startTime = utils.addMinutes(startTime, step)) {
			times.push(<div>{utils.formatTime(startTime)}</div>)
		}

		var timings = this.props.timings;

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
						addTiming={this.props.addTiming} removeTiming={this.props.removeTiming} onEventMouseDown={this.onEventMouseDown} onResizerMouseDown={this.onResizerMouseDown}/>);
			dayStartTime = utils.addDays(dayStartTime, 1) /*set next day */
			dayEndTime = utils.addDays(dayEndTime, 1);
		}
		return (
			<div className="rc-scheduler rc-noselect" onMouseUp={this.onSchedulerMouseUp}>
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