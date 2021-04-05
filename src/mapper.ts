import { ParamMapping, QueryParam } from './types';

export const toValueArray = (
	mapping: ParamMapping[],
	params: Record<string, QueryParam>
	/* Note: pg lib automatically converts 
     date instances to date/timestamp/timestamptz columns
     Further, it converts an object/array with JSON.stringify()
     since postgres supports json/jsonb, therefore we allow records/array

     This may have to be adjusted for mysql support
     */
): Array<string | number | boolean | Date | Record<any, any> | Array<any>> => {
	return mapping.map((p) => {
		const { name } = p;
		return params[name];
	});
};
