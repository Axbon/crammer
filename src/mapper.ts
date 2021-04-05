import { ParamMapping, QueryParam } from './types';

export const toValueArray = (
	mapping: ParamMapping[],
	params: Record<string, QueryParam>
): Array<string | number | boolean> => {
	return mapping.map((p) => {
		const { name } = p;
		return params[name];
	});
};
