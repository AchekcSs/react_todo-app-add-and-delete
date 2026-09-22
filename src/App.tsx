import React, { useEffect, useRef, useState } from 'react';
import cn from 'classnames';

import { createTodo, deleteTodo, getTodos, USER_ID } from './api/todos';

import { ErrorNotification } from './components/ErrorNotification';
import { Footer } from './components/Footer';
import { NewTodoForm } from './components/NewTodoForm';
import { TodoList } from './components/TodoList';

import type { FilterBy } from './types/Filter';
import type { TempTodo, Todo } from './types/Todo';

const ERROR_MESSAGE_DISAPPEARS_AFTER = 3000;

const getVisibleTodos = (todos: Todo[], filterBy: FilterBy) => {
  let visibleTodos = [...todos];

  switch (filterBy) {
    case 'active':
      visibleTodos = visibleTodos.filter(todo => !todo.completed);
      break;

    case 'completed':
      visibleTodos = visibleTodos.filter(todo => todo.completed);
      break;
  }

  return visibleTodos;
};

const validateQuery = (processedQuery: string) => {
  if (!processedQuery) {
    return 'Title should not be empty';
  }

  return '';
};

export const App = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [query, setQuery] = useState('');
  const [filterBy, setFilterBy] = useState<FilterBy>('all');

  const [tempTodo, setTempTodo] = useState<TempTodo | null>(null);
  const [deletingTodoIds, setDeletingTodoIds] = useState<Set<number>>(
    new Set(),
  );

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }

    setErrorMessage('');

    getTodos()
      .then(setTodos)
      .catch(() => setErrorMessage('Unable to load todos'));
  }, []);

  useEffect(() => {
    if (!errorMessage) {
      return;
    }

    const timer = setTimeout(() => {
      setErrorMessage('');
    }, ERROR_MESSAGE_DISAPPEARS_AFTER);

    return () => {
      clearTimeout(timer);
    };
  }, [errorMessage]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading]);

  const activeTodos = todos.filter(todo => !todo.completed);
  const completedTodos = todos.filter(todo => todo.completed);

  const visibleTodos = getVisibleTodos(todos, filterBy);

  const handleTodoDelete = (todoId: number) => {
    setDeletingTodoIds(prev => new Set(prev).add(todoId));

    deleteTodo(todoId)
      .then(() => {
        setTodos(prev => prev.filter(todo => todo.id !== todoId));

        if (inputRef.current) {
          inputRef.current.focus();
        }
      })
      .catch(() => setErrorMessage('Unable to delete a todo'))
      .finally(() => {
        setDeletingTodoIds(prev => {
          const next = new Set(prev);

          next.delete(todoId);

          return next;
        });
      });
  };

  const handleDeleteCompleted = () => {
    const completedIds = completedTodos.map(todo => todo.id);

    setDeletingTodoIds(prev => {
      const next = new Set(prev);

      completedIds.forEach(id => next.add(id));

      return next;
    });

    completedIds.forEach(id => {
      deleteTodo(id)
        .then(() => {
          setTodos(prev => prev.filter(todo => todo.id !== id));

          if (inputRef.current) {
            inputRef.current.focus();
          }
        })
        .catch(() => setErrorMessage('Unable to delete a todo'))
        .finally(() => {
          setDeletingTodoIds(prev => {
            const next = new Set(prev);

            next.delete(id);

            return next;
          });
        });
    });
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const processedQuery = query.trim();

    const newErrorMessage = validateQuery(processedQuery);

    setErrorMessage(newErrorMessage);

    if (newErrorMessage) {
      return;
    }

    const newTodoData = {
      userId: USER_ID,
      title: processedQuery,
      completed: false,
    };

    setIsLoading(true);
    setTempTodo({ id: 0, title: processedQuery });

    createTodo(newTodoData)
      .then(response => {
        setTodos(prev => [...prev, response]);
        setQuery('');
      })
      .catch(() => setErrorMessage('Unable to add a todo'))
      .finally(() => {
        setTempTodo(null);
        setIsLoading(false);
      });
  };

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <header className="todoapp__header">
          <button
            type="button"
            className={cn('todoapp__toggle-all', {
              active: todos.length === completedTodos.length,
            })}
            data-cy="ToggleAllButton"
          />

          <NewTodoForm
            onFormSubmit={handleFormSubmit}
            query={query}
            onQueryChange={setQuery}
            isLoading={isLoading}
            inputRef={inputRef}
          />
        </header>

        {todos.length > 0 && (
          <>
            <TodoList
              todos={visibleTodos}
              tempTodo={tempTodo}
              deletingTodoIds={deletingTodoIds}
              onTodoDelete={handleTodoDelete}
            />

            <Footer
              filterBy={filterBy}
              onFilterSelect={setFilterBy}
              activeTodos={activeTodos}
              completedTodos={completedTodos}
              onDeleteCompleted={handleDeleteCompleted}
            />
          </>
        )}
      </div>

      <ErrorNotification
        errorMessage={errorMessage}
        onErrorMessageHide={setErrorMessage}
      />
    </div>
  );
};
