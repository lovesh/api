// Copyright 2017-2020 @polkadot/metadata authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Registry } from '@polkadot/types/types';
import { ModuleStorage, Storage } from '../types';

import { stringCamelCase, stringLowerFirst } from '@polkadot/util';

import { Metadata } from '../../Metadata';
import { createFunction } from './createFunction';
import { getStorage } from './storage';

/** @internal */
export function storageFromMeta (registry: Registry, metadata: Metadata): Storage {
  return metadata.asLatest.modules.reduce((result: Storage, moduleMetadata): Storage => {
    if (moduleMetadata.storage.isNone) {
      return result;
    }

    const { name } = moduleMetadata;
    const section = stringCamelCase(name);
    const unwrapped = moduleMetadata.storage.unwrap();
    const prefix = unwrapped.prefix.toString();

    // For access, we change the index names, i.e. System.Account -> system.account
    result[section] = unwrapped.items.reduce((newModule, meta): ModuleStorage => {
      const method = meta.name.toString();

      newModule[stringLowerFirst(method)] = createFunction(registry, {
        meta,
        method,
        prefix,
        section
      }, { metaVersion: metadata.version });

      return newModule;
    }, {} as ModuleStorage);

    return result;
  }, { ...getStorage(registry, metadata.version) });
}
