/**
 * JavaScript implementation of Java's String.hashCode method
 *
 * @source https://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
 * @param stringToBeHashed
 * @returns {number}
 */
function hashCode(stringToBeHashed) {
  var hash = 0, i, chr;
  if (stringToBeHashed.length === 0) return hash;
  for (i = 0; i < stringToBeHashed.length; i++) {
    chr   = stringToBeHashed.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}