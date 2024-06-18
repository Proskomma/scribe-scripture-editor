import React, {
  useEffect, useState, useContext, Fragment,
} from 'react';
import { useProskomma, useImport, useCatalog } from 'proskomma-react-hooks';
import { useDeepCompareEffect } from 'use-deep-compare';
import { ScribexContext } from '@/components/context/ScribexContext';
import { ReferenceContext } from '@/components/context/ReferenceContext';
import { ProjectContext } from '@/components/context/ProjectContext';
import EditorSideBar from '@/modules/editorsidebar/EditorSideBar';
import { useReadUsfmFile } from './hooks/useReadUsfmFile';
import htmlMap from './hooks/htmlmap';
import usePerf from './hooks/usePerf';
import EditorMenuBar from './EditorMenuBar';
import Editor from './Editor';
import ChecksPopup from './ChecksPopup';
import { PipelineHandler, pipelines } from 'proskomma-json-tools';

export default function TextEditor() {
  const { state, actions } = useContext(ScribexContext);
  const { verbose } = state;
  // const { usfmData, bookAvailable } = props;
  const [selectedBook, setSelectedBook] = useState();
  const [openChecksPopup, setOpenChecksPopup] = useState(false);
  const [bookChange, setBookChange] = useState(false);
  const [chapterNumber, setChapterNumber] = useState(1);
  const [verseNumber, setVerseNumber] = useState(1);
  const [triggerVerseInsert, setTriggerVerseInsert] = useState(false);
  const [contentPopUp, setContentPopUp] = useState({});
  // const [newVerChapNumber, setInsertNumber] = useState('');
  // const [insertVerseRChapter, setInsertVerseRChapter] = useState('');

  const { usfmData, bookAvailable } = useReadUsfmFile();

  const {
    state: { bookId, selectedFont },
    actions: { handleSelectedFont, onChangeChapter, onChangeVerse },
  } = useContext(ReferenceContext);

  const {
    states: { openSideBar },
    actions: { setOpenSideBar },
  } = useContext(ProjectContext);

  let selectedDocument;

  const { proskomma, stateId, newStateId } = useProskomma({ verbose });
  const { done } = useImport({
    proskomma,
    stateId,
    newStateId,
    documents: usfmData,
  });

  function closeSideBar(status) {
    setOpenSideBar(status);
  }

  useEffect(() => {
    setSelectedBook(bookId.toUpperCase());
    setBookChange(true);
  }, [bookId]);

  useEffect(() => {
    onChangeChapter(chapterNumber, 1);
    onChangeVerse(verseNumber, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterNumber, verseNumber]);

  const { catalog } = useCatalog({ proskomma, stateId, verbose });
  const { id: docSetId, documents } = (done && catalog.docSets[0]) || {};
  if (done) {
    selectedDocument = documents?.find(
      (doc) => doc.bookCode === selectedBook,
    );
  }

  const { bookCode, h: bookName } = selectedDocument || {};
  const ready = (docSetId && bookCode) || false;
  const isLoading = !done || !ready;
  const { state: perfState, actions: perfActions } = usePerf({
    proskomma,
    ready,
    docSetId,
    bookCode,
    verbose,
    htmlMap,
  });
  const { htmlPerf } = perfState;

  useDeepCompareEffect(() => {
    if (htmlPerf && htmlPerf.mainSequenceId !== state.sequenceIds[0]) {
      actions.setSequenceIds([htmlPerf?.mainSequenceId]);
    }
  }, [htmlPerf, state.sequenceIds, perfState]);

  const checks = async () => {
    const fse = window.require('fs-extra');
    const path = window.require('path');
    const checker = window.require('/home/daniel/Documents/Projects/temp/scribe-scripture-editor/renderer/src/components/EditorPage/TextEditor/utils/doChecks/index.js');

    const usfmContent = { usfm: "\\id MRK" };
    const spec = fse.readJsonSync('/home/daniel/Documents/Projects/temp/scribe-scripture-editor/renderer/src/components/EditorPage/TextEditor/utils/doChecks/specs/ks.json');

    if (perfActions && htmlPerf) {
      // const perfContent = { perf: fse.readJsonSync('/home/daniel/Documents/Projects/temp/scribe-scripture-editor/renderer/src/components/EditorPage/TextEditor/utils/doChecks/MARK_titus_aligned_eng.json') };
      const perfContent = await perfActions.getPerf();

      let ret = checker({ content: { perf: perfContent }, spec, contentType: "perf" });
      // const { PipelineHandler } = require('proskomma-json-tools');
      // if (perfState.usfmText) {
      //   const pipelineH = new PipelineHandler(pipelines);
      //   console.log(pipelineH.listPipelinesNames());
      //   console.log("type of perfState.usfmText ==", perfState.usfmText);

      //   let output = await pipelineH.runPipeline("usfmToPerfPipeline", {
      //     usfm: perfState.usfmText,
      //     selectors: { "lang": "fra", "abbr": "fraLSG" }
      //   });
      setContentPopUp(ret[0].issues);
      setOpenChecksPopup(true);
      console.log(ret[0].issues);
    }
    // }


    // console.log("usfmText ==",);
  }

  const _props = {
    ...state,
    ...perfState,
    ...actions,
    ...perfActions,
    selectedFont,
    chapterNumber,
    verseNumber,
    isLoading,
    bookName,
    bookChange,
    bookAvailable,
    setBookChange,
    setChapterNumber,
    setVerseNumber,
    handleSelectedFont,
    triggerVerseInsert,
    setTriggerVerseInsert,
    checks
  };
  return (
    <>
      <EditorSideBar
        isOpen={openSideBar}
        closeSideBar={closeSideBar}
        graftProps={_props}
      />
      <div className="flex flex-col bg-white border-b-2 border-secondary h-editor rounded-md shadow scrollbar-width">
        <EditorMenuBar {..._props} />
        <Editor {..._props} />
      </div>
      <ChecksPopup openChecksPopup={openChecksPopup} setOpenChecksPopup={setOpenChecksPopup} content={contentPopUp} />
    </>
  );
}
