const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');

const users = {}; // 데이터 저장용

// Swagger 정의
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'REST API 문서',
      version: '1.0.0',
      description: '사용자 관리 REST API 문서',
    },
    servers: [
      {
        url: 'http://localhost:8082',
        description: '개발 서버',
      },
    ],
  },
  apis: ['./single.js'],
};

/**
 * @swagger
 * /users:
 *   get:
 *     summary: 모든 사용자 조회
 *     responses:
 *       200:
 *         description: 성공
 * 
 * /user:
 *   post:
 *     summary: 새 사용자 등록
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: 등록 성공
 * 
 * /user/{id}:
 *   put:
 *     summary: 사용자 정보 수정
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 수정 성공
 * 
 *   delete:
 *     summary: 사용자 삭제
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 삭제 성공
 */

const swaggerSpec = swaggerJsdoc(swaggerOptions);

http.createServer(async (req, res) => {
  try {
    if (req.method === 'GET') {
      if (req.url === '/') {
        const data = await fs.readFile(path.join(__dirname, 'restFront.html'));
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(data);
      } else if (req.url === '/about') {
        const data = await fs.readFile(path.join(__dirname, 'about.html'));
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(data);
      } else if (req.url === '/users') {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify(users));
      } else if (req.url === '/api-docs') {
        // Swagger UI HTML 반환
        const swaggerHtml = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <title>Swagger UI</title>
            <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.css" />
          </head>
          <body>
            <div id="swagger-ui"></div>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui-bundle.js"></script>
            <script>
              window.onload = () => {
                const ui = SwaggerUIBundle({
                  spec: ${JSON.stringify(swaggerSpec)},
                  dom_id: '#swagger-ui',
                  deepLinking: true,
                  presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIBundle.SwaggerUIStandalonePreset
                  ],
                });
              };
            </script>
          </body>
          </html>
        `;
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(swaggerHtml);
      } else if (req.url === '/swagger.json') {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify(swaggerSpec));
      }
      try {
        const data = await fs.readFile(path.join(__dirname, req.url));
        return res.end(data);
      } catch (err) {
        // 404 Not Found
      }
    } else if (req.method === 'POST') {
      if (req.url === '/user') {
        let body = '';
        req.on('data', (data) => {
          body += data;
        });
        return req.on('end', () => {
          console.log('POST 본문(Body):', body);
          const { name } = JSON.parse(body);
          const id = Date.now();
          users[id] = name;
          res.writeHead(201, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('등록 성공');
        });
      }
    } else if (req.method === 'PUT') {
      if (req.url.startsWith('/user/')) {
        const key = req.url.split('/')[2];
        let body = '';
        req.on('data', (data) => {
          body += data;
        });
        return req.on('end', () => {
          console.log('PUT 본문(Body):', body);
          users[key] = JSON.parse(body).name;
          res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
          return res.end(JSON.stringify(users));
        });
      }
    } else if (req.method === 'DELETE') {
      if (req.url.startsWith('/user/')) {
        const key = req.url.split('/')[2];
        delete users[key];
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end(JSON.stringify(users));
      }
    }
    res.writeHead(404);
    return res.end('NOT FOUND');
  } catch (err) {
    console.error(err);
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(err.message);
  }
})
.listen(8082, () => {
  console.log('8082번 포트에서 서버 대기 중입니다');
  console.log('Swagger 문서: http://localhost:8082/api-docs');
});