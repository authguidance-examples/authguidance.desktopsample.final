/*
 * Application level state used for rendering
 */
export interface AppState {

    // Whether the app has started up, read configuration and created global objects
    isInitialised: boolean;

    // Visibility of elements changes in this view
    isInLoggedOutView: boolean;

    // Set temporarily when signing in, to show a progres indicator
    isSigningIn: boolean;

    // The main view load state is used to control whether session buttons are enabled
    isMainViewLoaded: boolean;

    // The application level error if applicable
    error: any;
}
