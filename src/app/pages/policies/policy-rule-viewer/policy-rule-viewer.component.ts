import {Component, Input} from '@angular/core';

@Component({
  selector: 'policy-rules',
  templateUrl: './policy-rule-viewer.component.html',
  styleUrls: ['./policy-rule-viewer.component.scss']
})
export class PolicyRuleViewerComponent {

  @Input() rules: any[] | undefined = [];
  @Input() title: string =''

  constructor() {
  }
}
