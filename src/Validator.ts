import { Category, Distance } from "./type/restaurant";

const Validator = {
  isEmptyInput(input: string) {
    return input.length === 0;
  },

  isCorrectLink(link: string) {
    const urlRegex: RegExp = /^https?:\/\/(\w+\.)+[a-z0-9]{2,4}(\/\w*)*$/i;
    return urlRegex.test(link);
  },
};

export default Validator;
