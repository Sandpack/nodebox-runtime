# API

- [Class: `Nodebox`](#class-nodebox)
  - [`new Nodebox(options)`](#new-nodeboxurl-options)
  - [`nodebox.connect()`](#nodeboxconnect)
- [File system API](#file-system-api)
  - [`fs.init()`](#fsinitfiles)
  - [`fs.readFile(path[, encoding])`](#fsreadfilepath-encoding)
  - [`fs.writeFile(path[, content[, encoding]])`](#fswritefilepath-content-encoding)
  - [`fs.watch(glob, listener)`](#fswatchglob-listener)
- [Shell API](#shell-api)
  - [`shell.create()`](#shellcreate)
- [Class: `Shell`](#class-shell)
  - [`shell.runCommand(binary, args[, options])`](#shellruncommandbinary-args-options)
  - [`shell.on(event, listener)`](#shellonevent-listener)
  - [`shell.stdout.on(event, listener)`](#shellstdoutonevent-listener)
  - [`shell.stderr.on(event, listener)`](#shellstderronevent-listener)
  - [`shell.kill()`](#shellkill)

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

### `nodebox.js`

A reference to the [File system API](#file-system-api).

```js
await nodebox.fs.init({
  'file.js': `console.log('Hello world')`,
});
```

## File system API

### `fs.init(files)`

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

### `fs.readFile(path[, encoding])`

- `path` `<string>`
- `encoding` `<string | BufferEncoding>`
- Returns: `<Promise>` Fulfills to either a `string` or `Uint8Array` depending on the `encoding` provided.

```js
const content = await nodebox.fs.readFile('./index.js', 'utf8');
// "console.log('Hello world')
```

### `fs.writeFile(path[, content[, encoding]])`

- `path` `<string>`
- `content` `<string | Uint8Array>`
- Returns: `<Promise>` Fulfills when the file content is successfully written.

```js
await nodebox.fs.writeFile('./util.js', '');
```

### `fs.watch(glob, listener)`

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

### `shell.create()`

- Returns: `<Object>` A [Shell](#class-shell) instance.

Creates a new shell instance. Shell is used to run commands and control their execution.

```js
const shell = nodebox.shell.create();
```

## Class: `Shell`

### `shell.runCommand(binary, args[, options])`

- `binary` `<string>` Global name or a path to the binary.
- `args` `<Array>` List of arguments to pass to the commands.
- `options` `<Object`>
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

### `shell.kill()`

- Returns: `<Promise>` Fulfills when the shell successfully exits.
