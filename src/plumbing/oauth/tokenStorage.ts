import KeyTar from 'keytar';
import OperatingSystemUserName from 'username';
import {TokenData} from './tokenData';

/*
 * Token storage keys, and we use separate entries due to long Cognito tokens and Windows size limitations
 * The below link describes the Windows limitation that otherwise leads to a 'Stub received bad data' error
 * https://github.com/atom/node-keytar/issues/112
 */
const APP_STORAGE_ID_TOKEN = 'MyCompany.DesktopSample.IdToken';
const APP_STORAGE_REFRESH_TOKEN = 'MyCompany.DesktopSample.RefreshToken';

/*
 * A class to store our token data in secure storage
 */
export class TokenStorage {

    /*
     * Load token data or return null
     */
    public static async load(): Promise<TokenData | null> {

        // Get the operating system user name on the first call
        if (!TokenStorage._userName) {
            TokenStorage._userName = await OperatingSystemUserName();
        }

        // Look up tokens from secure storage
        const refreshToken = await KeyTar.getPassword(APP_STORAGE_REFRESH_TOKEN, this._userName);
        const idToken = await KeyTar.getPassword(APP_STORAGE_ID_TOKEN, this._userName);
        if (!refreshToken || !idToken) {
            return null;
        }

        // Convert to our token data object
        return {
            accessToken: null,
            refreshToken,
            idToken,
        };
    }

    /*
     * Save token data after login
     */
    public static async save(data: TokenData): Promise<void> {

        await KeyTar.setPassword(APP_STORAGE_REFRESH_TOKEN, this._userName, data.refreshToken!);
        await KeyTar.setPassword(APP_STORAGE_ID_TOKEN, this._userName, data.idToken!);
    }

    /*
     * Delete token data after logout
     */
    public static async delete(): Promise<void> {

        await KeyTar.deletePassword(APP_STORAGE_ID_TOKEN, this._userName);
        await KeyTar.deletePassword(APP_STORAGE_REFRESH_TOKEN, this._userName);
    }

    /*
     * Internal fields
     */
    private static _userName: string;
}
