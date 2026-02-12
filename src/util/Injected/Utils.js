'use strict';

// Helper to track Utils initialization errors
const trackUtilsError = (stepNumber, stepName, error, context = {}) => {
    const errorData = {
        stepNumber,
        stepName,
        error: error?.message || String(error),
        stack: error?.stack,
        context,
        timestamp: new Date().toISOString()
    };

    // Store errors in window for later retrieval
    if (!window.__utilsInitErrors) {
        window.__utilsInitErrors = [];
    }
    window.__utilsInitErrors.push(errorData);

    console.log(`%c[INIT Utils.js ${stepNumber}] ❌ FAILED: ${stepName}`, 'color: #f44336; font-weight: bold;');
    console.log(`%c  Error: ${errorData.error}`, 'color: #f44336;');
    if (error?.stack) {
        console.log(`%c  Stack:`, 'color: #ff9800; font-size: 10px;', error.stack.split('\n').slice(0, 3).join('\n'));
    }

    // Notify initErrorTracker if available
    if (window.initErrorTracker?.failStep) {
        window.initErrorTracker.failStep(stepNumber, stepName, error, context);
    }
};

const trackUtilsStep = (stepNumber, stepName, status = 'start') => {
    const color = status === 'start' ? '#2196F3' : '#4CAF50';
    const icon = status === 'start' ? '🚀' : '✅';
    console.log(`%c[INIT Utils.js ${stepNumber}] ${icon} ${status === 'start' ? 'Starting' : 'Completed'}: ${stepName}`, `color: ${color}; font-weight: bold;`);

    if (window.initErrorTracker) {
        if (status === 'start') {
            window.initErrorTracker.startStep?.(stepNumber, stepName);
        } else {
            window.initErrorTracker.completeStep?.(stepNumber, stepName);
        }
    }
};

exports.LoadUtils = () => {
    trackUtilsStep('8.0', 'LoadUtils initialization', 'start');

    trackUtilsStep('8.1', 'Create WWebJS object', 'start');
    const WWebJS = {};
    trackUtilsStep('8.1', 'Create WWebJS object', 'complete');

    trackUtilsStep('8.2', 'Define WWebJS methods', 'start');
    let failedMethods = [];

    WWebJS.forwardMessage = async (chatId, msgId) => {
        const msg = window.getStore().Msg.get(msgId) || (await window.getStore().Msg.getMessagesById([msgId]))?.messages?.[0];
        const chat = await WWebJS.getChat(chatId, { getAsModel: false });
        return await window.getStore().ForwardUtils.forwardMessages({ 'chat': chat, 'msgs': [msg], 'multicast': true, 'includeCaption': true, 'appendedText': undefined });
    };

    WWebJS.sendSeen = async (chatId) => {
        const chat = await WWebJS.getChat(chatId, { getAsModel: false });
        if (chat) {
            window.getStore().WAWebStreamModel.Stream.markAvailable();
            await window.getStore().SendSeen.sendSeen({
                chat: chat,
                threadId: undefined
            });
            window.getStore().WAWebStreamModel.Stream.markUnavailable();
            return true;
        }
        return false;
    };

    WWebJS.sendMessage = async (chat, content, options = {}) => {
        const isChannel = window.getStore().ChatGetters.getIsNewsletter(chat);
        const isStatus = window.getStore().ChatGetters.getIsBroadcast(chat);

        let mediaOptions = {};
        if (options.media) {
            mediaOptions = options.sendMediaAsSticker && !isChannel && !isStatus
                ? await WWebJS.processStickerData(options.media)
                : await WWebJS.processMediaData(options.media, {
                    forceSticker: options.sendMediaAsSticker,
                    forceGif: options.sendVideoAsGif,
                    forceVoice: options.sendAudioAsVoice,
                    forceDocument: options.sendMediaAsDocument,
                    forceMediaHd: options.sendMediaAsHd,
                    sendToChannel: isChannel,
                    sendToStatus: isStatus
                });
            mediaOptions.caption = options.caption;
            content = options.sendMediaAsSticker ? undefined : mediaOptions.preview;
            mediaOptions.isViewOnce = options.isViewOnce;
            delete options.media;
            delete options.sendMediaAsSticker;
        }

        let quotedMsgOptions = {};
        if (options.quotedMessageId) {
            let quotedMessage = window.getStore().Msg.get(options.quotedMessageId);
            !quotedMessage && (quotedMessage = (await window.getStore().Msg.getMessagesById([options.quotedMessageId]))?.messages?.[0]);
            if (quotedMessage) {

                const canReply = window.getStore().ReplyUtils
                    ? window.getStore().ReplyUtils.canReplyMsg(quotedMessage.unsafe())
                    : quotedMessage.canReply();

                if (canReply) {
                    quotedMsgOptions = quotedMessage.msgContextInfo(chat);
                }
            } else {
                if (!options.ignoreQuoteErrors) {
                    throw new Error('Could not get the quoted message.');
                }
            }

            delete options.ignoreQuoteErrors;
            delete options.quotedMessageId;
        }

        if (options.mentionedJidList) {
            options.mentionedJidList = options.mentionedJidList.map((id) => window.getStore().WidFactory.createWid(id));
            options.mentionedJidList = options.mentionedJidList.filter(Boolean);
        }

        if (options.groupMentions) {
            options.groupMentions = options.groupMentions.map((e) => ({
                groupSubject: e.subject,
                groupJid: window.getStore().WidFactory.createWid(e.id)
            }));
        }

        let locationOptions = {};
        if (options.location) {
            let { latitude, longitude, description, url } = options.location;
            url = window.getStore().Validators.findLink(url)?.href;
            url && !description && (description = url);
            locationOptions = {
                type: 'location',
                loc: description,
                lat: latitude,
                lng: longitude,
                clientUrl: url
            };
            delete options.location;
        }

        let pollOptions = {};
        if (options.poll) {
            const { pollName, pollOptions: _pollOptions } = options.poll;
            const { allowMultipleAnswers, messageSecret } = options.poll.options;
            pollOptions = {
                kind: 'pollCreation',
                type: 'poll_creation',
                pollName: pollName,
                pollOptions: _pollOptions,
                pollSelectableOptionsCount: allowMultipleAnswers ? 0 : 1,
                messageSecret:
                    Array.isArray(messageSecret) && messageSecret.length === 32
                        ? new Uint8Array(messageSecret)
                        : window.crypto.getRandomValues(new Uint8Array(32))
            };
            delete options.poll;
        }

        let eventOptions = {};
        if (options.event) {
            const { name, startTimeTs, eventSendOptions } = options.event;
            const { messageSecret } = eventSendOptions;
            eventOptions = {
                type: 'event_creation',
                eventName: name,
                eventDescription: eventSendOptions.description,
                eventStartTime: startTimeTs,
                eventEndTime: eventSendOptions.endTimeTs,
                eventLocation: eventSendOptions.location && {
                    degreesLatitude: 0,
                    degreesLongitude: 0,
                    name: eventSendOptions.location
                },
                eventJoinLink: eventSendOptions.callType === 'none' ? null : await window.getStore().ScheduledEventMsgUtils.createEventCallLink(
                    startTimeTs,
                    eventSendOptions.callType
                ),
                isEventCanceled: eventSendOptions.isEventCanceled,
                messageSecret:
                    Array.isArray(messageSecret) && messageSecret.length === 32
                        ? new Uint8Array(messageSecret)
                        : window.crypto.getRandomValues(new Uint8Array(32)),
            };
            delete options.event;
        }

        let vcardOptions = {};
        if (options.contactCard) {
            let contact = window.getStore().Contact.get(options.contactCard);
            vcardOptions = {
                body: window.getStore().VCard.vcardFromContactModel(contact).vcard,
                type: 'vcard',
                vcardFormattedName: contact.formattedName
            };
            delete options.contactCard;
        } else if (options.contactCardList) {
            let contacts = options.contactCardList.map(c => window.getStore().Contact.get(c));
            let vcards = contacts.map(c => window.getStore().VCard.vcardFromContactModel(c));
            vcardOptions = {
                type: 'multi_vcard',
                vcardList: vcards,
                body: null
            };
            delete options.contactCardList;
        } else if (options.parseVCards && typeof (content) === 'string' && content.startsWith('BEGIN:VCARD')) {
            delete options.parseVCards;
            delete options.linkPreview;
            try {
                const parsed = window.getStore().VCard.parseVcard(content);
                if (parsed) {
                    vcardOptions = {
                        type: 'vcard',
                        vcardFormattedName: window.getStore().VCard.vcardGetNameFromParsed(parsed)
                    };
                }
            } catch (_) {
                // not a vcard
            }
        }

        if (options.linkPreview) {
            delete options.linkPreview;
            const link = window.getStore().Validators.findLink(content);
            if (link) {
                let preview = await window.getStore().LinkPreview.getLinkPreview(link);
                if (preview && preview.data) {
                    preview = preview.data;
                    preview.preview = true;
                    preview.subtype = 'url';
                    options = { ...options, ...preview };
                }
            }
        }

        let buttonOptions = {};
        if (options.buttons) {
            let caption;
            if (options.buttons.type === 'chat') {
                content = options.buttons.body;
                caption = content;
            } else {
                caption = options.caption ? options.caption : ' '; //Caption can't be empty
            }
            buttonOptions = {
                productHeaderImageRejected: false,
                isFromTemplate: false,
                isDynamicReplyButtonsMsg: true,
                title: options.buttons.title ? options.buttons.title : undefined,
                footer: options.buttons.footer ? options.buttons.footer : undefined,
                dynamicReplyButtons: options.buttons.buttons,
                replyButtons: options.buttons.buttons,
                caption: caption
            };
            delete options.buttons;
        }

        let listOptions = {};
        if (options.list) {
            if (window.getStore().Conn.platform === 'smba' || window.getStore().Conn.platform === 'smbi') {
                throw '[LT01] Whatsapp business can\'t send this yet';
            }
            listOptions = {
                type: 'list',
                footer: options.list.footer,
                list: {
                    ...options.list,
                    listType: 1
                },
                body: options.list.description
            };
            delete options.list;
            delete listOptions.list.footer;
        }

        const botOptions = {};
        if (options.invokedBotWid) {
            botOptions.messageSecret = window.crypto.getRandomValues(new Uint8Array(32));
            botOptions.botMessageSecret = await window.getStore().BotSecret.genBotMsgSecretFromMsgSecret(botOptions.messageSecret);
            botOptions.invokedBotWid = window.getStore().WidFactory.createWid(options.invokedBotWid);
            botOptions.botPersonaId = window.getStore().BotProfiles.BotProfileCollection.get(options.invokedBotWid).personaId;
            delete options.invokedBotWid;
        }

        const lidUser = window.getStore().User.getMaybeMeLidUser();
        const meUser = window.getStore().User.getMaybeMePnUser();
        const newId = await window.getStore().MsgKey.newId();
        let from = chat.id.isLid() ? lidUser : meUser;
        let participant;

        if (typeof chat.id?.isGroup === 'function' && chat.id.isGroup()) {
            from = chat.groupMetadata && chat.groupMetadata.isLidAddressingMode ? lidUser : meUser;
            participant = window.getStore().WidFactory.asUserWidOrThrow(from);
        }

        if (typeof chat.id?.isStatus === 'function' && chat.id.isStatus()) {
            participant = window.getStore().WidFactory.asUserWidOrThrow(from);
        }

        const newMsgKey = new window.getStore().MsgKey({
            from: from,
            to: chat.id,
            id: newId,
            participant: participant,
            selfDir: 'out',
        });

        const extraOptions = options.extraOptions || {};
        delete options.extraOptions;

        const ephemeralFields = window.getStore().EphemeralFields.getEphemeralFields(chat);

        const message = {
            ...options,
            id: newMsgKey,
            ack: 0,
            body: content,
            from: from,
            to: chat.id,
            local: true,
            self: 'out',
            t: parseInt(new Date().getTime() / 1000),
            isNewMsg: true,
            type: 'chat',
            ...ephemeralFields,
            ...mediaOptions,
            ...(mediaOptions.toJSON ? mediaOptions.toJSON() : {}),
            ...quotedMsgOptions,
            ...locationOptions,
            ...pollOptions,
            ...eventOptions,
            ...vcardOptions,
            ...buttonOptions,
            ...listOptions,
            ...botOptions,
            ...extraOptions
        };

        // Bot's won't reply if canonicalUrl is set (linking)
        if (botOptions) {
            delete message.canonicalUrl;
        }

        if (isChannel) {
            const msg = new window.getStore().Msg.modelClass(message);
            const msgDataFromMsgModel = window.getStore().SendChannelMessage.msgDataFromMsgModel(msg);
            const isMedia = Object.keys(mediaOptions).length > 0;
            await window.getStore().SendChannelMessage.addNewsletterMsgsRecords([msgDataFromMsgModel]);
            chat.msgs.add(msg);
            chat.t = msg.t;

            const sendChannelMsgResponse = await window.getStore().SendChannelMessage.sendNewsletterMessageJob({
                msg: msg,
                type: message.type === 'chat' ? 'text' : isMedia ? 'media' : 'pollCreation',
                newsletterJid: chat.id.toJid(),
                ...(isMedia
                    ? {
                        mediaMetadata: msg.avParams(),
                        mediaHandle: isMedia ? mediaOptions.mediaHandle : null,
                    }
                    : {}
                )
            });

            if (sendChannelMsgResponse.success) {
                msg.t = sendChannelMsgResponse.ack.t;
                msg.serverId = sendChannelMsgResponse.serverId;
            }
            msg.updateAck(1, true);
            await window.getStore().SendChannelMessage.updateNewsletterMsgRecord(msg);
            return msg;
        }

        if (isStatus) {
            const { backgroundColor, fontStyle } = extraOptions;
            const isMedia = Object.keys(mediaOptions).length > 0;
            const mediaUpdate = data => window.getStore().MediaUpdate(data, mediaOptions);
            const msg = new window.getStore().Msg.modelClass({
                ...message,
                author: participant ? participant : null,
                messageSecret: window.crypto.getRandomValues(new Uint8Array(32)),
                cannotBeRanked: window.getStore().StatusUtils.canCheckStatusRankingPosterGating()
            });

            // for text only
            const statusOptions = {
                color: backgroundColor && WWebJS.assertColor(backgroundColor) || 0xff7acca5,
                font: fontStyle >= 0 && fontStyle <= 7 && fontStyle || 0,
                text: msg.body
            };

            await window.getStore().StatusUtils[
                isMedia ?
                    'sendStatusMediaMsgAction' : 'sendStatusTextMsgAction'
            ](
                ...(
                    isMedia ?
                        [msg, mediaUpdate] : [statusOptions]
                )
            );

            return msg;
        }

        const [msgPromise, sendMsgResultPromise] = window.getStore().SendMessage.addAndSendMsgToChat(chat, message);
        await msgPromise;

        if (options.waitUntilMsgSent) await sendMsgResultPromise;

        return window.getStore().Msg.get(newMsgKey._serialized);
    };

    WWebJS.editMessage = async (msg, content, options = {}) => {
        const extraOptions = options.extraOptions || {};
        delete options.extraOptions;

        if (options.mentionedJidList) {
            options.mentionedJidList = options.mentionedJidList.map((id) => window.getStore().WidFactory.createWid(id));
            options.mentionedJidList = options.mentionedJidList.filter(Boolean);
        }

        if (options.groupMentions) {
            options.groupMentions = options.groupMentions.map((e) => ({
                groupSubject: e.subject,
                groupJid: window.getStore().WidFactory.createWid(e.id)
            }));
        }

        if (options.linkPreview) {
            delete options.linkPreview;
            const link = window.getStore().Validators.findLink(content);
            if (link) {
                const preview = await window.getStore().LinkPreview.getLinkPreview(link);
                preview.preview = true;
                preview.subtype = 'url';
                options = { ...options, ...preview };
            }
        }


        const internalOptions = {
            ...options,
            ...extraOptions
        };

        await window.getStore().EditMessage.sendMessageEdit(msg, content, internalOptions);
        return window.getStore().Msg.get(msg.id._serialized);
    };

    WWebJS.toStickerData = async (mediaInfo) => {
        if (mediaInfo.mimetype == 'image/webp') return mediaInfo;

        const file = WWebJS.mediaInfoToFile(mediaInfo);
        const webpSticker = await window.getStore().StickerTools.toWebpSticker(file);
        const webpBuffer = await webpSticker.arrayBuffer();
        const data = WWebJS.arrayBufferToBase64(webpBuffer);

        return {
            mimetype: 'image/webp',
            data
        };
    };

    WWebJS.processStickerData = async (mediaInfo) => {
        if (mediaInfo.mimetype !== 'image/webp') throw new Error('Invalid media type');

        const file = WWebJS.mediaInfoToFile(mediaInfo);
        let filehash = await WWebJS.getFileHash(file);
        let mediaKey = await WWebJS.generateHash(32);

        const controller = new AbortController();
        const uploadedInfo = await window.getStore().UploadUtils.encryptAndUpload({
            blob: file,
            type: 'sticker',
            signal: controller.signal,
            mediaKey,
            uploadQpl: window.getStore().MediaUpload.startMediaUploadQpl({
                entryPoint: 'MediaUpload'
            }),
        });

        const stickerInfo = {
            ...uploadedInfo,
            clientUrl: uploadedInfo.url,
            deprecatedMms3Url: uploadedInfo.url,
            uploadhash: uploadedInfo.encFilehash,
            size: file.size,
            type: 'sticker',
            filehash
        };

        return stickerInfo;
    };

    WWebJS.processMediaData = async (mediaInfo, { forceSticker, forceGif, forceVoice, forceDocument, forceMediaHd, sendToChannel, sendToStatus }) => {
        const file = WWebJS.mediaInfoToFile(mediaInfo);
        const opaqueData = await window.getStore().OpaqueData.createFromData(file, mediaInfo.mimetype);
        const mediaParams = {
            asSticker: forceSticker,
            asGif: forceGif,
            isPtt: forceVoice,
            asDocument: forceDocument
        };

        if (forceMediaHd && file.type.indexOf('image/') === 0) {
            mediaParams.maxDimension = 2560;
        }

        const mediaPrep = window.getStore().MediaPrep.prepRawMedia(opaqueData, mediaParams);
        const mediaData = await mediaPrep.waitForPrep();
        const mediaObject = window.getStore().MediaObject.getOrCreateMediaObject(mediaData.filehash);
        const mediaType = window.getStore().MediaTypes.msgToMediaType({
            type: mediaData.type,
            isGif: mediaData.isGif,
            isNewsletter: sendToChannel,
        });

        if (!mediaData.filehash) {
            throw new Error('media-fault: sendToChat filehash undefined');
        }

        if ((forceVoice && mediaData.type === 'ptt') || (sendToStatus && mediaData.type === 'audio')) {
            const waveform = mediaObject.contentInfo.waveform;
            mediaData.waveform =
                waveform || await WWebJS.generateWaveform(file);
        }

        if (!(mediaData.mediaBlob instanceof window.getStore().OpaqueData)) {
            mediaData.mediaBlob = await window.getStore().OpaqueData.createFromData(
                mediaData.mediaBlob,
                mediaData.mediaBlob.type
            );
        }

        mediaData.renderableUrl = mediaData.mediaBlob.url();
        mediaObject.consolidate(mediaData.toJSON());

        mediaData.mediaBlob.autorelease();
        const shouldUseMediaCache = window.getStore().MediaDataUtils.shouldUseMediaCache(
            window.getStore().MediaTypes.castToV4(mediaObject.type)
        );
        if (shouldUseMediaCache && mediaData.mediaBlob instanceof window.getStore().OpaqueData) {
            const formData = mediaData.mediaBlob.formData();
            window.getStore().BlobCache.InMemoryMediaBlobCache.put(mediaObject.filehash, formData);
        }

        const dataToUpload = {
            mimetype: mediaData.mimetype,
            mediaObject,
            mediaType,
            ...(sendToChannel ? { calculateToken: window.getStore().SendChannelMessage.getRandomFilehash } : {})
        };

        const uploadedMedia = !sendToChannel
            ? await window.getStore().MediaUpload.uploadMedia(dataToUpload)
            : await window.getStore().MediaUpload.uploadUnencryptedMedia(dataToUpload);

        const mediaEntry = uploadedMedia.mediaEntry;
        if (!mediaEntry) {
            throw new Error('upload failed: media entry was not created');
        }

        mediaData.set({
            clientUrl: mediaEntry.mmsUrl,
            deprecatedMms3Url: mediaEntry.deprecatedMms3Url,
            directPath: mediaEntry.directPath,
            mediaKey: mediaEntry.mediaKey,
            mediaKeyTimestamp: mediaEntry.mediaKeyTimestamp,
            filehash: mediaObject.filehash,
            encFilehash: mediaEntry.encFilehash,
            uploadhash: mediaEntry.uploadHash,
            size: mediaObject.size,
            streamingSidecar: mediaEntry.sidecar,
            firstFrameSidecar: mediaEntry.firstFrameSidecar,
            mediaHandle: sendToChannel ? mediaEntry.handle : null,
        });

        return mediaData;
    };

    WWebJS.getMessageModel = (message) => {
        const msg = message.serialize();

        msg.isEphemeral = message.isEphemeral;
        msg.isStatusV3 = message.isStatusV3;
        msg.links = (window.getStore().Validators.findLinks(message.mediaObject ? message.caption : message.body)).map((link) => ({
            link: link.href,
            isSuspicious: Boolean(link.suspiciousCharacters && link.suspiciousCharacters.size)
        }));

        if (msg.buttons) {
            msg.buttons = msg.buttons.serialize();
        }
        if (msg.dynamicReplyButtons) {
            msg.dynamicReplyButtons = JSON.parse(JSON.stringify(msg.dynamicReplyButtons));
        }
        if (msg.replyButtons) {
            msg.replyButtons = JSON.parse(JSON.stringify(msg.replyButtons));
        }

        if (typeof msg.id.remote === 'object') {
            msg.id = Object.assign({}, msg.id, { remote: msg.id.remote._serialized });
        }

        delete msg.pendingAckUpdate;

        return msg;
    };

    WWebJS.getChat = async (chatId, { getAsModel = true } = {}) => {
        const isChannel = /@\w*newsletter\b/.test(chatId);
        const chatWid = window.getStore().WidFactory.createWid(chatId);
        let chat;

        if (isChannel) {
            try {
                chat = window.getStore().WAWebNewsletterMetadataCollection.get(chatId);
                if (!chat) {
                    await window.getStore().ChannelUtils.loadNewsletterPreviewChat(chatId);
                    chat = await window.getStore().WAWebNewsletterMetadataCollection.find(chatWid);
                }
            } catch (err) {
                chat = null;
            }
        } else {
            chat = window.getStore().Chat.get(chatWid) || (await window.getStore().FindOrCreateChat.findOrCreateLatestChat(chatWid))?.chat;
        }

        return getAsModel && chat
            ? await WWebJS.getChatModel(chat, { isChannel: isChannel })
            : chat;
    };

    WWebJS.getChannelMetadata = async (inviteCode) => {
        const response =
            await window.getStore().ChannelUtils.queryNewsletterMetadataByInviteCode(
                inviteCode,
                window.getStore().ChannelUtils.getRoleByIdentifier(inviteCode)
            );

        const picUrl = response.newsletterPictureMetadataMixin?.picture[0]?.queryPictureDirectPathOrEmptyResponseMixinGroup.value.directPath;

        return {
            id: response.idJid,
            createdAtTs: response.newsletterCreationTimeMetadataMixin.creationTimeValue,
            titleMetadata: {
                title: response.newsletterNameMetadataMixin.nameElementValue,
                updatedAtTs: response.newsletterNameMetadataMixin.nameUpdateTime
            },
            descriptionMetadata: {
                description: response.newsletterDescriptionMetadataMixin.descriptionQueryDescriptionResponseMixin.elementValue,
                updatedAtTs: response.newsletterDescriptionMetadataMixin.descriptionQueryDescriptionResponseMixin.updateTime
            },
            inviteLink: `https://whatsapp.com/channel/${response.newsletterInviteLinkMetadataMixin.inviteCode}`,
            membershipType: window.getStore().ChannelUtils.getRoleByIdentifier(inviteCode),
            stateType: response.newsletterStateMetadataMixin.stateType,
            pictureUrl: picUrl ? `https://pps.whatsapp.net${picUrl}` : null,
            subscribersCount: response.newsletterSubscribersMetadataMixin.subscribersCount,
            isVerified: response.newsletterVerificationMetadataMixin.verificationState === 'verified'
        };
    };

    WWebJS.getChats = async () => {
        const chats = window.getStore().Chat.getModelsArray();
        const chatPromises = chats.map(chat => WWebJS.getChatModel(chat));
        return await Promise.all(chatPromises);
    };

    WWebJS.getChannels = async () => {
        const channels = window.getStore().WAWebNewsletterMetadataCollection.getModelsArray();
        const channelPromises = channels?.map((channel) => WWebJS.getChatModel(channel, { isChannel: true }));
        return await Promise.all(channelPromises);
    };

    WWebJS.getChatModel = async (chat, { isChannel = false } = {}) => {
        if (!chat) return null;

        const model = chat.serialize();
        model.isGroup = false;
        model.isMuted = chat.mute?.expiration !== 0;
        if (isChannel) {
            model.isChannel = window.getStore().ChatGetters.getIsNewsletter(chat);
        } else {
            model.formattedTitle = chat.formattedTitle;
        }

        if (chat.groupMetadata) {
            model.isGroup = true;
            const chatWid = window.getStore().WidFactory.createWid(chat.id._serialized);
            const groupMetadata = window.getStore().GroupMetadata || window.getStore().WAWebGroupMetadataCollection;
            await groupMetadata.update(chatWid);
            chat.groupMetadata.participants._models
                .filter(x => x.id?._serialized?.endsWith('@lid'))
                .forEach(x => x.contact?.phoneNumber && (x.id = x.contact.phoneNumber));
            model.groupMetadata = chat.groupMetadata.serialize();
            model.isReadOnly = chat.groupMetadata.announce;
        }

        if (chat.newsletterMetadata) {
            const newsletterMetadata = window.getStore().NewsletterMetadataCollection || window.getStore().WAWebNewsletterMetadataCollection;
            await newsletterMetadata.update(chat.id);
            model.channelMetadata = chat.newsletterMetadata.serialize();
            model.channelMetadata.createdAtTs = chat.newsletterMetadata.creationTime;
        }

        model.lastMessage = null;
        if (model.msgs && model.msgs.length) {
            const lastMessage = chat.lastReceivedKey
                ? window.getStore().Msg.get(chat.lastReceivedKey._serialized) || (await window.getStore().Msg.getMessagesById([chat.lastReceivedKey._serialized]))?.messages?.[0]
                : null;
            lastMessage && (model.lastMessage = WWebJS.getMessageModel(lastMessage));
        }

        delete model.msgs;
        delete model.msgUnsyncedButtonReplyMsgs;
        delete model.unsyncedButtonReplies;

        return model;
    };

    WWebJS.getContactModel = contact => {
        let res = contact.serialize();
        res.isBusiness = contact.isBusiness === undefined ? false : contact.isBusiness;

        if (contact.businessProfile) {
            res.businessProfile = contact.businessProfile.serialize();
        }

        res.isMe = window.getStore().ContactMethods.getIsMe(contact);
        res.isUser = window.getStore().ContactMethods.getIsUser(contact);
        res.isGroup = window.getStore().ContactMethods.getIsGroup(contact);
        res.isWAContact = window.getStore().ContactMethods.getIsWAContact(contact);
        res.isMyContact = window.getStore().ContactMethods.getIsMyContact(contact);
        res.isBlocked = contact.isContactBlocked;
        res.userid = window.getStore().ContactMethods.getUserid(contact);
        res.isEnterprise = window.getStore().ContactMethods.getIsEnterprise(contact);
        res.verifiedName = window.getStore().ContactMethods.getVerifiedName(contact);
        res.verifiedLevel = window.getStore().ContactMethods.getVerifiedLevel(contact);
        res.statusMute = window.getStore().ContactMethods.getStatusMute(contact);
        res.name = window.getStore().ContactMethods.getName(contact);
        res.shortName = window.getStore().ContactMethods.getShortName(contact);
        res.pushname = window.getStore().ContactMethods.getPushname(contact);

        return res;
    };

    WWebJS.getContact = async contactId => {
        const wid = window.getStore().WidFactory.createWid(contactId);
        let contact = await window.getStore().Contact.find(wid);
        if (contact.id._serialized.endsWith('@lid')) {
            contact.id = contact.phoneNumber;
        }
        const bizProfile = await window.getStore().BusinessProfile.fetchBizProfile(wid);
        bizProfile.profileOptions && (contact.businessProfile = bizProfile);
        return WWebJS.getContactModel(contact);
    };

    WWebJS.getContacts = () => {
        const contacts = window.getStore().Contact.getModelsArray();
        return contacts.map(contact => WWebJS.getContactModel(contact));
    };

    WWebJS.mediaInfoToFile = ({ data, mimetype, filename }) => {
        const binaryData = window.atob(data);

        const buffer = new ArrayBuffer(binaryData.length);
        const view = new Uint8Array(buffer);
        for (let i = 0; i < binaryData.length; i++) {
            view[i] = binaryData.charCodeAt(i);
        }

        const blob = new Blob([buffer], { type: mimetype });
        return new File([blob], filename, {
            type: mimetype,
            lastModified: Date.now()
        });
    };

    WWebJS.arrayBufferToBase64 = (arrayBuffer) => {
        let binary = '';
        const bytes = new Uint8Array(arrayBuffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    };

    WWebJS.arrayBufferToBase64Async = (arrayBuffer) =>
        new Promise((resolve, reject) => {
            const blob = new Blob([arrayBuffer], {
                type: 'application/octet-stream',
            });
            const fileReader = new FileReader();
            fileReader.onload = () => {
                const [, data] = fileReader.result.split(',');
                resolve(data);
            };
            fileReader.onerror = (e) => reject(e);
            fileReader.readAsDataURL(blob);
        });

    WWebJS.getFileHash = async (data) => {
        let buffer = await data.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        return btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
    };

    WWebJS.generateHash = async (length) => {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    };

    WWebJS.generateWaveform = async (audioFile) => {
        try {
            const audioData = await audioFile.arrayBuffer();
            const audioContext = new AudioContext();
            const audioBuffer = await audioContext.decodeAudioData(audioData);

            const rawData = audioBuffer.getChannelData(0);
            const samples = 64;
            const blockSize = Math.floor(rawData.length / samples);
            const filteredData = [];
            for (let i = 0; i < samples; i++) {
                const blockStart = blockSize * i;
                let sum = 0;
                for (let j = 0; j < blockSize; j++) {
                    sum = sum + Math.abs(rawData[blockStart + j]);
                }
                filteredData.push(sum / blockSize);
            }

            const multiplier = Math.pow(Math.max(...filteredData), -1);
            const normalizedData = filteredData.map((n) => n * multiplier);

            const waveform = new Uint8Array(
                normalizedData.map((n) => Math.floor(100 * n))
            );

            return waveform;
        } catch (e) {
            return undefined;
        }
    };

    WWebJS.sendClearChat = async (chatId) => {
        let chat = await WWebJS.getChat(chatId, { getAsModel: false });
        if (chat !== undefined) {
            await window.getStore().SendClear.sendClear(chat, false);
            return true;
        }
        return false;
    };

    WWebJS.sendDeleteChat = async (chatId) => {
        let chat = await WWebJS.getChat(chatId, { getAsModel: false });
        if (chat !== undefined) {
            await window.getStore().SendDelete.sendDelete(chat);
            return true;
        }
        return false;
    };

    WWebJS.sendChatstate = async (state, chatId) => {
        chatId = window.getStore().WidFactory.createWid(chatId);

        switch (state) {
            case 'typing':
                await window.getStore().ChatState.sendChatStateComposing(chatId);
                break;
            case 'recording':
                await window.getStore().ChatState.sendChatStateRecording(chatId);
                break;
            case 'stop':
                await window.getStore().ChatState.sendChatStatePaused(chatId);
                break;
            default:
                throw 'Invalid chatstate';
        }

        return true;
    };

    WWebJS.getLabelModel = label => {
        let res = label.serialize();
        res.hexColor = label.hexColor;

        return res;
    };

    WWebJS.getLabels = () => {
        const labels = window.getStore().Label.getModelsArray();
        return labels.map(label => WWebJS.getLabelModel(label));
    };

    WWebJS.getLabel = (labelId) => {
        const label = window.getStore().Label.get(labelId);
        return WWebJS.getLabelModel(label);
    };

    WWebJS.getChatLabels = async (chatId) => {
        const chat = await WWebJS.getChat(chatId, { getAsModel: false });
        return (chat.labels || []).map(id => WWebJS.getLabel(id));
    };

    WWebJS.getOrderDetail = async (orderId, token, chatId) => {
        const chatWid = window.getStore().WidFactory.createWid(chatId);
        return window.getStore().QueryOrder.queryOrder(chatWid, orderId, 80, 80, token);
    };

    WWebJS.getProductMetadata = async (productId) => {
        let sellerId = window.getStore().Conn.wid;
        let product = await window.getStore().QueryProduct.queryProduct(sellerId, productId);
        if (product && product.data) {
            return product.data;
        }

        return undefined;
    };

    WWebJS.rejectCall = async (peerJid, id) => {
        peerJid = window.getStore().WidFactory.createWid(peerJid);
        await window.getStore().Socket.sendCallEnd(peerJid, id);
    };

    WWebJS.setPicture = async (chatid, media) => {
        const thumbnail = await WWebJS.processMediaData(media, { forceSticker: false, forceGif: false, forceVoice: false, forceDocument: false, forceMediaHd: false, sendToChannel: false, sendToStatus: false });

        if (!thumbnail) throw 'Invalid media';

        const chatWid = window.getStore().WidFactory.createWid(chatid);
        try {
            const profilePic = await window.getStore().GroupUtils.sendSetPicture(chatWid, thumbnail.preview, thumbnail.preview);
            return profilePic ? profilePic.status === 200 : false;
        } catch (err) {
            if (err.name === 'ServerStatusCodeError') return false;
            throw err;
        }
    };

    WWebJS.deletePicture = async (chatid) => {
        const chatWid = window.getStore().WidFactory.createWid(chatid);
        try {
            const res = await window.getStore().GroupUtils.requestDeletePicture(chatWid);
            return res.status === 200;
        } catch (err) {
            if (err.name === 'ServerStatusCodeError') return false;
            throw err;
        }
    };

    WWebJS.assertColor = (color) => {
        if (typeof color !== 'number' || Number.isNaN(color)) {
            throw 'Invalid color';
        }
        return color;
    };

    WWebJS.assertColorHex = (hex) => {
        if (typeof hex !== 'string') {
            throw 'Invalid hex color';
        }
        let number = hex;
        if (hex.startsWith('#')) {
            number = hex.slice(1);
        }
        if (number.length === 3) {
            number = number.split('').map(n => n + n).join('');
        }
        if (number.length === 6 || number.length === 8) {
            if (number.length === 6) {
                number = 'FF' + number.padStart(6, '0');
            }
            color = parseInt(number, 16);
        } else {
            throw 'Invalid hex color';
        }
        return color;
    };

    trackUtilsStep('8.2', 'Define WWebJS methods', 'complete');

    if (failedMethods.length > 0) {
        console.warn(`[Utils.js] Failed to define ${failedMethods.length} methods:`, failedMethods);
        trackUtilsError('8.2', 'Define WWebJS methods',
            `Failed to define ${failedMethods.length} methods: ${failedMethods.join(', ')}`,
            { failedMethods }
        );
    }

    // Create getter function
    trackUtilsStep('8.3', 'Expose WWebJS on window', 'start');
    try {
        const getWWebJSFunc = () => WWebJS;

        // Copy all WWebJS methods to the function object itself
        // This allows both window.getWWebJS() and window.getWWebJS.method() to work
        Object.assign(getWWebJSFunc, WWebJS);

        // Expose WWebJS getter function on window
        window.getWWebJS = getWWebJSFunc;

        // Verify the assignment worked
        if (typeof window.getWWebJS !== 'function') {
            throw new Error('window.getWWebJS was not properly assigned as a function');
        }

        const testResult = window.getWWebJS();
        if (!testResult || typeof testResult !== 'object') {
            throw new Error('window.getWWebJS() does not return a valid WWebJS object');
        }

        trackUtilsStep('8.3', 'Expose WWebJS on window', 'complete');
    } catch (error) {
        trackUtilsError('8.3', 'Expose WWebJS on window', error, {
            windowGetWWebJS: typeof window.getWWebJS,
            WWebJSMethodCount: Object.keys(WWebJS).length
        });
        throw error; // Re-throw as this is critical
    }

    trackUtilsStep('8.0', 'LoadUtils initialization', 'complete');
    console.log('%c[INIT Utils.js] ✅ LoadUtils completed successfully - WWebJS has ' + Object.keys(WWebJS).length + ' methods', 'color: #4CAF50; font-weight: bold; font-size: 12px;');
};
