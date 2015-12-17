'use strict';

var utils = require('../../utils/utils');
var domUtils = require('../../utils/domUtils');
var propTypes = require("../../utils/propTypes");

var React = require('react');
var ReactDOM = require("react-dom");
var ReactDOMServer = require("react-dom/server");

var Timing = require('../timings/timing');

var Day = React.createClass({displayName: "Day",
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
  clickTime: function ( event ) {

    if ( this.props.readOnly ) return;

    var dayNode = ReactDOM.findDOMNode( this ).querySelector( '.rc-day-time' );

    // check if this day is used for creating timing by d'n'd
    if ( dayNode.hasAttribute( 'creating' ) ) {

      dayNode.removeAttribute( 'creating' );
      return;

    }

    if ( !utils.hasClass( event.target, 'rc-day-cell' ) ) return;

    var vertiacalScrollOffset = domUtils.getVertiacalScrollOffset() + this.props.canvasScroll,

      y = vertiacalScrollOffset + event.clientY - domUtils.elementOffset( dayNode ).top, // Y coordinate relative to dayNode

      minutes = ( this.props.allMinutes * y ) / event.currentTarget.clientHeight, // amount of minutes, that correspond to y value

      startMinutes = utils.floor( minutes, this.props.timingStep ); // floored minutes according to timingStep value.

    var newTimingStart = utils.addMinutes( this.props.dayStartTime, startMinutes ),

      newTimingEnd = utils.addMinutes( newTimingStart, this.props.defaultTimigDuration );

    if ( this.props.dayStartTime <= newTimingStart && this.props.dayEndTime >= newTimingEnd ) {

      this.props.timingsModifications.addTiming( { start: newTimingStart, end: newTimingEnd } );

    }

  },

  onTimingMouseDown: function (timing, e) {

    e.stopPropagation();

    if ( this.props.readOnly ) return;

    this.props.timingsInteractions.onTimingMouseDown( timing, e );

  },

  onResizerMouseDown: function ( timing, e ) {

    e.stopPropagation();

    if ( this.props.readOnly ) return;

    if ( !utils.hasClass( e.target, 'rc-event-resizer' ) ) return;

    var timingNode = domUtils.getParentHavingClass( e.target, 'rc-event' );

    var nearestOffsets = this.getMaxDragY( timingNode.offsetTop ),
      nearestTiming = this.getNearestNextTiming( timing );
    var maxTime = nearestTiming == undefined ? utils.addMinutes( this.props.dayStartTime, this.props.timeStep * this.props.timeCells ) : nearestTiming.start;
    this.props.timingsInteractions.onResizerMouseDown( timing, maxTime, nearestOffsets, e );

  },

  onDayMouseDown: function ( e ) {

    if (this.props.readOnly) return;

    if (!utils.hasClass(e.target.parentNode, 'rc-day-time')) return;

    var doc = document.documentElement;

    var top = ( window.pageYOffset || doc.scrollTop ) - ( doc.clientTop || 0 ) + this.props.canvasScroll;

    var dayNode = e.target.parentNode,

    userActionValues = {};

    userActionValues.parent = dayNode;

    userActionValues.dragStep = dayNode.clientHeight * this.props.timingStep / this.props.allMinutes;

    userActionValues.initialY = utils.round(top + e.clientY, userActionValues.dragStep);

    var y = userActionValues.initialTop = utils.round( userActionValues.initialY - domUtils.elementOffset( dayNode ).top, userActionValues.dragStep );
    
    var startMinutes = utils.addMinutes(this.props.dayStartTime,
      this.props.allMinutes * ( y ) / dayNode.clientHeight);


    var nearestTiming = this.getNearestNextTiming({ start: startMinutes });
    userActionValues.maxTime = nearestTiming == undefined ? utils.addMinutes(this.props.dayStartTime, this.props.timeStep * this.props.timeCells) : nearestTiming.start;
    nearestTiming = this.getNearestPrevTiming({ start: startMinutes });
    userActionValues.minTime = nearestTiming == undefined ? this.props.dayStartTime : nearestTiming.end;

    var minValues = this.getMinDragY( y );
    userActionValues.minDragY = minValues.offsetTop;
    userActionValues.minTop = minValues.top;
    userActionValues.maxDragY = this.getMaxDragY(y).offsetTop;

    var event = document.createElement('DIV');
    event.className = 'rc-event';
    event.style.height = 0 + 'px';
    event.style.top = y + 'px';

    event.innerHTML = ReactDOMServer.renderToStaticMarkup(
        React.createElement("div", {className: "rc-time rc-below"}, 
          React.createElement("span", {className: "start"}, utils.formatTime(startMinutes)), " - ", React.createElement("span", {className: "end"}, utils.formatTime(startMinutes))
        )
      )

    dayNode.appendChild(event);
    userActionValues.target = event;
    userActionValues.initialHeight = 0;
    userActionValues.startMinutes = startMinutes;

    this.props.timingsInteractions.onDayMouseDown(userActionValues, e);
  },
  getNearestNextTiming: function ( timing ) {

    return this.props.timings.filter( function ( t ) {
      return t.start > timing.start;
    } ).sort( function ( t1, t2 ) {
      return t1.start > t2.start ? 1 :
          t1.start < t2.start ? -1 : 0;
    } )[0];

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
    var dayNode = ReactDOM.findDOMNode(this).querySelector('.rc-day-time'),
      children = dayNode.querySelectorAll( '.rc-event' );

    var nearestOffsetTop = dayNode.clientHeight, nearestEvent = dayNode;

    for ( var i = 0; i < children.length; i++ ) {

      var offTop = children[i].offsetTop;

      if ( offTop > currentTop && offTop < nearestOffsetTop ) {

        nearestOffsetTop = offTop;
        nearestEvent = children[i];

      }

    }

    var result = {
      offsetTop: nearestEvent == dayNode ? domUtils.elementOffset( dayNode ).top + dayNode.clientHeight
      : domUtils.elementOffset( nearestEvent ).top,
      top: nearestEvent == dayNode ? dayNode.clientHeight : parseFloat( nearestEvent.style.top.replace( 'px' ) )
    }

    return result;
  },
  getMinDragY: function (currentTop) {
    var el = ReactDOM.findDOMNode(this).querySelector('.rc-day-time');
    var children = el.querySelectorAll('.rc-event');

    var nearestOffsetTop = 0, nearestEvent = el;
    for (var i = 0; i < children.length; i++) {
      var offTop = children[i].offsetTop;
      if (offTop < currentTop && offTop > nearestOffsetTop) {
        nearestOffsetTop = offTop;
        nearestEvent = children[i];
      }
    }

    var result = {
      offsetTop: nearestEvent == el ? domUtils.elementOffset(el).top
      : domUtils.elementOffset(nearestEvent).top + nearestEvent.clientHeight,
      top: nearestEvent == el ? 0 : parseFloat( nearestEvent.style.top.replace( 'px' ) ) + nearestEvent.clientHeight
    }

    return result;
  },
  render: function () {

    var timeCells = [];
    var date = this.props.dayStartTime;
    for (var i = 0; i < this.props.timeCells; i++) {
      var newCellMarkup = React.createElement("div", {key: i.toString() + utils.formatTime(date), className: "rc-day-cell"});
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
        startMinutesDifference: utils.minutesDifference(startDate, timing.start, true, true),
        endMinutesDifference: utils.minutesDifference(startDate, timing.end, true, true),
        allMinutes: this.props.allMinutes
      }

      timingsComponents.push(this.props.readOnly 
          ? React.createElement(Timing, {key: timing[this.props.timingsIdProperty], timing: timing, 
            timeProperties: timeProperties, readOnly: this.props.readOnly})
          : React.createElement(Timing, {key: timing[this.props.timingsIdProperty], timing: timing, 
            timeProperties: timeProperties, readOnly: this.props.readOnly, 
            remove: this.props.timingsModifications.removeTiming, 
           onTimingMouseDown: this.onTimingMouseDown.bind(null,timing), onResizerMouseDown: this.onResizerMouseDown.bind(null,timing)}));
    }
    var isToday = this.props.dayStartTime.toDateString() == new Date().toDateString(),
      isTomorrow = this.props.dayStartTime.toDateString() == utils.addDays(new Date(), 1).toDateString();
    var extraClassName = isToday ? " today" : isTomorrow ? " tomorrow" : "";

    return (
      React.createElement("div", {className: 'rc-day'+extraClassName, onMouseDown: this.onDayMouseDown, onClick: this.props.readOnly ? undefined : this.clickTime}, 
        React.createElement("div", {className: "rc-day-time", "data-date": this.props.dayStartTime.toDateString()}, 
          timeCells, 
          timingsComponents
        )
      )
      );
  }
});

module.exports = Day;