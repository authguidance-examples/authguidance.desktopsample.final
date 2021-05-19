import urlparse from 'url-parse';
import {Configuration} from '../../configuration/configuration';
import {LoginState} from '../oauth/login/loginState';
import {LogoutState} from '../oauth/logout/logoutState';
import {IpcEventNames} from './ipcEventNames';
import {TokenData} from '../oauth/tokenData';

/*
 * A class to encapsulate IPC calls on the renderer side of our app
 */
export class RendererEvents {

    private readonly _api: any;
    private _loginState: LoginState | null;
    private _logoutState: LogoutState | null;
    private _logoutCallbackPath: string | null;

    public constructor() {
        this._api = (window as any).api;
        this._loginState = null;
        this._logoutState = null;
        this._logoutCallbackPath = null;
        this._setupCallbacks();
    }

    /*
     * Register to receive IPC messages from the main process
     */
    public register(): void {

        this._api.receiveIpcMessage(
            IpcEventNames.ON_PRIVATE_URI_SCHEME_NOTIFICATION,
            this._handlePrivateUriSchemeNotification);
    }

    /*
     * Receive details from the authenticator to enable us to process OAuth responses
     */
    public setOAuthDetails(loginState: LoginState, logoutState: LogoutState, logoutCallbackPath: string): void {
        this._loginState = loginState;
        this._logoutState = logoutState;
        this._logoutCallbackPath = logoutCallbackPath;
    }

    /*
     * Call the main side of the application to read the file system
     */
    public async loadConfiguration(): Promise<Configuration> {

        return this._sendIpcMessage(IpcEventNames.ON_GET_CONFIGURATION, {});
    }

    /*
     * If the app was started via a deep link then set the startup URL
     */
    public async setDeepLinkStartupUrlIfRequired(): Promise<void> {

        // See if the app was started by a deep link
        const url = await this._sendIpcMessage(IpcEventNames.ON_GET_DEEP_LINK_STARTUP_URL, {});

        // If there was a startup URL set the hash location of the ReactJS app accordingly
        // This ensures that we move straight to the linked page rather than rendering the default page first
        if (url) {
            const parsedUrl = this._tryParseUrl(url);
            if (parsedUrl) {
                this._handleDeepLinkingNotification(parsedUrl.pathname);
            }
        }
    }

    /*
     * Call the main side of the application to open the system browser
     */
    public async openSystemBrowser(url: string): Promise<void> {

        await this._sendIpcMessage(IpcEventNames.ON_OPEN_SYSTEM_BROWSER, url);
    }

    /*
     * Call the main side of the application to load tokens
     */
    public async loadTokens(): Promise<TokenData | null> {

        return this._sendIpcMessage(IpcEventNames.ON_LOAD_TOKENS, {});
    }

    /*
     * Call the main side of the application to save tokens
     */
    public async saveTokens(tokenData: TokenData): Promise<void> {

        await this._sendIpcMessage(IpcEventNames.ON_SAVE_TOKENS, tokenData);
    }

    /*
     * Call the main side of the application to remove tokens
     */
    public async deleteTokens(): Promise<void> {

        await this._sendIpcMessage(IpcEventNames.ON_DELETE_TOKENS, {});
    }

    /*
     * Encapsulate making an IPC call and returning data
     */
    private async _sendIpcMessage(eventName: string, requestData: any): Promise<any> {

        const result = await this._api.sendIpcMessage(eventName, requestData);
        if (result.error) {
            throw result.error;
        }

        return result.data;
    }

    /*
     * Receive URL notifications from the main side of the Electron app
     */
    private _handlePrivateUriSchemeNotification(data: any): void {

        const parsedUrl = this._tryParseUrl(data as string);
        if (parsedUrl) {

            if (parsedUrl.pathname === this._logoutCallbackPath) {

                // Handle logout responses
                this._logoutState!.handleLogoutResponse(parsedUrl.query);

            } else if (parsedUrl.query.state) {

                // Otherwise, if there is a state parameter we will classify this as a login response
                this._loginState!.handleLoginResponse(parsedUrl.query);

            } else {

                // Otherwise we will treat it a deep linking request and update the hash location
                this._handleDeepLinkingNotification(parsedUrl.pathname);
            }
        }
    }

    /*
     * Handle deep linking data originating from a URL like x-mycompany-desktopapp:/company=2
     * For our sample this method receives /company=2 and updates it to #company=2
     */
    private _handleDeepLinkingNotification(deepLinkingPath: string): void {

        const deepLinkedHashLocation = '#' + deepLinkingPath.substring(1);
        location.hash = deepLinkedHashLocation;
    }

    /*
     * Private URI scheme notifications could provide malformed input, so parse them safely
     */
    private _tryParseUrl(url: string): urlparse | null {

        try {
            return urlparse(url, true);
        } catch (e) {
            return null;
        }
    }

    /*
     * Ensure that the this parameter is available in async callbacks
     */
    private _setupCallbacks() {
        this._handlePrivateUriSchemeNotification = this._handlePrivateUriSchemeNotification.bind(this);
    }
}
