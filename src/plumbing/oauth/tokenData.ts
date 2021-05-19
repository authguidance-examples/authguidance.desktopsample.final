/*
 * Token data held in memory
 */
export interface TokenData {
    accessToken: string | null;
    refreshToken: string | null;
    idToken: string | null;
}
