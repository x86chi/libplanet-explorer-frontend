import { useState } from 'react';

import useSearchParams from './useSearchParams';

export const limit = 21;
export default function useOffset(location: Location, keyName = 'offset') {
  const [searchParams, setSearchParams] = useSearchParams(location);
  const { offset = 0 } = searchParams;
  const setOffset = (offset: number) => {
    if (offset < 1) {
      const newSearchParams = { ...searchParams };
      delete newSearchParams[keyName];
      setSearchParams(newSearchParams);
    } else {
      searchParams[keyName] = offset;
      setSearchParams(searchParams);
    }
  };
  const olderHandler = () => {
    setOffset(+offset + limit);
  };
  const newerHandler = () => {
    setOffset(+offset - limit);
  };
  return [offset, olderHandler, newerHandler] as const;
}
