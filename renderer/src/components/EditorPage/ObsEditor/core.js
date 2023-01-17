const loadData = (fs, file, projectName, username) => {
  const newpath = localStorage.getItem('userPath');
  const path = require('path');
  const filePath = path.join(newpath, 'autographa', 'users', username, 'resources', projectName);
  if (fs.existsSync(path.join(filePath))) {
    const data = fs.readFileSync(
      path.join(filePath, 'metadata.json'),
      'utf8',
    );
    const _data = JSON.parse(data);
    let i = 0;
    let j = 1;
    let dirName;
    while (i < j) {
      const firstKey = Object.keys(_data.ingredients).filter((data) => data.endsWith(`${file}.md`))[0];
      const folderName = firstKey.split(/[(\\)?(/)?]/gm).slice(0);
      dirName = folderName[0];
      const stats = fs.statSync(path.join(filePath, dirName));
      if (!stats.isDirectory()) {
        j += 1;
      }
      i += 1;
    }
    const content = fs.readFileSync(path.join(filePath, dirName, `${file}.md`), 'utf8');
    return content;
  }
  return 'No Content';
};
const core = (fs, num, projectName, username) => {
  const stories = [];
  // eslint-disable-next-line prefer-const
  let id = 1;
  const data = loadData(fs, num.toString().padStart(2, 0), projectName, username);
  const allLines = data.split(/\r\n|\n/);
  // Reading line by line
  allLines.forEach((line) => {
    // To avoid the values after footer, we have added id=0
    if (line && id !== 0) {
      if (line.match(/^(\s)*#/gm)) {
        // Fetching the header content
        const hash = line.match(/# (.*)/);
        stories.push({
          id, title: hash[1],
        });
        id += 1;
      } else if (line.match(/^(\s)*_/gm)) {
        // Fetching the footer
        const objIndex = stories.findIndex(((obj) => obj.id === id));
        if (objIndex !== -1 && Object.prototype.hasOwnProperty.call(stories[objIndex], 'img')) {
          stories[objIndex].text = '';
          id += 1;
        }
        const underscore = line.match(/_(.*)_/);
        stories.push({
          id, end: underscore[1],
        });
        // Logically footer is the last line of story
        id = 0;
      } else if (line.match(/^(\s)*!/gm)) {
        // Fetching the IMG url
        const objIndex = stories.findIndex(((obj) => obj.id === id));
        if (objIndex !== -1 && Object.prototype.hasOwnProperty.call(stories[objIndex], 'img')) {
          stories[objIndex].text = '';
          id += 1;
        }
        const imgUrl = line.match(/\((.*)\)/);
        stories.push({
          id, img: imgUrl[1],
        });
      } else {
        // Reading the content line by line
        const objIndex = stories.findIndex(((obj) => obj.id === id));
        if (objIndex !== -1) {
          // Reading first line after img
          stories[objIndex].text = line;
          id += 1;
        } else {
          // Reading other lines and appending with previous line data
          stories[id - 2].text = `${stories[id - 2].text}\n${line}`;
        }
      }
    }
  });
  return stories;
};
export default core;
