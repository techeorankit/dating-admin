import createWebStorage from 'redux-persist/lib/storage/createWebStorage';

// localStorage is only available in the browser, never during server rendering.
const storage = typeof window !== 'undefined'
  ? createWebStorage('local')
  : {
      getItem: async () => null,
      setItem: async (_key, value) => value,
      removeItem: async () => {},
    };

export default storage;
