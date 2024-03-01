import * as path from 'path'
import * as url from 'url'
import Koa from "koa";
import Router from 'koa-router'
import bodyParser from 'koa-bodyparser'
import serve from 'koa-static'

import {useSse} from "./sse.js";
import * as tools from "./tools.js";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

const app = new Koa();
const router = new Router()
const store = new tools.Storage()


//# region 客户端接口
//# region sse 插件
const sse = useSse({path: '/api/sse'})
// store有新数据推入时，推送消息到客户端
store.on('push', (data) => {
    sse.send(data)
})
//# endregion

/**
 * 提供一个xhr接口获取数据
 * */
router.get('/api/data', async (ctx) => {
    ctx.body = {
        code: 0,
        data: await store.getAll()
    }
})
//# endregion

//# region Charles拦截端接口
/**
 * 处理配置Charles后，map过来的请求
 * */
function handler(ctx, next) {
    // 抓到特定数据后，将其推入记录中
    if (ctx.request.body.body) {
        const body = JSON.parse(ctx.request.body.body)
        body.forEach(json => {
            store.push(json).finally()
        })
    }

    ctx.body = {code: 0, data: 'ok'}
}

router.get('/publish', handler)
router.post('/publish', handler)
//# endregion

app
    .use(bodyParser())
    .use(sse.middleware)
    .use(router.routes())
    .use(router.allowedMethods())
    .use(serve(path.resolve(__dirname, '../public')))
    .listen(3000, () => {
        const ip = tools.getIp()
        console.log(`> server start on http://${ip}:3000`)
    })