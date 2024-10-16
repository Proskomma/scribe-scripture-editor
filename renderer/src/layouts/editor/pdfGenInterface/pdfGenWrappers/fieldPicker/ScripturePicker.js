/* eslint-disable */
import { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import { FieldPicker } from './FieldPicker';

export function ScripturePicker({
  doReset, fieldInfo, setJsonSpec, lang, open = true,
}) {
  const [scriptureJson, setScriptureJson] = useState('{}');
  const [scriptureTable, setScriptureTable] = useState('[]');
  const [numberOfScripture, setNumberOfScripture] = useState(fieldInfo.nValues[0]);
  useEffect(() => {
    setNumberOfScripture(fieldInfo.nValues[0]);
  }, [fieldInfo]);
  useEffect(() => {
    setScriptureTable((prev) => {
      const t = JSON.parse(prev);
      if (numberOfScripture > t.length) {
        for (let i = t.length; i < numberOfScripture; i++) {
          t.push({});
        }
      } else if (numberOfScripture < t.length) {
        for (let i = t.length; i > numberOfScripture; i--) {
          if (t.length > 0) {
            t.pop();
          }
        }
      }
      return JSON.stringify(t);
    });
  }, [numberOfScripture]);

  const resetField = () => {
    setScriptureJson('{}');
    setScriptureTable('[]');
    setNumberOfScripture(fieldInfo.nValues[0]);
  };

  useEffect(() => {
    resetField();
  }, [doReset]);

  useEffect(() => {
    setJsonSpec((prev) => {
      const newState = typeof prev === 'object' ? prev : JSON.parse(prev);
      newState[fieldInfo.id] = JSON.parse(scriptureTable);
      return JSON.stringify(newState);
    });
  }, [scriptureTable]);
  useEffect(() => {
    setScriptureTable((prev) => {
      // Parse the JSON state
      const json = JSON.parse(scriptureJson);

      // Create a new array to avoid direct mutation
      const newTable = JSON.parse(prev);

      // Iterate over the keys in the parsed JSON
      Object.keys(json).forEach((k) => {
        fieldInfo.typeSpec.forEach((field) => {
          const id = field.id.replace('#', '');
          for (let i = 0; i < numberOfScripture; i++) {
            if (k.includes(`${id}${i}`)) {
              if (newTable[i]) {
                newTable[i][id] = json[k];
              }
            }
          }
        });
      });

      // Return the new table array
      return JSON.stringify(newTable);
    });
  }, [scriptureJson, fieldInfo.typeSpec, numberOfScripture]);
  useEffect(() => {
    setScriptureJson((prev) => {
      const newState = typeof prev === 'object' ? prev : JSON.parse(prev);
      fieldInfo.typeSpec.map((t) => {
        delete newState[t.id.replace('#', numberOfScripture + 1)];
      });
      return JSON.stringify(newState);
    });
  }, [numberOfScripture]);

  return (
    <div
      style={
        open
          ? {
            margin: '10%',
            borderLeftStyle: 'solid',
            borderLeftWidth: 1,
          }
          : { display: 'none' }
      }
    >
      <div
        style={{
          display: 'flex',
          margin: 20,
          justifyContent: 'space-between',
        }}
      >
        <Button
          disabled={fieldInfo.nValues[0] === fieldInfo.nValues[1]}
          onClick={() => {
            setNumberOfScripture((prev) => {
              if (prev >= fieldInfo.nValues[0]) {
                return prev - 1;
              }
              return prev;
            });
          }}
          variant="outlined"
        >
          -
        </Button>
        <Button
          disabled={fieldInfo.nValues[0] === fieldInfo.nValues[1]}
          onClick={() => {
            setNumberOfScripture((prev) => {
              if (prev < fieldInfo.nValues[1]) {
                return prev + 1;
              }
              return prev;
            });
          }}
          variant="outlined"
        >
          +
        </Button>
      </div>

      {Array(numberOfScripture)
        .fill(0)
        .map((x, i) => (
          <div
            key={"fieldpicker" + i}
            style={{
              margin: 20,
              borderBottomStyle: 'solid',
              borderBottomWidth: 1,
            }}
          >
            {fieldInfo.typeSpec.map((f) => (
              <FieldPicker
                fieldInfo={changeIndexOfScripture(f, i)}
                setJsonSpec={setScriptureJson}
                lang={lang}
              />
            ))}
          </div>
        ))}
    </div>
  );
}

function changeIndexOfScripture(fieldInfo, index) {
  const { id, label, ...rest } = fieldInfo; // Destructure id and other properties
  const splitTab = id.split('#');
  const newId = splitTab[0] + index + splitTab[1];
  const updatedLabel = {};
  for (const lang in label) {
    updatedLabel[lang] = label[lang].replace(/#/g, index + 1); // Using a regular expression with the 'g' flag to replace all occurrences
  }
  return { id: newId, label: updatedLabel, ...rest }; // Return a new object with modified id, label, and other properties
}
