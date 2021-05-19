/*
 * An abstraction for building the logout URL
 */
export interface LogoutUrlBuilder {
    buildUrl(): string;
}
