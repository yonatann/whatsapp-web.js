'use strict';

exports.ExposeStore = () => {
    // Create a safe require wrapper that doesn't crash on missing modules
    window.safeRequire = (moduleName) => {
        let result;
        try {
            result = window.require(moduleName);
        } catch (error) {
            console.error(`[Store.js] Failed to require module: ${moduleName}`, error);
            return {};
        }
        return result;
    };

    /**
     * Helper function that compares between two WWeb versions. Its purpose is to help the developer to choose the correct code implementation depending on the comparison value and the WWeb version.
     * @param {string} lOperand The left operand for the WWeb version string to compare with
     * @param {string} operator The comparison operator
     * @param {string} rOperand The right operand for the WWeb version string to compare with
     * @returns {boolean} Boolean value that indicates the result of the comparison
     */
    window.compareWwebVersions = (lOperand, operator, rOperand) => {
        if (!['>', '>=', '<', '<=', '='].includes(operator)) {
            throw new class _ extends Error {
                constructor(m) { super(m); this.name = 'CompareWwebVersionsError'; }
            }('Invalid comparison operator is provided');

        }
        if (typeof lOperand !== 'string' || typeof rOperand !== 'string') {
            throw new class _ extends Error {
                constructor(m) { super(m); this.name = 'CompareWwebVersionsError'; }
            }('A non-string WWeb version type is provided');
        }

        lOperand = lOperand.replace(/-beta$/, '');
        rOperand = rOperand.replace(/-beta$/, '');

        while (lOperand.length !== rOperand.length) {
            lOperand.length > rOperand.length
                ? rOperand = rOperand.concat('0')
                : lOperand = lOperand.concat('0');
        }

        lOperand = Number(lOperand.replace(/\./g, ''));
        rOperand = Number(rOperand.replace(/\./g, ''));

        return (
            operator === '>' ? lOperand > rOperand :
                operator === '>=' ? lOperand >= rOperand :
                    operator === '<' ? lOperand < rOperand :
                        operator === '<=' ? lOperand <= rOperand :
                            operator === '=' ? lOperand === rOperand :
                                false
        );
    };

    const Store = window.getStore();
    Object.assign(Store, window.safeRequire('WAWebCollections'));
    Store.AppState = window.safeRequire('WAWebSocketModel').Socket;
    Store.BlockContact = window.safeRequire('WAWebBlockContactAction');
    Store.Conn = window.safeRequire('WAWebConnModel').Conn;
    Store.Cmd = window.safeRequire('WAWebCmd').Cmd;
    Store.DownloadManager = window.safeRequire('WAWebDownloadManager').downloadManager;
    Store.GroupQueryAndUpdate = window.safeRequire('WAWebGroupQueryJob').queryAndUpdateGroupMetadataById;
    Store.MediaPrep = window.safeRequire('WAWebPrepRawMedia');
    Store.MediaObject = window.safeRequire('WAWebMediaStorage');
    Store.MediaTypes = window.safeRequire('WAWebMmsMediaTypes');
    Store.MediaUpload = window.safeRequire('WAWebMediaMmsV4Upload');
    Store.MsgKey = window.safeRequire('WAWebMsgKey');
    Store.OpaqueData = window.safeRequire('WAWebMediaOpaqueData');
    Store.QueryProduct = window.safeRequire('WAWebBizProductCatalogBridge');
    Store.QueryOrder = window.safeRequire('WAWebBizOrderBridge');
    Store.SendClear = window.safeRequire('WAWebChatClearBridge');
    Store.SendDelete = window.safeRequire('WAWebDeleteChatAction');
    Store.SendMessage = window.safeRequire('WAWebSendMsgChatAction');
    Store.EditMessage = window.safeRequire('WAWebSendMessageEditAction');
    Store.MediaDataUtils = window.safeRequire('WAWebMediaDataUtils');
    Store.BlobCache = window.safeRequire('WAWebMediaInMemoryBlobCache');
    Store.SendSeen = window.safeRequire('WAWebUpdateUnreadChatAction');
    Store.User = window.safeRequire('WAWebUserPrefsMeUser');
    Store.ContactMethods = {
        ...window.safeRequire('WAWebContactGetters'),
        ...window.safeRequire('WAWebFrontendContactGetters')
    };
    Store.UserConstructor = window.safeRequire('WAWebWid');
    Store.Validators = window.safeRequire('WALinkify');
    Store.WidFactory = window.safeRequire('WAWebWidFactory');
    Store.ProfilePic = window.safeRequire('WAWebContactProfilePicThumbBridge');
    Store.PresenceUtils = window.safeRequire('WAWebPresenceChatAction');
    Store.ChatState = window.safeRequire('WAWebChatStateBridge');
    Store.findCommonGroups = window.safeRequire('WAWebFindCommonGroupsContactAction').findCommonGroups;
    Store.StatusUtils = window.safeRequire('WAWebContactStatusBridge');
    Store.ConversationMsgs = window.safeRequire('WAWebChatLoadMessages');
    Store.sendReactionToMsg = window.safeRequire('WAWebSendReactionMsgAction').sendReactionToMsg;
    Store.createOrUpdateReactionsModule = window.safeRequire('WAWebDBCreateOrUpdateReactions');
    Store.EphemeralFields = window.safeRequire('WAWebGetEphemeralFieldsMsgActionsUtils');
    Store.MsgActionChecks = window.safeRequire('WAWebMsgActionCapability');
    Store.QuotedMsg = window.safeRequire('WAWebQuotedMsgModelUtils');
    Store.LinkPreview = window.safeRequire('WAWebLinkPreviewChatAction');
    Store.Socket = window.safeRequire('WADeprecatedSendIq');
    Store.SocketWap = window.safeRequire('WAWap');
    Store.SearchContext = window.safeRequire('WAWebChatMessageSearch');
    Store.DrawerManager = window.safeRequire('WAWebDrawerManager').DrawerManager;
    Store.LidUtils = window.safeRequire('WAWebApiContact');
    Store.WidToJid = window.safeRequire('WAWebWidToJid');
    Store.JidToWid = window.safeRequire('WAWebJidToWid');
    Store.getMsgInfo = window.safeRequire('WAWebApiMessageInfoStore').queryMsgInfo;
    Store.QueryExist = window.safeRequire('WAWebQueryExistsJob').queryWidExists;
    Store.ReplyUtils = window.safeRequire('WAWebMsgReply');
    Store.BotSecret = window.safeRequire('WAWebBotMessageSecret');
    Store.BotProfiles = window.safeRequire('WAWebBotProfileCollection');
    Store.ContactCollection = window.safeRequire('WAWebContactCollection').ContactCollection;
    Store.DeviceList = window.safeRequire('WAWebApiDeviceList');
    Store.HistorySync = window.safeRequire('WAWebSendNonMessageDataRequest');
    Store.AddonReactionTable = window.safeRequire('WAWebAddonReactionTableMode').reactionTableMode;
    Store.AddonPollVoteTable = window.safeRequire('WAWebAddonPollVoteTableMode').pollVoteTableMode;
    Store.ChatGetters = window.safeRequire('WAWebChatGetters');
    Store.UploadUtils = window.safeRequire('WAWebUploadManager');
    Store.WAWebStreamModel = window.safeRequire('WAWebStreamModel');
    Store.FindOrCreateChat = window.safeRequire('WAWebFindChatAction');
    Store.CustomerNoteUtils = window.safeRequire('WAWebNoteAction');
    Store.BusinessGatingUtils = window.safeRequire('WAWebBizGatingUtils');
    Store.PollsVotesSchema = window.safeRequire('WAWebPollsVotesSchema');
    Store.PollsSendVote = window.safeRequire('WAWebPollsSendVoteMsgAction');

    Store.Settings = {
        ...window.safeRequire('WAWebUserPrefsGeneral'),
        ...window.safeRequire('WAWebUserPrefsNotifications'),
        setPushname: (() => {
            try {
                const module = window.safeRequire('WAWebSetPushnameConnAction');
                return module && module.setPushname ? module.setPushname : undefined;
            } catch (error) {
                console.error(`[Store.js] Failed to access setPushname from WAWebSetPushnameConnAction`, error);
                return undefined;
            }
        })()
    };


    Store.NumberInfo = {
        ...window.safeRequire('WAPhoneUtils'),
        ...window.safeRequire('WAPhoneFindCC')
    };
    Store.ForwardUtils = {
        ...window.safeRequire('WAWebChatForwardMessage')
    };
    Store.PinnedMsgUtils = {
        ...window.safeRequire('WAWebPinInChatSchema'),
        ...window.safeRequire('WAWebSendPinMessageAction')
    };
    Store.ScheduledEventMsgUtils = {
        ...window.safeRequire('WAWebGenerateEventCallLink'),
        ...window.safeRequire('WAWebSendEventEditMsgAction'),
        ...window.safeRequire('WAWebSendEventResponseMsgAction')
    };
    Store.VCard = {
        ...window.safeRequire('WAWebFrontendVcardUtils'),
        ...window.safeRequire('WAWebVcardParsingUtils'),
        ...window.safeRequire('WAWebVcardGetNameFromParsed')
    };
    Store.StickerTools = {
        ...window.safeRequire('WAWebImageUtils'),
        ...window.safeRequire('WAWebAddWebpMetadata')
    };
    Store.GroupUtils = {
        ...window.safeRequire('WAWebGroupCreateJob'),
        ...window.safeRequire('WAWebGroupModifyInfoJob'),
        ...window.safeRequire('WAWebExitGroupAction'),
        ...window.safeRequire('WAWebContactProfilePicThumbBridge'),
        ...window.safeRequire('WAWebSetPropertyGroupAction')
    };
    Store.GroupParticipants = {
        ...window.safeRequire('WAWebModifyParticipantsGroupAction'),
        ...window.safeRequire('WASmaxGroupsAddParticipantsRPC')
    };
    Store.GroupInvite = {
        ...window.safeRequire('WAWebGroupInviteJob'),
        ...window.safeRequire('WAWebGroupQueryJob'),
        ...window.safeRequire('WAWebMexFetchGroupInviteCodeJob')
    };
    Store.GroupInviteV4 = {
        ...window.safeRequire('WAWebGroupInviteV4Job'),
        ...window.safeRequire('WAWebChatSendMessages')
    };
    Store.MembershipRequestUtils = {
        ...window.safeRequire('WAWebApiMembershipApprovalRequestStore'),
        ...window.safeRequire('WASmaxGroupsMembershipRequestsActionRPC')
    };
    Store.ChannelUtils = {
        ...window.safeRequire('WAWebLoadNewsletterPreviewChatAction'),
        ...window.safeRequire('WAWebNewsletterMetadataQueryJob'),
        ...window.safeRequire('WAWebNewsletterCreateQueryJob'),
        ...window.safeRequire('WAWebEditNewsletterMetadataAction'),
        ...window.safeRequire('WAWebNewsletterDeleteAction'),
        ...window.safeRequire('WAWebNewsletterSubscribeAction'),
        ...window.safeRequire('WAWebNewsletterUnsubscribeAction'),
        ...window.safeRequire('WAWebNewsletterDirectorySearchAction'),
        ...window.safeRequire('WAWebNewsletterToggleMuteStateJob'),
        ...window.safeRequire('WAWebNewsletterGatingUtils'),
        ...window.safeRequire('WAWebNewsletterModelUtils'),
        ...window.safeRequire('WAWebMexAcceptNewsletterAdminInviteJob'),
        ...window.safeRequire('WAWebMexRevokeNewsletterAdminInviteJob'),
        ...window.safeRequire('WAWebChangeNewsletterOwnerAction'),
        ...window.safeRequire('WAWebDemoteNewsletterAdminAction'),
        ...window.safeRequire('WAWebNewsletterDemoteAdminJob'),
        countryCodesIso: window.safeRequire('WAWebCountriesNativeCountryNames'),
        currentRegion: window.safeRequire('WAWebL10N').getRegion(),
    };
    Store.SendChannelMessage = {
        ...window.safeRequire('WAWebNewsletterUpdateMsgsRecordsJob'),
        ...window.safeRequire('WAWebMsgDataFromModel'),
        ...window.safeRequire('WAWebNewsletterSendMessageJob'),
        ...window.safeRequire('WAWebNewsletterSendMsgAction'),
        ...window.safeRequire('WAMediaCalculateFilehash')
    };
    Store.ChannelSubscribers = {
        ...window.safeRequire('WAWebMexFetchNewsletterSubscribersJob'),
        ...window.safeRequire('WAWebNewsletterSubscriberListAction')
    };
    Store.AddressbookContactUtils = {
        ...window.safeRequire('WAWebSaveContactAction'),
        ...window.safeRequire('WAWebDeleteContactAction')
    };

    if (!Store.Chat._find || !Store.Chat.findImpl) {
        Store.Chat._find = e => {
            const target = Store.Chat.get(e);
            return target ? Promise.resolve(target) : Promise.resolve({
                id: e
            });
        };
        Store.Chat.findImpl = Store.Chat._find;
    }

    /**
     * Target options object description
     * @typedef {Object} TargetOptions
     * @property {string|number} module The target module
     * @property {string} function The function name to get from a module
     */
    /**
     * Function to modify functions
     * @param {TargetOptions} target Options specifying the target function to search for modifying
     * @param {Function} callback Modified function
     */
    window.injectToFunction = (target, callback) => {
        try {
            let module = window.safeRequire(target.module);
            if (!module) return;

            const path = target.function.split('.');
            const funcName = path.pop();

            for (const key of path) {
                if (!module[key]) return;
                module = module[key];
            }

            const originalFunction = module[funcName];
            if (typeof originalFunction !== 'function') return;

            module[funcName] = (...args) => {
                try {
                    return callback(originalFunction, ...args);
                } catch {
                    return originalFunction(...args);
                }
            };

        } catch {
            return;
        }
    };

    window.injectToFunction({ module: 'WAWebBackendJobsCommon', function: 'mediaTypeFromProtobuf' }, (func, ...args) => { const [proto] = args; return proto.locationMessage ? null : func(...args); });

    window.injectToFunction({ module: 'WAWebE2EProtoUtils', function: 'typeAttributeFromProtobuf' }, (func, ...args) => { const [proto] = args; return proto.locationMessage || proto.groupInviteMessage ? 'text' : func(...args); });
};
