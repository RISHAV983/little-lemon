// Jest (CRA 5 / jsdom) test setup.
// react-router 7 expects TextEncoder/TextDecoder, which jsdom does not provide.
// Node's own implementations are used, so no extra dependency is needed.
import { TextDecoder, TextEncoder } from "util";

Object.assign(global, { TextDecoder, TextEncoder });
