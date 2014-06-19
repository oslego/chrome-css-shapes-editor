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

    require('load-grunt-tasks')(grunt, {
        pattern: ['grunt-*', '!grunt-template-jasmine-requirejs']
    });

    grunt.initConfig({

        pkg: grunt.file.readJSON("package.json"),

        // configurable paths
        yeoman: {
            src: 'src',
            dist: 'dist',
            test: 'test'
        },

        banner: grunt.file.read('./COPYRIGHT')
                    .replace(/@NAME/, '<%= pkg.name %>')
                    .replace(/@DESCRIPTION/, '<%= pkg.description %>')
                    .replace(/@VERSION/, '<%= pkg.version %>')
                    .replace(/@DATE/, grunt.template.today("yyyy-mm-dd")),

        watch: {
            files: ['<%= yeoman.src %>/{,*/}*.js'],
            // tasks: ['jshint']
        },

        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            src: [
                '<%= yeoman.src %>/*.js',
                // 'test/spec/{,*/}*.js'
            ],
            dist: ['<%= yeoman.dist %>/*.js']
        },

        jasmine: {
            src: '<%= yeoman.src %>/*.js',
            options: {
                specs: '<%= yeoman.test %>/spec/*Spec.js',
                helpers: '<%= yeoman.test %>/*Helper.js',
                template: require('grunt-template-jasmine-requirejs'),
                templateOptions: {
                    requireConfigFile: '<%= yeoman.test %>/main.js',
                    requireConfig: {
                        baseUrl: '<%= yeoman.src %>',
                    }
                }
            }
        },

        requirejs: {
            compile: {
                options: {
                    baseUrl: '<%= yeoman.src %>',
                    mainConfigFile: '<%= yeoman.src %>/main.js',
                    out: '<%= pkg.main %>',
                    name: 'main',
                    include: ['third-party/almond/almond'],
                    wrap: {
                        startFile: '<%= yeoman.src %>/fragments/start.frag',
                        endFile: '<%= yeoman.src %>/fragments/end.frag'
                    },
                    optimize: 'none'
                }
            }
        },

        usebanner: {
            dist: {
                options: {
                    position: 'top',
                    banner: '<%= banner %>'
                },
                files: {
                    src: [ '<%= pkg.main %>' ]
                }
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
                commitFiles: ['package.json','<%= yeoman.dist %>'], // '-a' for all files
                createTag: true,
                tagName: 'v%VERSION%',
                tagMessage: 'Version %VERSION%',
                push: false,
                pushTo: 'origin',
                gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d' // options to use with '$ git describe'
            }
        }
    });

    grunt.registerTask('build', ['jshint:src', 'requirejs', 'usebanner']);

    grunt.registerTask('test', ['jasmine']);

    grunt.registerTask('lint', ['jshint:src']);

    grunt.registerTask('release', function (type) {
        type = type ? type : 'patch';     // Default release type
        grunt.task.run('bump:' + type);   // Bump up the version
        grunt.task.run('build');          // Build the file
    });
};
