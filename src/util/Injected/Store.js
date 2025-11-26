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

    window.Store = Object.assign({}, window.safeRequire('WAWebCollections'));
    window.Store.AppState = window.safeRequire('WAWebSocketModel').Socket;
    window.Store.BlockContact = window.safeRequire('WAWebBlockContactAction');
    window.Store.Conn = window.safeRequire('WAWebConnModel').Conn;
    window.Store.Cmd = window.safeRequire('WAWebCmd').Cmd;
    window.Store.DownloadManager = window.safeRequire('WAWebDownloadManager').downloadManager;
    window.Store.GroupQueryAndUpdate = window.safeRequire('WAWebGroupQueryJob').queryAndUpdateGroupMetadataById;
    window.Store.MediaPrep = window.safeRequire('WAWebPrepRawMedia');
    window.Store.MediaObject = window.safeRequire('WAWebMediaStorage');
    window.Store.MediaTypes = window.safeRequire('WAWebMmsMediaTypes');
    window.Store.MediaUpload = window.safeRequire('WAWebMediaMmsV4Upload');
    window.Store.MsgKey = window.safeRequire('WAWebMsgKey');
    window.Store.OpaqueData = window.safeRequire('WAWebMediaOpaqueData');
    window.Store.QueryProduct = window.safeRequire('WAWebBizProductCatalogBridge');
    window.Store.QueryOrder = window.safeRequire('WAWebBizOrderBridge');
    window.Store.SendClear = window.safeRequire('WAWebChatClearBridge');
    window.Store.SendDelete = window.safeRequire('WAWebDeleteChatAction');
    window.Store.SendMessage = window.safeRequire('WAWebSendMsgChatAction');
    window.Store.EditMessage = window.safeRequire('WAWebSendMessageEditAction');
    window.Store.MediaDataUtils = window.safeRequire('WAWebMediaDataUtils');
    window.Store.BlobCache = window.safeRequire('WAWebMediaInMemoryBlobCache');
    window.Store.SendSeen = window.safeRequire('WAWebUpdateUnreadChatAction');
    window.Store.User = window.safeRequire('WAWebUserPrefsMeUser');
    window.Store.ContactMethods = {
        ...window.safeRequire('WAWebContactGetters'),
        ...window.safeRequire('WAWebFrontendContactGetters')
    };
    window.Store.UserConstructor = window.safeRequire('WAWebWid');
    window.Store.Validators = window.safeRequire('WALinkify');
    window.Store.WidFactory = window.safeRequire('WAWebWidFactory');
    window.Store.ProfilePic = window.safeRequire('WAWebContactProfilePicThumbBridge');
    window.Store.PresenceUtils = window.safeRequire('WAWebPresenceChatAction');
    window.Store.ChatState = window.safeRequire('WAWebChatStateBridge');
    window.Store.findCommonGroups = window.safeRequire('WAWebFindCommonGroupsContactAction').findCommonGroups;
    window.Store.StatusUtils = window.safeRequire('WAWebContactStatusBridge');
    window.Store.ConversationMsgs = window.safeRequire('WAWebChatLoadMessages');
    window.Store.sendReactionToMsg = window.safeRequire('WAWebSendReactionMsgAction').sendReactionToMsg;
    window.Store.createOrUpdateReactionsModule = window.safeRequire('WAWebDBCreateOrUpdateReactions');
    window.Store.EphemeralFields = window.safeRequire('WAWebGetEphemeralFieldsMsgActionsUtils');
    window.Store.MsgActionChecks = window.safeRequire('WAWebMsgActionCapability');
    window.Store.QuotedMsg = window.safeRequire('WAWebQuotedMsgModelUtils');
    window.Store.LinkPreview = window.safeRequire('WAWebLinkPreviewChatAction');
    window.Store.Socket = window.safeRequire('WADeprecatedSendIq');
    window.Store.SocketWap = window.safeRequire('WAWap');
    window.Store.SearchContext = window.safeRequire('WAWebChatMessageSearch');
    window.Store.DrawerManager = window.safeRequire('WAWebDrawerManager').DrawerManager;
    window.Store.LidUtils = window.safeRequire('WAWebApiContact');
    window.Store.WidToJid = window.safeRequire('WAWebWidToJid');
    window.Store.JidToWid = window.safeRequire('WAWebJidToWid');
    window.Store.getMsgInfo = window.safeRequire('WAWebApiMessageInfoStore').queryMsgInfo;
    window.Store.QueryExist = window.safeRequire('WAWebQueryExistsJob').queryWidExists;
    window.Store.ReplyUtils = window.safeRequire('WAWebMsgReply');
    window.Store.BotSecret = window.safeRequire('WAWebBotMessageSecret');
    window.Store.BotProfiles = window.safeRequire('WAWebBotProfileCollection');
    window.Store.ContactCollection = window.safeRequire('WAWebContactCollection').ContactCollection;
    window.Store.DeviceList = window.safeRequire('WAWebApiDeviceList');
    window.Store.HistorySync = window.safeRequire('WAWebSendNonMessageDataRequest');
    window.Store.AddonReactionTable = window.safeRequire('WAWebAddonReactionTableMode').reactionTableMode;
    window.Store.AddonPollVoteTable = window.safeRequire('WAWebAddonPollVoteTableMode').pollVoteTableMode;
    window.Store.ChatGetters = window.safeRequire('WAWebChatGetters');
    window.Store.UploadUtils = window.safeRequire('WAWebUploadManager');
    window.Store.WAWebStreamModel = window.safeRequire('WAWebStreamModel');
    window.Store.FindOrCreateChat = window.safeRequire('WAWebFindChatAction');
    window.Store.CustomerNoteUtils = window.safeRequire('WAWebNoteAction');
    window.Store.BusinessGatingUtils = window.safeRequire('WAWebBizGatingUtils');
    window.Store.PollsVotesSchema = window.safeRequire('WAWebPollsVotesSchema');
    window.Store.PollsSendVote = window.safeRequire('WAWebPollsSendVoteMsgAction');
    
    window.Store.Settings = {
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

    
    window.Store.NumberInfo = {
        ...window.safeRequire('WAPhoneUtils'),
        ...window.safeRequire('WAPhoneFindCC')
    };
    window.Store.ForwardUtils = {
        ...window.safeRequire('WAWebChatForwardMessage')
    };
    window.Store.PinnedMsgUtils = {
        ...window.safeRequire('WAWebPinInChatSchema'),
        ...window.safeRequire('WAWebSendPinMessageAction')
    };
    window.Store.ScheduledEventMsgUtils = {
        ...window.safeRequire('WAWebGenerateEventCallLink'),
        ...window.safeRequire('WAWebSendEventEditMsgAction'),
        ...window.safeRequire('WAWebSendEventResponseMsgAction')
    };
    window.Store.VCard = {
        ...window.safeRequire('WAWebFrontendVcardUtils'),
        ...window.safeRequire('WAWebVcardParsingUtils'),
        ...window.safeRequire('WAWebVcardGetNameFromParsed')
    };
    window.Store.StickerTools = {
        ...window.safeRequire('WAWebImageUtils'),
        ...window.safeRequire('WAWebAddWebpMetadata')
    };
    window.Store.GroupUtils = {
        ...window.safeRequire('WAWebGroupCreateJob'),
        ...window.safeRequire('WAWebGroupModifyInfoJob'),
        ...window.safeRequire('WAWebExitGroupAction'),
        ...window.safeRequire('WAWebContactProfilePicThumbBridge'),
        ...window.safeRequire('WAWebSetPropertyGroupAction')
    };
    window.Store.GroupParticipants = {
        ...window.safeRequire('WAWebModifyParticipantsGroupAction'),
        ...window.safeRequire('WASmaxGroupsAddParticipantsRPC')
    };
    window.Store.GroupInvite = {
        ...window.safeRequire('WAWebGroupInviteJob'),
        ...window.safeRequire('WAWebGroupQueryJob'),
        ...window.safeRequire('WAWebMexFetchGroupInviteCodeJob')
    };
    window.Store.GroupInviteV4 = {
        ...window.safeRequire('WAWebGroupInviteV4Job'),
        ...window.safeRequire('WAWebChatSendMessages')
    };
    window.Store.MembershipRequestUtils = {
        ...window.safeRequire('WAWebApiMembershipApprovalRequestStore'),
        ...window.safeRequire('WASmaxGroupsMembershipRequestsActionRPC')
    };
    window.Store.ChannelUtils = {
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
    window.Store.SendChannelMessage = {
        ...window.safeRequire('WAWebNewsletterUpdateMsgsRecordsJob'),
        ...window.safeRequire('WAWebMsgDataFromModel'),
        ...window.safeRequire('WAWebNewsletterSendMessageJob'),
        ...window.safeRequire('WAWebNewsletterSendMsgAction'),
        ...window.safeRequire('WAMediaCalculateFilehash')
    };
    window.Store.ChannelSubscribers = {
        ...window.safeRequire('WAWebMexFetchNewsletterSubscribersJob'),
        ...window.safeRequire('WAWebNewsletterSubscriberListAction')
    };
    window.Store.AddressbookContactUtils = {
        ...window.safeRequire('WAWebSaveContactAction'),
        ...window.safeRequire('WAWebDeleteContactAction')
    };

    if (!window.Store.Chat._find || !window.Store.Chat.findImpl) {
        window.Store.Chat._find = e => {
            const target = window.Store.Chat.get(e);
            return target ? Promise.resolve(target) : Promise.resolve({
                id: e
            });
        };
        window.Store.Chat.findImpl = window.Store.Chat._find;
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
