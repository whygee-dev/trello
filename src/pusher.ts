import PubNub from 'pubnub';

export class Pusher {
	private static _pubKey: string;
	private static _subKey: string;
	private static _uuid: string;
	private static _token: string;
	private static _sub: PubNub | null = null;
	private static _channels: PubNub.SubscribeParameters;
	private static _listener: PubNub.ListenerParameters;
	private static _loaded = false;

	public static setInfos(
		pubKey: string,
		subKey: string,
		uuid: string,
		token: string,
		channels: PubNub.SubscribeParameters,
		listener: PubNub.ListenerParameters
	) {
		Pusher._pubKey = pubKey;
		Pusher._subKey = subKey;
		Pusher._uuid = uuid;
		Pusher._token = token;
		Pusher._channels = channels;
		Pusher._listener = listener;
	}

	public static getInstance() {
		if (!Pusher._sub) {
			Pusher._sub = new PubNub({
				publishKey: Pusher._pubKey,
				subscribeKey: Pusher._subKey,
				uuid: Pusher._uuid,
				presenceTimeout: 20
			});
			Pusher._sub.setToken(Pusher._token);
			Pusher._sub.addListener(Pusher._listener);
			Pusher._sub.subscribe(Pusher._channels);

			this._loaded = true;

			return Pusher._sub;
		}

		return Pusher._sub;
	}

	public static hasLoaded() {
		return Pusher._loaded;
	}

	public static reconnect(
		pubKey: string,
		subKey: string,
		uuid: string,
		token: string,
		channels: PubNub.SubscribeParameters,
		listener: PubNub.ListenerParameters
	) {
		if (!uuid) return;

		try {
			console.log('reconnecting');
			this._loaded = false;

			Pusher._sub?.unsubscribeAll();
			Pusher._sub = new PubNub({
				publishKey: pubKey,
				subscribeKey: subKey,
				uuid: uuid,
				presenceTimeout: 20
			});
			Pusher._sub.setToken(token);
			Pusher._sub.addListener(listener);
			Pusher._sub.subscribe(channels);

			this._loaded = true;
		} catch (error) {
			console.log(error);
		}
	}
}
