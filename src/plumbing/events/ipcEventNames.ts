/*
 * Events used for inter process calls between the main and renderer processes
 */
export class IpcEventNames {

    // The UI calls the main process to load configuration
    public static readonly ON_GET_CONFIGURATION = 'get_configuration';

    // The UI calls the main process to open the system browser
    public static readonly ON_OPEN_SYSTEM_BROWSER = 'open_system_browser';

    // The UI calls the main process at startup to see if there is a deep link startup URL
    public static readonly ON_GET_DEEP_LINK_STARTUP_URL = 'get_startup_url';

    // The main process calls the renderer process to deliver private uri scheme notifications
    public static readonly ON_PRIVATE_URI_SCHEME_NOTIFICATION = 'private_scheme_url';

    // Load tokens from persistent storage
    public static readonly ON_LOAD_TOKENS = 'load_tokens';

    // Save tokens to persistent storage
    public static readonly ON_SAVE_TOKENS = 'save_tokens';

    // Remove tokens from persistent storage
    public static readonly ON_DELETE_TOKENS = 'remove_tokens';
}
