/**
 * Explorer.tsx - This file contains the code for the Explorer component.
 * 
 * The explorer is a tree view component that displays a list of projects and their contents.
 * It can be used to navigate through the projects and work with its items.
 */

import { useState, useEffect } from 'react';
import { TreeViewBaseItem } from '@mui/x-tree-view/models';
import { useTreeViewApiRef } from '@mui/x-tree-view/hooks';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';

import './assets/Explorer.scss';

function Explorer() {

  const apiRef = useTreeViewApiRef();

  const [callbackRegistered, setCallbackRegistered] = useState(false);
  const [treeData, setTreeData] = useState(() => {
    const items: TreeViewBaseItem[] = [{
      id: '',
      label: 'Projects',
      children: []
    }];

    return items;
  });

  useEffect(() => {

    const onUpdateFunc = (elements: string) => {
      const parsed_elements = JSON.parse(elements);
      console.log('Update: ', parsed_elements);
      setTreeData(parsed_elements);

    };

    const onExpandFunc = (ids: string[]) => {
      console.log('Expand: ', ids);

      const event = { type: 'custom' } as React.SyntheticEvent;
      for (const id of ids) {
        apiRef.current!.setItemExpansion(event, id, true);
      }
    }

    const onSelectFunc = (ids: string[]) => {
      console.log('Select: ', ids);

      const event = { type: 'custom' } as React.SyntheticEvent;

      for (const id of ids) {
        apiRef.current?.selectItem({ event, itemId: id, keepExistingSelection: ids.indexOf(id) !== 0 });
      }
    }

    if (!callbackRegistered) {
      window.explorer.onUpdate(onUpdateFunc);
      window.explorer.onExpandItems(onExpandFunc);
      window.explorer.onSelectItems(onSelectFunc);
      setCallbackRegistered(true);
    }

    return () => {
      window.explorer.offUpdate(onUpdateFunc);
      window.explorer.offExpandItems(onExpandFunc);
      window.explorer.offSelectItems(onSelectFunc);
    };

  }, [callbackRegistered, apiRef]);

  return (
    <div className="explorer">
      <RichTreeView items={treeData} apiRef={apiRef} />
    </div>
  );
}

export default Explorer;