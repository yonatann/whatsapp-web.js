'use strict';

//TODO: To be removed by version 2.3000.x hard release

exports.ExposeLegacyAuthStore = (moduleRaidStr) => {
    eval('var moduleRaid = ' + moduleRaidStr);
    // eslint-disable-next-line no-undef
    window.mR = moduleRaid();
    const AuthStore = window.getAuthStore();
    AuthStore.AppState = window.mR.findModule('Socket')[0].Socket;
    AuthStore.Cmd = window.mR.findModule('Cmd')[0].Cmd;
    AuthStore.Conn = window.mR.findModule('Conn')[0].Conn;
    AuthStore.OfflineMessageHandler = window.mR.findModule('OfflineMessageHandler')[0].OfflineMessageHandler;
    AuthStore.PairingCodeLinkUtils = window.mR.findModule('initializeAltDeviceLinking')[0];
    AuthStore.Base64Tools = window.mR.findModule('encodeB64')[0];
    AuthStore.RegistrationUtils = {
        ...window.mR.findModule('getCompanionWebClientFromBrowser')[0],
        ...window.mR.findModule('verifyKeyIndexListAccountSignature')[0],
        ...window.mR.findModule('waNoiseInfo')[0],
        ...window.mR.findModule('waSignalStore')[0],
    };
};