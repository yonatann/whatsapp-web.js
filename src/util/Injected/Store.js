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

    window.getStore() = Object.assign({}, window.require('WAWebCollections'));
    window.getStore().AppState = window.require('WAWebSocketModel').Socket;
    window.getStore().BlockContact = window.require('WAWebBlockContactAction');
    window.getStore().Conn = window.require('WAWebConnModel').Conn;
    window.getStore().Cmd = window.require('WAWebCmd').Cmd;
    window.getStore().DownloadManager = window.require('WAWebDownloadManager').downloadManager;
    window.getStore().GroupQueryAndUpdate = window.require('WAWebGroupQueryJob').queryAndUpdateGroupMetadataById;
    window.getStore().MediaPrep = window.require('WAWebPrepRawMedia');
    window.getStore().MediaObject = window.require('WAWebMediaStorage');
    window.getStore().MediaTypes = window.require('WAWebMmsMediaTypes');
    window.getStore().MediaUpload = {
        ...window.require('WAWebMediaMmsV4Upload'),
        ...window.require('WAWebStartMediaUploadQpl')
    };
    window.getStore().MediaUpdate = window.require('WAWebMediaUpdateMsg');
    window.getStore().MsgKey = window.require('WAWebMsgKey');
    window.getStore().OpaqueData = window.require('WAWebMediaOpaqueData');
    window.getStore().QueryProduct = window.require('WAWebBizProductCatalogBridge');
    window.getStore().QueryOrder = window.require('WAWebBizOrderBridge');
    window.getStore().SendClear = window.require('WAWebChatClearBridge');
    window.getStore().SendDelete = window.require('WAWebDeleteChatAction');
    window.getStore().SendMessage = window.require('WAWebSendMsgChatAction');
    window.getStore().EditMessage = window.require('WAWebSendMessageEditAction');
    window.getStore().MediaDataUtils = window.require('WAWebMediaDataUtils');
    window.getStore().BlobCache = window.require('WAWebMediaInMemoryBlobCache');
    window.getStore().SendSeen = window.require('WAWebUpdateUnreadChatAction');
    window.getStore().User = window.require('WAWebUserPrefsMeUser');
    window.getStore().ContactMethods = {
        ...window.require('WAWebContactGetters'),
        ...window.require('WAWebFrontendContactGetters')
    };
    window.getStore().UserConstructor = window.require('WAWebWid');
    window.getStore().Validators = window.require('WALinkify');
    window.getStore().WidFactory = window.require('WAWebWidFactory');
    window.getStore().ProfilePic = window.require('WAWebContactProfilePicThumbBridge');
    window.getStore().PresenceUtils = window.require('WAWebPresenceChatAction');
    window.getStore().ChatState = window.require('WAWebChatStateBridge');
    window.getStore().findCommonGroups = window.require('WAWebFindCommonGroupsContactAction').findCommonGroups;
    window.getStore().ConversationMsgs = window.require('WAWebChatLoadMessages');
    window.getStore().sendReactionToMsg = window.require('WAWebSendReactionMsgAction').sendReactionToMsg;
    window.getStore().createOrUpdateReactionsModule = window.require('WAWebDBCreateOrUpdateReactions');
    window.getStore().EphemeralFields = window.require('WAWebGetEphemeralFieldsMsgActionsUtils');
    window.getStore().MsgActionChecks = window.require('WAWebMsgActionCapability');
    window.getStore().QuotedMsg = window.require('WAWebQuotedMsgModelUtils');
    window.getStore().LinkPreview = window.require('WAWebLinkPreviewChatAction');
    window.getStore().Socket = window.require('WADeprecatedSendIq');
    window.getStore().SocketWap = window.require('WAWap');
    window.getStore().SearchContext = window.require('WAWebChatMessageSearch');
    window.getStore().DrawerManager = window.require('WAWebDrawerManager').DrawerManager;
    window.getStore().LidUtils = window.require('WAWebApiContact');
    window.getStore().WidToJid = window.require('WAWebWidToJid');
    window.getStore().JidToWid = window.require('WAWebJidToWid');
    window.getStore().getMsgInfo = window.require('WAWebApiMessageInfoStore').queryMsgInfo;
    window.getStore().QueryExist = window.require('WAWebQueryExistsJob').queryWidExists;
    window.getStore().ReplyUtils = window.require('WAWebMsgReply');
    window.getStore().BotSecret = window.require('WAWebBotMessageSecret');
    window.getStore().BotProfiles = window.require('WAWebBotProfileCollection');
    window.getStore().ContactCollection = window.require('WAWebContactCollection').ContactCollection;
    window.getStore().DeviceList = window.require('WAWebApiDeviceList');
    window.getStore().HistorySync = window.require('WAWebSendNonMessageDataRequest');
    window.getStore().AddonReactionTable = window.require('WAWebAddonReactionTableMode').reactionTableMode;
    window.getStore().AddonPollVoteTable = window.require('WAWebAddonPollVoteTableMode').pollVoteTableMode;
    window.getStore().ChatGetters = window.require('WAWebChatGetters');
    window.getStore().UploadUtils = window.require('WAWebUploadManager');
    window.getStore().WAWebStreamModel = window.require('WAWebStreamModel');
    window.getStore().FindOrCreateChat = window.require('WAWebFindChatAction');
    window.getStore().CustomerNoteUtils = window.require('WAWebNoteAction');
    window.getStore().BusinessGatingUtils = window.require('WAWebBizGatingUtils');
    window.getStore().PollsVotesSchema = window.require('WAWebPollsVotesSchema');
    window.getStore().PollsSendVote = window.require('WAWebPollsSendVoteMsgAction');

    window.getStore().Settings = {
        ...window.require('WAWebUserPrefsGeneral'),
        ...window.require('WAWebUserPrefsNotifications'),
        setPushname: window.require('WAWebSetPushnameConnAction').setPushname
    };
    window.getStore().NumberInfo = {
        ...window.require('WAPhoneUtils'),
        ...window.require('WAPhoneFindCC')
    };
    window.getStore().ForwardUtils = {
        ...window.require('WAWebChatForwardMessage')
    };
    window.getStore().PinnedMsgUtils = {
        ...window.require('WAWebPinInChatSchema'),
        ...window.require('WAWebSendPinMessageAction')
    };
    window.getStore().ScheduledEventMsgUtils = {
        ...window.require('WAWebGenerateEventCallLink'),
        ...window.require('WAWebSendEventEditMsgAction'),
        ...window.require('WAWebSendEventResponseMsgAction')
    };
    window.getStore().VCard = {
        ...window.require('WAWebFrontendVcardUtils'),
        ...window.require('WAWebVcardParsingUtils'),
        ...window.require('WAWebVcardGetNameFromParsed')
    };
    window.getStore().StickerTools = {
        ...window.require('WAWebImageUtils'),
        ...window.require('WAWebAddWebpMetadata')
    };
    window.getStore().GroupUtils = {
        ...window.require('WAWebGroupCreateJob'),
        ...window.require('WAWebGroupModifyInfoJob'),
        ...window.require('WAWebExitGroupAction'),
        ...window.require('WAWebContactProfilePicThumbBridge'),
        ...window.require('WAWebSetPropertyGroupAction')
    };
    window.getStore().GroupParticipants = {
        ...window.require('WAWebModifyParticipantsGroupAction'),
        ...window.require('WASmaxGroupsAddParticipantsRPC')
    };
    window.getStore().GroupInvite = {
        ...window.require('WAWebGroupInviteJob'),
        ...window.require('WAWebGroupQueryJob'),
        ...window.require('WAWebMexFetchGroupInviteCodeJob')
    };
    window.getStore().GroupInviteV4 = {
        ...window.require('WAWebGroupInviteV4Job'),
        ...window.require('WAWebChatSendMessages')
    };
    window.getStore().MembershipRequestUtils = {
        ...window.require('WAWebApiMembershipApprovalRequestStore'),
        ...window.require('WASmaxGroupsMembershipRequestsActionRPC')
    };
    window.getStore().ChannelUtils = {
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
    window.getStore().SendChannelMessage = {
        ...window.require('WAWebNewsletterUpdateMsgsRecordsJob'),
        ...window.require('WAWebMsgDataFromModel'),
        ...window.require('WAWebNewsletterSendMessageJob'),
        ...window.require('WAWebNewsletterSendMsgAction'),
        ...window.require('WAMediaCalculateFilehash')
    };
    window.getStore().ChannelSubscribers = {
        ...window.require('WAWebMexFetchNewsletterSubscribersJob'),
        ...window.require('WAWebNewsletterSubscriberListAction')
    };
    window.getStore().AddressbookContactUtils = {
        ...window.require('WAWebSaveContactAction'),
        ...window.require('WAWebDeleteContactAction')
    };
    window.getStore().StatusUtils = {
        ...window.require('WAWebContactStatusBridge'),
        ...window.require('WAWebSendStatusMsgAction'),
        ...window.require('WAWebRevokeStatusAction'),
        ...window.require('WAWebStatusGatingUtils')
    };

    if (!window.getStore().Chat._find || !window.getStore().Chat.findImpl) {
        window.getStore().Chat._find = e => {
            const target = window.getStore().Chat.get(e);
            return target ? Promise.resolve(target) : Promise.resolve({
                id: e
            });
        };
        window.getStore().Chat.findImpl = window.getStore().Chat._find;
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
