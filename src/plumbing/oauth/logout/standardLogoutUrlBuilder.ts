import {AuthorizationServiceConfiguration} from '@openid/appauth';
import {OAuthConfiguration} from '../../../configuration/oauthConfiguration';
import {LogoutUrlBuilder} from './logoutUrlBuilder';

/*
 * Build a logout URL according to draft standards
 */
export class StandardLogoutUrlBuilder implements LogoutUrlBuilder {

    private readonly _configuration: OAuthConfiguration;
    private readonly _metadata: AuthorizationServiceConfiguration;
    private readonly _idToken: string;

    public constructor(
        configuration: OAuthConfiguration,
        metadata: AuthorizationServiceConfiguration,
        idToken: string) {

        this._configuration = configuration;
        this._metadata = metadata;
        this._idToken = idToken;
    }

    /*
     * Form the standards based URL using the end session endpoint
     */
    public buildUrl(): string {

        const endSessionUrl = this._metadata.endSessionEndpoint;
        const postLogoutRedirectUri = encodeURIComponent(this._configuration.postLogoutRedirectUri);
        const encodedIdToken = encodeURIComponent(this._idToken);
        return `${endSessionUrl}?post_logout_redirect_uri=${postLogoutRedirectUri}&id_token_hint=${encodedIdToken}`;
    }
}
