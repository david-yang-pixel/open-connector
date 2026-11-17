export const bilibiliProviderScopes = {
  userInfo: "USER_INFO",
  userData: "USER_DATA",
  archiveBase: "ARC_BASE",
  archiveData: "ARC_DATA",
  articleBase: "ATC_BASE",
  articleData: "ATC_DATA",
} as const;

export const bilibiliOAuthScopes: string[] = [
  bilibiliProviderScopes.userInfo,
  bilibiliProviderScopes.userData,
  bilibiliProviderScopes.archiveBase,
  bilibiliProviderScopes.archiveData,
  bilibiliProviderScopes.articleBase,
  bilibiliProviderScopes.articleData,
];
