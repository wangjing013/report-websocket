import { isPlainObject, isFunction } from "lodash-es";
import { load } from "@fingerprintjs/fingerprintjs";
import { baiduLocation } from "@msbfe/location-sdk";
import { concatQueryParams } from "./utils";
import IMWebSocket from "./utils/websocket";
import logger from "./utils/logger";

const domains = {
  test: "wss://open-course-test.mashibing.cn/open-course/ws",
  beta: "wss://open-course-beta.mashibing.cn/open-course/ws",
  prod: "wss://open-course.mashibing.com/open-course/ws",
};

const getFinger = (function () {
  let result = null;
  return async () => {
    if (result) {
      return result;
    }
    const fp = await load();
    const res = await fp.get();
    result = {
      visitorId: res?.visitorId.substring(0, 9),
    };
    return result;
  };
})();

class ReportWebSocket {
  constructor(options = {}) {
    this.options = options;
    const wss = domains[options.env];
    if (wss === undefined) {
      throw new Error("未找到可用的Websocket连接地址，请检查 env 参数");
    }
    const url = concatQueryParams(wss, {
      plateForm: options.plateForm,
      recordId: options.recordId,
    });
    const that = this;
    const websocket = new IMWebSocket(url, {
      debug: false,
      onopen() {
        websocket.heartbeatCheck(
          JSON.stringify({
            status: ReportWebSocket.MessageStatus.heartbeatStatus,
          })
        );
        that.sendFirstMsg();
      },
      onmessage(event) {
        try {
          const result = JSON.parse(event.data);
          if (isPlainObject(result)) {
            const { type } = result.data;
            switch (type) {
              case 1: // 成员列表
                isFunction(ReportWebSocket.onUserCountMessage) &&
                  ReportWebSocket.onUserCountMessage(result.data);
                break;
              case 2: // 拉黑
                isFunction(ReportWebSocket.onPullBack) &&
                  ReportWebSocket.onPullBack(result.data);
                break;
              case 3: // 公告
                isFunction(ReportWebSocket.onAnnouncement) &&
                  ReportWebSocket.onAnnouncement(result.data);
                break;
              case 4: // 关闭连接
                that.websocket.close();
                break;
              case 5: // 更新直播状态
                isFunction(ReportWebSocket.onUpdateLiveStreamStatus) &&
                  ReportWebSocket.onUpdateLiveStreamStatus(result.data);
                break;
              default:
                break;
            }
          }
        } catch (error) {}
      },
    });
    this.websocket = websocket;
  }
}

// 在线用户列表
ReportWebSocket.onUserCountMessage = function (data) {
  logger.info("【用户列表】", data);
};
// 公告
ReportWebSocket.onAnnouncement = function (data) {
  logger.info("【公告】", data);
};
// 黑名单
ReportWebSocket.onPullBack = function (data) {
  logger.info("【黑明单】", data);
};

// 更新直播状态
ReportWebSocket.onUpdateLiveStreamStatus = function (data) {
  logger.info("【黑明单】", data);
};

// 观看端
ReportWebSocket.WatchSide = {
  studySide: 1, // 观看端
  assistantSide: 2, // 助教端
};

// 终端类型
ReportWebSocket.TerminalType = {
  pc: 0,
  app: 1,
};

// 直播类型
ReportWebSocket.LiveType = {
  live: 0, // 直播
  playback: 1, // 回放
};

// 消息状态
ReportWebSocket.MessageStatus = {
  initStatus: 1, // 初始化连接
  closeStatus: 2, // 关闭连接
  normalStatus: 3, // 普通通信
  heartbeatStatus: 4, // 心跳状态
};

// 发送消息方式
ReportWebSocket.GeneralSmsEnum = {
  manualRefresh: 0, // 手动刷新
  remark: 1, // 记录
};

ReportWebSocket.initialize = async function (options = {}) {
  baiduLocation.setAppkey("8e9xHmheKFuUGHCBGyYO2sUoZstPQQIw");
  const fingerRes = await getFinger();
  const locationRes = await baiduLocation.proxyGetLocation();
  return new ReportWebSocket({
    ykId: fingerRes.visitorId,
    country: "中国",
    province: locationRes.address_detail?.province,
    city: locationRes.address_detail?.city,
    ...options,
  });
};

ReportWebSocket.prototype.addEventListener = function (eventName, callback) {
  this.websocket?.socket?.addEventListener(eventName, callback);
};

ReportWebSocket.prototype.updateOptions = function (options = {}) {
  this.options = {
    ...this.options,
    ...options,
  };
};

ReportWebSocket.prototype.sendFirstMsg = function () {
  const data = {
    ...this.options,
    liveType: ReportWebSocket.LiveType.live,
    viewType: ReportWebSocket.TerminalType.pc,
    status: ReportWebSocket.MessageStatus.initStatus,
  };
  this.websocket.send(JSON.stringify(data));
};

ReportWebSocket.prototype.reportRecord = function () {
  const data = {
    ...this.options,
    status: ReportWebSocket.MessageStatus.normalStatus,
    generalSmsEnum: ReportWebSocket.GeneralSmsEnum.remark,
  };
  this.websocket.send(JSON.stringify(data));
};

ReportWebSocket.prototype.refreshRecord = function () {
  const data = {
    ...this.options,
    status: ReportWebSocket.MessageStatus.normalStatus,
    generalSmsEnum: ReportWebSocket.GeneralSmsEnum.manualRefresh,
  };
  this.websocket.send(JSON.stringify(data));
};

ReportWebSocket.prototype.leave = function () {
  const websocket = this.websocket;
  if (websocket) {
    const data = {
      ...this.options,
      liveType: ReportWebSocket.LiveType.live,
      status: ReportWebSocket.MessageStatus.closeStatus,
      viewType: ReportWebSocket.WatchSide.studySide,
    };
    websocket.send(JSON.stringify(data));
    websocket.destory();
  }
};

export default ReportWebSocket;
