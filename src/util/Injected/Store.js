'use strict';

// Helper to track store initialization errors
const trackStoreError = (stepNumber, stepName, error, context = {}) => {
    const errorData = {
        stepNumber,
        stepName,
        error: error?.message || String(error),
        stack: error?.stack,
        context,
        timestamp: new Date().toISOString()
    };

    // Store errors in window for later retrieval
    if (!window.__storeInitErrors) {
        window.__storeInitErrors = [];
    }
    window.__storeInitErrors.push(errorData);

    console.log(`%c[INIT Store.js ${stepNumber}] ❌ FAILED: ${stepName}`, 'color: #f44336; font-weight: bold;');
    console.log(`%c  Error: ${errorData.error}`, 'color: #f44336;');
    if (context && Object.keys(context).length > 0) {
        console.log(`%c  Context:`, 'color: #ff9800;', context);
    }

    // Notify initErrorTracker if available
    if (window.initErrorTracker?.failStep) {
        window.initErrorTracker.failStep(stepNumber, stepName, error, context);
    }
};

const trackStoreStep = (stepNumber, stepName, status = 'start') => {
    const color = status === 'start' ? '#2196F3' : '#4CAF50';
    const icon = status === 'start' ? '🚀' : '✅';
    console.log(`%c[INIT Store.js ${stepNumber}] ${icon} ${status === 'start' ? 'Starting' : 'Completed'}: ${stepName}`, `color: ${color}; font-weight: bold;`);

    if (window.initErrorTracker) {
        if (status === 'start') {
            window.initErrorTracker.startStep?.(stepNumber, stepName);
        } else {
            window.initErrorTracker.completeStep?.(stepNumber, stepName);
        }
    }
};

exports.ExposeStore = () => {
    trackStoreStep('7.0', 'ExposeStore initialization', 'start');
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

    // Use the existing namespaced store if available, otherwise create one
    // If window.getStore is not defined, initialize it with a default namespace
    if (typeof window.getStore !== 'function') {
        console.warn('[whatsapp-web.js] window.getStore not defined - initializing default namespace');
        window.StoreNamespace = "BlueticksStore";
        window.getStore = () => {
            if (!window[window.StoreNamespace]) {
                window[window.StoreNamespace] = {};
            }
            return window[window.StoreNamespace];
        };
    }

    trackStoreStep('7.1', 'Get Store reference', 'start');
    let Store;
    try {
        Store = window.getStore();
        if (!Store) {
            throw new Error('window.getStore() returned undefined');
        }
        trackStoreStep('7.1', 'Get Store reference', 'complete');
    } catch (error) {
        trackStoreError('7.1', 'Get Store reference', error);
        throw error;
    }

    // Helper function to safely require and assign modules
    const safeRequireAndAssign = (storeKey, moduleName, subKey = null, isCritical = false) => {
        try {
            const module = window.require(moduleName);
            if (!module) {
                console.warn(`[Store.js] Module ${moduleName} not found`);
                if (isCritical) {
                    trackStoreError('7.2', `Load ${moduleName}`, new Error(`Module ${moduleName} not found`));
                }
                return false;
            }
            Store[storeKey] = subKey ? module[subKey] : module;
            return true;
        } catch (error) {
            console.error(`[Store.js] Error loading ${moduleName}:`, error);
            if (isCritical) {
                trackStoreError('7.2', `Load ${moduleName}`, error);
            }
            return false;
        }
    };

    // Helper for merging multiple modules
    const safeMergeModules = (storeKey, modules, isCritical = false) => {
        try {
            const merged = {};
            for (const moduleName of modules) {
                try {
                    const module = window.require(moduleName);
                    if (module) {
                        Object.assign(merged, module);
                    }
                } catch (e) {
                    console.warn(`[Store.js] Failed to merge ${moduleName}:`, e.message);
                }
            }
            Store[storeKey] = merged;
            return true;
        } catch (error) {
            if (isCritical) {
                trackStoreError('7.2', `Merge modules for ${storeKey}`, error);
            }
            return false;
        }
    };

    trackStoreStep('7.2', 'Load Store modules', 'start');
    let failedCriticalModules = [];

    // WAWebCollections - Critical
    try {
        Object.assign(Store, window.require('WAWebCollections'));
    } catch (error) {
        trackStoreError('7.2.1', 'Load WAWebCollections', error, { critical: true });
        failedCriticalModules.push('WAWebCollections');
    }

    // Critical modules (will be tracked if failed)
    safeRequireAndAssign('AppState', 'WAWebSocketModel', 'Socket', true);
    safeRequireAndAssign('BlockContact', 'WAWebBlockContactAction');
    safeRequireAndAssign('Conn', 'WAWebConnModel', 'Conn', true);
    safeRequireAndAssign('Cmd', 'WAWebCmd', 'Cmd', true);
    safeRequireAndAssign('DownloadManager', 'WAWebDownloadManager', 'downloadManager');
    safeRequireAndAssign('GroupQueryAndUpdate', 'WAWebGroupQueryJob', 'queryAndUpdateGroupMetadataById');
    safeRequireAndAssign('MediaPrep', 'WAWebPrepRawMedia');
    safeRequireAndAssign('MediaObject', 'WAWebMediaStorage');
    safeRequireAndAssign('MediaTypes', 'WAWebMmsMediaTypes');

    // MediaUpload - merged modules
    safeMergeModules('MediaUpload', ['WAWebMediaMmsV4Upload', 'WAWebStartMediaUploadQpl']);

    safeRequireAndAssign('MediaUpdate', 'WAWebMediaUpdateMsg');
    safeRequireAndAssign('MsgKey', 'WAWebMsgKey', null, true);
    safeRequireAndAssign('OpaqueData', 'WAWebMediaOpaqueData');
    safeRequireAndAssign('QueryProduct', 'WAWebBizProductCatalogBridge');
    safeRequireAndAssign('QueryOrder', 'WAWebBizOrderBridge');
    safeRequireAndAssign('SendClear', 'WAWebChatClearBridge');
    safeRequireAndAssign('SendDelete', 'WAWebDeleteChatAction');
    safeRequireAndAssign('SendMessage', 'WAWebSendMsgChatAction', null, true);
    safeRequireAndAssign('EditMessage', 'WAWebSendMessageEditAction');
    safeRequireAndAssign('MediaDataUtils', 'WAWebMediaDataUtils');
    safeRequireAndAssign('BlobCache', 'WAWebMediaInMemoryBlobCache');
    safeRequireAndAssign('SendSeen', 'WAWebUpdateUnreadChatAction');
    safeRequireAndAssign('User', 'WAWebUserPrefsMeUser', null, true);

    // ContactMethods - merged modules
    safeMergeModules('ContactMethods', ['WAWebContactGetters', 'WAWebFrontendContactGetters']);

    safeRequireAndAssign('UserConstructor', 'WAWebWid');
    safeRequireAndAssign('Validators', 'WALinkify');
    safeRequireAndAssign('WidFactory', 'WAWebWidFactory', null, true);
    safeRequireAndAssign('ProfilePic', 'WAWebContactProfilePicThumbBridge');
    safeRequireAndAssign('PresenceUtils', 'WAWebPresenceChatAction');
    safeRequireAndAssign('ChatState', 'WAWebChatStateBridge');

    try {
        Store.findCommonGroups = window.require('WAWebFindCommonGroupsContactAction').findCommonGroups;
    } catch (e) {
        console.warn('[Store.js] Failed to load findCommonGroups');
    }

    safeRequireAndAssign('ConversationMsgs', 'WAWebChatLoadMessages');

    try {
        Store.sendReactionToMsg = window.require('WAWebSendReactionMsgAction').sendReactionToMsg;
    } catch (e) {
        console.warn('[Store.js] Failed to load sendReactionToMsg');
    }

    safeRequireAndAssign('createOrUpdateReactionsModule', 'WAWebDBCreateOrUpdateReactions');
    safeRequireAndAssign('EphemeralFields', 'WAWebGetEphemeralFieldsMsgActionsUtils');
    safeRequireAndAssign('MsgActionChecks', 'WAWebMsgActionCapability');
    safeRequireAndAssign('QuotedMsg', 'WAWebQuotedMsgModelUtils');
    safeRequireAndAssign('LinkPreview', 'WAWebLinkPreviewChatAction');
    safeRequireAndAssign('Socket', 'WADeprecatedSendIq');
    safeRequireAndAssign('SocketWap', 'WAWap');
    safeRequireAndAssign('SearchContext', 'WAWebChatMessageSearch');
    safeRequireAndAssign('DrawerManager', 'WAWebDrawerManager', 'DrawerManager');
    safeRequireAndAssign('LidUtils', 'WAWebApiContact');
    safeRequireAndAssign('WidToJid', 'WAWebWidToJid');
    safeRequireAndAssign('JidToWid', 'WAWebJidToWid');

    try {
        Store.getMsgInfo = window.require('WAWebApiMessageInfoStore').queryMsgInfo;
    } catch (e) {
        console.warn('[Store.js] Failed to load getMsgInfo');
    }

    try {
        Store.QueryExist = window.require('WAWebQueryExistsJob').queryWidExists;
    } catch (e) {
        console.warn('[Store.js] Failed to load QueryExist');
    }

    safeRequireAndAssign('ReplyUtils', 'WAWebMsgReply');
    safeRequireAndAssign('BotSecret', 'WAWebBotMessageSecret');
    safeRequireAndAssign('BotProfiles', 'WAWebBotProfileCollection');
    safeRequireAndAssign('ContactCollection', 'WAWebContactCollection', 'ContactCollection');
    safeRequireAndAssign('DeviceList', 'WAWebApiDeviceList');
    safeRequireAndAssign('HistorySync', 'WAWebSendNonMessageDataRequest');

    try {
        Store.AddonReactionTable = window.require('WAWebAddonReactionTableMode').reactionTableMode;
    } catch (e) {
        console.warn('[Store.js] Failed to load AddonReactionTable');
    }

    try {
        Store.AddonPollVoteTable = window.require('WAWebAddonPollVoteTableMode').pollVoteTableMode;
    } catch (e) {
        console.warn('[Store.js] Failed to load AddonPollVoteTable');
    }

    safeRequireAndAssign('ChatGetters', 'WAWebChatGetters');
    safeRequireAndAssign('UploadUtils', 'WAWebUploadManager');
    safeRequireAndAssign('WAWebStreamModel', 'WAWebStreamModel');
    safeRequireAndAssign('FindOrCreateChat', 'WAWebFindChatAction');
    safeRequireAndAssign('CustomerNoteUtils', 'WAWebNoteAction');
    safeRequireAndAssign('BusinessGatingUtils', 'WAWebBizGatingUtils');
    safeRequireAndAssign('PollsVotesSchema', 'WAWebPollsVotesSchema');
    safeRequireAndAssign('PollsSendVote', 'WAWebPollsSendVoteMsgAction');

    if (failedCriticalModules.length > 0) {
        console.error('[Store.js] Critical modules failed to load:', failedCriticalModules);
    }
    trackStoreStep('7.2', 'Load Store modules', 'complete');

    trackStoreStep('7.3', 'Load grouped Store modules', 'start');

    safeMergeModules('Settings', ['WAWebUserPrefsGeneral', 'WAWebUserPrefsNotifications']);
    try {
        Store.Settings = Store.Settings || {};
        Store.Settings.setPushname = window.require('WAWebSetPushnameConnAction').setPushname;
    } catch (e) {
        console.warn('[Store.js] Failed to load setPushname');
    }

    safeMergeModules('NumberInfo', ['WAPhoneUtils', 'WAPhoneFindCC']);
    safeMergeModules('ForwardUtils', ['WAWebChatForwardMessage']);
    safeMergeModules('PinnedMsgUtils', ['WAWebPinInChatSchema', 'WAWebSendPinMessageAction']);
    safeMergeModules('ScheduledEventMsgUtils', ['WAWebGenerateEventCallLink', 'WAWebSendEventEditMsgAction', 'WAWebSendEventResponseMsgAction']);
    safeMergeModules('VCard', ['WAWebFrontendVcardUtils', 'WAWebVcardParsingUtils', 'WAWebVcardGetNameFromParsed']);
    safeMergeModules('StickerTools', ['WAWebImageUtils', 'WAWebAddWebpMetadata']);
    safeMergeModules('GroupUtils', ['WAWebGroupCreateJob', 'WAWebGroupModifyInfoJob', 'WAWebExitGroupAction', 'WAWebContactProfilePicThumbBridge', 'WAWebSetPropertyGroupAction']);
    safeMergeModules('GroupParticipants', ['WAWebModifyParticipantsGroupAction', 'WASmaxGroupsAddParticipantsRPC']);
    safeMergeModules('GroupInvite', ['WAWebGroupInviteJob', 'WAWebGroupQueryJob', 'WAWebMexFetchGroupInviteCodeJob']);
    safeMergeModules('GroupInviteV4', ['WAWebGroupInviteV4Job', 'WAWebChatSendMessages']);
    safeMergeModules('MembershipRequestUtils', ['WAWebApiMembershipApprovalRequestStore', 'WASmaxGroupsMembershipRequestsActionRPC']);

    // ChannelUtils - many modules
    safeMergeModules('ChannelUtils', [
        'WAWebLoadNewsletterPreviewChatAction',
        'WAWebNewsletterMetadataQueryJob',
        'WAWebNewsletterCreateQueryJob',
        'WAWebEditNewsletterMetadataAction',
        'WAWebNewsletterDeleteAction',
        'WAWebNewsletterSubscribeAction',
        'WAWebNewsletterUnsubscribeAction',
        'WAWebNewsletterDirectorySearchAction',
        'WAWebNewsletterGatingUtils',
        'WAWebNewsletterModelUtils',
        'WAWebMexAcceptNewsletterAdminInviteJob',
        'WAWebMexRevokeNewsletterAdminInviteJob',
        'WAWebChangeNewsletterOwnerAction',
        'WAWebDemoteNewsletterAdminAction',
        'WAWebNewsletterDemoteAdminJob'
    ]);
    try {
        Store.ChannelUtils = Store.ChannelUtils || {};
        Store.ChannelUtils.countryCodesIso = window.require('WAWebCountriesNativeCountryNames');
        Store.ChannelUtils.currentRegion = window.require('WAWebL10N').getRegion();
    } catch (e) {
        console.warn('[Store.js] Failed to load ChannelUtils extras');
    }

    safeMergeModules('SendChannelMessage', [
        'WAWebNewsletterUpdateMsgsRecordsJob',
        'WAWebMsgDataFromModel',
        'WAWebNewsletterSendMessageJob',
        'WAWebNewsletterSendMsgAction',
        'WAMediaCalculateFilehash'
    ]);

    safeMergeModules('ChannelSubscribers', ['WAWebMexFetchNewsletterSubscribersJob', 'WAWebNewsletterSubscriberListAction']);
    safeMergeModules('AddressbookContactUtils', ['WAWebSaveContactAction', 'WAWebDeleteContactAction']);
    safeMergeModules('StatusUtils', ['WAWebContactStatusBridge', 'WAWebSendStatusMsgAction', 'WAWebRevokeStatusAction', 'WAWebStatusGatingUtils']);

    trackStoreStep('7.3', 'Load grouped Store modules', 'complete');

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

    trackStoreStep('7.4', 'Inject function overrides', 'start');
    try {
        window.injectToFunction({ module: 'WAWebBackendJobsCommon', function: 'mediaTypeFromProtobuf' }, (func, ...args) => { const [proto] = args; return proto.locationMessage ? null : func(...args); });
        window.injectToFunction({ module: 'WAWebE2EProtoUtils', function: 'typeAttributeFromProtobuf' }, (func, ...args) => { const [proto] = args; return proto.locationMessage || proto.groupInviteMessage ? 'text' : func(...args); });
        trackStoreStep('7.4', 'Inject function overrides', 'complete');
    } catch (error) {
        trackStoreError('7.4', 'Inject function overrides', error);
    }

    trackStoreStep('7.0', 'ExposeStore initialization', 'complete');
    console.log('%c[INIT Store.js] ✅ ExposeStore completed successfully', 'color: #4CAF50; font-weight: bold; font-size: 12px;');
};
