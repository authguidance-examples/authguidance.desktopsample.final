import {OAuthConfiguration} from '../../../configuration/oauthConfiguration';
import {LogoutUrlBuilder} from './logoutUrlBuilder';

/*
 * The Cognito implementation of building a logout URL
 */
export class CognitoLogoutUrlBuilder implements LogoutUrlBuilder {

    private readonly _configuration: OAuthConfiguration;

    public constructor(configuration: OAuthConfiguration) {
        this._configuration = configuration;
    }

    /*
     * Format the vendor specific URL
     */
    public buildUrl(): string {

        const logoutReturnUri = encodeURIComponent(this._configuration.postLogoutRedirectUri);
        const clientId = encodeURIComponent(this._configuration.clientId);
        return `${this._configuration.customLogoutEndpoint}?client_id=${clientId}&logout_uri=${logoutReturnUri}`;
    }
}
