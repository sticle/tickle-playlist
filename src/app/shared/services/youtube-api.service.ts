import { Injectable }     from '@angular/core';
import { Http, Response } from '@angular/http';

import { Observable } 	  from 'rxjs/Observable';

import 'rxjs/add/observable/of';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

import { YOUTUBE_API_KEY } from '../constants';

let _window: any = window;

@Injectable()
export class YoutubeApiService {
	base_url: string = 'https://www.googleapis.com/youtube/v3/';
	max_results: number = 50;
	nextPageToken: string;
	query: string;
    
	constructor(
		private http: Http
    ){}

	searchVideos(query: string): Promise<any> {
		return this.http.get(this.base_url + 'search?q=' + query + '&maxResults=' + this.max_results + '&type=video&part=snippet,id&key=' + YOUTUBE_API_KEY + '&videoEmbeddable=true')
			.map((response) => {
				let jsonRes = response.json();
				let res = jsonRes['items'];
				this.nextPageToken = jsonRes['nextPageToken'];
				this.query = query;
				let ids = [];

				// for reinit ytPlayer API functions
        		_window.postMessage('search', '*');				
				
				res.forEach((item) => {
					ids.push(item.id.videoId);
				});

				return this.getVideos(ids);
			})
			.toPromise()
			.catch(this.handleError)
	}

	searchMore(): Promise<any> {
		return this.http.get(this.base_url + 'search?q=' + this.query + '&pageToken=' + this.nextPageToken + '&maxResults=' + this.max_results + '&type=video&part=snippet,id&key=' + YOUTUBE_API_KEY + '&videoEmbeddable=true')
			.map((response) => {
				let jsonRes = response.json();
				let res = jsonRes['items'];
				this.nextPageToken = jsonRes['nextPageToken'];
				let ids = [];
				
				res.forEach((item) => {
					ids.push(item.id.videoId);
				});

				return this.getVideos(ids);
			})
			.toPromise()
			.catch(this.handleError)
	}

	getVideos(ids): Promise<any> {		
		return this.http.get(this.base_url + 'videos?id=' + ids.join(',') + '&maxResults=' + this.max_results + '&type=video&part=snippet,contentDetails,statistics&key=' + YOUTUBE_API_KEY)
			.map((response) => response.json()['items'])
			.toPromise()
			.catch(this.handleError)
	}

	private handleError(error: Response | any) {
		let errMsg: string;
		if (error instanceof Response) {
			const body = error.json() || '';
			const err = body.error || JSON.stringify(body);
			errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
		} else {
			errMsg = error.message ? error.message : error.toString();
		}

		return Promise.reject(errMsg);
	}
}