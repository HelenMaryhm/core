import { signalStore, withState, withComputed, withMethods } from '@ngrx/signals';

import { computed, inject } from '@angular/core';

import { loadChildren } from './methods/loadChildren';
import { loadSites } from './methods/loadSites';

import {
    TreeNodeItem,
    TreeNodeSelectItem
} from '../../../models/dot-edit-content-host-folder-field.interface';
import { DotEditContentService } from '../../../services/dot-edit-content.service';

export type ComponentStatus = 'INIT' | 'LOADING' | 'LOADED' | 'SAVING' | 'IDLE' | 'FAILED';

export type HostFolderFiledState = {
    nodeSelected: TreeNodeItem | null;
    nodeExpaned: TreeNodeSelectItem['node'] | null;
    tree: TreeNodeItem[];
    status: ComponentStatus;
    error: string | null;
};

const initialState: HostFolderFiledState = {
    nodeSelected: null,
    nodeExpaned: null,
    tree: [],
    status: 'INIT',
    error: null
};

export const HostFolderFiledStore = signalStore(
    withState(initialState),
    withComputed(({ status }) => ({
        iconClasses: computed(() => {
            const currentStatus = status();

            return {
                'pi-spin pi-spinner': currentStatus === 'LOADING',
                'pi-chevron-down': currentStatus !== 'LOADING'
            };
        })
    })),
    withMethods((store) => {
        const dotEditContentService = inject(DotEditContentService);

        return {
            loadSites: loadSites(store, dotEditContentService),
            loadChildren: loadChildren(store, dotEditContentService)
        };
    })
);
