import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { of } from 'rxjs';

import { AsyncPipe, NgIf } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { DotMessageService } from '@dotcms/data-access';
import { DotMessagePipe, DotSelectItemDirective } from '@dotcms/ui';

import { AddStyleClassesDialogComponent } from './add-style-classes-dialog.component';
import { JsonClassesService } from './services/json-classes.service';

import {
    DOT_MESSAGE_SERVICE_TB_MOCK,
    MOCK_SELECTED_STYLE_CLASSES,
    MOCK_STYLE_CLASSES_FILE
} from '../../utils/mocks';

const meta: Meta<AddStyleClassesDialogComponent> = {
    title: 'Library/Template Builder/Components/Add Style Classes',
    component: AddStyleClassesDialogComponent,
    decorators: [
        moduleMetadata({
            imports: [
                AutoCompleteModule,
                FormsModule,
                ButtonModule,
                DotMessagePipe,
                NgIf,
                AsyncPipe,
                HttpClientModule,
                NoopAnimationsModule,
                DotSelectItemDirective
            ],
            providers: [
                {
                    provide: DynamicDialogConfig,
                    useValue: {
                        data: {
                            selectedClasses: MOCK_SELECTED_STYLE_CLASSES
                        }
                    }
                },
                {
                    provide: HttpClient,
                    useValue: {
                        get: (_: string) => of(MOCK_STYLE_CLASSES_FILE)
                    }
                },
                {
                    provide: DotMessageService,
                    useValue: DOT_MESSAGE_SERVICE_TB_MOCK
                },
                DynamicDialogRef,
                JsonClassesService
            ]
        })
    ]
};
export default meta;

type Story = StoryObj<AddStyleClassesDialogComponent>;

export const Primary: Story = {};
