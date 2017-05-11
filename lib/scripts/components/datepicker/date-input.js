"use strict";

var React = require("react");
var createReactClass = require( 'create-react-class' );
var PropTypes = require( 'prop-types' );
var utils = require("../../utils/utils");

var DateInput = createReactClass({
  displayName: "DateInput",
  propTypes: {
    dateFormat: PropTypes.string.isRequired,
    className: PropTypes.string.isRequired,
    onBlur: PropTypes.func,
    onFocus: PropTypes.func,
    focus: PropTypes.bool.isRequired,
    disabled: PropTypes.bool.isRequired,
    handleClick: PropTypes.func.isRequired,
    name: PropTypes.string,
    readOnly: PropTypes.bool,
    placeholderText: PropTypes.string,
    required: PropTypes.bool,
    isDatePickerActive: PropTypes.bool,
  },
  getDefaultProps: function () {
    return {
      onBlur: function () { },
      onFocus: function () { },
      dateFormat: "DD-MM-YYYY",
      className: "rc-dp-input",
    };
  },

  componentDidMount: function () {
    this.toggleFocus(this.props.focus);
  },
  componentWillReceiveProps: function (newProps) {
    this.toggleFocus(newProps.focus)
  },

  toggleFocus: function (focus) {
    if (focus)
      this.refs.input.focus();
    else
      this.refs.input.blur();
  },
  safeDateFormat: function (date) {
    return !!date ? date.format(this.props.dateFormat) : null;
  },

  handleKeyDown: function (event) {
    switch (event.key) {
      case "Escape":
        event.preventDefault();
        this.props.hideCalendar();
        break;
      default: return;
    }
  },
  handleClick: function (event) {
    if (!this.props.disabled) {
      this.props.handleClick(event);
    }
  },
  handleChange: function(){
    console.log("handleChange");
    console.log(arguments);
  },

  render: function () {
    return (
      React.createElement("input", {ref: "input", type: "text", name: this.props.name, 
        value: this.safeDateFormat(this.props.date), 
        onClick: this.handleClick, onKeyDown: this.handleKeyDown, 
        onFocus: this.props.onFocus, onBlur: this.props.onBlur, 
        onChange: this.handleChange, 
        className: this.props.isDatePickerActive ? this.props.className : this.props.className + " disabled", 
        disabled: this.props.disabled, 
        placeholder: this.props.placeholderText, 
        readOnly: this.props.readonly, 
        required: this.props.required})
      );
  }
});

module.exports = DateInput;