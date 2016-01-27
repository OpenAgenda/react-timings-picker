"use strict";

var React = require("react");
var utils = require("../../utils/utils");
var propTypes = require("../../utils/propTypes");
require("date-format-lite");

var Week = React.createClass({
  displayName: "Week",
  propTypes: {
    date: propTypes.date.isRequired,
    month: propTypes.date.isRequired,
    selected: propTypes.date.isRequired
  },

  render: function () {
    return (
      React.createElement("div", {className: "rc-dp-week"}, 
        this.renderWeek()
      )
      )
  },

  getAdditionalClassName: function (day) {

    return this.isDayActive( day ) ? '' : ' rc-dp-inactive-day';

  },

  isDayActive: function( day ) {

    return utils.isDayActive( this.props.activeDays, day );

  },

  getDateClassName: function( date ) {

    var className = [ 'rc-dp-day' ];

    if ( date.toDateString() === new Date().toDateString() ) {

      className.push( 'today' );

    }

    if ( date.getMonth() !== this.props.month.getMonth() ) {

      className.push( 'different-month' );

    }

    if ( date.toDateString() === this.props.selected.toDateString() ) {

      className.push( 'selected' );

    }

    if ( !this.isDayActive( date ) ) {

      className.push( 'rc-dp-inactive-day' );

    }

    return className.join( ' ' );

  },

  renderWeek: function () {

    var days = [];

    for ( var i = 0; i < 7 /*days in a week*/; i++ ) {

      var date = utils.addDays( this.props.date, i );

      days.push(React.createElement("span", {
        key: date.toString(), 
        className:  this.getDateClassName( date), 
        onClick: this.props.select.bind(null, date, this.isDayActive( date ))}, date.getDate()));

    }

    return days;

  }
});

module.exports = Week;
