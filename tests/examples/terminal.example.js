/**
 * @typedef { typeof import("../../packages/nodebox").Nodebox } Nodebox
 * @type {Nodebox} */
const Nodebox = window.Nodebox;

/**
 * @param {string} emulatorUrl
 */
window.runExample = async function (emulatorUrl) {
  const { Nodebox } = window;

  const emulator = new Nodebox({
    runtimeUrl: emulatorUrl,
    iframe: document.getElementById('frame'),
  });

  await emulator.connect();
  await emulator.fs.init({
    'package.json': JSON.stringify({ dependencies: { '@clack/prompts': 'latest' } }),
    'index.js': `import { text } from '@clack/prompts';

(async () => {
  const meaning = await text({
    message: 'What is the meaning of life?',
    placeholder: 'Not sure',
    initialValue: '42',
    validate(value) {
      if (value.length === 0) return \`Value is required!\`;
    },
  });
})();`,
  });

  const shellProcess = emulator.shell.create();

  shellProcess.runCommand('node', ['index.js']);
};
