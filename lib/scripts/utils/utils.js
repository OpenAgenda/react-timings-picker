'use strict';

var Utils = function () {
  this.milliseconds = 1000;
  this.seconds = 60 * this.milliseconds;
  this.minutes = 60 * this.seconds;
  this.hours = 24 * this.minutes;
};

Utils.prototype.addMinutes = function (date, minutes) {
  var result = this.clone(date);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
};
Utils.prototype.addHours = function (date, hours) {
  var result = this.clone(date);
  result.setHours(result.getHours() + hours);
  return result;
};
Utils.prototype.addDays = function (date, days) {
  var result = this.clone(date);
  result.setDate(result.getDate() + days);
  return result;
};

Utils.prototype.addMonths = function (date, months) {
  var n = date.getDate();
  date.setDate(1);
  date.setMonth(date.getMonth() + months);
  date.setDate(Math.min(n, this.daysInMonth(date.getMonth(), date.getYear())));
  return date;
};

Utils.prototype.daysInMonth = function (month, year) {
  return new Date(year, month, 0).getDate();
};

Utils.prototype.startOf = function (date, value) {
  var d = this.clone(date);
  switch (value) {
    case "year":
      d.setMonth(0);
      d.setDate(1);
      return this.setTime(d);
    case "month":
      d.setDate(1);
      return this.setTime(d);
    case "day":
      return this.setTime(d);
    case "hour":
      return this.setTime(d, d.getHours());
    case "minute":
      return this.setTime(d, d.getHours(), d.getMinutes());
    case "second":
      return this.setTime(d, d.getHours(), d.getMinutes(), d.getSeconds());
    default:
      return d;
  }
};

Utils.prototype.setSecondsToZero = function( date ) {

  date.setSeconds(0);
  date.setMilliseconds(0);

  return date

};

Utils.prototype.setTime = function (date, hours, minutes, seconds, milliseconds) {
  var result = this.clone(date);
  result.setHours(hours || 0);
  result.setMinutes(minutes || 0);
  result.setSeconds(seconds || 0);
  result.setMilliseconds(milliseconds || 0);
  return result;
};

Utils.prototype.parseTime = function(time){
  var separatorIndex = time.indexOf(':');
  var hours = parseInt(time.substr(0, separatorIndex));
  var minutes = parseInt(time.substr(separatorIndex + 1, time.length));

  var today = new Date();

  var result = this.isTimeshiftDay(today)
    ? this.setTime( this.addDays(today, 1), hours, minutes ) 
    : this.setTime( today, hours, minutes );

  return result;
};

Utils.prototype.formatTime = function (date) {

  var minutes = date.getMinutes();

  return date.getHours() + ":" + (minutes < 10 ? "0" + minutes : minutes);
};

Utils.prototype.round = function(source, roundTo) {
  var remnant = source % roundTo;
  return remnant >= roundTo / 2 ? source + roundTo - remnant : source - remnant;
};

Utils.prototype.roundMinutes = function(date, roundTo, initialDate) {
  if (60 % roundTo !== 0) {
    if (initialDate === undefined) {
      throw new Error('Undefined initial date for rounding date');
    }
    return this.addMinutes(initialDate, this.round(this.minutesDifference(initialDate, date, true), roundTo));
  } else {
    var result = date, roundedMinutes = this.round(date.getMinutes(), roundTo);
    if (roundedMinutes === 60) {
      result = this.addHours(result, 1);
      result.setMinutes(0);
    } else {
      result.setMinutes(roundedMinutes);
    }
    return result;
  }
};

Utils.prototype.isSameYear = function(firstDate, secondDate) {
  return firstDate.getFullYear() === secondDate.getFullYear();
}

Utils.prototype.isSameMonth = function (firstDate, secondDate) {
  return this.isSameYear(firstDate, secondDate)
    && firstDate.getMonth() === secondDate.getMonth();
}

Utils.prototype.isSameDay = function (firstDate, secondDate) {
  return this.isSameYear(firstDate, secondDate)
    && this.isSameMonth(firstDate, secondDate)
    && firstDate.getDate() === secondDate.getDate();
}

Utils.prototype.floor = function (source, roundTo) {
  return source - source % roundTo;
};

Utils.prototype.ceil = function (source, roundTo) {
  return source + roundTo - source % roundTo;
};

Utils.prototype.minutesDifference = function (lowerDate, greaterDate, round, ignoreTimeShift) {
  round = round === true;
  ignoreTimeShift = ignoreTimeShift === true;

  if ( ignoreTimeShift ) {

    while (this.isTimeshiftDay(lowerDate) || this.isTimeshiftDay(greaterDate)) {

      greaterDate = this.addDays(greaterDate, 1);
      lowerDate = this.addDays(lowerDate, 1);

    }

  }

  var diff = (greaterDate - lowerDate) / 60000; // 60000 - milliseconds in minutes
  return round ? Math.round(diff) : diff;
};

Utils.prototype.hoursDifferrence = function (lowerDate, greaterDate, round, ignoreTimeShift) {
  round = round === true;
  ignoreTimeShift = ignoreTimeShift === true;

  var diff = this.minutesDifference(lowerDate, greaterDate, round, ignoreTimeShift) / 60; // 60 - minutes in hour
  return round ? Math.round(diff) : diff;
}

//this needs to check if today is a time shift day,
//cause sometimes we have 23 or 25 hours day
Utils.prototype.isTimeshiftDay = function (date) {

  var currentDay = this.startOf(date, 'day'),
    nextDay = this.startOf(this.addDays(date, 1), 'day');

  return this.hoursDifferrence(currentDay, nextDay, true) !== 24; // 24 - hours in a day

}

Utils.prototype.hasClass = function( element, cls ) {

  return ( ' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;

};

Utils.prototype.getParentHavingClass = getParentHavingClass;

function getParentHavingClass( element, cls ) {

  if ( element.className.split(' ').indexOf( cls ) >= 0 ) return element;

  if ( !element.parentNode ) return false;

  return getParentHavingClass( element.parentNode, cls );

}

Utils.prototype.pageOffset = function (element) {
  var top = 0, left = 0;
  do {
    top += element.offsetTop || 0;
    left += element.offsetLeft || 0;
    element = element.offsetParent;
  } while(element);

  return {
    top: top,
    left: left
  };
};

Utils.prototype.createTwoDimensionalArray = function(size) {
  var result = new Array(size);
  for (var i = 0; i < size; i++) {
    result[i] = [];
  }
  return result;
};

Utils.prototype.isKeyValuePair = function (obj) {
  return obj.hasOwnProperty("key") && obj.hasOwnProperty("value");
};

Utils.prototype.keyValueCollectionToObject = function(collection) {
  var rv = {};
  for (var i = 0; i < collection.length; ++i) {
    if (collection[i] !== undefined && this.isKeyValuePair(collection[i])) {
      rv[collection[i].key] = collection[i].value;
    }
  }
  return rv;
};

Utils.prototype.clone = function (date) {
  return new Date(date.getTime());
};

var utils = new Utils();

module.exports = utils;