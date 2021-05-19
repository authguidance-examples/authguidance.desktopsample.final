/*
 * A holder for OAuth settings
 */
export interface OAuthConfiguration {

    // The Authorization Server base URL
    authority: string;

    // The OAuth client trust entry
    clientId: string;

    // The URL on which we receive the response
    redirectUri: string;

    // The Private URI Scheme used to receive OAuth redirect responses and deep links
    privateSchemeName: string;

    // The scopes requested
    scope: string;

    // Support custom logout behaviour
    customLogoutEndpoint: string;

    // The URL to which we return after a logout
    postLogoutRedirectUri: string;

    // The post logout location within the app
    logoutCallbackPath: string;
}
