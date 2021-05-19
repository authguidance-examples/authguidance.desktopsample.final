import axios, {AxiosRequestConfig, Method} from 'axios';
import {Requestor} from '@openid/appauth';
import {ErrorHandler} from '../errors/errorHandler';
import {AxiosUtils} from '../utilities/axiosUtils';

/*
 * Override the requestor object of AppAuthJS, so that OAuth error codes are returned
 */
export class CustomRequestor extends Requestor {

    /*
     * Run the request and return OAuth errors as objects
     */
    public async xhr<T>(settings: JQueryAjaxSettings): Promise<T> {

        try {

            // Configure and send the request
            const options: AxiosRequestConfig = {
                url: settings.url,
                method: settings.method as Method,
                data: settings.data,
                headers: settings.headers,
            };
            const response = await axios.request(options);

            // All messages use a JSON response
            AxiosUtils.checkJson(response.data);
            return response.data as T;

        } catch (e) {

            // If the response is an OAuth error object from the Authorization Server then throw that
            if (e.response && e.response.data) {
                throw e.response.data;
            }

            // Otherwise throw the technical error details
            throw ErrorHandler.getFromApiError(e, settings.url || '');
        }
    }
}
