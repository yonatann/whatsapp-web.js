const { expect } = require('chai');

// FE#179 — enforceLidAndPnRetrieval must resolve the LID/phone against the
// server-CANONICAL wid returned by queryWidExists, not the caller's dialed wid.
// For numbers WhatsApp canonicalizes (Brazilian 9th-digit 13-digit numbers), the
// LID is only mapped under the canonical form; reading it from the dialed form
// returns null → the send fails "No LID for user".
//
// Unit test: mock `window.require` and invoke the injected LoadUtils(), then call
// window.WWebJS.enforceLidAndPnRetrieval.

const { LoadUtils } = require('../src/util/Injected/Utils');

// Permissive stub so LoadUtils() (which assigns dozens of helpers) never crashes
// on a module this test doesn't care about; only the three LID modules are real.
function makeWindow(modules) {
    const permissive = new Proxy({}, { get: () => () => undefined });
    return {
        require: (name) => (name in modules ? modules[name] : permissive),
    };
}

function loadWWebJS(modules) {
    global.window = makeWindow(modules);
    LoadUtils();
    return global.window.WWebJS;
}

describe('FE#179 — enforceLidAndPnRetrieval uses the canonical wid', function () {
    afterEach(function () {
        delete global.window;
    });

    it('resolves the LID from queryResult.wid when the dialed wid has none (BR 9-digit case)', async function () {
        const dialedWid = {
            server: 'c.us',
            user: '5586988380280',
            _serialized: '5586988380280@c.us',
        };
        const canonicalWid = {
            server: 'c.us',
            user: '558688380280',
            _serialized: '558688380280@c.us',
        };

        const WWebJS = loadWWebJS({
            WAWebWidFactory: { createWid: () => dialedWid },
            WAWebApiContact: {
                // LID exists ONLY under the canonical wid (identity compare).
                getCurrentLid: (w) =>
                    w === canonicalWid ? 'LID_123@lid' : null,
                getPhoneNumber: (w) => w,
            },
            WAWebQueryExistsJob: {
                queryWidExists: async () => ({ wid: canonicalWid }),
            },
        });

        const res = await WWebJS.enforceLidAndPnRetrieval('5586988380280@c.us');
        // Pre-fix (getCurrentLid(dialedWid)) → null → send fails "No LID for user".
        expect(res.lid).to.equal('LID_123@lid');
    });

    it('returns {} when the number is genuinely not on WhatsApp', async function () {
        const dialedWid = { server: 'c.us', user: '15550000000' };
        const WWebJS = loadWWebJS({
            WAWebWidFactory: { createWid: () => dialedWid },
            WAWebApiContact: {
                getCurrentLid: () => null,
                getPhoneNumber: (w) => w,
            },
            WAWebQueryExistsJob: {
                queryWidExists: async () => ({ wid: null }),
            },
        });
        const res = await WWebJS.enforceLidAndPnRetrieval('15550000000@c.us');
        expect(res).to.deep.equal({});
    });

    it('is a no-op (no server query) when the dialed wid already resolves a LID', async function () {
        const wid = { server: 'c.us', user: '15551234567' };
        const WWebJS = loadWWebJS({
            WAWebWidFactory: { createWid: () => wid },
            WAWebApiContact: {
                getCurrentLid: () => 'LID_direct@lid',
                getPhoneNumber: (w) => w,
            },
            WAWebQueryExistsJob: {
                queryWidExists: async () => {
                    throw new Error('should not query when already resolved');
                },
            },
        });
        const res = await WWebJS.enforceLidAndPnRetrieval('15551234567@c.us');
        expect(res.lid).to.equal('LID_direct@lid');
    });
});
