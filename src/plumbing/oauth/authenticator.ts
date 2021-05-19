/*
 * An interface to represent authentication related operations
 */
export interface Authenticator {

    // Setup that requires async calls
    initialise(): Promise<void>;

    // Return whether we have a user object and tokens
    isLoggedIn(): Promise<boolean>;

    // Try to get an access token
    getAccessToken(): Promise<string>;

    // Try to refresh the access token
    refreshAccessToken(): Promise<string>;

    // Do the login redirect and process the response
    login(): Promise<void>;

    // Do the logout redirect and process the response
    logout(): Promise<void>;

    // Update the access token to make it act like it is expired
    expireAccessToken(): Promise<void>;

    // Update the refresh token to make it act like it is expired
    expireRefreshToken(): Promise<void>;
}
