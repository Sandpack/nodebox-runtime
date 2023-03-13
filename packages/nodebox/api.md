# API

- [Class: `Nodebox`](#class-nodebox)
  - [`new Nodebox(options)`](#new-nodeboxurl-options)
  - [`nodebox.connect()`](#nodeboxconnect)
  - [`nodebox.fs`](#nodeboxfs)
  - [`nodebox.shell`](#nodeboxshell)
- [File system API](#file-system-api)
  - [`fs.init()`](#nodeboxfsinitfiles)
  - [`fs.readFile(path[, encoding])`](#nodeboxfsreadfilepath-encoding)
  - [`fs.writeFile(path[, content[, options]])`](#nodeboxfswritefilepath-content-options)
  - [`fs.mkdir(path[, options])`](#nodeboxfsmkdirpath-options)
  - [`fs.readdir(path)`](#nodeboxfsreaddirpath)
  - [`fs.stat(path)`](#nodeboxfsstatpath)
  - [`fs.rm(path[, options])`](#nodeboxfsrmpath-options)
  - [`fs.watch(glob, listener)`](#nodeboxfswatchglob-listener)
- [Shell API](#shell-api)
  - [`shell.create()`](#nodeboxshellcreate)
- [Class: `Shell`](#class-shell)
  - [`shell.runCommand(binary, args[, options])`](#shellruncommandbinary-args-options)
  - [`shell.on(event, listener)`](#shellonevent-listener)
  - [`shell.stdout.on(event, listener)`](#shellstdoutonevent-listener)
  - [`shell.stderr.on(event, listener)`](#shellstderronevent-listener)
  - [`shell.stdin.write(data)`](#shellstdinwritedata)
  - [`shell.kill()`](#shellkill)
- [Preview API](#preview-api)
  - [`preview.getByShellId(shellId[, timeout])`](#previewgetbyshellidshellid-timeout)
  - [`preview.waitForPort(port[, timeout])`](#previewwaitforportport-timeout)

## Class: `Nodebox`

A `Nodebox` is an interface to create and interact with a runtime evaluation context. It's responsible for attaching a _bridge frame_ and orchestrating events between the bridge and the _preview_ frames.

Nodebox connects to the provided deployed Nodebox runtime.

The `Nodebox` interface is available directly from the `@codesandbox/nodebox` package:

```js
import { Nodebox } from '@codesandbox/nodebox';
```

### `new Nodebox(options)`

- `options` `<Object>`
  - `runtimeUrl` `<string>` An absolute URL to the deployed Nodebox runtime.
  - `frame` `<HTMLFrameElement>` Reference to the `<iframe>` element on the page where the Nodebox should be mounted.

```js
import { Nodebox } from '@codesandbox/nodebox';

const nodebox = new Nodebox({
  iframe: document.getElementById('preview'),
});
```

### `nodebox.connect()`

Returns a Promise that resolves when a connection to the deployed Nodebox instance is established.

The connection must be awaited before operating with the Nodebox instance (e.g. writing files or creating shells).

```js
nodebox.connect().then(() => {
  console.log('Nodebox is ready!');
});
```

### `nodebox.fs`

A reference to the [File system API](#file-system-api).

```js
await nodebox.fs.init({
  'file.js': `console.log('Hello world')`,
});
```

### `nodebox.shell`

A reference to the [Shell API](#shell-api).

```js
const shell = nodebox.shell.create();
```

## File system API

### `nodebox.fs.init(files)`

- `files` `<Object>` A record of files and their content to write.
- Returns: `<Promise>` Fulfills when all the specified files are successfully written.

Writes given files to the in-memory file system managed by Nodebox.

```js
await nodebox.fs.init({
  'index.js': `
import { greet } from './greet'

greet('Hello world')
  `,

  'greet.js': `
export function greet(message) {
  console.log(message)
}
  `,
});
```

### `nodebox.fs.readFile(path[, encoding])`

- `path` `<string>`
- `encoding` `<string | BufferEncoding>`
- Returns: `<Promise>` Fulfills to either a `string` or `Uint8Array` depending on the `encoding` provided.

```js
const content = await nodebox.fs.readFile('./index.js', 'utf8');
// "console.log('Hello world')
```

### `nodebox.fs.writeFile(path[, content[, options]])`

- `path` `<string>`
- `content` `<string | Uint8Array>`
- `options` `<string | { encoding?: string, recursive?: boolean }>`
- Returns: `<Promise>` Fulfills when the file content is successfully written.

```js
await nodebox.fs.writeFile('./util.js', '');
```

### `nodebox.fs.mkdir(path[, options])`

- `path` `<string>`
- `options` `<{ recursive?: boolean }>`
- Returns: `<Promise>` Fulfills when the directory is successfully created.

```js
await nodebox.fs.mkdir('./a/b/c', { recursive: true });
```

### `nodebox.fs.readdir(path)`

- `path` `<string>`
- Returns: `<Promise<string[]>>` Fulfills with a list of files in the directory.

```js
await nodebox.fs.readdir('./a/b/c');
```

### `nodebox.fs.stat(path)`

- `path` `<string>`
- Returns: `<Promise<FileStats>>` Fulfills with the stats of the provided file.

```js
await nodebox.fs.stat('./index.js');
```

### `nodebox.fs.rm(path[, options])`

- `path` `<string>`
- `options` `<Object | undefined>`
  - `recursive` `<boolean | undefined>` remove all nested files/directories as well
  - `force` `<boolean | undefined>` don't throw if file/directory does not exist
- Returns: `<Promise<void>>` Fulfills with the stats of the provided file.

```js
await nodebox.fs.rm('./index.js', { recursive: true, force: true });
```

### `nodebox.fs.watch(glob, listener)`

- `glob` `<string>` A glob pattern of the files to watch.
- `listener` `<Function>` A listener to react to file watch events.
  - `event` `<FileWatchEvent>`
- Returns: `<Promise>` Fulfills to the control object with the following properties:
  - `dispose()` Removes the glob listener and stops watching the files.

Using the `listener` function, you can handle the following file watch events:

- `create`
  - `path` `<string>`
- `change`
  - `path` `<string>`
- `rename`
  - `newPath` `<string>`
  - `oldPath` `<string>`
- `remove`
  - `path` `<string>`

```js
// Watch all JavaScript files in the project.
const watcher = nodebox.fs.watch('**/*.js', (event) => {
  if (event.type === 'create') {
    console.log('A new file created!', event.path);
  }
});

// Stop watching the files.
watcher.dispose();
```

## Shell API

### `nodebox.shell.create()`

- Returns: `<Object>` A [Shell](#class-shell) instance.

Creates a new shell instance. Shell is used to run commands and control their execution.

```js
const shell = nodebox.shell.create();
```

## Class: `Shell`

### `shell.runCommand(binary, args[, options])`

- `binary` `<string>` Global name or a path to the binary.
- `args` `<Array>` List of arguments to pass to the commands.
- `options` `<Object>`
  - `cwd` `<string>` Path to use as the current working directory.
  - `env` `<Object>`

```js
await nodebox.fs.init({
  'index.js': `console.log(process.env.DB_URL)`,
});

const shell = nodebox.shell.create();
await shell.runCommand('node', ['index.js'], {
  env: {
    DB_URL: 'https://example.com',
  },
});
```

### `shell.on(event, listener)`

- `event` `<string>` Event type to listen to.
- `listener` `Function`

You can listen to the following events:

- `progress`
  - `status` `<WorkerStatusUpdate>`
- `exit`
  - `exitCode` `<number>`

```js
shell.on('exit', (exitCode) => {
  console.log(exitCode);
});
```

### `shell.stdout.on(event, listener)`

- `event` `<string>`
- `listener` `<Function>`

```js
shell.stdout.on('data', (data) => {
  console.log('Output:', data);
});
```

### `shell.stderr.on(event, listener)`

- `event` `<string>`
- `listener` `<Function>`

```js
shell.stderr.on('data', (data) => {
  console.log('Error:', data);
});
```

### `shell.stdin.write(data)`

- `data` `<string | Uint8Array>`

```js
shellProcess.stdin.write(data);
```

### `shell.kill()`

- Returns: `<Promise>` Fulfills when the shell successfully exits.

## Preview API

### `preview.getByShellId(shellId[, timeout])`

- `shellId` `<string>`
- `timeout` `<number>` Duration of the timeout window. _Default:_ `10_000` milliseconds.
- Returns: `<PreviewInfo>`

Get a preview info object for the preview opened by the given shell. If there's no preview found by the given shell within the `timeout` period, the function throws.

```ts
const previewInfo = await nodebox.preview.getByShellId('cjld2cjxh0000qzrmn831i7rn');
// {
//   "url": "https://t3rmni-3000.preview.csb.app/",
//   "sourceShellId": "cjld2cjxh0000qzrmn831i7rn",
//   "port": 3000
// }
```

### `preview.waitForPort(port[, timeout])`

- `port` `<number>`
- `timeout` `<number>` Duration of the timeout window. _Default:_ `10_000` milliseconds.
- Returns: `<Promise>` Fulfills with the preview info object.

Get a preview info object for the preview at the given port. If there's no preview found open at the given port within the `timeout` window, the function throws.

```js
const shell = await nodebox.shell.create();
await shell.runCommand('node', ['start:docs']);

// Await a preview at the specific port.
const previewInfo = await nodebox.preview.waitForPort(3004);
console.log(previewInfo);
// {
//   "url": "https://t3rmni-3004.preview.csb.app/",
//   "sourceShellId": "cjld2cjxh0000qzrmn831i7rn",
//   "port": 3004
// }
```
