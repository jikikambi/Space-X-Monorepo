const path = require("path");
const sharedConfig = require(path.resolve(__dirname, "../../tailwind.config.js"));

/** @type {import('tailwindcss').Config} */
module.exports = {
    ...sharedConfig,
    content: [
        path.join(__dirname, "src/**/*.{js,jsx,ts,tsx}"),
        path.join(__dirname, "public/index.html"),
    ],
};
