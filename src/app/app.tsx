import React from 'react';
import Modal from 'react-modal';
import {HashRouter, Route, Switch} from 'react-router-dom';
import {ApiClient} from '../api/client/apiClient';
import {Configuration} from '../configuration/configuration';
import {ErrorConsoleReporter} from '../plumbing/errors/errorConsoleReporter';
import {ErrorHandler} from '../plumbing/errors/errorHandler';
import {ApplicationEventNames} from '../plumbing/events/applicationEventNames';
import {ApplicationEvents} from '../plumbing/events/applicationEvents';
import {RendererEvents} from '../plumbing/events/rendererEvents';
import {Authenticator} from '../plumbing/oauth/authenticator';
import {AuthenticatorImpl} from '../plumbing/oauth/authenticatorImpl';
import {LoginNavigation} from '../plumbing/oauth/login/loginNavigation';
import {CompaniesContainer} from '../views/companies/companiesContainer';
import {ErrorBoundary} from '../views/errors/errorBoundary';
import {ErrorSummaryView} from '../views/errors/errorSummaryView';
import {HeaderButtonsView} from '../views/headings/headerButtonsView';
import {SessionView} from '../views/headings/sessionView';
import {TitleView} from '../views/headings/titleView';
import {LoginRequiredView} from '../views/loginRequired/loginRequiredView';
import {TransactionsContainer} from '../views/transactions/transactionsContainer';
import {ApiViewEvents} from '../views/utilities/apiViewEvents';
import {ApiViewNames} from '../views/utilities/apiViewNames';
import {RouteHelper} from '../views/utilities/routeHelper';
import {AppState} from './appState';

/*
 * The application root component
 */
export class App extends React.Component<any, AppState> {

    private readonly _apiViewEvents: ApiViewEvents;
    private _events: RendererEvents;
    private _configuration?: Configuration;
    private _authenticator?: Authenticator;
    private _apiClient?: ApiClient;

    /*
     * Create safe objects here and do async startup processing later
     */
    public constructor(props: any) {
        super(props);

        // Set initial state, which will be used on the first render
        this.state = {
            isInitialised: false,
            isInLoggedOutView: false,
            isSigningIn: false,
            isMainViewLoaded: false,
            error: null,
        };

        // Make callbacks available
        this._setupCallbacks();

        // Create a helper class to notify us about views that make API calls
        // This will enable us to only trigger a login redirect once, after all views have tried to load
        this._apiViewEvents = new ApiViewEvents(this._onLoginRequired, this._onMainViewLoadStateChanged);
        this._apiViewEvents.addView(ApiViewNames.Main);
        this._apiViewEvents.addView(ApiViewNames.UserInfo);

        // Create a class to manage IPC events
        this._events = new RendererEvents();
        this._events.register();

        // Initialise the modal dialog system used for error popups
        Modal.setAppElement('#root');
    }

    /*
     * The rendering entry point
     */
    public render(): React.ReactNode {

        if (!this.state.isInitialised) {
            return this._renderInitialScreen();
        } else {
            return this._renderMain();
        }
    }

    /*
     * Do the initial load when the application starts up
     */
    public async componentDidMount(): Promise<void> {
        await this._initialiseApp();
    }

    /*
     * Application startup code
     */
    private async _initialiseApp(): Promise<void> {

        try {

            // Reset state during load
            this.setState({
                isInitialised: false,
                isInLoggedOutView: false,
                isSigningIn: false,
                isMainViewLoaded: false,
                error: null,
            });

            // First load configuration
            this._configuration = await this._events.loadConfiguration();

            // Initialise authentication
            this._authenticator = new AuthenticatorImpl(this._configuration.oauth, this._events);
            await this._authenticator.initialise();

            // Create a client to call the API and handle retries
            this._apiClient = new ApiClient(this._configuration.app.apiBaseUrl, this._authenticator);

            // If we were started via a deep link, navigate to that location
            await this._events.setDeepLinkStartupUrlIfRequired();

            // Update state
            this.setState({isInitialised: true});

        } catch (e) {
            this.setState({error: ErrorHandler.getFromException(e)});
        }
    }

    /*
     * Render basic details before the app has initialised
     */
    private _renderInitialScreen(): React.ReactNode {

        const titleProps = {
            userInfo: null,
        };

        const headerButtonProps = {
            sessionButtonsEnabled: this.state.isMainViewLoaded && !this.state.isInLoggedOutView,
            handleHomeClick: this._onHome,
            handleReloadDataClick: this._onReloadData,
            handleExpireAccessTokenClick: this._onExpireAccessToken,
            handleExpireRefreshTokenClick: this._onExpireRefreshToken,
            handleLogoutClick: this._onLogout,
        };

        const errorProps = {
            hyperlinkMessage: 'Problem Encountered',
            dialogTitle: 'Startup Error',
            error: this.state.error,
            centred: true,
        };

        return (
            <ErrorBoundary>
                <TitleView {...titleProps} />
                <HeaderButtonsView {...headerButtonProps} />
                <ErrorSummaryView {...errorProps} />
            </ErrorBoundary>
        );
    }

    /*
     * Attempt to render the entire layout after initialisation
     */
    private _renderMain(): React.ReactNode {

        const titleProps = {
            userInfo: {
                apiClient: this._apiClient!,
                events: this._apiViewEvents,
                shouldLoad: !this.state.isInLoggedOutView,
            },
        };

        const headerButtonProps = {
            sessionButtonsEnabled: this.state.isMainViewLoaded && !this.state.isInLoggedOutView,
            handleHomeClick: this._onHome,
            handleReloadDataClick: this._onReloadData,
            handleExpireAccessTokenClick: this._onExpireAccessToken,
            handleExpireRefreshTokenClick: this._onExpireRefreshToken,
            handleLogoutClick: this._onLogout,
        };

        const errorProps = {
            hyperlinkMessage: 'Problem Encountered',
            dialogTitle: 'Application Error',
            error: this.state.error,
            centred: true,
        };

        const sessionProps = {
            apiClient: this._apiClient!,
            isVisible: !this.state.isInLoggedOutView,
        };

        const mainViewProps = {
            onLoading: this._onMainViewLoading,
            apiClient: this._apiClient!,
            events: this._apiViewEvents,
        };

        const loginRequiredProps = {
            isSigningIn: this.state.isSigningIn,
            onLoading: this._onLoggedOutViewLoading,
        };

        // Callbacks to prevent multi line JSX warnings
        const renderCompaniesView     = () =>             <CompaniesContainer {...mainViewProps} />;
        const renderTransactionsView  = (props: any) =>   <TransactionsContainer {...props} {...mainViewProps} />;
        const renderLoginRequiredView = () =>             <LoginRequiredView {...loginRequiredProps} />;

        // Render the tree view
        return (
            <ErrorBoundary>
                <TitleView {...titleProps} />
                <HeaderButtonsView {...headerButtonProps} />
                <ErrorSummaryView {...errorProps} />
                <SessionView {...sessionProps} />
                <HashRouter>
                    <Switch>
                        <Route exact={true} path='/'               render={renderCompaniesView} />
                        <Route exact={true} path='/company=:id'    render={renderTransactionsView} />
                        <Route exact={true} path='/loggedout*'     render={renderLoginRequiredView} />
                        <Route path='*'                            render={renderCompaniesView} />
                    </Switch>
                </HashRouter>
            </ErrorBoundary>
        );
    }

    /*
     * Redirect to the login required view when we need to sign in
     */
    private async _onLoginRequired(): Promise<void> {
        LoginNavigation.navigateToLoginRequired();
    }

    /*
     * The home button moves to the home view but also deals with error recovery
     */
    private async _onHome(): Promise<void> {

        // If there is a startup error then reinitialise the app
        if (!this.state.isInitialised) {
            await this._initialiseApp();
        }

        if (this.state.isInitialised) {

            // We login when Home is clicked in the Login Required view
            if (RouteHelper.isInLoginRequiredView()) {
                const isLoggedIn = await this._authenticator!.isLoggedIn();
                if (!isLoggedIn) {
                    await this._login();
                    return;
                }
            }

            // Force a reload of the Home View if this is our current location
            if (RouteHelper.isInHomeView()) {
                ApplicationEvents.publish(ApplicationEventNames.ON_RELOAD_MAIN, false);
                return;
            }

            // Otherwise navigate to the Home View
            location.hash = '#';
        }
    }

    /*
     * Initiate the login operation
     */
    private async _login(): Promise<void> {

        try {

            // Update state to indicate a sign in is in progress
            this.setState({isSigningIn: true, error: null});

            // Do the work of the login
            await this._authenticator?.login();

            // Move back to the location that took us to login required
            this._apiViewEvents.clearState();
            LoginNavigation.restorePreLoginLocation();

        } catch (e) {

            // Report login errors
            this.setState({error: ErrorHandler.getFromException(e)});

        } finally {

            // Reset progress state
            this.setState({isSigningIn: false});
        }
    }

    /*
     * Ask all views to get updated data from the API
     */
    private _onReloadData(causeError: boolean): void {

        this._apiViewEvents.clearState();
        ApplicationEvents.publish(ApplicationEventNames.ON_RELOAD_MAIN, causeError);
        ApplicationEvents.publish(ApplicationEventNames.ON_RELOAD_USERINFO, causeError);
    }

    /*
     * Update state when the companies or transactions view loads
     */
    private _onMainViewLoading(): void {
        this.setState({isInLoggedOutView: false});
    }

    /*
     * Update state when the logged out view loads
     */
    private _onLoggedOutViewLoading(): void {
        this.setState({isInLoggedOutView: true});
    }

    /*
     * Update session buttons when the main view starts and ends loading
     */
    private _onMainViewLoadStateChanged(loaded: boolean): void {
        this.setState({isMainViewLoaded: loaded});
    }

    /*
     * Handle logout requests
     */
    private async _onLogout(): Promise<void> {

        try {
            // Do the logout redirect
            await this._authenticator!.logout();

        } catch (e) {

            // We only output logout errors to the console
            const error = ErrorHandler.getFromException(e);
            ErrorConsoleReporter.output(error);

        } finally {

            // Move to the logged out view upon completion
            location.hash = '#loggedout';
            this.setState({isMainViewLoaded: false});
        }
    }

    /*
     * For test purposes this makes the access token act expired
     */
    private async _onExpireAccessToken(): Promise<void> {
        await this._authenticator!.expireAccessToken();
    }

    /*
     * For test purposes this makes the refresh token act expired
     */
    private async _onExpireRefreshToken(): Promise<void> {
        await this._authenticator!.expireRefreshToken();
    }

    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    private _setupCallbacks(): void {
        this._onMainViewLoading = this._onMainViewLoading.bind(this);
        this._onLoggedOutViewLoading = this._onLoggedOutViewLoading.bind(this);
        this._onMainViewLoadStateChanged = this._onMainViewLoadStateChanged.bind(this);
        this._onLoginRequired = this._onLoginRequired.bind(this);
        this._onHome = this._onHome.bind(this);
        this._onReloadData = this._onReloadData.bind(this);
        this._onLogout = this._onLogout.bind(this);
        this._onExpireAccessToken = this._onExpireAccessToken.bind(this);
        this._onExpireRefreshToken = this._onExpireRefreshToken.bind(this);
    }
}
