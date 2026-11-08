import { stdin, stdout } from "node:process";
import { createInterface } from "node:readline/promises";

export function argValue(name: string): string | undefined {
  const prefix = `--${name}=`;
  const inline = process.argv.find((arg) => arg.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);
  const index = process.argv.indexOf(`--${name}`);
  if (index !== -1) return process.argv[index + 1];
  return undefined;
}

export async function ask(question: string): Promise<string> {
  const rl = createInterface({ input: stdin, output: stdout });
  try {
    return (await rl.question(question)).trim();
  } finally {
    rl.close();
  }
}

/** Prompts for a secret without echoing it to the terminal. */
export async function askHidden(question: string): Promise<string> {
  if (!stdin.isTTY) {
    // Non-interactive (piped) input: read a single line.
    return ask(question);
  }
  return new Promise((resolve, reject) => {
    stdout.write(question);
    let value = "";
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    const onData = (char: string) => {
      switch (char) {
        case "\r":
        case "\n":
        case "\u0004":
          stdin.setRawMode(false);
          stdin.pause();
          stdin.off("data", onData);
          stdout.write("\n");
          resolve(value);
          break;
        case "\u0003":
          stdin.setRawMode(false);
          stdin.off("data", onData);
          reject(new Error("Cancelled"));
          break;
        case "\u007f":
          value = value.slice(0, -1);
          break;
        default:
          value += char;
      }
    };
    stdin.on("data", onData);
  });
}
