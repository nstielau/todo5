/* eslint-disable no-console */
import {execa} from 'execa';
import fs from 'fs'

(async () => {
  try {
    // eslint-disable-next-line no-console
    console.log("Building main...");
    await execa("npm", ["run", "build"]);
    // Understand if it's dist or build folder
    const folderName = fs.existsSync("dist") ? "dist" : "build";

    // eslint-disable-next-line no-console
    console.log("Building staging...");
    await execa("git", ["checkout", "staging"]);
    await execa("npm", ["exec", "-c", "vite build --base /todo5/staging/ --outDir dist/staging"])

    // eslint-disable-next-line no-console
    console.log("Adding changes...");
    await execa("git", ["checkout", "--orphan", "gh-pages"]);
    await execa("git", ["--work-tree", folderName, "add", "--all"]);
    await execa("git", ["--work-tree", folderName, "commit", "-m", "gh-pages"]);

    // eslint-disable-next-line no-console
    console.log("Pushing to gh-pages...");
    await execa("git", ["push", "origin", "HEAD:gh-pages", "--force"]);
    await execa("rm", ["-r", folderName]);
    await execa("git", ["checkout", "-f", "main"]);
    await execa("git", ["branch", "-D", "gh-pages"]);
    console.log("Successfully deployed, check your settings");
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e.message);
    process.exit(1);
  }
})();
