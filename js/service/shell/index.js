// Copyright 2014-present runtime.js project authors
// Copyright 2017-present JsOS project authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

/* eslint-disable no-alert */

const typeutils = require('typeutils');
const assert = require('assert');
const runtime = require('../../core');
const commands = new Map();
const stdio = runtime.stdio.defaultStdio;
const keyboard = require('../../core/keyboard');
const mouse = require('../../core/mouse');

exports.setCommand = (name, cb) => {
  assert(typeutils.isString(name));
  assert(typeutils.isObject(cb));
  commands.set(name, cb);
};

exports.getCommands = () => commands.keys();

exports.getDescription = (cmd) => commands.has(cmd)
  ? commands.get(cmd).description
  : 'Command doesn\'t exist';

exports.getUsage = (cmd) => commands.has(cmd)
  ? commands.get(cmd).usage
  : 'Command doesn\'t exist';

exports.runCommand = (name, args, done) => {
  let opts = {};

  assert(typeutils.isString(name));

  if (typeutils.isArray(args)) {
    opts.args = args;
  } else {
    opts = args;
    opts.args = opts.args || [];
  }

  const stringargs = opts.args.join(' ');

  opts.stdio = opts.stdio || runtime.stdio.defaultStdio;
  try {
    commands.get(name).run(stringargs, {
      'stdio': opts.stdio,
      keyboard,
      mouse,
    }, done);
  } catch (e) {
    new (require('errors').TerminalError)(`Command ${name} crashed!`);
    debug(e);

    return done(1);
  }
};

function prompt () {
  stdio.setColor('yellow');
  stdio.write('$');
  stdio.setColor('white');
  stdio.write(' ');
  stdio.readLine((text) => {
    let name = '';
    let args = '';

    const split = text.indexOf(' ');

    if (split >= 0) {
      name = text.slice(0, split);
      args = text.slice(split);
    } else {
      name = text;
    }

    if (!name) {
      return prompt();
    }

    if (commands.has(name)) {
      return exports.runCommand(name, args.substr(1).split(' '), (rescode) => {
        let printx = false;

        stdio.write('\n');

        // Since 0 == false and other numbers == true, just check for true.
        if (rescode) {
          printx = true;
        }

        if (printx) {
          stdio.setColor('red');
          stdio.write('X ');
        }

        prompt();
      });
    }

    stdio.setColor('lightred');
    stdio.writeLine(`Command '${name}' not found.`);
    prompt();
  });
}

prompt();
