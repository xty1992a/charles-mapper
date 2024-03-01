## 简介
本项目用于查阅埋点上报的日志.

## 步骤
1. 自行配置Charles与抓包手机，确保已能抓包
2. 配置Charles-tools-map remote
   3. map from，配置要劫持的请求路径
   4. map to，配置项目启动时打印的域名+`/publish`, 如`http://10.0.0.2:3000/publish`
5. 打开本项目页面
6. 手机上产生的日志，现在会实时输出到页面上了。