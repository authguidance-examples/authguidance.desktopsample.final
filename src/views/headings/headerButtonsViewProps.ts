/*
 * Input to the header buttons view
 */
export interface HeaderButtonsViewProps {

    // Whether to enable session related operations
    sessionButtonsEnabled: boolean;

    // Callbacks
    handleHomeClick: () => void;
    handleReloadDataClick: (causeApiError: boolean) => void;
    handleExpireAccessTokenClick: () => void;
    handleExpireRefreshTokenClick: () => void;
    handleLogoutClick: () => void;
}
