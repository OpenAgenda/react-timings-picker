'use strict';

var utils = require('../../utils/utils');
var domUtils = require('../../utils/domUtils');
var propTypes = require("../../utils/propTypes");

var React = require('react');
var ReactDOM = require("react-dom");
var createReactClass = require( 'create-react-class' );
var PropTypes = require( 'prop-types' );

var Timing = require('../timings/timing');

var dayNodeClassName = 'rc-day-time',
  timingClassName = 'rc-event';

var Day = createReactClass({
  propTypes: {
    dayStartTime: propTypes.date.isRequired,
    dayEndTime: propTypes.date.isRequired,
    timeCells: PropTypes.number.isRequired,
    timingStep: PropTypes.number.isRequired,
    timings: PropTypes.array.isRequired,
    allMinutes: PropTypes.number.isRequired,
    defaultTimigDuration: PropTypes.number,
    timingsModifications: propTypes.timingsModifications,
    timingsInteractions: propTypes.timingsInteractions,
    timingsIdProperty: PropTypes.string,
    readOnly: PropTypes.bool.isRequired,
    canvasScroll: PropTypes.number
  },
  getDefaultProps: function () {
    return {
      defaultTimigDuration: 60
    }
  },

  clickTime: function ( event ) {

    if ( this.props.readOnly || this.isDayActive() === false) return;

    var dayNode = ReactDOM.findDOMNode( this ).querySelector( '.' + dayNodeClassName );

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

    if ( this.props.readOnly || !this.isDayActive() ) return;

    this.props.timingsInteractions.onTimingMouseDown( timing, e );

  },

  onResizerMouseDown: function ( timing, e ) {

    e.stopPropagation();

    if ( this.props.readOnly || !this.isDayActive() ) return;

    if ( !utils.hasClass( e.target, 'rc-event-resizer' ) ) return;

    var timingNode = domUtils.getParentHavingClass( e.target, timingClassName );

    var nearestOffsets = this.getMaxDragY( timingNode.offsetTop ),
      nearestTiming = this.getNearestTiming( timing, false );

    var maxTime = !nearestTiming
      ? utils.addMinutes( this.props.dayStartTime, this.props.allMinutes )
      : nearestTiming.start;

    this.props.timingsInteractions.onResizerMouseDown( timing, maxTime, nearestOffsets, e );

  },

  /**
   * handle the creation of a new timing
   * ( cancels if is within a defined timing )
   */
  onDayMouseDown: function ( e ) {

    e.stopPropagation();

    if ( this.props.readOnly || !this.isDayActive() ) {

      return;

    }

    if ( !utils.hasClass( e.target.parentNode, dayNodeClassName ) ) return;

    var top = domUtils.getVertiacalScrollOffset() + this.props.canvasScroll;

    var dayNode = domUtils.getParentHavingClass( e.target, dayNodeClassName ),
      dragStep = dayNode.clientHeight * this.props.timingStep / this.props.allMinutes;

    var y = utils.round( top + e.clientY - domUtils.elementOffset( dayNode ).top, dragStep );

    var startMinutes = utils.addMinutes(this.props.dayStartTime,
      this.props.allMinutes * ( y ) / dayNode.clientHeight);

    var nearestNextTiming = this.getNearestTiming( { start: startMinutes }, false ),
      nearestPrevTiming = this.getNearestTiming( { start: startMinutes }, true );

    var minCoordValues = this.getMinDragY( y ),
      maxCoordValues = this.getMaxDragY( y );

    var extremePoints = {
      minTime: !nearestPrevTiming ? this.props.dayStartTime : nearestPrevTiming.end,
      maxTime: !nearestNextTiming ? utils.addMinutes( this.props.dayStartTime, this.props.allMinutes ) : nearestNextTiming.start,
      minDragY: minCoordValues.offsetTop,
      maxDragY: maxCoordValues.offsetTop,
      minTop: minCoordValues.top
    }

    var timing = {
      start: startMinutes,
      end: startMinutes
    };

    this.props.timingsInteractions.onDayMouseDown( e, extremePoints, timing );
  },
  getNearestTiming: function ( timing, isPrev ) {

    var mult = isPrev ? 1 : -1

    return this.props.timings.filter( function ( t ) {
                return isPrev ? ( t.start < timing.start ) : ( t.start > timing.start );
              } ).sort( function ( t1, t2 ) {
                return ( t1.start > t2.start ? -1 :
                    t1.start < t2.start ? 1 : 0 ) * mult;
              } )[0];;

  },
  getMaxDragY: function (currentTop) {
    var dayNode = ReactDOM.findDOMNode( this ).querySelector( '.' + dayNodeClassName ),
      children = dayNode.querySelectorAll( '.' + timingClassName );

    var nearestOffsetTop = dayNode.clientHeight, nearestEvent = dayNode;

    for ( var i = 0; i < children.length; i++ ) {

      var offTop = children[i].offsetTop;

      if ( offTop > currentTop && offTop < nearestOffsetTop ) {

        nearestOffsetTop = offTop;
        nearestEvent = children[i];

      }

    }

    var result = {
      offsetTop: nearestEvent === dayNode
        ? domUtils.elementOffset( nearestEvent ).top + nearestEvent.clientHeight
        : domUtils.elementOffset( nearestEvent ).top,
      top: nearestEvent === dayNode ? dayNode.clientHeight : parseFloat( nearestEvent.style.top.replace( 'px' ) )
    }

    return result;
  },
  getMinDragY: function (currentTop) {
    var dayNode = ReactDOM.findDOMNode( this ).querySelector( '.' + dayNodeClassName );
    var children = dayNode.querySelectorAll( '.' + timingClassName );

    var nearestOffsetTop = 0, nearestEvent = dayNode;
    for ( var i = 0; i < children.length; i++ ) {

      var offTop = children[i].offsetTop;

      if ( offTop < currentTop && offTop > nearestOffsetTop ) {

        nearestOffsetTop = offTop;
        nearestEvent = children[i];

      }
    }

    var result = {
      offsetTop: nearestEvent === dayNode
        ? domUtils.elementOffset( nearestEvent ).top
        : domUtils.elementOffset( nearestEvent ).top + nearestEvent.clientHeight,
      top: nearestEvent === dayNode ? 0 : parseFloat( nearestEvent.style.top.replace( 'px' ) ) + nearestEvent.clientHeight + 2
    }

    return result;
  },

  renderTimeCells: function(){

    var timeCells = [];

    for ( var i = 0; i < this.props.timeCells; i++ ) {

      timeCells.push(React.createElement("div", {key: i.toString(), className: "rc-day-cell"}));

    }

    return timeCells;

  },

  renderTimingsComponents: function () {

    var timingsComponents = [],
      startDate = this.props.dayStartTime;

    for ( var i = 0; i < this.props.timings.length; i++ ) {

      var timing = this.props.timings[i];

      var timeProperties = {
        startMinutesDifference: utils.minutesDifference( startDate, timing.start, true, true ),
        endMinutesDifference: utils.minutesDifference( startDate, timing.end, true, true ),
        allMinutes: this.props.allMinutes
      }

      timingsComponents.push( this.props.readOnly
          ? React.createElement(Timing, {key: timing[this.props.timingsIdProperty], timing: timing, 
              timeProperties: timeProperties, readOnly: this.props.readOnly})
          : React.createElement(Timing, {key: timing[this.props.timingsIdProperty], timing: timing, 
              timeProperties: timeProperties, readOnly: this.props.readOnly, 
              remove: this.props.timingsModifications.removeTiming, 
              onTimingMouseDown: this.onTimingMouseDown.bind(null,timing), onResizerMouseDown: this.onResizerMouseDown.bind(null,timing)}) );
    }

    return timingsComponents;

  },

  getAdditionalClassName: function () {

    return this.isDayActive() ? '' : ' rc-inactive-day';

  },

  isDayActive: function() {

    return utils.isDayActive( this.props.activeDays, this.props.dayStartTime );

  },

  render: function () {

    var isToday = utils.isSameDay( this.props.dayStartTime, new Date() ),
      isTomorrow = utils.isSameDay( this.props.dayStartTime, utils.addDays( new Date(), 1 ) );

    var extraClassName = isToday
      ? " today"
      : isTomorrow ? " tomorrow" : "";

    return (
      React.createElement("div", {className: 'rc-day'+extraClassName, onMouseDown: this.onDayMouseDown, onClick: this.props.readOnly ? undefined : this.clickTime}, 
        React.createElement("div", {className: this.props.activeDays && this.props.activeDays.length ? dayNodeClassName + this.getAdditionalClassName() : dayNodeClassName, "data-date": this.props.dayStartTime.toDateString()}, 
          this.renderTimeCells(), 
          this.renderTimingsComponents()
        )
      )
      );
  }
});

module.exports = Day;