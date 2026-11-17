/** Microsoft Teams Bot Connector hosts documented for public, GCC, GCC High and DoD clouds. */
const allowedServiceHostSuffixes = ["smba.trafficmanager.net", "teams.microsoft.com", "teams.microsoft.us"];

/** Returns whether a hostname belongs to a documented Microsoft Teams Bot Connector endpoint. */
export function isAllowedTeamsBotConnectorHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return allowedServiceHostSuffixes.some((suffix) => host === suffix || host.endsWith(`.${suffix}`));
}
