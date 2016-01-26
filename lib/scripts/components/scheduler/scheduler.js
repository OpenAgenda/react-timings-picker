'use strict';

var utils = require('../../utils/utils'),
  domUtils = require('../../utils/domUtils');
var propTypes = require("../../utils/propTypes");

var React = require('react');
var ReactDOM = require("react-dom");

var Day = require('./day');

var Modal = require('../modal/Modal');

var dayNodeClassName = 'rc-day-time',
  timingClassName = 'rc-event';

require("date-format-lite");

var Scheduler = React.createClass({displayName: "Scheduler",
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
      timeInputFormat: 'h:mm',
      timeInputValidationPattern: propTypes.timePattern
    }
  },

  onSchedulerMouseUp: function ( e ) {
    e.stopPropagation();
    e.preventDefault();

    var target = this.state.userActionValues.target;
    if ( !target || utils.hasClass( target, 'rc-icon-close' ) ) {
      return;
    }
    var actionTiming = this.state.actionTiming, parent = target.parentNode;
    var day = new Date( parent.getAttribute( 'data-date' ) ), startTime = utils.parseTime( target.querySelector( 'span.start' ).textContent ),
      endTime = utils.parseTime( target.querySelector( 'span.end' ).textContent );

    if ( endTime < startTime ) {
      endTime = utils.addDays( endTime, 1 );
    }

    while ( utils.isTimeshiftDay( startTime ) || utils.isTimeshiftDay( endTime ) ) {
      startTime = utils.addDays( startTime, 1 );
      endTime = utils.addDays( endTime, 1 );
    }

    if ( this.state.userActionValues.isDrag == true ) {
      var t = this.getNewTimingsTime( day, startTime, endTime );

      parent.removeChild( target );
      if ( actionTiming.start.getTime() === t.start.getTime() && actionTiming.end.getTime() === t.end.getTime() ) {
        this.props.onTimingClick( actionTiming.start, actionTiming.end, actionTiming.originalTiming );
        this.onTimingClick( actionTiming );
      }
      else {
        actionTiming.start = t.start;
        actionTiming.end = t.end;
        this.props.timingsModifications.changeTiming( actionTiming );
      }
    }
    if ( this.state.userActionValues.isResize == true ) {
      actionTiming.end = this.getEndTimingTime( actionTiming.start, startTime, endTime );
      this.props.timingsModifications.changeTiming( actionTiming );
    }
    if ( this.state.userActionValues.isCreating == true ) {
      this.state.userActionValues.parent.removeChild( target );
      if ( this.state.userActionValues.parent.hasAttribute( 'creating' ) ) {
        var t = this.getNewTimingsTime( day, startTime, endTime );

        actionTiming.start = t.start;
        actionTiming.end = t.end;
        this.props.timingsModifications.addTiming( { start: actionTiming.start, end: actionTiming.end } );
      }
    }

    this.setState( {
      userActionValues: this.getDefaultUserActionValues(),
      actionTiming: undefined,
      forceUpdate: true
    } );

    document.removeEventListener( 'mousemove', this.eventDragMouseMove );
    document.removeEventListener( 'mousemove', this.eventResizeMouseMove );
    document.removeEventListener( 'mousemove', this.dayMouseMove );
  },

  onTimingClick: function (timing) {
    this.setState({
      showAdjust: true,
      selectedTiming: timing
    });
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

  getNewTimingsTime: function ( day, prevStart, prevEnd ) {
    var start = this.getStartTimingTime( day, prevStart ), end = this.getEndTimingTime( start, prevStart, prevEnd );
    return { start: start, end: end };
  },

  getStartTimingTime: function ( day, prevStart ) {
    var startTime = this.props.startTime;

    day = prevStart.getHours() == startTime.getHours()
      ? prevStart.getMinutes() < startTime.getMinutes() ? utils.addDays( day, 1 ) : day
      : prevStart.getHours() < startTime.getHours() ? utils.addDays( day, 1 ) : day;

    var start = new Date( day.getFullYear(), day.getMonth(), day.getDate(), prevStart.getHours(), prevStart.getMinutes(), 0, 0 );

    return start;
  },

  getEndTimingTime: function ( start, prevStart, prevEnd ) {

    var isTimeShiftDay = false;

    if ( utils.isTimeshiftDay( start ) ) {

      start = utils.addDays( start, 1 );
      isTimeShiftDay = true;

    }

    var end = new Date( start.getFullYear(), start.getMonth(), start.getDate(), prevEnd.getHours(), prevEnd.getMinutes(), 0, 0 );
    end = end <= start ? utils.addDays( end, 1 ) : end;


    return isTimeShiftDay ? utils.addDays( end, ( -1 ) ) : end;
  },

  eventDragMouseMove: function ( e ) {
    var userActionValues = this.state.userActionValues,

      actionTiming = this.state.actionTiming;

    var parent = e.target.parentNode,
      isParentDayNode = utils.hasClass( parent, 'rc-day-time' );

	var isDayInActiveNode = utils.hasClass( parent, 'rc-inactiveDay' );

    var y = utils.round( e.clientY - userActionValues.initialY + this.state.canvasScroll, userActionValues.dragStep ),

      newValue = userActionValues.initialY + y;

    var minutesDifference = ( y / userActionValues.dragStep ) * this.props.timingStep;

    var top,
      start = utils.setTime( this.props.startTime, actionTiming.start.getHours(), actionTiming.start.getMinutes() ),
      end = utils.setTime( this.props.endTime, actionTiming.end.getHours(), actionTiming.end.getMinutes() );

    if ( !isParentDayNode || isDayInActiveNode) {
		return;
	}

    if ( newValue > userActionValues.maxDragY ) {
      top = parent.clientHeight - userActionValues.target.clientHeight - 2;
      start = utils.addMinutes( this.props.endTime, userActionValues.timingDuration * ( -1 ) );
      end = this.props.endTime;

    } else if ( newValue < userActionValues.minDragY ) {
      top = 0;
      start = this.props.startTime;
      end = utils.addMinutes( this.props.startTime, userActionValues.timingDuration );

    } else {

      top = userActionValues.initialTop + y;
      start = utils.addMinutes( start, minutesDifference );
      end = utils.addMinutes( end, minutesDifference );

    }

    var t = this.getNewTimingsTime( new Date( parent.getAttribute( 'data-date' ) ), start, end );

    if ( !this.isOverlap( t.start, t.end ) ) {

      this.setTimingValues( top, undefined, parent.clientHeight, start, end );

      if ( isParentDayNode ) {
        parent.appendChild( userActionValues.target );
      }

    }
  },

  onTimingMouseDown: function( timing, e ) {

    if ( e.target.hasAttribute( 'data-nodrag' ) ) return;

    var timingNode = domUtils.getParentHavingClass( e.target, 'rc-event' );

    if ( !timingNode ) return;

    // Clone timing element and hide it. Then work only with cloned element
    // This needs to avoid issues with React -
    //    when moving timing to another day, React tells that DOM was changed
    var clonedTimingNode = timingNode.cloneNode( true );

    timingNode.style.display = 'none';

    clonedTimingNode.setAttribute( 'data-reactid', '' );

    var parent = timingNode.parentNode;

    parent.appendChild( clonedTimingNode );


    var dragStep = parent.clientHeight * this.props.timingStep / this.props.allMinutes,

      initialY = e.clientY + this.state.canvasScroll,

      minDragY = initialY - clonedTimingNode.offsetTop,

      maxDragY = minDragY + parent.clientHeight - clonedTimingNode.clientHeight,

      initialTop = parseFloat( clonedTimingNode.style.top.replace( 'px' ) );


    var timingDuration = utils.minutesDifference(timing.start, timing.end, true, true);

    this.setState( {
      userActionValues: {
        target: clonedTimingNode,
        initialY: initialY,
        minDragY: minDragY,
        maxDragY: maxDragY,
        initialTop: initialTop,
        dragStep: dragStep,
        isDrag: true,
        isResize: false,
        originalTarget: timingNode,
        timingDuration: timingDuration
      },
      actionTiming: timing,
    } );

    e.stopPropagation();

    document.addEventListener( 'mousemove', this.eventDragMouseMove );
  },

  eventResizeMouseMove: function (e) {

    var doc = document.documentElement;
    var scrollTop = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);

    var userActionValues = this.state.userActionValues, actionTiming = this.state.actionTiming;
    var y = utils.round(scrollTop + e.clientY - userActionValues.initialY + this.state.canvasScroll, userActionValues.dragStep);
    var newValue = userActionValues.initialY + y;

    var top = domUtils.elementOffset( userActionValues.parent ).top

    var minDiff = (y / userActionValues.dragStep) * this.props.timingStep;

    var height,
      start = utils.setTime(this.props.startTime, actionTiming.start.getHours(), actionTiming.start.getMinutes()),
      end = utils.setTime(this.props.endTime, actionTiming.end.getHours(), actionTiming.end.getMinutes());

    var mouseYPosition = e.clientY + this.state.canvasScroll - top + userActionValues.dragStep + scrollTop;

    var minutesDifferenceFromStart = utils.round(
        ( mouseYPosition ) / userActionValues.dragStep * this.props.timingStep,
        this.props.timingStep
      );

    var fromDayStartToTimingsBottom = utils.round( mouseYPosition, userActionValues.dragStep );

    if ( newValue >= userActionValues.maxDragY ) {

      height = userActionValues.nearestOffsets.top - userActionValues.initialTop - 2;
      end = userActionValues.maxTime;

    }
    else if ( newValue < userActionValues.minDragY ) {
      height = userActionValues.dragStep;
      end = utils.addMinutes( start, this.props.timingStep );

      e.stopPropagation();
      e.preventDefault();
    }
    else {
      height = fromDayStartToTimingsBottom - userActionValues.initialTop - 2;

      var currentDay = utils.setTime( new Date( userActionValues.parent.getAttribute( 'data-date' ) ),
        this.props.startTime.getHours(), this.props.startTime.getMinutes() );

      end = utils.addMinutes( currentDay, minutesDifferenceFromStart );
    }

    if ( !this.isOverlap( actionTiming.start, end ) ) {

      this.setTimingValues(undefined, height,
        userActionValues.parent.clientHeight, start, end);

    }

  },

  onResizerMouseDown: function ( timing, maxTime, nearestOffsets, e ) {

    if (!utils.hasClass(e.target, 'rc-event-resizer')) {
      return;
    }

    var target = domUtils.getParentHavingClass( e.target, 'rc-event' ),

      parent = domUtils.getParentHavingClass( e.target, 'rc-day-time' ),

      initialY = this.state.canvasScroll + e.clientY,

      dragStep = parent.clientHeight * this.props.timingStep / this.props.allMinutes,

      minDragY = initialY - (target.clientHeight - e.target.clientHeight),

      maxDragY = nearestOffsets.offsetTop - dragStep,

      initialHeight = target.clientHeight,

      initialTop = parseFloat( target.style.top.replace( 'px' ) );

    this.setState({
      userActionValues: {
        target: target, parent: parent, initialY: initialY, minDragY: minDragY,
        maxDragY: maxDragY, initialHeight: initialHeight, dragStep: dragStep,
        nearestOffsets: nearestOffsets, maxTime: maxTime, initialTop: initialTop,
        isResize: true, isDrag: false,
      },
      actionTiming: timing,
    });

    document.addEventListener('mousemove', this.eventResizeMouseMove);
  },

  dayMouseMove: function (e) {

    var doc = document.documentElement;

    var scrollTop = ( window.pageYOffset || doc.scrollTop ) - ( doc.clientTop || 0 ) + this.state.canvasScroll;

    var userActionValues = this.state.userActionValues,

    actionTiming = this.state.actionTiming;

    var y = utils.round( scrollTop + e.clientY - userActionValues.initialY, userActionValues.dragStep );

    var newValue = userActionValues.initialY + y;

    var parentOffsetTop = domUtils.elementOffset( userActionValues.parent ).top;

    var minutesDiff = ( y / userActionValues.dragStep ) * this.props.timingStep;

    var height, top,
      start = utils.setTime( this.props.startTime, actionTiming.start.getHours(), actionTiming.start.getMinutes() ),
      end = utils.setTime( this.props.endTime, actionTiming.end.getHours(), actionTiming.end.getMinutes() );

    if ( Math.abs(y) > userActionValues.dragStep * 1.5 ) {

      userActionValues.parent.setAttribute( 'creating', 'true' );

    }

    if ( y < 0 ) {

      if ( newValue < userActionValues.minDragY + 2 ) {

        top = userActionValues.minTop;
        height = userActionValues.initialTop - top - 2;
        start = userActionValues.minTime;

      } else {

        top = userActionValues.initialTop + y;
        height = Math.abs(y) - 2;
        start = utils.addMinutes( actionTiming.start, minutesDiff );

      }

      end = actionTiming.start;

    } else {

      if (newValue > userActionValues.maxDragY) {

        height = userActionValues.maxDragY - domUtils.elementOffset( userActionValues.target ).top - 2;
        end = userActionValues.maxTime;

      } else {

        height = Math.abs( y ) - 2;
        end = utils.addMinutes( actionTiming.start, minutesDiff );

      }

      top = userActionValues.initialTop;

      start = actionTiming.start;

    }

    if ( !this.isOverlap( start, end ) ) {

      this.setTimingValues( top, height,
        userActionValues.parent.clientHeight, start, end );

    }

  },
  onDayMouseDown: function ( e, extremePoints, timing ) {

    var top = domUtils.getVertiacalScrollOffset() + this.state.canvasScroll;

    var dayNode = domUtils.getParentHavingClass( e.target, dayNodeClassName );

    var dragStep = dayNode.clientHeight * this.props.timingStep / this.props.allMinutes;

    var initialY = utils.round( top + e.clientY, dragStep );

    var initialTop = utils.round( initialY - domUtils.elementOffset( dayNode ).top, dragStep );

    var event = document.createElement( 'DIV' );
    event.className = timingClassName;
    event.style.height = 0 + 'px';
    event.style.top = initialTop + 'px';

    event.innerHTML =
      '<div class="rc-time rc-below">' +
        '<span class="start">' + utils.formatTime( timing.start ) + '</span>' +
        ' - ' +
        '<span class="end">' + utils.formatTime( timing.end ) + '</span>' +
      '</div>'

    dayNode.appendChild( event );

    this.setState( {
      userActionValues: {
        parent: dayNode,
        dragStep: dragStep,
        initialY: initialY,
        initialTop: initialTop,
        target: event,
        initialHeight: 0,
        isCreating: true,
        isDrag: false,
        isResize: false,

        minTime: extremePoints.minTime,
        maxTime: extremePoints.maxTime,
        minDragY: extremePoints.minDragY,
        maxDragY: extremePoints.maxDragY,
        minTop: extremePoints.minTop,
      },
      actionTiming: timing,
    } );

    document.addEventListener( 'mousemove', this.dayMouseMove );
  },

  setTimingValues: function ( top, height, allHeight, start, end ) {

    var userActionValues = this.state.userActionValues,
      target = userActionValues.target;

    top = top != undefined ? top : parseFloat( target.style.top );
    height = height != undefined ? height : parseFloat( target.style.height );

    target.style.top = top + 'px';
    if ( height + 'px' !== target.style.height ) {
      target.style.height = height + 'px';
    }

    target.querySelector( 'span.start' ).innerHTML = utils.formatTime( start );
    target.querySelector( 'span.end' ).innerHTML = utils.formatTime( end );

  },

  getDefaultUserActionValues: function(){
    return {
      target: undefined,
      initialY: 0,
      minDragY: 0,
      maxDragY: 0,
      initialTop: 0,
      initialHeight: 0,
      nearestOffsets: undefined,
      maxTime: undefined,
      minTime: undefined,
      isDrag: false,
      isResize: false,
      isCreating: false,
      originalTarget: undefined,
      timingDuration: 0
    };
  },

  getInitialState: function () {

    return {
      userActionValues: this.getDefaultUserActionValues(),
      forceUpdate: null,
      canvasScroll: 0,
      showAdjust: false,
      selectedTiming: null
    };

  },

  shouldComponentUpdate: function( nextProps, nextState ) {

    if ( nextState.forceUpdate == true ) {
      nextState.forceUpdate = null;
      return true;
    }

    var prevActionValues = this.state.userActionValues, nextActionValues = nextState.userActionValues;

    if ( prevActionValues.target != nextActionValues.target ||
      prevActionValues.initialY != nextActionValues.initialY ||
      prevActionValues.minDragY != nextActionValues.minDragY ||
      prevActionValues.maxDragY != nextActionValues.maxDragY ||
      prevActionValues.initialTop != nextActionValues.initialTop ) {
      return false;
    }

    return true;
  },

  componentDidMount: function () {

    var self = this;

    this.refs.scrollable.addEventListener( 'scroll', function( e ) {

      self.setState( {
        canvasScroll: e.target.scrollTop
      } );

      if (self.state.userActionValues && self.state.userActionValues.originalTarget ) {
          self.state.userActionValues.originalTarget.style.display = 'none';
      }

    });

    document.addEventListener('mouseup', this.onSchedulerMouseUp);

  },

  onTimeInputChange: function ( event ) {

    var input = event.target,
      errorClass = 'rc-error';

    var isError = false,
      timings = this.props.timings;

    var timing = {
        start: this.state.selectedTiming.start,
        end: this.state.selectedTiming.end
      },
      newStartTime = this.refs.startTimeInput.value.date(),
      newEndTime = this.refs.endTimeInput.value.date();

    timing.start = utils.setTime( timing.start, newStartTime.getHours(), newStartTime.getMinutes() );
    timing.end = utils.setTime( timing.end, newEndTime.getHours(), newEndTime.getMinutes() );
    timing.end = timing.end < timing.start ? utils.addDays( timing.end, 1 ) : timing.end;
    timing[this.props.timingsIdProperty] = this.state.selectedTiming[this.props.timingsIdProperty]

    var lessThanStart = timing.start.getHours() === this.props.startTime.getHours()
      ? timing.start.getMinutes() < this.props.startTime.getMinutes()
      : timing.start.getHours() < this.props.startTime.getHours();

    var moreThanEnd;

    if ( this.props.endTime.getHours() <= this.props.startTime.getHours() ) {
      if ( timing.end.getHours() >= 0 && timing.end.getHours() <= this.props.endTime.getHours() ) {
        moreThanEnd = timing.end.getHours() === this.props.endTime.getHours()
          ? timing.end.getMinutes() > this.props.endTime.getMinutes()
          : timing.end.getHours() > this.props.endTime.getHours();
      }
    }
    else {
      moreThanEnd = timing.end.getHours() === this.props.endTime.getHours()
      ? timing.end.getMinutes() > this.props.endTime.getMinutes()
      : timing.end.getHours() > this.props.endTime.getHours();
    }

    if ( !this.props.timeInputValidationPattern.test( input.value )
      || lessThanStart || moreThanEnd ) {
      isError = true;
    }
    else {
      for ( var i = 0; i < timings.length; i++ ) {

        var t = timings[i];
        if ( t[this.props.timingsIdProperty] === timing[this.props.timingsIdProperty] ) continue;

        if ( timing.start < t.end && timing.end > t.start ) {
          isError = true;
          break;
        }

      }
    }

    if ( !isError ) {
      domUtils.removeClass(input, errorClass);
    }
    else {
      domUtils.addClass(input, errorClass);
    }
  },

  closeModal: function () {
    this.setState({
      showAdjust: false,
      selectedTiming: null
    });
  },

  adjustTiming: function () {

    if ( utils.hasClass( this.refs.startTimeInput, 'rc-error' )
      || utils.hasClass( this.refs.endTimeInput, 'rc-error' ) ) {
      return;
    }

    var timing = this.state.selectedTiming,
      newStartTime = this.refs.startTimeInput.value.date(),
      newEndTime = this.refs.endTimeInput.value.date();
    timing.start = utils.setTime(timing.start, newStartTime.getHours(), newStartTime.getMinutes());
    timing.end = utils.setTime( timing.end, newEndTime.getHours(), newEndTime.getMinutes() );
    timing.end = timing.end < timing.start ? utils.addDays( timing.end, 1 ) : timing.end;

    this.props.timingsModifications.changeTiming(timing);

    this.setState({
      showAdjust: false,
      selectedTiming: null
    });

  },

  renderModal: function () {

    var customStyle = {
      overlay: {
        top: this.state.canvasScroll + 'px',
        bottom: (0 - this.state.canvasScroll) + 'px',
      },
      content: {}
    }

    var result = !this.state.showAdjust
      ? null
      : (
        React.createElement(Modal, {ref: "ModalWindow", show: this.state.showAdjust, 
               selector: '.rc-scheduler', 
               styles: customStyle, 
               onClose: this.closeModal}, 
          React.createElement("div", {className: "rc-time-adjustment"}, 
            React.createElement("section", null, 
              this.props.startTimeLabel, 
              React.createElement("br", null), 
              React.createElement("input", {className: "rc-dp-input", type: "text", name: "startTime", defaultValue: this.state.selectedTiming.start.format(this.props.timeInputFormat), 
                     ref: "startTimeInput", onChange: this.onTimeInputChange})
            ), 
            React.createElement("section", null, 
              this.props.endTimeLabel, 
              React.createElement("br", null), 
              React.createElement("input", {className: "rc-dp-input", type: "text", name: "endTime", defaultValue: this.state.selectedTiming.end.format(this.props.timeInputFormat), 
                     ref: "endTimeInput", onChange: this.onTimeInputChange})
            ), 
            React.createElement("a", {className: "rc-adjust-button", onClick: this.adjustTiming}, this.props.strings.adjust)
          )
        )
      );

    return result;

  },

  render: function () {
    var times = [], startTime = this.props.startTime, endTime = this.props.endTime;

    var step = this.props.timeStep;
    for (startTime; startTime < endTime; startTime = utils.addMinutes(startTime, step)) {
      var formattedTime = utils.formatTime(startTime);
      times.push(React.createElement("div", {key: formattedTime, className: "rc-day-cell"}, formattedTime))
    }

    var timings = this.props.timings;

    var days = [];
    startTime = this.props.startTime;
    var dayStartTime = utils.setTime(this.props.startDate, startTime.getHours(), startTime.getMinutes(), 0, 0);
    var dayEndTime = utils.addMinutes(dayStartTime, this.props.allMinutes);
    var timingsModifications = this.props.readOnly === true ? undefined : {
      addTiming: this.props.timingsModifications.addTiming,
      removeTiming: this.props.timingsModifications.removeTiming,
    }

    var timingsInteractions = this.props.readOnly === true ? undefined : {
      onTimingMouseDown: this.onTimingMouseDown,
      onResizerMouseDown: this.onResizerMouseDown,
      onDayMouseDown: this.onDayMouseDown,
    }

    var activeDays = this.props.activeDays ? this.props.activeDays : [];

    for (var i = 0; i < 7/*7 days in a week*/; i++) {

      var currentDayTimings = timings.filter(function (t) {
        return t.start >= dayStartTime && t.end <= dayEndTime;
      });

      days.push( React.createElement(Day, {
        key: i, 
        dayStartTime: dayStartTime, 
        dayEndTime: dayEndTime, 
        timeCells: times.length, 
        timeStep: step, 
        timings: currentDayTimings, 
        timingStep: this.props.timingStep, 
        allMinutes: this.props.allMinutes, 
        defaultTimigDuration: this.props.defaultTimigDuration, 
        timingsModifications: timingsModifications, 
        timingsIdProperty: this.props.timingsIdProperty, 
        timingsInteractions: timingsInteractions, 
        canvasScroll: this.state.canvasScroll, 
        activeDays: activeDays, 
        readOnly: this.props.readOnly}) );

      dayStartTime = utils.addDays(dayStartTime, 1); /*set next day */

      dayEndTime = utils.addDays(dayEndTime, 1);

    }

    var schedulerClasses = 'rc-scheduler' + (this.state.showAdjust ? ' noscroll' : '');

    return (
      React.createElement("div", {className: schedulerClasses, ref: "scrollable"}, 
        React.createElement("div", {className: "rc-timetable"}, 
          React.createElement("div", {className: "rc-day-header"}), 
          React.createElement("div", {className: "rc-side-day-time"}, 
            times
          )
        ), 
        React.createElement("div", {className: "rc-days"}, 
          days
        ), 
        this.renderModal()
      )
      );
  }
});

module.exports = Scheduler;