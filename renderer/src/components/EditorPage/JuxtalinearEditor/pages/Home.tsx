import React, { useContext, useEffect, useRef, useState } from "react";
import {
  DragDropContext,
  StrictModeDroppable,
  Draggable,
  DropResult,
  DraggableLocation,
} from "../components/Droppable";
import saveAs from 'file-saver';
import { Box, Button, Grid, Stack } from "@mui/material";
import { IoCaretUp, IoCaretDown } from "react-icons/io5";
import * as localforage from 'localforage';
import { readFile } from '../../../../core/editor/readFile';
import { saveToFile } from '../../JuxtaTextEditor/hooks/saveToFile';

// import SentenceContext from "@/components/context/SentenceContext";
// import { ISentenceContext,ISource, ISentence } from '../types.d.ts';
import { MarkdownInput } from "../components/MarkdownInput";
import { SentenceContext } from "../index";
import { ReferenceContext } from '@/components/context/ReferenceContext';
import { useReadJuxtaFile } from "../../JuxtaTextEditor/hooks/useReadJuxtaFile";
import md5 from "md5";
// import { readUsfm } from "../utils/readUsfm";

const grid = 3

const getItemStyle = (isDragging: boolean, draggableStyle: any) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: "none",
  padding: grid * 2,
  margin: `0 ${grid}px 0 0`,

  // change background colour if dragging
  background: isDragging ? "lightgreen" : "lightgrey",

  // styles we need to apply on draggables
  ...draggableStyle,
})

const getListStyle = (isDraggingOver: boolean) => ({
  background: isDraggingOver ? "lightblue" : "lightgrey",
  display: "flex",
  padding: grid,
  overflow: "auto",
})

const Home: React.FC = () => {
  const {
    sentences,
    originText,
    itemArrays,
    curIndex,
    fileName,
    setFileName,
    setGlobalTotalSentences,
    setItemArrays,
    setOriginText,
    setCurIndex,
    setGlobalSentences,
    setGlobalItemArrays,
  } = useContext(SentenceContext);

  const {
    state: {
      bookId,
      bookList,
      bookName,
      chapter,
      verse,
      chapterList,
      verseList,
      languageId,
      folderPath,
      refName,
      //  closeNavigation,
    }, actions: {
      onChangeChapter,
      onChangeVerse,
    },
  } = useContext(ReferenceContext);

  const [jsonFileContent, setJsonFileContent] = useState<IOutput>(null);
  const clickRef = useRef(0);
  const usfmOpenRef = useRef<HTMLInputElement>(null);
  const jsonOpenRef = useRef<HTMLInputElement>(null);
  const { usfmData, bookAvailable, readFileName } = useReadJuxtaFile();

  // const [mode, setMode] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light");

  const remakeSentences = (stcs: ISentence[]) => {
    return stcs.map((stc) => {
      const counts: { [key: string]: any } = {};
      const chunks = stc.chunks.filter(({source}) => source[0]).map((chunk) => {
        const source = chunk.source.map((src) => {
          if (counts[src.content] === undefined) {
            counts[src.content] = 0;
          } else {
            counts[src.content]++;
          }
          return { ...src, index: counts[src.content] };
        });
        return {
          source,
          gloss: chunk.gloss,
          checksum: md5(source)
        };
      });
      return {
        originalSource: stc.originalSource,
        chunks,
        sourceString: stc.sourceString,
        checksum: md5(stc.originalSource)
      };
    });
  };

  const tryLoadSentences = () => {
    // const projectName = await localforage.getItem('currentProject');
    // const blob = new Blob([usfmData[0] as string], { type: 'application/json' });
    // saveAs(blob, 'cake.json');
    if(bookAvailable) {
      const resContent = JSON.parse(usfmData[0].data);
      setJsonFileContent(resContent);
      setFileName(readFileName);
      setCurIndex(0);
      setGlobalTotalSentences(remakeSentences(resContent.sentences));
      setOriginText(resContent.sentences.map((sentence: { sourceString: string; }) => sentence.sourceString));
      if (resContent.sentences.length) {
        setItemArrays([getItems(resContent.sentences)]);
      }
    }
  }

  useEffect(() => {
    tryLoadSentences();
  }, [bookAvailable, usfmData]);

  useEffect(() => {
    if (sentences.length) {
      setGlobalItemArrays(curIndex, getItems())
    }
  }, [sentences, curIndex])

  const remakeSentence = (stc: ISentence) => {
    const counts: {[key: string]: any} = {}
    const chunks = stc.chunks.filter(({source}) => source[0]).map((chunk) => {
      const source = chunk.source.map((src) => {
        if (!counts[src.content]) {
          counts[src.content] = 0
        } else {
          counts[src.content]++
        }
        return { ...src, index: counts[src.content] }
      })
      return {
        source,
        gloss: chunk.gloss,
        checksum: md5(source)
      }
    })
    return {
      originalSource: stc.originalSource,
      chunks,
      sourceString: stc.sourceString,
      checksum: md5(stc.originalSource)
    }
  }


  useEffect(() => {
    if(sentences[0] !== undefined) {
      sentences[0].chunks.filter(({source}) => source[0]).forEach((chunck) => {
        chunck.source.filter(e => e);
        chunck.checksum = md5(chunck.source);
      });
      jsonFileContent.sentences = sentences
      const jsonStr = JSON.stringify(jsonFileContent);
      saveToFile(jsonStr, bookId);
    }
  }, [setGlobalItemArrays]);

  const getItems = (res: ISentence[] = null) => {
    if(res !== null) {
      return res[0].chunks
        .map(({ source, gloss, checksum }, index: number) => {
          return {
            chunk: source
              .filter((s) => s)
              .map((s: ISource, n: number) => {
                return {
                  id: `item-${index * 1000 + n}`,
                  content: s.content,
                  index: s.index,
                };
              }),
            gloss,
            checksum,
          };
        })
        .filter(({ chunk }) => chunk.length);
    } else {
      return sentences[curIndex].chunks
      .map(({ source, gloss, checksum }, index: number) => {
        return {
          chunk: source
            .filter((s) => s)
            .map((s: ISource, n: number) => {
              return {
                id: `item-${index * 1000 + n}`,
                content: s.content,
                index: s.index
              };
            }),
          gloss,
          checksum,
        };
      })
      .filter(({ chunk }) => chunk.length)
    }
  };

  const reorder = (list: Array<any>, startIndex: number, endIndex: number) => {
    const result = Array.from(list)
    const [removed] = result.splice(startIndex, 1)
    result.splice(endIndex, 0, removed)

    return result
  }

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result

    // dropped outside the list
    if (!destination) {
      return
    }

    const sInd = +source.droppableId
    const dInd = +destination.droppableId

    if (sInd === dInd) {
      const newSource = reorder(
        sentences[curIndex].chunks[sInd].source,
        source.index,
        destination.index
      )

      const newChunks = [...sentences[curIndex].chunks]
      newChunks[sInd].source = newSource
      newChunks[sInd].checksum = md5(newSource)

      const newSentence = remakeSentence({
        originalSource: sentences[curIndex].originalSource,
        chunks: newChunks,
        sourceString: sentences[curIndex].sourceString,
        checksum: md5(sentences[curIndex].originalSource)
      })
      setGlobalSentences(curIndex, newSentence)
    } else {

      const sentenceRes = move(
        sentences[curIndex].chunks[sInd].source,
        sentences[curIndex].chunks[dInd].source,
        source,
        destination
      )

      const newChunks = [...sentences[curIndex].chunks]
      newChunks[sInd].source = sentenceRes[sInd]
      newChunks[dInd].source = sentenceRes[dInd]
      newChunks[sInd].gloss = ""
      newChunks[dInd].gloss = ""
      newChunks[sInd].checksum = md5(sentenceRes[sInd])
      newChunks[dInd].checksum = md5(sentenceRes[dInd])

      const newSentence = remakeSentence({
        originalSource: sentences[curIndex].originalSource,
        chunks: newChunks,
        sourceString: sentences[curIndex].sourceString,
        checksum: md5(sentences[curIndex].originalSource)
      })
      setGlobalSentences(curIndex, newSentence)
    }
  }

  const handleDoubleClick = (item: any, rowN: number, colN: number) => {
    clickRef.current += 1

    if (clickRef.current === 1) {
      setTimeout(() => {
        if (clickRef.current === 2) {
          // Double click logic
          let newChunks = [...sentences[curIndex].chunks]
          if (
            colN === itemArrays[curIndex][rowN].chunk.length ||
            (colN === 0 && rowN === 0)
          ) {
            // first col in first row
            return
          }
          if (colN === 0) {
            // merge with previous row
            newChunks[rowN - 1].source = [
              ...newChunks[rowN - 1].source,
              ...newChunks[rowN].source,
            ]
            newChunks[rowN - 1].gloss = ""
            newChunks[rowN].source = []
            newChunks[rowN].gloss = ""
            newChunks[rowN].checksum = ""
            newChunks = newChunks.filter((c) => c.source.length)
          } else {
            // Make new row
            newChunks = [
              ...newChunks.slice(0, rowN),
              { source: newChunks[rowN].source.slice(0, colN), gloss: "", checksum: md5(newChunks[rowN].source.slice(0, colN)) },
              { source: newChunks[rowN].source.slice(colN), gloss: newChunks[rowN].gloss, checksum: md5(newChunks[rowN].source.slice(colN)) },
              ...newChunks.slice(rowN + 1),
            ]
          }
          
          const newSentence = remakeSentence({
            originalSource: sentences[curIndex].originalSource,
            chunks: newChunks,
            sourceString: sentences[curIndex].sourceString,
            checksum: md5(sentences[curIndex].originalSource)
          })
          setGlobalSentences(curIndex, newSentence)
        }

        clickRef.current = 0
      }, 300)
    }
  }

  /**
   * Moves an item from one chunk to another chunk.
   */
  const move = (
    source: Iterable<unknown> | ArrayLike<unknown>,
    destination: Iterable<unknown> | ArrayLike<unknown>,
    droppableSource: DraggableLocation,
    droppableDestination: DraggableLocation
  ) => {
    const sourceClone = Array.from(source)
    const destClone = Array.from(destination)
    const [removed] = sourceClone.splice(droppableSource.index, 1)

    destClone.splice(droppableDestination.index, 0, removed)

    const result: { [key: string]: any } = {}
    result[droppableSource.droppableId] = sourceClone
    result[droppableDestination.droppableId] = destClone

    return result
  }

  const chunkUpHandler = (n: number) => {
    const newChunks = [...sentences[curIndex].chunks]
    ;[newChunks[n - 1], newChunks[n]] = [newChunks[n], newChunks[n - 1]]

    const newSentence = remakeSentence({
      originalSource: sentences[curIndex].originalSource,
      chunks: newChunks,
      sourceString: sentences[curIndex].sourceString,
      checksum: md5(sentences[curIndex].originalSource),
    })
    setGlobalSentences(curIndex, newSentence)
  }

  const chunkDownHandler = (n: number) => {
    const newChunks = [...sentences[curIndex].chunks]
    ;[newChunks[n], newChunks[n + 1]] = [newChunks[n + 1], newChunks[n]]

    const newSentence = remakeSentence({
      originalSource: sentences[curIndex].originalSource,
      chunks: newChunks,
      sourceString: sentences[curIndex].sourceString,
      checksum: md5(sentences[curIndex].originalSource),
    })
    setGlobalSentences(curIndex, newSentence)
  }

  const glossChangeHandler = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    n: number
  ) => {
    const newItemArrays = [...itemArrays[curIndex]]
    newItemArrays[n].gloss = e.target.value
    const newChunks = [...sentences[curIndex].chunks]
    newChunks[n].gloss = e.target.value
    setGlobalItemArrays(curIndex, newItemArrays)
    setGlobalSentences(curIndex, {
      originalSource: sentences[curIndex].originalSource,
      chunks: newChunks,
      sourceString: sentences[curIndex].sourceString,
      checksum: md5(sentences[curIndex].originalSource),
    })
  }

  return (
    <div>
      <Grid container>
        <Grid item sm={12} p={2} pl={0} width="100%">
          <DragDropContext onDragEnd={onDragEnd}>
            {itemArrays[curIndex]?.map((items, n) => (
              <Grid container key={n} className="chunk-row">
                <Grid item sm={true} px={2} py={1}>
                  <Stack flexDirection="row">
                    <Stack height={36} justifyContent="center">
                      <Button
                        sx={{ minWidth: "30px", height: "14px" }}
                        onClick={() => chunkUpHandler(n)}
                        disabled={!n}
                      >
                        <IoCaretUp />
                      </Button>
                      <Button
                        sx={{ minWidth: "30px", height: "14px" }}
                        onClick={() => chunkDownHandler(n)}
                        disabled={n === itemArrays[curIndex].length - 1}
                      >
                        <IoCaretDown />
                      </Button>
                    </Stack>
                    <StrictModeDroppable
                      droppableId={`${n}`}
                      direction="horizontal"
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          style={getListStyle(snapshot.isDraggingOver)}
                          {...provided.droppableProps}
                        >
                          {items.chunk.map((item, index) => (
                            <Draggable
                              key={item.id}
                              draggableId={item.id}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  className="draggable"
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  style={getItemStyle(
                                    snapshot.isDragging,
                                    provided.draggableProps.style
                                  )}
                                  onClick={() =>
                                    handleDoubleClick(item, n, index)
                                  }
                                >
                                  <Stack flexDirection={"row"} gap={"6px"}>
                                  <Box>{item.content}</Box>
                                    {item.index ? (
                                      <Box sx={{ fontSize: "10px" }}>
                                        {item.index + 1}
                                      </Box>
                                    ) : (
                                      <></>
                                    )}
                                  </Stack>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </StrictModeDroppable>
                  </Stack>
                </Grid>
                <Grid item sx={{ height: "50px" }} sm={true} px={2} py={1}>
                  <MarkdownInput
                    value={items.gloss}
                    onChange={(e) => glossChangeHandler(e, n)}
                  />
                </Grid>
              </Grid>
            ))}
          </DragDropContext>
        </Grid>
      </Grid>
    </div>
  )
}

export default Home