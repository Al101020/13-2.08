const fs = require('fs');
const http = require('http');
const Koa = require('koa');
const { koaBody } = require('koa-body');
const koaStatic = require('koa-static'); // пакет для загрузки статической картинки
const path = require('path');
const uuid = require('uuid');

const app = new Koa();

let subscriptions = [];

const public = path.join(__dirname, '/public');

app.use(koaStatic(public)); // до middleware koaBody
 
app.use(koaBody({
  urlencoded: true,
  multipart: true,
}));

app.use((ctx, next) => {
  if (ctx.request.method !== 'OPTIONS') {
    next();

    return;
  }

  ctx.response.set('Access-Control-Allow-Origin', '*');

  ctx.response.set('Access-Control-Allow-Methods', 'DELETE, PUT, PATCH, GET, POST');

  ctx.response.status = 204;
});

app.use((ctx, next) => {
  if (ctx.request.method !== 'POST' && ctx.request.url !== '/upload') {
    next();

    return;
  }

  ctx.response.set('Access-Control-Allow-Origin', '*');

  console.log(ctx.request.files);

  let fileName;

  try{
    const { file } = ctx.request.files;

    const subfolder = uuid.v4();
    
    const uploadFolder = public + '/' + subfolder;

    fs.mkdirSync(uploadFolder);
    fs.copyFileSync(file.filepath, uploadFolder + '/' + file.originalFilename);

    fileName = '/' + subfolder + '/' + file.originalFilename
  } catch (error) {
    ctx.response.status = 500;

    return;
  }

  
  ctx.response.body = fileName;  // next();
});

app.use((ctx, next) => {
  if (ctx.request.method !== 'POST') {
    next();

    return;
  }

  console.log(ctx.request.body);   // console.log(cxt.request.query);   // console.log(cxt.headers);

  const { name, phone } = ctx.request.body;
  
  ctx.response.set('Access-Control-Allow-Origin', '*');

  if (subscriptions.some(sub => sub.phone === phone)) {
    ctx.response.status = 400;
    ctx.response.body = 'subscription exists';

    return;
  }
  
  subscriptions.push({ name, phone });
  
  ctx.response.body = 'OK';

  next();
});

app.use((ctx, next) => {
  if (ctx.request.method !== 'DELETE') {
    next();

    return;
  }

  console.log(ctx.request.query);

  const { phone } = ctx.request.query;

  ctx.response.set('Access-Control-Allow-Origin', '*');

  if (subscriptions.every(sub => sub.phone !== phone)) {
    ctx.response.status = 400;
    ctx.response.body = 'subscription doesn\'t exists';

    return;
  }
  
  subscriptions = subscriptions.filter(sub => sub.phone !== phone);
  
  ctx.response.body = 'OK';

  next();
});

// app.use((ctx) => {
//   console.log('I am a second middleware');
//   // console.log(ctx.request.body);
// });

const server = http.createServer(app.callback());

// const server = http.createServer((req, res) => {
//   const buffer = [];

//   req.on('data', (chunk) => {
//     buffer.push(chunk);
//   });

//   req.on('end', () => {
//     const data = Buffer.concat(buffer).toString();

//     console.log(data);
//   });

//   res.end('seRver response');
// });

const port = 7070;

server.listen(port, (err) => {
  if (err) {
    console.log(err);

    return;
  }

  console.log('Server is listening to ' + port);
});




// 2025.03.04 - Ниже написано в прошлый раз --- =====================================================
// const fs = require('fs');
// const http = require('http');
// const Koa = require('koa');
// const koaBody = require('koa-body'); // так почемуто не работает
// const { koaBody } = require('koa-body');
// const path = require('path');

// const app = new Koa();
// const subscriptions = [];

// app.use(koaBody({ // ошибку выдаёт, говорит что koaBody не функция, 
// // уже нет - импорт нужен { именованый },
//   urlencoded: true,
//   multipart: true,
// }));

// app.use((ctx, next) => { // ctx - типа context
//   if (ctx.request.method !== 'OPTIONS') {
//     next();

//     return;
//   }

//   ctx.response.set('Access-Control-Allow-Origin', '*');

//   ctx.response.set('Access-Control-Allow-Methods', 'DELETE, PUT, PATCH, GET, POST');

//   ctx.response.status = 204;
// });

// app.use((ctx, next) => { // ctx - типа context
//   if (ctx.request.method !== 'POST' && ctx.request.url !== '/upload') {
//     next();

//     return;
//   }

//   ctx.response.set('Access-Control-Allow-Origin', '*');

//   console.log(ctx.request.files);

//   try {
//     console.log(path);
//     const public = path.join(__dirname, '/public');
  
//     const { file } = ctx.request.files;

//     fs.copyFileSync(file.path, public + '/' + file.name);

//   } catch (error) {
//     ctx.response.status = 501;

//     return;
//   }
  
//   ctx.response.body = 'OK';
// });

// app.use((ctx, next) => { // ctx - типа context
//   if (ctx.request.method !== 'POST') {
//     next();

//     return;
//   }

//   // console.log(ctx.request.body);

//   const { name, phone } = ctx.request.body;

//   ctx.response.set('Access-Control-Allow-Origin', '*');
//   // ctx.response.set('Access-Control-Allow-Methods', 'DELETE, PUH, PATCH, GET, POST');
//   if (subscriptions.some(sub => sub.phone === phone)) {
//     ctx.response.status = 400;
//     ctx.response.body = 'subscription exists';

//     return;
//   }

//   subscriptions.push({ name, phone });
//   // ctx.response.body = 'SERVER response';
//   ctx.response.body = 'OK';

//   next();
// });

// app.use((ctx, next) => {
//   if (ctx.request.method !== 'DELETE') {
//     next();

//     return;
//   }

//   console.log(ctx.request.query);  // console.log('I am a second middleware');

//   const { phone } = ctx.request.query;

//   ctx.response.set('Access-Control-Allow-Origin', '*');

//   if (subscriptions.every(sub => sub.phone !== phone)) {
//     ctx.response.status = 400;
//     ctx.response.body = 'subscription doesn\'t exists';

//     return;
//   }

//   subscriptions = subscriptions.filter(sub => sub.phone !== phone);

//   ctx.response.body = 'OK';

//   next();
// });

// const server = http.createServer(app.callback());

// const port = 7070;

// server.listen(port, (err) => {
//   if (err) {
//     console.log(err);

//     return;
//   }

//   console.log('Server is listening to ' + port);
// });
