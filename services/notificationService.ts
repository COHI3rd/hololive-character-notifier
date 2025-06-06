
import { Character } from '../types';

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support desktop notification');
    return 'denied';
  }
  return Notification.requestPermission();
};

export const showNotification = (character: Character, message: string): void => {
  if (!('Notification' in window)) {
    alert('This browser does not support desktop notification. Message: ' + message);
    return;
  }

  if (Notification.permission === 'granted') {
    const notification = new Notification(`${character.name}からのメッセージ`, {
      body: message,
      icon: character.iconUrl,
      silent: false, // Consider making this configurable
    });
    // As per requirement, clicking notification does nothing to the app window.
    notification.onclick = () => {
      // User might want to focus the tab if clicked, but requirement says no.
      // window.focus(); // Optional: focus the app tab
      // notification.close(); // Optional: close notification on click
    };
  } else if (Notification.permission === 'denied') {
    console.warn('Notification permission denied by user.');
  } else {
    // Permission 'default', user hasn't decided.
    // May prompt again or wait. For now, log.
    console.info('Notification permission not yet granted or denied.');
  }
};
