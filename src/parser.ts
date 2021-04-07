import { SqlParseResult, ParserState, ParamMapping } from './types';

const Token = {
  COLON: ':',
  BACK_SLASH: '\\',
  FORWARD_SLASH: '/',
  SINGLE_QUOTE: "'",
  DASH: '-',
  STAR: '*',
  NEW_LINE: '\n',
  DOLLAR: '$',
  DOUBLE_QUOTE: '"',
};

const IdentRegex = /\w|\./;
const IdentStartRegex = /[a-zA-Z_]/;

export const parse = (sql: string): SqlParseResult => {
  let state: ParserState = { key: 'query' };
  const param_mapping: ParamMapping[] = [];
  let result = '';

  const pushParam = () => {
    if (state.key === 'consuming-ident') {
      if (!param_mapping.find((m) => m.name === state.data)) {
        const next_index = param_mapping.length + 1;
        param_mapping.push({ name: state.data, index: next_index });
      }
      const { index } = param_mapping.find((m) => m.name === state.data) ?? {
        index: null,
      };
      if (index) {
        result += `$${index}`;
      }
    }
  };

  const text_length = sql.length;

  for (let i = 0; i < text_length; i++) {
    const ctx = { current: sql[i], previous: sql[i - 1], next: sql[i + 1] };

    switch (state.key) {
      case 'query':
        if (
          ctx.current === Token.COLON &&
          ctx.previous != Token.COLON &&
          IdentStartRegex.test(ctx.next)
        ) {
          state = { key: 'consuming-ident', data: '' };
        } else if (
          ctx.current === Token.SINGLE_QUOTE &&
          ctx.previous !== Token.BACK_SLASH
        ) {
          result += ctx.current;
          state = { key: 'string-constant' };
        } else if (ctx.current === Token.DASH && ctx.next === Token.DASH) {
          result += ctx.current + ctx.next;
          state = { key: 'skip-next', data: { key: 'line-comment' } };
        } else if (
          ctx.current === Token.FORWARD_SLASH &&
          ctx.next === Token.STAR
        ) {
          result += ctx.current + ctx.next;
          state = { key: 'skip-next', data: { key: 'block-comment', data: 1 } };
        } else if (
          ctx.current === Token.DOLLAR &&
          ctx.previous === Token.DOLLAR
        ) {
          result += ctx.current;
          state = { key: 'dollar-quote-literal' };
        } else if (ctx.current === Token.DOUBLE_QUOTE) {
          result += ctx.current;
          state = { key: 'quoted-ident' };
        } else {
          result += ctx.current;
        }
        break;
      case 'block-comment':
        result += ctx.current;

        if (
          ctx.previous === Token.STAR &&
          ctx.current === Token.FORWARD_SLASH
        ) {
          if (state.data - 1 === 0) {
            state = { key: 'query' };
          } else {
            state = { ...state, data: state.data - 1 };
          }
        }
        break;
      case 'line-comment':
        result += ctx.current;

        if (ctx.current === Token.NEW_LINE) {
          state = { key: 'query' };
        }
        break;
      case 'string-constant':
        result += ctx.current;

        if (
          ctx.current === Token.SINGLE_QUOTE &&
          ctx.previous !== Token.BACK_SLASH
        ) {
          state = { key: 'query' };
        }
        break;
      case 'consuming-ident':
        if (IdentRegex.test(ctx.current)) {
          state = { ...state, data: state.data + ctx.current };
        } else {
          pushParam();
          result += ctx.current;
          state = { key: 'query' };
        }
        break;
      case 'dollar-quote-literal':
        result += ctx.current;

        if (ctx.current === Token.DOLLAR && ctx.previous === Token.DOLLAR) {
          state = { key: 'query' };
        }
        break;
      case 'quoted-ident':
        result += ctx.current;

        if (ctx.current === Token.DOUBLE_QUOTE) {
          state = { key: 'query' };
        }
        break;
      case 'skip-next':
        state = state.data;
        break;
      default: {
        const _exhaustive_check: never = state.key;
        return _exhaustive_check;
      }
    }
  }

  pushParam();

  return { sql: result, mapping: param_mapping };
};
