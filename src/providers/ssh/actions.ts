import type { ProviderActionDefinition } from "../../core/provider-definition.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";

const service = "ssh";

export const sshDefaultTimeoutSeconds: number = 60;
export const sshMaxTimeoutSeconds: number = 600;
/** Bytes kept from each of stdout and stderr; the rest is dropped and flagged as truncated. */
export const sshOutputByteLimit: number = 256 * 1024;

export const sshActions: ProviderActionDefinition[] = [
  defineProviderAction(service, {
    name: "run_command",
    description:
      "Run one non-interactive shell command on the connected server over SSH and return its exit code, standard output, and standard error. The command runs in the login account's default shell without a terminal, so interactive programs, pagers, and password prompts are not supported.",
    operationType: "destructive",
    inputSchema: s.object(
      "Command to run on the server.",
      {
        command: s.nonWhitespaceString(
          "The shell command line, such as `df -h` or `systemctl status nginx`. Chain steps with `&&` or `;`. Every call opens a new session, so `cd` and exported variables do not carry over to the next call.",
        ),
        timeoutSeconds: s.integer(
          `Seconds to wait for the command, including connecting to the server. Defaults to ${sshDefaultTimeoutSeconds}. When the time runs out the call fails and the session is closed, but the server may let the command keep running; start long jobs in the background, for example with nohup, and check on them in later calls.`,
          { minimum: 1, maximum: sshMaxTimeoutSeconds },
        ),
      },
      { optional: ["timeoutSeconds"] },
    ),
    outputSchema: s.object("Result of the command.", {
      exitCode: s.nullableInteger(
        "The command's exit status, or null when it was ended by a signal or the server reported none.",
      ),
      signal: s.nullableString("The signal that ended the command, such as SIGKILL, or null when it exited normally."),
      stdout: s.string(`Standard output decoded as UTF-8, cut after ${sshOutputByteLimit / 1024} KiB.`),
      stderr: s.string(`Standard error decoded as UTF-8, cut after ${sshOutputByteLimit / 1024} KiB.`),
      stdoutTruncated: s.boolean("Whether standard output was longer than the limit and was cut."),
      stderrTruncated: s.boolean("Whether standard error was longer than the limit and was cut."),
    }),
  }),
];
