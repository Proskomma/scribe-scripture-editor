/**
 * 
 * @returns {Array} the dict of words
 */
export const getDictionnary = () => {
  const path = require('path');
  const fs = window.require('fs');
  let filename = 'keywords_CLEANED.txt';
  let dictPath = path.join('./', filename);

  const data = fs.readFileSync(dictPath).toString();

  var lines = data.split('\n');
  let mydict = ["amp", "nbsp"];
  for(let line of lines) {
    mydict.push(line);
  }
  return mydict;
  // console.log(lines[1]);
  // for (var line of lines) {
  //   console.log(lines[line]);
  // }
};
