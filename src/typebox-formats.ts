import { FormatRegistry } from '@sinclair/typebox';

FormatRegistry.Set('json', (value: string) => {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
});