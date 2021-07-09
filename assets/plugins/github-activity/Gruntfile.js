var config = {
  dist: 'dist',
  node_modules: 'node_modules',
  src: 'src',
  banner: '/* Github Activity Stream - v<%= pkg.version %> \n * https://github.com/caseyscarborough/github-activity \n *\n * Copyright 2015-<%= grunt.template.today("yyyy") %> <%= pkg.author %> \n * MIT License\n */\n'
};

var pkg = require('./package.json');

module.exports = function(grunt) {
  grunt.initConfig({
    config: config,
    pkg: pkg,
    cssmin: {
      add_banner: {
        options: {
          banner: config.banner
        },
        files: {
          '<%= config.dist %>/github-activity.min.css': [
            '<%= config.src %>/github-activity.css'
          ],
          '<%= config.dist %>/github-activity.dark.min.css': [
            '<%= config.src %>/github-activity.dark.css'
          ],
        }
      }
    },
    uglify: {
      options: {
        banner: config.banner
      },
      dist: {
        files: {
          '<%= config.dist %>/github-activity.min.js': [
            '<%= config.src %>/github-activity.js'
          ],
        }
      }
    },
    clean: {
      build: {
        src: ["dist/*"]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask( "wipe", [ "clean" ])
  grunt.registerTask( "default", [ "cssmin", "uglify:dist" ] );
};