import React, { Children, useState } from 'react';
import { navigate } from 'gatsby-link';
import {
  Link,
  DetailsListLayoutMode,
  SelectionMode,
  DetailsList,
  Checkbox,
  IColumn,
} from '@fluentui/react';

import Wrapper from '../components/Wrapper';
import List, { BlockList, OmitListProps } from '../components/List';
import OffsetSwitch from '../components/OffsetSwitch';
import Timestamp from '../components/Timestamp';

import {
  Transaction,
  TransactionsByAccountComponent,
  Block,
  BlockListComponent,
} from '../generated/graphql';

import { IndexPageProps } from '../pages';

import useQueryString from '../misc/useQueryString';
import useOffset, { limit } from '../misc/useOffset';
import { mineColumns, txColumns } from '../misc/columns';

type AccountPageProps = IndexPageProps;

const AccountPage: React.FC<AccountPageProps> = ({ location }) => {
  const hash = useQueryString(location)[0].slice(0, 42);

  const [txOffset, txOlderHandler, txNewerHandler] = useOffset(location, 'tx');
  const [mineOffset, mineOlderHandler, mineNewerHandler] = useOffset(
    location,
    'mined_blocks'
  );
  const [excludeEmptyTxs, setExcludeEmptyTxs] = useState(false);
  return (
    <Wrapper>
      <h1>Account Details</h1>
      <p>
        Account Number: <b>{hash}</b>
      </p>

      <TransactionsByAccountComponent
        variables={{ offset: txOffset, limit, involvedAddress: hash }}>
        {({ data, loading, error }) => {
          if (loading) return <p>loading&hellip;</p>;
          if (error) {
            console.error(error);
            return <p>{error.message}</p>;
          }
          const { transactions } = data!.transactionQuery!;
          if (!transactions) {
            return <p>There are no transactions.</p>;
          }

          const signedTransactions: Transaction[] = [],
            involvedTransactions: Transaction[] = [];
          transactions.forEach(tx => {
            if (tx.signer === hash) {
              signedTransactions.push(tx);
            } else {
              involvedTransactions.push(tx);
            }
          });

          const missingNonces: number[] = [];
          for (let i = 1; i < signedTransactions.length; ++i) {
            const prevNonce = signedTransactions[i - 1].nonce;
            const nonce = signedTransactions[i].nonce;
            if (prevNonce === nonce - 1) continue;
            for (
              let missingNonce = prevNonce + 1;
              missingNonce < nonce;
              ++missingNonce
            ) {
              missingNonces.push(missingNonce);
            }
          }

          const numOfSigned = signedTransactions.length;
          const numOfInvolved = involvedTransactions.length;
          const numOfMissingNonces = missingNonces.length;

          return (
            <>
              <OffsetSwitch
                olderHandler={txOlderHandler}
                newerHandler={txNewerHandler}
                disable={{ older: loading || txOffset < 1, newer: loading }}
              />
              <h2>Signed Transactions: {numOfSigned}</h2>
              {numOfSigned > 0 ? (
                <TransactionList
                  loading={loading}
                  items={loading ? null : (signedTransactions as Transaction[])}
                />
              ) : (
                <div>No transactions of this type</div>
              )}
              <h2>Involved Transactions: {numOfInvolved}</h2>
              {numOfInvolved ? (
                <TransactionList
                  loading={loading}
                  items={
                    loading ? null : (involvedTransactions as Transaction[])
                  }
                />
              ) : (
                <div>No transactions of this type</div>
              )}
              <h2>Missing Nonces: {numOfMissingNonces}</h2>
              {numOfMissingNonces ? (
                missingNonces.map(nonce => <p>{nonce}</p>)
              ) : (
                <div>No missing nonces.</div>
              )}
            </>
          );
        }}
      </TransactionsByAccountComponent>
      <h2>Mined Blocks</h2>
      <BlockListComponent
        variables={{ offset: mineOffset, limit, excludeEmptyTxs, miner: hash }}>
        {({ data, loading, error }) => {
          if (error) {
            console.error(error);
            return <p>{error.message}</p>;
          }
          const blocks =
            data && data.blockQuery && data.blockQuery.blocks
              ? (data.blockQuery.blocks as Block[])
              : null;
          return (
            <>
              <Checkbox
                label="Include blocks having any tx"
                checked={excludeEmptyTxs}
                disabled={loading}
                onChange={() => {
                  setExcludeEmptyTxs(!excludeEmptyTxs);
                }}
              />
              <OffsetSwitch
                olderHandler={mineOlderHandler}
                newerHandler={mineNewerHandler}
                disable={{ older: loading, newer: loading || mineOffset < 1 }}
              />
              <BlockList
                items={blocks}
                loading={loading}
                columns={mineColumns}
              />
            </>
          );
        }}
      </BlockListComponent>
    </Wrapper>
  );
};

interface TransactionListProps extends Omit<OmitListProps, 'columns'> {
  items: Transaction[] | null;
}

export const TransactionList: React.FC<TransactionListProps> = props => (
  <List
    {...props}
    columns={txColumns}
    onItemInvoked={block => navigate(`/search/?${block.hash}`)}
  />
);

export default AccountPage;
