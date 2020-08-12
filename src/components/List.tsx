import React from 'react';
import { navigate } from 'gatsby';
import {
  DetailsListLayoutMode,
  SelectionMode,
  IColumn,
} from '@fluentui/react/lib/DetailsList';
import { ShimmeredDetailsList } from '@fluentui/react/lib/ShimmeredDetailsList';
import { Block, Transaction } from '../generated/graphql';

interface ListProps {
  items: any[] | null;
  loading: boolean;
  columns: IColumn[];
  onItemInvoked: (item: any) => void;
}

const POLL_INTERVAL = 2000;

const List: React.FC<ListProps> = ({
  items,
  loading,
  columns,
  onItemInvoked,
}) => (
  <ShimmeredDetailsList
    setKey="set"
    items={items === null || loading ? [] : items}
    columns={columns}
    selectionMode={SelectionMode.none}
    layoutMode={DetailsListLayoutMode.justified}
    isHeaderVisible={true}
    enableShimmer={loading}
    onItemInvoked={onItemInvoked}
  />
);

export default List;

export type OmitListProps = Omit<ListProps, 'onItemInvoked'>;

interface BlockListProps extends OmitListProps {
  items: Block[] | null;
}

export const BlockList: React.FC<BlockListProps> = props => (
  <List
    {...props}
    onItemInvoked={block => navigate(`/search/?${block.hash}`)}
  />
);
