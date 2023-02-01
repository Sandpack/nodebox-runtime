/**
 * @typedef { typeof import("../../packages/nodebox").Nodebox } Nodebox
 * @type {Nodebox} */
const Nodebox = window.Nodebox;

/**
 * @param {string} emulatorUrl
 */
window.runExample = async function (emulatorUrl) {
  const emulator = new Nodebox({
    runtimeUrl: emulatorUrl,
    iframe: document.getElementById('frame'),
  });

  await emulator.connect();

  // Initialize the file system with a Vite project.
  await emulator.fs.init({
    '/package.json': JSON.stringify({
      dependencies: {
        '@apollo/server': '4.1.1',
        graphql: '16.6.0',
      },
    }),
    '/index.js': `import { ApolloServer } from "@apollo/server";
      import { startStandaloneServer } from "@apollo/server/standalone";
      
      // The GraphQL schema
      const typeDefs = \`#graphql
        type Query {
          hello: String
        }
      \`;
      
      // A map of functions which return data for the schema.
      const resolvers = {
        Query: {
          hello: () => "world",
        },
      };
      
      const server = new ApolloServer({
        typeDefs,
        resolvers,
      });
        
      const { url } = await startStandaloneServer(server, {
        listen: { port: 3000 },
      });
        
      console.log(\`🚀 Server ready at \${url}\`);
      `,
  });

  // Run the Vite app.
  const shellProcess = emulator.shell.create();
  const shellInfo = await shellProcess.runCommand('node', ['index.js']);
  shellProcess.on('exit', (...data) => console.error('Process exited:', ...data));
  return shellInfo;
};
