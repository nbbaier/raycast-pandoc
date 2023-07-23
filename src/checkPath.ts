import fs from "fs";

function directoryExists(path: string) {
  try {
    fs.accessSync(path, fs.constants.F_OK);
    return true;
  } catch (err) {
    return false;
  }
}

const directoryPath = "/usr/local/texlive/2022/bin/universal-darwin";
if (directoryExists(directoryPath)) {
  console.log("Directory exists");
} else {
  console.log("Directory does not exist");
}
