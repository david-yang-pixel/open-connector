import type { OAuthClientConfig } from "../../oauth/oauth-client-config-service.ts";

/**
 * Contract between the shared channel event verification route and one
 * provider's verifier. The route owns everything every channel needs in the
 * same way: the dedicated bearer token, credential lookup, the raw body limit,
 * and the mapping from a rejection reason to HTTP status and error code. A
 * verifier owns only the provider protocol: which credential fields it needs,
 * how the request is signed or authenticated, and the trusted result it returns.
 */

/** Where a channel keeps the secret that proves an inbound request came from its application. */
export type ChannelCredentialScope =
  /** Credential values on the Bot connection selected like Actions select one (id or alias). */
  | "connection"
  /**
   * The deployment-default OAuth application configuration. Used when one
   * application is installed into many workspaces and signs every delivery with
   * the same app-level secret, so no connection can be chosen before the
   * request is verified.
   */
  | "application";

/** Credential material the route hands to `readCredential`; which member is set follows `credentialScope`. */
export interface ChannelCredentialSource {
  /** Trimmed values of a local `custom_credential` connection. */
  readonly connectionValues?: Readonly<Record<string, string>>;
  /** The deployment-default OAuth client configuration. */
  readonly applicationConfig?: OAuthClientConfig;
}

/** One inbound request as the provider delivered it to the caller's ingress. */
export interface ChannelEventRequest {
  /** Request headers; Authorization carries the dedicated verify token, never a provider credential. */
  readonly headers: Headers;
  /** Original request bytes, within the shared body limit. Never re-serialize them. */
  readonly rawBody: Uint8Array;
  /** Current time in milliseconds. */
  readonly now: number;
}

/**
 * Why a request was rejected. The route maps each reason to one HTTP status and
 * error code, so every channel reports the same failure the same way.
 */
export type ChannelEventRejectionReason =
  /** Unparseable or unsupported envelope, or a challenge that is not well formed. */
  | "payload"
  /** Signature, verification token or bearer token did not verify. */
  | "signature"
  /** Signed timestamp or token lifetime is outside the accepted window. */
  | "timestamp"
  /** The request is authentic but names a different application. */
  | "app"
  /** The body exceeds the shared event body limit. */
  | "body_too_large"
  /** Verification material such as published signing keys could not be fetched. */
  | "unavailable";

export type ChannelEventVerification =
  | {
      readonly verified: true;
      /** The provider's documented success payload, returned in the runtime envelope unchanged. */
      readonly result: object;
    }
  | {
      readonly verified: false;
      readonly reason: ChannelEventRejectionReason;
      /** Provider-worded message for the caller; never includes secrets or request content. */
      readonly message: string;
    };

/** A provider's channel event verifier. `Credential` is whatever `readCredential` extracts. */
export interface ChannelEventVerifier<Credential> {
  readonly credentialScope: ChannelCredentialScope;
  /** Messages for failures detected by the route before the verifier runs. */
  readonly messages: {
    /** Returned with 409 when `readCredential` finds nothing usable; name the fields to configure. */
    readonly notConfigured: string;
    readonly bodyTooLarge: string;
  };
  /** Extracts the fields this channel needs, or undefined when any of them is missing. */
  readCredential(source: ChannelCredentialSource): Credential | undefined;
  verify(request: ChannelEventRequest, credential: Credential): Promise<ChannelEventVerification>;
}
