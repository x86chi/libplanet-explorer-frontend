import React, { useState } from 'react';
import { Checkbox, IColumn, DefaultButton } from '@fluentui/react';

import { Block, BlockListComponent } from '../generated/graphql';

import useOffset, { limit } from '../misc/useOffset';
import { columns, commonProps } from '../misc/columns';

import BlockList from '../components/BlockList';
import OffsetSwitch from '../components/OffsetSwitch';

import { PageProps } from '../misc/pages';

type ListPageProps = PageProps;

const POLL_INTERVAL = 2000;

const ListPage: React.FC<ListPageProps> = ({ location }) => {
  const [offset, olderHandler, newerHandler] = useOffset(location);
  const [excludeEmptyTxs, setExcludeEmptyTxs] = useState(false);
  return (
    <main>
      <Checkbox
        label="Include blocks having any tx"
        checked={excludeEmptyTxs}
        onChange={() => setExcludeEmptyTxs(!excludeEmptyTxs)}
      />
      <BlockListComponent variables={{ offset, limit, excludeEmptyTxs }}>
        {({ data, loading, error }) => {
          if (error) {
            console.error(error);
            return <p>{error.message}</p>;
          }
          const blocks =
            data && data.blockQuery && data.blockQuery.blocks
              ? (data.blockQuery.blocks as Block[])
              : null;

          const timeTaken: IColumn = {
            key: 'columnTimeTaken',
            name: 'Time Taken',
            minWidth: 50,
            maxWidth: 200,
            ...commonProps,
            isSortedDescending: true,
            data: 'string',
            isPadded: true,
            onRender: (block: Block, index: number) => {
              if (blocks === null) throw Error('blocks is null');
              // FIX TODO: beforeBlock index is not available
              const beforeBlock =
                blocks[Math.min(index! + 1, block.length - 1)];
              const beforeTimestamp = Date.parse(beforeBlock.timestamp);
              const nowTimestamp = Date.parse(block.timestamp);
              return <>{(nowTimestamp - beforeTimestamp) / 1000}</>;
            },
          };
          return (
            <>
              <SummaryCards blocks={blocks} />
              <OffsetSwitch
                olderHandler={olderHandler}
                newerHandler={newerHandler}
                disable={{ older: loading || offset < 1, newer: loading }}
              />
              <BlockList blocks={blocks} loading={loading} columns={columns} />
            </>
          );
        }}
      </BlockListComponent>
    </main>
  );
};

export default ListPage;

export interface SummaryCardsProps {
  blocks: Block[] | null;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ blocks }) => {
  if (blocks === null)
    return <Cards interval={0} difficulty={0} totalTxNumber={0} />;

  const timestamps: Date[] = blocks.map(block => new Date(block.timestamp));

  let interval = 0;
  for (let i = 0; i < timestamps.length - 1; i++) {
    interval += +timestamps[i] - +timestamps[i + 1];
  }
  interval /= (timestamps.length - 1) * 1000;

  const difficulties = blocks.map(block => block.difficulty);
  const difficulty =
    difficulties.reduce((d, sum) => d + sum, 0) / difficulties.length;

  const txNumbers = blocks.map(block => block!.transactions.length);
  const totalTxNumber = txNumbers.reduce((a, b) => a + b, 0);
  return (
    <Cards
      interval={interval}
      difficulty={difficulty}
      totalTxNumber={totalTxNumber}
    />
  );
};

interface CardsProps {
  interval: number;
  difficulty: number;
  totalTxNumber: number;
}

const Cards: React.FC<CardsProps> = ({
  interval,
  difficulty,
  totalTxNumber,
}) => (
  <div className="cards">
    <div className="card" key="interval">
      <strong>{interval}</strong> sec
      <p>Average interval in this page</p>
    </div>
    <div className="card" key="difficulty">
      <strong>{Math.floor(difficulty).toLocaleString()}</strong>
      <p>Average difficulty in this page</p>
    </div>
    <div className="card" key="total-tx-number">
      <strong>{Math.floor(totalTxNumber).toLocaleString()}</strong>
      <p>Total txs in this page</p>
    </div>
  </div>
);
