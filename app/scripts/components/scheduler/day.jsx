'use strict';

var utils = require('../../utils/utils');
var propTypes = require("../../utils/propTypes");

var React = require('react');
var Timing = require('../timings/timing');

var Day = React.createClass({
  propTypes: {
    dayStartTime: propTypes.date.isRequired,
    dayEndTime: propTypes.date.isRequired,
    timeCells: React.PropTypes.number.isRequired,
    timeStep: React.PropTypes.number.isRequired,
    timingStep: React.PropTypes.number.isRequired,
    timings: React.PropTypes.array.isRequired,
    allMinutes: React.PropTypes.number.isRequired,
    defaultTimigDuration: React.PropTypes.number,
    timingsModifications: propTypes.timingsModifications,
    timingsInteractions: propTypes.timingsInteractions,
    timingsIdProperty: React.PropTypes.string,
    readOnly: React.PropTypes.bool.isRequired,
    canvasScroll: React.PropTypes.number
  },
  getDefaultProps: function () {
    return {
      defaultTimigDuration: 60
    }
  },
  clickTime: function ( date, event ) {

    var dayNode = this.getDOMNode().querySelector('.rc-day-time');
    if (dayNode.hasAttribute('creating')) {
      dayNode.removeAttribute('creating');
      return;
    }

    var doc = document.documentElement;
    var top = (( window.pageYOffset || doc.scrollTop ) 
              - (doc.clientTop || 0)) + this.props.canvasScroll;

    var timingStep = this.props.timingStep;

    var y = top + event.clientY - utils.pageOffset(event.target).top;
    var timeStep = this.props.timeStep;
    var minutes = (timeStep * y) / event.currentTarget.clientHeight;
    var startMinutes = utils.floor(minutes, timingStep);

    var newTimingStart = utils.addMinutes(date, startMinutes);
    var newTimingEnd = utils.addMinutes(newTimingStart, this.props.defaultTimigDuration);

    if (this.props.dayStartTime <= newTimingStart && this.props.dayEndTime >= newTimingEnd) {
      this.props.timingsModifications.addTiming({ start: newTimingStart, end: newTimingEnd });
    }
  },

  onEventMouseDown: function ( timing, e ) {
    
    if ( this.props.readOnly ) return;

    this.props.timingsInteractions.onEventMouseDown( timing, e );

  },
  onResizerMouseDown: function (timing, e) {
    if (this.props.readOnly) return;
    if (!utils.hasClass(e.target, 'rc-event-resizer')) {
      return;
    }
    var nearestOffsetTop = this.getMaxDragY(e.target.parentNode.offsetTop);
    var nearestTiming = this.getNearestNextTiming(timing);
    var maxTime = nearestTiming == undefined ? utils.addMinutes(this.props.dayStartTime, this.props.timeStep * this.props.timeCells) : nearestTiming.start;
    this.props.timingsInteractions.onResizerMouseDown(timing, maxTime, nearestOffsetTop, e);
  },

  onDayMouseDown: function ( e ) {

    if (this.props.readOnly) return;

    if (!utils.hasClass(e.target.parentNode, 'rc-day-time')) {

      return;

    }

    var doc = document.documentElement;

    var top = ( window.pageYOffset || doc.scrollTop ) - ( doc.clientTop || 0 ) + this.props.canvasScroll;

    var dayNode = e.target.parentNode,

    userActionValues = {};

    userActionValues.parent = dayNode;

    userActionValues.dragStep = dayNode.clientHeight * this.props.timingStep / this.props.allMinutes;

    userActionValues.initialY = utils.round(top + e.clientY, userActionValues.dragStep);

    var y = userActionValues.initialTop = utils.round( userActionValues.initialY - utils.pageOffset( dayNode ).top, userActionValues.dragStep );
    
    var startMinutes = utils.addMinutes(this.props.dayStartTime,
      this.props.allMinutes * ( y ) / dayNode.clientHeight);


    var nearestTiming = this.getNearestNextTiming({ start: startMinutes });
    userActionValues.maxTime = nearestTiming == undefined ? utils.addMinutes(this.props.dayStartTime, this.props.timeStep * this.props.timeCells) : nearestTiming.start;
    nearestTiming = this.getNearestPrevTiming({ start: startMinutes });
    userActionValues.minTime = nearestTiming == undefined ? this.props.dayStartTime : nearestTiming.end;

    userActionValues.minDragY = this.getMinDragY(y);
    userActionValues.maxDragY = this.getMaxDragY(y);

    var event = document.createElement('DIV');
    event.className = 'rc-event';
    event.style.height = 0 + 'px';
    event.style.top = y + 'px';

    event.innerHTML = React.renderToStaticMarkup(
        <div className="rc-time rc-above">
          <span className="start">{utils.formatTime(startMinutes)}</span> - <span className="end">{utils.formatTime(startMinutes)}</span>
        </div>
      )

    dayNode.appendChild(event);
    userActionValues.target = event;
    userActionValues.initialHeight = 0;
    userActionValues.startMinutes = startMinutes;

    this.props.timingsInteractions.onDayMouseDown(userActionValues, e);
  },
  getNearestNextTiming: function ( timing ) {

    return this.props.timings.filter(function (t) {
      return t.start > timing.start;
    }).sort(function (t1, t2) {
      return t1.start > t2.start ? 1 :
          t1.start < t2.start ? -1 : 0;
    })[0];

  },
  getNearestPrevTiming: function ( timing ) {
    
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

    return nearestEvent == el ? utils.pageOffset(el).top + el.clientHeight
      : utils.pageOffset(nearestEvent).top;
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

    return nearestEvent == el ? utils.pageOffset(el).top
      : utils.pageOffset(nearestEvent).top + nearestEvent.clientHeight;
  },
  render: function () {

    var timeCells = [];
    var date = this.props.dayStartTime;
    for (var i = 0; i < this.props.timeCells; i++) {
      var newCellMarkup = this.props.readOnly === true ? <div key={utils.formatTime(date)} className="rc-day-cell"></div> :
            <div key={utils.formatTime(date)} className="rc-day-cell" onClick={this.clickTime.bind(null,date)}></div>;
      timeCells.push(newCellMarkup);
      date = utils.addMinutes(date, this.props.timeStep);
    }

    var timingsComponents = [];

    var startDate = this.props.dayStartTime;

    var timings = this.props.timings;
    var timingStep = this.props.timingStep;

    for (var i = 0; i < timings.length; i++) {
    
      var timing = timings[i];
    
      var timeProperties = {
        startMinutesDifference: utils.round(utils.minutesDifference(startDate, timing.start), timingStep),
        endMinutesDifference: utils.round(utils.minutesDifference(startDate, timing.end), timingStep),
        allMinutes: this.props.allMinutes
      }

      timingsComponents.push(this.props.readOnly 
          ? <Timing key={timing[this.props.timingsIdProperty]} timing={timing} 
            timeProperties={timeProperties} readOnly={this.props.readOnly}/>
          : <Timing key={timing[this.props.timingsIdProperty]} timing={timing}
            timeProperties={timeProperties} readOnly={this.props.readOnly}
            remove={this.props.timingsModifications.removeTiming}
            onEventMouseDown={this.onEventMouseDown.bind(null,timing)} onResizerMouseDown={this.onResizerMouseDown.bind(null,timing)} />);
    }
    var isToday = this.props.dayStartTime.toDateString() == new Date().toDateString(),
      isTomorrow = this.props.dayStartTime.toDateString() == utils.addDays(new Date(), 1).toDateString();
    var extraClassName = isToday ? " today" : isTomorrow ? " tomorrow" : "";

    return (
      <div className={'rc-day'+extraClassName} onMouseDown={this.onDayMouseDown}>
        <div className="rc-day-time" data-date={this.props.dayStartTime.toDateString()}>
          {timeCells}
          {timingsComponents}
        </div>
      </div>
      );
  }
});

module.exports = Day;