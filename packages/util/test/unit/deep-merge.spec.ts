import { expect } from 'chai';

import { deepMerge } from '../../src/deep-merge.js';

interface Foo {
  foo?: string | undefined;
  baz?: number;
  child?: Foo;
  qux?: string[];
}

describe(deepMerge.name, () => {
  it('should merge overrides into the target object', () => {
    // Arrange
    const foo: Foo = { foo: 'bar' };
    const baz = { baz: 42 };

    // Act
    deepMerge(foo, baz);

    // Assert
    expect(foo).deep.eq({ foo: 'bar', baz: 42 });
  });

  it('should deep merge overrides into the target object', () => {
    // Arrange
    const foo: Foo = { child: { foo: 'child' } };
    const baz = { child: { baz: 42 } };

    // Act
    deepMerge(foo, baz);

    // Assert
    const expected: Foo = { child: { foo: 'child', baz: 42 } };
    expect(foo).deep.eq(expected);
  });

  it('should override arrays without merging them', () => {
    // Arrange
    const foo: Foo = { qux: ['1', '2'] };
    const baz = { qux: ['3'] };

    // Act
    deepMerge(foo, baz);

    // Assert
    const expected: Foo = { qux: ['3'] };
    expect(foo).deep.eq(expected);
  });

  it('should not override with `undefined`', () => {
    // Arrange
    const foo: Foo = { foo: '1' };
    const baz = { foo: undefined };

    // Act
    deepMerge(foo, baz);

    // Assert
    const expected: Foo = { foo: '1' };
    expect(foo).deep.eq(expected);
  });

  it('should prevent prototype pollution', () => {
    // Arrange
    const someObj = {};

    // Act
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    deepMerge(someObj, JSON.parse('{"__proto__":{"pollutedKey":123}}'));

    // Assert
    // @ts-expect-error This polluted key shouldn't be there, that's the point
    expect({}.__proto__.pollutedKey).undefined;
  });
});
