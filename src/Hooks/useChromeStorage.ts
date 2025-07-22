export const useChromeStorage = () => {
  return {
    get: (key: string) => {
      return new Promise((resolve) => {
        chrome.storage.local.get(key, (result) => {
          resolve(result[key]);
        });
      });
    },
    set: (key: string, value: any) => {
      return new Promise((resolve) => {
        chrome.storage.local.set({ [key]: value }, () => {
          resolve(true);
        });
      });
    },
  };
};
