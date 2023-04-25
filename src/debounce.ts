export const debounce = (func: any, delay: number, leading: boolean = false) => {
  let timerId;

  return (...args) => {
    if (!timerId && leading) {
      func(...args);
    }
    clearTimeout(timerId);

    timerId = setTimeout(() => func(...args), delay);
  };
};
