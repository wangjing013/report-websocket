# Report Websocket

## 安装
```
yarn add @msbfe/report-websocket
```

## 基本使用
```js
import ReportWebSocket from '@msbfe/report-websocket'
const params = {
  courseId: '', // 课程ID
  channelId: '', // 渠道ID(RoomID)
  recordId: '', // 小节ID
  bzId: '',  // 用户Id
  saleTeacherId: '', // 销售老师
}
const websocket = await ReportWebSocket.initialize({
  ...params,
  env: "test", // 环境    
  wss: '', // 可选 如果传入了 wss 地址，默认会忽略 env 。 主要方便本地调试
  plateForm: ReportWebSocket.WatchSide.studySide, // 观看端(学员端｜助教端)
})

// 监听链接是否正常打开
reportWebScoket.addEventListener('open', function () {
  console.log('open')
})
// 接受消息
reportWebScoket.addEventListener('message', function (event) {
  console.log('message')
})
// 监听连接关闭
reportWebScoket.addEventListener('close', function (event) {
  console.log('close')
})
```

## 静态属性
```js
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
  record: 1, // 发言
  remark: 6, // 记录
};
```

## 静态方法

| 方法      | 描述 |
| ----------- | ----------- |
| onUserCountMessage      | 用户列表       |
| onAnnouncement   | 公告        |
| onPullBack   | 黑明单        |
| onUpdateLiveStreamStatus| 更新直播状态 |
| onRemarkStatus | 监听备注更新状态 |

## 实例方法

###  reportRecord 记录发言

```js
reportWebScoket.reportRecord()
```

###  refreshRecord 刷新发言
```js
reportWebScoket.refreshRecord()
```

###  updateOptions 更新配置参数
```js
reportWebScoket.updateOptions({
    bzId: ''
})
```

### 更新备注

```js
reportWebScoket.setRemark({
  smsId: '', // UUID
  bzId: '', // 助教老师ID
  remarkDTO: {
    "userId": "", // 用户ID
    "nickName": "" // 用户昵称
  }
})
```


###  leave 关闭 websocket
```js
reportWebScoket.leave()
```

