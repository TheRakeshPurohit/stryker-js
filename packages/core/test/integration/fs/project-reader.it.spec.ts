import { factory, testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import { coreTokens } from '../../../src/di/index.js';
import { FileSystem, ProjectReader } from '../../../src/fs/index.js';
import { resolveFromRoot } from '../../helpers/test-utils.js';

const resolveTestResource = resolveFromRoot.bind(
  undefined,
  'testResources',
  'input-files',
);

describe(`${ProjectReader.name} integration`, () => {
  let sut: ProjectReader;
  let originalCwd: string;

  beforeEach(() => {
    originalCwd = process.cwd();
    sut = testInjector.injector
      .provideClass(coreTokens.fs, FileSystem)
      .provideValue(coreTokens.reporter, factory.reporter())
      .injectClass(ProjectReader);
  });

  afterEach(() => {
    process.chdir(originalCwd);
  });

  it('should resolve reasonable project source files to be mutated by default', async () => {
    process.chdir(resolveTestResource());
    const project = await sut.read();
    expect([...project.filesToMutate.keys()]).deep.eq([
      resolveTestResource('lib', 'string-utils.js'),
      resolveTestResource('src', 'app.ts'),
      resolveTestResource(
        'src',
        'components',
        'calculator',
        'calculator.component.tsx',
      ),
      resolveTestResource(
        'src',
        'components',
        'heading',
        'heading.component.vue',
      ),
      resolveTestResource('src', 'index.html'),
      resolveTestResource('src', 'services', 'storage.ts'),
      resolveTestResource('src', 'services', 'test.ts'),
      resolveTestResource('src', 'utils', 'commonjs.cjs'),
      resolveTestResource('src', 'utils', 'esm.mjs'),
    ]);
  });

  it('should be able to read files from disk', async () => {
    // Arrange
    process.chdir(resolveTestResource());
    const project = await sut.read();

    // Act
    const content = await project.files
      .get(resolveTestResource('lib', 'string-utils.js'))
      ?.readContent();

    // Assert
    expect(content).eq(stringConcatSnapshot);
  });
});

const stringConcatSnapshot = `export function concat(a, b) {
  return \`\${a}\${b}\`;
}
`;
