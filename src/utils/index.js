import qs from "qs";

// 拼接参数
export const concatQueryParams = (url, params = {}) => {
  return `${url}?${qs.stringify(params)}`;
};
