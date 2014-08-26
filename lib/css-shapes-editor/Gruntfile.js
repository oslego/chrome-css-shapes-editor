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

/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global module, require */

module.exports = function (grunt) {

    'use strict';

    require('load-grunt-tasks')(grunt);

    grunt.initConfig({

        pkg: grunt.file.readJSON("package.json"),

        // configurable paths
        project: {
            out:    'dist/CSSShapesEditor.js',
            outmin: 'dist/CSSShapesEditor-min.js'
        },

        banner: grunt.file.read('./COPYRIGHT')
                    .replace(/@NAME/, '<%= pkg.name %>')
                    .replace(/@DESCRIPTION/, '<%= pkg.description %>')
                    .replace(/@VERSION/, '<%= pkg.version %>')
                    .replace(/@DATE/, grunt.template.today("yyyy-mm-dd")),

        watch: {
            files: ['src/{,*/}*.js'],
            tasks: ['jshint:src']
        },

        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            src: [
                'src/*.js',
                // 'test/spec/{,*/}*.js'
            ]
        },

        testem: {
          chrome: {
            options: JSON.parse(grunt.file.read('testem.json'))
          }
        },

        requirejs: {
            compile: {
                options: {
                    baseUrl: 'src/',
                    mainConfigFile: 'src/main.js',
                    out: '<%= project.out %>',
                    name: 'main',
                    include: ['third-party/almond/almond'],
                    wrap: {
                        startFile: 'src/fragments/start.frag',
                        endFile: 'src/fragments/end.frag'
                    },
                    optimize: 'none'
                }
            }
        },

        uglify: {
            options: {
                banner: "<%= banner %>",
                report: "min"
            },
            dist: {
                src:  "<%= project.out %>",
                dest: "<%= project.outmin %>"
            }
        },

        // Used just to concat the copyright banner
        concat: {
            options: {
                banner: "<%= banner %>"
            },
            dist: {
                dest: "<%= project.out %>",
                src: ["<%= project.out %>"]
            }
        },

        /*
        Usage:
        grunt bump:minor
        grunt bump:build
        grunt bump:major
        grunt bump --setversion=2.0.1

        grunt bump-only:patch
        */
        bump: {
            options: {
                files: ['package.json'],
                updateConfigs: ['pkg'],
                commit: true,
                commitMessage: 'Release v%VERSION%',
                commitFiles: ['package.json','dist/'], // '-a' for all files
                createTag: true,
                tagName: 'v%VERSION%',
                tagMessage: 'Version %VERSION%',
                push: false,
                pushTo: 'origin',
                gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d' // options to use with '$ git describe'
            }
        }
    });

    grunt.registerTask('build', ['jshint:src', 'requirejs', 'concat', 'uglify']);

    grunt.registerTask('test', ['testem:run:chrome']);

    grunt.registerTask('lint', ['jshint:src']);

    grunt.registerTask('release', function (type) {
        type = type ? type : 'patch';     // Default release type
        grunt.task.run('bump:' + type);   // Bump up the version
        grunt.task.run('build');          // Build the file
    });
};
