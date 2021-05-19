/*
 * Input to the login required view
 */
export interface LoginRequiredViewProps {

    // A callback by which we can inform the app view which view is current
    onLoading: () => void;

    // When true we show the green progress text
    isSigningIn: boolean;
}
