'use strict';

var utils = require( '../../utils/utils' ),

propTypes = require( '../../utils/propTypes' ),

React = require( 'react' ),

createReactClass = require( 'create-react-class' ),

PropTypes = require( 'prop-types' ),

Select = require( 'react-select' ),

Header = createReactClass({

  propTypes: {
    startDate: propTypes.date.isRequired,
    goAnotherWeek: PropTypes.func.isRequired,
    goAnotherMonth: PropTypes.func.isRequired,
    goAnotherYear: PropTypes.func.isRequired,
    months: propTypes.monthNames.isRequired
  },

  onChangeTimeout: false,

  onChange: function( value ) {

    var year, self = this;

    clearTimeout( this.onChangeTimeout );

    try {

      year = parseInt( value, 10 );

      if ( isNaN( year ) ) throw 'not a number';

    } catch ( e ) {

      return;

    }

    if ( this.isInOptions( year ) ) {

      this.props.goAnotherYear( year );

    } else {

      this.onChangeTimeout = setTimeout( function() {

        self.props.goAnotherYear( year );

      }, 1000 );

    }

  },

  getYearOptions: function() {

    var years = [], i,

      currentYear = this.props.startDate.getFullYear(),

      minDdYearsDiff = 5;

    for ( i = currentYear; i <= currentYear + minDdYearsDiff; i++ ) {

      years.push({
        value: i, 
        label: i.toString()
      });

    }

    return years;

  },

  getMonthOptions: function () {

    return this.props.months.full.map( function ( month, i ) {

      return {
        value: i,
        label: month
      }

    } );

  },

  isInOptions: function( year ) {

    var years = this.getYearOptions(), is = false;

    years.forEach( function( y ) {

      if ( y.value == year ) is = true;

    });

    return is;

  },

  getTogglerText: function ( start, end ) {

    var monthsNames = this.props.months.short;

    if ( utils.isSameMonth(start, end) ) {

      return start.getDate() + ' - ' + end.getDate() + ' ' + monthsNames[end.getMonth()];

    }

    if (utils.isSameYear(start, end)) {

      return start.getDate() + ' ' + monthsNames[start.getMonth()] + ' - ' + end.getDate() + ' ' + monthsNames[end.getMonth()];

    }

    return start.getDate() + ' ' + monthsNames[start.getMonth()] + ' ' + start.getFullYear() + ' - ' +
      end.getDate() + ' ' + monthsNames[end.getMonth()] + ' ' + end.getFullYear();

  },

  renderWeekdays: function() {

    var day = utils.setTime( this.props.startDate ),

      weekdayItems = [];

    for ( var i = 0; i < 7; i++ ) {

      weekdayItems.push(
        <div key={i} className="rc-day-name">
          <div>{this.props.weekdays.short[ day.getDay() ]} {day.getDate()}</div>
        </div>
      );

      day = utils.addDays( day, 1 );

    }

    return ( <div className="rc-weekdays">{weekdayItems}</div> )

  },

  render: function () {

    var startDate = this.props.startDate,
      endDate = utils.addDays( this.props.startDate, 6 ) /*6 - numbers of weekdays minus current */

    return (
      <div className="rc-header">
        <div className="rc-toolbar border-box">
          <div className="rc-week">
            <div className="rc-icon-wrapper"><span className="rc-icon rc-icon-left-arrow" onClick={this.props.goAnotherWeek.bind(null,false)}></span></div>
            <div className="rc-icon-wrapper"><span className="rc-icon rc-icon-right-arrow" onClick={this.props.goAnotherWeek.bind(null,true)}></span></div>
            <span className="rc-date">{this.getTogglerText(startDate, endDate)}</span>
            </div>
          <div className="rc-options">
            <div className="rc-month">
              <Select
              options={this.getMonthOptions()}
                value={this.props.startDate.getMonth()}
                onChange={this.props.goAnotherMonth}
                searchable={false}
                clearable={false} />
            </div>
            <div className="rc-years">
              <Select
              options={this.getYearOptions()}
                value={this.props.startDate.getFullYear()}
                clearable={false}
                noResultsText={''}
                onChange={this.onChange}
                onInputChange={this.onChange} />
            </div>
          </div>
        </div>
        {this.renderWeekdays()}
      </div>
      );
  }
});

module.exports = Header;