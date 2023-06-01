// filter current chapter data from whole TSV JSON and generate array of notes of md content
// based on reference of tsv
import * as logger from '../../../../logger';

const getValue = async (filteredData, twURL, repoName, scrollLock) => {
  const chapterTsvData = [];
  const notesObj = {};
  await Promise.all(filteredData.map(async (tsvObj) => {
  if (repoName.includes('obs-twl')) {
    // Fetching the content for Translation Word List
    const regex = /(.*)dict\//gm;
    const link = (tsvObj.TWLink).replace(regex, '');
    await fetch(`${twURL}/${link}.md`)
    .then((res) => res.json())
    .then(async (data) => {
      const tsvfetchResp = await fetch(data?.download_url);
      if (tsvfetchResp.ok) {
        const tsvData = await tsvfetchResp.text();
        if (scrollLock === false) {
          let mdstring = '';
          mdstring += `${ tsvData }\n`;
          if (tsvObj.Reference.split(':')[1] in notesObj) {
            (notesObj[tsvObj.Reference.split(':')[1]]).push({ name: ((tsvObj.Reference.split(':')[1]).toString()).padStart(2, 0), OccurrenceNote: mdstring });
          } else {
            (notesObj[tsvObj.Reference.split(':')[1]]) = [{ name: ((tsvObj.Reference.split(':')[1]).toString()).padStart(2, 0), OccurrenceNote: mdstring }];
          }
        } else {
          let mdstring = '';
          mdstring += `# ${ tsvData }\n`;
          if (tsvObj.Reference.split(':')[1] in notesObj) {
            notesObj[tsvObj.Reference.split(':')[1]].OccurrenceNote += mdstring;
          } else {
            notesObj[tsvObj.Reference.split(':')[1]] = { name: ((tsvObj.Reference.split(':')[1]).toString()).padStart(2, 0), OccurrenceNote: mdstring };
          }
        }
      }
    });
  } else {
    // Fetching the content for Translation Notes & Questions
    let mdstring = '';
    mdstring += `# ${ tsvObj.Quote }\n\n${ tsvObj.Note }\n`;
    if (tsvObj.Reference.split(':')[1] in notesObj) {
      notesObj[tsvObj.Reference.split(':')[1]].OccurrenceNote += mdstring;
    } else {
      notesObj[tsvObj.Reference.split(':')[1]] = { name: ((tsvObj.Reference.split(':')[1]).toString()).padStart(2, 0), OccurrenceNote: mdstring };
    }
  }
  }));
  if (Object.keys(notesObj).length > 0) {
    await Object.values(notesObj).forEach(async (value) => {
      await chapterTsvData.push(value);
    });
    return chapterTsvData;
  }
};
export default async function ObsTsvToChapterLevelMd(tsvJSON, chapter, twURL, repoName, scrollLock) {
  logger.debug('in ObsTsvToChapterLevel.js : in promise');
  const filteredData = tsvJSON.filter((data) => data.Reference.split(':')[0].toString() === chapter.toString());
  const notesObj = await getValue(filteredData, twURL, repoName, scrollLock);
  return notesObj;
}