'use strict';

var React = require('react');
var DatePicker = require('../datepicker/datepicker.jsx');

var Reccurencer = React.createClass({
	createReccurences: function () {
		this.props.createReccurence(this.state.startDate, this.state.endDate);
	},
	onReccurenceStartChange: function(date){
		this.setState({ startDate: date });
	},
	onReccurenceEndChange: function(date){
		this.setState({ endDate: date });
	},
	toggleDatePickers: function () {
		this.setState({ createReccurence: !this.state.createReccurence });
	},
	componentWillReceiveProps: function (nextProps) {
		this.setState({
			startDate: nextProps.startDate, endDate: nextProps.endDate
		});
	},
	getInitialState: function () {
		return { createReccurence: false, startDate: this.props.startDate, endDate: this.props.endDate };
	},
	render: function () {
		var result;
		var strings = this.props.strings;
		if (this.state.createReccurence == true) {
			result = (<div>
				{strings.duplicateTimingsAbove} {strings.from}
				<DatePicker selected={this.state.startDate} onChange={this.onReccurenceStartChange} weekdays={strings.weekdays.short} months={strings.months}/> {strings.to}
				<DatePicker selected={this.state.endDate} onChange={this.onReccurenceEndChange} weekdays={strings.weekdays.short} months={strings.months}/>
				<a className="rc-ok-button" onClick={this.createReccurences}>OK</a>
			</div>);
		}
		else {
			result = (<a onClick={this.toggleDatePickers}>{strings.defineReccuringEvent}</a>);
		}

		return (
			<div className="rc-reccurencer">
				{result}
			</div>
			);
	}
});

module.exports = Reccurencer;