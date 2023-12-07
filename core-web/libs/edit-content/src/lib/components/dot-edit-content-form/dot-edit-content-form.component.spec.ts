import { Spectator, byTestId, createComponentFactory } from '@ngneat/spectator/jest';

import { Validators } from '@angular/forms';

import { TabView } from 'primeng/tabview';

import { DotMessageService } from '@dotcms/data-access';
import { MockDotMessageService } from '@dotcms/utils-testing';

import { DotEditContentFormComponent } from './dot-edit-content-form.component';

import {
    CONTENT_FORM_DATA_MOCK,
    JUST_FIELDS_MOCKS,
    LAYOUT_FIELDS_VALUES_MOCK,
    LAYOUT_MOCK,
    MOCK_DATE,
    TAB_DIVIDER_MOCK
} from '../../utils/mocks';
import { DotEditContentFieldComponent } from '../dot-edit-content-field/dot-edit-content-field.component';

describe('DotFormComponent', () => {
    let spectator: Spectator<DotEditContentFormComponent>;
    let dotMessageService: DotMessageService;
    const createComponent = createComponentFactory({
        component: DotEditContentFormComponent,
        providers: [
            {
                provide: DotMessageService,
                useValue: new MockDotMessageService({
                    Save: 'Save',
                    Content: 'content'
                })
            }
        ]
    });

    describe('with data', () => {
        beforeEach(() => {
            spectator = createComponent({
                props: {
                    formData: CONTENT_FORM_DATA_MOCK
                }
            });
        });

        it('should initialize the form controls', () => {
            expect(spectator.component.form.value).toEqual({
                name1: 'Placeholder',
                text2: null,
                text3: null,
                someTag: ['some', 'tags', 'separated', 'by', 'comma'],
                date: new Date(MOCK_DATE)
            });
        });

        it('should initialize the form validators', () => {
            expect(
                spectator.component.form.controls['name1'].hasValidator(Validators.required)
            ).toBe(true);
            expect(
                spectator.component.form.controls['text2'].hasValidator(Validators.required)
            ).toBe(true);
            expect(
                spectator.component.form.controls['text3'].hasValidator(Validators.required)
            ).toBe(false);
        });

        it('should validate regex', () => {
            expect(spectator.component.form.controls['text2'].valid).toBeFalsy();

            spectator.component.form.controls['text2'].setValue('dot@gmail.com');
            expect(spectator.component.form.controls['text2'].valid).toBeTruthy();
        });

        it('should have 1 row, 2 columns and 3 fields', () => {
            expect(spectator.queryAll(byTestId('row'))).toHaveLength(1);
            expect(spectator.queryAll(byTestId('column'))).toHaveLength(2);
            expect(spectator.queryAll(byTestId('field'))).toHaveLength(5);
        });

        it('should pass field to attr to dot-edit-content-field', () => {
            const fields = spectator.queryAll(DotEditContentFieldComponent);
            JUST_FIELDS_MOCKS.forEach((field, index) => {
                expect(fields[index].field).toEqual(field);
            });
        });

        it('should emit the form value through the `formSubmit` event', () => {
            jest.spyOn(spectator.component.changeValue, 'emit');

            spectator.component.form.controls['name1'].setValue('New Value');

            expect(spectator.component.changeValue.emit).toHaveBeenCalledWith({
                ...LAYOUT_FIELDS_VALUES_MOCK,
                name1: 'New Value'
            });
        });

        it('should not have multiple tabs', () => {
            const tabViewComponent = spectator.query(TabView);
            const formRow = spectator.query(byTestId('row'));
            expect(tabViewComponent).toBeNull();
            expect(formRow).toExist();
        });
    });

    describe('no data', () => {
        beforeEach(() => {
            spectator = createComponent({});
        });

        it('should have form undefined', () => {
            jest.spyOn(spectator.component, 'initilizeForm');
            expect(spectator.component.form).toEqual(undefined);
            expect(spectator.component.initilizeForm).not.toHaveBeenCalled();
        });
    });

    describe('with data and multiple tabs', () => {
        beforeEach(() => {
            spectator = createComponent({
                detectChanges: false,
                props: {
                    formData: {
                        ...CONTENT_FORM_DATA_MOCK,
                        layout: [...LAYOUT_MOCK, TAB_DIVIDER_MOCK]
                    }
                }
            });
            dotMessageService = spectator.inject(DotMessageService, true);
        });

        it('should have a p-tabView', () => {
            jest.spyOn(dotMessageService, 'get');
            spectator.detectChanges();
            const tabViewComponent = spectator.query(TabView);
            expect(tabViewComponent.scrollable).toBeTruthy();
            expect(tabViewComponent).toExist();
            expect(dotMessageService.get).toHaveBeenCalled();
        });
    });
});
