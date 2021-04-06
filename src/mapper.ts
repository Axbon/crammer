import { ParamMapping, QueryParam } from './types';

export const toValueArray = (
	mapping: ParamMapping[],
	params: Record<string, QueryParam>
	/* Note: pg lib automatically converts  date instances to date/timestamp/timestamptz columns.
     Further, it converts object/array with JSON.stringify()
     since postgres supports json/jsonb, therefore we allow records/array

     This may have to be adjusted for mysql support < 8.x
     */
): Array<QueryParam> => {
	return mapping.map((p) => {
		const { name } = p;
		return params[name];
	});
};
