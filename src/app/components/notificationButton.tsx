import React from 'react'

type Props = {
  onClick?: () => void;
  hasUnread?: boolean;
};

const NotificationButton: React.FC<Props> = ({ onClick, hasUnread }) => {
  return (
    <button
      type="button"
      aria-label="Notifications"
      onClick={onClick}
      className="relative z-50 text-2xl leading-none select-none cursor-pointer"
    >
      <span role="img" aria-hidden>
        🔔
      </span>
      {hasUnread ? (
        <span className="absolute -top-0.5 -right-0.5 block h-2.5 w-2.5 rounded-full bg-red-500"></span>
      ) : null}
    </button>
  )
}

export default NotificationButton
