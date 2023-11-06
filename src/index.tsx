import { Detail } from "@raycast/api";
import { useExec } from "@raycast/utils";
import { cpus, homedir } from "os";
import { join } from "path";
// import { useEffect, useState } from "react";

// Construct the path to Pandoc executable
const pandocPrefix = cpus()[0].model.includes("Apple") ? "/opt/homebrew" : "/usr/local";
const pandocPath = join(pandocPrefix, "bin", "pandoc");

// Run pandoc -v
export default function Command() {
  const { isLoading, data } = useExec(pandocPath, ["-v"], {
    cwd: homedir(),
  });
  [];
  return <Detail isLoading={isLoading} markdown={data} />;
}
