interface FeishuAppBotScopes {
  resource: string;
  sendMessage: string;
  readMessage: string;
  recallMessage: string;
  updateMessage: string;
  groupMessage: string;
  chatRead: string;
  chatMembersRead: string;
  reactionRead: string;
  reactionWrite: string;
  pinRead: string;
  pinWrite: string;
  p2pReadonly: string;
  groupAtReadonly: string;
  groupAtWithBotReadonly: string;
  groupReadonly: string;
  applicationRead: string;
  applicationVersionRead: string;
}

export const feishuAppBotScopes: FeishuAppBotScopes = {
  resource: "im:resource",
  sendMessage: "im:message:send_as_bot",
  readMessage: "im:message:readonly",
  recallMessage: "im:message:recall",
  updateMessage: "im:message:update",
  groupMessage: "im:message.group_msg",
  chatRead: "im:chat:read",
  chatMembersRead: "im:chat.members:read",
  reactionRead: "im:message.reactions:read",
  reactionWrite: "im:message.reactions:write_only",
  pinRead: "im:message.pins:read",
  pinWrite: "im:message.pins:write_only",
  p2pReadonly: "im:message.p2p_msg:readonly",
  groupAtReadonly: "im:message.group_at_msg:readonly",
  groupAtWithBotReadonly: "im:message.group_at_msg.include_bot:readonly",
  groupReadonly: "im:message.group_msg:readonly",
  applicationRead: "application:application:self_manage",
  applicationVersionRead: "application:application.app_version:readonly",
};
