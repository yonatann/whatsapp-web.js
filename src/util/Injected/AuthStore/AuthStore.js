'use strict';

exports.ExposeAuthStore = () => {
    window.AuthStoreBt = {};
    window.AuthStoreBt.AppState = window.require('WAWebSocketModel').Socket;
    window.AuthStoreBt.Cmd = window.require('WAWebCmd').Cmd;
    window.AuthStoreBt.Conn = window.require('WAWebConnModel').Conn;
    window.AuthStoreBt.OfflineMessageHandler = window.require(
        'WAWebOfflineHandler',
    ).OfflineMessageHandler;
    window.AuthStoreBt.PairingCodeLinkUtils = window.require(
        'WAWebAltDeviceLinkingApi',
    );
    window.AuthStoreBt.Base64Tools = window.require('WABase64');
    window.AuthStoreBt.RegistrationUtils = {
        ...window.require('WAWebCompanionRegClientUtils'),
        ...window.require('WAWebAdvSignatureApi'),
        ...window.require('WAWebUserPrefsInfoStore'),
        ...window.require('WAWebSignalStoreApi'),
    };
};
