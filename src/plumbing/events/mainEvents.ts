import {BrowserWindow, ipcMain} from 'electron';
import Opener from 'opener';
import {Configuration} from '../../configuration/configuration';
import {TokenData} from '../oauth/tokenData';
import {TokenStorage} from '../oauth/tokenStorage';
import {IpcEventNames} from './ipcEventNames';

/*
 * A class to encapsulate IPC calls on the main side of our app
 */
export class MainEvents {

    private _configuration: Configuration | null;
    private _window: BrowserWindow | null;
    private _deepLinkStartupUrl: string | null;

    public constructor() {
        this._configuration = null;
        this._window = null;
        this._deepLinkStartupUrl = null;
        this._setupCallbacks();
    }

    /*
     * Set the configuration once available
     */
    public set configuration(configuration: Configuration) {
        this._configuration = configuration;
    }

    /*
     * Set the window once available
     */
    public set window(window: BrowserWindow) {
        this._window = window;
    }

    /*
     * Set a deep link startup URL if applicable
     */
    public set deepLinkStartupUrl(startupUrl: string) {
        this._deepLinkStartupUrl = startupUrl;
    }

    /*
     * Register to receive IPC messages from the renderer process
     */
    public register(): void {
        ipcMain.on(IpcEventNames.ON_GET_CONFIGURATION, this._getConfiguration);
        ipcMain.on(IpcEventNames.ON_GET_DEEP_LINK_STARTUP_URL, this._getDeepLinkStartupUrl);
        ipcMain.on(IpcEventNames.ON_OPEN_SYSTEM_BROWSER, this._openSystemBrowser);
        ipcMain.on(IpcEventNames.ON_LOAD_TOKENS, this._loadTokens);
        ipcMain.on(IpcEventNames.ON_SAVE_TOKENS, this._saveTokens);
        ipcMain.on(IpcEventNames.ON_DELETE_TOKENS, this._deleteTokens);
    }

    /*
     * When a login response or deep link is received, forward it to the renderer process
     */
    public sendPrivateSchemeNotificationUrl(url: string): void {
        this._window!.webContents.send(IpcEventNames.ON_PRIVATE_URI_SCHEME_NOTIFICATION, url);
    }

    /*
     * Return the configuration data
     */
    private async _getConfiguration(): Promise<void> {
        this._sendResponse(IpcEventNames.ON_GET_CONFIGURATION, this._configuration, null);
    }

    /*
     * The app could have been started via deep linking
     * In this case the renderer side of the app can send us a message to get the startup URL
     */
    private _getDeepLinkStartupUrl(): void {
        this._sendResponse(IpcEventNames.ON_GET_DEEP_LINK_STARTUP_URL, this._deepLinkStartupUrl, null);
    }

    /*
     * Open the system browser at the supplied URL
     */
    private _openSystemBrowser(...args: any[]): void {

        try {

            // Start the browser process and indicate success
            Opener(args[1]);
            this._sendResponse(IpcEventNames.ON_OPEN_SYSTEM_BROWSER, null, null);

        } catch (e) {

            // Return an error on failure
            this._sendResponse(IpcEventNames.ON_OPEN_SYSTEM_BROWSER, null, e);
        }
    }

    /*
     * Load tokens from secure storage
     */
    private async _loadTokens(): Promise<void> {

        try {
            const tokens = await TokenStorage.load();
            this._sendResponse(IpcEventNames.ON_LOAD_TOKENS, tokens, null);

        } catch (e) {

            // Return an error on failure
            this._sendResponse(IpcEventNames.ON_LOAD_TOKENS, null, e);
        }
    }

    /*
     * Save tokens to secure storage
     */
    private async _saveTokens(...args: any[]): Promise<void> {

        try {
            const data = args[1] as TokenData;
            await TokenStorage.save(data);
            this._sendResponse(IpcEventNames.ON_SAVE_TOKENS, null, null);

        } catch (e) {

            // Return an error on failure
            this._sendResponse(IpcEventNames.ON_SAVE_TOKENS, null, e);
        }
    }

    /*
     * Remove tokens from secure storage
     */
    private async _deleteTokens(): Promise<void> {

        try {
            await TokenStorage.delete();
            this._sendResponse(IpcEventNames.ON_DELETE_TOKENS, null, null);

        } catch (e) {

            // Return an error on failure
            this._sendResponse(IpcEventNames.ON_DELETE_TOKENS, null, e);
        }
    }

    /*
     * Send the response to the renderer side of the application
     */
    private _sendResponse(eventName: string, data: any, error: any) {
        this._window!.webContents.send(eventName, {data, error});
    }

    /*
     * Ensure that the this parameter is available in async callbacks
     */
    private _setupCallbacks() {
        this._getConfiguration = this._getConfiguration.bind(this);
        this._getDeepLinkStartupUrl = this._getDeepLinkStartupUrl.bind(this);
        this._openSystemBrowser = this._openSystemBrowser.bind(this);
        this._loadTokens = this._loadTokens.bind(this);
        this._saveTokens = this._saveTokens.bind(this);
        this._deleteTokens = this._deleteTokens.bind(this);
    }
}
