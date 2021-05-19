import {LogoutResponseCallback} from './logoutResponseCallback';

/*
 * A class to manage logout state when interacting with the system browser, including re-entrancy
 */
export class LogoutState {

    private _logoutCallback: LogoutResponseCallback | null;

    public constructor() {
        this._logoutCallback = null;
        this._setupCallbacks();
    }

    /*
     * Store the logout callback
     */
    public storeLogoutCallback(logoutCallback: LogoutResponseCallback): void {
        this._logoutCallback = logoutCallback;
    }

    /*
     * Receive logout response data and resume the logout flow
     */
    public handleLogoutResponse(queryParams: any): void {

        if (this._logoutCallback) {
            this._logoutCallback(queryParams);
            this._logoutCallback = null;
        }
    }

    /*
     * Ensure that the this parameter is available in async callbacks
     */
    private _setupCallbacks() {
        this.handleLogoutResponse = this.handleLogoutResponse.bind(this);
    }
}
