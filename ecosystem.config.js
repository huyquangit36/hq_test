const path = require('path');
const fs = require('fs');

const envPath = path.join(__dirname, '.env.local');
require('dotenv').config({ path: envPath });

module.exports = {
    apps: [
        {
            name: "HQ-STREETWEAR",
            script: path.join(__dirname, '.next', 'standalone', 'server.js'),
            cwd: path.join(__dirname, '.next', 'standalone'),
            env: {
                ...process.env,
                NODE_ENV: "production",
                PORT: 3000,
                HOSTNAME: "0.0.0.0"
            }
        }
    ]
}