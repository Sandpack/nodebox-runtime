/**
 * @typedef { typeof import("../../packages/nodebox").Nodebox } Nodebox
 * @type {Nodebox} */
const Nodebox = window.Nodebox;

function loadJS(FILE_URL, async = true) {
  return new Promise((resolve) => {
    let scriptEle = document.createElement('script');

    scriptEle.setAttribute('src', FILE_URL);
    scriptEle.setAttribute('type', 'text/javascript');
    scriptEle.setAttribute('async', async);

    document.body.appendChild(scriptEle);

    // success event
    scriptEle.addEventListener('load', () => {
      resolve();
    });
    // error event
    scriptEle.addEventListener('error', (ev) => {
      console.log('Error on loading file', ev);
    });
  });
}

/**
 * @param {string} emulatorUrl
 */
window.runExample = async function (emulatorUrl) {
  const { Nodebox } = window;

  await loadJS('https://cdn.jsdelivr.net/npm/xterm@5.1.0/lib/xterm.min.js');

  let xtermStyle = document.createElement('link');
  xtermStyle.setAttribute('href', 'https://cdn.jsdelivr.net/npm/xterm@5.1.0/css/xterm.min.css');
  xtermStyle.setAttribute('rel', 'stylesheet');
  document.body.appendChild(xtermStyle);

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

  /**
   * Terminal
   */
  var term = new Terminal({
    convertEol: true,
    cursorBlink: false,
    disableStdin: false,
  });
  const terminal = document.createElement('div');
  document.body.appendChild(terminal);
  term.open(terminal);

  term.onData((data) => {
    console.log(data);
    shellProcess.stdin.write(data);
  });

  /**
   * In and out
   */
  shellProcess.stdout.on('data', (data) => {
    console.log({ data });
    term.write(data);
  });

  shellProcess.runCommand('node', ['index.js']);
};
