/**
 * @internal
 * @module Helpers
 */
import { EcomInvalidParameterError } from '../api/errors';
import { ParamObject } from './meta';

/**
 * Removes empty properties of an object.
 *
 * @param obj Object to remove empty properties from.
 * @return {*} Same object instance without empty properties.
 */
export const removeNullishObjectProperties = (obj: ParamObject) => {
  Object.keys(obj).forEach((key) => (obj[key] === undefined || obj[key] === null ? delete obj[key] : undefined));
  return obj;
};

/**
 * Checks whether the given value is not undefined.
 *
 * @export
 * @param value Value to check.
 * @param [message] Message to throw.
 * @return {*} Whether the value is not undefined.
 */
export function isDefined(value: unknown, message?: string): asserts value is NonNullable<unknown> | null {
  if (typeof value === 'undefined') throw new EcomInvalidParameterError(message ?? 'Value is undefined');
}

/**
 * Checks whether the given value is non-nullable, i.e. neither undefined nor null.
 *
 * @export
 * @param value Value to check.
 * @param [message] Message to throw.
 * @return {*} Whether the value is any other than null or undefined.
 */
export function isNonNullable(value: unknown, message?: string): asserts value is NonNullable<unknown> {
  if (typeof value === 'undefined' || value === null) throw new EcomInvalidParameterError(message ?? 'Non-nullable value was null / undefined');
}
