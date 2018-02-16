import { URL } from 'url';

import * as _ from 'lodash';

declare interface AuthInfos {
	// TODO set type of response
	response: any;
	expirationDate?: Date;
}

export declare interface IConfig {
	endPoint: string;
	grantType: string;
	clientId: string;
	clientSecret: string;
}

export declare enum QueryType {
	Find,
	Update,
	Delete,
	Insert,
}

export declare enum QueryNum {
	One,
	Many,
}

export const OAuth2QueryTransformer = (config: IConfig) => {
	let authInfos: AuthInfos | null = null;

	return {
		// TODO: Replace `this` with WebAPIAdapter
		async authenticate(this: any, url: string, params: object): Promise<void> {
			authInfos = {
				response: await this.sendRequest('POST', url, null, params),
			};
			const expiresIn = _.get(authInfos, 'response.expires_in');

			//mais si personne ne se sert du serveur il n'est pas necessaire de se re-auth
			if (_.isNumber(expiresIn)) {
				authInfos.expirationDate = new Date();
				authInfos.expirationDate.setSeconds(
					authInfos.expirationDate.getSeconds() + expiresIn
				);
				setTimeout(() => this.emit('authenticate', url, params), expiresIn * 1000);
			}
		},

		// TODO: Replace `this` with WebAPIAdapter
		async initialize(this: any): Promise<void> {
			const params = {
				grant_type: config.grantType,
				client_id: config.clientId,
				client_secret: config.clientSecret,
			};

			const url = new URL(this.baseEndPoint);
			url.pathname = config.endPoint;

			return this.emit('authenticate', url, params);
		},

		// Replace `select`, `update`, `options` & `apiDesc` with Diaspora types
		beforeQuery(
			queryType: QueryType,
			queryNum: QueryNum,
			modelName: string,
			select: object,
			update: object,
			options: object,
			apiDesc: object
		) {
			if (authInfos === null) {
				throw new TypeError('Authentication should already have been done');
			}
			return _.defaultsDeep(
				{
					queryString: {
						access_token: authInfos.response.access_token,
					},
				},
				apiDesc
			);
		},
	};
};
