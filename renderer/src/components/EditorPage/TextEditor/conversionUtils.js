// import USFMParser from 'sj-usfm-grammar';
// import { transform } from '@proskomma/hallomai';
import init, { transform } from "@proskomma/hallomai";

let usfmParserInstance;
let usfmParserInitialized;
let wasmInitialized = false;

// export async function initializeParser() {
//   if (!usfmParserInstance) {
//     if (!usfmParserInitialized) {
//       usfmParserInitialized = await USFMParser.init();
//     }
//     await usfmParserInitialized;
//     usfmParserInstance = new USFMParser();
//   }
//   return usfmParserInstance;
// }

export async function initializeParser() {
  wasmInitialized = true;
  return init()
}

export async function convertUsfmToUsj(usfm) {
  // if (!usfmParserInstance) {
  //   usfmParserInstance = await initializeParser();
  // }
  if (!wasmInitialized) {
    await initializeParser();
  }
  if (!wasmInitialized) {
    await initializeParser();
  }
  try {
    console.log("ici oui")
    const usj = transform(usfm, 'usfm', 'usj');
    console.log("ici en fait")
    return { usj };
  } catch (e) {
    return { usj: { content: [] }, error: e };
  }
}

export async function convertUsjToUsfm(usj) {
  // if (!usfmParserInstance) {
  //   usfmParserInstance = await initializeParser();
  // }
  console.log("HEAR ME")
  const usfm = transform(usj, 'usj', 'usfm');
  console.log("OUT")
  return usfm;
}

initializeParser()
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('USFM Parser initialized successfully');
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Error initializing USFM Parser:', err);
  });
