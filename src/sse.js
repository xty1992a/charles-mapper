import {EventEmitter} from 'events'
import {Transform} from 'stream'

export function useSse(option) {
    class SSEStream extends Transform {
        constructor() {
            super({
                writableObjectMode: true,
            });
        }

        _transform(data, _encoding, done) {
            this.push(`data: ${JSON.stringify(data)}\n\n`);
            done();
        }
    }

    const events = new EventEmitter();
    events.setMaxListeners(0);

    return {
        middleware: async (ctx, next) => {
            if (ctx.path !== option.path) {
                return await next();
            }

            ctx.request.socket.setTimeout(0);
            ctx.req.socket.setNoDelay(true);
            ctx.req.socket.setKeepAlive(true);

            ctx.set({
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            });

            const stream = new SSEStream();
            ctx.status = 200;
            ctx.body = stream;
            
            const listener = (data) => {
                stream.write(data);
            };

            events.on("data", listener);
            events.once('close', () => {
                events.off("data", listener);
            })

            stream.on("close", () => {
                events.emit('close')
                events.off("data", listener);
            });
        },
        send: (data) => {
            events.emit("data", data);
        },
        close() {
            events.emit("close");
        }
    }
}
