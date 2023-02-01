# Nodebox

Nodebox is a runtime for executing Node.js modules in the browser.

## Why we built Nodebox

With `sandpack-bundler`, we allowed any developer anywhere to instantly create a fast, local, shareable playground inside their browser, without having to wait forever to install dependencies and fight with devtools. This improves the learning, experimentation and sharing experience of client-side JavaScript code.

However, server-side JavaScript remained a challenge. At CodeSandbox we have solved this by using [Firecracker VMs](https://codesandbox.io/blog/how-we-clone-a-running-vm-in-2-seconds), allowing us to bring your entire development environment to the cloud regardless of the programming language or tooling you might be using. Unfortunately, as VMs live in the cloud, they require infrastructure and a network connection, resulting in a higher cost compared to our client-side sandboxes.

To solve this problem, we built Nodebox, a runtime that runs entirely in the browser, eliminating the need for a network connection and infrastructure.

Nodebox gives you the same user experience you have come to expect from Sandpack, which means a near-instant server-side JavaScript environment at the click of a button—built for experimentation, examples and documentation.

## The differences between a VM and Nodebox

As mentioned in the previous section, we solved server-side sandboxes in CodeSandbox by using Firecracker VMs. In this section, we'll explain the advantages and disadvantages of each approach.

### Advantages of VMs over Nodebox

- You get dedicated resources, with no resource limits enforced by the browser
- You have an entire Unix OS available
- You can run any language, database, command
- You can use network sockets
- You can run large and complex projects
- A perfect 1:1 environment as compared to your local setup (at least, if you're using a Unix-based system)
- No emulation, so Node.js would run exactly the same way as locally

### Advantages of Nodebox

- No need for any infrastructure
- No need for a network connection
- Instant feedback to any change
- Easy to get started
- Easy and instant reset - simply refresh the page/iframe
- Every page visitor gets their own Nodebox instance automatically

## What makes it different

Nodebox is currently the only cross-browser Node.js runtime supporting all the latest browsers:

- Chrome;
- Firefox;
- Safari *

> * Support for iOS Safari is in beta

Nodebox does not emulate Node.js but is, instead, a Node.js-compatible runtime. This means that it implements as much of the Node.js API as possible while keeping a minimal performance imprint, using browser API where applicable and, in some cases, leaving out certain parts of Node.js due to browser [limitations](#Limitations) or complexity.

Nodebox uses an internal dependency manager that is fine-tuned to deliver optimal initial load time by utilizing dependency caching via [Sandpack CDN](https://github.com/codesandbox/sandpack-cdn). That CDN is an open-source Rust package manager that runs in the cloud and can be self-hosted pretty easily as well.

While there are alternatives to Nodebox, they are closer to mimicking a container-based environment, running commands step-by-step, or even the entire Linux distributive in your browser. That makes them slower and harder to use compared to Nodebox, which is optimized to run sandboxes fast and with as little friction as possible.

## Limitations

Unfortunately, any type of runtime that does not have access to operating system-level APIs will come with certain limitations. For Nodebox, those are the following:

- N-API modules
- net#Sockets pointing to external IPs
- Synchronous exec/spawn
- async_hooks (planned for implementation)
- Automatic process exiting - users now need to manually call `process.exit` before the process is exited (planned for implementation)

As we implement every module manually one by one, it is possible that some will not behave correctly. If this happens, feel free to open an issue here on GitHub and we'll make sure to fix it.

## Documentation

- [**Getting started**](#getting-started)
- [API documentation](./api.md)

---

## Getting started

### Install

```sh
npm install @codesandbox/nodebox
```

### Configure and connect

To set up Nodebox, we have to provide a reference to an `<iframe>` element where the application's preview will be rendered.

```js
import { Nodebox } from '@codesandbox/nodebox';

const emulator = new Nodebox({
  iframe: document.getElementById('preview'),
});

await emulator.connect();
```

### Initialize file system

Next, populate the emulator's file system with your project files.

In this example, we will be running a simple HTTP server written in the `index.js` module.

```js
await emulator.fs.init({
  'package.json': JSON.stringify({
    name: 'my-app',
  }),
  'index.js': `
import http from 'http'

const server = http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/plain'
  })
  res.write('Hello world')
  res.end()
})

server.listen(3000, () => {
  console.log('Server is ready!')
})
  `,
});
```

> You can reference built-in Node.js modules, as well as external dependencies while writing your project files.

### Run project

To run our project, we need to execute the `index.js` module. Let's create a new shell and execute it there:

```js
const shell = emulator.shell.create();
await shell.runCommand('node', ['index.js']);
```

> You can use the same `shell` to control the process it's running (e.g., observe its `stdout`/`stderr`, terminate or restart it).

Nodebox will evaluate the `index.js` module, and since it spawns a server process at port `3000`, it will automatically open a new preview at that port. The preview will appear in the iframe provided during the Nodebox setup and it will be directly available at `https://{projectId}-3000.nodebox-runtime.codesandbox.io`.

![](./preview.png)

**Not a single server was spawned while running this application**. Everything was managed by Nodebox directly in the browser 🎉