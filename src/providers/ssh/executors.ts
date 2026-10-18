import type { CredentialValidationResult, CredentialValidators, ProviderExecutors } from "../../core/types.ts";
import type { ProviderActionHandlers, ProviderRuntimeHandler } from "../provider-runtime.ts";
import type { SshActionContext } from "./runtime.ts";

import { defineProviderExecutors, requireCustomCredential } from "../provider-runtime.ts";
import { readSshCredential, runSshCommand, validateSshCredential } from "./runtime.ts";

const service = "ssh";

const sshActionHandlers: ProviderActionHandlers<"ssh", ProviderRuntimeHandler<SshActionContext>> = {
  run_command: runSshCommand,
};

export const executors: ProviderExecutors = defineProviderExecutors<SshActionContext>({
  service,
  handlers: sshActionHandlers,
  async createContext(context): Promise<SshActionContext> {
    const credential = await requireCustomCredential(context, service);
    return { credential: readSshCredential(credential.values, credential.metadata), signal: context.signal };
  },
});

export const credentialValidators: CredentialValidators = {
  customCredential(input, { signal }): Promise<CredentialValidationResult> {
    return validateSshCredential(input.values, signal);
  },
};
