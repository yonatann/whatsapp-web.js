'use strict';

//TODO: To be removed by version 2.3000.x hard release

// Exposes the internal Store to the WhatsApp Web client
exports.ExposeLegacyStore = () => {
    window.getStore() = Object.assign({}, window.mR.findModule(m => m.default && m.default.Chat)[0].default);
    window.getStore().AppState = window.mR.findModule('Socket')[0].Socket;
    window.getStore().Conn = window.mR.findModule('Conn')[0].Conn;
    window.getStore().BlockContact = window.mR.findModule('blockContact')[0];
    window.getStore().Call = window.mR.findModule((module) => module.default && module.default.Call)[0].default.Call;
    window.getStore().Cmd = window.mR.findModule('Cmd')[0].Cmd;
    window.getStore().CryptoLib = window.mR.findModule('decryptE2EMedia')[0];
    window.getStore().DownloadManager = window.mR.findModule('downloadManager')[0].downloadManager;
    window.getStore().GroupMetadata = window.mR.findModule('GroupMetadata')[0].default.GroupMetadata;
    window.getStore().GroupQueryAndUpdate = window.mR.findModule('queryAndUpdateGroupMetadataById')[0].queryAndUpdateGroupMetadataById;
    window.getStore().Label = window.mR.findModule('LabelCollection')[0].LabelCollection;
    window.getStore().MediaPrep = window.mR.findModule('prepRawMedia')[0];
    window.getStore().MediaObject = window.mR.findModule('getOrCreateMediaObject')[0];
    window.getStore().NumberInfo = window.mR.findModule('formattedPhoneNumber')[0];
    window.getStore().MediaTypes = window.mR.findModule('msgToMediaType')[0];
    window.getStore().MediaUpload = window.mR.findModule('uploadMedia')[0];
    window.getStore().MsgKey = window.mR.findModule((module) => module.default && module.default.fromString)[0].default;
    window.getStore().OpaqueData = window.mR.findModule(module => module.default && module.default.createFromData)[0].default;
    window.getStore().QueryProduct = window.mR.findModule('queryProduct')[0];
    window.getStore().QueryOrder = window.mR.findModule('queryOrder')[0];
    window.getStore().SendClear = window.mR.findModule('sendClear')[0];
    window.getStore().SendDelete = window.mR.findModule('sendDelete')[0];
    window.getStore().SendMessage = window.mR.findModule('addAndSendMsgToChat')[0];
    window.getStore().EditMessage = window.mR.findModule('addAndSendMessageEdit')[0];
    window.getStore().SendSeen = window.mR.findModule('sendSeen')[0];
    window.getStore().User = window.mR.findModule('getMaybeMeUser')[0];
    window.getStore().ContactMethods = window.mR.findModule('getUserid')[0];
    window.getStore().UploadUtils = window.mR.findModule((module) => (module.default && module.default.encryptAndUpload) ? module.default : null)[0].default;
    window.getStore().UserConstructor = window.mR.findModule((module) => (module.default && module.default.prototype && module.default.prototype.isServer && module.default.prototype.isUser) ? module.default : null)[0].default;
    window.getStore().Validators = window.mR.findModule('findLinks')[0];
    window.getStore().VCard = window.mR.findModule('vcardFromContactModel')[0];
    window.getStore().WidFactory = window.mR.findModule('createWid')[0];
    window.getStore().ProfilePic = window.mR.findModule('profilePicResync')[0];
    window.getStore().PresenceUtils = window.mR.findModule('sendPresenceAvailable')[0];
    window.getStore().ChatState = window.mR.findModule('sendChatStateComposing')[0];
    window.getStore().findCommonGroups = window.mR.findModule('findCommonGroups')[0].findCommonGroups;
    window.getStore().StatusUtils = window.mR.findModule('setMyStatus')[0];
    window.getStore().ConversationMsgs = window.mR.findModule('loadEarlierMsgs')[0];
    window.getStore().sendReactionToMsg = window.mR.findModule('sendReactionToMsg')[0].sendReactionToMsg;
    window.getStore().createOrUpdateReactionsModule = window.mR.findModule('createOrUpdateReactions')[0];
    window.getStore().EphemeralFields = window.mR.findModule('getEphemeralFields')[0];
    window.getStore().MsgActionChecks = window.mR.findModule('canSenderRevokeMsg')[0];
    window.getStore().QuotedMsg = window.mR.findModule('getQuotedMsgObj')[0];
    window.getStore().LinkPreview = window.mR.findModule('getLinkPreview')[0];
    window.getStore().Socket = window.mR.findModule('deprecatedSendIq')[0];
    window.getStore().SocketWap = window.mR.findModule('wap')[0];
    window.getStore().SearchContext = window.mR.findModule('getSearchContext')[0].getSearchContext;
    window.getStore().DrawerManager = window.mR.findModule('DrawerManager')[0].DrawerManager;
    window.getStore().LidUtils = window.mR.findModule('getCurrentLid')[0];
    window.getStore().WidToJid = window.mR.findModule('widToUserJid')[0];
    window.getStore().JidToWid = window.mR.findModule('userJidToUserWid')[0];
    window.getStore().getMsgInfo = (window.mR.findModule('sendQueryMsgInfo')[0] || {}).sendQueryMsgInfo || window.mR.findModule('queryMsgInfo')[0].queryMsgInfo;
    window.getStore().pinUnpinMsg = window.mR.findModule('sendPinInChatMsg')[0].sendPinInChatMsg;

    /* eslint-disable no-undef, no-cond-assign */
    window.getStore().QueryExist = ((m = window.mR.findModule('queryExists')[0]) ? m.queryExists : window.mR.findModule('queryExist')[0].queryWidExists);
    window.getStore().ReplyUtils = (m = window.mR.findModule('canReplyMsg')).length > 0 && m[0];
    /* eslint-enable no-undef, no-cond-assign */

    window.getStore().Settings = {
        ...window.mR.findModule('ChatlistPanelState')[0],
        setPushname: window.mR.findModule((m) => m.setPushname && !m.ChatlistPanelState)[0].setPushname
    };
    window.getStore().StickerTools = {
        ...window.mR.findModule('toWebpSticker')[0],
        ...window.mR.findModule('addWebpMetadata')[0]
    };
    window.getStore().GroupUtils = {
        ...window.mR.findModule('createGroup')[0],
        ...window.mR.findModule('setGroupDescription')[0],
        ...window.mR.findModule('sendExitGroup')[0],
        ...window.mR.findModule('sendSetPicture')[0]
    };
    window.getStore().GroupParticipants = {
        ...window.mR.findModule('promoteParticipants')[0],
        ...window.mR.findModule('sendAddParticipantsRPC')[0]
    };
    window.getStore().GroupInvite = {
        ...window.mR.findModule('resetGroupInviteCode')[0],
        ...window.mR.findModule('queryGroupInvite')[0]
    };
    window.getStore().GroupInviteV4 = {
        ...window.mR.findModule('queryGroupInviteV4')[0],
        ...window.mR.findModule('sendGroupInviteMessage')[0]
    };
    window.getStore().MembershipRequestUtils = {
        ...window.mR.findModule('getMembershipApprovalRequests')[0],
        ...window.mR.findModule('sendMembershipRequestsActionRPC')[0]
    };

    if (!window.getStore().Chat._find) {
        window.getStore().Chat._find = e => {
            const target = window.getStore().Chat.get(e);
            return target ? Promise.resolve(target) : Promise.resolve({
                id: e
            });
        };
    }

    // eslint-disable-next-line no-undef
    if ((m = window.mR.findModule('ChatCollection')[0]) && m.ChatCollection && typeof m.ChatCollection.findImpl === 'undefined' && typeof m.ChatCollection._find !== 'undefined') m.ChatCollection.findImpl = m.ChatCollection._find;

    const _isMDBackend = window.mR.findModule('isMDBackend');
    if (_isMDBackend && _isMDBackend[0] && _isMDBackend[0].isMDBackend) {
        window.getStore().MDBackend = _isMDBackend[0].isMDBackend();
    } else {
        window.getStore().MDBackend = true;
    }

    const _features = window.mR.findModule('FEATURE_CHANGE_EVENT')[0];
    if (_features) {
        window.getStore().Features = _features.LegacyPhoneFeatures;
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