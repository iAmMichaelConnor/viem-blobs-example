import { exec } from "child_process";

export async function executeCurlCommandFromFile(
  filepath: string,
  url: string
): Promise<string> {
  const curlCommand = `curl -X POST -H "Content-Type: application/json" -d @${filepath} ${url}`;

  return new Promise((resolve, reject) => {
    exec(curlCommand, (error, stdout, stderr) => {
      if (error) {
        reject(`Error: ${error.message}`);
        return;
      }

      resolve(stdout);
    });
  });
}
