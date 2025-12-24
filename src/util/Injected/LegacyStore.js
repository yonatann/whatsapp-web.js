'use strict';

//TODO: To be removed by version 2.3000.x hard release

// Exposes the internal Store to the WhatsApp Web client
exports.ExposeLegacyStore = () => {
    const Store = window.getStore();
    Object.assign(Store, window.mR.findModule(m => m.default && m.default.Chat)[0].default);

    Store.AppState = window.mR.findModule('Socket')[0].Socket;
    Store.Conn = window.mR.findModule('Conn')[0].Conn;
    Store.BlockContact = window.mR.findModule('blockContact')[0];
    Store.Call = window.mR.findModule((module) => module.default && module.default.Call)[0].default.Call;
    Store.Cmd = window.mR.findModule('Cmd')[0].Cmd;
    Store.CryptoLib = window.mR.findModule('decryptE2EMedia')[0];
    Store.DownloadManager = window.mR.findModule('downloadManager')[0].downloadManager;
    Store.GroupMetadata = window.mR.findModule('GroupMetadata')[0].default.GroupMetadata;
    Store.GroupQueryAndUpdate = window.mR.findModule('queryAndUpdateGroupMetadataById')[0].queryAndUpdateGroupMetadataById;
    Store.Label = window.mR.findModule('LabelCollection')[0].LabelCollection;
    Store.MediaPrep = window.mR.findModule('prepRawMedia')[0];
    Store.MediaObject = window.mR.findModule('getOrCreateMediaObject')[0];
    Store.NumberInfo = window.mR.findModule('formattedPhoneNumber')[0];
    Store.MediaTypes = window.mR.findModule('msgToMediaType')[0];
    Store.MediaUpload = window.mR.findModule('uploadMedia')[0];
    Store.MsgKey = window.mR.findModule((module) => module.default && module.default.fromString)[0].default;
    Store.OpaqueData = window.mR.findModule(module => module.default && module.default.createFromData)[0].default;
    Store.QueryProduct = window.mR.findModule('queryProduct')[0];
    Store.QueryOrder = window.mR.findModule('queryOrder')[0];
    Store.SendClear = window.mR.findModule('sendClear')[0];
    Store.SendDelete = window.mR.findModule('sendDelete')[0];
    Store.SendMessage = window.mR.findModule('addAndSendMsgToChat')[0];
    Store.EditMessage = window.mR.findModule('addAndSendMessageEdit')[0];
    Store.SendSeen = window.mR.findModule('sendSeen')[0];
    Store.User = window.mR.findModule('getMaybeMeUser')[0];
    Store.ContactMethods = window.mR.findModule('getUserid')[0];
    Store.UploadUtils = window.mR.findModule((module) => (module.default && module.default.encryptAndUpload) ? module.default : null)[0].default;
    Store.UserConstructor = window.mR.findModule((module) => (module.default && module.default.prototype && module.default.prototype.isServer && module.default.prototype.isUser) ? module.default : null)[0].default;
    Store.Validators = window.mR.findModule('findLinks')[0];
    Store.VCard = window.mR.findModule('vcardFromContactModel')[0];
    Store.WidFactory = window.mR.findModule('createWid')[0];
    Store.ProfilePic = window.mR.findModule('profilePicResync')[0];
    Store.PresenceUtils = window.mR.findModule('sendPresenceAvailable')[0];
    Store.ChatState = window.mR.findModule('sendChatStateComposing')[0];
    Store.findCommonGroups = window.mR.findModule('findCommonGroups')[0].findCommonGroups;
    Store.StatusUtils = window.mR.findModule('setMyStatus')[0];
    Store.ConversationMsgs = window.mR.findModule('loadEarlierMsgs')[0];
    Store.sendReactionToMsg = window.mR.findModule('sendReactionToMsg')[0].sendReactionToMsg;
    Store.createOrUpdateReactionsModule = window.mR.findModule('createOrUpdateReactions')[0];
    Store.EphemeralFields = window.mR.findModule('getEphemeralFields')[0];
    Store.MsgActionChecks = window.mR.findModule('canSenderRevokeMsg')[0];
    Store.QuotedMsg = window.mR.findModule('getQuotedMsgObj')[0];
    Store.LinkPreview = window.mR.findModule('getLinkPreview')[0];
    Store.Socket = window.mR.findModule('deprecatedSendIq')[0];
    Store.SocketWap = window.mR.findModule('wap')[0];
    Store.SearchContext = window.mR.findModule('getSearchContext')[0].getSearchContext;
    Store.DrawerManager = window.mR.findModule('DrawerManager')[0].DrawerManager;
    Store.LidUtils = window.mR.findModule('getCurrentLid')[0];
    Store.WidToJid = window.mR.findModule('widToUserJid')[0];
    Store.JidToWid = window.mR.findModule('userJidToUserWid')[0];
    Store.getMsgInfo = (window.mR.findModule('sendQueryMsgInfo')[0] || {}).sendQueryMsgInfo || window.mR.findModule('queryMsgInfo')[0].queryMsgInfo;
    Store.pinUnpinMsg = window.mR.findModule('sendPinInChatMsg')[0].sendPinInChatMsg;

    /* eslint-disable no-undef, no-cond-assign */
    Store.QueryExist = ((m = window.mR.findModule('queryExists')[0]) ? m.queryExists : window.mR.findModule('queryExist')[0].queryWidExists);
    Store.ReplyUtils = (m = window.mR.findModule('canReplyMsg')).length > 0 && m[0];
    /* eslint-enable no-undef, no-cond-assign */

    Store.Settings = {
        ...window.mR.findModule('ChatlistPanelState')[0],
        setPushname: window.mR.findModule((m) => m.setPushname && !m.ChatlistPanelState)[0].setPushname
    };
    Store.StickerTools = {
        ...window.mR.findModule('toWebpSticker')[0],
        ...window.mR.findModule('addWebpMetadata')[0]
    };
    Store.GroupUtils = {
        ...window.mR.findModule('createGroup')[0],
        ...window.mR.findModule('setGroupDescription')[0],
        ...window.mR.findModule('sendExitGroup')[0],
        ...window.mR.findModule('sendSetPicture')[0]
    };
    Store.GroupParticipants = {
        ...window.mR.findModule('promoteParticipants')[0],
        ...window.mR.findModule('sendAddParticipantsRPC')[0]
    };
    Store.GroupInvite = {
        ...window.mR.findModule('resetGroupInviteCode')[0],
        ...window.mR.findModule('queryGroupInvite')[0]
    };
    Store.GroupInviteV4 = {
        ...window.mR.findModule('queryGroupInviteV4')[0],
        ...window.mR.findModule('sendGroupInviteMessage')[0]
    };
    Store.MembershipRequestUtils = {
        ...window.mR.findModule('getMembershipApprovalRequests')[0],
        ...window.mR.findModule('sendMembershipRequestsActionRPC')[0]
    };

    if (!Store.Chat._find) {
        Store.Chat._find = e => {
            const target = Store.Chat.get(e);
            return target ? Promise.resolve(target) : Promise.resolve({
                id: e
            });
        };
    }

    // eslint-disable-next-line no-undef
    if ((m = window.mR.findModule('ChatCollection')[0]) && m.ChatCollection && typeof m.ChatCollection.findImpl === 'undefined' && typeof m.ChatCollection._find !== 'undefined') m.ChatCollection.findImpl = m.ChatCollection._find;

    const _isMDBackend = window.mR.findModule('isMDBackend');
    if (_isMDBackend && _isMDBackend[0] && _isMDBackend[0].isMDBackend) {
        Store.MDBackend = _isMDBackend[0].isMDBackend();
    } else {
        Store.MDBackend = true;
    }

    const _features = window.mR.findModule('FEATURE_CHANGE_EVENT')[0];
    if (_features) {
        Store.Features = _features.LegacyPhoneFeatures;
    }

    /**
     * Target options object description
     * @typedef {Object} TargetOptions
     * @property {string|number} module The name or a key of the target module to search
     * @property {number} index The index value of the target module
     * @property {string} function The function name to get from a module
     */

    /**
     * Function to modify functions
     * @param {TargetOptions} target Options specifying the target function to search for modifying
     * @param {Function} callback Modified function
     */
    window.injectToFunction = (target, callback) => {
        const module = typeof target.module === 'string'
            ? window.mR.findModule(target.module)
            : window.mR.modules[target.module];
        const originalFunction = module[target.index][target.function];
        const modifiedFunction = (...args) => callback(originalFunction, ...args);
        module[target.index][target.function] = modifiedFunction;
    };

    window.injectToFunction({ module: 'mediaTypeFromProtobuf', index: 0, function: 'mediaTypeFromProtobuf' }, (func, ...args) => { const [proto] = args; return proto.locationMessage ? null : func(...args); });

    window.injectToFunction({ module: 'typeAttributeFromProtobuf', index: 0, function: 'typeAttributeFromProtobuf' }, (func, ...args) => { const [proto] = args; return proto.locationMessage || proto.groupInviteMessage ? 'text' : func(...args); });
};