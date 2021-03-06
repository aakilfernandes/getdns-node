/*
 * Copyright (c) 2014, 2015, 2016, 2017, Verisign, Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 * * Redistributions of source code must retain the above copyright
 *   notice, this list of conditions and the following disclaimer.
 * * Redistributions in binary form must reproduce the above copyright
 *   notice, this list of conditions and the following disclaimer in the
 *   documentation and/or other materials provided with the distribution.
 * * Neither the names of the copyright holders nor the
 *   names of its contributors may be used to endorse or promote products
 *   derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL Verisign, Inc. BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

"use strict";

const getdns = require("bindings")("getdns");

// Export constants directly.
module.exports = getdns.constants;

// Wrap context creation.
module.exports.createContext = function(options) {
    if (arguments.length > 1) {
        // NOTE: duplicated in getdns.js and GNContext.cpp.
        // TODO: use new getdns.Context(...args) when not supporting node.js v4 anymore.
        const tooManyArgumentsTypeError = new TypeError("Too many arguments.");
        tooManyArgumentsTypeError.code = getdns.constants.RETURN_INVALID_PARAMETER;

        throw tooManyArgumentsTypeError;
    }

    const ctx = new getdns.Context(options);
    const oldDestroyFunc = ctx.destroy;
    let destroyed = false;

    ctx.destroy = function() {
        if (destroyed) {
            return false;
        }
        destroyed = true;
        setImmediate(function() {
            oldDestroyFunc.call(ctx);
        });
        return true;
    };

    // Add the wrappers for more consistent getdns API.
    ctx.general = function() {
        return ctx.lookup.apply(ctx, arguments);
    };

    ctx.address = function() {
        return ctx.getAddress.apply(ctx, arguments);
    };

    ctx.service = function() {
        return ctx.getService.apply(ctx, arguments);
    };

    ctx.hostname = function() {
        return ctx.getHostname.apply(ctx, arguments);
    };

    return ctx;
};
