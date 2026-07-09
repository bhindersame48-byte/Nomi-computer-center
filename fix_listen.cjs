const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'if (!process.env.NETLIFY) {',
  'if (!process.env.NETLIFY && !process.env.AWS_LAMBDA_FUNCTION_NAME) {'
);
code = code.replace(
  'if (!process.env.NETLIFY) {',
  'if (!process.env.NETLIFY && !process.env.AWS_LAMBDA_FUNCTION_NAME) {'
);

fs.writeFileSync('server.ts', code);
