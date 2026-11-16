import type { ChannelEventVerifier } from "./contract.ts";

type ChannelEventVerifierLoader = () => Promise<ChannelEventVerifier<unknown>>;

/**
 * Channel services that expose `POST /v1/providers/{service}/events/verify`.
 *
 * This map is the single list of verifiable channels: the route dispatches
 * through it and the auth middleware exempts exactly these paths from the
 * admin/runtime token. Each verifier loads on first use, so a runtime that never
 * verifies a channel never loads its protocol code (or jose, for Teams).
 */
const channelEventVerifiers: Record<string, ChannelEventVerifierLoader> = {
  slackbot: async () => (await import("./slackbot.ts")).slackbotEventVerifier,
  microsoft_teams_bot: async () => (await import("./microsoft-teams-bot.ts")).microsoftTeamsBotEventVerifier,
  feishu_app_bot: async () => (await import("./feishu-app-bot.ts")).feishuAppBotEventVerifier,
};

/** Every registered channel with its verifier loader, in registration order. */
export function listChannelEventVerifiers(): [service: string, load: ChannelEventVerifierLoader][] {
  return Object.entries(channelEventVerifiers);
}

/**
 * Whether a request targets a registered channel's verify route. That route checks
 * the dedicated event verification token itself, so the global admin/runtime
 * middleware must let it through; unregistered services stay behind normal auth.
 */
export function isChannelEventVerifyRequest(path: string, method: string): boolean {
  const service = /^\/v1\/providers\/([^/]+)\/events\/verify$/.exec(path)?.[1];
  return method === "POST" && service !== undefined && Object.hasOwn(channelEventVerifiers, service);
}
