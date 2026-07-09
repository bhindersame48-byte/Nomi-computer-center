const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = `  seedDatabaseIfNeeded(); // Do not await, let it run in background so server can start

  // Integrates Vite production or development server
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(\`Nomi Computers Server is active on port \${PORT}\`);
  });
}

startServer();`;

const newStr = `  seedDatabaseIfNeeded(); // Do not await, let it run in background so server can start

async function startServer() {
  // Integrates Vite production or development server
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (!process.env.NETLIFY) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(\`Nomi Computers Server is active on port \${PORT}\`);
    });
  }
}

if (!process.env.NETLIFY) {
  startServer();
}
`;

if (code.includes('seedDatabaseIfNeeded();')) {
  // Find the index of seedDatabaseIfNeeded
  const index = code.indexOf('  seedDatabaseIfNeeded(); // Do not await');
  if (index !== -1) {
    code = code.substring(0, index) + newStr;
    fs.writeFileSync('server.ts', code);
    console.log('Fixed server.ts');
  } else {
    console.log('Could not find exact string to replace');
  }
} else {
  console.log('Could not find seedDatabaseIfNeeded');
}
