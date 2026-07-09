const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace("export \n\nasync function startServer() {\n  ", "export const app = express();\n\n  const PORT = 3000;\n\n");
fs.writeFileSync('server.ts', code);
