export const getDictionnary = () => {
  const path = require('path');
  const fs = window.require('fs');
  let filename = 'keywords_CLEANED.txt';
  let dictPath = path.join('./', filename);

  const data = fs.readFileSync(dictPath).toString();

  var lines = data.split('\n');
  let mydict = {};
  for(let line of lines) {
    mydict[line] = 'test';
  }
  return mydict;
  // console.log(lines[1]);
  // for (var line of lines) {
  //   console.log(lines[line]);
  // }
};
