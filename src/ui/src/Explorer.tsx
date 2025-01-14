/**
 * Explorer.tsx - This file contains the code for the Explorer component.
 * 
 * The explorer is a tree view component that displays a list of projects and their contents.
 * It can be used to navigate through the projects and work with its items.
 */

import { useState, useEffect, useCallback } from 'react';
import { TreeViewBaseItem } from '@mui/x-tree-view/models';
import { useTreeViewApiRef } from '@mui/x-tree-view/hooks';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';

import './assets/Explorer.scss';

function Explorer() {

  const apiRef = useTreeViewApiRef();
  const [treeData, setTreeData] = useState(() => {
    const items: TreeViewBaseItem[] = [{
      id: '',
      label: 'Projects',
      children: []
    }];

    return items;
  });

  const onUpdateFunc = useCallback((_event: Electron.IpcRendererEvent, elements: string) => {
    const parsed_elements = JSON.parse(elements);
    console.log('Update: ', parsed_elements);
    setTreeData(parsed_elements);
  }, []);

  const onExpandFunc = useCallback((_event: Electron.IpcRendererEvent, ids: string[]) => {
    console.log('Expand: ', ids);

    const react_event = { type: 'custom' } as React.SyntheticEvent;
    for (const id of ids) {
      apiRef.current!.setItemExpansion(react_event, id, true);
    }
  }, [apiRef]);

  const onSelectFunc = useCallback((_event: Electron.IpcRendererEvent, ids: string[]) => {
    console.log('Select: ', ids);

    for (const id of ids) {
      apiRef.current?.selectItem({ event: { type: 'custom' } as React.SyntheticEvent, itemId: id, keepExistingSelection: ids.indexOf(id) !== 0 });
    }
  }, [apiRef]);

  useEffect(() => {

    console.log("*** Register");
    window.explorer.onUpdate(onUpdateFunc);
    window.explorer.onExpandItems(onExpandFunc);
    window.explorer.onSelectItems(onSelectFunc);

    return () => {
      console.log("*** Unregister");
      window.explorer.offUpdate(onUpdateFunc);
      window.explorer.offExpandItems(onExpandFunc);
      window.explorer.offSelectItems(onSelectFunc);
    };

  }, [onUpdateFunc, onExpandFunc, onSelectFunc]);

  return (
    <div className="explorer">
      <RichTreeView items={treeData} apiRef={apiRef} />
    </div>
  );
}

export default Explorer;