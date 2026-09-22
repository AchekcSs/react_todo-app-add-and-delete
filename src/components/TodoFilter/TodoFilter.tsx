import cn from 'classnames';

import { FilterBy } from '../../types/Filter';

type Props = {
  filterBy: FilterBy;
  onFilterSelect: (newFilterBy: FilterBy) => void;
};

export const TodoFilter = ({ filterBy, onFilterSelect }: Props) => {
  return (
    <nav className="filter" data-cy="Filter">
      <a
        href="#/"
        className={cn('filter__link', {
          selected: filterBy === 'all',
        })}
        data-cy="FilterLinkAll"
        onClick={() => onFilterSelect('all')}
      >
        All
      </a>
      <a
        href="#/active"
        className={cn('filter__link', {
          selected: filterBy === 'active',
        })}
        data-cy="FilterLinkActive"
        onClick={() => onFilterSelect('active')}
      >
        Active
      </a>
      <a
        href="#/completed"
        className={cn('filter__link', {
          selected: filterBy === 'completed',
        })}
        data-cy="FilterLinkCompleted"
        onClick={() => onFilterSelect('completed')}
      >
        Completed
      </a>
    </nav>
  );
};
