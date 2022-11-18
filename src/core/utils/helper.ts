/**
 * @internal
 * @module Helpers
 */
import { ParamObject } from './meta';

/**
 * Removes empty properties of an object.
 *
 * @param obj Object to remove empty properties from.
 * @return {*} Same object instance without empty properties.
 */
export const removeNullishObjectProperties = (obj: ParamObject) => {
  Object.keys(obj).forEach((key) => (obj[key] === undefined || (obj[key] === null) ? delete obj[key] : undefined));
  return obj;
};
