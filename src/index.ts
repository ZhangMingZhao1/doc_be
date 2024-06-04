import { Logger } from '@hocuspocus/extension-logger';
// import { SQLite } from '@hocuspocus/extension-sqlite';
import { Server } from '@hocuspocus/server';
import { slateNodesToInsertDelta } from '@slate-yjs/core';
import * as Y from 'yjs';
import initialValue from './data/initialValue.json';
import fetch from 'node-fetch';

// Minimal hocuspocus server setup with logging. For more in-depth examples
// take a look at: https://github.com/ueberdosis/hocuspocus/tree/main/demos/backend
const server = Server.configure({
    // address: '10.241.39.55',
    port: parseInt(process.env.PORT ?? '', 10) || 1234,
    extensions: [
        new Logger()
        // new SQLite({
        //   database: 'db.sqlite',
        // }),
    ],

    async onLoadDocument(data) {
        const { requestParameters, documentName, document } = data;
        if (data.document.isEmpty('content')) {
            const response = await fetch('http://localhost:3000/get/updates');
            const updatesArr = await response.json();
            console.log('updatesArr', updatesArr);
            for (let i = 0; i < updatesArr.length; i++) {
                const updateObj = updatesArr[i];
                const update = updateObj.update;
                if (!update) continue;
                const arr = Object.values(update);
                const bufferArr = Uint8Array.from(arr);

                if (update) {
                    Y.applyUpdate(document, bufferArr);
                }
            }
            console.log(updatesArr);
        }

        return data.document;
    },
    async onStoreDocument(data) {
        const { requestParameters, documentName, document, update } = data;
        const time = new Date().getTime();
        // await fetch('http://localhost:3000/save/update', {
        //     method: 'POST',
        //     body: JSON.stringify({ update: update, time }),
        //     headers: { 'Content-Type': 'application/json' }
        // });
        // console.log(documentName, Y.decodeUpdate(update));
    }
});

server.enableMessageLogging();
server.listen();
