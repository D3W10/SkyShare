import fs from "fs";
import path from "path";

fs.writeFileSync(path.resolve(__dirname, "../dist/package.json"), JSON.stringify({
    type: "commonjs"
}, null, 4));