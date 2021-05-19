import {LoginResponseCallback} from './loginResponseCallback';

/*
 * A class to manage login state when interacting with the system browser, including re-entrancy
 */
export class LoginState {

    private _callbackMap: [string, LoginResponseCallback][];

    public constructor() {
        this._callbackMap = [];
        this._setupCallbacks();
    }

    /*
     * Store the login callback so that we can resume once we receive a notification from the system browser
     */
    public storeLoginCallback(state: string, responseCallback: LoginResponseCallback): void {
        this._callbackMap.push([state, responseCallback]);
    }

    /*
     * Receive authorization response data and resume the login flow
     */
    public handleLoginResponse(queryParams: any): void {

        const state = queryParams.state;
        if (state) {
            const callback = this._getCallbackForState(queryParams.state);
            if (callback) {
                callback(queryParams);
                this._clearState(state);
            }
        }
    }

    /*
     * Look up a callback from the state parameter
     */
    private _getCallbackForState(state: string): LoginResponseCallback | null {

        const stateCallbackPair = this._callbackMap.find((pair) => pair[0] === state);
        if (stateCallbackPair) {
            return stateCallbackPair[1];
        }

        return null;
    }

    /*
     * Once complete, clear state and its callback from the collection
     */
    private _clearState(state: string) {
        this._callbackMap = this._callbackMap.filter((pair) => pair[0] !== state);
    }

    /*
     * Ensure that the this parameter is available in async callbacks
     */
    private _setupCallbacks() {
        this.handleLoginResponse = this.handleLoginResponse.bind(this);
    }
}
