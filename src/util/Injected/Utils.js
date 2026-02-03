'use strict';

exports.LoadUtils = () => {
    window.getWWebJS = {};

    window.getWWebJS.forwardMessage = async (chatId, msgId) => {
        const msg = window.getStore().Msg.get(msgId) || (await window.getStore().Msg.getMessagesById([msgId]))?.messages?.[0];
        const chat = await window.getWWebJS.getChat(chatId, { getAsModel: false });
        return await window.getStore().ForwardUtils.forwardMessages({ 'chat': chat, 'msgs': [msg], 'multicast': true, 'includeCaption': true, 'appendedText': undefined });
    };

    window.getWWebJS.sendSeen = async (chatId) => {
        const chat = await window.getWWebJS.getChat(chatId, { getAsModel: false });
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

    window.getWWebJS.sendMessage = async (chat, content, options = {}) => {
        const isChannel = window.getStore().ChatGetters.getIsNewsletter(chat);
        const isStatus = window.getStore().ChatGetters.getIsBroadcast(chat);

        let mediaOptions = {};
        if (options.media) {
            mediaOptions = options.sendMediaAsSticker && !isChannel && !isStatus
                ? await window.getWWebJS.processStickerData(options.media)
                : await window.getWWebJS.processMediaData(options.media, {
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
                color: backgroundColor && window.getWWebJS.assertColor(backgroundColor) || 0xff7acca5,
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

    window.getWWebJS.editMessage = async (msg, content, options = {}) => {
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

    window.getWWebJS.toStickerData = async (mediaInfo) => {
        if (mediaInfo.mimetype == 'image/webp') return mediaInfo;

        const file = window.getWWebJS.mediaInfoToFile(mediaInfo);
        const webpSticker = await window.getStore().StickerTools.toWebpSticker(file);
        const webpBuffer = await webpSticker.arrayBuffer();
        const data = window.getWWebJS.arrayBufferToBase64(webpBuffer);

        return {
            mimetype: 'image/webp',
            data
        };
    };

    window.getWWebJS.processStickerData = async (mediaInfo) => {
        if (mediaInfo.mimetype !== 'image/webp') throw new Error('Invalid media type');

        const file = window.getWWebJS.mediaInfoToFile(mediaInfo);
        let filehash = await window.getWWebJS.getFileHash(file);
        let mediaKey = await window.getWWebJS.generateHash(32);

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

    window.getWWebJS.processMediaData = async (mediaInfo, { forceSticker, forceGif, forceVoice, forceDocument, forceMediaHd, sendToChannel, sendToStatus }) => {
        const file = window.getWWebJS.mediaInfoToFile(mediaInfo);
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
                waveform || await window.getWWebJS.generateWaveform(file);
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

    window.getWWebJS.getMessageModel = (message) => {
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

    window.getWWebJS.getChat = async (chatId, { getAsModel = true } = {}) => {
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
            ? await window.getWWebJS.getChatModel(chat, { isChannel: isChannel })
            : chat;
    };

    window.getWWebJS.getChannelMetadata = async (inviteCode) => {
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

    window.getWWebJS.getChats = async () => {
        const chats = window.getStore().Chat.getModelsArray();
        const chatPromises = chats.map(chat => window.getWWebJS.getChatModel(chat));
        return await Promise.all(chatPromises);
    };

    window.getWWebJS.getChannels = async () => {
        const channels = window.getStore().WAWebNewsletterMetadataCollection.getModelsArray();
        const channelPromises = channels?.map((channel) => window.getWWebJS.getChatModel(channel, { isChannel: true }));
        return await Promise.all(channelPromises);
    };

    window.getWWebJS.getChatModel = async (chat, { isChannel = false } = {}) => {
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
            lastMessage && (model.lastMessage = window.getWWebJS.getMessageModel(lastMessage));
        }

        delete model.msgs;
        delete model.msgUnsyncedButtonReplyMsgs;
        delete model.unsyncedButtonReplies;

        return model;
    };

    window.getWWebJS.getContactModel = contact => {
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

    window.getWWebJS.getContact = async contactId => {
        const wid = window.getStore().WidFactory.createWid(contactId);
        let contact = await window.getStore().Contact.find(wid);
        if (contact.id._serialized.endsWith('@lid')) {
            contact.id = contact.phoneNumber;
        }
        const bizProfile = await window.getStore().BusinessProfile.fetchBizProfile(wid);
        bizProfile.profileOptions && (contact.businessProfile = bizProfile);
        return window.getWWebJS.getContactModel(contact);
    };

    window.getWWebJS.getContacts = () => {
        const contacts = window.getStore().Contact.getModelsArray();
        return contacts.map(contact => window.getWWebJS.getContactModel(contact));
    };

    window.getWWebJS.mediaInfoToFile = ({ data, mimetype, filename }) => {
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

    window.getWWebJS.arrayBufferToBase64 = (arrayBuffer) => {
        let binary = '';
        const bytes = new Uint8Array(arrayBuffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    };

    window.getWWebJS.arrayBufferToBase64Async = (arrayBuffer) =>
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

    window.getWWebJS.getFileHash = async (data) => {
        let buffer = await data.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        return btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
    };

    window.getWWebJS.generateHash = async (length) => {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    };

    window.getWWebJS.generateWaveform = async (audioFile) => {
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

    window.getWWebJS.sendClearChat = async (chatId) => {
        let chat = await window.getWWebJS.getChat(chatId, { getAsModel: false });
        if (chat !== undefined) {
            await window.getStore().SendClear.sendClear(chat, false);
            return true;
        }
        return false;
    };

    window.getWWebJS.sendDeleteChat = async (chatId) => {
        let chat = await window.getWWebJS.getChat(chatId, { getAsModel: false });
        if (chat !== undefined) {
            await window.getStore().SendDelete.sendDelete(chat);
            return true;
        }
        return false;
    };

    window.getWWebJS.sendChatstate = async (state, chatId) => {
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

    window.getWWebJS.getLabelModel = label => {
        let res = label.serialize();
        res.hexColor = label.hexColor;

        return res;
    };

    window.getWWebJS.getLabels = () => {
        const labels = window.getStore().Label.getModelsArray();
        return labels.map(label => window.getWWebJS.getLabelModel(label));
    };

    window.getWWebJS.getLabel = (labelId) => {
        const label = window.getStore().Label.get(labelId);
        return window.getWWebJS.getLabelModel(label);
    };

    window.getWWebJS.getChatLabels = async (chatId) => {
        const chat = await window.getWWebJS.getChat(chatId);
        return (chat.labels || []).map(id => window.getWWebJS.getLabel(id));
    };

    window.getWWebJS.getOrderDetail = async (orderId, token, chatId) => {
        const chatWid = window.getStore().WidFactory.createWid(chatId);
        return window.getStore().QueryOrder.queryOrder(chatWid, orderId, 80, 80, token);
    };

    window.getWWebJS.getProductMetadata = async (productId) => {
        let sellerId = window.getStore().Conn.wid;
        let product = await window.getStore().QueryProduct.queryProduct(sellerId, productId);
        if (product && product.data) {
            return product.data;
        }

        return undefined;
    };

    window.getWWebJS.rejectCall = async (peerJid, id) => {
        let userId = window.getStore().User.getMaybeMePnUser()._serialized;

        const stanza = window.getStore().SocketWap.wap('call', {
            id: window.getStore().SocketWap.generateId(),
            from: userId,
            to: peerJid,
        }, [
            window.getStore().SocketWap.wap('reject', {
                'call-id': id,
                'call-creator': peerJid,
                count: '0',
            })
        ]);
        await window.getStore().Socket.deprecatedCastStanza(stanza);
    };

    window.getWWebJS.cropAndResizeImage = async (media, options = {}) => {
        if (!media.mimetype.includes('image'))
            throw new Error('Media is not an image');

        if (options.mimetype && !options.mimetype.includes('image'))
            delete options.mimetype;

        options = Object.assign({ size: 640, mimetype: media.mimetype, quality: .75, asDataUrl: false }, options);

        const img = await new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = `data:${media.mimetype};base64,${media.data}`;
        });

        const sl = Math.min(img.width, img.height);
        const sx = Math.floor((img.width - sl) / 2);
        const sy = Math.floor((img.height - sl) / 2);

        const canvas = document.createElement('canvas');
        canvas.width = options.size;
        canvas.height = options.size;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, sx, sy, sl, sl, 0, 0, options.size, options.size);

        const dataUrl = canvas.toDataURL(options.mimetype, options.quality);

        if (options.asDataUrl)
            return dataUrl;

        return Object.assign(media, {
            mimetype: options.mimetype,
            data: dataUrl.replace(`data:${options.mimetype};base64,`, '')
        });
    };

    window.getWWebJS.setPicture = async (chatId, media) => {
        const thumbnail = await window.getWWebJS.cropAndResizeImage(media, { asDataUrl: true, mimetype: 'image/jpeg', size: 96 });
        const profilePic = await window.getWWebJS.cropAndResizeImage(media, { asDataUrl: true, mimetype: 'image/jpeg', size: 640 });

        const chatWid = window.getStore().WidFactory.createWid(chatId);
        try {
            const collection = window.getStore().ProfilePicThumb.get(chatId) || await window.getStore().ProfilePicThumb.find(chatId);
            if (!collection?.canSet()) return false;

            const res = await window.getStore().GroupUtils.sendSetPicture(chatWid, thumbnail, profilePic);
            return res ? res.status === 200 : false;
        } catch (err) {
            if (err.name === 'ServerStatusCodeError') return false;
            throw err;
        }
    };

    window.getWWebJS.deletePicture = async (chatid) => {
        const chatWid = window.getStore().WidFactory.createWid(chatid);
        try {
            const collection = window.getStore().ProfilePicThumb.get(chatid);
            if (!collection.canDelete()) return;

            const res = await window.getStore().GroupUtils.requestDeletePicture(chatWid);
            return res ? res.status === 200 : false;
        } catch (err) {
            if (err.name === 'ServerStatusCodeError') return false;
            throw err;
        }
    };

    window.getWWebJS.getProfilePicThumbToBase64 = async (chatWid) => {
        const profilePicCollection = await window.getStore().ProfilePicThumb.find(chatWid);

        const _readImageAsBase64 = (imageBlob) => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = function () {
                    const base64Image = reader.result;
                    if (base64Image == null) {
                        resolve(undefined);
                    } else {
                        const base64Data = base64Image.toString().split(',')[1];
                        resolve(base64Data);
                    }
                };
                reader.readAsDataURL(imageBlob);
            });
        };

        if (profilePicCollection?.img) {
            try {
                const response = await fetch(profilePicCollection.img);
                if (response.ok) {
                    const imageBlob = await response.blob();
                    if (imageBlob) {
                        const base64Image = await _readImageAsBase64(imageBlob);
                        return base64Image;
                    }
                }
            } catch (error) { /* empty */ }
        }
        return undefined;
    };

    window.getWWebJS.getAddParticipantsRpcResult = async (groupWid, participantWid) => {
        const iqTo = window.getStore().WidToJid.widToGroupJid(groupWid);

        const participantArgs = [{
            participantJid: window.getStore().WidToJid.widToUserJid(participantWid)
        }];

        let rpcResult, resultArgs;
        const data = {
            name: undefined,
            code: undefined,
            inviteV4Code: undefined,
            inviteV4CodeExp: undefined
        };

        try {
            rpcResult = await window.getStore().GroupParticipants.sendAddParticipantsRPC({ participantArgs, iqTo });
            resultArgs = rpcResult.value.addParticipant[0]
                .addParticipantsParticipantAddedOrNonRegisteredWaUserParticipantErrorLidResponseMixinGroup
                .value
                .addParticipantsParticipantMixins;
        } catch (err) {
            data.code = 400;
            return data;
        }

        if (rpcResult.name === 'AddParticipantsResponseSuccess') {
            const code = resultArgs?.value.error || '200';
            data.name = resultArgs?.name;
            data.code = +code;
            data.inviteV4Code = resultArgs?.value.addRequestCode;
            data.inviteV4CodeExp = resultArgs?.value.addRequestExpiration?.toString();
        }

        else if (rpcResult.name === 'AddParticipantsResponseClientError') {
            const { code: code } = rpcResult.value.errorAddParticipantsClientErrors.value;
            data.code = +code;
        }

        else if (rpcResult.name === 'AddParticipantsResponseServerError') {
            const { code: code } = rpcResult.value.errorServerErrors.value;
            data.code = +code;
        }

        return data;
    };

    window.getWWebJS.membershipRequestAction = async (groupId, action, requesterIds, sleep) => {
        const groupWid = window.getStore().WidFactory.createWid(groupId);
        const group = await window.getStore().Chat.find(groupWid);
        const toApprove = action === 'Approve';
        let membershipRequests;
        let response;
        let result = [];

        await window.getStore().GroupQueryAndUpdate({ id: groupId });

        if (!requesterIds?.length) {
            membershipRequests = group.groupMetadata.membershipApprovalRequests._models.map(({ id }) => id);
        } else {
            !Array.isArray(requesterIds) && (requesterIds = [requesterIds]);
            membershipRequests = requesterIds.map(r => window.getStore().WidFactory.createWid(r));
        }

        if (!membershipRequests.length) return [];

        const participantArgs = membershipRequests.map(m => ({
            participantArgs: [
                {
                    participantJid: window.getStore().WidToJid.widToUserJid(m)
                }
            ]
        }));

        const groupJid = window.getStore().WidToJid.widToGroupJid(groupWid);

        const _getSleepTime = (sleep) => {
            if (!Array.isArray(sleep) || (sleep.length === 2 && sleep[0] === sleep[1])) {
                return sleep;
            }
            if (sleep.length === 1) {
                return sleep[0];
            }
            sleep[1] - sleep[0] < 100 && (sleep[0] = sleep[1]) && (sleep[1] += 100);
            return Math.floor(Math.random() * (sleep[1] - sleep[0] + 1)) + sleep[0];
        };

        const membReqResCodes = {
            default: `An unknown error occupied while ${toApprove ? 'approving' : 'rejecting'} the participant membership request`,
            400: 'ParticipantNotFoundError',
            401: 'ParticipantNotAuthorizedError',
            403: 'ParticipantForbiddenError',
            404: 'ParticipantRequestNotFoundError',
            408: 'ParticipantTemporarilyBlockedError',
            409: 'ParticipantConflictError',
            412: 'ParticipantParentLinkedGroupsResourceConstraintError',
            500: 'ParticipantResourceConstraintError'
        };

        try {
            for (const participant of participantArgs) {
                response = await window.getStore().MembershipRequestUtils.sendMembershipRequestsActionRPC({
                    iqTo: groupJid,
                    [toApprove ? 'approveArgs' : 'rejectArgs']: participant
                });

                if (response.name === 'MembershipRequestsActionResponseSuccess') {
                    const value = toApprove
                        ? response.value.membershipRequestsActionApprove
                        : response.value.membershipRequestsActionReject;
                    if (value?.participant) {
                        const [_] = value.participant.map(p => {
                            const error = toApprove
                                ? value.participant[0].membershipRequestsActionAcceptParticipantMixins?.value.error
                                : value.participant[0].membershipRequestsActionRejectParticipantMixins?.value.error;
                            return {
                                requesterId: window.getStore().WidFactory.createWid(p.jid)._serialized,
                                ...(error
                                    ? { error: +error, message: membReqResCodes[error] || membReqResCodes.default }
                                    : { message: `${toApprove ? 'Approved' : 'Rejected'} successfully` })
                            };
                        });
                        _ && result.push(_);
                    }
                } else {
                    result.push({
                        requesterId: window.getStore().JidToWid.userJidToUserWid(participant.participantArgs[0].participantJid)._serialized,
                        message: 'ServerStatusCodeError'
                    });
                }

                sleep &&
                    participantArgs.length > 1 &&
                    participantArgs.indexOf(participant) !== participantArgs.length - 1 &&
                    (await new Promise((resolve) => setTimeout(resolve, _getSleepTime(sleep))));
            }
            return result;
        } catch (err) {
            return [];
        }
    };

    window.getWWebJS.subscribeToUnsubscribeFromChannel = async (channelId, action, options = {}) => {
        const channel = await window.getWWebJS.getChat(channelId, { getAsModel: false });

        if (!channel || channel.newsletterMetadata.membershipType === 'owner') return false;
        options = { eventSurface: 3, deleteLocalModels: options.deleteLocalModels ?? true };

        try {
            if (action === 'Subscribe') {
                await window.getStore().ChannelUtils.subscribeToNewsletterAction(channel, options);
            } else if (action === 'Unsubscribe') {
                await window.getStore().ChannelUtils.unsubscribeFromNewsletterAction(channel, options);
            } else return false;
            return true;
        } catch (err) {
            if (err.name === 'ServerStatusCodeError') return false;
            throw err;
        }
    };

    window.getWWebJS.pinUnpinMsgAction = async (msgId, action, duration) => {
        const message = window.getStore().Msg.get(msgId) || (await window.getStore().Msg.getMessagesById([msgId]))?.messages?.[0];
        if (!message) return false;

        if (typeof duration !== 'number') return false;

        const originalFunction = window.require('WAWebPinMsgConstants').getPinExpiryDuration;
        window.require('WAWebPinMsgConstants').getPinExpiryDuration = () => duration;

        const response = await window.getStore().PinnedMsgUtils.sendPinInChatMsg(message, action, duration);

        window.require('WAWebPinMsgConstants').getPinExpiryDuration = originalFunction;

        return response.messageSendResult === 'OK';
    };

    window.getWWebJS.getStatusModel = status => {
        const res = status.serialize();
        delete res._msgs;
        return res;
    };

    window.getWWebJS.getAllStatuses = () => {
        const statuses = window.getStore().Status.getModelsArray();
        return statuses.map(status => window.getWWebJS.getStatusModel(status));
    };

    window.getWWebJS.enforceLidAndPnRetrieval = async (userId) => {
        const wid = window.getStore().WidFactory.createWid(userId);
        const isLid = wid.server === 'lid';

        let lid = isLid ? wid : window.getStore().LidUtils.getCurrentLid(wid);
        let phone = isLid ? window.getStore().LidUtils.getPhoneNumber(wid) : wid;

        if (!isLid && !lid) {
            const queryResult = await window.getStore().QueryExist(wid);
            if (!queryResult?.wid) return {};
            lid = window.getStore().LidUtils.getCurrentLid(wid);
        }

        if (isLid && !phone) {
            const queryResult = await window.getStore().QueryExist(wid);
            if (!queryResult?.wid) return {};
            phone = window.getStore().LidUtils.getPhoneNumber(wid);
        }

        return { lid, phone };
    };

    window.getWWebJS.assertColor = (hex) => {
        let color;
        if (typeof hex === 'number') {
            color = hex > 0 ? hex : 0xffffffff + parseInt(hex) + 1;
        } else if (typeof hex === 'string') {
            let number = hex.trim().replace('#', '');
            if (number.length <= 6) {
                number = 'FF' + number.padStart(6, '0');
            }
            color = parseInt(number, 16);
        } else {
            throw 'Invalid hex color';
        }
        return color;
    };
};
