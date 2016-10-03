/**
 * Created by claudio on 03/10/16.
 */
/**
 * Created by claudio on 25/09/16.
 */
"use strict";
var fs = require('fs-extra-promise');
require('shelljs/global');
var process = require('process');

if (process.argv.length != 3) {
    error();
} else if (process.argv[2] == 'upload') {
    push();
} else if (process.argv[2] == 'download') {
    pull();
} else {
    error();
}

//TODO unset all?

function error() {
    console.error("usage node herokuEnv.js upload|download");
    process.exit();
}

function push() {
    fs.readFileAsync('.env_upload', 'utf-8').then((data) => {
        pushEnv(parseEnv(data));
    }).catch((err)=> console.error('reading file error ' + err));
}

function pull() {
    var config = exec('heroku config --json');
    if (config.code !== 0) {
        console.error('Error: download config');
        process.exit(1);
    }
    config = config.stdout;
    try {
        config = JSON.parse(config);
    } catch (e) {
        console.error('Error: parsing config');
        process.exit(1);
    }
    writeConfig(config);
}

function writeConfig(config) {
    config = Object.keys(config)
        .map((key)=>key + '=' + config[key])
        .join("\n");
    fs.writeFileAsync('.env_download', config)
        .then((data)=>console.log('File written'))
        .catch((err)=> console.error('Writing file error ' + err));
}

function parseEnv(data) {
    data = data || '';
    return data
        .split(/\r?\n|\r/)
        .filter((line) => {
            return /\s*=\s*/i.test(line)
        })
        .map((line) => {
            return line.replace('exports ', '')
        })
        .filter((line) => {
            return !(/^\s*\#/i.test(line));
        })
        .map((line) => line.split('='))
        .map((line) => {
            return {key: line[0], value: line[1]};
        });
}

function pushEnv(envs) {
    envs = envs || [];
    envs = envs
        .map((env)=>env.key + '="' + env.value + '"')
        .join(' ');
    if (exec('heroku config:set ' + envs).code !== 0) {
        //TODO async
        console.error('Error: uploading envs');
        process.exit(1);
    }
    /*envs.forEach((env)=> {
     if (exec('heroku config:set '+env.key+'="'+env.value+'"').code !== 0) {
     //TODO async
     console.error('Error: uploading env '+env.key);
     process.exit(1);
     }
     });*/
}