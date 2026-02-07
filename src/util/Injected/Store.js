'use strict';

exports.ExposeStore = () => {
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

    // Use the existing namespaced store instead of creating a new one
    const Store = window.getStore();
    Object.assign(Store, window.require('WAWebCollections'));
    Store.AppState = window.require('WAWebSocketModel').Socket;
    Store.BlockContact = window.require('WAWebBlockContactAction');
    Store.Conn = window.require('WAWebConnModel').Conn;
    Store.Cmd = window.require('WAWebCmd').Cmd;
    Store.DownloadManager = window.require('WAWebDownloadManager').downloadManager;
    Store.GroupQueryAndUpdate = window.require('WAWebGroupQueryJob').queryAndUpdateGroupMetadataById;
    Store.MediaPrep = window.require('WAWebPrepRawMedia');
    Store.MediaObject = window.require('WAWebMediaStorage');
    Store.MediaTypes = window.require('WAWebMmsMediaTypes');
    Store.MediaUpload = {
        ...window.require('WAWebMediaMmsV4Upload'),
        ...window.require('WAWebStartMediaUploadQpl')
    };
    Store.MediaUpdate = window.require('WAWebMediaUpdateMsg');
    Store.MsgKey = window.require('WAWebMsgKey');
    Store.OpaqueData = window.require('WAWebMediaOpaqueData');
    Store.QueryProduct = window.require('WAWebBizProductCatalogBridge');
    Store.QueryOrder = window.require('WAWebBizOrderBridge');
    Store.SendClear = window.require('WAWebChatClearBridge');
    Store.SendDelete = window.require('WAWebDeleteChatAction');
    Store.SendMessage = window.require('WAWebSendMsgChatAction');
    Store.EditMessage = window.require('WAWebSendMessageEditAction');
    Store.MediaDataUtils = window.require('WAWebMediaDataUtils');
    Store.BlobCache = window.require('WAWebMediaInMemoryBlobCache');
    Store.SendSeen = window.require('WAWebUpdateUnreadChatAction');
    Store.User = window.require('WAWebUserPrefsMeUser');
    Store.ContactMethods = {
        ...window.require('WAWebContactGetters'),
        ...window.require('WAWebFrontendContactGetters')
    };
    Store.UserConstructor = window.require('WAWebWid');
    Store.Validators = window.require('WALinkify');
    Store.WidFactory = window.require('WAWebWidFactory');
    Store.ProfilePic = window.require('WAWebContactProfilePicThumbBridge');
    Store.PresenceUtils = window.require('WAWebPresenceChatAction');
    Store.ChatState = window.require('WAWebChatStateBridge');
    Store.findCommonGroups = window.require('WAWebFindCommonGroupsContactAction').findCommonGroups;
    Store.ConversationMsgs = window.require('WAWebChatLoadMessages');
    Store.sendReactionToMsg = window.require('WAWebSendReactionMsgAction').sendReactionToMsg;
    Store.createOrUpdateReactionsModule = window.require('WAWebDBCreateOrUpdateReactions');
    Store.EphemeralFields = window.require('WAWebGetEphemeralFieldsMsgActionsUtils');
    Store.MsgActionChecks = window.require('WAWebMsgActionCapability');
    Store.QuotedMsg = window.require('WAWebQuotedMsgModelUtils');
    Store.LinkPreview = window.require('WAWebLinkPreviewChatAction');
    Store.Socket = window.require('WADeprecatedSendIq');
    Store.SocketWap = window.require('WAWap');
    Store.SearchContext = window.require('WAWebChatMessageSearch');
    Store.DrawerManager = window.require('WAWebDrawerManager').DrawerManager;
    Store.LidUtils = window.require('WAWebApiContact');
    Store.WidToJid = window.require('WAWebWidToJid');
    Store.JidToWid = window.require('WAWebJidToWid');
    Store.getMsgInfo = window.require('WAWebApiMessageInfoStore').queryMsgInfo;
    Store.QueryExist = window.require('WAWebQueryExistsJob').queryWidExists;
    Store.ReplyUtils = window.require('WAWebMsgReply');
    Store.BotSecret = window.require('WAWebBotMessageSecret');
    Store.BotProfiles = window.require('WAWebBotProfileCollection');
    Store.ContactCollection = window.require('WAWebContactCollection').ContactCollection;
    Store.DeviceList = window.require('WAWebApiDeviceList');
    Store.HistorySync = window.require('WAWebSendNonMessageDataRequest');
    Store.AddonReactionTable = window.require('WAWebAddonReactionTableMode').reactionTableMode;
    Store.AddonPollVoteTable = window.require('WAWebAddonPollVoteTableMode').pollVoteTableMode;
    Store.ChatGetters = window.require('WAWebChatGetters');
    Store.UploadUtils = window.require('WAWebUploadManager');
    Store.WAWebStreamModel = window.require('WAWebStreamModel');
    Store.FindOrCreateChat = window.require('WAWebFindChatAction');
    Store.CustomerNoteUtils = window.require('WAWebNoteAction');
    Store.BusinessGatingUtils = window.require('WAWebBizGatingUtils');
    Store.PollsVotesSchema = window.require('WAWebPollsVotesSchema');
    Store.PollsSendVote = window.require('WAWebPollsSendVoteMsgAction');

    Store.Settings = {
        ...window.require('WAWebUserPrefsGeneral'),
        ...window.require('WAWebUserPrefsNotifications'),
        setPushname: window.require('WAWebSetPushnameConnAction').setPushname
    };
    Store.NumberInfo = {
        ...window.require('WAPhoneUtils'),
        ...window.require('WAPhoneFindCC')
    };
    Store.ForwardUtils = {
        ...window.require('WAWebChatForwardMessage')
    };
    Store.PinnedMsgUtils = {
        ...window.require('WAWebPinInChatSchema'),
        ...window.require('WAWebSendPinMessageAction')
    };
    Store.ScheduledEventMsgUtils = {
        ...window.require('WAWebGenerateEventCallLink'),
        ...window.require('WAWebSendEventEditMsgAction'),
        ...window.require('WAWebSendEventResponseMsgAction')
    };
    Store.VCard = {
        ...window.require('WAWebFrontendVcardUtils'),
        ...window.require('WAWebVcardParsingUtils'),
        ...window.require('WAWebVcardGetNameFromParsed')
    };
    Store.StickerTools = {
        ...window.require('WAWebImageUtils'),
        ...window.require('WAWebAddWebpMetadata')
    };
    Store.GroupUtils = {
        ...window.require('WAWebGroupCreateJob'),
        ...window.require('WAWebGroupModifyInfoJob'),
        ...window.require('WAWebExitGroupAction'),
        ...window.require('WAWebContactProfilePicThumbBridge'),
        ...window.require('WAWebSetPropertyGroupAction')
    };
    Store.GroupParticipants = {
        ...window.require('WAWebModifyParticipantsGroupAction'),
        ...window.require('WASmaxGroupsAddParticipantsRPC')
    };
    Store.GroupInvite = {
        ...window.require('WAWebGroupInviteJob'),
        ...window.require('WAWebGroupQueryJob'),
        ...window.require('WAWebMexFetchGroupInviteCodeJob')
    };
    Store.GroupInviteV4 = {
        ...window.require('WAWebGroupInviteV4Job'),
        ...window.require('WAWebChatSendMessages')
    };
    Store.MembershipRequestUtils = {
        ...window.require('WAWebApiMembershipApprovalRequestStore'),
        ...window.require('WASmaxGroupsMembershipRequestsActionRPC')
    };
    Store.ChannelUtils = {
        ...window.require('WAWebLoadNewsletterPreviewChatAction'),
        ...window.require('WAWebNewsletterMetadataQueryJob'),
        ...window.require('WAWebNewsletterCreateQueryJob'),
        ...window.require('WAWebEditNewsletterMetadataAction'),
        ...window.require('WAWebNewsletterDeleteAction'),
        ...window.require('WAWebNewsletterSubscribeAction'),
        ...window.require('WAWebNewsletterUnsubscribeAction'),
        ...window.require('WAWebNewsletterDirectorySearchAction'),
        ...window.require('WAWebNewsletterGatingUtils'),
        ...window.require('WAWebNewsletterModelUtils'),
        ...window.require('WAWebMexAcceptNewsletterAdminInviteJob'),
        ...window.require('WAWebMexRevokeNewsletterAdminInviteJob'),
        ...window.require('WAWebChangeNewsletterOwnerAction'),
        ...window.require('WAWebDemoteNewsletterAdminAction'),
        ...window.require('WAWebNewsletterDemoteAdminJob'),
        countryCodesIso: window.require('WAWebCountriesNativeCountryNames'),
        currentRegion: window.require('WAWebL10N').getRegion(),
    };
    Store.SendChannelMessage = {
        ...window.require('WAWebNewsletterUpdateMsgsRecordsJob'),
        ...window.require('WAWebMsgDataFromModel'),
        ...window.require('WAWebNewsletterSendMessageJob'),
        ...window.require('WAWebNewsletterSendMsgAction'),
        ...window.require('WAMediaCalculateFilehash')
    };
    Store.ChannelSubscribers = {
        ...window.require('WAWebMexFetchNewsletterSubscribersJob'),
        ...window.require('WAWebNewsletterSubscriberListAction')
    };
    Store.AddressbookContactUtils = {
        ...window.require('WAWebSaveContactAction'),
        ...window.require('WAWebDeleteContactAction')
    };
    Store.StatusUtils = {
        ...window.require('WAWebContactStatusBridge'),
        ...window.require('WAWebSendStatusMsgAction'),
        ...window.require('WAWebRevokeStatusAction'),
        ...window.require('WAWebStatusGatingUtils')
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

    // Store is already exposed via window.getStore() - no need to assign to window.Store
    // This preserves namespace isolation (e.g., window.BlueticksStore instead of window.Store)

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
            let module = window.require(target.module);
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
