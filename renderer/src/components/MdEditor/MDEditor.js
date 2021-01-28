/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
// @flow
import * as React from 'react';
import { BlockEditable } from 'markdown-translatable/dist/components';
import { Button } from '@material-ui/core';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import PropTypes from 'prop-types';
import * as logger from '../../logger';
import CustomDialog from '../ApplicationBar/CustomDialog';

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}

export const MDEditor = ({
  openMDFile,
  setopenMDFile,
  mdFilePath,
}) => {
  const [onedit, setEdit] = React.useState(0);
  const [preview, setpreview] = React.useState(true);
  const [translation, settranslation] = React.useState();

  const handleEdit = (edit) => {
    setEdit(edit);
  };

  const handleClose = () => {
    setopenMDFile(false);
  };

  const callback = (markdown) => {
    logger.debug('markdownviewer.js', `set translation as ${markdown}`);
    settranslation(markdown);
  };

  React.useEffect(() => {
    settranslation(mdFilePath);
  }, [mdFilePath]);

  const title = (
    <AppBar position="static" color="default">
      <Tabs
        value={onedit}
        onChange={handleEdit}
        indicatorColor="primary"
        textColor="primary"
        data-testid="test-tabs"
        aria-label="full width tabs example"
      >
        <Tab
          onClick={() => setpreview(true)}
          data-testid="test-preview"
          label="Preview"
          {...a11yProps(0)}
        />
        <Tab
          onClick={() => setpreview(false)}
          data-testid="test-markdown"
          label="Markdown"
          {...a11yProps(1)}
        />
      </Tabs>
    </AppBar>
  );

  const content = (
    <>
      {onedit === 0 ? (
        <div>
          <BlockEditable
            markdown={translation}
            preview={preview}
            onEdit={callback}
            inputFilters={[
              [/<br>/gi, '\n'],
              [/(<u>|<\/u>)/gi, '__'],
            ]}
            outputFilters={[[/\n/gi, '<br>']]}
          />
        </div>
      ) : (
        <div>
          <BlockEditable
            markdown={translation}
            preview={preview}
            onEdit={callback}
            inputFilters={[
              [/<br>/gi, '\n'],
              [/(<u>|<\/u>)/gi, '__'],
            ]}
            outputFilters={[[/\n/gi, '<br>']]}
          />
        </div>
      )}
    </>
  );

  const button = (
    <>
      <Button
        autoFocus
        onClick={handleClose}
        data-testid="test-cancel"
        variant="contained"
      >
        cancel
      </Button>
      <Button
        autoFocus
        onClick={handleClose}
        variant="contained"
        data-testid="test-save"
        color="primary"
      >
        save
      </Button>
    </>
  );

  return (
    <div>
      <CustomDialog
        open={openMDFile}
        setOpen={setopenMDFile}
        title={title}
        buttons={button}
        content={content}
        width="xl"
      />
    </div>
  );
};

MDEditor.propTypes = {
  openMDFile: PropTypes.bool.isRequired,
  setopenMDFile: PropTypes.func,
  mdFilePath: PropTypes.string,
};