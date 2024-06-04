import { Component, Inject, OnInit } from '@angular/core';
import { AssetInput, HttpDataAddress, DataAddress } from '@think-it-labs/edc-connector-client';
import { MatDialogRef } from "@angular/material/dialog";
import { JsonDoc } from "../../../shared/models/json-doc";
import { StorageType } from "../../../shared/models/storage-type";
import { AmazonS3DataAddress } from "../../../shared/models/amazon-s3-data-address";
import { Vocabulary } from "../../../shared/models/vocabulary";
import { NotificationService } from 'src/app/shared/services/notification.service';
import { DATA_ADDRESS_TYPES, ASSET_TYPES } from 'src/app/shared/utils/app.constants';

import { createAjv } from '@jsonforms/core';
import { angularMaterialRenderers } from '@jsonforms/angular-material';
import * as jsonld from 'jsonld';
import { VocabularyService } from 'src/app/shared/services/vocabulary.service';
import { JsonFormData } from 'src/app/shared/models/json-form-data';
import { InesDataStoreAddress } from 'src/app/shared/models/ines-data-store-address';


@Component({
  selector: 'app-asset-editor-dialog',
  templateUrl: './asset-editor-dialog.component.html',
  styleUrls: ['./asset-editor-dialog.component.scss']
})
export class AssetEditorDialog implements OnInit {

  readonly uischemaComplete = {
    type: 'VerticalLayout',
    elements: [
      {
        type: 'Control',
        scope: '#/'
      }
    ]
  };

  // Dynamic forms from vocabylary variables
  vocabularies: Vocabulary[];
  selectedVocabularies: Vocabulary[]
  defaultVocabularies: Vocabulary[]

  renderers = angularMaterialRenderers;
  uischema = this.uischemaComplete;
  schema: any = {
    type: 'object',
    properties: {
      loading: {
        "type": "string",
        "title": "Default asset"
      },
    },
    required: [],
  };
  data = {};
  ajv = createAjv({
    allErrors: true,
    verbose: true,
    strict: false,
  });
  validator: any;

  // Default asset properties
  id: string = '';
  version: string = '';
  name: string = '';
  contenttype: string = '';
  storageTypeId: string = '';

  // Storage information
  amazonS3DataAddress: AmazonS3DataAddress = {
    type: 'AmazonS3',
    region: ''
  };

  httpDataAddress: HttpDataAddress = {
    type: 'HttpData'
  };

  inesDataStoreAddress: InesDataStoreAddress = {
    type: 'InesDataStore'
  };

  assetType: string = '';
  assetTypes = Object.entries(ASSET_TYPES);
  defaultForms: JsonFormData[]
  selectedForms: JsonFormData[]

  inesDataStoreFiles: File[]


  ngOnInit(): void {
    this.validator = this.ajv.compile(this.schema);
    this.defaultForms = []
    this.selectedForms = []

    this.vocabularyService.requestVocabularies().subscribe({
      next: (res: Vocabulary[]) => {
        this.vocabularies = res;
        this.setDefaultVocabularyAndTabs();
        if (this.defaultVocabularies?.length > 0) {
          this.defaultVocabularies.forEach(d => {
            this.initVocabularyForm(d, true)
          })
        }
        if (this.selectedVocabularies?.length > 0) {
          this.selectedVocabularies.forEach(s => {
            this.initVocabularyForm(s, false)
          })
        }
      },
    });
  }

  /**
   * Sets default values for vocabulary and tabs
   */
  setDefaultVocabularyAndTabs() {

    if (this.vocabularies.length > 0) {
      this.assetType = this.vocabularies[0]['category'];
      this.selectedVocabularies = this.vocabularies.filter(v => v.category === this.assetType)
      this.defaultVocabularies = this.vocabularies.filter(v => v.category === 'default')
    } else {
      this.selectedVocabularies = []
      this.defaultVocabularies = []
    }
  }

  constructor(private dialogRef: MatDialogRef<AssetEditorDialog>,
    private vocabularyService: VocabularyService,
    private notificationService: NotificationService,
    @Inject('STORAGE_TYPES') public storageTypes: StorageType[]) {
  }

  async onSave() {
    // Check whether the asset is valid
    if (!this.checkVocabularyData() || !this.checkRequiredFields()) {
      this.notificationService.showError("Review the form fields");
      return;
    }

    // Generate the asset properties
    let properties: JsonDoc = {};
    const forms: JsonFormData[] = [...this.defaultForms, ...this.selectedForms]

    let assetDataProperty: any = {}
    forms.forEach(async f=>{
      if (f.schema && f.schema.hasOwnProperty("@context")) {
        // Add context if it is provided in the Json Schema
        const jsonSchema: JsonDoc = f.schema as JsonDoc;
        const context = jsonSchema["@context"];
        // Add default EDC vocabulary is none has been set up
        if (!f.schema["@context"].hasOwnProperty("@vocab")) {
          context["@vocab"] = "https://w3id.org/edc/v0.0.1/ns/"
        }
        let compacted: JsonDoc = f.data as JsonDoc;
        compacted["@context"] = context;
        assetDataProperty[f.id] = await jsonld.expand(compacted);
      } else {
        assetDataProperty[f.id] = f.data;
      }
    })

    properties["assetData"] = assetDataProperty
    // Add default information
    properties["name"] = this.name;
    properties["version"] = this.version;
    properties["contenttype"] = this.contenttype;

    // Generate the asset data address
    let dataAddress: DataAddress;

    if (this.storageTypeId === DATA_ADDRESS_TYPES.amazonS3) {
      dataAddress = this.amazonS3DataAddress;
    } else if (this.storageTypeId === DATA_ADDRESS_TYPES.httpData) {
      dataAddress = this.httpDataAddress;
    }  else if (this.storageTypeId === DATA_ADDRESS_TYPES.inesDataStore) {
      dataAddress = this.inesDataStoreAddress;
    } else {
      this.notificationService.showError("Incorrect destination value");
      return;
    }

    // Create EDC asset
    const assetInput: any = {
      "@id": this.id,
      properties: properties,
      dataAddress: dataAddress
    };

    if (this.storageTypeId === DATA_ADDRESS_TYPES.inesDataStore) {
      assetInput.file = this.inesDataStoreAddress?.file
      assetInput.blob = new Blob([await assetInput?.file.arrayBuffer()])
    }

    this.dialogRef.close({ assetInput });
  }

  initVocabularyForm(vocabulary: Vocabulary, isDefault: boolean) {
    let schema = JSON.parse(vocabulary.jsonSchema);
    let validator = this.ajv.compile(schema);
    let uischema
    if (schema && schema.hasOwnProperty("@uischema")) {
      // Get uischema from json schema definition
      uischema = schema["@uischema"];
    } else {
      uischema = this.uischemaComplete;
    }
    const form = {
      id: vocabulary['@id'],
      name: vocabulary.name,
      uischema,
      schema,
      data: {},
      validator,
      renderers: this.renderers
    }
    if (isDefault) {
      this.defaultForms.push(form)
    } else {
      this.selectedForms.push(form)
    }
  }

  /**
   * Checks the required fields
   *
   * @returns true if required fields have been filled
   */
  private checkRequiredFields(): boolean {
    if (!this.id || !this.storageTypeId) {
      return false;
    } else {
      if (this.storageTypeId === DATA_ADDRESS_TYPES.amazonS3 && !this.amazonS3DataAddress.region) {
        return false;
      } else if (this.storageTypeId === DATA_ADDRESS_TYPES.inesDataStore && !this.inesDataStoreAddress.file) {
        return false;
      } else {
        return true;
      }
    }
  }

  /**
   * Checks the vocabulary data is compilant with the json schema
   *
   * @returns true there is no vocabulary in the connector or the data is validated
   */
  private checkVocabularyData(): boolean {
    let isDefaultValid = true
    if (this.defaultForms.length > 0) {
      this.defaultForms.forEach(f => {
        isDefaultValid = isDefaultValid && f.validator(f.data)
      })
    }
    let isSelectedValid = true
    if (this.selectedForms.length > 0) {
      this.selectedForms.forEach(f => {
        isSelectedValid = isSelectedValid && f.validator(f.data)
      })
    }
    return this.vocabularies?.length < 1 || (isDefaultValid && isSelectedValid);
  }

  assetTypeChange() {
    this.selectedVocabularies = []
    this.selectedVocabularies = this.vocabularies.filter(v => v.category === this.assetType)
    this.selectedForms = []

    if (this.selectedVocabularies.length > 0) {
      this.selectedVocabularies.forEach(s => {
        this.initVocabularyForm(s, false)
      })
    }
  }

  /**
   * Transform to text asset type value
   * @returns asset type text
   */
  getAssetTypeText(){
    return this.assetType?ASSET_TYPES[this.assetType as keyof typeof ASSET_TYPES]:'';
  }

  setFiles(event:File[]){
    if(event?.length>0){
      this.inesDataStoreAddress.file = event[0]
    }else{
      delete this.inesDataStoreAddress.file
    }
    console.log('Mira',this.inesDataStoreAddress)

  }
}
