const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'seedDatabaseIfNeeded(); // Do not await, let it run in background so server can start',
  'if (!process.env.NETLIFY && !process.env.AWS_LAMBDA_FUNCTION_NAME) {\n    seedDatabaseIfNeeded();\n  }'
);

fs.writeFileSync('server.ts', code);
