/*
 * Copyright 2018 The Closure Compiler Authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Low level class for calling the closure-compiler-js lib
 *
 * @author Chad Killingsworth (chadkillingsworth@gmail.com)
 */

'use strict';

const path = require('path');
const jscomp = require('./jscomp.js');

class CompilerJS {
  /** @param {Object<string,string>|Array<string>} flags */
  constructor(flags) {
    this.flags = {};
    if (Array.isArray(flags)) {
      flags.forEach(flag => {
        const flagPargs = flag.split('=');
        const normalizedFlag = this.formatArgument(flagPargs[0], flagPargs[1]);
        this.flags[normalizedFlag.key] = normalizedFlag.val;
      });
    } else {
      for (let key in flags) {
        const normalizedFlag = this.formatArgument(key, flags[key]);
        this.flags[normalizedFlag.key] = normalizedFlag.val;
      }
    }
  }

  /**
   * @param {!Array<!{src: string, path: string, sourceMap: string}>} fileList
   * @param {function(number, string, string)=} callback
   * @return {child_process.ChildProcess}
   */
  run(fileList, callback) {
    const out = jscomp(this.flags, fileList);
    if (callback) {
      const warnings = Array.prototype.slice.call(out.warnings);
      const errors = Array.prototype.slice.call(out.errors);
      callback(errors.length === 0 ? 0 : 1, out.compiledFiles, out.warnings.concat(out.errors).join('\n\n'));
    }
    return out;
  }

  /**
   * @param {string} key
   * @param {(string|boolean)=} val
   * @return {{key: string, val: (string|undefined)}}
   */
  formatArgument(key, val) {
    let normalizedKey = key.replace(/_(\w)/g, match => match[1].toUpperCase());
    normalizedKey = normalizedKey.replace(/^--/, '');

    return {
      key: normalizedKey,
      val: val === undefined || val === null ? true : val
    };
  }
}

module.exports = CompilerJS;
