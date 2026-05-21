require('dotenv').config();

process.env.DATABASE_URL = "postgresql://postgres:123@localhost:5432/hq_streetwear";

console.log("--- [SYSTEM]: ĐÃ ÉP CỨNG DATABASE_URL VÀO HỆ THỐNG ---");

require('./.next/standalone/server.js');