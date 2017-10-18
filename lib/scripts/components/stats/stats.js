"use strict";

var React = require( 'react' ),

createReactClass = require( 'create-react-class' ),

PropTypes = require( 'prop-types' ),

propTypes = require( '../../utils/propTypes' );

require( 'date-format-lite' );

module.exports = createReactClass( {

  propTypes: {
    timings: PropTypes.array.isRequired,
    strings: propTypes.alli18n.isRequired
  },

  computeStats: function() {

    var first = false, last = false, sameDay = true;

    if ( this.props.timings.length ) {

      first = this.props.timings[ 0 ];

      last = this.props.timings[ 0 ];

    }

    this.props.timings.forEach( function( t ) {

      if ( t.start < first.start ) first = t;

      if ( t.end > last.end ) last = t;

    });

    return {
      first: first,
      last: last,
      sameDay: first ? [ last.start.getDate(), last.start.getMonth(), last.start.getFullYear() ].join( '' ) == [ first.start.getDate(), first.start.getMonth(), first.start.getFullYear() ].join( '' ) : false
    }

  },

  renderClear: function() {

    return React.createElement("span", null, " - ", React.createElement("a", {onClick: this.props.onClear}, this.props.strings.clearTimings));

  },

  render: function() {

    var stats = this.computeStats(),

      info = this.props.info || this.props.strings.howTo, 

      displayClear = true;

    if ( this.props.timings.length == 1 ) {

      info = this.props.strings.oneTiming
             .replace( '%date%', stats.first.start.format( 'DD/MM/YYYY' ) );

    } else if ( this.props.timings.length && stats.sameDay ) {

      info = this.props.strings.severalTimingsSameDay
             .replace( '%count%', this.props.timings.length )
             .replace( '%date%', stats.first.start.format( 'DD/MM/YYYY' ) );

    } else if ( this.props.timings.length ) {

      info = this.props.strings.severalTimings
             .replace( '%count%', this.props.timings.length )
             .replace( '%start%', stats.first.start.format( 'DD/MM/YYYY' ) )
             .replace( '%end%', stats.last.start.format( 'DD/MM/YYYY' ) );

    } else {

      displayClear = false;

    }

    return React.createElement("div", {className: "rc-stats"}, info,  displayClear ? this.renderClear(): '');

  } 

} );