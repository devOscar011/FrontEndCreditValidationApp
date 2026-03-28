const listeners = new Set();

export const toast = {
  show(payload) {
    listeners.forEach((fn) => fn(payload));
  },
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};
