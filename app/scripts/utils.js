var Utils = function () {
	this.milliseconds = 1000;
	this.seconds = 60 * this.milliseconds;
	this.minutes = 60 * this.seconds;
	this.hours = 24 * this.minutes;
}

Utils.prototype.addMinutes = function (date, minutes) {
	return new Date(date.getTime() + minutes * this.seconds /*milliseconds in minute*/);
}
Utils.prototype.addHours = function (date, hours) {
	return new Date(date.getTime() + hours * this.minutes /*milliseconds in minute*/);
}
Utils.prototype.addDays = function (date, days) {
	return new Date(date.getTime() + days * this.hours /*milliseconds in minute*/);
}

Utils.prototype.setTime = function (date, hours, minutes, seconds, milliseconds) {
	date.setHours(hours || 0);
	date.setMinutes(minutes || 0);
	date.setSeconds(seconds || 0);
	date.setMilliseconds(milliseconds || 0);
	return date;
}

Utils.prototype.parseTime = function(time){
	var separatorIndex = time.indexOf(':');
	var hours = parseInt(time.substr(0, separatorIndex));
	var minutes = parseInt(time.substr(separatorIndex + 1, time.length));
	var date = new Date();
	return this.setTime(date, hours, minutes, 0, 0);
}

Utils.prototype.formatTime = function (date) {
	var minutes = date.getMinutes();
	return date.getHours() + ":" + (minutes < 10 ? "0" + minutes : minutes);
}

Utils.prototype.round = function(source, roundTo) {
	var remnant = source % roundTo;
	return remnant >= roundTo / 2 ? source + roundTo - remnant : source - remnant;
}

Utils.prototype.floor = function (source, roundTo) {
	return source - source % roundTo;
}

Utils.prototype.ceil = function (source, roundTo) {
	return source + roundTo - source % roundTo;
}

Utils.prototype.minutesDifference = function (lowerDate, greaterDate) {
	var diffMs = (greaterDate - lowerDate);
	return Math.round(diffMs / 60000);
}

Utils.prototype.hasClass = function(element, cls) {
	return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
}