// Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
// http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module. Require Snap dependency
        define(['snap'], function(Snap) {
            return factory(Snap || root.Snap);
        });
    } else {
        factory(Snap);
    }
}(this, function(Snap) {
    Snap.plugin(function (Snap, Element, Paper, glob) {
        var elproto = Element.prototype;
        elproto.toFront = function() {
            this.appendTo(this.paper);
            return this

        };
        elproto.toBack = function() {
            this.prependTo(this.paper);
            return this
        };
    })
}));
