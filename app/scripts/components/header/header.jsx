var utils = require('../../utils/utils'),

propTypes = require( '../../utils/propTypes' ),

React = require( 'react' ),

Select = require( 'react-select' ),

Header = React.createClass({

	propTypes: {
		startDate: propTypes.date.isRequired,
		goAnotherWeek: React.PropTypes.func.isRequired,
		goAnotherMonth: React.PropTypes.func.isRequired,
		goAnotherYear: React.PropTypes.func.isRequired,
		months: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
		earliestTimingStart: React.PropTypes.number.isRequired,
		latestTimingEnd: React.PropTypes.number.isRequired
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

		minDdYearsDiff = 5,

		firstOption, lastOption;

		for ( i = currentYear; i <= currentYear + 5; i++ ) {

			years.push({
				value: i, 
				label: i.toString()
			});

		}

		return years;

	},

	isInOptions: function( year ) {

		var years = this.getYearOptions(), is = false;

		years.forEach( function( y ) {

			if ( y.value == year ) is = true;

		});

		return is;

	},

	renderWeekdays: function() {

		var day = utils.setTime( this.props.startDate ),

		weekdayItems = [];

		for ( var i = 0; i < 7; i++ ) {

			weekdayItems.push(
				<div className="rc-day-name">
				  <span>{this.props.weekdays.short[ day.getDay() ]}</span>
			  </div>
			);

			day = utils.addDays( day, 1 );

		}

		return ( <div className="rc-weekdays">{weekdayItems}</div> )

	},

	render: function () {

		var startDay = this.props.startDate.getDate();

		var endDay = utils.addDays( this.props.startDate, 7 /*days in a week*/ ).getDate();

		var months = [];

		for ( var i = 0; i < this.props.months.length; i++ ) {

			months.push({
				value: i,
				label: this.props.months[i]
			});

		}

		return (
			<div className="rc-header">
				<div className="rc-week">
					<div className="rc-icon-wrapper"><span className="rc-icon rc-icon-left-arrow" onClick={this.props.goAnotherWeek.bind(null,false)}></span></div>
					<span className="rc-date">{startDay}-{endDay}</span>
					<div className="rc-icon-wrapper"><span className="rc-icon rc-icon-right-arrow" onClick={this.props.goAnotherWeek.bind(null,true)}></span></div>
				</div>
				<div className="rc-options">
					<div className="rc-month">
						<Select
						  options={months}
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
						  onChange={this.onChange}
						  onInputChange={this.onChange} />
					</div>
				</div>
				{this.renderWeekdays()}
			</div>
			);
	}
});

module.exports = Header;