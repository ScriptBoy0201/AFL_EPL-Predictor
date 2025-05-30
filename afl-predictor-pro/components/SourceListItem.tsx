import React from 'react';
import { GroundingSource } from '../types';

interface SourceListItemProps {
  source: GroundingSource;
}

const SourceListItem: React.FC<SourceListItemProps> = ({ source }) => {
  return (
    <li className="mb-1">
      <a
        href={source.uri}
        target="_blank"
        rel="noopener noreferrer"
        title={source.title}
        className="text-sky-400 hover:text-sky-300 hover:underline truncate transition-colors duration-150 text-sm"
      >
        {source.title || source.uri}
      </a>
    </li>
  );
};

export default SourceListItem;
