import cn from 'classnames';

type Props = {
  errorMessage: string;
  onErrorMessageHide: (newErrorMessage: string) => void;
};

export const ErrorNotification = ({
  errorMessage,
  onErrorMessageHide,
}: Props) => {
  return (
    <div
      data-cy="ErrorNotification"
      className={cn('notification is-danger is-light has-text-weight-normal', {
        hidden: !errorMessage,
      })}
    >
      <button
        data-cy="HideErrorButton"
        type="button"
        className="delete"
        onClick={() => onErrorMessageHide('')}
      />
      {errorMessage}
    </div>
  );
};
