import {switchMap} from 'rxjs/operators';
import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {MatDialog} from '@angular/material';

import {Location} from '../../models/location';
import {LocationService} from '../../services/location.service';
import {DeviceService} from '../../services/device.service';
import {SuccessDialogService} from '../../services/success-dialog.service';
import {ErrorDialogService} from '../../services/error-dialog.service';
import {SelectTemplateComponent} from '../device-templates/select-template.component';

@Component({
  selector: 'new-device',
  templateUrl: './newdevice.component.html',
  styleUrls: ['./newdevice.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NewDeviceComponent implements OnInit {
  location: Location = null;
  name = '';
  enabled = true;
  // deviceTypes: Array<string> = ["LORA", "TWIST", "FIREFLY", "BOSCH_XDK"];
  selectedType = '';
  useTemplate = false;
  templates: Array<Object> = [];
  template: any = null;
  templateid = '';

  constructor(private deviceService: DeviceService,
              private locationService: LocationService,
              private route: ActivatedRoute, private router: Router,
              private successDialogService: SuccessDialogService,
              private errorDialogService: ErrorDialogService,
              public dialog: MatDialog) {

  }

  ngOnInit() {
    // Get Device Templates
    this.deviceService.deviceTemplates().subscribe(
      result => this.templates = result,
      error => this.templates = []
    );

    let loc = false;
    let tem = false;
    this.route.params.subscribe((params: Params) => {
      if (params['location_id']) {
        loc = true;
      }
      if (params['template_id']) {
        tem = true;
      }
    });

    // From Location
    if (loc) {
      this.route.params.pipe(
        switchMap((params: Params) => this.locationService.getLocationById(params['location_id'])))
        .subscribe(result => this.location = result);
    }
    // From Device Template
    if (tem) {
      this.route.params.pipe(
        switchMap((params: Params) => this.deviceService.deviceTemplate(params['template_id'])))
        .subscribe(result => {
          this.template = result;
          this.templateid = this.template._id;
          this.useTemplate = true;
        });
    }
  }

  add() {
    if (this.name !== '') {
      let valid = true;
      const body: any = {};
      body['name'] = this.name;
      body['enabled'] = this.enabled;
      if (this.location) {
        body['location_id'] = this.location._id;
      }
      /*if (this.deviceTypes) {
        body["type"] = this.selectedType;
      }*/
      if (this.useTemplate) {
        if (this.templateid !== '') {
          body['template_id'] = this.templateid;
        } else {
          valid = false;
          this.errorDialogService.dialogPopup('Select a Template!');
        }
      }
      if (valid) {
        this.deviceService.addDevice(body).subscribe(
          result => {
            this.successDialogService
              .dialogPopup('Add Device Success: ' + this.name)
              .subscribe(
                res => this.router.navigate(['/home/device/', result._id]),
                err => this.router.navigate(['/home'])
              );
          },
          error => {
            this.errorDialogService
              .dialogPopup(error.message + ': ' + this.name);
          }
        );
      }
    } else {
      this.errorDialogService
        .dialogPopup('Name cannot be empty!');
    }
  }

  cancel() {
    this.router.navigate(['/home']);
  }

  selectTemplate() {
    const dialogRef = this.dialog.open(SelectTemplateComponent, {width: '700px', height: '700px'});
    dialogRef.afterClosed().subscribe(
      result => {
        if (result) {
          this.template = result;
          this.templateid = this.template._id;
        }
      }
    );
  }
}
