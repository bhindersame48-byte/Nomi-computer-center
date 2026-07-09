const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'const DB_FILE = path.join(process.cwd(), "db_local.json");',
  'const DB_FILE = process.env.NETLIFY ? "/tmp/db_local.json" : path.join(process.cwd(), "db_local.json");'
);
fs.writeFileSync('server.ts', code);
