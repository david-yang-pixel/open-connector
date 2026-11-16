export const outlookProviderScopes = {
  userRead: "User.Read",
  mailReadWrite: "Mail.ReadWrite",
  mailSend: "Mail.Send",
  mailboxSettingsReadWrite: "MailboxSettings.ReadWrite",
  mailRead: "Mail.Read",
  mailReadBasic: "Mail.ReadBasic",
  mailboxSettingsRead: "MailboxSettings.Read",
  offlineAccess: "offline_access",
} as const;

// Reading the mailbox — the profile, the root folders, the message list and one
// message — needs Mail.Read, the read-only permission Microsoft Graph documents
// for GET /me/mailFolders and GET /me/messages (Mail.ReadWrite is its write
// superset; Mail.ReadBasic omits the body). A host that requests Mail.Read
// instead of Mail.ReadWrite can therefore run these mailbox read actions.
export const outlookReadScopes: string[] = [outlookProviderScopes.userRead, outlookProviderScopes.mailRead];
export const outlookWriteScopes: string[] = [outlookProviderScopes.mailReadWrite];
export const outlookSendScopes: string[] = [outlookProviderScopes.mailSend];
export const outlookSettingsReadScopes: string[] = [outlookProviderScopes.mailboxSettingsReadWrite];
export const outlookSettingsWriteScopes: string[] = [outlookProviderScopes.mailboxSettingsReadWrite];
// Mail.Read is declared beside Mail.ReadWrite so a read-only host can request
// it instead (requestedScopes must be a subset of this list). A host that
// requests nothing still asks for every declared scope, and Mail.ReadWrite
// already covers Mail.Read, so that default grant gains no new capability.
export const outlookOAuthScopes: string[] = [
  outlookProviderScopes.userRead,
  outlookProviderScopes.mailRead,
  outlookProviderScopes.mailReadWrite,
  outlookProviderScopes.mailSend,
  outlookProviderScopes.mailboxSettingsReadWrite,
  outlookProviderScopes.offlineAccess,
];
