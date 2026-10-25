import type { ProviderDefinition } from "../../core/types.ts";

import { sshActions } from "./actions.ts";

export const nodeOnly = true;

export const provider: ProviderDefinition = {
  service: "ssh",
  displayName: "SSH Server",
  description:
    "Unavailable on Cloudflare Workers and Windows, and needs the OpenSSH client (ssh 8.5 or later) installed where Open Connector runs. Run shell commands on your own Linux or Unix server over SSH and get the output back.",
  categories: ["Infrastructure", "Developer Tools"],
  authTypes: ["custom_credential"],
  auth: [
    {
      type: "custom_credential",
      description:
        "Connect one server per connection. Provide a password or a private key, or set the authentication method to none for a server whose username already carries the access token. Prefer a dedicated low-privilege account over root, because every agent allowed to use this connection can run any command that account can.",
      fields: [
        {
          key: "host",
          label: "Host",
          inputType: "text",
          required: true,
          secret: false,
          placeholder: "server.example.com",
          description:
            "The server hostname or IPv4 address. Servers on a private network are reachable only when the runtime enables OOMOL_CONNECT_ALLOW_PRIVATE_NETWORK.",
        },
        {
          key: "port",
          label: "Port",
          inputType: "text",
          required: false,
          secret: false,
          placeholder: "22",
          description: "The SSH port. Defaults to 22.",
        },
        {
          key: "username",
          label: "Username",
          inputType: "text",
          required: true,
          secret: false,
          placeholder: "deploy",
          description: "The account to log in as. Commands run with this account's permissions.",
        },
        {
          key: "authMethod",
          label: "Authentication Method",
          inputType: "text",
          required: false,
          secret: false,
          placeholder: "password, privateKey, or none",
          description:
            "How to log in: password, privateKey, or none. Use none for servers such as access gateways that accept the username alone, for example a username carrying an access token. When empty, the password and private key you provide are used.",
        },
        {
          key: "password",
          label: "Password",
          inputType: "password",
          required: false,
          secret: true,
          placeholder: "Leave empty when using a private key",
          description: "The account password, used when the server allows password login.",
        },
        {
          key: "privateKey",
          label: "Private Key",
          inputType: "textarea",
          required: false,
          secret: true,
          placeholder: "-----BEGIN OPENSSH PRIVATE KEY-----",
          description:
            "The complete private key whose public key is in the account's ~/.ssh/authorized_keys, in OpenSSH or PEM format. Escaped \\n line breaks are accepted.",
        },
        {
          key: "passphrase",
          label: "Private Key Passphrase",
          inputType: "password",
          required: false,
          secret: true,
          placeholder: "Leave empty when the key is not encrypted",
          description: "The passphrase that decrypts the private key.",
        },
        {
          key: "hostKeyFingerprint",
          label: "Host Key Fingerprint",
          inputType: "text",
          required: false,
          secret: false,
          placeholder: "SHA256:...",
          description:
            "Optional SHA256 fingerprint of the server host key, as printed by `ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub` on the server. For a server that presents an OpenSSH host certificate, use the fingerprint of the certified key, which `ssh-keygen -lf` also prints for the certificate file. When empty, the key presented while the connection is saved is trusted and every later command requires the same key.",
        },
      ],
    },
  ],
  homepageUrl: "https://www.openssh.com",
  actions: sshActions,
};
