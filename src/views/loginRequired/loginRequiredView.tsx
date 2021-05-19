import React from 'react';
import {LoginRequiredViewProps} from './loginRequiredViewProps';
import {LoginRequiredViewState} from './loginRequiredViewState';

/*
 * Render the simple login required view
 */
export class LoginRequiredView extends React.Component<LoginRequiredViewProps, LoginRequiredViewState> {

    /*
     * When the signing in state changes during login we update the view's state
     */
    public static getDerivedStateFromProps(
        nextProps: LoginRequiredViewProps,
        prevState: LoginRequiredViewState): LoginRequiredViewState | null {

        // Return updated state
        if (nextProps.isSigningIn !== prevState.isSigningIn) {
            return {...prevState, isSigningIn: nextProps.isSigningIn};
        }

        // Indicate no changes to state
        return null;
    }

    /*
     * Initialise state when constructed
     */
    public constructor(props: any) {

        super(props);
        props.onLoading();

        this.state = {
            isSigningIn: false,
        };
    }

    /*
     * Render the simple logout view
     */
    public render(): React.ReactNode {

        return  (
            <div className='row'>
                <div className='col-12 text-center mx-auto loginrequired'>
                    <h5>
                        You are logged out - click HOME to sign in ...
                    </h5>
                    {this.state.isSigningIn && this._renderSigningIn()}
                </div>
            </div>
        );
    }

    /*
     * When sign in is clicked we show some green text while the user waits
     */
    private _renderSigningIn(): React.ReactNode {

        return (
            <>
                <p className='signingincolor'>
                    Please Sign In via your browser, then click Continue to return here ...
                </p>
            </>
        );
    }
}
