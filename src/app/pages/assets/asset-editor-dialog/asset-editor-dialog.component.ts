import { Component, Inject, OnInit } from '@angular/core';
import { AssetInput, HttpDataAddress, DataAddress } from '@think-it-labs/edc-connector-client';
import { MatDialogRef } from "@angular/material/dialog";
import { JsonDoc} from "../../../shared/models/json-doc";
import { StorageType } from "../../../shared/models/storage-type";
import { AmazonS3DataAddress } from "../../../shared/models/amazon-s3-data-address";
import { Vocabulary } from "../../../shared/models/vocabulary";
import { NotificationService } from 'src/app/shared/services/notification.service';
import { DATA_ADDRESS_TYPES } from 'src/app/shared/utils/app.constants';

import { HttpClient } from '@angular/common/http';
import { Location } from '@angular/common';
import { createAjv } from '@jsonforms/core';
import { angularMaterialRenderers } from '@jsonforms/angular-material';
import * as jsonld from 'jsonld';


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
  vocabularyId: string | null = null;
  vocabularies: Vocabulary[];
  renderers = angularMaterialRenderers;
  uischema = this.uischemaComplete;
  schema:any = {
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
  validator:any;
  
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

  ngOnInit(): void {
    // Currently predefined vocabularies
    this.validator = this.ajv.compile(this.schema);
    this.vocabularies = [
      {
        id: "1", 
        name: "DCAT dataset",
        url: "/assets/schemas/dcat-schema.json"
      },
      {
        id: "2", 
        name: "Inesdata ML",
        url: "/assets/schemas/ml-schema.json"
      }
    ]
  }


  constructor(private dialogRef: MatDialogRef<AssetEditorDialog>,
              private location: Location,
              private http: HttpClient,
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
    let properties:JsonDoc = {};

    if (this.vocabularyId) {
      if (this.schema && this.schema.hasOwnProperty("@context")) {
        // Add context if it is provided in the Json Schema
        const jsonSchema:JsonDoc = this.schema as JsonDoc;
        const context = jsonSchema["@context"];
        let compacted: JsonDoc = this.data as JsonDoc;
        compacted["@context"] = context;
        properties = await jsonld.expand(compacted);
      } else {
        properties = this.data;
      }

      const vocabulary = this.getVocabulary(this.vocabularyId);
      properties["http://purl.org/dc/terms/type"] = vocabulary.name;
    }
    
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
    } else {
      this.notificationService.showError("Incorrect destination value");
      return;
    }

    // Create EDC asset
    const assetInput: AssetInput = {
      "@id": this.id,
      properties: properties,
      dataAddress: dataAddress
    };

    this.dialogRef.close({ assetInput });
  }

  /**
   * Changes the extended infromation formulary from vocabulary
   *
   * @param id vocabulary ID
   */
  setVocaulary(id: string|null) {
    if (this.vocabularyId != id) {
      this.vocabularyId = id;
      this.data = {};
      if (id != null) {
        this.vocabularies.forEach(element => {
          if (id == element.id) {
            this.http.get(this.location.prepareExternalUrl(element.url)).toPromise()
            .then(res => {
              this.schema = res;
              this.validator = this.ajv.compile(this.schema);
              if (this.schema && this.schema.hasOwnProperty("@uischema")) {
                // Get uischema from json schema definition
                this.uischema = this.schema["@uischema"];
              } else {
                this.uischema = this.uischemaComplete;
              }
            })
            .catch(error => {
              console.error('Error getting the vocabulary schema:', error);
              this.notificationService.showError("Error retrieving the asset vocabulary");
              this.vocabularyId = null;
            });
          }
        });
      }
    }
  }

  /**
   * Get a vocabulary by id
   *
   * @param id vocabulary id
   */
  getVocabulary(id:string):Vocabulary|null {
    let vocabulary = null;

    this.vocabularies.forEach(element => {
      if (id == element.id) {
        vocabulary =  element;
      }
    });
    return vocabulary;
  }

  /**
   * Checks the required fields
   *
   * @returns true if required fields have been filled
   */
  private checkRequiredFields(): boolean {
    if (!this.id || !this.storageTypeId){
      return false;
    } else {
      if (this.storageTypeId === DATA_ADDRESS_TYPES.amazonS3 && !this.amazonS3DataAddress.region) {
        return false;
      } else {
        return true;
      }
    }
  }

  /**
   * Checks the vocabulary data is compilant with the json schema
   *
   * @returns true there is no vocabulary or the data is validated
   */
  private checkVocabularyData(): boolean {
    return !this.vocabularyId || this.validator(this.data);
  }

}
