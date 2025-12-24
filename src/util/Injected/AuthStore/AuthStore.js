'use strict';

exports.ExposeAuthStore = () => {
    const AuthStore = window.getAuthStore();
    AuthStore.AppState = window.require('WAWebSocketModel').Socket;
    AuthStore.Cmd = window.require('WAWebCmd').Cmd;
    AuthStore.Conn = window.require('WAWebConnModel').Conn;
    AuthStore.OfflineMessageHandler = window.require('WAWebOfflineHandler').OfflineMessageHandler;
    AuthStore.PairingCodeLinkUtils = window.require('WAWebAltDeviceLinkingApi');
    AuthStore.Base64Tools = window.require('WABase64');
    AuthStore.RegistrationUtils = {
        ...window.require('WAWebCompanionRegClientUtils'),
        ...window.require('WAWebAdvSignatureApi'),
        ...window.require('WAWebUserPrefsInfoStore'),
        ...window.require('WAWebSignalStoreApi'),
    };
};