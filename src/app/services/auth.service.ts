import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Configuration } from '../config';

@Injectable()
export class AuthService {

  private googleLoginUrl: string;
  private basicLoginUrl: string;
  private logoutUrl: string;

constructor(private http: Http, private config: Configuration, private requestOptions: RequestOptions) { 
    this.googleLoginUrl = config.auth_url +"google/token"; 
    this.basicLoginUrl = config.auth_url +"basic"; 
    this.logoutUrl = config.auth_url+"logout"

  }
 

  googleLogin(body: any) {
    return this.http.post(this.googleLoginUrl, body, this.requestOptions).map(this.extractData)
                    .catch(this.handleError);
  }
  basicLogin(body: any) {
    return this.http.post(this.basicLoginUrl, body, this.requestOptions).map(this.extractData)
                    .catch(this.handleError);
  }
   logout() {
    return this.http.get(this.logoutUrl,this.requestOptions).map(this.extractData)
                    .catch(this.handleError);
  }
   private extractData(res: Response) {
    const body = res.json();
    return body || { };
  }

  private handleError(error: Response | any) {
    let errMsg: string;
    let err: any;
    if (error instanceof Response) {
      const body = error.json() || '';
      err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${err.message || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
      err = error;
    }
    console.error(errMsg);
    if (err.message) {
      return Observable.throw(err);
    } else {
      return Observable.throw({
        message: error.statusText
      });
    }
  }
}