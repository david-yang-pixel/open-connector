export const notionReadContentCapability = "read_content";
export const notionInsertContentCapability = "insert_content";
export const notionUpdateContentCapability = "update_content";

export const notionReadScopes: string[] = [notionReadContentCapability];
export const notionWriteScopes: string[] = [notionInsertContentCapability, notionUpdateContentCapability];

// Comment access is a separate pair of integration capabilities, off by
// default and not implied by the content capabilities above.
export const notionReadCommentScopes: string[] = ["read_comments"];
export const notionInsertCommentScopes: string[] = ["insert_comments"];
