interface DWLive {
  onLiveStart: Function;
  onLiveStarting: Function;
  onLoginSuccess: Function;
  onLoginError: Function;
  onLiveEnd: Function;
  on_hd_live_player_type: Function;
  onHDReceivedVideoQuality: Function;
  getQualityIndex: Function;
  logout: Function;
  destroy: Function;
  init: Function;
}

interface CCPlayer {}

declare global {
  interface Window {
    onSocketConnect: Function;
    onSocketDisconnect: Function;
    cc_player_stream_disconnect: Function;
    cc_player_stream_waiting: Function;
    DWLive: DWLive;

    createCCH5Player: Function;
    onCCH5PlayerLoaded: Function;
    ccH5PlayerJsLoaded: boolean;
    on_CCH5player_ready: Function;
    on_player_volumechange: Function;
  }
}

export {};
