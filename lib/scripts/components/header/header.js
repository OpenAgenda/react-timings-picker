var utils = require('../../utils/utils'),

propTypes = require( '../../utils/propTypes' ),

React = require( 'react' ),

Select = require( 'react-select' ),

Header = React.createClass({displayName: "Header",

	propTypes: {
		startDate: propTypes.date.isRequired,
		goAnotherWeek: React.PropTypes.func.isRequired,
		goAnotherMonth: React.PropTypes.func.isRequired,
		goAnotherYear: React.PropTypes.func.isRequired,
		months: React.PropTypes.arrayOf(React.PropTypes.string).isRequired
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
				React.createElement("div", {className: "rc-day-name"}, 
				  React.createElement("div", null, this.props.weekdays.short[ day.getDay()], " ", day.getDate())
			  )
			);

			day = utils.addDays( day, 1 );

		}

		return ( React.createElement("div", {className: "rc-weekdays"}, weekdayItems) )

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
			React.createElement("div", {className: "rc-header"}, 
				React.createElement("div", {className: "rc-week"}, 
					React.createElement("div", {className: "rc-icon-wrapper"}, React.createElement("span", {className: "rc-icon rc-icon-left-arrow", onClick: this.props.goAnotherWeek.bind(null,false)})), 
					React.createElement("span", {className: "rc-date"}, startDay, "-", endDay), 
					React.createElement("div", {className: "rc-icon-wrapper"}, React.createElement("span", {className: "rc-icon rc-icon-right-arrow", onClick: this.props.goAnotherWeek.bind(null,true)}))
				), 
				React.createElement("div", {className: "rc-options"}, 
					React.createElement("div", {className: "rc-month"}, 
						React.createElement(Select, {
						  options: months, 
						  value: this.props.startDate.getMonth(), 
						  onChange: this.props.goAnotherMonth, 
							searchable: false, 
							clearable: false})
					), 
					React.createElement("div", {className: "rc-years"}, 
						React.createElement(Select, {
						  options: this.getYearOptions(), 
						  value: this.props.startDate.getFullYear(), 
						  clearable: false, 
						  noResultsText: false, 
						  onChange: this.onChange, 
						  onInputChange: this.onChange})
					)
				), 
				this.renderWeekdays()
			)
			);
	}
});

module.exports = Header;