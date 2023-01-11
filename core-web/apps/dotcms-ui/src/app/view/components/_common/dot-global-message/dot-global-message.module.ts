import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { DotIconModule, DotSpinnerModule } from '@dotcms/ui';

import { DotGlobalMessageComponent } from './dot-global-message.component';
import { DotGlobalMessageService } from './dot-global-message.service';

@NgModule({
    imports: [CommonModule, DotIconModule, DotSpinnerModule],
    declarations: [DotGlobalMessageComponent],
    exports: [DotGlobalMessageComponent],
    providers: [DotGlobalMessageService]
})
export class DotGlobalMessageModule {}
