/**
Convert a dotted path to a location inside an object.

@private
@example

  // returns xfoo
  extractValue('wow.it.works', {
    wow: {
      it: {
        works: 'xfoo'
      }
    }
  });

  // returns undefined
  extractValue('xfoo.bar', { nope: 1 });

@param {String} path dotted to indicate levels in an object.
@param {Object} view for the data.
*/
function extractValue(path, view) {
  // Short circuit for direct matches.
  if (view && view[path]) return view[path];

  var parts = path.split('.');

  while (
    // view should always be truthy as all objects are.
    view &&
    // must have a part in the dotted path
    (part = parts.shift())
  ) {
    view = (typeof view === 'object' && part in view) ?
      view[part] :
      undefined;
  }

  return view;
}

var REGEX = new RegExp('{{([a-zA-Z.-_0-9]+)}}', 'g');
var TEMPLATE_OPEN = '{{';

/**
NOTE: I also wrote an implementation that does not use regex but it is actually slower
      in real world usage and this is easier to understand.

@param {String} input template.
@param {Object} view details.
*/
function replace(input, view) {
  // optimization to avoid regex calls (indexOf is strictly faster)
  if (input.indexOf(TEMPLATE_OPEN) === -1) return input;
  var result;
  var replaced = input.replace(REGEX, function(original, path) {
    var value = extractValue(path, view);
    if (undefined === value || null === value) {
      return original;
    }
    var vtype= typeof value;
    if (vtype === 'object') {
      result = value;
      return;
    }
    if (vtype === 'number' && (input.indexOf("}}") === input.length-2 && input.indexOf("{{") ===0)) {
      result = value;
      return;
    }
    return value;
  });
  return (undefined !== result) ? result : replaced;
}

module.exports = replace;
