// Copyright (c) 2014 Adobe Systems Incorporated. All rights reserved.
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

/*global require, jasmine */
require.config({
    // set baseUrl to src/
    baseUrl: '../src/',
    paths: {
        'jquery': 'third-party/jquery/jquery.min',
        'text': 'third-party/requirejs/text',
        'eve': 'third-party/eve/eve',
        'snap': 'third-party/snap/snap.svg-min',
        'snap.plugins': 'third-party/snap.plugins/snap.plugins',
        'snap.freeTransform': 'third-party/snap.freetransform/snap.freetransform',
        'spec': '../test/spec',
        'lodash': 'third-party/lodash/lodash'
    }
});
require([
    'text',
    'spec/CSSShapesEditorSpec',
    'spec/PolygonEditorSpec',
    'spec/CircleEditorSpec',
    'spec/EllipseEditorSpec',
    'spec/CSSUtilsSpec'
], function(){
    'use strict';
    var env = jasmine.getEnv();
    env.addReporter(new jasmine.HtmlReporter());
    env.execute();
});
