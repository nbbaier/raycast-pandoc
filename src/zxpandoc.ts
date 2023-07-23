// import { homedir } from "os";
// import { $ } from "zx";
// //
// process.env.PATH += "/Users/nbbaier/.bin";

// export default async function main() {
//   $.cwd = homedir();
//   const result = await $`echo $PATH |  tr ':' '\n'`;
//   console.log(result.stdout);
// }

// // interface PandocOptions {
// //   from: string;
// //   to?: string;
// //   outFile?: string;
// // }

// // const PandocOptionsMap = new Map<string, string>([
// //   ["from", "-f"],
// //   ["to", "-t"],
// //   ["outFile", "-o"],
// // ]);

// // const options: PandocOptions = { from: "markdown", outFile: "test.pdf" };

// // const getPandocOptions = (options: PandocOptions) => {
// //   let optionArray = [];
// //   for (const [key, value] of Object.entries(options)) {
// //     optionArray.push(PandocOptionsMap.get(key), value);
// //   }
// //   return optionArray.join(" ");
// // };

// // const optionString = getPandocOptions(options);

// // const q = $.quote;
// // $.quote = (a) => a;

// //An extension to run pandoc
