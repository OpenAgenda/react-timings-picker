
var DOMUtils = function() {

}

DOMUtils.prototype.getVertiacalScrollOffset = function () {

  var doc = document.documentElement;
  return (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);

}

DOMUtils.prototype.elementOffset = function ( element ) {
  var top = 0, left = 0;
  do {
    top += element.offsetTop || 0;
    left += element.offsetLeft || 0;
    element = element.offsetParent;
  } while ( element );

  return {
    top: top,
    left: left
  };
};

DOMUtils.prototype.getParentHavingClass = getParentHavingClass;

function getParentHavingClass( element, cls ) {

  if ( element.className.split( ' ' ).indexOf( cls ) >= 0 ) return element;

  if ( !element.parentNode ) return false;

  return getParentHavingClass( element.parentNode, cls );

}

module.exports = new DOMUtils();