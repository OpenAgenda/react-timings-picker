'use strict';

var utils = require('../../utils');
var propTypes = require("../../utils/propTypes");

var React = require('react');
var Day = require('./day.jsx');

var Scheduler = React.createClass({
	propTypes: {
		startDate: propTypes.date.isRequired,
		startTime: propTypes.date.isRequired,
		endTime: propTypes.date.isRequired,
		timeStep: React.PropTypes.number,
		timingStep: React.PropTypes.number.isRequired,
		timings: React.PropTypes.array.isRequired,
		timingsModifications: propTypes.timingsModifications,
		readOnly: React.PropTypes.bool,
		onTimingClick: React.PropTypes.func,
		timingsIdProperty: React.PropTypes.string
	},
	getDefaultProps: function () {
		return {
			timeStep: 60,
		}
	},
	onSchedulerMouseUp: function(e){
		e.stopPropagation();

		var target = this.state.userActionValues.target;
		if (!target || utils.hasClass(target, 'rc-icon-close')) {
			return;
		}
		var actionTiming = this.state.actionTiming, parent = target.parentNode;
		var day = new Date(parent.getAttribute('data-date')), startTime = utils.parseTime(target.querySelector('span.start').textContent),
			endTime = utils.parseTime(target.querySelector('span.end').textContent);
		
		if (this.state.userActionValues.isDrag == true) {
			var t = this.getNewTimingsTime(day, startTime, endTime);

			parent.removeChild(target);
			if (actionTiming.start * 1 == t.start * 1) {
				this.props.onTimingClick(actionTiming.start, actionTiming.end, actionTiming.originalTiming);
			}
			else {
				actionTiming.start = t.start;
				actionTiming.end = t.end;
				this.props.timingsModifications.changeTiming(actionTiming);
			}
		}
		if (this.state.userActionValues.isResize == true) {
			actionTiming.end = this.getEndTimingTime(day, actionTiming.start, endTime);
			this.props.timingsModifications.changeTiming(actionTiming);
		}
		if (this.state.userActionValues.isCreating == true) {
			this.state.userActionValues.parent.removeChild(target);
			if (this.state.userActionValues.parent.hasAttribute('creating')) {
				var t = this.getNewTimingsTime(day, startTime, endTime);

				actionTiming.start = t.start;
				actionTiming.end = t.end;
				this.props.timingsModifications.addTiming({ start: actionTiming.start, end: actionTiming.end });
			}
		}

		this.setState({ userActionValues: this.getDefaultUserActionValues(), actionTiming: undefined, forceUpdate: true });
		calendar.removeEventListener('mousemove', this.eventDragMouseMove);
		calendar.removeEventListener('mousemove', this.eventResizeMouseMove);
		calendar.removeEventListener('mousemove', this.dayMouseMove);
	},
	isOverlap: function (start, end) {
		var timingsIdProperty = this.props.timingsIdProperty,
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
			? start.getMinutes() < startTime.getMinutes() ? utils.addDays(start, 1) : start
			: start.getHours() < startTime.getHours() ? utils.addDays(start, 1) : start;
	},
	getEndTimingTime: function (day, start, prevEnd) {
		var end = new Date(day.getFullYear(), day.getMonth(), day.getDate(), prevEnd.getHours(), prevEnd.getMinutes(), 0, 0);
		return end <= start ? utils.addDays(end, 1 /*one day*/) : end;
	},
	eventDragMouseMove: function (e) {
		var userActionValues = this.state.userActionValues, actionTiming = this.state.actionTiming;
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
			top = parent.clientHeight - userActionValues.target.clientHeight - 2;
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
			this.setTimingValues(utils.round(top, userActionValues.dragStep), undefined, t.start, t.end);

			if (utils.hasClass(parent, 'rc-day-time')) {
				parent.appendChild(userActionValues.target);
			}
		}
	},
	onEventMouseDown: function (timing, e) {
		if (!utils.hasClass(e.target, 'rc-event')) {
			return;
		}
		var target = e.target.cloneNode(true);
		e.target.style.display = 'none';
		target.setAttribute('data-reactid','');

		var parent = e.target.parentNode;
		parent.appendChild(target);

		var dragStep = parent.clientHeight * this.props.timingStep / this.state.allMinutes,
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
		var doc = document.documentElement;
		var scrollTop = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);

		var userActionValues = this.state.userActionValues, actionTiming = this.state.actionTiming;
		var y = utils.round(scrollTop + e.clientY - userActionValues.initialY, userActionValues.dragStep);
		var newValue = userActionValues.initialY + y;

		var minDiff = (y / userActionValues.dragStep) * this.props.timingStep;

		var height, start, end;

		if (newValue >= userActionValues.maxDragY) {
			height = userActionValues.nearestOffsetTop - userActionValues.initialTop - 2;
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
			this.setTimingValues(undefined, utils.round(height, userActionValues.dragStep) - 2, actionTiming.start, end);
		}
	},
	onResizerMouseDown: function (timing, maxTime, nearestOffsetTop, e) {
		if (!utils.hasClass(e.target, 'rc-event-resizer')) {
			return;
		}
		var doc = document.documentElement;
		var scrollTop = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);

		var target = e.target.parentNode, parent = target.parentNode, initialY = scrollTop + e.clientY,
			dragStep = parent.clientHeight * this.props.timingStep / this.state.allMinutes,
			minDragY = initialY - (target.clientHeight - e.target.clientHeight),
			maxDragY = nearestOffsetTop - dragStep,
			initialHeight = target.clientHeight, initialTop = utils.pageOffset(target).top;

		this.setState({
			userActionValues: {
				target: target, parent: parent, initialY: initialY, minDragY: minDragY,
				maxDragY: maxDragY, initialHeight: initialHeight, dragStep: dragStep,
				nearestOffsetTop: nearestOffsetTop, maxTime: maxTime, initialTop: initialTop,
				isResize: true, isDrag: false,
			},
			actionTiming: timing,
		});

		calendar.addEventListener('mousemove', this.eventResizeMouseMove);
	},
	dayMouseMove: function (e) {
		var doc = document.documentElement;
		var scrollTop = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);

		var userActionValues = this.state.userActionValues, actionTiming = this.state.actionTiming;
		var y = utils.round(scrollTop + e.clientY - userActionValues.initialY, userActionValues.dragStep);
		var newValue = userActionValues.initialY + y;
		var parentOffsetTop = utils.pageOffset(userActionValues.parent).top;

		var minDiff = (y / userActionValues.dragStep) * this.props.timingStep;

		var height, top, start, end;

		if (Math.abs(y) > userActionValues.dragStep * 1.5) {
			userActionValues.parent.setAttribute('creating', 'true');
		}

		if (y < 0) {
			if (newValue < userActionValues.minDragY + 2) {
				top = userActionValues.minDragY - parentOffsetTop + 2;
				height = userActionValues.initialY - top - parentOffsetTop, userActionValues.dragStep;
				start = userActionValues.minTime;
			}
			else {
				top = userActionValues.initialTop + y;
				height = Math.abs(y);
				start = utils.addMinutes(actionTiming.start, minDiff);
			}
			end = actionTiming.start;
		}
		else {
			if (newValue > userActionValues.maxDragY) {
				height = userActionValues.maxDragY - utils.pageOffset(userActionValues.target).top;
				end = userActionValues.maxTime;
			}
			else {
				height = Math.abs(y);
				end = utils.addMinutes(actionTiming.start, minDiff);
			}
			top = userActionValues.initialTop;
			start = actionTiming.start;
			
		}

		if (this.isOverlap(start, end) == true) {
			return;
		}
		else {
			this.setTimingValues(utils.round(top, userActionValues.dragStep), utils.round(height, userActionValues.dragStep) - 2, start, end);
		}
	},
	onDayMouseDown: function (userActionValues, e) {
		userActionValues.isCreating = true;
		userActionValues.isDrag = userActionValues.isResize = false;

		this.setState({
			userActionValues: userActionValues, actionTiming: { start: userActionValues.startMinutes, end: userActionValues.startMinutes },
		});

		calendar.addEventListener('mousemove', this.dayMouseMove);
	},
	setTimingValues: function (top, height, startTime, endTime) {
		var userActionValues = this.state.userActionValues;
		
		userActionValues.target.style.top = top != undefined ? top + 'px' : userActionValues.target.style.top;
		userActionValues.target.style.height = height != undefined ? height + 'px' : userActionValues.target.style.height;
		userActionValues.target.querySelector('span.start').innerHTML = utils.formatTime(startTime);
		userActionValues.target.querySelector('span.end').innerHTML = utils.formatTime(endTime);
	},
	getDefaultUserActionValues: function(){
		return {
			target: undefined, initialY: 0, minDragY: 0, maxDragY: 0, initialTop: 0, initialHeight: 0,
			nearestOffsetTop: 0, maxTime: undefined, minTime: undefined,
			isDrag: false, isResize: false, isCreating: false,
		};
	},
	getInitialState: function () {
		return {
			userActionValues: this.getDefaultUserActionValues(), forceUpdate: null, 
			allMinutes: utils.minutesDifference(this.props.startTime, this.props.endTime)
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
	componentDidMount: function () {
		document.addEventListener('mouseup', this.onSchedulerMouseUp);
	},
	render: function () {
		var times = [], startTime = this.props.startTime, endTime = this.props.endTime;
		
		var step = this.props.timeStep;
		for (startTime; startTime < endTime; startTime = utils.addMinutes(startTime, step)) {
			var formattedTime = utils.formatTime(startTime);
			times.push(<div key={formattedTime} className="rc-day-cell">{formattedTime}</div>)
		}

		var timings = this.props.timings;

		var days = [];
		startTime = this.props.startTime;
		var dayStartTime = utils.setTime(this.props.startDate, startTime.getHours(), startTime.getMinutes(), 0, 0);
		var dayEndTime = utils.addMinutes(dayStartTime, this.state.allMinutes);
		var timingsModifications = this.props.readOnly === true ? undefined : {
			addTiming: this.props.timingsModifications.addTiming, removeTiming: this.props.timingsModifications.removeTiming,
		}
		var timingsInteractions = this.props.readOnly === true ? undefined : {
			onEventMouseDown: this.onEventMouseDown, onResizerMouseDown: this.onResizerMouseDown, onDayMouseDown: this.onDayMouseDown,
		}
		for (var i = 0; i < 7/*7 days in a week*/; i++) {

			var currentDayTimings = timings.filter(function (t) {
				return t.start >= dayStartTime && t.end <= dayEndTime;
			});

			var weekdays = { full: this.props.weekdays.full[dayStartTime.getDay()], short: this.props.weekdays.short[dayStartTime.getDay()] }

			days.push(<Day key={i} dayStartTime={dayStartTime} dayEndTime={dayEndTime} timeCells={times.length} timeStep={step} timings={currentDayTimings} 
						timingStep={this.props.timingStep} allMinutes={this.state.allMinutes} defaultTimigDuration={this.props.defaultTimigDuration} 
						timingsModifications={timingsModifications} timingsIdProperty={this.props.timingsIdProperty} timingsInteractions={timingsInteractions}
						readOnly={this.props.readOnly} weekdays={weekdays}/>);
			dayStartTime = utils.addDays(dayStartTime, 1) /*set next day */
			dayEndTime = utils.addDays(dayEndTime, 1);
		}
		return (
			<div className="rc-scheduler">
				<div className="rc-timetable">
					<div className="rc-day-header"></div>
					<div className="rc-side-day-time">
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

module.exports = Scheduler;