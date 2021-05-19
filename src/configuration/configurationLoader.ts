import fs from 'fs-extra';
import {Configuration} from './configuration';

/*
 * A helper class to load configuration data
 */
export class ConfigurationLoader {

    /*
     * Load the configuration during startup of the main process
     */
    public static load(configFilePath: string): Configuration {

        const configurationBuffer = fs.readFileSync(configFilePath);
        return JSON.parse(configurationBuffer.toString());
    }
}
